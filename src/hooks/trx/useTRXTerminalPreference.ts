// Custom hook for TRX terminal preference management
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { PreferredTerminal, TerminalConnectionStatus } from '@/types/trx/Terminal';
import { TRXTerminalPreferenceService } from '@/services/trx/TRXTerminalPreferenceService';

interface UseTRXTerminalPreferenceReturn {
  preferredTerminal: PreferredTerminal | null;
  loading: boolean;
  connectionStatus: TerminalConnectionStatus;
  setPreferredTerminal: (ip: string, port: number, name?: string) => Promise<boolean>;
  removePreferredTerminal: () => Promise<boolean>;
  validateParams: (ip: string, port: number) => {
    isValid: boolean;
    errors: { ip?: string; port?: string };
  };
  isPreferred: (ip: string, port: number) => Promise<boolean>;
  getDisplayName: (ip: string, port: number) => string;
  getHistory: () => Promise<PreferredTerminal[]>;
}

export const useTRXTerminalPreference = (): UseTRXTerminalPreferenceReturn => {
  const [preferredTerminal, setPreferredTerminalState] = useState<PreferredTerminal | null>(null);
  const [loading, setLoading] = useState(false);

  const terminalService = TRXTerminalPreferenceService.getInstance();

  useEffect(() => {
    loadPreferredTerminal();
  }, []);

  const loadPreferredTerminal = async () => {
    setLoading(true);
    try {
      const result = await terminalService.getPreferredTerminal();
      if (result.success && result.data) {
        setPreferredTerminalState(result.data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const setPreferredTerminal = async (
    ip: string,
    port: number,
    name?: string
  ): Promise<boolean> => {
    const result = await terminalService.setPreferredTerminal(ip, port, name);

    if (result.success) {
      await loadPreferredTerminal();
      return true;
    } else {
      if (result.validationErrors) {
        Alert.alert('Validation Error', result.validationErrors.join(', '));
      } else {
        Alert.alert('Error', result.error || 'Failed to set preferred terminal');
      }
      return false;
    }
  };

  const removePreferredTerminal = async (): Promise<boolean> => {
    const result = await terminalService.removePreferredTerminal();
    if (result.success) {
      setPreferredTerminalState(null);
      return true;
    } else {
      Alert.alert('Error', result.error || 'Failed to remove preferred terminal');
      return false;
    }
  };

  const validateParams = (ip: string, port: number) => {
    return terminalService.validateTerminalParams(ip, port);
  };

  const isPreferred = async (ip: string, port: number): Promise<boolean> => {
    return await terminalService.isPreferredTerminal(ip, port);
  };

  const getDisplayName = (ip: string, port: number): string => {
    return terminalService.getTerminalDisplayName(ip, port);
  };

  const getHistory = async (): Promise<PreferredTerminal[]> => {
    const result = await terminalService.getTerminalHistory();
    return result.success && result.data ? result.data : [];
  };

  const connectionStatus = terminalService.getConnectionStatus(preferredTerminal);

  return {
    preferredTerminal,
    loading,
    connectionStatus,
    setPreferredTerminal,
    removePreferredTerminal,
    validateParams,
    isPreferred,
    getDisplayName,
    getHistory,
  };
};
