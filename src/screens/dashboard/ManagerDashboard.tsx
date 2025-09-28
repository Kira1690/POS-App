/**
 * Manager Dashboard - Executive overview with KPIs and analytics
 * Matches wireframe 2.1 Visual Dashboard Overview
 * Under 300 lines, focused on layout composition
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import {
  getManagerDashboardData,
  getSalesGrowthPercentage,
  getOrderCompletionRate,
  type ManagerDashboardData
} from '@/data/dashboard/managerDashboard';
import { WEEKLY_SALES_DATA, CATEGORY_SALES_DATA } from '@/data/charts/salesChartData';
import { SimpleLineChart } from './components/SimpleLineChart';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface ManagerDashboardProps {}

const ManagerDashboard: React.FC<ManagerDashboardProps> = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(isTablet);

  // Get centralized dashboard data
  const dashboardData = useMemo(() => {
    const data = getManagerDashboardData(authState.restaurant?.id);

    // Update with current user info
    return {
      ...data,
      restaurant: {
        ...data.restaurant,
        name: authState.restaurant?.name || data.restaurant.name,
      },
      user: authState.user,
      currentDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      currentTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
  }, [authState]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  // Navigation items for sidebar
  const navigationItems = [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Orders', icon: 'receipt-long' },
    { label: 'Tables', icon: 'table-restaurant' },
    { label: 'Kitchen', icon: 'kitchen' },
    { label: 'Reports', icon: 'analytics' },
  ];

  // Use centralized quick actions data
  const quickActions = useMemo(() => dashboardData.quickActions, [dashboardData]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="restaurant" size={24} color={theme.colors.onPrimary} />
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          🍽️ {dashboardData.restaurant.name} - Dashboard
        </Text>
      </View>
      
      <View style={styles.headerCenter}>
        <Text style={[styles.headerDate, { color: theme.colors.onPrimary }]}>
          📅 {dashboardData.currentDate} | 🕐 {dashboardData.currentTime}
        </Text>
      </View>
      
      <View style={styles.headerRight}>
        <Text style={[styles.headerUser, { color: theme.colors.onPrimary }]}>
          👨‍💼 {dashboardData.user?.name} (Manager)
        </Text>
        <TouchableOpacity style={styles.notificationBadge}>
          <MaterialIcons name="notifications" size={24} color={theme.colors.onPrimary} />
          {dashboardData.notifications > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.badgeText}>{dashboardData.notifications}</Text>
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
            name={item.icon as any} 
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
      {/* Today's Sales Card */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsIcon}>💰</Text>
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Today's Sales
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.success }]}>
          {dashboardData.stats.todaysSales.value}
        </Text>
        <Text style={[styles.statsChange, { color: theme.colors.success }]}>
          ↗️ {dashboardData.stats.todaysSales.change} from yesterday
        </Text>
      </View>

      {/* Active Orders Card */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsIcon}>📋</Text>
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Active Orders
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.tertiary }]}>
          {dashboardData.stats.activeOrders.value}
        </Text>
        <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {dashboardData.stats.activeOrders.breakdown}
        </Text>
      </View>

      {/* Table Occupancy Card */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsIcon}>🪑</Text>
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Table Occupancy
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.warning }]}>
          {dashboardData.stats.tableOccupancy.value}
        </Text>
        <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {dashboardData.stats.tableOccupancy.percentage}
        </Text>
      </View>

      {/* Staff On Duty Card */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsIcon}>👥</Text>
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Staff On Duty
          </Text>
        </View>
        <Text style={[styles.statsValue, { color: theme.colors.tertiary }]}>
          {dashboardData.stats.staffOnDuty.value}
        </Text>
        <Text style={[styles.statsSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {dashboardData.stats.staffOnDuty.breakdown}
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
      {/* Stats Cards */}
      {renderStatsCards()}
      
      {/* Charts and Orders Row */}
      <View style={styles.middleRow}>
        {/* Sales Chart */}
        <View style={[styles.chartContainer, { backgroundColor: 'transparent' }]}>
          <SimpleLineChart
            data={WEEKLY_SALES_DATA.map(day => ({
              label: day.date,
              value: day.sales,
              date: day.date,
            }))}
            title="Sales Trend (Last 7 Days)"
            height={320}
            accentColor={theme.colors.tertiary}
          />
        </View>

        {/* Recent Orders */}
        <View style={[styles.ordersContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.ordersHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Orders
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.recentOrders.map((order, index) => (
            <View key={order.id}>
              <View style={[styles.orderItem, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.orderContent}>
                  <View style={styles.orderHeader}>
                    <Text style={[styles.orderTitle, { color: theme.colors.onSurface }]}>
                      {order.table}
                    </Text>
                    <Text style={[styles.orderAmount, { color: theme.colors.onSurface }]}>
                      {order.amount}
                    </Text>
                  </View>
                  <View style={styles.orderStatus}>
                    <View
                      style={[
                        styles.statusIndicator,
                        { backgroundColor: order.statusColor }
                      ]}
                    />
                    <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                      {order.status}
                    </Text>
                    <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
                      • {order.time}
                    </Text>
                  </View>
                </View>
              </View>
              {index < dashboardData.recentOrders.length - 1 && (
                <View style={[styles.orderSeparator, { backgroundColor: theme.colors.outline }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
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
              <MaterialIcons name={action.icon as any} size={20} color="white" />
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Breakdown - Temporarily removed */}
      <View style={[styles.categoryChartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, textAlign: 'center' }]}>
          📊 Category Analytics
        </Text>
        <Text style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: theme.spacing.md }]}>
          Advanced category breakdown chart will be restored after resolving Metro bundler compatibility.
        </Text>
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
    color: 'white',
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
    borderRightColor: 'rgba(0,0,0,0.1)',
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
    borderColor: 'rgba(0,0,0,0.1)',
    minHeight: 150,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  statsTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  statsValue: {
    ...typography.headlineLarge,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statsChange: {
    ...typography.bodySmall,
    fontWeight: '500',
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
    borderColor: 'rgba(0,0,0,0.1)',
    minHeight: 350,
  },
  ordersContainer: {
    flex: isTablet ? 1 : undefined,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodyMedium,
    textAlign: 'center',
    lineHeight: 22,
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
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: spacing.xl,
  },
  categoryChartContainer: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  placeholderText: {
    ...typography.bodyMedium,
    textAlign: 'center',
    lineHeight: 22,
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
    color: 'white',
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