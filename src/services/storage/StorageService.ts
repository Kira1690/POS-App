/**
 * Storage Service - Legacy compatibility layer
 *
 * DEPRECATED: All storage now uses SQLite via individual service classes.
 * This file is kept only for backward compatibility of STORAGE_KEYS references
 * in the migration code. Will be removed in a future cleanup.
 */

// Storage keys - kept for migration reference only
export const STORAGE_KEYS = {
  AUTH_SESSION: '@pos_auth_session',
  AUTH_USER: '@pos_auth_user',
  AUTH_TOKENS: '@pos_auth_tokens',
  AUTH_RESTAURANT: '@pos_auth_restaurant',
  MENU_CATEGORIES: '@pos_menu_categories',
  MENU_ITEMS: '@pos_menu_items',
  MENU_MODIFIERS: '@pos_menu_modifiers',
  MENU_COMBOS: '@pos_menu_combos',
  MENU_LAST_SYNC: '@pos_menu_last_sync',
  SETTINGS_PREFERENCES: '@pos_settings_preferences',
  ORDERS: '@pos_orders',
  ACTIVE_ORDERS: '@pos_active_orders',
  ORDER_HISTORY: '@pos_order_history',
  ORDER_DRAFTS: '@pos_order_drafts',
  ORDER_LAST_SYNC: '@pos_order_last_sync',
  KITCHEN_TICKETS: '@pos_kitchen_tickets',
  KITCHEN_STATION_CONFIG: '@pos_kitchen_station_config',
  KITCHEN_LAST_SYNC: '@pos_kitchen_last_sync',
  PENDING_PAYMENTS: '@pos_pending_payments',
  PAYMENT_HISTORY: '@pos_payment_history',
  SPLIT_BILLS: '@pos_split_bills',
  RECEIPTS: '@pos_receipts',
  PAYMENT_LAST_SYNC: '@pos_payment_last_sync',
  PAYMENT_CONFIG: '@pos_payment_config',
  TABLE_DATA: '@pos_table_data',
  TABLE_AREAS: '@pos_table_areas',
  TABLE_FLOOR_PLAN: '@pos_table_floor_plan',
  TABLE_LAST_SYNC: '@pos_table_last_sync',
  SYNC_QUEUE: '@pos_sync_queue',
  LAST_SYNC_TIME: '@pos_last_sync_time',
  SYNC_ERRORS: '@pos_sync_errors',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
