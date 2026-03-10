/**
 * UsbTransport — USB OTG printer transport for Android.
 * Requires a native USB ESC/POS module (not yet bundled).
 * isAvailable() returns false until the native module is installed and linked.
 *
 * To enable: install a compatible package (e.g., react-native-usb-serial-for-android)
 * and replace the lazy-require below with the real module.
 */

import type { PrinterTransport, PrinterAddress, DiscoveredPrinter } from './PrinterTransport';

const EPSON_VENDOR_ID = 0x04b8;
const INIT_BYTES = [0x1b, 0x40];

// Lazy require — swapped in when a USB native module is available
let UsbModule: unknown = null;
let usbInitialized = false;

function getUsbModule(): unknown {
  if (usbInitialized) return UsbModule;
  usbInitialized = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    UsbModule = require('react-native-usb-escpos-printer');
  } catch {
    UsbModule = null;
  }
  return UsbModule;
}

export class UsbTransport implements PrinterTransport {
  readonly type = 'usb' as const;

  isAvailable(): boolean {
    return getUsbModule() !== null;
  }

  async sendBytes(address: PrinterAddress, bytes: number[]): Promise<void> {
    const mod = getUsbModule() as {
      getDeviceList(): Promise<{ vendorId: number; productId: number; deviceName: string }[]>;
      open(deviceName: string): Promise<void>;
      write(data: number[]): Promise<void>;
      close(): Promise<void>;
    } | null;

    if (!mod) throw new Error('USB printing unavailable — native USB module not installed');

    const targetName = address.usbDeviceName;
    const vendorId = address.usbVendorId ?? EPSON_VENDOR_ID;

    const devices = await mod.getDeviceList();
    const device = targetName
      ? devices.find(d => d.deviceName === targetName)
      : devices.find(d => d.vendorId === vendorId);

    if (!device) throw new Error('USB printer not found — check connection and permissions');

    await mod.open(device.deviceName);
    try {
      await mod.write(bytes);
    } finally {
      try { await mod.close(); } catch { /* ignore */ }
    }
  }

  async testConnection(address: PrinterAddress): Promise<boolean> {
    try {
      await this.sendBytes(address, INIT_BYTES);
      return true;
    } catch {
      return false;
    }
  }

  async discover(_timeoutMs?: number): Promise<DiscoveredPrinter[]> {
    const mod = getUsbModule() as {
      getDeviceList(): Promise<{ vendorId: number; productId: number; deviceName: string }[]>;
    } | null;

    if (!mod) return [];

    try {
      const devices = await mod.getDeviceList();
      return devices
        .filter(d => d.vendorId === EPSON_VENDOR_ID)
        .map(d => ({
          connectionType: 'usb' as const,
          name: d.deviceName,
          address: {
            connectionType: 'usb' as const,
            usbVendorId: d.vendorId,
            usbProductId: d.productId,
            usbDeviceName: d.deviceName,
          },
        }));
    } catch {
      return [];
    }
  }
}
