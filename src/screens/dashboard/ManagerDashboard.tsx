/**
 * Manager Dashboard - Executive overview with KPIs and analytics
 * Matches wireframe 2.1 Visual Dashboard Overview
 * Uses real data from UnifiedOrder, TableStats, and KitchenTickets
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { useTableStats } from '@/hooks/context/useTableSelectors';
import { useKitchenStats } from '@/context/unified-order/UnifiedOrderContext';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';
import { UNIFIED_ORDER_STATUS_LABELS, UnifiedOrder } from '@/types/unified-order.types';
import { SimpleLineChart } from './components/SimpleLineChart';
import OrderSummarySheet from './components/OrderSummarySheet';
import ActivityLogsSheet from './components/ActivityLogsSheet';
import { reportsApiService } from '@/services/api/ReportsApiService';


const formatCurrency = (amount: number) =>
  `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const getStatusColor = (status: string, theme: ReturnType<typeof useTheme>['theme']) => {
  const map: Record<string, string> = {
    confirmed: theme.colors.info,
    preparing: theme.colors.warning,
    ready: theme.colors.success,
    served: theme.colors.tertiary,
    paid: theme.colors.success,
    cancelled: theme.colors.error,
  };
  return map[status] ?? theme.colors.onSurfaceVariant;
};

const ManagerDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();
  const { isLargeTablet, isPhone, statValueSize } = useResponsive();

  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  // Server KPI state: when online, we use server-authoritative numbers
  const [serverKpis, setServerKpis] = useState<{
    totalRevenue: number;
    totalOrders: number;
    paidOrders: number;
  } | null>(null);
  const [kpiSource, setKpiSource] = useState<'server' | 'cache'>('cache');
  const fetchingKpisRef = useRef(false);

  // Real data hooks
  const { orders, activeOrders, refreshOrders, isLoading } = useUnifiedOrder();
  const tableStats = useTableStats();
  const kitchenStats = useKitchenStats();

  // Fetch KPIs from server API (authoritative source)
  const fetchServerKpis = useCallback(async () => {
    if (fetchingKpisRef.current) return;
    fetchingKpisRef.current = true;
    try {
      const today = new Date().toISOString().slice(0, 10); // UTC date YYYY-MM-DD
      const data = await reportsApiService.getDailySales(today);
      setServerKpis({
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        paidOrders: data.paidOrders,
      });
      setKpiSource('server');
    } catch {
      // Offline or error — fall back to local cache
      setKpiSource('cache');
    } finally {
      fetchingKpisRef.current = false;
    }
  }, []);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      refreshOrders();
      fetchServerKpis();
    }, [refreshOrders, fetchServerKpis])
  );

  // Refresh KPIs immediately when a payment is processed
  useEffect(() => {
    const unsubscribe = orderEventEmitter.subscribe('ORDER_PAID', () => {
      refreshOrders();
      fetchServerKpis();
    });
    return unsubscribe;
  }, [refreshOrders, fetchServerKpis]);

  // Compute today's start timestamp using UTC for consistency with server
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // Local fallback: compute from SQLite orders (paid, created today UTC)
  const localTodaysSales = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid' && new Date(o.createdAt).getTime() >= todayStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, todayStart]);

  const localTodaysOrderCount = useMemo(() => {
    return orders.filter(o => new Date(o.createdAt).getTime() >= todayStart).length;
  }, [orders, todayStart]);

  // Use server KPIs when available, otherwise fall back to local
  const todaysSales = serverKpis !== null ? serverKpis.totalRevenue : localTodaysSales;
  const todaysTotalOrders = serverKpis !== null ? serverKpis.totalOrders : localTodaysOrderCount;

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  // Sales chart: last 7 days of paid orders grouped by day (UTC boundaries)
  const salesChartData = useMemo(() => {
    const days: { label: string; value: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setUTCHours(23, 59, 59, 999);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const daySales = orders
        .filter(o => o.status === 'paid' &&
          new Date(o.createdAt).getTime() >= d.getTime() &&
          new Date(o.createdAt).getTime() <= dayEnd.getTime())
        .reduce((sum, o) => sum + o.totalAmount, 0);
      days.push({ label: dayLabel, value: daySales, date: dayLabel });
    }
    return days;
  }, [orders]);

  const currentDate = useMemo(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }), []);

  const currentTime = useMemo(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshOrders(), fetchServerKpis()]);
    setRefreshing(false);
  }, [refreshOrders, fetchServerKpis]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  const navigationItems = [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Orders', icon: 'receipt-long' },
    { label: 'Tables', icon: 'table-restaurant' },
    { label: 'Kitchen', icon: 'kitchen' },
    { label: 'Reports', icon: 'analytics' },
  ];

  const SIDEBAR_EXPANDED = 250;
  const SIDEBAR_COLLAPSED = 64;

  const quickActions = useMemo(() => [
    { label: 'New Order', icon: 'add-circle', color: theme.colors.primary },
    { label: 'View Tables', icon: 'table-restaurant', color: theme.colors.success },
    { label: 'Kitchen', icon: 'kitchen', color: theme.colors.warning },
    { label: 'Reports', icon: 'analytics', color: theme.colors.tertiary },
  ], [theme]);

  const loading = isLoading && orders.length === 0;

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="restaurant" size={24} color={theme.colors.onPrimary} />
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          {authState.restaurant?.name || 'Restaurant'} - Dashboard
        </Text>
      </View>

      <View style={styles.headerCenter}>
        <Text style={[styles.headerDate, { color: theme.colors.onPrimary }]}>
          {currentDate} | {currentTime}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <Text style={[styles.headerUser, { color: theme.colors.onPrimary }]}>
          {authState.user?.name} (Manager)
        </Text>
        <TouchableOpacity style={styles.notificationBadge}>
          <MaterialIcons name="notifications" size={24} color={theme.colors.onPrimary} />
          {kitchenStats.overdueCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
                {kitchenStats.overdueCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSidebar = () => {
    const collapsed = !sidebarVisible;
    return (
      <View style={[
        styles.sidebar,
        {
          backgroundColor: theme.colors.surface,
          width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
          borderRightColor: theme.colors.outline,
        }
      ]}>
        {/* Toggle button */}
        <TouchableOpacity
          onPress={toggleSidebar}
          style={[
            styles.sidebarToggle,
            collapsed && styles.sidebarToggleCollapsed,
            { borderBottomColor: theme.colors.outline }
          ]}
        >
          <MaterialIcons
            name={collapsed ? 'chevron-right' : 'chevron-left'}
            size={22}
            color={theme.colors.onSurfaceVariant}
          />
          {!collapsed && (
            <Text style={[styles.sidebarToggleText, { color: theme.colors.onSurfaceVariant }]}>
              Collapse
            </Text>
          )}
        </TouchableOpacity>

        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.navItem,
              item.active && { backgroundColor: theme.colors.primary },
              collapsed && styles.navItemCollapsed,
            ]}
          >
            <MaterialIcons
              name={item.icon as keyof typeof MaterialIcons.glyphMap}
              size={22}
              color={item.active ? theme.colors.onPrimary : theme.colors.onSurface}
            />
            {!collapsed && (
              <Text style={[
                styles.navText,
                { color: item.active ? theme.colors.onPrimary : theme.colors.onSurface }
              ]}>
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStatsCards = () => {
    const cardStyle = {
      backgroundColor: theme.colors.surface,
      flex: isPhone ? undefined : 1,
      width: isPhone ? '48%' as const : undefined,
    };
    return (
      <View style={[styles.statsRow, {
        flexDirection: 'row',
        flexWrap: isPhone ? 'wrap' : 'nowrap',
        gap: isPhone ? 8 : undefined,
      }]}>
        <View style={[styles.statsCard, cardStyle]}>
          <View style={styles.statsHeader}>
            <MaterialIcons name="attach-money" size={isPhone ? 18 : 24} color={theme.colors.success} />
            <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
              Today's Sales
            </Text>
          </View>
          <Text style={[styles.statsValue, { color: theme.colors.success, fontSize: statValueSize }]}>
            {loading ? '--' : formatCurrency(todaysSales)}
          </Text>
          <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
            {kpiSource === 'cache' ? 'From local cache' : 'Live from server'}
          </Text>
        </View>

        <View style={[styles.statsCard, cardStyle]}>
          <View style={styles.statsHeader}>
            <MaterialIcons name="receipt-long" size={isPhone ? 18 : 24} color={theme.colors.tertiary} />
            <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
              Active Orders
            </Text>
          </View>
          <Text style={[styles.statsValue, { color: theme.colors.tertiary, fontSize: statValueSize }]}>
            {loading ? '--' : activeOrders.length}
          </Text>
          <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
            {todaysTotalOrders} total today
          </Text>
        </View>

        <View style={[styles.statsCard, cardStyle]}>
          <View style={styles.statsHeader}>
            <MaterialIcons name="table-restaurant" size={isPhone ? 18 : 24} color={theme.colors.warning} />
            <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
              Table Occupancy
            </Text>
          </View>
          <Text style={[styles.statsValue, { color: theme.colors.warning, fontSize: statValueSize }]}>
            {tableStats.occupied}/{tableStats.total}
          </Text>
          <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
            {tableStats.occupancyRate}% occupied
          </Text>
        </View>

        <View style={[styles.statsCard, cardStyle]}>
          <View style={styles.statsHeader}>
            <MaterialIcons name="group" size={isPhone ? 18 : 24} color={theme.colors.tertiary} />
            <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
              Staff On Duty
            </Text>
          </View>
          <Text style={[styles.statsValue, { color: theme.colors.tertiary, fontSize: statValueSize }]}>
            --
          </Text>
          <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
            No staff tracking available
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => (
    <ScrollView
      style={styles.mainContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {renderStatsCards()}

      <View style={[styles.middleRow, { flexDirection: isLargeTablet ? 'row' : 'column' }]}>
        <View style={[styles.chartContainer, { backgroundColor: 'transparent', flex: isLargeTablet ? 2 : undefined }]}>
          <SimpleLineChart
            data={salesChartData}
            title="Sales Trend (Last 7 Days)"
            height={isPhone ? 180 : 320}
            accentColor={theme.colors.tertiary}
          />
        </View>

        <View style={[styles.ordersContainer, { backgroundColor: theme.colors.surface, flex: isLargeTablet ? 1 : undefined }]}>
          <View style={styles.ordersHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Orders
            </Text>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('Orders')}
              testID="btn-dashboard-view-all"
            >
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt" size={40} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                No orders yet today
              </Text>
            </View>
          ) : (
            recentOrders.map((order, index) => (
              <View key={order.id}>
                <TouchableOpacity
                  onPress={() => setSelectedOrder(order)}
                  activeOpacity={0.7}
                  testID={`btn-recent-order-${order.id}`}
                >
                  <View style={[styles.orderItem, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.orderContent}>
                      <View style={styles.orderHeader}>
                        <Text style={[styles.orderTitle, { color: theme.colors.onSurface }]}>
                          {order.tableName} ({order.orderNumber})
                        </Text>
                        <Text style={[styles.orderAmount, { color: theme.colors.onSurface }]}>
                          {formatCurrency(order.totalAmount)}
                        </Text>
                      </View>
                      <View style={styles.orderStatus}>
                        <View
                          style={[
                            styles.statusIndicator,
                            { backgroundColor: getStatusColor(order.status, theme) }
                          ]}
                        />
                        <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                          {UNIFIED_ORDER_STATUS_LABELS[order.status]}
                        </Text>
                        <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
                          {new Date(order.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                {index < recentOrders.length - 1 && (
                  <View style={[styles.orderSeparator, { backgroundColor: theme.colors.outline }]} />
                )}
              </View>
            ))
          )}
        </View>
      </View>

      <View style={[styles.quickActionsContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Text>
          <TouchableOpacity
            onPress={() => setShowActivityLogs(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 }}
            testID="btn-activity-logs"
          >
            <MaterialIcons name="history" size={20} color={theme.colors.primary} />
            <Text style={{ ...typography.caption, color: theme.colors.primary }}>Activity Log</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                { backgroundColor: action.color }
              ]}
            >
              <MaterialIcons name={action.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={theme.colors.onPrimary} />
              <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const handleViewFullOrder = useCallback((orderId: string) => {
    setSelectedOrder(null);
    (navigation as any).navigate('Orders', {
      screen: 'OrderDetails',
      params: { orderId },
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}

      <View style={styles.body}>
        {!isPhone && renderSidebar()}
        {renderContent()}
      </View>

      <OrderSummarySheet
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onViewFull={handleViewFullOrder}
      />

      <ActivityLogsSheet
        visible={showActivityLogs}
        onClose={() => setShowActivityLogs(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    height: 80,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...typography.headlineSmall,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerDate: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerUser: {
    ...typography.bodyMedium,
    marginRight: spacing.md,
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    paddingTop: spacing.sm,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  sidebarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.xs,
  },
  sidebarToggleCollapsed: {
    justifyContent: 'center',
  },
  sidebarToggleText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: spacing.xs,
  },
  navText: {
    ...typography.bodyMedium,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    padding: spacing.lg,
  },
  statsRow: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 120,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  statsValue: {
    ...typography.headlineLarge,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statsSubtext: {
    ...typography.bodySmall,
  },
  middleRow: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  chartContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 350,
  },
  ordersContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 350,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleLarge,
    fontWeight: '700',
  },
  viewAllText: {
    ...typography.bodyMedium,
    textDecorationLine: 'underline',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.bodyMedium,
    marginTop: spacing.md,
  },
  orderItem: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: 0,
  },
  orderContent: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    flex: 1,
  },
  orderAmount: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.bodySmall,
    fontSize: 13,
  },
  orderTime: {
    ...typography.bodySmall,
    fontSize: 13,
  },
  orderSeparator: {
    height: 0.5,
    marginHorizontal: spacing.md,
  },
  quickActionsContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 120,
    minHeight: 50,
  },
  actionText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default ManagerDashboard;
