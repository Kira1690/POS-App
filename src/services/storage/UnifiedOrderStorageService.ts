/**
 * Unified Order Storage Service - SQLite Implementation
 * Single storage service for all order-related data.
 *
 * Orders and order_items are normalized into separate tables.
 * Carts are stored in the carts table.
 * No in-memory cache - SQLite queries are fast enough.
 */

import {
  UnifiedOrder,
  UnifiedOrderFilters,
  UnifiedCartState,
  isActiveOrder,
  getActiveStatuses,
} from '@/types/unified-order.types';
import { databaseService } from '@/services/database/DatabaseService';
import { parseJsonColumn, now } from '@/services/database/helpers';

// ============== ROW TYPES ==============

interface OrderRow {
  id: string; order_number: string; restaurant_id: string;
  table_id: string; table_name: string; guest_count: number;
  customer_id: string | null; created_by: string; created_by_name: string;
  served_by: string | null; served_by_name: string | null;
  subtotal: number; tax_rate: number; tax_amount: number;
  discount_type: string | null; discount_value: number | null; discount_amount: number;
  tip_amount: number; total_amount: number;
  status: string; payment_status: string;
  special_instructions: string | null; cancellation_reason: string | null;
  submitted_at: string | null; paid_at: string | null; cancelled_at: string | null;
  pending_sync: number; synced_at: string | null;
  created_at: string; updated_at: string;
}

interface OrderItemRow {
  id: string; order_id: string; menu_item_id: string; name: string;
  category: string | null; category_id: string | null;
  base_price: number; quantity: number;
  modifier_total: number; item_total: number;
  selected_modifiers: string | null;
  dietary_tags: string | null; allergens: string | null;
  has_allergen_warning: number; kitchen_station: string | null;
  item_status: string | null;
  special_instructions: string | null; kitchen_notes: string | null;
  is_combo_item: number; combo_id: string | null; combo_name: string | null;
  added_at: string; modified_at: string | null;
}

interface CartRow {
  id: string; table_id: string; table_name: string;
  guest_count: number; items: string;
  subtotal: number; total_amount: number; updated_at: string;
}

// ============== SERVICE CLASS ==============

class UnifiedOrderStorageService {
  private initialized = false;

  private get db() {
    return databaseService.getDatabase();
  }

  // ============== CONVERTERS ==============

  private orderFromRow(row: OrderRow, items: OrderItemRow[]): UnifiedOrder {
    const orderItems = items
      .filter((i) => i.order_id === row.id)
      .map((i) => ({
        id: i.id,
        orderId: i.order_id,
        menuItemId: i.menu_item_id,
        name: i.name,
        category: i.category || undefined,
        categoryId: i.category_id || undefined,
        basePrice: i.base_price,
        quantity: i.quantity,
        modifierTotal: i.modifier_total,
        itemTotal: i.item_total,
        selectedModifiers: parseJsonColumn(i.selected_modifiers, []),
        dietaryTags: parseJsonColumn(i.dietary_tags, []),
        allergens: parseJsonColumn(i.allergens, []),
        hasAllergenWarning: i.has_allergen_warning === 1,
        kitchenStation: i.kitchen_station || undefined,
        itemStatus: i.item_status || 'pending',
        specialInstructions: i.special_instructions || undefined,
        kitchenNotes: i.kitchen_notes || undefined,
        isComboItem: i.is_combo_item === 1,
        comboId: i.combo_id || undefined,
        comboName: i.combo_name || undefined,
        addedAt: i.added_at,
        modifiedAt: i.modified_at || undefined,
      }));

    return {
      id: row.id,
      orderNumber: row.order_number,
      restaurantId: row.restaurant_id,
      tableId: row.table_id,
      tableName: row.table_name,
      guestCount: row.guest_count,
      customerId: row.customer_id || undefined,
      createdBy: row.created_by,
      createdByName: row.created_by_name,
      servedBy: row.served_by || undefined,
      servedByName: row.served_by_name || undefined,
      subtotal: row.subtotal,
      taxRate: row.tax_rate,
      taxAmount: row.tax_amount,
      discountType: row.discount_type || undefined,
      discountValue: row.discount_value || undefined,
      discountAmount: row.discount_amount,
      tipAmount: row.tip_amount,
      totalAmount: row.total_amount,
      status: row.status as UnifiedOrder['status'],
      paymentStatus: row.payment_status as UnifiedOrder['paymentStatus'],
      specialInstructions: row.special_instructions || undefined,
      cancellationReason: row.cancellation_reason || undefined,
      submittedAt: row.submitted_at || undefined,
      paidAt: row.paid_at || undefined,
      cancelledAt: row.cancelled_at || undefined,
      pendingSync: row.pending_sync === 1,
      syncedAt: row.synced_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: orderItems,
    } as UnifiedOrder;
  }

  // ============== INITIALIZATION ==============

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (__DEV__) {
      const activeRow = await this.db.getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ('paid', 'cancelled')`
      );
      const historyRow = await this.db.getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM orders WHERE status IN ('paid', 'cancelled')`
      );
      console.log('[UnifiedOrderStorage] Initialized successfully');
      console.log('[UnifiedOrderStorage] Active orders:', activeRow?.cnt || 0);
      console.log('[UnifiedOrderStorage] History orders:', historyRow?.cnt || 0);
    }
  }

  // ============== ORDER CRUD OPERATIONS ==============

  async saveOrder(order: UnifiedOrder): Promise<void> {
    const ts = now();

    await this.db.runAsync(
      `INSERT OR REPLACE INTO orders (id, order_number, restaurant_id, table_id, table_name,
        guest_count, customer_id, created_by, created_by_name, served_by, served_by_name,
        subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount,
        tip_amount, total_amount, status, payment_status,
        special_instructions, cancellation_reason, submitted_at, paid_at, cancelled_at,
        pending_sync, synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      order.id, order.orderNumber, order.restaurantId || 'rest_001',
      order.tableId, order.tableName, order.guestCount || 1,
      order.customerId || null, order.createdBy, order.createdByName,
      order.servedBy || null, order.servedByName || null,
      order.subtotal || 0, order.taxRate || 0, order.taxAmount || 0,
      order.discountType || null, order.discountValue || null, order.discountAmount || 0,
      order.tipAmount || 0, order.totalAmount || 0,
      order.status, order.paymentStatus || 'pending',
      order.specialInstructions || null, order.cancellationReason || null,
      order.submittedAt || null, order.paidAt || null, order.cancelledAt || null,
      order.pendingSync !== false ? 1 : 0, order.syncedAt || null,
      order.createdAt || ts, order.updatedAt || ts
    );

    // Save order items
    if (order.items) {
      // Remove existing items for this order then re-insert
      await this.db.runAsync('DELETE FROM order_items WHERE order_id = ?', order.id);

      for (const item of order.items) {
        await this.db.runAsync(
          `INSERT INTO order_items (id, order_id, menu_item_id, name, category, category_id,
            base_price, quantity, modifier_total, item_total, selected_modifiers,
            dietary_tags, allergens, has_allergen_warning, kitchen_station, item_status,
            special_instructions, kitchen_notes, is_combo_item, combo_id, combo_name,
            added_at, modified_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item.id, order.id, item.menuItemId, item.name,
          item.category || null, item.categoryId || null,
          item.basePrice || 0, item.quantity || 1,
          item.modifierTotal || 0, item.itemTotal || 0,
          item.selectedModifiers ? JSON.stringify(item.selectedModifiers) : null,
          item.dietaryTags ? JSON.stringify(item.dietaryTags) : null,
          item.allergens ? JSON.stringify(item.allergens) : null,
          item.hasAllergenWarning ? 1 : 0,
          item.kitchenStation || null, item.itemStatus || 'pending',
          item.specialInstructions || null, item.kitchenNotes || null,
          item.isComboItem ? 1 : 0, item.comboId || null, item.comboName || null,
          item.addedAt || ts, item.modifiedAt || null
        );
      }
    }
  }

  async getOrder(orderId: string): Promise<UnifiedOrder | null> {
    const row = await this.db.getFirstAsync<OrderRow>(
      'SELECT * FROM orders WHERE id = ?', orderId
    );
    if (!row) return null;

    const items = await this.db.getAllAsync<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = ?', orderId
    );
    return this.orderFromRow(row, items);
  }

  getOrderSync(orderId: string): UnifiedOrder | null {
    // For sync access, we need to fall back to async. Return null as sync isn't possible with SQLite.
    // Callers should migrate to async version.
    return null;
  }

  async getAllOrders(): Promise<UnifiedOrder[]> {
    const rows = await this.db.getAllAsync<OrderRow>(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    if (rows.length === 0) return [];

    const items = await this.db.getAllAsync<OrderItemRow>(
      'SELECT * FROM order_items'
    );
    return rows.map((r) => this.orderFromRow(r, items));
  }

  async getActiveOrders(): Promise<UnifiedOrder[]> {
    const activeStatuses = getActiveStatuses();
    const placeholders = activeStatuses.map(() => '?').join(', ');

    const rows = await this.db.getAllAsync<OrderRow>(
      `SELECT * FROM orders WHERE status IN (${placeholders}) ORDER BY created_at DESC`,
      ...activeStatuses
    );
    if (rows.length === 0) return [];

    const orderIds = rows.map((r) => r.id);
    const idPlaceholders = orderIds.map(() => '?').join(', ');
    const items = await this.db.getAllAsync<OrderItemRow>(
      `SELECT * FROM order_items WHERE order_id IN (${idPlaceholders})`,
      ...orderIds
    );
    return rows.map((r) => this.orderFromRow(r, items));
  }

  getActiveOrdersSync(): UnifiedOrder[] {
    // Sync not available with SQLite. Return empty - callers should use async.
    return [];
  }

  async getOrders(filters?: UnifiedOrderFilters): Promise<UnifiedOrder[]> {
    let sql = 'SELECT * FROM orders';
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];

    if (filters) {
      if (filters.status) {
        if (filters.status === 'active') {
          const activeStatuses = getActiveStatuses();
          conditions.push(`status IN (${activeStatuses.map(() => '?').join(', ')})`);
          params.push(...activeStatuses);
        } else if (filters.status !== 'all') {
          conditions.push('status = ?');
          params.push(filters.status);
        }
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        conditions.push('payment_status = ?');
        params.push(filters.paymentStatus);
      }

      if (filters.tableId) {
        conditions.push('table_id = ?');
        params.push(filters.tableId);
      }

      if (filters.dateRange) {
        conditions.push('created_at >= ? AND created_at <= ?');
        params.push(filters.dateRange.startDate, filters.dateRange.endDate);
      }

      if (filters.minAmount !== undefined) {
        conditions.push('total_amount >= ?');
        params.push(filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        conditions.push('total_amount <= ?');
        params.push(filters.maxAmount);
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await this.db.getAllAsync<OrderRow>(sql, ...params);
    if (rows.length === 0) return [];

    const items = await this.db.getAllAsync<OrderItemRow>('SELECT * FROM order_items');
    let orders = rows.map((r) => this.orderFromRow(r, items));

    // Handle search query in JS (needs item name matching)
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.tableName.toLowerCase().includes(query) ||
          o.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    return orders;
  }

  async updateOrder(orderId: string, updates: Partial<UnifiedOrder>): Promise<UnifiedOrder | null> {
    const existing = await this.getOrder(orderId);
    if (!existing) return null;

    const updatedOrder: UnifiedOrder = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    await this.saveOrder(updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(orderId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM order_items WHERE order_id = ?', orderId);
    await this.db.runAsync('DELETE FROM orders WHERE id = ?', orderId);
  }

  async getOrdersByTable(tableId: string): Promise<UnifiedOrder[]> {
    const rows = await this.db.getAllAsync<OrderRow>(
      'SELECT * FROM orders WHERE table_id = ? ORDER BY created_at DESC',
      tableId
    );
    if (rows.length === 0) return [];

    const orderIds = rows.map((r) => r.id);
    const placeholders = orderIds.map(() => '?').join(', ');
    const items = await this.db.getAllAsync<OrderItemRow>(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      ...orderIds
    );
    return rows.map((r) => this.orderFromRow(r, items));
  }

  async getActiveOrderForTable(tableId: string): Promise<UnifiedOrder | null> {
    const activeStatuses = getActiveStatuses();
    const placeholders = activeStatuses.map(() => '?').join(', ');

    const row = await this.db.getFirstAsync<OrderRow>(
      `SELECT * FROM orders WHERE table_id = ? AND status IN (${placeholders}) ORDER BY created_at DESC LIMIT 1`,
      tableId, ...activeStatuses
    );
    if (!row) return null;

    const items = await this.db.getAllAsync<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = ?', row.id
    );
    return this.orderFromRow(row, items);
  }

  getActiveOrderForTableSync(tableId: string): UnifiedOrder | null {
    return null; // Sync not available, use async
  }

  // ============== CART OPERATIONS ==============

  async saveCart(tableId: string, cart: UnifiedCartState): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO carts (id, table_id, table_name, guest_count, items, subtotal, total_amount, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      `cart_${tableId}`, tableId, cart.tableName || '',
      cart.guestCount || 1, JSON.stringify(cart.items || []),
      cart.subtotal || 0, cart.totalAmount || 0, now()
    );
  }

  async getCart(tableId: string): Promise<UnifiedCartState | null> {
    const row = await this.db.getFirstAsync<CartRow>(
      'SELECT * FROM carts WHERE table_id = ?', tableId
    );
    if (!row) return null;

    return {
      tableId: row.table_id,
      tableName: row.table_name,
      guestCount: row.guest_count,
      items: parseJsonColumn(row.items, []),
      subtotal: row.subtotal,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: row.total_amount,
    } as UnifiedCartState;
  }

  async deleteCart(tableId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM carts WHERE table_id = ?', tableId);
  }

  async getAllCarts(): Promise<Record<string, UnifiedCartState>> {
    const rows = await this.db.getAllAsync<CartRow>('SELECT * FROM carts');
    const carts: Record<string, UnifiedCartState> = {};

    for (const row of rows) {
      carts[row.table_id] = {
        tableId: row.table_id,
        tableName: row.table_name,
        guestCount: row.guest_count,
        items: parseJsonColumn(row.items, []),
        subtotal: row.subtotal,
        taxRate: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: row.total_amount,
      } as UnifiedCartState;
    }

    return carts;
  }

  // ============== BULK OPERATIONS ==============

  async saveOrders(orders: UnifiedOrder[]): Promise<void> {
    for (const order of orders) {
      await this.saveOrder(order);
    }
  }

  async clearOldOrders(beforeDate: Date): Promise<number> {
    const cutoff = beforeDate.toISOString();

    // Only clear completed/cancelled orders
    const result = await this.db.runAsync(
      `DELETE FROM orders WHERE status IN ('paid', 'cancelled') AND created_at < ?`,
      cutoff
    );

    // Also clean up orphaned order_items
    await this.db.execAsync(
      `DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders)`
    );

    return result.changes;
  }

  // ============== SYNC OPERATIONS ==============

  async getUnsyncedOrders(): Promise<UnifiedOrder[]> {
    const rows = await this.db.getAllAsync<OrderRow>(
      'SELECT * FROM orders WHERE pending_sync = 1'
    );
    if (rows.length === 0) return [];

    const items = await this.db.getAllAsync<OrderItemRow>('SELECT * FROM order_items');
    return rows.map((r) => this.orderFromRow(r, items));
  }

  async markAsSynced(orderIds: string[]): Promise<void> {
    if (orderIds.length === 0) return;

    const ts = now();
    const placeholders = orderIds.map(() => '?').join(', ');
    await this.db.runAsync(
      `UPDATE orders SET pending_sync = 0, synced_at = ? WHERE id IN (${placeholders})`,
      ts, ...orderIds
    );
  }

  // ============== CLEAR AND RESET OPERATIONS ==============

  async clearAll(): Promise<void> {
    await this.db.execAsync('DELETE FROM order_items');
    await this.db.execAsync('DELETE FROM orders');
    await this.db.execAsync('DELETE FROM carts');

    if (__DEV__) {
      console.log('[UnifiedOrderStorage] All data cleared');
    }
  }

  resetCache(): void {
    // No-op: SQLite doesn't need cache reset
    this.initialized = false;
    if (__DEV__) {
      console.log('[UnifiedOrderStorage] Cache reset (no-op for SQLite)');
    }
  }

  getCacheState(): {
    orders: UnifiedOrder[];
    activeOrderIds: string[];
    initialized: boolean;
  } {
    // Cannot return sync data from SQLite
    return {
      orders: [],
      activeOrderIds: [],
      initialized: this.initialized,
    };
  }

  // ============== STATISTICS ==============

  async getStats(): Promise<{
    totalOrders: number;
    activeOrders: number;
    historyOrders: number;
    carts: number;
    unsyncedOrders: number;
  }> {
    const [total, active, history, carts, unsynced] = await Promise.all([
      this.db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM orders'),
      this.db.getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ('paid', 'cancelled')`
      ),
      this.db.getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM orders WHERE status IN ('paid', 'cancelled')`
      ),
      this.db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM carts'),
      this.db.getFirstAsync<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM orders WHERE pending_sync = 1'
      ),
    ]);

    return {
      totalOrders: total?.cnt || 0,
      activeOrders: active?.cnt || 0,
      historyOrders: history?.cnt || 0,
      carts: carts?.cnt || 0,
      unsyncedOrders: unsynced?.cnt || 0,
    };
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// ============== SINGLETON EXPORT ==============

export const unifiedOrderStorageService = new UnifiedOrderStorageService();
