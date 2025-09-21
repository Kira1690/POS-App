/**
 * Cash Payment Service - Focused on cash transaction handling only
 * Follows Single Responsibility Principle - handles cash payments exclusively
 */

import {
  ProfessionalPayment,
  ProfessionalPaymentMethod,
  PaymentProcessingStatus,
  PaymentError,
} from '@/types/payment.types';
import { showToast } from '@/utils/toast';

export interface CashPaymentRequest {
  orderId: string;
  amount: number;
  cashTendered: number;
  tipAmount?: number;
  customerEmail?: string;
  notes?: string;
}

export interface CashPaymentResult extends ProfessionalPayment {
  cashTendered: number;
  changeAmount: number;
}

export interface ChangeCalculation {
  changeAmount: number;
  billBreakdown?: { denomination: number; count: number }[];
}

export interface ICashPaymentService {
  processPayment(request: CashPaymentRequest): Promise<CashPaymentResult>;
  calculateChange(amount: number, tendered: number): ChangeCalculation;
  validateCashAmount(amount: number, tendered: number): { isValid: boolean; error?: string };
}

class CashPaymentService implements ICashPaymentService {
  private taxRate: number = 0.0825; // 8.25% default tax rate

  /**
   * Process Cash Payment
   */
  async processPayment(request: CashPaymentRequest): Promise<CashPaymentResult> {
    try {
      // Validate cash payment
      const validation = this.validateCashAmount(request.amount, request.cashTendered);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const payment = this.createCashPaymentRecord(request);
      const changeAmount = request.cashTendered - request.amount;

      await this.simulateProcessingDelay(500); // Quick cash processing

      const result: CashPaymentResult = {
        ...payment,
        status: PaymentProcessingStatus.COMPLETED,
        cashTendered: request.cashTendered,
        changeAmount,
        processedAt: new Date().toISOString(),
      };

      showToast({
        type: 'success',
        title: 'Cash Payment Successful',
        message: changeAmount > 0 
          ? `Payment received. Change: $${changeAmount.toFixed(2)}`
          : 'Exact change received',
      });

      return result;
    } catch (error) {
      throw this.createPaymentError('CASH_PROCESSING_FAILED', 'Cash payment failed', error);
    }
  }

  /**
   * Calculate Change Amount with Bill Breakdown
   */
  calculateChange(amount: number, tendered: number): ChangeCalculation {
    const changeAmount = tendered - amount;
    
    if (changeAmount < 0) {
      return { changeAmount: 0 };
    }

    // Calculate bill breakdown (simplified)
    const denominations = [20, 10, 5, 1, 0.25, 0.10, 0.05, 0.01];
    const billBreakdown: { denomination: number; count: number }[] = [];
    let remainingChange = Math.round(changeAmount * 100) / 100;

    for (const denom of denominations) {
      const count = Math.floor(remainingChange / denom);
      if (count > 0) {
        billBreakdown.push({ denomination: denom, count });
        remainingChange = Math.round((remainingChange - (denom * count)) * 100) / 100;
      }
    }

    return { changeAmount, billBreakdown };
  }

  /**
   * Validate Cash Amount
   */
  validateCashAmount(amount: number, tendered: number): { isValid: boolean; error?: string } {
    if (tendered < amount) {
      return { isValid: false, error: 'Insufficient cash amount' };
    }
    if (tendered < 0 || amount <= 0) {
      return { isValid: false, error: 'Invalid cash amounts' };
    }
    return { isValid: true };
  }

  // Private helper methods
  private createCashPaymentRecord(request: CashPaymentRequest): CashPaymentResult {
    return {
      id: this.generateId(),
      orderId: request.orderId,
      amount: request.amount,
      method: ProfessionalPaymentMethod.CASH,
      status: PaymentProcessingStatus.PROCESSING,
      processedBy: 'current-user',
      createdBy: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isSplitPayment: false,
      receiptPrinted: false,
      receiptEmailed: false,
      receiptSmsed: false,
      retryCount: 0,
      taxAmount: request.amount * this.taxRate,
      tipAmount: request.tipAmount || 0,
      customerEmail: request.customerEmail,
      notes: request.notes,
      cashTendered: request.cashTendered,
      changeAmount: request.cashTendered - request.amount,
    };
  }

  private generateId(): string {
    return 'cash_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
      userMessage: `Cash payment failed: ${message}`,
    };
  }
}

export const cashPaymentService = new CashPaymentService();
export default CashPaymentService;