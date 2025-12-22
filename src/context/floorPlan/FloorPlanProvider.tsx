/**
 * FloorPlanProvider
 * Provider component for shared floor plan state
 */

import React, { useReducer, useCallback, useMemo, ReactNode } from 'react';
import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
} from '@/types/settings/table-management.types';
import {
  MOCK_FLOORS,
  MOCK_ZONES,
  MOCK_TABLE_POSITIONS,
} from '@/data/tables/mockFloorPlans';
import { FloorPlanContext, FloorPlanContextValue } from './FloorPlanContext';

// ==================== STATE INTERFACE ====================

interface FloorPlanState {
  floors: Floor[];
  zones: FloorZone[];
  tablePositions: FloorPlanTablePosition[];
  activeFloorId: string;
  hasUnsavedChanges: boolean;
}

// ==================== ACTION TYPES ====================

type FloorPlanAction =
  | { type: 'SET_ACTIVE_FLOOR'; payload: string }
  | { type: 'ADD_FLOOR'; payload: Floor }
  | { type: 'UPDATE_FLOOR'; payload: { floorId: string; updates: Partial<Floor> } }
  | { type: 'DELETE_FLOOR'; payload: string }
  | { type: 'ADD_TABLE_POSITION'; payload: FloorPlanTablePosition }
  | { type: 'UPDATE_TABLE_POSITION'; payload: { tableId: string; updates: Partial<FloorPlanTablePosition> } }
  | { type: 'DELETE_TABLE_POSITION'; payload: string }
  | { type: 'ADD_ZONE'; payload: FloorZone }
  | { type: 'UPDATE_ZONE'; payload: { zoneId: string; updates: Partial<FloorZone> } }
  | { type: 'DELETE_ZONE'; payload: string }
  | { type: 'MOVE_ZONE'; payload: { zoneId: string; x: number; y: number } }
  | { type: 'RESIZE_ZONE'; payload: { zoneId: string; width: number; height: number } }
  | { type: 'MARK_SAVED' };

// ==================== REDUCER ====================

const floorPlanReducer = (
  state: FloorPlanState,
  action: FloorPlanAction
): FloorPlanState => {
  switch (action.type) {
    case 'SET_ACTIVE_FLOOR':
      return {
        ...state,
        activeFloorId: action.payload,
      };

    case 'ADD_FLOOR': {
      const maxOrder = Math.max(...state.floors.map(f => f.display_order), 0);
      return {
        ...state,
        floors: [
          ...state.floors,
          { ...action.payload, display_order: maxOrder + 1 },
        ],
        activeFloorId: action.payload.id,
        hasUnsavedChanges: true,
      };
    }

    case 'UPDATE_FLOOR':
      return {
        ...state,
        floors: state.floors.map(f =>
          f.id === action.payload.floorId
            ? { ...f, ...action.payload.updates }
            : f
        ),
        hasUnsavedChanges: true,
      };

    case 'DELETE_FLOOR': {
      const floorIdToDelete = action.payload;
      const remainingFloors = state.floors.filter(f => f.id !== floorIdToDelete);
      const newActiveFloorId =
        state.activeFloorId === floorIdToDelete
          ? remainingFloors[0]?.id || ''
          : state.activeFloorId;
      return {
        ...state,
        floors: remainingFloors,
        tablePositions: state.tablePositions.filter(
          t => t.floor_id !== floorIdToDelete
        ),
        zones: state.zones.filter(z => z.floor_id !== floorIdToDelete),
        activeFloorId: newActiveFloorId,
        hasUnsavedChanges: true,
      };
    }

    case 'ADD_TABLE_POSITION':
      return {
        ...state,
        tablePositions: [...state.tablePositions, action.payload],
        hasUnsavedChanges: true,
      };

    case 'UPDATE_TABLE_POSITION':
      return {
        ...state,
        tablePositions: state.tablePositions.map(pos =>
          pos.table_id === action.payload.tableId
            ? { ...pos, ...action.payload.updates }
            : pos
        ),
        hasUnsavedChanges: true,
      };

    case 'DELETE_TABLE_POSITION':
      return {
        ...state,
        tablePositions: state.tablePositions.filter(
          pos => pos.table_id !== action.payload
        ),
        hasUnsavedChanges: true,
      };

    case 'ADD_ZONE':
      return {
        ...state,
        zones: [...state.zones, action.payload],
        hasUnsavedChanges: true,
      };

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.payload.zoneId
            ? { ...z, ...action.payload.updates }
            : z
        ),
        hasUnsavedChanges: true,
      };

    case 'DELETE_ZONE':
      return {
        ...state,
        zones: state.zones.filter(z => z.id !== action.payload),
        hasUnsavedChanges: true,
      };

    case 'MOVE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.payload.zoneId
            ? {
                ...z,
                bounds: {
                  ...z.bounds,
                  x: action.payload.x,
                  y: action.payload.y,
                },
              }
            : z
        ),
        hasUnsavedChanges: true,
      };

    case 'RESIZE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.payload.zoneId
            ? {
                ...z,
                bounds: {
                  ...z.bounds,
                  width: action.payload.width,
                  height: action.payload.height,
                },
              }
            : z
        ),
        hasUnsavedChanges: true,
      };

    case 'MARK_SAVED':
      return {
        ...state,
        hasUnsavedChanges: false,
      };

    default:
      return state;
  }
};

// ==================== INITIAL STATE ====================

const getInitialState = (): FloorPlanState => {
  const defaultFloor = MOCK_FLOORS.find(f => f.is_default) || MOCK_FLOORS[0];
  return {
    floors: [...MOCK_FLOORS],
    zones: [...MOCK_ZONES],
    tablePositions: [...MOCK_TABLE_POSITIONS],
    activeFloorId: defaultFloor?.id || '',
    hasUnsavedChanges: false,
  };
};

// ==================== PROVIDER PROPS ====================

interface FloorPlanProviderProps {
  children: ReactNode;
}

// ==================== PROVIDER COMPONENT ====================

export const FloorPlanProvider: React.FC<FloorPlanProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(floorPlanReducer, undefined, getInitialState);

  // ==================== COMPUTED VALUES ====================

  const currentFloor = useMemo(
    () => state.floors.find(f => f.id === state.activeFloorId),
    [state.floors, state.activeFloorId]
  );

  const currentZones = useMemo(
    () => state.zones.filter(z => z.floor_id === state.activeFloorId),
    [state.zones, state.activeFloorId]
  );

  const currentTablePositions = useMemo(
    () => state.tablePositions.filter(p => p.floor_id === state.activeFloorId),
    [state.tablePositions, state.activeFloorId]
  );

  // ==================== ACTIONS ====================

  const setActiveFloor = useCallback((floorId: string) => {
    dispatch({ type: 'SET_ACTIVE_FLOOR', payload: floorId });
  }, []);

  const addFloor = useCallback((floor: Floor) => {
    dispatch({ type: 'ADD_FLOOR', payload: floor });
  }, []);

  const updateFloor = useCallback(
    (floorId: string, updates: Partial<Floor>) => {
      dispatch({ type: 'UPDATE_FLOOR', payload: { floorId, updates } });
    },
    []
  );

  const deleteFloor = useCallback(
    (floorId: string): boolean => {
      // Prevent deleting the last floor
      if (state.floors.length <= 1) {
        console.warn('Cannot delete the last floor');
        return false;
      }
      // Prevent deleting default floor
      const floorToDelete = state.floors.find(f => f.id === floorId);
      if (floorToDelete?.is_default) {
        console.warn('Cannot delete the default floor');
        return false;
      }
      dispatch({ type: 'DELETE_FLOOR', payload: floorId });
      return true;
    },
    [state.floors]
  );

  const addTablePosition = useCallback((position: FloorPlanTablePosition) => {
    dispatch({ type: 'ADD_TABLE_POSITION', payload: position });
  }, []);

  const updateTablePosition = useCallback(
    (tableId: string, updates: Partial<FloorPlanTablePosition>) => {
      dispatch({ type: 'UPDATE_TABLE_POSITION', payload: { tableId, updates } });
    },
    []
  );

  const deleteTablePosition = useCallback((tableId: string) => {
    dispatch({ type: 'DELETE_TABLE_POSITION', payload: tableId });
  }, []);

  const addZone = useCallback((zone: FloorZone) => {
    dispatch({ type: 'ADD_ZONE', payload: zone });
  }, []);

  const updateZone = useCallback(
    (zoneId: string, updates: Partial<FloorZone>) => {
      dispatch({ type: 'UPDATE_ZONE', payload: { zoneId, updates } });
    },
    []
  );

  const deleteZone = useCallback((zoneId: string) => {
    dispatch({ type: 'DELETE_ZONE', payload: zoneId });
  }, []);

  const moveZone = useCallback((zoneId: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_ZONE', payload: { zoneId, x, y } });
  }, []);

  const resizeZone = useCallback(
    (zoneId: string, width: number, height: number) => {
      dispatch({ type: 'RESIZE_ZONE', payload: { zoneId, width, height } });
    },
    []
  );

  const markSaved = useCallback(() => {
    dispatch({ type: 'MARK_SAVED' });
  }, []);

  // ==================== CONTEXT VALUE ====================

  const contextValue: FloorPlanContextValue = useMemo(
    () => ({
      // Core data
      floors: state.floors,
      zones: state.zones,
      tablePositions: state.tablePositions,
      activeFloorId: state.activeFloorId,

      // Computed values
      currentFloor,
      currentZones,
      currentTablePositions,

      // Floor actions
      setActiveFloor,
      addFloor,
      updateFloor,
      deleteFloor,

      // Table position actions
      addTablePosition,
      updateTablePosition,
      deleteTablePosition,

      // Zone actions
      addZone,
      updateZone,
      deleteZone,
      moveZone,
      resizeZone,

      // Change tracking
      hasUnsavedChanges: state.hasUnsavedChanges,
      markSaved,
    }),
    [
      state.floors,
      state.zones,
      state.tablePositions,
      state.activeFloorId,
      state.hasUnsavedChanges,
      currentFloor,
      currentZones,
      currentTablePositions,
      setActiveFloor,
      addFloor,
      updateFloor,
      deleteFloor,
      addTablePosition,
      updateTablePosition,
      deleteTablePosition,
      addZone,
      updateZone,
      deleteZone,
      moveZone,
      resizeZone,
      markSaved,
    ]
  );

  return (
    <FloorPlanContext.Provider value={contextValue}>
      {children}
    </FloorPlanContext.Provider>
  );
};

export default FloorPlanProvider;
