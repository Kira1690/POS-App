/**
 * Table Actions - Simple action creators
 * Under 200 lines, focused on table action creation
 */

import { ITableService, ITableWebSocketService } from '@/interfaces';
import { Table, CreateTableRequest, UpdateTableStatusRequest } from '@/types/table.types';
import { MenuItem } from '@/types/menu.types';
import { showToast } from '@/utils/toast';
import { TableAction } from './TableReducer';
import { tableStorageService, authStorageService } from '@/services/storage';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { TableStatus } from '@/types/common.types';

/** Returns true when the stored access token belongs to dummy/offline credentials. */
async function isUsingDummyCredentials(): Promise<boolean> {
  try {
    const session = await authStorageService.getSession();
    return session?.accessToken?.startsWith('dummy_') ?? false;
  } catch {
    return false;
  }
}

// Reconcile table statuses against actual active orders.
// Resets OCCUPIED tables to AVAILABLE if they have no active order in storage.
// Silently returns the original list on any error.
const reconcileTableStatuses = async (tables: Table[]): Promise<Table[]> => {
  try {
    const activeOrders = await unifiedOrderStorageService.getActiveOrders();
    const activeTableIds = new Set(activeOrders.map((o) => o.tableId).filter(Boolean));

    const corrected: string[] = [];
    const result = tables.map((table) => {
      if (table.status === TableStatus.OCCUPIED && !activeTableIds.has(table.id)) {
        // Stale OCCUPIED — reset both in-memory and SQLite
        tableStorageService.updateTableStatus(table.id, TableStatus.AVAILABLE).catch(() => {});
        corrected.push(table.table_number);
        return { ...table, status: TableStatus.AVAILABLE };
      }
      return table;
    });

    if (__DEV__ && corrected.length > 0) {
      console.log('[TableActions] Reconciled stale OCCUPIED tables to AVAILABLE:', corrected);
    }
    return result;
  } catch {
    return tables;
  }
};

// Simple Order interface for table context (UI-only)
interface SimpleOrder {
  id: string;
  table_id: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const createTableActions = (
  tableService: ITableService,
  tableWebSocketService: ITableWebSocketService | undefined,
  orderService: any, // Will be typed when orderService is enhanced
  dispatch: React.Dispatch<TableAction>
) => {
  
  const loadTables = async (restaurantId: string): Promise<void> => {
    dispatch({ type: 'TABLE_LOAD_START' });

    // Dummy/offline credentials — skip API entirely, go straight to SQLite
    const isDummy = await isUsingDummyCredentials();
    if (isDummy) {
      try {
        const data = await tableStorageService.initialize(restaurantId);
        const reconciled = await reconcileTableStatuses(data.tables);
        dispatch({ type: 'TABLE_LOAD_SUCCESS', payload: reconciled });
      } catch (storageError: unknown) {
        const errorMessage = (storageError as Error).message || 'Failed to load tables';
        dispatch({ type: 'TABLE_LOAD_FAILURE', payload: errorMessage });
      }
      return;
    }

    try {
      const apiTables = await tableService.getTables(restaurantId);

      // Merge with locally-created tables not yet synced to server.
      // Only include user-created tables (timestamp-based IDs), not seeded mock data.
      let merged = apiTables;
      try {
        const localTables = await tableStorageService.getTables();
        const apiIds = new Set(apiTables.map(t => t.id));
        const apiNumbers = new Set(apiTables.map(t => t.table_number));
        const localOnly = localTables.filter(t => {
          if (apiIds.has(t.id) || apiNumbers.has(t.table_number)) return false;
          // Skip seeded mock tables (IDs: t-001 to t-030). Only include user-created
          // tables which have timestamp-based IDs like t-1741305834.
          const numPart = parseInt(t.id.replace('t-', ''), 10);
          return !isNaN(numPart) && numPart > 1000;
        });
        if (localOnly.length > 0) {
          merged = [...apiTables, ...localOnly];
        }
      } catch {
        // SQLite read failed — use API data only
      }

      const reconciled = await reconcileTableStatuses(merged);
      dispatch({ type: 'TABLE_LOAD_SUCCESS', payload: reconciled });
    } catch {
      // API unavailable — fall back to SQLite (seeds mock data if empty)
      try {
        const data = await tableStorageService.initialize(restaurantId);
        const reconciled = await reconcileTableStatuses(data.tables);
        dispatch({ type: 'TABLE_LOAD_SUCCESS', payload: reconciled });
      } catch (storageError: any) {
        const errorMessage = storageError.message || 'Failed to load tables';
        dispatch({ type: 'TABLE_LOAD_FAILURE', payload: errorMessage });
        showToast({
          type: 'error',
          title: 'Load Failed',
          message: errorMessage,
        });
      }
    }
  };

  const selectTable = (table: Table): void => {
    dispatch({ type: 'TABLE_SELECT', payload: table });
  };

  const deselectTable = (): void => {
    dispatch({ type: 'TABLE_DESELECT' });
  };

  const updateTableStatus = async (tableId: string, updateData: UpdateTableStatusRequest): Promise<void> => {
    // Dummy/offline credentials — update locally only, no API call
    const isDummy = await isUsingDummyCredentials();
    if (isDummy) {
      await tableStorageService.updateTableStatus(tableId, updateData.status);
      dispatch({ type: 'TABLE_STATUS_UPDATE', payload: { tableId, status: updateData.status } });
      return;
    }

    try {
      const updatedTable = await tableService.updateTableStatus(tableId, updateData);
      dispatch({ type: 'TABLE_UPDATE', payload: updatedTable });
      
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Table status updated to ${updateData.status}`,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update table status';
      dispatch({ type: 'TABLE_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const createTable = async (tableData: CreateTableRequest): Promise<void> => {
    try {
      const newTable = await tableService.createTable(tableData);
      dispatch({ type: 'TABLE_ADD', payload: newTable });
      
      showToast({
        type: 'success',
        title: 'Table Created',
        message: `Table ${newTable.table_number} created successfully`,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create table';
      dispatch({ type: 'TABLE_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const deleteTable = async (tableId: string): Promise<void> => {
    try {
      await tableService.deleteTable(tableId);
      dispatch({ type: 'TABLE_REMOVE', payload: tableId });
      
      showToast({
        type: 'success',
        title: 'Table Deleted',
        message: 'Table deleted successfully',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete table';
      dispatch({ type: 'TABLE_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const createOrderForTable = async (tableId: string): Promise<void> => {
    try {
      // Create a simple mock order for UI development
      const newOrder: SimpleOrder = {
        id: `order_${Date.now()}`,
        table_id: tableId,
        items: [],
        total: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      dispatch({ type: 'ORDER_SET', payload: newOrder });
      
      showToast({
        type: 'success',
        title: 'Order Created',
        message: 'New order started for table',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create order';
      dispatch({ type: 'TABLE_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Order Creation Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const addItemToOrder = async (item: MenuItem): Promise<void> => {
    try {
      // For UI development, simulate adding item to the active order
      const newOrderItem = {
        id: `item_${Date.now()}`,
        name: item.name,
        quantity: 1,
        price: item.price,
      };

      // Create a mock updated order (this would normally come from the API)
      const mockUpdatedOrder: SimpleOrder = {
        id: `order_${Date.now()}`,
        table_id: 'current_table',
        items: [newOrderItem], // In a real app, this would be appended to existing items
        total: item.price,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch({ type: 'ORDER_UPDATE', payload: mockUpdatedOrder });
      
      showToast({
        type: 'success',
        title: 'Item Added',
        message: `${item.name} added to order`,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add item to order';
      dispatch({ type: 'TABLE_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Add Item Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const removeItemFromOrder = async (itemId: string): Promise<void> => {
    try {
      // This will be implemented when orderService is enhanced
      showToast({
        type: 'success',
        title: 'Item Removed',
        message: 'Item removed from order',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to remove item from order';
      dispatch({ type: 'TABLE_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Remove Item Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const clearActiveOrder = (): void => {
    dispatch({ type: 'ORDER_CLEAR' });
  };

  const clearError = (): void => {
    dispatch({ type: 'TABLE_CLEAR_ERROR' });
  };

  let unsubscribe: (() => void) | null = null;

  const connectToUpdates = (restaurantId: string): void => {
    // Skip WebSocket for dummy/offline credentials
    isUsingDummyCredentials().then(isDummy => {
      if (isDummy) {
        if (__DEV__) console.log('[TableActions] Dummy credentials — skipping WebSocket');
        return;
      }

      try {
        // Disconnect any existing connection first
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }

        // Only connect if WebSocket service is available
        if (tableWebSocketService) {
          tableWebSocketService.connect(restaurantId);
          dispatch({ type: 'REALTIME_CONNECT' });

          // Subscribe to updates and store unsubscribe function
          unsubscribe = tableWebSocketService.subscribe((update) => {
            dispatch({ type: 'REALTIME_UPDATE', payload: update });
          });
        } else {
          console.warn('WebSocket service not available, skipping real-time updates');
        }
      } catch (error: unknown) {
        console.error('Failed to connect to real-time updates:', (error as Error).message);
      }
    }).catch(() => {});
  };

  const disconnectFromUpdates = (): void => {
    // Unsubscribe before disconnecting
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    
    // Only disconnect if WebSocket service is available
    if (tableWebSocketService) {
      tableWebSocketService.disconnect();
    }
    dispatch({ type: 'REALTIME_DISCONNECT' });
  };

  return {
    loadTables,
    selectTable,
    deselectTable,
    updateTableStatus,
    createTable,
    deleteTable,
    createOrderForTable,
    addItemToOrder,
    removeItemFromOrder,
    clearActiveOrder,
    clearError,
    connectToUpdates,
    disconnectFromUpdates,
  };
};