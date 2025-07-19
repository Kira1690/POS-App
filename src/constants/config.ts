// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'POS Management System',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKENS: 'auth_tokens',
    USER_DATA: 'user_data',
    RESTAURANT_DATA: 'restaurant_data',
    SETTINGS: 'app_settings',
    OFFLINE_ORDERS: 'offline_orders',
  },
  
  // Theme Configuration
  THEME: {
    PRIMARY_COLOR: '#1976d2',
    SECONDARY_COLOR: '#dc004e',
    SUCCESS_COLOR: '#388e3c',
    WARNING_COLOR: '#f57c00',
    ERROR_COLOR: '#d32f2f',
    INFO_COLOR: '#0288d1',
  },
  
  // WebSocket Configuration
  WEBSOCKET: {
    URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000/ws',
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 5,
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  
  // Order Configuration
  ORDER: {
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    DEFAULT_PREPARATION_TIME: 20, // 20 minutes
    MAX_ITEMS_PER_ORDER: 50,
  },
  
  // Table Configuration
  TABLE: {
    AUTO_CLEANUP_TIME: 15, // 15 minutes after order completion
    RESERVATION_BUFFER: 30, // 30 minutes buffer for reservations
  },
  
  // Payment Configuration
  PAYMENT: {
    VP3350_APP_SCHEME: 'payment-app://',
    SUPPORTED_METHODS: ['cash', 'card', 'digital_wallet'],
    DEFAULT_TIP_PERCENTAGES: [15, 18, 20, 25],
  },
  
  // Offline Configuration
  OFFLINE: {
    MAX_OFFLINE_ORDERS: 100,
    SYNC_RETRY_INTERVAL: 60000, // 1 minute
    MAX_SYNC_ATTEMPTS: 3,
  },
  
  // Feature Flags
  FEATURES: {
    OFFLINE_MODE: true,
    PUSH_NOTIFICATIONS: true,
    BIOMETRIC_AUTH: true,
    VOICE_COMMANDS: false,
    BARCODE_SCANNING: true,
    ANALYTICS: true,
  },
  
  // Development Configuration
  DEV: {
    LOG_LEVEL: __DEV__ ? 'debug' : 'error',
    SHOW_PERFORMANCE_MONITOR: __DEV__,
    ENABLE_FLIPPER: __DEV__,
  },
} as const;

// Environment-specific configuration
export const ENV_CONFIG = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000/ws',
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
};