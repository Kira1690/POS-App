/**
 * usePrinterSettings - Encapsulates all printer settings state and actions.
 * Supports LAN, Bluetooth, BLE, and USB connection types.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  printerStorageService,
  toPrinterAddress,
  type PrinterConfig,
  type StationPrinter,
  type ConnectionType,
} from '@/services/storage/PrinterStorageService';
import { epsonPrinterService } from '@/services/printer/EpsonPrinterService';
import { printerTransportManager } from '@/services/printer/PrinterTransportManager';
import type { PrinterAddress, DiscoveredPrinter } from '@/services/printer/PrinterTransportManager';
import { showToast } from '@/utils/toast';
import type { KitchenStation } from '@/types/order-extended.types';

export type ConnectionStatus = 'idle' | 'testing' | 'ok' | 'error';
export type { ConnectionType };

interface PrinterStatusCache {
  status: ConnectionStatus;
  timestamp?: number;
}

export function usePrinterSettings(onChangesDetected: (hasChanges: boolean) => void) {
  // Receipt printer state
  const [receiptEnabled, setReceiptEnabled] = useState(false);
  const [receiptConnectionType, setReceiptConnectionType] = useState<ConnectionType>('lan');
  const [receiptIP, setReceiptIP] = useState('192.168.1.105');
  const [receiptPort, setReceiptPort] = useState('9100');
  const [receiptMacAddress, setReceiptMacAddress] = useState('');
  const [receiptDeviceName, setReceiptDeviceName] = useState('');
  const [receiptBleDeviceId, setReceiptBleDeviceId] = useState('');
  const [receiptUsbVendorId, setReceiptUsbVendorId] = useState(0);
  const [receiptUsbProductId, setReceiptUsbProductId] = useState(0);
  const [receiptUsbDeviceName, setReceiptUsbDeviceName] = useState('');
  const [receiptPaper, setReceiptPaper] = useState<'58mm' | '80mm'>('80mm');
  const [receiptStatus, setReceiptStatus] = useState<PrinterStatusCache>({ status: 'idle' });

  // Kitchen printer state
  const [kitchenEnabled, setKitchenEnabled] = useState(false);
  const [kitchenConnectionType, setKitchenConnectionType] = useState<ConnectionType>('lan');
  const [kitchenIP, setKitchenIP] = useState('');
  const [kitchenPort, setKitchenPort] = useState('9100');
  const [kitchenMacAddress, setKitchenMacAddress] = useState('');
  const [kitchenDeviceName, setKitchenDeviceName] = useState('');
  const [kitchenBleDeviceId, setKitchenBleDeviceId] = useState('');
  const [kitchenUsbVendorId, setKitchenUsbVendorId] = useState(0);
  const [kitchenUsbProductId, setKitchenUsbProductId] = useState(0);
  const [kitchenUsbDeviceName, setKitchenUsbDeviceName] = useState('');
  const [kitchenStatus, setKitchenStatus] = useState<PrinterStatusCache>({ status: 'idle' });

  // Station printers
  const [stationPrinters, setStationPrinters] = useState<StationPrinter[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialLoadDone = useRef(false);

  const markChanged = useCallback(() => {
    setHasChanges(true);
    onChangesDetected(true);
  }, [onChangesDetected]);

  // Load config on mount
  useEffect(() => {
    Promise.all([
      printerStorageService.getConfig(),
      printerStorageService.getStationPrinters(),
    ]).then(([config, sp]) => {
      const r = config.receipt_printer;
      setReceiptEnabled(r.enabled);
      setReceiptConnectionType(r.connection_type);
      setReceiptIP(r.ip_address);
      setReceiptPort(String(r.port));
      setReceiptMacAddress(r.mac_address);
      setReceiptDeviceName(r.device_name);
      setReceiptBleDeviceId(r.ble_device_id);
      setReceiptUsbVendorId(r.usb_vendor_id);
      setReceiptUsbProductId(r.usb_product_id);
      setReceiptUsbDeviceName(r.usb_device_name);
      setReceiptPaper(r.paper_size);

      const k = config.kitchen_printer;
      setKitchenEnabled(k.enabled);
      setKitchenConnectionType(k.connection_type);
      setKitchenIP(k.ip_address);
      setKitchenPort(String(k.port));
      setKitchenMacAddress(k.mac_address);
      setKitchenDeviceName(k.device_name);
      setKitchenBleDeviceId(k.ble_device_id);
      setKitchenUsbVendorId(k.usb_vendor_id);
      setKitchenUsbProductId(k.usb_product_id);
      setKitchenUsbDeviceName(k.usb_device_name);

      setStationPrinters(sp);
      initialLoadDone.current = true;
    }).catch(() => { /* use defaults */ });
  }, []);

  // Build current receipt address from state
  const buildReceiptAddress = useCallback((): PrinterAddress => ({
    connectionType: receiptConnectionType,
    ip: receiptIP || undefined,
    port: parseInt(receiptPort, 10) || 9100,
    macAddress: receiptMacAddress || undefined,
    deviceName: receiptDeviceName || undefined,
    bleDeviceId: receiptBleDeviceId || undefined,
    usbVendorId: receiptUsbVendorId || undefined,
    usbProductId: receiptUsbProductId || undefined,
    usbDeviceName: receiptUsbDeviceName || undefined,
  }), [receiptConnectionType, receiptIP, receiptPort, receiptMacAddress, receiptDeviceName,
      receiptBleDeviceId, receiptUsbVendorId, receiptUsbProductId, receiptUsbDeviceName]);

  const buildKitchenAddress = useCallback((): PrinterAddress => ({
    connectionType: kitchenConnectionType,
    ip: kitchenIP || undefined,
    port: parseInt(kitchenPort, 10) || 9100,
    macAddress: kitchenMacAddress || undefined,
    deviceName: kitchenDeviceName || undefined,
    bleDeviceId: kitchenBleDeviceId || undefined,
    usbVendorId: kitchenUsbVendorId || undefined,
    usbProductId: kitchenUsbProductId || undefined,
    usbDeviceName: kitchenUsbDeviceName || undefined,
  }), [kitchenConnectionType, kitchenIP, kitchenPort, kitchenMacAddress, kitchenDeviceName,
      kitchenBleDeviceId, kitchenUsbVendorId, kitchenUsbProductId, kitchenUsbDeviceName]);

  const testReceipt = useCallback(async () => {
    setReceiptStatus({ status: 'testing' });
    const address = buildReceiptAddress();
    const ok = await epsonPrinterService.testConnection(address);
    setReceiptStatus({ status: ok ? 'ok' : 'error', timestamp: Date.now() });
    if (!ok) {
      showToast({ type: 'error', title: 'Connection Failed', message: 'Cannot reach receipt printer' });
    }
    return ok;
  }, [buildReceiptAddress]);

  const testKitchen = useCallback(async () => {
    setKitchenStatus({ status: 'testing' });
    const address = buildKitchenAddress();
    const ok = await epsonPrinterService.testConnection(address);
    setKitchenStatus({ status: ok ? 'ok' : 'error', timestamp: Date.now() });
    if (!ok) {
      showToast({ type: 'error', title: 'Connection Failed', message: 'Cannot reach kitchen printer' });
    }
    return ok;
  }, [buildKitchenAddress]);

  const testStation = useCallback(async (address: PrinterAddress) => {
    const ok = await epsonPrinterService.testConnection(address);
    if (!ok) {
      showToast({ type: 'error', title: 'Connection Failed', message: 'Cannot reach station printer' });
    }
    return ok;
  }, []);

  const printTestPage = useCallback(async (address: PrinterAddress) => {
    try {
      await epsonPrinterService.printTestPage(address);
      showToast({ type: 'success', title: 'Test Page', message: 'Sent to printer' });
    } catch {
      showToast({ type: 'error', title: 'Print Failed', message: 'Cannot reach printer' });
    }
  }, []);

  /** Populate fields from a discovery result for receipt or kitchen section. */
  const selectDiscoveredPrinter = useCallback((
    printer: DiscoveredPrinter,
    target: 'receipt' | 'kitchen' | 'station'
  ) => {
    const a = printer.address;
    if (target === 'receipt') {
      setReceiptConnectionType(a.connectionType);
      if (a.ip) setReceiptIP(a.ip);
      if (a.port) setReceiptPort(String(a.port));
      if (a.macAddress) setReceiptMacAddress(a.macAddress);
      if (a.deviceName) setReceiptDeviceName(a.deviceName);
      if (a.bleDeviceId) setReceiptBleDeviceId(a.bleDeviceId);
      if (a.usbVendorId) setReceiptUsbVendorId(a.usbVendorId);
      if (a.usbProductId) setReceiptUsbProductId(a.usbProductId);
      if (a.usbDeviceName) setReceiptUsbDeviceName(a.usbDeviceName);
      markChanged();
    } else if (target === 'kitchen') {
      setKitchenConnectionType(a.connectionType);
      if (a.ip) setKitchenIP(a.ip);
      if (a.port) setKitchenPort(String(a.port));
      if (a.macAddress) setKitchenMacAddress(a.macAddress);
      if (a.deviceName) setKitchenDeviceName(a.deviceName);
      if (a.bleDeviceId) setKitchenBleDeviceId(a.bleDeviceId);
      if (a.usbVendorId) setKitchenUsbVendorId(a.usbVendorId);
      if (a.usbProductId) setKitchenUsbProductId(a.usbProductId);
      if (a.usbDeviceName) setKitchenUsbDeviceName(a.usbDeviceName);
      markChanged();
    }
  }, [markChanged]);

  const discoverPrinters = useCallback(
    (type?: ConnectionType) => printerTransportManager.discoverAll(type),
    []
  );

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const config: PrinterConfig = {
        receipt_printer: {
          enabled: receiptEnabled,
          connection_type: receiptConnectionType,
          ip_address: receiptIP,
          port: parseInt(receiptPort, 10) || 9100,
          mac_address: receiptMacAddress,
          device_name: receiptDeviceName,
          ble_device_id: receiptBleDeviceId,
          usb_vendor_id: receiptUsbVendorId,
          usb_product_id: receiptUsbProductId,
          usb_device_name: receiptUsbDeviceName,
          paper_size: receiptPaper,
        },
        kitchen_printer: {
          enabled: kitchenEnabled,
          connection_type: kitchenConnectionType,
          ip_address: kitchenIP,
          port: parseInt(kitchenPort, 10) || 9100,
          mac_address: kitchenMacAddress,
          device_name: kitchenDeviceName,
          ble_device_id: kitchenBleDeviceId,
          usb_vendor_id: kitchenUsbVendorId,
          usb_product_id: kitchenUsbProductId,
          usb_device_name: kitchenUsbDeviceName,
        },
      };
      await printerStorageService.saveConfig(config);
      setHasChanges(false);
      onChangesDetected(false);
      showToast({ type: 'success', title: 'Saved', message: 'Printer settings saved' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save printer settings' });
    } finally {
      setIsSaving(false);
    }
  }, [
    receiptEnabled, receiptConnectionType, receiptIP, receiptPort,
    receiptMacAddress, receiptDeviceName, receiptBleDeviceId,
    receiptUsbVendorId, receiptUsbProductId, receiptUsbDeviceName, receiptPaper,
    kitchenEnabled, kitchenConnectionType, kitchenIP, kitchenPort,
    kitchenMacAddress, kitchenDeviceName, kitchenBleDeviceId,
    kitchenUsbVendorId, kitchenUsbProductId, kitchenUsbDeviceName,
    onChangesDetected,
  ]);

  const saveStationPrinter = useCallback(async (printer: Omit<StationPrinter, 'updated_at'>) => {
    try {
      await printerStorageService.saveStationPrinter(printer);
      const updated = await printerStorageService.getStationPrinters();
      setStationPrinters(updated);
      showToast({ type: 'success', title: 'Saved', message: `Station printer saved for ${printer.station}` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save station printer' });
    }
  }, []);

  const deleteStationPrinter = useCallback(async (station: KitchenStation) => {
    try {
      await printerStorageService.deleteStationPrinter(station);
      const updated = await printerStorageService.getStationPrinters();
      setStationPrinters(updated);
      showToast({ type: 'success', title: 'Removed', message: `Station printer removed for ${station}` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to remove station printer' });
    }
  }, []);

  const formatStatusTimestamp = (timestamp?: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Expose legacy-compatible getLastStatus for the settings panel
  const getReceiptLastStatus = useCallback(() => {
    return epsonPrinterService.getLastStatus(buildReceiptAddress());
  }, [buildReceiptAddress]);

  return {
    // Receipt
    receiptEnabled, setReceiptEnabled: (v: boolean) => { setReceiptEnabled(v); markChanged(); },
    receiptConnectionType, setReceiptConnectionType: (v: ConnectionType) => { setReceiptConnectionType(v); markChanged(); },
    receiptIP, setReceiptIP: (v: string) => { setReceiptIP(v); markChanged(); },
    receiptPort, setReceiptPort: (v: string) => { setReceiptPort(v); markChanged(); },
    receiptMacAddress, setReceiptMacAddress: (v: string) => { setReceiptMacAddress(v); markChanged(); },
    receiptDeviceName, setReceiptDeviceName: (v: string) => { setReceiptDeviceName(v); markChanged(); },
    receiptBleDeviceId, setReceiptBleDeviceId: (v: string) => { setReceiptBleDeviceId(v); markChanged(); },
    receiptUsbVendorId, receiptUsbProductId,
    receiptUsbDeviceName, setReceiptUsbDeviceName: (v: string) => { setReceiptUsbDeviceName(v); markChanged(); },
    receiptPaper, setReceiptPaper: (v: '58mm' | '80mm') => { setReceiptPaper(v); markChanged(); },
    receiptStatus,
    testReceipt,
    buildReceiptAddress,
    getReceiptLastStatus,

    // Kitchen
    kitchenEnabled, setKitchenEnabled: (v: boolean) => { setKitchenEnabled(v); markChanged(); },
    kitchenConnectionType, setKitchenConnectionType: (v: ConnectionType) => { setKitchenConnectionType(v); markChanged(); },
    kitchenIP, setKitchenIP: (v: string) => { setKitchenIP(v); markChanged(); },
    kitchenPort, setKitchenPort: (v: string) => { setKitchenPort(v); markChanged(); },
    kitchenMacAddress, setKitchenMacAddress: (v: string) => { setKitchenMacAddress(v); markChanged(); },
    kitchenDeviceName, setKitchenDeviceName: (v: string) => { setKitchenDeviceName(v); markChanged(); },
    kitchenBleDeviceId, setKitchenBleDeviceId: (v: string) => { setKitchenBleDeviceId(v); markChanged(); },
    kitchenUsbVendorId, kitchenUsbProductId,
    kitchenUsbDeviceName, setKitchenUsbDeviceName: (v: string) => { setKitchenUsbDeviceName(v); markChanged(); },
    kitchenStatus,
    testKitchen,
    buildKitchenAddress,

    // Station printers
    stationPrinters,
    testStation,
    printTestPage,
    saveStationPrinter,
    deleteStationPrinter,

    // Discovery
    discoverPrinters,
    selectDiscoveredPrinter,

    // UI
    save,
    hasChanges,
    isSaving,
    formatStatusTimestamp,
  };
}
