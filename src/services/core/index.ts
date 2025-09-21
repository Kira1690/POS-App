/**
 * Core Services Module Exports
 * Provides clean interface for service container and DI system
 */

export { serviceContainer, ServiceLifetime } from './ServiceContainer';
export type { ServiceFactory, ServiceInstance, ServiceScope } from './ServiceContainer';

export { 
  initializeServices, 
  registerServices, 
  getService, 
  validateServiceRegistration,
  SERVICE_TOKENS 
} from './ServiceRegistry';
export type { ServiceToken } from './ServiceRegistry';

export { ServiceFactory, ServiceBuilder, registerService } from './ServiceFactory';