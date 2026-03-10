/**
 * BleTransport — Bluetooth Low Energy (GATT) printer transport.
 * Package: react-native-ble-plx
 * Used for mobile Epson printers: TM-P20II, TM-P80II.
 * Requires custom native build (not available in Expo Go).
 */

import type { PrinterTransport, PrinterAddress, DiscoveredPrinter } from './PrinterTransport';

// Epson BLE service / characteristic UUIDs
const EPSON_SERVICE_UUID = '49535343-FE7D-4AE5-8FA9-9FAFD205E455';
const EPSON_WRITE_CHAR_UUID = '49535343-8841-43F4-A8D4-ECBE34729BB3';
const MTU_REQUESTED = 512;
const CHUNK_DELAY_MS = 15;
const DISCOVER_TIMEOUT_MS = 10_000;
const INIT_BYTES = [0x1b, 0x40];

// Lazy import to avoid crash when native module is absent
let BleManager: unknown = null;
let bleInitialized = false;

function getBleManager(): unknown {
  if (bleInitialized) return BleManager;
  bleInitialized = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BleManager: BM } = require('react-native-ble-plx');
    BleManager = new BM();
  } catch {
    BleManager = null;
  }
  return BleManager;
}

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export class BleTransport implements PrinterTransport {
  readonly type = 'ble' as const;

  isAvailable(): boolean {
    return getBleManager() !== null;
  }

  async sendBytes(address: PrinterAddress, bytes: number[]): Promise<void> {
    const manager = getBleManager() as {
      connectToDevice(id: string): Promise<{
        requestMTU(mtu: number): Promise<{ mtu: number }>;
        discoverAllServicesAndCharacteristics(): Promise<unknown>;
        writeCharacteristicWithoutResponseForService(
          serviceUuid: string, charUuid: string, value: string
        ): Promise<unknown>;
        cancelConnection(): Promise<void>;
      }>;
    } | null;

    if (!manager) throw new Error('BLE unavailable — requires custom native build');

    const deviceId = address.bleDeviceId;
    if (!deviceId) throw new Error('BLE device ID required');

    const serviceUuid = address.bleServiceUuid ?? EPSON_SERVICE_UUID;
    const charUuid = address.bleCharacteristicUuid ?? EPSON_WRITE_CHAR_UUID;

    const device = await manager.connectToDevice(deviceId);
    try {
      const mtuResult = await device.requestMTU(MTU_REQUESTED);
      const mtu = mtuResult.mtu - 3; // subtract GATT header overhead
      await device.discoverAllServicesAndCharacteristics();

      // Chunk bytes by negotiated MTU
      for (let i = 0; i < bytes.length; i += mtu) {
        const chunk = bytes.slice(i, i + mtu);
        const b64 = Buffer.from(chunk).toString('base64');
        await device.writeCharacteristicWithoutResponseForService(serviceUuid, charUuid, b64);
        if (i + mtu < bytes.length) await delay(CHUNK_DELAY_MS);
      }
    } finally {
      try { await device.cancelConnection(); } catch { /* ignore */ }
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

  async discover(timeoutMs = DISCOVER_TIMEOUT_MS): Promise<DiscoveredPrinter[]> {
    const manager = getBleManager() as {
      startDeviceScan(
        uuids: string[] | null,
        options: unknown,
        callback: (error: unknown, device: { id: string; name?: string | null; rssi?: number | null } | null) => void
      ): void;
      stopDeviceScan(): void;
    } | null;

    if (!manager) return [];

    return new Promise<DiscoveredPrinter[]>((resolve) => {
      const found = new Map<string, DiscoveredPrinter>();

      const timer = setTimeout(() => {
        manager.stopDeviceScan();
        resolve(Array.from(found.values()));
      }, timeoutMs);

      manager.startDeviceScan(
        [EPSON_SERVICE_UUID],
        null,
        (error, device) => {
          if (error || !device) return;
          found.set(device.id, {
            connectionType: 'ble',
            name: device.name ?? device.id,
            address: {
              connectionType: 'ble',
              bleDeviceId: device.id,
              bleServiceUuid: EPSON_SERVICE_UUID,
              bleCharacteristicUuid: EPSON_WRITE_CHAR_UUID,
              deviceName: device.name ?? undefined,
            },
            rssi: device.rssi ?? undefined,
          });
        }
      );

      // Also resolve early if nothing found after timeout
      setTimeout(() => clearTimeout(timer), timeoutMs + 100);
    });
  }
}
