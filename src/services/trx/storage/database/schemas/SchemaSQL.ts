/**
 * SchemaSQL.ts - SQL schema definitions for TRX payment database
 */

export const INITIAL_SCHEMA_SQL = `
-- Schema Version Management
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Table 1: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  transaction_date TEXT NOT NULL,
  transaction_time TEXT NOT NULL,
  transaction_datetime TEXT NOT NULL,
  amount REAL NOT NULL,
  subtotal REAL NOT NULL,
  tax REAL NOT NULL,
  processing_fee REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  guid TEXT,
  purchase_id TEXT,
  tran_date TEXT,
  tran_time TEXT,
  account_brand TEXT,
  card_last_four TEXT,
  approval_code TEXT,
  avs_result TEXT,
  available_balance TEXT,
  emv_tags TEXT,
  response_code TEXT,
  response_text TEXT,
  raw_response TEXT,
  transaction_id_pos TEXT,
  card_type TEXT,
  terminal_ip TEXT NOT NULL,
  terminal_port INTEGER NOT NULL,
  terminal_name TEXT,
  receipt_number TEXT,
  is_refunded INTEGER DEFAULT 0,
  refund_id TEXT,
  cashier_id TEXT,
  notes TEXT,
  sync_status TEXT DEFAULT 'local',
  FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE SET NULL
);

-- Table 2: daily_summaries
CREATE TABLE IF NOT EXISTS daily_summaries (
  summary_date TEXT PRIMARY KEY,
  calculated_at TEXT NOT NULL,
  updated_at TEXT,
  total_transactions INTEGER DEFAULT 0,
  approved_count INTEGER DEFAULT 0,
  declined_count INTEGER DEFAULT 0,
  refunded_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  total_amount REAL DEFAULT 0.0,
  approved_amount REAL DEFAULT 0.0,
  declined_amount REAL DEFAULT 0.0,
  refunded_amount REAL DEFAULT 0.0,
  total_tax REAL DEFAULT 0.0,
  total_processing_fees REAL DEFAULT 0.0,
  net_amount REAL DEFAULT 0.0,
  average_transaction REAL DEFAULT 0.0,
  largest_transaction REAL DEFAULT 0.0,
  smallest_transaction REAL DEFAULT 0.0,
  first_transaction_time TEXT,
  last_transaction_time TEXT,
  card_types_breakdown TEXT,
  payment_methods_breakdown TEXT
);

-- Table 3: terminal_history
CREATE TABLE IF NOT EXISTS terminal_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  terminal_ip TEXT NOT NULL,
  terminal_port INTEGER NOT NULL,
  terminal_name TEXT,
  connection_timestamp TEXT NOT NULL,
  connection_status TEXT NOT NULL,
  response_time INTEGER,
  error_message TEXT,
  connection_type TEXT,
  terminal_capabilities TEXT,
  session_duration INTEGER,
  transactions_count INTEGER DEFAULT 0,
  app_version TEXT,
  notes TEXT
);

-- Table 4: terminal_settings (selected terminal, persisted across reloads)
CREATE TABLE IF NOT EXISTS terminal_settings (
  id INTEGER PRIMARY KEY,
  ip TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 1180,
  name TEXT,
  is_selected INTEGER NOT NULL DEFAULT 1,
  connected_at TEXT,
  last_ping_success TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table 5: refunds
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  refund_date TEXT NOT NULL,
  refund_time TEXT NOT NULL,
  refund_datetime TEXT NOT NULL,
  original_transaction_id TEXT NOT NULL,
  original_amount REAL NOT NULL,
  refund_amount REAL NOT NULL,
  refund_type TEXT NOT NULL,
  refund_reason TEXT,
  refund_status TEXT NOT NULL,
  refund_transaction_id TEXT,
  refund_approval_code TEXT,
  refund_guid TEXT,
  processed_by TEXT,
  terminal_ip TEXT,
  terminal_port INTEGER,
  raw_response TEXT,
  notes TEXT,
  FOREIGN KEY (original_transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
`;

export const INDEXES_SQL = `
-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_datetime ON transactions(transaction_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transaction_guid ON transactions(guid);
CREATE INDEX IF NOT EXISTS idx_transaction_approval_code ON transactions(approval_code);
CREATE INDEX IF NOT EXISTS idx_transaction_purchase_id ON transactions(purchase_id);
CREATE INDEX IF NOT EXISTS idx_transaction_response_code ON transactions(response_code);
CREATE INDEX IF NOT EXISTS idx_transaction_terminal ON transactions(terminal_ip, terminal_port);
CREATE INDEX IF NOT EXISTS idx_transaction_date_status ON transactions(transaction_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_transaction_refundable ON transactions(status, is_refunded);
CREATE INDEX IF NOT EXISTS idx_transaction_search ON transactions(id, card_last_four, receipt_number);

-- Daily summaries indexes
CREATE INDEX IF NOT EXISTS idx_summary_date ON daily_summaries(summary_date DESC);

-- Terminal history indexes
CREATE INDEX IF NOT EXISTS idx_terminal_history_ip_port ON terminal_history(terminal_ip, terminal_port);
CREATE INDEX IF NOT EXISTS idx_terminal_history_timestamp ON terminal_history(connection_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_terminal_history_status ON terminal_history(connection_status);
CREATE INDEX IF NOT EXISTS idx_terminal_history_ip_port_timestamp ON terminal_history(terminal_ip, terminal_port, connection_timestamp DESC);

-- Refunds indexes
CREATE INDEX IF NOT EXISTS idx_refunds_original_transaction ON refunds(original_transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_date ON refunds(refund_date DESC);
CREATE INDEX IF NOT EXISTS idx_refunds_datetime ON refunds(refund_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(refund_status);
`;
