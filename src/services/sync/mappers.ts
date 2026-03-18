/**
 * Sync Mappers — shared snake_case → camelCase converters
 * Used by PullSyncService and WebSocketSyncManager
 */

import { UnifiedOrder, UnifiedOrderItem } from '@/types/unified-order.types';
import { KitchenTicket, KitchenStation, TicketStatus, TicketPriority } from '@/types/kitchen-ticket.types';

type ServerOrder = Record<string, unknown>;
type ServerItem = Record<string, unknown>;
type ServerTicket = Record<string, unknown>;

function str(val: unknown): string {
  return val != null ? String(val) : '';
}

function strOrUndef(val: unknown): string | undefined {
  return val != null && val !== '' ? String(val) : undefined;
}

function num(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function parseJson<T>(val: unknown, fallback: T): T {
  if (Array.isArray(val)) return val as unknown as T;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return fallback;
}

function mapServerItemToUnified(item: ServerItem, orderId: string): UnifiedOrderItem {
  return {
    id: str(item['id']),
    orderId,
    menuItemId: str(item['menu_item_id']),
    name: str(item['name']),
    category: strOrUndef(item['category']),
    categoryId: strOrUndef(item['category_id']),
    basePrice: num(item['base_price']),
    quantity: num(item['quantity'], 1),
    modifierTotal: num(item['modifier_total']),
    itemTotal: num(item['item_total']),
    selectedModifiers: parseJson(item['selected_modifiers'], []),
    dietaryTags: parseJson(item['dietary_tags'], []),
    allergens: parseJson(item['allergens'], []),
    hasAllergenWarning: Boolean(item['has_allergen_warning']),
    kitchenStation: strOrUndef(item['kitchen_station']),
    itemStatus: str(item['item_status'] ?? 'pending'),
    specialInstructions: strOrUndef(item['special_instructions']),
    kitchenNotes: strOrUndef(item['kitchen_notes']),
    isComboItem: Boolean(item['is_combo_item']),
    comboId: strOrUndef(item['combo_id']),
    comboName: strOrUndef(item['combo_name']),
    addedAt: str(item['added_at'] ?? item['created_at'] ?? new Date().toISOString()),
    modifiedAt: strOrUndef(item['modified_at']),
  } as UnifiedOrderItem;
}

/**
 * Map a server order (snake_case) to a UnifiedOrder (camelCase).
 * Sets pendingSync=false and syncedAt=now since data came from server.
 */
export function mapServerOrderToUnified(raw: ServerOrder): UnifiedOrder {
  const id = str(raw['id']);
  const rawItems = parseJson<ServerItem[]>(raw['items'] ?? raw['order_items'], []);
  const items = rawItems.map((item) => mapServerItemToUnified(item, id));

  return {
    id,
    orderNumber: str(raw['order_number']),
    restaurantId: str(raw['restaurant_id']),
    tableId: str(raw['table_id']),
    tableName: str(raw['table_name']),
    guestCount: num(raw['guest_count'], 1),
    customerId: strOrUndef(raw['customer_id']),
    createdBy: str(raw['created_by']),
    createdByName: str(raw['created_by_name']),
    servedBy: strOrUndef(raw['served_by']),
    servedByName: strOrUndef(raw['served_by_name']),
    subtotal: num(raw['subtotal']),
    taxRate: num(raw['tax_rate']),
    taxAmount: num(raw['tax_amount']),
    discountType: strOrUndef(raw['discount_type']),
    discountValue: raw['discount_value'] != null ? num(raw['discount_value']) : undefined,
    discountAmount: num(raw['discount_amount']),
    tipAmount: num(raw['tip_amount']),
    totalAmount: num(raw['total_amount']),
    status: str(raw['status'] ?? 'draft') as UnifiedOrder['status'],
    paymentStatus: str(raw['payment_status'] ?? 'pending') as UnifiedOrder['paymentStatus'],
    specialInstructions: strOrUndef(raw['special_instructions']),
    cancellationReason: strOrUndef(raw['cancellation_reason']),
    submittedAt: strOrUndef(raw['submitted_at']),
    paidAt: strOrUndef(raw['paid_at']),
    cancelledAt: strOrUndef(raw['cancelled_at']),
    preparingAt: strOrUndef(raw['preparing_at']),
    readyAt: strOrUndef(raw['ready_at']),
    servedAt: strOrUndef(raw['served_at']),
    estimatedPrepTime: raw['estimated_prep_time'] != null ? num(raw['estimated_prep_time']) : undefined,
    actualPrepTime: raw['actual_prep_time'] != null ? num(raw['actual_prep_time']) : undefined,
    pendingSync: false,
    syncedAt: new Date().toISOString(),
    createdAt: str(raw['created_at'] ?? new Date().toISOString()),
    updatedAt: str(raw['updated_at'] ?? new Date().toISOString()),
    items,
  } as UnifiedOrder;
}

/**
 * Map a server kitchen ticket (snake_case) to a KitchenTicket (camelCase).
 */
export function mapServerTicketToKitchenTicket(raw: ServerTicket): KitchenTicket {
  return {
    id: str(raw['id']),
    orderId: str(raw['order_id']),
    orderNumber: str(raw['order_number']),
    tableId: str(raw['table_id']),
    tableName: str(raw['table_name']),
    station: str(raw['station'] ?? 'hot_kitchen') as KitchenStation,
    items: parseJson(raw['items'], []),
    itemCount: num(raw['item_count']),
    completedItemCount: num(raw['completed_item_count']),
    status: str(raw['status'] ?? 'pending') as TicketStatus,
    priority: str(raw['priority'] ?? 'normal') as TicketPriority,
    hasAllergens: Boolean(raw['has_allergens']),
    allergenItems: parseJson(raw['allergen_items'], []),
    isRush: Boolean(raw['is_rush']),
    isOverdue: Boolean(raw['is_overdue']),
    overdueBy: raw['overdue_by'] != null ? num(raw['overdue_by']) : undefined,
    specialInstructions: strOrUndef(raw['special_instructions']),
    delayReason: strOrUndef(raw['delay_reason']),
    assignedTo: strOrUndef(raw['assigned_to']),
    assignedToName: strOrUndef(raw['assigned_to_name']),
    estimatedPrepTime: num(raw['estimated_prep_time'], 15),
    actualPrepTime: raw['actual_prep_time'] != null ? num(raw['actual_prep_time']) : undefined,
    startedAt: strOrUndef(raw['started_at']),
    completedAt: strOrUndef(raw['completed_at']),
    servedAt: strOrUndef(raw['served_at']),
    pendingSync: false,
    syncedAt: new Date().toISOString(),
    createdAt: str(raw['created_at'] ?? new Date().toISOString()),
    updatedAt: strOrUndef(raw['updated_at']),
  } as KitchenTicket;
}
