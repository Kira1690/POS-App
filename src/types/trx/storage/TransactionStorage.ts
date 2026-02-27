/**
 * TransactionStorage.ts
 *
 * Type definitions for transaction storage
 * Maps to SQLite transactions table schema
 */

/**
 * Transaction record stored in SQLite database
 * Complete transaction data including MML protocol fields
 */
export interface TransactionRecord {
  // Primary Identification
  id: string;
  created_at: string;
  updated_at?: string;

  // Transaction Core Data
  transaction_date: string;
  transaction_time: string;
  transaction_datetime: string;

  // Financial Data
  amount: number;
  subtotal: number;
  tax: number;
  processing_fee: number;
  currency: string;

  // Transaction Status
  status: TransactionStatus;
  payment_method: string;

  // MML Protocol Response Data (from POS Terminal)
  guid?: string;
  purchase_id?: string;
  tran_date?: string;
  tran_time?: string;
  account_brand?: string;
  card_last_four?: string;

  // Result Data
  approval_code?: string;
  avs_result?: string;
  available_balance?: string;

  // EMV Chip Card Data
  emv_tags?: string; // JSON string

  // Response Status
  response_code?: string;
  response_text?: string;
  raw_response?: string;

  // Legacy/Compatibility
  transaction_id_pos?: string;
  card_type?: string;

  // Terminal Information
  terminal_ip: string;
  terminal_port: number;
  terminal_name?: string;

  // Receipt Information
  receipt_number?: string;

  // Refund Relationship
  is_refunded: number; // SQLite boolean: 0 = false, 1 = true
  refund_id?: string;

  // Metadata
  cashier_id?: string;
  notes?: string;
  sync_status: SyncStatus;
}

export type TransactionStatus = 'approved' | 'declined' | 'refunded' | 'pending';
export type SyncStatus = 'local' | 'synced' | 'error';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  date?: string;
  status?: TransactionStatus[];
  terminalIp?: string;
  terminalPort?: number;
  isRefunded?: boolean;
  refundable?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'transaction_datetime' | 'amount' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface DailySummaryRecord {
  summary_date: string;
  calculated_at: string;
  updated_at?: string;
  total_transactions: number;
  approved_count: number;
  declined_count: number;
  refunded_count: number;
  pending_count: number;
  total_amount: number;
  approved_amount: number;
  declined_amount: number;
  refunded_amount: number;
  total_tax: number;
  total_processing_fees: number;
  net_amount: number;
  average_transaction: number;
  largest_transaction: number;
  smallest_transaction: number;
  first_transaction_time?: string;
  last_transaction_time?: string;
  card_types_breakdown?: string;
  payment_methods_breakdown?: string;
}

export interface RefundRecord {
  id: string;
  created_at: string;
  updated_at?: string;
  refund_date: string;
  refund_time: string;
  refund_datetime: string;
  original_transaction_id: string;
  original_amount: number;
  refund_amount: number;
  refund_type: 'full' | 'partial';
  refund_reason?: string;
  refund_status: 'pending' | 'approved' | 'declined' | 'completed';
  refund_transaction_id?: string;
  refund_approval_code?: string;
  refund_guid?: string;
  processed_by?: string;
  terminal_ip?: string;
  terminal_port?: number;
  raw_response?: string;
  notes?: string;
}

export interface CardTypeBreakdown {
  [cardType: string]: number;
}

export interface PaymentMethodBreakdown {
  [method: string]: number;
}

export interface TransactionQueryResult {
  transactions: TransactionRecord[];
  total: number;
  hasMore: boolean;
}
