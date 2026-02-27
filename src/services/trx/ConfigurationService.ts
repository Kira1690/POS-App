/**
 * ConfigurationService.ts - POS terminal configuration for TRX
 */

import { TRXSettingsService } from './TRXSettingsService';
import { LoggingService } from './logging/LoggingService';

export interface POSConfig {
  host: string;
  port: number;
  timeout: number;
  retryAttempts?: number;
  enableAutoReconnect?: boolean;
  downloadKey?: string;
}

export interface TaxConfig {
  defaultTaxRate: number;
  ccProcessingFee: number;
  includeTaxInTotal: boolean;
}

export interface MerchantConfig {
  name: string;
  address: string;
  phone: string;
  email?: string;
}

const DEFAULT_POS_CONFIG: POSConfig = {
  host: '',
  port: 1180,
  timeout: 360000,
  retryAttempts: 3,
  enableAutoReconnect: true,
  downloadKey: '532120298',
};

const DEFAULT_TAX_CONFIG: TaxConfig = {
  defaultTaxRate: 0.08,
  ccProcessingFee: 0.029,
  includeTaxInTotal: true,
};

export class ConfigurationService {
  private posConfig: POSConfig = { ...DEFAULT_POS_CONFIG };
  private settingsService: TRXSettingsService;
  private logger: LoggingService;
  private loaded = false;

  constructor(settingsService?: TRXSettingsService) {
    this.settingsService = settingsService || TRXSettingsService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  async loadConfig(): Promise<void> {
    if (this.loaded) return;
    try {
      await this.settingsService.getSettings();
      this.loaded = true;
    } catch (error) {
      this.logger.error('Failed to load TRX config', error instanceof Error ? error : new Error(String(error)), 'ConfigurationService.loadConfig');
    }
  }

  getConfig(): POSConfig {
    return { ...this.posConfig };
  }

  async getPOSConfig(): Promise<POSConfig> {
    if (!this.loaded) await this.loadConfig();
    return { ...this.posConfig };
  }

  async getTaxConfig(): Promise<TaxConfig> {
    try {
      const settingsResult = await this.settingsService.getSettings();
      if (settingsResult.success && settingsResult.data) {
        const s = settingsResult.data;
        // TRXSettingsPanel already stores taxRate/ccProcessingFee as decimals
        // (e.g., 0.089 for 8.9%), so do NOT divide by 100 again
        return {
          defaultTaxRate: s.taxRate ?? 0.08,
          ccProcessingFee: (s.ccSurchargeEnabled || s.enableCCSurcharge) ? (s.ccProcessingFee ?? 0.029) : 0,
          includeTaxInTotal: true,
        };
      }
    } catch {
      // fallthrough to default
    }
    return { ...DEFAULT_TAX_CONFIG };
  }

  async getMerchantConfig(): Promise<MerchantConfig> {
    try {
      const settingsResult = await this.settingsService.getSettings();
      if (settingsResult.success && settingsResult.data) {
        return {
          name: settingsResult.data.storeName || 'Payment Processor',
          address: '123 Main St',
          phone: '(555) 123-4567',
        };
      }
    } catch {
      // fallthrough to default
    }
    return { name: 'Payment Processor', address: '123 Main St', phone: '(555) 123-4567' };
  }

  async updateConfig(config: Partial<{ pos: POSConfig }>): Promise<void> {
    if (config.pos) {
      this.posConfig = { ...this.posConfig, ...config.pos };
    }
    this.loaded = true;
  }

  invalidateCache(): void {
    this.loaded = false;
  }

  setHost(host: string): void {
    this.posConfig.host = host;
  }

  setPort(port: number): void {
    this.posConfig.port = port;
  }
}

export class ConfigurationServiceFactory {
  private static instance: ConfigurationService;

  static getInstance(): ConfigurationService {
    if (!ConfigurationServiceFactory.instance) {
      ConfigurationServiceFactory.instance = new ConfigurationService();
    }
    return ConfigurationServiceFactory.instance;
  }
}
