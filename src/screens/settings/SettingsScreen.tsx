import React, { useState } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import {
  RestaurantProfileSettings,
  UserManagementSettings,
  DeviceHardwareSettings,
  PaymentConfigurationSettings,
  IntegrationsSettings,
  SecurityBackupSettings,
  SystemLogsSettings,
  HelpSupportSettings,
  TRXSettingsPanel,
  PrinterSettingsPanel,
} from './components';
import TableManagementSettingsContainer from './components/tableManagement';
import MenuManagementSettingsContainer from './components/menuManagement';
import KitchenManagementScreen from './components/kitchenManagement/KitchenManagementScreen';
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

// Grouped structure for phone master-detail list
const SETTINGS_GROUPS = [
  { label: 'GENERAL', ids: ['restaurant_profile', 'user_management', 'device_hardware'] },
  { label: 'PAYMENTS', ids: ['payment_config', 'trx_payment'] },
  { label: 'OPERATIONS', ids: ['table_management', 'menu_management', 'kitchen_management', 'printer_management'] },
  { label: 'SYSTEM', ids: ['integrations', 'security_backup', 'system_logs', 'help_support'] },
];

export default function SettingsScreen() {
  // Theme hook FIRST (REQUIRED per CLAUDE.md)
  const { theme, isDark } = useTheme();
  const { isPhone, isSmallTablet, isPortrait } = useResponsive();
  // Small tablets use phone layout — sidebar takes too much space on 600-800dp screens
  const usePhoneLayout = isPhone || isSmallTablet;
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('restaurant_profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDetail, setShowDetail] = useState(false); // phone only

  // APPLE SETTINGS CATEGORIES (transformed for AppleSidebar)
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
      id: 'trx_payment',
      label: 'TRX Terminal',
      icon: <Icon name="lan-connect" size={20} color={theme.colors.white} accessibilityLabel="TRX terminal payment" />,
      iconBackground: theme.colors.info,
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
      id: 'kitchen_management',
      label: 'Kitchen Management',
      icon: <Icon name="stove" size={20} color={theme.colors.white} accessibilityLabel="Kitchen management" />,
      iconBackground: theme.colors.error,
    },
    {
      id: 'printer_management',
      label: 'Printer Management',
      icon: <Icon name="printer" size={20} color={theme.colors.white} accessibilityLabel="Printer management" />,
      iconBackground: theme.colors.purple,
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

  // INTERACTION HANDLERS
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
              if (usePhoneLayout) setShowDetail(true);
            }
          },
        ]
      );
    } else {
      setActiveCategory(category);
      if (usePhoneLayout) setShowDetail(true);
    }
  };

  const handleBackToList = () => {
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
              setShowDetail(false);
            }
          },
        ]
      );
    } else {
      setShowDetail(false);
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
    // TODO: navigation.navigate('Dashboard')
  };

  // CONTENT RENDERING
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
      case 'trx_payment':
        return <TRXSettingsPanel onChangesDetected={setHasUnsavedChanges} />;
      case 'table_management':
        return <TableManagementSettingsContainer onChangesDetected={setHasUnsavedChanges} />;
      case 'menu_management':
        return <MenuManagementSettingsContainer onChangesDetected={setHasUnsavedChanges} />;
      case 'kitchen_management':
        return <KitchenManagementScreen />;
      case 'printer_management':
        return <PrinterSettingsPanel onChangesDetected={setHasUnsavedChanges} />;
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

  const sidebarItems: AppleSidebarItem[] = SETTINGS_CATEGORIES.map(category => ({
    ...category,
    selected: activeCategory === category.id,
    onPress: () => handleCategoryChange(category.id as SettingsCategory),
  }));

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

  const currentCategoryLabel = SETTINGS_CATEGORIES.find(
    c => c.id === activeCategory
  )?.label || 'Settings';

  const isFullScreenContent = activeCategory === 'table_management'
    || activeCategory === 'menu_management'
    || activeCategory === 'kitchen_management';

  // CONTENT PANEL (used by both tablet and phone detail)
  const renderContent = () => {
    if (isFullScreenContent) {
      return (
        <View style={styles.contentArea}>
          {renderCategoryContent()}
        </View>
      );
    }
    if (usePhoneLayout) {
      // No panel title — back header already shows category label
      return (
        <AppleSettingsPanel scrollable={true}>
          {renderCategoryContent()}
        </AppleSettingsPanel>
      );
    }
    return (
      <AppleSettingsPanel
        title="System Settings"
        subtitle={currentCategoryLabel}
        headerActions={headerActions}
        scrollable={false}
      >
        {renderCategoryContent()}
      </AppleSettingsPanel>
    );
  };

  // PHONE: master list view
  const renderPhoneList = () => (
    <ScrollView
      style={[styles.phoneLayout, { backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {SETTINGS_GROUPS.map((group) => {
        const phoneIds = group.ids.filter(id => id !== 'table_management');
        if (phoneIds.length === 0) return null;
        return (
        <View key={group.label}>
          <Text style={styles.groupHeader}>{group.label}</Text>
          {phoneIds.map((id, idx) => {
            const item = SETTINGS_CATEGORIES.find(c => c.id === id);
            if (!item) return null;
            const isLast = idx === phoneIds.length - 1;
            return (
              <View key={id}>
                <TouchableOpacity
                  style={[styles.listRow, { backgroundColor: isDark ? theme.colors.layer1 : theme.colors.surface }]}
                  onPress={() => handleCategoryChange(id as SettingsCategory)}
                  activeOpacity={0.7}
                  accessibilityLabel={item.label}
                >
                  <View style={[styles.iconBg, { backgroundColor: item.iconBackground }]}>
                    {item.icon}
                  </View>
                  <Text style={[styles.listRowLabel, { color: theme.colors.onSurface }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Icon name="chevron-right" size={16} color={theme.colors.onSurfaceVariant} accessibilityLabel="" />
                </TouchableOpacity>
                {!isLast && (
                  <View style={[styles.separator, { backgroundColor: theme.colors.outline }]} />
                )}
              </View>
            );
          })}
        </View>
        );
      })}
    </ScrollView>
  );

  // PHONE: detail view with back header
  const renderPhoneDetail = () => (
    <View style={[styles.phoneLayout, { backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background }]}>
      <View style={[styles.phoneDetailHeader, {
        backgroundColor: isDark ? theme.colors.layer1 : theme.colors.surface,
        borderBottomColor: theme.colors.outline,
      }]}>
        <TouchableOpacity
          style={styles.phoneBackBtn}
          onPress={handleBackToList}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Back to settings list"
        >
          <Icon name="arrow-left" size={20} color={theme.colors.primary} accessibilityLabel="" />
          <Text style={[styles.phoneBackText, { color: theme.colors.primary }]}>Settings</Text>
        </TouchableOpacity>
        <Text style={[styles.phoneDetailTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {currentCategoryLabel}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    safe: { flex: 1 },
    breadcrumb: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: isDark ? theme.colors.layer1 : 'transparent',
    },
    mainLayout: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
      paddingHorizontal: 6,
      paddingTop: 4,
      paddingBottom: 0,
      gap: 8,
    },
    phoneLayout: {
      flex: 1,
    },
    contentArea: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      overflow: 'hidden',
    },
    // Phone list styles
    groupHeader: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 6,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      minHeight: 52,
    },
    iconBg: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    listRowLabel: {
      flex: 1,
      fontSize: 16,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 64,
    },
    // Phone detail styles
    phoneDetailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 4,
      minHeight: 52,
      borderBottomWidth: 1,
    },
    phoneBackBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 10,
      paddingRight: 8,
      minWidth: 80,
    },
    phoneBackText: {
      fontSize: 15,
      fontWeight: '500',
    },
    phoneDetailTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginRight: 80,
    },
  });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* Breadcrumb — tablet only */}
        {!usePhoneLayout && (
          <View style={styles.breadcrumb}>
            <ApplePill
              text={`Dashboard › Settings › ${currentCategoryLabel}`}
              variant="badge"
              size="small"
              color="neutral"
            />
          </View>
        )}

        {usePhoneLayout ? (
          /* PHONE / SMALL TABLET: master-detail list pattern */
          showDetail ? renderPhoneDetail() : renderPhoneList()
        ) : (
          /* TABLET: sidebar + content panel */
          <View style={styles.mainLayout}>
            <AppleSidebarCollapsible
              items={sidebarItems}
              title="Settings Categories"
              searchable={true}
              searchPlaceholder="Search settings..."
              defaultCollapsed={false}
              showTooltips={true}
            />
            {renderContent()}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
