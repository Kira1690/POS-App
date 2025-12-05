# Table Management Floor Plan - Complete Documentation

**Project:** settings-table-management-03
**Date Created:** 2025-12-04
**Last Updated:** 2025-12-05

---

## Project Overview

Interactive floor plan editor for restaurant table management with drag-and-drop tables, zones, multi-floor support, and real-time visual editing.

---

## File Structure

```
/src/screens/settings/components/tableManagement/
├── floorPlan/
│   ├── index.ts                    (42 LOC)  - Barrel exports
│   │
│   ├── [COMPONENTS]
│   ├── FloorPlanCanvas.tsx         (468 LOC) - Main canvas with SVG + gesture layers
│   ├── FloorPlanGrid.tsx           (151 LOC) - SVG grid pattern
│   ├── FloorPlanZone.tsx           (158 LOC) - Zone visual rendering
│   ├── FloorPlanTabs.tsx           (170 LOC) - Floor/area tab navigation
│   ├── FloorPlanToolbar.tsx        (400 LOC) - Tool buttons (select, move, add)
│   ├── TableVisual.tsx             (108 LOC) - SVG table rendering
│   ├── TableShape.tsx              (185 LOC) - Table shape components
│   ├── ChairVisuals.tsx            (77 LOC)  - Chair SVG rendering
│   ├── DraggableTable.tsx          (220 LOC) - Legacy draggable component
│   ├── TableGestureOverlay.tsx     (241 LOC) - Table tap/drag gestures
│   ├── ZoneGestureOverlay.tsx      (204 LOC) - Zone tap/drag gestures
│   ├── ResizeHandles.tsx           (227 LOC) - 8-point resize handles
│   │
│   ├── [PANELS]
│   ├── TablePropertiesPanel.tsx    (263 LOC) - Table properties sidebar
│   ├── PropertiesPanel.tsx         (525 LOC) - Enhanced properties panel
│   │
│   ├── [MODALS]
│   ├── AddTableModal.tsx           (395 LOC) - Add new table modal
│   ├── AddZoneModal.tsx            (401 LOC) - Add new zone modal
│   ├── SettingsModal.tsx           (579 LOC) - Settings configuration modal
│   │
│   ├── hooks/
│   │   ├── useFloorPlanState.ts    (547 LOC) - Main state management hook
│   │   ├── useUndoRedo.ts          (192 LOC) - Undo/redo history
│   │   ├── useTableDrag.ts         (86 LOC)  - Table drag logic
│   │   └── useCanvasGestures.ts    (128 LOC) - Canvas zoom/pan gestures
│   │
│   └── utils/
│       ├── snapToGrid.ts           (157 LOC) - Grid snapping utilities
│       ├── chairPositions.ts       (342 LOC) - Chair position calculations
│       └── floorPlanExport.ts      (274 LOC) - Export/import utilities
│
├── FloorPlanSettings.tsx           (~300 LOC) - Main settings screen
├── TableListView.tsx               - List view of tables
├── TableCard.tsx                   - Individual table card
├── TableManagementSidebar.tsx      - Navigation sidebar
└── index.ts                        - Module exports
```

---

## Total Lines of Code

| Category | LOC |
|----------|-----|
| floorPlan/ folder | 6,540 |
| tableManagement/ total | 13,485 |

---

## Components Created (Phase 3)

### Core Canvas Components

| Component | LOC | Description |
|-----------|-----|-------------|
| `FloorPlanCanvas.tsx` | 468 | Two-layer architecture: SVG visual + gesture overlay |
| `FloorPlanGrid.tsx` | 151 | SVG defs pattern for grid background |
| `FloorPlanZone.tsx` | 158 | Zone rendering with color coding |
| `FloorPlanTabs.tsx` | 170 | Floor/area tab navigation |
| `FloorPlanToolbar.tsx` | 400 | Tool selection (select, move, add table, add zone) |

### Table Components

| Component | LOC | Description |
|-----------|-----|-------------|
| `TableVisual.tsx` | 108 | SVG-only table rendering (no gestures) |
| `TableShape.tsx` | 185 | Shape variants (round, square, rectangle, oval) |
| `ChairVisuals.tsx` | 77 | Chair SVG around tables |
| `TableGestureOverlay.tsx` | 241 | Gesture handling for tables (tap/drag) |
| `DraggableTable.tsx` | 220 | Legacy component with combined visual + gesture |

### Zone Components

| Component | LOC | Description |
|-----------|-----|-------------|
| `ZoneGestureOverlay.tsx` | 204 | Gesture handling for zones (tap/drag) |

### Resize Components

| Component | LOC | Description |
|-----------|-----|-------------|
| `ResizeHandles.tsx` | 227 | 8-point resize handles with PanResponder |

### Modal Components

| Component | LOC | Description |
|-----------|-----|-------------|
| `AddTableModal.tsx` | 395 | Add new table with shape/capacity selection |
| `AddZoneModal.tsx` | 401 | Add new zone with type/color selection |
| `SettingsModal.tsx` | 579 | General and advanced settings tabs |

### Panel Components

| Component | LOC | Description |
|-----------|-----|-------------|
| `TablePropertiesPanel.tsx` | 263 | Properties for selected table |
| `PropertiesPanel.tsx` | 525 | Enhanced properties with zone support |

---

## Hooks Created

| Hook | LOC | Description |
|------|-----|-------------|
| `useFloorPlanState.ts` | 547 | Main state: floors, zones, tables, positions |
| `useUndoRedo.ts` | 192 | History stack for undo/redo operations |
| `useTableDrag.ts` | 86 | Table drag with gesture handler |
| `useCanvasGestures.ts` | 128 | Canvas pinch zoom + two-finger pan |

---

## Utilities Created

| Utility | LOC | Description |
|---------|-----|-------------|
| `snapToGrid.ts` | 157 | Snap coordinates to grid, boundary clamping |
| `chairPositions.ts` | 342 | Calculate chair positions around table shapes |
| `floorPlanExport.ts` | 274 | JSON export/import with validation |

---

## Features Implemented

### 1. Two-Layer Canvas Architecture
- **Layer 1 (SVG)**: Visual rendering only, `pointerEvents="none"`
- **Layer 2 (Views)**: Gesture overlays for touch handling
- Solves: SVG elements cannot receive react-native-gesture-handler events

### 2. Table Management
- Add tables via modal with shape/capacity selection
- Select tables by tapping (select mode)
- Drag tables to move (move mode)
- Resize tables with 8-point handles
- Snap to grid option
- Status-based coloring

### 3. Zone Management
- Add zones by drawing on canvas
- Select zones by tapping
- Drag zones to move
- Resize zones with handles
- Color-coded zone types (dining, bar, outdoor, etc.)

### 4. Multi-Floor Support
- Tab navigation between floors
- Floor-specific zones and table positions
- Floor configuration (name, grid size, dimensions)

### 5. Toolbar Tools
- Select mode (tap to select)
- Move mode (drag to reposition)
- Add Table (click to place)
- Add Zone (draw rectangle)
- Zoom controls (+/-)
- Undo/Redo buttons

### 6. Properties Panel
- View/edit selected table properties
- View/edit selected zone properties
- Capacity, shape, status editing

### 7. Settings Modal
- General tab: default capacity, table prefix, display options
- Advanced tab: auto-status, reservation rules, integrations

### 8. Export/Import
- JSON export of floor plan data
- JSON import with validation
- Data structure versioning

---

## Technical Implementation Details

### Gesture Handling Pattern

```typescript
// TableGestureOverlay.tsx uses Reanimated shared values
const zoomSV = useSharedValue(zoom);
const translateX = useSharedValue(position.x);

const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return {
    transform: [
      { translateX: translateX.value * zoomSV.value - width / 2 },
    ],
  };
});
```

### Coordinate Systems

| System | Origin | Used By |
|--------|--------|---------|
| Center-based | Table center (x, y) | `FloorPlanTablePosition` |
| Top-left based | Top-left corner | Zone bounds, resize bounds |

### State Flow

```
useFloorPlanState (hook)
    ↓
FloorPlanSettings (screen)
    ↓
FloorPlanCanvas (component)
    ↓
├── TableVisual (SVG layer)
├── TableGestureOverlay (gesture layer)
├── ZoneGestureOverlay (gesture layer)
└── ResizeHandles (resize layer)
```

---

## Data Types (from table-management.types.ts)

```typescript
interface Floor {
  id: string;
  name: string;
  display_order: number;
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
  is_active: boolean;
}

interface FloorZone {
  id: string;
  floor_id: string;
  name: string;
  type: ZoneType;
  bounds: ZoneBounds;
  color: string;
  icon: string;
  is_seating_area: boolean;
  opacity: number;
  is_locked: boolean;
  display_order: number;
}

interface FloorPlanTablePosition {
  table_id: string;
  floor_id: string;
  zone_id: string | null;
  x: number;  // center
  y: number;  // center
  rotation: number;
  width: number;
  height: number;
}
```

---

## Bug Fixes Applied

### Session 01 (Investigated, Reverted)
- Crash on table selection - root cause identified
- Settings modal content invisible - root cause identified
- Changes stashed for review

### Session 02 (Implemented)
1. **Crash Fix**: Converted JS variables to shared values in worklet
2. **Settings Modal**: Added `flex: 1` to modalContainer
3. **Resize Handles**: Created new ResizeHandles component
4. **Zone Gestures**: Created ZoneGestureOverlay component

---

## Documentation Files

```
/prep/settings-table-management-03/
├── plan.md                         - Original implementation plan
├── data-structures.md              - Type definitions and schemas
├── progress.md                     - Progress tracking
├── bug-fixes-session-01.md         - First bug fix session (reverted)
├── phase-08-resize-selection.md    - Phase 8 investigation notes
└── COMPLETE-DOCUMENTATION.md       - This file
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Components | 17 |
| Total Hooks | 4 |
| Total Utilities | 3 |
| Total LOC (floorPlan/) | 6,540 |
| Total LOC (tableManagement/) | 13,485 |
| New Files Created | 24 |
| Documentation Files | 6 |
