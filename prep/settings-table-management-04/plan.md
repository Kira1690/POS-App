# Table Management Phase 04 - Add New Floor Feature + Dashboard Integration

**Project:** POS Settings - Table Management Floor Plan
**Branch:** feature/settings-tablemanagement-04
**Status:** COMPLETE

---

## Overview

### Phase 04A - Add New Floor (COMPLETE)
Implement the "Add New Floor" wizard feature. Once a floor is created, all existing functionality (canvas, tables, zones, drag-drop, etc.) automatically works with it.

### Phase 04B - Dashboard Floor Plan Integration (COMPLETE)
Share the floor plan canvas between Settings (table management) and Dashboard, with occupancy visualization. Changes in Settings reflect immediately in Dashboard.

---

## What Already Exists (DO NOT RECREATE)

| Component | Location | Status |
|-----------|----------|--------|
| EditTableModal.tsx | `/src/screens/settings/components/tableManagement/modals/` | COMPLETE |
| EditAreaModal.tsx | `/src/screens/settings/components/tableManagement/modals/` | COMPLETE |
| Canvas, grids, drag-drop | `/src/screens/settings/components/tableManagement/floorPlan/` | WORKING |
| FloorPlanTabs | `/src/screens/settings/components/tableManagement/floorPlan/` | WORKING |

---

## Features to Implement

### 1. Add New Floor Wizard (PRIMARY)

**New Component:** `AddFloorModal.tsx` (~250 lines)

**Location:** `/src/screens/settings/components/tableManagement/floorPlan/AddFloorModal.tsx`

**Fields:**
- Floor Name (required, text input)
- Canvas Width (number input, default: 1200)
- Canvas Height (number input, default: 800)
- Grid Size (number input, default: 50)

**Size Presets:**
| Preset | Width | Height |
|--------|-------|--------|
| Small | 800 | 600 |
| Medium (default) | 1200 | 800 |
| Large | 1600 | 1000 |

### 2. Wire Existing Edit Modals

- Connect `EditTableModal` to FloorPlanSettings.tsx
- Connect `EditAreaModal` to FloorPlanSettings.tsx
- Replace alert placeholders with actual modal openers

### 3. Floor CRUD Actions

Add to `useFloorPlanState.ts`:
- `ADD_FLOOR` reducer action
- `addFloor(floor: Floor)` function with undo/redo
- `DELETE_FLOOR` reducer action
- `deleteFloor(floorId: string)` function

---

## Implementation Order

1. Create prep folder documentation
2. Add `ADD_FLOOR` action to `useFloorPlanState.ts`
3. Create `AddFloorModal.tsx`
4. Wire AddFloorModal in `FloorPlanSettings.tsx`
5. Wire existing EditTableModal in `FloorPlanSettings.tsx`
6. Wire existing EditAreaModal in `FloorPlanSettings.tsx`
7. Export AddFloorModal from index.ts
8. Test: Create new floor and verify canvas/tables/zones work

---

## Files Summary

### New Files (1):
| File | Description |
|------|-------------|
| `AddFloorModal.tsx` | Add new floor wizard modal |

### Modified Files (3):
| File | Changes |
|------|---------|
| `useFloorPlanState.ts` | Add floor CRUD actions |
| `FloorPlanSettings.tsx` | Wire up all modals |
| `floorPlan/index.ts` | Export AddFloorModal |

---

## Estimated LOC

- New code: ~250 lines
- Modified code: ~150 lines
- **Total:** ~400 lines

---

## Technical Notes

### Floor Type (from table-management.types.ts)

```typescript
interface Floor {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  is_default: boolean;
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
  grid_enabled: boolean;
  background_color?: string;
  background_image_url?: string;
  created_at: Date;
  updated_at: Date;
}
```

### AddFloorModal Props

```typescript
interface AddFloorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (config: NewFloorConfig) => void;
}

interface NewFloorConfig {
  name: string;
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
}
```

---

# Phase 04B - Dashboard Floor Plan Integration

## Architecture: Shared Context + Unified Canvas

### Why This Approach
- Single source of truth for floor plan data
- Clean separation between shared data and edit-specific features
- Both Settings and Dashboard consume the same context

---

## New Files Created (Phase 04B)

| File | Location | LOC | Description |
|------|----------|-----|-------------|
| FloorPlanContext.tsx | `/src/context/floorPlan/` | ~70 | Context definition + useFloorPlan hook |
| FloorPlanProvider.tsx | `/src/context/floorPlan/` | ~280 | Provider with reducer logic |
| index.ts | `/src/context/floorPlan/` | ~10 | Barrel exports |
| DashboardFloorPlanViewer.tsx | `/src/screens/tables/components/` | ~180 | Dashboard wrapper for floor plan |
| index.ts | `/src/screens/tables/components/` | ~5 | Barrel exports |

---

## Modified Files (Phase 04B)

| File | Changes |
|------|---------|
| TableVisual.tsx | Added `statusOverride` prop for occupancy colors |
| FloorPlanCanvas.tsx | Added `mode` prop ('edit'/'view'), `tableStatusMap` prop |
| useFloorPlanState.ts | Refactored to use FloorPlanContext for shared state |
| TablesDashboard.tsx | Replaced custom FloorPlan with DashboardFloorPlanViewer |
| MainNavigator.tsx | Wrapped app with FloorPlanProvider |

---

## Data Flow

```
FloorPlanContext (Source of Truth)
├── floors[], zones[], tablePositions[]
├── activeFloorId, hasUnsavedChanges
│
├──→ Settings (FloorPlanSettings.tsx)
│    └── useFloorPlanState hook
│         └── FloorPlanCanvas (mode='edit')
│              └── Full editing with undo/redo
│
└──→ Dashboard (TablesDashboard.tsx)
     └── DashboardFloorPlanViewer
          └── FloorPlanCanvas (mode='view')
               └── Read-only with status colors
```

---

## FloorPlanContext Interface

```typescript
interface FloorPlanContextValue {
  // Core data
  floors: Floor[];
  zones: FloorZone[];
  tablePositions: FloorPlanTablePosition[];
  activeFloorId: string;

  // Computed values
  currentFloor: Floor | undefined;
  currentZones: FloorZone[];
  currentTablePositions: FloorPlanTablePosition[];

  // Floor actions
  setActiveFloor: (floorId: string) => void;
  addFloor: (floor: Floor) => void;
  updateFloor: (floorId: string, updates: Partial<Floor>) => void;
  deleteFloor: (floorId: string) => boolean;

  // Table position actions
  addTablePosition: (position: FloorPlanTablePosition) => void;
  updateTablePosition: (tableId: string, updates: Partial<FloorPlanTablePosition>) => void;
  deleteTablePosition: (tableId: string) => void;

  // Zone actions
  addZone: (zone: FloorZone) => void;
  updateZone: (zoneId: string, updates: Partial<FloorZone>) => void;
  deleteZone: (zoneId: string) => void;
  moveZone: (zoneId: string, x: number, y: number) => void;
  resizeZone: (zoneId: string, width: number, height: number) => void;

  // Change tracking
  hasUnsavedChanges: boolean;
  markSaved: () => void;
}
```

---

## Key Design Decisions

1. **Floor Tabs**: Dashboard shows floor tabs (can switch between floors)
2. **Zoom/Pan**: Dashboard uses fixed view (auto-fit, no gestures)
3. **Persistence**: In-memory only (changes sync between screens but reset on restart)

---

## Status Color Mapping

Uses existing theme colors (`theme.colors.statusColors`):
- `occupied` → Red/Error color
- `available` → Green/Success color
- `cleaning` → Yellow/Warning color
- `reserved` → Blue/Info color

Implementation: TableVisual accepts `statusOverride` prop in view mode to override table's default status.

---

## Phase 04 Final Status

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| Phase 04A - Add Floor | COMPLETE | December 13, 2024 |
| Phase 04B - Dashboard Integration | COMPLETE | December 16, 2024 |
| Bug Fixes | COMPLETE | December 16, 2024 |
| Documentation | COMPLETE | December 16, 2024 |

### Deliverables

- [x] AddFloorModal with size presets
- [x] Floor CRUD in state management
- [x] FloorPlanContext for shared state
- [x] DashboardFloorPlanViewer component
- [x] FloorPlanViewerCanvas with scroll + zoom
- [x] View mode in FloorPlanCanvas
- [x] Settings horizontal scroll fix
- [x] Dashboard scroll fix
- [x] Client report documentation
- [x] LOC breakdown documentation

### Total LOC Contribution

| Metric | Value |
|--------|-------|
| New LOC | 1,349 |
| Modified LOC | ~467 |
| **Total** | **~1,816** |

---

*Plan Status: COMPLETE*
*All features implemented and documented.*
