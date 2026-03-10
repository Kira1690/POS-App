/**
 * PrinterStorageService - Persists printer configuration in SQLite.
 * Uses `printer_settings` table (DB v6) and `station_printers` table (DB v7).
 * Multi-transport fields added in DB v8.
 */

import { databaseService } from '@/services/database/DatabaseService';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { KitchenStation } from '@/types/order-extended.types';
import type { ConnectionType, PrinterAddress } from '@/services/printer/PrinterTransportManager';

export type { ConnectionType };

export interface PrinterConfig {
  receipt_printer: {
    enabled: boolean;
    connection_type: ConnectionType;
    ip_address: string;
    port: number;
    mac_address: string;
    device_name: string;
    ble_device_id: string;
    usb_vendor_id: number;
    usb_product_id: number;
    usb_device_name: string;
    paper_size: '58mm' | '80mm';
  };
  kitchen_printer: {
    enabled: boolean;
    connection_type: ConnectionType;
    ip_address: string;
    port: number;
    mac_address: string;
    device_name: string;
    ble_device_id: string;
    usb_vendor_id: number;
    usb_product_id: number;
    usb_device_name: string;
  };
}

export interface StationPrinter {
  id: string;
  station: KitchenStation;
  printer_name: string;
  connection_type: ConnectionType;
  ip_address: string;
  port: number;
  mac_address: string;
  device_name: string;
  ble_device_id: string;
  usb_vendor_id: number;
  usb_product_id: number;
  usb_device_name: string;
  enabled: boolean;
  updated_at: string;
}

/** Convert a stored printer config section to a PrinterAddress for transport dispatch. */
export function toPrinterAddress(
  cfg: Pick<PrinterConfig['receipt_printer'],
    'connection_type' | 'ip_address' | 'port' | 'mac_address' | 'device_name' |
    'ble_device_id' | 'usb_vendor_id' | 'usb_product_id' | 'usb_device_name'>
): PrinterAddress {
  return {
    connectionType: cfg.connection_type,
    ip: cfg.ip_address || undefined,
    port: cfg.port,
    macAddress: cfg.mac_address || undefined,
    deviceName: cfg.device_name || undefined,
    bleDeviceId: cfg.ble_device_id || undefined,
    usbVendorId: cfg.usb_vendor_id || undefined,
    usbProductId: cfg.usb_product_id || undefined,
    usbDeviceName: cfg.usb_device_name || undefined,
  };
}

/** Check whether a printer section has any configured address. */
export function hasPrinterAddress(
  cfg: Pick<PrinterConfig['receipt_printer'],
    'connection_type' | 'ip_address' | 'mac_address' | 'ble_device_id' | 'usb_device_name'>
): boolean {
  switch (cfg.connection_type) {
    case 'lan':       return !!cfg.ip_address;
    case 'bluetooth': return !!cfg.mac_address;
    case 'ble':       return !!cfg.ble_device_id;
    case 'usb':       return !!cfg.usb_device_name;
    default:          return false;
  }
}

const DEFAULT_CONFIG: PrinterConfig = {
  receipt_printer: {
    enabled: false,
    connection_type: 'lan',
    ip_address: '192.168.1.105',
    port: 9100,
    mac_address: '',
    device_name: '',
    ble_device_id: '',
    usb_vendor_id: 0,
    usb_product_id: 0,
    usb_device_name: '',
    paper_size: '80mm',
  },
  kitchen_printer: {
    enabled: false,
    connection_type: 'lan',
    ip_address: '',
    port: 9100,
    mac_address: '',
    device_name: '',
    ble_device_id: '',
    usb_vendor_id: 0,
    usb_product_id: 0,
    usb_device_name: '',
  },
};

interface PrinterSettingsRow {
  id: string;
  receipt_enabled: number;
  receipt_ip: string | null;
  receipt_port: number;
  receipt_paper_size: string;
  receipt_connection_type: string | null;
  receipt_mac_address: string | null;
  receipt_device_name: string | null;
  receipt_ble_device_id: string | null;
  receipt_usb_vendor_id: number | null;
  receipt_usb_product_id: number | null;
  receipt_usb_device_name: string | null;
  kitchen_enabled: number;
  kitchen_ip: string | null;
  kitchen_port: number;
  kitchen_connection_type: string | null;
  kitchen_mac_address: string | null;
  kitchen_device_name: string | null;
  kitchen_ble_device_id: string | null;
  kitchen_usb_vendor_id: number | null;
  kitchen_usb_product_id: number | null;
  kitchen_usb_device_name: string | null;
  updated_at: string;
}

interface StationPrinterRow {
  id: string;
  station: string;
  printer_name: string;
  ip_address: string;
  port: number;
  enabled: number;
  connection_type: string | null;
  mac_address: string | null;
  device_name: string | null;
  ble_device_id: string | null;
  usb_vendor_id: number | null;
  usb_product_id: number | null;
  usb_device_name: string | null;
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
        connection_type: (row.receipt_connection_type as ConnectionType) ?? 'lan',
        ip_address: row.receipt_ip ?? DEFAULT_CONFIG.receipt_printer.ip_address,
        port: row.receipt_port,
        paper_size: (row.receipt_paper_size as '58mm' | '80mm') ?? '80mm',
        mac_address: row.receipt_mac_address ?? '',
        device_name: row.receipt_device_name ?? '',
        ble_device_id: row.receipt_ble_device_id ?? '',
        usb_vendor_id: row.receipt_usb_vendor_id ?? 0,
        usb_product_id: row.receipt_usb_product_id ?? 0,
        usb_device_name: row.receipt_usb_device_name ?? '',
      },
      kitchen_printer: {
        enabled: row.kitchen_enabled === 1,
        connection_type: (row.kitchen_connection_type as ConnectionType) ?? 'lan',
        ip_address: row.kitchen_ip ?? '',
        port: row.kitchen_port,
        mac_address: row.kitchen_mac_address ?? '',
        device_name: row.kitchen_device_name ?? '',
        ble_device_id: row.kitchen_ble_device_id ?? '',
        usb_vendor_id: row.kitchen_usb_vendor_id ?? 0,
        usb_product_id: row.kitchen_usb_product_id ?? 0,
        usb_device_name: row.kitchen_usb_device_name ?? '',
      },
    };
  }

  async saveConfig(config: PrinterConfig): Promise<void> {
    const db = await this.ensureDb();
    const r = config.receipt_printer;
    const k = config.kitchen_printer;

    await db.runAsync(
      `INSERT OR REPLACE INTO printer_settings
        (id, receipt_enabled, receipt_ip, receipt_port, receipt_paper_size,
         receipt_connection_type, receipt_mac_address, receipt_device_name,
         receipt_ble_device_id, receipt_usb_vendor_id, receipt_usb_product_id, receipt_usb_device_name,
         kitchen_enabled, kitchen_ip, kitchen_port,
         kitchen_connection_type, kitchen_mac_address, kitchen_device_name,
         kitchen_ble_device_id, kitchen_usb_vendor_id, kitchen_usb_product_id, kitchen_usb_device_name,
         updated_at)
       VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      r.enabled ? 1 : 0,
      r.ip_address || null,
      r.port,
      r.paper_size,
      r.connection_type,
      r.mac_address || null,
      r.device_name || null,
      r.ble_device_id || null,
      r.usb_vendor_id || null,
      r.usb_product_id || null,
      r.usb_device_name || null,
      k.enabled ? 1 : 0,
      k.ip_address || null,
      k.port,
      k.connection_type,
      k.mac_address || null,
      k.device_name || null,
      k.ble_device_id || null,
      k.usb_vendor_id || null,
      k.usb_product_id || null,
      k.usb_device_name || null,
      new Date().toISOString()
    );
  }

  // ── Station Printers ──

  async getStationPrinters(): Promise<StationPrinter[]> {
    const db = await this.ensureDb();
    const rows = await db.getAllAsync<StationPrinterRow>(
      'SELECT * FROM station_printers ORDER BY station'
    );
    return rows.map(this.rowToStationPrinter);
  }

  async getStationPrinter(station: KitchenStation): Promise<StationPrinter | null> {
    const db = await this.ensureDb();
    const row = await db.getFirstAsync<StationPrinterRow>(
      'SELECT * FROM station_printers WHERE station = ?',
      station
    );
    return row ? this.rowToStationPrinter(row) : null;
  }

  async saveStationPrinter(printer: Omit<StationPrinter, 'updated_at'>): Promise<void> {
    const db = await this.ensureDb();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO station_printers
        (id, station, printer_name, ip_address, port, enabled,
         connection_type, mac_address, device_name, ble_device_id,
         usb_vendor_id, usb_product_id, usb_device_name, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      printer.id,
      printer.station,
      printer.printer_name,
      printer.ip_address,
      printer.port,
      printer.enabled ? 1 : 0,
      printer.connection_type,
      printer.mac_address || null,
      printer.device_name || null,
      printer.ble_device_id || null,
      printer.usb_vendor_id || null,
      printer.usb_product_id || null,
      printer.usb_device_name || null,
      now
    );
  }

  async deleteStationPrinter(station: KitchenStation): Promise<void> {
    const db = await this.ensureDb();
    await db.runAsync('DELETE FROM station_printers WHERE station = ?', station);
  }

  private rowToStationPrinter(row: StationPrinterRow): StationPrinter {
    return {
      id: row.id,
      station: row.station as KitchenStation,
      printer_name: row.printer_name,
      connection_type: (row.connection_type as ConnectionType) ?? 'lan',
      ip_address: row.ip_address,
      port: row.port,
      enabled: row.enabled === 1,
      mac_address: row.mac_address ?? '',
      device_name: row.device_name ?? '',
      ble_device_id: row.ble_device_id ?? '',
      usb_vendor_id: row.usb_vendor_id ?? 0,
      usb_product_id: row.usb_product_id ?? 0,
      usb_device_name: row.usb_device_name ?? '',
      updated_at: row.updated_at,
    };
  }
}

export const printerStorageService = new PrinterStorageService();
