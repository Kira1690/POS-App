/**
 * Staff Dashboard - Staff-focused interface with tasks and shift management
 * Matches wireframe 2.2 Staff Dashboard
 * Under 300 lines, focused on staff-specific functionality
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
  getStaffDashboardData,
  getTasksByPriority,
  getShiftProgress,
  getEfficiencyBadge,
  type StaffDashboardData
} from '@/data/dashboard/staffDashboard';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Staff theme colors
const STAFF_THEME = {
  primary: '#28a745',
  primaryDark: '#1e7e34',
  light: '#d4edda',
  white: '#ffffff',
};

interface StaffDashboardProps {}

const StaffDashboard: React.FC<StaffDashboardProps> = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Get centralized staff dashboard data
  const staffData = useMemo(() => {
    // Use employee ID from auth state, fallback to EMP001 for demo
    const employeeId = authState.user?.employeeId || 'EMP001';
    const data = getStaffDashboardData(employeeId);

    // Update with current user info from auth state
    return {
      ...data,
      restaurant: {
        ...data.restaurant,
        name: authState.restaurant?.name || data.restaurant.name,
      },
      staff: {
        ...data.staff,
        name: authState.user?.name || data.staff.name,
        employeeId: authState.user?.employeeId || data.staff.employeeId,
      },
    };
  }, [authState]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const tabItems = [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Orders', icon: 'receipt-long' },
    { label: 'Tables', icon: 'table-restaurant' },
    { label: 'POS', icon: 'point-of-sale' },
  ];

  // Use centralized quick actions data
  const quickActions = useMemo(() => staffData.quickActions, [staffData]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: STAFF_THEME.primary }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="restaurant" size={24} color="white" />
        <Text style={styles.headerTitle}>
          🍽️ {staffData.restaurant.name} - Staff Dashboard
        </Text>
      </View>
      
      <View style={styles.headerRight}>
        <Text style={styles.headerUser}>
          👥 {staffData.staff.name} ({staffData.staff.employeeId}) | {staffData.staff.role}
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
            tab.active && { backgroundColor: STAFF_THEME.primary }
          ]}
          onPress={() => setActiveTab(tab.label)}
        >
          <MaterialIcons 
            name={tab.icon as any} 
            size={24} 
            color={tab.active ? 'white' : theme.colors.onSurfaceVariant} 
          />
          <Text style={[
            styles.tabLabel,
            { color: tab.active ? 'white' : theme.colors.onSurfaceVariant }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStaffMetrics = () => (
    <View style={styles.metricsRow}>
      {/* My Shift Card */}
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
          My Shift
        </Text>
        <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
          Started: {staffData.shift.startTime} | Duration: {staffData.shift.duration}
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          Scheduled End: {staffData.shift.scheduledEnd}
        </Text>
      </View>

      {/* My Orders Card */}
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
          My Orders Today
        </Text>
        <Text style={[styles.metricValue, { color: STAFF_THEME.primary }]}>
          {staffData.myOrders.count} Orders | {staffData.myOrders.totalValue} Total
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          Average Order: {staffData.myOrders.averageOrder}
        </Text>
      </View>

      {/* Assigned Tables Card */}
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
          Assigned Tables
        </Text>
        <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
          Tables: {staffData.assignedTables.tables.join(', ')}
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {staffData.assignedTables.occupied} Occupied | {staffData.assignedTables.available} Available
        </Text>
      </View>
    </View>
  );

  const renderTasksSection = () => (
    <View style={[styles.tasksContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Current Tasks & Notifications
      </Text>
      
      {staffData.tasks.map((task) => (
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
              {task.priority === 'urgent' && '🔴 URGENT: '}
              {task.priority === 'medium' && '🟡 '}
              {task.priority === 'low' && '🟢 '}
              {task.priority === 'info' && '🔵 '}
              {task.message}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderQuickActions = () => (
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
            <MaterialIcons name={action.icon as any} size={24} color="white" />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPerformanceIndicator = () => (
    <View style={styles.performanceContainer}>
      <Text style={[styles.performanceText, { color: STAFF_THEME.primary }]}>
        ⭐ Today's Performance: {staffData.performance.status} ({staffData.performance.rating})
      </Text>
    </View>
  );

  const renderContent = () => (
    <ScrollView 
      style={styles.mainContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Staff Metrics Cards */}
      {renderStaffMetrics()}
      
      {/* Performance Indicator */}
      {renderPerformanceIndicator()}
      
      {/* Tasks Section */}
      {renderTasksSection()}
      
      {/* Quick Actions */}
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
    color: 'white',
    marginLeft: spacing.sm,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerUser: {
    ...typography.bodyMedium,
    color: 'white',
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: spacing.lg,
    marginBottom: 80, // Space for bottom tabs
  },
  metricsRow: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  metricCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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
  performanceContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  performanceText: {
    ...typography.titleMedium,
    fontWeight: '700',
  },
  tasksContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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
    borderColor: 'rgba(0,0,0,0.1)',
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
    color: 'white',
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