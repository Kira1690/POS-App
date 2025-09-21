/**
 * Service Factory - Factory pattern for creating services with proper dependencies
 * Follows Factory Pattern - encapsulates service creation logic
 */

import { serviceContainer, ServiceLifetime } from './ServiceContainer';
import { SERVICE_TOKENS, ServiceToken } from './ServiceRegistry';

// Service interfaces
import { IOrderService } from '@/interfaces/services/order.interface';
import { ITableService } from '@/interfaces/services/table.interface';
import { IMenuService } from '@/interfaces/services/menu.interface';
import { IAuthService } from '@/interfaces/services/auth.interface';
import { IPerformanceAnalyticsService } from '@/interfaces/services/analytics.interface';
import { CompositePaymentService } from '@/services/payment/CompositePaymentService';

export class ServiceFactory {
  /**
   * Create order service with dependencies
   */
  static createOrderService(): IOrderService {
    return serviceContainer.resolve<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);
  }

  /**
   * Create table service with dependencies
   */
  static createTableService(): ITableService {
    return serviceContainer.resolve<ITableService>(SERVICE_TOKENS.TABLE_SERVICE);
  }

  /**
   * Create menu service with dependencies
   */
  static createMenuService(): IMenuService {
    return serviceContainer.resolve<IMenuService>(SERVICE_TOKENS.MENU_SERVICE);
  }

  /**
   * Create auth service with dependencies
   */
  static createAuthService(): IAuthService {
    return serviceContainer.resolve<IAuthService>(SERVICE_TOKENS.AUTH_SERVICE);
  }

  /**
   * Create payment service with all its dependencies
   */
  static createPaymentService(): CompositePaymentService {
    return serviceContainer.resolve<CompositePaymentService>(SERVICE_TOKENS.PAYMENT_SERVICE);
  }

  /**
   * Create analytics service with dependencies
   */
  static createAnalyticsService(): IPerformanceAnalyticsService {
    return serviceContainer.resolve<IPerformanceAnalyticsService>(
      SERVICE_TOKENS.PERFORMANCE_ANALYTICS_SERVICE
    );
  }

  /**
   * Generic service creator
   */
  static createService<T>(token: ServiceToken): T {
    return serviceContainer.resolve<T>(token);
  }

  /**
   * Create a scoped factory for request-level dependencies
   */
  static createScopedFactory() {
    const scope = serviceContainer.createScope();
    
    return {
      createOrderService: (): IOrderService => scope.resolve<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE),
      createTableService: (): ITableService => scope.resolve<ITableService>(SERVICE_TOKENS.TABLE_SERVICE),
      createMenuService: (): IMenuService => scope.resolve<IMenuService>(SERVICE_TOKENS.MENU_SERVICE),
      createPaymentService: (): CompositePaymentService => scope.resolve<CompositePaymentService>(SERVICE_TOKENS.PAYMENT_SERVICE),
      createService: <T>(token: ServiceToken): T => scope.resolve<T>(token),
      dispose: () => scope.dispose(),
    };
  }

  /**
   * Create mock services for testing
   */
  static createMockServices() {
    // This would be used in tests to inject mock implementations
    return {
      registerMock: <T>(token: ServiceToken, mockInstance: T) => {
        serviceContainer.replace(token, () => mockInstance);
      },
      restoreAll: () => {
        // In a real implementation, we'd restore original services
        console.log('Mock services would be restored here');
      },
    };
  }
}

/**
 * Service builder for complex service construction
 */
export class ServiceBuilder<T> {
  private dependencies: ServiceToken[] = [];
  private lifetime: ServiceLifetime = ServiceLifetime.SINGLETON;
  private factory?: (...deps: any[]) => T;

  constructor(private token: ServiceToken) {}

  /**
   * Add a dependency
   */
  dependsOn(token: ServiceToken): this {
    this.dependencies.push(token);
    return this;
  }

  /**
   * Set service lifetime
   */
  withLifetime(lifetime: ServiceLifetime): this {
    this.lifetime = lifetime;
    return this;
  }

  /**
   * Set factory function
   */
  withFactory(factory: (...deps: any[]) => T): this {
    this.factory = factory;
    return this;
  }

  /**
   * Build and register the service
   */
  build(): void {
    if (!this.factory) {
      throw new Error('Factory function is required');
    }

    serviceContainer.register(
      this.token,
      () => {
        const resolvedDependencies = this.dependencies.map(dep => 
          serviceContainer.resolve(dep)
        );
        return this.factory!(...resolvedDependencies);
      },
      this.lifetime
    );
  }
}

/**
 * Fluent API for service registration
 */
export function registerService<T>(token: ServiceToken): ServiceBuilder<T> {
  return new ServiceBuilder<T>(token);
}

export default ServiceFactory;