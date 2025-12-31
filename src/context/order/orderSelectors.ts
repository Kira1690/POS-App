/**
 * Order Selectors - Memoized selectors for Order Context
 * Provides efficient data access with computed values
 */

import { useMemo } from 'react';
import { OrderState } from './orderReducer';
import {
  ExtendedOrder,
  ExtendedOrderItem,
  ExtendedOrderStatus,
  ExtendedPaymentStatus,
  KitchenStation,
} from '@/types/order-extended.types';
import { KitchenTicket, TicketStatus } from '@/types/kitchen-ticket.types';

// ============== CART SELECTORS ==============

/**
 * Select cart items grouped by category
 */
export const selectCartByCategory = (state: OrderState) => {
  return useMemo(() => {
    const grouped = new Map<string, ExtendedOrderItem[]>();

    for (const item of state.cart) {
      const category = item.category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    }

    return grouped;
  }, [state.cart]);
};

/**
 * Select cart summary
 */
export const selectCartSummary = (state: OrderState) => {
  return useMemo(
    () => ({
      itemCount: state.cartItemCount,
      subtotal: state.cartSubtotal,
      taxRate: state.cartTaxRate,
      taxAmount: state.cartTaxAmount,
      discountAmount: state.cartDiscountAmount,
      total: state.cartTotal,
      isEmpty: state.cart.length === 0,
    }),
    [
      state.cartItemCount,
      state.cartSubtotal,
      state.cartTaxRate,
      state.cartTaxAmount,
      state.cartDiscountAmount,
      state.cartTotal,
      state.cart.length,
    ]
  );
};

/**
 * Select cart items with allergen warnings
 */
export const selectCartAllergenItems = (state: OrderState) => {
  return useMemo(
    () => state.cart.filter((item) => item.hasAllergenWarning),
    [state.cart]
  );
};

/**
 * Select cart items grouped by kitchen station
 */
export const selectCartByStation = (state: OrderState) => {
  return useMemo(() => {
    const grouped = new Map<KitchenStation, ExtendedOrderItem[]>();

    for (const item of state.cart) {
      const station = item.kitchenStation;
      if (!grouped.has(station)) {
        grouped.set(station, []);
      }
      grouped.get(station)!.push(item);
    }

    return grouped;
  }, [state.cart]);
};

/**
 * Check if cart has combo items
 */
export const selectHasComboItems = (state: OrderState) => {
  return useMemo(
    () => state.cart.some((item) => item.isComboItem),
    [state.cart]
  );
};

// ============== ORDER SELECTORS ==============

/**
 * Select filtered orders based on current filters
 */
export const selectFilteredOrders = (state: OrderState) => {
  return useMemo(() => {
    let orders = state.orders;

    // Status filter
    if (state.statusFilter !== 'all') {
      orders = orders.filter((o) => o.status === state.statusFilter);
    }

    // Payment status filter
    if (state.paymentStatusFilter !== 'all') {
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
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [
    state.orders,
    state.statusFilter,
    state.paymentStatusFilter,
    state.dateFilter,
    state.searchQuery,
  ]);
};

/**
 * Select order by ID
 */
export const selectOrderById = (state: OrderState, orderId: string) => {
  return useMemo(
    () => state.orders.find((o) => o.id === orderId) || null,
    [state.orders, orderId]
  );
};

/**
 * Select orders by table
 */
export const selectOrdersByTable = (state: OrderState, tableId: string) => {
  return useMemo(
    () => state.orders.filter((o) => o.tableId === tableId),
    [state.orders, tableId]
  );
};

/**
 * Select active order for table
 */
export const selectActiveOrderForTable = (state: OrderState, tableId: string) => {
  return useMemo(
    () =>
      state.activeOrders.find(
        (o) => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled'
      ) || null,
    [state.activeOrders, tableId]
  );
};

/**
 * Select order statistics
 */
export const selectOrderStats = (state: OrderState) => {
  return useMemo(() => {
    const total = state.orders.length;
    const active = state.activeOrders.length;
    const pending = state.activeOrders.filter((o) => o.status === 'draft' || o.status === 'confirmed').length;
    const preparing = state.activeOrders.filter((o) => o.status === 'preparing').length;
    const ready = state.activeOrders.filter((o) => o.status === 'ready').length;
    const served = state.activeOrders.filter((o) => o.status === 'served').length;
    const paid = state.orders.filter((o) => o.status === 'paid').length;
    const cancelled = state.orders.filter((o) => o.status === 'cancelled').length;

    const totalRevenue = state.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

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
  }, [state.orders, state.activeOrders]);
};

/**
 * Select orders grouped by status
 */
export const selectOrdersByStatus = (state: OrderState) => {
  return useMemo(() => {
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

    for (const order of state.orders) {
      grouped.get(order.status)!.push(order);
    }

    return grouped;
  }, [state.orders]);
};

// ============== KITCHEN TICKET SELECTORS ==============

/**
 * Select tickets by station
 */
export const selectTicketsByStation = (state: OrderState) => {
  return useMemo(() => {
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

    for (const ticket of state.kitchenTickets) {
      grouped.get(ticket.station)!.push(ticket);
    }

    return grouped;
  }, [state.kitchenTickets]);
};

/**
 * Select tickets by status
 */
export const selectTicketsByStatus = (state: OrderState) => {
  return useMemo(() => {
    const grouped = new Map<TicketStatus, KitchenTicket[]>();
    const statuses: TicketStatus[] = ['pending', 'preparing', 'ready', 'served', 'cancelled'];

    for (const status of statuses) {
      grouped.set(status, []);
    }

    for (const ticket of state.kitchenTickets) {
      grouped.get(ticket.status)!.push(ticket);
    }

    return grouped;
  }, [state.kitchenTickets]);
};

/**
 * Select tickets for an order
 */
export const selectTicketsForOrder = (state: OrderState, orderId: string) => {
  return useMemo(
    () => state.kitchenTickets.filter((t) => t.orderId === orderId),
    [state.kitchenTickets, orderId]
  );
};

/**
 * Select kitchen stats
 */
export const selectKitchenStats = (state: OrderState) => {
  return useMemo(() => {
    const tickets = state.kitchenTickets;
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
  }, [state.kitchenTickets]);
};

/**
 * Select overdue tickets
 */
export const selectOverdueTickets = (state: OrderState) => {
  return useMemo(
    () => state.kitchenTickets.filter((t) => t.isOverdue),
    [state.kitchenTickets]
  );
};

/**
 * Select tickets with allergen warnings
 */
export const selectAllergenTickets = (state: OrderState) => {
  return useMemo(
    () => state.kitchenTickets.filter((t) => t.hasAllergens),
    [state.kitchenTickets]
  );
};

// ============== UI STATE SELECTORS ==============

/**
 * Select selected order
 */
export const selectSelectedOrder = (state: OrderState) => {
  return useMemo(
    () =>
      state.selectedOrderId
        ? state.orders.find((o) => o.id === state.selectedOrderId) || null
        : null,
    [state.orders, state.selectedOrderId]
  );
};

/**
 * Select loading states
 */
export const selectLoadingStates = (state: OrderState) => {
  return useMemo(
    () => ({
      isLoading: state.isLoading,
      isSubmitting: state.isSubmitting,
      isSyncing: state.isSyncing,
    }),
    [state.isLoading, state.isSubmitting, state.isSyncing]
  );
};

/**
 * Select sync status
 */
export const selectSyncStatus = (state: OrderState) => {
  return useMemo(
    () => ({
      lastSynced: state.lastSynced,
      pendingSyncCount: state.pendingSyncCount,
      isSyncing: state.isSyncing,
      needsSync: state.pendingSyncCount > 0,
    }),
    [state.lastSynced, state.pendingSyncCount, state.isSyncing]
  );
};

// ============== HELPER HOOKS ==============

/**
 * Hook to get cart item by ID
 */
export const useCartItem = (state: OrderState, itemId: string) => {
  return useMemo(
    () => state.cart.find((item) => item.id === itemId) || null,
    [state.cart, itemId]
  );
};

/**
 * Hook to check if table has active order
 */
export const useTableHasActiveOrder = (state: OrderState, tableId: string) => {
  return useMemo(
    () =>
      state.activeOrders.some(
        (o) => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled'
      ),
    [state.activeOrders, tableId]
  );
};

/**
 * Hook to get estimated wait time for an order
 */
export const useEstimatedWaitTime = (state: OrderState, orderId: string) => {
  return useMemo(() => {
    const tickets = state.kitchenTickets.filter((t) => t.orderId === orderId);
    if (tickets.length === 0) return 0;

    // Return max estimated prep time among all tickets
    return Math.max(...tickets.map((t) => t.estimatedPrepTime));
  }, [state.kitchenTickets, orderId]);
};

// ============== FACTORY FUNCTION ==============

/**
 * Create all selectors bound to current state
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
