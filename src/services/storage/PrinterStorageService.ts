/**
 * PrinterStorageService - Persists printer configuration in SQLite.
 * Uses `printer_settings` table added in DB v6 migration.
 */

import { databaseService } from '@/services/database/DatabaseService';
import type { SQLiteDatabase } from 'expo-sqlite';

export interface PrinterConfig {
  receipt_printer: {
    enabled: boolean;
    ip_address: string;
    port: number;
    paper_size: '58mm' | '80mm';
  };
  kitchen_printer: {
    enabled: boolean;
    ip_address: string;
    port: number;
  };
}

const DEFAULT_CONFIG: PrinterConfig = {
  receipt_printer: {
    enabled: false,
    ip_address: '192.168.1.105',
    port: 9100,
    paper_size: '80mm',
  },
  kitchen_printer: {
    enabled: false,
    ip_address: '',
    port: 9100,
  },
};

interface PrinterSettingsRow {
  id: string;
  receipt_enabled: number;
  receipt_ip: string | null;
  receipt_port: number;
  receipt_paper_size: string;
  kitchen_enabled: number;
  kitchen_ip: string | null;
  kitchen_port: number;
  updated_at: string;
}

class PrinterStorageService {
  private _db: SQLiteDatabase | null = null;

  private async ensureDb(): Promise<SQLiteDatabase> {
    if (!this._db) {
      this._db = await databaseService.initialize();
    }
    return this._db;
  }

  async getConfig(): Promise<PrinterConfig> {
    const db = await this.ensureDb();
    const row = await db.getFirstAsync<PrinterSettingsRow>(
      `SELECT * FROM printer_settings WHERE id = 'default'`
    );
    if (!row) return { ...DEFAULT_CONFIG };

    return {
      receipt_printer: {
        enabled: row.receipt_enabled === 1,
        ip_address: row.receipt_ip ?? DEFAULT_CONFIG.receipt_printer.ip_address,
        port: row.receipt_port,
        paper_size: (row.receipt_paper_size as '58mm' | '80mm') ?? '80mm',
      },
      kitchen_printer: {
        enabled: row.kitchen_enabled === 1,
        ip_address: row.kitchen_ip ?? '',
        port: row.kitchen_port,
      },
    };
  }

  async saveConfig(config: PrinterConfig): Promise<void> {
    const db = await this.ensureDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO printer_settings
        (id, receipt_enabled, receipt_ip, receipt_port, receipt_paper_size,
         kitchen_enabled, kitchen_ip, kitchen_port, updated_at)
       VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?)`,
      config.receipt_printer.enabled ? 1 : 0,
      config.receipt_printer.ip_address || null,
      config.receipt_printer.port,
      config.receipt_printer.paper_size,
      config.kitchen_printer.enabled ? 1 : 0,
      config.kitchen_printer.ip_address || null,
      config.kitchen_printer.port,
      new Date().toISOString()
    );
  }
}

export const printerStorageService = new PrinterStorageService();
