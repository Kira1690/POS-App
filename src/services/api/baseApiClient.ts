/**
 * Legacy Base API Client - Redirects to new structure
 * This file maintains backward compatibility
 */

import { SimpleApiClient } from './base/SimpleApiClient';

// Re-export new structure
export { SimpleApiClient as BaseApiClient };

// Export interfaces for backward compatibility
export type { ITokenProvider, IErrorHandler, IBaseApiClient } from '@/interfaces';

// Export factory function
export function createApiClient(config?: any, tokenProvider?: any, errorHandler?: any) {
  return new SimpleApiClient(config, tokenProvider);
}