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
import { syncQueueService } from '@/services/storage';
import { activityLogService } from '@/services/storage/ActivityLogService';
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
  setCartItemDiscount: (itemId: string, discountType: 'percentage' | 'fixed', discountValue: number) => void;

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
  getActiveOrdersForTable: (tableId: string) => UnifiedOrder[];
  setGuestCount: (guestCount: number) => void;
  setSplitOrderConfig: (guestCount: number) => void;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  mergeOrders: (targetOrderId: string, sourceOrderId: string) => Promise<void>;

  // Bill-level operations
  applyOrderDiscount: (orderId: string, type: 'percentage' | 'fixed', value: number) => Promise<void>;
  applyItemDiscount: (orderId: string, itemId: string, type: 'percentage' | 'fixed', value: number) => Promise<void>;
  transferItems: (sourceOrderId: string, targetOrderId: string, itemIds: string[]) => Promise<void>;
  addItemsToOrder: (orderId: string, cartItems: UnifiedOrderItem[]) => Promise<void>;
  removeItemFromOrder: (orderId: string, itemId: string) => Promise<void>;
  updateOrderItem: (
    orderId: string,
    itemId: string,
    updates: { quantity?: number; selectedModifiers?: SelectedModifier[]; specialInstructions?: string }
  ) => Promise<void>;
  transferOrderToTable: (orderId: string, newTableId: string, newTableName: string) => Promise<void>;

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
  cartOrderNumber: string | null;
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

// ============== SYNC HELPER ==============

/**
 * Builds a snake_case payload from a UnifiedOrder for the sync queue.
 * Sent to the backend via POST /api/orders/sync/push.
 */
function buildOrderSyncPayload(order: UnifiedOrder): Record<string, unknown> {
  return {
    id: order.id,
    restaurant_id: order.restaurantId || '1',
    order_number: order.orderNumber,
    table_id: order.tableId,
    table_name: order.tableName,
    status: order.status,
    subtotal: order.subtotal,
    tax_amount: order.taxAmount,
    discount_amount: order.discountAmount,
    total_amount: order.totalAmount,
    guest_count: order.guestCount,
    special_instructions: order.specialInstructions,
    payment_method: order.paymentMethod,
    transaction_id: order.paymentId,
    paid_at: order.paidAt,
    cancellation_reason: order.cancellationReason,
    cancelled_at: order.cancelledAt,
    order_items: order.items.map((i) => ({
      id: i.id,
      menu_item_id: i.menuItemId,
      name: i.name,
      quantity: i.quantity,
      base_price: i.basePrice,
      modifier_total: i.modifierTotal,
      item_total: i.itemTotal,
      item_status: i.itemStatus,
      kitchen_station: i.kitchenStation,
      special_instructions: i.specialInstructions,
    })),
  };
}

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

    // Reload orders from SQLite whenever sync writes new data
    const reloadOrders = async () => {
      try {
        const orders = await unifiedOrderStorageService.getAllOrders();
        dispatch({ type: 'SET_ORDERS', payload: orders });
        if (__DEV__) {
          console.log('[UnifiedOrderContext] Reloaded', orders.length, 'orders after sync event');
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[UnifiedOrderContext] Failed to reload after sync:', error);
        }
      }
    };

    // Pull sync completed (batch of orders applied)
    const unsubscribeSyncComplete = orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', reloadOrders);

    // WebSocket: new order received in real-time
    const unsubscribeCreated = orderEventEmitter.subscribe('ORDER_CREATED', reloadOrders);

    // WebSocket: order status changed in real-time
    const unsubscribeStatusChanged = orderEventEmitter.subscribe('ORDER_STATUS_CHANGED', reloadOrders);

    // Fetch store config (tax rate, CC surcharge) from server
    // This runs once on mount — replaces the hardcoded 10% default with the actual rate
    const fetchStoreConfig = async () => {
      try {
        const { billingApiClient } = await import('@/services/billing/BillingApiClient');
        const config = await billingApiClient.getStoreConfig('1');
        if (config.taxRate > 0) {
          // Server returns tax as percentage (e.g., 10 for 10%), convert to decimal
          const rate = config.taxRate >= 1 ? config.taxRate / 100 : config.taxRate;
          dispatch({ type: 'SET_CART_TAX_RATE', payload: rate });
          if (__DEV__) {
            console.log('[UnifiedOrderContext] Tax rate from server:', rate, 'CC:', config.ccPercentage);
          }
        }
      } catch {
        // Silent — use hardcoded default if server unreachable
      }
    };
    fetchStoreConfig();

    return () => {
      unsubscribeReset();
      unsubscribeSyncComplete();
      unsubscribeCreated();
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

      const kitchenStation = menuItem.kitchen_station
        ?? getStationForCategory(menuItem.category_id, menuItem.category_id);

      const allergens = (menuItem.allergens || []) as AllergenType[];
      const dietaryTags = (menuItem.dietary_tags || []) as DietaryTag[];

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

  const setCartItemDiscount = useCallback((itemId: string, discountType: 'percentage' | 'fixed', discountValue: number) => {
    dispatch({ type: 'SET_CART_ITEM_DISCOUNT', payload: { itemId, discountType, discountValue } });
  }, []);

  // ============== TABLE SELECTION ==============

  const setSelectedTable = useCallback((table: Table | null) => {
    // SET_SELECTED_TABLE atomically sets both selectedTable and cartOrderNumber in the reducer
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
      const activeOrdersOnTable = await unifiedOrderStorageService.getActiveOrdersForTable(
        currentState.selectedTable!.id
      );
      if (activeOrdersOnTable.length > 0 && !currentState.isSplitOrder) {
        return {
          success: false,
          error: `Table already has an active order: ${activeOrdersOnTable[0].orderNumber}. Please complete or cancel it first.`,
        };
      }
      const guestCount = currentState.pendingGuestCount ?? 1;
      if (activeOrdersOnTable.length > 0) {
        const occupiedGuests = activeOrdersOnTable.reduce((sum, o) => sum + (o.guestCount || 1), 0);
        const capacity = currentState.selectedTable!.capacity;
        if (occupiedGuests + guestCount > capacity) {
          return {
            success: false,
            error: `Not enough seats. ${capacity - occupiedGuests} of ${capacity} remaining.`,
          };
        }
      }
    } catch { /* Continue anyway - we'll catch duplicates in storage */ }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const now = new Date().toISOString();
      const orderId = generateUnifiedOrderId();
      // Use the pre-assigned order number (generated when table was selected),
      // falling back to a new one if somehow not set
      const orderNumber = currentState.cartOrderNumber ?? generateUnifiedOrderNumber();

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
        guestCount: currentState.pendingGuestCount ?? 1,
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

      // Enqueue for background sync push to server (transform to snake_case server format)
      syncQueueService.enqueue(
        'order',
        orderId,
        'create',
        {
          order_number: order.orderNumber,
          table_id: order.tableId,
          status: order.status,
          subtotal: order.subtotal,
          tax_amount: order.taxAmount,
          discount_amount: order.discountAmount,
          total_amount: order.totalAmount,
          guest_count: order.guestCount,
          special_instructions: order.specialInstructions,
          submitted_at: order.submittedAt,
          order_items: order.items.map((i) => ({
            menu_item_id: i.menuItemId,
            name: i.name,
            quantity: i.quantity,
            base_price: i.basePrice,
            item_total: i.itemTotal,
            item_status: i.itemStatus,
            kitchen_station: i.kitchenStation,
            special_instructions: i.specialInstructions,
          })),
        }
      ).then(() => {
        if (__DEV__) console.log('[UnifiedOrder] Order enqueued for sync:', orderId);
      }).catch((err) => {
        if (__DEV__) console.error('[UnifiedOrder] Sync enqueue failed:', err);
      });

      // Log activity
      activityLogService.logEvent({
        timestamp: now,
        eventType: 'order_created',
        orderId,
        orderNumber,
        tableName: order.tableName,
        description: `Order created for ${order.tableName}`,
      }).catch(() => { /* silent */ });

      // Update state
      dispatch({ type: 'ADD_ORDER', payload: order });
      dispatch({ type: 'CLEAR_CURRENT_ORDER' });
      dispatch({ type: 'SET_SUBMITTING', payload: false });

      // Log sent_to_kitchen
      activityLogService.logEvent({
        timestamp: now,
        eventType: 'sent_to_kitchen',
        orderId,
        orderNumber,
        tableName: order.tableName,
        description: `Order ${orderNumber} sent to kitchen`,
      }).catch(() => { /* silent */ });

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
        const order = stateRef.current.orders.find((o) => o.id === orderId);

        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: { orderId, status },
        });

        // Update storage
        const updatedOrder = await unifiedOrderStorageService.updateOrder(orderId, {
          status,
          updatedAt: new Date().toISOString(),
          ...(status === 'preparing' && { preparingAt: new Date().toISOString() }),
          ...(status === 'ready' && { readyAt: new Date().toISOString() }),
          ...(status === 'served' && { servedAt: new Date().toISOString() }),
        });

        // Sync to backend (deduped — only latest status update queued)
        if (updatedOrder) {
          syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updatedOrder))
            .catch(() => { /* silent — next sync cycle will retry */ });
        }

        // Log ready / served transitions
        if (order && (status === 'ready' || status === 'served')) {
          activityLogService.logEvent({
            timestamp: new Date().toISOString(),
            eventType: status,
            orderId,
            orderNumber: order.orderNumber,
            tableName: order.tableName,
            description: `Order ${order.orderNumber} marked as ${status}`,
          }).catch(() => { /* silent */ });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    []
  );

  const updateItemStatus = useCallback(
    async (orderId: string, itemId: string, status: UnifiedItemStatus) => {
      try {
        const prevOrder = stateRef.current.orders.find((o) => o.id === orderId);
        const prevOrderStatus = prevOrder?.status;

        // Update item status in storage + auto-recalculate order status
        const updatedOrder = await unifiedOrderStorageService.updateItemStatus(
          orderId, itemId, status
        );
        if (updatedOrder) {
          dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

          // Sync to backend (deduped)
          syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updatedOrder))
            .catch(() => { /* silent */ });

          // Log when order transitions to ready or served via item status changes
          const newOrderStatus = updatedOrder.status;
          if (
            prevOrder &&
            newOrderStatus !== prevOrderStatus &&
            (newOrderStatus === 'ready' || newOrderStatus === 'served')
          ) {
            activityLogService.logEvent({
              timestamp: new Date().toISOString(),
              eventType: newOrderStatus,
              orderId,
              orderNumber: updatedOrder.orderNumber,
              tableName: updatedOrder.tableName,
              description: `Order ${updatedOrder.orderNumber} marked as ${newOrderStatus}`,
            }).catch(() => { /* silent */ });
          }
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
        const paidOrder = await unifiedOrderStorageService.updateOrder(orderId, {
          status: 'paid',
          paymentStatus: 'paid',
          paymentMethod: method,
          paymentId: transactionId,
          paidAt: now,
          updatedAt: now,
        });

        // Sync paid order to backend (highest priority)
        if (paidOrder) {
          syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(paidOrder))
            .catch(() => { /* silent */ });
        }

        // Log payment
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'paid',
          orderId,
          orderNumber: order.orderNumber,
          tableName: order.tableName,
          description: `Order ${order.orderNumber} paid via ${method} ($${order.totalAmount.toFixed(2)})`,
          metadata: { method, amount: order.totalAmount },
        }).catch(() => { /* silent */ });

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

  const getActiveOrdersForTable = useCallback(
    (tableId: string): UnifiedOrder[] => {
      return state.activeOrders.filter((o) => o.tableId === tableId);
    },
    [state.activeOrders]
  );

  const setGuestCount = useCallback((guestCount: number) => {
    dispatch({ type: 'SET_PENDING_GUEST_COUNT', payload: guestCount });
  }, []);

  const setSplitOrderConfig = useCallback((guestCount: number) => {
    dispatch({ type: 'SET_SPLIT_ORDER_CONFIG', payload: { guestCount } });
  }, []);

  const cancelOrder = useCallback(
    async (orderId: string, reason: string) => {
      try {
        const order = stateRef.current.orders.find((o) => o.id === orderId);
        if (!order) return;

        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: { orderId, status: 'cancelled' },
        });

        const cancelledOrder = await unifiedOrderStorageService.updateOrder(orderId, {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
        });

        // Sync cancellation to backend
        if (cancelledOrder) {
          syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(cancelledOrder))
            .catch(() => { /* silent */ });
        }

        // Log cancellation
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'cancelled',
          orderId,
          orderNumber: order.orderNumber,
          tableName: order.tableName,
          description: `Order ${order.orderNumber} cancelled: ${reason}`,
          metadata: { reason },
        }).catch(() => { /* silent */ });

        // Emit ORDER_CANCELLED event - this triggers:
        // 1. TableProvider: Mark table as AVAILABLE
        orderEventEmitter.emit('ORDER_CANCELLED', orderId, { reason, tableId: order.tableId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    []
  );

  const mergeOrders = useCallback(
    async (targetOrderId: string, sourceOrderId: string) => {
      try {
        const merged = await unifiedOrderStorageService.mergeOrders(targetOrderId, sourceOrderId);
        dispatch({ type: 'UPDATE_ORDER', payload: merged });
        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: { orderId: sourceOrderId, status: 'cancelled' },
        });

        // Sync merged (target) order to backend
        syncQueueService.enqueueUpdate('order', targetOrderId, buildOrderSyncPayload(merged))
          .catch(() => { /* silent */ });

        // Sync source order cancellation (fetch from storage to get cancelled state)
        unifiedOrderStorageService.getOrder(sourceOrderId).then((cancelledSource) => {
          if (cancelledSource) {
            syncQueueService.enqueueUpdate('order', sourceOrderId, buildOrderSyncPayload(cancelledSource))
              .catch(() => { /* silent */ });
          }
        }).catch(() => { /* silent */ });

        orderEventEmitter.emit('ORDER_CANCELLED', sourceOrderId, { reason: 'merged', tableId: '' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
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

  // ============== BILL-LEVEL OPERATIONS ==============

  const applyOrderDiscount = useCallback(
    async (orderId: string, type: 'percentage' | 'fixed', value: number) => {
      try {
        const updated = await unifiedOrderStorageService.applyOrderDiscount(orderId, type, value);
        dispatch({ type: 'UPDATE_ORDER', payload: updated });
        syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updated))
          .catch(() => { /* silent */ });
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'discount_applied',
          orderId,
          orderNumber: updated.orderNumber,
          tableName: updated.tableName,
          description: `Discount applied: ${type === 'percentage' ? `${value}%` : `$${value}`}`,
          metadata: { type, value, discountAmount: updated.discountAmount },
        }).catch(() => { /* silent */ });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
      }
    },
    []
  );

  const applyItemDiscount = useCallback(
    async (orderId: string, itemId: string, type: 'percentage' | 'fixed', value: number) => {
      try {
        const updated = await unifiedOrderStorageService.applyItemDiscount(orderId, itemId, type, value);
        dispatch({ type: 'UPDATE_ORDER', payload: updated });
        syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updated))
          .catch(() => { /* silent */ });
        const item = updated.items.find(i => i.id === itemId);
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'discount_applied',
          orderId,
          orderNumber: updated.orderNumber,
          tableName: updated.tableName,
          description: `Item discount applied to ${item?.name || 'item'}: ${type === 'percentage' ? `${value}%` : `$${value}`}`,
          metadata: { type, value, itemId },
        }).catch(() => { /* silent */ });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
      }
    },
    []
  );

  const transferItems = useCallback(
    async (sourceOrderId: string, targetOrderId: string, itemIds: string[]) => {
      try {
        const { source, target } = await unifiedOrderStorageService.transferItems(
          sourceOrderId, targetOrderId, itemIds
        );
        dispatch({ type: 'UPDATE_ORDER', payload: source });
        dispatch({ type: 'UPDATE_ORDER', payload: target });
        // Sync both affected orders to backend
        syncQueueService.enqueueUpdate('order', sourceOrderId, buildOrderSyncPayload(source))
          .catch(() => { /* silent */ });
        syncQueueService.enqueueUpdate('order', targetOrderId, buildOrderSyncPayload(target))
          .catch(() => { /* silent */ });
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'items_transferred',
          orderId: sourceOrderId,
          orderNumber: source.orderNumber,
          tableName: source.tableName,
          description: `${itemIds.length} item(s) transferred to ${target.tableName}`,
          metadata: { itemIds, targetOrderId },
        }).catch(() => { /* silent */ });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
      }
    },
    []
  );

  const addItemsToOrder = useCallback(
    async (orderId: string, cartItems: UnifiedOrderItem[]) => {
      try {
        const updated = await unifiedOrderStorageService.addItemsToOrder(orderId, cartItems);
        dispatch({ type: 'UPDATE_ORDER', payload: updated });
        dispatch({ type: 'CLEAR_CART' });
        syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updated))
          .catch(() => { /* silent */ });
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'sent_to_kitchen',
          orderId,
          orderNumber: updated.orderNumber,
          tableName: updated.tableName,
          description: `${cartItems.length} new item(s) added to order ${updated.orderNumber}`,
          metadata: { itemCount: cartItems.length },
        }).catch(() => { /* silent */ });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
      }
    },
    []
  );

  const removeItemFromOrder = useCallback(
    async (orderId: string, itemId: string) => {
      try {
        const updated = await unifiedOrderStorageService.removeItemFromOrder(orderId, itemId);
        dispatch({ type: 'UPDATE_ORDER', payload: updated });
        syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updated))
          .catch(() => { /* silent */ });
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'item_removed',
          orderId,
          orderNumber: updated.orderNumber,
          tableName: updated.tableName,
          description: `Item removed from order ${updated.orderNumber}`,
        }).catch(() => { /* silent */ });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
      }
    },
    []
  );

  const updateOrderItem = useCallback(
    async (
      orderId: string,
      itemId: string,
      updates: { quantity?: number; selectedModifiers?: SelectedModifier[]; specialInstructions?: string }
    ) => {
      try {
        const updated = await unifiedOrderStorageService.updateOrderItem(orderId, itemId, updates);
        dispatch({ type: 'UPDATE_ORDER', payload: updated });
        syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updated))
          .catch(() => { /* silent */ });
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'item_modified',
          orderId,
          orderNumber: updated.orderNumber,
          tableName: updated.tableName,
          description: `Item modified on order ${updated.orderNumber}`,
        }).catch(() => { /* silent */ });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
      }
    },
    []
  );

  const transferOrderToTable = useCallback(
    async (orderId: string, newTableId: string, newTableName: string) => {
      try {
        const updated = await unifiedOrderStorageService.updateOrder(orderId, {
          tableId: newTableId,
          tableName: newTableName,
        });
        if (updated) {
          dispatch({ type: 'UPDATE_ORDER', payload: updated });
          syncQueueService.enqueueUpdate('order', orderId, buildOrderSyncPayload(updated))
            .catch(() => { /* silent */ });
          activityLogService.logEvent({
            timestamp: new Date().toISOString(),
            eventType: 'items_transferred',
            orderId,
            orderNumber: updated.orderNumber,
            tableName: updated.tableName,
            description: `Order #${updated.orderNumber} transferred to ${updated.tableName}`,
          }).catch(() => {});
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
        throw error;
      }
    },
    []
  );

  // ============== UTILITY ==============

  const canProcessPaymentFn = useCallback((order: UnifiedOrder): boolean => {
    return canAcceptPayment(order);
  }, []);

  // ============== CONTEXT VALUE ==============

  const contextValue: UnifiedOrderContextValue = useMemo(() => ({
    state,
    addToCart, updateCartItemQuantity, removeFromCart, clearCart, setCartDiscount, setCartItemDiscount,
    setSelectedTable,
    submitToKitchen, loadOrders, refreshOrders,
    updateOrderStatus, updateItemStatus,
    processPayment,
    getOrderById, getActiveOrderForTable, getActiveOrdersForTable, setGuestCount, setSplitOrderConfig,
    cancelOrder, mergeOrders,
    applyOrderDiscount, applyItemDiscount, transferItems, addItemsToOrder,
    removeItemFromOrder, updateOrderItem, transferOrderToTable,
    setSearchQuery, setStatusFilter, setPaymentStatusFilter, clearFilters,
    setError, clearError, setSelectedOrderId,
    resetAllState,
    cart: state.cart,
    cartTotal: state.cartTotal,
    cartItemCount: state.cartItemCount,
    cartOrderNumber: state.cartOrderNumber,
    selectedTable: state.selectedTable,
    orders: state.orders,
    activeOrders: state.activeOrders,
    filteredOrders,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,
    canProcessPayment: canProcessPaymentFn,
  }), [
    state, filteredOrders,
    addToCart, updateCartItemQuantity, removeFromCart, clearCart, setCartDiscount, setCartItemDiscount,
    setSelectedTable, submitToKitchen, loadOrders, refreshOrders,
    updateOrderStatus, updateItemStatus, processPayment,
    getOrderById, getActiveOrderForTable, getActiveOrdersForTable, setGuestCount, setSplitOrderConfig,
    cancelOrder, mergeOrders,
    applyOrderDiscount, applyItemDiscount, transferItems, addItemsToOrder,
    removeItemFromOrder, updateOrderItem, transferOrderToTable,
    setSearchQuery, setStatusFilter, setPaymentStatusFilter, clearFilters,
    setError, clearError, setSelectedOrderId, resetAllState, canProcessPaymentFn,
  ]);

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
    orderNumber: context.cartOrderNumber,
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
    setItemDiscount: context.setCartItemDiscount,
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
    updateOrderStatus: context.updateOrderStatus,
    cancelOrder: context.cancelOrder,
    setSelectedOrderId: context.setSelectedOrderId,
    selectedOrderId: context.state.selectedOrderId,
  };
};

// ============== KITCHEN STATION VIEW TYPE ==============

export interface KitchenStationView {
  order: UnifiedOrder;
  station: string;
  items: UnifiedOrderItem[];
  stationStatus: 'pending' | 'preparing' | 'ready' | 'served';
  elapsedMinutes: number;
  isOverdue: boolean;
}

export interface KitchenStats {
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  overdueCount: number;
  avgPrepTime: number;
}

/**
 * Computes kitchen station view from item statuses
 */
function computeStationStatus(
  items: UnifiedOrderItem[]
): KitchenStationView['stationStatus'] {
  if (items.every((i) => i.itemStatus === 'served')) return 'served';
  if (items.every((i) => i.itemStatus === 'ready' || i.itemStatus === 'served')) return 'ready';
  if (items.some((i) => i.itemStatus === 'preparing')) return 'preparing';
  return 'pending';
}

/**
 * Hook that derives per-station kitchen cards from unified order state.
 * Replaces EnhancedKitchenContext ticket-based display.
 */
export const useKitchenStationViews = (): KitchenStationView[] => {
  const context = useUnifiedOrder();

  return useMemo(() => {
    const kitchenOrders = context.orders.filter((o) =>
      ['confirmed', 'preparing', 'ready'].includes(o.status)
    );

    const views: KitchenStationView[] = [];
    const now = Date.now();

    for (const order of kitchenOrders) {
      // Group items by station
      const byStation = new Map<string, UnifiedOrderItem[]>();
      for (const item of order.items) {
        if (item.itemStatus === 'cancelled') continue;
        const station = item.kitchenStation || 'hot_kitchen';
        if (!byStation.has(station)) byStation.set(station, []);
        byStation.get(station)!.push(item);
      }

      const elapsedMinutes = Math.floor(
        (now - new Date(order.createdAt).getTime()) / 60000
      );
      const threshold = (order.estimatedPrepTime || 20) * 1.2;

      for (const [station, items] of byStation.entries()) {
        const stationStatus = computeStationStatus(items);
        if (stationStatus === 'served') continue; // Skip fully served stations
        views.push({
          order,
          station,
          items,
          stationStatus,
          elapsedMinutes,
          isOverdue: elapsedMinutes > threshold,
        });
      }
    }

    // Sort: overdue first, then by oldest
    return views.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return new Date(a.order.createdAt).getTime() - new Date(b.order.createdAt).getTime();
    });
  }, [context.orders]);
};

/**
 * Hook that derives kitchen stats from unified order state.
 * Replaces useKitchenTickets() stats for dashboard consumption.
 */
export const useKitchenStats = (): KitchenStats => {
  const context = useUnifiedOrder();

  return useMemo((): KitchenStats => {
    const now = Date.now();
    let overdueCount = 0;

    const pendingCount = context.orders.filter((o) => o.status === 'confirmed').length;
    const preparingCount = context.orders.filter((o) => o.status === 'preparing').length;
    const readyCount = context.orders.filter((o) => o.status === 'ready').length;

    for (const o of context.orders) {
      if (!['confirmed', 'preparing', 'ready'].includes(o.status)) continue;
      const elapsed = (now - new Date(o.createdAt).getTime()) / 60000;
      const threshold = (o.estimatedPrepTime || 20) * 1.2;
      if (elapsed > threshold) overdueCount++;
    }

    const servedWithPrepTime = context.orders.filter(
      (o) => o.status === 'paid' && o.actualPrepTime && o.actualPrepTime > 0
    );
    const avgPrepTime =
      servedWithPrepTime.length > 0
        ? Math.round(
            servedWithPrepTime.reduce((sum, o) => sum + (o.actualPrepTime || 0), 0) /
              servedWithPrepTime.length
          )
        : 0;

    return { pendingCount, preparingCount, readyCount, overdueCount, avgPrepTime };
  }, [context.orders]);
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
