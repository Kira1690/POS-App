/**
 * ActivityLogService - Stores and retrieves operational activity events.
 * Events are stored in SQLite `activity_logs` table.
 * Auto-purges entries older than 7 days.
 */

import { databaseService } from '@/services/database/DatabaseService';
import type { SQLiteDatabase } from 'expo-sqlite';

export type ActivityEventType =
  | 'order_created'
  | 'sent_to_kitchen'
  | 'ready'
  | 'served'
  | 'paid'
  | 'cancelled'
  | 'items_transferred'
  | 'discount_applied';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  eventType: ActivityEventType;
  orderId: string;
  orderNumber?: string;
  tableName?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface ActivityLogRow {
  id: string;
  timestamp: string;
  event_type: string;
  order_id: string;
  order_number: string | null;
  table_name: string | null;
  description: string | null;
  metadata: string | null;
}

class ActivityLogService {
  private _db: SQLiteDatabase | null = null;

  private async ensureDb(): Promise<SQLiteDatabase> {
    if (!this._db) {
      this._db = await databaseService.initialize();
    }
    return this._db;
  }

  private rowToEvent(row: ActivityLogRow): ActivityEvent {
    return {
      id: row.id,
      timestamp: row.timestamp,
      eventType: row.event_type as ActivityEventType,
      orderId: row.order_id,
      orderNumber: row.order_number ?? undefined,
      tableName: row.table_name ?? undefined,
      description: row.description ?? '',
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  async logEvent(event: Omit<ActivityEvent, 'id'>): Promise<void> {
    const db = await this.ensureDb();
    const id = `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.runAsync(
      `INSERT INTO activity_logs
        (id, timestamp, event_type, order_id, order_number, table_name, description, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      event.timestamp,
      event.eventType,
      event.orderId,
      event.orderNumber ?? null,
      event.tableName ?? null,
      event.description,
      event.metadata ? JSON.stringify(event.metadata) : null
    );
  }

  async getEvents(since?: Date, limit = 100): Promise<ActivityEvent[]> {
    const db = await this.ensureDb();
    const cutoff = (since ?? new Date(Date.now() - 24 * 60 * 60 * 1000)).toISOString();

    const rows = await db.getAllAsync<ActivityLogRow>(
      `SELECT * FROM activity_logs
       WHERE timestamp >= ?
       ORDER BY timestamp DESC
       LIMIT ?`,
      cutoff,
      limit
    );
    return rows.map(this.rowToEvent);
  }

  async clearOldEvents(): Promise<void> {
    const db = await this.ensureDb();
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.runAsync(
      `DELETE FROM activity_logs WHERE timestamp < ?`,
      cutoff
    );
  }
}

export const activityLogService = new ActivityLogService();
