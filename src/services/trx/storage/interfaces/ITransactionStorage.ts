/**
 * ITransactionStorage.ts - Interface for transaction storage operations
 */

import {
  TransactionRecord,
  TransactionFilters,
  TransactionQueryResult,
  DailySummaryRecord,
  RefundRecord,
} from '@/types/trx/storage/TransactionStorage';
import { StorageResult } from './ISQLiteStorage';

export interface ITransactionStorage {
  saveTransaction(transaction: TransactionRecord): Promise<StorageResult<string>>;
  saveTransactionBatch(transactions: TransactionRecord[]): Promise<StorageResult<string[]>>;
  getTransaction(id: string): Promise<StorageResult<TransactionRecord | null>>;
  updateTransaction(id: string, updates: Partial<TransactionRecord>): Promise<StorageResult<void>>;
  deleteTransaction(id: string): Promise<StorageResult<void>>;
  getTransactionsByDate(date: string): Promise<StorageResult<TransactionRecord[]>>;
  getTransactionsByDateRange(startDate: string, endDate: string): Promise<StorageResult<TransactionRecord[]>>;
  getTransactionsForToday(): Promise<StorageResult<TransactionRecord[]>>;
  getTransactionsForYesterday(): Promise<StorageResult<TransactionRecord[]>>;
  queryTransactions(filters: TransactionFilters): Promise<StorageResult<TransactionQueryResult>>;
  getApprovedTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>>;
  getDeclinedTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>>;
  getRefundedTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>>;
  getRefundableTransactions(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<TransactionRecord[]>>;
  searchTransactions(query: string, filters?: TransactionFilters): Promise<StorageResult<TransactionRecord[]>>;
  findTransactionByGUID(guid: string): Promise<StorageResult<TransactionRecord | null>>;
  calculateDailySummary(date: string): Promise<StorageResult<DailySummaryRecord>>;
  getDailySummary(date: string): Promise<StorageResult<DailySummaryRecord | null>>;
  getDailySummaryRange(startDate: string, endDate: string): Promise<StorageResult<DailySummaryRecord[]>>;
  getMonthSummary(year: number, month: number): Promise<StorageResult<DailySummaryRecord>>;
  saveRefund(refund: RefundRecord): Promise<StorageResult<string>>;
  getRefund(id: string): Promise<StorageResult<RefundRecord | null>>;
  getRefundsByTransaction(transactionId: string): Promise<StorageResult<RefundRecord[]>>;
  getRefundHistory(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<RefundRecord[]>>;
  getTransactionCount(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<number>>;
  getTotalAmount(dateRange?: { startDate: string; endDate: string }): Promise<StorageResult<number>>;
}
