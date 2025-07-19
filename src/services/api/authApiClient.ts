/**
 * Legacy Auth API Client - Redirects to new structure
 * This file maintains backward compatibility
 */

// Re-export from new structure
export { SimpleAuthApiClient as AuthApiClient } from './auth/SimpleAuthApiClient';
export { AdminAuthApiClient } from './auth/AdminAuthApiClient';

// Re-export instances
export { authApiClient, adminAuthApiClient } from './auth';