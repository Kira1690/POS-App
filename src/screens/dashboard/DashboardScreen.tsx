import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
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
import OrderSummarySheet from './components/OrderSummarySheet';
import ActivityLogsSheet from './components/ActivityLogsSheet';
import { KPIMetrics, QuickActionData } from '@/types/dashboard.types';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { UnifiedOrder } from '@/types/unified-order.types';
import { reportsApiService } from '@/services/api/ReportsApiService';
import { DailySales } from '@/types/reports-api.types';
import { useTableStats } from '@/hooks/context/useTableSelectors';
import { useKitchenStats } from '@/context/unified-order/UnifiedOrderContext';
import { useAuth } from '@/context/auth';
import { useSyncContext } from '@/context/sync/SyncContext';

const formatCurrency = (amount: number) =>
  `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const { theme, isDark } = useTheme();
  const { isPhone, headingSize, contentPadding, sectionGap } = useResponsive();
  const navigation = useNavigation();

  // Real data hooks
  const { state: authState } = useAuth();
  const { orders, activeOrders, refreshOrders, isLoading } = useUnifiedOrder();
  const tableStats = useTableStats();
  const kitchenStats = useKitchenStats();

  const restaurantId = authState.restaurant?.id ?? 'rest_001';
  const { syncStatus } = useSyncContext();
  const isOnline = syncStatus === 'syncing' || syncStatus === 'idle';

  // Real API KPIs (today vs yesterday) — only fetch when online
  const [apiToday, setApiToday] = useState<DailySales | null>(null);
  const [apiYesterday, setApiYesterday] = useState<DailySales | null>(null);

  const fetchApiKpis = useCallback(async () => {
    if (!isOnline) return;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    try {
      const [t, y] = await Promise.all([
        reportsApiService.getDailySales(fmt(today)),
        reportsApiService.getDailySales(fmt(yesterday)),
      ]);
      setApiToday(t);
      setApiYesterday(y);
    } catch {
      // Falls back to local order data in kpis useMemo
    }
  }, [isOnline]);

  useEffect(() => {
    fetchApiKpis();
  }, [fetchApiKpis]);

  // Refresh on screen focus — refresh both orders and API KPIs
  useFocusEffect(
    useCallback(() => {
      refreshOrders();
      fetchApiKpis();
    }, [refreshOrders, fetchApiKpis])
  );

  // Compute today's start timestamp
  const todayStart = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
  }, []);

  // Compute KPI metrics — prefer API data, fall back to local orders
  const kpis = useMemo((): KPIMetrics | null => {
    if (isLoading && orders.length === 0 && !apiToday) return null;

    const pct = (curr: number, prev: number): number =>
      prev > 0 ? ((curr - prev) / prev) * 100 : 0;
    const dir = (v: number): 'up' | 'down' | 'neutral' =>
      v > 0 ? 'up' : v < 0 ? 'down' : 'neutral';

    if (apiToday) {
      const salesChange = pct(apiToday.totalRevenue, apiYesterday?.totalRevenue ?? 0);
      const ordersChange = pct(apiToday.totalOrders, apiYesterday?.totalOrders ?? 0);
      const avgChange = pct(apiToday.avgOrderValue, apiYesterday?.avgOrderValue ?? 0);
      return {
        sales: {
          value: formatCurrency(apiToday.totalRevenue),
          change: Math.round(Math.abs(salesChange) * 10) / 10,
          changeDirection: dir(salesChange),
          period: 'vs yesterday',
        },
        orders: {
          value: apiToday.totalOrders,
          change: Math.round(Math.abs(ordersChange) * 10) / 10,
          changeDirection: dir(ordersChange),
          period: 'vs yesterday',
        },
        revenue: {
          value: formatCurrency(apiToday.netRevenue ?? apiToday.totalRevenue),
          change: Math.round(Math.abs(salesChange) * 10) / 10,
          changeDirection: dir(salesChange),
          period: 'vs yesterday',
        },
        averageOrderValue: {
          value: formatCurrency(apiToday.avgOrderValue),
          change: Math.round(Math.abs(avgChange) * 10) / 10,
          changeDirection: dir(avgChange),
          period: 'vs yesterday',
        },
      };
    }

    // Offline fallback from local orders
    const todaysOrders = orders.filter(
      (o) => new Date(o.createdAt).getTime() >= todayStart,
    );
    const paidOrders = todaysOrders.filter((o) => o.status === 'paid');
    const todaysSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue =
      todaysOrders.length > 0
        ? todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0) / todaysOrders.length
        : 0;
    return {
      sales: {
        value: formatCurrency(todaysSales),
        change: 0,
        changeDirection: 'neutral',
        period: 'Today (local)',
      },
      orders: {
        value: todaysOrders.length,
        change: 0,
        changeDirection: 'neutral',
        period: 'Today (local)',
      },
      revenue: {
        value: formatCurrency(todaysSales),
        change: 0,
        changeDirection: 'neutral',
        period: 'Today (local)',
      },
      averageOrderValue: {
        value: formatCurrency(avgOrderValue),
        change: 0,
        changeDirection: 'neutral',
        period: 'Today (local)',
      },
    };
  }, [orders, todayStart, isLoading, apiToday, apiYesterday]);

  // Staff on duty = unique server IDs across active orders
  const staffOnDuty = useMemo(() => {
    const serverIds = new Set(
      activeOrders.filter((o) => o.servedBy).map((o) => o.servedBy!),
    );
    return serverIds.size;
  }, [activeOrders]);

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
      onDuty: staffOnDuty,
      total: staffOnDuty,
      breaks: 0,
    },
  }), [tableStats, kitchenStats, staffOnDuty]);

  // Compute progress values
  const todaysSales = useMemo(() => {
    if (apiToday) return apiToday.totalRevenue;
    return orders
      .filter((o) => o.status === 'paid' && new Date(o.createdAt).getTime() >= todayStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, todayStart, apiToday]);

  // Dynamic sales target = 110% of yesterday, or local orders-based estimate
  const salesTarget = useMemo(() => {
    if (apiYesterday && apiYesterday.totalRevenue > 0) {
      return apiYesterday.totalRevenue * 1.1;
    }
    return Math.max(todaysSales * 1.5, 1000);
  }, [apiYesterday, todaysSales]);

  const salesProgress = useMemo(() =>
    Math.min(salesTarget > 0 ? todaysSales / salesTarget : 0, 1),
  [todaysSales, salesTarget]);

  const completionRate = useMemo(() => {
    const todaysOrders = orders.filter(o =>
      new Date(o.createdAt).getTime() >= todayStart
    );
    if (todaysOrders.length === 0) return 0;
    const completed = todaysOrders.filter(o => o.status === 'paid').length;
    return completed / todaysOrders.length;
  }, [orders, todayStart]);

  const loading = isLoading && orders.length === 0;

  const recentOrders = useMemo(() =>
    [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  [orders]);

  const handleViewFullOrder = useCallback((orderId: string) => {
    setSelectedOrder(null);
    (navigation as any).navigate('Orders', {
      screen: 'OrderDetails',
      params: { orderId },
    });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshOrders(), fetchApiKpis()]);
    setRefreshing(false);
  }, [refreshOrders, fetchApiKpis]);

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
    <View style={{ flexDirection: 'row', gap: sectionGap, alignItems: 'center' }}>
      <AppleStatusPill status="online" size="small" />
      <TouchableOpacity
        onPress={() => setShowActivityLogs(true)}
        testID="btn-activity-logs"
        style={{ padding: 6 }}
      >
        <MaterialIcons name="history" size={22} color={theme.colors.onSurface} />
      </TouchableOpacity>
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
      marginBottom: sectionGap,
      padding: isPhone ? 12 : 24,
      ...theme.shadows.md,
      elevation: 4
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: sectionGap }}>
        <MaterialIcons name="flash-on" size={20} color={theme.colors.primary} />
        <Text style={{
          fontSize: headingSize,
          fontWeight: '600',
          color: theme.colors.onSurface,
        }}>
          Quick Actions
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: isPhone ? 8 : 16, flexWrap: 'wrap' }}>
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
      title={`${getTimeGreeting()}, ${authState.user?.first_name || authState.user?.name || 'Manager'}`}
      subtitle={isPhone ? undefined : `${authState.restaurant?.name || 'Restaurant'} \u2022 ${new Date().toLocaleDateString()}`}
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
      <AppleCard layer="surfaceVariant" size="large" style={{ marginBottom: sectionGap }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: isPhone ? 8 : 16 }}>
          <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
          <Text style={{
            fontSize: headingSize,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>
            Key Metrics
          </Text>
        </View>
        <KPISection kpis={kpis} loading={loading} />
      </AppleCard>

      <AppleCard layer="surface" size="large" style={{ marginBottom: sectionGap }}>
        <ChartsSection
          restaurantId={restaurantId}
          loading={loading}
          offlineOrders={orders}
        />
      </AppleCard>

      {renderQuickActions()}

      <AppleCard layer="surfaceVariant" size="medium" style={{ marginBottom: sectionGap }}>
        <Text style={{
          fontSize: isPhone ? 13 : 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: isPhone ? 8 : 12
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

      <AppleCard layer="surface" size="large" style={{ marginBottom: sectionGap }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: isPhone ? 8 : 16 }}>
          <Text style={{ fontSize: isPhone ? 13 : 16, fontWeight: '600', color: theme.colors.onSurface }}>
            Recent Orders
          </Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Orders', { screen: 'OrderManagement' })}
            testID="btn-dashboard-view-all"
          >
            <Text style={{ fontSize: isPhone ? 12 : 14, color: theme.colors.primary, fontWeight: '500' }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        {recentOrders.length === 0 ? (
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: isPhone ? 12 : 14 }}>
            No orders yet today
          </Text>
        ) : (
          recentOrders.map((order, index) => (
            <View key={order.id}>
              <TouchableOpacity
                onPress={() => setSelectedOrder(order)}
                activeOpacity={0.7}
                testID={`btn-recent-order-${order.id}`}
                style={{ paddingVertical: 8 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.onSurface, fontSize: isPhone ? 13 : 15, fontWeight: '500' }}>
                    {order.tableName} ({order.orderNumber})
                  </Text>
                  <Text style={{ color: theme.colors.onSurface, fontSize: isPhone ? 13 : 14 }}>
                    {formatCurrency(order.totalAmount)}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: isPhone ? 11 : 13, marginTop: 2 }}>
                  {order.status.toUpperCase()} • {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              {index < recentOrders.length - 1 && (
                <View style={{ height: 1, backgroundColor: theme.colors.outline, marginHorizontal: -8 }} />
              )}
            </View>
          ))
        )}
      </AppleCard>

      <AppleCard layer="surface" size="medium">
        <Text style={{
          fontSize: isPhone ? 13 : 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: isPhone ? 8 : 16
        }}>
          Today's Progress
        </Text>
        <View style={{ gap: sectionGap }}>
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
      <OrderSummarySheet
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onViewFull={handleViewFullOrder}
      />
      <ActivityLogsSheet
        visible={showActivityLogs}
        onClose={() => setShowActivityLogs(false)}
      />
    </AppleDashboardPanel>
  );
};

export default DashboardScreen;
