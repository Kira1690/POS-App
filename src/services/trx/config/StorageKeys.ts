/**
 * TRX Storage Keys
 * Prefixed with @trx_ to avoid collision with existing POS app AsyncStorage keys
 */

export const STORAGE_KEYS = {
  STORE_SETTINGS: '@trx_store_settings',
  PREFERRED_TERMINAL: '@trx_preferred_terminal',
  TERMINAL_HISTORY: '@trx_terminal_history',
  LAST_CONNECTED_IP: '@trx_last_connected_ip',
  LAST_CONNECTED_PORT: '@trx_last_connected_port',
  PAYMENT_HISTORY: '@trx_payment_history',
  APP_SETTINGS: '@trx_app_settings',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
