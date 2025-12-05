# Table Management Floor Plan - Data Structures

**Project:** settings-table-management-03
**Created:** 2025-12-04

---

## New TypeScript Interfaces

### Floor Entity (Multi-Floor Support)

```typescript
/**
 * Floor/Level entity for multi-floor support
 */
export interface Floor {
  id: string;
  restaurant_id: string;
  name: string;                    // "Main Floor", "2nd Floor", "Patio"
  display_order: number;
  is_active: boolean;
  is_default: boolean;
  canvas_width: number;            // Logical canvas width (default: 1200)
  canvas_height: number;           // Logical canvas height (default: 800)
  grid_size: number;               // Grid cell size in pixels (default: 50)
  grid_enabled: boolean;
  background_color?: string;       // Theme color key
  background_image_url?: string;   // Optional floor plan image
  created_at: Date;
  updated_at: Date;
}
```

### Floor Zone (Areas on Canvas)

```typescript
/**
 * Zone types for floor plan
 */
export type ZoneType =
  | 'kitchen'
  | 'bar'
  | 'entrance'
  | 'restroom'
  | 'storage'
  | 'vip'
  | 'outdoor'
  | 'custom';

/**
 * Zone bounds (position and size)
 */
export interface ZoneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Enhanced zone for floor plan
 */
export interface FloorZone {
  id: string;
  floor_id: string;
  name: string;
  type: ZoneType;
  bounds: ZoneBounds;
  color: string;                   // Theme color key (e.g., 'outline', 'warning')
  icon: string;                    // MaterialCommunityIcons name
  is_seating_area: boolean;        // Can tables be placed here?
  opacity: number;                 // 0-1 for visual styling
  is_locked: boolean;              // Prevent editing
  display_order: number;
}
```

### Table Position on Floor Plan

```typescript
/**
 * Table position on floor plan canvas
 */
export interface FloorPlanTablePosition {
  table_id: string;
  floor_id: string;
  x: number;                       // X coordinate on canvas
  y: number;                       // Y coordinate on canvas
  rotation: number;                // 0-360 degrees
  grid_x?: number;                 // Snapped grid position (column)
  grid_y?: number;                 // Snapped grid position (row)
}
```

### Chair Visual Configuration

```typescript
/**
 * Individual chair position around a table
 */
export interface ChairPosition {
  index: number;                   // Chair index (0-based)
  angle: number;                   // Angle from table center (0-360 degrees)
  distance: number;                // Distance from table edge
  x: number;                       // Calculated X position relative to table center
  y: number;                       // Calculated Y position relative to table center
}

/**
 * Chair configuration for a table
 */
export interface ChairConfig {
  capacity: number;
  shape: TableShape;
  size: TableSize;
  positions: ChairPosition[];
}
```

### Floor Plan Canvas State

```typescript
/**
 * Tool types for floor plan editor
 */
export type FloorPlanTool =
  | 'select'
  | 'add_table'
  | 'add_zone'
  | 'delete'
  | 'duplicate'
  | 'rotate'
  | 'pan';

/**
 * Floor plan canvas state
 */
export interface FloorPlanCanvasState {
  activeFloorId: string;
  selectedTableId: string | null;
  selectedZoneId: string | null;
  activeTool: FloorPlanTool;
  zoom: number;                    // 0.5 to 2.0
  pan: { x: number; y: number };
  gridEnabled: boolean;
  snapToGrid: boolean;
  showChairs: boolean;
  showTableNumbers: boolean;
  showCapacity: boolean;
  hasUnsavedChanges: boolean;
}
```

### Undo/Redo History

```typescript
/**
 * Action types for history tracking
 */
export type FloorPlanAction =
  | 'table_moved'
  | 'table_added'
  | 'table_deleted'
  | 'table_rotated'
  | 'table_duplicated'
  | 'zone_added'
  | 'zone_deleted'
  | 'zone_resized'
  | 'zone_moved'
  | 'bulk_change';

/**
 * Snapshot of floor plan state for undo/redo
 */
export interface FloorPlanSnapshot {
  tables: FloorPlanTablePosition[];
  zones: FloorZone[];
}

/**
 * History entry for undo/redo
 */
export interface FloorPlanHistoryEntry {
  id: string;
  timestamp: Date;
  action: FloorPlanAction;
  description: string;             // Human-readable description
  before: FloorPlanSnapshot;
  after: FloorPlanSnapshot;
}
```

### Export/Import Format

```typescript
/**
 * Floor plan export data format
 */
export interface FloorPlanExportData {
  version: string;                 // Schema version (e.g., "1.0.0")
  exported_at: string;             // ISO timestamp
  restaurant_id: string;
  floors: Floor[];
  tables: FloorPlanTablePosition[];
  zones: FloorZone[];
  settings: {
    grid_size: number;
    snap_to_grid: boolean;
    show_chairs: boolean;
  };
}
```

---

## Table Dimension Constants

```typescript
/**
 * Table dimensions by size
 */
export const TABLE_DIMENSIONS = {
  small: { width: 60, height: 60, radius: 30 },
  medium: { width: 80, height: 80, radius: 40 },
  large: { width: 100, height: 100, radius: 50 },
} as const;

/**
 * Rectangle table dimensions
 */
export const RECTANGLE_DIMENSIONS = {
  small: { width: 80, height: 50 },
  medium: { width: 100, height: 60 },
  large: { width: 120, height: 70 },
} as const;

/**
 * Chair visual constants
 */
export const CHAIR_CONSTANTS = {
  radius: 8,                       // Chair circle radius
  offset: 4,                       // Distance from table edge
  strokeWidth: 1,
} as const;
```

---

## Zone Type Configuration

```typescript
/**
 * Zone type visual configuration
 */
export const ZONE_TYPE_CONFIG: Record<ZoneType, {
  defaultIcon: string;
  defaultColor: string;
  isSeatingArea: boolean;
  label: string;
}> = {
  kitchen: {
    defaultIcon: 'chef-hat',
    defaultColor: 'outline',
    isSeatingArea: false,
    label: 'Kitchen',
  },
  bar: {
    defaultIcon: 'glass-cocktail',
    defaultColor: 'info',
    isSeatingArea: true,
    label: 'Bar',
  },
  entrance: {
    defaultIcon: 'door-open',
    defaultColor: 'outline',
    isSeatingArea: false,
    label: 'Entrance',
  },
  restroom: {
    defaultIcon: 'human-male-female',
    defaultColor: 'outline',
    isSeatingArea: false,
    label: 'Restroom',
  },
  storage: {
    defaultIcon: 'archive',
    defaultColor: 'outline',
    isSeatingArea: false,
    label: 'Storage',
  },
  vip: {
    defaultIcon: 'crown',
    defaultColor: 'warning',
    isSeatingArea: true,
    label: 'VIP Area',
  },
  outdoor: {
    defaultIcon: 'weather-sunny',
    defaultColor: 'success',
    isSeatingArea: true,
    label: 'Outdoor',
  },
  custom: {
    defaultIcon: 'shape-rectangle-plus',
    defaultColor: 'primary',
    isSeatingArea: true,
    label: 'Custom Zone',
  },
};
```

---

## State Reducer Actions

```typescript
/**
 * Floor plan reducer action types
 */
export type FloorPlanReducerAction =
  | { type: 'SELECT_FLOOR'; payload: string }
  | { type: 'SELECT_TABLE'; payload: string | null }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'SET_TOOL'; payload: FloorPlanTool }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'TOGGLE_CHAIRS' }
  | { type: 'UPDATE_TABLE_POSITION'; payload: { tableId: string; position: Partial<FloorPlanTablePosition> } }
  | { type: 'ADD_TABLE'; payload: FloorPlanTablePosition }
  | { type: 'DELETE_TABLE'; payload: string }
  | { type: 'ADD_ZONE'; payload: FloorZone }
  | { type: 'UPDATE_ZONE'; payload: { zoneId: string; zone: Partial<FloorZone> } }
  | { type: 'DELETE_ZONE'; payload: string }
  | { type: 'LOAD_FLOOR_PLAN'; payload: FloorPlanExportData }
  | { type: 'MARK_SAVED' }
  | { type: 'UNDO' }
  | { type: 'REDO' };
```

---

## Mock Data Structure Example

```typescript
// mockFloorPlans.ts
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
    created_at: new Date(),
    updated_at: new Date(),
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
    created_at: new Date(),
    updated_at: new Date(),
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
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const MOCK_ZONES: FloorZone[] = [
  {
    id: 'zone-kitchen',
    floor_id: 'floor-main',
    name: 'Kitchen',
    type: 'kitchen',
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
    type: 'vip',
    bounds: { x: 800, y: 500, width: 350, height: 250 },
    color: 'warning',
    icon: 'crown',
    is_seating_area: true,
    opacity: 0.2,
    is_locked: false,
    display_order: 2,
  },
  {
    id: 'zone-bar',
    floor_id: 'floor-main',
    name: 'Bar Counter',
    type: 'bar',
    bounds: { x: 0, y: 600, width: 400, height: 100 },
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
    type: 'entrance',
    bounds: { x: 1050, y: 0, width: 150, height: 100 },
    color: 'outline',
    icon: 'door-open',
    is_seating_area: false,
    opacity: 0.2,
    is_locked: true,
    display_order: 4,
  },
];
```

---

## File Locations

| Type | Location |
|------|----------|
| Types | `/src/types/settings/table-management.types.ts` |
| Mock Data | `/src/data/tables/mockFloorPlans.ts` |
| Constants | `/src/screens/settings/components/tableManagement/floorPlan/utils/constants.ts` |
