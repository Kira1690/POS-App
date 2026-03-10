/**
 * Service Container - Dependency Injection Container
 * Follows IoC pattern - manages service lifecycle and dependencies
 */

export type ServiceFactory<T = any> = () => T;
export type ServiceInstance<T = any> = T;

export enum ServiceLifetime {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  SCOPED = 'scoped'
}

export interface ServiceRegistration {
  factory: ServiceFactory;
  lifetime: ServiceLifetime;
  instance?: ServiceInstance;
}

export interface ServiceScope {
  resolve<T>(name: string): T;
  dispose(): void;
}

class ServiceContainer {
  private services = new Map<string, ServiceRegistration>();
  private scopedInstances = new Map<string, ServiceInstance>();

  /**
   * Register a service with the container
   */
  register<T>(
    name: string, 
    factory: ServiceFactory<T>, 
    lifetime: ServiceLifetime = ServiceLifetime.SINGLETON
  ): void {
    this.services.set(name, {
      factory,
      lifetime,
    });
  }

  /**
   * Register a singleton service instance
   */
  registerSingleton<T>(name: string, instance: T): void {
    this.services.set(name, {
      factory: () => instance,
      lifetime: ServiceLifetime.SINGLETON,
      instance,
    });
  }

  /**
   * Register a service class constructor
   */
  registerClass<T>(
    name: string,
    constructor: new (...args: any[]) => T,
    dependencies: string[] = [],
    lifetime: ServiceLifetime = ServiceLifetime.SINGLETON
  ): void {
    this.register(name, () => {
      const resolvedDependencies = dependencies.map(dep => this.resolve(dep));
      return new constructor(...resolvedDependencies);
    }, lifetime);
  }

  /**
   * Resolve a service from the container
   */
  resolve<T>(name: string): T {
    const registration = this.services.get(name);
    
    if (!registration) {
      throw new Error(`Service '${name}' is not registered`);
    }

    switch (registration.lifetime) {
      case ServiceLifetime.SINGLETON:
        if (!registration.instance) {
          registration.instance = registration.factory();
        }
        return registration.instance as T;

      case ServiceLifetime.TRANSIENT:
        return registration.factory() as T;

      case ServiceLifetime.SCOPED:
        const scopedInstance = this.scopedInstances.get(name);
        if (scopedInstance) {
          return scopedInstance as T;
        }
        const newInstance = registration.factory();
        this.scopedInstances.set(name, newInstance);
        return newInstance as T;

      default:
        throw new Error(`Unknown service lifetime: ${registration.lifetime}`);
    }
  }

  /**
   * Check if a service is registered
   */
  isRegistered(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Create a new service scope
   */
  createScope(): ServiceScope {
    const scopeContainer = new ServiceContainer();
    
    // Copy all service registrations to the scope
    this.services.forEach((registration, name) => {
      scopeContainer.services.set(name, { ...registration });
    });

    return {
      resolve: <T>(name: string): T => scopeContainer.resolve<T>(name),
      dispose: (): void => {
        scopeContainer.scopedInstances.clear();
        scopeContainer.services.clear();
      }
    };
  }

  /**
   * Clear all scoped instances (useful for cleanup)
   */
  clearScopedInstances(): void {
    this.scopedInstances.clear();
  }

  /**
   * Dispose of all services and clear the container
   */
  dispose(): void {
    // Dispose singleton instances that have dispose methods
    this.services.forEach((registration) => {
      if (registration.instance && typeof registration.instance.dispose === 'function') {
        try {
          registration.instance.dispose();
        } catch { /* silent */ }
      }
    });

    this.services.clear();
    this.scopedInstances.clear();
  }

  /**
   * Replace a registered service (useful for testing)
   */
  replace<T>(name: string, factory: ServiceFactory<T>, lifetime?: ServiceLifetime): void {
    if (!this.services.has(name)) {
      throw new Error(`Cannot replace unregistered service '${name}'`);
    }
    
    const currentRegistration = this.services.get(name)!;
    this.services.set(name, {
      factory,
      lifetime: lifetime || currentRegistration.lifetime,
    });
  }

  /**
   * Get service registration info (useful for debugging)
   */
  getServiceInfo(name: string): { lifetime: ServiceLifetime; hasInstance: boolean } | null {
    const registration = this.services.get(name);
    if (!registration) {
      return null;
    }

    return {
      lifetime: registration.lifetime,
      hasInstance: !!registration.instance,
    };
  }
}

// Export singleton instance
export const serviceContainer = new ServiceContainer();
export default ServiceContainer;