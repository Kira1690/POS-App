/**
 * TransactionQueryService.ts - Query operations for TRX transactions
 */

import { StorageResult } from '../interfaces/ISQLiteStorage';
import { SQLiteStorageService } from '../SQLiteStorageService';
import { LoggingService } from '../../logging/LoggingService';
import {
  TransactionRecord,
  TransactionFilters,
  TransactionQueryResult,
} from '@/types/trx/storage/TransactionStorage';

export class TransactionQueryService {
  private static instance: TransactionQueryService;
  private storage: SQLiteStorageService;
  private logger: LoggingService;

  private constructor() {
    this.storage = SQLiteStorageService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): TransactionQueryService {
    if (!TransactionQueryService.instance) {
      TransactionQueryService.instance = new TransactionQueryService();
    }
    return TransactionQueryService.instance;
  }

  public async getTransactionsByDate(date: string): Promise<StorageResult<TransactionRecord[]>> {
    try {
      const sql = `SELECT * FROM transactions WHERE transaction_date = ? ORDER BY transaction_datetime DESC`;
      const result = await this.storage.query<TransactionRecord>(sql, [date]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getTransactionsByDateRange(startDate: string, endDate: string): Promise<StorageResult<TransactionRecord[]>> {
    try {
      const sql = `SELECT * FROM transactions WHERE transaction_date BETWEEN ? AND ? ORDER BY transaction_datetime DESC`;
      const result = await this.storage.query<TransactionRecord>(sql, [startDate, endDate]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getTransactionsForToday(): Promise<StorageResult<TransactionRecord[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getTransactionsByDate(today);
  }

  public async getTransactionsForYesterday(): Promise<StorageResult<TransactionRecord[]>> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.getTransactionsByDate(yesterday.toISOString().split('T')[0]);
  }

  public async queryTransactions(filters: TransactionFilters): Promise<StorageResult<TransactionQueryResult>> {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (filters.date) {
        conditions.push('transaction_date = ?');
        params.push(filters.date);
      } else {
        if (filters.startDate) { conditions.push('transaction_date >= ?'); params.push(filters.startDate); }
        if (filters.endDate) { conditions.push('transaction_date <= ?'); params.push(filters.endDate); }
      }

      if (filters.status && filters.status.length > 0) {
        const placeholders = filters.status.map(() => '?').join(', ');
        conditions.push(`status IN (${placeholders})`);
        params.push(...filters.status);
      }

      if (filters.terminalIp) { conditions.push('terminal_ip = ?'); params.push(filters.terminalIp); }
      if (filters.terminalPort) { conditions.push('terminal_port = ?'); params.push(filters.terminalPort); }
      if (filters.isRefunded !== undefined) { conditions.push('is_refunded = ?'); params.push(filters.isRefunded ? 1 : 0); }
      if (filters.refundable) { conditions.push("status = 'approved' AND is_refunded = 0"); }

      if (filters.searchQuery) {
        conditions.push('(id LIKE ? OR card_last_four LIKE ? OR receipt_number LIKE ?)');
        const searchPattern = `%${filters.searchQuery}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const sortBy = filters.sortBy || 'transaction_datetime';
      const sortOrder = filters.sortOrder || 'DESC';
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const countSql = `SELECT COUNT(*) as total FROM transactions ${whereClause}`;
      const countResult = await this.storage.queryOne<{ total: number }>(countSql, params);
      const total = countResult.data?.total || 0;

      const sql = `SELECT * FROM transactions ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
      const result = await this.storage.query<TransactionRecord>(sql, [...params, limit, offset]);

      return {
        success: result.success,
        data: { transactions: result.data || [], total, hasMore: offset + limit < total },
        error: result.error,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getApprovedTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>> {
    return this.queryTransactions({ status: ['approved'], ...dateRange }).then(r => ({ success: r.success, data: r.data?.transactions, error: r.error }));
  }

  public async getDeclinedTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>> {
    return this.queryTransactions({ status: ['declined'], ...dateRange }).then(r => ({ success: r.success, data: r.data?.transactions, error: r.error }));
  }

  public async getRefundedTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>> {
    return this.queryTransactions({ status: ['refunded'], ...dateRange }).then(r => ({ success: r.success, data: r.data?.transactions, error: r.error }));
  }

  public async getRefundableTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>> {
    return this.queryTransactions({ refundable: true, ...dateRange }).then(r => ({ success: r.success, data: r.data?.transactions, error: r.error }));
  }

  public async searchTransactions(query: string, filters?: TransactionFilters): Promise<StorageResult<TransactionRecord[]>> {
    return this.queryTransactions({ ...filters, searchQuery: query }).then(r => ({ success: r.success, data: r.data?.transactions, error: r.error }));
  }

  public async findTransactionByGUID(guid: string): Promise<StorageResult<TransactionRecord | null>> {
    try {
      const result = await this.storage.queryOne<TransactionRecord>('SELECT * FROM transactions WHERE guid = ? LIMIT 1', [guid]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
