/**
 * Context Hooks Index
 * Performance-optimized context selectors and utilities
 * Use these instead of direct context consumption for better performance
 */

// Core context selector utilities
export { 
  useContextSelector, 
  deepEqual, 
  shallowEqual 
} from './useContextSelector';

// Table context selectors - use these instead of direct TableContext
export {
  useSelectedTable,
  useAllTables,
  useTablesByStatus,
  useTablesByServiceArea,
  useTableStats,
  useTableById,
  useAvailableTables,
  useOccupiedTables,
  useTableLoadingState,
  useTableActions,
  useTablesWithOrders,
  useTableSummary,
} from './useTableSelectors';

// Order context selectors - DEPRECATED: Use unified-order context hooks directly
// The old OrderContext has been replaced by UnifiedOrderContext
// Use: useUnifiedOrder, useUnifiedCart, useUnifiedKitchen, useUnifiedOrderManagement, useUnifiedBilling
// from '@/context/unified-order'

// Re-export common types for convenience
export type { Table } from '@/types/table.types';
export type { Order, OrderItem } from '@/types/order.types';
export type { TableStatus, OrderStatus } from '@/types/common.types';