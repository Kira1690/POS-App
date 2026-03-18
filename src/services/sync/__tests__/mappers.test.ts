/**
 * Sync Mappers Unit Tests
 * Validates snake_case → camelCase mapping for orders and kitchen tickets
 */

import { mapServerOrderToUnified, mapServerTicketToKitchenTicket } from '../mappers';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SERVER_ORDER_ITEM = {
  id: 'item-001',
  order_id: 'order-001',
  menu_item_id: 'mi-10',
  name: 'Beef Burger',
  category: 'Mains',
  category_id: 'cat-1',
  base_price: 12.99,
  quantity: 2,
  modifier_total: 1.50,
  item_total: 27.48,
  selected_modifiers: JSON.stringify([{ id: 'm1', name: 'Extra Cheese', price_adjustment: 0.75 }]),
  dietary_tags: JSON.stringify(['gluten-free']),
  allergens: JSON.stringify(['dairy']),
  has_allergen_warning: true,
  kitchen_station: 'grill',
  item_status: 'preparing',
  special_instructions: 'No onions',
  kitchen_notes: null,
  is_combo_item: false,
  combo_id: null,
  combo_name: null,
  added_at: '2026-03-18T10:00:00.000Z',
  modified_at: '2026-03-18T10:05:00.000Z',
};

const SERVER_ORDER = {
  id: 'order-001',
  order_number: 'ORD-20260318-0001',
  restaurant_id: '1',
  table_id: 'tbl-1',
  table_name: 'T-1',
  guest_count: 3,
  customer_id: 'cust-1',
  created_by: 'user-1',
  created_by_name: 'Alice Johnson',
  served_by: 'user-2',
  served_by_name: 'Bob Smith',
  subtotal: 27.48,
  tax_rate: 0.1,
  tax_amount: 2.75,
  discount_type: 'percentage',
  discount_value: 10,
  discount_amount: 2.75,
  tip_amount: 3.00,
  total_amount: 30.48,
  status: 'preparing',
  payment_status: 'pending',
  special_instructions: 'Birthday party',
  cancellation_reason: null,
  submitted_at: '2026-03-18T10:00:00.000Z',
  paid_at: null,
  cancelled_at: null,
  preparing_at: '2026-03-18T10:01:00.000Z',
  ready_at: null,
  served_at: null,
  estimated_prep_time: 15,
  actual_prep_time: null,
  pending_sync: 0,
  synced_at: '2026-03-18T10:00:00.000Z',
  created_at: '2026-03-18T09:55:00.000Z',
  updated_at: '2026-03-18T10:01:00.000Z',
  order_items: [SERVER_ORDER_ITEM],
};

const SERVER_TICKET = {
  id: 'ticket-001',
  order_id: 'order-001',
  order_number: 'ORD-20260318-0001',
  table_id: 'tbl-1',
  table_name: 'T-1',
  station: 'grill',
  items: JSON.stringify([{ id: 'i1', name: 'Burger', quantity: 2 }]),
  item_count: 2,
  completed_item_count: 0,
  status: 'pending',
  priority: 'rush',
  has_allergens: true,
  allergen_items: JSON.stringify(['dairy']),
  is_rush: true,
  is_overdue: false,
  overdue_by: null,
  special_instructions: 'No onions',
  delay_reason: null,
  assigned_to: 'chef-1',
  assigned_to_name: 'Chef Mike',
  estimated_prep_time: 12,
  actual_prep_time: null,
  started_at: null,
  completed_at: null,
  served_at: null,
  pending_sync: 0,
  synced_at: '2026-03-18T10:00:00.000Z',
  created_at: '2026-03-18T10:00:00.000Z',
  updated_at: '2026-03-18T10:00:00.000Z',
};

// ─── mapServerOrderToUnified ─────────────────────────────────────────────────

describe('mapServerOrderToUnified', () => {
  it('maps all top-level order fields from snake_case to camelCase', () => {
    const result = mapServerOrderToUnified(SERVER_ORDER);

    expect(result.id).toBe('order-001');
    expect(result.orderNumber).toBe('ORD-20260318-0001');
    expect(result.restaurantId).toBe('1');
    expect(result.tableId).toBe('tbl-1');
    expect(result.tableName).toBe('T-1');
    expect(result.guestCount).toBe(3);
    expect(result.customerId).toBe('cust-1');
    expect(result.createdBy).toBe('user-1');
    expect(result.createdByName).toBe('Alice Johnson');
    expect(result.servedBy).toBe('user-2');
    expect(result.servedByName).toBe('Bob Smith');
  });

  it('maps monetary fields correctly', () => {
    const result = mapServerOrderToUnified(SERVER_ORDER);

    expect(result.subtotal).toBe(27.48);
    expect(result.taxRate).toBe(0.1);
    expect(result.taxAmount).toBe(2.75);
    expect(result.discountType).toBe('percentage');
    expect(result.discountValue).toBe(10);
    expect(result.discountAmount).toBe(2.75);
    expect(result.tipAmount).toBe(3.00);
    expect(result.totalAmount).toBe(30.48);
  });

  it('maps status fields', () => {
    const result = mapServerOrderToUnified(SERVER_ORDER);

    expect(result.status).toBe('preparing');
    expect(result.paymentStatus).toBe('pending');
  });

  it('maps timestamp fields', () => {
    const result = mapServerOrderToUnified(SERVER_ORDER);

    expect(result.submittedAt).toBe('2026-03-18T10:00:00.000Z');
    expect(result.preparingAt).toBe('2026-03-18T10:01:00.000Z');
    expect(result.paidAt).toBeUndefined();
    expect(result.cancelledAt).toBeUndefined();
    expect(result.readyAt).toBeUndefined();
    expect(result.servedAt).toBeUndefined();
    expect(result.createdAt).toBe('2026-03-18T09:55:00.000Z');
    expect(result.updatedAt).toBe('2026-03-18T10:01:00.000Z');
  });

  it('sets pendingSync=false and syncedAt to now', () => {
    const before = new Date().toISOString();
    const result = mapServerOrderToUnified(SERVER_ORDER);

    expect(result.pendingSync).toBe(false);
    expect(result.syncedAt).toBeDefined();
    expect(result.syncedAt! >= before).toBe(true);
  });

  it('maps order items from order_items key', () => {
    const result = mapServerOrderToUnified(SERVER_ORDER);

    expect(result.items).toHaveLength(1);
    const item = result.items[0];
    expect(item.id).toBe('item-001');
    expect(item.orderId).toBe('order-001');
    expect(item.menuItemId).toBe('mi-10');
    expect(item.name).toBe('Beef Burger');
    expect(item.basePrice).toBe(12.99);
    expect(item.quantity).toBe(2);
    expect(item.modifierTotal).toBe(1.50);
    expect(item.itemTotal).toBe(27.48);
    expect(item.itemStatus).toBe('preparing');
    expect(item.specialInstructions).toBe('No onions');
    expect(item.hasAllergenWarning).toBe(true);
    expect(item.kitchenStation).toBe('grill');
  });

  it('parses JSON string modifiers in items', () => {
    const result = mapServerOrderToUnified(SERVER_ORDER);
    const item = result.items[0];

    expect(item.selectedModifiers).toHaveLength(1);
    expect(item.selectedModifiers[0]).toEqual({ id: 'm1', name: 'Extra Cheese', price_adjustment: 0.75 });
  });

  it('parses already-parsed array modifiers in items', () => {
    const orderWithArrayMods = {
      ...SERVER_ORDER,
      order_items: [{
        ...SERVER_ORDER_ITEM,
        selected_modifiers: [{ id: 'm1', name: 'Bacon' }],
      }],
    };
    const result = mapServerOrderToUnified(orderWithArrayMods);
    expect(result.items[0].selectedModifiers).toEqual([{ id: 'm1', name: 'Bacon' }]);
  });

  it('handles order with no items', () => {
    const orderNoItems = { ...SERVER_ORDER, order_items: undefined, items: undefined };
    const result = mapServerOrderToUnified(orderNoItems);
    expect(result.items).toEqual([]);
  });

  it('handles null/missing optional fields gracefully', () => {
    const minimal = {
      id: 'order-min',
      order_number: 'ORD-MIN',
      restaurant_id: '1',
      table_id: 'tbl-1',
      table_name: 'T-1',
      created_by: 'u1',
      created_by_name: 'User',
      status: 'draft',
    };
    const result = mapServerOrderToUnified(minimal);

    expect(result.id).toBe('order-min');
    expect(result.customerId).toBeUndefined();
    expect(result.servedBy).toBeUndefined();
    expect(result.discountType).toBeUndefined();
    expect(result.subtotal).toBe(0);
    expect(result.totalAmount).toBe(0);
    expect(result.items).toEqual([]);
    expect(result.pendingSync).toBe(false);
  });

  it('defaults status to draft when missing', () => {
    const noStatus = { ...SERVER_ORDER, status: undefined };
    const result = mapServerOrderToUnified(noStatus);
    expect(result.status).toBe('draft');
  });

  it('defaults paymentStatus to pending when missing', () => {
    const noPay = { ...SERVER_ORDER, payment_status: undefined };
    const result = mapServerOrderToUnified(noPay);
    expect(result.paymentStatus).toBe('pending');
  });

  it('reads items from "items" key as fallback', () => {
    const orderWithItemsKey = {
      ...SERVER_ORDER,
      order_items: undefined,
      items: [SERVER_ORDER_ITEM],
    };
    const result = mapServerOrderToUnified(orderWithItemsKey);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Beef Burger');
  });
});

// ─── mapServerTicketToKitchenTicket ──────────────────────────────────────────

describe('mapServerTicketToKitchenTicket', () => {
  it('maps all ticket fields from snake_case to camelCase', () => {
    const result = mapServerTicketToKitchenTicket(SERVER_TICKET);

    expect(result.id).toBe('ticket-001');
    expect(result.orderId).toBe('order-001');
    expect(result.orderNumber).toBe('ORD-20260318-0001');
    expect(result.tableId).toBe('tbl-1');
    expect(result.tableName).toBe('T-1');
    expect(result.station).toBe('grill');
    expect(result.itemCount).toBe(2);
    expect(result.completedItemCount).toBe(0);
    expect(result.status).toBe('pending');
    expect(result.priority).toBe('rush');
  });

  it('maps boolean fields correctly', () => {
    const result = mapServerTicketToKitchenTicket(SERVER_TICKET);

    expect(result.hasAllergens).toBe(true);
    expect(result.isRush).toBe(true);
    expect(result.isOverdue).toBe(false);
  });

  it('parses JSON items array', () => {
    const result = mapServerTicketToKitchenTicket(SERVER_TICKET);
    expect(result.items).toEqual([{ id: 'i1', name: 'Burger', quantity: 2 }]);
  });

  it('maps assigned staff fields', () => {
    const result = mapServerTicketToKitchenTicket(SERVER_TICKET);

    expect(result.assignedTo).toBe('chef-1');
    expect(result.assignedToName).toBe('Chef Mike');
  });

  it('sets pendingSync=false and syncedAt to now', () => {
    const before = new Date().toISOString();
    const result = mapServerTicketToKitchenTicket(SERVER_TICKET);

    expect(result.pendingSync).toBe(false);
    expect(result.syncedAt! >= before).toBe(true);
  });

  it('handles minimal ticket with missing optional fields', () => {
    const minimal = {
      id: 'ticket-min',
      order_id: 'order-min',
      order_number: 'ORD-MIN',
      table_id: 'tbl-1',
      table_name: 'T-1',
      status: 'pending',
    };
    const result = mapServerTicketToKitchenTicket(minimal);

    expect(result.id).toBe('ticket-min');
    expect(result.station).toBe('hot_kitchen'); // default
    expect(result.priority).toBe('normal'); // default
    expect(result.estimatedPrepTime).toBe(15); // default
    expect(result.items).toEqual([]);
    expect(result.assignedTo).toBeUndefined();
    expect(result.overdueBy).toBeUndefined();
  });

  it('defaults station to hot_kitchen when missing', () => {
    const noStation = { ...SERVER_TICKET, station: undefined };
    const result = mapServerTicketToKitchenTicket(noStation);
    expect(result.station).toBe('hot_kitchen');
  });
});
