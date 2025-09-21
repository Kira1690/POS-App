/**
 * Hooks Index
 * Central export point for all React hooks in the application
 * Organized by category for clean imports and maintainability
 */

// Service hooks - Dependency injection and service management
export * from './services';

// Validation hooks - Business logic validation using DI services
export * from './validation';

// Data management hooks - Data operations using DI services
export * from './data';

// Form management hooks - Pure form state management
export * from './forms';

// Context selectors - Performance-optimized context subscriptions
export * from './context';

// Re-export commonly used hook types for convenience
export type {
  // Service types
  UseServicesResult,
  ServiceHealthStatus,
  
  // Validation types
  UseOrderValidationResult,
  UsePaymentValidationResult,
  UseTableValidationResult,
  OrderValidationResult,
  PaymentValidationResult,
  TableValidationResult,
  
  // Data management types
  UseOrderDataResult,
  UseTableDataResult,
  UseMenuDataResult,
  OrderDataState,
  TableDataState,
  MenuDataState,
  TableStats,
  
  // Form management types
  UseOrderFormResult,
  UsePaymentFormResult,
  UseTableFormResult,
  OrderFormData,
  PaymentFormData,
  TableFormData,
  OrderFormState,
  PaymentFormState,
  TableFormState,
} from './services';

export type {
  OrderValidationResult,
  PaymentValidationResult,
  TableValidationResult,
} from './validation';

export type {
  OrderDataState,
  TableDataState,
  MenuDataState,
  TableStats,
} from './data';

export type {
  OrderFormData,
  PaymentFormData,
  TableFormData,
  OrderFormState,
  PaymentFormState,
  TableFormState,
} from './forms';