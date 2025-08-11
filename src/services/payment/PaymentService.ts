/**
 * Professional Payment Service
 * Comprehensive payment processing with VP3350 integration, receipt management, and split payments
 */

import {
  ProfessionalPayment,
  ProfessionalPaymentMethod,
  PaymentProcessingStatus,
  VP3350PaymentResult,
  VP3350DeviceStatus,
  VP3350DeviceConfig,
  Receipt,
  ReceiptType,
  ProcessPaymentRequest,
  RefundPaymentRequest,
  PaymentServiceInterface,
  PaymentAnalytics,
  PaymentError,
  SplitPaymentItem,
  ReceiptHeader,
  ReceiptOrderItem,
  ReceiptTotals,
  ReceiptPaymentInfo,
  ReceiptFooter,
} from '@/types/payment.types';
import { Order } from '@/types/order.types';
import { showToast } from '@/utils/toast';

class PaymentService implements PaymentServiceInterface {
  private vp3350Config: VP3350DeviceConfig | null = null;
  private vp3350Status: VP3350DeviceStatus = VP3350DeviceStatus.DISCONNECTED;
  private taxRate: number = 0.0825; // 8.25% default tax rate
  
  /**
   * Process Card Payment
   */
  async processCardPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment> {
    try {
      const payment = await this.createPaymentRecord(request, ProfessionalPaymentMethod.CARD);
      
      // For now, simulate card processing (replace with actual gateway integration)
      await this.simulatePaymentDelay();
      
      // Update payment with successful transaction details
      const updatedPayment: ProfessionalPayment = {
        ...payment,
        status: PaymentProcessingStatus.COMPLETED,
        transactionId: this.generateTransactionId(),
        authorizationCode: this.generateAuthCode(),
        cardLast4: '1234',
        cardType: 'VISA',
        processedAt: new Date().toISOString(),
      };
      
      // Generate receipt if requested
      if (request.printReceipt || request.emailReceipt) {
        await this.generateReceipt(updatedPayment.id, ReceiptType.CUSTOMER);
      }
      
      showToast({
        type: 'success',
        title: 'Payment Successful',
        message: `Card payment of $${request.amount.toFixed(2)} processed successfully`,
      });
      
      return updatedPayment;
    } catch (error) {
      throw this.createPaymentError('CARD_PROCESSING_FAILED', 'Card payment failed', error);
    }
  }
  
  /**
   * Process Cash Payment
   */
  async processCashPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment> {
    try {
      if (!request.cashTendered || request.cashTendered < request.amount) {
        throw new Error('Insufficient cash amount');
      }
      
      const payment = await this.createPaymentRecord(request, ProfessionalPaymentMethod.CASH);
      const changeAmount = request.cashTendered - request.amount;
      
      await this.simulatePaymentDelay(500); // Quick cash processing
      
      const updatedPayment: ProfessionalPayment = {
        ...payment,
        status: PaymentProcessingStatus.COMPLETED,
        cashTendered: request.cashTendered,
        changeAmount: changeAmount,
        processedAt: new Date().toISOString(),
      };
      
      // Generate receipt if requested
      if (request.printReceipt || request.emailReceipt) {
        await this.generateReceipt(updatedPayment.id, ReceiptType.CUSTOMER);
      }
      
      showToast({
        type: 'success',
        title: 'Cash Payment Successful',
        message: changeAmount > 0 
          ? `Payment received. Change: $${changeAmount.toFixed(2)}`
          : 'Exact change received',
      });
      
      return updatedPayment;
    } catch (error) {
      throw this.createPaymentError('CASH_PROCESSING_FAILED', 'Cash payment failed', error);
    }
  }
  
  /**
   * Process Split Payment
   */
  async processSplitPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment> {
    try {
      if (!request.splitPayments || request.splitPayments.length === 0) {
        throw new Error('No split payment items provided');
      }
      
      const totalSplitAmount = request.splitPayments.reduce((sum, item) => sum + item.amount, 0);
      if (Math.abs(totalSplitAmount - request.amount) > 0.01) {
        throw new Error('Split payment amounts do not match total');
      }
      
      const payment = await this.createPaymentRecord(request, ProfessionalPaymentMethod.SPLIT);
      
      // Process each split payment item
      const processedSplitPayments: SplitPaymentItem[] = [];
      
      for (const splitItem of request.splitPayments) {
        const processedItem: SplitPaymentItem = {
          id: this.generateId(),
          ...splitItem,
          status: PaymentProcessingStatus.PROCESSING,
        };
        
        // Simulate processing each split payment
        await this.simulatePaymentDelay(1000);
        
        if (splitItem.method === ProfessionalPaymentMethod.CARD) {
          processedItem.transactionId = this.generateTransactionId();
          processedItem.authorizationCode = this.generateAuthCode();
          processedItem.cardLast4 = '1234';
        } else if (splitItem.method === ProfessionalPaymentMethod.CASH && splitItem.cashTendered) {
          processedItem.changeAmount = splitItem.cashTendered - splitItem.amount;
        }
        
        processedItem.status = PaymentProcessingStatus.COMPLETED;
        processedSplitPayments.push(processedItem);
      }
      
      const updatedPayment: ProfessionalPayment = {
        ...payment,
        status: PaymentProcessingStatus.COMPLETED,
        splitPayments: processedSplitPayments,
        processedAt: new Date().toISOString(),
      };
      
      // Generate receipt if requested
      if (request.printReceipt || request.emailReceipt) {
        await this.generateReceipt(updatedPayment.id, ReceiptType.CUSTOMER);
      }
      
      showToast({
        type: 'success',
        title: 'Split Payment Successful',
        message: `Payment of $${request.amount.toFixed(2)} processed with ${processedSplitPayments.length} methods`,
      });
      
      return updatedPayment;
    } catch (error) {
      throw this.createPaymentError('SPLIT_PROCESSING_FAILED', 'Split payment failed', error);
    }
  }
  
  /**
   * Connect to VP3350 Device
   */
  async connectVP3350(config: VP3350DeviceConfig): Promise<void> {
    try {
      this.vp3350Status = VP3350DeviceStatus.CONNECTING;
      
      // Simulate device connection (replace with actual VP3350 SDK integration)
      await this.simulatePaymentDelay(2000);
      
      this.vp3350Config = config;
      this.vp3350Status = VP3350DeviceStatus.CONNECTED;
      
      showToast({
        type: 'success',
        title: 'VP3350 Connected',
        message: `Connected to ${config.deviceName}`,
      });
    } catch (error) {
      this.vp3350Status = VP3350DeviceStatus.ERROR;
      throw this.createPaymentError('VP3350_CONNECTION_FAILED', 'Failed to connect to VP3350 device', error);
    }
  }
  
  /**
   * Disconnect VP3350 Device
   */
  async disconnectVP3350(): Promise<void> {
    try {
      this.vp3350Config = null;
      this.vp3350Status = VP3350DeviceStatus.DISCONNECTED;
      
      showToast({
        type: 'info',
        title: 'VP3350 Disconnected',
        message: 'Payment device disconnected',
      });
    } catch (error) {
      throw this.createPaymentError('VP3350_DISCONNECT_FAILED', 'Failed to disconnect VP3350 device', error);
    }
  }
  
  /**
   * Process VP3350 Payment
   */
  async processVP3350Payment(amount: number): Promise<VP3350PaymentResult> {
    try {
      if (this.vp3350Status !== VP3350DeviceStatus.CONNECTED) {
        throw new Error('VP3350 device not connected');
      }
      
      this.vp3350Status = VP3350DeviceStatus.PROCESSING;
      
      // Simulate VP3350 payment processing (replace with actual SDK calls)
      await this.simulatePaymentDelay(3000);
      
      const result: VP3350PaymentResult = {
        success: true,
        transactionId: this.generateTransactionId(),
        authorizationCode: this.generateAuthCode(),
        cardLast4: '1234',
        cardType: 'VISA',
        amount: amount,
        currency: 'USD',
        responseCode: '00',
        responseMessage: 'APPROVED',
        processedAt: new Date().toISOString(),
        deviceSerial: this.vp3350Config?.deviceName || 'VP3350-001',
        contactlessUsed: Math.random() > 0.5,
        pinVerified: Math.random() > 0.3,
      };
      
      this.vp3350Status = VP3350DeviceStatus.READY;
      
      return result;
    } catch (error) {
      this.vp3350Status = VP3350DeviceStatus.ERROR;
      throw this.createPaymentError('VP3350_PROCESSING_FAILED', 'VP3350 payment processing failed', error);
    }
  }
  
  /**
   * Get VP3350 Device Status
   */
  async getVP3350Status(): Promise<VP3350DeviceStatus> {
    return this.vp3350Status;
  }
  
  /**
   * Generate Receipt
   */
  async generateReceipt(paymentId: string, type: ReceiptType): Promise<Receipt> {
    try {
      // In a real implementation, fetch payment and order data
      const mockOrder = await this.getMockOrderData();
      const mockPayment = await this.getMockPaymentData(paymentId);
      
      const receipt: Receipt = {
        id: this.generateId(),
        orderId: mockOrder.id,
        paymentId: paymentId,
        type: type,
        header: this.createReceiptHeader(mockOrder),
        orderItems: this.createReceiptOrderItems(mockOrder),
        totals: this.createReceiptTotals(mockOrder),
        payment: this.createReceiptPaymentInfo(mockPayment),
        footer: this.createReceiptFooter(),
        generatedAt: new Date().toISOString(),
        generatedBy: 'current-user', // Replace with actual user ID
        format: 'thermal',
        width: 40,
        template: 'standard',
      };
      
      return receipt;
    } catch (error) {
      throw this.createPaymentError('RECEIPT_GENERATION_FAILED', 'Failed to generate receipt', error);
    }
  }
  
  /**
   * Print Receipt
   */
  async printReceipt(receiptId: string): Promise<void> {
    try {
      // Simulate printing delay
      await this.simulatePaymentDelay(1500);
      
      showToast({
        type: 'success',
        title: 'Receipt Printed',
        message: 'Receipt sent to printer successfully',
      });
    } catch (error) {
      throw this.createPaymentError('RECEIPT_PRINT_FAILED', 'Failed to print receipt', error);
    }
  }
  
  /**
   * Email Receipt
   */
  async emailReceipt(receiptId: string, email: string): Promise<void> {
    try {
      // Simulate email sending
      await this.simulatePaymentDelay(2000);
      
      showToast({
        type: 'success',
        title: 'Receipt Emailed',
        message: `Receipt sent to ${email}`,
      });
    } catch (error) {
      throw this.createPaymentError('RECEIPT_EMAIL_FAILED', 'Failed to email receipt', error);
    }
  }
  
  /**
   * SMS Receipt
   */
  async smsReceipt(receiptId: string, phone: string): Promise<void> {
    try {
      // Simulate SMS sending
      await this.simulatePaymentDelay(1500);
      
      showToast({
        type: 'success',
        title: 'Receipt SMS Sent',
        message: `Receipt sent to ${phone}`,
      });
    } catch (error) {
      throw this.createPaymentError('RECEIPT_SMS_FAILED', 'Failed to send receipt via SMS', error);
    }
  }
  
  /**
   * Get Payment History
   */
  async getPaymentHistory(orderId?: string): Promise<ProfessionalPayment[]> {
    try {
      // Simulate payment history retrieval
      await this.simulatePaymentDelay(500);
      
      // Return mock payment history
      return [];
    } catch (error) {
      throw this.createPaymentError('PAYMENT_HISTORY_FAILED', 'Failed to retrieve payment history', error);
    }
  }
  
  /**
   * Refund Payment
   */
  async refundPayment(request: RefundPaymentRequest): Promise<ProfessionalPayment> {
    try {
      // Simulate refund processing
      await this.simulatePaymentDelay(2000);
      
      const refundPayment: ProfessionalPayment = {
        id: this.generateId(),
        orderId: 'mock-order-id',
        amount: -(request.amount || 0),
        method: ProfessionalPaymentMethod.CARD,
        status: PaymentProcessingStatus.REFUNDED,
        transactionId: this.generateTransactionId(),
        processedAt: new Date().toISOString(),
        processedBy: request.refundedBy,
        createdBy: request.refundedBy,
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
        message: `Refund of $${Math.abs(refundPayment.amount).toFixed(2)} processed successfully`,
      });
      
      return refundPayment;
    } catch (error) {
      throw this.createPaymentError('REFUND_FAILED', 'Failed to process refund', error);
    }
  }
  
  /**
   * Void Payment
   */
  async voidPayment(paymentId: string, reason: string): Promise<void> {
    try {
      // Simulate void processing
      await this.simulatePaymentDelay(1500);
      
      showToast({
        type: 'success',
        title: 'Payment Voided',
        message: 'Payment has been voided successfully',
      });
    } catch (error) {
      throw this.createPaymentError('VOID_FAILED', 'Failed to void payment', error);
    }
  }
  
  /**
   * Get Payment Analytics
   */
  async getPaymentAnalytics(dateFrom: string, dateTo: string): Promise<PaymentAnalytics> {
    try {
      // Simulate analytics retrieval
      await this.simulatePaymentDelay(1000);
      
      const mockAnalytics: PaymentAnalytics = {
        totalTransactions: 150,
        totalAmount: 12450.75,
        averageTransaction: 83.01,
        paymentMethodBreakdown: [
          { method: ProfessionalPaymentMethod.CARD, count: 100, amount: 8300.50, percentage: 66.7 },
          { method: ProfessionalPaymentMethod.CASH, count: 40, amount: 3200.25, percentage: 25.7 },
          { method: ProfessionalPaymentMethod.SPLIT, count: 10, amount: 950.00, percentage: 7.6 },
        ],
        dailyTotals: [
          { date: '2025-08-11', transactions: 50, amount: 4150.25 },
          { date: '2025-08-10', transactions: 45, amount: 3750.50 },
          { date: '2025-08-09', transactions: 55, amount: 4550.00 },
        ],
        tipAnalytics: {
          totalTips: 2245.50,
          averageTip: 14.97,
          averageTipPercentage: 18.2,
          tipDistribution: [
            { range: '15%', count: 40 },
            { range: '18%', count: 60 },
            { range: '20%', count: 35 },
            { range: '25%', count: 15 },
          ],
        },
        refundAnalytics: {
          totalRefunds: 5,
          refundAmount: 425.75,
          refundRate: 3.4,
        },
      };
      
      return mockAnalytics;
    } catch (error) {
      throw this.createPaymentError('ANALYTICS_FAILED', 'Failed to retrieve payment analytics', error);
    }
  }
  
  // Private Helper Methods
  
  private async createPaymentRecord(request: ProcessPaymentRequest, method: ProfessionalPaymentMethod): Promise<ProfessionalPayment> {
    const basePayment: ProfessionalPayment = {
      id: this.generateId(),
      orderId: request.orderId,
      amount: request.amount,
      method: method,
      status: PaymentProcessingStatus.PROCESSING,
      processedBy: 'current-user', // Replace with actual user ID
      createdBy: 'current-user', // Replace with actual user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isSplitPayment: method === ProfessionalPaymentMethod.SPLIT,
      receiptPrinted: false,
      receiptEmailed: false,
      receiptSmsed: false,
      retryCount: 0,
      taxAmount: request.amount * this.taxRate,
      tipAmount: request.tipAmount || 0,
      tipPercentage: request.tipPercentage,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      notes: request.notes,
    };
    
    return basePayment;
  }
  
  private createReceiptHeader(order: any): ReceiptHeader {
    return {
      restaurantName: 'The Food Corner',
      restaurantAddress: '123 Main Street, City, State 12345',
      restaurantPhone: '+1 (555) 123-4567',
      orderNumber: order.order_number || 'ORD-001234',
      tableNumber: order.table_id || 'Takeaway',
      serverName: 'John Doe',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
  }
  
  private createReceiptOrderItems(order: any): ReceiptOrderItem[] {
    return [
      { quantity: 2, name: 'Burger Special', unitPrice: 12.00, totalPrice: 24.00 },
      { quantity: 1, name: 'Coca Cola', unitPrice: 3.50, totalPrice: 3.50 },
      { quantity: 1, name: 'French Fries', unitPrice: 4.50, totalPrice: 4.50 },
    ];
  }
  
  private createReceiptTotals(order: any): ReceiptTotals {
    const subtotal = 32.00;
    const taxRate = this.taxRate;
    const tax = subtotal * taxRate;
    const tip = 6.24;
    
    return {
      subtotal,
      tax,
      taxRate,
      tip,
      tipRate: 18,
      total: subtotal + tax + tip,
    };
  }
  
  private createReceiptPaymentInfo(payment: any): ReceiptPaymentInfo {
    return {
      method: 'Card',
      amount: 40.88,
      cardLast4: '1234',
      authCode: 'ABC123',
      transactionId: 'TXN789456123',
    };
  }
  
  private createReceiptFooter(): ReceiptFooter {
    return {
      thankYouMessage: 'Thank you for dining with us!',
      returnPolicy: 'Visit us again soon!',
      website: 'www.thefoodcorner.com',
    };
  }
  
  private async getMockOrderData(): Promise<any> {
    return {
      id: 'order-123',
      order_number: 'ORD-001234',
      table_id: 'Table 5',
    };
  }
  
  private async getMockPaymentData(paymentId: string): Promise<any> {
    return {
      id: paymentId,
      amount: 40.88,
      method: 'card',
    };
  }
  
  private generateId(): string {
    return 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  private generateTransactionId(): string {
    return 'TXN' + Date.now().toString().substr(-9);
  }
  
  private generateAuthCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  
  private async simulatePaymentDelay(ms: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private createPaymentError(code: string, message: string, originalError: any): PaymentError {
    return {
      code,
      message,
      details: originalError,
      recoverable: true,
      userMessage: `Payment processing failed: ${message}`,
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default PaymentService;