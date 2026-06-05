/**
 * Composite Payment Service - Coordinates specialized payment services
 * Follows Composite Pattern - provides unified interface to all payment operations
 */

import {
  ProfessionalPayment,
  ProfessionalPaymentMethod,
  ProcessPaymentRequest,
  RefundPaymentRequest,
  PaymentServiceInterface,
  PaymentAnalytics,
  VP3350DeviceConfig,
  VP3350PaymentResult,
  VP3350DeviceStatus,
  Receipt,
  ReceiptType,
  PaymentProcessingStatus,
} from '@/types/payment.types';

import { cardPaymentService, ICardPaymentService } from './card/CardPaymentService';
import { cashPaymentService, ICashPaymentService } from './cash/CashPaymentService';
import { vp3350DeviceService, IVP3350DeviceService } from './vp3350/VP3350DeviceService';
import { splitPaymentService, ISplitPaymentService, SplitPaymentRequest } from './split/SplitPaymentService';
import type { IReceiptService } from '../receipt/ReceiptService';
import { paymentAnalyticsService, IPaymentAnalyticsService } from './analytics/PaymentAnalyticsService';
import { Order } from '@/types/order.types';

export class CompositePaymentService implements PaymentServiceInterface {
  private cardService: ICardPaymentService;
  private cashService: ICashPaymentService;
  private vp3350Service: IVP3350DeviceService;
  private splitService: ISplitPaymentService;
  private receiptService: IReceiptService;
  private analyticsService: IPaymentAnalyticsService;

  constructor(
    cardService?: ICardPaymentService,
    cashService?: ICashPaymentService,
    vp3350Service?: IVP3350DeviceService,
    splitService?: ISplitPaymentService,
    receiptServiceArg?: IReceiptService,
    analyticsService?: IPaymentAnalyticsService,
  ) {
    this.cardService = cardService ?? cardPaymentService;
    this.cashService = cashService ?? cashPaymentService;
    this.vp3350Service = vp3350Service ?? vp3350DeviceService;
    this.splitService = splitService ?? splitPaymentService;
    // Lazy: import receiptService inside constructor to avoid circular TDZ at module load
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    this.receiptService = receiptServiceArg ?? require('../receipt/ReceiptService').receiptService;
    this.analyticsService = analyticsService ?? paymentAnalyticsService;
  }

  /**
   * Process Card Payment
   */
  async processCardPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment> {
    const cardRequest = {
      orderId: request.orderId,
      amount: request.amount,
      tipAmount: request.tipAmount,
      tipPercentage: request.tipPercentage,
      customerEmail: request.customerEmail,
      notes: request.notes,
    };

    const result = await this.cardService.processPayment(cardRequest);

    // Track analytics
    await this.analyticsService.trackPaymentEvent({
      type: 'PAYMENT_PROCESSED',
      paymentId: result.id,
      orderId: request.orderId,
      amount: request.amount,
      method: ProfessionalPaymentMethod.CARD,
      timestamp: new Date().toISOString(),
    });

    // Generate receipt if requested
    // Note: request.order is a string (orderId), receipt generation requires fetching the full order
    if (request.printReceipt && request.orderData) {
      await this.generateReceipt(result.id, ReceiptType.CUSTOMER, request.orderData, result);
    }

    return result;
  }

  /**
   * Process Cash Payment
   */
  async processCashPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment> {
    if (!request.cashTendered) {
      throw new Error('Cash tendered amount is required');
    }

    const cashRequest = {
      orderId: request.orderId,
      amount: request.amount,
      cashTendered: request.cashTendered,
      tipAmount: request.tipAmount,
      customerEmail: request.customerEmail,
      notes: request.notes,
    };

    const result = await this.cashService.processPayment(cashRequest);

    // Track analytics
    await this.analyticsService.trackPaymentEvent({
      type: 'PAYMENT_PROCESSED',
      paymentId: result.id,
      orderId: request.orderId,
      amount: request.amount,
      method: ProfessionalPaymentMethod.CASH,
      timestamp: new Date().toISOString(),
    });

    // Generate receipt if requested
    // Note: request.order is a string (orderId), receipt generation requires fetching the full order
    if (request.printReceipt && request.orderData) {
      await this.generateReceipt(result.id, ReceiptType.CUSTOMER, request.orderData, result);
    }

    return result;
  }

  /**
   * Process Split Payment
   */
  async processSplitPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment> {
    if (!request.splitPayments || request.splitPayments.length === 0) {
      throw new Error('Split payment items are required');
    }

    const splitRequest: SplitPaymentRequest = {
      orderId: request.orderId,
      totalAmount: request.amount,
      splitItems: request.splitPayments.map((item, index) => ({
        ...item,
        id: `split_${Date.now()}_${index}`,
        status: PaymentProcessingStatus.PENDING,
      })),
      notes: request.notes,
    };

    const result = await this.splitService.processSplitPayment(splitRequest);

    // Track analytics
    await this.analyticsService.trackPaymentEvent({
      type: 'PAYMENT_PROCESSED',
      paymentId: result.id,
      orderId: request.orderId,
      amount: request.amount,
      method: ProfessionalPaymentMethod.SPLIT,
      timestamp: new Date().toISOString(),
    });

    // Generate receipt if requested
    // Note: request.order is a string (orderId), receipt generation requires fetching the full order
    if (request.printReceipt && request.orderData) {
      await this.generateReceipt(result.id, ReceiptType.CUSTOMER, request.orderData, result);
    }

    return result;
  }

  /**
   * VP3350 Device Operations
   */
  async connectVP3350(config: VP3350DeviceConfig): Promise<void> {
    await this.vp3350Service.connectDevice(config);
  }

  async disconnectVP3350(): Promise<void> {
    await this.vp3350Service.disconnectDevice();
  }

  async processVP3350Payment(amount: number): Promise<VP3350PaymentResult> {
    return this.vp3350Service.processPayment({ amount, orderId: 'temp' });
  }

  async getVP3350Status(): Promise<VP3350DeviceStatus> {
    return this.vp3350Service.getDeviceStatus();
  }

  /**
   * Receipt Operations
   */
  async generateReceipt(paymentId: string, type: ReceiptType, order?: Order, payment?: ProfessionalPayment): Promise<Receipt> {
    if (!order || !payment) {
      throw new Error('Order and payment data required for receipt generation');
    }

    return this.receiptService.generateReceipt({
      order,
      payment,
      type,
    });
  }

  async printReceipt(receiptId: string): Promise<void> {
    await this.receiptService.printReceipt(receiptId);
  }

  async emailReceipt(receiptId: string, email: string): Promise<void> {
    await this.receiptService.emailReceipt(receiptId, email);
  }

  async smsReceipt(receiptId: string, phone: string): Promise<void> {
    await this.receiptService.smsReceipt(receiptId, phone);
  }

  /**
   * Payment Management
   */
  async getPaymentHistory(orderId?: string): Promise<ProfessionalPayment[]> {
    // In real implementation, query payment database
    return [];
  }

  async refundPayment(request: RefundPaymentRequest): Promise<ProfessionalPayment> {
    // Determine which service to use based on original payment method
    // For now, default to card refund
    const result = await this.cardService.refundPayment(request.paymentId, request.amount || 0);

    // Track analytics
    await this.analyticsService.trackPaymentEvent({
      type: 'REFUND_ISSUED',
      paymentId: result.id,
      orderId: 'unknown', // Would get from payment record
      amount: result.amount,
      method: ProfessionalPaymentMethod.CARD,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async voidPayment(paymentId: string, reason: string): Promise<void> {
    // Determine which service to use based on original payment method
    // For now, default to card void
    await this.cardService.voidPayment(paymentId);
  }

  /**
   * Analytics Operations
   */
  async getPaymentAnalytics(dateFrom: string, dateTo: string): Promise<PaymentAnalytics> {
    return this.analyticsService.getPaymentAnalytics({ dateFrom, dateTo });
  }

  /**
   * Utility method to determine appropriate service based on payment method
   */
  private getServiceForPaymentMethod(method: ProfessionalPaymentMethod) {
    switch (method) {
      case ProfessionalPaymentMethod.CARD:
        return this.cardService;
      case ProfessionalPaymentMethod.CASH:
        return this.cashService;
      case ProfessionalPaymentMethod.SPLIT:
        return this.splitService;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}

// Export singleton instance
export const compositePaymentService = new CompositePaymentService();
export default CompositePaymentService;