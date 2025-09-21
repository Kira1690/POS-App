/**
 * Cash Payment Service Module Exports
 * Provides clean interface for cash payment functionality
 */

export { cashPaymentService, default as CashPaymentService } from './CashPaymentService';
export type { 
  ICashPaymentService, 
  CashPaymentRequest, 
  CashPaymentResult,
  ChangeCalculation 
} from './CashPaymentService';