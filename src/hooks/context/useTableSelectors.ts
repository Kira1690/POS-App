/**
 * Table Context Selectors - Performance-optimized table state subscriptions
 * Prevents unnecessary re-renders by allowing components to subscribe only to
 * specific parts of table state they actually need
 */

import React, { useMemo } from 'react';
import { useContextSelector, deepEqual, shallowEqual } from './useContextSelector';
import TableContext from '@/context/table/TableContext';
import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { ITableContext } from '@/interfaces';

// Type alias for the TableContext type
type TableContextType = React.Context<ITableContext | undefined>;

/**
 * Select only the currently selected table
 * Components using this won't re-render when other tables change
 */
export const useSelectedTable = () => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => ctx?.state.selectedTable ?? null,
    (a, b) => a?.id === b?.id && a?.status === b?.status
  );
};

/**
 * Select all tables - use sparingly, prefer more specific selectors
 */
export const useAllTables = (): Table[] => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => ctx?.state.tables ?? [],
    deepEqual
  );
};

/**
 * Select tables by specific status
 * Only re-renders when tables with the specified status change
 */
export const useTablesByStatus = (status: TableStatus): Table[] => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => (ctx?.state.tables ?? []).filter((table: Table) => table.status === status),
    (a: Table[], b: Table[]) => a.length === b.length && a.every((table: Table, i: number) =>
      table.id === b[i]?.id && table.status === b[i]?.status
    )
  );
};

/**
 * Select tables by service area
 * Only re-renders when tables in the specified area change
 */
export const useTablesByServiceArea = (serviceArea: string): Table[] => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => (ctx?.state.tables ?? []).filter((table: Table) => table.service_area === serviceArea),
    (a: Table[], b: Table[]) => a.length === b.length && a.every((table: Table, i: number) => table.id === b[i]?.id)
  );
};

/**
 * Select table statistics only
 * Won't re-render on individual table changes, only when counts change
 */
export const useTableStats = () => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => {
      const tables = ctx?.state.tables ?? [];
      const total = tables.length;
      const available = tables.filter((t: Table) => t.status === TableStatus.AVAILABLE).length;
      const occupied = tables.filter((t: Table) => t.status === TableStatus.OCCUPIED).length;
      const reserved = tables.filter((t: Table) => t.status === TableStatus.RESERVED).length;
      const cleaning = tables.filter((t: Table) => t.status === TableStatus.CLEANING).length;
      const outOfOrder = tables.filter((t: Table) => t.status === TableStatus.OUT_OF_ORDER).length;

      return {
        total,
        available,
        occupied,
        reserved,
        cleaning,
        outOfOrder,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      };
    },
    shallowEqual
  );
};

/**
 * Select specific table by ID
 * Only re-renders when that specific table changes
 */
export const useTableById = (tableId: string | null): Table | null | undefined => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => tableId ? (ctx?.state.tables ?? []).find((table: Table) => table.id === tableId) : null,
    (a, b) => a?.id === b?.id && a?.status === b?.status && a?.current_order_id === b?.current_order_id
  );
};

/**
 * Select available tables only
 * Optimized for table selection workflows
 */
export const useAvailableTables = () => {
  return useTablesByStatus(TableStatus.AVAILABLE);
};

/**
 * Select occupied tables only  
 * Useful for active order monitoring
 */
export const useOccupiedTables = () => {
  return useTablesByStatus(TableStatus.OCCUPIED);
};

/**
 * Select loading and error states only
 * Won't re-render when table data changes, only on loading/error changes
 */
export const useTableLoadingState = () => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => ({
      isLoading: ctx?.state.isLoading ?? false,
      error: ctx?.state.error ?? null,
      lastUpdated: ctx?.state.lastUpdated ?? null,
    }),
    shallowEqual
  );
};

/**
 * Select table actions only
 * Actions don't change, so this won't cause re-renders
 */
export const useTableActions = () => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => ({
      selectTable: ctx?.selectTable ?? (() => {}),
      updateTableStatus: ctx?.updateTableStatus ?? (async () => {}),
      refreshTables: ctx?.refreshTables ?? (async () => {}),
      clearError: ctx?.clearError ?? (() => {}),
    }),
    () => true // Actions never change, so always equal
  );
};

/**
 * Select tables with active orders
 * Useful for order management workflows
 */
export const useTablesWithOrders = (): Table[] => {
  return useContextSelector(
    TableContext as TableContextType,
    (ctx) => (ctx?.state.tables ?? []).filter((table: Table) => table.current_order_id),
    (a: Table[], b: Table[]) => a.length === b.length && a.every((table: Table, i: number) =>
      table.id === b[i]?.id && table.current_order_id === b[i]?.current_order_id
    )
  );
};

/**
 * Custom hook for table-related computations
 * Combines multiple selectors efficiently
 */
export const useTableSummary = () => {
  const stats = useTableStats();
  const selectedTable = useSelectedTable();
  const loadingState = useTableLoadingState();
  
  return useMemo(() => ({
    stats,
    selectedTable,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    hasSelection: !!selectedTable,
    selectionStatus: selectedTable?.status || null,
  }), [stats, selectedTable, loadingState]);
};