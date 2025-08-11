/**
 * Order Context - Manages POS order state and operations
 * Provides comprehensive order management for restaurant POS system
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  OrderItem, 
  Order, 
  OrderItemStatus, 
  OrderFilterOptions, 
  OrderManagementState,
  KitchenOrder 
} from '@/types/order.types';
import { OrderStatus, TableStatus } from '@/types/common.types';
import { Table } from '@/types/table.types';
import { MenuItem } from '@/types/menu.types';
import { orderService } from '@/services/orders/orderService';

// Cart item interface for POS operations (simplified from full OrderItem)
export interface CartItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface OrderContextState {
  // Current cart/order creation
  currentOrder: Order | null;
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  selectedTable: Table | null;
  orderStatus: OrderStatus;
  isProcessing: boolean;
  error: string | null;
  
  // Professional order management
  orders: Order[];
  selectedOrderForManagement: Order | null;
  filteredOrders: Order[];
  searchQuery: string;
  statusFilter: OrderStatus | 'ALL';
  
  // Kitchen operations
  kitchenOrders: KitchenOrder[];
  activeKitchenOrders: KitchenOrder[];
  
  // Loading states
  isLoadingOrders: boolean;
  isLoadingOrderDetails: boolean;
  isSubmittingOrder: boolean;
}

interface OrderContextActions {
  // Current order/cart management
  createOrder: (table: Table) => void;
  clearOrder: () => void;
  updateOrderStatus: (status: OrderStatus) => void;
  submitOrderToKitchen: () => Promise<void>;
  
  // Cart management
  addItemToCart: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  updateCartItem: (itemId: string, quantity: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  
  // Professional order management
  loadOrders: (filters?: OrderFilterOptions) => Promise<void>;
  selectOrderForManagement: (order: Order | null) => void;
  updateOrderStatusManagement: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  
  // Order item management
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => Promise<void>;
  
  // Kitchen operations
  loadKitchenOrders: () => Promise<void>;
  updateKitchenOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: OrderStatus | 'ALL') => void;
  applyOrderFilters: () => void;
  
  // Calculations
  calculateTotal: () => number;
  
  // Error handling
  setError: (error: string) => void;
  clearError: () => void;
  setProcessing: (processing: boolean) => void;
}

export interface OrderContextValue extends OrderContextState, OrderContextActions {}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

type OrderAction =
  // Current order/cart actions
  | { type: 'CREATE_ORDER'; payload: { table: Table } }
  | { type: 'CLEAR_ORDER' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { status: OrderStatus } }
  | { type: 'ADD_TO_CART'; payload: { item: CartItem } }
  | { type: 'UPDATE_CART_ITEM'; payload: { itemId: string; quantity: number; notes?: string } }
  | { type: 'REMOVE_FROM_CART'; payload: { itemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PROCESSING'; payload: { processing: boolean } }
  | { type: 'RECALCULATE_TOTALS' }
  
  // Professional order management actions
  | { type: 'LOAD_ORDERS_START' }
  | { type: 'LOAD_ORDERS_SUCCESS'; payload: { orders: Order[] } }
  | { type: 'LOAD_ORDERS_ERROR'; payload: { error: string } }
  | { type: 'SELECT_ORDER_FOR_MANAGEMENT'; payload: { order: Order | null } }
  | { type: 'UPDATE_ORDER_IN_LIST'; payload: { order: Order } }
  | { type: 'REMOVE_ORDER_FROM_LIST'; payload: { orderId: string } }
  
  // Kitchen operations actions
  | { type: 'LOAD_KITCHEN_ORDERS_SUCCESS'; payload: { kitchenOrders: KitchenOrder[] } }
  
  // Search and filtering actions
  | { type: 'SET_SEARCH_QUERY'; payload: { query: string } }
  | { type: 'SET_STATUS_FILTER'; payload: { status: OrderStatus | 'ALL' } }
  | { type: 'APPLY_ORDER_FILTERS' }
  
  // Loading state actions
  | { type: 'SET_LOADING_ORDERS'; payload: { loading: boolean } }
  | { type: 'SET_LOADING_ORDER_DETAILS'; payload: { loading: boolean } }
  | { type: 'SET_SUBMITTING_ORDER'; payload: { submitting: boolean } };

const initialState: OrderContextState = {
  // Current cart/order creation
  currentOrder: null,
  cart: [],
  cartTotal: 0,
  cartItemCount: 0,
  selectedTable: null,
  orderStatus: OrderStatus.PENDING,
  isProcessing: false,
  error: null,
  
  // Professional order management
  orders: [],
  selectedOrderForManagement: null,
  filteredOrders: [],
  searchQuery: '',
  statusFilter: 'ALL',
  
  // Kitchen operations
  kitchenOrders: [],
  activeKitchenOrders: [],
  
  // Loading states
  isLoadingOrders: false,
  isLoadingOrderDetails: false,
  isSubmittingOrder: false,
};

function calculateCartTotals(cart: CartItem[]) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  return { total, itemCount };
}

function applyFilters(orders: Order[], searchQuery: string, statusFilter: OrderStatus | 'ALL'): Order[] {
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

function orderReducer(state: OrderContextState, action: OrderAction): OrderContextState {
  switch (action.type) {
    case 'CREATE_ORDER': {
      const orderId = `order_${Date.now()}_${action.payload.table.id}`;
      const newOrder: Order = {
        id: orderId,
        table_id: action.payload.table.id,
        restaurant_id: action.payload.table.restaurant_id,
        staff_id: 'current_user', // TODO: Get from auth context
        created_by: 'current_user', // Professional staff tracking
        order_number: `ORD-${String(Date.now()).slice(-6)}`,
        items: [], // Will be converted from cart items when needed
        status: OrderStatus.PENDING,
        subtotal: 0,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return {
        ...state,
        currentOrder: newOrder,
        selectedTable: action.payload.table,
        cart: [],
        cartTotal: 0,
        cartItemCount: 0,
        orderStatus: OrderStatus.PENDING,
        error: null,
      };
    }
    
    case 'CLEAR_ORDER':
      return {
        ...state,
        currentOrder: null,
        selectedTable: null,
        cart: [],
        cartTotal: 0,
        cartItemCount: 0,
        orderStatus: OrderStatus.PENDING,
        error: null,
      };
    
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orderStatus: action.payload.status,
        currentOrder: state.currentOrder ? {
          ...state.currentOrder,
          status: action.payload.status,
          updated_at: new Date().toISOString(),
        } : null,
      };
    
    case 'ADD_TO_CART': {
      const existingItemIndex = state.cart.findIndex(
        item => item.menu_item_id === action.payload.item.menu_item_id
      );
      
      let newCart: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item
        newCart = state.cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.item.quantity }
            : item
        );
      } else {
        // Add new item
        newCart = [...state.cart, action.payload.item];
      }
      
      const { total, itemCount } = calculateCartTotals(newCart);
      
      return {
        ...state,
        cart: newCart,
        cartTotal: total,
        cartItemCount: itemCount,
      };
    }
    
    case 'UPDATE_CART_ITEM': {
      const newCart = state.cart.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity, notes: action.payload.notes }
          : item
      ).filter(item => item.quantity > 0);
      
      const { total, itemCount } = calculateCartTotals(newCart);
      
      return {
        ...state,
        cart: newCart,
        cartTotal: total,
        cartItemCount: itemCount,
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter(item => item.id !== action.payload.itemId);
      const { total, itemCount } = calculateCartTotals(newCart);
      
      return {
        ...state,
        cart: newCart,
        cartTotal: total,
        cartItemCount: itemCount,
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        cart: [],
        cartTotal: 0,
        cartItemCount: 0,
      };
    }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isProcessing: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload.processing,
      };
    
    case 'RECALCULATE_TOTALS': {
      const { total, itemCount } = calculateCartTotals(state.cart);
      return {
        ...state,
        cartTotal: total,
        cartItemCount: itemCount,
      };
    }
    
    // Professional order management cases
    case 'LOAD_ORDERS_START':
      return {
        ...state,
        isLoadingOrders: true,
        error: null,
      };
    
    case 'LOAD_ORDERS_SUCCESS': {
      const filteredOrders = applyFilters(action.payload.orders, state.searchQuery, state.statusFilter);
      return {
        ...state,
        orders: action.payload.orders,
        filteredOrders,
        isLoadingOrders: false,
        error: null,
      };
    }
    
    case 'LOAD_ORDERS_ERROR':
      return {
        ...state,
        isLoadingOrders: false,
        error: action.payload.error,
      };
    
    case 'SELECT_ORDER_FOR_MANAGEMENT':
      return {
        ...state,
        selectedOrderForManagement: action.payload.order,
      };
    
    case 'UPDATE_ORDER_IN_LIST': {
      const updatedOrders = state.orders.map(order => 
        order.id === action.payload.order.id ? action.payload.order : order
      );
      const filteredOrders = applyFilters(updatedOrders, state.searchQuery, state.statusFilter);
      return {
        ...state,
        orders: updatedOrders,
        filteredOrders,
        selectedOrderForManagement: state.selectedOrderForManagement?.id === action.payload.order.id 
          ? action.payload.order 
          : state.selectedOrderForManagement,
      };
    }
    
    case 'REMOVE_ORDER_FROM_LIST': {
      const updatedOrders = state.orders.filter(order => order.id !== action.payload.orderId);
      const filteredOrders = applyFilters(updatedOrders, state.searchQuery, state.statusFilter);
      return {
        ...state,
        orders: updatedOrders,
        filteredOrders,
        selectedOrderForManagement: state.selectedOrderForManagement?.id === action.payload.orderId 
          ? null 
          : state.selectedOrderForManagement,
      };
    }
    
    case 'LOAD_KITCHEN_ORDERS_SUCCESS': {
      const activeOrders = action.payload.kitchenOrders.filter(order => 
        ['pending', 'preparing'].includes(order.items[0]?.status || '')
      );
      return {
        ...state,
        kitchenOrders: action.payload.kitchenOrders,
        activeKitchenOrders: activeOrders,
      };
    }
    
    case 'SET_SEARCH_QUERY': {
      const filteredOrders = applyFilters(state.orders, action.payload.query, state.statusFilter);
      return {
        ...state,
        searchQuery: action.payload.query,
        filteredOrders,
      };
    }
    
    case 'SET_STATUS_FILTER': {
      const filteredOrders = applyFilters(state.orders, state.searchQuery, action.payload.status);
      return {
        ...state,
        statusFilter: action.payload.status,
        filteredOrders,
      };
    }
    
    case 'APPLY_ORDER_FILTERS': {
      const filteredOrders = applyFilters(state.orders, state.searchQuery, state.statusFilter);
      return {
        ...state,
        filteredOrders,
      };
    }
    
    case 'SET_LOADING_ORDERS':
      return {
        ...state,
        isLoadingOrders: action.payload.loading,
      };
    
    case 'SET_LOADING_ORDER_DETAILS':
      return {
        ...state,
        isLoadingOrderDetails: action.payload.loading,
      };
    
    case 'SET_SUBMITTING_ORDER':
      return {
        ...state,
        isSubmittingOrder: action.payload.submitting,
      };
    
    default:
      return state;
  }
}

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  
  const createOrder = useCallback((table: Table) => {
    dispatch({ type: 'CREATE_ORDER', payload: { table } });
  }, []);
  
  const clearOrder = useCallback(() => {
    dispatch({ type: 'CLEAR_ORDER' });
  }, []);
  
  const updateOrderStatus = useCallback((status: OrderStatus) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { status } });
  }, []);
  
  const addItemToCart = useCallback((menuItem: MenuItem, quantity = 1, notes?: string) => {
    const cartItem: CartItem = {
      id: `item_${Date.now()}_${menuItem.id}`,
      order_id: state.currentOrder?.id || '',
      menu_item_id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      notes,
      category: menuItem.category_id, // Use category_id from MenuItem
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_TO_CART', payload: { item: cartItem } });
  }, [state.currentOrder?.id]);
  
  const updateCartItem = useCallback((itemId: string, quantity: number, notes?: string) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { itemId, quantity, notes } });
  }, []);
  
  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { itemId } });
  }, []);
  
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);
  
  const calculateTotal = useCallback(() => {
    return state.cartTotal;
  }, [state.cartTotal]);
  
  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { error } });
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);
  
  const setProcessing = useCallback((processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: { processing } });
  }, []);
  
  // Professional order management actions
  const loadOrders = useCallback(async (filters?: OrderFilterOptions) => {
    try {
      dispatch({ type: 'LOAD_ORDERS_START' });
      const orders = await orderService.getOrders(filters);
      dispatch({ type: 'LOAD_ORDERS_SUCCESS', payload: { orders: orders.data || [] } });
    } catch (error) {
      dispatch({ type: 'LOAD_ORDERS_ERROR', payload: { error: String(error) } });
    }
  }, []);
  
  const selectOrderForManagement = useCallback((order: Order | null) => {
    dispatch({ type: 'SELECT_ORDER_FOR_MANAGEMENT', payload: { order } });
  }, []);
  
  const updateOrderStatusManagement = useCallback(async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, { status, kitchen_notes: notes });
      dispatch({ type: 'UPDATE_ORDER_IN_LIST', payload: { order: updatedOrder } });
    } catch (error) {
      setError(`Failed to update order status: ${error}`);
    }
  }, [setError]);
  
  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    try {
      const updatedOrder = await orderService.cancelOrder(orderId, reason);
      dispatch({ type: 'UPDATE_ORDER_IN_LIST', payload: { order: updatedOrder } });
    } catch (error) {
      setError(`Failed to cancel order: ${error}`);
    }
  }, [setError]);
  
  const updateOrderItemStatus = useCallback(async (orderId: string, itemId: string, status: OrderItemStatus) => {
    try {
      // This would need to be implemented in OrderService
      // const updatedOrder = await orderService.updateOrderItemStatus(orderId, itemId, { status });
      // dispatch({ type: 'UPDATE_ORDER_IN_LIST', payload: { order: updatedOrder } });
      console.log('Update order item status:', { orderId, itemId, status });
    } catch (error) {
      setError(`Failed to update order item status: ${error}`);
    }
  }, [setError]);
  
  const loadKitchenOrders = useCallback(async () => {
    try {
      const orders = await orderService.getCurrentOrders();
      // Convert orders to kitchen orders format
      const kitchenOrders: KitchenOrder[] = orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        table_number: order.table_id || 'N/A',
        items: order.items,
        created_at: order.created_at,
        estimated_prep_time: order.estimated_prep_time || 15,
        elapsed_time: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60)),
        priority: 'NORMAL',
        special_instructions: order.special_instructions,
        kitchen_notes: order.kitchen_notes,
      }));
      dispatch({ type: 'LOAD_KITCHEN_ORDERS_SUCCESS', payload: { kitchenOrders } });
    } catch (error) {
      setError(`Failed to load kitchen orders: ${error}`);
    }
  }, [setError]);
  
  const updateKitchenOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatusManagement(orderId, status);
      await loadKitchenOrders(); // Refresh kitchen orders
    } catch (error) {
      setError(`Failed to update kitchen order status: ${error}`);
    }
  }, [updateOrderStatusManagement, loadKitchenOrders, setError]);
  
  const submitOrderToKitchen = useCallback(async () => {
    if (!state.currentOrder || state.cart.length === 0) {
      setError('No order to submit');
      return;
    }
    
    try {
      dispatch({ type: 'SET_SUBMITTING_ORDER', payload: { submitting: true } });
      
      // Create order with cart items
      const orderData = {
        table_id: state.currentOrder.table_id,
        items: state.cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.notes,
        })),
        special_instructions: state.currentOrder.special_instructions,
      };
      
      const createdOrder = await orderService.createOrder(orderData);
      
      // Update status to submitted (sent to kitchen)
      await orderService.updateOrderStatus(createdOrder.id, { 
        status: OrderStatus.CONFIRMED,
        estimated_completion_time: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes
      });
      
      // Clear current order and cart
      dispatch({ type: 'CLEAR_ORDER' });
      
      // Refresh orders list
      await loadOrders();
      
    } catch (error) {
      setError(`Failed to submit order: ${error}`);
    } finally {
      dispatch({ type: 'SET_SUBMITTING_ORDER', payload: { submitting: false } });
    }
  }, [state.currentOrder, state.cart, setError, loadOrders]);
  
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query } });
  }, []);
  
  const setStatusFilter = useCallback((status: OrderStatus | 'ALL') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: { status } });
  }, []);
  
  const applyOrderFilters = useCallback(() => {
    dispatch({ type: 'APPLY_ORDER_FILTERS' });
  }, []);
  
  const contextValue: OrderContextValue = {
    ...state,
    // Current order/cart management
    createOrder,
    clearOrder,
    updateOrderStatus,
    submitOrderToKitchen,
    addItemToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateTotal,
    
    // Professional order management
    loadOrders,
    selectOrderForManagement,
    updateOrderStatusManagement,
    cancelOrder,
    updateOrderItemStatus,
    
    // Kitchen operations
    loadKitchenOrders,
    updateKitchenOrderStatus,
    
    // Search and filtering
    setSearchQuery,
    setStatusFilter,
    applyOrderFilters,
    
    // Error handling
    setError,
    clearError,
    setProcessing,
  };
  
  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextValue => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

// Convenience hook for order management operations
export const useOrderManagement = () => {
  const context = useOrder();
  return {
    orders: context.orders,
    selectedOrder: context.selectedOrderForManagement,
    filteredOrders: context.filteredOrders,
    searchQuery: context.searchQuery,
    statusFilter: context.statusFilter,
    isLoading: context.isLoadingOrders,
    loadOrders: context.loadOrders,
    selectOrder: context.selectOrderForManagement,
    updateOrderStatus: context.updateOrderStatusManagement,
    cancelOrder: context.cancelOrder,
    setSearchQuery: context.setSearchQuery,
    setStatusFilter: context.setStatusFilter,
  };
};

// Convenience hook for kitchen operations
export const useKitchen = () => {
  const context = useOrder();
  return {
    kitchenOrders: context.kitchenOrders,
    activeKitchenOrders: context.activeKitchenOrders,
    loadKitchenOrders: context.loadKitchenOrders,
    updateOrderStatus: context.updateKitchenOrderStatus,
    updateItemStatus: context.updateOrderItemStatus,
  };
};