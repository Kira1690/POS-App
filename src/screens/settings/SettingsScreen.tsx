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
import { SettingsCategory } from '@/types/settings.types';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleSidebar,
  AppleSettingsPanel,
  AppleButton,
  ApplePill,
  type AppleSidebarItem,
} from '@/components/apple';

// APPLE SETTINGS CATEGORIES (transformed for AppleSidebar)
// Using Apple's reference image structure with colorful icon backgrounds
const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
  {
    id: 'restaurant_profile',
    label: 'Restaurant Profile',
    icon: '🏪',
    iconBackground: '#FF453A', // Apple red (like Notifications in reference)
  },
  {
    id: 'user_management',
    label: 'User Management',
    icon: '👥',
    iconBackground: '#007AFF', // Apple blue (like Display & Brightness)
  },
  {
    id: 'device_hardware',
    label: 'Device & Hardware',
    icon: '📱',
    iconBackground: '#32D74B', // Apple green (like Battery)
  },
  {
    id: 'payment_config',
    label: 'Payment Configuration',
    icon: '💳',
    iconBackground: '#FF9500', // Apple orange (like General)
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: '🔗',
    iconBackground: '#BF5AF2', // Apple purple (like Focus)
  },
  {
    id: 'security_backup',
    label: 'Security & Backup',
    icon: '🔒',
    iconBackground: '#64D2FF', // Apple cyan (like Privacy)
  },
  {
    id: 'system_logs',
    label: 'System Logs',
    icon: '📊',
    iconBackground: '#FF453A', // Apple red variation
  },
  {
    id: 'help_support',
    label: 'Help & Support',
    icon: '❓',
    iconBackground: '#8E8E93', // Apple gray
  },
];

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('restaurant_profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // APPLE SETTINGS CONTENT RENDERING (unchanged)
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
        title="💾 Save All"
        variant="success"
        size="medium"
        onPress={handleSaveAllChanges}
      />
      <AppleButton
        title="← Dashboard"
        variant="secondary"
        size="medium"
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