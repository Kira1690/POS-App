// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints - matching the actual POS-Auth-Service endpoints via API Gateway
export const API_ENDPOINTS = {
  // Authentication Service (via API Gateway /api/auth/*)
  AUTH: {
    // Public endpoints
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refreshtoken',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
    VALIDATE_TOKEN: '/api/auth/validate-token',
    
    // Protected endpoints
    PROFILE: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/update',
    UPDATE_PASSWORD: '/api/auth/update-password',
    SOFT_DELETE: '/api/auth/soft-delete',
    HARD_DELETE: '/api/auth/hard-delete',
    
    // Session management
    SESSIONS: '/api/auth/sessions',
    SESSION_INFO: '/api/auth/session',
    REVOKE_SESSION: '/api/auth/session',
    REVOKE_OTHER_SESSIONS: '/api/auth/revoke-other-sessions',
    
    // Admin endpoints
    ADMIN_REGISTER: '/api/auth/admin/register',
    LIST_USERS: '/api/auth/list',
    MY_REGISTERED_USERS: '/api/auth/my-registered-users',
    ADMIN_USER_BASE: '/api/auth/admin/user',
    USER_SESSIONS_BASE: '/api/auth/user',
    ADMIN_REGISTERED_USERS: '/api/auth/admin', // /api/auth/admin/{adminId}/registered-users
  },

  // Restaurant Management Service (via API Gateway /api/restaurants/*)
  RESTAURANTS: {
    BASE: '/api/restaurants',
    ASSIGN_MANAGER: '/api/restaurants',
    USERS: '/api/restaurants',
  },

  // Device Management Service (via API Gateway /api/devices/*)
  DEVICES: {
    BASE: '/api/devices',
    REGISTER: '/api/devices/register',
    RESTAURANT: '/api/devices/restaurant',
    HEARTBEAT: '/api/devices',
    STATUS: '/api/devices',
  },

  // Shift Management Service (via API Gateway /api/shifts/*)
  SHIFTS: {
    BASE: '/api/shifts',
    START: '/api/shifts/start',
    END: '/api/shifts/end',
    CURRENT: '/api/shifts/current',
    HISTORY: '/api/shifts/history',
    BREAK_START: '/api/shifts/break/start',
    BREAK_END: '/api/shifts/break/end',
    RESTAURANT: '/api/shifts/restaurant',
  },
  
  // User Management Service
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    RESTAURANTS: '/api/users/restaurants',
  },
  
  // Menu Management Service
  MENU: {
    BASE: '/api/menu',
    CATEGORIES: '/api/menu/categories',
    ITEMS: '/api/menu/items',
    SEARCH: '/api/menu/search',
  },
  
  // Table Management Service
  TABLES: {
    BASE: '/api/tables',
    STATUS: '/api/tables/status',
    RESERVATIONS: '/api/tables/reservations',
  },
  
  // Order Processing Service
  ORDERS: {
    BASE: '/api/orders',
    STATUS: '/api/orders/status',
    HISTORY: '/api/orders/history',
    CURRENT: '/api/orders/current',
  },
  
  // Kitchen Operations Service
  KITCHEN: {
    BASE: '/api/kitchen',
    QUEUE: '/api/kitchen/queue',
    STATUS: '/api/kitchen/status',
    PERFORMANCE: '/api/kitchen/performance',
  },
  
  // Billing & Payment Service
  BILLING: {
    BASE: '/api/billing',
    PAYMENTS: '/api/billing/payments',
    RECEIPTS: '/api/billing/receipts',
    REFUNDS: '/api/billing/refunds',
  },
  
  // Inventory Management Service
  INVENTORY: {
    BASE: '/api/inventory',
    STOCK: '/api/inventory/stock',
    ALERTS: '/api/inventory/alerts',
  },
  
  // Customer Management Service
  CUSTOMERS: {
    BASE: '/api/customers',
    SEARCH: '/api/customers/search',
    HISTORY: '/api/customers/history',
  },
  
  // Analytics & Reports Service
  REPORTS: {
    BASE: '/api/reports',
    SALES: '/api/reports/sales',
    PERFORMANCE: '/api/reports/performance',
    ANALYTICS: '/api/reports/analytics',
  },
  
  // Notification Service
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    MARK_READ: '/api/notifications/mark-read',
    PREFERENCES: '/api/notifications/preferences',
  },
  
  // External Integration Service
  INTEGRATIONS: {
    BASE: '/api/integrations',
    DELIVERY: '/api/integrations/delivery',
    PAYMENT: '/api/integrations/payment',
  },
  
  // Print Management Service
  PRINT: {
    BASE: '/api/print',
    RECEIPTS: '/api/print/receipts',
    KITCHEN: '/api/print/kitchen',
    REPORTS: '/api/print/reports',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;