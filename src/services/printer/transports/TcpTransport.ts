/**
 * TcpTransport — LAN/TCP printer transport using react-native-tcp-socket.
 * Extracted from EpsonPrinterService; NativeTcpSocket is unchanged.
 */

import nativeTcpSocket, { isTcpSocketAvailable } from '@/services/trx/pos/NativeTcpSocket';
import { NetworkScanner } from '@/services/trx/pos/NetworkScanner';
import type { PrinterTransport, PrinterAddress, DiscoveredPrinter } from './PrinterTransport';

const TIMEOUT_MS = 3000;
const PRINTER_PORT = 9100;
const INIT_BYTES = [0x1b, 0x40];

export class TcpTransport implements PrinterTransport {
  readonly type = 'lan' as const;
  private scanner = new NetworkScanner();

  isAvailable(): boolean {
    return isTcpSocketAvailable();
  }

  async sendBytes(address: PrinterAddress, bytes: number[]): Promise<void> {
    if (!isTcpSocketAvailable()) {
      throw new Error('TCP socket unavailable — requires custom dev build');
    }

    const { ip, port = PRINTER_PORT } = address;
    if (!ip) throw new Error('IP address required for LAN connection');

    const buffer = Buffer.from(bytes);
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const settle = (fn: () => void) => {
        if (!settled) { settled = true; fn(); }
      };

      const client = nativeTcpSocket.createConnection(
        { host: ip, port, timeout: TIMEOUT_MS },
        () => {
          client!.write(buffer, undefined, (err?: Error) => {
            clearTimeout(timer);
            client!.destroy();
            if (err) settle(() => reject(err));
            else settle(() => resolve());
          });
        }
      );

      const timer = setTimeout(() => {
        if (client) client.destroy();
        settle(() => reject(new Error('Printer connection timeout')));
      }, TIMEOUT_MS);

      if (!client) {
        clearTimeout(timer);
        settle(() => reject(new Error('Failed to create TCP connection to printer')));
        return;
      }

      client.on('error', (err: unknown) => {
        clearTimeout(timer);
        if (client) client.destroy();
        settle(() => reject(err instanceof Error ? err : new Error(String(err))));
      });
    });
  }

  async testConnection(address: PrinterAddress): Promise<boolean> {
    try {
      await this.sendBytes(address, INIT_BYTES);
      return true;
    } catch {
      return false;
    }
  }

  /** Scan local subnet on port 9100 for responsive Epson printers. */
  async discover(_timeoutMs?: number): Promise<DiscoveredPrinter[]> {
    try {
      const devices = await this.scanner.scanForTerminals(PRINTER_PORT);
      return devices
        .filter(d => d.isOnline)
        .map(d => ({
          connectionType: 'lan' as const,
          name: `Printer @ ${d.ip}`,
          address: { connectionType: 'lan' as const, ip: d.ip, port: d.port },
          responseTime: d.responseTime,
        }));
    } catch {
      return [];
    }
  }
}
