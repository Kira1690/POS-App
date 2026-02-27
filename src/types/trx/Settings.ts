/**
 * TRX Settings Types
 * Settings for TRX payment terminal integration
 */

export interface StoreSettings {
  storeName: string;
  taxRate: number; // Stored as decimal (e.g., 0.089 for 8.9%)
  ccProcessingFee: number; // Stored as decimal (e.g., 0.029 for 2.9%)
  enableCCSurcharge: boolean;
  ccSurchargeEnabled: boolean; // Used by TRXSettingsPanel toggle
  showItemizedBreakdown: boolean;
  preferredPort: number;
  // Gratuity settings
  gratuityEnabled: boolean;
  defaultTipRates: number[]; // e.g., [15, 18, 20, 25]
  allowCustomTip: boolean;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'My Store',
  taxRate: 0,
  ccProcessingFee: 0,
  enableCCSurcharge: false,
  ccSurchargeEnabled: false,
  showItemizedBreakdown: true,
  preferredPort: 1180,
  gratuityEnabled: false,
  defaultTipRates: [15, 18, 20, 25],
  allowCustomTip: true,
};

export const SETTINGS_VALIDATION_RULES = {
  storeName: {
    minLength: 1,
    maxLength: 100,
    required: true,
  },
  taxRate: {
    min: 0,
    max: 0.15, // Stored as decimal (0.15 = 15%)
    required: true,
  },
  ccProcessingFee: {
    min: 0,
    max: 0.10, // Stored as decimal (0.10 = 10%)
    required: true,
  },
};
