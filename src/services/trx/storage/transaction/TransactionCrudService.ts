/**
 * TransactionCrudService.ts - CRUD operations for TRX transactions
 */

import { StorageResult } from '../interfaces/ISQLiteStorage';
import { SQLiteStorageService } from '../SQLiteStorageService';
import { LoggingService } from '../../logging/LoggingService';
import { TransactionRecord } from '@/types/trx/storage/TransactionStorage';

export class TransactionCrudService {
  private static instance: TransactionCrudService;
  private storage: SQLiteStorageService;
  private logger: LoggingService;

  private constructor() {
    this.storage = SQLiteStorageService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): TransactionCrudService {
    if (!TransactionCrudService.instance) {
      TransactionCrudService.instance = new TransactionCrudService();
    }
    return TransactionCrudService.instance;
  }

  public async saveTransaction(transaction: TransactionRecord): Promise<StorageResult<string>> {
    try {
      this.logger.debug(`Saving transaction ${transaction.id}`, 'TransactionCrudService.saveTransaction');
      const sql = `
        INSERT INTO transactions (
          id, created_at, updated_at, transaction_date, transaction_time, transaction_datetime,
          amount, subtotal, tax, processing_fee, currency, status, payment_method,
          guid, purchase_id, tran_date, tran_time, account_brand, card_last_four,
          approval_code, avs_result, available_balance, emv_tags, response_code, response_text,
          raw_response, transaction_id_pos, card_type, terminal_ip, terminal_port, terminal_name,
          receipt_number, is_refunded, refund_id, cashier_id, notes, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        transaction.id, transaction.created_at, transaction.updated_at,
        transaction.transaction_date, transaction.transaction_time, transaction.transaction_datetime,
        transaction.amount, transaction.subtotal, transaction.tax, transaction.processing_fee,
        transaction.currency, transaction.status, transaction.payment_method,
        transaction.guid, transaction.purchase_id, transaction.tran_date, transaction.tran_time,
        transaction.account_brand, transaction.card_last_four, transaction.approval_code,
        transaction.avs_result, transaction.available_balance, transaction.emv_tags,
        transaction.response_code, transaction.response_text, transaction.raw_response,
        transaction.transaction_id_pos, transaction.card_type,
        transaction.terminal_ip, transaction.terminal_port, transaction.terminal_name,
        transaction.receipt_number, transaction.is_refunded, transaction.refund_id,
        transaction.cashier_id, transaction.notes, transaction.sync_status,
      ];
      const result = await this.storage.execute(sql, params);
      return { success: result.success, data: result.success ? transaction.id : undefined, error: result.error };
    } catch (error) {
      this.logger.error('Failed to save transaction', error instanceof Error ? error : new Error(String(error)), 'TransactionCrudService.saveTransaction');
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async saveTransactionBatch(transactions: TransactionRecord[]): Promise<StorageResult<string[]>> {
    try {
      const result = await this.storage.transaction(async () => {
        const ids: string[] = [];
        for (const transaction of transactions) {
          const saveResult = await this.saveTransaction(transaction);
          if (saveResult.success && saveResult.data) {
            ids.push(saveResult.data);
          } else {
            throw new Error(`Failed to save transaction ${transaction.id}`);
          }
        }
        return ids;
      });
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getTransaction(id: string): Promise<StorageResult<TransactionRecord | null>> {
    try {
      const result = await this.storage.queryOne<TransactionRecord>('SELECT * FROM transactions WHERE id = ?', [id]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async updateTransaction(id: string, updates: Partial<TransactionRecord>): Promise<StorageResult<void>> {
    try {
      const setClauses: string[] = [];
      const params: unknown[] = [];
      Object.entries(updates).forEach(([key, value]) => {
        setClauses.push(`${key} = ?`);
        params.push(value);
      });
      setClauses.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      const sql = `UPDATE transactions SET ${setClauses.join(', ')} WHERE id = ?`;
      const result = await this.storage.execute(sql, params);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async deleteTransaction(id: string): Promise<StorageResult<void>> {
    try {
      const result = await this.storage.execute('DELETE FROM transactions WHERE id = ?', [id]);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
