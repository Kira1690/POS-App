/**
 * AsyncStorage Adapter - Local storage implementation
 * Implements IDataAdapter for local data persistence
 *
 * This adapter can be swapped for ApiAdapter when backend is ready
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IDataAdapter, AsyncStorageConfig } from '../interfaces/IRepository';

export class AsyncStorageAdapter implements IDataAdapter {
  private prefix: string;
  private enableEncryption: boolean;
  private compressionThreshold: number;

  constructor(config: AsyncStorageConfig) {
    this.prefix = config.prefix || 'pos_';
    this.enableEncryption = config.enableEncryption || false;
    this.compressionThreshold = config.compressionThreshold || 10000;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private stripPrefix(fullKey: string): string {
    return fullKey.replace(this.prefix, '');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const jsonValue = await AsyncStorage.getItem(fullKey);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`[AsyncStorageAdapter] Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(fullKey, jsonValue);
    } catch (error) {
      console.error(`[AsyncStorageAdapter] Error setting key ${key}:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await AsyncStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`[AsyncStorageAdapter] Error removing key ${key}:`, error);
      throw error;
    }
  }

  async getAllKeys(prefix?: string): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const searchPrefix = prefix ? this.getFullKey(prefix) : this.prefix;
      const filteredKeys = allKeys.filter((key) => key.startsWith(searchPrefix));
      return filteredKeys.map((key) => this.stripPrefix(key));
    } catch (error) {
      console.error('[AsyncStorageAdapter] Error getting all keys:', error);
      return [];
    }
  }

  async multiGet<T>(keys: string[]): Promise<Map<string, T>> {
    try {
      const fullKeys = keys.map((key) => this.getFullKey(key));
      const results = await AsyncStorage.multiGet(fullKeys);
      const map = new Map<string, T>();

      results.forEach(([fullKey, value]) => {
        if (value !== null) {
          const key = this.stripPrefix(fullKey);
          map.set(key, JSON.parse(value) as T);
        }
      });

      return map;
    } catch (error) {
      console.error('[AsyncStorageAdapter] Error in multiGet:', error);
      return new Map();
    }
  }

  async multiSet<T>(items: Map<string, T>): Promise<void> {
    try {
      const keyValuePairs: [string, string][] = [];
      items.forEach((value, key) => {
        keyValuePairs.push([this.getFullKey(key), JSON.stringify(value)]);
      });
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('[AsyncStorageAdapter] Error in multiSet:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      const fullKeys = keys.map((key) => this.getFullKey(key));
      await AsyncStorage.multiRemove(fullKeys);
    } catch (error) {
      console.error('[AsyncStorageAdapter] Error in multiRemove:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      if (keys.length > 0) {
        await this.multiRemove(keys);
      }
    } catch (error) {
      console.error('[AsyncStorageAdapter] Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{ keyCount: number; estimatedSize: number }> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(this.getFullKey(key));
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        keyCount: keys.length,
        estimatedSize: totalSize,
      };
    } catch (error) {
      console.error('[AsyncStorageAdapter] Error getting stats:', error);
      return { keyCount: 0, estimatedSize: 0 };
    }
  }
}

// ============== SINGLETON INSTANCES ==============

export const orderStorageAdapter = new AsyncStorageAdapter({
  prefix: 'pos_orders_',
});

export const kitchenStorageAdapter = new AsyncStorageAdapter({
  prefix: 'pos_kitchen_',
});

export const billStorageAdapter = new AsyncStorageAdapter({
  prefix: 'pos_bills_',
});

export const paymentStorageAdapter = new AsyncStorageAdapter({
  prefix: 'pos_payments_',
});
