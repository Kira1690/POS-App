/**
 * FloorPlanContext
 * Shared context for floor plan data between Settings and Dashboard
 */

import { createContext, useContext } from 'react';
import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
} from '@/types/settings/table-management.types';

// ==================== CONTEXT VALUE INTERFACE ====================

export interface FloorPlanContextValue {
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
  updateTablePosition: (
    tableId: string,
    updates: Partial<FloorPlanTablePosition>
  ) => void;
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

// ==================== CONTEXT ====================

export const FloorPlanContext = createContext<FloorPlanContextValue | null>(
  null
);

// ==================== HOOK ====================

export const useFloorPlan = (): FloorPlanContextValue => {
  const context = useContext(FloorPlanContext);
  if (!context) {
    throw new Error('useFloorPlan must be used within a FloorPlanProvider');
  }
  return context;
};

export default FloorPlanContext;
