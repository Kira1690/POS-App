/**
 * Staff Management Integration Dashboard
 * Implementation of wireframe 2.4 - Staff Management Integration Dashboard
 * Comprehensive staff operations management interface for managers and admins
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import {
  STAFF_MANAGEMENT_DASHBOARD_DATA,
  getStaffByStatus,
  getAlertsByType,
  getTasksByStatus,
  getAveragePerformance,
  getTopPerformers,
  getStaffNeedingAttention,
  type StaffManagementDashboardData,
  type StaffMember,
  type StaffAlert
} from '@/data/dashboard/staffManagementDashboard';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Staff Management theme colors - professional blue palette
const STAFF_MGMT_THEME = {
  primary: '#007bff',
  primaryDark: '#0056b3',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
};

interface StaffManagementDashboardProps {}

const StaffManagementDashboard: React.FC<StaffManagementDashboardProps> = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);

  // Get staff management data
  const staffData = useMemo(() => {
    return STAFF_MANAGEMENT_DASHBOARD_DATA;
  }, []);

  // Process data for display
  const processedData = useMemo(() => {
    const staffByStatus = getStaffByStatus(staffData.staff);
    const alertsByType = getAlertsByType(staffData.alerts);
    const tasksByStatus = getTasksByStatus(staffData.taskAssignments);
    const averagePerformance = getAveragePerformance(staffData.performanceMetrics);
    const topPerformers = getTopPerformers(staffData.staff, 3);
    const staffNeedingAttention = getStaffNeedingAttention(staffData.staff, staffData.alerts);

    return {
      staffByStatus,
      alertsByType,
      tasksByStatus,
      averagePerformance,
      topPerformers,
      staffNeedingAttention,
    };
  }, [staffData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual data refresh from API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleStaffMemberPress = useCallback((staff: StaffMember) => {
    setSelectedStaffMember(staff);
    // TODO: Navigate to detailed staff view or show modal
  }, []);

  const handleTaskAction = useCallback((taskId: string, action: string) => {
    Alert.alert(
      'Task Action',
      `${action} task ${taskId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => console.log(`${action} task ${taskId}`) }
      ]
    );
  }, []);

  const tabs = [
    { label: 'Overview', icon: 'dashboard', active: activeTab === 'Overview' },
    { label: 'Staff', icon: 'people', active: activeTab === 'Staff' },
    { label: 'Schedule', icon: 'schedule', active: activeTab === 'Schedule' },
    { label: 'Tasks', icon: 'assignment', active: activeTab === 'Tasks' },
    { label: 'Analytics', icon: 'analytics', active: activeTab === 'Analytics' },
  ];

  const quickActions = [
    { label: 'Add Staff', icon: 'person-add', color: STAFF_MGMT_THEME.success },
    { label: 'Create Schedule', icon: 'event', color: STAFF_MGMT_THEME.primary },
    { label: 'Assign Task', icon: 'assignment-add', color: STAFF_MGMT_THEME.info },
    { label: 'Send Message', icon: 'message', color: STAFF_MGMT_THEME.warning },
    { label: 'View Reports', icon: 'assessment', color: STAFF_MGMT_THEME.dark },
    { label: 'Settings', icon: 'settings', color: '#6c757d' },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="people" size={24} color={theme.colors.onPrimary} />
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          👥 {staffData.restaurant.name} - Staff Management Dashboard
        </Text>
      </View>

      <View style={styles.headerCenter}>
        <Text style={[styles.headerDate, { color: theme.colors.onPrimary }]}>
          📅 {staffData.currentDate} | 🕐 {staffData.currentTime}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <Text style={[styles.headerUser, { color: theme.colors.onPrimary }]}>
          👨‍💼 {staffData.restaurant.manager} (Manager)
        </Text>
        <TouchableOpacity style={styles.notificationBadge}>
          <MaterialIcons name="notifications" size={24} color={theme.colors.onPrimary} />
          {staffData.alerts.length > 0 && (
            <View style={[styles.badge, { backgroundColor: STAFF_MGMT_THEME.danger }]}>
              <Text style={styles.badgeText}>{staffData.alerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNavigationTabs = () => (
    <View style={[styles.navigationTabs, { backgroundColor: theme.colors.surface }]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.navTab,
            tab.active && { backgroundColor: STAFF_MGMT_THEME.primary }
          ]}
          onPress={() => setActiveTab(tab.label)}
        >
          <MaterialIcons
            name={tab.icon as any}
            size={20}
            color={tab.active ? 'white' : theme.colors.onSurfaceVariant}
          />
          <Text style={[
            styles.navTabText,
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
      {/* Total Staff Card */}
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>👥</Text>
          <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
            Total Staff
          </Text>
        </View>
        <Text style={[styles.metricValue, { color: STAFF_MGMT_THEME.primary }]}>
          {staffData.metrics.totalStaff}
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {staffData.metrics.onDutyNow} on duty now
        </Text>
      </View>

      {/* Attendance Card */}
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>✅</Text>
          <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
            Attendance
          </Text>
        </View>
        <Text style={[styles.metricValue, { color: STAFF_MGMT_THEME.success }]}>
          {((staffData.metrics.scheduledToday - staffData.metrics.absentToday) / staffData.metrics.scheduledToday * 100).toFixed(1)}%
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {staffData.metrics.absentToday} absent | {staffData.metrics.lateToday} late
        </Text>
      </View>

      {/* Performance Card */}
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>⭐</Text>
          <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
            Avg Rating
          </Text>
        </View>
        <Text style={[styles.metricValue, { color: STAFF_MGMT_THEME.warning }]}>
          {staffData.metrics.averageRating.toFixed(1)}/5.0
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {processedData.averagePerformance}% efficiency
        </Text>
      </View>

      {/* Labor Cost Card */}
      <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>💰</Text>
          <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
            Labor Cost
          </Text>
        </View>
        <Text style={[styles.metricValue, { color: STAFF_MGMT_THEME.info }]}>
          ${staffData.metrics.laborCost.toFixed(2)}
        </Text>
        <Text style={[styles.metricSubtext, { color: theme.colors.onSurfaceVariant }]}>
          {staffData.metrics.overtimeHours}h overtime
        </Text>
      </View>
    </View>
  );

  const renderStaffStatusGrid = () => (
    <View style={[styles.staffStatusContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Staff Status Overview
      </Text>

      <View style={styles.staffGrid}>
        {staffData.staff.map((staff) => (
          <TouchableOpacity
            key={staff.id}
            style={[
              styles.staffCard,
              {
                backgroundColor: getStatusColor(staff.status, 0.1),
                borderColor: getStatusColor(staff.status),
              }
            ]}
            onPress={() => handleStaffMemberPress(staff)}
          >
            <View style={styles.staffCardHeader}>
              <Text style={[styles.staffName, { color: theme.colors.onSurface }]}>
                {staff.name}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(staff.status) }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusIcon(staff.status)} {staff.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={[styles.staffRole, { color: theme.colors.onSurfaceVariant }]}>
              {staff.role} - {staff.department}
            </Text>

            <Text style={[styles.staffLocation, { color: theme.colors.onSurfaceVariant }]}>
              📍 {staff.location}
            </Text>

            <View style={styles.staffMetrics}>
              <Text style={[styles.staffMetric, { color: theme.colors.onSurface }]}>
                ⭐ {staff.performance.rating.toFixed(1)}
              </Text>
              <Text style={[styles.staffMetric, { color: theme.colors.onSurface }]}>
                🎯 {staff.performance.efficiency}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAlertsSection = () => (
    <View style={[styles.alertsContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.alertsHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Staff Alerts & Notifications
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: STAFF_MGMT_THEME.primary }]}>
            View All →
          </Text>
        </TouchableOpacity>
      </View>

      {staffData.alerts.slice(0, 4).map((alert) => (
        <View
          key={alert.id}
          style={[
            styles.alertItem,
            {
              backgroundColor: getAlertBackgroundColor(alert.severity),
              borderColor: getAlertColor(alert.severity),
            }
          ]}
        >
          <View style={styles.alertIndicator}>
            <Text style={styles.alertIcon}>{getAlertIcon(alert.severity)}</Text>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: theme.colors.onSurface }]}>
                {alert.title}
              </Text>
              <Text style={[styles.alertMessage, { color: theme.colors.onSurfaceVariant }]}>
                {alert.message}
              </Text>
              <Text style={[styles.alertTime, { color: theme.colors.onSurfaceVariant }]}>
                {alert.time} - {alert.employeeName}
              </Text>
            </View>
            {alert.actionRequired && (
              <TouchableOpacity style={[
                styles.alertAction,
                { backgroundColor: getAlertColor(alert.severity) }
              ]}>
                <Text style={styles.alertActionText}>Action</Text>
              </TouchableOpacity>
            )}
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

  const getStatusColor = (status: string, alpha: number = 1): string => {
    const colors: Record<string, string> = {
      'on-duty': STAFF_MGMT_THEME.success,
      'off-duty': '#6c757d',
      'break': STAFF_MGMT_THEME.info,
      'late': STAFF_MGMT_THEME.warning,
      'absent': STAFF_MGMT_THEME.danger,
    };
    const color = colors[status] || '#6c757d';
    return alpha < 1 ? `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : color;
  };

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      'on-duty': '✅',
      'off-duty': '⚪',
      'break': '☕',
      'late': '⏰',
      'absent': '❌',
    };
    return icons[status] || '❓';
  };

  const getAlertColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'info': STAFF_MGMT_THEME.info,
      'warning': STAFF_MGMT_THEME.warning,
      'urgent': STAFF_MGMT_THEME.danger,
      'critical': STAFF_MGMT_THEME.danger,
    };
    return colors[severity] || STAFF_MGMT_THEME.info;
  };

  const getAlertBackgroundColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'info': '#d1ecf1',
      'warning': '#fff3cd',
      'urgent': '#f8d7da',
      'critical': '#f5c6cb',
    };
    return colors[severity] || '#d1ecf1';
  };

  const getAlertIcon = (severity: string): string => {
    const icons: Record<string, string> = {
      'info': 'ℹ️',
      'warning': '⚠️',
      'urgent': '🚨',
      'critical': '🔥',
    };
    return icons[severity] || 'ℹ️';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            {renderStaffMetrics()}
            {renderStaffStatusGrid()}
            {renderAlertsSection()}
            {renderQuickActions()}
          </>
        );

      case 'Staff':
        return (
          <View style={[styles.tabContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Staff Directory & Management
            </Text>
            <Text style={[styles.tabMessage, { color: theme.colors.onSurfaceVariant }]}>
              Detailed staff management interface would be implemented here.
              Features: Staff profiles, hiring, performance reviews, payroll.
            </Text>
          </View>
        );

      case 'Schedule':
        return (
          <View style={[styles.tabContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Shift Scheduling & Management
            </Text>
            <Text style={[styles.tabMessage, { color: theme.colors.onSurfaceVariant }]}>
              Schedule management interface would be implemented here.
              Features: Weekly/monthly schedules, shift swapping, availability management.
            </Text>
          </View>
        );

      case 'Tasks':
        return (
          <View style={[styles.tabContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Task Assignment & Tracking
            </Text>
            <Text style={[styles.tabMessage, { color: theme.colors.onSurfaceVariant }]}>
              Task management interface would be implemented here.
              Features: Task creation, assignment, tracking, completion management.
            </Text>
          </View>
        );

      case 'Analytics':
        return (
          <View style={[styles.tabContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Staff Analytics & Reports
            </Text>
            <Text style={[styles.tabMessage, { color: theme.colors.onSurfaceVariant }]}>
              Analytics dashboard would be implemented here.
              Features: Performance trends, attendance reports, productivity metrics.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderNavigationTabs()}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
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
  navigationTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
  },
  navTabText: {
    ...typography.bodyMedium,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  metricsRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: isTablet ? 1 : undefined,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minHeight: 120,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  metricTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  metricValue: {
    ...typography.headlineLarge,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricSubtext: {
    ...typography.bodySmall,
  },
  staffStatusContainer: {
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
  staffGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  staffCard: {
    width: isTablet ? '31%' : '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  staffCardHeader: {
    marginBottom: spacing.sm,
  },
  staffName: {
    ...typography.titleSmall,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.bodySmall,
    color: 'white',
    fontWeight: '600',
    fontSize: 10,
  },
  staffRole: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  staffLocation: {
    ...typography.bodySmall,
    marginBottom: spacing.sm,
  },
  staffMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  staffMetric: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  alertsContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: spacing.xl,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  viewAllText: {
    ...typography.bodyMedium,
    textDecorationLine: 'underline',
  },
  alertItem: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  alertIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 16,
    marginTop: 2,
    marginRight: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  alertMessage: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  alertTime: {
    ...typography.bodySmall,
    fontSize: 11,
  },
  alertAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  alertActionText: {
    color: 'white',
    ...typography.bodySmall,
    fontWeight: '600',
  },
  quickActionsContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  tabContent: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: spacing.xl,
  },
  tabMessage: {
    ...typography.bodyMedium,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default StaffManagementDashboard;