/**
 * Unified Order Reducer
 * Single reducer for all order state management
 *
 * Core Principle: ONE Status, ONE Source of Truth
 *
 * Key Features:
 * - Status validation - prevents invalid transitions
 * - RESET_STATE action for clear data functionality
 * - Kitchen is the ONLY source of status updates (except payment)
 */

import {
  UnifiedOrder,
  UnifiedOrderItem,
  UnifiedOrderStatus,
  UnifiedPaymentStatus,
  UnifiedItemStatus,
  UnifiedOrderFilters,
  isValidStatusTransition,
  isActiveOrder,
  calculateUnifiedItemTotal,
  calculateUnifiedOrderTotals,
  generateUnifiedOrderNumber,
} from '@/types/unified-order.types';
import { Table } from '@/types/table.types';

// ============== STATE INTERFACE ==============

export interface UnifiedOrderState {
  // Current Order Session
  currentOrder: UnifiedOrder | null;
  selectedTable: Table | null;

  // Cart
  cart: UnifiedOrderItem[];
  cartOrderNumber: string | null;
  cartSubtotal: number;
  cartTaxRate: number;
  cartTaxAmount: number;
  cartDiscountAmount: number;
  cartTotal: number;
  cartItemCount: number;

  // All Orders
  orders: UnifiedOrder[];
  activeOrders: UnifiedOrder[];
  historyOrders: UnifiedOrder[];

  // Filters & Search
  searchQuery: string;
  statusFilter: UnifiedOrderStatus | 'all' | 'active';
  paymentStatusFilter: UnifiedPaymentStatus | 'all';
  dateFilter: { startDate: string; endDate: string } | null;

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  isProcessingPayment: boolean;
  error: string | null;

  // Modal State
  selectedOrderId: string | null;

  // Split Order
  pendingGuestCount: number;
  isSplitOrder: boolean;

  // Sync State
  lastSynced: string | null;
  pendingSyncCount: number;
}

// ============== INITIAL STATE ==============

export const initialUnifiedOrderState: UnifiedOrderState = {
  // Current Order Session
  currentOrder: null,
  selectedTable: null,

  // Cart
  cart: [],
  cartOrderNumber: null,
  cartSubtotal: 0,
  cartTaxRate: 0.1, // 10% default tax rate
  cartTaxAmount: 0,
  cartDiscountAmount: 0,
  cartTotal: 0,
  cartItemCount: 0,

  // All Orders
  orders: [],
  activeOrders: [],
  historyOrders: [],

  // Filters & Search
  searchQuery: '',
  statusFilter: 'all',
  paymentStatusFilter: 'all',
  dateFilter: null,

  // UI State
  isLoading: false,
  isSubmitting: false,
  isProcessingPayment: false,
  error: null,

  // Modal State
  selectedOrderId: null,

  // Split Order
  pendingGuestCount: 1,
  isSplitOrder: false,

  // Sync State
  lastSynced: null,
  pendingSyncCount: 0,
};

// ============== ACTION TYPES ==============

export type UnifiedOrderAction =
  // Initialization
  | { type: 'INITIALIZE_STATE'; payload: Partial<UnifiedOrderState> }
  | { type: 'RESET_STATE' } // CRITICAL: For clear data functionality

  // Table Selection
  | { type: 'SET_SELECTED_TABLE'; payload: Table | null }

  // Cart Operations
  | { type: 'ADD_TO_CART'; payload: UnifiedOrderItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { itemId: string; updates: Partial<UnifiedOrderItem> } }
  | { type: 'UPDATE_CART_ITEM_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART_ORDER_NUMBER'; payload: string | null }
  | { type: 'SET_CART_TAX_RATE'; payload: number }
  | { type: 'SET_CART_DISCOUNT'; payload: { type: 'percentage' | 'fixed'; value: number } }
  | { type: 'SET_CART_ITEM_DISCOUNT'; payload: { itemId: string; discountType: 'percentage' | 'fixed'; discountValue: number } }

  // Order Operations
  | { type: 'SET_ORDERS'; payload: UnifiedOrder[] }
  | { type: 'SET_ACTIVE_ORDERS'; payload: UnifiedOrder[] }
  | { type: 'SET_HISTORY_ORDERS'; payload: UnifiedOrder[] }
  | { type: 'ADD_ORDER'; payload: UnifiedOrder }
  | { type: 'UPDATE_ORDER'; payload: UnifiedOrder }
  | { type: 'REMOVE_ORDER'; payload: string }

  // Order Status - Kitchen ONLY (except payment)
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: UnifiedOrderStatus; timestamp?: string } }

  // Item Status - Kitchen ONLY
  | { type: 'UPDATE_ITEM_STATUS'; payload: { orderId: string; itemId: string; status: UnifiedItemStatus } }

  // Payment
  | { type: 'PROCESS_PAYMENT'; payload: { orderId: string; method: string; transactionId?: string } }
  | { type: 'SET_PROCESSING_PAYMENT'; payload: boolean }

  // Filters & Search
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: UnifiedOrderStatus | 'all' | 'active' }
  | { type: 'SET_PAYMENT_STATUS_FILTER'; payload: UnifiedPaymentStatus | 'all' }
  | { type: 'SET_DATE_FILTER'; payload: { startDate: string; endDate: string } | null }
  | { type: 'CLEAR_FILTERS' }

  // UI State
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_ORDER_ID'; payload: string | null }

  // Current Order
  | { type: 'SET_CURRENT_ORDER'; payload: UnifiedOrder | null }
  | { type: 'CLEAR_CURRENT_ORDER' }

  // Guest Count / Split Order
  | { type: 'SET_PENDING_GUEST_COUNT'; payload: number }
  | { type: 'SET_SPLIT_ORDER_CONFIG'; payload: { guestCount: number } }

  // Sync State
  | { type: 'SET_LAST_SYNCED'; payload: string | null }
  | { type: 'SET_PENDING_SYNC_COUNT'; payload: number };

// ============== HELPER FUNCTIONS ==============

/**
 * Calculate cart totals from items
 */
function calculateCartTotals(
  items: UnifiedOrderItem[],
  taxRate: number,
  discountAmount: number
): {
  subtotal: number;
  taxAmount: number;
  total: number;
  itemCount: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * taxRate;
  const total = subtotal + taxAmount - discountAmount;
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount,
  };
}

/** Max history orders to keep in memory (older ones live in SQLite) */
const MAX_HISTORY_ORDERS_IN_MEMORY = 30;

/**
 * Update order status with timestamp tracking
 */
function updateOrderStatusWithTimestamp(
  order: UnifiedOrder,
  newStatus: UnifiedOrderStatus,
  timestamp?: string
): UnifiedOrder {
  const now = timestamp || new Date().toISOString();
  const updates: Partial<UnifiedOrder> = {
    status: newStatus,
    updatedAt: now,
    pendingSync: true,
  };

  // Set appropriate timestamp based on status
  switch (newStatus) {
    case 'confirmed':
      updates.submittedAt = now;
      break;
    case 'preparing':
      updates.preparingAt = now;
      break;
    case 'ready':
      updates.readyAt = now;
      // Calculate actual prep time
      if (order.preparingAt) {
        const startTime = new Date(order.preparingAt).getTime();
        updates.actualPrepTime = Math.round((Date.now() - startTime) / (1000 * 60));
      }
      break;
    case 'served':
      updates.servedAt = now;
      break;
    case 'paid':
      updates.paidAt = now;
      updates.paymentStatus = 'paid';
      break;
    case 'cancelled':
      updates.cancelledAt = now;
      break;
  }

  return { ...order, ...updates };
}

/**
 * Move order between active and history lists based on status
 */
function categorizeOrder(
  orders: UnifiedOrder[],
  updatedOrder: UnifiedOrder
): { activeOrders: UnifiedOrder[]; historyOrders: UnifiedOrder[] } {
  const otherOrders = orders.filter((o) => o.id !== updatedOrder.id);
  const allOrders = [...otherOrders, updatedOrder];

  return {
    activeOrders: allOrders.filter(isActiveOrder),
    historyOrders: allOrders.filter((o) => !isActiveOrder(o)).slice(0, MAX_HISTORY_ORDERS_IN_MEMORY),
  };
}

// ============== REDUCER ==============

export function unifiedOrderReducer(
  state: UnifiedOrderState,
  action: UnifiedOrderAction
): UnifiedOrderState {
  switch (action.type) {
    // ============== INITIALIZATION ==============

    case 'INITIALIZE_STATE':
      return {
        ...state,
        ...action.payload,
      };

    case 'RESET_STATE':
      // CRITICAL: Complete state reset for clear data functionality
      return { ...initialUnifiedOrderState };

    // ============== TABLE SELECTION ==============

    case 'SET_SELECTED_TABLE':
      return {
        ...state,
        selectedTable: action.payload,
        // Generate order number atomically when table is selected; clear when deselected.
        // This guarantees cartOrderNumber is always ready by the time the BillPanel renders.
        cartOrderNumber: action.payload ? generateUnifiedOrderNumber() : null,
      };

    // ============== CART OPERATIONS ==============

    case 'ADD_TO_CART': {
      const incoming = action.payload;
      const existingIdx = (incoming.selectedModifiers?.length ?? 0) === 0
        ? state.cart.findIndex(
            (i) => i.menuItemId === incoming.menuItemId &&
                   (i.selectedModifiers?.length ?? 0) === 0
          )
        : -1;

      let newCart: UnifiedOrderItem[];
      if (existingIdx >= 0) {
        newCart = state.cart.map((item, idx) => {
          if (idx !== existingIdx) return item;
          const newQty = item.quantity + 1;
          return {
            ...item,
            quantity: newQty,
            itemTotal: (item.basePrice + item.modifierTotal) * newQty,
          };
        });
      } else {
        newCart = [...state.cart, incoming];
      }

      const totals = calculateCartTotals(newCart, state.cartTaxRate, state.cartDiscountAmount);
      return {
        ...state,
        cart: newCart,
        cartSubtotal: totals.subtotal,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
        cartItemCount: totals.itemCount,
      };
    }

    case 'UPDATE_CART_ITEM': {
      const newCart = state.cart.map((item) =>
        item.id === action.payload.itemId
          ? { ...item, ...action.payload.updates, modifiedAt: new Date().toISOString() }
          : item
      );
      const totals = calculateCartTotals(newCart, state.cartTaxRate, state.cartDiscountAmount);

      return {
        ...state,
        cart: newCart,
        cartSubtotal: totals.subtotal,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
        cartItemCount: totals.itemCount,
      };
    }

    case 'UPDATE_CART_ITEM_QUANTITY': {
      const newCart = state.cart
        .map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: action.payload.quantity,
                itemTotal: (item.basePrice + item.modifierTotal) * action.payload.quantity,
                modifiedAt: new Date().toISOString(),
              }
            : item
        )
        .filter((item) => item.quantity > 0);

      const totals = calculateCartTotals(newCart, state.cartTaxRate, state.cartDiscountAmount);

      return {
        ...state,
        cart: newCart,
        cartSubtotal: totals.subtotal,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
        cartItemCount: totals.itemCount,
      };
    }

    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter((item) => item.id !== action.payload);
      const totals = calculateCartTotals(newCart, state.cartTaxRate, state.cartDiscountAmount);

      return {
        ...state,
        cart: newCart,
        cartSubtotal: totals.subtotal,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
        cartItemCount: totals.itemCount,
      };
    }

    case 'SET_CART_ORDER_NUMBER':
      return {
        ...state,
        cartOrderNumber: action.payload,
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        cartOrderNumber: null,
        cartSubtotal: 0,
        cartTaxAmount: 0,
        cartTotal: 0,
        cartItemCount: 0,
        cartDiscountAmount: 0,
      };

    case 'SET_CART_TAX_RATE': {
      const totals = calculateCartTotals(state.cart, action.payload, state.cartDiscountAmount);

      return {
        ...state,
        cartTaxRate: action.payload,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
      };
    }

    case 'SET_CART_DISCOUNT': {
      let discountAmount = 0;
      if (action.payload.type === 'percentage') {
        discountAmount = state.cartSubtotal * (action.payload.value / 100);
      } else {
        discountAmount = Math.min(action.payload.value, state.cartSubtotal);
      }

      const totals = calculateCartTotals(state.cart, state.cartTaxRate, discountAmount);

      return {
        ...state,
        cartDiscountAmount: discountAmount,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
      };
    }

    case 'SET_CART_ITEM_DISCOUNT': {
      const { itemId, discountType, discountValue } = action.payload;
      const newCart = state.cart.map((item) => {
        if (item.id !== itemId) return item;
        const baseItemTotal = (item.basePrice + item.modifierTotal) * item.quantity;
        const discountAmount =
          discountType === 'percentage'
            ? parseFloat((baseItemTotal * (discountValue / 100)).toFixed(2))
            : parseFloat(Math.min(discountValue, baseItemTotal).toFixed(2));
        return {
          ...item,
          discountType,
          discountValue,
          discountAmount,
          itemTotal: parseFloat((baseItemTotal - discountAmount).toFixed(2)),
        };
      });
      const totals = calculateCartTotals(newCart, state.cartTaxRate, state.cartDiscountAmount);
      return {
        ...state,
        cart: newCart,
        cartSubtotal: totals.subtotal,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
      };
    }

    // ============== ORDER OPERATIONS ==============

    case 'SET_ORDERS': {
      const allOrders = action.payload;
      const activeOrders = allOrders.filter(isActiveOrder);
      // Cap history in memory — older orders live in SQLite
      const historyOrders = allOrders.filter((o) => !isActiveOrder(o)).slice(0, MAX_HISTORY_ORDERS_IN_MEMORY);
      const orders = [...activeOrders, ...historyOrders];
      return {
        ...state,
        orders,
        activeOrders,
        historyOrders,
      };
    }

    case 'SET_ACTIVE_ORDERS':
      return {
        ...state,
        activeOrders: action.payload,
      };

    case 'SET_HISTORY_ORDERS':
      return {
        ...state,
        historyOrders: action.payload,
      };

    case 'ADD_ORDER': {
      const newOrder = action.payload;
      const newActiveOrders = isActiveOrder(newOrder)
        ? [newOrder, ...state.activeOrders]
        : state.activeOrders;
      const newHistoryOrders = !isActiveOrder(newOrder)
        ? [newOrder, ...state.historyOrders].slice(0, MAX_HISTORY_ORDERS_IN_MEMORY)
        : state.historyOrders;

      return {
        ...state,
        orders: [...newActiveOrders, ...newHistoryOrders],
        activeOrders: newActiveOrders,
        historyOrders: newHistoryOrders,
      };
    }

    case 'UPDATE_ORDER': {
      const updatedOrder = action.payload;
      const { activeOrders, historyOrders } = categorizeOrder(state.orders, updatedOrder);

      return {
        ...state,
        orders: state.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
        activeOrders,
        historyOrders,
        currentOrder:
          state.currentOrder?.id === updatedOrder.id ? updatedOrder : state.currentOrder,
      };
    }

    case 'REMOVE_ORDER': {
      const orderId = action.payload;
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== orderId),
        activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
        historyOrders: state.historyOrders.filter((o) => o.id !== orderId),
        currentOrder: state.currentOrder?.id === orderId ? null : state.currentOrder,
      };
    }

    // ============== ORDER STATUS (Kitchen ONLY) ==============

    case 'UPDATE_ORDER_STATUS': {
      const { orderId, status, timestamp } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);

      if (!order) {
        return state;
      }

      // Validate status transition (except for payment which bypasses this)
      if (status !== 'paid' && !isValidStatusTransition(order.status, status)) {
        return state;
      }

      const updatedOrder = updateOrderStatusWithTimestamp(order, status, timestamp);
      const { activeOrders, historyOrders } = categorizeOrder(state.orders, updatedOrder);

      return {
        ...state,
        orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        activeOrders,
        historyOrders,
        currentOrder:
          state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
      };
    }

    // ============== ITEM STATUS (Kitchen ONLY) ==============

    case 'UPDATE_ITEM_STATUS': {
      const { orderId, itemId, status } = action.payload;

      const updateItems = (orders: UnifiedOrder[]) =>
        orders.map((order) => {
          if (order.id !== orderId) return order;

          const updatedItems = order.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  itemStatus: status,
                  modifiedAt: new Date().toISOString(),
                  ...(status === 'ready' && { preparedAt: new Date().toISOString() }),
                }
              : item
          );

          // Auto-update order status based on item statuses
          const allReady = updatedItems.every((i) => i.itemStatus === 'ready');
          const anyPreparing = updatedItems.some((i) => i.itemStatus === 'preparing');

          let newOrderStatus = order.status;
          if (allReady && order.status === 'preparing') {
            newOrderStatus = 'ready';
          } else if (anyPreparing && order.status === 'confirmed') {
            newOrderStatus = 'preparing';
          }

          return {
            ...order,
            items: updatedItems,
            status: newOrderStatus,
            updatedAt: new Date().toISOString(),
            ...(newOrderStatus === 'ready' && { readyAt: new Date().toISOString() }),
            ...(newOrderStatus === 'preparing' && !order.preparingAt && { preparingAt: new Date().toISOString() }),
          };
        });

      return {
        ...state,
        orders: updateItems(state.orders),
        activeOrders: updateItems(state.activeOrders),
        historyOrders: updateItems(state.historyOrders),
      };
    }

    // ============== PAYMENT ==============

    case 'PROCESS_PAYMENT': {
      const { orderId, method, transactionId } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);

      if (!order) {
        return state;
      }

      // Payment can happen when order is ready or served
      if (order.status !== 'ready' && order.status !== 'served') {
        return state;
      }

      const now = new Date().toISOString();
      const updatedOrder: UnifiedOrder = {
        ...order,
        status: 'paid',
        paymentStatus: 'paid',
        paymentMethod: method,
        paymentId: transactionId,
        paidAt: now,
        updatedAt: now,
        pendingSync: true,
      };

      const { activeOrders, historyOrders } = categorizeOrder(state.orders, updatedOrder);

      return {
        ...state,
        orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        activeOrders,
        historyOrders,
        isProcessingPayment: false,
      };
    }

    case 'SET_PROCESSING_PAYMENT':
      return {
        ...state,
        isProcessingPayment: action.payload,
      };

    // ============== FILTERS & SEARCH ==============

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };

    case 'SET_STATUS_FILTER':
      return {
        ...state,
        statusFilter: action.payload,
      };

    case 'SET_PAYMENT_STATUS_FILTER':
      return {
        ...state,
        paymentStatusFilter: action.payload,
      };

    case 'SET_DATE_FILTER':
      return {
        ...state,
        dateFilter: action.payload,
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        searchQuery: '',
        statusFilter: 'all',
        paymentStatusFilter: 'all',
        dateFilter: null,
      };

    // ============== UI STATE ==============

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSubmitting: false,
        isProcessingPayment: false,
      };

    case 'SET_SELECTED_ORDER_ID':
      return {
        ...state,
        selectedOrderId: action.payload,
      };

    // ============== CURRENT ORDER ==============

    case 'SET_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: action.payload,
      };

    case 'CLEAR_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: null,
        selectedTable: null,
        cart: [],
        cartOrderNumber: null,
        cartSubtotal: 0,
        cartTaxAmount: 0,
        cartTotal: 0,
        cartItemCount: 0,
        cartDiscountAmount: 0,
        pendingGuestCount: 1,
        isSplitOrder: false,
      };

    // ============== GUEST COUNT / SPLIT ORDER ==============

    case 'SET_PENDING_GUEST_COUNT':
      return {
        ...state,
        pendingGuestCount: action.payload,
      };

    case 'SET_SPLIT_ORDER_CONFIG':
      return {
        ...state,
        pendingGuestCount: action.payload.guestCount,
        isSplitOrder: true,
      };

    // ============== SYNC STATE ==============

    case 'SET_LAST_SYNCED':
      return {
        ...state,
        lastSynced: action.payload,
      };

    case 'SET_PENDING_SYNC_COUNT':
      return {
        ...state,
        pendingSyncCount: action.payload,
      };

    default:
      return state;
  }
}
