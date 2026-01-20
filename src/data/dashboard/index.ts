/**
 * Dashboard Data - Clean exports for all dashboard mock data
 * Centralized data management for all dashboard types
 */

// Import for internal use
import {
  MANAGER_DASHBOARD_DATA as _MANAGER_DATA,
  getManagerDashboardData as _getManagerData,
  type ManagerDashboardData as _ManagerData,
} from './managerDashboard';

import {
  STAFF_DASHBOARD_DATA as _STAFF_DATA,
  getStaffDashboardData as _getStaffData,
  type StaffDashboardData as _StaffData,
} from './staffDashboard';

import {
  KITCHEN_DASHBOARD_DATA as _KITCHEN_DATA,
  getKitchenDashboardData as _getKitchenData,
  type KitchenDashboardData as _KitchenData,
} from './kitchenDashboard';

import {
  STAFF_MANAGEMENT_DASHBOARD_DATA as _STAFF_MGMT_DATA,
  getStaffManagementDashboardData as _getStaffMgmtData,
  type StaffManagementDashboardData as _StaffMgmtData,
} from './staffManagementDashboard';

import {
  ORDERS_DASHBOARD_DATA as _ORDERS_DATA,
} from './ordersDashboard';

import {
  TABLES_DASHBOARD_DATA as _TABLES_DATA,
} from './tablesDashboard';

import {
  REPORTS_DASHBOARD_DATA as _REPORTS_DATA,
} from './reportsDashboard';

import {
  KITCHEN_STAFF_DASHBOARD_DATA as _KITCHEN_STAFF_DATA,
  type KitchenDashboardData as _KitchenStaffData,
} from './kitchenStaffDashboard';

// Manager Dashboard exports
export {
  MANAGER_DASHBOARD_DATA,
  getManagerDashboardData,
  getSalesGrowthPercentage,
  getOrderCompletionRate as getManagerOrderCompletionRate,
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
  getOrdersByStatus as getKitchenDashboardOrdersByStatus,
  getStationEfficiency,
  getOverdueOrders,
  getKitchenAlerts,
  type KitchenDashboardData as KitchenMainDashboardData,
  type ChefInfo,
  type KitchenStation as KitchenMainStation,
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

// Orders Dashboard exports
export {
  ORDERS_DASHBOARD_DATA,
  MOCK_ORDERS,
  MOCK_ORDER_ANALYTICS,
  getOrdersByStatus as getOrdersDashboardOrdersByStatus,
  getOrdersByType,
  getUrgentOrders,
  getOrderCompletionRate as getOrdersDashboardCompletionRate,
  type OrdersDashboardData,
  type DashboardOrder,
  type OrderAnalytics,
  type OrderItem as DashboardOrderItem,
  type Customer,
  type OrderFilters,
} from './ordersDashboard';

// Tables Dashboard exports
export {
  TABLES_DASHBOARD_DATA,
  MOCK_FLOOR_PLAN,
  getTableById,
  getTablesByStatus,
  getTablesBySection,
  getOccupiedTables,
  getAvailableTables,
  getLongestWaitingTable,
  type TablesDashboardData,
  type Table,
  type TableSection,
  type TableSummary,
  type FloorPlan,
} from './tablesDashboard';

// Reports Dashboard exports
export {
  REPORTS_DASHBOARD_DATA,
  MOCK_KPIS,
  MOCK_REVENUE_CHART,
  MOCK_HOURLY_ORDER_CHART,
  MOCK_CATEGORY_PERFORMANCE_CHART,
  getKPIByLabel,
  getTopPerformingMenuItems,
  getLowPerformingMenuItems,
  getRevenueGrowth,
  getPeakHour,
  getTopCategory,
  formatCurrency,
  formatPercentage,
  type ReportsDashboardData,
  type KPIMetric,
  type ChartDataPoint,
  type PerformanceReport,
  type DateRangeFilter,
} from './reportsDashboard';

// Kitchen Staff Dashboard exports
export {
  KITCHEN_STAFF_DASHBOARD_DATA,
  MOCK_KITCHEN_ORDERS,
  MOCK_KITCHEN_STATS,
  MOCK_KITCHEN_STATIONS,
  getOrdersByStatus as getKitchenOrdersByStatus,
  getOrdersByPriority,
  getOverdueOrders as getKitchenOverdueOrders,
  getUrgentOrders as getKitchenUrgentOrders,
  getActiveStations,
  getStationByChef,
  getOrderById,
  getAveragePreparationTime,
  getStationEfficiency as getKitchenStationEfficiency,
  sortOrdersByPriority,
  getNextOrderInQueue,
  type KitchenDashboardData,
  type KitchenOrder,
  type KitchenOrderItem,
  type KitchenStats,
  type KitchenStation,
} from './kitchenStaffDashboard';

// Common dashboard utilities
export const getDashboardDataByType = (
  dashboardType: 'manager' | 'staff' | 'kitchen' | 'staff-management' | 'orders' | 'tables' | 'reports' | 'kitchen-staff',
  identifier?: string
) => {
  switch (dashboardType) {
    case 'manager':
      return _getManagerData(identifier);

    case 'staff':
      return _getStaffData(identifier || 'EMP001');

    case 'kitchen':
      return _getKitchenData(identifier || 'CHEF001');

    case 'staff-management':
      return _getStaffMgmtData(identifier);

    case 'orders':
      return _ORDERS_DATA;

    case 'tables':
      return _TABLES_DATA;

    case 'reports':
      return _REPORTS_DATA;

    case 'kitchen-staff':
      return _KITCHEN_STAFF_DATA;

    default:
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
  }
};

// Dashboard type guards
export const isManagerDashboardData = (data: unknown): data is _ManagerData => {
  return data !== null && typeof data === 'object' && 'stats' in data &&
    typeof (data as Record<string, unknown>).stats === 'object';
};

export const isStaffDashboardData = (data: unknown): data is _StaffData => {
  return data !== null && typeof data === 'object' && 'staff' in data &&
    typeof (data as Record<string, unknown>).staff === 'object';
};

export const isKitchenDashboardData = (data: unknown): data is _KitchenStaffData => {
  return data !== null && typeof data === 'object' && 'chef' in data &&
    Array.isArray((data as Record<string, unknown>).stations);
};

export const isStaffManagementDashboardData = (data: unknown): data is _StaffMgmtData => {
  return data !== null && typeof data === 'object' && 'staff' in data &&
    Array.isArray((data as Record<string, unknown>).staff);
};

// Dashboard refresh utilities
export const refreshDashboardData = (dashboardType: string) => {
  // In a real app, this would trigger API calls to refresh data
  // For now, it just returns fresh copies of the mock data
  return getDashboardDataByType(dashboardType as 'manager' | 'staff' | 'kitchen' | 'staff-management' | 'orders' | 'tables' | 'reports' | 'kitchen-staff');
};

// Data validation utilities
export const validateDashboardData = (data: unknown, type: string): boolean => {
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
  manager: _MANAGER_DATA,
  staff: _STAFF_DATA,
  kitchen: _KITCHEN_DATA,
  staffManagement: _STAFF_MGMT_DATA,
  orders: _ORDERS_DATA,
  tables: _TABLES_DATA,
  reports: _REPORTS_DATA,
  kitchenStaff: _KITCHEN_STAFF_DATA,
};

export default ALL_DASHBOARD_DATA;
