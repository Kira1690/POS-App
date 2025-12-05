/**
 * Floor Plan Components - Barrel Export
 * Table Management Floor Plan Canvas System
 */

// Main components
export { default as FloorPlanCanvas } from './FloorPlanCanvas';
export { default as FloorPlanToolbar } from './FloorPlanToolbar';
export { default as FloorPlanTabs } from './FloorPlanTabs';
export { default as FloorPlanGrid } from './FloorPlanGrid';
export { default as FloorPlanZone } from './FloorPlanZone';
export { default as TableVisual } from './TableVisual';
export { default as TableGestureOverlay } from './TableGestureOverlay';
export { default as TableShape } from './TableShape';
export { default as ChairVisuals } from './ChairVisuals';
export { default as TablePropertiesPanel } from './TablePropertiesPanel';

// Legacy export for backwards compatibility
export { default as DraggableTable } from './DraggableTable';

// Modals
export { default as AddTableModal } from './AddTableModal';
export type { NewTableConfig } from './AddTableModal';
export { default as AddZoneModal } from './AddZoneModal';
export type { NewZoneConfig } from './AddZoneModal';

// Hooks
export { useFloorPlanState } from './hooks/useFloorPlanState';
export { useTableDrag } from './hooks/useTableDrag';
export { useUndoRedo } from './hooks/useUndoRedo';
export { useCanvasGestures } from './hooks/useCanvasGestures';

// Utils
export * from './utils/snapToGrid';
export * from './utils/chairPositions';
export * from './utils/floorPlanExport';
