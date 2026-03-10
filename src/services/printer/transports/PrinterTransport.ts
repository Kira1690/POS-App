/**
 * PrinterTransport — interface + shared types for all printer connectivity methods.
 */

export type ConnectionType = 'lan' | 'bluetooth' | 'ble' | 'usb';

export interface PrinterAddress {
  connectionType: ConnectionType;
  // LAN
  ip?: string;
  port?: number;
  // Bluetooth Classic
  macAddress?: string;
  deviceName?: string;
  // BLE
  bleDeviceId?: string;
  bleServiceUuid?: string;
  bleCharacteristicUuid?: string;
  // USB
  usbVendorId?: number;
  usbProductId?: number;
  usbDeviceName?: string;
}

export interface DiscoveredPrinter {
  connectionType: ConnectionType;
  address: PrinterAddress;
  name: string;
  rssi?: number;         // BT/BLE signal strength
  responseTime?: number; // LAN probe time in ms
}

export interface PrinterTransport {
  readonly type: ConnectionType;
  /** Whether the underlying native module is loaded and ready. */
  isAvailable(): boolean;
  sendBytes(address: PrinterAddress, bytes: number[]): Promise<void>;
  testConnection(address: PrinterAddress): Promise<boolean>;
  discover(timeoutMs?: number): Promise<DiscoveredPrinter[]>;
}
