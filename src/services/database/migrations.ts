/**
 * AsyncStorage → SQLite Migration
 *
 * One-time migration that reads all existing AsyncStorage data and inserts
 * it into the corresponding SQLite tables. Checks sync_metadata for
 * 'async_storage_migrated' flag to skip if already done.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type SQLiteDatabase } from 'expo-sqlite';
import { now } from './helpers';

const MIGRATION_FLAG = 'async_storage_migrated';

// AsyncStorage keys used across the app
const ASYNC_KEYS = {
  AUTH_SESSION: '@pos_auth_session',
  AUTH_USER: '@pos_auth_user',
  AUTH_TOKENS: '@pos_auth_tokens',
  AUTH_RESTAURANT: '@pos_auth_restaurant',
  UNIFIED_ORDERS: '@unified_orders',
  UNIFIED_CARTS: '@unified_carts',
  ORDERS: '@pos_orders',
  ORDER_DRAFTS: '@pos_order_drafts',
  KITCHEN_TICKETS: '@pos_kitchen_tickets',
  KITCHEN_STATION_CONFIG: '@pos_kitchen_station_config',
  MENU_CATEGORIES: '@pos_menu_categories',
  MENU_ITEMS: '@pos_menu_items',
  MENU_MODIFIERS: '@pos_menu_modifiers',
  MENU_COMBOS: '@pos_menu_combos',
  PAYMENT_HISTORY: '@pos_payment_history',
  SPLIT_BILLS: '@pos_split_bills',
  RECEIPTS: '@pos_receipts',
  PAYMENT_CONFIG: '@pos_payment_config',
  TABLE_DATA: '@pos_table_data',
  TABLE_AREAS: '@pos_table_areas',
  TABLE_FLOOR_PLAN: '@pos_table_floor_plan',
  SYNC_QUEUE: '@pos_sync_queue',
  SYNC_ERRORS: '@pos_sync_errors',
};

/**
 * Run one-time migration from AsyncStorage to SQLite.
 * No-op if already migrated.
 */
export async function migrateFromAsyncStorage(db: SQLiteDatabase): Promise<void> {
  // Check if already migrated
  const flagRow = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_metadata WHERE key = ?`,
    MIGRATION_FLAG
  );

  if (flagRow?.value === 'true') {
    if (__DEV__) {
      console.log('[Migration] Already migrated from AsyncStorage, skipping.');
    }
    return;
  }

  if (__DEV__) {
    console.log('[Migration] Starting AsyncStorage → SQLite migration...');
  }

  try {
    await migrateTables(db);
    await migrateMenu(db);
    await migrateOrders(db);
    await migrateKitchen(db);
    await migratePayments(db);
    await migrateAuth(db);
    await migrateSyncQueue(db);

    // Mark migration as complete
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES (?, 'true', ?)`,
      MIGRATION_FLAG,
      now()
    );

    if (__DEV__) {
      console.log('[Migration] AsyncStorage → SQLite migration complete.');
    }
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    // Don't set the flag - will retry on next launch
    throw error;
  }
}

// ============== INDIVIDUAL MIGRATIONS ==============

async function migrateTables(db: SQLiteDatabase): Promise<void> {
  const tablesJson = await AsyncStorage.getItem(ASYNC_KEYS.TABLE_DATA);
  const areasJson = await AsyncStorage.getItem(ASYNC_KEYS.TABLE_AREAS);

  if (tablesJson) {
    const tables = JSON.parse(tablesJson);
    if (Array.isArray(tables)) {
      for (const t of tables) {
        await db.runAsync(
          `INSERT OR REPLACE INTO tables (id, restaurant_id, table_number, capacity, status, section,
            current_order_id, notes, position_x, position_y, shape, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          t.id, t.restaurant_id || 'rest_001', t.table_number || '', t.capacity || 4,
          t.status || 'available', t.section || null,
          t.current_order_id || null, t.notes || null,
          t.position_x || 0, t.position_y || 0, t.shape || 'square',
          t.is_active !== false ? 1 : 0,
          t.created_at || now(), t.updated_at || now()
        );
      }
      if (__DEV__) console.log(`[Migration] Migrated ${tables.length} tables`);
    }
  }

  if (areasJson) {
    const areas = JSON.parse(areasJson);
    if (Array.isArray(areas)) {
      for (const a of areas) {
        await db.runAsync(
          `INSERT OR REPLACE INTO table_areas (id, restaurant_id, name, icon, description, is_active, color, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          a.id, 'rest_001', a.name, a.icon || null, a.description || null,
          a.isActive !== false ? 1 : 0, a.color || null,
          now(), now()
        );
      }
      if (__DEV__) console.log(`[Migration] Migrated ${areas.length} table areas`);
    }
  }
}

async function migrateMenu(db: SQLiteDatabase): Promise<void> {
  const categoriesJson = await AsyncStorage.getItem(ASYNC_KEYS.MENU_CATEGORIES);
  const itemsJson = await AsyncStorage.getItem(ASYNC_KEYS.MENU_ITEMS);
  const modifiersJson = await AsyncStorage.getItem(ASYNC_KEYS.MENU_MODIFIERS);
  const combosJson = await AsyncStorage.getItem(ASYNC_KEYS.MENU_COMBOS);

  if (categoriesJson) {
    const categories = JSON.parse(categoriesJson);
    if (Array.isArray(categories)) {
      for (const c of categories) {
        await db.runAsync(
          `INSERT OR REPLACE INTO menu_categories (id, restaurant_id, name, description, sort_order, is_active, color, icon, item_count, available_count, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          c.id, c.restaurant_id || 'rest_001', c.name, c.description || null,
          c.sort_order || 0, c.is_active !== false ? 1 : 0, c.color || null, c.icon || null,
          c.itemCount || c.item_count || 0, c.availableCount || c.available_count || 0,
          c.created_at || now(), c.updated_at || now()
        );
      }
      if (__DEV__) console.log(`[Migration] Migrated ${categories.length} menu categories`);
    }
  }

  if (itemsJson) {
    const items = JSON.parse(itemsJson);
    if (Array.isArray(items)) {
      for (const item of items) {
        await db.runAsync(
          `INSERT OR REPLACE INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time_minutes, sort_order, cost_price, tax_rate, calories, sku, dietary_tags, allergens, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item.id, item.restaurant_id || 'rest_001', item.category_id || item.categoryId || '',
          item.name, item.description || null, item.price || 0, item.image_url || item.imageUrl || null,
          item.is_available !== false ? 1 : 0, item.preparation_time_minutes || item.preparationTime || null,
          item.sort_order || 0, item.cost_price || item.costPrice || null,
          item.tax_rate || item.taxRate || null, item.calories || null,
          item.sku || null,
          item.dietary_tags ? JSON.stringify(item.dietary_tags) : (item.dietaryTags ? JSON.stringify(item.dietaryTags) : null),
          item.allergens ? JSON.stringify(item.allergens) : null,
          item.created_at || now(), item.updated_at || now()
        );

        // Migrate modifier assignments
        const assignments = item.modifier_assignments || [];
        for (const assignment of assignments) {
          await db.runAsync(
            `INSERT OR REPLACE INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            assignment.id, assignment.menu_item_id || item.id,
            assignment.modifier_group_id, assignment.sort_order || 0,
            assignment.created_at || now()
          );
        }
      }
      if (__DEV__) console.log(`[Migration] Migrated ${items.length} menu items`);
    }
  }

  if (modifiersJson) {
    const groups = JSON.parse(modifiersJson);
    if (Array.isArray(groups)) {
      for (const g of groups) {
        await db.runAsync(
          `INSERT OR REPLACE INTO modifier_groups (id, restaurant_id, name, selection_type, is_required, min_selections, max_selections, is_active, sort_order, options, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          g.id, g.restaurant_id || 'rest_001', g.name, g.selection_type || g.selectionType || 'single',
          g.is_required ? 1 : 0, g.min_selections || g.minSelections || null,
          g.max_selections || g.maxSelections || null, g.is_active !== false ? 1 : 0,
          g.sort_order || 0, g.options ? JSON.stringify(g.options) : null,
          g.created_at || now(), g.updated_at || now()
        );

        // Also save individual options
        const options = g.options || [];
        if (Array.isArray(options)) {
          for (const opt of options) {
            if (opt.id) {
              await db.runAsync(
                `INSERT OR REPLACE INTO modifier_options (id, modifier_group_id, name, price_adjustment, is_default, is_available, sort_order, max_quantity, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                opt.id, g.id, opt.name, opt.price_adjustment || opt.priceAdjustment || 0,
                opt.is_default ? 1 : 0, opt.is_available !== false ? 1 : 0,
                opt.sort_order || 0, opt.max_quantity || opt.maxQuantity || null,
                opt.created_at || now(), opt.updated_at || now()
              );
            }
          }
        }
      }
      if (__DEV__) console.log(`[Migration] Migrated ${groups.length} modifier groups`);
    }
  }

  if (combosJson) {
    const combos = JSON.parse(combosJson);
    if (Array.isArray(combos)) {
      for (const combo of combos) {
        await db.runAsync(
          `INSERT OR REPLACE INTO combo_deals (id, restaurant_id, name, description, image_url, regular_price, combo_price, savings_amount, savings_percentage, is_active, availability, items, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          combo.id, combo.restaurant_id || 'rest_001', combo.name, combo.description || null,
          combo.image_url || combo.imageUrl || null,
          combo.regular_price || combo.regularPrice || 0, combo.combo_price || combo.comboPrice || 0,
          combo.savings_amount || combo.savingsAmount || 0, combo.savings_percentage || combo.savingsPercentage || 0,
          combo.is_active !== false ? 1 : 0,
          combo.availability ? JSON.stringify(combo.availability) : null,
          combo.items ? JSON.stringify(combo.items) : null,
          combo.created_at || now(), combo.updated_at || now()
        );
      }
      if (__DEV__) console.log(`[Migration] Migrated ${combos.length} combo deals`);
    }
  }
}

async function migrateOrders(db: SQLiteDatabase): Promise<void> {
  const ordersJson = await AsyncStorage.getItem(ASYNC_KEYS.UNIFIED_ORDERS);
  const cartsJson = await AsyncStorage.getItem(ASYNC_KEYS.UNIFIED_CARTS);

  if (ordersJson) {
    const data = JSON.parse(ordersJson);
    const orders = data.orders ? Object.values(data.orders) : [];

    for (const o of orders as Record<string, unknown>[]) {
      const items = (o.items as Record<string, unknown>[]) || [];

      await db.runAsync(
        `INSERT OR REPLACE INTO orders (id, order_number, restaurant_id, table_id, table_name,
          guest_count, customer_id, created_by, created_by_name, served_by, served_by_name,
          subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount,
          tip_amount, total_amount, status, payment_status,
          special_instructions, cancellation_reason, submitted_at, paid_at, cancelled_at,
          pending_sync, synced_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        o.id as string, o.orderNumber as string || '', o.restaurantId as string || 'rest_001',
        o.tableId as string || '', o.tableName as string || '',
        (o.guestCount as number) || 1, (o.customerId as string) || null,
        o.createdBy as string || '', o.createdByName as string || '',
        (o.servedBy as string) || null, (o.servedByName as string) || null,
        (o.subtotal as number) || 0, (o.taxRate as number) || 0, (o.taxAmount as number) || 0,
        (o.discountType as string) || null, (o.discountValue as number) || null, (o.discountAmount as number) || 0,
        (o.tipAmount as number) || 0, (o.totalAmount as number) || 0,
        o.status as string || 'draft', o.paymentStatus as string || 'pending',
        (o.specialInstructions as string) || null, (o.cancellationReason as string) || null,
        (o.submittedAt as string) || null, (o.paidAt as string) || null, (o.cancelledAt as string) || null,
        (o.pendingSync as boolean) !== false ? 1 : 0, (o.syncedAt as string) || null,
        o.createdAt as string || now(), o.updatedAt as string || now()
      );

      // Insert order items
      for (const item of items) {
        await db.runAsync(
          `INSERT OR REPLACE INTO order_items (id, order_id, menu_item_id, name, category, category_id,
            base_price, quantity, modifier_total, item_total, selected_modifiers,
            dietary_tags, allergens, has_allergen_warning, kitchen_station, item_status,
            special_instructions, kitchen_notes, is_combo_item, combo_id, combo_name,
            added_at, modified_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item.id as string, o.id as string, item.menuItemId as string || '',
          item.name as string || '', (item.category as string) || null, (item.categoryId as string) || null,
          (item.basePrice as number) || 0, (item.quantity as number) || 1,
          (item.modifierTotal as number) || 0, (item.itemTotal as number) || 0,
          item.selectedModifiers ? JSON.stringify(item.selectedModifiers) : null,
          item.dietaryTags ? JSON.stringify(item.dietaryTags) : null,
          item.allergens ? JSON.stringify(item.allergens) : null,
          (item.hasAllergenWarning as boolean) ? 1 : 0,
          (item.kitchenStation as string) || null, (item.itemStatus as string) || 'pending',
          (item.specialInstructions as string) || null, (item.kitchenNotes as string) || null,
          (item.isComboItem as boolean) ? 1 : 0, (item.comboId as string) || null, (item.comboName as string) || null,
          item.addedAt as string || now(), (item.modifiedAt as string) || null
        );
      }
    }
    if (__DEV__) console.log(`[Migration] Migrated ${orders.length} orders`);
  }

  if (cartsJson) {
    const data = JSON.parse(cartsJson);
    const carts = data.carts ? Object.entries(data.carts) : [];

    for (const [tableId, cart] of carts) {
      const c = cart as Record<string, unknown>;
      await db.runAsync(
        `INSERT OR REPLACE INTO carts (id, table_id, table_name, guest_count, items, subtotal, total_amount, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        `cart_${tableId}`, tableId as string, (c.tableName as string) || '',
        (c.guestCount as number) || 1, JSON.stringify(c.items || []),
        (c.subtotal as number) || 0, (c.totalAmount as number) || 0,
        now()
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${carts.length} carts`);
  }
}

async function migrateKitchen(db: SQLiteDatabase): Promise<void> {
  const ticketsJson = await AsyncStorage.getItem(ASYNC_KEYS.KITCHEN_TICKETS);
  const stationConfigJson = await AsyncStorage.getItem(ASYNC_KEYS.KITCHEN_STATION_CONFIG);

  if (ticketsJson) {
    const data = JSON.parse(ticketsJson);
    const tickets = data.tickets ? Object.values(data.tickets) : [];

    for (const t of tickets as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO kitchen_tickets (id, order_id, order_number, table_id, table_name,
          station, items, item_count, completed_item_count,
          status, priority, has_allergens, allergen_items,
          is_rush, is_overdue, overdue_by, special_instructions, delay_reason,
          assigned_to, assigned_to_name, estimated_prep_time, actual_prep_time,
          started_at, completed_at, served_at,
          pending_sync, synced_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        t.id as string, t.orderId as string || '', t.orderNumber as string || '',
        t.tableId as string || '', t.tableName as string || '',
        t.station as string || '', JSON.stringify(t.items || []),
        (t.itemCount as number) || 0, (t.completedItemCount as number) || 0,
        t.status as string || 'pending', t.priority as string || 'normal',
        (t.hasAllergens as boolean) ? 1 : 0, t.allergenItems ? JSON.stringify(t.allergenItems) : null,
        (t.isRush as boolean) ? 1 : 0, (t.isOverdue as boolean) ? 1 : 0, (t.overdueBy as number) || null,
        (t.specialInstructions as string) || null, (t.delayReason as string) || null,
        (t.assignedTo as string) || null, (t.assignedToName as string) || null,
        (t.estimatedPrepTime as number) || 15, (t.actualPrepTime as number) || null,
        (t.startedAt as string) || null, (t.completedAt as string) || null, (t.servedAt as string) || null,
        (t.pendingSync as boolean) !== false ? 1 : 0, (t.syncedAt as string) || null,
        t.createdAt as string || now(), (t.updatedAt as string) || null
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${tickets.length} kitchen tickets`);
  }

  if (stationConfigJson) {
    const data = JSON.parse(stationConfigJson);
    const configs = data.configs || [];

    for (const c of configs) {
      await db.runAsync(
        `INSERT OR REPLACE INTO station_configs (station, name, is_active, color, icon, default_prep_time, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        c.station, c.name, c.isActive !== false ? 1 : 0,
        c.color || null, c.icon || null, c.defaultPrepTime || 15,
        now()
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${configs.length} station configs`);
  }
}

async function migratePayments(db: SQLiteDatabase): Promise<void> {
  const paymentsJson = await AsyncStorage.getItem(ASYNC_KEYS.PAYMENT_HISTORY);
  const splitsJson = await AsyncStorage.getItem(ASYNC_KEYS.SPLIT_BILLS);
  const receiptsJson = await AsyncStorage.getItem(ASYNC_KEYS.RECEIPTS);
  const configJson = await AsyncStorage.getItem(ASYNC_KEYS.PAYMENT_CONFIG);

  if (paymentsJson) {
    const data = JSON.parse(paymentsJson);
    const payments = data.payments ? Object.values(data.payments) : [];

    for (const p of payments as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO payment_records (id, order_id, order_number, restaurant_id,
          table_id, table_name, subtotal, tax_amount, discount_amount, tip_amount, total_amount,
          payment_method, is_split_payment, status, paid_amount, remaining_amount,
          transactions, processed_by, processed_by_name, receipt_id, completed_at,
          pending_sync, synced_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p.id as string, p.orderId as string || '', p.orderNumber as string || '',
        p.restaurantId as string || 'rest_001',
        p.tableId as string || '', p.tableName as string || '',
        (p.subtotal as number) || 0, (p.taxAmount as number) || 0,
        (p.discountAmount as number) || 0, (p.tipAmount as number) || 0,
        (p.totalAmount as number) || 0,
        p.paymentMethod as string || 'cash', (p.isSplitPayment as boolean) ? 1 : 0,
        p.status as string || 'pending',
        (p.paidAmount as number) || 0, (p.remainingAmount as number) || 0,
        p.transactions ? JSON.stringify(p.transactions) : null,
        p.processedBy as string || '', p.processedByName as string || '',
        (p.receiptId as string) || null, (p.completedAt as string) || null,
        (p.pendingSync as boolean) !== false ? 1 : 0, (p.syncedAt as string) || null,
        p.createdAt as string || now(), p.updated_at as string || p.updatedAt as string || now()
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${payments.length} payment records`);
  }

  if (splitsJson) {
    const data = JSON.parse(splitsJson);
    const splits = data.splits ? Object.values(data.splits) : [];

    for (const s of splits as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO bill_splits (id, order_id, order_number, split_type, original_total,
          guest_count, guests, payment_splits, total_amount, paid_amount, remaining_amount,
          is_complete, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        s.id as string || `split_${s.orderId}`, s.orderId as string || '',
        s.orderNumber as string || '', s.splitType as string || 'equal',
        (s.originalTotal as number) || 0, (s.guestCount as number) || null,
        s.guests ? JSON.stringify(s.guests) : null,
        s.paymentSplits ? JSON.stringify(s.paymentSplits) : null,
        (s.totalAmount as number) || 0, (s.paidAmount as number) || 0,
        (s.remainingAmount as number) || 0, (s.isComplete as boolean) ? 1 : 0,
        s.createdAt as string || now(), s.updatedAt as string || now()
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${splits.length} bill splits`);
  }

  if (receiptsJson) {
    const data = JSON.parse(receiptsJson);
    const receipts = data.receipts ? Object.values(data.receipts) : [];

    for (const r of receipts as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO receipts (id, receipt_number, order_id, order_number,
          restaurant_id, restaurant_name, table_name, items,
          subtotal, tax_amount, discount_amount, tip_amount, total_amount,
          payments, served_by_name, processed_by_name,
          order_created_at, payment_completed_at, printed_at, emailed_to, emailed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        r.id as string, r.receiptNumber as string || '',
        r.orderId as string || '', r.orderNumber as string || '',
        r.restaurantId as string || 'rest_001', r.restaurantName as string || '',
        r.tableName as string || '', JSON.stringify(r.items || []),
        (r.subtotal as number) || 0, (r.taxAmount as number) || 0,
        (r.discountAmount as number) || 0, (r.tipAmount as number) || 0,
        (r.totalAmount as number) || 0,
        JSON.stringify(r.payments || []),
        r.servedByName as string || '', r.processedByName as string || '',
        r.orderCreatedAt as string || now(), r.paymentCompletedAt as string || now(),
        (r.printedAt as string) || null, (r.emailedTo as string) || null, (r.emailedAt as string) || null
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${receipts.length} receipts`);
  }

  if (configJson) {
    const config = JSON.parse(configJson);
    await db.runAsync(
      `INSERT OR REPLACE INTO payment_config (id, tax_rate, default_tip_rates, minimum_tip_amount, maximum_cash_payment, receipt_settings, updated_at)
       VALUES ('default', ?, ?, ?, ?, ?, ?)`,
      config.taxRate || null,
      config.defaultTipRates ? JSON.stringify(config.defaultTipRates) : null,
      config.minimumTipAmount || null,
      config.maximumCashPayment || null,
      config.receiptSettings ? JSON.stringify(config.receiptSettings) : null,
      config.updatedAt || now()
    );
    if (__DEV__) console.log('[Migration] Migrated payment config');
  }
}

async function migrateAuth(db: SQLiteDatabase): Promise<void> {
  const sessionJson = await AsyncStorage.getItem(ASYNC_KEYS.AUTH_SESSION);

  if (sessionJson) {
    const session = JSON.parse(sessionJson);
    await db.runAsync(
      `INSERT OR REPLACE INTO auth_session (id, user_id, restaurant_id, user_data, restaurant_data, access_token, refresh_token, login_timestamp, expires_at)
       VALUES ('current', ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.user?.id || null, session.restaurant?.id || null,
      JSON.stringify(session.user || null), JSON.stringify(session.restaurant || null),
      session.accessToken || null, session.refreshToken || null,
      session.loginTimestamp || null, session.expiresAt || null
    );
    if (__DEV__) console.log('[Migration] Migrated auth session');
  }
}

async function migrateSyncQueue(db: SQLiteDatabase): Promise<void> {
  const queueJson = await AsyncStorage.getItem(ASYNC_KEYS.SYNC_QUEUE);
  const errorsJson = await AsyncStorage.getItem(ASYNC_KEYS.SYNC_ERRORS);

  if (queueJson) {
    const data = JSON.parse(queueJson);
    const items = data.items ? Object.values(data.items) : [];

    for (const item of items as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO sync_queue (id, entity_type, entity_id, operation, data, status,
          priority, attempts, max_attempts, last_attempt_at, next_retry_at, error, error_code,
          created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item.id as string, item.entityType as string || '', item.entityId as string || '',
        item.operation as string || '', JSON.stringify(item.data || {}),
        item.status as string || 'pending', (item.priority as number) || 5,
        (item.attempts as number) || 0, (item.maxAttempts as number) || 5,
        (item.lastAttemptAt as string) || null, (item.nextRetryAt as string) || null,
        (item.error as string) || null, (item.errorCode as string) || null,
        item.createdAt as string || now(), item.updatedAt as string || now()
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${items.length} sync queue items`);
  }

  if (errorsJson) {
    const data = JSON.parse(errorsJson);
    const errors = data.errors || [];

    for (const e of errors) {
      await db.runAsync(
        `INSERT OR REPLACE INTO sync_errors (id, sync_item_id, error, error_code, timestamp, resolved)
         VALUES (?, ?, ?, ?, ?, ?)`,
        e.id, e.syncItemId, e.error, e.errorCode || null,
        e.timestamp, e.resolved ? 1 : 0
      );
    }
    if (__DEV__) console.log(`[Migration] Migrated ${errors.length} sync errors`);
  }
}
