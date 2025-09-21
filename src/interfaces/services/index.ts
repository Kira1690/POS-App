/**
 * Service Interfaces Index
 * Clean exports for all service interfaces
 */

export type { IAuthService, ITokenRefreshProvider } from './auth.interface';
export type { IAdminService, IAdminAuthApiClient } from './admin.interface';
export type { ITableService, ITableWebSocketService } from './table.interface';
export type { IMenuService } from './menu.interface';
export type { IOrderService } from './order.interface';
export type { 
  IPerformanceAnalyticsService, 
  IBusinessAnalyticsService 
} from './analytics.interface';

// Re-export base interfaces (these are defined in api/base.interface.ts)
export type { ITokenProvider, IBaseApiClient, IErrorHandler } from '../api/base.interface';