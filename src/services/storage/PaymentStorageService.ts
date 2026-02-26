/**
 * Payment Storage Service - SQLite Implementation
 * Handles all payment-related data persistence via expo-sqlite.
 */

import { databaseService } from '@/services/database/DatabaseService';
import { parseJsonColumn, fromSqlBool, toSqlBool, now } from '@/services/database/helpers';
import {
  PaymentRecord,
  PaymentTransaction,
  Receipt,
  PaymentTransactionStatus,
} from '@/types/payment-extended.types';
import { BillSplit } from '@/types/billing.types';

// Row types
interface PaymentRow {
  id: string; order_id: string; order_number: string;
  restaurant_id: string; table_id: string; table_name: string;
  subtotal: number; tax_amount: number; discount_amount: number;
  tip_amount: number; total_amount: number;
  payment_method: string; is_split_payment: number;
  status: string; paid_amount: number; remaining_amount: number;
  transactions: string | null;
  processed_by: string; processed_by_name: string;
  receipt_id: string | null; completed_at: string | null;
  pending_sync: number; synced_at: string | null;
  created_at: string; updated_at: string;
}

interface BillSplitRow {
  id: string; order_id: string; order_number: string;
  split_type: string; original_total: number;
  guest_count: number | null; guests: string | null; payment_splits: string | null;
  total_amount: number; paid_amount: number; remaining_amount: number;
  is_complete: number; created_at: string; updated_at: string;
}

interface ReceiptRow {
  id: string; receipt_number: string;
  order_id: string; order_number: string;
  restaurant_id: string; restaurant_name: string;
  table_name: string; items: string;
  subtotal: number; tax_amount: number;
  discount_amount: number; tip_amount: number; total_amount: number;
  payments: string; served_by_name: string; processed_by_name: string;
  order_created_at: string; payment_completed_at: string;
  printed_at: string | null; emailed_to: string | null; emailed_at: string | null;
}

// Payment config interface
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

class PaymentStorageService {
  private get db() {
    return databaseService.getDatabase();
  }

  // ============== CONVERTERS ==============

  private paymentFromRow(row: PaymentRow): PaymentRecord {
    return {
      id: row.id,
      orderId: row.order_id,
      orderNumber: row.order_number,
      restaurantId: row.restaurant_id,
      tableId: row.table_id,
      tableName: row.table_name,
      subtotal: row.subtotal,
      taxAmount: row.tax_amount,
      discountAmount: row.discount_amount,
      tipAmount: row.tip_amount,
      totalAmount: row.total_amount,
      paymentMethod: row.payment_method,
      isSplitPayment: fromSqlBool(row.is_split_payment),
      status: row.status as PaymentTransactionStatus,
      paidAmount: row.paid_amount,
      remainingAmount: row.remaining_amount,
      transactions: parseJsonColumn(row.transactions, []),
      processedBy: row.processed_by,
      processedByName: row.processed_by_name,
      receiptId: row.receipt_id || undefined,
      completedAt: row.completed_at || undefined,
      receiptPrinted: false,
      receiptEmailed: false,
      pendingSync: fromSqlBool(row.pending_sync),
      syncedAt: row.synced_at || undefined,
      createdAt: row.created_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    } as PaymentRecord;
  }

  private splitFromRow(row: BillSplitRow): BillSplit {
    return {
      orderId: row.order_id,
      orderNumber: row.order_number,
      splitType: row.split_type as BillSplit['splitType'],
      originalSubtotal: row.original_total,
      originalTaxAmount: 0,
      originalTipAmount: 0,
      originalTotal: row.original_total,
      guestCount: row.guest_count || undefined,
      guests: parseJsonColumn(row.guests, []),
      paymentSplits: parseJsonColumn(row.payment_splits, []),
      unassignedItems: [],
      totalAmount: row.total_amount,
      paidAmount: row.paid_amount,
      remainingAmount: row.remaining_amount,
      isComplete: fromSqlBool(row.is_complete),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as BillSplit;
  }

  private receiptFromRow(row: ReceiptRow): Receipt {
    return {
      id: row.id,
      receiptNumber: row.receipt_number,
      orderId: row.order_id,
      orderNumber: row.order_number,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurant_name,
      restaurantAddress: '',
      restaurantPhone: '',
      tableId: '',
      tableName: row.table_name,
      guestCount: 1,
      items: parseJsonColumn(row.items, []),
      subtotal: row.subtotal,
      taxRate: 0,
      taxAmount: row.tax_amount,
      discountAmount: row.discount_amount,
      tipAmount: row.tip_amount,
      totalAmount: row.total_amount,
      payments: parseJsonColumn(row.payments, []),
      isSplitPayment: false,
      servedBy: '',
      servedByName: row.served_by_name,
      processedBy: '',
      processedByName: row.processed_by_name,
      orderCreatedAt: row.order_created_at,
      paymentCompletedAt: row.payment_completed_at,
      printedAt: row.printed_at || undefined,
      emailedTo: row.emailed_to || undefined,
      emailedAt: row.emailed_at || undefined,
    } as Receipt;
  }

  // ============== INITIALIZATION ==============

  async initialize(): Promise<void> {
    // No-op: SQLite tables are created by DatabaseService
  }

  // ============== PAYMENT CRUD ==============

  async savePayment(payment: PaymentRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO payment_records (id, order_id, order_number, restaurant_id,
        table_id, table_name, subtotal, tax_amount, discount_amount, tip_amount, total_amount,
        payment_method, is_split_payment, status, paid_amount, remaining_amount,
        transactions, processed_by, processed_by_name, receipt_id, completed_at,
        pending_sync, synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payment.id, payment.orderId, payment.orderNumber, payment.restaurantId || 'rest_001',
      payment.tableId, payment.tableName,
      payment.subtotal || 0, payment.taxAmount || 0, payment.discountAmount || 0,
      payment.tipAmount || 0, payment.totalAmount || 0,
      payment.paymentMethod, toSqlBool(payment.isSplitPayment),
      payment.status || 'pending', payment.paidAmount || 0, payment.remainingAmount || 0,
      payment.transactions ? JSON.stringify(payment.transactions) : null,
      payment.processedBy, payment.processedByName,
      payment.receiptId || null, payment.completedAt || null,
      toSqlBool(payment.pendingSync), payment.syncedAt || null,
      payment.createdAt || now(), payment.updated_at || now()
    );
  }

  async getPayment(paymentId: string): Promise<PaymentRecord | null> {
    const row = await this.db.getFirstAsync<PaymentRow>(
      'SELECT * FROM payment_records WHERE id = ?', paymentId
    );
    return row ? this.paymentFromRow(row) : null;
  }

  async getPaymentByOrder(orderId: string): Promise<PaymentRecord | null> {
    const row = await this.db.getFirstAsync<PaymentRow>(
      'SELECT * FROM payment_records WHERE order_id = ?', orderId
    );
    return row ? this.paymentFromRow(row) : null;
  }

  async getPendingPayments(): Promise<PaymentRecord[]> {
    const rows = await this.db.getAllAsync<PaymentRow>(
      `SELECT * FROM payment_records WHERE status NOT IN ('completed', 'refunded')
       ORDER BY created_at DESC`
    );
    return rows.map((r) => this.paymentFromRow(r));
  }

  async getPaymentHistory(filters?: {
    startDate?: string;
    endDate?: string;
    status?: PaymentTransactionStatus;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<PaymentRecord[]> {
    let sql = 'SELECT * FROM payment_records';
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];

    if (filters) {
      if (filters.startDate) {
        conditions.push('created_at >= ?');
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        conditions.push('created_at <= ?');
        params.push(filters.endDate);
      }
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      if (filters.minAmount !== undefined) {
        conditions.push('total_amount >= ?');
        params.push(filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        conditions.push('total_amount <= ?');
        params.push(filters.maxAmount);
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await this.db.getAllAsync<PaymentRow>(sql, ...params);
    return rows.map((r) => this.paymentFromRow(r));
  }

  async updatePayment(paymentId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
    const existing = await this.getPayment(paymentId);
    if (!existing) return null;

    const updated: PaymentRecord = { ...existing, ...updates, updated_at: now() };
    await this.savePayment(updated);
    return updated;
  }

  async addTransaction(paymentId: string, transaction: PaymentTransaction): Promise<PaymentRecord | null> {
    const payment = await this.getPayment(paymentId);
    if (!payment) return null;

    payment.transactions.push(transaction);
    payment.paidAmount = payment.transactions
      .filter((t: PaymentTransaction) => t.status === 'completed')
      .reduce((sum: number, t: PaymentTransaction) => sum + t.amount, 0);
    payment.remainingAmount = payment.totalAmount - payment.paidAmount;

    if (payment.remainingAmount <= 0) {
      payment.status = 'completed' as PaymentTransactionStatus;
      payment.completedAt = now();
    }

    await this.savePayment(payment);
    return payment;
  }

  // ============== SPLIT BILL OPERATIONS ==============

  async saveSplit(split: BillSplit): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO bill_splits (id, order_id, order_number, split_type, original_total,
        guest_count, guests, payment_splits, total_amount, paid_amount, remaining_amount,
        is_complete, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      `split_${split.orderId}`, split.orderId, split.orderNumber || '',
      split.splitType, split.originalTotal || 0,
      split.guestCount || null,
      split.guests ? JSON.stringify(split.guests) : null,
      split.paymentSplits ? JSON.stringify(split.paymentSplits) : null,
      split.totalAmount || 0, split.paidAmount || 0, split.remainingAmount || 0,
      toSqlBool(split.isComplete),
      split.createdAt || now(), split.updatedAt || now()
    );
  }

  async getSplit(orderId: string): Promise<BillSplit | null> {
    const row = await this.db.getFirstAsync<BillSplitRow>(
      'SELECT * FROM bill_splits WHERE order_id = ?', orderId
    );
    return row ? this.splitFromRow(row) : null;
  }

  async updateSplit(orderId: string, updates: Partial<BillSplit>): Promise<BillSplit | null> {
    const existing = await this.getSplit(orderId);
    if (!existing) return null;

    const updated: BillSplit = { ...existing, ...updates, updatedAt: now() };
    await this.saveSplit(updated);
    return updated;
  }

  async deleteSplit(orderId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM bill_splits WHERE order_id = ?', orderId);
  }

  // ============== RECEIPT OPERATIONS ==============

  async saveReceipt(receipt: Receipt): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO receipts (id, receipt_number, order_id, order_number,
        restaurant_id, restaurant_name, table_name, items,
        subtotal, tax_amount, discount_amount, tip_amount, total_amount,
        payments, served_by_name, processed_by_name,
        order_created_at, payment_completed_at, printed_at, emailed_to, emailed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      receipt.id, receipt.receiptNumber, receipt.orderId, receipt.orderNumber,
      receipt.restaurantId, receipt.restaurantName,
      receipt.tableName, JSON.stringify(receipt.items || []),
      receipt.subtotal || 0, receipt.taxAmount || 0,
      receipt.discountAmount || 0, receipt.tipAmount || 0, receipt.totalAmount || 0,
      JSON.stringify(receipt.payments || []),
      receipt.servedByName, receipt.processedByName,
      receipt.orderCreatedAt, receipt.paymentCompletedAt,
      receipt.printedAt || null, receipt.emailedTo || null, receipt.emailedAt || null
    );
  }

  async getReceipt(receiptId: string): Promise<Receipt | null> {
    const row = await this.db.getFirstAsync<ReceiptRow>(
      'SELECT * FROM receipts WHERE id = ?', receiptId
    );
    return row ? this.receiptFromRow(row) : null;
  }

  async getReceiptByOrder(orderId: string): Promise<Receipt | null> {
    const row = await this.db.getFirstAsync<ReceiptRow>(
      'SELECT * FROM receipts WHERE order_id = ?', orderId
    );
    return row ? this.receiptFromRow(row) : null;
  }

  async getReceipts(startDate?: string, endDate?: string): Promise<Receipt[]> {
    let sql = 'SELECT * FROM receipts';
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];

    if (startDate) {
      conditions.push('order_created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('order_created_at <= ?');
      params.push(endDate);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY payment_completed_at DESC';

    const rows = await this.db.getAllAsync<ReceiptRow>(sql, ...params);
    return rows.map((r) => this.receiptFromRow(r));
  }

  async markReceiptPrinted(receiptId: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE receipts SET printed_at = ? WHERE id = ?', now(), receiptId
    );
  }

  async markReceiptEmailed(receiptId: string, email: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE receipts SET emailed_to = ?, emailed_at = ? WHERE id = ?',
      email, now(), receiptId
    );
  }

  // ============== SYNC OPERATIONS ==============

  async getUnsyncedPayments(): Promise<PaymentRecord[]> {
    const rows = await this.db.getAllAsync<PaymentRow>(
      'SELECT * FROM payment_records WHERE pending_sync = 1'
    );
    return rows.map((r) => this.paymentFromRow(r));
  }

  async markAsSynced(paymentIds: string[]): Promise<void> {
    if (paymentIds.length === 0) return;
    const ts = now();
    const placeholders = paymentIds.map(() => '?').join(', ');
    await this.db.runAsync(
      `UPDATE payment_records SET pending_sync = 0, synced_at = ? WHERE id IN (${placeholders})`,
      ts, ...paymentIds
    );
  }

  async getLastSyncTime(): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'payment_last_sync'`
    );
    return row?.value || null;
  }

  async updateLastSyncTime(): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('payment_last_sync', ?, ?)`,
      now(), now()
    );
  }

  // ============== STATISTICS ==============

  async getStats(startDate?: string, endDate?: string): Promise<{
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
      if (!byMethod[method]) byMethod[method] = { count: 0, total: 0 };
      byMethod[method].count++;
      byMethod[method].total += payment.totalAmount;
    }

    const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const completedStatuses = ['completed', 'refunded'];

    return {
      totalPayments: payments.length,
      totalRevenue,
      avgPaymentAmount: payments.length > 0 ? totalRevenue / payments.length : 0,
      byMethod,
      pendingPayments: payments.filter((p) => !completedStatuses.includes(p.status)).length,
      completedPayments: payments.filter((p) => completedStatuses.includes(p.status)).length,
    };
  }

  // ============== PAYMENT CONFIGURATION ==============

  async savePaymentConfig(config: PaymentConfig): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO payment_config (id, tax_rate, default_tip_rates, minimum_tip_amount, maximum_cash_payment, receipt_settings, updated_at)
       VALUES ('default', ?, ?, ?, ?, ?, ?)`,
      config.taxRate || null,
      config.defaultTipRates ? JSON.stringify(config.defaultTipRates) : null,
      config.minimumTipAmount || null,
      config.maximumCashPayment || null,
      config.receiptSettings ? JSON.stringify(config.receiptSettings) : null,
      config.updatedAt || now()
    );
  }

  async getPaymentConfig(): Promise<PaymentConfig | null> {
    const row = await this.db.getFirstAsync<{
      tax_rate: number | null; default_tip_rates: string | null;
      minimum_tip_amount: number | null; maximum_cash_payment: number | null;
      receipt_settings: string | null; updated_at: string;
    }>('SELECT * FROM payment_config WHERE id = ?', 'default');

    if (!row) return null;

    return {
      taxRate: row.tax_rate || undefined,
      defaultTipRates: parseJsonColumn(row.default_tip_rates, undefined),
      minimumTipAmount: row.minimum_tip_amount || undefined,
      maximumCashPayment: row.maximum_cash_payment || undefined,
      receiptSettings: parseJsonColumn(row.receipt_settings, undefined),
      updatedAt: row.updated_at,
    };
  }

  async updateTaxRate(rate: number): Promise<void> {
    const config = await this.getPaymentConfig();
    await this.savePaymentConfig({ ...config, taxRate: rate, updatedAt: now() });
  }

  async getTaxRate(): Promise<number | null> {
    const config = await this.getPaymentConfig();
    return config?.taxRate ?? null;
  }

  // ============== CLEANUP ==============

  async clearOldData(beforeDate: Date): Promise<number> {
    const cutoff = beforeDate.toISOString();
    const result = await this.db.runAsync(
      `DELETE FROM payment_records WHERE status IN ('completed', 'refunded') AND created_at < ?`,
      cutoff
    );
    return result.changes;
  }

  async clearAll(): Promise<void> {
    await this.db.execAsync('DELETE FROM payment_records');
    await this.db.execAsync('DELETE FROM payment_transactions');
    await this.db.execAsync('DELETE FROM bill_splits');
    await this.db.execAsync('DELETE FROM receipts');
    await this.db.runAsync(`DELETE FROM sync_metadata WHERE key = 'payment_last_sync'`);
  }
}

// Export singleton instance
export const paymentStorageService = new PaymentStorageService();
