/**
 * TerminalStorage.ts
 *
 * Type definitions for terminal history storage
 * Maps to SQLite terminal_history table schema
 */

export interface TerminalHistoryRecord {
  id?: number; // Auto-increment
  terminal_ip: string;
  terminal_port: number;
  terminal_name?: string;
  connection_timestamp: string;
  connection_status: ConnectionStatus;
  response_time?: number; // Milliseconds
  error_message?: string;
  connection_type: ConnectionType;
  terminal_capabilities?: string; // JSON string
  session_duration?: number; // Seconds
  transactions_count: number;
  app_version?: string;
  notes?: string;
}

export type ConnectionStatus = 'connected' | 'failed' | 'timeout' | 'disconnected';
export type ConnectionType = 'manual' | 'auto-discovery' | 'preferred';

export interface TerminalStatistics {
  terminal_ip: string;
  terminal_port: number;
  terminal_name?: string;
  total_connections: number;
  successful_connections: number;
  failed_connections: number;
  success_rate: number;
  average_response_time?: number;
  last_successful_connection?: string;
  last_connection_attempt?: string;
  total_transactions: number;
}

export interface TerminalCapabilities {
  supportsEmv?: boolean;
  supportsContactless?: boolean;
  supportsMagstripe?: boolean;
  supportsRefunds?: boolean;
  supportsTip?: boolean;
  supportsCashback?: boolean;
  firmwareVersion?: string;
  deviceModel?: string;
}

export interface TerminalHistoryFilters {
  terminal_ip?: string;
  terminal_port?: number;
  connection_status?: ConnectionStatus[];
  connection_type?: ConnectionType[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
