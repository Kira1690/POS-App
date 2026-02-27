import { useState, useCallback, useEffect, useRef } from 'react';
import * as Network from 'expo-network';
import { TerminalDiscoveryService, DiscoveredTerminal } from '@/services/trx/pos/TerminalDiscoveryService';
import { TerminalStorage } from '@/services/trx/pos/TerminalStorage';
import { LoggerFactory } from '@/services/trx/logging/LoggingService';

interface UseTRXTerminalConnectionReturn {
  // Discovery state
  isScanning: boolean;
  discoveredTerminals: DiscoveredTerminal[];

  // Connection state
  currentTerminal: DiscoveredTerminal | null;
  isConnected: boolean;
  isConnecting: boolean;
  isAddingManualTerminal: boolean;

  // Actions
  scanForTerminals: (manualIPs?: string[]) => Promise<void>;
  addManualTerminal: (ip: string, port: number) => Promise<boolean>;
  connectToTerminal: (ip: string, port: number) => Promise<boolean>;
  processPayment: (amount: number, tax: number) => Promise<unknown>;
  processBalanceInquiry: () => Promise<unknown>;
  reconnectTerminal: () => Promise<void>;

  // Status
  connectionStatus: string;
  error: string | null;
}

const NETWORK_CHECK_INTERVAL = 30000; // 30 seconds

export const useTRXTerminalConnection = (): UseTRXTerminalConnectionReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredTerminals, setDiscoveredTerminals] = useState<DiscoveredTerminal[]>([]);
  const [currentTerminal, setCurrentTerminal] = useState<DiscoveredTerminal | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAddingManualTerminal, setIsAddingManualTerminal] = useState(false);
  const restoredRef = useRef(false);

  // Initialize singleton services
  const terminalService = TerminalDiscoveryService.getInstance();
  const terminalStorage = TerminalStorage.getInstance();
  const logger = LoggerFactory.createLogger('TerminalConnection');

  // Check if terminal is connected — uses service's persistent state
  const isConnected = terminalService.isTerminalOnline();

  // Connection status text
  const getConnectionStatus = useCallback(() => {
    if (isScanning) return 'Scanning for terminals...';
    if (isConnecting) return 'Connecting to terminal...';
    if (isConnected && currentTerminal) return `Connected to ${currentTerminal.ip}`;
    if (discoveredTerminals.length > 0) return `Found ${discoveredTerminals.length} terminal(s)`;
    return 'No terminals found';
  }, [isScanning, isConnecting, isConnected, currentTerminal, discoveredTerminals.length]);

  const connectionStatus = getConnectionStatus();

  /**
   * Scan for POS terminals on the network with optional manual IPs
   */
  const scanForTerminals = useCallback(async (manualIPs: string[] = []) => {
    if (isScanning) return;

    logger.info('Starting terminal scan', 'scanForTerminals', { manualIPs: manualIPs.length });
    setIsScanning(true);

    try {
      const terminals = await terminalService.discoverTerminals(manualIPs);
      setDiscoveredTerminals(terminals);

      logger.info('Terminal scan completed', 'scanForTerminals', {
        terminalsFound: terminals.length,
      });

      // Auto-connect to first online terminal if none currently selected
      if (terminals.length > 0 && !currentTerminal) {
        const firstOnlineTerminal = terminals.find(t => t.isOnline);
        if (firstOnlineTerminal) {
          logger.info('Auto-connecting to first online terminal', 'scanForTerminals', {
            ip: firstOnlineTerminal.ip, port: firstOnlineTerminal.port,
          });
          await connectToTerminal(firstOnlineTerminal.ip, firstOnlineTerminal.port);
        }
      }
    } catch (error) {
      logger.error('Terminal scan failed', error instanceof Error ? error : new Error(String(error)), 'scanForTerminals');
      setDiscoveredTerminals([]);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, currentTerminal, terminalService, logger]);

  /**
   * Add a terminal manually by IP address — does NOT re-scan the entire network
   */
  const addManualTerminal = useCallback(async (ip: string, port: number): Promise<boolean> => {
    if (isAddingManualTerminal) return false;

    logger.info('Adding manual terminal', 'addManualTerminal', { ip, port });
    setIsAddingManualTerminal(true);

    try {
      const success = await terminalService.addManualTerminal(ip, port);

      if (success) {
        // Update local state directly — no full network re-scan
        const terminal: DiscoveredTerminal = { ip, port, isOnline: true, lastChecked: new Date() };
        setCurrentTerminal(terminal);
        setDiscoveredTerminals(prev => {
          const exists = prev.findIndex(t => t.ip === ip && t.port === port);
          if (exists >= 0) {
            const updated = [...prev];
            updated[exists] = terminal;
            return updated;
          }
          return [...prev, terminal];
        });

        logger.info('Manual terminal added and selected', 'addManualTerminal', { ip, port });
        return true;
      }

      logger.warn('Manual terminal addition failed', 'addManualTerminal', { ip, port });
      return false;
    } catch (error) {
      logger.error('Manual terminal addition error', error instanceof Error ? error : new Error(String(error)), 'addManualTerminal');
      return false;
    } finally {
      setIsAddingManualTerminal(false);
    }
  }, [isAddingManualTerminal, terminalService, logger]);

  /**
   * Connect to a specific terminal
   */
  const connectToTerminal = useCallback(async (ip: string, port: number): Promise<boolean> => {
    if (isConnecting) return false;

    logger.info('Connecting to terminal', 'connectToTerminal', { ip, port });
    setIsConnecting(true);

    try {
      const success = await terminalService.selectTerminal(ip, port);

      if (success) {
        const terminal = terminalService.getCurrentTerminal();
        setCurrentTerminal(terminal);
        logger.info('Terminal connected', 'connectToTerminal', { ip, port });
        return true;
      }

      logger.warn('Terminal connection failed', 'connectToTerminal', { ip, port });
      return false;
    } catch (error) {
      logger.error('Terminal connection error', error instanceof Error ? error : new Error(String(error)), 'connectToTerminal');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, terminalService, logger]);

  /**
   * Process payment using connect-and-send pattern — terminal stays "online" in UI
   */
  const processPayment = useCallback(async (amount: number, tax: number) => {
    if (!isConnected) {
      throw new Error('No terminal connected');
    }

    logger.info('Processing payment via terminal', 'processPayment', { amount, tax });

    try {
      const result = await terminalService.processPayment(amount, tax);
      logger.info('Payment completed', 'processPayment');
      return result;
    } catch (error) {
      logger.error('Payment failed', error instanceof Error ? error : new Error(String(error)), 'processPayment');
      throw error;
    }
  }, [isConnected, terminalService, logger]);

  /**
   * Process balance inquiry
   */
  const processBalanceInquiry = useCallback(async () => {
    if (!isConnected) {
      throw new Error('No terminal connected');
    }

    logger.info('Processing balance inquiry', 'processBalanceInquiry');

    try {
      const result = await terminalService.processBalanceInquiry();
      logger.info('Balance inquiry completed', 'processBalanceInquiry');
      return result;
    } catch (error) {
      logger.error('Balance inquiry failed', error instanceof Error ? error : new Error(String(error)), 'processBalanceInquiry');
      throw error;
    }
  }, [isConnected, terminalService, logger]);

  /**
   * Reconnect to the current terminal or attempt restore from storage
   */
  const reconnectTerminal = useCallback(async () => {
    if (currentTerminal) {
      await connectToTerminal(currentTerminal.ip, currentTerminal.port);
    } else {
      // Try restore from storage first
      const stored = await terminalStorage.getSelectedTerminal();
      if (stored) {
        await connectToTerminal(stored.ip, stored.port);
      } else {
        await scanForTerminals();
      }
    }
  }, [currentTerminal, connectToTerminal, scanForTerminals, terminalStorage]);

  // Restore from storage on mount instead of auto-scanning
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const restoreTerminal = async () => {
      logger.info('Restoring terminal from storage', 'useEffect:restore');

      // Restore selected terminal
      const stored = await terminalStorage.getSelectedTerminal();
      if (stored) {
        logger.info('Found stored terminal', 'useEffect:restore', { ip: stored.ip, port: stored.port });
        setCurrentTerminal({ ip: stored.ip, port: stored.port, isOnline: true, lastChecked: new Date() });

        // Verify connection in background (don't block UI)
        connectToTerminal(stored.ip, stored.port).catch(() => {
          logger.warn('Stored terminal verification failed', 'useEffect:restore');
        });
      }

      // Load cached discovered terminals
      const cached = await terminalStorage.getDiscoveredTerminals();
      if (cached.length > 0) {
        setDiscoveredTerminals(
          cached.map(t => ({ ip: t.ip, port: t.port, isOnline: t.isOnline, responseTime: t.responseTime, lastChecked: new Date() }))
        );
      }
    };

    restoreTerminal();
  }, []);

  // Network change detection — clear terminal state when subnet changes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentIP = await Network.getIpAddressAsync();
        const sameNetwork = await terminalStorage.isOnSameNetwork(currentIP);
        if (!sameNetwork) {
          logger.info('Network change detected — clearing terminal state', 'useEffect:networkCheck');
          await terminalStorage.clearAllData();
          setCurrentTerminal(null);
          setDiscoveredTerminals([]);
        } else {
          // Save current network info for future comparisons
          await terminalStorage.saveNetworkInfo(currentIP, '');
        }
      } catch {
        // Network check failed — not critical, skip silently
      }
    }, NETWORK_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [terminalStorage, logger]);

  return {
    isScanning,
    discoveredTerminals,
    currentTerminal,
    isConnected,
    isConnecting,
    isAddingManualTerminal,
    scanForTerminals,
    addManualTerminal,
    connectToTerminal,
    processPayment,
    processBalanceInquiry,
    reconnectTerminal,
    connectionStatus,
    error: !isConnected ? 'Terminal not connected' : null,
  };
};
