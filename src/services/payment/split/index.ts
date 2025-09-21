/**
 * Split Payment Service Module Exports
 * Provides clean interface for split payment functionality
 */

export { splitPaymentService, default as SplitPaymentService } from './SplitPaymentService';
export type { 
  ISplitPaymentService, 
  SplitPaymentRequest, 
  SplitPaymentResult 
} from './SplitPaymentService';