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

// Order context selectors - use these instead of direct OrderContext
export {
  useCurrentOrder,
  useCartItems,
  useCartTotals,
  useOrderHistory,
  useOrdersByStatus,
  useOrdersForTable,
  useOrderLoadingState,
  useOrderActions,
  useKitchenOrders,
  useOrderById,
  useOrderStats,
  useIsCartEmpty,
  useHasActiveOrder,
  useOrderWorkflowState,
} from './useOrderSelectors';

// Re-export common types for convenience
export type { Table } from '@/types/table.types';
export type { Order, OrderItem } from '@/types/order.types';
export type { TableStatus, OrderStatus } from '@/types/common.types';