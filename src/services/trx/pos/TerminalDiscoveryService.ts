import { ConfigurationServiceFactory } from '../ConfigurationService';
import { LoggerFactory } from '../logging/LoggingService';
import { TRXTerminalPreferenceService } from '../TRXTerminalPreferenceService';
import { ConnectAndSendService } from './ConnectAndSendService';
import { BalanceRequest, MMLMessageBuilder, SaleRequest } from './MMLMessageBuilder';
import { MMLResponseParser } from './MMLResponseParser';
import { NetworkScanner } from './NetworkScanner';
import { TerminalStorage, StoredTerminal } from './TerminalStorage';

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

export class TerminalDiscoveryService implements TerminalConnectionManager {
  private static instance: TerminalDiscoveryService;
  private logger = LoggerFactory.createLogger('TerminalDiscoveryService');
  private networkScanner = new NetworkScanner();
  private connectAndSend = new ConnectAndSendService();
  private messageBuilder = new MMLMessageBuilder();
  private responseParser = new MMLResponseParser();

  private preferenceService = TRXTerminalPreferenceService.getInstance();
  private terminalStorage = TerminalStorage.getInstance();
  private currentTerminal: DiscoveredTerminal | null = null;
  private discoveredTerminals: DiscoveredTerminal[] = [];
  private lastConnectedIP: string | null = null;
  private lastConnectedPort: number | null = null;
  private preferenceLoaded = false;
  private storageRestorePromise: Promise<void> | null = null;

  private constructor() {
    // Eagerly restore from storage so isTerminalOnline() works after app reload
    this.storageRestorePromise = this.restoreFromStorage();
  }

  public static getInstance(): TerminalDiscoveryService {
    if (!TerminalDiscoveryService.instance) {
      TerminalDiscoveryService.instance = new TerminalDiscoveryService();
    }
    return TerminalDiscoveryService.instance;
  }

  /**
   * Eagerly restore terminal state from AsyncStorage on singleton creation.
   * This ensures isTerminalOnline() returns true after app reload.
   */
  private async restoreFromStorage(): Promise<void> {
    try {
      const stored = await this.terminalStorage.getSelectedTerminal();
      if (stored) {
        this.lastConnectedIP = stored.ip;
        this.lastConnectedPort = stored.port;
        this.currentTerminal = {
          ip: stored.ip,
          port: stored.port,
          isOnline: true,
          lastChecked: new Date(),
        };
        this.preferenceLoaded = true;
        this.logger.info('Terminal restored from storage on init', 'restoreFromStorage', {
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
    // Restore preferred terminal from persistent storage on first call
    if (!this.preferenceLoaded) {
      await this.loadPreferredTerminal();
    }

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

      // Persist discovered terminals to storage
      await this.terminalStorage.saveDiscoveredTerminals(
        this.discoveredTerminals.map(t => ({
          ip: t.ip, port: t.port, isOnline: t.isOnline,
          responseTime: t.responseTime, discoveredAt: new Date().toISOString(),
        }))
      );

      return this.discoveredTerminals;

    } catch (error) {
      this.logger.error('Terminal discovery failed', error instanceof Error ? error : new Error(String(error)), 'discoverTerminals');
      return [];
    }
  }

  async addManualTerminal(ip: string, port: number): Promise<boolean> {
    this.logger.info('Adding manual terminal', 'addManualTerminal', { ip, port });

    try {
      const terminal = await this.networkScanner.addManualTerminal(ip, port);

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

        // Directly set connected state and save to storage (reference app approach — no second TCP test)
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

        // Persist terminal so it survives app reloads
        const storedTerminal: StoredTerminal = {
          ip, port, isSelected: true,
          connectedAt: new Date().toISOString(),
          lastPingSuccess: new Date().toISOString(),
        };
        await this.terminalStorage.saveSelectedTerminal(storedTerminal);
        await this.preferenceService.setPreferredTerminal(ip, port);

        console.log('✅ Manual terminal added and saved:', `${ip}:${port}`);
        this.logger.info('Manual terminal added, saved, and set as current', 'addManualTerminal', { ip, port });
        return true;
      }

      this.logger.warn('Manual terminal unreachable', 'addManualTerminal', { ip, port });
      return false;

    } catch (error) {
      this.logger.error('Failed to add manual terminal', error instanceof Error ? error : new Error(String(error)), 'addManualTerminal');
      return false;
    }
  }

  /**
   * Load preferred terminal from AsyncStorage — restores connection after app reload
   */
  private async loadPreferredTerminal(): Promise<void> {
    this.preferenceLoaded = true;
    try {
      const result = await this.preferenceService.getPreferredTerminal();
      if (result.success && result.data) {
        this.lastConnectedIP = result.data.ip;
        this.lastConnectedPort = result.data.port;
        this.logger.info('Preferred terminal restored from storage', 'loadPreferredTerminal', {
          ip: result.data.ip, port: result.data.port
        });
      }
    } catch (error) {
      this.logger.warn('Failed to load preferred terminal', 'loadPreferredTerminal');
    }
  }

  async selectTerminal(ip: string, port: number): Promise<boolean> {
    console.log('🔌 TERMINAL CONNECTION: Attempting to connect to terminal');
    console.log('📍 Target IP:', ip);
    console.log('📍 Target Port:', port);

    this.logger.info('Selecting terminal', 'selectTerminal', { ip, port });

    try {
      const isConnected = await this.connectAndSend.testConnection(ip, port, 5000);

      if (isConnected) {
        this.currentTerminal = {
          ip, port,
          isOnline: true,
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

        // Persist as preferred terminal so it survives app reloads
        await this.preferenceService.setPreferredTerminal(ip, port);

        // Also save to TerminalStorage for the hook restore-from-storage flow
        const storedTerminal: StoredTerminal = {
          ip, port, isSelected: true,
          connectedAt: new Date().toISOString(),
          lastPingSuccess: new Date().toISOString(),
        };
        await this.terminalStorage.saveSelectedTerminal(storedTerminal);

        console.log('✅ TERMINAL CONNECTED SUCCESSFULLY!');
        console.log('📡 Connected Terminal:', `${ip}:${port}`);

        this.logger.info('Terminal selected and persisted', 'selectTerminal', { ip, port });
        return true;
      } else {
        console.log('❌ Connection test FAILED');
        this.logger.warn('Terminal connection test failed', 'selectTerminal', { ip, port });
        return false;
      }

    } catch (error) {
      this.logger.error('Terminal selection failed', error instanceof Error ? error : new Error(String(error)), 'selectTerminal');
      return false;
    }
  }

  async processPayment(amount: number, tax: number): Promise<unknown> {
    // Like the reference app: read from storage if in-memory state is empty
    if (!this.lastConnectedIP || !this.lastConnectedPort) {
      const stored = await this.terminalStorage.getSelectedTerminal();
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
      amount, tax, total: amount + tax, terminal: terminalIP, port: terminalPort
    });

    try {
      const configService = ConfigurationServiceFactory.getInstance();
      const posConfig = await configService.getPOSConfig();

      const transactionId = this.messageBuilder.generateTransactionId();
      const saleRequest: SaleRequest = {
        transactionId,
        amount: amount + tax,
        tax,
        level2Data: { localTaxAmount: tax }
      };

      const messageData = this.messageBuilder.buildSaleMessage(saleRequest);
      const validation = this.messageBuilder.validateMessage(messageData);
      if (!validation.isValid) {
        throw new Error(`Invalid message: ${validation.errors.join(', ')}`);
      }

      const response = await this.connectAndSend.connectAndSend({
        host: terminalIP,
        port: terminalPort,
        sendTimeout: posConfig.timeout,
        receiveTimeout: posConfig.timeout
      }, messageData);

      if (!response.success) {
        throw new Error(response.error || 'Payment transaction failed');
      }

      const result = this.responseParser.parseSaleResponse(response.data || '');

      console.log('🎉 PAYMENT RESPONSE:');
      console.log('   • Status:', result.status === '00' ? '✅ APPROVED' : '❌ DECLINED');
      console.log('   • Response:', result.responseText);
      console.log('   • Approval Code:', result.approvalCode);
      console.log('   • Card Brand:', result.accountBrand);
      console.log('   • Last 4:', result.lastFour);
      console.log('   • Response Time:', `${response.responseTime}ms`);

      this.logger.info('Payment completed', 'processPayment', {
        transactionId,
        success: response.success,
        responseTime: `${response.responseTime}ms`,
        status: result.status,
        approvalCode: result.approvalCode,
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

    } catch (error) {
      this.logger.error('Payment transaction failed', error instanceof Error ? error : new Error(String(error)), 'processPayment');
      throw error;
    }
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
