/**
 * TerminalStorage.ts
 *
 * AsyncStorage-based terminal persistence.
 * Stores selected terminal, discovered terminals, and network info
 * so the app can restore terminal state after reload without re-scanning.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoggerFactory } from '../logging/LoggingService';

export interface StoredTerminal {
  ip: string;
  port: number;
  name?: string;
  connectedAt: string;
  lastPingSuccess: string;
  isSelected: boolean;
}

export interface StoredDiscoveredTerminal {
  ip: string;
  port: number;
  isOnline: boolean;
  responseTime?: number;
  discoveredAt?: string;
}

const KEYS = {
  SELECTED_TERMINAL: '@pos_selected_terminal',
  DISCOVERED_TERMINALS: '@pos_discovered_terminals',
  NETWORK_INFO: '@pos_network_info',
};

export class TerminalStorage {
  private static instance: TerminalStorage;
  private logger = LoggerFactory.createLogger('TerminalStorage');

  private constructor() {}

  public static getInstance(): TerminalStorage {
    if (!TerminalStorage.instance) {
      TerminalStorage.instance = new TerminalStorage();
    }
    return TerminalStorage.instance;
  }

  async saveSelectedTerminal(terminal: StoredTerminal): Promise<boolean> {
    try {
      await AsyncStorage.setItem(KEYS.SELECTED_TERMINAL, JSON.stringify(terminal));
      this.logger.info('Selected terminal saved', 'saveSelectedTerminal', { ip: terminal.ip, port: terminal.port });
      return true;
    } catch (error) {
      this.logger.error('Failed to save selected terminal', error instanceof Error ? error : new Error(String(error)), 'saveSelectedTerminal');
      return false;
    }
  }

  async getSelectedTerminal(): Promise<StoredTerminal | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SELECTED_TERMINAL);
      if (!data) return null;

      const terminal: StoredTerminal = JSON.parse(data);
      this.logger.debug('Retrieved selected terminal', 'getSelectedTerminal', { ip: terminal.ip, port: terminal.port });
      return terminal;
    } catch (error) {
      this.logger.error('Failed to get selected terminal', error instanceof Error ? error : new Error(String(error)), 'getSelectedTerminal');
      return null;
    }
  }

  async clearSelectedTerminal(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(KEYS.SELECTED_TERMINAL);
      this.logger.info('Selected terminal cleared', 'clearSelectedTerminal');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear selected terminal', error instanceof Error ? error : new Error(String(error)), 'clearSelectedTerminal');
      return false;
    }
  }

  async saveDiscoveredTerminals(terminals: StoredDiscoveredTerminal[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(KEYS.DISCOVERED_TERMINALS, JSON.stringify(terminals));
      this.logger.info('Discovered terminals saved', 'saveDiscoveredTerminals', { count: terminals.length });
      return true;
    } catch (error) {
      this.logger.error('Failed to save discovered terminals', error instanceof Error ? error : new Error(String(error)), 'saveDiscoveredTerminals');
      return false;
    }
  }

  async getDiscoveredTerminals(): Promise<StoredDiscoveredTerminal[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DISCOVERED_TERMINALS);
      if (!data) return [];

      const terminals: StoredDiscoveredTerminal[] = JSON.parse(data);
      this.logger.debug('Retrieved discovered terminals', 'getDiscoveredTerminals', { count: terminals.length });
      return terminals;
    } catch (error) {
      this.logger.error('Failed to get discovered terminals', error instanceof Error ? error : new Error(String(error)), 'getDiscoveredTerminals');
      return [];
    }
  }

  async clearDiscoveredTerminals(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(KEYS.DISCOVERED_TERMINALS);
      this.logger.info('Discovered terminals cleared', 'clearDiscoveredTerminals');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear discovered terminals', error instanceof Error ? error : new Error(String(error)), 'clearDiscoveredTerminals');
      return false;
    }
  }

  async saveNetworkInfo(deviceIP: string, gateway: string): Promise<boolean> {
    try {
      const networkInfo = { deviceIP, gateway, savedAt: new Date().toISOString() };
      await AsyncStorage.setItem(KEYS.NETWORK_INFO, JSON.stringify(networkInfo));
      this.logger.info('Network info saved', 'saveNetworkInfo', { deviceIP, gateway });
      return true;
    } catch (error) {
      this.logger.error('Failed to save network info', error instanceof Error ? error : new Error(String(error)), 'saveNetworkInfo');
      return false;
    }
  }

  async getNetworkInfo(): Promise<{ deviceIP: string; gateway: string; savedAt: string } | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NETWORK_INFO);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      this.logger.error('Failed to get network info', error instanceof Error ? error : new Error(String(error)), 'getNetworkInfo');
      return null;
    }
  }

  async isOnSameNetwork(currentDeviceIP: string): Promise<boolean> {
    const storedNetwork = await this.getNetworkInfo();
    if (!storedNetwork) return true; // No stored info — assume same network

    const currentSubnet = currentDeviceIP.split('.').slice(0, 3).join('.');
    const storedSubnet = storedNetwork.deviceIP.split('.').slice(0, 3).join('.');

    const isSame = currentSubnet === storedSubnet;
    this.logger.debug('Network comparison', 'isOnSameNetwork', { currentSubnet, storedSubnet, isSame });
    return isSame;
  }

  async clearAllData(): Promise<boolean> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(KEYS.SELECTED_TERMINAL),
        AsyncStorage.removeItem(KEYS.DISCOVERED_TERMINALS),
        AsyncStorage.removeItem(KEYS.NETWORK_INFO),
      ]);
      this.logger.info('All terminal data cleared', 'clearAllData');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear all data', error instanceof Error ? error : new Error(String(error)), 'clearAllData');
      return false;
    }
  }
}
