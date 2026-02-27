/**
 * TransactionStatisticsService.ts - Statistical calculations for TRX transactions
 */

import { StorageResult } from '../interfaces/ISQLiteStorage';
import { SQLiteStorageService } from '../SQLiteStorageService';
import { LoggingService } from '../../logging/LoggingService';

export class TransactionStatisticsService {
  private static instance: TransactionStatisticsService;
  private storage: SQLiteStorageService;
  private logger: LoggingService;

  private constructor() {
    this.storage = SQLiteStorageService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): TransactionStatisticsService {
    if (!TransactionStatisticsService.instance) {
      TransactionStatisticsService.instance = new TransactionStatisticsService();
    }
    return TransactionStatisticsService.instance;
  }

  public async getTransactionCount(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<number>> {
    try {
      let sql = 'SELECT COUNT(*) as count FROM transactions';
      const params: unknown[] = [];
      if (dateRange) {
        sql += ' WHERE transaction_date BETWEEN ? AND ?';
        params.push(dateRange.startDate, dateRange.endDate);
      }
      const result = await this.storage.queryOne<{ count: number }>(sql, params);
      return { success: result.success, data: result.data?.count || 0, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getTotalAmount(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<number>> {
    try {
      let sql = "SELECT SUM(amount) as total FROM transactions WHERE status = 'approved'";
      const params: unknown[] = [];
      if (dateRange) {
        sql += ' AND transaction_date BETWEEN ? AND ?';
        params.push(dateRange.startDate, dateRange.endDate);
      }
      const result = await this.storage.queryOne<{ total: number }>(sql, params);
      return { success: result.success, data: result.data?.total || 0, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
