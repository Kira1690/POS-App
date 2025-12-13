# Table Management Floor Plan Enhancement - settings-table-management-03

**Project:** POS Settings - Table Management Floor Plan Canvas
**Developer:** 1 (Full-stack)
**Total Duration:** ~26 working days (7 phases + bug fixes)

---

## Overview

Complete refactoring and enhancement of the Table Management floor plan editor with:
- True drag-and-drop using react-native-svg + gesture handlers
- Visual chair representations around tables (count-based, not individually draggable)
- Multi-floor tab navigation for separate canvas views per floor/area
- SVG-based canvas with zoom (0.5x-2x) and pan gestures
- Grid overlay with snap-to-grid functionality
- Working undo/redo (up to 50 actions)
- Export/Import JSON floor plans

---

## User Requirements (Confirmed)

1. **Chair Management**: Visual + count - show chair icons around tables based on capacity (NOT individually draggable)
2. **Canvas Technology**: react-native-svg + gesture handlers for precise shapes and zones
3. **Multi-Floor Support**: Tabs per floor/area - separate canvas views for each floor

---

## Current State Problems

| Issue | Current Implementation |
|-------|------------------------|
| Monolithic | 688 lines in FloorPlanSettings.tsx |
| No drag-and-drop | Uses absolute positioning with TouchableOpacity |
| Fake grid | Text placeholder ("• Grid Pattern •") |
| Placeholder undo/redo | Alert boxes only |
| No export/import | Partial implementation |
| No zoom/pan | Fixed view |
| Single floor | No multi-floor support |

---

## Target Architecture

```
/src/screens/settings/components/tableManagement/
├── FloorPlanSettings.tsx          # Refactored orchestrator (<300 lines)
└── floorPlan/                     # NEW FOLDER
    ├── index.ts                   # Barrel exports
    ├── FloorPlanCanvas.tsx        # SVG canvas with gesture handling (~250 lines)
    ├── FloorPlanToolbar.tsx       # Tools panel (~180 lines)
    ├── FloorPlanTabs.tsx          # Multi-floor tab navigation (~100 lines)
    ├── FloorPlanGrid.tsx          # SVG grid overlay (~80 lines)
    ├── FloorPlanZone.tsx          # Area/zone SVG component (~100 lines)
    ├── DraggableTable.tsx         # Draggable table with chairs (~200 lines)
    ├── TableShape.tsx             # SVG table shapes (~150 lines)
    ├── ChairVisuals.tsx           # Chair positioning (~120 lines)
    ├── TablePropertiesPanel.tsx   # Selected table sidebar (~200 lines)
    ├── hooks/
    │   ├── useFloorPlanState.ts   # State management (~200 lines)
    │   ├── useTableDrag.ts        # Drag gesture hook (~100 lines)
    │   ├── useUndoRedo.ts         # History management (~80 lines)
    │   └── useCanvasGestures.ts   # Zoom/pan gestures (~100 lines)
    └── utils/
        ├── snapToGrid.ts          # Grid snapping logic
        ├── chairPositions.ts      # Chair position calculations
        └── floorPlanExport.ts     # Export/Import utilities
```

---

## Implementation Phases

### Phase 1: Foundation (3 days)
- Create `/floorPlan/` folder structure
- Add new types to `table-management.types.ts`
- Create `mockFloorPlans.ts` with 3 sample floors
- Implement `useFloorPlanState` hook
- Implement `useUndoRedo` hook
- Create barrel export `index.ts`

### Phase 2: SVG Canvas & Grid (3 days)
- Create `FloorPlanCanvas.tsx` with SVG + viewBox
- Create `FloorPlanGrid.tsx` with SVG Pattern
- Create `FloorPlanZone.tsx` for zone rendering
- Refactor `FloorPlanSettings.tsx` to orchestrator

### Phase 3: Table Shapes & Chairs (3 days)
- Create `TableShape.tsx` (round, square, rectangle, oval)
- Create `ChairVisuals.tsx` with position math
- Create `chairPositions.ts` utility
- Status-based coloring with theme colors

### Phase 4: Drag & Drop (4 days)
- Create `DraggableTable.tsx` with PanGestureHandler
- Create `useTableDrag.ts` hook
- Implement snap-to-grid logic
- Add haptic feedback
- 60fps animations with reanimated

### Phase 5: Zoom, Pan & Multi-Floor (4 days)
- Add PinchGestureHandler for zoom
- Create `useCanvasGestures.ts` hook
- Create `FloorPlanTabs.tsx` component
- Implement floor switching

### Phase 6: Toolbar & Properties (3 days)
- Create `FloorPlanToolbar.tsx`
- Create `TablePropertiesPanel.tsx`
- Integrate undo/redo UI
- Add zoom controls

### Phase 7: Export/Import & Polish (3 days)
- Create `floorPlanExport.ts` utilities
- Implement JSON export/import
- Performance optimization
- Accessibility audit

---

## Key Technical Decisions

1. **SVG over Canvas**: react-native-svg for precise shapes and better accessibility
2. **Gesture Composition**: Simultaneous for canvas (zoom+pan), Race for tables (drag OR tap)
3. **Chair Rendering**: Mathematical positioning, visual-only (not draggable)
4. **State Management**: useReducer + hooks with undo/redo history

---

## Libraries Used

- `react-native-svg` (15.12.1) - SVG canvas
- `react-native-gesture-handler` (~2.28.0) - Pan, pinch gestures
- `react-native-reanimated` (~4.1.1) - 60fps animations
- `expo-haptics` - Touch feedback

---

## Performance Targets

- Animations: 60fps
- Render time: <16ms per frame
- History: Max 50 undo entries
- Zoom range: 0.5x to 2x

---

## Constraints (CLAUDE.md)

- Max 300 lines per component
- useTheme() at component root
- StyleSheet inside component after theme hook
- NO hardcoded colors
- NO emojis (MaterialCommunityIcons only)
- TypeScript strict mode
- SOLID principles
