/**
 * Table Management Context
 * Global state management for table management settings
 * Following Context API pattern with reducer (SOLID principles)
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import {
  Table,
  Area,
  TableStatus,
  Position,
  CreateTableRequest,
  UpdateTableRequest,
  CreateAreaRequest,
  UpdateAreaRequest,
  TableFilters,
} from '@/types/settings/table-management.types';
import {
  MockTableManagementService,
  MockAreaService,
  MockTableOperationsService,
  MockReservationService,
} from '@/services/tableManagement';

// ==================== STATE TYPES ====================

interface TableManagementState {
  // Data
  tables: Table[];
  areas: Area[];
  selectedTable: Table | null;

  // UI State
  filters: TableFilters;
  searchQuery: string;

  // Loading & Error
  isLoading: boolean;
  error: string | null;
}

// ==================== ACTION TYPES ====================

type TableManagementAction =
  | { type: 'SET_TABLES'; payload: Table[] }
  | { type: 'SET_AREAS'; payload: Area[] }
  | { type: 'SELECT_TABLE'; payload: Table | null }
  | { type: 'ADD_TABLE'; payload: Table }
  | { type: 'UPDATE_TABLE'; payload: { id: string; table: Table } }
  | { type: 'REMOVE_TABLE'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TableFilters> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// ==================== INITIAL STATE ====================

const initialState: TableManagementState = {
  tables: [],
  areas: [],
  selectedTable: null,
  filters: {
    status: 'all',
  },
  searchQuery: '',
  isLoading: false,
  error: null,
};

// ==================== REDUCER ====================

function tableManagementReducer(
  state: TableManagementState,
  action: TableManagementAction
): TableManagementState {
  switch (action.type) {
    case 'SET_TABLES':
      return { ...state, tables: action.payload, isLoading: false };

    case 'SET_AREAS':
      return { ...state, areas: action.payload };

    case 'SELECT_TABLE':
      return { ...state, selectedTable: action.payload };

    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, action.payload] };

    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.payload.id ? action.payload.table : t
        ),
      };

    case 'REMOVE_TABLE':
      return {
        ...state,
        tables: state.tables.filter((t) => t.id !== action.payload),
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// ==================== CONTEXT TYPE ====================

interface TableManagementContextType {
  state: TableManagementState;

  // Table operations
  loadTables: (restaurantId: string) => Promise<void>;
  createTable: (data: CreateTableRequest) => Promise<void>;
  updateTable: (id: string, data: UpdateTableRequest) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  updateTableStatus: (id: string, status: TableStatus) => Promise<void>;
  updateTablePosition: (id: string, position: Position) => Promise<void>;

  // Area operations
  loadAreas: (restaurantId: string) => Promise<void>;
  createArea: (data: CreateAreaRequest) => Promise<void>;
  updateArea: (id: string, data: UpdateAreaRequest) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;

  // Selection & Filters
  selectTable: (table: Table | null) => void;
  setFilters: (filters: Partial<TableFilters>) => void;
  setSearchQuery: (query: string) => void;

  // Error handling
  clearError: () => void;
}

// ==================== CONTEXT ====================

const TableManagementContext = createContext<
  TableManagementContextType | undefined
>(undefined);

// ==================== PROVIDER ====================

interface TableManagementProviderProps {
  children: ReactNode;
}

export const TableManagementProvider: React.FC<
  TableManagementProviderProps
> = ({ children }) => {
  const [state, dispatch] = useReducer(tableManagementReducer, initialState);

  // Initialize services (using mock services for now)
  const tableService = new MockTableManagementService();
  const areaService = new MockAreaService();
  const operationsService = new MockTableOperationsService();
  const reservationService = new MockReservationService();

  // ==================== TABLE OPERATIONS ====================

  const loadTables = useCallback(async (restaurantId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const tables = await tableService.getTables(restaurantId);
      dispatch({ type: 'SET_TABLES', payload: tables });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load tables',
      });
    }
  }, []);

  const createTable = useCallback(async (data: CreateTableRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newTable = await tableService.createTable(data);
      dispatch({ type: 'ADD_TABLE', payload: newTable });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to create table',
      });
      throw error;
    }
  }, []);

  const updateTable = useCallback(
    async (id: string, data: UpdateTableRequest) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const updatedTable = await tableService.updateTable(id, data);
        dispatch({ type: 'UPDATE_TABLE', payload: { id, table: updatedTable } });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to update table',
        });
        throw error;
      }
    },
    []
  );

  const deleteTable = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await tableService.deleteTable(id);
      dispatch({ type: 'REMOVE_TABLE', payload: id });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to delete table',
      });
      throw error;
    }
  }, []);

  const updateTableStatus = useCallback(
    async (id: string, status: TableStatus) => {
      try {
        const updatedTable = await tableService.updateTableStatus(id, status);
        dispatch({ type: 'UPDATE_TABLE', payload: { id, table: updatedTable } });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : 'Failed to update table status',
        });
        throw error;
      }
    },
    []
  );

  const updateTablePosition = useCallback(
    async (id: string, position: Position) => {
      try {
        const updatedTable = await tableService.updateTablePosition(
          id,
          position
        );
        dispatch({ type: 'UPDATE_TABLE', payload: { id, table: updatedTable } });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : 'Failed to update table position',
        });
        throw error;
      }
    },
    []
  );

  // ==================== AREA OPERATIONS ====================

  const loadAreas = useCallback(async (restaurantId: string) => {
    try {
      const areas = await areaService.getAreas(restaurantId);
      dispatch({ type: 'SET_AREAS', payload: areas });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load areas',
      });
    }
  }, []);

  const createArea = useCallback(async (data: CreateAreaRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await areaService.createArea(data);
      // Reload areas after creation
      await loadAreas(data.restaurant_id);
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to create area',
      });
      throw error;
    }
  }, [loadAreas]);

  const updateArea = useCallback(
    async (id: string, data: UpdateAreaRequest) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await areaService.updateArea(id, data);
        // Reload areas after update
        const currentArea = state.areas.find((a) => a.id === id);
        if (currentArea) {
          await loadAreas(currentArea.restaurant_id);
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to update area',
        });
        throw error;
      }
    },
    [state.areas, loadAreas]
  );

  const deleteArea = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await areaService.deleteArea(id);
      // Reload areas after deletion
      const currentArea = state.areas.find((a) => a.id === id);
      if (currentArea) {
        await loadAreas(currentArea.restaurant_id);
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to delete area',
      });
      throw error;
    }
  }, [state.areas, loadAreas]);

  // ==================== UI OPERATIONS ====================

  const selectTable = useCallback((table: Table | null) => {
    dispatch({ type: 'SELECT_TABLE', payload: table });
  }, []);

  const setFilters = useCallback((filters: Partial<TableFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ==================== CONTEXT VALUE ====================

  const value: TableManagementContextType = {
    state,
    loadTables,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    updateTablePosition,
    loadAreas,
    createArea,
    updateArea,
    deleteArea,
    selectTable,
    setFilters,
    setSearchQuery,
    clearError,
  };

  return (
    <TableManagementContext.Provider value={value}>
      {children}
    </TableManagementContext.Provider>
  );
};

// ==================== HOOK ====================

export const useTableManagement = (): TableManagementContextType => {
  const context = useContext(TableManagementContext);
  if (!context) {
    throw new Error(
      'useTableManagement must be used within TableManagementProvider'
    );
  }
  return context;
};
