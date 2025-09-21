/**
 * Receipt Service Module Exports
 * Provides clean interface for receipt functionality
 */

export { receiptService, default as ReceiptService } from './ReceiptService';
export type { 
  IReceiptService, 
  ReceiptGenerationRequest, 
  PrintOptions 
} from './ReceiptService';