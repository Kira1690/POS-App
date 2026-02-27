/**
 * Dashboard Navigator - Sidebar-based navigation for dashboard screens
 * Provides navigation between Orders, Tables, Kitchen, Reports dashboards
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppleSidebarCollapsible, AppleSidebarItem } from '@/components/apple/layouts/AppleSidebarCollapsible';

// Import the new dashboard screens
import OrdersDashboard from '@/screens/orders/OrdersDashboard';
import TablesDashboard from '@/screens/tables/TablesDashboard';
import KitchenStaffDashboard from '@/screens/kitchen/KitchenStaffDashboard';
import ReportsDashboard from '@/screens/reports/ReportsDashboard';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';

// These imports are no longer needed since we're using state-based navigation


const DashboardWithSidebar: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');

  // Sidebar navigation items
  const sidebarItems: AppleSidebarItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <MaterialIcons name="dashboard" size={20} color="#FFFFFF" />,
      iconBackground: '#007AFF',
      selected: activeTab === 'Overview',
      onPress: () => {
        setActiveTab('Overview');
      }
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <MaterialIcons name="receipt" size={20} color="#FFFFFF" />,
      iconBackground: '#FF3B30',
      selected: activeTab === 'OrdersDashboard',
      onPress: () => {
        setActiveTab('OrdersDashboard');
      }
    },
    {
      id: 'tables',
      label: 'Tables',
      icon: <MaterialIcons name="table-restaurant" size={20} color="#FFFFFF" />,
      iconBackground: '#32D74B',
      selected: activeTab === 'TablesDashboard',
      onPress: () => {
        setActiveTab('TablesDashboard');
      }
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      icon: <MaterialIcons name="restaurant" size={20} color="#FFFFFF" />,
      iconBackground: '#FF9500',
      selected: activeTab === 'KitchenDashboard',
      onPress: () => {
        setActiveTab('KitchenDashboard');
      }
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <MaterialIcons name="analytics" size={20} color="#FFFFFF" />,
      iconBackground: '#AF52DE',
      selected: activeTab === 'ReportsDashboard',
      onPress: () => {
        setActiveTab('ReportsDashboard');
      }
    }
  ];

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
        return <KitchenStaffDashboard />;
      case 'ReportsDashboard':
        return <ReportsDashboard />;
      default:
        return <DashboardScreen />;
    }
  };

  const styles = {
    container: {
      flex: 1,
      flexDirection: 'row' as const,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    content: {
      flex: 1,
    },
  };

  return (
    <View style={styles.container}>
      {/* Collapsible Sidebar — manages its own width via animation */}
      <AppleSidebarCollapsible
        items={sidebarItems}
        title="POS Dashboard"
        defaultCollapsed={false}
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