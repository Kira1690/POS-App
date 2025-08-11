/**
 * Table API Services Index
 * Clean exports for table API services
 * Using Mock implementations for UI-only development
 */

// Import mock implementations
import { FixedMockTableApiClient } from './FixedMockTableApiClient';
import { MockTableWebSocketService } from './MockTableWebSocketService';

// Import real implementations for future use
export { TableApiClient } from './TableApiClient';
export { TableWebSocketService } from './TableWebSocketService';

// Export mock classes
export { FixedMockTableApiClient } from './FixedMockTableApiClient';
export { MockTableWebSocketService } from './MockTableWebSocketService';

// Use mock implementations for UI-only development
// TODO: Switch to real implementations when backend is ready
export const tableApiClient = new FixedMockTableApiClient();
export const tableWebSocketService = new MockTableWebSocketService();