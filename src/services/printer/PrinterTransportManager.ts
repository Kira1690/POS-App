/**
 * PrinterTransportManager — resolves transport by ConnectionType, handles retry.
 * Owns the connection status cache (keyed by transport:address).
 */

import {
  TcpTransport,
  BluetoothTransport,
  BleTransport,
  UsbTransport,
} from './transports';
import type {
  PrinterTransport,
  PrinterAddress,
  DiscoveredPrinter,
  ConnectionType,
} from './transports';

const RETRY_DELAYS = [500, 1000];

interface PrinterStatus {
  ok: boolean;
  timestamp: number;
}

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function addressKey(address: PrinterAddress): string {
  const { connectionType, ip, macAddress, bleDeviceId, usbDeviceName } = address;
  const id = ip ?? macAddress ?? bleDeviceId ?? usbDeviceName ?? 'unknown';
  return `${connectionType}:${id}`;
}

class PrinterTransportManager {
  private transports = new Map<ConnectionType, PrinterTransport>([
    ['lan', new TcpTransport()],
    ['bluetooth', new BluetoothTransport()],
    ['ble', new BleTransport()],
    ['usb', new UsbTransport()],
  ]);

  private lastStatus = new Map<string, PrinterStatus>();

  getTransport(type: ConnectionType): PrinterTransport {
    const t = this.transports.get(type);
    if (!t) throw new Error(`Unknown connection type: ${type}`);
    return t;
  }

  getAvailableTransports(): ConnectionType[] {
    return Array.from(this.transports.entries())
      .filter(([, t]) => t.isAvailable())
      .map(([type]) => type);
  }

  getLastStatus(address: PrinterAddress): PrinterStatus | undefined {
    return this.lastStatus.get(addressKey(address));
  }

  /** Send bytes with automatic retry (up to 2 retries with backoff). */
  async sendBytesWithRetry(address: PrinterAddress, bytes: number[]): Promise<void> {
    const transport = this.getTransport(address.connectionType);
    const key = addressKey(address);
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        await transport.sendBytes(address, bytes);
        this.lastStatus.set(key, { ok: true, timestamp: Date.now() });
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < RETRY_DELAYS.length) {
          await delay(RETRY_DELAYS[attempt]);
        }
      }
    }

    this.lastStatus.set(key, { ok: false, timestamp: Date.now() });
    throw lastError!;
  }

  async testConnection(address: PrinterAddress): Promise<boolean> {
    const transport = this.getTransport(address.connectionType);
    const ok = await transport.testConnection(address);
    this.lastStatus.set(addressKey(address), { ok, timestamp: Date.now() });
    return ok;
  }

  /** Discover printers across all available transports (or a specific one). */
  async discoverAll(type?: ConnectionType, timeoutMs?: number): Promise<DiscoveredPrinter[]> {
    const targets = type ? [this.getTransport(type)] : Array.from(this.transports.values());
    const available = targets.filter(t => t.isAvailable());
    const results = await Promise.allSettled(available.map(t => t.discover(timeoutMs)));
    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }
}

export const printerTransportManager = new PrinterTransportManager();
export type { PrinterAddress, DiscoveredPrinter, ConnectionType };
