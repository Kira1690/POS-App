/**
 * Mock Area Data
 * Centralized sample data for restaurant areas/sections
 * Following data structure design from prep/settings-table-management/data-structure.md
 */

import { MOCK_TABLES } from './mockTables';

export interface MockArea {
  id: string;
  name: string;
  icon: string; // MaterialCommunityIcons name
  description: string;
  isActive: boolean;
  color?: string; // Optional custom color
}

/**
 * 4 Sample Restaurant Areas
 * Matching the table distribution in mockTables.ts
 */
export const MOCK_AREAS: MockArea[] = [
  {
    id: 'area-1',
    name: 'Main Dining',
    icon: 'silverware-fork-knife',
    description: 'Primary dining area with standard seating',
    isActive: true,
  },
  {
    id: 'area-2',
    name: 'VIP Lounge',
    icon: 'glass-cocktail',
    description: 'Premium seating area for special guests',
    isActive: true,
  },
  {
    id: 'area-3',
    name: 'Patio',
    icon: 'tree',
    description: 'Outdoor seating area with garden view',
    isActive: true,
  },
  {
    id: 'area-4',
    name: 'Bar Seating',
    icon: 'glass-mug-variant',
    description: 'Casual bar-side seating area',
    isActive: true,
  },
];

/**
 * Area statistics with table counts and capacity
 */
export interface AreaStats {
  id: string;
  name: string;
  icon: string;
  tables: number;
  capacity: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
}

/**
 * Calculate statistics for each area
 */
export const getAreaStats = (): AreaStats[] => {
  return MOCK_AREAS.map(area => {
    const areaTables = MOCK_TABLES.filter(t => t.areaId === area.id);

    return {
      id: area.id,
      name: area.name,
      icon: area.icon,
      tables: areaTables.length,
      capacity: areaTables.reduce((sum, t) => sum + t.capacity, 0),
      available: areaTables.filter(t => t.status === 'available').length,
      occupied: areaTables.filter(t => t.status === 'occupied').length,
      reserved: areaTables.filter(t => t.status === 'reserved').length,
      cleaning: areaTables.filter(t => t.status === 'cleaning').length,
    };
  });
};

/**
 * Get area by ID
 */
export const getAreaById = (id: string): MockArea | undefined => {
  return MOCK_AREAS.find(area => area.id === id);
};

/**
 * Get area by name
 */
export const getAreaByName = (name: string): MockArea | undefined => {
  return MOCK_AREAS.find(area => area.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get active areas only
 */
export const getActiveAreas = (): MockArea[] => {
  return MOCK_AREAS.filter(area => area.isActive);
};

/**
 * Total restaurant statistics across all areas
 */
export const TOTAL_STATS = {
  areas: MOCK_AREAS.length,
  tables: MOCK_TABLES.length,
  totalCapacity: MOCK_TABLES.reduce((sum, t) => sum + t.capacity, 0),
  available: MOCK_TABLES.filter(t => t.status === 'available').length,
  occupied: MOCK_TABLES.filter(t => t.status === 'occupied').length,
  reserved: MOCK_TABLES.filter(t => t.status === 'reserved').length,
  cleaning: MOCK_TABLES.filter(t => t.status === 'cleaning').length,
};
