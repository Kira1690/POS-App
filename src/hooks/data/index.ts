/**
 * Data Management Hooks Index
 * Clean exports for all data management hooks
 * All hooks follow SOLID principles and use dependency injection
 */

export {
  useOrderData,
  useOrderDataWithRefresh,
  useKitchenOrderData,
  type UseOrderDataResult,
  type OrderDataState,
} from './useOrderData';

export {
  useTableData,
  useTableDataWithRefresh,
  type UseTableDataResult,
  type TableDataState,
  type TableStats,
} from './useTableData';

export {
  useMenuData,
  useMenuDataWithCaching,
  useCategoryMenuData,
  type UseMenuDataResult,
  type MenuDataState,
} from './useMenuData';