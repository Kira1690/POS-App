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
  UnifiedOrderItem,
  UnifiedOrderFilters,
  UnifiedCartState,
  isActiveOrder,
  getActiveStatuses,
} from '@/types/unified-order.types';
import { databaseService } from '@/services/database/DatabaseService';
import { parseJsonColumn, now } from '@/services/database/helpers';
import type { SQLiteDatabase } from 'expo-sqlite';

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
  preparing_at: string | null; ready_at: string | null; served_at: string | null;
  estimated_prep_time: number | null; actual_prep_time: number | null;
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
  private _db: SQLiteDatabase | null = null;

  /**
   * Async DB getter — waits for DatabaseService to finish initialization.
   * Eliminates the race condition where getDatabase() throws before DB is ready.
   */
  private async ensureDb(): Promise<SQLiteDatabase> {
    if (!this._db) {
      this._db = await databaseService.initialize();
    }
    return this._db;
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
      preparingAt: row.preparing_at || undefined,
      readyAt: row.ready_at || undefined,
      servedAt: row.served_at || undefined,
      estimatedPrepTime: row.estimated_prep_time || undefined,
      actualPrepTime: row.actual_prep_time || undefined,
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
      const activeRow = await (await this.ensureDb()).getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ('paid', 'cancelled')`
      );
      const historyRow = await (await this.ensureDb()).getFirstAsync<{ cnt: number }>(
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
    const db = await this.ensureDb();

    await db.runAsync(
      `INSERT OR REPLACE INTO orders (id, order_number, restaurant_id, table_id, table_name,
        guest_count, customer_id, created_by, created_by_name, served_by, served_by_name,
        subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount,
        tip_amount, total_amount, status, payment_status,
        special_instructions, cancellation_reason, submitted_at, paid_at, cancelled_at,
        preparing_at, ready_at, served_at, estimated_prep_time, actual_prep_time,
        pending_sync, synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      order.preparingAt || null, order.readyAt || null, order.servedAt || null,
      order.estimatedPrepTime || null, order.actualPrepTime || null,
      order.pendingSync !== false ? 1 : 0, order.syncedAt || null,
      order.createdAt || ts, order.updatedAt || ts
    );

    // Save order items
    if (order.items && order.items.length > 0) {
      await db.runAsync('DELETE FROM order_items WHERE order_id = ?', order.id);

      for (const item of order.items) {
        await db.runAsync(
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
    const row = await (await this.ensureDb()).getFirstAsync<OrderRow>(
      'SELECT * FROM orders WHERE id = ?', orderId
    );
    if (!row) return null;

    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>(
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
    const rows = await (await this.ensureDb()).getAllAsync<OrderRow>(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    if (rows.length === 0) return [];

    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>(
      'SELECT * FROM order_items'
    );
    return rows.map((r) => this.orderFromRow(r, items));
  }

  async getActiveOrders(): Promise<UnifiedOrder[]> {
    const activeStatuses = getActiveStatuses();
    const placeholders = activeStatuses.map(() => '?').join(', ');

    const rows = await (await this.ensureDb()).getAllAsync<OrderRow>(
      `SELECT * FROM orders WHERE status IN (${placeholders}) ORDER BY created_at DESC`,
      ...activeStatuses
    );
    if (rows.length === 0) return [];

    const orderIds = rows.map((r) => r.id);
    const idPlaceholders = orderIds.map(() => '?').join(', ');
    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>(
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

    const rows = await (await this.ensureDb()).getAllAsync<OrderRow>(sql, ...params);
    if (rows.length === 0) return [];

    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>('SELECT * FROM order_items');
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
    await (await this.ensureDb()).runAsync('DELETE FROM order_items WHERE order_id = ?', orderId);
    await (await this.ensureDb()).runAsync('DELETE FROM orders WHERE id = ?', orderId);
  }

  /**
   * Update a single item's status, then recalculate and persist the order status.
   * Returns the updated full order.
   */
  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: string
  ): Promise<UnifiedOrder | null> {
    const ts = now();

    // 1. Update the item status
    await (await this.ensureDb()).runAsync(
      'UPDATE order_items SET item_status = ?, modified_at = ? WHERE id = ? AND order_id = ?',
      status, ts, itemId, orderId
    );

    // 2. Load all items to recalculate order status
    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = ?', orderId
    );

    // 3. Recalculate order status
    const allServed = items.every((i) => i.item_status === 'served');
    const allReadyOrServed = items.every(
      (i) => i.item_status === 'ready' || i.item_status === 'served'
    );
    const anyPreparing = items.some((i) => i.item_status === 'preparing');

    let newOrderStatus: string;
    if (allServed) {
      newOrderStatus = 'served';
    } else if (allReadyOrServed) {
      newOrderStatus = 'ready';
    } else if (anyPreparing) {
      newOrderStatus = 'preparing';
    } else {
      newOrderStatus = 'confirmed';
    }

    // 4. Update order status + timing
    const preparingAt = newOrderStatus === 'preparing' ? ts : null;
    const readyAt = newOrderStatus === 'ready' ? ts : null;
    const servedAt = newOrderStatus === 'served' ? ts : null;

    // Only set timing if transitioning TO that status (don't overwrite existing)
    const existingOrder = await (await this.ensureDb()).getFirstAsync<OrderRow>(
      'SELECT * FROM orders WHERE id = ?', orderId
    );
    if (!existingOrder) return null;

    await (await this.ensureDb()).runAsync(
      `UPDATE orders SET
        status = ?,
        preparing_at = COALESCE(preparing_at, ?),
        ready_at = COALESCE(ready_at, ?),
        served_at = COALESCE(served_at, ?),
        updated_at = ?
       WHERE id = ?`,
      newOrderStatus,
      newOrderStatus === 'preparing' ? ts : null,
      newOrderStatus === 'ready' ? ts : null,
      newOrderStatus === 'served' ? ts : null,
      ts,
      orderId
    );

    // 5. Return full updated order
    return this.getOrder(orderId);
  }

  async getOrdersByTable(tableId: string): Promise<UnifiedOrder[]> {
    const rows = await (await this.ensureDb()).getAllAsync<OrderRow>(
      'SELECT * FROM orders WHERE table_id = ? ORDER BY created_at DESC',
      tableId
    );
    if (rows.length === 0) return [];

    const orderIds = rows.map((r) => r.id);
    const placeholders = orderIds.map(() => '?').join(', ');
    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      ...orderIds
    );
    return rows.map((r) => this.orderFromRow(r, items));
  }

  async getActiveOrderForTable(tableId: string): Promise<UnifiedOrder | null> {
    const activeStatuses = getActiveStatuses();
    const placeholders = activeStatuses.map(() => '?').join(', ');

    const row = await (await this.ensureDb()).getFirstAsync<OrderRow>(
      `SELECT * FROM orders WHERE table_id = ? AND status IN (${placeholders}) ORDER BY created_at DESC LIMIT 1`,
      tableId, ...activeStatuses
    );
    if (!row) return null;

    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = ?', row.id
    );
    return this.orderFromRow(row, items);
  }

  getActiveOrderForTableSync(tableId: string): UnifiedOrder | null {
    return null; // Sync not available, use async
  }

  // ============== CART OPERATIONS ==============

  async saveCart(tableId: string, cart: UnifiedCartState): Promise<void> {
    await (await this.ensureDb()).runAsync(
      `INSERT OR REPLACE INTO carts (id, table_id, table_name, guest_count, items, subtotal, total_amount, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      `cart_${tableId}`, tableId, cart.tableName || '',
      cart.guestCount || 1, JSON.stringify(cart.items || []),
      cart.subtotal || 0, cart.totalAmount || 0, now()
    );
  }

  async getCart(tableId: string): Promise<UnifiedCartState | null> {
    const row = await (await this.ensureDb()).getFirstAsync<CartRow>(
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
    await (await this.ensureDb()).runAsync('DELETE FROM carts WHERE table_id = ?', tableId);
  }

  async getAllCarts(): Promise<Record<string, UnifiedCartState>> {
    const rows = await (await this.ensureDb()).getAllAsync<CartRow>('SELECT * FROM carts');
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

  // ============== MERGE ==============

  /**
   * Merge source order's items into target order, then cancel source.
   * Returns the updated target order with merged items.
   */
  async mergeOrders(targetOrderId: string, sourceOrderId: string): Promise<UnifiedOrder> {
    const target = await this.getOrder(targetOrderId);
    const source = await this.getOrder(sourceOrderId);
    if (!target) throw new Error(`Target order not found: ${targetOrderId}`);
    if (!source) throw new Error(`Source order not found: ${sourceOrderId}`);

    const ts = now();
    const mergedItems = [
      ...target.items,
      ...source.items.map(item => ({
        ...item,
        id: `${item.id}_m${Date.now()}`,
        orderId: targetOrderId,
        addedAt: ts,
      })),
    ];

    const subtotal = mergedItems.reduce((sum, i) => sum + i.basePrice * i.quantity + i.modifierTotal, 0);
    const taxAmount = parseFloat((subtotal * (target.taxRate || 0.1)).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

    const updatedTarget: UnifiedOrder = {
      ...target,
      items: mergedItems,
      subtotal,
      taxAmount,
      totalAmount,
      updatedAt: ts,
    };

    await this.saveOrder(updatedTarget);
    await this.updateOrder(sourceOrderId, {
      status: 'cancelled',
      cancellationReason: `Merged into order ${target.orderNumber}`,
      cancelledAt: ts,
    });

    return updatedTarget;
  }

  // ============== BULK OPERATIONS ==============

  async saveOrders(orders: UnifiedOrder[]): Promise<void> {
    if (orders.length === 0) return;
    // Process sequentially but each saveOrder already uses transactions for items
    // For very large batches, wrapping outer loop in a transaction too
    const db = await this.ensureDb();
    await db.execAsync('BEGIN TRANSACTION');
    try {
      for (const order of orders) {
        await this.saveOrder(order);
      }
      await db.execAsync('COMMIT');
    } catch (err) {
      await db.execAsync('ROLLBACK');
      throw err;
    }
  }

  async clearOldOrders(beforeDate: Date): Promise<number> {
    const cutoff = beforeDate.toISOString();

    // Only clear completed/cancelled orders
    const result = await (await this.ensureDb()).runAsync(
      `DELETE FROM orders WHERE status IN ('paid', 'cancelled') AND created_at < ?`,
      cutoff
    );

    // Also clean up orphaned order_items
    await (await this.ensureDb()).execAsync(
      `DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders)`
    );

    return result.changes;
  }

  // ============== SYNC OPERATIONS ==============

  async getUnsyncedOrders(): Promise<UnifiedOrder[]> {
    const rows = await (await this.ensureDb()).getAllAsync<OrderRow>(
      'SELECT * FROM orders WHERE pending_sync = 1'
    );
    if (rows.length === 0) return [];

    const items = await (await this.ensureDb()).getAllAsync<OrderItemRow>('SELECT * FROM order_items');
    return rows.map((r) => this.orderFromRow(r, items));
  }

  async markAsSynced(orderIds: string[]): Promise<void> {
    if (orderIds.length === 0) return;

    const ts = now();
    const placeholders = orderIds.map(() => '?').join(', ');
    await (await this.ensureDb()).runAsync(
      `UPDATE orders SET pending_sync = 0, synced_at = ? WHERE id IN (${placeholders})`,
      ts, ...orderIds
    );
  }

  // ============== CLEAR AND RESET OPERATIONS ==============

  async clearAll(): Promise<void> {
    await (await this.ensureDb()).execAsync('DELETE FROM order_items');
    await (await this.ensureDb()).execAsync('DELETE FROM orders');
    await (await this.ensureDb()).execAsync('DELETE FROM carts');

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
    const db = await this.ensureDb();
    const [total, active, history, carts, unsynced] = await Promise.all([
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM orders'),
      db.getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ('paid', 'cancelled')`
      ),
      db.getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM orders WHERE status IN ('paid', 'cancelled')`
      ),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM carts'),
      db.getFirstAsync<{ cnt: number }>(
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

  // ============== BILL-LEVEL DISCOUNT ==============

  async applyOrderDiscount(
    orderId: string,
    type: 'percentage' | 'fixed',
    value: number
  ): Promise<UnifiedOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const discountAmount =
      type === 'percentage'
        ? parseFloat((order.subtotal * (value / 100)).toFixed(2))
        : parseFloat(Math.min(value, order.subtotal).toFixed(2));

    const totalAmount = parseFloat(
      (order.subtotal - discountAmount + (order.taxAmount ?? 0)).toFixed(2)
    );

    const updated = await this.updateOrder(orderId, {
      discountType: type,
      discountValue: value,
      discountAmount,
      totalAmount,
    });
    if (!updated) throw new Error('Failed to update order with discount');
    return updated;
  }

  // ============== ITEM-LEVEL DISCOUNT ==============

  async applyItemDiscount(
    orderId: string,
    itemId: string,
    type: 'percentage' | 'fixed',
    value: number
  ): Promise<UnifiedOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const itemIndex = order.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) throw new Error('Item not found in order');

    const item = order.items[itemIndex];
    const itemSubtotal = item.basePrice * item.quantity + item.modifierTotal;
    const discountAmount =
      type === 'percentage'
        ? parseFloat((itemSubtotal * (value / 100)).toFixed(2))
        : parseFloat(Math.min(value, itemSubtotal).toFixed(2));

    const updatedItems = [...order.items];
    updatedItems[itemIndex] = {
      ...item,
      discountType: value > 0 ? type : undefined,
      discountValue: value > 0 ? value : undefined,
      discountAmount: value > 0 ? discountAmount : undefined,
      itemTotal: itemSubtotal - discountAmount,
    };

    // Recalculate order totals
    const subtotal = updatedItems.reduce((sum, i) => sum + i.itemTotal, 0);
    let orderDiscountAmount = 0;
    if (order.discountType && order.discountValue) {
      orderDiscountAmount = order.discountType === 'percentage'
        ? parseFloat((subtotal * (order.discountValue / 100)).toFixed(2))
        : parseFloat(Math.min(order.discountValue, subtotal).toFixed(2));
    }
    const taxableAmount = subtotal - orderDiscountAmount;
    const taxAmount = parseFloat((taxableAmount * (order.taxRate || 0.1)).toFixed(2));
    const totalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));

    const updated = await this.updateOrder(orderId, {
      items: updatedItems,
      subtotal,
      discountAmount: orderDiscountAmount,
      taxAmount,
      totalAmount,
    });
    if (!updated) throw new Error('Failed to update order with item discount');
    return updated;
  }

  // ============== ITEM TRANSFER ==============

  async transferItems(
    sourceOrderId: string,
    targetOrderId: string,
    itemIds: string[]
  ): Promise<{ source: UnifiedOrder; target: UnifiedOrder }> {
    const source = await this.getOrder(sourceOrderId);
    const target = await this.getOrder(targetOrderId);
    if (!source) throw new Error(`Source order not found: ${sourceOrderId}`);
    if (!target) throw new Error(`Target order not found: ${targetOrderId}`);

    const toMove = source.items.filter(i => itemIds.includes(i.id));
    const remaining = source.items.filter(i => !itemIds.includes(i.id));

    // Recalculate source totals
    const srcSubtotal = remaining.reduce((s, i) => s + i.basePrice * i.quantity + i.modifierTotal, 0);
    const srcTax = parseFloat((srcSubtotal * (source.taxRate || 0.1)).toFixed(2));
    const updatedSourcePartial = await this.updateOrder(sourceOrderId, {
      items: remaining,
      subtotal: srcSubtotal,
      taxAmount: srcTax,
      totalAmount: parseFloat((srcSubtotal + srcTax).toFixed(2)),
    });

    // Merge items into target with fresh IDs
    const ts = now();
    const newItems = toMove.map(i => ({
      ...i,
      id: `${i.id}_t${Date.now()}`,
      orderId: targetOrderId,
      addedAt: ts,
    }));
    const tgtItems = [...target.items, ...newItems];
    const tgtSubtotal = tgtItems.reduce((s, i) => s + i.basePrice * i.quantity + i.modifierTotal, 0);
    const tgtTax = parseFloat((tgtSubtotal * (target.taxRate || 0.1)).toFixed(2));
    const updatedTarget = await this.updateOrder(targetOrderId, {
      items: tgtItems,
      subtotal: tgtSubtotal,
      taxAmount: tgtTax,
      totalAmount: parseFloat((tgtSubtotal + tgtTax).toFixed(2)),
    });

    if (!updatedSourcePartial || !updatedTarget) throw new Error('Transfer update failed');
    return { source: updatedSourcePartial, target: updatedTarget };
  }

  // ============== ADD ITEMS TO EXISTING ORDER ==============

  async addItemsToOrder(
    orderId: string,
    newItems: UnifiedOrderItem[]
  ): Promise<UnifiedOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const ts = now();
    const itemsToAdd = newItems.map(item => ({
      ...item,
      id: `${item.menuItemId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      orderId,
      itemStatus: 'pending' as const,
      addedAt: ts,
    }));

    const allItems = [...order.items, ...itemsToAdd];
    const subtotal = allItems.reduce((s, i) => s + i.basePrice * i.quantity + i.modifierTotal, 0);
    const taxAmount = parseFloat((subtotal * (order.taxRate || 0.1)).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

    const updated = await this.updateOrder(orderId, {
      items: allItems,
      subtotal,
      taxAmount,
      totalAmount,
    });
    if (!updated) throw new Error('Failed to add items to order');
    return updated;
  }

  // ============== DEMO DATA SEED ==============

  /**
   * Seed 15 paid demo orders (last 7 days) so the Reports & Dashboard charts
   * show data when logged in with an offline dummy account.
   * Skips if paid orders already exist.
   */
  async seedDemoOrders(restaurantId: string): Promise<void> {
    const db = await this.ensureDb();
    const existing = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM orders WHERE status = 'paid' AND restaurant_id = ?`,
      restaurantId,
    );
    if ((existing?.cnt ?? 0) > 0) return; // already seeded

    const ITEMS = [
      { id: 'demo-latte', name: 'Latte', cat: 'Drinks', price: 5.00 },
      { id: 'demo-cappuccino', name: 'Cappuccino', cat: 'Drinks', price: 4.75 },
      { id: 'demo-burger', name: 'Beef Burger', cat: 'Mains', price: 12.99 },
      { id: 'demo-salmon', name: 'Grilled Salmon', cat: 'Mains', price: 15.50 },
      { id: 'demo-rolls', name: 'Spring Rolls', cat: 'Starters', price: 6.50 },
      { id: 'demo-garlic', name: 'Garlic Bread', cat: 'Starters', price: 4.00 },
      { id: 'demo-caesar', name: 'Caesar Salad', cat: 'Starters', price: 8.50 },
    ];

    const tables = ['T-1', 'T-2', 'T-3', 'B-1', 'B-2'];
    const ts = Date.now();

    for (let i = 0; i < 15; i++) {
      const daysAgo = i % 7;
      const hoursAgo = 8 + (i * 2) % 12; // spread across business hours
      const createdAt = new Date(ts - daysAgo * 86400000 - hoursAgo * 3600000);
      const orderNum = `ORD-DEMO-${String(i + 1).padStart(3, '0')}`;
      const orderId = `demo-order-${i + 1}`;
      const table = tables[i % tables.length];

      // Pick 1-3 items per order
      const itemCount = 1 + (i % 3);
      const orderItems: UnifiedOrderItem[] = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const item = ITEMS[(i + j) % ITEMS.length];
        const qty = 1 + (j % 2);
        const itemTotal = item.price * qty;
        subtotal += itemTotal;
        orderItems.push({
          id: `${orderId}-item-${j}`,
          orderId,
          menuItemId: item.id,
          name: item.name,
          category: item.cat,
          basePrice: item.price,
          quantity: qty,
          modifierTotal: 0,
          itemTotal,
          selectedModifiers: [],
          dietaryTags: [],
          allergens: [],
          hasAllergenWarning: false,
          itemStatus: 'served',
          addedAt: createdAt.toISOString(),
        } as UnifiedOrderItem);
      }

      const taxAmount = parseFloat((subtotal * 0.1).toFixed(2));
      const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

      await this.saveOrder({
        id: orderId,
        orderNumber: orderNum,
        restaurantId,
        tableId: `tbl-${table}`,
        tableName: table,
        guestCount: 1 + (i % 3),
        createdBy: 'demo-manager',
        createdByName: 'Alice Johnson',
        subtotal,
        taxRate: 0.1,
        taxAmount,
        discountAmount: 0,
        tipAmount: 0,
        totalAmount,
        status: 'paid',
        paymentStatus: 'paid',
        paidAt: createdAt.toISOString(),
        submittedAt: createdAt.toISOString(),
        pendingSync: false,
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        items: orderItems,
      } as UnifiedOrder);
    }

    if (__DEV__) {
      console.log(`[UnifiedOrderStorage] Seeded 15 demo paid orders for restaurant ${restaurantId}`);
    }
  }
}

// ============== SINGLETON EXPORT ==============

export const unifiedOrderStorageService = new UnifiedOrderStorageService();
