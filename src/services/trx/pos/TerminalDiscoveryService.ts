import { ConfigurationServiceFactory } from '../ConfigurationService';
import { LoggerFactory } from '../logging/LoggingService';
import { TerminalStorageService, StoredTerminal } from '../storage/TerminalStorageService';
import { ConnectAndSendService } from './ConnectAndSendService';
import { BalanceRequest, MMLMessageBuilder, SaleRequest } from './MMLMessageBuilder';
import { MMLResponseParser } from './MMLResponseParser';
import { NetworkScanner } from './NetworkScanner';

export interface DiscoveredTerminal {
  ip: string;
  port: number;
  isOnline: boolean;
  responseTime?: number;
  lastChecked: Date;
}

export interface TerminalConnectionManager {
  discoverTerminals: (manualIPs?: string[]) => Promise<DiscoveredTerminal[]>;
  addManualTerminal: (ip: string, port: number) => Promise<boolean>;
  selectTerminal: (ip: string, port: number) => Promise<boolean>;
  processPayment: (amount: number, tax: number) => Promise<unknown>;
  processBalanceInquiry: () => Promise<unknown>;
  isTerminalOnline: () => boolean;
  getCurrentTerminal: () => DiscoveredTerminal | null;
}

// Use global storage so singleton survives hot reload module re-evaluation
const GLOBAL_DISCOVERY_KEY = '__terminalDiscoveryServiceInstance';

export class TerminalDiscoveryService implements TerminalConnectionManager {
  private static instance: TerminalDiscoveryService;
  private logger = LoggerFactory.createLogger('TerminalDiscoveryService');
  private networkScanner = new NetworkScanner();
  private connectAndSend = new ConnectAndSendService();
  private messageBuilder = new MMLMessageBuilder();
  private responseParser = new MMLResponseParser();

  private terminalStorageService = TerminalStorageService.getInstance();
  private currentTerminal: DiscoveredTerminal | null = null;
  private discoveredTerminals: DiscoveredTerminal[] = [];
  private lastConnectedIP: string | null = null;
  private lastConnectedPort: number | null = null;
  private storageRestorePromise: Promise<void> | null = null;

  private constructor() {
    // Eagerly restore from SQLite so isTerminalOnline() works after app reload/hot refresh
    this.storageRestorePromise = this.restoreFromStorage();
  }

  public static getInstance(): TerminalDiscoveryService {
    // Check global first — survives hot reload module re-evaluation
    // (static class properties are lost when the module is re-evaluated)
    const globalInstance = (global as Record<string, unknown>)[GLOBAL_DISCOVERY_KEY] as TerminalDiscoveryService | undefined;
    if (globalInstance) {
      return globalInstance;
    }
    if (!TerminalDiscoveryService.instance) {
      TerminalDiscoveryService.instance = new TerminalDiscoveryService();
    }
    (global as Record<string, unknown>)[GLOBAL_DISCOVERY_KEY] = TerminalDiscoveryService.instance;
    return TerminalDiscoveryService.instance;
  }

  /**
   * Eagerly restore terminal state from SQLite on singleton creation.
   * This ensures isTerminalOnline() returns true after app reload.
   */
  private async restoreFromStorage(): Promise<void> {
    try {
      const stored = await this.terminalStorageService.getSelectedTerminal();
      if (stored) {
        this.lastConnectedIP = stored.ip;
        this.lastConnectedPort = stored.port;
        this.currentTerminal = {
          ip: stored.ip,
          port: stored.port,
          isOnline: true,
          lastChecked: new Date(),
        };
        this.logger.info('Terminal restored from SQLite on init', 'restoreFromStorage', {
          ip: stored.ip, port: stored.port,
        });
      }
    } catch (error) {
      this.logger.warn('Failed to restore terminal from storage on init', 'restoreFromStorage');
    }
  }

  /**
   * Wait for storage restore to complete. Call this before isTerminalOnline()
   * if you need guaranteed up-to-date state.
   */
  async ensureRestored(): Promise<void> {
    if (this.storageRestorePromise) {
      await this.storageRestorePromise;
      this.storageRestorePromise = null;
    }
  }

  async discoverTerminals(manualIPs: string[] = []): Promise<DiscoveredTerminal[]> {
    // Include last connected IP in scan to preserve existing connection
    const scanIPs = [...manualIPs];
    if (this.lastConnectedIP && !scanIPs.includes(this.lastConnectedIP)) {
      scanIPs.push(this.lastConnectedIP);
    }

    this.logger.info('Starting terminal discovery', 'discoverTerminals', { manualIPs: scanIPs.length });

    try {
      const configService = ConfigurationServiceFactory.getInstance();
      const posConfig = await configService.getPOSConfig();

      const terminals = await this.networkScanner.comprehensiveScan(posConfig.port, scanIPs);

      this.discoveredTerminals = terminals.map(terminal => ({
        ip: terminal.ip,
        port: terminal.port,
        isOnline: terminal.isOnline,
        responseTime: terminal.responseTime,
        lastChecked: new Date()
      }));

      this.logger.info('Terminal discovery completed', 'discoverTerminals', {
        terminalsFound: this.discoveredTerminals.length,
      });

      return this.discoveredTerminals;

    } catch (error) {
      this.logger.error('Terminal discovery failed', error instanceof Error ? error : new Error(String(error)), 'discoverTerminals');
      return [];
    }
  }

  async addManualTerminal(ip: string, port: number): Promise<boolean> {
    this.logger.info('Adding manual terminal', 'addManualTerminal', { ip, port });


    try {
      // Use testManualIP — retry-based validation (2 retries × 3 methods = 6 attempts)
      const terminal = await this.networkScanner.testManualIP(ip, port);

      if (terminal && terminal.isOnline) {
        const discoveredTerminal: DiscoveredTerminal = {
          ip: terminal.ip,
          port: terminal.port,
          isOnline: terminal.isOnline,
          responseTime: terminal.responseTime,
          lastChecked: new Date()
        };

        const existingIndex = this.discoveredTerminals.findIndex(t => t.ip === ip && t.port === port);
        if (existingIndex >= 0) {
          this.discoveredTerminals[existingIndex] = discoveredTerminal;
        } else {
          this.discoveredTerminals.push(discoveredTerminal);
        }

        // Directly set connected state and save to SQLite (no second TCP test)
        this.currentTerminal = discoveredTerminal;
        this.lastConnectedIP = ip;
        this.lastConnectedPort = port;

        // Update config service so payment processing uses the right host/port
        const configService = ConfigurationServiceFactory.getInstance();
        await configService.updateConfig({
          pos: {
            host: ip,
            port,
            timeout: 360000,
            retryAttempts: 3,
            enableAutoReconnect: true,
            downloadKey: '532120298'
          }
        });

        // Persist terminal to SQLite so it survives app reloads
        const storedTerminal: StoredTerminal = {
          ip, port, isSelected: true,
          connectedAt: new Date().toISOString(),
          lastPingSuccess: new Date().toISOString(),
        };
        await this.terminalStorageService.saveSelectedTerminal(storedTerminal);


        this.logger.info('Manual terminal added, saved to SQLite, set as current', 'addManualTerminal', { ip, port });
        return true;
      }

      this.logger.warn('Manual terminal unreachable', 'addManualTerminal', { ip, port });
      return false;

    } catch (error) {
      this.logger.error('Failed to add manual terminal', error instanceof Error ? error : new Error(String(error)), 'addManualTerminal');
      return false;
    }
  }

  async selectTerminal(ip: string, port: number): Promise<boolean> {
    this.logger.info('Selecting terminal', 'selectTerminal', { ip, port });

    // Already connected to this exact terminal — skip TCP re-validation
    if (this.lastConnectedIP === ip && this.lastConnectedPort === port && this.currentTerminal?.isOnline) {
      this.logger.info('Terminal already connected — skipping TCP test', 'selectTerminal', { ip, port });
      return true;
    }

    try {
      // Use testManualIP — retry-based validation (2 retries × 3 methods = 6 attempts)
      const testResult = await this.networkScanner.testManualIP(ip, port);

      if (testResult && testResult.isOnline) {
        this.currentTerminal = {
          ip, port,
          isOnline: true,
          responseTime: testResult.responseTime,
          lastChecked: new Date()
        };

        this.lastConnectedIP = ip;
        this.lastConnectedPort = port;

        const configService = ConfigurationServiceFactory.getInstance();
        await configService.updateConfig({
          pos: {
            host: ip,
            port: port,
            timeout: 360000,
            retryAttempts: 3,
            enableAutoReconnect: true,
            downloadKey: '532120298'
          }
        });

        // Persist to SQLite so it survives app reloads
        const storedTerminal: StoredTerminal = {
          ip, port, isSelected: true,
          connectedAt: new Date().toISOString(),
          lastPingSuccess: new Date().toISOString(),
        };
        await this.terminalStorageService.saveSelectedTerminal(storedTerminal);


        this.logger.info('Terminal selected and persisted to SQLite', 'selectTerminal', { ip, port });
        return true;
      } else {
          this.logger.warn('Terminal connection test failed', 'selectTerminal', { ip, port });
        return false;
      }

    } catch (error) {
      this.logger.error('Terminal selection failed', error instanceof Error ? error : new Error(String(error)), 'selectTerminal');
      return false;
    }
  }

  async processPayment(amount: number, tax: number): Promise<unknown> {
    // Read from SQLite if in-memory state is empty (e.g. after hot reload)
    if (!this.lastConnectedIP || !this.lastConnectedPort) {
      const stored = await this.terminalStorageService.getSelectedTerminal();
      if (stored) {
        this.lastConnectedIP = stored.ip;
        this.lastConnectedPort = stored.port;
        this.currentTerminal = { ip: stored.ip, port: stored.port, isOnline: true, lastChecked: new Date() };
      }
    }

    if (!this.lastConnectedIP || !this.lastConnectedPort) {
      throw new Error('No terminal has been connected yet. Please connect to a terminal first.');
    }

    const terminalIP = this.lastConnectedIP;
    const terminalPort = this.lastConnectedPort;

    this.logger.info('Processing payment transaction', 'processPayment', {
      amount, tax, terminal: terminalIP, port: terminalPort
    });

    const configService = ConfigurationServiceFactory.getInstance();
    const posConfig = await configService.getPOSConfig();

    const transactionId = this.messageBuilder.generateTransactionId();
    const saleRequest: SaleRequest = {
      transactionId,
      // amount already includes tax from the hook caller — do NOT add tax again
      amount: amount,
      tax,
      level2Data: { localTaxAmount: tax }
    };

    const messageData = this.messageBuilder.buildSaleMessage(saleRequest);
    const validation = this.messageBuilder.validateMessage(messageData);
    if (!validation.isValid) {
      throw new Error(`Invalid message: ${validation.errors.join(', ')}`);
    }

    // Retry connection up to 3 total attempts for resilience after hot reload
    const maxAttempts = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.connectAndSend.connectAndSend({
          host: terminalIP,
          port: terminalPort,
          sendTimeout: posConfig.timeout,
          receiveTimeout: posConfig.timeout
        }, messageData);

        if (response.success) {
          const result = this.responseParser.parseSaleResponse(response.data || '');

          if (__DEV__) {
            console.log(`[TRX] Payment ${result.status === '00' ? 'APPROVED' : 'DECLINED'}: ${result.accountBrand} *${result.lastFour}`);
          }

          this.logger.info('Payment completed', 'processPayment', {
            transactionId,
            success: response.success,
            responseTime: `${response.responseTime}ms`,
            status: result.status,
            approvalCode: result.approvalCode,
            attempt,
          });

          return {
            transactionId: result.transactionId,
            status: result.status,
            responseText: result.responseText,
            success: result.success,
            approvalCode: result.approvalCode,
            guid: result.guid,
            purchaseId: result.purchaseId,
            accountBrand: result.accountBrand,
            lastFour: result.lastFour,
            rawResponse: result.rawResponse
          };
        }

        lastError = new Error(response.error || 'Payment transaction failed');
        if (attempt < maxAttempts) {
          this.logger.warn(`Payment attempt ${attempt} failed, retrying...`, 'processPayment');
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxAttempts) {
          this.logger.warn(`Payment attempt ${attempt} threw, retrying...`, 'processPayment');
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    this.logger.error('Payment failed after all attempts', lastError || new Error('Unknown'), 'processPayment');
    throw lastError || new Error(`Payment failed after ${maxAttempts} attempts`);
  }

  async processBalanceInquiry(): Promise<unknown> {
    if (!this.lastConnectedIP || !this.lastConnectedPort) {
      throw new Error('No terminal has been connected yet. Please connect to a terminal first.');
    }

    const terminalIP = this.lastConnectedIP;
    const terminalPort = this.lastConnectedPort;

    try {
      const transactionId = this.messageBuilder.generateTransactionId();
      const balanceRequest: BalanceRequest = { transactionId };
      const messageData = this.messageBuilder.buildBalanceMessage(balanceRequest);

      const configService = ConfigurationServiceFactory.getInstance();
      const posConfig = await configService.getPOSConfig();

      const response = await this.connectAndSend.connectAndSend({
        host: terminalIP,
        port: terminalPort,
        sendTimeout: posConfig.timeout,
        receiveTimeout: posConfig.timeout
      }, messageData);

      if (!response.success) {
        throw new Error(response.error || 'Balance inquiry failed');
      }

      const result = this.responseParser.parseBalanceResponse(response.data || '');

      return {
        transactionId: result.transactionId,
        status: result.status,
        responseText: result.responseText,
        success: result.success,
        availableBalance: result.availableBalance,
        approvalCode: result.approvalCode,
        guid: result.guid,
        rawResponse: result.rawResponse
      };

    } catch (error) {
      this.logger.error('Balance inquiry failed', error instanceof Error ? error : new Error(String(error)), 'processBalanceInquiry');
      throw error;
    }
  }

  isTerminalOnline(): boolean {
    return (this.lastConnectedIP !== null && this.lastConnectedPort !== null) || (this.currentTerminal?.isOnline || false);
  }

  getCurrentTerminal(): DiscoveredTerminal | null {
    return this.currentTerminal;
  }
}
