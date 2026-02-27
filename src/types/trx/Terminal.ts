/**
 * TRX Terminal Types
 */

export interface PreferredTerminal {
  ip: string;
  port: number;
  name?: string;
  timestamp: string;
  isOnline?: boolean;
  responseTime?: number;
  setAt?: string;
}

export interface TerminalConnectionStatus {
  text: string;
  color: string;
  connected: boolean;
  showSpinner: boolean;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export interface TerminalPreferenceResult {
  success: boolean;
  error?: string;
  validationErrors?: string[];
}

export const TERMINAL_VALIDATION_RULES = {
  ip: {
    required: true,
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  },
  port: {
    min: 1,
    max: 65535,
    required: true,
  },
};

export const DEFAULT_TERMINAL_PORT = 1180;
