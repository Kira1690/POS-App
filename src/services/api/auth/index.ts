/**
 * Auth API Clients Index
 * Clean exports for authentication API clients
 */

export { SimpleAuthApiClient } from './SimpleAuthApiClient';
export { AdminAuthApiClient } from './AdminAuthApiClient';

// Create and export singleton instances
import { SimpleAuthApiClient } from './SimpleAuthApiClient';
import { AdminAuthApiClient } from './AdminAuthApiClient';

// Main auth API client instance
export const authApiClient = new SimpleAuthApiClient();

// Admin auth API client instance (initialized with token provider from main client)
export const adminAuthApiClient = new AdminAuthApiClient(authApiClient);