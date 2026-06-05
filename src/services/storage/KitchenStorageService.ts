/**
 * Kitchen Storage Service - SQLite Implementation
 * Handles kitchen station configuration persistence via expo-sqlite.
 * Order and kitchen display data is managed by UnifiedOrderStorageService (SSOT).
 */

import { databaseService } from '@/services/database/DatabaseService';
import { toSqlBool, fromSqlBool, now } from '@/services/database/helpers';
import {
  StationConfig,
  DEFAULT_STATION_CONFIGS,
  KitchenStation,
} from '@/types/kitchen-ticket.types';

interface StationConfigRow {
  station: string; name: string; is_active: number;
  color: string | null; icon: string | null;
  default_prep_time: number; updated_at: string;
  alert_threshold: number | null; display_order: number | null;
  max_concurrent: number | null;
}

class KitchenStorageService {
  private get db() {
    return databaseService.getDatabase();
  }

  // ============== CONVERTERS ==============

  private stationConfigFromRow(row: StationConfigRow): StationConfig {
    return {
      station: row.station as KitchenStation,
      name: row.name,
      isActive: fromSqlBool(row.is_active),
      color: row.color || '#6B7280',
      icon: row.icon || 'chef-hat',
      defaultPrepTime: row.default_prep_time,
      alertThreshold: row.alert_threshold ?? 20,
      displayOrder: row.display_order ?? 0,
      maxConcurrentTickets: row.max_concurrent ?? 10,
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
          `INSERT OR REPLACE INTO station_configs (station, name, is_active, color, icon, default_prep_time, alert_threshold, display_order, max_concurrent, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          config.station, config.name, toSqlBool(config.isActive),
          config.color || null, config.icon || null, config.defaultPrepTime || 15,
          config.alertThreshold ?? 20, config.displayOrder ?? 0, config.maxConcurrentTickets ?? 10,
          now()
        );
      }
    }
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

  async updateStationConfig(station: string, updates: Partial<StationConfig>): Promise<void> {
    const existing = await this.getStationConfig(station as KitchenStation);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    await this.db.runAsync(
      `INSERT OR REPLACE INTO station_configs (station, name, is_active, color, icon, default_prep_time, alert_threshold, display_order, max_concurrent, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      updated.station, updated.name, toSqlBool(updated.isActive),
      updated.color || null, updated.icon || null, updated.defaultPrepTime || 15,
      updated.alertThreshold ?? 20, updated.displayOrder ?? 0, updated.maxConcurrentTickets ?? 10,
      now()
    );
  }

  async addStationConfig(station: string, config: Omit<StationConfig, 'station'>): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO station_configs (station, name, is_active, color, icon, default_prep_time, alert_threshold, display_order, max_concurrent, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      station, config.name, toSqlBool(config.isActive),
      config.color || null, config.icon || null, config.defaultPrepTime || 15,
      config.alertThreshold ?? 20, config.displayOrder ?? 0, config.maxConcurrentTickets ?? 10,
      now()
    );
  }

  async deleteStationConfig(station: string): Promise<void> {
    await this.db.runAsync('DELETE FROM station_configs WHERE station = ?', station);
  }

  async resetStationConfigs(): Promise<void> {
    await this.db.execAsync('DELETE FROM station_configs');
    for (const config of DEFAULT_STATION_CONFIGS) {
      await this.db.runAsync(
        `INSERT INTO station_configs (station, name, is_active, color, icon, default_prep_time, alert_threshold, display_order, max_concurrent, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        config.station, config.name, toSqlBool(config.isActive),
        config.color || null, config.icon || null, config.defaultPrepTime || 15,
        config.alertThreshold ?? 20, config.displayOrder ?? 0, config.maxConcurrentTickets ?? 10,
        now()
      );
    }
  }

  // ============== UTILITY ==============

  async clearAll(): Promise<void> {
    await this.resetStationConfigs();
  }
}

// Export singleton instance
export const kitchenStorageService = new KitchenStorageService();
