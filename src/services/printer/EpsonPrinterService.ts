/**
 * EpsonPrinterService - ESC/POS byte generation + delivery via PrinterTransportManager.
 * Transport (LAN / BT / BLE / USB) is determined by the PrinterAddress connectionType.
 */

import { printerTransportManager } from './PrinterTransportManager';
import type { PrinterAddress } from './PrinterTransportManager';
import type { UnifiedOrder } from '@/types/unified-order.types';
import type { KitchenStation } from '@/types/order-extended.types';
import { KITCHEN_STATION_LABELS } from '@/types/order-extended.types';

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
  /** Get cached connection status for a given address. */
  getLastStatus(address: PrinterAddress) {
    return printerTransportManager.getLastStatus(address);
  }

  /** @deprecated Use getLastStatus(address) — kept for backward compat with usePrinterSettings */
  getLastStatusByIp(ip: string) {
    return printerTransportManager.getLastStatus({ connectionType: 'lan', ip });
  }

  async testConnection(address: PrinterAddress): Promise<boolean> {
    return printerTransportManager.testConnection(address);
  }

  async printTestPage(address: PrinterAddress): Promise<void> {
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
      ...line('Epson Printer'),
      ...line(new Date().toLocaleString()),
      ...line(''),
      ...line('Printer connection OK'),
      ...line(''),
      ...LF, ...LF, ...LF,
      ...CUT,
    ];
    await printerTransportManager.sendBytesWithRetry(address, bytes);
  }

  async printReceipt(address: PrinterAddress, order: UnifiedOrder, paperSize: '58mm' | '80mm' = '80mm'): Promise<void> {
    const colWidth = paperSize === '58mm' ? 32 : 40;
    const separator = '='.repeat(colWidth);
    const divider = '-'.repeat(colWidth);

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
      ...line(separator),
      ...LEFT,
      ...line(`Order: ${order.orderNumber}`),
      ...line(`Table: ${order.tableName}`),
      ...line(`Date:  ${new Date(order.createdAt).toLocaleString()}`),
      ...line(divider),
    ];

    for (const item of order.items) {
      const qty = `x${item.quantity}`;
      const price = formatCurrency(item.itemTotal);
      const labelWidth = colWidth - qty.length - price.length - 2;
      const name = item.name.length > labelWidth ? item.name.substring(0, labelWidth) : item.name;
      bytes.push(...line(`${padRight(name, labelWidth)} ${qty} ${padLeft(price, price.length)}`));
      if (item.selectedModifiers) {
        for (const grp of item.selectedModifiers) {
          for (const opt of grp.options ?? []) {
            const optPrice = opt.priceAdjustment > 0 ? `  +${formatCurrency(opt.priceAdjustment)}` : '';
            bytes.push(...line(`  + ${opt.optionName}${optPrice}`));
          }
        }
      }
    }

    bytes.push(
      ...line(divider),
      ...priceLine('Subtotal:', formatCurrency(order.subtotal), colWidth),
      ...priceLine('Tax (10%):', formatCurrency(order.taxAmount ?? 0), colWidth),
    );

    if ((order.discountAmount ?? 0) > 0) {
      bytes.push(...priceLine('Discount:', `-${formatCurrency(order.discountAmount ?? 0)}`, colWidth));
    }
    if ((order.tipAmount ?? 0) > 0) {
      bytes.push(...priceLine('Tip:', formatCurrency(order.tipAmount ?? 0), colWidth));
    }

    bytes.push(
      ...line(separator),
      ...BOLD_ON,
      ...priceLine('TOTAL:', formatCurrency(order.totalAmount), colWidth),
      ...BOLD_OFF,
      ...line(''),
      ...CENTER,
      ...line('Thank you for dining with us!'),
      ...line(''),
      ...LF, ...LF, ...LF,
      ...CUT,
    );

    await printerTransportManager.sendBytesWithRetry(address, bytes);
  }

  async printKitchenTicket(
    address: PrinterAddress,
    order: UnifiedOrder,
    station?: KitchenStation,
  ): Promise<void> {
    const stationLabel = station
      ? KITCHEN_STATION_LABELS[station] || station.toUpperCase()
      : 'KITCHEN ORDER';

    const items = station
      ? order.items.filter(item => item.kitchenStation === station)
      : order.items;

    if (items.length === 0) return;

    const bytes: number[] = [
      ...INIT,
      ...CENTER,
      ...BOLD_ON,
      ...LARGE_ON,
      ...line(stationLabel),
      ...LARGE_OFF,
      ...BOLD_OFF,
      ...line(`Table: ${order.tableName}`),
      ...line(`Order: ${order.orderNumber}`),
      ...line(new Date().toLocaleTimeString()),
      ...line('================================'),
      ...LEFT,
    ];

    for (const item of items) {
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

    await printerTransportManager.sendBytesWithRetry(address, bytes);
  }
}

export const epsonPrinterService = new EpsonPrinterService();
