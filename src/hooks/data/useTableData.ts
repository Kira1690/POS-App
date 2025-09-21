/**
 * Table Data Management Hook
 * Uses TableService via dependency injection for data operations
 * Follows Single Responsibility Principle - table data management only
 * Clean separation from business logic and UI concerns
 */

import { useState, useCallback, useEffect } from 'react';
import { useTableService } from '@/hooks/services';
import { Table, CreateTableRequest, UpdateTableStatusRequest } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';

export interface TableDataState {
  tables: Table[];
  selectedTable: Table | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  outOfService: number;
  occupancyRate: number;
}

export interface UseTableDataResult {
  // State
  state: TableDataState;
  
  // Data Operations
  loadTables: (restaurantId?: string) => Promise<void>;
  loadTable: (tableId: string) => Promise<void>;
  refreshTables: () => Promise<void>;
  
  // Table Operations
  updateTableStatus: (tableId: string, statusData: UpdateTableStatusRequest) => Promise<void>;
  createTable: (tableData: CreateTableRequest) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  
  // Selection
  selectTable: (table: Table | null) => void;
  
  // Filtering & Search
  getTablesByStatus: (status: TableStatus) => Table[];
  getTablesByServiceArea: (serviceArea: string) => Table[];
  searchTables: (query: string) => Table[];
  getAvailableTables: () => Table[];
  
  // Statistics
  getTableStats: () => TableStats;
  
  // Error Handling
  clearError: () => void;
}

/**
 * Hook for table data management
 * Uses TableService via dependency injection for all data operations
 * 
 * @returns Table data state and operations
 */
export function useTableData(): UseTableDataResult {
  // Use DI service
  const tableService = useTableService();

  // Local state for data management
  const [state, setState] = useState<TableDataState>({
    tables: [],
    selectedTable: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Load tables
  const loadTables = useCallback(async (restaurantId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await tableService.getTables({ restaurantId });
      setState(prev => ({
        ...prev,
        tables: response.data || [],
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load tables',
        isLoading: false,
      }));
    }
  }, [tableService]);

  // Load single table
  const loadTable = useCallback(async (tableId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const table = await tableService.getTable(tableId);
      
      setState(prev => ({
        ...prev,
        selectedTable: table,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load table',
        isLoading: false,
      }));
    }
  }, [tableService]);

  // Refresh tables
  const refreshTables = useCallback(async () => {
    await loadTables();
  }, [loadTables]);

  // Update table status
  const updateTableStatus = useCallback(async (tableId: string, statusData: UpdateTableStatusRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedTable = await tableService.updateTableStatus(tableId, statusData);
      
      setState(prev => ({
        ...prev,
        tables: prev.tables.map(table => 
          table.id === tableId ? updatedTable : table
        ),
        selectedTable: prev.selectedTable?.id === tableId ? updatedTable : prev.selectedTable,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update table status',
        isLoading: false,
      }));
    }
  }, [tableService]);

  // Create table
  const createTable = useCallback(async (tableData: CreateTableRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newTable = await tableService.createTable(tableData);
      
      setState(prev => ({
        ...prev,
        tables: [...prev.tables, newTable],
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create table',
        isLoading: false,
      }));
    }
  }, [tableService]);

  // Delete table
  const deleteTable = useCallback(async (tableId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await tableService.deleteTable(tableId);
      
      setState(prev => ({
        ...prev,
        tables: prev.tables.filter(table => table.id !== tableId),
        selectedTable: prev.selectedTable?.id === tableId ? null : prev.selectedTable,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete table',
        isLoading: false,
      }));
    }
  }, [tableService]);

  // Select table
  const selectTable = useCallback((table: Table | null) => {
    setState(prev => ({
      ...prev,
      selectedTable: table,
    }));
  }, []);

  // Get tables by status
  const getTablesByStatus = useCallback((status: TableStatus): Table[] => {
    return state.tables.filter(table => table.status === status);
  }, [state.tables]);

  // Get tables by service area
  const getTablesByServiceArea = useCallback((serviceArea: string): Table[] => {
    return state.tables.filter(table => table.service_area === serviceArea);
  }, [state.tables]);

  // Search tables
  const searchTables = useCallback((query: string): Table[] => {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return state.tables;
    }

    return state.tables.filter(table =>
      table.table_number.toLowerCase().includes(searchTerm) ||
      table.service_area?.toLowerCase().includes(searchTerm) ||
      table.notes?.toLowerCase().includes(searchTerm)
    );
  }, [state.tables]);

  // Get available tables
  const getAvailableTables = useCallback((): Table[] => {
    return getTablesByStatus(TableStatus.AVAILABLE);
  }, [getTablesByStatus]);

  // Calculate table statistics
  const getTableStats = useCallback((): TableStats => {
    const total = state.tables.length;
    const available = getTablesByStatus(TableStatus.AVAILABLE).length;
    const occupied = getTablesByStatus(TableStatus.OCCUPIED).length;
    const reserved = getTablesByStatus(TableStatus.RESERVED).length;
    const outOfService = getTablesByStatus(TableStatus.OUT_OF_SERVICE).length;
    
    const occupancyRate = total > 0 ? ((occupied + reserved) / total) * 100 : 0;

    return {
      total,
      available,
      occupied,
      reserved,
      outOfService,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
  }, [state.tables, getTablesByStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    state,
    loadTables,
    loadTable,
    refreshTables,
    updateTableStatus,
    createTable,
    deleteTable,
    selectTable,
    getTablesByStatus,
    getTablesByServiceArea,
    searchTables,
    getAvailableTables,
    getTableStats,
    clearError,
  };
}

/**
 * Hook for table data with real-time updates
 * Automatically refreshes table status at specified intervals
 */
export function useTableDataWithRefresh(refreshInterval = 20000) {
  const tableData = useTableData();

  useEffect(() => {
    // Initial load
    tableData.loadTables();

    // Set up refresh interval
    const interval = setInterval(() => {
      tableData.refreshTables();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [tableData, refreshInterval]);

  return tableData;
}