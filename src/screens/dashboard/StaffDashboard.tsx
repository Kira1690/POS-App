/**
 * Staff Dashboard - Staff-focused interface with tasks and shift management
 * Matches wireframe 2.2 Staff Dashboard
 * Uses real data from UnifiedOrder and TableStats
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';
import { reportsApiService } from '@/services/api/ReportsApiService';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const formatCurrency = (amount: number) =>
  `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const StaffDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Server KPI state
  const [serverKpis, setServerKpis] = useState<{
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  } | null>(null);
  const [kpiSource, setKpiSource] = useState<'server' | 'cache'>('cache');
  const fetchingKpisRef = useRef(false);

  // Real data hooks
  const { orders, refreshOrders, isLoading } = useUnifiedOrder();
  const tableStats = useTableStats();

  // Fetch KPIs from server API (authoritative source)
  const fetchServerKpis = useCallback(async () => {
    if (fetchingKpisRef.current) return;
    fetchingKpisRef.current = true;
    try {
      const today = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
      const data = await reportsApiService.getDailySales(today);
      setServerKpis({
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        avgOrderValue: data.avgOrderValue,
      });
      setKpiSource('server');
    } catch {
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
  const localTodaysOrders = useMemo(() => {
    return orders.filter(o => o.status === 'paid' && new Date(o.createdAt).getTime() >= todayStart);
  }, [orders, todayStart]);

  const localTodaysOrderTotal = useMemo(() => {
    return localTodaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [localTodaysOrders]);

  const localAvgOrderValue = useMemo(() => {
    if (localTodaysOrders.length === 0) return 0;
    return localTodaysOrderTotal / localTodaysOrders.length;
  }, [localTodaysOrders, localTodaysOrderTotal]);

  // Use server KPIs when available, otherwise local
  const todaysOrderCount = serverKpis !== null ? serverKpis.totalOrders : localTodaysOrders.length;
  const todaysOrderTotal = serverKpis !== null ? serverKpis.totalRevenue : localTodaysOrderTotal;
  const avgOrderValue = serverKpis !== null ? serverKpis.avgOrderValue : localAvgOrderValue;

  const staffName = authState.user?.name || 'Staff';
  const staffEmployeeId = authState.user?.employeeId || '--';
  const staffRole = authState.user?.role || 'Staff';
  const restaurantName = authState.restaurant?.name || 'Restaurant';

  const loading = isLoading && orders.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshOrders(), fetchServerKpis()]);
    setRefreshing(false);
  }, [refreshOrders, fetchServerKpis]);

  const tabItems = [
    { label: 'Dashboard', icon: 'dashboard', active: activeTab === 'Dashboard' },
    { label: 'Orders', icon: 'receipt-long', active: activeTab === 'Orders' },
    { label: 'Tables', icon: 'table-restaurant', active: activeTab === 'Tables' },
    { label: 'POS', icon: 'point-of-sale', active: activeTab === 'POS' },
  ];

  const quickActions = useMemo(() => [
    { label: 'New Order', icon: 'add-circle', color: theme.colors.success },
    { label: 'View Tables', icon: 'table-restaurant', color: theme.colors.primary },
    { label: 'My Orders', icon: 'receipt-long', color: theme.colors.warning },
    { label: 'Call Manager', icon: 'support-agent', color: theme.colors.tertiary },
  ], [theme]);

  // Static tasks as prompts (no task tracking context exists)
  const tasks = useMemo(() => [
    {
      id: '1',
      priority: 'info' as const,
      message: 'Check assigned tables for new guests',
      color: theme.colors.info,
      bgColor: theme.colors.surfaceVariant,
    },
    {
      id: '2',
      priority: 'medium' as const,
      message: 'Clear completed orders from table view',
      color: theme.colors.warning,
      bgColor: theme.colors.surfaceVariant,
    },
    {
      id: '3',
      priority: 'low' as const,
      message: 'Review menu specials for today',
      color: theme.colors.success,
      bgColor: theme.colors.surfaceVariant,
    },
  ], [theme]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.success }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="restaurant" size={24} color={theme.colors.onPrimary} />
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          {restaurantName} - Staff Dashboard
        </Text>
      </View>

      <View style={styles.headerRight}>
        <Text style={[styles.headerUser, { color: theme.colors.onPrimary }]}>
          {staffName} ({staffEmployeeId}) | {staffRole}
        </Text>
      </View>
    </View>
  );

  const renderBottomTabs = () => (
    <View style={[styles.bottomTabs, { backgroundColor: theme.colors.surface }]}>
      {tabItems.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tabItem,
            tab.active && { backgroundColor: theme.colors.success }
          ]}
          onPress={() => setActiveTab(tab.label)}
        >
          <MaterialIcons
            name={tab.icon as keyof typeof MaterialIcons.glyphMap}
            size={24}
            color={tab.active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
          />
          <Text style={[
            styles.tabLabel,
            { color: tab.active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStaffMetrics = () => (
    <View style={styles.metricsRow}>
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
          My Shift
        </Text>
        <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
          Active
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          No shift tracking available
        </Text>
      </View>

      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
          My Orders Today
        </Text>
        <Text style={[styles.metricValue, { color: theme.colors.success }]}>
          {loading ? '--' : `${todaysOrderCount} Orders | ${formatCurrency(todaysOrderTotal)} Total`}
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          Average Order: {loading ? '--' : formatCurrency(avgOrderValue)}
          {' '}({kpiSource === 'cache' ? 'cached' : 'live'})
        </Text>
      </View>

      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
          Table Status
        </Text>
        <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
          {tableStats.total} Tables
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {tableStats.occupied} Occupied | {tableStats.available} Available
        </Text>
      </View>
    </View>
  );

  const renderTasksSection = () => (
    <View style={[styles.tasksContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Current Tasks & Reminders
      </Text>

      {tasks.map((task) => (
        <View
          key={task.id}
          style={[
            styles.taskItem,
            {
              backgroundColor: task.bgColor,
              borderColor: task.color,
            }
          ]}
        >
          <View style={styles.taskIndicator}>
            <View style={[styles.priorityDot, { backgroundColor: task.color }]} />
            <Text style={[styles.taskText, { color: theme.colors.onSurface }]}>
              {task.message}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={[styles.quickActionsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
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
            <MaterialIcons name={action.icon as keyof typeof MaterialIcons.glyphMap} size={24} color={theme.colors.onPrimary} />
            <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContent = () => (
    <ScrollView
      style={styles.mainContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {renderStaffMetrics()}
      {renderTasksSection()}
      {renderQuickActions()}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}

      <View style={styles.body}>
        {renderContent()}
      </View>

      {renderBottomTabs()}
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
  headerRight: {
    alignItems: 'flex-end',
  },
  headerUser: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: spacing.lg,
    marginBottom: 80,
  },
  metricsRow: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  metricCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 120,
  },
  metricTitle: {
    ...typography.titleLarge,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...typography.bodyLarge,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  metricSubtext: {
    ...typography.bodyMedium,
  },
  tasksContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.titleLarge,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  taskItem: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  taskIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  taskText: {
    ...typography.bodyMedium,
    flex: 1,
    lineHeight: 20,
  },
  quickActionsContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    minHeight: 60,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.titleMedium,
    fontWeight: '700',
    marginLeft: spacing.md,
  },
  bottomTabs: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    height: 80,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  tabLabel: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});

export default StaffDashboard;
