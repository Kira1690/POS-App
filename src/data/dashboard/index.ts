/**
 * Dashboard Data - Clean exports for all dashboard mock data
 * Centralized data management for all dashboard types
 */

// Manager Dashboard exports
export {
  MANAGER_DASHBOARD_DATA,
  getManagerDashboardData,
  getSalesGrowthPercentage,
  getOrderCompletionRate,
  type ManagerDashboardData,
  type DashboardStats,
  type RecentOrder,
  type QuickAction,
  type SalesChartData,
} from './managerDashboard';

// Staff Dashboard exports
export {
  STAFF_DASHBOARD_DATA,
  DEFAULT_STAFF_DATA,
  getStaffDashboardData,
  getTasksByPriority,
  getShiftProgress,
  getEfficiencyBadge,
  type StaffDashboardData,
  type StaffInfo,
  type ShiftInfo,
  type StaffPerformance,
  type OrderMetrics,
  type AssignedTables,
  type Task,
  type StaffQuickAction,
} from './staffDashboard';

// Kitchen Dashboard exports
export {
  KITCHEN_DASHBOARD_DATA,
  DEFAULT_KITCHEN_DATA,
  getKitchenDashboardData,
  getOrdersByStatus,
  getStationEfficiency,
  getOverdueOrders,
  getKitchenAlerts,
  type KitchenDashboardData,
  type ChefInfo,
  type KitchenStation,
  type PriorityOrder,
  type ActiveOrder,
  type KitchenControl,
  type KitchenMetrics,
} from './kitchenDashboard';

// Staff Management Dashboard exports
export {
  STAFF_MANAGEMENT_DASHBOARD_DATA,
  getStaffManagementDashboardData,
  getStaffByStatus,
  getAlertsByType,
  getTasksByStatus,
  getAveragePerformance,
  getAttendanceRate,
  getTopPerformers,
  getStaffNeedingAttention,
  type StaffManagementDashboardData,
  type StaffMember,
  type ShiftSchedule,
  type TaskAssignment,
  type PerformanceMetric,
  type StaffAlert,
  type StaffCommunication,
  type StaffManagementMetrics,
  type TrainingRecord,
} from './staffManagementDashboard';

// Common dashboard utilities
export const getDashboardDataByType = (
  dashboardType: 'manager' | 'staff' | 'kitchen' | 'staff-management',
  identifier?: string
) => {
  switch (dashboardType) {
    case 'manager':
      return getManagerDashboardData(identifier);

    case 'staff':
      return getStaffDashboardData(identifier || 'EMP001');

    case 'kitchen':
      return getKitchenDashboardData(identifier || 'CHEF001');

    case 'staff-management':
      return getStaffManagementDashboardData(identifier);

    default:
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
  }
};

// Dashboard type guards
export const isManagerDashboardData = (data: any): data is ManagerDashboardData => {
  return data && typeof data.stats === 'object' && data.stats.todaysSales;
};

export const isStaffDashboardData = (data: any): data is StaffDashboardData => {
  return data && typeof data.staff === 'object' && data.staff.employeeId;
};

export const isKitchenDashboardData = (data: any): data is KitchenDashboardData => {
  return data && typeof data.chef === 'object' && Array.isArray(data.stations);
};

export const isStaffManagementDashboardData = (data: any): data is StaffManagementDashboardData => {
  return data && Array.isArray(data.staff) && typeof data.metrics === 'object';
};

// Dashboard refresh utilities
export const refreshDashboardData = (dashboardType: string) => {
  // In a real app, this would trigger API calls to refresh data
  // For now, it just returns fresh copies of the mock data
  return getDashboardDataByType(dashboardType as any);
};

// Data validation utilities
export const validateDashboardData = (data: any, type: string): boolean => {
  try {
    switch (type) {
      case 'manager':
        return isManagerDashboardData(data);
      case 'staff':
        return isStaffDashboardData(data);
      case 'kitchen':
        return isKitchenDashboardData(data);
      case 'staff-management':
        return isStaffManagementDashboardData(data);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Dashboard data validation failed for type ${type}:`, error);
    return false;
  }
};

// Export all dashboard data for easy access
export const ALL_DASHBOARD_DATA = {
  manager: MANAGER_DASHBOARD_DATA,
  staff: STAFF_DASHBOARD_DATA,
  kitchen: KITCHEN_DASHBOARD_DATA,
  staffManagement: STAFF_MANAGEMENT_DASHBOARD_DATA,
};

export default ALL_DASHBOARD_DATA;