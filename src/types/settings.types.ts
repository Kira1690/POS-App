/**
 * Settings Types - TypeScript definitions for settings and configuration
 * Following professional POS system requirements
 */

export interface RestaurantProfile {
  id: string;
  name: string;
  business_type: 'quick_service' | 'casual_dining' | 'fine_dining' | 'food_truck' | 'cafe';
  cuisine_type: string[];
  phone: string;
  email: string;
  timezone: string;
  logo_url?: string;
  
  // Address
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  
  // Business Details
  tax_id: string;
  business_license: string;
  sales_tax_rate: number;
  
  // Operating Hours
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  
  // Settings
  currency: string;
  date_format: string;
  time_format: '12h' | '24h';
  language: string;
  
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  dashboard: boolean;
  orders: boolean;
  tables: boolean;
  menu: boolean;
  kitchen: boolean;
  customers: boolean;
  inventory: boolean;
  staff: boolean;
  reports: boolean;
  settings: boolean;
  payments: boolean;
  advanced: boolean;
}

export interface UserProfile {
  id: string;
  restaurant_id: string;
  employee_id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'restaurant_staff' | 'kitchen_staff' | 'manager' | 'admin' | 'superadmin';
  permissions: UserPermissions;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceSettings {
  device_id: string;
  device_name: string;
  device_type: 'pos_terminal' | 'kitchen_display' | 'mobile' | 'tablet';
  
  // Hardware Configuration
  printer_config: {
    receipt_printer: {
      enabled: boolean;
      ip_address?: string;
      port?: number;
      paper_size: '58mm' | '80mm';
    };
    kitchen_printer: {
      enabled: boolean;
      ip_address?: string;
      port?: number;
    };
    label_printer: {
      enabled: boolean;
      ip_address?: string;
      port?: number;
    };
  };
  
  // Payment Hardware
  payment_terminal: {
    enabled: boolean;
    device_type: 'vp3350' | 'ingenico' | 'square' | 'clover';
    connection_type: 'usb' | 'bluetooth' | 'ethernet';
    device_id?: string;
  };
  
  // Display Settings
  display_settings: {
    brightness: number;
    screen_timeout: number;
    orientation: 'portrait' | 'landscape';
    scale_factor: number;
  };
  
  // Notification Settings
  notifications: {
    sound_enabled: boolean;
    vibration_enabled: boolean;
    order_alerts: boolean;
    kitchen_alerts: boolean;
    payment_alerts: boolean;
  };
}

export interface PaymentConfiguration {
  // Payment Processors
  processors: {
    stripe: {
      enabled: boolean;
      public_key?: string;
      webhook_endpoint?: string;
      test_mode: boolean;
    };
    square: {
      enabled: boolean;
      application_id?: string;
      webhook_signature_key?: string;
      test_mode: boolean;
    };
    paypal: {
      enabled: boolean;
      client_id?: string;
      webhook_id?: string;
      test_mode: boolean;
    };
  };
  
  // Payment Methods
  accepted_methods: {
    cash: boolean;
    credit_card: boolean;
    debit_card: boolean;
    contactless: boolean;
    mobile_payments: boolean;
    gift_cards: boolean;
    loyalty_points: boolean;
  };
  
  // Transaction Settings
  transaction_settings: {
    tip_suggestions: number[];
    minimum_charge: number;
    maximum_charge: number;
    auto_capture: boolean;
    receipt_settings: {
      email_receipts: boolean;
      sms_receipts: boolean;
      print_receipts: boolean;
      receipt_footer?: string;
    };
  };
}

export interface IntegrationSettings {
  // POS Integrations
  pos_integrations: {
    inventory_management: {
      enabled: boolean;
      provider?: 'toast' | 'resy' | 'opentable' | 'custom';
      api_endpoint?: string;
      sync_frequency: number;
    };
    accounting: {
      enabled: boolean;
      provider?: 'quickbooks' | 'xero' | 'sage' | 'custom';
      auto_sync: boolean;
    };
    loyalty_program: {
      enabled: boolean;
      provider?: 'loyaltycore' | 'fivestars' | 'custom';
      points_ratio: number;
    };
  };
  
  // Delivery Platforms
  delivery_platforms: {
    ubereats: {
      enabled: boolean;
      store_id?: string;
      auto_accept_orders: boolean;
    };
    doordash: {
      enabled: boolean;
      store_id?: string;
      auto_accept_orders: boolean;
    };
    grubhub: {
      enabled: boolean;
      store_id?: string;
      auto_accept_orders: boolean;
    };
  };
  
  // Analytics
  analytics: {
    google_analytics: {
      enabled: boolean;
      tracking_id?: string;
    };
    facebook_pixel: {
      enabled: boolean;
      pixel_id?: string;
    };
  };
}

export interface SecuritySettings {
  // Access Control
  access_control: {
    password_policy: {
      min_length: number;
      require_uppercase: boolean;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_symbols: boolean;
      expiry_days: number;
    };
    session_settings: {
      timeout_minutes: number;
      concurrent_sessions: number;
      ip_restrictions: string[];
    };
    two_factor_auth: {
      enabled: boolean;
      required_for_admin: boolean;
      method: 'sms' | 'email' | 'authenticator';
    };
  };
  
  // Data Protection
  data_protection: {
    encryption_enabled: boolean;
    backup_frequency: 'daily' | 'weekly' | 'monthly';
    backup_retention_days: number;
    auto_backup: boolean;
    backup_location: 'local' | 'cloud' | 'both';
  };
  
  // Audit Logging
  audit_logging: {
    enabled: boolean;
    log_level: 'basic' | 'detailed' | 'verbose';
    retention_days: number;
    log_user_actions: boolean;
    log_data_changes: boolean;
    log_system_events: boolean;
  };
}

export interface SystemLogs {
  entries: {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    category: 'user' | 'system' | 'payment' | 'order' | 'inventory';
    message: string;
    user_id?: string;
    user_name?: string;
    ip_address?: string;
    details?: Record<string, any>;
  }[];
  
  filters: {
    level?: string;
    category?: string;
    date_range?: {
      start: string;
      end: string;
    };
    user_id?: string;
  };
  
  pagination: {
    page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  };
}

export type SettingsCategory =
  | 'restaurant_profile'
  | 'user_management'
  | 'device_hardware'
  | 'payment_config'
  | 'integrations'
  | 'security_backup'
  | 'system_logs'
  | 'help_support';

export interface SettingsContextType {
  // Current State
  activeCategory: SettingsCategory;
  restaurantProfile: RestaurantProfile | null;
  userProfiles: UserProfile[];
  deviceSettings: DeviceSettings | null;
  paymentConfig: PaymentConfiguration | null;
  integrationSettings: IntegrationSettings | null;
  securitySettings: SecuritySettings | null;
  systemLogs: SystemLogs | null;
  
  // Loading States
  loading: boolean;
  saving: boolean;
  
  // Error State
  error: string | null;
  
  // Actions
  setActiveCategory: (category: SettingsCategory) => void;
  
  // Restaurant Profile
  loadRestaurantProfile: () => Promise<void>;
  updateRestaurantProfile: (profile: Partial<RestaurantProfile>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
  
  // User Management
  loadUserProfiles: () => Promise<void>;
  createUser: (user: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<UserProfile>;
  updateUser: (id: string, user: Partial<UserProfile>) => Promise<UserProfile>;
  deleteUser: (id: string) => Promise<void>;
  updateUserPermissions: (id: string, permissions: UserPermissions) => Promise<void>;
  
  // Device Settings
  loadDeviceSettings: () => Promise<void>;
  updateDeviceSettings: (settings: Partial<DeviceSettings>) => Promise<void>;
  testPrinterConnection: (printerType: 'receipt' | 'kitchen' | 'label') => Promise<boolean>;
  testPaymentTerminal: () => Promise<boolean>;
  
  // Payment Configuration
  loadPaymentConfig: () => Promise<void>;
  updatePaymentConfig: (config: Partial<PaymentConfiguration>) => Promise<void>;
  testPaymentProcessor: (processor: 'stripe' | 'square' | 'paypal') => Promise<boolean>;
  
  // Integration Settings
  loadIntegrationSettings: () => Promise<void>;
  updateIntegrationSettings: (settings: Partial<IntegrationSettings>) => Promise<void>;
  testIntegration: (type: string, provider: string) => Promise<boolean>;
  
  // Security Settings
  loadSecuritySettings: () => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  initiateBackup: () => Promise<void>;
  restoreBackup: (backupId: string) => Promise<void>;
  
  // System Logs
  loadSystemLogs: (filters?: SystemLogs['filters']) => Promise<void>;
  exportLogs: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  clearLogs: (olderThan: string) => Promise<void>;
}