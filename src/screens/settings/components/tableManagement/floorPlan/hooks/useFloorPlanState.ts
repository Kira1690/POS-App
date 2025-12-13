/**
 * useFloorPlanState Hook
 * Central state management for the floor plan editor
 */

import { useReducer, useCallback, useMemo } from 'react';
import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
  FloorPlanTool,
  FloorPlanCanvasState,
  FloorPlanReducerAction,
  FloorPlanSnapshot,
} from '@/types/settings/table-management.types';
import { useUndoRedo } from './useUndoRedo';

// ==================== STATE INTERFACE ====================

interface FloorPlanState {
  floors: Floor[];
  zones: FloorZone[];
  tablePositions: FloorPlanTablePosition[];
  canvas: FloorPlanCanvasState;
}

// ==================== INITIAL STATE ====================

const createInitialCanvasState = (defaultFloorId: string): FloorPlanCanvasState => ({
  activeFloorId: defaultFloorId,
  selectedTableId: null,
  selectedZoneId: null,
  activeTool: 'select',
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  gridEnabled: true,
  snapToGrid: true,
  showChairs: true,
  showTableNumbers: true,
  showCapacity: true,
  hasUnsavedChanges: false,
});

// ==================== REDUCER ====================

const floorPlanReducer = (
  state: FloorPlanState,
  action: FloorPlanReducerAction
): FloorPlanState => {
  switch (action.type) {
    case 'SELECT_FLOOR':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          activeFloorId: action.payload,
          selectedTableId: null,
          selectedZoneId: null,
        },
      };

    case 'SELECT_TABLE':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          selectedTableId: action.payload,
          selectedZoneId: null,
        },
      };

    case 'SELECT_ZONE':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          selectedZoneId: action.payload,
          selectedTableId: null,
        },
      };

    case 'SET_TOOL':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          activeTool: action.payload,
          // Clear selection when switching to certain tools
          ...(action.payload === 'add_table' || action.payload === 'add_zone'
            ? { selectedTableId: null, selectedZoneId: null }
            : {}),
        },
      };

    case 'SET_ZOOM':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          zoom: Math.min(Math.max(action.payload, 0.5), 2.0),
        },
      };

    case 'SET_PAN':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          pan: action.payload,
        },
      };

    case 'TOGGLE_GRID':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          gridEnabled: !state.canvas.gridEnabled,
        },
      };

    case 'TOGGLE_SNAP':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          snapToGrid: !state.canvas.snapToGrid,
        },
      };

    case 'TOGGLE_CHAIRS':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          showChairs: !state.canvas.showChairs,
        },
      };

    case 'UPDATE_TABLE_POSITION': {
      const { tableId, position } = action.payload;
      return {
        ...state,
        tablePositions: state.tablePositions.map(pos =>
          pos.table_id === tableId ? { ...pos, ...position } : pos
        ),
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
        },
      };
    }

    case 'RESIZE_TABLE': {
      const { tableId, width, height } = action.payload;
      return {
        ...state,
        tablePositions: state.tablePositions.map(pos =>
          pos.table_id === tableId ? { ...pos, width, height } : pos
        ),
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
        },
      };
    }

    case 'ADD_TABLE':
      return {
        ...state,
        tablePositions: [...state.tablePositions, action.payload],
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
          selectedTableId: action.payload.table_id,
        },
      };

    case 'DELETE_TABLE':
      return {
        ...state,
        tablePositions: state.tablePositions.filter(
          pos => pos.table_id !== action.payload
        ),
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
          selectedTableId:
            state.canvas.selectedTableId === action.payload
              ? null
              : state.canvas.selectedTableId,
        },
      };

    case 'ADD_ZONE':
      return {
        ...state,
        zones: [...state.zones, action.payload],
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
          selectedZoneId: action.payload.id,
        },
      };

    case 'UPDATE_ZONE': {
      const { zoneId, zone } = action.payload;
      return {
        ...state,
        zones: state.zones.map(z => (z.id === zoneId ? { ...z, ...zone } : z)),
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
        },
      };
    }

    case 'MOVE_ZONE': {
      const { zoneId, x, y } = action.payload;
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === zoneId
            ? { ...z, bounds: { ...z.bounds, x, y } }
            : z
        ),
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
        },
      };
    }

    case 'RESIZE_ZONE': {
      const { zoneId, width, height } = action.payload;
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === zoneId
            ? { ...z, bounds: { ...z.bounds, width, height } }
            : z
        ),
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
        },
      };
    }

    case 'DELETE_ZONE':
      return {
        ...state,
        zones: state.zones.filter(z => z.id !== action.payload),
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: true,
          selectedZoneId:
            state.canvas.selectedZoneId === action.payload
              ? null
              : state.canvas.selectedZoneId,
        },
      };

    case 'MARK_SAVED':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          hasUnsavedChanges: false,
        },
      };

    default:
      return state;
  }
};

// ==================== HOOK ====================

interface UseFloorPlanStateOptions {
  floors: Floor[];
  zones?: FloorZone[];
  initialTablePositions: FloorPlanTablePosition[];
  onChangesDetected?: (hasChanges: boolean) => void;
}

export const useFloorPlanState = (options: UseFloorPlanStateOptions) => {
  const {
    floors: initialFloors,
    zones: initialZones = [],
    initialTablePositions,
    onChangesDetected,
  } = options;

  // Find default floor
  const defaultFloorId = useMemo(
    () => initialFloors.find(f => f.is_default)?.id || initialFloors[0]?.id || '',
    [initialFloors]
  );

  // Initialize state
  const [state, dispatch] = useReducer(floorPlanReducer, {
    floors: initialFloors,
    zones: initialZones,
    tablePositions: initialTablePositions,
    canvas: createInitialCanvasState(defaultFloorId),
  });

  // Undo/Redo hook
  const {
    canUndo,
    canRedo,
    pushHistory,
    undo: undoHistory,
    redo: redoHistory,
    getUndoDescription,
    getRedoDescription,
  } = useUndoRedo();

  // ==================== SELECTORS ====================

  const currentFloor = useMemo(
    () => state.floors.find(f => f.id === state.canvas.activeFloorId),
    [state.floors, state.canvas.activeFloorId]
  );

  const currentZones = useMemo(
    () => state.zones.filter(z => z.floor_id === state.canvas.activeFloorId),
    [state.zones, state.canvas.activeFloorId]
  );

  const currentTablePositions = useMemo(
    () => state.tablePositions.filter(p => p.floor_id === state.canvas.activeFloorId),
    [state.tablePositions, state.canvas.activeFloorId]
  );

  const selectedTable = useMemo(
    () =>
      state.canvas.selectedTableId
        ? state.tablePositions.find(p => p.table_id === state.canvas.selectedTableId)
        : null,
    [state.tablePositions, state.canvas.selectedTableId]
  );

  const selectedZone = useMemo(
    () =>
      state.canvas.selectedZoneId
        ? state.zones.find(z => z.id === state.canvas.selectedZoneId)
        : null,
    [state.zones, state.canvas.selectedZoneId]
  );

  // ==================== SNAPSHOT HELPERS ====================

  const createSnapshot = useCallback((): FloorPlanSnapshot => ({
    tables: [...state.tablePositions],
    zones: [...state.zones],
  }), [state.tablePositions, state.zones]);

  // ==================== ACTIONS ====================

  const selectFloor = useCallback((floorId: string) => {
    dispatch({ type: 'SELECT_FLOOR', payload: floorId });
  }, []);

  const selectTable = useCallback((tableId: string | null) => {
    dispatch({ type: 'SELECT_TABLE', payload: tableId });
  }, []);

  const selectZone = useCallback((zoneId: string | null) => {
    dispatch({ type: 'SELECT_ZONE', payload: zoneId });
  }, []);

  const setTool = useCallback((tool: FloorPlanTool) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPan = useCallback((pan: { x: number; y: number }) => {
    dispatch({ type: 'SET_PAN', payload: pan });
  }, []);

  const toggleGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_GRID' });
  }, []);

  const toggleSnap = useCallback(() => {
    dispatch({ type: 'TOGGLE_SNAP' });
  }, []);

  const toggleChairs = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAIRS' });
  }, []);

  const updateTablePosition = useCallback(
    (tableId: string, position: Partial<FloorPlanTablePosition>) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'UPDATE_TABLE_POSITION', payload: { tableId, position } });

      // Push to history after update
      const afterSnapshot: FloorPlanSnapshot = {
        tables: state.tablePositions.map(p =>
          p.table_id === tableId ? { ...p, ...position } : p
        ),
        zones: state.zones,
      };
      pushHistory('table_moved', `Moved table ${tableId}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  const addTable = useCallback(
    (tablePosition: FloorPlanTablePosition) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'ADD_TABLE', payload: tablePosition });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: [...state.tablePositions, tablePosition],
        zones: state.zones,
      };
      pushHistory('table_added', `Added table ${tablePosition.table_id}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  const deleteTable = useCallback(
    (tableId: string) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'DELETE_TABLE', payload: tableId });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: state.tablePositions.filter(p => p.table_id !== tableId),
        zones: state.zones,
      };
      pushHistory('table_deleted', `Deleted table ${tableId}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  const markSaved = useCallback(() => {
    dispatch({ type: 'MARK_SAVED' });
    onChangesDetected?.(false);
  }, [onChangesDetected]);

  const undo = useCallback(() => {
    const snapshot = undoHistory();
    if (snapshot) {
      onChangesDetected?.(true);
    }
    return snapshot;
  }, [undoHistory, onChangesDetected]);

  const redo = useCallback(() => {
    const snapshot = redoHistory();
    if (snapshot) {
      onChangesDetected?.(true);
    }
    return snapshot;
  }, [redoHistory, onChangesDetected]);

  // Additional convenience methods for the orchestrator
  const zoomIn = useCallback(() => {
    setZoom(Math.min(state.canvas.zoom + 0.1, 2.0));
  }, [state.canvas.zoom, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(Math.max(state.canvas.zoom - 0.1, 0.5));
  }, [state.canvas.zoom, setZoom]);

  const moveTable = useCallback(
    (tableId: string, x: number, y: number) => {
      updateTablePosition(tableId, { x, y });
    },
    [updateTablePosition]
  );

  const rotateTable = useCallback(
    (tableId: string, angle: number) => {
      const currentPos = state.tablePositions.find(p => p.table_id === tableId);
      if (currentPos) {
        const newRotation = (currentPos.rotation + angle) % 360;
        updateTablePosition(tableId, { rotation: newRotation });
      }
    },
    [state.tablePositions, updateTablePosition]
  );

  const duplicateTable = useCallback(
    (tableId: string) => {
      const original = state.tablePositions.find(p => p.table_id === tableId);
      if (original) {
        const newId = `dup-${Date.now()}`;
        const newPosition: FloorPlanTablePosition = {
          ...original,
          table_id: newId,
          x: original.x + 50,
          y: original.y + 50,
        };
        addTable(newPosition);
      }
    },
    [state.tablePositions, addTable]
  );

  const resizeTable = useCallback(
    (tableId: string, width: number, height: number) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'RESIZE_TABLE', payload: { tableId, width, height } });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: state.tablePositions.map(p =>
          p.table_id === tableId ? { ...p, width, height } : p
        ),
        zones: state.zones,
      };
      pushHistory('table_resized', `Resized table ${tableId}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  const moveZone = useCallback(
    (zoneId: string, x: number, y: number) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'MOVE_ZONE', payload: { zoneId, x, y } });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: state.tablePositions,
        zones: state.zones.map(z =>
          z.id === zoneId ? { ...z, bounds: { ...z.bounds, x, y } } : z
        ),
      };
      pushHistory('zone_moved', `Moved zone ${zoneId}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  const resizeZone = useCallback(
    (zoneId: string, width: number, height: number) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'RESIZE_ZONE', payload: { zoneId, width, height } });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: state.tablePositions,
        zones: state.zones.map(z =>
          z.id === zoneId ? { ...z, bounds: { ...z.bounds, width, height } } : z
        ),
      };
      pushHistory('zone_resized', `Resized zone ${zoneId}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  const addZone = useCallback(
    (zone: FloorZone) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'ADD_ZONE', payload: zone });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: state.tablePositions,
        zones: [...state.zones, zone],
      };
      pushHistory('zone_added', `Added zone ${zone.name}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  const deleteZone = useCallback(
    (zoneId: string) => {
      const beforeSnapshot = createSnapshot();
      dispatch({ type: 'DELETE_ZONE', payload: zoneId });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: state.tablePositions,
        zones: state.zones.filter(z => z.id !== zoneId),
      };
      pushHistory('zone_deleted', `Deleted zone ${zoneId}`, beforeSnapshot, afterSnapshot);
      onChangesDetected?.(true);
    },
    [createSnapshot, state.tablePositions, state.zones, pushHistory, onChangesDetected]
  );

  // Exposed state with simplified interface
  const exposedState = useMemo(() => ({
    activeFloorId: state.canvas.activeFloorId,
    selectedTableId: state.canvas.selectedTableId,
    selectedZoneId: state.canvas.selectedZoneId,
    activeTool: state.canvas.activeTool,
    zoom: state.canvas.zoom,
    panOffset: state.canvas.pan,
    gridEnabled: state.canvas.gridEnabled,
    snapToGrid: state.canvas.snapToGrid,
    showChairs: state.canvas.showChairs,
    hasUnsavedChanges: state.canvas.hasUnsavedChanges,
    tablePositions: state.tablePositions,
    zones: state.zones,
    floors: state.floors,
    canUndo,
    canRedo,
  }), [
    state.canvas,
    state.tablePositions,
    state.zones,
    state.floors,
    canUndo,
    canRedo,
  ]);

  return {
    // Simplified state for orchestrator
    state: exposedState,

    // Full internal state
    canvas: state.canvas,
    floors: state.floors,
    zones: state.zones,
    tablePositions: state.tablePositions,

    // Computed
    currentFloor,
    currentZones,
    currentTablePositions,
    selectedTable,
    selectedZone,

    // Floor actions
    setActiveFloor: selectFloor,

    // Table actions
    setSelectedTable: selectTable,
    moveTable,
    rotateTable,
    resizeTable,
    duplicateTable,
    deleteTable,
    addTable,

    // Zone actions
    selectZone,
    moveZone,
    resizeZone,
    addZone,
    deleteZone,

    // Tool actions
    setActiveTool: setTool,

    // View actions
    setZoom,
    setPan,
    zoomIn,
    zoomOut,
    toggleGrid,
    toggleSnapToGrid: toggleSnap,
    toggleShowChairs: toggleChairs,

    // Persistence
    markSaved,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoDescription,
    getRedoDescription,
  };
};

export default useFloorPlanState;
