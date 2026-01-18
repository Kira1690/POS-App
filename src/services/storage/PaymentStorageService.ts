/**
 * Payment Storage Service
 * Handles all payment-related data persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './StorageService';
import {
  PaymentRecord,
  PaymentTransaction,
  Receipt,
  PaymentTransactionStatus,
} from '@/types/payment-extended.types';
import { BillSplit } from '@/types/billing.types';

// Payment storage data structure
interface PaymentStorageData {
  payments: Record<string, PaymentRecord>;
  pendingPaymentIds: string[];
  completedPaymentIds: string[];
  lastUpdated: string;
}

interface SplitBillStorageData {
  splits: Record<string, BillSplit>;
  lastUpdated: string;
}

interface ReceiptStorageData {
  receipts: Record<string, Receipt>;
  lastUpdated: string;
}

// Default empty storage
const EMPTY_PAYMENT_STORAGE: PaymentStorageData = {
  payments: {},
  pendingPaymentIds: [],
  completedPaymentIds: [],
  lastUpdated: new Date().toISOString(),
};

const EMPTY_SPLIT_STORAGE: SplitBillStorageData = {
  splits: {},
  lastUpdated: new Date().toISOString(),
};

const EMPTY_RECEIPT_STORAGE: ReceiptStorageData = {
  receipts: {},
  lastUpdated: new Date().toISOString(),
};

/**
 * PaymentStorageService - Manages payment and receipt persistence
 */
class PaymentStorageService {
  private paymentsCache: PaymentStorageData | null = null;
  private splitsCache: SplitBillStorageData | null = null;
  private receiptsCache: ReceiptStorageData | null = null;

  // ============== INITIALIZATION ==============

  /**
   * Initialize storage and load data into cache
   */
  async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.loadPaymentsFromStorage(),
        this.loadSplitsFromStorage(),
        this.loadReceiptsFromStorage(),
      ]);
    } catch (error) {
      console.error('[PaymentStorage] Initialization error:', error);
      this.paymentsCache = { ...EMPTY_PAYMENT_STORAGE };
      this.splitsCache = { ...EMPTY_SPLIT_STORAGE };
      this.receiptsCache = { ...EMPTY_RECEIPT_STORAGE };
    }
  }

  /**
   * Load payments from AsyncStorage
   */
  private async loadPaymentsFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY);
      if (data) {
        this.paymentsCache = JSON.parse(data);
      } else {
        this.paymentsCache = { ...EMPTY_PAYMENT_STORAGE };
      }
    } catch (error) {
      console.error('[PaymentStorage] Error loading payments:', error);
      this.paymentsCache = { ...EMPTY_PAYMENT_STORAGE };
    }
  }

  /**
   * Load split bills from AsyncStorage
   */
  private async loadSplitsFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SPLIT_BILLS);
      if (data) {
        this.splitsCache = JSON.parse(data);
      } else {
        this.splitsCache = { ...EMPTY_SPLIT_STORAGE };
      }
    } catch (error) {
      console.error('[PaymentStorage] Error loading splits:', error);
      this.splitsCache = { ...EMPTY_SPLIT_STORAGE };
    }
  }

  /**
   * Load receipts from AsyncStorage
   */
  private async loadReceiptsFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (data) {
        this.receiptsCache = JSON.parse(data);
      } else {
        this.receiptsCache = { ...EMPTY_RECEIPT_STORAGE };
      }
    } catch (error) {
      console.error('[PaymentStorage] Error loading receipts:', error);
      this.receiptsCache = { ...EMPTY_RECEIPT_STORAGE };
    }
  }

  /**
   * Save payments to AsyncStorage
   */
  private async savePaymentsToStorage(): Promise<void> {
    if (!this.paymentsCache) return;

    try {
      this.paymentsCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify(this.paymentsCache));
    } catch (error) {
      console.error('[PaymentStorage] Error saving payments:', error);
      throw error;
    }
  }

  /**
   * Save splits to AsyncStorage
   */
  private async saveSplitsToStorage(): Promise<void> {
    if (!this.splitsCache) return;

    try {
      this.splitsCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.SPLIT_BILLS, JSON.stringify(this.splitsCache));
    } catch (error) {
      console.error('[PaymentStorage] Error saving splits:', error);
      throw error;
    }
  }

  /**
   * Save receipts to AsyncStorage
   */
  private async saveReceiptsToStorage(): Promise<void> {
    if (!this.receiptsCache) return;

    try {
      this.receiptsCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(this.receiptsCache));
    } catch (error) {
      console.error('[PaymentStorage] Error saving receipts:', error);
      throw error;
    }
  }

  // ============== PAYMENT CRUD OPERATIONS ==============

  /**
   * Save a payment record
   */
  async savePayment(payment: PaymentRecord): Promise<void> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return;

    this.paymentsCache.payments[payment.id] = payment;

    // Update pending/completed lists
    if (this.isPendingPayment(payment)) {
      if (!this.paymentsCache.pendingPaymentIds.includes(payment.id)) {
        this.paymentsCache.pendingPaymentIds.push(payment.id);
      }
      this.paymentsCache.completedPaymentIds = this.paymentsCache.completedPaymentIds.filter(
        (id) => id !== payment.id
      );
    } else {
      if (!this.paymentsCache.completedPaymentIds.includes(payment.id)) {
        this.paymentsCache.completedPaymentIds.push(payment.id);
      }
      this.paymentsCache.pendingPaymentIds = this.paymentsCache.pendingPaymentIds.filter(
        (id) => id !== payment.id
      );
    }

    await this.savePaymentsToStorage();
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<PaymentRecord | null> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    return this.paymentsCache?.payments[paymentId] || null;
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrder(orderId: string): Promise<PaymentRecord | null> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return null;

    return (
      Object.values(this.paymentsCache.payments).find((p) => p.orderId === orderId) || null
    );
  }

  /**
   * Get all pending payments
   */
  async getPendingPayments(): Promise<PaymentRecord[]> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return [];

    return this.paymentsCache.pendingPaymentIds
      .map((id) => this.paymentsCache!.payments[id])
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: PaymentTransactionStatus;
      minAmount?: number;
      maxAmount?: number;
    }
  ): Promise<PaymentRecord[]> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return [];

    let payments = Object.values(this.paymentsCache.payments);

    if (filters) {
      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        payments = payments.filter((p) => new Date(p.createdAt).getTime() >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime();
        payments = payments.filter((p) => new Date(p.createdAt).getTime() <= end);
      }

      if (filters.status) {
        payments = payments.filter((p) => p.status === filters.status);
      }

      if (filters.minAmount !== undefined) {
        payments = payments.filter((p) => p.totalAmount >= filters.minAmount!);
      }

      if (filters.maxAmount !== undefined) {
        payments = payments.filter((p) => p.totalAmount <= filters.maxAmount!);
      }
    }

    return payments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Update a payment
   */
  async updatePayment(
    paymentId: string,
    updates: Partial<PaymentRecord>
  ): Promise<PaymentRecord | null> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return null;

    const existingPayment = this.paymentsCache.payments[paymentId];
    if (!existingPayment) return null;

    const updatedPayment: PaymentRecord = {
      ...existingPayment,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await this.savePayment(updatedPayment);
    return updatedPayment;
  }

  /**
   * Add transaction to payment
   */
  async addTransaction(
    paymentId: string,
    transaction: PaymentTransaction
  ): Promise<PaymentRecord | null> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return null;

    const payment = this.paymentsCache.payments[paymentId];
    if (!payment) return null;

    payment.transactions.push(transaction);
    payment.paidAmount = payment.transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    payment.remainingAmount = payment.totalAmount - payment.paidAmount;

    if (payment.remainingAmount <= 0) {
      payment.status = 'completed';
      payment.completedAt = new Date().toISOString();
    }

    await this.savePayment(payment);
    return payment;
  }

  // ============== SPLIT BILL OPERATIONS ==============

  /**
   * Save a bill split
   */
  async saveSplit(split: BillSplit): Promise<void> {
    if (!this.splitsCache) await this.loadSplitsFromStorage();
    if (!this.splitsCache) return;

    this.splitsCache.splits[split.orderId] = split;
    await this.saveSplitsToStorage();
  }

  /**
   * Get split by order ID
   */
  async getSplit(orderId: string): Promise<BillSplit | null> {
    if (!this.splitsCache) await this.loadSplitsFromStorage();
    return this.splitsCache?.splits[orderId] || null;
  }

  /**
   * Update a split
   */
  async updateSplit(orderId: string, updates: Partial<BillSplit>): Promise<BillSplit | null> {
    if (!this.splitsCache) await this.loadSplitsFromStorage();
    if (!this.splitsCache) return null;

    const existingSplit = this.splitsCache.splits[orderId];
    if (!existingSplit) return null;

    const updatedSplit: BillSplit = {
      ...existingSplit,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveSplit(updatedSplit);
    return updatedSplit;
  }

  /**
   * Delete a split
   */
  async deleteSplit(orderId: string): Promise<void> {
    if (!this.splitsCache) await this.loadSplitsFromStorage();
    if (!this.splitsCache) return;

    delete this.splitsCache.splits[orderId];
    await this.saveSplitsToStorage();
  }

  // ============== RECEIPT OPERATIONS ==============

  /**
   * Save a receipt
   */
  async saveReceipt(receipt: Receipt): Promise<void> {
    if (!this.receiptsCache) await this.loadReceiptsFromStorage();
    if (!this.receiptsCache) return;

    this.receiptsCache.receipts[receipt.id] = receipt;
    await this.saveReceiptsToStorage();
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(receiptId: string): Promise<Receipt | null> {
    if (!this.receiptsCache) await this.loadReceiptsFromStorage();
    return this.receiptsCache?.receipts[receiptId] || null;
  }

  /**
   * Get receipt by order ID
   */
  async getReceiptByOrder(orderId: string): Promise<Receipt | null> {
    if (!this.receiptsCache) await this.loadReceiptsFromStorage();
    if (!this.receiptsCache) return null;

    return (
      Object.values(this.receiptsCache.receipts).find((r) => r.orderId === orderId) || null
    );
  }

  /**
   * Get all receipts for a date range
   */
  async getReceipts(startDate?: string, endDate?: string): Promise<Receipt[]> {
    if (!this.receiptsCache) await this.loadReceiptsFromStorage();
    if (!this.receiptsCache) return [];

    let receipts = Object.values(this.receiptsCache.receipts);

    if (startDate) {
      const start = new Date(startDate).getTime();
      receipts = receipts.filter((r) => new Date(r.orderCreatedAt).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      receipts = receipts.filter((r) => new Date(r.orderCreatedAt).getTime() <= end);
    }

    return receipts.sort(
      (a, b) =>
        new Date(b.paymentCompletedAt).getTime() - new Date(a.paymentCompletedAt).getTime()
    );
  }

  /**
   * Mark receipt as printed
   */
  async markReceiptPrinted(receiptId: string): Promise<void> {
    if (!this.receiptsCache) await this.loadReceiptsFromStorage();
    if (!this.receiptsCache) return;

    const receipt = this.receiptsCache.receipts[receiptId];
    if (receipt) {
      receipt.printedAt = new Date().toISOString();
      await this.saveReceiptsToStorage();
    }
  }

  /**
   * Mark receipt as emailed
   */
  async markReceiptEmailed(receiptId: string, email: string): Promise<void> {
    if (!this.receiptsCache) await this.loadReceiptsFromStorage();
    if (!this.receiptsCache) return;

    const receipt = this.receiptsCache.receipts[receiptId];
    if (receipt) {
      receipt.emailedTo = email;
      receipt.emailedAt = new Date().toISOString();
      await this.saveReceiptsToStorage();
    }
  }

  // ============== SYNC OPERATIONS ==============

  /**
   * Get payments pending sync
   */
  async getUnsyncedPayments(): Promise<PaymentRecord[]> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return [];

    return Object.values(this.paymentsCache.payments).filter((p) => p.pendingSync);
  }

  /**
   * Mark payments as synced
   */
  async markAsSynced(paymentIds: string[]): Promise<void> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return;

    const now = new Date().toISOString();

    for (const paymentId of paymentIds) {
      if (this.paymentsCache.payments[paymentId]) {
        this.paymentsCache.payments[paymentId].pendingSync = false;
        this.paymentsCache.payments[paymentId].syncedAt = now;
      }
    }

    await this.savePaymentsToStorage();
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_LAST_SYNC);
    } catch (error) {
      console.error('[PaymentStorage] Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('[PaymentStorage] Error updating last sync time:', error);
    }
  }

  // ============== STATISTICS ==============

  /**
   * Get payment statistics
   */
  async getStats(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalPayments: number;
    totalRevenue: number;
    avgPaymentAmount: number;
    byMethod: Record<string, { count: number; total: number }>;
    pendingPayments: number;
    completedPayments: number;
  }> {
    const payments = await this.getPaymentHistory({ startDate, endDate });

    const byMethod: Record<string, { count: number; total: number }> = {};

    for (const payment of payments) {
      const method = payment.paymentMethod;
      if (!byMethod[method]) {
        byMethod[method] = { count: 0, total: 0 };
      }
      byMethod[method].count++;
      byMethod[method].total += payment.totalAmount;
    }

    const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);

    return {
      totalPayments: payments.length,
      totalRevenue,
      avgPaymentAmount: payments.length > 0 ? totalRevenue / payments.length : 0,
      byMethod,
      pendingPayments: payments.filter((p) => this.isPendingPayment(p)).length,
      completedPayments: payments.filter((p) => !this.isPendingPayment(p)).length,
    };
  }

  // ============== UTILITY METHODS ==============

  /**
   * Check if payment is pending
   */
  private isPendingPayment(payment: PaymentRecord): boolean {
    const completedStatuses: PaymentTransactionStatus[] = ['completed', 'refunded'];
    return !completedStatuses.includes(payment.status);
  }

  /**
   * Clear old payment data (use with caution)
   */
  async clearOldData(beforeDate: Date): Promise<number> {
    if (!this.paymentsCache) await this.loadPaymentsFromStorage();
    if (!this.paymentsCache) return 0;

    const cutoffTime = beforeDate.getTime();
    let deletedCount = 0;

    // Only clear completed payments
    const paymentsToDelete = this.paymentsCache.completedPaymentIds.filter((id) => {
      const payment = this.paymentsCache!.payments[id];
      if (payment && new Date(payment.createdAt).getTime() < cutoffTime) {
        return true;
      }
      return false;
    });

    for (const paymentId of paymentsToDelete) {
      delete this.paymentsCache.payments[paymentId];
      deletedCount++;
    }

    this.paymentsCache.completedPaymentIds = this.paymentsCache.completedPaymentIds.filter(
      (id) => !paymentsToDelete.includes(id)
    );

    await this.savePaymentsToStorage();
    return deletedCount;
  }

  /**
   * Clear all payment data (use with caution)
   */
  async clearAll(): Promise<void> {
    this.paymentsCache = { ...EMPTY_PAYMENT_STORAGE };
    this.splitsCache = { ...EMPTY_SPLIT_STORAGE };
    this.receiptsCache = { ...EMPTY_RECEIPT_STORAGE };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PAYMENT_HISTORY),
      AsyncStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENTS),
      AsyncStorage.removeItem(STORAGE_KEYS.SPLIT_BILLS),
      AsyncStorage.removeItem(STORAGE_KEYS.RECEIPTS),
      AsyncStorage.removeItem(STORAGE_KEYS.PAYMENT_LAST_SYNC),
    ]);
  }

  // ============== PAYMENT CONFIGURATION ==============

  /**
   * Save payment configuration (tax rate, tip rates, etc.)
   */
  async savePaymentConfig(config: PaymentConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('[PaymentStorage] Error saving payment config:', error);
      throw error;
    }
  }

  /**
   * Get payment configuration
   */
  async getPaymentConfig(): Promise<PaymentConfig | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_CONFIG);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[PaymentStorage] Error getting payment config:', error);
      return null;
    }
  }

  /**
   * Update tax rate
   */
  async updateTaxRate(rate: number): Promise<void> {
    try {
      const config = await this.getPaymentConfig();
      const updatedConfig: PaymentConfig = {
        ...config,
        taxRate: rate,
        updatedAt: new Date().toISOString(),
      };
      await this.savePaymentConfig(updatedConfig);
    } catch (error) {
      console.error('[PaymentStorage] Error updating tax rate:', error);
      throw error;
    }
  }

  /**
   * Get tax rate from storage
   */
  async getTaxRate(): Promise<number | null> {
    try {
      const config = await this.getPaymentConfig();
      return config?.taxRate ?? null;
    } catch (error) {
      console.error('[PaymentStorage] Error getting tax rate:', error);
      return null;
    }
  }
}

// Payment configuration interface
interface PaymentConfig {
  taxRate?: number;
  defaultTipRates?: number[];
  minimumTipAmount?: number;
  maximumCashPayment?: number;
  receiptSettings?: {
    printAutomatically?: boolean;
    emailByDefault?: boolean;
    thermalPrinterWidth?: number;
    receiptTemplate?: string;
  };
  updatedAt?: string;
}

// Export singleton instance
export const paymentStorageService = new PaymentStorageService();
