# Table Management - Data Structure & TypeScript Interfaces

**Project:** POS Settings - Table Management System
**Created:** 2025-10-08

---

## Table of Contents
1. [Overview](#overview)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Data Storage Structure](#data-storage-structure)
4. [Mock Data Files](#mock-data-files)
5. [API Integration (Future)](#api-integration-future)
6. [Data Validation](#data-validation)

---

## Overview

### Data Location Strategy
```
/src/data/tables/
├── index.ts              # Main export file
├── mockTables.ts         # Sample table data
├── mockAreas.ts          # Sample area/section data
├── mockFloorPlans.ts     # Sample floor plan configurations
└── tableHelpers.ts       # Utility functions
```

### Data Flow Architecture
```
Component → useTableData Hook → Data Service → Mock Data (Dev) / API (Prod)
```

---

## TypeScript Interfaces

### Core Table Interface
```typescript
/**
 * Table entity - represents a physical table in the restaurant
 * Location: /src/types/settings/table-management.types.ts
 */
export interface Table {
  // Identity
  id: string;                           // Unique identifier (UUID)
  restaurant_id: string;                 // Restaurant association
  table_number: string;                  // Display number (T-1, VIP-1, etc.)

  // Physical properties
  capacity: number;                      // Number of seats
  shape: TableShape;                     // Visual representation
  position?: TablePosition;              // Floor plan coordinates

  // Organizational
  area_id: string;                       // Section/area assignment
  area_name?: string;                    // Denormalized for quick access

  // Status management
  status: TableStatus;                   // Current state
  current_order_id?: string;             // Active order reference
  reserved_until?: string;               // ISO date string

  // Maintenance tracking
  last_cleaned?: string;                 // ISO date string
  last_used?: string;                    // ISO date string
  last_used_duration_minutes?: number;   // Service duration

  // Additional info
  notes?: string;                        // Special instructions
  is_active: boolean;                    // Soft delete flag

  // Timestamps
  created_at: string;                    // ISO date string
  updated_at: string;                    // ISO date string
  created_by?: string;                   // User ID
  updated_by?: string;                   // User ID
}
```

### Table Shape Enum
```typescript
/**
 * Table shape options for visual representation
 */
export enum TableShape {
  CIRCLE = 'circle',
  SQUARE = 'square',
  RECTANGLE = 'rectangle',
  OVAL = 'oval',
  BOOTH = 'booth',
}

/**
 * Icon mapping for each shape (MaterialCommunityIcons)
 */
export const TABLE_SHAPE_ICONS: Record<TableShape, string> = {
  [TableShape.CIRCLE]: 'circle-outline',
  [TableShape.SQUARE]: 'square-outline',
  [TableShape.RECTANGLE]: 'rectangle-outline',
  [TableShape.OVAL]: 'ellipse-outline',
  [TableShape.BOOTH]: 'sofa-outline',
};
```

### Table Status Type
```typescript
/**
 * Table status options
 */
export type TableStatus =
  | 'available'    // Ready for seating
  | 'occupied'     // Currently in use
  | 'reserved'     // Future reservation
  | 'cleaning'     // Being cleaned
  | 'maintenance'  // Out of service
  | 'blocked';     // Admin blocked

/**
 * Status color mapping (theme-based)
 */
export const getTableStatusColor = (
  status: TableStatus,
  theme: Theme
): string => {
  switch (status) {
    case 'available':
      return theme.colors.success;
    case 'occupied':
      return theme.colors.error;
    case 'reserved':
      return theme.colors.warning;
    case 'cleaning':
      return theme.colors.info;
    case 'maintenance':
      return theme.colors.outline;
    case 'blocked':
      return theme.colors.primary;
    default:
      return theme.colors.outline;
  }
};
```

### Table Position Interface
```typescript
/**
 * Floor plan positioning
 */
export interface TablePosition {
  x: number;           // X coordinate (pixels)
  y: number;           // Y coordinate (pixels)
  rotation?: number;   // Rotation angle (0-360)
  floor_id?: string;   // Floor reference (multi-floor support)
}
```

### Area/Section Interface
```typescript
/**
 * Restaurant area/section entity
 */
export interface TableArea {
  // Identity
  id: string;
  restaurant_id: string;
  name: string;

  // Visual representation
  icon: string;                    // MaterialCommunityIcons name
  color: AreaColor;                // Theme color reference

  // Configuration
  description?: string;
  default_capacity?: number;        // Default for new tables
  default_shape?: TableShape;       // Default table shape
  auto_numbering: boolean;          // Auto-assign numbers
  number_prefix?: string;           // e.g., "VIP-", "PATIO-"

  // Statistics (calculated)
  table_count: number;
  total_capacity: number;
  available_count: number;

  // Status
  is_active: boolean;
  display_order: number;            // Sort order

  // Timestamps
  created_at: string;
  updated_at: string;
}
```

### Area Color Type
```typescript
/**
 * Area color options mapped to theme colors
 */
export type AreaColor =
  | 'success'   // Green
  | 'info'      // Blue
  | 'warning'   // Orange
  | 'error'     // Red
  | 'purple'    // Purple
  | 'primary';  // Dark gray

/**
 * Get theme color for area
 */
export const getAreaColor = (
  color: AreaColor,
  theme: Theme
): string => {
  return theme.colors[color];
};
```

### Floor Plan Interface
```typescript
/**
 * Floor plan configuration
 */
export interface FloorPlan {
  // Identity
  id: string;
  restaurant_id: string;
  name: string;

  // Layout configuration
  width: number;              // Canvas width (pixels)
  height: number;             // Canvas height (pixels)
  grid_size: number;          // Grid cell size (pixels)
  grid_enabled: boolean;      // Snap to grid

  // Special zones
  zones: FloorZone[];

  // Table positions
  table_positions: Record<string, TablePosition>; // tableId → position

  // Metadata
  is_default: boolean;
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}
```

### Floor Zone Interface
```typescript
/**
 * Special zones on floor plan (Kitchen, Bar, etc.)
 */
export interface FloorZone {
  id: string;
  name: string;
  type: ZoneType;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;              // Optional custom color
  icon?: string;               // MaterialCommunityIcons name
  is_seating_area: boolean;    // Can tables be placed here?
}

export type ZoneType =
  | 'kitchen'
  | 'bar'
  | 'entrance'
  | 'restroom'
  | 'storage'
  | 'office'
  | 'outdoor'
  | 'custom';
```

### Table History Interface
```typescript
/**
 * Table usage history
 */
export interface TableHistory {
  id: string;
  table_id: string;
  action: TableAction;
  timestamp: string;
  user_id?: string;
  user_name?: string;
  details?: Record<string, any>;
}

export type TableAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'cleaned'
  | 'reserved'
  | 'seated'
  | 'cleared';
```

### Form Input Types
```typescript
/**
 * Form data for creating a new table
 */
export interface CreateTableInput {
  table_number: string;
  capacity: number;
  area_id: string;
  shape: TableShape;
  position?: TablePosition;
  notes?: string;
}

/**
 * Form data for updating a table
 */
export interface UpdateTableInput {
  table_number?: string;
  capacity?: number;
  area_id?: string;
  shape?: TableShape;
  position?: TablePosition;
  notes?: string;
  status?: TableStatus;
}

/**
 * Form data for creating an area
 */
export interface CreateAreaInput {
  name: string;
  icon: string;
  color: AreaColor;
  description?: string;
  default_capacity?: number;
  default_shape?: TableShape;
  auto_numbering: boolean;
  number_prefix?: string;
}

/**
 * Form data for updating an area
 */
export interface UpdateAreaInput {
  name?: string;
  icon?: string;
  color?: AreaColor;
  description?: string;
  default_capacity?: number;
  default_shape?: TableShape;
  auto_numbering?: boolean;
  number_prefix?: string;
}
```

---

## Data Storage Structure

### File: `/src/data/tables/index.ts`
```typescript
/**
 * Table management data layer - Main exports
 */

// Mock data exports
export * from './mockTables';
export * from './mockAreas';
export * from './mockFloorPlans';

// Helper utilities
export * from './tableHelpers';

// Re-export for convenience
export { MOCK_TABLES } from './mockTables';
export { MOCK_AREAS } from './mockAreas';
export { MOCK_FLOOR_PLANS } from './mockFloorPlans';
```

### File: `/src/data/tables/mockTables.ts`
```typescript
/**
 * Mock table data for development
 */
import { Table, TableShape } from '@/types/settings/table-management.types';

export const MOCK_TABLES: Table[] = [
  {
    id: 'table_001',
    restaurant_id: 'rest_001',
    table_number: 'T-1',
    capacity: 4,
    shape: TableShape.CIRCLE,
    position: { x: 100, y: 100, rotation: 0 },
    area_id: 'area_001',
    area_name: 'Main Dining',
    status: 'available',
    is_active: true,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 'table_002',
    restaurant_id: 'rest_001',
    table_number: 'T-2',
    capacity: 2,
    shape: TableShape.SQUARE,
    position: { x: 200, y: 100, rotation: 0 },
    area_id: 'area_001',
    area_name: 'Main Dining',
    status: 'occupied',
    current_order_id: 'order_123',
    last_used: '2025-10-08T12:30:00Z',
    is_active: true,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-08T12:30:00Z',
  },
  {
    id: 'table_003',
    restaurant_id: 'rest_001',
    table_number: 'VIP-1',
    capacity: 8,
    shape: TableShape.RECTANGLE,
    position: { x: 400, y: 300, rotation: 0 },
    area_id: 'area_002',
    area_name: 'VIP Lounge',
    status: 'reserved',
    reserved_until: '2025-10-08T19:30:00Z',
    notes: 'Window seat, best for special occasions',
    is_active: true,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z',
  },
  // ... more tables
];

/**
 * Get tables by area
 */
export const getTablesByArea = (areaId: string): Table[] => {
  return MOCK_TABLES.filter(table => table.area_id === areaId && table.is_active);
};

/**
 * Get tables by status
 */
export const getTablesByStatus = (status: TableStatus): Table[] => {
  return MOCK_TABLES.filter(table => table.status === status && table.is_active);
};

/**
 * Get table by ID
 */
export const getTableById = (id: string): Table | undefined => {
  return MOCK_TABLES.find(table => table.id === id);
};
```

### File: `/src/data/tables/mockAreas.ts`
```typescript
/**
 * Mock area/section data for development
 */
import { TableArea, AreaColor } from '@/types/settings/table-management.types';

export const MOCK_AREAS: TableArea[] = [
  {
    id: 'area_001',
    restaurant_id: 'rest_001',
    name: 'Main Dining',
    icon: 'silverware-fork-knife',
    color: 'success' as AreaColor,
    description: 'Primary dining area with ambient lighting',
    default_capacity: 4,
    default_shape: TableShape.CIRCLE,
    auto_numbering: true,
    number_prefix: 'T-',
    table_count: 12,
    total_capacity: 48,
    available_count: 8,
    is_active: true,
    display_order: 1,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z',
  },
  {
    id: 'area_002',
    restaurant_id: 'rest_001',
    name: 'VIP Lounge',
    icon: 'crown',
    color: 'warning' as AreaColor,
    description: 'Exclusive seating for premium guests',
    default_capacity: 6,
    default_shape: TableShape.RECTANGLE,
    auto_numbering: true,
    number_prefix: 'VIP-',
    table_count: 4,
    total_capacity: 24,
    available_count: 2,
    is_active: true,
    display_order: 2,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z',
  },
  {
    id: 'area_003',
    restaurant_id: 'rest_001',
    name: 'Outdoor Patio',
    icon: 'weather-sunny',
    color: 'info' as AreaColor,
    description: 'Al fresco dining with garden view',
    default_capacity: 4,
    default_shape: TableShape.SQUARE,
    auto_numbering: true,
    number_prefix: 'PATIO-',
    table_count: 8,
    total_capacity: 32,
    available_count: 5,
    is_active: true,
    display_order: 3,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z',
  },
  {
    id: 'area_004',
    restaurant_id: 'rest_001',
    name: 'Bar Seating',
    icon: 'glass-cocktail',
    color: 'purple' as AreaColor,
    description: 'High-top seating at the bar',
    default_capacity: 2,
    default_shape: TableShape.SQUARE,
    auto_numbering: true,
    number_prefix: 'BAR-',
    table_count: 6,
    total_capacity: 12,
    available_count: 4,
    is_active: true,
    display_order: 4,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z',
  },
];

/**
 * Get area by ID
 */
export const getAreaById = (id: string): TableArea | undefined => {
  return MOCK_AREAS.find(area => area.id === id);
};

/**
 * Get active areas sorted by display order
 */
export const getActiveAreas = (): TableArea[] => {
  return MOCK_AREAS
    .filter(area => area.is_active)
    .sort((a, b) => a.display_order - b.display_order);
};
```

### File: `/src/data/tables/mockFloorPlans.ts`
```typescript
/**
 * Mock floor plan data for development
 */
import { FloorPlan, FloorZone } from '@/types/settings/table-management.types';

export const MOCK_FLOOR_PLANS: FloorPlan[] = [
  {
    id: 'floor_001',
    restaurant_id: 'rest_001',
    name: 'Main Floor',
    width: 1200,
    height: 800,
    grid_size: 50,
    grid_enabled: true,
    zones: [
      {
        id: 'zone_001',
        name: 'Kitchen',
        type: 'kitchen',
        position: { x: 0, y: 0, width: 300, height: 200 },
        icon: 'chef-hat',
        is_seating_area: false,
      },
      {
        id: 'zone_002',
        name: 'Main Entrance',
        type: 'entrance',
        position: { x: 500, y: 750, width: 200, height: 50 },
        icon: 'door',
        is_seating_area: false,
      },
      {
        id: 'zone_003',
        name: 'Bar Counter',
        type: 'bar',
        position: { x: 900, y: 0, width: 300, height: 100 },
        icon: 'glass-cocktail',
        is_seating_area: true,
      },
    ],
    table_positions: {
      'table_001': { x: 100, y: 300, rotation: 0 },
      'table_002': { x: 200, y: 300, rotation: 0 },
      'table_003': { x: 400, y: 400, rotation: 0 },
      // ... more positions
    },
    is_default: true,
    is_active: true,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z',
  },
];
```

### File: `/src/data/tables/tableHelpers.ts`
```typescript
/**
 * Table management utility functions
 */
import { Table, TableArea, TableStatus } from '@/types/settings/table-management.types';

/**
 * Calculate area statistics
 */
export const calculateAreaStats = (
  tables: Table[],
  areaId: string
): { count: number; capacity: number; available: number } => {
  const areaTables = tables.filter(t => t.area_id === areaId && t.is_active);

  return {
    count: areaTables.length,
    capacity: areaTables.reduce((sum, t) => sum + t.capacity, 0),
    available: areaTables.filter(t => t.status === 'available').length,
  };
};

/**
 * Validate table number uniqueness
 */
export const isTableNumberUnique = (
  tables: Table[],
  tableNumber: string,
  excludeId?: string
): boolean => {
  return !tables.some(
    t => t.table_number === tableNumber &&
         t.is_active &&
         t.id !== excludeId
  );
};

/**
 * Generate next table number for area
 */
export const generateNextTableNumber = (
  tables: Table[],
  area: TableArea
): string => {
  if (!area.auto_numbering) {
    return '';
  }

  const prefix = area.number_prefix || '';
  const areaTables = tables.filter(t => t.area_id === area.id && t.is_active);
  const maxNumber = areaTables.reduce((max, t) => {
    const match = t.table_number.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  return `${prefix}${maxNumber + 1}`;
};

/**
 * Check if table can be deleted
 */
export const canDeleteTable = (table: Table): {
  canDelete: boolean;
  reason?: string;
} => {
  if (table.current_order_id) {
    return {
      canDelete: false,
      reason: 'Table has an active order',
    };
  }

  if (table.status === 'reserved' && table.reserved_until) {
    const reservedUntil = new Date(table.reserved_until);
    if (reservedUntil > new Date()) {
      return {
        canDelete: false,
        reason: 'Table has an active reservation',
      };
    }
  }

  return { canDelete: true };
};

/**
 * Format table status for display
 */
export const formatTableStatus = (status: TableStatus): string => {
  const statusMap: Record<TableStatus, string> = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    cleaning: 'Cleaning',
    maintenance: 'Maintenance',
    blocked: 'Blocked',
  };

  return statusMap[status] || status;
};
```

---

## Mock Data Files

### Data Files to Create

1. **`/src/data/tables/mockTables.ts`** (30 sample tables)
2. **`/src/data/tables/mockAreas.ts`** (4 sample areas)
3. **`/src/data/tables/mockFloorPlans.ts`** (1 default floor plan)
4. **`/src/data/tables/tableHelpers.ts`** (Utility functions)
5. **`/src/data/tables/index.ts`** (Main export file)

### Integration with Existing Data Layer
```typescript
// Update /src/data/index.ts to include tables
export * from './tables';

// Add to DATA_CATEGORIES
export const DATA_CATEGORIES = {
  // ... existing categories
  TABLES: 'tables',
  TABLE_AREAS: 'table_areas',
  FLOOR_PLANS: 'floor_plans',
} as const;
```

---

## API Integration (Future)

### API Service Interface
```typescript
/**
 * Table management API service
 * Location: /src/services/tables/tableService.ts
 */

export interface TableService {
  // Tables
  getTables(restaurantId: string): Promise<Table[]>;
  getTableById(id: string): Promise<Table>;
  createTable(input: CreateTableInput): Promise<Table>;
  updateTable(id: string, input: UpdateTableInput): Promise<Table>;
  deleteTable(id: string): Promise<void>;
  updateTableStatus(id: string, status: TableStatus): Promise<Table>;

  // Areas
  getAreas(restaurantId: string): Promise<TableArea[]>;
  getAreaById(id: string): Promise<TableArea>;
  createArea(input: CreateAreaInput): Promise<TableArea>;
  updateArea(id: string, input: UpdateAreaInput): Promise<TableArea>;
  deleteArea(id: string): Promise<void>;

  // Floor Plans
  getFloorPlans(restaurantId: string): Promise<FloorPlan[]>;
  getFloorPlanById(id: string): Promise<FloorPlan>;
  createFloorPlan(input: CreateFloorPlanInput): Promise<FloorPlan>;
  updateFloorPlan(id: string, input: UpdateFloorPlanInput): Promise<FloorPlan>;
  deleteFloorPlan(id: string): Promise<void>;

  // Bulk Operations
  bulkUpdateTableStatus(tableIds: string[], status: TableStatus): Promise<void>;
  bulkDeleteTables(tableIds: string[]): Promise<void>;
}
```

---

## Data Validation

### Validation Rules

#### Table Validation
```typescript
import * as yup from 'yup';

export const createTableSchema = yup.object({
  table_number: yup
    .string()
    .required('Table number is required')
    .min(1, 'Table number must be at least 1 character')
    .max(20, 'Table number must be at most 20 characters')
    .matches(/^[A-Z0-9-]+$/i, 'Only alphanumeric and hyphens allowed'),

  capacity: yup
    .number()
    .required('Capacity is required')
    .min(1, 'Capacity must be at least 1')
    .max(20, 'Capacity cannot exceed 20'),

  area_id: yup
    .string()
    .required('Area is required'),

  shape: yup
    .string()
    .oneOf(Object.values(TableShape), 'Invalid table shape'),

  notes: yup
    .string()
    .max(200, 'Notes cannot exceed 200 characters')
    .nullable(),
});

export const updateTableSchema = createTableSchema.partial();
```

#### Area Validation
```typescript
export const createAreaSchema = yup.object({
  name: yup
    .string()
    .required('Section name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),

  icon: yup
    .string()
    .required('Icon is required'),

  color: yup
    .string()
    .oneOf(['success', 'info', 'warning', 'error', 'purple', 'primary'])
    .required('Color is required'),

  description: yup
    .string()
    .max(200, 'Description cannot exceed 200 characters')
    .nullable(),

  default_capacity: yup
    .number()
    .min(1)
    .max(20)
    .nullable(),

  number_prefix: yup
    .string()
    .max(10, 'Prefix cannot exceed 10 characters')
    .matches(/^[A-Z-]*$/i, 'Only letters and hyphens allowed')
    .nullable(),
});
```

---

## Usage Examples

### Using Mock Data in Components
```typescript
import { MOCK_TABLES, MOCK_AREAS } from '@/data/tables';
import { getTablesByArea, calculateAreaStats } from '@/data/tables/tableHelpers';

function TablesSettings() {
  const [tables, setTables] = useState(MOCK_TABLES);
  const [areas, setAreas] = useState(MOCK_AREAS);

  const mainDiningTables = getTablesByArea('area_001');
  const stats = calculateAreaStats(tables, 'area_001');

  return (
    // Component JSX
  );
}
```

### Custom Hooks
```typescript
/**
 * Custom hook for table data management
 */
export const useTableData = (restaurantId: string) => {
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
  const [areas, setAreas] = useState<TableArea[]>(MOCK_AREAS);
  const [loading, setLoading] = useState(false);

  const addTable = async (input: CreateTableInput) => {
    // Mock implementation - replace with API call
    const newTable: Table = {
      id: `table_${Date.now()}`,
      restaurant_id: restaurantId,
      ...input,
      status: 'available',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTables(prev => [...prev, newTable]);
    return newTable;
  };

  const updateTable = async (id: string, input: UpdateTableInput) => {
    // Mock implementation
    setTables(prev => prev.map(t =>
      t.id === id
        ? { ...t, ...input, updated_at: new Date().toISOString() }
        : t
    ));
  };

  const deleteTable = async (id: string) => {
    // Mock implementation (soft delete)
    setTables(prev => prev.map(t =>
      t.id === id
        ? { ...t, is_active: false, updated_at: new Date().toISOString() }
        : t
    ));
  };

  return {
    tables: tables.filter(t => t.is_active),
    areas: areas.filter(a => a.is_active),
    loading,
    addTable,
    updateTable,
    deleteTable,
  };
};
```

---

**Data Structure Status:** COMPLETE
**Last Updated:** 2025-10-08
**Next Step:** Review design-fixes.md
