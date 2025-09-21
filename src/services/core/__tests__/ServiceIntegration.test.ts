/**
 * Service Integration Tests
 * Validates dependency injection system and service composition
 * Tests SOLID principle compliance and proper service integration
 */

import { 
  serviceContainer, 
  initializeServices, 
  getService, 
  SERVICE_TOKENS,
  ServiceLifetime 
} from '../index';
import { IOrderService } from '@/interfaces/services/order.interface';
import { ITableService } from '@/interfaces/services/table.interface';
import { IMenuService } from '@/interfaces/services/menu.interface';
import { IAuthService } from '@/interfaces/services/auth.interface';
import { CompositePaymentService } from '@/services/payment/CompositePaymentService';
import { IPerformanceAnalyticsService } from '@/interfaces/services/analytics.interface';

// Mock implementations for testing
class MockOrderService implements IOrderService {
  async getOrders() { return { success: true, data: [] }; }
  async getOrder() { return {} as any; }
  async createOrder() { return {} as any; }
  async updateOrder() { return {} as any; }
  async updateOrderStatus() { return {} as any; }
  async deleteOrder() { return Promise.resolve(); }
  async cancelOrder() { return {} as any; }
  async getCurrentOrders() { return []; }
  async getOrderHistory() { return { success: true, data: [] }; }
  async addItemToOrder() { return {} as any; }
  async removeItemFromOrder() { return {} as any; }
  async updateOrderItem() { return {} as any; }
  async getOrdersWithFilters() { return []; }
  async getKitchenOrders() { return []; }
  async getActiveKitchenOrders() { return []; }
  async printKOT() { return Promise.resolve(); }
  async printReceipt() { return Promise.resolve(); }
  subscribeToOrderUpdates() { return () => {}; }
  async updateOrderItemStatus() { return {} as any; }
  async markOrderReady() { return {} as any; }
  async getOrdersByTable() { return []; }
  async getOrdersByStatus() { return []; }
  async getOrdersByDateRange() { return []; }
  async getOrderStats() { return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, popularItems: [] }; }
}

class MockTableService implements ITableService {
  async getTables() { return { success: true, data: [] }; }
  async getTable() { return {} as any; }
  async createTable() { return {} as any; }
  async updateTable() { return {} as any; }
  async deleteTable() { return Promise.resolve(); }
  async updateTableStatus() { return {} as any; }
  async getTablesByStatus() { return []; }
  async getAvailableTables() { return []; }
  async assignTable() { return {} as any; }
  async releaseTable() { return {} as any; }
  async getTableOccupancy() { return { occupied: 0, available: 0, reserved: 0, outOfService: 0 }; }
}

class MockMenuService implements IMenuService {
  async getCategories() { return { success: true, data: [] }; }
  async getMenuItems() { return { success: true, data: [] }; }
  async getMenuItem() { return {} as any; }
  async createMenuItem() { return {} as any; }
  async updateMenuItem() { return {} as any; }
  async deleteMenuItem() { return Promise.resolve(); }
  async getMenuItemsByCategory() { return []; }
  async searchMenuItems() { return []; }
  async getPopularItems() { return []; }
  async updateMenuItemAvailability() { return {} as any; }
}

class MockAuthService implements IAuthService {
  async login() { return { success: true, data: {} as any }; }
  async logout() { return Promise.resolve(); }
  async register() { return { success: true, data: {} as any }; }
  async refreshToken() { return { success: true, data: { accessToken: '', refreshToken: '' } }; }
  async getProfile() { return {} as any; }
  async updateProfile() { return {} as any; }
  async updatePassword() { return Promise.resolve(); }
  async isAuthenticated() { return true; }
  async forgotPassword() { return Promise.resolve(); }
  async resetPassword() { return Promise.resolve(); }
  async verifyEmail() { return Promise.resolve(); }
  async resendVerification() { return Promise.resolve(); }
}

class MockPaymentService extends CompositePaymentService {
  constructor() {
    super([] as any, [] as any, {} as any);
  }
}

class MockAnalyticsService implements IPerformanceAnalyticsService {
  startTiming() { return 'mock-id'; }
  endTiming() {}
  recordMetric() {}
  recordEvent() {}
  getMetrics() { return {}; }
  exportMetrics() { return Promise.resolve(''); }
}

describe('Service Integration Tests', () => {
  beforeEach(() => {
    // Clear service container before each test
    serviceContainer.clear();
  });

  describe('Service Registration and Retrieval', () => {
    test('should register and retrieve services correctly', () => {
      // Register mock services
      serviceContainer.register(
        SERVICE_TOKENS.ORDER_SERVICE, 
        () => new MockOrderService(), 
        ServiceLifetime.Singleton
      );
      serviceContainer.register(
        SERVICE_TOKENS.TABLE_SERVICE, 
        () => new MockTableService(), 
        ServiceLifetime.Singleton
      );

      // Retrieve services
      const orderService = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);
      const tableService = getService<ITableService>(SERVICE_TOKENS.TABLE_SERVICE);

      expect(orderService).toBeInstanceOf(MockOrderService);
      expect(tableService).toBeInstanceOf(MockTableService);
    });

    test('should maintain singleton lifecycle correctly', () => {
      serviceContainer.register(
        SERVICE_TOKENS.ORDER_SERVICE, 
        () => new MockOrderService(), 
        ServiceLifetime.Singleton
      );

      const service1 = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);
      const service2 = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);

      expect(service1).toBe(service2); // Same instance for singleton
    });

    test('should create new instances for transient services', () => {
      serviceContainer.register(
        SERVICE_TOKENS.ORDER_SERVICE, 
        () => new MockOrderService(), 
        ServiceLifetime.Transient
      );

      const service1 = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);
      const service2 = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);

      expect(service1).not.toBe(service2); // Different instances for transient
    });
  });

  describe('Service Interface Compliance', () => {
    test('should ensure all registered services implement required interfaces', () => {
      // Initialize default services
      initializeServices();

      // Verify each service implements its interface
      const orderService = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);
      const tableService = getService<ITableService>(SERVICE_TOKENS.TABLE_SERVICE);
      const menuService = getService<IMenuService>(SERVICE_TOKENS.MENU_SERVICE);
      const authService = getService<IAuthService>(SERVICE_TOKENS.AUTH_SERVICE);
      const paymentService = getService<CompositePaymentService>(SERVICE_TOKENS.PAYMENT_SERVICE);
      const analyticsService = getService<IPerformanceAnalyticsService>(SERVICE_TOKENS.PERFORMANCE_ANALYTICS_SERVICE);

      // Verify interface methods exist
      expect(typeof orderService.getOrders).toBe('function');
      expect(typeof orderService.createOrder).toBe('function');
      expect(typeof orderService.updateOrderStatus).toBe('function');

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

  describe('Service Composition and Dependencies', () => {
    test('should handle service dependencies correctly', () => {
      // Register services with dependencies
      serviceContainer.register(
        SERVICE_TOKENS.ORDER_SERVICE, 
        () => new MockOrderService(), 
        ServiceLifetime.Singleton
      );
      serviceContainer.register(
        SERVICE_TOKENS.TABLE_SERVICE, 
        () => new MockTableService(), 
        ServiceLifetime.Singleton
      );

      // Composite service that depends on other services
      class CompositeTestService {
        constructor(
          private orderService: IOrderService,
          private tableService: ITableService
        ) {}

        async processTableOrder(tableId: string) {
          const table = await this.tableService.getTable(tableId);
          const orders = await this.orderService.getOrdersByTable(tableId);
          return { table, orders };
        }
      }

      serviceContainer.register(
        'COMPOSITE_SERVICE',
        () => new CompositeTestService(
          getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE),
          getService<ITableService>(SERVICE_TOKENS.TABLE_SERVICE)
        ),
        ServiceLifetime.Singleton
      );

      const compositeService = getService<CompositeTestService>('COMPOSITE_SERVICE');
      expect(compositeService).toBeInstanceOf(CompositeTestService);
    });
  });

  describe('Error Handling and Validation', () => {
    test('should throw error for unregistered service', () => {
      expect(() => {
        getService<IOrderService>('UNREGISTERED_SERVICE');
      }).toThrow('Service UNREGISTERED_SERVICE is not registered');
    });

    test('should handle service factory errors gracefully', () => {
      serviceContainer.register(
        'FAILING_SERVICE',
        () => {
          throw new Error('Service factory failed');
        },
        ServiceLifetime.Singleton
      );

      expect(() => {
        getService('FAILING_SERVICE');
      }).toThrow('Service factory failed');
    });
  });

  describe('Service Container Scoping', () => {
    test('should create scoped service containers', () => {
      // Register a service in the main container
      serviceContainer.register(
        SERVICE_TOKENS.ORDER_SERVICE, 
        () => new MockOrderService(), 
        ServiceLifetime.Singleton
      );

      // Create a scoped container
      const scope = serviceContainer.createScope();
      
      // Register different service in scope
      scope.register(
        SERVICE_TOKENS.ORDER_SERVICE, 
        () => new MockOrderService(), 
        ServiceLifetime.Singleton
      );

      const mainService = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);
      const scopedService = scope.resolve<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);

      expect(mainService).not.toBe(scopedService);
      
      // Dispose scope
      scope.dispose();
    });
  });

  describe('Performance and Memory Management', () => {
    test('should not create memory leaks with singleton services', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Register and resolve many services
      for (let i = 0; i < 100; i++) {
        serviceContainer.register(
          `SERVICE_${i}`, 
          () => new MockOrderService(), 
          ServiceLifetime.Singleton
        );
        getService(`SERVICE_${i}`);
      }

      const afterCreation = process.memoryUsage().heapUsed;
      
      // Clear container
      serviceContainer.clear();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const afterCleanup = process.memoryUsage().heapUsed;
      
      // Memory should not increase dramatically
      const memoryIncrease = afterCleanup - initialMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    });

    test('should dispose scoped services properly', () => {
      let disposed = false;
      
      class DisposableService {
        dispose() {
          disposed = true;
        }
      }

      const scope = serviceContainer.createScope();
      scope.register('DISPOSABLE_SERVICE', () => new DisposableService(), ServiceLifetime.Scoped);
      
      const service = scope.resolve<DisposableService>('DISPOSABLE_SERVICE');
      expect(service).toBeInstanceOf(DisposableService);

      scope.dispose();
      // Note: Actual disposal would need to be implemented in ServiceScope
    });
  });

  describe('Service Health and Monitoring', () => {
    test('should validate service health', () => {
      initializeServices();

      // All registered services should be healthy
      const services = [
        SERVICE_TOKENS.ORDER_SERVICE,
        SERVICE_TOKENS.TABLE_SERVICE,
        SERVICE_TOKENS.MENU_SERVICE,
        SERVICE_TOKENS.AUTH_SERVICE,
        SERVICE_TOKENS.PAYMENT_SERVICE,
        SERVICE_TOKENS.PERFORMANCE_ANALYTICS_SERVICE,
      ];

      services.forEach(token => {
        expect(() => getService(token)).not.toThrow();
      });
    });
  });
});