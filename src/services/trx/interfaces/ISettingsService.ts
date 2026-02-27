/**
 * ISettingsService - Interface for TRX settings management
 */

import { StoreSettings } from '@/types/trx/Settings';

export interface ISettingsService {
  getSettings(): Promise<{ success: boolean; data?: StoreSettings; error?: string }>;
  saveSettings(settings: StoreSettings): Promise<{ success: boolean; error?: string }>;
  updateSetting<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K]
  ): Promise<{ success: boolean; error?: string }>;
  resetToDefaults(): Promise<{ success: boolean; error?: string }>;
}
