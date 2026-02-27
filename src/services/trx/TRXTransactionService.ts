/**
 * TRXTransactionService - Transaction management using SQLite storage
 */

import {
  Transaction, TransactionFilter, TransactionQueryResult, RefundResult,
  DateFilter, TypeFilter, TransactionStatus,
} from '@/types/trx/Transaction';
import { ITransactionService } from './interfaces/ITransactionService';
import { TransactionStorageService } from './storage/TransactionStorageService';
import { LoggingService } from './logging/LoggingService';
import type {
  TransactionRecord, TransactionFilters, RefundRecord,
} from '@/types/trx/storage/TransactionStorage';

export class TRXTransactionService implements ITransactionService {
  private static instance: TRXTransactionService;
  private storageService: TransactionStorageService;
  private logger: LoggingService;

  private constructor() {
    this.storageService = TransactionStorageService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): TRXTransactionService {
    if (!TRXTransactionService.instance) {
      TRXTransactionService.instance = new TRXTransactionService();
    }
    return TRXTransactionService.instance;
  }

  async getTransactions(filter?: Partial<TransactionFilter>, limit?: number, offset?: number): Promise<TransactionQueryResult> {
    try {
      const sqliteFilters = this.convertToSQLiteFilters(filter, limit, offset);
      const result = await this.storageService.queryTransactions(sqliteFilters);
      if (!result.success || !result.data) {
        return { success: false, error: result.error?.message || 'Failed to get transactions', data: [], totalCount: 0 };
      }
      return { success: true, data: result.data.transactions.map(r => this.recordToTransaction(r)), totalCount: result.data.total };
    } catch (error) {
      this.logger.error('Failed to get transactions', error instanceof Error ? error : new Error(String(error)), 'TRXTransactionService.getTransactions');
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get transactions', data: [], totalCount: 0 };
    }
  }

  async getTransactionById(id: string): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    try {
      const result = await this.storageService.getTransaction(id);
      if (!result.success || !result.data) return { success: false, error: result.error?.message || 'Transaction not found' };
      return { success: true, data: this.recordToTransaction(result.data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get transaction' };
    }
  }

  async getRecentTransactions(count = 10): Promise<TransactionQueryResult> {
    return this.getTransactions(undefined, count, 0);
  }

  async saveTransaction(posResponse: Record<string, unknown>, terminalInfo: { ip: string; port: number; name?: string }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const record = this.createTransactionRecord(posResponse, terminalInfo);
      const result = await this.storageService.saveTransaction(record);
      if (!result.success) return { success: false, error: result.error?.message || 'Failed to save transaction' };
      return { success: true, transactionId: result.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to save transaction' };
    }
  }

  async issueRefund(transactionId: string, amount?: number, reason?: string): Promise<RefundResult> {
    try {
      const txResult = await this.getTransactionById(transactionId);
      if (!txResult.success || !txResult.data) return { success: false, error: txResult.error || 'Transaction not found' };
      const transaction = txResult.data;
      if (!this.canRefund(transaction)) return { success: false, error: 'Transaction cannot be refunded' };
      const refundAmount = amount || transaction.amount;
      if (refundAmount > transaction.amount) return { success: false, error: 'Refund amount cannot exceed original amount' };

      const refundRecord: RefundRecord = {
        id: this.generateUUID(),
        created_at: new Date().toISOString(),
        refund_date: new Date().toISOString().split('T')[0],
        refund_time: new Date().toTimeString().split(' ')[0],
        refund_datetime: new Date().toISOString(),
        original_transaction_id: transactionId,
        original_amount: transaction.amount,
        refund_amount: refundAmount,
        refund_type: refundAmount === transaction.amount ? 'full' : 'partial',
        refund_reason: reason,
        refund_status: 'completed',
      };

      const result = await this.storageService.saveRefund(refundRecord);
      if (!result.success) return { success: false, error: result.error?.message || 'Failed to save refund' };
      return { success: true, transactionId, refundId: result.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Refund failed' };
    }
  }

  async exportTransactions(transactions: Transaction[], format: 'csv' | 'json'): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      let data: string;
      if (format === 'json') {
        data = JSON.stringify(transactions, null, 2);
      } else {
        const headers = ['ID', 'Date', 'Amount', 'Subtotal', 'Tax', 'Fee', 'Status', 'Card Type', 'Last Four', 'Auth Code'];
        const rows = transactions.map(t => [t.id, t.date, t.amount.toString(), t.subtotal.toString(), t.tax.toString(), t.processingFee.toString(), t.status, t.paymentMethod, t.cardLastFour, t.authCode || '']);
        data = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    }
  }

  getTransactionStats(transactions: Transaction[]) {
    const stats = transactions.reduce((acc, t) => {
      acc.totalAmount += t.amount;
      switch (t.status) {
        case 'approved': acc.approvedCount++; break;
        case 'declined': acc.declinedCount++; break;
        case 'pending': acc.pendingCount++; break;
      }
      if (t.status === 'refunded') acc.refundedCount++;
      return acc;
    }, { totalAmount: 0, approvedCount: 0, declinedCount: 0, refundedCount: 0, pendingCount: 0, averageAmount: 0 });
    stats.averageAmount = transactions.length > 0 ? stats.totalAmount / transactions.length : 0;
    return stats;
  }

  filterBySearchText(transactions: Transaction[], searchText: string): Transaction[] {
    const search = searchText.toLowerCase();
    return transactions.filter(t => t.id.toLowerCase().includes(search) || t.cardLastFour?.includes(search) || t.amount.toString().includes(search));
  }

  filterByDate(transactions: Transaction[], dateFilter: DateFilter, customRange?: { startDate: string; endDate: string }): Transaction[] {
    const now = new Date();
    let startDate: Date;
    switch (dateFilter) {
      case 'Today': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
      case 'Yesterday': {
        const s = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const e = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return transactions.filter(t => { const d = new Date(t.timestamp); return d >= s && d < e; });
      }
      case 'Last 7 Days': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case 'Last 30 Days': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case 'Custom Range':
        if (!customRange) return transactions;
        const cs = new Date(customRange.startDate), ce = new Date(customRange.endDate);
        return transactions.filter(t => { const d = new Date(t.timestamp); return d >= cs && d <= ce; });
      default: return transactions;
    }
    return transactions.filter(t => new Date(t.timestamp) >= startDate);
  }

  filterByType(transactions: Transaction[], typeFilter: TypeFilter): Transaction[] {
    switch (typeFilter) {
      case 'Approved': return transactions.filter(t => t.status === 'approved');
      case 'Declined': return transactions.filter(t => t.status === 'declined');
      case 'Pending': return transactions.filter(t => t.status === 'pending');
      case 'Refunded': return transactions.filter(t => t.isRefunded || t.status === 'refunded');
      default: return transactions;
    }
  }

  groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, t) => {
      const date = new Date(t.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }

  canRefund(transaction: Transaction): boolean {
    return transaction.status === 'approved' && !transaction.isRefunded;
  }

  async getDailySummary(date: string) {
    const result = await this.storageService.getDailySummary(date);
    return result.data;
  }

  async calculateDailySummary(date: string) {
    const result = await this.storageService.calculateDailySummary(date);
    return result.data;
  }

  private convertToSQLiteFilters(filter?: Partial<TransactionFilter>, limit?: number, offset?: number): TransactionFilters {
    const sqliteFilters: TransactionFilters = { limit: limit || 50, offset: offset || 0, sortBy: 'transaction_datetime', sortOrder: 'DESC' };
    if (!filter) return sqliteFilters;
    if (filter.dateFilter) {
      const dateRange = this.convertDateFilter(filter.dateFilter, filter.customDateRange);
      sqliteFilters.startDate = dateRange.startDate;
      sqliteFilters.endDate = dateRange.endDate;
    }
    if (filter.typeFilter) sqliteFilters.status = this.convertTypeFilter(filter.typeFilter);
    if (filter.searchText) sqliteFilters.searchQuery = filter.searchText;
    return sqliteFilters;
  }

  private convertDateFilter(dateFilter: DateFilter, customRange?: { startDate: string; endDate: string }): { startDate: string; endDate: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString().split('T')[0];
    switch (dateFilter) {
      case 'Today': return { startDate: todayStr, endDate: todayStr };
      case 'Yesterday': {
        const y = new Date(today); y.setDate(y.getDate() - 1);
        const ys = y.toISOString().split('T')[0];
        return { startDate: ys, endDate: ys };
      }
      case 'Last 7 Days': {
        const d = new Date(today); d.setDate(d.getDate() - 7);
        return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
      }
      case 'Last 30 Days': {
        const d = new Date(today); d.setDate(d.getDate() - 30);
        return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
      }
      case 'Custom Range':
        return customRange || { startDate: todayStr, endDate: todayStr };
      default: return { startDate: todayStr, endDate: todayStr };
    }
  }

  private convertTypeFilter(typeFilter: TypeFilter): TransactionStatus[] | undefined {
    switch (typeFilter) {
      case 'Approved': return ['approved'];
      case 'Declined': return ['declined'];
      case 'Pending': return ['pending'];
      case 'Refunded': return ['refunded'];
      default: return undefined;
    }
  }

  private recordToTransaction(record: TransactionRecord): Transaction {
    return {
      id: record.id,
      amount: record.amount,
      status: record.status as TransactionStatus,
      paymentMethod: record.payment_method as Transaction['paymentMethod'],
      cardLastFour: record.card_last_four || '',
      timestamp: record.transaction_datetime,
      date: record.transaction_date,
      authCode: record.approval_code,
      subtotal: record.subtotal,
      tax: record.tax,
      processingFee: record.processing_fee,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      reference: record.guid,
      cardType: record.account_brand || record.card_type,
      lastFour: record.card_last_four,
      isRefunded: record.is_refunded === 1,
    };
  }

  private createTransactionRecord(posResponse: Record<string, unknown>, terminalInfo: { ip: string; port: number; name?: string }): TransactionRecord {
    const now = new Date();
    return {
      id: this.generateUUID(),
      created_at: now.toISOString(),
      transaction_date: now.toISOString().split('T')[0],
      transaction_time: now.toTimeString().split(' ')[0],
      transaction_datetime: now.toISOString(),
      amount: (posResponse.amount as number) || 0,
      subtotal: (posResponse.subtotal as number) || 0,
      tax: (posResponse.tax as number) || 0,
      processing_fee: (posResponse.processingFee as number) || 0,
      currency: 'USD',
      status: posResponse.success ? 'approved' : 'declined',
      payment_method: (posResponse.paymentMethod as string) || 'Credit Card',
      guid: posResponse.guid as string | undefined,
      approval_code: posResponse.approvalCode as string | undefined,
      purchase_id: posResponse.purchaseId as string | undefined,
      tran_date: posResponse.tranDate as string | undefined,
      tran_time: posResponse.tranTime as string | undefined,
      account_brand: posResponse.accountBrand as string | undefined,
      card_last_four: posResponse.lastFour as string | undefined,
      emv_tags: posResponse.emvTags ? JSON.stringify(posResponse.emvTags) : undefined,
      response_code: posResponse.status as string | undefined,
      response_text: posResponse.responseText as string | undefined,
      raw_response: posResponse.rawResponse as string | undefined,
      terminal_ip: terminalInfo.ip,
      terminal_port: terminalInfo.port,
      terminal_name: terminalInfo.name,
      is_refunded: 0,
      sync_status: 'local',
    };
  }

  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
