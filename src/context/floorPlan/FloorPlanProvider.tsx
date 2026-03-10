/**
 * FloorPlanProvider
 * Provider component for shared floor plan state
 */

import React, { useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';
import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
} from '@/types/settings/table-management.types';
import {
  MOCK_ZONES,
  MOCK_TABLE_POSITIONS,
} from '@/data/tables/mockFloorPlans';
import { MOCK_AREAS } from '@/data/tables/mockAreas';
import { tableStorageService, StoredArea } from '@/services/storage/TableStorageService';
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
  | { type: 'MARK_SAVED' }
  | { type: 'LOAD_FROM_STORAGE'; payload: { floors: Floor[]; tablePositions: FloorPlanTablePosition[] } };

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

    case 'LOAD_FROM_STORAGE': {
      const { floors, tablePositions } = action.payload;
      if (floors.length === 0) return state;
      const defaultFloor = floors.find(f => f.is_default) || floors[0];
      return {
        ...state,
        floors,
        tablePositions,
        activeFloorId: defaultFloor.id,
        hasUnsavedChanges: false,
      };
    }

    default:
      return state;
  }
};

// ==================== INITIAL STATE ====================

// Map old MOCK_FLOORS floor_id to MOCK_AREAS area id
const FLOOR_TO_AREA: Record<string, string> = {
  'floor-main': 'area-1',   // Main Floor → Main Dining
  'floor-patio': 'area-3',  // Outdoor Patio → Patio
  'floor-bar': 'area-4',    // Bar Area → Bar Seating
};

const getInitialState = (): FloorPlanState => {
  // Use MOCK_AREAS as the single source of truth for floor tabs
  const initialFloors = MOCK_AREAS.map(areaToFloor);
  const defaultFloor = initialFloors[0];

  // Remap mock table positions from old floor IDs to area IDs
  const remappedPositions = MOCK_TABLE_POSITIONS.map(tp => ({
    ...tp,
    floor_id: FLOOR_TO_AREA[tp.floor_id] || tp.floor_id,
  }));

  // Remap mock zones from old floor IDs to area IDs
  const remappedZones = MOCK_ZONES.map(z => ({
    ...z,
    floor_id: FLOOR_TO_AREA[z.floor_id] || z.floor_id,
  }));

  return {
    floors: initialFloors,
    zones: remappedZones,
    tablePositions: remappedPositions,
    activeFloorId: defaultFloor?.id || '',
    hasUnsavedChanges: false,
  };
};

// ==================== PROVIDER PROPS ====================

interface FloorPlanProviderProps {
  children: ReactNode;
}

// ==================== PROVIDER COMPONENT ====================

// Convert a StoredArea to a Floor for the floor plan canvas
const areaToFloor = (area: StoredArea, index: number): Floor => ({
  id: String(area.id),
  restaurant_id: 'rest_001',
  name: area.name,
  display_order: index + 1,
  is_active: area.isActive,
  is_default: index === 0,
  canvas_width: 1200,
  canvas_height: 800,
  grid_size: 50,
  grid_enabled: true,
  created_at: new Date(),
  updated_at: new Date(),
});

export const FloorPlanProvider: React.FC<FloorPlanProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(floorPlanReducer, undefined, getInitialState);

  // On mount: pull from server (non-blocking), then load areas + tables from SQLite
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        // Note: Table/area sync is handled by SyncProvider (PullSyncService).
        // We only read from local SQLite here to avoid pulling server sections
        // that create duplicate floor tabs.

        const [rawAreas, tables] = await Promise.all([
          tableStorageService.getAreas(),
          tableStorageService.getTables(),
        ]);

        if (rawAreas.length === 0 && tables.length === 0) return;

        // Filter to only MOCK_AREAS names, deduplicate, and sort by MOCK_AREAS order.
        const mockAreaOrder = new Map(MOCK_AREAS.map((a, i) => [a.name.toLowerCase(), i]));
        const seenNames = new Set<string>();
        const areas = rawAreas
          .filter(a => {
            const key = a.name.toLowerCase();
            if (!mockAreaOrder.has(key) || seenNames.has(key)) return false;
            seenNames.add(key);
            return true;
          })
          .sort((a, b) => {
            const orderA = mockAreaOrder.get(a.name.toLowerCase()) ?? 999;
            const orderB = mockAreaOrder.get(b.name.toLowerCase()) ?? 999;
            return orderA - orderB;
          });

        const floors: Floor[] = areas.map(areaToFloor);

        const tablePositions: FloorPlanTablePosition[] = tables.map((table, idx) => {
          // Match table.section to a floor by ID (mock data uses areaId) or by name (server data uses name)
          const matchingFloor = floors.find(
            f => f.id === table.section || f.name === table.section
          );
          const floorId = matchingFloor?.id ?? floors[0]?.id ?? 'floor-main';

          // Use stored position if available, otherwise lay out in a grid
          const col = idx % 6;
          const row = Math.floor(idx / 6);
          return {
            table_id: table.id,
            floor_id: floorId,
            x: table.position_x > 0 ? table.position_x : 100 + col * 150,
            y: table.position_y > 0 ? table.position_y : 150 + row * 150,
            rotation: 0,
          };
        });

        dispatch({ type: 'LOAD_FROM_STORAGE', payload: { floors, tablePositions } });
      } catch { /* silent */ }
    };

    loadFromStorage();
  }, []);

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
        return false;
      }
      // Prevent deleting default floor
      const floorToDelete = state.floors.find(f => f.id === floorId);
      if (floorToDelete?.is_default) {
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
