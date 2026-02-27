/**
 * TransactionRefundService.ts - Refund operations for TRX transactions
 */

import { StorageResult } from '../interfaces/ISQLiteStorage';
import { SQLiteStorageService } from '../SQLiteStorageService';
import { LoggingService } from '../../logging/LoggingService';
import { TransactionCrudService } from './TransactionCrudService';
import { RefundRecord } from '@/types/trx/storage/TransactionStorage';

export class TransactionRefundService {
  private static instance: TransactionRefundService;
  private storage: SQLiteStorageService;
  private logger: LoggingService;
  private crudService: TransactionCrudService;

  private constructor() {
    this.storage = SQLiteStorageService.getInstance();
    this.logger = LoggingService.getInstance();
    this.crudService = TransactionCrudService.getInstance();
  }

  public static getInstance(): TransactionRefundService {
    if (!TransactionRefundService.instance) {
      TransactionRefundService.instance = new TransactionRefundService();
    }
    return TransactionRefundService.instance;
  }

  public async saveRefund(refund: RefundRecord): Promise<StorageResult<string>> {
    try {
      const sql = `
        INSERT INTO refunds (
          id, created_at, updated_at, refund_date, refund_time, refund_datetime,
          original_transaction_id, original_amount, refund_amount, refund_type,
          refund_reason, refund_status, refund_transaction_id, refund_approval_code,
          refund_guid, processed_by, terminal_ip, terminal_port, raw_response, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        refund.id, refund.created_at, refund.updated_at,
        refund.refund_date, refund.refund_time, refund.refund_datetime,
        refund.original_transaction_id, refund.original_amount, refund.refund_amount,
        refund.refund_type, refund.refund_reason, refund.refund_status,
        refund.refund_transaction_id, refund.refund_approval_code, refund.refund_guid,
        refund.processed_by, refund.terminal_ip, refund.terminal_port,
        refund.raw_response, refund.notes,
      ];
      const result = await this.storage.execute(sql, params);
      if (result.success) {
        await this.crudService.updateTransaction(refund.original_transaction_id, {
          is_refunded: 1,
          refund_id: refund.id,
        });
      }
      return { success: result.success, data: result.success ? refund.id : undefined, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getRefund(id: string): Promise<StorageResult<RefundRecord | null>> {
    try {
      const result = await this.storage.queryOne<RefundRecord>('SELECT * FROM refunds WHERE id = ?', [id]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getRefundsByTransaction(transactionId: string): Promise<StorageResult<RefundRecord[]>> {
    try {
      const result = await this.storage.query<RefundRecord>(
        'SELECT * FROM refunds WHERE original_transaction_id = ? ORDER BY refund_datetime DESC',
        [transactionId]
      );
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getRefundHistory(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<RefundRecord[]>> {
    try {
      let sql = 'SELECT * FROM refunds';
      const params: unknown[] = [];
      if (dateRange) {
        sql += ' WHERE refund_date BETWEEN ? AND ?';
        params.push(dateRange.startDate, dateRange.endDate);
      }
      sql += ' ORDER BY refund_datetime DESC';
      const result = await this.storage.query<RefundRecord>(sql, params);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
