/**
 * Storage Services Index
 * Centralized exports for all storage services
 */

export {
  storageService,
  AsyncStorageService,
  STORAGE_KEYS,
  type StorageKey,
  type StorageConfig,
  type IStorageService,
} from './StorageService';

export {
  authStorageService,
  type AuthSession,
  type AuthTokens,
} from './AuthStorageService';

export {
  menuStorageService,
  type MenuStorageData,
} from './MenuStorageService';

// Order Management Storage Services
export { orderStorageService } from './OrderStorageService';
export { kitchenStorageService } from './KitchenStorageService';
export { paymentStorageService } from './PaymentStorageService';
export {
  syncQueueService,
  type SyncQueueItem,
  type SyncEntityType,
  type SyncOperationType,
  type SyncItemStatus,
  type SyncError,
  type SyncStats,
} from './SyncQueueService';
