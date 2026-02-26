/**
 * Storage Services Index
 * Centralized exports for all storage services (SQLite-backed)
 */

export {
  STORAGE_KEYS,
  type StorageKey,
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

export {
  tableStorageService,
  type TableStorageData,
  type StoredArea,
  type FloorPlanData,
  type FloorPlanPosition,
} from './TableStorageService';

// Order Storage - Unified single source of truth
export { unifiedOrderStorageService } from './UnifiedOrderStorageService';

// Kitchen Storage - Ticket management
export { kitchenStorageService } from './KitchenStorageService';

// Payment & Sync Services
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
