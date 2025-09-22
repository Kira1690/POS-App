# Settings & Configuration Feature Implementation

## Feature Overview

Transform the current basic settings interface (5% complete) into a comprehensive configuration center for restaurant operations. This implementation will create a professional-grade settings system with restaurant configuration, user preferences, and integration management.

## Wireframe Analysis

### Screen 1: System Settings
- **Restaurant Configuration**: Basic info, operating hours, location details
- **Tax Configuration**: Tax rates, tax types, exemptions
- **Operating Hours**: Daily schedules, holiday hours, special events
- **General Settings**: Currency, timezone, language preferences

### Screen 2: User Preferences and Notifications
- **Profile Settings**: User information, role permissions, avatar
- **Notification Preferences**: Email, SMS, push notification settings
- **Display Settings**: Theme preferences, layout options, accessibility
- **Security Settings**: Password requirements, two-factor authentication

### Screen 3: Integration Settings
- **Payment Integration**: VP3350 configuration, payment methods setup
- **Printer Integration**: Receipt printers, kitchen printers, label printers
- **Third-Party Apps**: Delivery platforms, accounting software, loyalty programs
- **API Settings**: Webhook configurations, API key management

## Implementation Strategy

### Phase 1: System Settings Foundation (Day 5 Morning - Part 1)
**Duration**: 2 hours | **Focus**: Restaurant configuration interface

#### Component Architecture
```typescript
SettingsScreen (270 lines max)
├── SettingsNavigation (30 lines)
│   └── SettingsTabBar (30 lines)
├── SystemSettingsTab (80 lines)
│   ├── RestaurantConfig (40 lines)
│   ├── TaxConfiguration (25 lines)
│   └── OperatingHours (15 lines)
└── LoadingState (10 lines)
```

#### Tasks
1. **09:00-10:00**: Create SettingsScreen structure with tab navigation
2. **10:00-11:00**: Implement RestaurantConfig and TaxConfiguration forms

### Phase 2: User Settings (Day 5 Morning - Part 2)
**Duration**: 2 hours | **Focus**: User preferences and notifications

#### Component Architecture
```typescript
UserSettingsTab (80 lines)
├── ProfileSettings (40 lines)
├── NotificationSettings (25 lines)
└── DisplaySettings (15 lines)
```

#### Tasks
1. **11:00-12:00**: Create ProfileSettings and NotificationSettings
2. **12:00-13:00**: Implement DisplaySettings and accessibility options

### Phase 3: Integration Management (Day 5 Afternoon - Part 1)
**Duration**: 2 hours | **Focus**: Third-party integrations

#### Component Architecture
```typescript
IntegrationsTab (80 lines)
├── PaymentIntegration (40 lines)
├── PrinterIntegration (25 lines)
└── ThirdPartyApps (15 lines)
```

#### Tasks
1. **14:00-15:00**: Implement PaymentIntegration with VP3350 setup
2. **15:00-16:00**: Create PrinterIntegration and device discovery

### Phase 4: Validation and Testing (Day 5 Afternoon - Part 2)
**Duration**: 2 hours | **Focus**: Validation and polish

#### Tasks
1. **16:00-17:00**: Add form validation, testing, and documentation

## Technical Specifications

### Performance Requirements
```typescript
const performanceTargets = {
  settingsLoad: '<300ms',
  formValidation: '<50ms',
  configSave: '<500ms',
  integrationTest: '<3s',
  settingsSync: '<200ms'
};
```

### State Management
```typescript
interface SettingsContextType {
  // State
  systemConfig: SystemConfiguration;
  userPreferences: UserPreferences;
  integrations: IntegrationSettings[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Actions
  updateSystemConfig: (config: Partial<SystemConfiguration>) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  configureIntegration: (type: IntegrationType, config: IntegrationConfig) => Promise<void>;
  testIntegration: (type: IntegrationType) => Promise<TestResult>;
  resetToDefaults: (section: SettingsSection) => Promise<void>;
  
  // Validation
  validateSettings: (settings: any) => ValidationResult;
  exportSettings: () => Promise<string>;
  importSettings: (settingsData: string) => Promise<ImportResult>;
}
```

### Professional Theme Integration
```typescript
const settingsTheme = {
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formGroup: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  toggle: {
    trackColor: { false: '#CED4DA', true: '#1A1D21' },
    thumbColor: '#FFFFFF',
  }
};
```

## Service Integration Details

### Configuration Service Integration
```typescript
class ConfigurationService {
  async getSystemConfiguration(
    restaurantId: string
  ): Promise<SystemConfiguration> {
    const response = await this.apiClient.get('/configuration/system', {
      params: { restaurantId }
    });
    return response.data;
  }
  
  async updateSystemConfiguration(
    restaurantId: string,
    config: Partial<SystemConfiguration>
  ): Promise<SystemConfiguration> {
    const response = await this.apiClient.put('/configuration/system', {
      restaurantId,
      ...config
    });
    return response.data;
  }
  
  async validateConfiguration(
    config: SystemConfiguration
  ): Promise<ValidationResult> {
    const response = await this.apiClient.post('/configuration/validate', config);
    return response.data;
  }
  
  async resetToDefaults(
    restaurantId: string,
    section: ConfigurationSection
  ): Promise<SystemConfiguration> {
    const response = await this.apiClient.post('/configuration/reset', {
      restaurantId,
      section
    });
    return response.data;
  }
}
```

### Integration Management Service
```typescript
class IntegrationService {
  async getIntegrationSettings(
    restaurantId: string
  ): Promise<IntegrationSettings[]> {
    const response = await this.apiClient.get('/integrations', {
      params: { restaurantId }
    });
    return response.data;
  }
  
  async configureIntegration(
    integrationType: IntegrationType,
    config: IntegrationConfig
  ): Promise<IntegrationResult> {
    const response = await this.apiClient.post(`/integrations/${integrationType}`, config);
    return response.data;
  }
  
  async testIntegration(
    integrationType: IntegrationType,
    config: IntegrationConfig
  ): Promise<TestResult> {
    try {
      const response = await this.apiClient.post(
        `/integrations/${integrationType}/test`,
        config,
        { timeout: 10000 } // 10 second timeout for integration tests
      );
      return {
        success: true,
        message: 'Integration test successful',
        details: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Integration test failed',
        error: error.message
      };
    }
  }
  
  async discoverPrinters(): Promise<PrinterDevice[]> {
    const response = await this.apiClient.get('/integrations/printers/discover');
    return response.data;
  }
  
  async testPrinter(printerId: string): Promise<TestResult> {
    try {
      await this.apiClient.post(`/integrations/printers/${printerId}/test`);
      return { success: true, message: 'Printer test successful' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Printer test failed',
        error: error.message 
      };
    }
  }
}
```

### User Preferences Service
```typescript
class UserPreferencesService {
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const response = await this.apiClient.get(`/users/${userId}/preferences`);
    return response.data;
  }
  
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const response = await this.apiClient.put(`/users/${userId}/preferences`, preferences);
    return response.data;
  }
  
  async updateNotificationSettings(
    userId: string,
    settings: NotificationSettings
  ): Promise<NotificationSettings> {
    const response = await this.apiClient.put(`/users/${userId}/notifications`, settings);
    return response.data;
  }
  
  async generateAPIKey(
    userId: string,
    keyName: string,
    permissions: string[]
  ): Promise<APIKey> {
    const response = await this.apiClient.post(`/users/${userId}/api-keys`, {
      keyName,
      permissions
    });
    return response.data;
  }
}
```

## Advanced Features Implementation

### Settings Validation Framework
```typescript
class SettingsValidator {
  static validateRestaurantConfig(config: RestaurantConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields validation
    if (!config.name || config.name.trim().length < 2) {
      errors.push('Restaurant name is required and must be at least 2 characters');
    }
    
    if (!config.address || config.address.trim().length < 10) {
      errors.push('Complete address is required');
    }
    
    if (!config.phone || !/^\+?[\d\s\-\(\)]+$/.test(config.phone)) {
      errors.push('Valid phone number is required');
    }
    
    // Business hours validation
    if (config.operatingHours) {
      config.operatingHours.forEach((hours, dayIndex) => {
        if (hours.isOpen && (!hours.openTime || !hours.closeTime)) {
          errors.push(`Operating hours for ${getDayName(dayIndex)} are incomplete`);
        }
        
        if (hours.isOpen && hours.openTime >= hours.closeTime) {
          warnings.push(`${getDayName(dayIndex)} close time should be after open time`);
        }
      });
    }
    
    // Tax configuration validation
    if (config.taxSettings) {
      config.taxSettings.forEach((tax, index) => {
        if (!tax.name || tax.rate < 0 || tax.rate > 100) {
          errors.push(`Tax setting ${index + 1} has invalid name or rate`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  static validateIntegrationConfig(
    type: IntegrationType,
    config: IntegrationConfig
  ): ValidationResult {
    switch (type) {
      case 'payment':
        return this.validatePaymentConfig(config as PaymentConfig);
      case 'printer':
        return this.validatePrinterConfig(config as PrinterConfig);
      case 'delivery':
        return this.validateDeliveryConfig(config as DeliveryConfig);
      default:
        return { isValid: true, errors: [], warnings: [] };
    }
  }
  
  private static validatePaymentConfig(config: PaymentConfig): ValidationResult {
    const errors: string[] = [];
    
    if (!config.merchantId || config.merchantId.trim().length === 0) {
      errors.push('Merchant ID is required for payment integration');
    }
    
    if (!config.apiKey || config.apiKey.length < 20) {
      errors.push('Valid API key is required for payment integration');
    }
    
    if (config.enableCardPayments && !config.terminalId) {
      errors.push('Terminal ID is required for card payments');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}
```

### Settings Backup and Restore
```typescript
class SettingsBackupService {
  async createBackup(restaurantId: string): Promise<SettingsBackup> {
    const systemConfig = await configurationService.getSystemConfiguration(restaurantId);
    const integrations = await integrationService.getIntegrationSettings(restaurantId);
    const userPreferences = await userPreferencesService.getUserPreferences(
      getCurrentUserId()
    );
    
    const backup: SettingsBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      restaurantId,
      systemConfig,
      integrations: integrations.map(integration => ({
        ...integration,
        // Remove sensitive data
        apiKey: undefined,
        secretKey: undefined,
      })),
      userPreferences,
    };
    
    return backup;
  }
  
  async restoreFromBackup(
    backup: SettingsBackup,
    options: RestoreOptions
  ): Promise<RestoreResult> {
    const result: RestoreResult = {
      success: true,
      restored: [],
      failed: [],
      warnings: []
    };
    
    try {
      if (options.restoreSystemConfig && backup.systemConfig) {
        await configurationService.updateSystemConfiguration(
          backup.restaurantId,
          backup.systemConfig
        );
        result.restored.push('System Configuration');
      }
      
      if (options.restoreIntegrations && backup.integrations) {
        for (const integration of backup.integrations) {
          try {
            await integrationService.configureIntegration(
              integration.type,
              integration.config
            );
            result.restored.push(`${integration.type} Integration`);
          } catch (error) {
            result.failed.push({
              item: `${integration.type} Integration`,
              error: error.message
            });
          }
        }
      }
      
      if (options.restoreUserPreferences && backup.userPreferences) {
        await userPreferencesService.updateUserPreferences(
          getCurrentUserId(),
          backup.userPreferences
        );
        result.restored.push('User Preferences');
      }
    } catch (error) {
      result.success = false;
      result.failed.push({
        item: 'Settings Restore',
        error: error.message
      });
    }
    
    return result;
  }
  
  async exportSettingsToFile(restaurantId: string): Promise<string> {
    const backup = await this.createBackup(restaurantId);
    const backupData = JSON.stringify(backup, null, 2);
    
    // In React Native, we would use a file picker/saver
    const blob = new Blob([backupData], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }
}
```

### Integration Testing Framework
```typescript
class IntegrationTester {
  async testAllIntegrations(restaurantId: string): Promise<IntegrationTestResults> {
    const integrations = await integrationService.getIntegrationSettings(restaurantId);
    const results: IntegrationTestResults = {
      overall: 'unknown',
      tests: []
    };
    
    for (const integration of integrations) {
      if (integration.isEnabled) {
        const testResult = await this.testSingleIntegration(integration);
        results.tests.push(testResult);
      }
    }
    
    // Calculate overall status
    const hasFailures = results.tests.some(test => test.status === 'failed');
    const hasWarnings = results.tests.some(test => test.status === 'warning');
    
    if (hasFailures) {
      results.overall = 'failed';
    } else if (hasWarnings) {
      results.overall = 'warning';
    } else {
      results.overall = 'passed';
    }
    
    return results;
  }
  
  private async testSingleIntegration(
    integration: IntegrationSettings
  ): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      const result = await integrationService.testIntegration(
        integration.type,
        integration.config
      );
      
      return {
        type: integration.type,
        status: result.success ? 'passed' : 'failed',
        message: result.message,
        duration: Date.now() - startTime,
        details: result.details
      };
    } catch (error) {
      return {
        type: integration.type,
        status: 'failed',
        message: error.message,
        duration: Date.now() - startTime,
        error: error
      };
    }
  }
  
  async testPaymentTerminal(terminalConfig: PaymentTerminalConfig): Promise<TestResult> {
    // VP3350 specific testing
    try {
      const response = await fetch(`http://${terminalConfig.ipAddress}:${terminalConfig.port}/status`);
      
      if (response.ok) {
        const status = await response.json();
        return {
          success: true,
          message: 'Payment terminal connected successfully',
          details: status
        };
      } else {
        return {
          success: false,
          message: 'Payment terminal not responding',
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to payment terminal',
        error: error.message
      };
    }
  }
}
```

## Testing Strategy

### Unit Testing
```typescript
describe('SettingsScreen', () => {
  beforeEach(() => {
    mockServices.configuration.reset();
    mockServices.integration.reset();
    mockServices.userPreferences.reset();
  });
  
  it('should load system configuration correctly', async () => {
    const mockConfig = createMockSystemConfiguration();
    mockServices.configuration.getSystemConfiguration.mockResolvedValue(mockConfig);
    
    render(<SettingsScreen />, { wrapper: TestProviders });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockConfig.restaurantName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockConfig.address)).toBeInTheDocument();
    });
  });
  
  it('should validate form inputs correctly', async () => {
    render(<SettingsScreen />, { wrapper: TestProviders });
    
    // Clear restaurant name (required field)
    const nameInput = screen.getByTestId('restaurant-name-input');
    fireEvent.changeText(nameInput, '');
    
    // Try to save
    fireEvent.press(screen.getByTestId('save-settings-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Restaurant name is required')).toBeInTheDocument();
    });
  });
  
  it('should test integrations correctly', async () => {
    const mockTestResult = { success: true, message: 'Test successful' };
    mockServices.integration.testIntegration.mockResolvedValue(mockTestResult);
    
    render(<SettingsScreen />, { wrapper: TestProviders });
    
    // Navigate to integrations tab
    fireEvent.press(screen.getByText('Integrations'));
    
    // Test payment integration
    fireEvent.press(screen.getByTestId('test-payment-integration-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Test successful')).toBeInTheDocument();
      expect(mockServices.integration.testIntegration).toHaveBeenCalledWith(
        'payment',
        expect.any(Object)
      );
    });
  });
});
```

### Integration Testing
```typescript
describe('Settings Integration', () => {
  it('should save system configuration and sync with backend', async () => {
    const updatedConfig = {
      restaurantName: 'Updated Restaurant Name',
      address: 'Updated Address',
    };
    
    mockServices.configuration.updateSystemConfiguration.mockResolvedValue({
      ...mockSystemConfig,
      ...updatedConfig
    });
    
    render(<SettingsScreen />, { wrapper: TestProviders });
    
    // Update configuration
    fireEvent.changeText(screen.getByTestId('restaurant-name-input'), updatedConfig.restaurantName);
    fireEvent.changeText(screen.getByTestId('address-input'), updatedConfig.address);
    
    // Save changes
    fireEvent.press(screen.getByTestId('save-settings-button'));
    
    await waitFor(() => {
      expect(mockServices.configuration.updateSystemConfiguration).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(updatedConfig)
      );
    });
  });
});
```

## Quality Assurance

### Code Quality Checklist
- [ ] All components under size limits (270/80/40 lines)
- [ ] Professional theme applied consistently
- [ ] Form validation working properly
- [ ] Integration testing functionality
- [ ] Settings backup and restore
- [ ] Error handling for all operations
- [ ] Loading states during save operations
- [ ] Accessibility compliance (form labels, navigation)
- [ ] TypeScript strict mode compliance
- [ ] ESLint zero violations

### User Acceptance Criteria
- [ ] Restaurant managers can configure all system settings
- [ ] Users can customize their preferences and notifications
- [ ] Integration setup is straightforward with clear feedback
- [ ] Settings validation prevents invalid configurations
- [ ] Test functions verify integration connectivity
- [ ] Backup and restore functions work reliably
- [ ] Professional appearance suitable for administrative use

## Risk Mitigation

### Configuration Risks
**Risk**: Invalid settings breaking restaurant operations
**Mitigation**:
- Comprehensive validation before saving
- Backup creation before major changes
- Rollback capabilities for configuration errors
- Test functions to verify integration connectivity

### Security Risks
**Risk**: Sensitive integration credentials exposed
**Mitigation**:
- Secure storage for API keys and credentials
- Encryption for sensitive configuration data
- Audit logging for configuration changes
- Role-based access to sensitive settings

### User Experience Risks
**Risk**: Complex settings interface confusing users
**Mitigation**:
- Progressive disclosure of advanced settings
- Help text and tooltips for complex options
- Settings validation with clear error messages
- Logical grouping and tab organization

## Success Metrics

### Technical Metrics
- **Load Performance**: Settings load <300ms
- **Save Performance**: Configuration saves <500ms
- **Validation Performance**: Form validation <50ms
- **Integration Testing**: Connection tests complete <3s
- **Memory Usage**: Settings screens use <30MB RAM

### Business Metrics
- **Setup Time**: 75% reduction in initial restaurant setup time
- **Configuration Errors**: 90% reduction in invalid settings
- **Integration Success**: 95% successful integration setup rate
- **User Satisfaction**: 90%+ satisfaction with settings interface

## File Structure

```
src/screens/settings/
├── SettingsScreen.tsx                 # Main settings screen (270 lines)
├── components/
│   ├── SettingsTabBar.tsx            # Tab navigation (30 lines)
│   ├── SystemSettingsTab.tsx         # System configuration (80 lines)
│   ├── RestaurantConfig.tsx          # Restaurant info form (40 lines)
│   ├── TaxConfiguration.tsx          # Tax settings form (25 lines)
│   ├── OperatingHours.tsx            # Hours configuration (15 lines)
│   ├── UserSettingsTab.tsx           # User preferences (80 lines)
│   ├── ProfileSettings.tsx           # User profile form (40 lines)
│   ├── NotificationSettings.tsx      # Notification preferences (25 lines)
│   ├── DisplaySettings.tsx           # Display preferences (15 lines)
│   ├── IntegrationsTab.tsx           # Integration management (80 lines)
│   ├── PaymentIntegration.tsx        # Payment setup (40 lines)
│   ├── PrinterIntegration.tsx        # Printer configuration (25 lines)
│   ├── ThirdPartyApps.tsx            # Third-party integrations (15 lines)
│   └── IntegrationTester.tsx         # Integration testing (30 lines)
├── context/
│   └── SettingsContext.tsx           # Settings state management
├── services/
│   ├── ConfigurationService.ts       # System configuration API
│   ├── IntegrationService.ts         # Integration management API
│   ├── UserPreferencesService.ts     # User preferences API
│   └── SettingsBackupService.ts      # Backup and restore
├── utils/
│   ├── SettingsValidator.ts          # Configuration validation
│   └── IntegrationTester.ts          # Integration testing utilities
├── types/
│   └── settings.types.ts             # TypeScript definitions
└── __tests__/
    ├── SettingsScreen.test.tsx
    ├── SettingsValidation.test.tsx
    ├── IntegrationTesting.test.tsx
    └── BackupRestore.test.tsx
```

## Next Steps

1. **Start Implementation**: Begin with Phase 1 (System Settings) on Day 5 morning
2. **Service Integration**: Connect with configuration and user management APIs
3. **Integration Testing**: Implement VP3350 payment terminal testing
4. **Validation Framework**: Create comprehensive settings validation
5. **User Testing**: Validate with restaurant managers and IT administrators

**Ready to Begin**: All planning complete, can start Day 5 implementation with system settings foundation.