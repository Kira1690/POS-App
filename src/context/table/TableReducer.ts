/**
 * Table Reducer - Simple, focused table state management
 * Under 150 lines, single responsibility
 */

import { ITableState } from '@/interfaces';
import { Table, TableGridConfig } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';

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

export const initialTableState: ITableState = {
  tables: [],
  selectedTable: null,
  activeOrder: null,
  gridConfig: { rows: 5, cols: 5, total: 25 },
  isLoading: false,
  isConnectedToUpdates: false,
  error: null,
  lastUpdated: null,
};

export type TableAction = 
  | { type: 'TABLE_LOAD_START' }
  | { type: 'TABLE_LOAD_SUCCESS'; payload: Table[] }
  | { type: 'TABLE_LOAD_FAILURE'; payload: string }
  | { type: 'TABLE_SELECT'; payload: Table }
  | { type: 'TABLE_DESELECT' }
  | { type: 'TABLE_UPDATE'; payload: Table }
  | { type: 'TABLE_ADD'; payload: Table }
  | { type: 'TABLE_REMOVE'; payload: string }
  | { type: 'TABLE_STATUS_UPDATE'; payload: { tableId: string; status: TableStatus; notes?: string } }
  | { type: 'ORDER_SET'; payload: SimpleOrder }
  | { type: 'ORDER_CLEAR' }
  | { type: 'ORDER_UPDATE'; payload: SimpleOrder }
  | { type: 'REALTIME_CONNECT' }
  | { type: 'REALTIME_DISCONNECT' }
  | { type: 'REALTIME_UPDATE'; payload: any }
  | { type: 'TABLE_SET_ERROR'; payload: string }
  | { type: 'TABLE_CLEAR_ERROR' }
  | { type: 'TABLE_SET_GRID_CONFIG'; payload: TableGridConfig };

export const tableReducer = (state: ITableState, action: TableAction): ITableState => {
  switch (action.type) {
    case 'TABLE_LOAD_START':
      return { ...state, isLoading: true, error: null };
      
    case 'TABLE_LOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tables: action.payload,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
      
    case 'TABLE_LOAD_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        tables: [],
      };
      
    case 'TABLE_SELECT':
      return { ...state, selectedTable: action.payload };
      
    case 'TABLE_DESELECT':
      return { ...state, selectedTable: null };
      
    case 'TABLE_UPDATE':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.payload.id ? action.payload : table
        ),
        selectedTable: state.selectedTable?.id === action.payload.id 
          ? action.payload 
          : state.selectedTable,
      };
      
    case 'TABLE_ADD':
      return {
        ...state,
        tables: [...state.tables, action.payload],
      };
      
    case 'TABLE_REMOVE':
      return {
        ...state,
        tables: state.tables.filter(table => table.id !== action.payload),
        selectedTable: state.selectedTable?.id === action.payload ? null : state.selectedTable,
      };
      
    case 'TABLE_STATUS_UPDATE':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.payload.tableId
            ? { 
                ...table, 
                status: action.payload.status,
                notes: action.payload.notes || table.notes,
                updated_at: new Date().toISOString(),
              }
            : table
        ),
      };
      
    case 'ORDER_SET':
      return { ...state, activeOrder: action.payload };
      
    case 'ORDER_CLEAR':
      return { ...state, activeOrder: null };
      
    case 'ORDER_UPDATE':
      return { ...state, activeOrder: action.payload };
      
    case 'REALTIME_CONNECT':
      return { ...state, isConnectedToUpdates: true };
      
    case 'REALTIME_DISCONNECT':
      return { ...state, isConnectedToUpdates: false };
      
    case 'REALTIME_UPDATE':
      // Handle real-time table updates
      if (action.payload.type === 'table_update') {
        const updatedTable = action.payload.table;
        return {
          ...state,
          tables: state.tables.map(table =>
            table.id === updatedTable.id ? updatedTable : table
          ),
        };
      }
      return state;
      
    case 'TABLE_SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'TABLE_CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'TABLE_SET_GRID_CONFIG':
      return { ...state, gridConfig: action.payload };
      
    default:
      return state;
  }
};