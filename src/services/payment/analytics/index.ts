/**
 * Payment Analytics Service Module Exports
 * Provides clean interface for payment analytics functionality
 */

export { paymentAnalyticsService, default as PaymentAnalyticsService } from './PaymentAnalyticsService';
export type { 
  IPaymentAnalyticsService, 
  PaymentEvent, 
  AnalyticsFilters 
} from './PaymentAnalyticsService';