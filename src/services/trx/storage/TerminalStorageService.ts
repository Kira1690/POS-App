/**
 * TerminalStorageService.ts - SQLite-based terminal history and selected terminal storage for TRX
 */

import { StorageResult } from './interfaces/ISQLiteStorage';
import { SQLiteStorageService } from './SQLiteStorageService';
import { LoggingService } from '../logging/LoggingService';
import { TerminalHistoryRecord, TerminalStatistics } from '@/types/trx/storage/TerminalStorage';

export interface StoredTerminal {
  ip: string;
  port: number;
  name?: string;
  connectedAt: string;
  lastPingSuccess: string;
  isSelected: boolean;
}

export class TerminalStorageService {
  private static instance: TerminalStorageService;
  private storage: SQLiteStorageService;
  private logger: LoggingService;

  private constructor() {
    this.storage = SQLiteStorageService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): TerminalStorageService {
    if (!TerminalStorageService.instance) {
      TerminalStorageService.instance = new TerminalStorageService();
    }
    return TerminalStorageService.instance;
  }

  public async saveConnection(record: TerminalHistoryRecord): Promise<StorageResult<number>> {
    try {
      const sql = `
        INSERT INTO terminal_history (
          terminal_ip, terminal_port, terminal_name, connection_timestamp, connection_status,
          response_time, error_message, connection_type, terminal_capabilities,
          session_duration, transactions_count, app_version, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        record.terminal_ip, record.terminal_port, record.terminal_name,
        record.connection_timestamp, record.connection_status, record.response_time,
        record.error_message, record.connection_type, record.terminal_capabilities,
        record.session_duration, record.transactions_count, record.app_version, record.notes,
      ];
      const result = await this.storage.execute(sql, params);
      if (result.success) {
        this.logger.debug(`Terminal connection saved: ${record.terminal_ip}:${record.terminal_port}`, 'TerminalStorageService.saveConnection');
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getHistory(ip: string, port: number, limit = 50): Promise<StorageResult<TerminalHistoryRecord[]>> {
    try {
      const sql = `
        SELECT * FROM terminal_history
        WHERE terminal_ip = ? AND terminal_port = ?
        ORDER BY connection_timestamp DESC
        LIMIT ?
      `;
      const result = await this.storage.query<TerminalHistoryRecord>(sql, [ip, port, limit]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getRecentTerminals(limit = 20): Promise<StorageResult<TerminalHistoryRecord[]>> {
    try {
      const sql = `
        SELECT DISTINCT terminal_ip, terminal_port, terminal_name,
          MAX(connection_timestamp) as connection_timestamp,
          connection_status, response_time, error_message, connection_type,
          terminal_capabilities, session_duration, transactions_count, app_version, notes
        FROM terminal_history
        GROUP BY terminal_ip, terminal_port
        ORDER BY connection_timestamp DESC
        LIMIT ?
      `;
      const result = await this.storage.query<TerminalHistoryRecord>(sql, [limit]);
      return { success: result.success, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getTerminalStatistics(ip: string, port: number): Promise<StorageResult<TerminalStatistics>> {
    try {
      const sql = `
        SELECT
          terminal_ip, terminal_port, terminal_name,
          COUNT(*) as total_connections,
          SUM(CASE WHEN connection_status = 'connected' THEN 1 ELSE 0 END) as successful_connections,
          SUM(CASE WHEN connection_status != 'connected' THEN 1 ELSE 0 END) as failed_connections,
          AVG(CASE WHEN connection_status = 'connected' THEN response_time END) as average_response_time,
          MAX(CASE WHEN connection_status = 'connected' THEN connection_timestamp END) as last_successful_connection,
          MAX(connection_timestamp) as last_connection_attempt,
          SUM(transactions_count) as total_transactions
        FROM terminal_history
        WHERE terminal_ip = ? AND terminal_port = ?
        GROUP BY terminal_ip, terminal_port
      `;
      const result = await this.storage.queryOne<{
        terminal_ip: string; terminal_port: number; terminal_name?: string;
        total_connections: number; successful_connections: number; failed_connections: number;
        average_response_time?: number; last_successful_connection?: string;
        last_connection_attempt?: string; total_transactions: number;
      }>(sql, [ip, port]);

      if (!result.success || !result.data) {
        return { success: true, data: { terminal_ip: ip, terminal_port: port, total_connections: 0, successful_connections: 0, failed_connections: 0, success_rate: 0, total_transactions: 0 } };
      }

      const stats: TerminalStatistics = {
        ...result.data,
        success_rate: result.data.total_connections > 0 ? (result.data.successful_connections / result.data.total_connections) * 100 : 0,
      };
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async cleanupFailedConnections(olderThanDays = 30): Promise<StorageResult<void>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      const sql = `DELETE FROM terminal_history WHERE connection_status != 'connected' AND connection_timestamp < ?`;
      const result = await this.storage.execute(sql, [cutoffDate.toISOString()]);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  // ── Selected terminal (SQLite) ──────────────────────────────────────────────

  public async saveSelectedTerminal(terminal: StoredTerminal): Promise<boolean> {
    try {
      await this.storage.execute('DELETE FROM terminal_settings');
      await this.storage.execute(
        `INSERT INTO terminal_settings (ip, port, name, is_selected, connected_at, last_ping_success, updated_at)
         VALUES (?, ?, ?, 1, ?, ?, datetime('now'))`,
        [terminal.ip, terminal.port, terminal.name ?? null, terminal.connectedAt, terminal.lastPingSuccess]
      );
      this.logger.debug(`Selected terminal saved: ${terminal.ip}:${terminal.port}`, 'TerminalStorageService.saveSelectedTerminal');
      return true;
    } catch (error) {
      this.logger.error('Failed to save selected terminal', error instanceof Error ? error : new Error(String(error)), 'TerminalStorageService.saveSelectedTerminal');
      return false;
    }
  }

  public async getSelectedTerminal(): Promise<StoredTerminal | null> {
    try {
      const result = await this.storage.queryOne<{
        ip: string; port: number; name?: string;
        connected_at?: string; last_ping_success?: string;
      }>('SELECT * FROM terminal_settings WHERE is_selected = 1 LIMIT 1');

      if (!result.success || !result.data) return null;

      const row = result.data;
      return {
        ip: row.ip,
        port: row.port,
        name: row.name,
        connectedAt: row.connected_at ?? new Date().toISOString(),
        lastPingSuccess: row.last_ping_success ?? new Date().toISOString(),
        isSelected: true,
      };
    } catch (error) {
      this.logger.error('Failed to get selected terminal', error instanceof Error ? error : new Error(String(error)), 'TerminalStorageService.getSelectedTerminal');
      return null;
    }
  }

  public async clearSelectedTerminal(): Promise<boolean> {
    try {
      await this.storage.execute('DELETE FROM terminal_settings');
      this.logger.info('Selected terminal cleared', 'TerminalStorageService.clearSelectedTerminal');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear selected terminal', error instanceof Error ? error : new Error(String(error)), 'TerminalStorageService.clearSelectedTerminal');
      return false;
    }
  }
}
