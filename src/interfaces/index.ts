/**
 * Interfaces Index
 * Central export for all interface definitions
 */

// Request interfaces
export * from './requests.interface';

// API interfaces
export * from './api/base.interface';

// Service interfaces (excluding base interfaces to avoid duplicates)
export type { IAuthService, ITokenRefreshProvider } from './services/auth.interface';
export type { IAdminService, IAdminAuthApiClient } from './services/admin.interface';

// Context interfaces
export * from './context/auth.interface';