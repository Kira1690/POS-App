/**
 * POS Configuration for TRX Terminal
 */

export interface POSConfiguration {
  host: string;
  port: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export const DEFAULT_POS_CONFIG: POSConfiguration = {
  host: '',
  port: 1180,
  timeout: 360000, // 6 minutes
  maxRetries: 3,
  retryDelay: 1000,
};

export const TRANSACTION_TYPES = {
  SALE: '1',
  VOID: '2',
  REFUND: '3',
  BALANCE_INQUIRY: '10',
} as const;

export const CARD_TYPES = {
  CREDIT: 'Credit Card',
  DEBIT: 'Debit Card',
  GIFT: 'Gift Card',
  EBT: 'EBT',
} as const;

export class POSConfigurationFactory {
  private static config: POSConfiguration = { ...DEFAULT_POS_CONFIG };

  static getConfig(): POSConfiguration {
    return { ...POSConfigurationFactory.config };
  }

  static updateConfig(updates: Partial<POSConfiguration>): void {
    POSConfigurationFactory.config = {
      ...POSConfigurationFactory.config,
      ...updates,
    };
  }
}
