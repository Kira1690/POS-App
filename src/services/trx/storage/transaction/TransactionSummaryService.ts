/**
 * TransactionSummaryService.ts - Daily summary calculations for TRX
 */

import { StorageResult } from '../interfaces/ISQLiteStorage';
import { SQLiteStorageService } from '../SQLiteStorageService';
import { LoggingService } from '../../logging/LoggingService';
import { TransactionQueryService } from './TransactionQueryService';
import {
  DailySummaryRecord,
  CardTypeBreakdown,
  PaymentMethodBreakdown,
} from '@/types/trx/storage/TransactionStorage';

export class TransactionSummaryService {
  private static instance: TransactionSummaryService;
  private storage: SQLiteStorageService;
  private logger: LoggingService;
  private queryService: TransactionQueryService;

  private constructor() {
    this.storage = SQLiteStorageService.getInstance();
    this.logger = LoggingService.getInstance();
    this.queryService = TransactionQueryService.getInstance();
  }

  public static getInstance(): TransactionSummaryService {
    if (!TransactionSummaryService.instance) {
      TransactionSummaryService.instance = new TransactionSummaryService();
    }
    return TransactionSummaryService.instance;
  }

  public async calculateDailySummary(date: string): Promise<StorageResult<DailySummaryRecord>> {
    try {
      const transactions = await this.queryService.getTransactionsByDate(date);
      if (!transactions.success || !transactions.data) {
        throw new Error('Failed to fetch transactions for summary calculation');
      }
      const txs = transactions.data;

      const summary: DailySummaryRecord = {
        summary_date: date,
        calculated_at: new Date().toISOString(),
        updated_at: undefined,
        total_transactions: txs.length,
        approved_count: txs.filter(t => t.status === 'approved').length,
        declined_count: txs.filter(t => t.status === 'declined').length,
        refunded_count: txs.filter(t => t.status === 'refunded').length,
        pending_count: txs.filter(t => t.status === 'pending').length,
        total_amount: txs.reduce((sum, t) => sum + t.amount, 0),
        approved_amount: txs.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0),
        declined_amount: txs.filter(t => t.status === 'declined').reduce((sum, t) => sum + t.amount, 0),
        refunded_amount: txs.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.amount, 0),
        total_tax: txs.reduce((sum, t) => sum + t.tax, 0),
        total_processing_fees: txs.reduce((sum, t) => sum + t.processing_fee, 0),
        net_amount: 0,
        average_transaction: 0,
        largest_transaction: 0,
        smallest_transaction: 0,
      };

      summary.net_amount = summary.approved_amount - summary.refunded_amount;
      if (txs.length > 0) {
        summary.average_transaction = summary.total_amount / txs.length;
        summary.largest_transaction = Math.max(...txs.map(t => t.amount));
        summary.smallest_transaction = Math.min(...txs.map(t => t.amount));
        summary.first_transaction_time = txs[txs.length - 1]?.transaction_time;
        summary.last_transaction_time = txs[0]?.transaction_time;
      }

      const cardBreakdown: CardTypeBreakdown = {};
      const methodBreakdown: PaymentMethodBreakdown = {};
      txs.forEach(t => {
        if (t.card_type) cardBreakdown[t.card_type] = (cardBreakdown[t.card_type] || 0) + 1;
        if (t.payment_method) methodBreakdown[t.payment_method] = (methodBreakdown[t.payment_method] || 0) + 1;
      });
      summary.card_types_breakdown = JSON.stringify(cardBreakdown);
      summary.payment_methods_breakdown = JSON.stringify(methodBreakdown);

      const sql = `INSERT OR REPLACE INTO daily_summaries (
        summary_date, calculated_at, updated_at, total_transactions, approved_count,
        declined_count, refunded_count, pending_count, total_amount, approved_amount,
        declined_amount, refunded_amount, total_tax, total_processing_fees, net_amount,
        average_transaction, largest_transaction, smallest_transaction,
        first_transaction_time, last_transaction_time, card_types_breakdown, payment_methods_breakdown
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        summary.summary_date, summary.calculated_at, summary.updated_at,
        summary.total_transactions, summary.approved_count, summary.declined_count,
        summary.refunded_count, summary.pending_count, summary.total_amount,
        summary.approved_amount, summary.declined_amount, summary.refunded_amount,
        summary.total_tax, summary.total_processing_fees, summary.net_amount,
        summary.average_transaction, summary.largest_transaction, summary.smallest_transaction,
        summary.first_transaction_time, summary.last_transaction_time,
        summary.card_types_breakdown, summary.payment_methods_breakdown,
      ];

      const saveResult = await this.storage.execute(sql, params);
      if (!saveResult.success) throw new Error('Failed to save daily summary');

      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getDailySummary(date: string): Promise<StorageResult<DailySummaryRecord | null>> {
    try {
      const result = await this.storage.queryOne<DailySummaryRecord>('SELECT * FROM daily_summaries WHERE summary_date = ?', [date]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getDailySummaryRange(startDate: string, endDate: string): Promise<StorageResult<DailySummaryRecord[]>> {
    try {
      const sql = `SELECT * FROM daily_summaries WHERE summary_date BETWEEN ? AND ? ORDER BY summary_date DESC`;
      const result = await this.storage.query<DailySummaryRecord>(sql, [startDate, endDate]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getMonthSummary(year: number, month: number): Promise<StorageResult<DailySummaryRecord>> {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      const summariesResult = await this.getDailySummaryRange(startDate, endDate);
      if (!summariesResult.success || !summariesResult.data) throw new Error('Failed to fetch daily summaries');

      const summaries = summariesResult.data;
      const monthSummary: DailySummaryRecord = {
        summary_date: `${year}-${String(month).padStart(2, '0')}`,
        calculated_at: new Date().toISOString(),
        total_transactions: 0, approved_count: 0, declined_count: 0, refunded_count: 0, pending_count: 0,
        total_amount: 0, approved_amount: 0, declined_amount: 0, refunded_amount: 0,
        total_tax: 0, total_processing_fees: 0, net_amount: 0,
        average_transaction: 0, largest_transaction: 0, smallest_transaction: Number.MAX_VALUE,
      };

      summaries.forEach(s => {
        monthSummary.total_transactions += s.total_transactions;
        monthSummary.approved_count += s.approved_count;
        monthSummary.declined_count += s.declined_count;
        monthSummary.refunded_count += s.refunded_count;
        monthSummary.pending_count += s.pending_count;
        monthSummary.total_amount += s.total_amount;
        monthSummary.approved_amount += s.approved_amount;
        monthSummary.declined_amount += s.declined_amount;
        monthSummary.refunded_amount += s.refunded_amount;
        monthSummary.total_tax += s.total_tax;
        monthSummary.total_processing_fees += s.total_processing_fees;
        monthSummary.net_amount += s.net_amount;
        if (s.largest_transaction > monthSummary.largest_transaction) monthSummary.largest_transaction = s.largest_transaction;
        if (s.smallest_transaction < monthSummary.smallest_transaction) monthSummary.smallest_transaction = s.smallest_transaction;
      });

      if (monthSummary.total_transactions > 0) {
        monthSummary.average_transaction = monthSummary.total_amount / monthSummary.total_transactions;
      }

      return { success: true, data: monthSummary };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
