/**
 * Data Layer - Master exports for all mock data and dashboard data
 * Centralized data management for the entire application
 */

// Dashboard data exports
export * from './dashboard';

// Mock data exports
export * from './mock/restaurants';
export * from './mock/users';

// Re-export commonly used data for convenience
export { ALL_DASHBOARD_DATA } from './dashboard';
export { MOCK_RESTAURANTS } from './mock/restaurants';
export { MOCK_USERS } from './mock/users';

// Data categories for easy access
export const DATA_CATEGORIES = {
  DASHBOARD: 'dashboard',
  RESTAURANTS: 'restaurants',
  USERS: 'users',
  ORDERS: 'orders',
  MENU: 'menu',
  TABLES: 'tables',
} as const;

// Data validation utilities
export const validateDataCategory = (category: string): boolean => {
  return Object.values(DATA_CATEGORIES).includes(category as any);
};

// Data refresh utilities (for future real API integration)
export const refreshAllData = async () => {
  // In a real app, this would trigger API calls to refresh all data
  // For now, it returns fresh copies of all mock data
  return {
    dashboard: ALL_DASHBOARD_DATA,
    restaurants: MOCK_RESTAURANTS,
    users: MOCK_USERS,
  };
};

// Data export utilities for debugging/testing
export const exportDataForTesting = () => {
  return {
    dashboard: ALL_DASHBOARD_DATA,
    restaurants: MOCK_RESTAURANTS,
    users: MOCK_USERS,
  };
};

// Data initialization check
export const verifyDataIntegrity = (): boolean => {
  try {
    // Verify dashboard data exists
    if (!ALL_DASHBOARD_DATA || typeof ALL_DASHBOARD_DATA !== 'object') {
      console.error('Dashboard data is invalid or missing');
      return false;
    }

    // Verify restaurant data exists
    if (!MOCK_RESTAURANTS || !Array.isArray(MOCK_RESTAURANTS) || MOCK_RESTAURANTS.length === 0) {
      console.error('Restaurant data is invalid or missing');
      return false;
    }

    // Verify user data exists
    if (!MOCK_USERS || !Array.isArray(MOCK_USERS) || MOCK_USERS.length === 0) {
      console.error('User data is invalid or missing');
      return false;
    }

    console.log('✅ Data integrity check passed - All data loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Data integrity check failed:', error);
    return false;
  }
};

// Initialize data on import (optional - for development)
if (__DEV__) {
  verifyDataIntegrity();
}

// Export data summary for debugging
export const DATA_SUMMARY = {
  dashboard: {
    types: Object.keys(ALL_DASHBOARD_DATA).length,
    manager: !!ALL_DASHBOARD_DATA.manager,
    staff: !!ALL_DASHBOARD_DATA.staff,
    kitchen: !!ALL_DASHBOARD_DATA.kitchen,
    staffManagement: !!ALL_DASHBOARD_DATA.staffManagement,
  },
  restaurants: {
    total: MOCK_RESTAURANTS.length,
    active: MOCK_RESTAURANTS.filter(r => r.isActive).length,
    inactive: MOCK_RESTAURANTS.filter(r => !r.isActive).length,
  },
  users: {
    total: MOCK_USERS.length,
    active: MOCK_USERS.filter(u => u.isActive).length,
    byRole: MOCK_USERS.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  },
};

export default {
  dashboard: ALL_DASHBOARD_DATA,
  restaurants: MOCK_RESTAURANTS,
  users: MOCK_USERS,
  summary: DATA_SUMMARY,
};