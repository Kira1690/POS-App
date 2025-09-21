/**
 * Card Payment Service - Focused on credit/debit card processing only
 * Follows Single Responsibility Principle - handles card payments exclusively
 */

import {
  ProfessionalPayment,
  ProfessionalPaymentMethod,
  PaymentProcessingStatus,
  ProcessPaymentRequest,
  PaymentError,
} from '@/types/payment.types';
import { showToast } from '@/utils/toast';

export interface CardPaymentRequest {
  orderId: string;
  amount: number;
  tipAmount?: number;
  tipPercentage?: number;
  customerEmail?: string;
  notes?: string;
  saveCard?: boolean;
}

export interface CardPaymentResult extends ProfessionalPayment {
  cardLast4?: string;
  cardType?: string;
  transactionId?: string;
  authorizationCode?: string;
}

export interface ICardPaymentService {
  processPayment(request: CardPaymentRequest): Promise<CardPaymentResult>;
  validateCardInfo(cardInfo: any): Promise<{ isValid: boolean; errors: string[] }>;
  refundPayment(paymentId: string, amount: number): Promise<CardPaymentResult>;
  voidPayment(paymentId: string): Promise<void>;
}

class CardPaymentService implements ICardPaymentService {
  private taxRate: number = 0.0825; // 8.25% default tax rate

  /**
   * Process Card Payment
   */
  async processPayment(request: CardPaymentRequest): Promise<CardPaymentResult> {
    try {
      // Validate request
      this.validatePaymentRequest(request);

      const payment = this.createPaymentRecord(request);

      // Simulate card processing (replace with actual gateway integration)
      await this.simulateProcessingDelay();

      // Update payment with successful transaction details
      const result: CardPaymentResult = {
        ...payment,
        status: PaymentProcessingStatus.COMPLETED,
        transactionId: this.generateTransactionId(),
        authorizationCode: this.generateAuthCode(),
        cardLast4: '1234', // Would come from actual gateway
        cardType: 'VISA', // Would come from actual gateway
        processedAt: new Date().toISOString(),
      };

      showToast({
        type: 'success',
        title: 'Payment Successful',
        message: `Card payment of $${request.amount.toFixed(2)} processed successfully`,
      });

      return result;
    } catch (error) {
      throw this.createPaymentError('CARD_PROCESSING_FAILED', 'Card payment failed', error);
    }
  }

  /**
   * Validate Card Information
   */
  async validateCardInfo(cardInfo: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation (in real implementation, would use more sophisticated validation)
    if (!cardInfo.number || cardInfo.number.length < 13) {
      errors.push('Invalid card number');
    }

    if (!cardInfo.expiryMonth || !cardInfo.expiryYear) {
      errors.push('Card expiry date required');
    }

    if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
      errors.push('Valid CVV required');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Refund Card Payment
   */
  async refundPayment(paymentId: string, amount: number): Promise<CardPaymentResult> {
    try {
      await this.simulateProcessingDelay(1500);

      const refundPayment: CardPaymentResult = {
        id: this.generateId(),
        orderId: 'mock-order-id', // Would be retrieved from payment record
        amount: -amount,
        method: ProfessionalPaymentMethod.CARD,
        status: PaymentProcessingStatus.REFUNDED,
        transactionId: this.generateTransactionId(),
        processedAt: new Date().toISOString(),
        processedBy: 'current-user',
        createdBy: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isSplitPayment: false,
        receiptPrinted: false,
        receiptEmailed: false,
        receiptSmsed: false,
        retryCount: 0,
        taxAmount: 0,
        tipAmount: 0,
      };

      showToast({
        type: 'success',
        title: 'Refund Processed',
        message: `Card refund of $${amount.toFixed(2)} processed successfully`,
      });

      return refundPayment;
    } catch (error) {
      throw this.createPaymentError('CARD_REFUND_FAILED', 'Card refund failed', error);
    }
  }

  /**
   * Void Card Payment
   */
  async voidPayment(paymentId: string): Promise<void> {
    try {
      await this.simulateProcessingDelay(1000);

      showToast({
        type: 'success',
        title: 'Payment Voided',
        message: 'Card payment has been voided successfully',
      });
    } catch (error) {
      throw this.createPaymentError('CARD_VOID_FAILED', 'Failed to void card payment', error);
    }
  }

  // Private helper methods
  private validatePaymentRequest(request: CardPaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    if (!request.orderId) {
      throw new Error('Order ID is required');
    }
  }

  private createPaymentRecord(request: CardPaymentRequest): CardPaymentResult {
    return {
      id: this.generateId(),
      orderId: request.orderId,
      amount: request.amount,
      method: ProfessionalPaymentMethod.CARD,
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
      tipPercentage: request.tipPercentage,
      customerEmail: request.customerEmail,
      notes: request.notes,
    };
  }

  private generateId(): string {
    return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now().toString().substr(-9);
  }

  private generateAuthCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private async simulateProcessingDelay(ms: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createPaymentError(code: string, message: string, originalError: any): PaymentError {
    return {
      code,
      message,
      details: originalError,
      recoverable: true,
      userMessage: `Card payment failed: ${message}`,
    };
  }
}

export const cardPaymentService = new CardPaymentService();
export default CardPaymentService;