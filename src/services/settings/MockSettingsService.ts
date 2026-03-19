/**
 * Mock Settings Service
 * Provides realistic data for settings and configuration UI development
 * TODO: Replace with real SettingsService when backend is ready
 */

import {
  RestaurantProfile,
  UserProfile,
  DeviceSettings,
  PaymentConfiguration,
  IntegrationSettings,
  SecuritySettings,
  SystemLogs,
} from '@/types/settings.types';

export class MockSettingsService {
  private static instance: MockSettingsService;
  
  public static getInstance(): MockSettingsService {
    if (!MockSettingsService.instance) {
      MockSettingsService.instance = new MockSettingsService();
    }
    return MockSettingsService.instance;
  }

  private mockRestaurantProfile: RestaurantProfile = {
    id: 'rest_001',
    name: 'The Food Corner',
    business_type: 'quick_service',
    cuisine_type: ['American', 'Italian', 'Asian'],
    phone: '+1 (555) 123-4567',
    email: 'contact@foodcorner.com',
    timezone: 'America/New_York',
    logo_url: 'https://example.com/logo.png',
    
    street_address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    country: 'United States',
    
    tax_id: '12-3456789',
    business_license: 'BL-NYC-2023-001',
    sales_tax_rate: 8.25,
    
    operating_hours: {
      monday: { open: '08:00', close: '22:00', is_closed: false },
      tuesday: { open: '08:00', close: '22:00', is_closed: false },
      wednesday: { open: '08:00', close: '22:00', is_closed: false },
      thursday: { open: '08:00', close: '22:00', is_closed: false },
      friday: { open: '08:00', close: '22:00', is_closed: false },
      saturday: { open: '09:00', close: '23:00', is_closed: false },
      sunday: { open: '09:00', close: '23:00', is_closed: false },
    },
    
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    language: 'en',
    
    created_at: '2025-07-20T00:00:00Z',
    updated_at: '2025-09-23T15:30:00Z',
  };

  private mockUserProfiles: UserProfile[] = [
    {
      id: 'user_001',
      restaurant_id: 'rest_001',
      employee_id: 'MGR001',
      name: 'Alice Johnson',
      email: 'manager@foodcorner.com',
      phone: '+1 (555) 123-4568',
      role: 'manager',
      permissions: {
        dashboard: true,
        orders: true,
        tables: true,
        menu: true,
        kitchen: true,
        customers: true,
        inventory: true,
        staff: true,
        reports: true,
        settings: true,
        payments: true,
        advanced: false,
      },
      is_active: true,
      last_login: '2025-09-23T14:30:00Z',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T14:30:00Z',
    },
    {
      id: 'user_002',
      restaurant_id: 'rest_001',
      employee_id: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@foodcorner.com',
      phone: '+1 (555) 123-4569',
      role: 'waiter',
      permissions: {
        dashboard: true,
        orders: true,
        tables: true,
        menu: false,
        kitchen: false,
        customers: true,
        inventory: false,
        staff: false,
        reports: false,
        settings: false,
        payments: true,
        advanced: false,
      },
      is_active: true,
      last_login: '2025-09-23T12:15:00Z',
      created_at: '2025-08-01T00:00:00Z',
      updated_at: '2025-09-23T12:15:00Z',
    },
    {
      id: 'user_003',
      restaurant_id: 'rest_001',
      employee_id: 'CHEF001',
      name: 'Mike Wilson',
      email: 'chef@foodcorner.com',
      role: 'kitchen_staff',
      permissions: {
        dashboard: true,
        orders: true,
        tables: false,
        menu: true,
        kitchen: true,
        customers: false,
        inventory: true,
        staff: false,
        reports: false,
        settings: false,
        payments: false,
        advanced: false,
      },
      is_active: true,
      last_login: '2025-09-23T11:45:00Z',
      created_at: '2025-08-05T00:00:00Z',
      updated_at: '2025-09-23T11:45:00Z',
    },
  ];

  private mockDeviceSettings: DeviceSettings = {
    device_id: 'pos_terminal_001',
    device_name: 'Main POS Terminal',
    device_type: 'pos_terminal',
    
    printer_config: {
      receipt_printer: {
        enabled: true,
        ip_address: '192.168.1.100',
        port: 9100,
        paper_size: '80mm',
      },
      kitchen_printer: {
        enabled: true,
        ip_address: '192.168.1.101',
        port: 9100,
      },
      label_printer: {
        enabled: false,
      },
    },
    
    payment_terminal: {
      enabled: true,
      device_type: 'vp3350',
      connection_type: 'usb',
      device_id: 'VP3350_001',
    },
    
    display_settings: {
      brightness: 80,
      screen_timeout: 300,
      orientation: 'portrait',
      scale_factor: 1.0,
    },
    
    notifications: {
      sound_enabled: true,
      vibration_enabled: true,
      order_alerts: true,
      kitchen_alerts: true,
      payment_alerts: true,
    },
  };

  private mockPaymentConfig: PaymentConfiguration = {
    processors: {
      stripe: {
        enabled: true,
        public_key: 'pk_test_***',
        webhook_endpoint: 'https://api.foodcorner.com/webhooks/stripe',
        test_mode: true,
      },
      square: {
        enabled: false,
        test_mode: true,
      },
      paypal: {
        enabled: false,
        test_mode: true,
      },
    },
    
    accepted_methods: {
      cash: true,
      credit_card: true,
      debit_card: true,
      contactless: true,
      mobile_payments: true,
      gift_cards: false,
      loyalty_points: false,
    },
    
    transaction_settings: {
      tip_suggestions: [15, 18, 20, 25],
      minimum_charge: 1.00,
      maximum_charge: 999.99,
      auto_capture: true,
      receipt_settings: {
        email_receipts: true,
        sms_receipts: false,
        print_receipts: true,
        receipt_footer: 'Thank you for dining with us! Visit again soon.',
      },
      payment_timing: {
        mode: 'pay_at_counter' as const,
        default_for_dine_in: 'pay_at_counter' as const,
        require_selection_at_order: false,
      },
    },
  };

  private mockIntegrationSettings: IntegrationSettings = {
    pos_integrations: {
      inventory_management: {
        enabled: false,
        sync_frequency: 60,
      },
      accounting: {
        enabled: false,
        auto_sync: false,
      },
      loyalty_program: {
        enabled: false,
        points_ratio: 1,
      },
    },
    
    delivery_platforms: {
      ubereats: {
        enabled: false,
        auto_accept_orders: false,
      },
      doordash: {
        enabled: false,
        auto_accept_orders: false,
      },
      grubhub: {
        enabled: false,
        auto_accept_orders: false,
      },
    },
    
    analytics: {
      google_analytics: {
        enabled: false,
      },
      facebook_pixel: {
        enabled: false,
      },
    },
  };

  private mockSecuritySettings: SecuritySettings = {
    access_control: {
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: false,
        expiry_days: 90,
      },
      session_settings: {
        timeout_minutes: 30,
        concurrent_sessions: 3,
        ip_restrictions: [],
      },
      two_factor_auth: {
        enabled: false,
        required_for_admin: false,
        method: 'sms',
      },
    },
    
    data_protection: {
      encryption_enabled: true,
      backup_frequency: 'daily',
      backup_retention_days: 30,
      auto_backup: true,
      backup_location: 'cloud',
    },
    
    audit_logging: {
      enabled: true,
      log_level: 'detailed',
      retention_days: 90,
      log_user_actions: true,
      log_data_changes: true,
      log_system_events: true,
    },
  };

  /**
   * Get restaurant profile
   */
  async getRestaurantProfile(restaurantId: string): Promise<RestaurantProfile> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockRestaurantProfile;
  }

  /**
   * Update restaurant profile
   */
  async updateRestaurantProfile(
    restaurantId: string, 
    updates: Partial<RestaurantProfile>
  ): Promise<RestaurantProfile> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.mockRestaurantProfile = {
      ...this.mockRestaurantProfile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return this.mockRestaurantProfile;
  }

  /**
   * Get user profiles
   */
  async getUserProfiles(restaurantId: string): Promise<UserProfile[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.mockUserProfiles.filter(user => user.restaurant_id === restaurantId);
  }

  /**
   * Create user
   */
  async createUser(userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newUser: UserProfile = {
      ...userData,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.mockUserProfiles.push(newUser);
    return newUser;
  }

  /**
   * Update user
   */
  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userIndex = this.mockUserProfiles.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.mockUserProfiles[userIndex] = {
      ...this.mockUserProfiles[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return this.mockUserProfiles[userIndex];
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = this.mockUserProfiles.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.mockUserProfiles.splice(userIndex, 1);
  }

  /**
   * Get device settings
   */
  async getDeviceSettings(deviceId: string): Promise<DeviceSettings> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockDeviceSettings;
  }

  /**
   * Update device settings
   */
  async updateDeviceSettings(
    deviceId: string, 
    updates: Partial<DeviceSettings>
  ): Promise<DeviceSettings> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    this.mockDeviceSettings = {
      ...this.mockDeviceSettings,
      ...updates,
    };
    
    return this.mockDeviceSettings;
  }

  /**
   * Test printer connection
   */
  async testPrinterConnection(printerType: 'receipt' | 'kitchen' | 'label'): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/failure based on printer type
    if (printerType === 'label') {
      return false; // Label printer is disabled
    }
    
    return Math.random() > 0.2; // 80% success rate
  }

  /**
   * Get payment configuration
   */
  async getPaymentConfiguration(restaurantId: string): Promise<PaymentConfiguration> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.mockPaymentConfig;
  }

  /**
   * Update payment configuration
   */
  async updatePaymentConfiguration(
    restaurantId: string,
    updates: Partial<PaymentConfiguration>
  ): Promise<PaymentConfiguration> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.mockPaymentConfig = {
      ...this.mockPaymentConfig,
      ...updates,
    };
    
    return this.mockPaymentConfig;
  }

  /**
   * Generate system logs
   */
  async getSystemLogs(filters?: SystemLogs['filters']): Promise<SystemLogs> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockEntries = [
      {
        id: 'log_001',
        timestamp: '2025-09-23T15:30:00Z',
        level: 'info' as const,
        category: 'user' as const,
        message: 'User logged in successfully',
        user_id: 'user_001',
        user_name: 'Alice Johnson',
        ip_address: '192.168.1.10',
      },
      {
        id: 'log_002',
        timestamp: '2025-09-23T15:25:00Z',
        level: 'warning' as const,
        category: 'payment' as const,
        message: 'Payment processing timeout - retrying',
        details: { transaction_id: 'tx_12345', amount: 25.50 },
      },
      {
        id: 'log_003',
        timestamp: '2025-09-23T15:20:00Z',
        level: 'error' as const,
        category: 'system' as const,
        message: 'Kitchen printer connection failed',
        details: { printer_ip: '192.168.1.101', error_code: 'CONN_TIMEOUT' },
      },
      {
        id: 'log_004',
        timestamp: '2025-09-23T15:15:00Z',
        level: 'info' as const,
        category: 'order' as const,
        message: 'New order received',
        user_id: 'user_002',
        user_name: 'John Doe',
        details: { order_id: 'ord_789', table: 5, total: 42.75 },
      },
    ];
    
    return {
      entries: mockEntries,
      filters: filters || {},
      pagination: {
        page: 1,
        per_page: 50,
        total: mockEntries.length,
        has_more: false,
      },
    };
  }

  /**
   * Get integration settings
   */
  async getIntegrationSettings(restaurantId: string): Promise<IntegrationSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockIntegrationSettings;
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(restaurantId: string): Promise<SecuritySettings> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockSecuritySettings;
  }

  /**
   * Test integration
   */
  async testIntegration(type: string, provider: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return Math.random() > 0.3; // 70% success rate
  }

  /**
   * Upload logo
   */
  async uploadLogo(file: File): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate file upload
    const mockUrl = `https://cdn.example.com/logos/${Date.now()}.png`;
    this.mockRestaurantProfile.logo_url = mockUrl;
    
    return mockUrl;
  }
}