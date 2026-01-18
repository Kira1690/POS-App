/**
 * Payment Repository - Data access layer for payments
 *
 * Provides:
 * - CRUD operations for payments
 * - Payment queries and filtering
 * - Transaction history
 * - Analytics data access
 */

import {
  ISyncableRepository,
  IDataAdapter,
  QueryOptions,
  PaginatedResult,
} from './interfaces/IRepository';
import { paymentStorageAdapter } from './adapters/AsyncStorageAdapter';
import {
  ProfessionalPayment,
  PaymentProcessingStatus,
  ProfessionalPaymentMethod,
} from '@/types/payment.types';

// ============== FILTER TYPES ==============

export interface PaymentFilters {
  orderId?: string;
  status?: PaymentProcessingStatus;
  method?: ProfessionalPaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  isSplitPayment?: boolean;
}

// ============== PAYMENT REPOSITORY ==============

export class PaymentRepository implements ISyncableRepository<ProfessionalPayment> {
  private adapter: IDataAdapter;
  private storageKey = 'payments';
  private syncKey = 'payments_sync';

  constructor(adapter: IDataAdapter = paymentStorageAdapter) {
    this.adapter = adapter;
  }

  // ============== BASIC CRUD ==============

  async getAll(): Promise<ProfessionalPayment[]> {
    const data = await this.adapter.get<ProfessionalPayment[]>(this.storageKey);
    return data || [];
  }

  async getById(id: string): Promise<ProfessionalPayment | null> {
    const payments = await this.getAll();
    return payments.find((p) => p.id === id) || null;
  }

  async create(data: Partial<ProfessionalPayment>): Promise<ProfessionalPayment> {
    const payments = await this.getAll();

    const payment: ProfessionalPayment = {
      id: data.id || `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: data.orderId || '',
      amount: data.amount || 0,
      method: data.method || ProfessionalPaymentMethod.CARD,
      status: data.status || PaymentProcessingStatus.PENDING,
      processedBy: data.processedBy || 'system',
      createdBy: data.createdBy || 'system',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isSplitPayment: data.isSplitPayment || false,
      receiptPrinted: data.receiptPrinted || false,
      receiptEmailed: data.receiptEmailed || false,
      receiptSmsed: data.receiptSmsed || false,
      retryCount: data.retryCount || 0,
      taxAmount: data.taxAmount || 0,
      tipAmount: data.tipAmount || 0,
      ...data,
    } as ProfessionalPayment;

    payments.push(payment);
    await this.adapter.set(this.storageKey, payments);

    return payment;
  }

  async update(id: string, data: Partial<ProfessionalPayment>): Promise<ProfessionalPayment> {
    const payments = await this.getAll();
    const index = payments.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Payment ${id} not found`);
    }

    const updated: ProfessionalPayment = {
      ...payments[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    payments[index] = updated;
    await this.adapter.set(this.storageKey, payments);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const payments = await this.getAll();
    const filtered = payments.filter((p) => p.id !== id);
    await this.adapter.set(this.storageKey, filtered);
  }

  // ============== QUERY OPERATIONS ==============

  async query(options: QueryOptions<ProfessionalPayment>): Promise<ProfessionalPayment[]> {
    let payments = await this.getAll();

    // Apply filters
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) {
          payments = payments.filter((p) => (p as any)[key] === value);
        }
      }
    }

    // Apply sorting
    if (options.sortBy) {
      payments.sort((a, b) => {
        const aVal = (a as any)[options.sortBy!];
        const bVal = (b as any)[options.sortBy!];

        if (aVal < bVal) return options.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return options.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    if (options.limit) {
      const start = options.offset || 0;
      payments = payments.slice(start, start + options.limit);
    }

    return payments;
  }

  async count(): Promise<number> {
    const payments = await this.getAll();
    return payments.length;
  }

  // ============== PAYMENT-SPECIFIC OPERATIONS ==============

  async getByOrder(orderId: string): Promise<ProfessionalPayment[]> {
    const payments = await this.getAll();
    return payments.filter((p) => p.orderId === orderId);
  }

  async getByStatus(status: PaymentProcessingStatus): Promise<ProfessionalPayment[]> {
    const payments = await this.getAll();
    return payments.filter((p) => p.status === status);
  }

  async getByMethod(method: ProfessionalPaymentMethod): Promise<ProfessionalPayment[]> {
    const payments = await this.getAll();
    return payments.filter((p) => p.method === method);
  }

  async getByDateRange(from: string, to: string): Promise<ProfessionalPayment[]> {
    const payments = await this.getAll();
    const fromDate = new Date(from).getTime();
    const toDate = new Date(to).getTime();

    return payments.filter((p) => {
      const paymentDate = new Date(p.created_at).getTime();
      return paymentDate >= fromDate && paymentDate <= toDate;
    });
  }

  async queryWithFilters(filters: PaymentFilters): Promise<ProfessionalPayment[]> {
    let payments = await this.getAll();

    if (filters.orderId) {
      payments = payments.filter((p) => p.orderId === filters.orderId);
    }

    if (filters.status) {
      payments = payments.filter((p) => p.status === filters.status);
    }

    if (filters.method) {
      payments = payments.filter((p) => p.method === filters.method);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      payments = payments.filter((p) => new Date(p.created_at).getTime() >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      payments = payments.filter((p) => new Date(p.created_at).getTime() <= toDate);
    }

    if (filters.minAmount !== undefined) {
      payments = payments.filter((p) => p.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      payments = payments.filter((p) => p.amount <= filters.maxAmount!);
    }

    if (filters.isSplitPayment !== undefined) {
      payments = payments.filter((p) => p.isSplitPayment === filters.isSplitPayment);
    }

    return payments;
  }

  // ============== STATUS UPDATES ==============

  async updateStatus(
    paymentId: string,
    status: PaymentProcessingStatus
  ): Promise<ProfessionalPayment> {
    return this.update(paymentId, {
      status,
      processedAt: status === PaymentProcessingStatus.COMPLETED ? new Date().toISOString() : undefined,
    });
  }

  async markAsRefunded(
    paymentId: string,
    refundAmount: number,
    refundReason: string
  ): Promise<ProfessionalPayment> {
    return this.update(paymentId, {
      status: PaymentProcessingStatus.REFUNDED,
      refundAmount,
      refundReason,
      refundedAt: new Date().toISOString(),
    });
  }

  async markAsVoided(paymentId: string, voidReason: string): Promise<ProfessionalPayment> {
    return this.update(paymentId, {
      status: PaymentProcessingStatus.VOIDED,
      voidReason,
      voidedAt: new Date().toISOString(),
    });
  }

  // ============== RECEIPT TRACKING ==============

  async markReceiptPrinted(paymentId: string): Promise<ProfessionalPayment> {
    return this.update(paymentId, {
      receiptPrinted: true,
      receiptPrintedAt: new Date().toISOString(),
    });
  }

  async markReceiptEmailed(paymentId: string, email: string): Promise<ProfessionalPayment> {
    return this.update(paymentId, {
      receiptEmailed: true,
      receiptEmailedAt: new Date().toISOString(),
      customerEmail: email,
    });
  }

  async markReceiptSmsed(paymentId: string, phone: string): Promise<ProfessionalPayment> {
    return this.update(paymentId, {
      receiptSmsed: true,
      receiptSmsedAt: new Date().toISOString(),
      customerPhone: phone,
    });
  }

  // ============== ANALYTICS ==============

  async getTotalsByDateRange(from: string, to: string): Promise<{
    totalAmount: number;
    totalTips: number;
    totalTax: number;
    transactionCount: number;
    averageAmount: number;
  }> {
    const payments = await this.getByDateRange(from, to);
    const completedPayments = payments.filter(
      (p) => p.status === PaymentProcessingStatus.COMPLETED
    );

    const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTips = completedPayments.reduce((sum, p) => sum + (p.tipAmount || 0), 0);
    const totalTax = completedPayments.reduce((sum, p) => sum + (p.taxAmount || 0), 0);
    const transactionCount = completedPayments.length;

    return {
      totalAmount,
      totalTips,
      totalTax,
      transactionCount,
      averageAmount: transactionCount > 0 ? totalAmount / transactionCount : 0,
    };
  }

  async getMethodBreakdown(from: string, to: string): Promise<
    Array<{
      method: ProfessionalPaymentMethod;
      count: number;
      amount: number;
      percentage: number;
    }>
  > {
    const payments = await this.getByDateRange(from, to);
    const completedPayments = payments.filter(
      (p) => p.status === PaymentProcessingStatus.COMPLETED
    );

    const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const methodGroups = new Map<ProfessionalPaymentMethod, { count: number; amount: number }>();

    for (const payment of completedPayments) {
      const current = methodGroups.get(payment.method) || { count: 0, amount: 0 };
      methodGroups.set(payment.method, {
        count: current.count + 1,
        amount: current.amount + payment.amount,
      });
    }

    return Array.from(methodGroups.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }));
  }

  // ============== SYNC OPERATIONS ==============

  async getPendingSync(): Promise<ProfessionalPayment[]> {
    const payments = await this.getAll();
    return payments.filter((p) => (p as any).pendingSync === true);
  }

  async markSynced(ids: string[]): Promise<void> {
    const payments = await this.getAll();

    for (const payment of payments) {
      if (ids.includes(payment.id)) {
        (payment as any).pendingSync = false;
        (payment as any).lastSyncedAt = new Date().toISOString();
      }
    }

    await this.adapter.set(this.storageKey, payments);
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.adapter.get<string>(`${this.syncKey}_lastSync`);
  }

  async setLastSyncTime(time: string): Promise<void> {
    await this.adapter.set(`${this.syncKey}_lastSync`, time);
  }
}

// ============== SINGLETON INSTANCE ==============

export const paymentRepository = new PaymentRepository();
