/**
 * Table Context Interface - Type definitions for table context
 * Clean, focused interface definition
 */

import { Table, CreateTableRequest, UpdateTableStatusRequest, TableGridConfig } from '@/types/table.types';
import { MenuItem } from '@/types/menu.types';

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

export interface ITableState {
  tables: Table[];
  selectedTable: Table | null;
  activeOrder: SimpleOrder | null;
  gridConfig: TableGridConfig;
  isLoading: boolean;
  isConnectedToUpdates: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface ITableContext {
  state: ITableState;
  
  // Table operations
  selectTable: (table: Table) => void;
  updateTableStatus: (tableId: string, status: UpdateTableStatusRequest) => Promise<void>;
  createTable: (tableData: CreateTableRequest) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  refreshTables: () => Promise<void>;
  
  // Order operations
  createOrderForTable: (tableId: string) => Promise<void>;
  addItemToOrder: (item: MenuItem) => Promise<void>;
  removeItemFromOrder: (itemId: string) => Promise<void>;
  updateOrderItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearActiveOrder: () => void;
  
  // Real-time updates
  connectToUpdates: (restaurantId: string) => void;
  disconnectFromUpdates: () => void;
  
  // Utility functions
  clearError: () => void;
  getTableById: (tableId: string) => Table | undefined;
  getAvailableTables: () => Table[];
  getOccupiedTables: () => Table[];
}