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

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface ManagerDashboardProps {}

const ManagerDashboard: React.FC<ManagerDashboardProps> = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(isTablet);

  // Mock data - will be replaced with real data from services
  const dashboardData = useMemo(() => ({
    restaurant: authState.restaurant?.name || 'The Food Corner',
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
    user: authState.user,
    stats: {
      todaysSales: { value: '$2,847.50', change: '+12.5%', trend: 'up' },
      activeOrders: { value: '23', breakdown: '12 Dine-in | 8 Takeaway | 3 Delivery' },
      tableOccupancy: { value: '16/25', percentage: '64% occupancy rate' },
      staffOnDuty: { value: '8', breakdown: '5 Servers | 2 Kitchen | 1 Manager' }
    },
    recentOrders: [
      { id: 1, table: 'Table 12', amount: '$45.50', status: 'Preparing', statusColor: '#ffc107' },
      { id: 2, table: 'Takeaway', amount: '$28.75', status: 'Ready', statusColor: '#28a745' },
      { id: 3, table: 'Table 8', amount: '$67.25', status: 'Pending', statusColor: '#dc3545' },
      { id: 4, table: 'Delivery', amount: '$52.00', status: 'Preparing', statusColor: '#ffc107' },
      { id: 5, table: 'Table 15', amount: '$89.50', status: 'Ready', statusColor: '#28a745' },
    ],
    notifications: 5
  }), [authState]);

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
    { label: 'Menu', icon: 'restaurant-menu' },
    { label: 'Reports', icon: 'analytics' },
    { label: 'Settings', icon: 'settings' },
  ];

  const quickActions = [
    { label: 'New Order', icon: 'add', color: '#28a745' },
    { label: 'View Tables', icon: 'table-restaurant', color: '#007bff' },
    { label: 'Kitchen Display', icon: 'kitchen', color: '#fd7e14' },
    { label: 'Daily Report', icon: 'assessment', color: '#6610f2' },
    { label: 'Menu Management', icon: 'restaurant-menu', color: '#20c997' },
    { label: 'Settings', icon: 'settings', color: '#6c757d' },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="restaurant" size={24} color={theme.colors.onPrimary} />
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          🍽️ {dashboardData.restaurant} - Dashboard
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
            <View style={[styles.badge, { backgroundColor: '#dc3545' }]}>
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
        <Text style={[styles.statsValue, { color: '#28a745' }]}>
          {dashboardData.stats.todaysSales.value}
        </Text>
        <Text style={[styles.statsChange, { color: '#28a745' }]}>
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
        <Text style={[styles.statsValue, { color: '#007bff' }]}>
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
        <Text style={[styles.statsValue, { color: '#fd7e14' }]}>
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
        <Text style={[styles.statsValue, { color: '#6610f2' }]}>
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
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Sales Trend (Last 7 Days)
          </Text>
          <View style={styles.chartPlaceholder}>
            <Text style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant }]}>
              📊 Sales Chart Visualization{'\n\n'}Interactive chart showing:{'\n'}• Daily sales comparison{'\n'}• Revenue trends{'\n'}• Peak hours analysis{'\n'}• Order volume patterns
            </Text>
          </View>
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
          
          {dashboardData.recentOrders.map((order) => (
            <View 
              key={order.id} 
              style={[
                styles.orderItem, 
                { backgroundColor: `${order.statusColor}20`, borderColor: order.statusColor }
              ]}
            >
              <Text style={[styles.orderText, { color: theme.colors.onSurface }]}>
                {order.table} | {order.amount} | 🟡 {order.status}
              </Text>
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
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  orderText: {
    ...typography.bodyMedium,
  },
  quickActionsContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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