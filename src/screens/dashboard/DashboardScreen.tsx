import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleButton,
  AppleCard,
  AppleStatusPill,
  AppleProgressBar,
} from '@/components/apple';
import { KPISection } from './components/KPISection';
import { QuickActionsSection } from './components/QuickActionsSection';
import { ChartsSection } from './components/ChartsSection';
import { KPIMetrics, QuickActionData } from '@/types/dashboard.types';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { useTableStats } from '@/hooks/context/useTableSelectors';
import { useKitchenTickets } from '@/context/kitchen/EnhancedKitchenContext';

const formatCurrency = (amount: number) =>
  `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark } = useTheme();

  // Real data hooks
  const { orders, activeOrders, refreshOrders, isLoading } = useUnifiedOrder();
  const tableStats = useTableStats();
  const { stats: kitchenStats } = useKitchenTickets();

  // Mock restaurant ID for ChartsSection (still uses mock analytics)
  const restaurantId = 'rest_001';

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      refreshOrders();
    }, [refreshOrders])
  );

  // Compute today's start timestamp
  const todayStart = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
  }, []);

  // Compute KPI metrics from real data
  const kpis = useMemo((): KPIMetrics | null => {
    if (isLoading && orders.length === 0) return null;

    const todaysOrders = orders.filter(o =>
      new Date(o.createdAt).getTime() >= todayStart
    );
    const paidOrders = todaysOrders.filter(o => o.status === 'paid');
    const todaysSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = todaysOrders.length > 0
      ? todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0) / todaysOrders.length
      : 0;

    return {
      sales: {
        value: formatCurrency(todaysSales),
        change: 0,
        changeDirection: 'neutral',
        period: 'Today',
      },
      orders: {
        value: todaysOrders.length,
        change: 0,
        changeDirection: 'neutral',
        period: 'Today',
      },
      revenue: {
        value: formatCurrency(todaysSales),
        change: 0,
        changeDirection: 'neutral',
        period: 'Today',
      },
      averageOrderValue: {
        value: formatCurrency(avgOrderValue),
        change: 0,
        changeDirection: 'neutral',
        period: 'Today',
      },
    };
  }, [orders, todayStart, isLoading]);

  // Compute quick action data from real sources
  const quickActions = useMemo((): QuickActionData => ({
    tables: {
      total: tableStats.total,
      occupied: tableStats.occupied,
      available: tableStats.available,
    },
    kitchen: {
      pendingOrders: kitchenStats.pendingCount,
      avgCookTime: kitchenStats.avgPrepTime > 0 ? `${kitchenStats.avgPrepTime}m` : 'N/A',
      alerts: kitchenStats.overdueCount,
    },
    staff: {
      onDuty: 0,
      total: 0,
      breaks: 0,
    },
  }), [tableStats, kitchenStats]);

  // Compute progress values
  const salesTarget = 5000;
  const todaysSales = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid' && new Date(o.createdAt).getTime() >= todayStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, todayStart]);

  const salesProgress = useMemo(() =>
    Math.min(todaysSales / salesTarget, 1), [todaysSales]);

  const completionRate = useMemo(() => {
    const todaysOrders = orders.filter(o =>
      new Date(o.createdAt).getTime() >= todayStart
    );
    if (todaysOrders.length === 0) return 0;
    const completed = todaysOrders.filter(o => o.status === 'paid').length;
    return completed / todaysOrders.length;
  }, [orders, todayStart]);

  const loading = isLoading && orders.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  }, [refreshOrders]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleNavigateToTables = () => {
    Alert.alert('Navigation', 'Navigate to Tables screen');
  };

  const handleNavigateToKitchen = () => {
    Alert.alert('Navigation', 'Navigate to Kitchen screen');
  };

  const handleNavigateToStaff = () => {
    Alert.alert('Navigation', 'Navigate to Staff screen');
  };

  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleStatusPill status="online" size="small" />
      <AppleButton
        title="Refresh"
        icon={<MaterialIcons name="refresh" size={16} color={theme.colors.onSecondary} />}
        variant="secondary"
        size="medium"
        onPress={onRefresh}
      />
    </View>
  );

  const renderQuickActions = () => (
    <AppleCard layer="surface" size="large" style={{
      marginBottom: 20,
      padding: 24,
      ...theme.shadows.md,
      elevation: 4
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <MaterialIcons name="flash-on" size={20} color={theme.colors.primary} />
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.onSurface,
        }}>
          Quick Actions
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <AppleButton
          title="Tables"
          icon={<MaterialIcons name="table-restaurant" size={18} color={theme.colors.onPrimary} />}
          variant="primary"
          size="large"
          onPress={handleNavigateToTables}
        />
        <AppleButton
          title="Kitchen"
          icon={<MaterialIcons name="restaurant" size={18} color={theme.colors.onSecondary} />}
          variant="secondary"
          size="large"
          onPress={handleNavigateToKitchen}
        />
        <AppleButton
          title="Staff"
          icon={<MaterialIcons name="group" size={18} color={theme.colors.onSurface} />}
          variant="ghost"
          size="large"
          onPress={handleNavigateToStaff}
        />
      </View>
    </AppleCard>
  );

  return (
    <AppleDashboardPanel
      title={`${getTimeGreeting()}, Manager`}
      subtitle={`The Food Corner \u2022 ${new Date().toLocaleDateString()}`}
      headerActions={headerActions}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <AppleCard layer="surfaceVariant" size="large" style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>
            Key Metrics
          </Text>
        </View>
        <KPISection kpis={kpis} loading={loading} />
      </AppleCard>

      <AppleCard layer="surface" size="large" style={{ marginBottom: 20 }}>
        <ChartsSection restaurantId={restaurantId} loading={loading} />
      </AppleCard>

      {renderQuickActions()}

      <AppleCard layer="surfaceVariant" size="medium" style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: 12
        }}>
          System Status
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <AppleStatusPill status="active" text="POS System" size="small" />
          <AppleStatusPill
            status={kitchenStats.pendingCount > 0 ? 'active' : 'online'}
            text={`Kitchen (${kitchenStats.pendingCount} pending)`}
            size="small"
          />
          <AppleStatusPill status="success" text="Payments" size="small" />
          <AppleStatusPill
            status={tableStats.available <= 2 ? 'warning' : 'online'}
            text={`Tables (${tableStats.available} free)`}
            size="small"
          />
        </View>
      </AppleCard>

      <AppleCard layer="surface" size="medium">
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: 16
        }}>
          Today's Progress
        </Text>
        <View style={{ gap: 12 }}>
          <AppleProgressBar
            progress={salesProgress}
            label={`Sales Target (${formatCurrency(todaysSales)} / ${formatCurrency(salesTarget)})`}
            color="success"
            showPercentage
            size="medium"
          />
          <AppleProgressBar
            progress={completionRate}
            label="Order Completion"
            color="primary"
            showPercentage
            size="medium"
          />
          <AppleProgressBar
            progress={tableStats.total > 0 ? tableStats.occupied / tableStats.total : 0}
            label="Table Utilization"
            color="warning"
            showPercentage
            size="medium"
          />
        </View>
      </AppleCard>
    </AppleDashboardPanel>
  );
};

export default DashboardScreen;
