/**
 * Order Management Context - Focused on Order CRUD and management dashboard
 * Follows Single Responsibility Principle - handles order management operations only
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useRef } from 'react';
import { Order, OrderFilterOptions } from '@/types/order.types';
import { OrderStatus, PaymentStatus } from '@/types/common.types';
import { orderService } from '@/services/orders/orderService';
import { orderStorageService } from '@/services/storage';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';

// Auto-refresh interval in milliseconds (5 seconds for responsive sync - backup to event system)
const AUTO_REFRESH_INTERVAL = 5000;

export interface OrderManagementState {
  orders: Order[];
  selectedOrder: Order | null;
  filteredOrders: Order[];
  searchQuery: string;
  statusFilter: OrderStatus | 'ALL';
  paymentFilter: 'ALL' | 'PAID' | 'UNPAID';
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
}

interface OrderManagementActions {
  // Order CRUD operations
  loadOrders: (filters?: OrderFilterOptions) => Promise<void>;
  selectOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus, paymentId?: string) => void;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  refreshOrders: () => Promise<void>;

  // Search and filtering
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: OrderStatus | 'ALL') => void;
  setPaymentFilter: (filter: 'ALL' | 'PAID' | 'UNPAID') => void;
  applyFilters: () => void;

  // Error handling
  setError: (error: string) => void;
  clearError: () => void;
}

export interface OrderManagementContextValue extends OrderManagementState, OrderManagementActions {}

const OrderManagementContext = createContext<OrderManagementContextValue | undefined>(undefined);

type OrderManagementAction =
  | { type: 'LOAD_ORDERS_START' }
  | { type: 'LOAD_ORDERS_SUCCESS'; payload: { orders: Order[] } }
  | { type: 'LOAD_ORDERS_ERROR'; payload: { error: string } }
  | { type: 'SELECT_ORDER'; payload: { order: Order | null } }
  | { type: 'UPDATE_ORDER_IN_LIST'; payload: { order: Order } }
  | { type: 'UPDATE_ORDER_PAYMENT_STATUS'; payload: { orderId: string; paymentStatus: PaymentStatus; paymentId?: string; status?: OrderStatus } }
  | { type: 'REMOVE_ORDER_FROM_LIST'; payload: { orderId: string } }
  | { type: 'SET_SEARCH_QUERY'; payload: { query: string } }
  | { type: 'SET_STATUS_FILTER'; payload: { status: OrderStatus | 'ALL' } }
  | { type: 'SET_PAYMENT_FILTER'; payload: { filter: 'ALL' | 'PAID' | 'UNPAID' } }
  | { type: 'APPLY_FILTERS' }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING_DETAILS'; payload: { loading: boolean } };

const initialOrderManagementState: OrderManagementState = {
  orders: [],
  selectedOrder: null,
  filteredOrders: [],
  searchQuery: '',
  statusFilter: 'ALL',
  paymentFilter: 'ALL',
  isLoading: false,
  isLoadingDetails: false,
  error: null,
};

function applyOrderFilters(
  orders: Order[],
  searchQuery: string,
  statusFilter: OrderStatus | 'ALL',
  paymentFilter: 'ALL' | 'PAID' | 'UNPAID' = 'ALL'
): Order[] {
  let filtered = orders;

  // Apply status filter
  if (statusFilter !== 'ALL') {
    filtered = filtered.filter(order => order.status === statusFilter);
  }

  // Apply payment filter
  if (paymentFilter !== 'ALL') {
    if (paymentFilter === 'PAID') {
      filtered = filtered.filter(order => order.payment_status === PaymentStatus.COMPLETED);
    } else if (paymentFilter === 'UNPAID') {
      filtered = filtered.filter(order => order.payment_status !== PaymentStatus.COMPLETED);
    }
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(order =>
      order.order_number.toLowerCase().includes(query) ||
      order.table_id?.toLowerCase().includes(query) ||
      order.special_instructions?.toLowerCase().includes(query)
    );
  }

  // Sort by creation date (newest first)
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function orderManagementReducer(state: OrderManagementState, action: OrderManagementAction): OrderManagementState {
  switch (action.type) {
    case 'LOAD_ORDERS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'LOAD_ORDERS_SUCCESS': {
      const filteredOrders = applyOrderFilters(action.payload.orders, state.searchQuery, state.statusFilter, state.paymentFilter);
      return {
        ...state,
        orders: action.payload.orders,
        filteredOrders,
        isLoading: false,
        error: null,
      };
    }
    
    case 'LOAD_ORDERS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    
    case 'SELECT_ORDER':
      return {
        ...state,
        selectedOrder: action.payload.order,
      };
    
    case 'UPDATE_ORDER_IN_LIST': {
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.order.id ? action.payload.order : order
      );
      const filteredOrders = applyOrderFilters(updatedOrders, state.searchQuery, state.statusFilter, state.paymentFilter);
      return {
        ...state,
        orders: updatedOrders,
        filteredOrders,
        selectedOrder: state.selectedOrder?.id === action.payload.order.id
          ? action.payload.order
          : state.selectedOrder,
      };
    }

    case 'UPDATE_ORDER_PAYMENT_STATUS': {
      const { orderId, paymentStatus, paymentId, status } = action.payload;
      const updatedOrders = state.orders.map(order =>
        order.id === orderId
          ? {
              ...order,
              payment_status: paymentStatus,
              payment_id: paymentId,
              status: status || order.status, // Update order status if provided
              paid_at: paymentStatus === PaymentStatus.COMPLETED ? new Date().toISOString() : order.paid_at,
            }
          : order
      );
      const filteredOrders = applyOrderFilters(updatedOrders, state.searchQuery, state.statusFilter, state.paymentFilter);
      return {
        ...state,
        orders: updatedOrders,
        filteredOrders,
        selectedOrder: state.selectedOrder?.id === orderId
          ? {
              ...state.selectedOrder,
              payment_status: paymentStatus,
              payment_id: paymentId,
              status: status || state.selectedOrder.status, // Update order status if provided
              paid_at: paymentStatus === PaymentStatus.COMPLETED ? new Date().toISOString() : state.selectedOrder.paid_at,
            }
          : state.selectedOrder,
      };
    }

    case 'REMOVE_ORDER_FROM_LIST': {
      const updatedOrders = state.orders.filter(order => order.id !== action.payload.orderId);
      const filteredOrders = applyOrderFilters(updatedOrders, state.searchQuery, state.statusFilter, state.paymentFilter);
      return {
        ...state,
        orders: updatedOrders,
        filteredOrders,
        selectedOrder: state.selectedOrder?.id === action.payload.orderId
          ? null
          : state.selectedOrder,
      };
    }

    case 'SET_SEARCH_QUERY': {
      const filteredOrders = applyOrderFilters(state.orders, action.payload.query, state.statusFilter, state.paymentFilter);
      return {
        ...state,
        searchQuery: action.payload.query,
        filteredOrders,
      };
    }

    case 'SET_STATUS_FILTER': {
      const filteredOrders = applyOrderFilters(state.orders, state.searchQuery, action.payload.status, state.paymentFilter);
      return {
        ...state,
        statusFilter: action.payload.status,
        filteredOrders,
      };
    }

    case 'SET_PAYMENT_FILTER': {
      const filteredOrders = applyOrderFilters(state.orders, state.searchQuery, state.statusFilter, action.payload.filter);
      return {
        ...state,
        paymentFilter: action.payload.filter,
        filteredOrders,
      };
    }

    case 'APPLY_FILTERS': {
      const filteredOrders = applyOrderFilters(state.orders, state.searchQuery, state.statusFilter, state.paymentFilter);
      return {
        ...state,
        filteredOrders,
      };
    }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_LOADING_DETAILS':
      return {
        ...state,
        isLoadingDetails: action.payload.loading,
      };
    
    default:
      return state;
  }
}

interface OrderManagementProviderProps {
  children: ReactNode;
}

export const OrderManagementProvider: React.FC<OrderManagementProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(orderManagementReducer, initialOrderManagementState);
  // Use exported service instance to avoid DI registration issues
  const orderServiceInstance = orderService;
  
  const loadOrders = useCallback(async (filters?: OrderFilterOptions) => {
    try {
      dispatch({ type: 'LOAD_ORDERS_START' });
      const orders = await orderServiceInstance.getOrders(filters);
      dispatch({ type: 'LOAD_ORDERS_SUCCESS', payload: { orders: orders.data || [] } });
    } catch (error) {
      dispatch({ type: 'LOAD_ORDERS_ERROR', payload: { error: String(error) } });
    }
  }, [orderServiceInstance]);
  
  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);
  
  const selectOrder = useCallback((order: Order | null) => {
    dispatch({ type: 'SELECT_ORDER', payload: { order } });
  }, []);
  
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      dispatch({ type: 'SET_LOADING_DETAILS', payload: { loading: true } });
      const updatedOrder = await orderServiceInstance.updateOrderStatus(orderId, { 
        status, 
        kitchen_notes: notes 
      });
      dispatch({ type: 'UPDATE_ORDER_IN_LIST', payload: { order: updatedOrder } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: `Failed to update order status: ${error}` } });
    } finally {
      dispatch({ type: 'SET_LOADING_DETAILS', payload: { loading: false } });
    }
  }, []);
  
  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    try {
      dispatch({ type: 'SET_LOADING_DETAILS', payload: { loading: true } });
      const updatedOrder = await orderServiceInstance.cancelOrder(orderId, reason);
      dispatch({ type: 'UPDATE_ORDER_IN_LIST', payload: { order: updatedOrder } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: `Failed to cancel order: ${error}` } });
    } finally {
      dispatch({ type: 'SET_LOADING_DETAILS', payload: { loading: false } });
    }
  }, []);

  const updateOrderPaymentStatus = useCallback(async (orderId: string, paymentStatus: PaymentStatus, paymentId?: string) => {
    const isPaid = paymentStatus === PaymentStatus.COMPLETED;
    const newOrderStatus = isPaid ? OrderStatus.COMPLETED : undefined;

    // Update local state with both payment and order status
    dispatch({
      type: 'UPDATE_ORDER_PAYMENT_STATUS',
      payload: {
        orderId,
        paymentStatus,
        paymentId,
        status: newOrderStatus,
      },
    });

    // Persist to storage with both status fields
    try {
      const paidAt = isPaid ? new Date().toISOString() : undefined;
      await orderStorageService.updateOrder(orderId, {
        paymentStatus: isPaid ? 'paid' : 'pending',
        status: isPaid ? 'completed' : undefined,
        paidAt,
      });

      // Emit event for cross-context sync
      orderEventEmitter.emit('PAYMENT_STATUS_CHANGED', orderId, {
        paymentStatus: isPaid ? 'paid' : 'pending',
        status: isPaid ? 'completed' : undefined,
        paidAt,
      });

      if (__DEV__) {
        console.log(`[OrderManagement] Payment status updated for order ${orderId}: ${paymentStatus}, order status: ${newOrderStatus || 'unchanged'}`);
      }
    } catch (error) {
      console.error('[OrderManagement] Failed to persist payment status:', error);
    }
  }, []);
  
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query } });
  }, []);
  
  const setStatusFilter = useCallback((status: OrderStatus | 'ALL') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: { status } });
  }, []);

  const setPaymentFilter = useCallback((filter: 'ALL' | 'PAID' | 'UNPAID') => {
    dispatch({ type: 'SET_PAYMENT_FILTER', payload: { filter } });
  }, []);

  const applyFilters = useCallback(() => {
    dispatch({ type: 'APPLY_FILTERS' });
  }, []);
  
  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { error } });
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Auto-refresh interval ref
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load on mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Subscribe to real-time order events from Kitchen context
  useEffect(() => {
    const unsubscribeStatus = orderEventEmitter.subscribe('ORDER_STATUS_CHANGED', (orderId, data) => {
      // Find the order and update it with new status
      const updatedOrder = state.orders.find(o => o.id === orderId);
      if (updatedOrder && data.status) {
        const newOrder = { ...updatedOrder, status: data.status as OrderStatus };
        dispatch({ type: 'UPDATE_ORDER_IN_LIST', payload: { order: newOrder } });

        if (__DEV__) {
          console.log(`[OrderManagement] Event: Order ${orderId} status updated to ${data.status}`);
        }
      }
    });

    const unsubscribePayment = orderEventEmitter.subscribe('PAYMENT_STATUS_CHANGED', (orderId, data) => {
      // Find the order and update payment status
      const updatedOrder = state.orders.find(o => o.id === orderId);
      if (updatedOrder && data.paymentStatus) {
        const newOrder = {
          ...updatedOrder,
          payment_status: data.paymentStatus as PaymentStatus,
          status: data.status as OrderStatus || updatedOrder.status,
          paid_at: data.paidAt || updatedOrder.paid_at,
        };
        dispatch({ type: 'UPDATE_ORDER_IN_LIST', payload: { order: newOrder } });

        if (__DEV__) {
          console.log(`[OrderManagement] Event: Order ${orderId} payment status updated to ${data.paymentStatus}`);
        }
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribePayment();
    };
  }, [state.orders]);

  // Auto-refresh to sync with kitchen status changes (backup mechanism)
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      // Silent refresh (don't show loading state)
      orderServiceInstance.getOrders().then(response => {
        if (response.data) {
          dispatch({ type: 'LOAD_ORDERS_SUCCESS', payload: { orders: response.data } });
        }
      }).catch(error => {
        // Silent failure - don't interrupt user experience
        if (__DEV__) {
          console.log('[OrderManagement] Background refresh failed:', error);
        }
      });
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [orderServiceInstance]);

  const contextValue: OrderManagementContextValue = {
    ...state,
    loadOrders,
    refreshOrders,
    selectOrder,
    updateOrderStatus,
    updateOrderPaymentStatus,
    cancelOrder,
    setSearchQuery,
    setStatusFilter,
    setPaymentFilter,
    applyFilters,
    setError,
    clearError,
  };
  
  return (
    <OrderManagementContext.Provider value={contextValue}>
      {children}
    </OrderManagementContext.Provider>
  );
};

export const useOrderManagement = (): OrderManagementContextValue => {
  const context = useContext(OrderManagementContext);
  if (context === undefined) {
    throw new Error('useOrderManagement must be used within an OrderManagementProvider');
  }
  return context;
};