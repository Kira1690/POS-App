/**
 * Menu API Services Index
 * Clean exports for menu API services
 */

import { MenuApiClient } from './MenuApiClient';

export { MenuApiClient } from './MenuApiClient';
export { MockMenuApiClient } from './MockMenuApiClient';

export const menuApiClient = new MenuApiClient();