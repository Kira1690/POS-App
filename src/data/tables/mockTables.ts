/**
 * Mock Table Data
 * Centralized sample data for table management
 * Following data structure design from prep/settings-table-management/data-structure.md
 */

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order' | 'out_of_service';

export interface MockTable {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  area: string;
  areaId: string;
  positionX?: number;
  positionY?: number;
  shape?: 'square' | 'round' | 'rectangle';
  notes?: string;
}

/**
 * 30 Sample Tables across 4 areas
 * ALL tables start as 'available' - status is synced with active orders at runtime
 * Table occupancy is determined by order status, not hardcoded values
 */
export const MOCK_TABLES: MockTable[] = [
  // MAIN DINING (12 tables, 48 seats)
  { id: 't-001', number: 'T-1', capacity: 4, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 50, positionY: 50, shape: 'square' },
  { id: 't-002', number: 'T-2', capacity: 2, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 150, positionY: 50, shape: 'round' },
  { id: 't-003', number: 'T-3', capacity: 6, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 250, positionY: 50, shape: 'rectangle' },
  { id: 't-004', number: 'T-4', capacity: 4, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 50, positionY: 150, shape: 'square' },
  { id: 't-005', number: 'T-5', capacity: 4, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 150, positionY: 150, shape: 'square' },
  { id: 't-006', number: 'T-6', capacity: 4, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 250, positionY: 150, shape: 'square' },
  { id: 't-007', number: 'T-7', capacity: 4, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 50, positionY: 250, shape: 'square' },
  { id: 't-008', number: 'T-8', capacity: 6, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 150, positionY: 250, shape: 'rectangle' },
  { id: 't-009', number: 'T-9', capacity: 4, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 250, positionY: 250, shape: 'square' },
  { id: 't-010', number: 'T-10', capacity: 2, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 50, positionY: 350, shape: 'round' },
  { id: 't-011', number: 'T-11', capacity: 4, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 150, positionY: 350, shape: 'square' },
  { id: 't-012', number: 'T-12', capacity: 6, status: 'available', area: 'Main Dining', areaId: 'area-1', positionX: 250, positionY: 350, shape: 'rectangle' },

  // VIP LOUNGE (6 tables, 28 seats)
  { id: 't-013', number: 'VIP-1', capacity: 8, status: 'available', area: 'VIP Lounge', areaId: 'area-2', positionX: 400, positionY: 50, shape: 'rectangle' },
  { id: 't-014', number: 'VIP-2', capacity: 6, status: 'available', area: 'VIP Lounge', areaId: 'area-2', positionX: 400, positionY: 150, shape: 'rectangle' },
  { id: 't-015', number: 'VIP-3', capacity: 4, status: 'available', area: 'VIP Lounge', areaId: 'area-2', positionX: 400, positionY: 250, shape: 'square' },
  { id: 't-016', number: 'VIP-4', capacity: 4, status: 'available', area: 'VIP Lounge', areaId: 'area-2', positionX: 500, positionY: 50, shape: 'square' },
  { id: 't-017', number: 'VIP-5', capacity: 4, status: 'available', area: 'VIP Lounge', areaId: 'area-2', positionX: 500, positionY: 150, shape: 'square' },
  { id: 't-018', number: 'VIP-6', capacity: 2, status: 'available', area: 'VIP Lounge', areaId: 'area-2', positionX: 500, positionY: 250, shape: 'round' },

  // PATIO (8 tables, 32 seats)
  { id: 't-019', number: 'P-1', capacity: 4, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 50, positionY: 450, shape: 'square' },
  { id: 't-020', number: 'P-2', capacity: 4, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 150, positionY: 450, shape: 'square' },
  { id: 't-021', number: 'P-3', capacity: 4, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 250, positionY: 450, shape: 'square' },
  { id: 't-022', number: 'P-4', capacity: 4, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 50, positionY: 550, shape: 'square' },
  { id: 't-023', number: 'P-5', capacity: 2, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 150, positionY: 550, shape: 'round' },
  { id: 't-024', number: 'P-6', capacity: 4, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 250, positionY: 550, shape: 'square' },
  { id: 't-025', number: 'P-7', capacity: 6, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 50, positionY: 650, shape: 'rectangle' },
  { id: 't-026', number: 'P-8', capacity: 4, status: 'available', area: 'Patio', areaId: 'area-3', positionX: 150, positionY: 650, shape: 'square' },

  // BAR SEATING (4 tables, 12 seats)
  { id: 't-027', number: 'B-1', capacity: 2, status: 'available', area: 'Bar Seating', areaId: 'area-4', positionX: 400, positionY: 450, shape: 'round' },
  { id: 't-028', number: 'B-2', capacity: 2, status: 'available', area: 'Bar Seating', areaId: 'area-4', positionX: 450, positionY: 450, shape: 'round' },
  { id: 't-029', number: 'B-3', capacity: 4, status: 'available', area: 'Bar Seating', areaId: 'area-4', positionX: 400, positionY: 550, shape: 'square' },
  { id: 't-030', number: 'B-4', capacity: 4, status: 'available', area: 'Bar Seating', areaId: 'area-4', positionX: 450, positionY: 550, shape: 'square' },
];

/**
 * Statistics calculated from mock data
 */
export const TABLE_STATS = {
  total: MOCK_TABLES.length,
  totalCapacity: MOCK_TABLES.reduce((sum, t) => sum + t.capacity, 0),
  available: MOCK_TABLES.filter(t => t.status === 'available').length,
  occupied: MOCK_TABLES.filter(t => t.status === 'occupied').length,
  reserved: MOCK_TABLES.filter(t => t.status === 'reserved').length,
  cleaning: MOCK_TABLES.filter(t => t.status === 'cleaning').length,
};

/**
 * Get tables by area
 */
export const getTablesByArea = (areaId: string): MockTable[] => {
  return MOCK_TABLES.filter(table => table.areaId === areaId);
};

/**
 * Get tables by status
 */
export const getTablesByStatus = (status: TableStatus): MockTable[] => {
  return MOCK_TABLES.filter(table => table.status === status);
};

/**
 * Get table by ID
 */
export const getTableById = (id: string): MockTable | undefined => {
  return MOCK_TABLES.find(table => table.id === id);
};

/**
 * Get table by number
 */
export const getTableByNumber = (number: string): MockTable | undefined => {
  return MOCK_TABLES.find(table => table.number === number);
};
