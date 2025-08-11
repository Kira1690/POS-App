/**
 * Menu API Services Index
 * Clean exports for menu API services
 * Using Mock implementation for UI-only development
 */

import { MockMenuApiClient } from './MockMenuApiClient';

// Export both real and mock implementations
export { MenuApiClient } from './MenuApiClient';
export { MockMenuApiClient } from './MockMenuApiClient';

// Use mock implementation for UI-only development
// TODO: Switch to real implementation when backend is ready
export const menuApiClient = new MockMenuApiClient();