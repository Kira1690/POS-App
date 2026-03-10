/**
 * BluetoothTransport — Bluetooth Classic (SPP) printer transport.
 * Package: react-native-bluetooth-classic
 * Requires custom native build (not available in Expo Go).
 */

import type { PrinterTransport, PrinterAddress, DiscoveredPrinter } from './PrinterTransport';

// Lazy import to avoid crash when native module is absent (Expo Go / web)
let RNBluetoothClassic: typeof import('react-native-bluetooth-classic').default | null = null;
let btInitialized = false;

function getBTModule() {
  if (btInitialized) return RNBluetoothClassic;
  btInitialized = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RNBluetoothClassic = require('react-native-bluetooth-classic').default;
  } catch {
    RNBluetoothClassic = null;
  }
  return RNBluetoothClassic;
}

const EPSON_NAME_FILTERS = ['TM-', 'EPSON', 'tm-', 'epson'];
const INIT_BYTES = [0x1b, 0x40];
const DISCOVER_TIMEOUT_MS = 10_000;

export class BluetoothTransport implements PrinterTransport {
  readonly type = 'bluetooth' as const;

  isAvailable(): boolean {
    return getBTModule() !== null;
  }

  async sendBytes(address: PrinterAddress, bytes: number[]): Promise<void> {
    const bt = getBTModule();
    if (!bt) throw new Error('Bluetooth Classic unavailable — requires custom native build');

    const mac = address.macAddress;
    if (!mac) throw new Error('MAC address required for Bluetooth connection');

    // Check if already bonded; if not, attempt pairing
    const bonded: { address: string }[] = await bt.getBondedDevices();
    const isBonded = bonded.some(d => d.address === mac);
    if (!isBonded) {
      try {
        await (bt as unknown as { pairDevice(addr: string): Promise<unknown> }).pairDevice(mac);
      } catch (err) {
        throw new Error(`Bluetooth pairing failed for ${mac}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const device = await bt.connectToDevice(mac);
    try {
      // SPP has no MTU limit — send full receipt in one write
      const b64 = Buffer.from(bytes).toString('base64');
      await (device as unknown as { write(data: string): Promise<void> }).write(b64);
    } finally {
      try { await device.disconnect(); } catch { /* ignore disconnect errors */ }
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
    const bt = getBTModule();
    if (!bt) return [];

    try {
      // Scan for discoverable BT devices
      const devices: { name?: string; address: string }[] = await bt.startDiscovery();

      // Stop discovery after timeout
      setTimeout(() => {
        bt.cancelDiscovery().catch(() => { /* ignore */ });
      }, timeoutMs);

      return devices
        .filter(d => EPSON_NAME_FILTERS.some(f => (d.name ?? '').includes(f)))
        .map(d => ({
          connectionType: 'bluetooth' as const,
          name: d.name ?? d.address,
          address: {
            connectionType: 'bluetooth' as const,
            macAddress: d.address,
            deviceName: d.name,
          },
        }));
    } catch {
      return [];
    }
  }
}
