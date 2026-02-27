/**
 * TRXSettingsService - AsyncStorage-based TRX settings management
 */

import { StoreSettings, DEFAULT_STORE_SETTINGS } from '@/types/trx/Settings';
import { ISettingsService } from './interfaces/ISettingsService';
import { IStorageService } from './interfaces/IStorageService';
import { StorageService } from './StorageService';
import { TRXSettingsEventEmitter } from './TRXSettingsEventEmitter';
import { LoggingService } from './logging/LoggingService';
import { STORAGE_KEYS } from './config/StorageKeys';

export class TRXSettingsService implements ISettingsService {
  private static instance: TRXSettingsService;
  private storage: IStorageService;
  private eventEmitter: TRXSettingsEventEmitter;
  private logger: LoggingService;

  private constructor(storage?: IStorageService) {
    this.storage = storage || StorageService.getInstance();
    this.eventEmitter = TRXSettingsEventEmitter.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(storage?: IStorageService): TRXSettingsService {
    if (!TRXSettingsService.instance) {
      TRXSettingsService.instance = new TRXSettingsService(storage);
    }
    return TRXSettingsService.instance;
  }

  async getSettings(): Promise<{ success: boolean; data?: StoreSettings; error?: string }> {
    try {
      const result = await this.storage.getItem<StoreSettings>(STORAGE_KEYS.STORE_SETTINGS);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      const settings = result.data ? { ...DEFAULT_STORE_SETTINGS, ...result.data } : { ...DEFAULT_STORE_SETTINGS };
      return { success: true, data: settings };
    } catch (error) {
      this.logger.error('Failed to get TRX settings', error instanceof Error ? error : new Error(String(error)), 'TRXSettingsService.getSettings');
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get settings' };
    }
  }

  async saveSettings(settings: StoreSettings): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.storage.setItem(STORAGE_KEYS.STORE_SETTINGS, settings);
      if (result.success) {
        this.eventEmitter.emitSettingsChange({ key: 'all', value: settings });
        this.logger.info('TRX settings saved', 'TRXSettingsService.saveSettings');
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to save settings' };
    }
  }

  async updateSetting<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settingsResult = await this.getSettings();
      if (!settingsResult.success || !settingsResult.data) {
        return { success: false, error: 'Failed to load existing settings' };
      }
      const updatedSettings = { ...settingsResult.data, [key]: value };
      const result = await this.saveSettings(updatedSettings);
      if (result.success) {
        this.eventEmitter.emitSettingsChange({ key: key as string, value });
      }
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update setting' };
    }
  }

  async resetToDefaults(): Promise<{ success: boolean; error?: string }> {
    return this.saveSettings({ ...DEFAULT_STORE_SETTINGS });
  }
}
