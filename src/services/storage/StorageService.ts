/**
 * Storage Service - Abstract storage interface
 * Designed for easy swap between AsyncStorage and API calls
 *
 * Current: Uses AsyncStorage for local persistence
 * Future: Can be swapped to use API endpoints with minimal changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys - centralized for easy management
export const STORAGE_KEYS = {
  // Auth keys
  AUTH_SESSION: '@pos_auth_session',
  AUTH_USER: '@pos_auth_user',
  AUTH_TOKENS: '@pos_auth_tokens',
  AUTH_RESTAURANT: '@pos_auth_restaurant',

  // Menu keys
  MENU_CATEGORIES: '@pos_menu_categories',
  MENU_ITEMS: '@pos_menu_items',
  MENU_MODIFIERS: '@pos_menu_modifiers',
  MENU_COMBOS: '@pos_menu_combos',
  MENU_LAST_SYNC: '@pos_menu_last_sync',

  // Settings keys
  SETTINGS_PREFERENCES: '@pos_settings_preferences',

  // Order Management keys
  ORDERS: '@pos_orders',
  ACTIVE_ORDERS: '@pos_active_orders',
  ORDER_HISTORY: '@pos_order_history',
  ORDER_DRAFTS: '@pos_order_drafts',
  ORDER_LAST_SYNC: '@pos_order_last_sync',

  // Kitchen Ticket keys
  KITCHEN_TICKETS: '@pos_kitchen_tickets',
  KITCHEN_STATION_CONFIG: '@pos_kitchen_station_config',
  KITCHEN_LAST_SYNC: '@pos_kitchen_last_sync',

  // Payment keys
  PENDING_PAYMENTS: '@pos_pending_payments',
  PAYMENT_HISTORY: '@pos_payment_history',
  SPLIT_BILLS: '@pos_split_bills',
  RECEIPTS: '@pos_receipts',
  PAYMENT_LAST_SYNC: '@pos_payment_last_sync',
  PAYMENT_CONFIG: '@pos_payment_config',

  // Table Management keys
  TABLE_DATA: '@pos_table_data',
  TABLE_AREAS: '@pos_table_areas',
  TABLE_FLOOR_PLAN: '@pos_table_floor_plan',
  TABLE_LAST_SYNC: '@pos_table_last_sync',

  // Sync Queue keys
  SYNC_QUEUE: '@pos_sync_queue',
  LAST_SYNC_TIME: '@pos_last_sync_time',
  SYNC_ERRORS: '@pos_sync_errors',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Storage configuration
export interface StorageConfig {
  useLocalStorage: boolean;  // If false, will use API (future)
  apiBaseUrl?: string;       // For future API integration
  syncOnWrite?: boolean;     // Auto-sync to API on write (future)
}

// Default config - using local storage
const DEFAULT_CONFIG: StorageConfig = {
  useLocalStorage: true,
  syncOnWrite: false,
};

/**
 * IStorageService Interface
 * Implement this interface to create different storage backends
 */
export interface IStorageService {
  get<T>(key: StorageKey): Promise<T | null>;
  set<T>(key: StorageKey, value: T): Promise<void>;
  remove(key: StorageKey): Promise<void>;
  clear(): Promise<void>;
  multiGet<T>(keys: StorageKey[]): Promise<Map<StorageKey, T | null>>;
  multiSet(items: Array<{ key: StorageKey; value: unknown }>): Promise<void>;
}

/**
 * AsyncStorageService - Local storage implementation
 * This is the current implementation using AsyncStorage
 */
export class AsyncStorageService implements IStorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[Storage] Error reading ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: StorageKey, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);

      // Future: If syncOnWrite is enabled, sync to API
      if (this.config.syncOnWrite && !this.config.useLocalStorage) {
        await this.syncToApi(key, value);
      }
    } catch (error) {
      console.error(`[Storage] Error writing ${key}:`, error);
      throw error;
    }
  }

  async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const allKeys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(allKeys);
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
      throw error;
    }
  }

  async multiGet<T>(keys: StorageKey[]): Promise<Map<StorageKey, T | null>> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      const map = new Map<StorageKey, T | null>();

      for (const [key, value] of results) {
        map.set(key as StorageKey, value ? JSON.parse(value) : null);
      }

      return map;
    } catch (error) {
      console.error('[Storage] Error in multiGet:', error);
      return new Map();
    }
  }

  async multiSet(items: Array<{ key: StorageKey; value: unknown }>): Promise<void> {
    try {
      const pairs: [string, string][] = items.map(({ key, value }) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('[Storage] Error in multiSet:', error);
      throw error;
    }
  }

  // Placeholder for future API sync
  private async syncToApi<T>(key: StorageKey, value: T): Promise<void> {
    // TODO: Implement when backend is ready
    // This will POST/PUT data to the API endpoint
    console.log(`[Storage] Would sync ${key} to API (not implemented)`);
  }
}

// Create and export singleton instance
export const storageService = new AsyncStorageService();
