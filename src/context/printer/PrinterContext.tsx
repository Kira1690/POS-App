/**
 * PrinterContext - Central print context for receipt and KOT printing.
 *
 * printKOT logic:
 * - No station printers configured -> print ALL items to default kitchen printer
 * - Station printers configured -> group items by kitchen_station, print each group
 *   to its station printer; unassigned stations fall back to default kitchen printer
 * - No kitchen printer at all -> show toast "Kitchen printer not configured"
 *
 * printReceipt logic:
 * - Receipt printer enabled + address -> send to epsonPrinterService
 * - Else -> show toast "Receipt printer not configured"
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { epsonPrinterService } from '@/services/printer/EpsonPrinterService';
import { printerTransportManager } from '@/services/printer/PrinterTransportManager';
import {
  printerStorageService,
  toPrinterAddress,
  hasPrinterAddress,
  type PrinterConfig,
  type StationPrinter,
  type ConnectionType,
} from '@/services/storage/PrinterStorageService';
import type { PrinterAddress, DiscoveredPrinter } from '@/services/printer/PrinterTransportManager';
import { activityLogService } from '@/services/storage/ActivityLogService';
import type { UnifiedOrder } from '@/types/unified-order.types';
import type { KitchenStation } from '@/types/order-extended.types';
import { showToast } from '@/utils/toast';

interface PrinterContextValue {
  config: PrinterConfig;
  stationPrinters: StationPrinter[];
  printReceipt: (order: UnifiedOrder) => Promise<void>;
  printKOT: (order: UnifiedOrder) => Promise<void>;
  printStationKOT: (order: UnifiedOrder, station: KitchenStation) => Promise<void>;
  testPrinter: (address: PrinterAddress) => Promise<boolean>;
  printTestPage: (address: PrinterAddress) => Promise<void>;
  discoverPrinters: (type?: ConnectionType) => Promise<DiscoveredPrinter[]>;
  refreshConfig: () => Promise<void>;
}

const DEFAULT_CONFIG: PrinterConfig = {
  receipt_printer: {
    enabled: false, connection_type: 'lan', ip_address: '192.168.1.105', port: 9100,
    mac_address: '', device_name: '', ble_device_id: '',
    usb_vendor_id: 0, usb_product_id: 0, usb_device_name: '', paper_size: '80mm',
  },
  kitchen_printer: {
    enabled: false, connection_type: 'lan', ip_address: '', port: 9100,
    mac_address: '', device_name: '', ble_device_id: '',
    usb_vendor_id: 0, usb_product_id: 0, usb_device_name: '',
  },
};

const PrinterContext = createContext<PrinterContextValue | null>(null);

export const usePrinter = (): PrinterContextValue => {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error('usePrinter must be used within PrinterProvider');
  return ctx;
};

function addressDesc(address: PrinterAddress): string {
  switch (address.connectionType) {
    case 'lan':       return `${address.ip}:${address.port}`;
    case 'bluetooth': return address.macAddress ?? 'BT';
    case 'ble':       return address.bleDeviceId ?? 'BLE';
    case 'usb':       return address.usbDeviceName ?? 'USB';
    default:          return address.connectionType;
  }
}

export const PrinterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PrinterConfig>(DEFAULT_CONFIG);
  const [stationPrinters, setStationPrinters] = useState<StationPrinter[]>([]);

  const refreshConfig = useCallback(async () => {
    try {
      const [cfg, sp] = await Promise.all([
        printerStorageService.getConfig(),
        printerStorageService.getStationPrinters(),
      ]);
      setConfig(cfg);
      setStationPrinters(sp);
    } catch {
      // Use defaults on error
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const printReceipt = useCallback(async (order: UnifiedOrder) => {
    const { receipt_printer } = config;
    if (!receipt_printer.enabled || !hasPrinterAddress(receipt_printer)) {
      showToast({
        type: 'info',
        title: 'Printer Not Configured',
        message: 'Go to Settings > Printer Management to configure receipt printer',
      });
      return;
    }

    const address = toPrinterAddress(receipt_printer);
    const desc = addressDesc(address);
    try {
      await epsonPrinterService.printReceipt(address, order, receipt_printer.paper_size);
      showToast({ type: 'success', title: 'Printing', message: 'Sent to receipt printer' });
      activityLogService.logEvent({
        timestamp: new Date().toISOString(),
        eventType: 'print_receipt_ok',
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableName: order.tableName,
        description: `Receipt printed for ${order.orderNumber} (${desc})`,
        metadata: { connectionType: receipt_printer.connection_type, address: desc },
      }).catch(() => { /* silent */ });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Could not reach receipt printer';
      showToast({ type: 'error', title: 'Print Failed', message: errMsg });
      activityLogService.logEvent({
        timestamp: new Date().toISOString(),
        eventType: 'print_receipt_fail',
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableName: order.tableName,
        description: `Receipt print failed: ${errMsg} (${desc})`,
        metadata: { connectionType: receipt_printer.connection_type, address: desc, error: errMsg },
      }).catch(() => { /* silent */ });
    }
  }, [config]);

  const printKOT = useCallback(async (order: UnifiedOrder) => {
    const { kitchen_printer } = config;
    const enabledStationPrinters = stationPrinters.filter(sp => sp.enabled);

    const kitchenConfigured = kitchen_printer.enabled && hasPrinterAddress(kitchen_printer);

    if (!kitchenConfigured && enabledStationPrinters.length === 0) {
      showToast({
        type: 'info',
        title: 'Printer Not Configured',
        message: 'Go to Settings > Printer Management to configure kitchen printer',
      });
      return;
    }

    // No station printers -> print ALL items to default kitchen printer
    if (enabledStationPrinters.length === 0) {
      const address = toPrinterAddress(kitchen_printer);
      const desc = addressDesc(address);
      try {
        await epsonPrinterService.printKitchenTicket(address, order);
        showToast({ type: 'success', title: 'KOT Sent', message: 'Sent to kitchen printer' });
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'print_kot_ok',
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableName: order.tableName,
          description: `KOT printed for ${order.orderNumber} (${desc})`,
          metadata: { connectionType: kitchen_printer.connection_type, address: desc },
        }).catch(() => { /* silent */ });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Could not reach kitchen printer';
        showToast({ type: 'error', title: 'Print Failed', message: errMsg });
        activityLogService.logEvent({
          timestamp: new Date().toISOString(),
          eventType: 'print_kot_fail',
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableName: order.tableName,
          description: `KOT print failed: ${errMsg} (${desc})`,
          metadata: { connectionType: kitchen_printer.connection_type, address: desc, error: errMsg },
        }).catch(() => { /* silent */ });
      }
      return;
    }

    // Station printers exist -> group items by kitchen_station
    const stationMap = new Map<KitchenStation, typeof order.items>();
    const fallbackItems: typeof order.items = [];

    for (const item of order.items) {
      const station = item.kitchenStation;
      const hasStationPrinter = enabledStationPrinters.some(sp => sp.station === station);
      if (hasStationPrinter) {
        const existing = stationMap.get(station) || [];
        existing.push(item);
        stationMap.set(station, existing);
      } else {
        fallbackItems.push(item);
      }
    }

    type PrintResult = { station: string; ok: boolean; desc: string; connectionType: ConnectionType; error?: string };
    const printJobs: Promise<PrintResult>[] = [];

    for (const [station, items] of stationMap.entries()) {
      const sp = enabledStationPrinters.find(p => p.station === station)!;
      const addr = toPrinterAddress(sp);
      const desc = addressDesc(addr);
      const stationOrder = { ...order, items };
      printJobs.push(
        epsonPrinterService
          .printKitchenTicket(addr, stationOrder, station)
          .then((): PrintResult => ({ station, ok: true, desc, connectionType: sp.connection_type }))
          .catch((err: unknown): PrintResult => ({
            station, ok: false, desc, connectionType: sp.connection_type,
            error: err instanceof Error ? err.message : String(err),
          }))
      );
    }

    if (fallbackItems.length > 0 && kitchenConfigured) {
      const addr = toPrinterAddress(kitchen_printer);
      const desc = addressDesc(addr);
      const fallbackOrder = { ...order, items: fallbackItems };
      printJobs.push(
        epsonPrinterService
          .printKitchenTicket(addr, fallbackOrder)
          .then((): PrintResult => ({ station: 'default', ok: true, desc, connectionType: kitchen_printer.connection_type }))
          .catch((err: unknown): PrintResult => ({
            station: 'default', ok: false, desc, connectionType: kitchen_printer.connection_type,
            error: err instanceof Error ? err.message : String(err),
          }))
      );
    }

    const results = await Promise.allSettled(printJobs);
    const settled = results
      .map(r => r.status === 'fulfilled' ? r.value : null)
      .filter((r): r is PrintResult => r !== null);
    const failures = settled.filter(r => !r.ok);

    for (const r of settled) {
      activityLogService.logEvent({
        timestamp: new Date().toISOString(),
        eventType: r.ok ? 'print_kot_ok' : 'print_kot_fail',
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableName: order.tableName,
        description: r.ok
          ? `KOT printed for ${order.orderNumber} → ${r.station} (${r.desc})`
          : `KOT print failed for ${r.station}: ${r.error ?? 'Unknown'} (${r.desc})`,
        metadata: { station: r.station, connectionType: r.connectionType, address: r.desc, ...(r.error ? { error: r.error } : {}) },
      }).catch(() => { /* silent */ });
    }

    if (failures.length > 0) {
      showToast({ type: 'warning', title: 'Partial Print', message: `Failed for: ${failures.map(f => f.station).join(', ')}` });
    } else {
      showToast({ type: 'success', title: 'KOT Sent', message: 'Sent to kitchen printers' });
    }
  }, [config, stationPrinters]);

  const printStationKOT = useCallback(async (order: UnifiedOrder, station: KitchenStation) => {
    const enabledStationPrinters = stationPrinters.filter(sp => sp.enabled);
    const sp = enabledStationPrinters.find(p => p.station === station);

    const address = sp
      ? toPrinterAddress(sp)
      : hasPrinterAddress(config.kitchen_printer)
        ? toPrinterAddress(config.kitchen_printer)
        : null;

    if (!address) {
      showToast({ type: 'info', title: 'Printer Not Configured', message: `No printer configured for ${station}` });
      return;
    }

    const desc = addressDesc(address);
    const connectionType = sp?.connection_type ?? config.kitchen_printer.connection_type;
    try {
      await epsonPrinterService.printKitchenTicket(address, order, station);
      showToast({ type: 'success', title: 'KOT Sent', message: `Reprinted for ${station}` });
      activityLogService.logEvent({
        timestamp: new Date().toISOString(),
        eventType: 'print_kot_ok',
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableName: order.tableName,
        description: `KOT reprinted for ${order.orderNumber} → ${station} (${desc})`,
        metadata: { station, connectionType, address: desc },
      }).catch(() => { /* silent */ });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Could not reach printer';
      showToast({ type: 'error', title: 'Print Failed', message: errMsg });
      activityLogService.logEvent({
        timestamp: new Date().toISOString(),
        eventType: 'print_kot_fail',
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableName: order.tableName,
        description: `KOT reprint failed for ${station}: ${errMsg} (${desc})`,
        metadata: { station, connectionType, address: desc, error: errMsg },
      }).catch(() => { /* silent */ });
    }
  }, [config, stationPrinters]);

  const testPrinter = useCallback(async (address: PrinterAddress): Promise<boolean> => {
    const ok = await epsonPrinterService.testConnection(address);
    const desc = addressDesc(address);
    activityLogService.logEvent({
      timestamp: new Date().toISOString(),
      eventType: ok ? 'printer_test_ok' : 'printer_test_fail',
      description: ok ? `Connection test passed: ${desc}` : `Connection test failed: ${desc}`,
      metadata: { connectionType: address.connectionType, address: desc },
    }).catch(() => { /* silent */ });
    return ok;
  }, []);

  const printTestPageFn = useCallback(async (address: PrinterAddress): Promise<void> => {
    await epsonPrinterService.printTestPage(address);
  }, []);

  const discoverPrinters = useCallback(
    (type?: ConnectionType) => printerTransportManager.discoverAll(type),
    []
  );

  const value = useMemo<PrinterContextValue>(() => ({
    config,
    stationPrinters,
    printReceipt,
    printKOT,
    printStationKOT,
    testPrinter,
    printTestPage: printTestPageFn,
    discoverPrinters,
    refreshConfig,
  }), [config, stationPrinters, printReceipt, printKOT, printStationKOT, testPrinter, printTestPageFn, discoverPrinters, refreshConfig]);

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
};
