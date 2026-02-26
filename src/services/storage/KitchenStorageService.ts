/**
 * Kitchen Storage Service - SQLite Implementation
 * Handles all kitchen ticket data persistence via expo-sqlite.
 */

import { databaseService } from '@/services/database/DatabaseService';
import { parseJsonColumn, fromSqlBool, toSqlBool, now } from '@/services/database/helpers';
import {
  KitchenTicket,
  TicketStatus,
  TicketPriority,
  TicketFilters,
  StationConfig,
  DEFAULT_STATION_CONFIGS,
  KitchenStation,
} from '@/types/kitchen-ticket.types';

// Row types
interface TicketRow {
  id: string; order_id: string; order_number: string;
  table_id: string; table_name: string;
  station: string; items: string;
  item_count: number; completed_item_count: number;
  status: string; priority: string;
  has_allergens: number; allergen_items: string | null;
  is_rush: number; is_overdue: number; overdue_by: number | null;
  special_instructions: string | null; delay_reason: string | null;
  assigned_to: string | null; assigned_to_name: string | null;
  estimated_prep_time: number; actual_prep_time: number | null;
  started_at: string | null; completed_at: string | null; served_at: string | null;
  pending_sync: number; synced_at: string | null;
  created_at: string; updated_at: string | null;
}

interface StationConfigRow {
  station: string; name: string; is_active: number;
  color: string | null; icon: string | null;
  default_prep_time: number; updated_at: string;
}

class KitchenStorageService {
  private get db() {
    return databaseService.getDatabase();
  }

  // ============== CONVERTERS ==============

  private ticketFromRow(row: TicketRow): KitchenTicket {
    return {
      id: row.id,
      orderId: row.order_id,
      orderNumber: row.order_number,
      tableId: row.table_id,
      tableName: row.table_name,
      station: row.station as KitchenStation,
      items: parseJsonColumn(row.items, []),
      itemCount: row.item_count,
      completedItemCount: row.completed_item_count,
      status: row.status as TicketStatus,
      priority: row.priority as TicketPriority,
      hasAllergens: fromSqlBool(row.has_allergens),
      allergenItems: parseJsonColumn(row.allergen_items, []),
      isRush: fromSqlBool(row.is_rush),
      isOverdue: fromSqlBool(row.is_overdue),
      overdueBy: row.overdue_by || undefined,
      specialInstructions: row.special_instructions || undefined,
      delayReason: row.delay_reason || undefined,
      assignedTo: row.assigned_to || undefined,
      assignedToName: row.assigned_to_name || undefined,
      estimatedPrepTime: row.estimated_prep_time,
      actualPrepTime: row.actual_prep_time || undefined,
      startedAt: row.started_at || undefined,
      completedAt: row.completed_at || undefined,
      servedAt: row.served_at || undefined,
      pendingSync: fromSqlBool(row.pending_sync),
      syncedAt: row.synced_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at || undefined,
    } as KitchenTicket;
  }

  private stationConfigFromRow(row: StationConfigRow): StationConfig {
    return {
      station: row.station as KitchenStation,
      name: row.name,
      isActive: fromSqlBool(row.is_active),
      color: row.color || undefined,
      icon: row.icon || undefined,
      defaultPrepTime: row.default_prep_time,
    } as StationConfig;
  }

  // ============== INITIALIZATION ==============

  async initialize(): Promise<void> {
    // Seed default station configs if empty
    const configCount = await this.db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM station_configs'
    );
    if ((configCount?.cnt || 0) === 0) {
      for (const config of DEFAULT_STATION_CONFIGS) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO station_configs (station, name, is_active, color, icon, default_prep_time, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          config.station, config.name, toSqlBool(config.isActive),
          config.color || null, config.icon || null, config.defaultPrepTime || 15, now()
        );
      }
    }
  }

  // ============== TICKET CRUD ==============

  async saveTicket(ticket: KitchenTicket): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO kitchen_tickets (id, order_id, order_number, table_id, table_name,
        station, items, item_count, completed_item_count,
        status, priority, has_allergens, allergen_items,
        is_rush, is_overdue, overdue_by, special_instructions, delay_reason,
        assigned_to, assigned_to_name, estimated_prep_time, actual_prep_time,
        started_at, completed_at, served_at,
        pending_sync, synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ticket.id, ticket.orderId, ticket.orderNumber,
      ticket.tableId, ticket.tableName,
      ticket.station, JSON.stringify(ticket.items || []),
      ticket.itemCount || 0, ticket.completedItemCount || 0,
      ticket.status, ticket.priority || 'normal',
      toSqlBool(ticket.hasAllergens), ticket.allergenItems ? JSON.stringify(ticket.allergenItems) : null,
      toSqlBool(ticket.isRush), toSqlBool(ticket.isOverdue), ticket.overdueBy || null,
      ticket.specialInstructions || null, ticket.delayReason || null,
      ticket.assignedTo || null, ticket.assignedToName || null,
      ticket.estimatedPrepTime || 15, ticket.actualPrepTime || null,
      ticket.startedAt || null, ticket.completedAt || null, ticket.servedAt || null,
      toSqlBool(ticket.pendingSync), ticket.syncedAt || null,
      ticket.createdAt || now(), ticket.updatedAt || now()
    );
  }

  async getTicket(ticketId: string): Promise<KitchenTicket | null> {
    const row = await this.db.getFirstAsync<TicketRow>(
      'SELECT * FROM kitchen_tickets WHERE id = ?', ticketId
    );
    return row ? this.ticketFromRow(row) : null;
  }

  async getActiveTickets(): Promise<KitchenTicket[]> {
    const rows = await this.db.getAllAsync<TicketRow>(
      `SELECT * FROM kitchen_tickets WHERE status NOT IN ('served', 'cancelled')
       ORDER BY
         CASE priority
           WHEN 'vip' THEN 0 WHEN 'rush' THEN 1 WHEN 'urgent' THEN 2
           WHEN 'high' THEN 3 WHEN 'normal' THEN 4 WHEN 'low' THEN 5
         END,
         created_at ASC`
    );
    return rows.map((r) => this.ticketFromRow(r));
  }

  async getTicketsByOrder(orderId: string): Promise<KitchenTicket[]> {
    const rows = await this.db.getAllAsync<TicketRow>(
      'SELECT * FROM kitchen_tickets WHERE order_id = ?', orderId
    );
    return rows.map((r) => this.ticketFromRow(r));
  }

  async getTicketsByStation(station: KitchenStation): Promise<KitchenTicket[]> {
    const rows = await this.db.getAllAsync<TicketRow>(
      `SELECT * FROM kitchen_tickets WHERE station = ? AND status NOT IN ('served', 'cancelled')
       ORDER BY
         CASE priority
           WHEN 'vip' THEN 0 WHEN 'rush' THEN 1 WHEN 'urgent' THEN 2
           WHEN 'high' THEN 3 WHEN 'normal' THEN 4 WHEN 'low' THEN 5
         END,
         created_at ASC`,
      station
    );
    return rows.map((r) => this.ticketFromRow(r));
  }

  async getTickets(filters?: TicketFilters): Promise<KitchenTicket[]> {
    let sql = 'SELECT * FROM kitchen_tickets';
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];

    if (filters) {
      if (filters.station && filters.station !== 'all') {
        conditions.push('station = ?');
        params.push(filters.station);
      }
      if (filters.status && filters.status !== 'all') {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        conditions.push('priority = ?');
        params.push(filters.priority);
      }
      if (filters.hasAllergens !== undefined) {
        conditions.push('has_allergens = ?');
        params.push(filters.hasAllergens ? 1 : 0);
      }
      if (filters.isOverdue !== undefined) {
        conditions.push('is_overdue = ?');
        params.push(filters.isOverdue ? 1 : 0);
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ` ORDER BY
      CASE priority
        WHEN 'vip' THEN 0 WHEN 'rush' THEN 1 WHEN 'urgent' THEN 2
        WHEN 'high' THEN 3 WHEN 'normal' THEN 4 WHEN 'low' THEN 5
      END,
      created_at ASC`;

    const rows = await this.db.getAllAsync<TicketRow>(sql, ...params);
    let tickets = rows.map((r) => this.ticketFromRow(r));

    // Handle search query in JS (needs item name matching)
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.orderNumber.toLowerCase().includes(query) ||
          t.tableName.toLowerCase().includes(query) ||
          t.items.some((item: { name: string }) => item.name.toLowerCase().includes(query))
      );
    }

    return tickets;
  }

  async updateTicket(ticketId: string, updates: Partial<KitchenTicket>): Promise<KitchenTicket | null> {
    const existing = await this.getTicket(ticketId);
    if (!existing) return null;

    const updated: KitchenTicket = { ...existing, ...updates };
    await this.saveTicket(updated);
    return updated;
  }

  async deleteTicket(ticketId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM kitchen_tickets WHERE id = ?', ticketId);
  }

  // ============== BULK OPERATIONS ==============

  async saveTickets(tickets: KitchenTicket[]): Promise<void> {
    for (const ticket of tickets) {
      await this.saveTicket(ticket);
    }
  }

  async deleteTicketsByOrder(orderId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM kitchen_tickets WHERE order_id = ?', orderId);
  }

  async clearOldTickets(beforeDate: Date): Promise<number> {
    const result = await this.db.runAsync(
      `DELETE FROM kitchen_tickets WHERE status IN ('served', 'cancelled') AND created_at < ?`,
      beforeDate.toISOString()
    );
    return result.changes;
  }

  // ============== STATION CONFIG ==============

  async getStationConfigs(): Promise<StationConfig[]> {
    const rows = await this.db.getAllAsync<StationConfigRow>(
      'SELECT * FROM station_configs ORDER BY station'
    );
    return rows.length > 0
      ? rows.map((r) => this.stationConfigFromRow(r))
      : DEFAULT_STATION_CONFIGS;
  }

  async getStationConfig(station: KitchenStation): Promise<StationConfig | null> {
    const row = await this.db.getFirstAsync<StationConfigRow>(
      'SELECT * FROM station_configs WHERE station = ?', station
    );
    if (row) return this.stationConfigFromRow(row);
    return DEFAULT_STATION_CONFIGS.find((c) => c.station === station) || null;
  }

  async updateStationConfig(station: KitchenStation, updates: Partial<StationConfig>): Promise<void> {
    const existing = await this.getStationConfig(station);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    await this.db.runAsync(
      `INSERT OR REPLACE INTO station_configs (station, name, is_active, color, icon, default_prep_time, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      updated.station, updated.name, toSqlBool(updated.isActive),
      updated.color || null, updated.icon || null, updated.defaultPrepTime || 15, now()
    );
  }

  async resetStationConfigs(): Promise<void> {
    await this.db.execAsync('DELETE FROM station_configs');
    for (const config of DEFAULT_STATION_CONFIGS) {
      await this.db.runAsync(
        `INSERT INTO station_configs (station, name, is_active, color, icon, default_prep_time, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        config.station, config.name, toSqlBool(config.isActive),
        config.color || null, config.icon || null, config.defaultPrepTime || 15, now()
      );
    }
  }

  // ============== SYNC OPERATIONS ==============

  async getUnsyncedTickets(): Promise<KitchenTicket[]> {
    const rows = await this.db.getAllAsync<TicketRow>(
      'SELECT * FROM kitchen_tickets WHERE pending_sync = 1'
    );
    return rows.map((r) => this.ticketFromRow(r));
  }

  async markAsSynced(ticketIds: string[]): Promise<void> {
    if (ticketIds.length === 0) return;
    const ts = now();
    const placeholders = ticketIds.map(() => '?').join(', ');
    await this.db.runAsync(
      `UPDATE kitchen_tickets SET pending_sync = 0, synced_at = ? WHERE id IN (${placeholders})`,
      ts, ...ticketIds
    );
  }

  async getLastSyncTime(): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'kitchen_last_sync'`
    );
    return row?.value || null;
  }

  async updateLastSyncTime(): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('kitchen_last_sync', ?, ?)`,
      now(), now()
    );
  }

  // ============== STATISTICS ==============

  async getStats(): Promise<{
    totalTickets: number;
    pendingTickets: number;
    preparingTickets: number;
    readyTickets: number;
    overdueTickets: number;
    byStation: Record<KitchenStation, number>;
  }> {
    const activeRows = await this.db.getAllAsync<{ station: string; status: string; is_overdue: number }>(
      `SELECT station, status, is_overdue FROM kitchen_tickets WHERE status NOT IN ('served', 'cancelled')`
    );

    const byStation: Record<KitchenStation, number> = {
      hot_kitchen: 0, cold_kitchen: 0, grill: 0, desserts: 0, beverages: 0, bar: 0,
    };

    let pending = 0;
    let preparing = 0;
    let ready = 0;
    let overdue = 0;

    for (const row of activeRows) {
      if (row.station in byStation) {
        byStation[row.station as KitchenStation]++;
      }
      if (row.status === 'pending') pending++;
      if (row.status === 'preparing') preparing++;
      if (row.status === 'ready') ready++;
      if (row.is_overdue === 1) overdue++;
    }

    return {
      totalTickets: activeRows.length,
      pendingTickets: pending,
      preparingTickets: preparing,
      readyTickets: ready,
      overdueTickets: overdue,
      byStation,
    };
  }

  // ============== UTILITY ==============

  async clearAll(): Promise<void> {
    await this.db.execAsync('DELETE FROM kitchen_tickets');
    // Reset station configs to defaults
    await this.resetStationConfigs();
    await this.db.runAsync(`DELETE FROM sync_metadata WHERE key = 'kitchen_last_sync'`);
  }
}

// Export singleton instance
export const kitchenStorageService = new KitchenStorageService();
