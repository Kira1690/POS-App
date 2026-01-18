/**
 * Receipt Service - Focused on receipt generation and printing only
 * Follows Single Responsibility Principle - handles receipt operations exclusively
 */

import {
  Receipt,
  ReceiptType,
  ReceiptHeader,
  ReceiptOrderItem,
  ReceiptTotals,
  ReceiptPaymentInfo,
  ReceiptFooter,
  ProfessionalPayment,
  PaymentError,
} from '@/types/payment.types';
import { Order } from '@/types/order.types';
import { showToast } from '@/utils/toast';

export interface ReceiptGenerationRequest {
  order: Order;
  payment: ProfessionalPayment;
  type: ReceiptType;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PrintOptions {
  printerName?: string;
  copies?: number;
  format?: 'thermal' | 'standard';
  width?: number;
}

export interface IReceiptService {
  generateReceipt(request: ReceiptGenerationRequest): Promise<Receipt>;
  printReceipt(receiptId: string, options?: PrintOptions): Promise<void>;
  emailReceipt(receiptId: string, email: string): Promise<void>;
  smsReceipt(receiptId: string, phone: string): Promise<void>;
  formatReceiptForPrint(receipt: Receipt): string;
}

class ReceiptService implements IReceiptService {
  private taxRate: number = 0.0825; // 8.25% default tax rate

  /**
   * Generate Receipt
   */
  async generateReceipt(request: ReceiptGenerationRequest): Promise<Receipt> {
    try {
      const receipt: Receipt = {
        id: this.generateReceiptId(),
        orderId: request.order.id,
        paymentId: request.payment.id,
        type: request.type,
        header: this.createReceiptHeader(request.order),
        orderItems: this.createReceiptOrderItems(request.order),
        totals: this.createReceiptTotals(request.order, request.payment),
        payment: this.createReceiptPaymentInfo(request.payment),
        footer: this.createReceiptFooter(),
        generatedAt: new Date().toISOString(),
        generatedBy: 'current-user', // Replace with actual user ID
        format: 'thermal',
        width: 40,
        template: 'standard',
      };

      return receipt;
    } catch (error) {
      throw this.createReceiptError('RECEIPT_GENERATION_FAILED', 'Failed to generate receipt', error);
    }
  }

  /**
   * Print Receipt
   */
  async printReceipt(receiptId: string, options: PrintOptions = {}): Promise<void> {
    try {
      // Simulate printing delay
      await this.simulateProcessingDelay(1500);

      showToast({
        type: 'success',
        title: 'Receipt Printed',
        message: options.copies ? `${options.copies} copies sent to printer` : 'Receipt sent to printer successfully',
      });
    } catch (error) {
      throw this.createReceiptError('RECEIPT_PRINT_FAILED', 'Failed to print receipt', error);
    }
  }

  /**
   * Email Receipt
   */
  async emailReceipt(receiptId: string, email: string): Promise<void> {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email address');
      }

      // Simulate email sending
      await this.simulateProcessingDelay(2000);

      showToast({
        type: 'success',
        title: 'Receipt Emailed',
        message: `Receipt sent to ${email}`,
      });
    } catch (error) {
      throw this.createReceiptError('RECEIPT_EMAIL_FAILED', 'Failed to email receipt', error);
    }
  }

  /**
   * SMS Receipt
   */
  async smsReceipt(receiptId: string, phone: string): Promise<void> {
    try {
      if (!this.validatePhoneNumber(phone)) {
        throw new Error('Invalid phone number');
      }

      // Simulate SMS sending
      await this.simulateProcessingDelay(1500);

      showToast({
        type: 'success',
        title: 'Receipt SMS Sent',
        message: `Receipt sent to ${phone}`,
      });
    } catch (error) {
      throw this.createReceiptError('RECEIPT_SMS_FAILED', 'Failed to send receipt via SMS', error);
    }
  }

  /**
   * Format Receipt for Printing
   */
  formatReceiptForPrint(receipt: Receipt): string {
    const lines: string[] = [];
    const width = receipt.width || 40;

    // Header
    lines.push(this.centerText(receipt.header.restaurantName, width));
    lines.push(this.centerText(receipt.header.restaurantAddress, width));
    lines.push(this.centerText(receipt.header.restaurantPhone, width));
    lines.push('-'.repeat(width));

    // Order info
    lines.push(`Order: ${receipt.header.orderNumber}`);
    lines.push(`Table: ${receipt.header.tableNumber}`);
    lines.push(`Date: ${receipt.header.date} ${receipt.header.time}`);
    lines.push('-'.repeat(width));

    // Items
    receipt.orderItems.forEach(item => {
      lines.push(`${item.quantity}x ${item.name}`);
      lines.push(`    $${item.totalPrice.toFixed(2)}`);
    });
    lines.push('-'.repeat(width));

    // Totals
    lines.push(`Subtotal: $${receipt.totals.subtotal.toFixed(2)}`);
    lines.push(`Tax: $${receipt.totals.tax.toFixed(2)}`);
    if (receipt.totals.tip > 0) {
      lines.push(`Tip (${receipt.totals.tipRate}%): $${receipt.totals.tip.toFixed(2)}`);
    }
    lines.push(`TOTAL: $${receipt.totals.total.toFixed(2)}`);
    lines.push('-'.repeat(width));

    // Payment info
    lines.push(`Payment: ${receipt.payment.method}`);
    if (receipt.payment.cardLast4) {
      lines.push(`Card: ****${receipt.payment.cardLast4}`);
    }
    lines.push('-'.repeat(width));

    // Footer
    lines.push(this.centerText(receipt.footer.thankYouMessage, width));
    if (receipt.footer.website) {
      lines.push(this.centerText(receipt.footer.website, width));
    }

    return lines.join('\n');
  }

  // Private helper methods
  private createReceiptHeader(order: Order): ReceiptHeader {
    return {
      restaurantName: 'The Food Corner',
      restaurantAddress: '123 Main Street, City, State 12345',
      restaurantPhone: '+1 (555) 123-4567',
      orderNumber: order.order_number,
      tableNumber: order.table_id || 'Takeaway',
      serverName: 'John Doe', // Would come from order data
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
  }

  private createReceiptOrderItems(order: Order): ReceiptOrderItem[] {
    return order.items?.map(item => ({
      quantity: item.quantity,
      name: item.menu_item?.name || 'Menu Item',
      unitPrice: item.unit_price || 0,
      totalPrice: item.total_price || (item.unit_price || 0) * item.quantity,
      modifiers: item.special_instructions ? [item.special_instructions] : undefined,
    })) || [];
  }

  private createReceiptTotals(order: Order, payment: ProfessionalPayment): ReceiptTotals {
    return {
      subtotal: order.subtotal,
      tax: payment.taxAmount || 0,
      taxRate: this.taxRate * 100,
      tip: payment.tipAmount || 0,
      tipRate: payment.tipPercentage || 0,
      total: order.total_amount,
    };
  }

  private createReceiptPaymentInfo(payment: ProfessionalPayment): ReceiptPaymentInfo {
    return {
      method: this.getPaymentMethodDisplayName(payment.method),
      amount: payment.amount,
      cardLast4: payment.cardLast4,
      authCode: payment.authorizationCode,
      transactionId: payment.transactionId,
    };
  }

  private createReceiptFooter(): ReceiptFooter {
    return {
      thankYouMessage: 'Thank you for dining with us!',
      returnPolicy: 'Visit us again soon!',
      website: 'www.thefoodcorner.com',
    };
  }

  private getPaymentMethodDisplayName(method: string): string {
    const methodMap: Record<string, string> = {
      'CARD': 'Card',
      'CASH': 'Cash',
      'SPLIT': 'Split Payment',
      'VP3350': 'Card (VP3350)',
    };
    return methodMap[method] || method;
  }

  private centerText(text: string, width: number): string {
    if (text.length >= width) return text;
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  private generateReceiptId(): string {
    return 'receipt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async simulateProcessingDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createReceiptError(code: string, message: string, originalError: any): PaymentError {
    return {
      code,
      message,
      details: originalError,
      recoverable: true,
      userMessage: `Receipt operation failed: ${message}`,
    };
  }
}

export const receiptService = new ReceiptService();
export default ReceiptService;