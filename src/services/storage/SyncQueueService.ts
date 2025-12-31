/**
 * Sync Queue Service
 * Manages offline-first data synchronization queue for future API integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './StorageService';

// ============== TYPES ==============

export type SyncEntityType =
  | 'order'
  | 'order_item'
  | 'kitchen_ticket'
  | 'payment'
  | 'receipt'
  | 'table_status';

export type SyncOperationType = 'create' | 'update' | 'delete';

export type SyncItemStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationType;
  data: Record<string, unknown>;
  status: SyncItemStatus;
  priority: number; // Lower = higher priority
  createdAt: string;
  updatedAt: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  error?: string;
  errorCode?: string;
}

export interface SyncError {
  id: string;
  syncItemId: string;
  error: string;
  errorCode?: string;
  timestamp: string;
  resolved: boolean;
}

export interface SyncStats {
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  totalItems: number;
  oldestPending?: string;
  newestPending?: string;
}

// Storage data structure
interface SyncQueueStorageData {
  items: Record<string, SyncQueueItem>;
  lastProcessedAt?: string;
  lastUpdated: string;
}

interface SyncErrorStorageData {
  errors: SyncError[];
  lastUpdated: string;
}

// Default empty storage
const EMPTY_QUEUE_STORAGE: SyncQueueStorageData = {
  items: {},
  lastUpdated: new Date().toISOString(),
};

const EMPTY_ERROR_STORAGE: SyncErrorStorageData = {
  errors: [],
  lastUpdated: new Date().toISOString(),
};

// Retry configuration
const DEFAULT_MAX_ATTEMPTS = 5;
const RETRY_DELAYS = [1000, 5000, 15000, 60000, 300000]; // 1s, 5s, 15s, 1m, 5m

// Priority configuration
const PRIORITY_MAP: Record<SyncEntityType, number> = {
  payment: 1, // Highest priority
  order: 2,
  kitchen_ticket: 3,
  order_item: 4,
  receipt: 5,
  table_status: 6,
};

/**
 * SyncQueueService - Manages offline-first synchronization
 */
class SyncQueueService {
  private queueCache: SyncQueueStorageData | null = null;
  private errorsCache: SyncErrorStorageData | null = null;
  private isProcessing = false;

  // ============== INITIALIZATION ==============

  /**
   * Initialize the sync queue service
   */
  async initialize(): Promise<void> {
    try {
      await Promise.all([this.loadQueueFromStorage(), this.loadErrorsFromStorage()]);
    } catch (error) {
      console.error('[SyncQueue] Initialization error:', error);
      this.queueCache = { ...EMPTY_QUEUE_STORAGE };
      this.errorsCache = { ...EMPTY_ERROR_STORAGE };
    }
  }

  /**
   * Load queue from AsyncStorage
   */
  private async loadQueueFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (data) {
        this.queueCache = JSON.parse(data);
      } else {
        this.queueCache = { ...EMPTY_QUEUE_STORAGE };
      }
    } catch (error) {
      console.error('[SyncQueue] Error loading queue:', error);
      this.queueCache = { ...EMPTY_QUEUE_STORAGE };
    }
  }

  /**
   * Load errors from AsyncStorage
   */
  private async loadErrorsFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_ERRORS);
      if (data) {
        this.errorsCache = JSON.parse(data);
      } else {
        this.errorsCache = { ...EMPTY_ERROR_STORAGE };
      }
    } catch (error) {
      console.error('[SyncQueue] Error loading errors:', error);
      this.errorsCache = { ...EMPTY_ERROR_STORAGE };
    }
  }

  /**
   * Save queue to AsyncStorage
   */
  private async saveQueueToStorage(): Promise<void> {
    if (!this.queueCache) return;

    try {
      this.queueCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.queueCache));
    } catch (error) {
      console.error('[SyncQueue] Error saving queue:', error);
      throw error;
    }
  }

  /**
   * Save errors to AsyncStorage
   */
  private async saveErrorsToStorage(): Promise<void> {
    if (!this.errorsCache) return;

    try {
      this.errorsCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_ERRORS, JSON.stringify(this.errorsCache));
    } catch (error) {
      console.error('[SyncQueue] Error saving errors:', error);
      throw error;
    }
  }

  // ============== QUEUE OPERATIONS ==============

  /**
   * Add item to sync queue
   */
  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperationType,
    data: Record<string, unknown>,
    maxAttempts: number = DEFAULT_MAX_ATTEMPTS
  ): Promise<SyncQueueItem> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) throw new Error('Queue not initialized');

    const now = new Date().toISOString();
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const item: SyncQueueItem = {
      id,
      entityType,
      entityId,
      operation,
      data,
      status: 'pending',
      priority: PRIORITY_MAP[entityType],
      createdAt: now,
      updatedAt: now,
      attempts: 0,
      maxAttempts,
    };

    this.queueCache.items[id] = item;
    await this.saveQueueToStorage();

    return item;
  }

  /**
   * Get next items to process (sorted by priority and age)
   */
  async getNextItems(limit: number = 10): Promise<SyncQueueItem[]> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return [];

    const now = Date.now();

    return Object.values(this.queueCache.items)
      .filter((item) => {
        // Only pending items
        if (item.status !== 'pending') return false;

        // Check if retry delay has passed
        if (item.nextRetryAt) {
          const retryTime = new Date(item.nextRetryAt).getTime();
          if (retryTime > now) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by priority first
        const priorityDiff = a.priority - b.priority;
        if (priorityDiff !== 0) return priorityDiff;

        // Then by creation time (older first)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, limit);
  }

  /**
   * Get item by ID
   */
  async getItem(itemId: string): Promise<SyncQueueItem | null> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    return this.queueCache?.items[itemId] || null;
  }

  /**
   * Get items by entity
   */
  async getItemsByEntity(
    entityType: SyncEntityType,
    entityId: string
  ): Promise<SyncQueueItem[]> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return [];

    return Object.values(this.queueCache.items).filter(
      (item) => item.entityType === entityType && item.entityId === entityId
    );
  }

  /**
   * Get all pending items
   */
  async getPendingItems(): Promise<SyncQueueItem[]> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return [];

    return Object.values(this.queueCache.items).filter((item) => item.status === 'pending');
  }

  /**
   * Get failed items
   */
  async getFailedItems(): Promise<SyncQueueItem[]> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return [];

    return Object.values(this.queueCache.items).filter((item) => item.status === 'failed');
  }

  // ============== ITEM STATUS UPDATES ==============

  /**
   * Mark item as in progress
   */
  async markInProgress(itemId: string): Promise<void> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return;

    const item = this.queueCache.items[itemId];
    if (item) {
      item.status = 'in_progress';
      item.updatedAt = new Date().toISOString();
      item.lastAttemptAt = new Date().toISOString();
      item.attempts++;
      await this.saveQueueToStorage();
    }
  }

  /**
   * Mark item as completed
   */
  async markCompleted(itemId: string): Promise<void> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return;

    const item = this.queueCache.items[itemId];
    if (item) {
      item.status = 'completed';
      item.updatedAt = new Date().toISOString();
      await this.saveQueueToStorage();
    }
  }

  /**
   * Mark item as failed and schedule retry
   */
  async markFailed(itemId: string, error: string, errorCode?: string): Promise<void> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return;

    const item = this.queueCache.items[itemId];
    if (item) {
      item.error = error;
      item.errorCode = errorCode;
      item.updatedAt = new Date().toISOString();

      if (item.attempts >= item.maxAttempts) {
        item.status = 'failed';
      } else {
        item.status = 'pending';
        // Calculate retry delay based on attempts
        const delayIndex = Math.min(item.attempts, RETRY_DELAYS.length - 1);
        const delay = RETRY_DELAYS[delayIndex];
        item.nextRetryAt = new Date(Date.now() + delay).toISOString();
      }

      await this.saveQueueToStorage();

      // Log error
      await this.logError(itemId, error, errorCode);
    }
  }

  /**
   * Cancel item
   */
  async cancelItem(itemId: string): Promise<void> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return;

    const item = this.queueCache.items[itemId];
    if (item) {
      item.status = 'cancelled';
      item.updatedAt = new Date().toISOString();
      await this.saveQueueToStorage();
    }
  }

  /**
   * Retry a failed item
   */
  async retryItem(itemId: string): Promise<void> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return;

    const item = this.queueCache.items[itemId];
    if (item && item.status === 'failed') {
      item.status = 'pending';
      item.attempts = 0;
      item.error = undefined;
      item.errorCode = undefined;
      item.nextRetryAt = undefined;
      item.updatedAt = new Date().toISOString();
      await this.saveQueueToStorage();
    }
  }

  /**
   * Retry all failed items
   */
  async retryAllFailed(): Promise<number> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return 0;

    const failedItems = Object.values(this.queueCache.items).filter(
      (item) => item.status === 'failed'
    );

    for (const item of failedItems) {
      item.status = 'pending';
      item.attempts = 0;
      item.error = undefined;
      item.errorCode = undefined;
      item.nextRetryAt = undefined;
      item.updatedAt = new Date().toISOString();
    }

    await this.saveQueueToStorage();
    return failedItems.length;
  }

  // ============== ERROR LOGGING ==============

  /**
   * Log sync error
   */
  async logError(syncItemId: string, error: string, errorCode?: string): Promise<void> {
    if (!this.errorsCache) await this.loadErrorsFromStorage();
    if (!this.errorsCache) return;

    const syncError: SyncError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      syncItemId,
      error,
      errorCode,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.errorsCache.errors.push(syncError);

    // Keep only last 100 errors
    if (this.errorsCache.errors.length > 100) {
      this.errorsCache.errors = this.errorsCache.errors.slice(-100);
    }

    await this.saveErrorsToStorage();
  }

  /**
   * Get recent errors
   */
  async getErrors(limit: number = 50): Promise<SyncError[]> {
    if (!this.errorsCache) await this.loadErrorsFromStorage();
    if (!this.errorsCache) return [];

    return this.errorsCache.errors.slice(-limit).reverse();
  }

  /**
   * Mark error as resolved
   */
  async resolveError(errorId: string): Promise<void> {
    if (!this.errorsCache) await this.loadErrorsFromStorage();
    if (!this.errorsCache) return;

    const error = this.errorsCache.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
      await this.saveErrorsToStorage();
    }
  }

  // ============== STATISTICS ==============

  /**
   * Get sync queue statistics
   */
  async getStats(): Promise<SyncStats> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) {
      return {
        pending: 0,
        inProgress: 0,
        completed: 0,
        failed: 0,
        totalItems: 0,
      };
    }

    const items = Object.values(this.queueCache.items);
    const pendingItems = items.filter((i) => i.status === 'pending');

    return {
      pending: pendingItems.length,
      inProgress: items.filter((i) => i.status === 'in_progress').length,
      completed: items.filter((i) => i.status === 'completed').length,
      failed: items.filter((i) => i.status === 'failed').length,
      totalItems: items.length,
      oldestPending:
        pendingItems.length > 0
          ? pendingItems.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )[0].createdAt
          : undefined,
      newestPending:
        pendingItems.length > 0
          ? pendingItems.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0].createdAt
          : undefined,
    };
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
    } catch (error) {
      console.error('[SyncQueue] Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
    } catch (error) {
      console.error('[SyncQueue] Error updating last sync time:', error);
    }
  }

  // ============== CLEANUP ==============

  /**
   * Remove completed items older than specified date
   */
  async cleanupCompleted(olderThan: Date): Promise<number> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return 0;

    const cutoffTime = olderThan.getTime();
    const idsToRemove: string[] = [];

    for (const item of Object.values(this.queueCache.items)) {
      if (
        item.status === 'completed' &&
        new Date(item.updatedAt).getTime() < cutoffTime
      ) {
        idsToRemove.push(item.id);
      }
    }

    for (const id of idsToRemove) {
      delete this.queueCache.items[id];
    }

    await this.saveQueueToStorage();
    return idsToRemove.length;
  }

  /**
   * Remove cancelled items
   */
  async cleanupCancelled(): Promise<number> {
    if (!this.queueCache) await this.loadQueueFromStorage();
    if (!this.queueCache) return 0;

    const idsToRemove: string[] = [];

    for (const item of Object.values(this.queueCache.items)) {
      if (item.status === 'cancelled') {
        idsToRemove.push(item.id);
      }
    }

    for (const id of idsToRemove) {
      delete this.queueCache.items[id];
    }

    await this.saveQueueToStorage();
    return idsToRemove.length;
  }

  /**
   * Clear all queue data (use with caution)
   */
  async clearAll(): Promise<void> {
    this.queueCache = { ...EMPTY_QUEUE_STORAGE };
    this.errorsCache = { ...EMPTY_ERROR_STORAGE };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE),
      AsyncStorage.removeItem(STORAGE_KEYS.SYNC_ERRORS),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC_TIME),
    ]);
  }
}

// Export singleton instance
export const syncQueueService = new SyncQueueService();
