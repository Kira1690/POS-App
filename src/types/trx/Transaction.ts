/**
 * TRX Transaction Types
 */

export type TransactionStatus = 'approved' | 'declined' | 'pending' | 'refunded';
export type PaymentMethodType = 'Credit Card' | 'Debit Card' | 'Cash' | 'Other';
export type DateFilter = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'Custom Range';
export type TypeFilter = 'All Types' | 'Approved' | 'Declined' | 'Pending' | 'Refunded';

export interface Transaction {
  id: string;
  amount: number;
  subtotal: number;
  tax: number;
  processingFee: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  cardLastFour: string;
  timestamp: string;
  date: string;
  authCode?: string;
  createdAt: string;
  updatedAt?: string;
  // Additional fields for transaction details
  reference?: string;
  cardType?: string;
  lastFour?: string;
  isRefunded?: boolean;
}

export interface TransactionFilter {
  dateFilter: DateFilter;
  typeFilter: TypeFilter;
  searchText: string;
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface TransactionQueryResult {
  success: boolean;
  data: Transaction[];
  totalCount: number;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  transactionId?: string;
  refundId?: string;
  error?: string;
}
