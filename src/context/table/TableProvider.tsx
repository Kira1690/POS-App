/**
 * Table Provider - Simple provider component
 * Under 200 lines, focused on providing table context
 */

import React, { useReducer, useCallback, useEffect, useMemo } from 'react';
import { ITableService, ITableWebSocketService, ITableContext } from '@/interfaces';
import { Table, UpdateTableStatusRequest, CreateTableRequest } from '@/types/table.types';
import { MenuItem } from '@/types/menu.types';
import { TableStatus } from '@/types/common.types';
import { TableServiceClass } from '@/services/tables';
import { orderService } from '@/services/orders/orderService';
import TableContext from './TableContext';
import { tableReducer, initialTableState } from './TableReducer';
import { createTableActions } from './TableActions';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';
import { tableStorageService } from '@/services/storage';

interface TableProviderProps {
  children: React.ReactNode;
  tableService?: ITableService;
  tableWebSocketService?: ITableWebSocketService;
}

export const TableProvider: React.FC<TableProviderProps> = ({ 
  children, 
  tableService: injectedTableService,
  tableWebSocketService: injectedTableWebSocketService 
}) => {
  const [state, dispatch] = useReducer(tableReducer, initialTableState);
  
  // Memoize services to prevent infinite re-renders
  const defaultTableService = React.useMemo(() => new TableServiceClass(), []);
  const defaultOrderService = React.useMemo(() => orderService, []);
  
  // Use injected services or fall back to default services
  const tableServiceToUse = injectedTableService || defaultTableService;
  const orderServiceToUse = defaultOrderService;
  // Note: WebSocket service will need to be added to DI system later
  
  // Memoize actions to prevent recreating on every render
  const actions = React.useMemo(
    () => createTableActions(tableServiceToUse, injectedTableWebSocketService, orderServiceToUse, dispatch),
    [tableServiceToUse, injectedTableWebSocketService, orderServiceToUse]
  );

  // Table operations
  const selectTable = useCallback((table: Table) => {
    actions.selectTable(table);
  }, [actions]);

  const updateTableStatus = useCallback(async (tableId: string, updateData: UpdateTableStatusRequest) => {
    return actions.updateTableStatus(tableId, updateData);
  }, [actions]);

  const createTable = useCallback(async (tableData: CreateTableRequest) => {
    return actions.createTable(tableData);
  }, [actions]);

  const deleteTable = useCallback(async (tableId: string) => {
    return actions.deleteTable(tableId);
  }, [actions]);

  const refreshTables = useCallback(async () => {
    // Use mock restaurant ID for UI development
    const restaurantId = 'rest_001'; // Mock restaurant ID that matches mock data
    return actions.loadTables(restaurantId);
  }, [actions]);

  // Order operations
  const createOrderForTable = useCallback(async (tableId: string) => {
    return actions.createOrderForTable(tableId);
  }, [actions]);

  const addItemToOrder = useCallback(async (item: MenuItem) => {
    return actions.addItemToOrder(item);
  }, [actions]);

  const removeItemFromOrder = useCallback(async (itemId: string) => {
    return actions.removeItemFromOrder(itemId);
  }, [actions]);

  const updateOrderItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    // This will be implemented when orderService is enhanced
    if (__DEV__) console.log('updateOrderItemQuantity:', itemId, quantity);
  }, []);

  const clearActiveOrder = useCallback(() => {
    actions.clearActiveOrder();
  }, [actions]);

  // Real-time updates
  const connectToUpdates = useCallback((restaurantId: string = 'rest_001') => {
    actions.connectToUpdates(restaurantId);
  }, [actions]);

  const disconnectFromUpdates = useCallback(() => {
    actions.disconnectFromUpdates();
  }, [actions]);

  // Utility functions
  const clearError = useCallback(() => {
    actions.clearError();
  }, [actions]);

  const getTableById = useCallback((tableId: string): Table | undefined => {
    return state.tables.find(table => table.id === tableId);
  }, [state.tables]);

  const getAvailableTables = useCallback((): Table[] => {
    return state.tables.filter(table => table.status === TableStatus.AVAILABLE);
  }, [state.tables]);

  const getOccupiedTables = useCallback((): Table[] => {
    return state.tables.filter(table => table.status === TableStatus.OCCUPIED);
  }, [state.tables]);

  // Remove automatic loading - let the screen handle it
  // This prevents duplicate loads and race conditions

  // Subscribe to order events for table status management
  useEffect(() => {
    // ORDER_CREATED: Mark table as OCCUPIED when order is submitted
    const unsubscribeCreated = orderEventEmitter.subscribe('ORDER_CREATED', (_orderId, data) => {
      const tableId = data?.tableId as string;
      if (tableId) {
        updateTableStatus(tableId, { status: TableStatus.OCCUPIED })
          .then(() => {
            tableStorageService.updateTableStatus(tableId, TableStatus.OCCUPIED);
          })
          .catch(() => { /* silent — table status is non-critical */ });
      }
    });

    const unsubscribePaid = orderEventEmitter.subscribe('ORDER_PAID', (_orderId, data) => {
      const tableId = data?.tableId as string;
      if (tableId) {
        updateTableStatus(tableId, { status: TableStatus.AVAILABLE })
          .then(() => {
            tableStorageService.updateTableStatus(tableId, TableStatus.AVAILABLE);
          })
          .catch(() => { /* silent */ });
      }
    });

    const unsubscribeCancelled = orderEventEmitter.subscribe('ORDER_CANCELLED', (_orderId, data) => {
      const tableId = data?.tableId as string;
      if (tableId) {
        updateTableStatus(tableId, { status: TableStatus.AVAILABLE })
          .then(() => {
            tableStorageService.updateTableStatus(tableId, TableStatus.AVAILABLE);
          })
          .catch(() => { /* silent */ });
      }
    });

    const unsubscribeReset = orderEventEmitter.subscribe('SYSTEM_RESET', () => {
      refreshTables().catch(() => { /* silent */ });
    });

    // TABLE_SYNC_COMPLETE: Refresh tables when sync pulls new data from server
    const unsubscribeTableSync = orderEventEmitter.subscribe('TABLE_SYNC_COMPLETE', () => {
      refreshTables().catch(() => {
        // Non-blocking — silently ignore errors
      });
    });

    return () => {
      unsubscribeCreated();
      unsubscribePaid();
      unsubscribeCancelled();
      unsubscribeReset();
      unsubscribeTableSync();
    };
  }, [updateTableStatus, refreshTables]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromUpdates();
    };
  }, [disconnectFromUpdates]);

  const contextValue: ITableContext = useMemo(() => ({
    state,
    selectTable,
    updateTableStatus,
    createTable,
    deleteTable,
    refreshTables,
    createOrderForTable,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderItemQuantity,
    clearActiveOrder,
    connectToUpdates,
    disconnectFromUpdates,
    clearError,
    getTableById,
    getAvailableTables,
    getOccupiedTables,
  }), [
    state, selectTable, updateTableStatus, createTable, deleteTable,
    refreshTables, createOrderForTable, addItemToOrder, removeItemFromOrder,
    updateOrderItemQuantity, clearActiveOrder, connectToUpdates,
    disconnectFromUpdates, clearError, getTableById, getAvailableTables,
    getOccupiedTables,
  ]);

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
};