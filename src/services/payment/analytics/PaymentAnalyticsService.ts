/**
 * Payment Analytics Service - Focused on payment analytics and reporting only
 * Follows Single Responsibility Principle - handles payment analytics exclusively
 */

import {
  PaymentAnalytics,
  ProfessionalPaymentMethod,
  ProfessionalPayment,
  PaymentError,
} from '@/types/payment.types';

export interface PaymentEvent {
  type: 'PAYMENT_PROCESSED' | 'REFUND_ISSUED' | 'PAYMENT_FAILED' | 'TIP_ADDED';
  paymentId: string;
  orderId: string;
  amount: number;
  method: ProfessionalPaymentMethod;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  paymentMethods?: ProfessionalPaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
}

export interface IPaymentAnalyticsService {
  trackPaymentEvent(event: PaymentEvent): Promise<void>;
  getPaymentAnalytics(filters: AnalyticsFilters): Promise<PaymentAnalytics>;
  generateDailyReport(date: string): Promise<PaymentAnalytics>;
  getTipAnalytics(dateFrom: string, dateTo: string): Promise<any>;
}

class PaymentAnalyticsService implements IPaymentAnalyticsService {
  private events: PaymentEvent[] = []; // In real implementation, this would be stored in database

  /**
   * Track Payment Event
   */
  async trackPaymentEvent(event: PaymentEvent): Promise<void> {
    try {
      // Validate event data
      this.validatePaymentEvent(event);
      
      // Store event (in real implementation, save to database)
      this.events.push(event);
      
      console.log('Payment event tracked:', event.type, event.paymentId);
    } catch (error) {
      throw this.createAnalyticsError('EVENT_TRACKING_FAILED', 'Failed to track payment event', error);
    }
  }

  /**
   * Get Payment Analytics
   */
  async getPaymentAnalytics(filters: AnalyticsFilters): Promise<PaymentAnalytics> {
    try {
      // Simulate analytics retrieval
      await this.simulateProcessingDelay(1000);

      // In real implementation, query database with filters
      return this.generateMockAnalytics(filters);
    } catch (error) {
      throw this.createAnalyticsError('ANALYTICS_FAILED', 'Failed to retrieve payment analytics', error);
    }
  }

  /**
   * Generate Daily Report
   */
  async generateDailyReport(date: string): Promise<PaymentAnalytics> {
    const dateFrom = `${date}T00:00:00Z`;
    const dateTo = `${date}T23:59:59Z`;
    
    return this.getPaymentAnalytics({ dateFrom, dateTo });
  }

  /**
   * Get Tip Analytics
   */
  async getTipAnalytics(dateFrom: string, dateTo: string): Promise<any> {
    try {
      await this.simulateProcessingDelay(800);

      return {
        totalTips: 2245.50,
        averageTip: 14.97,
        averageTipPercentage: 18.2,
        tipDistribution: [
          { range: '15%', count: 40, amount: 675.00 },
          { range: '18%', count: 60, amount: 1080.00 },
          { range: '20%', count: 35, amount: 350.00 },
          { range: '25%', count: 15, amount: 140.50 },
        ],
        topTipperTable: 'Table 12',
        averageTipByPaymentMethod: {
          CARD: 16.2,
          CASH: 12.8,
          SPLIT: 15.5,
        },
      };
    } catch (error) {
      throw this.createAnalyticsError('TIP_ANALYTICS_FAILED', 'Failed to retrieve tip analytics', error);
    }
  }

  // Private helper methods
  private validatePaymentEvent(event: PaymentEvent): void {
    if (!event.paymentId || !event.orderId) {
      throw new Error('Payment event requires paymentId and orderId');
    }
    if (!event.amount || event.amount <= 0) {
      throw new Error('Payment event requires valid amount');
    }
    if (!event.method) {
      throw new Error('Payment event requires payment method');
    }
  }

  private generateMockAnalytics(filters: AnalyticsFilters): PaymentAnalytics {
    return {
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
      dateRange: {
        from: filters.dateFrom,
        to: filters.dateTo,
      },
      peakHours: [
        { hour: 12, transactions: 25, amount: 2075.00 },
        { hour: 18, transactions: 22, amount: 1850.50 },
        { hour: 19, transactions: 20, amount: 1650.25 },
      ],
    };
  }

  private async simulateProcessingDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createAnalyticsError(code: string, message: string, originalError: any): PaymentError {
    return {
      code,
      message,
      details: originalError,
      recoverable: true,
      userMessage: `Analytics operation failed: ${message}`,
    };
  }
}

export const paymentAnalyticsService = new PaymentAnalyticsService();
export default PaymentAnalyticsService;