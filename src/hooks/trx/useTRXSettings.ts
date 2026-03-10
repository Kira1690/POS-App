// Custom hook for TRX settings management
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { StoreSettings, DEFAULT_STORE_SETTINGS, SETTINGS_VALIDATION_RULES } from '@/types/trx/Settings';
import { TRXSettingsService } from '@/services/trx/TRXSettingsService';

interface UseTRXSettingsReturn {
  settings: StoreSettings;
  loading: boolean;
  updateSetting: <K extends keyof StoreSettings>(
    field: K,
    value: StoreSettings[K]
  ) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  validateSetting: <K extends keyof StoreSettings>(
    field: K,
    value: StoreSettings[K]
  ) => { isValid: boolean; error?: string };
}

export const useTRXSettings = (): UseTRXSettingsReturn => {
  const [settings, setSettings] = useState<StoreSettings>({ ...DEFAULT_STORE_SETTINGS });
  const [loading, setLoading] = useState(false);

  const settingsService = TRXSettingsService.getInstance();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await settingsService.getSettings();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof StoreSettings>(
    field: K,
    value: StoreSettings[K]
  ): Promise<boolean> => {
    const validation = validateSetting(field, value);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.error || 'Invalid value');
      return false;
    }

    const result = await settingsService.updateSetting(field, value);

    if (result.success) {
      setSettings(prev => ({ ...prev, [field]: value }));
      return true;
    } else {
      Alert.alert('Error', result.error || 'Failed to save settings');
      return false;
    }
  };

  const resetToDefaults = async (): Promise<boolean> => {
    const result = await settingsService.resetToDefaults();
    if (result.success) {
      setSettings({ ...DEFAULT_STORE_SETTINGS });
      return true;
    } else {
      Alert.alert('Error', result.error || 'Failed to reset settings');
      return false;
    }
  };

  const validateSetting = <K extends keyof StoreSettings>(
    field: K,
    value: StoreSettings[K]
  ): { isValid: boolean; error?: string } => {
    const rule = SETTINGS_VALIDATION_RULES[field as keyof typeof SETTINGS_VALIDATION_RULES];
    if (!rule) return { isValid: true };
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (typeof value === 'number' || typeof value === 'string') {
      const numRule = rule as { min?: number; max?: number };
      if (numRule.min !== undefined && numValue < numRule.min) {
        return { isValid: false, error: `Minimum value is ${numRule.min}` };
      }
      if (numRule.max !== undefined && numValue > numRule.max) {
        return { isValid: false, error: `Maximum value is ${numRule.max}` };
      }
    }
    return { isValid: true };
  };

  return {
    settings,
    loading,
    updateSetting,
    resetToDefaults,
    validateSetting,
  };
};
