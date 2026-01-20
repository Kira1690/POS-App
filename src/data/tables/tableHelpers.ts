/**
 * Table Helper Utilities
 * Pure functions for table management operations
 * Following SOLID principles - Single Responsibility
 */

import { MockTable, TableStatus } from './mockTables';
import { MockArea } from './mockAreas';

/**
 * Filter tables by status
 */
export const filterTablesByStatus = (
  tables: MockTable[],
  status: TableStatus | 'all'
): MockTable[] => {
  if (status === 'all') return tables;
  return tables.filter(table => table.status === status);
};

/**
 * Filter tables by area
 */
export const filterTablesByArea = (
  tables: MockTable[],
  areaId: string | 'all'
): MockTable[] => {
  if (areaId === 'all') return tables;
  return tables.filter(table => table.areaId === areaId);
};

/**
 * Filter tables by capacity range
 */
export const filterTablesByCapacity = (
  tables: MockTable[],
  minCapacity: number,
  maxCapacity: number
): MockTable[] => {
  return tables.filter(
    table => table.capacity >= minCapacity && table.capacity <= maxCapacity
  );
};

/**
 * Sort tables by number (alphanumeric)
 */
export const sortTablesByNumber = (tables: MockTable[]): MockTable[] => {
  return [...tables].sort((a, b) => {
    return a.number.localeCompare(b.number, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
};

/**
 * Sort tables by capacity (descending)
 */
export const sortTablesByCapacity = (
  tables: MockTable[],
  ascending: boolean = false
): MockTable[] => {
  return [...tables].sort((a, b) => {
    return ascending ? a.capacity - b.capacity : b.capacity - a.capacity;
  });
};

/**
 * Sort tables by area name
 */
export const sortTablesByArea = (tables: MockTable[]): MockTable[] => {
  return [...tables].sort((a, b) => a.area.localeCompare(b.area));
};

/**
 * Calculate total capacity for a set of tables
 */
export const calculateTotalCapacity = (tables: MockTable[]): number => {
  return tables.reduce((sum, table) => sum + table.capacity, 0);
};

/**
 * Calculate status counts for a set of tables
 */
export const calculateStatusCounts = (tables: MockTable[]) => {
  return {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };
};

/**
 * Get status color mapping (theme-aware)
 */
export const getStatusColorKey = (status: TableStatus): string => {
  const colorMap: Record<TableStatus, string> = {
    available: 'success',
    occupied: 'error',
    reserved: 'warning',
    cleaning: 'info',
    out_of_order: 'outline',
    out_of_service: 'outline',
  };
  return colorMap[status];
};

/**
 * Get status display label
 */
export const getStatusLabel = (status: TableStatus): string => {
  const labelMap: Record<TableStatus, string> = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    cleaning: 'Cleaning',
    out_of_order: 'Out of Order',
    out_of_service: 'Out of Service',
  };
  return labelMap[status];
};

/**
 * Validate table number format (T-1, VIP-1, P-1, B-1)
 */
export const isValidTableNumber = (number: string): boolean => {
  const pattern = /^[A-Z]+-\d+$/;
  return pattern.test(number);
};

/**
 * Generate next table number for an area
 */
export const generateNextTableNumber = (
  tables: MockTable[],
  areaPrefix: string
): string => {
  const areaTables = tables.filter(t => t.number.startsWith(areaPrefix));
  const maxNumber = areaTables.reduce((max, table) => {
    const num = parseInt(table.number.split('-')[1], 10);
    return num > max ? num : max;
  }, 0);
  return `${areaPrefix}-${maxNumber + 1}`;
};

/**
 * Check if table number is unique
 */
export const isTableNumberUnique = (
  tables: MockTable[],
  number: string,
  excludeId?: string
): boolean => {
  return !tables.some(
    table => table.number === number && table.id !== excludeId
  );
};

/**
 * Find available tables for party size
 */
export const findAvailableTablesForParty = (
  tables: MockTable[],
  partySize: number
): MockTable[] => {
  return tables.filter(
    table => table.status === 'available' && table.capacity >= partySize
  );
};

/**
 * Calculate occupancy rate (percentage)
 */
export const calculateOccupancyRate = (tables: MockTable[]): number => {
  const occupiedCount = tables.filter(
    t => t.status === 'occupied' || t.status === 'reserved'
  ).length;
  return tables.length > 0 ? (occupiedCount / tables.length) * 100 : 0;
};

/**
 * Group tables by area
 */
export const groupTablesByArea = (
  tables: MockTable[]
): Record<string, MockTable[]> => {
  return tables.reduce((groups, table) => {
    const areaId = table.areaId;
    if (!groups[areaId]) {
      groups[areaId] = [];
    }
    groups[areaId].push(table);
    return groups;
  }, {} as Record<string, MockTable[]>);
};

/**
 * Get area icon by area ID
 */
export const getAreaIcon = (areas: MockArea[], areaId: string): string => {
  const area = areas.find(a => a.id === areaId);
  return area?.icon || 'table-furniture';
};

/**
 * Validate capacity (must be between 1 and 20)
 */
export const isValidCapacity = (capacity: number): boolean => {
  return capacity >= 1 && capacity <= 20 && Number.isInteger(capacity);
};

/**
 * Search tables by number or area name
 */
export const searchTables = (
  tables: MockTable[],
  searchQuery: string
): MockTable[] => {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return tables;

  return tables.filter(
    table =>
      table.number.toLowerCase().includes(query) ||
      table.area.toLowerCase().includes(query)
  );
};
