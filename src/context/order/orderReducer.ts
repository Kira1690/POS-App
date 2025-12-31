/**
 * Order Reducer - Enhanced state management for Order Management system
 * Handles cart, orders, kitchen tickets, and sync state
 */

import {
  ExtendedOrder,
  ExtendedOrderItem,
  ExtendedOrderStatus,
  ExtendedPaymentStatus,
  OrderDraft,
  DateRange,
  CartState,
  generateOrderItemId,
  calculateItemTotal,
} from '@/types/order-extended.types';
import { KitchenTicket } from '@/types/kitchen-ticket.types';
import { Table } from '@/types/table.types';

// ============== STATE INTERFACE ==============

export interface OrderState {
  // Current Order Session
  currentOrder: ExtendedOrder | null;
  currentDraft: OrderDraft | null;
  selectedTable: Table | null;

  // Cart
  cart: ExtendedOrderItem[];
  cartSubtotal: number;
  cartTaxRate: number;
  cartTaxAmount: number;
  cartDiscountAmount: number;
  cartTotal: number;
  cartItemCount: number;

  // All Orders
  orders: ExtendedOrder[];
  activeOrders: ExtendedOrder[];
  orderHistory: ExtendedOrder[];

  // Filters & Search
  searchQuery: string;
  statusFilter: ExtendedOrderStatus | 'all';
  paymentStatusFilter: ExtendedPaymentStatus | 'all';
  dateFilter: DateRange | null;

  // Kitchen Tickets
  kitchenTickets: KitchenTicket[];

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  isSyncing: boolean;
  error: string | null;

  // Sync State
  lastSynced: string | null;
  pendingSyncCount: number;

  // Modal State
  selectedOrderId: string | null;
  isModifierModalOpen: boolean;
  isComboModalOpen: boolean;
  isSendToKitchenModalOpen: boolean;
}

// ============== INITIAL STATE ==============

export const initialOrderState: OrderState = {
  // Current Order Session
  currentOrder: null,
  currentDraft: null,
  selectedTable: null,

  // Cart
  cart: [],
  cartSubtotal: 0,
  cartTaxRate: 0.1, // 10% default tax rate
  cartTaxAmount: 0,
  cartDiscountAmount: 0,
  cartTotal: 0,
  cartItemCount: 0,

  // All Orders
  orders: [],
  activeOrders: [],
  orderHistory: [],

  // Filters & Search
  searchQuery: '',
  statusFilter: 'all',
  paymentStatusFilter: 'all',
  dateFilter: null,

  // Kitchen Tickets
  kitchenTickets: [],

  // UI State
  isLoading: false,
  isSubmitting: false,
  isSyncing: false,
  error: null,

  // Sync State
  lastSynced: null,
  pendingSyncCount: 0,

  // Modal State
  selectedOrderId: null,
  isModifierModalOpen: false,
  isComboModalOpen: false,
  isSendToKitchenModalOpen: false,
};

// ============== ACTION TYPES ==============

export type OrderAction =
  // Initialization
  | { type: 'INITIALIZE_STATE'; payload: Partial<OrderState> }
  | { type: 'RESET_STATE' }

  // Order Session
  | { type: 'CREATE_ORDER'; payload: { table: Table; guestCount?: number } }
  | { type: 'SET_CURRENT_ORDER'; payload: ExtendedOrder }
  | { type: 'CLEAR_CURRENT_ORDER' }
  | { type: 'SET_SELECTED_TABLE'; payload: Table | null }

  // Cart Operations
  | { type: 'ADD_TO_CART'; payload: ExtendedOrderItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { itemId: string; updates: Partial<ExtendedOrderItem> } }
  | { type: 'UPDATE_CART_ITEM_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART_TAX_RATE'; payload: number }
  | { type: 'SET_CART_DISCOUNT'; payload: number }

  // Orders
  | { type: 'SET_ORDERS'; payload: ExtendedOrder[] }
  | { type: 'SET_ACTIVE_ORDERS'; payload: ExtendedOrder[] }
  | { type: 'SET_ORDER_HISTORY'; payload: ExtendedOrder[] }
  | { type: 'ADD_ORDER'; payload: ExtendedOrder }
  | { type: 'UPDATE_ORDER'; payload: ExtendedOrder }
  | { type: 'REMOVE_ORDER'; payload: string }

  // Order Status
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: ExtendedOrderStatus } }
  | { type: 'UPDATE_PAYMENT_STATUS'; payload: { orderId: string; status: ExtendedPaymentStatus } }

  // Item Status
  | { type: 'UPDATE_ITEM_STATUS'; payload: { orderId: string; itemId: string; status: string } }

  // Kitchen Tickets
  | { type: 'SET_KITCHEN_TICKETS'; payload: KitchenTicket[] }
  | { type: 'ADD_KITCHEN_TICKETS'; payload: KitchenTicket[] }
  | { type: 'UPDATE_KITCHEN_TICKET'; payload: KitchenTicket }
  | { type: 'REMOVE_KITCHEN_TICKET'; payload: string }

  // Filters & Search
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: ExtendedOrderStatus | 'all' }
  | { type: 'SET_PAYMENT_STATUS_FILTER'; payload: ExtendedPaymentStatus | 'all' }
  | { type: 'SET_DATE_FILTER'; payload: DateRange | null }
  | { type: 'CLEAR_FILTERS' }

  // UI State
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_ORDER_ID'; payload: string | null }

  // Modal State
  | { type: 'OPEN_MODIFIER_MODAL' }
  | { type: 'CLOSE_MODIFIER_MODAL' }
  | { type: 'OPEN_COMBO_MODAL' }
  | { type: 'CLOSE_COMBO_MODAL' }
  | { type: 'OPEN_SEND_TO_KITCHEN_MODAL' }
  | { type: 'CLOSE_SEND_TO_KITCHEN_MODAL' }

  // Sync State
  | { type: 'SET_LAST_SYNCED'; payload: string | null }
  | { type: 'SET_PENDING_SYNC_COUNT'; payload: number }

  // Draft Operations
  | { type: 'SET_CURRENT_DRAFT'; payload: OrderDraft | null }
  | { type: 'SAVE_DRAFT' };

// ============== HELPER FUNCTIONS ==============

/**
 * Calculate cart totals from items
 */
function calculateCartTotals(
  items: ExtendedOrderItem[],
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

/**
 * Filter orders based on criteria
 */
function filterOrders(
  orders: ExtendedOrder[],
  searchQuery: string,
  statusFilter: ExtendedOrderStatus | 'all',
  paymentStatusFilter: ExtendedPaymentStatus | 'all',
  dateFilter: DateRange | null
): ExtendedOrder[] {
  return orders.filter((order) => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all' && order.paymentStatus !== paymentStatusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter) {
      const orderDate = new Date(order.createdAt).getTime();
      const start = new Date(dateFilter.startDate).getTime();
      const end = new Date(dateFilter.endDate).getTime();
      if (orderDate < start || orderDate > end) {
        return false;
      }
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
      const matchesTable = order.tableName.toLowerCase().includes(query);
      const matchesItems = order.items.some((item) =>
        item.name.toLowerCase().includes(query)
      );
      if (!matchesOrderNumber && !matchesTable && !matchesItems) {
        return false;
      }
    }

    return true;
  });
}

// ============== REDUCER ==============

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    // Initialization
    case 'INITIALIZE_STATE':
      return {
        ...state,
        ...action.payload,
      };

    case 'RESET_STATE':
      return { ...initialOrderState };

    // Order Session
    case 'CREATE_ORDER': {
      const { table, guestCount = 1 } = action.payload;
      const now = new Date().toISOString();

      const newOrder: ExtendedOrder = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: '', // Will be generated on submit
        restaurantId: table.restaurant_id,
        tableId: table.id,
        tableName: table.table_number,
        guestCount,
        createdBy: 'current_user', // TODO: Get from auth
        createdByName: 'Current User',
        items: [],
        subtotal: 0,
        taxRate: state.cartTaxRate,
        taxAmount: 0,
        discountAmount: 0,
        tipAmount: 0,
        totalAmount: 0,
        status: 'draft',
        paymentStatus: 'pending',
        createdAt: now,
        updatedAt: now,
        kitchenTicketIds: [],
        pendingSync: true,
        created_at: now,
        updated_at: now,
      };

      return {
        ...state,
        currentOrder: newOrder,
        selectedTable: table,
        cart: [],
        cartSubtotal: 0,
        cartTaxAmount: 0,
        cartTotal: 0,
        cartItemCount: 0,
        error: null,
      };
    }

    case 'SET_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: action.payload,
        cart: action.payload.items,
        ...calculateCartTotals(
          action.payload.items,
          state.cartTaxRate,
          state.cartDiscountAmount
        ),
      };

    case 'CLEAR_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: null,
        currentDraft: null,
        selectedTable: null,
        cart: [],
        cartSubtotal: 0,
        cartTaxAmount: 0,
        cartTotal: 0,
        cartItemCount: 0,
        cartDiscountAmount: 0,
      };

    case 'SET_SELECTED_TABLE':
      return {
        ...state,
        selectedTable: action.payload,
      };

    // Cart Operations
    case 'ADD_TO_CART': {
      const newCart = [...state.cart, action.payload];
      const totals = calculateCartTotals(
        newCart,
        state.cartTaxRate,
        state.cartDiscountAmount
      );

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
      const totals = calculateCartTotals(
        newCart,
        state.cartTaxRate,
        state.cartDiscountAmount
      );

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

      const totals = calculateCartTotals(
        newCart,
        state.cartTaxRate,
        state.cartDiscountAmount
      );

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
      const totals = calculateCartTotals(
        newCart,
        state.cartTaxRate,
        state.cartDiscountAmount
      );

      return {
        ...state,
        cart: newCart,
        cartSubtotal: totals.subtotal,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
        cartItemCount: totals.itemCount,
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        cart: [],
        cartSubtotal: 0,
        cartTaxAmount: 0,
        cartTotal: 0,
        cartItemCount: 0,
        cartDiscountAmount: 0,
      };
    }

    case 'SET_CART_TAX_RATE': {
      const totals = calculateCartTotals(
        state.cart,
        action.payload,
        state.cartDiscountAmount
      );

      return {
        ...state,
        cartTaxRate: action.payload,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
      };
    }

    case 'SET_CART_DISCOUNT': {
      const totals = calculateCartTotals(
        state.cart,
        state.cartTaxRate,
        action.payload
      );

      return {
        ...state,
        cartDiscountAmount: action.payload,
        cartTaxAmount: totals.taxAmount,
        cartTotal: totals.total,
      };
    }

    // Orders
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload,
      };

    case 'SET_ACTIVE_ORDERS':
      return {
        ...state,
        activeOrders: action.payload,
      };

    case 'SET_ORDER_HISTORY':
      return {
        ...state,
        orderHistory: action.payload,
      };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        activeOrders: action.payload.status !== 'paid' && action.payload.status !== 'cancelled'
          ? [action.payload, ...state.activeOrders]
          : state.activeOrders,
      };

    case 'UPDATE_ORDER': {
      const updateOrderInList = (orders: ExtendedOrder[]) =>
        orders.map((o) => (o.id === action.payload.id ? action.payload : o));

      return {
        ...state,
        orders: updateOrderInList(state.orders),
        activeOrders: updateOrderInList(state.activeOrders),
        orderHistory: updateOrderInList(state.orderHistory),
        currentOrder:
          state.currentOrder?.id === action.payload.id
            ? action.payload
            : state.currentOrder,
      };
    }

    case 'REMOVE_ORDER': {
      const removeOrderFromList = (orders: ExtendedOrder[]) =>
        orders.filter((o) => o.id !== action.payload);

      return {
        ...state,
        orders: removeOrderFromList(state.orders),
        activeOrders: removeOrderFromList(state.activeOrders),
        orderHistory: removeOrderFromList(state.orderHistory),
        currentOrder:
          state.currentOrder?.id === action.payload ? null : state.currentOrder,
      };
    }

    // Order Status
    case 'UPDATE_ORDER_STATUS': {
      const updateStatus = (orders: ExtendedOrder[]) =>
        orders.map((o) =>
          o.id === action.payload.orderId
            ? { ...o, status: action.payload.status, updatedAt: new Date().toISOString() }
            : o
        );

      return {
        ...state,
        orders: updateStatus(state.orders),
        activeOrders: updateStatus(state.activeOrders),
        orderHistory: updateStatus(state.orderHistory),
        currentOrder:
          state.currentOrder?.id === action.payload.orderId
            ? { ...state.currentOrder, status: action.payload.status }
            : state.currentOrder,
      };
    }

    case 'UPDATE_PAYMENT_STATUS': {
      const updatePaymentStatus = (orders: ExtendedOrder[]) =>
        orders.map((o) =>
          o.id === action.payload.orderId
            ? { ...o, paymentStatus: action.payload.status, updatedAt: new Date().toISOString() }
            : o
        );

      return {
        ...state,
        orders: updatePaymentStatus(state.orders),
        activeOrders: updatePaymentStatus(state.activeOrders),
        orderHistory: updatePaymentStatus(state.orderHistory),
      };
    }

    // Item Status
    case 'UPDATE_ITEM_STATUS': {
      const updateItemStatus = (orders: ExtendedOrder[]) =>
        orders.map((o) => {
          if (o.id !== action.payload.orderId) return o;
          return {
            ...o,
            items: o.items.map((item) =>
              item.id === action.payload.itemId
                ? { ...item, status: action.payload.status as any }
                : item
            ),
          };
        });

      return {
        ...state,
        orders: updateItemStatus(state.orders),
        activeOrders: updateItemStatus(state.activeOrders),
      };
    }

    // Kitchen Tickets
    case 'SET_KITCHEN_TICKETS':
      return {
        ...state,
        kitchenTickets: action.payload,
      };

    case 'ADD_KITCHEN_TICKETS':
      return {
        ...state,
        kitchenTickets: [...state.kitchenTickets, ...action.payload],
      };

    case 'UPDATE_KITCHEN_TICKET':
      return {
        ...state,
        kitchenTickets: state.kitchenTickets.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'REMOVE_KITCHEN_TICKET':
      return {
        ...state,
        kitchenTickets: state.kitchenTickets.filter((t) => t.id !== action.payload),
      };

    // Filters & Search
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

    // UI State
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

    case 'SET_SYNCING':
      return {
        ...state,
        isSyncing: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSubmitting: false,
      };

    case 'SET_SELECTED_ORDER_ID':
      return {
        ...state,
        selectedOrderId: action.payload,
      };

    // Modal State
    case 'OPEN_MODIFIER_MODAL':
      return { ...state, isModifierModalOpen: true };

    case 'CLOSE_MODIFIER_MODAL':
      return { ...state, isModifierModalOpen: false };

    case 'OPEN_COMBO_MODAL':
      return { ...state, isComboModalOpen: true };

    case 'CLOSE_COMBO_MODAL':
      return { ...state, isComboModalOpen: false };

    case 'OPEN_SEND_TO_KITCHEN_MODAL':
      return { ...state, isSendToKitchenModalOpen: true };

    case 'CLOSE_SEND_TO_KITCHEN_MODAL':
      return { ...state, isSendToKitchenModalOpen: false };

    // Sync State
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

    // Draft Operations
    case 'SET_CURRENT_DRAFT':
      return {
        ...state,
        currentDraft: action.payload,
      };

    case 'SAVE_DRAFT': {
      if (!state.selectedTable || state.cart.length === 0) {
        return state;
      }

      const now = new Date().toISOString();
      const totals = calculateCartTotals(
        state.cart,
        state.cartTaxRate,
        state.cartDiscountAmount
      );

      const draft: OrderDraft = {
        id: state.currentDraft?.id || `draft_${Date.now()}`,
        tableId: state.selectedTable.id,
        tableName: state.selectedTable.table_number,
        guestCount: state.currentOrder?.guestCount || 1,
        items: state.cart,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.total,
        specialInstructions: state.currentOrder?.specialInstructions,
        createdAt: state.currentDraft?.createdAt || now,
        updatedAt: now,
      };

      return {
        ...state,
        currentDraft: draft,
      };
    }

    default:
      return state;
  }
}
