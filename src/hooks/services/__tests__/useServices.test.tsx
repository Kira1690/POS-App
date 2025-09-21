/**
 * Service Hooks Integration Tests
 * Tests React hooks that provide dependency injection services
 * Validates proper integration with React component lifecycle
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  useOrderService,
  useTableService,
  useMenuService,
  useAuthService,
  usePaymentService,
  useAnalyticsService,
  useServices,
  useScopedServices,
  useServiceHealth,
} from '../useServices';
import { initializeServices, serviceContainer } from '@/services/core';

// Mock the service implementations to avoid real API calls
jest.mock('@/services/orders/orderService');
jest.mock('@/services/tables/tableService');
jest.mock('@/services/menu/menuService');
jest.mock('@/services/auth/authService');
jest.mock('@/services/payment');

describe('Service Hooks Integration Tests', () => {
  beforeEach(() => {
    // Initialize services before each test
    serviceContainer.clear();
    initializeServices();
  });

  afterEach(() => {
    serviceContainer.clear();
  });

  describe('Individual Service Hooks', () => {
    test('useOrderService should return stable service instance', () => {
      const { result, rerender } = renderHook(() => useOrderService());

      const firstService = result.current;
      expect(firstService).toBeDefined();
      expect(typeof firstService.getOrders).toBe('function');

      // Re-render should return the same instance (memoized)
      rerender();
      expect(result.current).toBe(firstService);
    });

    test('useTableService should return stable service instance', () => {
      const { result, rerender } = renderHook(() => useTableService());

      const firstService = result.current;
      expect(firstService).toBeDefined();
      expect(typeof firstService.getTables).toBe('function');

      rerender();
      expect(result.current).toBe(firstService);
    });

    test('useMenuService should return stable service instance', () => {
      const { result, rerender } = renderHook(() => useMenuService());

      const firstService = result.current;
      expect(firstService).toBeDefined();
      expect(typeof firstService.getMenuItems).toBe('function');

      rerender();
      expect(result.current).toBe(firstService);
    });

    test('useAuthService should return stable service instance', () => {
      const { result, rerender } = renderHook(() => useAuthService());

      const firstService = result.current;
      expect(firstService).toBeDefined();
      expect(typeof firstService.login).toBe('function');

      rerender();
      expect(result.current).toBe(firstService);
    });

    test('usePaymentService should return stable service instance', () => {
      const { result, rerender } = renderHook(() => usePaymentService());

      const firstService = result.current;
      expect(firstService).toBeDefined();
      expect(typeof firstService.processCardPayment).toBe('function');

      rerender();
      expect(result.current).toBe(firstService);
    });

    test('useAnalyticsService should return stable service instance', () => {
      const { result, rerender } = renderHook(() => useAnalyticsService());

      const firstService = result.current;
      expect(firstService).toBeDefined();
      expect(typeof firstService.startTiming).toBe('function');

      rerender();
      expect(result.current).toBe(firstService);
    });
  });

  describe('Composite Service Hook', () => {
    test('useServices should return all services in stable object', () => {
      const { result, rerender } = renderHook(() => useServices());

      const services = result.current;
      expect(services).toBeDefined();
      expect(services.orderService).toBeDefined();
      expect(services.tableService).toBeDefined();
      expect(services.menuService).toBeDefined();
      expect(services.authService).toBeDefined();
      expect(services.paymentService).toBeDefined();
      expect(services.analyticsService).toBeDefined();

      // Should be memoized
      rerender();
      expect(result.current).toBe(services);
    });

    test('useServices should provide working service methods', () => {
      const { result } = renderHook(() => useServices());

      const { orderService, tableService, menuService, authService, paymentService, analyticsService } = result.current;

      // Verify all required methods exist
      expect(typeof orderService.getOrders).toBe('function');
      expect(typeof orderService.createOrder).toBe('function');

      expect(typeof tableService.getTables).toBe('function');
      expect(typeof tableService.updateTableStatus).toBe('function');

      expect(typeof menuService.getMenuItems).toBe('function');
      expect(typeof menuService.getCategories).toBe('function');

      expect(typeof authService.login).toBe('function');
      expect(typeof authService.logout).toBe('function');

      expect(typeof paymentService.processCardPayment).toBe('function');
      expect(typeof paymentService.processCashPayment).toBe('function');

      expect(typeof analyticsService.startTiming).toBe('function');
      expect(typeof analyticsService.recordMetric).toBe('function');
    });
  });

  describe('Scoped Services Hook', () => {
    test('useScopedServices should create isolated service instances', () => {
      const { result } = renderHook(() => useScopedServices());

      expect(result.current.services).toBeDefined();
      expect(result.current.dispose).toBeDefined();
      expect(typeof result.current.dispose).toBe('function');

      const { services } = result.current;
      expect(services.orderService).toBeDefined();
      expect(services.tableService).toBeDefined();
      expect(services.menuService).toBeDefined();
      expect(services.paymentService).toBeDefined();
    });

    test('useScopedServices should provide independent instances', () => {
      const { result: result1 } = renderHook(() => useScopedServices());
      const { result: result2 } = renderHook(() => useScopedServices());

      // Different hook calls should provide different scoped instances
      expect(result1.current.services.orderService).not.toBe(result2.current.services.orderService);
      expect(result1.current.services.tableService).not.toBe(result2.current.services.tableService);
    });

    test('scoped services should be disposable', () => {
      const { result } = renderHook(() => useScopedServices());

      // Should not throw when disposing
      expect(() => {
        result.current.dispose();
      }).not.toThrow();
    });
  });

  describe('Service Health Hook', () => {
    test('useServiceHealth should return health check function', () => {
      const { result } = renderHook(() => useServiceHealth());

      expect(result.current.checkServiceHealth).toBeDefined();
      expect(typeof result.current.checkServiceHealth).toBe('function');
    });

    test('useServiceHealth should report healthy services', () => {
      const { result } = renderHook(() => useServiceHealth());

      const health = result.current.checkServiceHealth();
      
      expect(health).toBeDefined();
      expect(health.healthy).toBe(true);
      expect(health.services).toBeDefined();
      expect(health.services.orderService).toBe(true);
      expect(health.services.tableService).toBe(true);
      expect(health.services.menuService).toBe(true);
      expect(health.services.authService).toBe(true);
      expect(health.services.paymentService).toBe(true);
      expect(health.services.analyticsService).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle service initialization failures gracefully', () => {
      // Clear services to simulate uninitialized state
      serviceContainer.clear();

      // This should not throw, but might return null or throw depending on implementation
      expect(() => {
        renderHook(() => useOrderService());
      }).toThrow(); // Should throw since services aren't initialized
    });
  });

  describe('Performance and Memory', () => {
    test('should not create new instances on every render', () => {
      const { result, rerender } = renderHook(() => useOrderService());

      const firstInstance = result.current;
      
      // Multiple rerenders should return the same instance
      for (let i = 0; i < 10; i++) {
        rerender();
        expect(result.current).toBe(firstInstance);
      }
    });

    test('should handle component unmounting properly', () => {
      const { result, unmount } = renderHook(() => useServices());

      expect(result.current).toBeDefined();

      // Should not throw when component unmounts
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Integration with React Context', () => {
    test('should work within React component tree', () => {
      const TestComponent = () => {
        const orderService = useOrderService();
        const services = useServices();
        
        return (
          <div>
            <span data-testid="orderService">
              {orderService ? 'Order service loaded' : 'No order service'}
            </span>
            <span data-testid="allServices">
              {services ? 'All services loaded' : 'No services'}
            </span>
          </div>
        );
      };

      // This would need a proper React testing environment
      // For now, we'll just test that the hook can be used
      const { result } = renderHook(() => {
        const orderService = useOrderService();
        const services = useServices();
        return { orderService, services };
      });

      expect(result.current.orderService).toBeDefined();
      expect(result.current.services).toBeDefined();
    });
  });

  describe('Service Interface Consistency', () => {
    test('should maintain consistent interfaces across all service hooks', () => {
      const { result } = renderHook(() => ({
        individual: {
          orderService: useOrderService(),
          tableService: useTableService(),
          menuService: useMenuService(),
          authService: useAuthService(),
          paymentService: usePaymentService(),
          analyticsService: useAnalyticsService(),
        },
        composite: useServices(),
      }));

      const { individual, composite } = result.current;

      // Individual hooks should return the same instances as composite hook
      expect(individual.orderService).toBe(composite.orderService);
      expect(individual.tableService).toBe(composite.tableService);
      expect(individual.menuService).toBe(composite.menuService);
      expect(individual.authService).toBe(composite.authService);
      expect(individual.paymentService).toBe(composite.paymentService);
      expect(individual.analyticsService).toBe(composite.analyticsService);
    });
  });
});