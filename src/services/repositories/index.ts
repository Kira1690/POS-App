/**
 * Repository Module Exports
 * Central export point for all data repositories
 *
 * Usage:
 * import { orderRepository, kitchenTicketRepository, billRepository } from '@/services/repositories';
 *
 * API Migration:
 * When backend is ready, swap AsyncStorageAdapter for ApiAdapter in each repository
 * All business logic and UI code remains unchanged
 */

// Interfaces
export * from './interfaces/IRepository';

// Adapters
export { AsyncStorageAdapter } from './adapters/AsyncStorageAdapter';
export {
  orderStorageAdapter,
  kitchenStorageAdapter,
  billStorageAdapter,
  paymentStorageAdapter,
} from './adapters/AsyncStorageAdapter';

// Repositories
export { OrderRepository, orderRepository } from './OrderRepository';
export { KitchenTicketRepository, kitchenTicketRepository } from './KitchenTicketRepository';
export { BillRepository, billRepository } from './BillRepository';
export { PaymentRepository, paymentRepository } from './PaymentRepository';
export type { PaymentFilters } from './PaymentRepository';

// Re-export types for convenience
export type {
  IRepository,
  ISyncableRepository,
  IOrderRepository,
  IKitchenTicketRepository,
  IBillRepository,
  IDataAdapter,
  QueryFilter,
  QueryOptions,
  PaginatedResult,
  OrderFilters,
  TicketFilters,
  BillFilters,
  OrderStats,
  KitchenStats,
  StationStats,
} from './interfaces/IRepository';
