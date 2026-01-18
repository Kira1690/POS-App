/**
 * Enhanced Order Context - Complete order management with modifier support
 * Provides comprehensive order, cart, and kitchen ticket management
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { orderReducer, initialOrderState, OrderState, OrderAction } from './orderReducer';
import { createOrderActions, OrderActions } from './orderActions';
import { createOrderSelectors, OrderSelectors } from './orderSelectors';
import {
  ExtendedOrder,
  ExtendedOrderItem,
  ExtendedOrderStatus,
  ExtendedPaymentStatus,
  SelectedModifier,
  DateRange,
} from '@/types/order-extended.types';
import { KitchenTicket } from '@/types/kitchen-ticket.types';
import { Table } from '@/types/table.types';
import { MenuItemExtended, ComboDeal } from '@/types/menu-management-extended.types';
import { orderStorageService, kitchenStorageService } from '@/services/storage';

// ============== CONTEXT VALUE TYPE ==============

export interface EnhancedOrderContextValue {
  // State
  state: OrderState;

  // Computed Selectors
  selectors: OrderSelectors;

  // Actions
  actions: OrderActions;

  // Convenience getters (for backward compatibility)
  currentOrder: ExtendedOrder | null;
  cart: ExtendedOrderItem[];
  cartTotal: number;
  cartItemCount: number;
  selectedTable: Table | null;
  orders: ExtendedOrder[];
  activeOrders: ExtendedOrder[];
  kitchenTickets: KitchenTicket[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Backward compatible actions
  createOrder: (table: Table, guestCount?: number) => void;
  clearOrder: () => void;
  addItemToCart: (
    menuItem: MenuItemExtended,
    modifiers: SelectedModifier[],
    quantity: number,
    notes?: string
  ) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  submitOrderToKitchen: () => Promise<{
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    ticketIds?: string[];
    error?: string;
  }>;
  loadOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: ExtendedOrderStatus) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ExtendedOrderStatus | 'all') => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSelectedTable: (table: Table | null) => void;
}

// ============== CONTEXT ==============

const EnhancedOrderContext = createContext<EnhancedOrderContextValue | undefined>(undefined);

// ============== PROVIDER ==============

interface EnhancedOrderProviderProps {
  children: ReactNode;
  initialState?: Partial<OrderState>;
}

export const EnhancedOrderProvider: React.FC<EnhancedOrderProviderProps> = ({
  children,
  initialState: customInitialState,
}) => {
  const [state, dispatch] = useReducer(orderReducer, {
    ...initialOrderState,
    ...customInitialState,
  });

  // Store state ref for actions that need current state
  const stateRef = useRef(state);
  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);

  // Create actions with dispatch and getState
  const actions = React.useMemo(
    () => createOrderActions(dispatch, getState),
    [dispatch, getState]
  );

  // Create selectors from current state
  const selectors = React.useMemo(() => createOrderSelectors(state), [state]);

  // Initialize storage on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await orderStorageService.initialize();
        await kitchenStorageService.initialize();

        // Load initial data
        const [activeOrders, historyOrders, tickets] = await Promise.all([
          orderStorageService.getActiveOrders(),
          orderStorageService.getOrderHistory(),
          kitchenStorageService.getActiveTickets(),
        ]);

        dispatch({ type: 'SET_ACTIVE_ORDERS', payload: activeOrders });
        dispatch({ type: 'SET_ORDER_HISTORY', payload: historyOrders });
        dispatch({ type: 'SET_ORDERS', payload: [...activeOrders, ...historyOrders] });
        dispatch({ type: 'SET_KITCHEN_TICKETS', payload: tickets });

        // Get sync status
        const stats = await orderStorageService.getStats();
        dispatch({ type: 'SET_PENDING_SYNC_COUNT', payload: stats.unsyncedOrders });

        const lastSync = await orderStorageService.getLastSyncTime();
        dispatch({ type: 'SET_LAST_SYNCED', payload: lastSync });

        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('[EnhancedOrderContext] Initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    };

    initialize();
  }, []);

  // Auto-save cart to draft when it changes (debounced)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Skip auto-save during initialization
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    // Only save if there's a selected table and items in cart
    if (!state.selectedTable || state.cart.length === 0) {
      return;
    }

    // Debounce auto-save to avoid excessive writes
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await actions.saveDraft();
        if (__DEV__) {
          console.log(`[EnhancedOrderContext] Auto-saved cart draft (${state.cart.length} items)`);
        }
      } catch (error) {
        console.error('[EnhancedOrderContext] Auto-save failed:', error);
      }
    }, 1000); // 1 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.cart, state.selectedTable, actions]);

  // Load draft when table is selected
  useEffect(() => {
    if (state.selectedTable && state.cart.length === 0) {
      const loadExistingDraft = async () => {
        try {
          await actions.loadDraft(state.selectedTable!.id);
        } catch (error) {
          // Ignore - no draft exists for this table
        }
      };
      loadExistingDraft();
    }
  }, [state.selectedTable?.id]);

  // Context value
  const contextValue: EnhancedOrderContextValue = {
    // State
    state,

    // Selectors
    selectors,

    // Actions
    actions,

    // Convenience getters
    currentOrder: state.currentOrder,
    cart: state.cart,
    cartTotal: state.cartTotal,
    cartItemCount: state.cartItemCount,
    selectedTable: state.selectedTable,
    orders: state.orders,
    activeOrders: state.activeOrders,
    kitchenTickets: state.kitchenTickets,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,

    // Backward compatible actions
    createOrder: actions.createOrder,
    clearOrder: actions.clearCurrentOrder,
    addItemToCart: actions.addToCart,
    updateCartItemQuantity: actions.updateCartItemQuantity,
    removeFromCart: actions.removeFromCart,
    clearCart: actions.clearCart,
    submitOrderToKitchen: actions.submitOrderToKitchen,
    loadOrders: actions.loadOrders,
    updateOrderStatus: actions.updateOrderStatus,
    setSearchQuery: actions.setSearchQuery,
    setStatusFilter: actions.setStatusFilter,
    setError: actions.setError,
    clearError: actions.clearError,
    setSelectedTable: actions.setSelectedTable,
  };

  return (
    <EnhancedOrderContext.Provider value={contextValue}>
      {children}
    </EnhancedOrderContext.Provider>
  );
};

// ============== HOOKS ==============

/**
 * Main hook to access enhanced order context
 */
export const useEnhancedOrder = (): EnhancedOrderContextValue => {
  const context = useContext(EnhancedOrderContext);
  if (context === undefined) {
    throw new Error('useEnhancedOrder must be used within an EnhancedOrderProvider');
  }
  return context;
};

/**
 * Hook for cart operations
 */
export const useCart = () => {
  const { state, actions, selectors } = useEnhancedOrder();
  const cartItems = state.cart || [];

  return {
    // State (with aliases for backward compatibility)
    items: cartItems,
    cart: cartItems, // Alias for backward compatibility
    itemCount: state.cartItemCount || 0,
    cartItemCount: state.cartItemCount || 0, // Alias
    subtotal: state.cartSubtotal || 0,
    cartSubtotal: state.cartSubtotal || 0, // Alias
    taxRate: state.cartTaxRate || 0,
    taxAmount: state.cartTaxAmount || 0,
    discountAmount: state.cartDiscountAmount || 0,
    total: state.cartTotal || 0,
    cartTotal: state.cartTotal || 0, // Alias
    isEmpty: cartItems.length === 0,

    // Computed
    summary: selectors.cartSummary,
    byCategory: selectors.cartByCategory,
    byStation: selectors.cartByStation,
    allergenItems: selectors.cartAllergenItems,
    hasComboItems: selectors.hasComboItems,

    // Actions (with aliases for backward compatibility)
    addItem: actions.addToCart,
    addToCart: actions.addToCart, // Alias
    addCombo: actions.addComboToCart,
    updateItem: actions.updateCartItem,
    updateQuantity: actions.updateCartItemQuantity,
    updateCartItemQuantity: actions.updateCartItemQuantity, // Alias
    updateModifiers: actions.updateCartItemModifiers,
    removeItem: actions.removeFromCart,
    removeFromCart: actions.removeFromCart, // Alias
    clear: actions.clearCart,
    clearCart: actions.clearCart, // Alias
    setTaxRate: actions.setCartTaxRate,
    setDiscount: actions.setCartDiscount,
  };
};

/**
 * Hook for current order session
 */
export const useCurrentOrder = () => {
  const { state, actions } = useEnhancedOrder();
  const cart = state.cart || [];

  return {
    // State (with aliases for backward compatibility)
    order: state.currentOrder,
    currentOrder: state.currentOrder, // Alias
    draft: state.currentDraft,
    table: state.selectedTable,
    selectedTable: state.selectedTable, // Alias

    // Status
    hasOrder: state.currentOrder !== null,
    hasTable: state.selectedTable !== null,
    canSubmit: cart.length > 0 && state.selectedTable !== null,

    // Actions (with aliases for backward compatibility)
    create: actions.createOrder,
    createOrder: actions.createOrder, // Alias
    clear: actions.clearCurrentOrder,
    clearOrder: actions.clearCurrentOrder, // Alias
    setTable: actions.setSelectedTable,
    setSelectedTable: actions.setSelectedTable, // Alias
    submit: actions.submitOrderToKitchen,
    submitOrderToKitchen: actions.submitOrderToKitchen, // Alias
    saveDraft: actions.saveDraft,
    loadDraft: actions.loadDraft,
    deleteDraft: actions.deleteDraft,
  };
};

/**
 * Hook for order management
 */
export const useOrderManagement = () => {
  const { state, actions, selectors } = useEnhancedOrder();

  return {
    // State
    orders: state.orders,
    activeOrders: state.activeOrders,
    historyOrders: state.orderHistory,
    selectedOrderId: state.selectedOrderId,
    isLoading: state.isLoading,

    // Filters
    searchQuery: state.searchQuery,
    statusFilter: state.statusFilter,
    paymentStatusFilter: state.paymentStatusFilter,
    dateFilter: state.dateFilter,

    // Computed
    filteredOrders: selectors.filteredOrders,
    stats: selectors.orderStats,
    ordersByStatus: selectors.ordersByStatus,
    selectedOrder: selectors.selectedOrder,

    // Actions
    load: actions.loadOrders,
    loadActive: actions.loadActiveOrders,
    refresh: actions.refreshOrders,
    updateStatus: actions.updateOrderStatus,
    cancel: actions.cancelOrder,
    setSearch: actions.setSearchQuery,
    setStatusFilter: actions.setStatusFilter,
    setPaymentStatusFilter: actions.setPaymentStatusFilter,
    setDateFilter: actions.setDateFilter,
    clearFilters: actions.clearFilters,
    selectOrder: actions.setSelectedOrderId,
  };
};

/**
 * Hook for kitchen operations
 */
export const useKitchenTickets = () => {
  const { state, actions, selectors } = useEnhancedOrder();

  return {
    // State
    tickets: state.kitchenTickets,

    // Computed
    byStation: selectors.ticketsByStation,
    byStatus: selectors.ticketsByStatus,
    stats: selectors.kitchenStats,
    overdue: selectors.overdueTickets,
    withAllergens: selectors.allergenTickets,

    // Actions
    load: actions.loadKitchenTickets,
    updateItemStatus: actions.updateItemStatus,
  };
};

/**
 * Hook for UI modals
 */
export const useOrderModals = () => {
  const { state, actions } = useEnhancedOrder();

  return {
    // State
    isModifierModalOpen: state.isModifierModalOpen,
    isComboModalOpen: state.isComboModalOpen,
    isSendToKitchenModalOpen: state.isSendToKitchenModalOpen,

    // Actions
    openModifierModal: actions.openModifierModal,
    closeModifierModal: actions.closeModifierModal,
    openComboModal: actions.openComboModal,
    closeComboModal: actions.closeComboModal,
    openSendToKitchenModal: actions.openSendToKitchenModal,
    closeSendToKitchenModal: actions.closeSendToKitchenModal,
  };
};

/**
 * Hook for sync status
 */
export const useOrderSync = () => {
  const { state, actions, selectors } = useEnhancedOrder();

  return {
    // State
    lastSynced: state.lastSynced,
    pendingCount: state.pendingSyncCount,
    isSyncing: state.isSyncing,

    // Computed
    status: selectors.syncStatus,

    // Actions
    sync: actions.syncOrders,
  };
};

// ============== EXPORTS ==============

export { OrderState, OrderAction } from './orderReducer';
export { OrderActions } from './orderActions';
export { OrderSelectors } from './orderSelectors';
