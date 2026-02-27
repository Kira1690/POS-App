/**
 * TransactionStorageService.ts - Orchestrator for TRX transaction storage
 */

import { LoggingService } from '../logging/LoggingService';
import { ITransactionStorage } from './interfaces/ITransactionStorage';
import { StorageResult } from './interfaces/ISQLiteStorage';
import {
  TransactionCrudService,
  TransactionQueryService,
  TransactionSummaryService,
  TransactionRefundService,
  TransactionStatisticsService,
} from './transaction';
import {
  TransactionRecord,
  TransactionFilters,
  TransactionQueryResult,
  DailySummaryRecord,
  RefundRecord,
} from '@/types/trx/storage/TransactionStorage';

export class TransactionStorageService implements ITransactionStorage {
  private static instance: TransactionStorageService;
  private crudService: TransactionCrudService;
  private queryService: TransactionQueryService;
  private summaryService: TransactionSummaryService;
  private refundService: TransactionRefundService;
  private statisticsService: TransactionStatisticsService;
  private logger: LoggingService;

  private constructor() {
    this.crudService = TransactionCrudService.getInstance();
    this.queryService = TransactionQueryService.getInstance();
    this.summaryService = TransactionSummaryService.getInstance();
    this.refundService = TransactionRefundService.getInstance();
    this.statisticsService = TransactionStatisticsService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): TransactionStorageService {
    if (!TransactionStorageService.instance) {
      TransactionStorageService.instance = new TransactionStorageService();
    }
    return TransactionStorageService.instance;
  }

  saveTransaction(t: TransactionRecord) { return this.crudService.saveTransaction(t); }
  saveTransactionBatch(ts: TransactionRecord[]) { return this.crudService.saveTransactionBatch(ts); }
  getTransaction(id: string) { return this.crudService.getTransaction(id); }
  updateTransaction(id: string, updates: Partial<TransactionRecord>) { return this.crudService.updateTransaction(id, updates); }
  deleteTransaction(id: string) { return this.crudService.deleteTransaction(id); }
  getTransactionsByDate(date: string) { return this.queryService.getTransactionsByDate(date); }
  getTransactionsByDateRange(s: string, e: string) { return this.queryService.getTransactionsByDateRange(s, e); }
  getTransactionsForToday() { return this.queryService.getTransactionsForToday(); }
  getTransactionsForYesterday() { return this.queryService.getTransactionsForYesterday(); }
  queryTransactions(filters: TransactionFilters) { return this.queryService.queryTransactions(filters); }
  getApprovedTransactions(dr?: { startDate: string; endDate: string }) { return this.queryService.getApprovedTransactions(dr); }
  getDeclinedTransactions(dr?: { startDate: string; endDate: string }) { return this.queryService.getDeclinedTransactions(dr); }
  getRefundedTransactions(dr?: { startDate: string; endDate: string }) { return this.queryService.getRefundedTransactions(dr); }
  getRefundableTransactions(dr?: { startDate: string; endDate: string }) { return this.queryService.getRefundableTransactions(dr); }
  searchTransactions(q: string, f?: TransactionFilters) { return this.queryService.searchTransactions(q, f); }
  findTransactionByGUID(guid: string) { return this.queryService.findTransactionByGUID(guid); }
  calculateDailySummary(date: string) { return this.summaryService.calculateDailySummary(date); }
  getDailySummary(date: string) { return this.summaryService.getDailySummary(date); }
  getDailySummaryRange(s: string, e: string) { return this.summaryService.getDailySummaryRange(s, e); }
  getMonthSummary(year: number, month: number) { return this.summaryService.getMonthSummary(year, month); }
  saveRefund(r: RefundRecord) { return this.refundService.saveRefund(r); }
  getRefund(id: string) { return this.refundService.getRefund(id); }
  getRefundsByTransaction(tid: string) { return this.refundService.getRefundsByTransaction(tid); }
  getRefundHistory(dr?: { startDate: string; endDate: string }) { return this.refundService.getRefundHistory(dr); }
  getTransactionCount(dr?: { startDate: string; endDate: string }) { return this.statisticsService.getTransactionCount(dr); }
  getTotalAmount(dr?: { startDate: string; endDate: string }) { return this.statisticsService.getTotalAmount(dr); }
}
