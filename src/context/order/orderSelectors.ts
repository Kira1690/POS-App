/**
 * Order Selectors - Pure selector functions for Order Context
 * Provides efficient data access with computed values
 * NOTE: These are PURE FUNCTIONS - memoization happens at the context level
 */

import { OrderState } from './orderReducer';
import {
  ExtendedOrder,
  ExtendedOrderItem,
  ExtendedOrderStatus,
  KitchenStation,
} from '@/types/order-extended.types';
import { KitchenTicket, TicketStatus } from '@/types/kitchen-ticket.types';

// ============== CART SELECTORS ==============

/**
 * Select cart items grouped by category
 */
export const selectCartByCategory = (state: OrderState): Map<string, ExtendedOrderItem[]> => {
  const grouped = new Map<string, ExtendedOrderItem[]>();
  const cart = state.cart || [];

  for (const item of cart) {
    const category = item.category || 'Other';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(item);
  }

  return grouped;
};

/**
 * Select cart summary
 */
export const selectCartSummary = (state: OrderState) => {
  const cart = state.cart || [];
  return {
    itemCount: state.cartItemCount || 0,
    subtotal: state.cartSubtotal || 0,
    taxRate: state.cartTaxRate || 0,
    taxAmount: state.cartTaxAmount || 0,
    discountAmount: state.cartDiscountAmount || 0,
    total: state.cartTotal || 0,
    isEmpty: cart.length === 0,
  };
};

/**
 * Select cart items with allergen warnings
 */
export const selectCartAllergenItems = (state: OrderState): ExtendedOrderItem[] => {
  const cart = state.cart || [];
  return cart.filter((item) => item.hasAllergenWarning);
};

/**
 * Select cart items grouped by kitchen station
 */
export const selectCartByStation = (state: OrderState): Map<KitchenStation, ExtendedOrderItem[]> => {
  const grouped = new Map<KitchenStation, ExtendedOrderItem[]>();
  const cart = state.cart || [];

  for (const item of cart) {
    const station = item.kitchenStation;
    if (!grouped.has(station)) {
      grouped.set(station, []);
    }
    grouped.get(station)!.push(item);
  }

  return grouped;
};

/**
 * Check if cart has combo items
 */
export const selectHasComboItems = (state: OrderState): boolean => {
  const cart = state.cart || [];
  return cart.some((item) => item.isComboItem);
};

// ============== ORDER SELECTORS ==============

/**
 * Select filtered orders based on current filters
 */
export const selectFilteredOrders = (state: OrderState): ExtendedOrder[] => {
  let orders = state.orders || [];

  // Status filter
  if (state.statusFilter && state.statusFilter !== 'all') {
    orders = orders.filter((o) => o.status === state.statusFilter);
  }

  // Payment status filter
  if (state.paymentStatusFilter && state.paymentStatusFilter !== 'all') {
    orders = orders.filter((o) => o.paymentStatus === state.paymentStatusFilter);
  }

  // Date filter
  if (state.dateFilter) {
    const start = new Date(state.dateFilter.startDate).getTime();
    const end = new Date(state.dateFilter.endDate).getTime();
    orders = orders.filter((o) => {
      const date = new Date(o.createdAt).getTime();
      return date >= start && date <= end;
    });
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

  // Sort by creation date (newest first)
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Select order by ID
 */
export const selectOrderById = (state: OrderState, orderId: string): ExtendedOrder | null => {
  const orders = state.orders || [];
  return orders.find((o) => o.id === orderId) || null;
};

/**
 * Select orders by table
 */
export const selectOrdersByTable = (state: OrderState, tableId: string): ExtendedOrder[] => {
  const orders = state.orders || [];
  return orders.filter((o) => o.tableId === tableId);
};

/**
 * Select active order for table
 */
export const selectActiveOrderForTable = (state: OrderState, tableId: string): ExtendedOrder | null => {
  const activeOrders = state.activeOrders || [];
  return activeOrders.find(
    (o) => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled'
  ) || null;
};

/**
 * Select order statistics
 */
export const selectOrderStats = (state: OrderState) => {
  const orders = state.orders || [];
  const activeOrders = state.activeOrders || [];

  const total = orders.length;
  const active = activeOrders.length;
  const pending = activeOrders.filter((o) => o.status === 'draft' || o.status === 'confirmed').length;
  const preparing = activeOrders.filter((o) => o.status === 'preparing').length;
  const ready = activeOrders.filter((o) => o.status === 'ready').length;
  const served = activeOrders.filter((o) => o.status === 'served').length;
  const paid = orders.filter((o) => o.status === 'paid').length;
  const cancelled = orders.filter((o) => o.status === 'cancelled').length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const averageOrderValue = paid > 0 ? totalRevenue / paid : 0;

  return {
    total,
    active,
    pending,
    preparing,
    ready,
    served,
    paid,
    cancelled,
    totalRevenue,
    averageOrderValue,
  };
};

/**
 * Select orders grouped by status
 */
export const selectOrdersByStatus = (state: OrderState): Map<ExtendedOrderStatus, ExtendedOrder[]> => {
  const orders = state.orders || [];
  const grouped = new Map<ExtendedOrderStatus, ExtendedOrder[]>();
  const statuses: ExtendedOrderStatus[] = [
    'draft',
    'confirmed',
    'preparing',
    'ready',
    'served',
    'paid',
    'cancelled',
  ];

  for (const status of statuses) {
    grouped.set(status, []);
  }

  for (const order of orders) {
    const statusGroup = grouped.get(order.status);
    if (statusGroup) {
      statusGroup.push(order);
    }
  }

  return grouped;
};

// ============== KITCHEN TICKET SELECTORS ==============

/**
 * Select tickets by station
 */
export const selectTicketsByStation = (state: OrderState): Map<KitchenStation, KitchenTicket[]> => {
  const tickets = state.kitchenTickets || [];
  const grouped = new Map<KitchenStation, KitchenTicket[]>();
  const stations: KitchenStation[] = [
    'hot_kitchen',
    'cold_kitchen',
    'grill',
    'desserts',
    'beverages',
    'bar',
  ];

  for (const station of stations) {
    grouped.set(station, []);
  }

  for (const ticket of tickets) {
    const stationGroup = grouped.get(ticket.station);
    if (stationGroup) {
      stationGroup.push(ticket);
    }
  }

  return grouped;
};

/**
 * Select tickets by status
 */
export const selectTicketsByStatus = (state: OrderState): Map<TicketStatus, KitchenTicket[]> => {
  const tickets = state.kitchenTickets || [];
  const grouped = new Map<TicketStatus, KitchenTicket[]>();
  const statuses: TicketStatus[] = ['pending', 'preparing', 'ready', 'served', 'cancelled'];

  for (const status of statuses) {
    grouped.set(status, []);
  }

  for (const ticket of tickets) {
    const statusGroup = grouped.get(ticket.status);
    if (statusGroup) {
      statusGroup.push(ticket);
    }
  }

  return grouped;
};

/**
 * Select tickets for an order
 */
export const selectTicketsForOrder = (state: OrderState, orderId: string): KitchenTicket[] => {
  const tickets = state.kitchenTickets || [];
  return tickets.filter((t) => t.orderId === orderId);
};

/**
 * Select kitchen stats
 */
export const selectKitchenStats = (state: OrderState) => {
  const tickets = state.kitchenTickets || [];
  const pending = tickets.filter((t) => t.status === 'pending').length;
  const preparing = tickets.filter((t) => t.status === 'preparing').length;
  const ready = tickets.filter((t) => t.status === 'ready').length;
  const overdue = tickets.filter((t) => t.isOverdue).length;
  const hasAllergens = tickets.filter((t) => t.hasAllergens).length;

  // Calculate average prep time from completed tickets
  const completedTickets = tickets.filter(
    (t) => t.status === 'ready' || t.status === 'served'
  );
  const avgPrepTime =
    completedTickets.length > 0
      ? completedTickets.reduce((sum, t) => sum + (t.actualPrepTime || 0), 0) /
        completedTickets.length
      : 0;

  return {
    total: tickets.length,
    pending,
    preparing,
    ready,
    overdue,
    hasAllergens,
    avgPrepTime,
  };
};

/**
 * Select overdue tickets
 */
export const selectOverdueTickets = (state: OrderState): KitchenTicket[] => {
  const tickets = state.kitchenTickets || [];
  return tickets.filter((t) => t.isOverdue);
};

/**
 * Select tickets with allergen warnings
 */
export const selectAllergenTickets = (state: OrderState): KitchenTicket[] => {
  const tickets = state.kitchenTickets || [];
  return tickets.filter((t) => t.hasAllergens);
};

// ============== UI STATE SELECTORS ==============

/**
 * Select selected order
 */
export const selectSelectedOrder = (state: OrderState): ExtendedOrder | null => {
  const orders = state.orders || [];
  if (!state.selectedOrderId) return null;
  return orders.find((o) => o.id === state.selectedOrderId) || null;
};

/**
 * Select loading states
 */
export const selectLoadingStates = (state: OrderState) => {
  return {
    isLoading: state.isLoading || false,
    isSubmitting: state.isSubmitting || false,
    isSyncing: state.isSyncing || false,
  };
};

/**
 * Select sync status
 */
export const selectSyncStatus = (state: OrderState) => {
  return {
    lastSynced: state.lastSynced || null,
    pendingSyncCount: state.pendingSyncCount || 0,
    isSyncing: state.isSyncing || false,
    needsSync: (state.pendingSyncCount || 0) > 0,
  };
};

// ============== PARAMETERIZED SELECTORS ==============
// These are functions that return selector functions for specific IDs

/**
 * Get cart item by ID
 */
export const getCartItemById = (state: OrderState, itemId: string): ExtendedOrderItem | null => {
  const cart = state.cart || [];
  return cart.find((item) => item.id === itemId) || null;
};

/**
 * Check if table has active order
 */
export const getTableHasActiveOrder = (state: OrderState, tableId: string): boolean => {
  const activeOrders = state.activeOrders || [];
  return activeOrders.some(
    (o) => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled'
  );
};

/**
 * Get estimated wait time for an order
 */
export const getEstimatedWaitTime = (state: OrderState, orderId: string): number => {
  const tickets = state.kitchenTickets || [];
  const orderTickets = tickets.filter((t) => t.orderId === orderId);
  if (orderTickets.length === 0) return 0;

  // Return max estimated prep time among all tickets
  return Math.max(...orderTickets.map((t) => t.estimatedPrepTime || 0));
};

// ============== FACTORY FUNCTION ==============

/**
 * Create all selectors bound to current state
 * NOTE: This is called from useMemo in the context provider, not inside other hooks
 */
export const createOrderSelectors = (state: OrderState) => ({
  // Cart
  cartByCategory: selectCartByCategory(state),
  cartSummary: selectCartSummary(state),
  cartAllergenItems: selectCartAllergenItems(state),
  cartByStation: selectCartByStation(state),
  hasComboItems: selectHasComboItems(state),

  // Orders
  filteredOrders: selectFilteredOrders(state),
  orderStats: selectOrderStats(state),
  ordersByStatus: selectOrdersByStatus(state),

  // Kitchen
  ticketsByStation: selectTicketsByStation(state),
  ticketsByStatus: selectTicketsByStatus(state),
  kitchenStats: selectKitchenStats(state),
  overdueTickets: selectOverdueTickets(state),
  allergenTickets: selectAllergenTickets(state),

  // UI
  selectedOrder: selectSelectedOrder(state),
  loadingStates: selectLoadingStates(state),
  syncStatus: selectSyncStatus(state),
});

export type OrderSelectors = ReturnType<typeof createOrderSelectors>;
