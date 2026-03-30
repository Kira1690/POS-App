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
// IMPORTANT: Skip reconciliation if orders haven't been synced yet (empty storage
// after cold boot would incorrectly reset all occupied tables to available).
// Silently returns the original list on any error.
const reconcileTableStatuses = async (tables: Table[]): Promise<Table[]> => {
  try {
    const activeOrders = await unifiedOrderStorageService.getActiveOrders();

    // If no orders in local storage at all, orders likely haven't synced yet.
    // Trust server statuses — don't reconcile.
    if (activeOrders.length === 0) {
      if (__DEV__) {
        const occupiedCount = tables.filter(t => t.status === TableStatus.OCCUPIED).length;
        if (occupiedCount > 0) {
          console.log(`[TableActions] Skipping reconciliation — no orders in storage yet (${occupiedCount} occupied tables preserved)`);
        }
      }
      return tables;
    }

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
  
  // In-flight dedup: if a loadTables is already running, callers wait for it
  let loadTablesPromise: Promise<void> | null = null;
  let loadTablesStartedAt = 0;

  const loadTables = async (restaurantId: string, fromStorageOnly = false): Promise<void> => {
    // Dedup: if already loading, piggyback — but timeout after 10s to avoid stuck promises
    if (loadTablesPromise) {
      if (Date.now() - loadTablesStartedAt < 10000) {
        return loadTablesPromise;
      }
      // Previous load hung — reset and retry
      loadTablesPromise = null;
    }
    loadTablesStartedAt = Date.now();

    const doLoad = async () => {
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

      // Storage-only: read from SQLite (sync pull already wrote data there).
      // Skip initialize() to avoid seeding mock data when using real credentials.
      // Skip reconciliation — server is the authority for table status when online.
      if (fromStorageOnly) {
        try {
          const tables = await tableStorageService.getTables();
          if (tables.length > 0) {
            dispatch({ type: 'TABLE_LOAD_SUCCESS', payload: tables });
          }
          // If no tables in storage yet, don't dispatch — wait for API or next sync
        } catch {
          // Silent — storage read failure is non-critical
        }
        return;
      }

      try {
        const apiTables = await tableService.getTables(restaurantId);

        // Merge with locally-created tables not yet synced to server.
        let merged = apiTables;
        try {
          const localTables = await tableStorageService.getTables();
          const apiIds = new Set(apiTables.map(t => t.id));
          const apiNumbers = new Set(apiTables.map(t => t.table_number));
          const localOnly = localTables.filter(t => {
            if (apiIds.has(t.id) || apiNumbers.has(t.table_number)) return false;
            const numPart = parseInt(t.id.replace('t-', ''), 10);
            return !isNaN(numPart) && numPart > 1000;
          });
          if (localOnly.length > 0) {
            merged = [...apiTables, ...localOnly];
          }
        } catch {
          // SQLite read failed — use API data only
        }

        // Server is the authority for table status — no local reconciliation
        dispatch({ type: 'TABLE_LOAD_SUCCESS', payload: merged });
      } catch {
        // API unavailable — fall back to SQLite (no mock seeding for real credentials)
        try {
          const tables = await tableStorageService.getTables();
          if (tables.length > 0) {
            dispatch({ type: 'TABLE_LOAD_SUCCESS', payload: tables });
          } else {
            dispatch({ type: 'TABLE_LOAD_FAILURE', payload: 'No tables available — waiting for server sync' });
          }
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

    loadTablesPromise = doLoad().finally(() => { loadTablesPromise = null; });
    return loadTablesPromise;
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
        }
      } catch { /* silent */ }
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