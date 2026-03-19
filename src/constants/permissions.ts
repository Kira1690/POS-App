import { UserRole } from '@/types';

// Define all possible permissions in the system
export const PERMISSIONS = {
  // Order Management
  ORDERS_CREATE: 'orders.create',
  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',
  ORDERS_CANCEL: 'orders.cancel',
  
  // Menu Management
  MENU_CREATE: 'menu.create',
  MENU_READ: 'menu.read',
  MENU_UPDATE: 'menu.update',
  MENU_DELETE: 'menu.delete',
  
  // Table Management
  TABLES_MANAGE: 'tables.manage',
  TABLES_ASSIGN: 'tables.assign',
  TABLES_STATUS: 'tables.status',
  
  // Kitchen Operations
  KITCHEN_VIEW: 'kitchen.view',
  KITCHEN_MANAGE: 'kitchen.manage',
  KITCHEN_STATUS: 'kitchen.status',
  
  // Customer Management
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',
  
  // Inventory Management
  INVENTORY_READ: 'inventory.read',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_MANAGE: 'inventory.manage',
  
  // Staff Management
  STAFF_READ: 'staff.read',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  STAFF_SCHEDULE: 'staff.schedule',
  
  // Reports & Analytics
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  ANALYTICS_VIEW: 'analytics.view',
  
  // Payment & Billing
  PAYMENTS_PROCESS: 'payments.process',
  PAYMENTS_REFUND: 'payments.refund',
  BILLING_VIEW: 'billing.view',
  
  // System Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
  RESTAURANT_MANAGE: 'restaurant.manage',
  
  // System Administration
  SYSTEM_ADMIN: 'system.admin',
  USER_ADMIN: 'user.admin',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Define base permissions for each role
const WAITER_PERMISSIONS: Permission[] = [
  PERMISSIONS.ORDERS_CREATE,
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.MENU_READ,
  PERMISSIONS.TABLES_ASSIGN,
  PERMISSIONS.TABLES_STATUS,
  PERMISSIONS.CUSTOMERS_CREATE,
  PERMISSIONS.CUSTOMERS_READ,
  PERMISSIONS.CUSTOMERS_UPDATE,
  PERMISSIONS.PAYMENTS_PROCESS,
  PERMISSIONS.BILLING_VIEW,
];

const CASHIER_PERMISSIONS: Permission[] = [
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.MENU_READ,
  PERMISSIONS.PAYMENTS_PROCESS,
  PERMISSIONS.BILLING_VIEW,
];

const KITCHEN_STAFF_PERMISSIONS: Permission[] = [
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.MENU_READ,
  PERMISSIONS.KITCHEN_VIEW,
  PERMISSIONS.KITCHEN_MANAGE,
  PERMISSIONS.KITCHEN_STATUS,
  PERMISSIONS.INVENTORY_READ,
];

const SELF_ORDER_PERMISSIONS: Permission[] = [
  PERMISSIONS.ORDERS_CREATE,
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.MENU_READ,
  PERMISSIONS.PAYMENTS_PROCESS,
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...WAITER_PERMISSIONS,
  ...KITCHEN_STAFF_PERMISSIONS,
  PERMISSIONS.ORDERS_DELETE,
  PERMISSIONS.ORDERS_CANCEL,
  PERMISSIONS.MENU_CREATE,
  PERMISSIONS.MENU_UPDATE,
  PERMISSIONS.MENU_DELETE,
  PERMISSIONS.TABLES_MANAGE,
  PERMISSIONS.CUSTOMERS_DELETE,
  PERMISSIONS.INVENTORY_UPDATE,
  PERMISSIONS.INVENTORY_MANAGE,
  PERMISSIONS.STAFF_READ,
  PERMISSIONS.STAFF_SCHEDULE,
  PERMISSIONS.REPORTS_VIEW,
  PERMISSIONS.REPORTS_EXPORT,
  PERMISSIONS.ANALYTICS_VIEW,
  PERMISSIONS.PAYMENTS_REFUND,
  PERMISSIONS.SETTINGS_VIEW,
  PERMISSIONS.RESTAURANT_MANAGE,
];

const STORE_ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  PERMISSIONS.STAFF_CREATE,
  PERMISSIONS.STAFF_UPDATE,
  PERMISSIONS.STAFF_DELETE,
  PERMISSIONS.SETTINGS_MANAGE,
  PERMISSIONS.USER_ADMIN,
];

const SYSTEM_ADMIN_PERMISSIONS: Permission[] = [
  ...STORE_ADMIN_PERMISSIONS,
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...SYSTEM_ADMIN_PERMISSIONS,
  PERMISSIONS.SYSTEM_ADMIN,
];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.WAITER]: WAITER_PERMISSIONS,
  [UserRole.CASHIER]: CASHIER_PERMISSIONS,
  [UserRole.KITCHEN_STAFF]: KITCHEN_STAFF_PERMISSIONS,
  [UserRole.SELF_ORDER]: SELF_ORDER_PERMISSIONS,
  [UserRole.MANAGER]: MANAGER_PERMISSIONS,
  [UserRole.STORE_ADMIN]: STORE_ADMIN_PERMISSIONS,
  [UserRole.SYSTEM_ADMIN]: SYSTEM_ADMIN_PERMISSIONS,
  [UserRole.SUPER_ADMIN]: SUPER_ADMIN_PERMISSIONS,
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

// Helper function to get all permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};