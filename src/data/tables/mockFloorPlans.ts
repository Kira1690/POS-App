/**
 * Mock Floor Plans Data
 * Sample floor configurations for table management canvas
 */

import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
  ZoneType,
} from '@/types/settings/table-management.types';

// ==================== FLOORS ====================

export const MOCK_FLOORS: Floor[] = [
  {
    id: 'floor-main',
    restaurant_id: 'rest_001',
    name: 'Main Floor',
    display_order: 1,
    is_active: true,
    is_default: true,
    canvas_width: 1200,
    canvas_height: 800,
    grid_size: 50,
    grid_enabled: true,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
  {
    id: 'floor-patio',
    restaurant_id: 'rest_001',
    name: 'Outdoor Patio',
    display_order: 2,
    is_active: true,
    is_default: false,
    canvas_width: 800,
    canvas_height: 600,
    grid_size: 50,
    grid_enabled: true,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
  {
    id: 'floor-bar',
    restaurant_id: 'rest_001',
    name: 'Bar Area',
    display_order: 3,
    is_active: true,
    is_default: false,
    canvas_width: 600,
    canvas_height: 400,
    grid_size: 40,
    grid_enabled: true,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
];

// ==================== ZONES ====================

export const MOCK_ZONES: FloorZone[] = [
  // Main Floor Zones
  {
    id: 'zone-kitchen',
    floor_id: 'floor-main',
    name: 'Kitchen',
    type: 'kitchen' as ZoneType,
    bounds: { x: 0, y: 0, width: 250, height: 120 },
    color: 'outline',
    icon: 'chef-hat',
    is_seating_area: false,
    opacity: 0.3,
    is_locked: true,
    display_order: 1,
  },
  {
    id: 'zone-vip',
    floor_id: 'floor-main',
    name: 'VIP Lounge',
    type: 'vip' as ZoneType,
    bounds: { x: 850, y: 500, width: 300, height: 250 },
    color: 'warning',
    icon: 'crown',
    is_seating_area: true,
    opacity: 0.2,
    is_locked: false,
    display_order: 2,
  },
  {
    id: 'zone-bar-counter',
    floor_id: 'floor-main',
    name: 'Bar Counter',
    type: 'bar' as ZoneType,
    bounds: { x: 0, y: 650, width: 500, height: 100 },
    color: 'info',
    icon: 'glass-cocktail',
    is_seating_area: true,
    opacity: 0.2,
    is_locked: false,
    display_order: 3,
  },
  {
    id: 'zone-entrance',
    floor_id: 'floor-main',
    name: 'Entrance',
    type: 'entrance' as ZoneType,
    bounds: { x: 1050, y: 0, width: 150, height: 100 },
    color: 'outline',
    icon: 'door-open',
    is_seating_area: false,
    opacity: 0.2,
    is_locked: true,
    display_order: 4,
  },
  // Patio Zones
  {
    id: 'zone-garden',
    floor_id: 'floor-patio',
    name: 'Garden Section',
    type: 'outdoor' as ZoneType,
    bounds: { x: 50, y: 50, width: 350, height: 250 },
    color: 'success',
    icon: 'flower',
    is_seating_area: true,
    opacity: 0.15,
    is_locked: false,
    display_order: 1,
  },
  {
    id: 'zone-umbrella',
    floor_id: 'floor-patio',
    name: 'Covered Area',
    type: 'outdoor' as ZoneType,
    bounds: { x: 450, y: 50, width: 300, height: 200 },
    color: 'info',
    icon: 'umbrella',
    is_seating_area: true,
    opacity: 0.15,
    is_locked: false,
    display_order: 2,
  },
  // Bar Area Zones
  {
    id: 'zone-main-bar',
    floor_id: 'floor-bar',
    name: 'Main Bar',
    type: 'bar' as ZoneType,
    bounds: { x: 0, y: 250, width: 600, height: 150 },
    color: 'info',
    icon: 'glass-cocktail',
    is_seating_area: true,
    opacity: 0.2,
    is_locked: false,
    display_order: 1,
  },
];

// ==================== TABLE POSITIONS ====================
// Uses table IDs from MOCK_TABLES (t-001 through t-030)

export const MOCK_TABLE_POSITIONS: FloorPlanTablePosition[] = [
  // Main Floor Tables - Main Dining Area (t-001 through t-012)
  { table_id: 't-001', floor_id: 'floor-main', x: 100, y: 200, rotation: 0 },
  { table_id: 't-002', floor_id: 'floor-main', x: 250, y: 200, rotation: 0 },
  { table_id: 't-003', floor_id: 'floor-main', x: 400, y: 200, rotation: 0 },
  { table_id: 't-004', floor_id: 'floor-main', x: 550, y: 200, rotation: 0 },
  { table_id: 't-005', floor_id: 'floor-main', x: 100, y: 350, rotation: 0 },
  { table_id: 't-006', floor_id: 'floor-main', x: 250, y: 350, rotation: 0 },
  { table_id: 't-007', floor_id: 'floor-main', x: 400, y: 350, rotation: 0 },
  { table_id: 't-008', floor_id: 'floor-main', x: 550, y: 350, rotation: 0 },
  { table_id: 't-009', floor_id: 'floor-main', x: 100, y: 500, rotation: 0 },
  { table_id: 't-010', floor_id: 'floor-main', x: 250, y: 500, rotation: 0 },
  { table_id: 't-011', floor_id: 'floor-main', x: 400, y: 500, rotation: 0 },
  { table_id: 't-012', floor_id: 'floor-main', x: 550, y: 500, rotation: 0 },
  // Main Floor - VIP Area (t-013 through t-016)
  { table_id: 't-013', floor_id: 'floor-main', x: 900, y: 550, rotation: 0 },
  { table_id: 't-014', floor_id: 'floor-main', x: 1050, y: 550, rotation: 0 },
  { table_id: 't-015', floor_id: 'floor-main', x: 900, y: 680, rotation: 0 },
  { table_id: 't-016', floor_id: 'floor-main', x: 1050, y: 680, rotation: 0 },
  // Main Floor - Bar Seating (t-027 through t-030)
  { table_id: 't-027', floor_id: 'floor-main', x: 50, y: 680, rotation: 0 },
  { table_id: 't-028', floor_id: 'floor-main', x: 150, y: 680, rotation: 0 },
  { table_id: 't-029', floor_id: 'floor-main', x: 250, y: 680, rotation: 0 },
  { table_id: 't-030', floor_id: 'floor-main', x: 350, y: 680, rotation: 0 },
  // Patio Tables (t-019 through t-026)
  { table_id: 't-019', floor_id: 'floor-patio', x: 100, y: 100, rotation: 0 },
  { table_id: 't-020', floor_id: 'floor-patio', x: 250, y: 100, rotation: 0 },
  { table_id: 't-021', floor_id: 'floor-patio', x: 100, y: 220, rotation: 0 },
  { table_id: 't-022', floor_id: 'floor-patio', x: 250, y: 220, rotation: 0 },
  { table_id: 't-023', floor_id: 'floor-patio', x: 500, y: 100, rotation: 0 },
  { table_id: 't-024', floor_id: 'floor-patio', x: 650, y: 100, rotation: 0 },
  { table_id: 't-025', floor_id: 'floor-patio', x: 500, y: 220, rotation: 45 },
  { table_id: 't-026', floor_id: 'floor-patio', x: 650, y: 220, rotation: 45 },
  // Bar Area Tables (t-017, t-018 from VIP for variety)
  { table_id: 't-017', floor_id: 'floor-bar', x: 100, y: 100, rotation: 0 },
  { table_id: 't-018', floor_id: 'floor-bar', x: 250, y: 100, rotation: 0 },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get floor by ID
 */
export const getFloorById = (floorId: string): Floor | undefined => {
  return MOCK_FLOORS.find(floor => floor.id === floorId);
};

/**
 * Get default floor
 */
export const getDefaultFloor = (): Floor | undefined => {
  return MOCK_FLOORS.find(floor => floor.is_default);
};

/**
 * Get active floors sorted by display order
 */
export const getActiveFloors = (): Floor[] => {
  return MOCK_FLOORS
    .filter(floor => floor.is_active)
    .sort((a, b) => a.display_order - b.display_order);
};

/**
 * Get zones for a specific floor
 */
export const getZonesByFloor = (floorId: string): FloorZone[] => {
  return MOCK_ZONES
    .filter(zone => zone.floor_id === floorId)
    .sort((a, b) => a.display_order - b.display_order);
};

/**
 * Get table positions for a specific floor
 */
export const getTablePositionsByFloor = (floorId: string): FloorPlanTablePosition[] => {
  return MOCK_TABLE_POSITIONS.filter(pos => pos.floor_id === floorId);
};

/**
 * Get zone by ID
 */
export const getZoneById = (zoneId: string): FloorZone | undefined => {
  return MOCK_ZONES.find(zone => zone.id === zoneId);
};

/**
 * Get table position by table ID
 */
export const getTablePositionById = (tableId: string): FloorPlanTablePosition | undefined => {
  return MOCK_TABLE_POSITIONS.find(pos => pos.table_id === tableId);
};

/**
 * Check if a position is within a zone bounds
 */
export const isPositionInZone = (
  x: number,
  y: number,
  zone: FloorZone
): boolean => {
  return (
    x >= zone.bounds.x &&
    x <= zone.bounds.x + zone.bounds.width &&
    y >= zone.bounds.y &&
    y <= zone.bounds.y + zone.bounds.height
  );
};

/**
 * Check if a position is in a seating area
 */
export const isPositionInSeatingArea = (
  x: number,
  y: number,
  floorId: string
): boolean => {
  const zones = getZonesByFloor(floorId);

  // Check if position is in any non-seating zone
  for (const zone of zones) {
    if (!zone.is_seating_area && isPositionInZone(x, y, zone)) {
      return false;
    }
  }

  return true;
};

/**
 * Snap position to grid
 */
export const snapToGrid = (
  value: number,
  gridSize: number
): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Get floor statistics
 */
export const getFloorStats = (floorId: string) => {
  const zones = getZonesByFloor(floorId);
  const tables = getTablePositionsByFloor(floorId);

  return {
    totalZones: zones.length,
    seatingZones: zones.filter(z => z.is_seating_area).length,
    nonSeatingZones: zones.filter(z => !z.is_seating_area).length,
    totalTables: tables.length,
  };
};
