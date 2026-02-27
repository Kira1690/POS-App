// Custom hook for TRX transaction management
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  Transaction,
  TransactionFilter,
} from '@/types/trx/Transaction';
import { TRXTransactionService } from '@/services/trx/TRXTransactionService';

interface UseTRXTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  total: number;
  hasMore: boolean;
  filters: Partial<TransactionFilter>;
  searchTransactions: (filter?: Partial<TransactionFilter>, limit?: number, offset?: number) => Promise<void>;
  getTransactionById: (id: string) => Promise<Transaction | null>;
  getRecentTransactions: (count?: number) => Promise<Transaction[]>;
  exportTransactions: (format: 'csv' | 'json') => Promise<string | null>;
  issueRefund: (transactionId: string, amount?: number, reason?: string) => Promise<boolean>;
  getStatistics: () => {
    totalAmount: number;
    approvedCount: number;
    declinedCount: number;
    refundedCount: number;
    pendingCount: number;
    averageAmount: number;
  };
  setFilter: (filter: Partial<TransactionFilter>) => void;
  clearFilters: () => void;
  canRefund: (transaction: Transaction) => boolean;
}

export const useTRXTransactions = (): UseTRXTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<Partial<TransactionFilter>>({});

  const transactionService = TRXTransactionService.getInstance();

  useEffect(() => {
    searchTransactions();
  }, []);

  const searchTransactions = async (
    filter?: Partial<TransactionFilter>,
    limit?: number,
    offset?: number
  ): Promise<void> => {
    setLoading(true);
    try {
      const appliedFilter = filter || filters;
      const result = await transactionService.getTransactions(appliedFilter, limit, offset);

      if (result.success) {
        setTransactions(result.data || []);
        setTotal(result.totalCount || 0);
        setHasMore(false);
        if (filter) setFilters(appliedFilter);
      } else {
        Alert.alert('Error', result.error || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Failed to search transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionById = async (id: string): Promise<Transaction | null> => {
    const result = await transactionService.getTransactionById(id);
    if (result.success && result.data) return result.data;
    Alert.alert('Error', result.error || 'Transaction not found');
    return null;
  };

  const getRecentTransactions = async (count = 10): Promise<Transaction[]> => {
    const result = await transactionService.getRecentTransactions(count);
    if (result.success) return result.data || [];
    Alert.alert('Error', result.error || 'Failed to load recent transactions');
    return [];
  };

  const exportTransactions = async (format: 'csv' | 'json'): Promise<string | null> => {
    if (transactions.length === 0) {
      Alert.alert('No Data', 'No transactions to export');
      return null;
    }
    const result = await transactionService.exportTransactions(transactions, format);
    if (result.success && result.data) return result.data;
    Alert.alert('Export Error', result.error || 'Failed to export transactions');
    return null;
  };

  const issueRefund = async (
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<boolean> => {
    const result = await transactionService.issueRefund(transactionId, amount, reason);
    if (result.success) {
      await searchTransactions();
      Alert.alert('Success', 'Refund issued successfully');
      return true;
    } else {
      Alert.alert('Refund Error', result.error || 'Failed to issue refund');
      return false;
    }
  };

  const getStatistics = () => {
    return transactionService.getTransactionStats(transactions);
  };

  const setFilter = (filter: Partial<TransactionFilter>) => {
    setFilters(prev => ({ ...prev, ...filter }));
  };

  const clearFilters = () => {
    setFilters({});
    searchTransactions({});
  };

  const canRefund = (transaction: Transaction): boolean => {
    return transactionService.canRefund(transaction);
  };

  return {
    transactions,
    loading,
    total,
    hasMore,
    filters,
    searchTransactions,
    getTransactionById,
    getRecentTransactions,
    exportTransactions,
    issueRefund,
    getStatistics,
    setFilter,
    clearFilters,
    canRefund,
  };
};
