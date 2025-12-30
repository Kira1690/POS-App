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
import MenuManagementSettingsContainer from './components/menuManagement';
import { SettingsCategory } from '@/types/settings.types';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleSidebarCollapsible,
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
      iconBackground: theme.colors.error,
    },
    {
      id: 'user_management',
      label: 'User Management',
      icon: <Icon name="account-group" size={20} color={theme.colors.white} accessibilityLabel="User management" />,
      iconBackground: theme.colors.info,
    },
    {
      id: 'device_hardware',
      label: 'Device & Hardware',
      icon: <Icon name="devices" size={20} color={theme.colors.white} accessibilityLabel="Device and hardware" />,
      iconBackground: theme.colors.success,
    },
    {
      id: 'payment_config',
      label: 'Payment Configuration',
      icon: <Icon name="credit-card-outline" size={20} color={theme.colors.white} accessibilityLabel="Payment configuration" />,
      iconBackground: theme.colors.warning,
    },
    {
      id: 'table_management',
      label: 'Table Management',
      icon: <Icon name="table-furniture" size={20} color={theme.colors.white} accessibilityLabel="Table management" />,
      iconBackground: theme.colors.success,
    },
    {
      id: 'menu_management',
      label: 'Menu Management',
      icon: <Icon name="silverware-fork-knife" size={20} color={theme.colors.white} accessibilityLabel="Menu management" />,
      iconBackground: theme.colors.warning,
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Icon name="link-variant" size={20} color={theme.colors.white} accessibilityLabel="Integrations" />,
      iconBackground: theme.colors.purple,
    },
    {
      id: 'security_backup',
      label: 'Security & Backup',
      icon: <Icon name="shield-lock-outline" size={20} color={theme.colors.white} accessibilityLabel="Security and backup" />,
      iconBackground: theme.colors.cyan,
    },
    {
      id: 'system_logs',
      label: 'System Logs',
      icon: <Icon name="chart-line" size={20} color={theme.colors.white} accessibilityLabel="System logs" />,
      iconBackground: theme.colors.error,
    },
    {
      id: 'help_support',
      label: 'Help & Support',
      icon: <Icon name="help-circle-outline" size={20} color={theme.colors.white} accessibilityLabel="Help and support" />,
      iconBackground: theme.colors.onSurfaceVariant,
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
      case 'menu_management':
        return <MenuManagementSettingsContainer onChangesDetected={setHasUnsavedChanges} />;
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
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* APPLE BREADCRUMB (moved to top for better space utilization) */}
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
          borderBottomWidth: isDark ? 1 : 0,
          borderBottomColor: isDark ? theme.colors.layer1 : 'transparent',
        }}>
          <ApplePill
            text={`Dashboard › Settings › ${currentCategoryLabel}`}
            variant="badge"
            size="small"
            color="neutral"
          />
        </View>

        {/* APPLE MAIN LAYOUT (two-panel with minimal spacing for better space utilization) */}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
          paddingHorizontal: 6,
          paddingTop: 4,
          paddingBottom: 4,
          gap: 8,
        }}>

          {/* APPLE COLLAPSIBLE SIDEBAR (Phase 1 implementation) */}
          <AppleSidebarCollapsible
            items={sidebarItems}
            title="Settings Categories"
            searchable={true}
            searchPlaceholder="Search settings..."
            defaultCollapsed={false}
            showTooltips={true}
          />

          {/* CONTENT AREA - Table/Menu Management get full space, others use AppleSettingsPanel */}
          {activeCategory === 'table_management' || activeCategory === 'menu_management' ? (
            // Full-screen application-like interface (no header)
            <View style={{ flex: 1, backgroundColor: theme.colors.surface, borderRadius: 12, overflow: 'hidden' }}>
              {renderCategoryContent()}
            </View>
          ) : (
            // Other settings: Standard panel with header
            <AppleSettingsPanel
              title="System Settings"
              subtitle={currentCategoryLabel}
              headerActions={headerActions}
              scrollable={false}
            >
              {renderCategoryContent()}
            </AppleSettingsPanel>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}