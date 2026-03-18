/**
 * Sync Queue Service - SQLite Implementation
 * Manages offline-first data synchronization queue via expo-sqlite.
 */

import { databaseService } from '@/services/database/DatabaseService';
import { now } from '@/services/database/helpers';

// ============== TYPES ==============

export type SyncEntityType =
  | 'order'
  | 'order_item'
  | 'kitchen_ticket'
  | 'payment'
  | 'receipt'
  | 'table_status'
  | 'customer';

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
  priority: number;
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

// Row types
interface QueueItemRow {
  id: string; entity_type: string; entity_id: string;
  operation: string; data: string; status: string;
  priority: number; attempts: number; max_attempts: number;
  last_attempt_at: string | null; next_retry_at: string | null;
  error: string | null; error_code: string | null;
  created_at: string; updated_at: string;
}

interface SyncErrorRow {
  id: string; sync_item_id: string; error: string;
  error_code: string | null; timestamp: string; resolved: number;
}

// Retry configuration
const DEFAULT_MAX_ATTEMPTS = 5;
const RETRY_DELAYS = [1000, 5000, 15000, 60000, 300000]; // 1s, 5s, 15s, 1m, 5m

// Priority configuration
const PRIORITY_MAP: Record<SyncEntityType, number> = {
  payment: 1,
  order: 2,
  kitchen_ticket: 3,
  order_item: 4,
  receipt: 5,
  table_status: 6,
  customer: 7,
};

class SyncQueueService {
  // Note: removed isProcessing mutex — entity type filtering in processBatch() prevents cross-contamination

  private get db() {
    return databaseService.getDatabase();
  }

  // ============== CONVERTERS ==============

  private itemFromRow(row: QueueItemRow): SyncQueueItem {
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(row.data);
    } catch { /* empty */ }

    return {
      id: row.id,
      entityType: row.entity_type as SyncEntityType,
      entityId: row.entity_id,
      operation: row.operation as SyncOperationType,
      data,
      status: row.status as SyncItemStatus,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      lastAttemptAt: row.last_attempt_at || undefined,
      nextRetryAt: row.next_retry_at || undefined,
      error: row.error || undefined,
      errorCode: row.error_code || undefined,
    };
  }

  private errorFromRow(row: SyncErrorRow): SyncError {
    return {
      id: row.id,
      syncItemId: row.sync_item_id,
      error: row.error,
      errorCode: row.error_code || undefined,
      timestamp: row.timestamp,
      resolved: row.resolved === 1,
    };
  }

  // ============== INITIALIZATION ==============

  async initialize(): Promise<void> {
    // No-op: tables created by DatabaseService
  }

  // ============== QUEUE OPERATIONS ==============

  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperationType,
    data: Record<string, unknown>,
    maxAttempts: number = DEFAULT_MAX_ATTEMPTS
  ): Promise<SyncQueueItem> {
    const ts = now();
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.db.runAsync(
      `INSERT INTO sync_queue (id, entity_type, entity_id, operation, data, status, priority, attempts, max_attempts, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, 0, ?, ?, ?)`,
      id, entityType, entityId, operation, JSON.stringify(data),
      PRIORITY_MAP[entityType], maxAttempts, ts, ts
    );

    return {
      id, entityType, entityId, operation, data,
      status: 'pending', priority: PRIORITY_MAP[entityType],
      createdAt: ts, updatedAt: ts, attempts: 0, maxAttempts,
    };
  }

  /**
   * Enqueue an 'update' operation, replacing any existing pending update for the
   * same entity. This prevents the queue from accumulating many redundant updates
   * (e.g. rapid kitchen item-status taps) — only the latest state reaches the backend.
   */
  async enqueueUpdate(
    entityType: SyncEntityType,
    entityId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM sync_queue
       WHERE entity_type = ? AND entity_id = ? AND operation = 'update' AND status = 'pending'`,
      entityType, entityId
    );
    await this.enqueue(entityType, entityId, 'update', data);
  }

  async getNextItems(limit: number = 10, entityType?: string): Promise<SyncQueueItem[]> {
    const ts = now();
    if (entityType) {
      const rows = await this.db.getAllAsync<QueueItemRow>(
        `SELECT * FROM sync_queue
         WHERE status = 'pending' AND entity_type = ? AND (next_retry_at IS NULL OR next_retry_at <= ?)
         ORDER BY priority ASC, created_at ASC
         LIMIT ?`,
        entityType, ts, limit
      );
      return rows.map((r) => this.itemFromRow(r));
    }
    const rows = await this.db.getAllAsync<QueueItemRow>(
      `SELECT * FROM sync_queue
       WHERE status = 'pending' AND (next_retry_at IS NULL OR next_retry_at <= ?)
       ORDER BY priority ASC, created_at ASC
       LIMIT ?`,
      ts, limit
    );
    return rows.map((r) => this.itemFromRow(r));
  }

  async getItem(itemId: string): Promise<SyncQueueItem | null> {
    const row = await this.db.getFirstAsync<QueueItemRow>(
      'SELECT * FROM sync_queue WHERE id = ?', itemId
    );
    return row ? this.itemFromRow(row) : null;
  }

  async getItemsByEntity(entityType: SyncEntityType, entityId: string): Promise<SyncQueueItem[]> {
    const rows = await this.db.getAllAsync<QueueItemRow>(
      'SELECT * FROM sync_queue WHERE entity_type = ? AND entity_id = ?',
      entityType, entityId
    );
    return rows.map((r) => this.itemFromRow(r));
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const rows = await this.db.getAllAsync<QueueItemRow>(
      `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY priority ASC, created_at ASC`
    );
    return rows.map((r) => this.itemFromRow(r));
  }

  async getFailedItems(): Promise<SyncQueueItem[]> {
    const rows = await this.db.getAllAsync<QueueItemRow>(
      `SELECT * FROM sync_queue WHERE status = 'failed' ORDER BY created_at DESC`
    );
    return rows.map((r) => this.itemFromRow(r));
  }

  // ============== STATUS UPDATES ==============

  async markInProgress(itemId: string): Promise<void> {
    const ts = now();
    await this.db.runAsync(
      `UPDATE sync_queue SET status = 'in_progress', last_attempt_at = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?`,
      ts, ts, itemId
    );
  }

  async markCompleted(itemId: string): Promise<void> {
    const ts = now();
    await this.db.runAsync(
      `UPDATE sync_queue SET status = 'completed', updated_at = ? WHERE id = ?`,
      ts, itemId
    );
  }

  async markFailed(itemId: string, error: string, errorCode?: string): Promise<void> {
    const ts = now();
    const row = await this.db.getFirstAsync<QueueItemRow>(
      'SELECT * FROM sync_queue WHERE id = ?', itemId
    );
    if (!row) return;

    const attempts = row.attempts;
    const maxAttempts = row.max_attempts;

    if (attempts >= maxAttempts) {
      await this.db.runAsync(
        `UPDATE sync_queue SET status = 'failed', error = ?, error_code = ?, updated_at = ? WHERE id = ?`,
        error, errorCode || null, ts, itemId
      );
    } else {
      const delayIndex = Math.min(attempts, RETRY_DELAYS.length - 1);
      const delay = RETRY_DELAYS[delayIndex];
      const nextRetry = new Date(Date.now() + delay).toISOString();

      await this.db.runAsync(
        `UPDATE sync_queue SET status = 'pending', error = ?, error_code = ?, next_retry_at = ?, updated_at = ? WHERE id = ?`,
        error, errorCode || null, nextRetry, ts, itemId
      );
    }

    await this.logError(itemId, error, errorCode);
  }

  async cancelItem(itemId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE sync_queue SET status = 'cancelled', updated_at = ? WHERE id = ?`,
      now(), itemId
    );
  }

  async retryItem(itemId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE sync_queue SET status = 'pending', attempts = 0, error = NULL, error_code = NULL, next_retry_at = NULL, updated_at = ? WHERE id = ? AND status = 'failed'`,
      now(), itemId
    );
  }

  async retryAllFailed(): Promise<number> {
    const ts = now();
    const result = await this.db.runAsync(
      `UPDATE sync_queue SET status = 'pending', attempts = 0, error = NULL, error_code = NULL, next_retry_at = NULL, updated_at = ? WHERE status = 'failed'`,
      ts
    );
    return result.changes;
  }

  // ============== BATCH PROCESSING ==============

  async processBatch(
    processor: (item: SyncQueueItem) => Promise<boolean>,
    batchSize: number = 10,
    entityType?: string
  ): Promise<{ processed: number; succeeded: number; failed: number }> {
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const items = await this.getNextItems(batchSize, entityType);

      for (const item of items) {
        await this.markInProgress(item.id);
        processed++;

        try {
          const success = await processor(item);
          if (success) {
            await this.markCompleted(item.id);
            succeeded++;
          } else {
            await this.markFailed(item.id, 'Processor returned false');
            failed++;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          await this.markFailed(item.id, errorMsg);
          failed++;
        }
      }
    } catch (err) {
      if (__DEV__) console.error('[SyncQueueService] processBatch error:', err);
    }

    return { processed, succeeded, failed };
  }

  // ============== ERROR LOGGING ==============

  async logError(syncItemId: string, error: string, errorCode?: string): Promise<void> {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.db.runAsync(
      `INSERT INTO sync_errors (id, sync_item_id, error, error_code, timestamp, resolved)
       VALUES (?, ?, ?, ?, ?, 0)`,
      id, syncItemId, error, errorCode || null, now()
    );

    // Keep only last 100 errors
    await this.db.runAsync(
      `DELETE FROM sync_errors WHERE id NOT IN (SELECT id FROM sync_errors ORDER BY timestamp DESC LIMIT 100)`
    );
  }

  async getErrors(limit: number = 50): Promise<SyncError[]> {
    const rows = await this.db.getAllAsync<SyncErrorRow>(
      `SELECT * FROM sync_errors ORDER BY timestamp DESC LIMIT ?`, limit
    );
    return rows.map((r) => this.errorFromRow(r));
  }

  async resolveError(errorId: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE sync_errors SET resolved = 1 WHERE id = ?', errorId
    );
  }

  // ============== STATISTICS ==============

  async getStats(): Promise<SyncStats> {
    const [pending, inProgress, completed, failed, total] = await Promise.all([
      this.db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM sync_queue WHERE status = 'pending'`),
      this.db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM sync_queue WHERE status = 'in_progress'`),
      this.db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM sync_queue WHERE status = 'completed'`),
      this.db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM sync_queue WHERE status = 'failed'`),
      this.db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM sync_queue'),
    ]);

    const oldest = await this.db.getFirstAsync<{ created_at: string }>(
      `SELECT created_at FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
    );
    const newest = await this.db.getFirstAsync<{ created_at: string }>(
      `SELECT created_at FROM sync_queue WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1`
    );

    return {
      pending: pending?.cnt || 0,
      inProgress: inProgress?.cnt || 0,
      completed: completed?.cnt || 0,
      failed: failed?.cnt || 0,
      totalItems: total?.cnt || 0,
      oldestPending: oldest?.created_at,
      newestPending: newest?.created_at,
    };
  }

  async getLastSyncTime(): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'last_sync_time'`
    );
    return row?.value || null;
  }

  async updateLastSyncTime(): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('last_sync_time', ?, ?)`,
      now(), now()
    );
  }

  async resetLastSyncTime(): Promise<void> {
    await this.db.runAsync(`DELETE FROM sync_metadata WHERE key = 'last_sync_time'`);
  }

  // ============== CLEANUP ==============

  async cleanupCompleted(olderThan: Date): Promise<number> {
    const result = await this.db.runAsync(
      `DELETE FROM sync_queue WHERE status = 'completed' AND updated_at < ?`,
      olderThan.toISOString()
    );
    return result.changes;
  }

  async cleanupCancelled(): Promise<number> {
    const result = await this.db.runAsync(
      `DELETE FROM sync_queue WHERE status = 'cancelled'`
    );
    return result.changes;
  }

  async clearAll(): Promise<void> {
    await this.db.execAsync('DELETE FROM sync_queue');
    await this.db.execAsync('DELETE FROM sync_errors');
    await this.db.runAsync(`DELETE FROM sync_metadata WHERE key = 'last_sync_time'`);
  }
}

// Export singleton instance
export const syncQueueService = new SyncQueueService();
