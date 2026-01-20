/**
 * Split Payment Service - Focused on split payment coordination only
 * Follows Single Responsibility Principle - handles split payment logic exclusively
 */

import {
  ProfessionalPayment,
  ProfessionalPaymentMethod,
  PaymentProcessingStatus,
  SplitPaymentItem,
  PaymentError,
} from '@/types/payment.types';
import { showToast } from '@/utils/toast';

export interface SplitPaymentRequest {
  orderId: string;
  totalAmount: number;
  splitItems: SplitPaymentItem[];
  notes?: string;
}

export interface SplitPaymentResult extends ProfessionalPayment {
  splitPayments: SplitPaymentItem[];
}

export interface ISplitPaymentService {
  processSplitPayment(request: SplitPaymentRequest): Promise<SplitPaymentResult>;
  validateSplitItems(items: SplitPaymentItem[], totalAmount: number): { isValid: boolean; errors: string[] };
  calculateSplitAmounts(totalAmount: number, splits: number): SplitPaymentItem[];
}

class SplitPaymentService implements ISplitPaymentService {
  private taxRate: number = 0.0825; // 8.25% default tax rate

  /**
   * Process Split Payment
   */
  async processSplitPayment(request: SplitPaymentRequest): Promise<SplitPaymentResult> {
    try {
      // Validate split payment items
      const validation = this.validateSplitItems(request.splitItems, request.totalAmount);
      if (!validation.isValid) {
        throw new Error(`Split payment validation failed: ${validation.errors.join(', ')}`);
      }

      const payment = this.createSplitPaymentRecord(request);

      // Process each split payment item
      const processedSplitPayments: SplitPaymentItem[] = [];

      for (const splitItem of request.splitItems) {
        const processedItem = await this.processSplitItem(splitItem);
        processedSplitPayments.push(processedItem);
      }

      const result: SplitPaymentResult = {
        ...payment,
        status: PaymentProcessingStatus.COMPLETED,
        splitPayments: processedSplitPayments,
        processedAt: new Date().toISOString(),
      };

      showToast({
        type: 'success',
        title: 'Split Payment Successful',
        message: `Payment of $${request.totalAmount.toFixed(2)} processed with ${processedSplitPayments.length} methods`,
      });

      return result;
    } catch (error) {
      throw this.createPaymentError('SPLIT_PROCESSING_FAILED', 'Split payment failed', error);
    }
  }

  /**
   * Validate Split Payment Items
   */
  validateSplitItems(items: SplitPaymentItem[], totalAmount: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!items || items.length === 0) {
      errors.push('No split payment items provided');
      return { isValid: false, errors };
    }

    const totalSplitAmount = items.reduce((sum, item) => sum + item.amount, 0);
    if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      errors.push(`Split payment amounts ($${totalSplitAmount.toFixed(2)}) do not match total ($${totalAmount.toFixed(2)})`);
    }

    // Validate each split item
    items.forEach((item, index) => {
      if (!item.method) {
        errors.push(`Split item ${index + 1} missing payment method`);
      }
      if (!item.amount || item.amount <= 0) {
        errors.push(`Split item ${index + 1} has invalid amount`);
      }
      if (item.method === ProfessionalPaymentMethod.CASH && (!item.cashTendered || item.cashTendered < item.amount)) {
        errors.push(`Split item ${index + 1} has insufficient cash amount`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Calculate Equal Split Amounts
   */
  calculateSplitAmounts(totalAmount: number, splits: number): SplitPaymentItem[] {
    const baseAmount = Math.floor((totalAmount / splits) * 100) / 100;
    const remainder = Math.round((totalAmount - (baseAmount * splits)) * 100) / 100;

    const splitItems: SplitPaymentItem[] = [];

    for (let i = 0; i < splits; i++) {
      const amount = i === 0 ? baseAmount + remainder : baseAmount;
      splitItems.push({
        id: this.generateId(),
        description: `Split ${i + 1} of ${splits}`,
        amount,
        method: ProfessionalPaymentMethod.CARD, // Default method
        status: PaymentProcessingStatus.PENDING,
      });
    }

    return splitItems;
  }

  // Private helper methods
  private async processSplitItem(splitItem: SplitPaymentItem): Promise<SplitPaymentItem> {
    // Simulate processing each split payment
    await this.simulateProcessingDelay(1000);

    const processedItem: SplitPaymentItem = {
      ...splitItem,
      id: splitItem.id || this.generateId(),
      status: PaymentProcessingStatus.PROCESSING,
    };

    if (splitItem.method === ProfessionalPaymentMethod.CARD) {
      processedItem.transactionId = this.generateTransactionId();
      processedItem.authorizationCode = this.generateAuthCode();
      processedItem.cardLast4 = '1234'; // Would come from actual processing
    } else if (splitItem.method === ProfessionalPaymentMethod.CASH && splitItem.cashTendered) {
      processedItem.changeAmount = splitItem.cashTendered - splitItem.amount;
    }

    processedItem.status = PaymentProcessingStatus.COMPLETED;
    return processedItem;
  }

  private createSplitPaymentRecord(request: SplitPaymentRequest): SplitPaymentResult {
    return {
      id: this.generateId(),
      orderId: request.orderId,
      amount: request.totalAmount,
      method: ProfessionalPaymentMethod.SPLIT,
      status: PaymentProcessingStatus.PROCESSING,
      processedBy: 'current-user',
      createdBy: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isSplitPayment: true,
      receiptPrinted: false,
      receiptEmailed: false,
      receiptSmsed: false,
      retryCount: 0,
      taxAmount: request.totalAmount * this.taxRate,
      tipAmount: 0,
      notes: request.notes,
      splitPayments: request.splitItems,
    };
  }

  private generateId(): string {
    return 'split_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now().toString().substr(-9);
  }

  private generateAuthCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private async simulateProcessingDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createPaymentError(code: string, message: string, originalError: any): PaymentError {
    return {
      code,
      message,
      details: originalError,
      recoverable: true,
      userMessage: `Split payment failed: ${message}`,
    };
  }
}

export const splitPaymentService = new SplitPaymentService();
export default SplitPaymentService;