/**
 * Order Context Selectors - Performance-optimized order state subscriptions  
 * Prevents unnecessary re-renders by allowing components to subscribe only to
 * specific parts of order state they actually need
 */

import { useMemo } from 'react';
import { useContextSelector, deepEqual, shallowEqual } from './useContextSelector';
import { OrderContext } from '@/context/order/OrderContext';
import { Order, OrderItem } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';

/**
 * Select only the current/selected order
 * Components using this won't re-render when other orders change
 */
export const useCurrentOrder = () => {
  return useContextSelector(
    OrderContext,
    state => state.currentOrder,
    (a, b) => a?.id === b?.id && a?.status === b?.status && a?.total_amount === b?.total_amount
  );
};

/**
 * Select only cart items from current order
 * Useful for cart displays that don't need full order details
 */
export const useCartItems = () => {
  return useContextSelector(
    OrderContext,
    state => state.cart?.items || [],
    (a, b) => a.length === b.length && a.every((item, i) => 
      item.id === b[i]?.id && 
      item.quantity === b[i]?.quantity &&
      item.total_price === b[i]?.total_price
    )
  );
};

/**
 * Select only cart totals
 * Won't re-render when individual items change, only when totals change
 */
export const useCartTotals = () => {
  return useContextSelector(
    OrderContext,
    state => ({
      subtotal: state.cart?.subtotal || 0,
      tax: state.cart?.tax || 0,
      total: state.cart?.total || 0,
      itemCount: state.cart?.items?.length || 0,
      totalQuantity: state.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    }),
    shallowEqual
  );
};

/**
 * Select order history only
 * Won't re-render when current order/cart changes
 */
export const useOrderHistory = () => {
  return useContextSelector(
    OrderContext,
    state => state.orderHistory,
    deepEqual
  );
};

/**
 * Select orders by specific status
 * Only re-renders when orders with that status change
 */
export const useOrdersByStatus = (status: OrderStatus) => {
  return useContextSelector(
    OrderContext,
    state => state.orderHistory.filter(order => order.status === status),
    (a, b) => a.length === b.length && a.every((order, i) => 
      order.id === b[i]?.id && order.status === b[i]?.status
    )
  );
};

/**
 * Select orders for specific table
 * Useful for table-specific order displays
 */
export const useOrdersForTable = (tableId: string) => {
  return useContextSelector(
    OrderContext,
    state => state.orderHistory.filter(order => order.table_id === tableId),
    (a, b) => a.length === b.length && a.every((order, i) => order.id === b[i]?.id)
  );
};

/**
 * Select loading and error states only
 * Won't re-render when order data changes, only on loading/error changes
 */
export const useOrderLoadingState = () => {
  return useContextSelector(
    OrderContext,
    state => ({
      isLoading: state.isLoading,
      isSubmitting: state.isSubmitting,
      error: state.error,
    }),
    shallowEqual
  );
};

/**
 * Select order actions only
 * Actions don't change, so this won't cause re-renders
 */
export const useOrderActions = () => {
  return useContextSelector(
    OrderContext,
    state => ({
      createOrder: state.createOrder,
      updateOrder: state.updateOrder,
      addItemToCart: state.addItemToCart,
      updateCartItem: state.updateCartItem,
      removeFromCart: state.removeFromCart,
      clearCart: state.clearCart,
      submitOrder: state.submitOrder,
      cancelOrder: state.cancelOrder,
    }),
    () => true // Actions never change, so always equal
  );
};

/**
 * Select kitchen orders only (preparing, ready)
 * Useful for kitchen display screens
 */
export const useKitchenOrders = () => {
  return useContextSelector(
    OrderContext,
    state => state.orderHistory.filter(order => 
      order.status === OrderStatus.PREPARING || order.status === OrderStatus.READY
    ),
    (a, b) => a.length === b.length && a.every((order, i) => 
      order.id === b[i]?.id && order.status === b[i]?.status
    )
  );
};

/**
 * Select specific order by ID
 * Only re-renders when that specific order changes
 */
export const useOrderById = (orderId: string | null) => {
  return useContextSelector(
    OrderContext,
    state => orderId ? 
      (state.currentOrder?.id === orderId ? state.currentOrder : 
       state.orderHistory.find(order => order.id === orderId)) : null,
    (a, b) => a?.id === b?.id && a?.status === b?.status && a?.updated_at === b?.updated_at
  );
};

/**
 * Select order statistics
 * Aggregated data that changes less frequently
 */
export const useOrderStats = () => {
  return useContextSelector(
    OrderContext,
    state => {
      const orders = state.orderHistory;
      const today = new Date().toDateString();
      
      const todayOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
      
      return {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        pendingOrders: orders.filter(o => o.status === OrderStatus.PENDING).length,
        preparingOrders: orders.filter(o => o.status === OrderStatus.PREPARING).length,
        readyOrders: orders.filter(o => o.status === OrderStatus.READY).length,
        completedOrders: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
        todayRevenue: todayOrders.reduce((sum, order) => sum + order.total_amount, 0),
      };
    },
    shallowEqual
  );
};

/**
 * Check if cart is empty
 * Simple boolean selector for cart state
 */
export const useIsCartEmpty = () => {
  return useContextSelector(
    OrderContext,
    state => !state.cart?.items || state.cart.items.length === 0
  );
};

/**
 * Check if there's an active order
 * Simple boolean selector for order state  
 */
export const useHasActiveOrder = () => {
  return useContextSelector(
    OrderContext,
    state => !!state.currentOrder
  );
};

/**
 * Custom hook for order workflow state
 * Combines multiple selectors for order management workflows
 */
export const useOrderWorkflowState = () => {
  const currentOrder = useCurrentOrder();
  const cartTotals = useCartTotals();
  const loadingState = useOrderLoadingState();
  const isCartEmpty = useIsCartEmpty();
  
  return useMemo(() => ({
    currentOrder,
    cartTotals,
    isLoading: loadingState.isLoading,
    isSubmitting: loadingState.isSubmitting,
    error: loadingState.error,
    canSubmit: !isCartEmpty && !loadingState.isSubmitting && cartTotals.total > 0,
    hasActiveOrder: !!currentOrder,
  }), [currentOrder, cartTotals, loadingState, isCartEmpty]);
};