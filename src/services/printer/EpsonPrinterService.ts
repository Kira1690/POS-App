/**
 * EpsonPrinterService - TCP + ESC/POS printing for Epson TM-T88VI network printers.
 * Requires react-native-tcp-socket (same dependency used by TRX terminal).
 */

import { NativeTcpSocket } from '@/services/trx/pos/NativeTcpSocket';
import type { UnifiedOrder } from '@/types/unified-order.types';

// ESC/POS byte sequences
const ESC = 0x1b;
const GS = 0x1d;
const INIT: number[]       = [ESC, 0x40];
const CUT: number[]        = [GS, 0x56, 0x41, 0];
const BOLD_ON: number[]    = [ESC, 0x45, 1];
const BOLD_OFF: number[]   = [ESC, 0x45, 0];
const CENTER: number[]     = [ESC, 0x61, 1];
const LEFT: number[]       = [ESC, 0x61, 0];
const LF: number[]         = [0x0a];
const LARGE_ON: number[]   = [ESC, 0x21, 0x30];
const LARGE_OFF: number[]  = [ESC, 0x21, 0x00];

const TIMEOUT_MS = 3000;

const textToBytes = (text: string): number[] =>
  Array.from(text).map(c => c.charCodeAt(0) & 0xff);

const line = (text: string): number[] => [...textToBytes(text), ...LF];
const padLeft = (s: string, width: number): string => s.padStart(width);
const padRight = (s: string, width: number): string => s.padEnd(width);
const priceLine = (label: string, price: string, width = 40): number[] => {
  const gap = width - label.length - price.length;
  return line(label + ' '.repeat(Math.max(1, gap)) + price);
};

const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

class EpsonPrinterService {
  private async sendBytes(ip: string, port: number, bytes: number[]): Promise<void> {
    if (!NativeTcpSocket.isTcpSocketAvailable()) {
      throw new Error('TCP socket unavailable — requires custom dev build');
    }

    const buffer = Buffer.from(bytes);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Printer connection timeout'));
      }, TIMEOUT_MS);

      const client = NativeTcpSocket.createConnection(
        { host: ip, port, timeout: TIMEOUT_MS },
        () => {
          client.write(buffer, (_err?: Error | null) => {
            clearTimeout(timer);
            client.destroy();
            resolve();
          });
        }
      );

      client.on('error', (err: Error) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  async testConnection(ip: string, port: number): Promise<boolean> {
    try {
      // Send ESC/POS init — if the TCP connection succeeds, the printer is reachable
      await this.sendBytes(ip, port, INIT);
      return true;
    } catch {
      return false;
    }
  }

  async printTestPage(ip: string, port: number): Promise<void> {
    const bytes: number[] = [
      ...INIT,
      ...CENTER,
      ...BOLD_ON,
      ...LARGE_ON,
      ...line('TEST PAGE'),
      ...LARGE_OFF,
      ...BOLD_OFF,
      ...line(''),
      ...LEFT,
      ...line('Epson TM-T88VI'),
      ...line(new Date().toLocaleString()),
      ...line(''),
      ...line('Printer connection OK'),
      ...line(''),
      ...LF, ...LF, ...LF,
      ...CUT,
    ];
    await this.sendBytes(ip, port, bytes);
  }

  async printReceipt(ip: string, port: number, order: UnifiedOrder): Promise<void> {
    const bytes: number[] = [
      ...INIT,
      ...CENTER,
      ...BOLD_ON,
      ...LARGE_ON,
      ...line('THE FOOD CORNER'),
      ...LARGE_OFF,
      ...BOLD_OFF,
      ...line('123 Main Street'),
      ...line('Tel: (555) 123-4567'),
      ...line(''),
      ...line('================================'),
      ...LEFT,
      ...line(`Order: ${order.orderNumber}`),
      ...line(`Table: ${order.tableName}`),
      ...line(`Date:  ${new Date(order.createdAt).toLocaleString()}`),
      ...line('--------------------------------'),
    ];

    for (const item of order.items) {
      const qty = `x${item.quantity}`;
      const price = formatCurrency(item.itemTotal);
      const labelWidth = 40 - qty.length - price.length - 2;
      bytes.push(...line(`${padRight(item.name, labelWidth)} ${qty} ${padLeft(price, price.length)}`));
      if (item.selectedModifiers) {
        for (const grp of item.selectedModifiers) {
          for (const opt of grp.options ?? []) {
            bytes.push(...line(`  + ${opt.optionName}`));
          }
        }
      }
    }

    bytes.push(
      ...line('--------------------------------'),
      ...priceLine('Subtotal:', formatCurrency(order.subtotal)),
      ...priceLine('Tax (10%):', formatCurrency(order.taxAmount ?? 0)),
    );

    if ((order.discountAmount ?? 0) > 0) {
      bytes.push(...priceLine('Discount:', `-${formatCurrency(order.discountAmount ?? 0)}`));
    }
    if ((order.tipAmount ?? 0) > 0) {
      bytes.push(...priceLine('Tip:', formatCurrency(order.tipAmount ?? 0)));
    }

    bytes.push(
      ...line('================================'),
      ...BOLD_ON,
      ...priceLine('TOTAL:', formatCurrency(order.totalAmount)),
      ...BOLD_OFF,
      ...line(''),
      ...CENTER,
      ...line('Thank you for dining with us!'),
      ...line(''),
      ...LF, ...LF, ...LF,
      ...CUT,
    );

    await this.sendBytes(ip, port, bytes);
  }

  async printKitchenTicket(ip: string, port: number, order: UnifiedOrder): Promise<void> {
    const bytes: number[] = [
      ...INIT,
      ...CENTER,
      ...BOLD_ON,
      ...LARGE_ON,
      ...line('KITCHEN ORDER'),
      ...LARGE_OFF,
      ...BOLD_OFF,
      ...line(`Table: ${order.tableName}`),
      ...line(`Order: ${order.orderNumber}`),
      ...line(new Date().toLocaleTimeString()),
      ...line('================================'),
      ...LEFT,
    ];

    for (const item of order.items) {
      bytes.push(
        ...BOLD_ON,
        ...line(`${item.quantity}x ${item.name}`),
        ...BOLD_OFF
      );
      if (item.selectedModifiers) {
        for (const grp of item.selectedModifiers) {
          for (const opt of grp.options ?? []) {
            bytes.push(...line(`   - ${opt.optionName}`));
          }
        }
      }
      if (item.specialInstructions) {
        bytes.push(...line(`   * ${item.specialInstructions}`));
      }
    }

    bytes.push(
      ...line('================================'),
      ...LF, ...LF, ...LF,
      ...CUT,
    );

    await this.sendBytes(ip, port, bytes);
  }
}

export const epsonPrinterService = new EpsonPrinterService();
