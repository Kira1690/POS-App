/**
 * Data Layer - Master exports for all mock data and dashboard data
 */

// Dashboard data exports
export * from './dashboard';

// Mock data exports
export * from './mock/restaurants';
export * from './mock/users';

// Table data exports - Use selective exports to avoid conflicts with dashboard
// getTableById and getTablesByStatus are duplicated in both dashboard and tables
export {
  MOCK_TABLES,
  MOCK_AREAS,
  TABLE_STATS,
  type MockTable,
  type MockArea,
  // Rename to avoid conflicts with dashboard exports
  getTableById as getMockTableById,
  getTablesByStatus as getMockTablesByStatus,
  getTablesByArea,
  getTableByNumber,
} from './tables';

// Data categories for easy access
export const DATA_CATEGORIES = {
  DASHBOARD: 'dashboard',
  RESTAURANTS: 'restaurants',
  USERS: 'users',
  ORDERS: 'orders',
  MENU: 'menu',
  TABLES: 'tables',
} as const;
