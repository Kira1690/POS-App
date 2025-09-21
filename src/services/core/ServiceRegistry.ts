/**
 * Service Registry - Central service registration and configuration
 * Follows Dependency Injection pattern - configures all services and their dependencies
 */

import { serviceContainer, ServiceLifetime } from './ServiceContainer';

// Service interfaces
import { IOrderService } from '@/interfaces/services/order.interface';
import { ITableService, ITableWebSocketService } from '@/interfaces/services/table.interface';
import { IMenuService } from '@/interfaces/services/menu.interface';
import { IAuthService } from '@/interfaces/services/auth.interface';
import { IPerformanceAnalyticsService } from '@/interfaces/services/analytics.interface';

// Service implementations
import { OrderService } from '@/services/orders/orderService';
import { TableService } from '@/services/tables/TableService';
import { MenuService } from '@/services/menu/MenuService';
import { AuthService } from '@/services/auth/AuthService';
import { PerformanceAnalyticsService } from '@/services/analytics/PerformanceAnalyticsService';

// Payment services (already refactored)
import { CompositePaymentService } from '@/services/payment/CompositePaymentService';
import { cardPaymentService } from '@/services/payment/card';
import { cashPaymentService } from '@/services/payment/cash';
import { vp3350DeviceService } from '@/services/payment/vp3350';
import { splitPaymentService } from '@/services/payment/split';
import { receiptService } from '@/services/receipt';
import { paymentAnalyticsService } from '@/services/payment/analytics';

// API clients
import { tableApiClient, tableWebSocketService } from '@/services/api/table';
import { menuApiClient } from '@/services/api/menu';

// Service tokens (string constants for service names)
export const SERVICE_TOKENS = {
  // Core services
  ORDER_SERVICE: 'orderService',
  TABLE_SERVICE: 'tableService',
  MENU_SERVICE: 'menuService',
  AUTH_SERVICE: 'authService',
  
  // Payment services
  PAYMENT_SERVICE: 'paymentService',
  CARD_PAYMENT_SERVICE: 'cardPaymentService',
  CASH_PAYMENT_SERVICE: 'cashPaymentService',
  VP3350_DEVICE_SERVICE: 'vp3350DeviceService',
  SPLIT_PAYMENT_SERVICE: 'splitPaymentService',
  RECEIPT_SERVICE: 'receiptService',
  PAYMENT_ANALYTICS_SERVICE: 'paymentAnalyticsService',
  
  // API clients
  TABLE_API_CLIENT: 'tableApiClient',
  TABLE_WEBSOCKET_SERVICE: 'tableWebSocketService',
  MENU_API_CLIENT: 'menuApiClient',
  
  // Analytics services
  PERFORMANCE_ANALYTICS_SERVICE: 'performanceAnalyticsService',
} as const;

export type ServiceToken = typeof SERVICE_TOKENS[keyof typeof SERVICE_TOKENS];

/**
 * Register all application services
 */
export function registerServices(): void {
  // Register API clients first (dependencies for other services)
  serviceContainer.registerSingleton(SERVICE_TOKENS.TABLE_API_CLIENT, tableApiClient);
  serviceContainer.registerSingleton(SERVICE_TOKENS.TABLE_WEBSOCKET_SERVICE, tableWebSocketService);
  serviceContainer.registerSingleton(SERVICE_TOKENS.MENU_API_CLIENT, menuApiClient);

  // Register payment services (already implemented as singletons)
  serviceContainer.registerSingleton(SERVICE_TOKENS.CARD_PAYMENT_SERVICE, cardPaymentService);
  serviceContainer.registerSingleton(SERVICE_TOKENS.CASH_PAYMENT_SERVICE, cashPaymentService);
  serviceContainer.registerSingleton(SERVICE_TOKENS.VP3350_DEVICE_SERVICE, vp3350DeviceService);
  serviceContainer.registerSingleton(SERVICE_TOKENS.SPLIT_PAYMENT_SERVICE, splitPaymentService);
  serviceContainer.registerSingleton(SERVICE_TOKENS.RECEIPT_SERVICE, receiptService);
  serviceContainer.registerSingleton(SERVICE_TOKENS.PAYMENT_ANALYTICS_SERVICE, paymentAnalyticsService);

  // Register composite payment service with its dependencies
  serviceContainer.register(
    SERVICE_TOKENS.PAYMENT_SERVICE,
    () => new CompositePaymentService(
      serviceContainer.resolve(SERVICE_TOKENS.CARD_PAYMENT_SERVICE),
      serviceContainer.resolve(SERVICE_TOKENS.CASH_PAYMENT_SERVICE),
      serviceContainer.resolve(SERVICE_TOKENS.VP3350_DEVICE_SERVICE),
      serviceContainer.resolve(SERVICE_TOKENS.SPLIT_PAYMENT_SERVICE),
      serviceContainer.resolve(SERVICE_TOKENS.RECEIPT_SERVICE),
      serviceContainer.resolve(SERVICE_TOKENS.PAYMENT_ANALYTICS_SERVICE)
    ),
    ServiceLifetime.SINGLETON
  );

  // Register core business services with their dependencies
  serviceContainer.register(
    SERVICE_TOKENS.TABLE_SERVICE,
    () => new TableService(),
    ServiceLifetime.SINGLETON
  );

  serviceContainer.register(
    SERVICE_TOKENS.MENU_SERVICE,
    () => new MenuService(),
    ServiceLifetime.SINGLETON
  );

  serviceContainer.register(
    SERVICE_TOKENS.ORDER_SERVICE,
    () => new OrderService(),
    ServiceLifetime.SINGLETON
  );

  serviceContainer.register(
    SERVICE_TOKENS.AUTH_SERVICE,
    () => new AuthService(),
    ServiceLifetime.SINGLETON
  );

  serviceContainer.register(
    SERVICE_TOKENS.PERFORMANCE_ANALYTICS_SERVICE,
    () => new PerformanceAnalyticsService(),
    ServiceLifetime.SINGLETON
  );

  console.log('✅ Service registration complete');
  console.log(`📦 Registered ${serviceContainer.getRegisteredServices().length} services`);
}

/**
 * Get a typed service from the container
 */
export function getService<T>(token: ServiceToken): T {
  return serviceContainer.resolve<T>(token);
}

/**
 * Check if services are properly registered
 */
export function validateServiceRegistration(): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check that all required services are registered
  Object.values(SERVICE_TOKENS).forEach(token => {
    if (!serviceContainer.isRegistered(token)) {
      errors.push(`Service '${token}' is not registered`);
    }
  });

  // Try to resolve critical services to ensure dependencies are correct
  const criticalServices = [
    SERVICE_TOKENS.ORDER_SERVICE,
    SERVICE_TOKENS.TABLE_SERVICE,
    SERVICE_TOKENS.MENU_SERVICE,
    SERVICE_TOKENS.PAYMENT_SERVICE,
  ];

  criticalServices.forEach(token => {
    try {
      serviceContainer.resolve(token);
    } catch (error) {
      errors.push(`Failed to resolve '${token}': ${error}`);
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Initialize the service system
 */
export function initializeServices(): void {
  console.log('🚀 Initializing service system...');
  
  registerServices();
  
  const validation = validateServiceRegistration();
  
  if (!validation.success) {
    console.error('❌ Service registration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Service system initialization failed');
  }
  
  console.log('✅ Service system initialized successfully');
}