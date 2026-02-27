/**
 * StorageService.ts - AsyncStorage wrapper for TRX key-value settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService, StorageOperationResult } from './interfaces/IStorageService';
import { LoggingService } from './logging/LoggingService';

export class StorageService implements IStorageService {
  private static instance: StorageService;
  private logger: LoggingService;

  private constructor() {
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async setItem<T>(key: string, value: T): Promise<StorageOperationResult<void>> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return { success: true };
    } catch (error) {
      this.logger.error('StorageService.setItem failed', error instanceof Error ? error : new Error(String(error)), 'StorageService.setItem');
      return { success: false, error: error instanceof Error ? error.message : 'Failed to save' };
    }
  }

  async getItem<T>(key: string): Promise<StorageOperationResult<T | null>> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return { success: true, data: null };
      return { success: true, data: JSON.parse(raw) as T };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get' };
    }
  }

  async removeItem(key: string): Promise<StorageOperationResult<void>> {
    try {
      await AsyncStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove' };
    }
  }

  async hasItem(key: string): Promise<StorageOperationResult<boolean>> {
    try {
      const value = await AsyncStorage.getItem(key);
      return { success: true, data: value !== null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to check' };
    }
  }

  async clear(): Promise<StorageOperationResult<void>> {
    try {
      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to clear' };
    }
  }

  async getAllKeys(): Promise<StorageOperationResult<string[]>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return { success: true, data: [...keys] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get keys' };
    }
  }
}
