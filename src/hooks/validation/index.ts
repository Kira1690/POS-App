/**
 * Validation Hooks Index
 * Clean exports for all validation hooks
 * All hooks follow SOLID principles and use dependency injection
 */

export {
  useOrderValidation,
  useOrderValidationChecks,
  type UseOrderValidationResult,
  type OrderValidationResult,
} from './useOrderValidation';

export {
  usePaymentValidation,
  usePaymentValidationChecks,
  type UsePaymentValidationResult,
  type PaymentValidationResult,
} from './usePaymentValidation';

export {
  useTableValidation,
  useTableValidationChecks,
  type UseTableValidationResult,
  type TableValidationResult,
} from './useTableValidation';