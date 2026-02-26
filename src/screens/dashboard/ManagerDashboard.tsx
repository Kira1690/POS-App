/**
 * Manager Dashboard - Executive overview with KPIs and analytics
 * Matches wireframe 2.1 Visual Dashboard Overview
 * Uses real data from UnifiedOrder, TableStats, and KitchenTickets
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { useTableStats } from '@/hooks/context/useTableSelectors';
import { useKitchenTickets } from '@/context/kitchen/EnhancedKitchenContext';
import { UNIFIED_ORDER_STATUS_LABELS } from '@/types/unified-order.types';
import { SimpleLineChart } from './components/SimpleLineChart';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

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

  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(isTablet);

  // Real data hooks
  const { orders, activeOrders, refreshOrders, isLoading } = useUnifiedOrder();
  const tableStats = useTableStats();
  const { stats: kitchenStats } = useKitchenTickets();

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

  // Compute dashboard metrics from real data
  const todaysSales = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid' && new Date(o.createdAt).getTime() >= todayStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, todayStart]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  // Sales chart: last 7 days of paid orders grouped by day
  const salesChartData = useMemo(() => {
    const days: { label: string; value: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
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
    await refreshOrders();
    setRefreshing(false);
  }, [refreshOrders]);

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

  const renderSidebar = () => (
    <View style={[styles.sidebar, { backgroundColor: theme.colors.surface }]}>
      {navigationItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.navItem,
            item.active && { backgroundColor: theme.colors.primary },
            { borderColor: theme.colors.outline }
          ]}
        >
          <MaterialIcons
            name={item.icon as keyof typeof MaterialIcons.glyphMap}
            size={20}
            color={item.active ? theme.colors.onPrimary : theme.colors.onSurface}
          />
          <Text style={[
            styles.navText,
            { color: item.active ? theme.colors.onPrimary : theme.colors.onSurface }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsRow}>
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <MaterialIcons name="attach-money" size={24} color={theme.colors.success} />
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Today's Sales
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.success }]}>
          {loading ? '--' : formatCurrency(todaysSales)}
        </Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <MaterialIcons name="receipt-long" size={24} color={theme.colors.tertiary} />
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Active Orders
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.tertiary }]}>
          {loading ? '--' : activeOrders.length}
        </Text>
        <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {orders.length} total today
        </Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <MaterialIcons name="table-restaurant" size={24} color={theme.colors.warning} />
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Table Occupancy
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.warning }]}>
          {tableStats.occupied}/{tableStats.total}
        </Text>
        <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {tableStats.occupancyRate}% occupied
        </Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <MaterialIcons name="group" size={24} color={theme.colors.tertiary} />
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Staff On Duty
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.tertiary }]}>
          --
        </Text>
        <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
          No staff tracking available
        </Text>
      </View>
    </View>
  );

  const renderContent = () => (
    <ScrollView
      style={styles.mainContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {renderStatsCards()}

      <View style={styles.middleRow}>
        <View style={[styles.chartContainer, { backgroundColor: 'transparent' }]}>
          <SimpleLineChart
            data={salesChartData}
            title="Sales Trend (Last 7 Days)"
            height={320}
            accentColor={theme.colors.tertiary}
          />
        </View>

        <View style={[styles.ordersContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.ordersHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Orders
            </Text>
            <TouchableOpacity>
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
                {index < recentOrders.length - 1 && (
                  <View style={[styles.orderSeparator, { backgroundColor: theme.colors.outline }]} />
                )}
              </View>
            ))
          )}
        </View>
      </View>

      <View style={[styles.quickActionsContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Quick Actions
        </Text>
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}

      <View style={styles.body}>
        {(sidebarVisible || isTablet) && renderSidebar()}
        {renderContent()}
      </View>

      {!isTablet && (
        <TouchableOpacity
          style={[styles.menuToggle, { backgroundColor: theme.colors.primary }]}
          onPress={toggleSidebar}
        >
          <MaterialIcons name="menu" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      )}
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
    width: 250,
    padding: spacing.md,
    borderRightWidth: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
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
    flexDirection: isTablet ? 'row' : 'column',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statsCard: {
    flex: isTablet ? 1 : undefined,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 150,
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
    flexDirection: isTablet ? 'row' : 'column',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  chartContainer: {
    flex: isTablet ? 2 : 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 350,
  },
  ordersContainer: {
    flex: isTablet ? 1 : undefined,
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
    minWidth: isTablet ? 140 : 120,
    minHeight: 50,
  },
  actionText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  menuToggle: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default ManagerDashboard;
