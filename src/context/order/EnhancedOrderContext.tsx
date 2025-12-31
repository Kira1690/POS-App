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

  return {
    // State
    items: state.cart,
    itemCount: state.cartItemCount,
    subtotal: state.cartSubtotal,
    taxRate: state.cartTaxRate,
    taxAmount: state.cartTaxAmount,
    discountAmount: state.cartDiscountAmount,
    total: state.cartTotal,
    isEmpty: state.cart.length === 0,

    // Computed
    summary: selectors.cartSummary,
    byCategory: selectors.cartByCategory,
    byStation: selectors.cartByStation,
    allergenItems: selectors.cartAllergenItems,
    hasComboItems: selectors.hasComboItems,

    // Actions
    addItem: actions.addToCart,
    addCombo: actions.addComboToCart,
    updateItem: actions.updateCartItem,
    updateQuantity: actions.updateCartItemQuantity,
    updateModifiers: actions.updateCartItemModifiers,
    removeItem: actions.removeFromCart,
    clear: actions.clearCart,
    setTaxRate: actions.setCartTaxRate,
    setDiscount: actions.setCartDiscount,
  };
};

/**
 * Hook for current order session
 */
export const useCurrentOrder = () => {
  const { state, actions } = useEnhancedOrder();

  return {
    // State
    order: state.currentOrder,
    draft: state.currentDraft,
    table: state.selectedTable,

    // Status
    hasOrder: state.currentOrder !== null,
    hasTable: state.selectedTable !== null,
    canSubmit: state.cart.length > 0 && state.selectedTable !== null,

    // Actions
    create: actions.createOrder,
    clear: actions.clearCurrentOrder,
    setTable: actions.setSelectedTable,
    submit: actions.submitOrderToKitchen,
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
