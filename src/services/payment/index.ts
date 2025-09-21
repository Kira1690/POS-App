/**
 * Payment Services Module
 * Professional payment processing exports with SOLID principle compliance
 */

// Composite service (recommended for most use cases)
export { compositePaymentService, CompositePaymentService } from './CompositePaymentService';

// Individual specialized services (for specific use cases)
export * from './card';
export * from './cash';
export * from './vp3350';
export * from './split';
export * from './analytics';

// Receipt service
export * from '../receipt';

// Legacy service (deprecated - use compositePaymentService instead)
export { paymentService as legacyPaymentService, default as LegacyPaymentService } from './PaymentService';

// Default export - the composite service (maintains backward compatibility)
export { compositePaymentService as paymentService } from './CompositePaymentService';

// Re-export payment types for convenience
export * from '@/types/payment.types';