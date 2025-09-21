/**
 * Order Management Context - Focused on Order CRUD and management dashboard
 * Follows Single Responsibility Principle - handles order management operations only
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Order, OrderFilterOptions } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { orderService } from '@/services/orders/orderService';

export interface OrderManagementState {
  orders: Order[];
  selectedOrder: Order | null;
  filteredOrders: Order[];
  searchQuery: string;
  statusFilter: OrderStatus | 'ALL';
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
}

interface OrderManagementActions {
  // Order CRUD operations
  loadOrders: (filters?: OrderFilterOptions) => Promise<void>;
  selectOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: OrderStatus | 'ALL') => void;
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
  | { type: 'REMOVE_ORDER_FROM_LIST'; payload: { orderId: string } }
  | { type: 'SET_SEARCH_QUERY'; payload: { query: string } }
  | { type: 'SET_STATUS_FILTER'; payload: { status: OrderStatus | 'ALL' } }
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
  isLoading: false,
  isLoadingDetails: false,
  error: null,
};

function applyOrderFilters(orders: Order[], searchQuery: string, statusFilter: OrderStatus | 'ALL'): Order[] {
  let filtered = orders;
  
  // Apply status filter
  if (statusFilter !== 'ALL') {
    filtered = filtered.filter(order => order.status === statusFilter);
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
      const filteredOrders = applyOrderFilters(action.payload.orders, state.searchQuery, state.statusFilter);
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
      const filteredOrders = applyOrderFilters(updatedOrders, state.searchQuery, state.statusFilter);
      return {
        ...state,
        orders: updatedOrders,
        filteredOrders,
        selectedOrder: state.selectedOrder?.id === action.payload.order.id 
          ? action.payload.order 
          : state.selectedOrder,
      };
    }
    
    case 'REMOVE_ORDER_FROM_LIST': {
      const updatedOrders = state.orders.filter(order => order.id !== action.payload.orderId);
      const filteredOrders = applyOrderFilters(updatedOrders, state.searchQuery, state.statusFilter);
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
      const filteredOrders = applyOrderFilters(state.orders, action.payload.query, state.statusFilter);
      return {
        ...state,
        searchQuery: action.payload.query,
        filteredOrders,
      };
    }
    
    case 'SET_STATUS_FILTER': {
      const filteredOrders = applyOrderFilters(state.orders, state.searchQuery, action.payload.status);
      return {
        ...state,
        statusFilter: action.payload.status,
        filteredOrders,
      };
    }
    
    case 'APPLY_FILTERS': {
      const filteredOrders = applyOrderFilters(state.orders, state.searchQuery, state.statusFilter);
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
  
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query } });
  }, []);
  
  const setStatusFilter = useCallback((status: OrderStatus | 'ALL') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: { status } });
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
  
  const contextValue: OrderManagementContextValue = {
    ...state,
    loadOrders,
    refreshOrders,
    selectOrder,
    updateOrderStatus,
    cancelOrder,
    setSearchQuery,
    setStatusFilter,
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