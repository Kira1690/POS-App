/**
 * Unified Order Context
 * Single context for all order management - replaces OrderContext, EnhancedOrderContext, and OrderManagementContext
 *
 * Core Principles:
 * - ONE Order, ONE Status, ONE Source of Truth
 * - Kitchen is the ONLY source of status updates (except payment)
 * - Payment button appears ONLY after order is "served"
 * - Clear data resets BOTH storage AND context state
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
  useMemo,
} from 'react';
import {
  unifiedOrderReducer,
  initialUnifiedOrderState,
  UnifiedOrderState,
  UnifiedOrderAction,
} from './unifiedOrderReducer';
import {
  UnifiedOrder,
  UnifiedOrderItem,
  UnifiedOrderStatus,
  UnifiedPaymentStatus,
  UnifiedItemStatus,
  UnifiedOrderFilters,
  SelectedModifier,
  generateUnifiedOrderId,
  generateUnifiedOrderNumber,
  generateUnifiedOrderItemId,
  calculateUnifiedItemTotal,
  isActiveOrder,
  canAcceptPayment,
  getActiveStatuses,
} from '@/types/unified-order.types';
import { KitchenStation, getStationForCategory } from '@/types/order-extended.types';
import { Table } from '@/types/table.types';
import { MenuItemExtended, AllergenType, DietaryTag } from '@/types/menu-management-extended.types';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { orderEventEmitter, OrderEventType, OrderEventData } from '@/services/events/OrderEventEmitter';

// Re-export the SINGLE event emitter for use by other modules
// This ensures ALL contexts use the SAME event emitter instance
export { orderEventEmitter } from '@/services/events/OrderEventEmitter';
export type { OrderEventType, OrderEventData } from '@/services/events/OrderEventEmitter';

// ============== CONTEXT VALUE TYPE ==============

export interface UnifiedOrderContextValue {
  // State
  state: UnifiedOrderState;

  // Cart Actions
  addToCart: (
    menuItem: MenuItemExtended,
    selectedModifiers: SelectedModifier[],
    quantity: number,
    specialInstructions?: string
  ) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setCartDiscount: (type: 'percentage' | 'fixed', value: number) => void;

  // Table Selection
  setSelectedTable: (table: Table | null) => void;

  // Order Lifecycle
  submitToKitchen: () => Promise<{
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    error?: string;
  }>;
  loadOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;

  // Kitchen Status Updates (ONLY place status can change)
  updateOrderStatus: (orderId: string, status: UnifiedOrderStatus) => Promise<void>;
  updateItemStatus: (orderId: string, itemId: string, status: UnifiedItemStatus) => Promise<void>;

  // Payment (only after served)
  processPayment: (orderId: string, method: string, transactionId?: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Order Management
  getOrderById: (orderId: string) => UnifiedOrder | undefined;
  getActiveOrderForTable: (tableId: string) => UnifiedOrder | undefined;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;

  // Filters
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: UnifiedOrderStatus | 'all' | 'active') => void;
  setPaymentStatusFilter: (status: UnifiedPaymentStatus | 'all') => void;
  clearFilters: () => void;

  // UI
  setError: (error: string | null) => void;
  clearError: () => void;
  setSelectedOrderId: (orderId: string | null) => void;

  // Data Reset (for clear all functionality)
  resetAllState: () => Promise<void>;

  // Convenience Getters
  cart: UnifiedOrderItem[];
  cartTotal: number;
  cartItemCount: number;
  selectedTable: Table | null;
  orders: UnifiedOrder[];
  activeOrders: UnifiedOrder[];
  filteredOrders: UnifiedOrder[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Utility
  canProcessPayment: (order: UnifiedOrder) => boolean;
}

// ============== CONTEXT ==============

const UnifiedOrderContext = createContext<UnifiedOrderContextValue | undefined>(undefined);

// ============== PROVIDER ==============

interface UnifiedOrderProviderProps {
  children: ReactNode;
}

export const UnifiedOrderProvider: React.FC<UnifiedOrderProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(unifiedOrderReducer, initialUnifiedOrderState);

  // Refs for accessing current state in callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // ============== INITIALIZATION ==============

  useEffect(() => {
    const initialize = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Initialize storage service
        await unifiedOrderStorageService.initialize();

        // Load initial data
        const orders = await unifiedOrderStorageService.getAllOrders();
        dispatch({ type: 'SET_ORDERS', payload: orders });

        // Get stats
        const stats = await unifiedOrderStorageService.getStats();
        dispatch({ type: 'SET_PENDING_SYNC_COUNT', payload: stats.unsyncedOrders });

        dispatch({ type: 'SET_LOADING', payload: false });

        if (__DEV__) {
          console.log('[UnifiedOrderContext] Initialized with', orders.length, 'orders');
        }
      } catch (error) {
        console.error('[UnifiedOrderContext] Initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    };

    initialize();
  }, []);

  // ============== EVENT SUBSCRIPTIONS ==============

  useEffect(() => {
    // Subscribe to SYSTEM_RESET events
    const unsubscribeReset = orderEventEmitter.subscribe('SYSTEM_RESET', () => {
      if (__DEV__) {
        console.log('[UnifiedOrderContext] Received SYSTEM_RESET event - resetting state');
      }
      dispatch({ type: 'RESET_STATE' });
    });

    // Subscribe to ORDER_STATUS_CHANGED events from Kitchen
    // Kitchen is the ONLY source of status updates (except payment)
    const unsubscribeStatusChanged = orderEventEmitter.subscribe(
      'ORDER_STATUS_CHANGED',
      (orderId: string, data: { status?: string }) => {
        if (__DEV__) {
          console.log('[UnifiedOrderContext] Received ORDER_STATUS_CHANGED:', orderId, data);
        }

        // Map kitchen status to unified order status
        const statusMapping: Record<string, UnifiedOrderStatus> = {
          pending: 'confirmed',
          preparing: 'preparing',
          ready: 'ready',
          completed: 'served', // Kitchen 'completed' maps to unified 'served'
          served: 'served',
          cancelled: 'cancelled',
          paid: 'paid',
        };

        const status = data.status;
        if (status && statusMapping[status]) {
          const unifiedStatus = statusMapping[status];

          // Update context state
          dispatch({
            type: 'UPDATE_ORDER_STATUS',
            payload: { orderId, status: unifiedStatus },
          });

          // Update unified storage
          unifiedOrderStorageService.updateOrder(orderId, {
            status: unifiedStatus,
            updatedAt: new Date().toISOString(),
            ...(unifiedStatus === 'preparing' && { preparingAt: new Date().toISOString() }),
            ...(unifiedStatus === 'ready' && { readyAt: new Date().toISOString() }),
            ...(unifiedStatus === 'served' && { servedAt: new Date().toISOString() }),
          }).catch((err) => {
            console.error('[UnifiedOrderContext] Failed to sync status to unified storage:', err);
          });
        }
      }
    );

    return () => {
      unsubscribeReset();
      unsubscribeStatusChanged();
    };
  }, []);

  // ============== CART ACTIONS ==============

  const addToCart = useCallback(
    (
      menuItem: MenuItemExtended,
      selectedModifiers: SelectedModifier[],
      quantity: number,
      specialInstructions?: string
    ) => {
      const { modifierTotal, itemTotal } = calculateUnifiedItemTotal(
        menuItem.price,
        selectedModifiers,
        quantity
      );

      const kitchenStation = getStationForCategory(
        menuItem.category_id,
        menuItem.category_id
      );

      const allergens: AllergenType[] = menuItem.allergens || [];
      const dietaryTags: DietaryTag[] = menuItem.dietary_tags || [];

      const orderItem: UnifiedOrderItem = {
        id: generateUnifiedOrderItemId(),
        orderId: '',
        menuItemId: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        category: menuItem.category_id,
        categoryId: menuItem.category_id,
        imageUrl: menuItem.image_url,
        basePrice: menuItem.price,
        quantity,
        modifierTotal,
        itemTotal,
        selectedModifiers,
        dietaryTags,
        allergens,
        hasAllergenWarning: allergens.length > 0,
        kitchenStation,
        itemStatus: 'pending',
        estimatedPrepTime: menuItem.preparation_time_minutes,
        specialInstructions,
        isComboItem: false,
        addedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TO_CART', payload: orderItem });
    },
    []
  );

  const updateCartItemQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_ITEM_QUANTITY', payload: { itemId, quantity } });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setCartDiscount = useCallback((type: 'percentage' | 'fixed', value: number) => {
    dispatch({ type: 'SET_CART_DISCOUNT', payload: { type, value } });
  }, []);

  // ============== TABLE SELECTION ==============

  const setSelectedTable = useCallback((table: Table | null) => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
  }, []);

  // ============== ORDER LIFECYCLE ==============

  const submitToKitchen = useCallback(async (): Promise<{
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    error?: string;
  }> => {
    const currentState = stateRef.current;

    // Validation 1: Table and cart must exist
    if (!currentState.selectedTable || currentState.cart.length === 0) {
      return { success: false, error: 'No items in cart or table not selected' };
    }

    // Validation 2: Check storage DIRECTLY for active orders on this table
    // This ensures we use the same data source as the table sync
    try {
      const allOrders = await unifiedOrderStorageService.getAllOrders();
      const existingActiveOrder = allOrders.find(
        (o) => isActiveOrder(o) && o.tableId === currentState.selectedTable!.id
      );
      if (existingActiveOrder) {
        return {
          success: false,
          error: `Table already has an active order: ${existingActiveOrder.orderNumber}. Please complete or cancel it first.`,
        };
      }
    } catch (error) {
      console.warn('[UnifiedOrderContext] Failed to check for existing orders:', error);
      // Continue anyway - we'll catch duplicates in storage
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const now = new Date().toISOString();
      const orderId = generateUnifiedOrderId();
      const orderNumber = generateUnifiedOrderNumber();

      // Create the order with items
      const items = currentState.cart.map((item) => ({
        ...item,
        orderId,
      }));

      const order: UnifiedOrder = {
        id: orderId,
        orderNumber,
        restaurantId: currentState.selectedTable.restaurant_id,
        tableId: currentState.selectedTable.id,
        tableName: currentState.selectedTable.table_number,
        guestCount: 1,
        createdBy: 'current_user',
        createdByName: 'Current User',
        items,
        subtotal: currentState.cartSubtotal,
        taxRate: currentState.cartTaxRate,
        taxAmount: currentState.cartTaxAmount,
        discountAmount: currentState.cartDiscountAmount,
        tipAmount: 0,
        totalAmount: currentState.cartTotal,
        status: 'confirmed', // Immediately confirmed when submitted
        paymentStatus: 'pending',
        createdAt: now,
        updatedAt: now,
        submittedAt: now,
        estimatedPrepTime: Math.max(...items.map((i) => i.estimatedPrepTime || 10)),
        pendingSync: true,
      };

      // Save to storage
      await unifiedOrderStorageService.saveOrder(order);

      // Update state
      dispatch({ type: 'ADD_ORDER', payload: order });
      dispatch({ type: 'CLEAR_CURRENT_ORDER' });
      dispatch({ type: 'SET_SUBMITTING', payload: false });

      // Emit ORDER_CREATED event - this triggers:
      // 1. TableProvider: Mark table as OCCUPIED
      // 2. EnhancedKitchenContext: Create kitchen tickets
      orderEventEmitter.emit('ORDER_CREATED', orderId, {
        orderNumber,
        tableId: order.tableId,
        tableName: order.tableName,
        items: order.items,
      });

      return {
        success: true,
        orderId,
        orderNumber,
      };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      dispatch({ type: 'SET_SUBMITTING', payload: false });
      return { success: false, error: String(error) };
    }
  }, []);

  const loadOrders = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await unifiedOrderStorageService.initialize();
      const orders = await unifiedOrderStorageService.getAllOrders();
      dispatch({ type: 'SET_ORDERS', payload: orders });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  // ============== KITCHEN STATUS UPDATES (ONLY place status changes) ==============

  const updateOrderStatus = useCallback(
    async (orderId: string, status: UnifiedOrderStatus) => {
      try {
        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: { orderId, status },
        });

        // Update storage
        await unifiedOrderStorageService.updateOrder(orderId, {
          status,
          updatedAt: new Date().toISOString(),
          ...(status === 'preparing' && { preparingAt: new Date().toISOString() }),
          ...(status === 'ready' && { readyAt: new Date().toISOString() }),
          ...(status === 'served' && { servedAt: new Date().toISOString() }),
        });

        // Emit event
        orderEventEmitter.emit('ORDER_STATUS_CHANGED', orderId, { status });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    []
  );

  const updateItemStatus = useCallback(
    async (orderId: string, itemId: string, status: UnifiedItemStatus) => {
      try {
        dispatch({
          type: 'UPDATE_ITEM_STATUS',
          payload: { orderId, itemId, status },
        });

        // Get updated order from state
        const order = stateRef.current.orders.find((o) => o.id === orderId);
        if (order) {
          await unifiedOrderStorageService.saveOrder(order);
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    []
  );

  // ============== PAYMENT ==============

  const processPayment = useCallback(
    async (
      orderId: string,
      method: string,
      transactionId?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const order = stateRef.current.orders.find((o) => o.id === orderId);

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      if (order.status !== 'served') {
        return {
          success: false,
          error: `Cannot process payment. Order must be served first. Current status: ${order.status}`,
        };
      }

      dispatch({ type: 'SET_PROCESSING_PAYMENT', payload: true });

      try {
        dispatch({
          type: 'PROCESS_PAYMENT',
          payload: { orderId, method, transactionId },
        });

        // Update storage
        const now = new Date().toISOString();
        await unifiedOrderStorageService.updateOrder(orderId, {
          status: 'paid',
          paymentStatus: 'paid',
          paymentMethod: method,
          paymentId: transactionId,
          paidAt: now,
          updatedAt: now,
        });

        // Emit ORDER_PAID event - this triggers:
        // 1. TableProvider: Mark table as AVAILABLE
        orderEventEmitter.emit('ORDER_PAID', orderId, {
          tableId: order.tableId,
          method,
          amount: order.totalAmount,
        });

        dispatch({ type: 'SET_PROCESSING_PAYMENT', payload: false });

        return { success: true };
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        return { success: false, error: String(error) };
      }
    },
    []
  );

  // ============== ORDER MANAGEMENT ==============

  const getOrderById = useCallback(
    (orderId: string): UnifiedOrder | undefined => {
      return state.orders.find((o) => o.id === orderId);
    },
    [state.orders]
  );

  const getActiveOrderForTable = useCallback(
    (tableId: string): UnifiedOrder | undefined => {
      return state.activeOrders.find((o) => o.tableId === tableId);
    },
    [state.activeOrders]
  );

  const cancelOrder = useCallback(
    async (orderId: string, reason: string) => {
      try {
        const order = stateRef.current.orders.find((o) => o.id === orderId);
        if (!order) return;

        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: { orderId, status: 'cancelled' },
        });

        await unifiedOrderStorageService.updateOrder(orderId, {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
        });

        // Emit ORDER_CANCELLED event - this triggers:
        // 1. TableProvider: Mark table as AVAILABLE
        orderEventEmitter.emit('ORDER_CANCELLED', orderId, { reason, tableId: order.tableId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    []
  );

  // ============== FILTERS ==============

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setStatusFilter = useCallback((status: UnifiedOrderStatus | 'all' | 'active') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  }, []);

  const setPaymentStatusFilter = useCallback((status: UnifiedPaymentStatus | 'all') => {
    dispatch({ type: 'SET_PAYMENT_STATUS_FILTER', payload: status });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  // ============== UI ==============

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const setSelectedOrderId = useCallback((orderId: string | null) => {
    dispatch({ type: 'SET_SELECTED_ORDER_ID', payload: orderId });
  }, []);

  // ============== DATA RESET ==============

  const resetAllState = useCallback(async () => {
    if (__DEV__) {
      console.log('[UnifiedOrderContext] resetAllState called');
    }

    // Clear storage first
    await unifiedOrderStorageService.clearAll();

    // Reset context state
    dispatch({ type: 'RESET_STATE' });

    // Emit SYSTEM_RESET event for other contexts to reset their state
    orderEventEmitter.emit('SYSTEM_RESET', '', {});

    if (__DEV__) {
      console.log('[UnifiedOrderContext] State reset complete');
    }
  }, []);

  // ============== COMPUTED VALUES ==============

  const filteredOrders = useMemo(() => {
    let orders = state.orders;

    // Status filter
    if (state.statusFilter !== 'all') {
      if (state.statusFilter === 'active') {
        const activeStatuses = getActiveStatuses();
        orders = orders.filter((o) => activeStatuses.includes(o.status));
      } else {
        orders = orders.filter((o) => o.status === state.statusFilter);
      }
    }

    // Payment status filter
    // 'pending' means "unpaid" - show all orders that are NOT paid
    if (state.paymentStatusFilter !== 'all') {
      if (state.paymentStatusFilter === 'pending') {
        // "Unpaid" filter - show orders that are NOT paid
        orders = orders.filter((o) => o.paymentStatus !== 'paid');
      } else {
        orders = orders.filter((o) => o.paymentStatus === state.paymentStatusFilter);
      }
    }

    // Search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.tableName.toLowerCase().includes(query) ||
          o.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    // Date filter
    if (state.dateFilter) {
      const start = new Date(state.dateFilter.startDate).getTime();
      const end = new Date(state.dateFilter.endDate).getTime();
      orders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt).getTime();
        return orderDate >= start && orderDate <= end;
      });
    }

    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [
    state.orders,
    state.statusFilter,
    state.paymentStatusFilter,
    state.searchQuery,
    state.dateFilter,
  ]);

  // ============== UTILITY ==============

  const canProcessPaymentFn = useCallback((order: UnifiedOrder): boolean => {
    return canAcceptPayment(order);
  }, []);

  // ============== CONTEXT VALUE ==============

  const contextValue: UnifiedOrderContextValue = {
    // State
    state,

    // Cart Actions
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setCartDiscount,

    // Table Selection
    setSelectedTable,

    // Order Lifecycle
    submitToKitchen,
    loadOrders,
    refreshOrders,

    // Kitchen Status Updates
    updateOrderStatus,
    updateItemStatus,

    // Payment
    processPayment,

    // Order Management
    getOrderById,
    getActiveOrderForTable,
    cancelOrder,

    // Filters
    setSearchQuery,
    setStatusFilter,
    setPaymentStatusFilter,
    clearFilters,

    // UI
    setError,
    clearError,
    setSelectedOrderId,

    // Data Reset
    resetAllState,

    // Convenience Getters
    cart: state.cart,
    cartTotal: state.cartTotal,
    cartItemCount: state.cartItemCount,
    selectedTable: state.selectedTable,
    orders: state.orders,
    activeOrders: state.activeOrders,
    filteredOrders,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,

    // Utility
    canProcessPayment: canProcessPaymentFn,
  };

  return (
    <UnifiedOrderContext.Provider value={contextValue}>
      {children}
    </UnifiedOrderContext.Provider>
  );
};

// ============== HOOKS ==============

/**
 * Main hook to access unified order context
 */
export const useUnifiedOrder = (): UnifiedOrderContextValue => {
  const context = useContext(UnifiedOrderContext);
  if (context === undefined) {
    throw new Error('useUnifiedOrder must be used within a UnifiedOrderProvider');
  }
  return context;
};

/**
 * Hook for cart operations only
 */
export const useUnifiedCart = () => {
  const context = useUnifiedOrder();

  return {
    items: context.cart,
    itemCount: context.cartItemCount,
    subtotal: context.state.cartSubtotal,
    taxAmount: context.state.cartTaxAmount,
    discountAmount: context.state.cartDiscountAmount,
    total: context.cartTotal,
    isEmpty: context.cart.length === 0,
    selectedTable: context.selectedTable,

    addItem: context.addToCart,
    updateQuantity: context.updateCartItemQuantity,
    removeItem: context.removeFromCart,
    clear: context.clearCart,
    setDiscount: context.setCartDiscount,
    setTable: context.setSelectedTable,
  };
};

/**
 * Hook for kitchen operations (status updates)
 */
export const useUnifiedKitchen = () => {
  const context = useUnifiedOrder();

  // Get orders that are relevant for kitchen display (confirmed, preparing, ready)
  const kitchenOrders = useMemo(() => {
    return context.orders.filter((o) =>
      ['confirmed', 'preparing', 'ready'].includes(o.status)
    );
  }, [context.orders]);

  return {
    orders: kitchenOrders,
    updateOrderStatus: context.updateOrderStatus,
    updateItemStatus: context.updateItemStatus,
    refreshOrders: context.refreshOrders,
    isLoading: context.isLoading,
  };
};

/**
 * Hook for order management screen
 */
export const useUnifiedOrderManagement = () => {
  const context = useUnifiedOrder();

  return {
    orders: context.orders,
    activeOrders: context.activeOrders,
    filteredOrders: context.filteredOrders,
    isLoading: context.isLoading,

    // Filters
    searchQuery: context.state.searchQuery,
    statusFilter: context.state.statusFilter,
    setSearchQuery: context.setSearchQuery,
    setStatusFilter: context.setStatusFilter,
    setPaymentStatusFilter: context.setPaymentStatusFilter,
    clearFilters: context.clearFilters,

    // Actions
    loadOrders: context.loadOrders,
    refreshOrders: context.refreshOrders,
    getOrderById: context.getOrderById,
    cancelOrder: context.cancelOrder,
    setSelectedOrderId: context.setSelectedOrderId,
    selectedOrderId: context.state.selectedOrderId,
  };
};

/**
 * Hook for billing/payment operations
 */
export const useUnifiedBilling = () => {
  const context = useUnifiedOrder();

  // Get orders ready for payment (served status only)
  const ordersReadyForPayment = useMemo(() => {
    return context.orders.filter((o) => o.status === 'served');
  }, [context.orders]);

  return {
    ordersReadyForPayment,
    processPayment: context.processPayment,
    canProcessPayment: context.canProcessPayment,
    isProcessingPayment: context.state.isProcessingPayment,
    getOrderById: context.getOrderById,
  };
};
