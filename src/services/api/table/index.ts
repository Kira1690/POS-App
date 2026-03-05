/**
 * Table API Services Index
 * Clean exports for table API services
 */

import { TableApiClient } from './TableApiClient';
import { TableWebSocketService } from './TableWebSocketService';

export { TableApiClient } from './TableApiClient';
export { TableWebSocketService } from './TableWebSocketService';
export { FixedMockTableApiClient } from './FixedMockTableApiClient';
export { MockTableWebSocketService } from './MockTableWebSocketService';

export const tableApiClient = new TableApiClient();
export const tableWebSocketService = new TableWebSocketService();