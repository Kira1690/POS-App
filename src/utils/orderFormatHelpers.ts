/**
 * Order Format Helpers
 * Utilities to handle both UnifiedOrder (camelCase) and legacy Order (snake_case) formats
 *
 * This allows components to work with either format during the migration period
 */

import { Order, OrderItem } from '@/types/order.types';
import { UnifiedOrder, UnifiedOrderItem } from '@/types/unified-order.types';

// Support both unified and legacy order types
export type AnyOrder = Order | UnifiedOrder;
export type AnyOrderItem = OrderItem | UnifiedOrderItem;

/**
 * Get order number from either format
 */
export const getOrderNumber = (order: AnyOrder): string => {
  // Unified format: orderNumber
  if ('orderNumber' in order && order.orderNumber) {
    return order.orderNumber;
  }
  // Legacy format: order_number
  if ('order_number' in order && order.order_number) {
    return order.order_number;
  }
  return 'Unknown';
};

/**
 * Get table ID from either format
 */
export const getTableId = (order: AnyOrder): string | undefined => {
  if ('tableId' in order) return order.tableId;
  if ('table_id' in order) return order.table_id;
  return undefined;
};

/**
 * Get table name from either format
 */
export const getTableName = (order: AnyOrder): string => {
  if ('tableName' in order && order.tableName) return order.tableName;
  if ('table_number' in order && order.table_number) return order.table_number;
  // Fall back to table ID
  return getTableId(order) || 'Takeaway';
};

/**
 * Get created at timestamp from either format
 */
export const getCreatedAt = (order: AnyOrder): string => {
  if ('createdAt' in order && order.createdAt) return order.createdAt;
  if ('created_at' in order && order.created_at) return order.created_at;
  return new Date().toISOString();
};

/**
 * Get updated at timestamp from either format
 */
export const getUpdatedAt = (order: AnyOrder): string | undefined => {
  if ('updatedAt' in order) return order.updatedAt;
  if ('updated_at' in order) return order.updated_at;
  return undefined;
};

/**
 * Get order totals from either format
 */
export const getOrderTotals = (order: AnyOrder) => {
  return {
    subtotal: (order as any).subtotal ?? 0,
    taxAmount: (order as UnifiedOrder).taxAmount ?? (order as Order).tax_amount ?? 0,
    discountAmount: (order as UnifiedOrder).discountAmount ?? (order as Order).discount_amount ?? 0,
    totalAmount: (order as UnifiedOrder).totalAmount ?? (order as Order).total_amount ?? 0,
    tipAmount: (order as UnifiedOrder).tipAmount ?? 0,
  };
};

/**
 * Get special instructions from either format
 */
export const getSpecialInstructions = (order: AnyOrder): string | undefined => {
  if ('specialInstructions' in order) return order.specialInstructions;
  if ('special_instructions' in order) return order.special_instructions;
  return undefined;
};

/**
 * Get item name from either format
 */
export const getItemName = (item: AnyOrderItem): string => {
  // Unified format: item.name
  if ('name' in item && typeof item.name === 'string') {
    return item.name;
  }
  // Legacy format: item.menu_item.name
  if ('menu_item' in item && item.menu_item?.name) {
    return item.menu_item.name;
  }
  return 'Unknown Item';
};

/**
 * Get item price from either format
 */
export const getItemPrice = (item: AnyOrderItem): number => {
  // Unified format: itemTotal
  if ('itemTotal' in item) {
    return item.itemTotal;
  }
  // Legacy format: total_price
  if ('total_price' in item) {
    return item.total_price;
  }
  return 0;
};

/**
 * Get item base price from either format
 */
export const getItemBasePrice = (item: AnyOrderItem): number => {
  if ('basePrice' in item) return item.basePrice;
  if ('unit_price' in item) return item.unit_price;
  return 0;
};

/**
 * Get item special instructions from either format
 */
export const getItemSpecialInstructions = (item: AnyOrderItem): string | undefined => {
  if ('specialInstructions' in item) return item.specialInstructions;
  if ('special_instructions' in item) return item.special_instructions;
  return undefined;
};

/**
 * Get item status from either format
 */
export const getItemStatus = (item: AnyOrderItem): string => {
  if ('itemStatus' in item) return item.itemStatus;
  if ('status' in item) return item.status;
  return 'pending';
};

/**
 * Get order status - works for both formats (both use 'status')
 */
export const getOrderStatus = (order: AnyOrder): string => {
  return order.status;
};

/**
 * Get payment status from either format
 */
export const getPaymentStatus = (order: AnyOrder): string | undefined => {
  if ('paymentStatus' in order) return order.paymentStatus;
  if ('payment_status' in order) return order.payment_status;
  return undefined;
};

/**
 * Get order lifecycle timestamps from either format
 */
export const getOrderTimestamps = (order: AnyOrder) => {
  return {
    createdAt: getCreatedAt(order),
    updatedAt: getUpdatedAt(order),
    submittedAt: (order as UnifiedOrder).submittedAt ?? (order as Order).submitted_at,
    preparingAt: (order as UnifiedOrder).preparingAt ?? (order as Order).preparing_at,
    readyAt: (order as UnifiedOrder).readyAt ?? (order as Order).ready_at,
    servedAt: (order as UnifiedOrder).servedAt ?? (order as Order).served_at,
    paidAt: (order as UnifiedOrder).paidAt ?? (order as Order).paid_at,
  };
};

/**
 * Get guest count from either format
 */
export const getGuestCount = (order: AnyOrder): number => {
  if ('guestCount' in order && typeof order.guestCount === 'number') return order.guestCount;
  if ('guest_count' in order && typeof (order as any).guest_count === 'number') return (order as any).guest_count;
  return 1;
};

/**
 * Check if order is in an active state (not paid/cancelled)
 */
export const isActiveOrderAny = (order: AnyOrder): boolean => {
  const status = getOrderStatus(order);
  return !['paid', 'cancelled'].includes(status);
};

/**
 * Check if order can accept payment (status is 'served')
 */
export const canAcceptPaymentAny = (order: AnyOrder): boolean => {
  const status = getOrderStatus(order);
  return status === 'served';
};
