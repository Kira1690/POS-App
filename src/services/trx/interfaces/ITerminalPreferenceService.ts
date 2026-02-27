/**
 * ITerminalPreferenceService - Interface for terminal preference management
 */

import { PreferredTerminal, TerminalPreferenceResult, TerminalConnectionStatus } from '@/types/trx/Terminal';

export interface ITerminalPreferenceService {
  getPreferredTerminal(): Promise<{ success: boolean; data?: PreferredTerminal; error?: string }>;
  setPreferredTerminal(ip: string, port: number, name?: string): Promise<TerminalPreferenceResult>;
  removePreferredTerminal(): Promise<{ success: boolean; error?: string }>;
  getTerminalHistory(limit?: number): Promise<{ success: boolean; data?: PreferredTerminal[]; error?: string }>;
  validateTerminalParams(ip: string, port: number): { isValid: boolean; errors: { ip?: string; port?: string } };
  getConnectionStatus(terminal?: PreferredTerminal | null): TerminalConnectionStatus;
  isPreferredTerminal(ip: string, port: number): Promise<boolean>;
  getTerminalDisplayName(ip: string, port: number): string;
}
