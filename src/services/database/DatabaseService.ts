/**
 * Database Service - Singleton manager for expo-sqlite database
 *
 * Manages the SQLite database instance, schema creation, and versioning.
 * Uses sync_metadata table for schema version tracking.
 */

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DB_NAME = 'pos_app.db';
const CURRENT_SCHEMA_VERSION = 6;

class DatabaseService {
  private db: SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database - opens/creates DB and runs schema setup.
   * Safe to call multiple times; only initializes once.
   * Validates connection is alive (handles Fast Refresh stale native handles).
   */
  async initialize(): Promise<SQLiteDatabase> {
    // If we have an existing handle, verify it's still valid
    // After Fast Refresh, the native SQLite handle can become stale
    // (NativeDatabase.prepareAsync throws NullPointerException)
    if (this.db) {
      try {
        await this.db.getFirstAsync('SELECT 1');
        return this.db;
      } catch {
        if (__DEV__) {
          console.log('[DatabaseService] Stale DB handle detected (Fast Refresh?) — re-opening');
        }
        this.db = null;
        this.initPromise = null;
      }
    }

    if (!this.initPromise) {
      this.initPromise = this.doInitialize();
    }

    await this.initPromise;
    return this.db!;
  }

  /**
   * Get the database instance. Throws if not initialized.
   */
  getDatabase(): SQLiteDatabase {
    if (!this.db) {
      throw new Error('[DatabaseService] Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.db !== null;
  }

  private async doInitialize(): Promise<void> {
    try {
      this.db = await openDatabaseAsync(DB_NAME);

      // Enable WAL mode for better concurrent read/write performance
      await this.db.execAsync('PRAGMA journal_mode = WAL;');
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      await this.createSchema();
      await this.runMigrations();

      if (__DEV__) {
        console.log('[DatabaseService] Database initialized successfully');
      }
    } catch (error) {
      this.db = null;
      this.initPromise = null;
      console.error('[DatabaseService] Initialization failed:', error);
      throw error;
    }
  }

  private async createSchema(): Promise<void> {
    if (!this.db) return;

    // Execute all CREATE TABLE statements
    await this.db.execAsync(SCHEMA_SQL);
    await this.db.execAsync(INDEX_SQL);
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    const versionRow = await this.db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'schema_version'`
    );

    const currentVersion = versionRow ? parseInt(versionRow.value, 10) : 0;

    if (currentVersion < 1) {
      // v1: initial schema created by createSchema() above
      if (__DEV__) console.log('[DatabaseService] Running v0 → v1 migration (schema creation)');
    }

    if (currentVersion < 2) {
      // v2: add kitchen timing columns to orders + station config columns
      await this.runV2Migration();
      if (__DEV__) console.log('[DatabaseService] Running v1 → v2 migration');
    }

    if (currentVersion < 3) {
      // v3: add terminal_settings table for SQLite-based terminal persistence
      await this.runV3Migration();
      if (__DEV__) console.log('[DatabaseService] Running v2 → v3 migration');
    }

    if (currentVersion < 4) {
      // v4: add kitchen_station column to menu_items for per-item station override
      await this.runV4Migration();
      if (__DEV__) console.log('[DatabaseService] Running v3 → v4 migration');
    }

    if (currentVersion < 5) {
      // v5: fix tables.section — was seeded with area name strings, must be area IDs
      await this.runV5Migration();
      if (__DEV__) console.log('[DatabaseService] Running v4 → v5 migration (fix table section IDs)');
    }

    if (currentVersion < 6) {
      // v6: add activity_logs + printer_settings tables
      await this.runV6Migration();
      if (__DEV__) console.log('[DatabaseService] Running v5 → v6 migration (activity_logs + printer_settings)');
    }

    if (currentVersion < CURRENT_SCHEMA_VERSION) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('schema_version', ?, ?)`,
        String(CURRENT_SCHEMA_VERSION),
        new Date().toISOString()
      );

      if (__DEV__) {
        console.log(`[DatabaseService] Schema version set to ${CURRENT_SCHEMA_VERSION}`);
      }
    }
  }

  private async runV2Migration(): Promise<void> {
    if (!this.db) return;

    // Add kitchen timing columns to orders (safe: IF NOT EXISTS equivalent via PRAGMA check)
    const orderColumns = await this.db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(orders)'
    );
    const orderColNames = new Set(orderColumns.map((c) => c.name));

    if (!orderColNames.has('preparing_at')) {
      await this.db.execAsync('ALTER TABLE orders ADD COLUMN preparing_at TEXT');
    }
    if (!orderColNames.has('ready_at')) {
      await this.db.execAsync('ALTER TABLE orders ADD COLUMN ready_at TEXT');
    }
    if (!orderColNames.has('served_at')) {
      await this.db.execAsync('ALTER TABLE orders ADD COLUMN served_at TEXT');
    }
    if (!orderColNames.has('estimated_prep_time')) {
      await this.db.execAsync('ALTER TABLE orders ADD COLUMN estimated_prep_time INTEGER DEFAULT 15');
    }
    if (!orderColNames.has('actual_prep_time')) {
      await this.db.execAsync('ALTER TABLE orders ADD COLUMN actual_prep_time INTEGER');
    }

    // Add config columns to station_configs
    const stationColumns = await this.db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(station_configs)'
    );
    const stationColNames = new Set(stationColumns.map((c) => c.name));

    if (!stationColNames.has('alert_threshold')) {
      await this.db.execAsync('ALTER TABLE station_configs ADD COLUMN alert_threshold INTEGER DEFAULT 20');
    }
    if (!stationColNames.has('display_order')) {
      await this.db.execAsync('ALTER TABLE station_configs ADD COLUMN display_order INTEGER DEFAULT 0');
    }
    if (!stationColNames.has('max_concurrent')) {
      await this.db.execAsync('ALTER TABLE station_configs ADD COLUMN max_concurrent INTEGER DEFAULT 10');
    }
  }

  private async runV3Migration(): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS terminal_settings (
        id INTEGER PRIMARY KEY,
        ip TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 1180,
        name TEXT,
        is_selected INTEGER NOT NULL DEFAULT 1,
        connected_at TEXT,
        last_ping_success TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }

  private async runV4Migration(): Promise<void> {
    if (!this.db) return;

    const menuItemColumns = await this.db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(menu_items)'
    );
    const colNames = new Set(menuItemColumns.map((c) => c.name));

    if (!colNames.has('kitchen_station')) {
      await this.db.execAsync('ALTER TABLE menu_items ADD COLUMN kitchen_station TEXT;');
    }
  }

  private async runV6Migration(): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        order_id TEXT NOT NULL,
        order_number TEXT,
        table_name TEXT,
        description TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS printer_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        receipt_enabled INTEGER DEFAULT 0,
        receipt_ip TEXT,
        receipt_port INTEGER DEFAULT 9100,
        receipt_paper_size TEXT DEFAULT '80mm',
        kitchen_enabled INTEGER DEFAULT 0,
        kitchen_ip TEXT,
        kitchen_port INTEGER DEFAULT 9100,
        updated_at TEXT NOT NULL
      );
    `);

    // Index for fast time-range queries on activity_logs
    await this.db.execAsync(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);`
    );
  }

  private async runV5Migration(): Promise<void> {
    if (!this.db) return;

    // Fix tables whose section was stored as the area NAME instead of area ID.
    // Only updates rows where section doesn't already match an area ID in table_areas,
    // but does match an area name — resolves it to the correct ID via a subquery.
    await this.db.execAsync(`
      UPDATE tables
      SET section = (
        SELECT id FROM table_areas WHERE name = tables.section LIMIT 1
      ),
      updated_at = datetime('now')
      WHERE section IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM table_areas WHERE id = tables.section)
        AND EXISTS (SELECT 1 FROM table_areas WHERE name = tables.section)
    `);
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// ============== SCHEMA SQL ==============

const SCHEMA_SQL = `
-- Reference Tables (server-authoritative)
CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT, phone TEXT, email TEXT,
  manager_id TEXT, timezone TEXT DEFAULT 'America/New_York',
  operating_hours TEXT, settings TEXT, is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT NOT NULL, phone_number TEXT, role TEXT NOT NULL,
  employee_id TEXT, default_restaurant_id TEXT,
  is_active INTEGER DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS table_areas (
  id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL,
  name TEXT NOT NULL, icon TEXT, description TEXT, is_active INTEGER DEFAULT 1,
  color TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL,
  table_number TEXT NOT NULL, capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', section TEXT,
  current_order_id TEXT, notes TEXT,
  position_x REAL DEFAULT 0, position_y REAL DEFAULT 0,
  shape TEXT DEFAULT 'square', is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL,
  name TEXT NOT NULL, description TEXT, sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1, color TEXT, icon TEXT,
  item_count INTEGER DEFAULT 0, available_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL, category_id TEXT NOT NULL,
  name TEXT NOT NULL, description TEXT, price REAL NOT NULL, image_url TEXT,
  is_available INTEGER DEFAULT 1, preparation_time_minutes INTEGER,
  sort_order INTEGER DEFAULT 0, cost_price REAL, tax_rate REAL,
  calories INTEGER, sku TEXT, dietary_tags TEXT, allergens TEXT,
  kitchen_station TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS modifier_groups (
  id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL, name TEXT NOT NULL,
  selection_type TEXT NOT NULL, is_required INTEGER DEFAULT 0,
  min_selections INTEGER, max_selections INTEGER,
  is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
  options TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS modifier_options (
  id TEXT PRIMARY KEY, modifier_group_id TEXT NOT NULL,
  name TEXT NOT NULL, price_adjustment REAL DEFAULT 0,
  is_default INTEGER DEFAULT 0, is_available INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0, max_quantity INTEGER,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_item_modifier_assignments (
  id TEXT PRIMARY KEY, menu_item_id TEXT NOT NULL,
  modifier_group_id TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS combo_deals (
  id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL, name TEXT NOT NULL,
  description TEXT, image_url TEXT, regular_price REAL NOT NULL,
  combo_price REAL NOT NULL, savings_amount REAL DEFAULT 0,
  savings_percentage REAL DEFAULT 0, is_active INTEGER DEFAULT 1,
  availability TEXT, items TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS combo_items (
  id TEXT PRIMARY KEY, combo_id TEXT NOT NULL,
  menu_item_id TEXT, category_choice TEXT,
  quantity INTEGER DEFAULT 1, is_substitutable INTEGER DEFAULT 0,
  substitution_options TEXT, price_override REAL,
  item_category TEXT, sort_order INTEGER DEFAULT 0
);

-- Transactional Tables (bidirectional sync)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, order_number TEXT NOT NULL, restaurant_id TEXT NOT NULL,
  table_id TEXT NOT NULL, table_name TEXT NOT NULL, guest_count INTEGER DEFAULT 1,
  customer_id TEXT, created_by TEXT NOT NULL, created_by_name TEXT NOT NULL,
  served_by TEXT, served_by_name TEXT,
  subtotal REAL DEFAULT 0, tax_rate REAL DEFAULT 0, tax_amount REAL DEFAULT 0,
  discount_type TEXT, discount_value REAL, discount_amount REAL DEFAULT 0,
  tip_amount REAL DEFAULT 0, total_amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', payment_status TEXT NOT NULL DEFAULT 'pending',
  special_instructions TEXT, cancellation_reason TEXT,
  submitted_at TEXT, paid_at TEXT, cancelled_at TEXT,
  preparing_at TEXT, ready_at TEXT, served_at TEXT,
  estimated_prep_time INTEGER DEFAULT 15, actual_prep_time INTEGER,
  pending_sync INTEGER DEFAULT 1, synced_at TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL,
  menu_item_id TEXT NOT NULL, name TEXT NOT NULL, category TEXT, category_id TEXT,
  base_price REAL NOT NULL, quantity INTEGER NOT NULL,
  modifier_total REAL DEFAULT 0, item_total REAL DEFAULT 0,
  selected_modifiers TEXT,
  dietary_tags TEXT, allergens TEXT, has_allergen_warning INTEGER DEFAULT 0,
  kitchen_station TEXT, item_status TEXT DEFAULT 'pending',
  special_instructions TEXT, kitchen_notes TEXT,
  is_combo_item INTEGER DEFAULT 0, combo_id TEXT, combo_name TEXT,
  added_at TEXT NOT NULL, modified_at TEXT
);

CREATE TABLE IF NOT EXISTS kitchen_tickets (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL, order_number TEXT NOT NULL,
  table_id TEXT NOT NULL, table_name TEXT NOT NULL,
  station TEXT NOT NULL, items TEXT NOT NULL,
  item_count INTEGER DEFAULT 0, completed_item_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', priority TEXT DEFAULT 'normal',
  has_allergens INTEGER DEFAULT 0, allergen_items TEXT,
  is_rush INTEGER DEFAULT 0, is_overdue INTEGER DEFAULT 0, overdue_by INTEGER,
  special_instructions TEXT, delay_reason TEXT,
  assigned_to TEXT, assigned_to_name TEXT,
  estimated_prep_time INTEGER DEFAULT 15, actual_prep_time INTEGER,
  started_at TEXT, completed_at TEXT, served_at TEXT,
  pending_sync INTEGER DEFAULT 1, synced_at TEXT,
  created_at TEXT NOT NULL, updated_at TEXT
);

CREATE TABLE IF NOT EXISTS payment_records (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL, order_number TEXT NOT NULL,
  restaurant_id TEXT NOT NULL, table_id TEXT NOT NULL, table_name TEXT NOT NULL,
  subtotal REAL NOT NULL, tax_amount REAL DEFAULT 0, discount_amount REAL DEFAULT 0,
  tip_amount REAL DEFAULT 0, total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL, is_split_payment INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_amount REAL DEFAULT 0, remaining_amount REAL DEFAULT 0,
  transactions TEXT,
  processed_by TEXT NOT NULL, processed_by_name TEXT NOT NULL,
  receipt_id TEXT, completed_at TEXT,
  pending_sync INTEGER DEFAULT 1, synced_at TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY, payment_record_id TEXT NOT NULL,
  order_id TEXT NOT NULL, amount REAL NOT NULL, method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', transaction_id TEXT,
  card_last_four TEXT, card_brand TEXT,
  cash_received REAL, change_given REAL,
  processed_by TEXT NOT NULL, processed_by_name TEXT NOT NULL,
  pending_sync INTEGER DEFAULT 1, synced_at TEXT,
  processed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bill_splits (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL UNIQUE, order_number TEXT NOT NULL,
  split_type TEXT NOT NULL, original_total REAL NOT NULL,
  guest_count INTEGER, guests TEXT, payment_splits TEXT,
  total_amount REAL NOT NULL, paid_amount REAL DEFAULT 0,
  remaining_amount REAL DEFAULT 0, is_complete INTEGER DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY, receipt_number TEXT NOT NULL,
  order_id TEXT NOT NULL, order_number TEXT NOT NULL,
  restaurant_id TEXT NOT NULL, restaurant_name TEXT NOT NULL,
  table_name TEXT NOT NULL, items TEXT NOT NULL,
  subtotal REAL NOT NULL, tax_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0, tip_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL, payments TEXT NOT NULL,
  served_by_name TEXT NOT NULL, processed_by_name TEXT NOT NULL,
  order_created_at TEXT NOT NULL, payment_completed_at TEXT NOT NULL,
  printed_at TEXT, emailed_to TEXT, emailed_at TEXT
);

-- Local-Only Tables
CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY, table_id TEXT NOT NULL UNIQUE, table_name TEXT NOT NULL,
  guest_count INTEGER DEFAULT 1, items TEXT NOT NULL,
  subtotal REAL DEFAULT 0, total_amount REAL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS station_configs (
  station TEXT PRIMARY KEY, name TEXT NOT NULL, is_active INTEGER DEFAULT 1,
  color TEXT, icon TEXT, default_prep_time INTEGER DEFAULT 15,
  alert_threshold INTEGER DEFAULT 20, display_order INTEGER DEFAULT 0,
  max_concurrent INTEGER DEFAULT 10,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_session (
  id TEXT PRIMARY KEY DEFAULT 'current',
  user_id TEXT, restaurant_id TEXT,
  user_data TEXT, restaurant_data TEXT,
  access_token TEXT, refresh_token TEXT,
  login_timestamp TEXT, expires_at TEXT
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  last_attempt_at TEXT,
  next_retry_at TEXT,
  error TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_errors (
  id TEXT PRIMARY KEY,
  sync_item_id TEXT NOT NULL,
  error TEXT NOT NULL,
  error_code TEXT,
  timestamp TEXT NOT NULL,
  resolved INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_metadata (
  key TEXT PRIMARY KEY, value TEXT, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  tax_rate REAL,
  default_tip_rates TEXT,
  minimum_tip_amount REAL,
  maximum_cash_payment REAL,
  receipt_settings TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS terminal_settings (
  id INTEGER PRIMARY KEY,
  ip TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 1180,
  name TEXT,
  is_selected INTEGER NOT NULL DEFAULT 1,
  connected_at TEXT,
  last_ping_success TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`;

const INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_section ON tables(section);
CREATE INDEX IF NOT EXISTS idx_table_areas_restaurant ON table_areas(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_pending_sync ON orders(pending_sync);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_order ON kitchen_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_station ON kitchen_tickets(station);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_status ON kitchen_tickets(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_pending_sync ON kitchen_tickets(pending_sync);
CREATE INDEX IF NOT EXISTS idx_payment_records_order ON payment_records(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_record ON payment_transactions(payment_record_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON modifier_options(modifier_group_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_modifier_assignments_item ON menu_item_modifier_assignments(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_bill_splits_order ON bill_splits(order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_order ON receipts(order_id);
`;

// Export singleton instance — uses global to survive Fast Refresh.
// After Fast Refresh, modules re-evaluate creating a new DatabaseService
// with db=null, losing the valid native SQLite handle. By storing the
// instance on global, we reuse the same object (and its DB handle) across
// hot reloads. The initialize() method still validates the handle is alive.
const GLOBAL_KEY = '__databaseServiceInstance';
export const databaseService: DatabaseService =
  (global as Record<string, unknown>)[GLOBAL_KEY] as DatabaseService ??
  ((global as Record<string, unknown>)[GLOBAL_KEY] = new DatabaseService());
