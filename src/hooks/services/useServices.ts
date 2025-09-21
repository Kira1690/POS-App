/**
 * Service Hooks - React hooks for accessing services with dependency injection
 * Follows Hook Pattern - provides React-friendly service access
 */

import { useMemo } from 'react';
import { ServiceFactory } from '@/services/core/ServiceFactory';
import { getService, SERVICE_TOKENS } from '@/services/core/ServiceRegistry';

// Service interfaces
import { IOrderService } from '@/interfaces/services/order.interface';
import { ITableService } from '@/interfaces/services/table.interface';
import { IMenuService } from '@/interfaces/services/menu.interface';
import { IAuthService } from '@/interfaces/services/auth.interface';
import { IPerformanceAnalyticsService } from '@/interfaces/services/analytics.interface';
import { CompositePaymentService } from '@/services/payment/CompositePaymentService';

/**
 * Hook to access order service
 */
export function useOrderService(): IOrderService {
  return useMemo(() => getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE), []);
}

/**
 * Hook to access table service
 */
export function useTableService(): ITableService {
  return useMemo(() => getService<ITableService>(SERVICE_TOKENS.TABLE_SERVICE), []);
}

/**
 * Hook to access menu service
 */
export function useMenuService(): IMenuService {
  return useMemo(() => getService<IMenuService>(SERVICE_TOKENS.MENU_SERVICE), []);
}

/**
 * Hook to access auth service
 */
export function useAuthService(): IAuthService {
  return useMemo(() => getService<IAuthService>(SERVICE_TOKENS.AUTH_SERVICE), []);
}

/**
 * Hook to access payment service
 */
export function usePaymentService(): CompositePaymentService {
  return useMemo(() => getService<CompositePaymentService>(SERVICE_TOKENS.PAYMENT_SERVICE), []);
}

/**
 * Hook to access analytics service
 */
export function useAnalyticsService(): IPerformanceAnalyticsService {
  return useMemo(() => getService<IPerformanceAnalyticsService>(
    SERVICE_TOKENS.PERFORMANCE_ANALYTICS_SERVICE
  ), []);
}

/**
 * Hook to access multiple services at once
 */
export function useServices() {
  return useMemo(() => ({
    orderService: getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE),
    tableService: getService<ITableService>(SERVICE_TOKENS.TABLE_SERVICE),
    menuService: getService<IMenuService>(SERVICE_TOKENS.MENU_SERVICE),
    authService: getService<IAuthService>(SERVICE_TOKENS.AUTH_SERVICE),
    paymentService: getService<CompositePaymentService>(SERVICE_TOKENS.PAYMENT_SERVICE),
    analyticsService: getService<IPerformanceAnalyticsService>(
      SERVICE_TOKENS.PERFORMANCE_ANALYTICS_SERVICE
    ),
  }), []);
}

/**
 * Hook to create a scoped service factory
 * Useful for components that need request-scoped services
 */
export function useScopedServices() {
  return useMemo(() => {
    const scopedFactory = ServiceFactory.createScopedFactory();
    
    return {
      services: {
        orderService: scopedFactory.createOrderService(),
        tableService: scopedFactory.createTableService(),
        menuService: scopedFactory.createMenuService(),
        paymentService: scopedFactory.createPaymentService(),
      },
      dispose: scopedFactory.dispose,
    };
  }, []);
}

/**
 * Hook for service health monitoring
 */
export function useServiceHealth() {
  return useMemo(() => ({
    checkServiceHealth: () => {
      try {
        const services = useServices();
        return {
          healthy: true,
          services: {
            orderService: !!services.orderService,
            tableService: !!services.tableService,
            menuService: !!services.menuService,
            authService: !!services.authService,
            paymentService: !!services.paymentService,
            analyticsService: !!services.analyticsService,
          }
        };
      } catch (error) {
        return {
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  }), []);
}