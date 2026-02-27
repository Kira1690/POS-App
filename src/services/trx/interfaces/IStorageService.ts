/**
 * IStorageService - AsyncStorage abstraction for TRX settings
 */

export interface StorageOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IStorageService {
  setItem<T>(key: string, value: T): Promise<StorageOperationResult<void>>;
  getItem<T>(key: string): Promise<StorageOperationResult<T | null>>;
  removeItem(key: string): Promise<StorageOperationResult<void>>;
  hasItem(key: string): Promise<StorageOperationResult<boolean>>;
  clear(): Promise<StorageOperationResult<void>>;
  getAllKeys(): Promise<StorageOperationResult<string[]>>;
}
