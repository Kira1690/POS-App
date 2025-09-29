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

// Orders Dashboard exports
export {
  ORDERS_DASHBOARD_DATA,
  MOCK_ORDERS,
  MOCK_ORDER_ANALYTICS,
  getOrdersByStatus,
  getOrdersByType,
  getUrgentOrders,
  getOrderCompletionRate,
  type OrdersDashboardData,
  type DashboardOrder,
  type OrderAnalytics,
  type OrderItem,
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
      return getManagerDashboardData(identifier);

    case 'staff':
      return getStaffDashboardData(identifier || 'EMP001');

    case 'kitchen':
      return getKitchenDashboardData(identifier || 'CHEF001');

    case 'staff-management':
      return getStaffManagementDashboardData(identifier);

    case 'orders':
      return ORDERS_DASHBOARD_DATA;

    case 'tables':
      return TABLES_DASHBOARD_DATA;

    case 'reports':
      return REPORTS_DASHBOARD_DATA;

    case 'kitchen-staff':
      return KITCHEN_STAFF_DASHBOARD_DATA;

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
  orders: ORDERS_DASHBOARD_DATA,
  tables: TABLES_DASHBOARD_DATA,
  reports: REPORTS_DASHBOARD_DATA,
  kitchenStaff: KITCHEN_STAFF_DASHBOARD_DATA,
};

export default ALL_DASHBOARD_DATA;