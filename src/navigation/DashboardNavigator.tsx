/**
 * Dashboard Navigator - Sidebar-based navigation for dashboard screens
 * Provides navigation between Orders, Tables, Kitchen, Reports dashboards
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';
import { AppleSidebarCollapsible, AppleSidebarItem } from '@/components/apple/layouts/AppleSidebarCollapsible';

// Import the new dashboard screens
import OrdersDashboard from '@/screens/orders/OrdersDashboard';
import TablesDashboard from '@/screens/tables/TablesDashboard';
import KitchenDisplayScreen from '@/screens/orders/KitchenDisplayScreen';
import ReportsScreen from '@/screens/reports/ReportsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';

// These imports are no longer needed since we're using state-based navigation


const DashboardWithSidebar: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { isPhone, isSmallTablet, bodySize, chipRowHeight } = useResponsive();
  const insets = useSafeAreaInsets();
  const { isKitchenStaff, isManagementLevel, canAccessKitchen } = useAuthStatus();
  const [activeTab, setActiveTab] = useState('Overview');

  // Sidebar navigation items — filtered by role
  const allSidebarItems: (AppleSidebarItem & { visible: boolean })[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <MaterialIcons name="dashboard" size={20} color={theme.colors.white} />,
      iconBackground: theme.colors.info,
      selected: activeTab === 'Overview',
      onPress: () => { setActiveTab('Overview'); },
      visible: true, // all roles
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <MaterialIcons name="receipt" size={20} color={theme.colors.white} />,
      iconBackground: theme.colors.error,
      selected: activeTab === 'OrdersDashboard',
      onPress: () => { setActiveTab('OrdersDashboard'); },
      visible: isManagementLevel, // manager + admin + superadmin (waiters use Orders tab)
    },
    {
      id: 'tables',
      label: 'Tables',
      icon: <MaterialIcons name="table-restaurant" size={20} color={theme.colors.white} />,
      iconBackground: theme.colors.success,
      selected: activeTab === 'TablesDashboard',
      onPress: () => { setActiveTab('TablesDashboard'); },
      visible: !isKitchenStaff, // everyone except kitchen staff
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      icon: <MaterialIcons name="restaurant" size={20} color={theme.colors.white} />,
      iconBackground: theme.colors.warning,
      selected: activeTab === 'KitchenDashboard',
      onPress: () => { setActiveTab('KitchenDashboard'); },
      visible: canAccessKitchen, // kitchen_staff + manager + admin + superadmin
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <MaterialIcons name="analytics" size={20} color={theme.colors.white} />,
      iconBackground: theme.colors.purple,
      selected: activeTab === 'ReportsDashboard',
      onPress: () => { setActiveTab('ReportsDashboard'); },
      visible: isManagementLevel, // manager + admin + superadmin
    },
  ];

  const sidebarItems: AppleSidebarItem[] = useMemo(
    () => allSidebarItems.filter(item => item.visible).map(({ visible, ...item }) => item),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, isManagementLevel, isKitchenStaff, canAccessKitchen, theme]
  );

  // Render the current screen based on active tab
  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'Overview':
        return <DashboardScreen />;
      case 'OrdersDashboard':
        return <OrdersDashboard />;
      case 'TablesDashboard':
        return <TablesDashboard />;
      case 'KitchenDashboard':
        return <KitchenDisplayScreen />;
      case 'ReportsDashboard':
        return <ReportsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    content: {
      flex: 1,
    },
    phoneContainer: {
      flex: 1,
      flexDirection: 'column',
      paddingTop: insets.top,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    chipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: bodySize,
      color: theme.colors.onSurface,
    },
    chipTextActive: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
  });

  if (isPhone) {
    return (
      <View style={styles.phoneContainer}>
        {/* Phone: horizontal chip nav — wrap in View to constrain height (ScrollView ignores height style in flex containers) */}
        <View style={{ height: chipRowHeight }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={styles.chipRow}
          >
            {sidebarItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, item.selected && styles.chipActive]}
                onPress={item.onPress}
                accessibilityLabel={item.label}
              >
                <Text style={[styles.chipText, item.selected && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.content}>
          {renderCurrentScreen()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Collapsible Sidebar — manages its own width via animation */}
      <AppleSidebarCollapsible
        items={sidebarItems}
        title="POS Dashboard"
        defaultCollapsed={isSmallTablet}
      />

      {/* Content Area */}
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>
    </View>
  );
};

export const DashboardNavigator: React.FC = () => {
  return <DashboardWithSidebar />;
};

export default DashboardNavigator;