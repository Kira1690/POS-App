/**
 * TRXTerminalPreferenceService - Terminal preference management using SQLite history
 */

import { PreferredTerminal, TerminalPreferenceResult, TerminalConnectionStatus } from '@/types/trx/Terminal';
import { STORAGE_KEYS } from './config/StorageKeys';
import { ITerminalPreferenceService } from './interfaces/ITerminalPreferenceService';
import { IStorageService } from './interfaces/IStorageService';
import { StorageService } from './StorageService';
import { TerminalStorageService } from './storage/TerminalStorageService';
import { LoggingService } from './logging/LoggingService';
import type { TerminalHistoryRecord } from '@/types/trx/storage/TerminalStorage';

export class TRXTerminalPreferenceService implements ITerminalPreferenceService {
  private static instance: TRXTerminalPreferenceService;
  private storage: IStorageService;
  private terminalStorage: TerminalStorageService;
  private logger: LoggingService;

  private constructor(storage?: IStorageService) {
    this.storage = storage || StorageService.getInstance();
    this.terminalStorage = TerminalStorageService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(storage?: IStorageService): TRXTerminalPreferenceService {
    if (!TRXTerminalPreferenceService.instance) {
      TRXTerminalPreferenceService.instance = new TRXTerminalPreferenceService(storage);
    }
    return TRXTerminalPreferenceService.instance;
  }

  async getPreferredTerminal(): Promise<{ success: boolean; data?: PreferredTerminal; error?: string }> {
    try {
      const result = await this.storage.getItem<PreferredTerminal>(STORAGE_KEYS.PREFERRED_TERMINAL);
      if (!result.success) return { success: false, error: result.error };
      return { success: true, data: result.data ?? undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get preferred terminal' };
    }
  }

  async setPreferredTerminal(ip: string, port: number, name?: string): Promise<TerminalPreferenceResult> {
    try {
      const validation = this.validateTerminalParams(ip, port);
      if (!validation.isValid) {
        return { success: false, error: 'Terminal validation failed', validationErrors: Object.values(validation.errors).filter(Boolean) as string[] };
      }
      const preferredTerminal: PreferredTerminal = {
        ip, port,
        name: name || this.getTerminalDisplayName(ip, port),
        timestamp: new Date().toISOString(),
        setAt: new Date().toISOString(),
      };
      const result = await this.storage.setItem(STORAGE_KEYS.PREFERRED_TERMINAL, preferredTerminal);
      if (!result.success) return { success: false, error: result.error };
      this.logger.info(`Preferred terminal set: ${ip}:${port}`, 'TRXTerminalPreferenceService.setPreferredTerminal');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to set preferred terminal' };
    }
  }

  async removePreferredTerminal(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.storage.removeItem(STORAGE_KEYS.PREFERRED_TERMINAL);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove preferred terminal' };
    }
  }

  async logConnection(
    ip: string, port: number, success: boolean,
    responseTime?: number, errorMessage?: string,
    connectionType: 'manual' | 'auto-discovery' | 'preferred' = 'manual'
  ): Promise<void> {
    try {
      const record: TerminalHistoryRecord = {
        terminal_ip: ip, terminal_port: port,
        terminal_name: this.getTerminalDisplayName(ip, port),
        connection_timestamp: new Date().toISOString(),
        connection_status: success ? 'connected' : 'failed',
        response_time: responseTime,
        error_message: errorMessage,
        connection_type: connectionType,
        transactions_count: 0,
        app_version: '1.0.0',
      };
      await this.terminalStorage.saveConnection(record);
    } catch {
      this.logger.warn('Failed to log connection', 'TRXTerminalPreferenceService.logConnection');
    }
  }

  async getTerminalHistory(limit?: number): Promise<{ success: boolean; data?: PreferredTerminal[]; error?: string }> {
    try {
      const result = await this.terminalStorage.getRecentTerminals(limit || 20);
      if (!result.success || !result.data) {
        return { success: false, error: result.error?.message || 'Failed to get terminal history' };
      }
      const terminals: PreferredTerminal[] = result.data.map(record => ({
        ip: record.terminal_ip,
        port: record.terminal_port,
        name: record.terminal_name,
        timestamp: record.connection_timestamp,
        setAt: record.connection_timestamp,
      }));
      return { success: true, data: terminals };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get terminal history' };
    }
  }

  validateTerminalParams(ip: string, port: number): { isValid: boolean; errors: { ip?: string; port?: string } } {
    const errors: { ip?: string; port?: string } = {};
    if (!ip || typeof ip !== 'string') {
      errors.ip = 'IP address is required';
    } else {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(ip)) errors.ip = 'Invalid IP address format';
    }
    if (typeof port !== 'number' || port < 1 || port > 65535) {
      errors.port = 'Port must be between 1 and 65535';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  getConnectionStatus(terminal?: PreferredTerminal | null): TerminalConnectionStatus {
    if (!terminal) {
      return { text: 'No preferred terminal set', color: '#999999', connected: false, showSpinner: false, status: 'disconnected' };
    }
    return { text: `Terminal ${terminal.name} is set as preferred`, color: '#34C759', connected: true, showSpinner: false, status: 'connected' };
  }

  async isPreferredTerminal(ip: string, port: number): Promise<boolean> {
    try {
      const result = await this.getPreferredTerminal();
      if (!result.success || !result.data) return false;
      return result.data.ip === ip && result.data.port === port;
    } catch {
      return false;
    }
  }

  getTerminalDisplayName(ip: string, port: number): string {
    return `Terminal ${ip}:${port}`;
  }

  async cleanupOldConnections(olderThanDays = 30): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.terminalStorage.cleanupFailedConnections(olderThanDays);
      return { success: result.success, error: result.error?.message };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to cleanup' };
    }
  }
}
