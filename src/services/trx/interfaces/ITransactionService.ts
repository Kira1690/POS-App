/**
 * ITransactionService - Interface for TRX transaction management
 */

import {
  Transaction,
  TransactionFilter,
  TransactionQueryResult,
  RefundResult,
  DateFilter,
  TypeFilter,
} from '@/types/trx/Transaction';

export interface ITransactionService {
  getTransactions(
    filter?: Partial<TransactionFilter>,
    limit?: number,
    offset?: number
  ): Promise<TransactionQueryResult>;

  getTransactionById(id: string): Promise<{ success: boolean; data?: Transaction; error?: string }>;

  getRecentTransactions(count?: number): Promise<TransactionQueryResult>;

  filterBySearchText(transactions: Transaction[], searchText: string): Transaction[];

  filterByDate(
    transactions: Transaction[],
    dateFilter: DateFilter,
    customRange?: { startDate: string; endDate: string }
  ): Transaction[];

  filterByType(transactions: Transaction[], typeFilter: TypeFilter): Transaction[];

  groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]>;

  issueRefund(transactionId: string, amount?: number, reason?: string): Promise<RefundResult>;

  exportTransactions(
    transactions: Transaction[],
    format: 'csv' | 'json'
  ): Promise<{ success: boolean; data?: string; error?: string }>;

  getTransactionStats(transactions: Transaction[]): {
    totalAmount: number;
    approvedCount: number;
    declinedCount: number;
    refundedCount: number;
    pendingCount: number;
    averageAmount: number;
  };

  canRefund(transaction: Transaction): boolean;
}
