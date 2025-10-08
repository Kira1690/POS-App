import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RestaurantProfileSettings,
  UserManagementSettings,
  DeviceHardwareSettings,
  PaymentConfigurationSettings,
  IntegrationsSettings,
  SecurityBackupSettings,
  SystemLogsSettings,
  HelpSupportSettings,
} from './components';
import TableManagementSettingsContainer from './components/tableManagement';
import { SettingsCategory } from '@/types/settings.types';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleSidebar,
  AppleSettingsPanel,
  AppleButton,
  ApplePill,
  type AppleSidebarItem,
} from '@/components/apple';
import { Icon } from '@/components/common';

export default function SettingsScreen() {
  // Theme hook FIRST (REQUIRED per CLAUDE.md)
  const { theme, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('restaurant_profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // APPLE SETTINGS CATEGORIES (transformed for AppleSidebar)
  // Using Apple's reference image structure with colorful icon backgrounds
  const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
    {
      id: 'restaurant_profile',
      label: 'Restaurant Profile',
      icon: <Icon name="store" size={20} color={theme.colors.white} accessibilityLabel="Restaurant profile" />,
      iconBackground: theme.colors.error, // Fixed: was hardcoded '#FF453A'
    },
    {
      id: 'user_management',
      label: 'User Management',
      icon: <Icon name="account-group" size={20} color={theme.colors.white} accessibilityLabel="User management" />,
      iconBackground: theme.colors.info, // Fixed: was hardcoded '#007AFF'
    },
    {
      id: 'device_hardware',
      label: 'Device & Hardware',
      icon: <Icon name="devices" size={20} color={theme.colors.white} accessibilityLabel="Device and hardware" />,
      iconBackground: theme.colors.success, // Fixed: was hardcoded '#32D74B'
    },
    {
      id: 'payment_config',
      label: 'Payment Configuration',
      icon: <Icon name="credit-card-outline" size={20} color={theme.colors.white} accessibilityLabel="Payment configuration" />,
      iconBackground: theme.colors.warning, // Fixed: was hardcoded '#FF9500'
    },
    {
      id: 'table_management',
      label: 'Table Management',
      icon: <Icon name="table-furniture" size={20} color={theme.colors.white} accessibilityLabel="Table management" />,
      iconBackground: theme.colors.success, // Green for table management
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Icon name="link-variant" size={20} color={theme.colors.white} accessibilityLabel="Integrations" />,
      iconBackground: theme.colors.purple, // Fixed: was hardcoded '#BF5AF2'
    },
    {
      id: 'security_backup',
      label: 'Security & Backup',
      icon: <Icon name="shield-lock-outline" size={20} color={theme.colors.white} accessibilityLabel="Security and backup" />,
      iconBackground: theme.colors.cyan, // Fixed: was hardcoded '#64D2FF'
    },
    {
      id: 'system_logs',
      label: 'System Logs',
      icon: <Icon name="chart-line" size={20} color={theme.colors.white} accessibilityLabel="System logs" />,
      iconBackground: theme.colors.error, // Fixed: was hardcoded '#FF453A'
    },
    {
      id: 'help_support',
      label: 'Help & Support',
      icon: <Icon name="help-circle-outline" size={20} color={theme.colors.white} accessibilityLabel="Help and support" />,
      iconBackground: theme.colors.onSurfaceVariant, // Fixed: was hardcoded '#8E8E93'
    },
  ];

  // APPLE-STYLE INTERACTION HANDLERS (unchanged logic, cleaner implementation)
  const handleCategoryChange = (category: SettingsCategory) => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setHasUnsavedChanges(false);
              setActiveCategory(category);
            }
          },
        ]
      );
    } else {
      setActiveCategory(category);
    }
  };

  const handleSaveAllChanges = () => {
    Alert.alert(
      'Save All Changes',
      'This will save all pending changes across all settings categories.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save All',
          onPress: () => {
            setHasUnsavedChanges(false);
            Alert.alert('Success', 'All settings have been saved successfully.');
          }
        },
      ]
    );
  };

  const handleBackToDashboard = () => {
    // Navigate back to dashboard
    console.log('Navigate back to dashboard');
  };

  // APPLE SETTINGS CONTENT RENDERING (with Table Management)
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'restaurant_profile':
        return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'user_management':
        return <UserManagementSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'device_hardware':
        return <DeviceHardwareSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'payment_config':
        return <PaymentConfigurationSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'table_management':
        return <TableManagementSettingsContainer onChangesDetected={setHasUnsavedChanges} />;
      case 'integrations':
        return <IntegrationsSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'security_backup':
        return <SecurityBackupSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'system_logs':
        return <SystemLogsSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'help_support':
        return <HelpSupportSettings onChangesDetected={setHasUnsavedChanges} />;
      default:
        return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
    }
  };

  // TRANSFORM CATEGORIES FOR APPLE SIDEBAR (adds selection state and handlers)
  const sidebarItems: AppleSidebarItem[] = SETTINGS_CATEGORIES.map(category => ({
    ...category,
    selected: activeCategory === category.id,
    onPress: () => handleCategoryChange(category.id as SettingsCategory),
  }));

  // APPLE HEADER ACTIONS (using universal AppleButton components)
  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleButton
        title="Save All"
        variant="success"
        size="medium"
        icon={<Icon name="content-save" size={18} color={theme.colors.white} />}
        iconPosition="left"
        onPress={handleSaveAllChanges}
      />
      <AppleButton
        title="Dashboard"
        variant="secondary"
        size="medium"
        icon={<Icon name="arrow-left" size={18} color={theme.colors.onSurface} />}
        iconPosition="left"
        onPress={handleBackToDashboard}
      />
    </View>
  );

  // GET CURRENT CATEGORY LABEL (for breadcrumb)
  const currentCategoryLabel = SETTINGS_CATEGORIES.find(
    c => c.id === activeCategory
  )?.label || 'Settings';

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background // Apple layer 0 background
    }}>
      {/* APPLE MAIN LAYOUT (two-panel with generous spacing) */}
      <View style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
        paddingHorizontal: 24, // Apple generous spacing
        paddingTop: 24,
        gap: 20, // Apple spacing between panels
      }}>

        {/* APPLE SIDEBAR (using universal AppleSidebar component) */}
        <AppleSidebar
          items={sidebarItems}
          title="Settings Categories"
          searchable={true}
          searchPlaceholder="Search settings..."
          variant="settings"
          width={280}
        />

        {/* APPLE CONTENT PANEL (using universal AppleSettingsPanel) */}
        <AppleSettingsPanel
          title="System Settings"
          subtitle={currentCategoryLabel}
          headerActions={headerActions}
        >
          {renderCategoryContent()}
        </AppleSettingsPanel>
      </View>

      {/* APPLE BREADCRUMB (subtle bottom navigation) */}
      <View style={{
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
        borderTopWidth: isDark ? 1 : 0,
        borderTopColor: isDark ? theme.colors.layer1 : 'transparent',
      }}>
        <ApplePill
          text={`Dashboard › Settings › ${currentCategoryLabel}`}
          variant="badge"
          size="small"
          color="neutral"
        />
      </View>
    </SafeAreaView>
  );
}