// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints - matching the microservices structure
export const API_ENDPOINTS = {
  // Authentication Service
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
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