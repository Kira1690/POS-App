/**
 * useFloorPlanState Hook
 * Central state management for the floor plan editor
 * Now delegates shared state to FloorPlanContext for Dashboard sync
 */

import { useReducer, useCallback, useMemo } from 'react';
import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
  FloorPlanTool,
  FloorPlanSnapshot,
} from '@/types/settings/table-management.types';
import { useFloorPlan } from '@/context/floorPlan';
import { useUndoRedo } from './useUndoRedo';

// ==================== LOCAL CANVAS STATE ====================
// Canvas state is local to the Settings editor (not shared with Dashboard)

interface CanvasState {
  selectedTableId: string | null;
  selectedZoneId: string | null;
  activeTool: FloorPlanTool;
  zoom: number;
  pan: { x: number; y: number };
  gridEnabled: boolean;
  snapToGrid: boolean;
  showChairs: boolean;
  showTableNumbers: boolean;
  showCapacity: boolean;
}

type CanvasAction =
  | { type: 'SELECT_TABLE'; payload: string | null }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'SET_TOOL'; payload: FloorPlanTool }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'TOGGLE_CHAIRS' }
  | { type: 'CLEAR_SELECTION' };

const createInitialCanvasState = (): CanvasState => ({
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
});

const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'SELECT_TABLE':
      return {
        ...state,
        selectedTableId: action.payload,
        selectedZoneId: null,
      };

    case 'SELECT_ZONE':
      return {
        ...state,
        selectedZoneId: action.payload,
        selectedTableId: null,
      };

    case 'SET_TOOL':
      return {
        ...state,
        activeTool: action.payload,
        // Clear selection when switching to certain tools
        ...(action.payload === 'add_table' || action.payload === 'add_zone'
          ? { selectedTableId: null, selectedZoneId: null }
          : {}),
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.min(Math.max(action.payload, 0.5), 2.0),
      };

    case 'SET_PAN':
      return {
        ...state,
        pan: action.payload,
      };

    case 'TOGGLE_GRID':
      return {
        ...state,
        gridEnabled: !state.gridEnabled,
      };

    case 'TOGGLE_SNAP':
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      };

    case 'TOGGLE_CHAIRS':
      return {
        ...state,
        showChairs: !state.showChairs,
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedTableId: null,
        selectedZoneId: null,
      };

    default:
      return state;
  }
};

// ==================== HOOK ====================

interface UseFloorPlanStateOptions {
  /** @deprecated Initial floors - now comes from context */
  floors?: Floor[];
  /** @deprecated Initial zones - now comes from context */
  zones?: FloorZone[];
  /** @deprecated Initial table positions - now comes from context */
  initialTablePositions?: FloorPlanTablePosition[];
  /** Callback when changes are detected */
  onChangesDetected?: (hasChanges: boolean) => void;
}

export const useFloorPlanState = (options: UseFloorPlanStateOptions = {}) => {
  const { onChangesDetected } = options;

  // Get shared state from context
  const floorPlanContext = useFloorPlan();
  const {
    floors,
    zones,
    tablePositions,
    activeFloorId,
    currentFloor,
    currentZones,
    currentTablePositions,
    setActiveFloor,
    addFloor: contextAddFloor,
    updateFloor: contextUpdateFloor,
    deleteFloor: contextDeleteFloor,
    addTablePosition,
    updateTablePosition: contextUpdateTablePosition,
    deleteTablePosition,
    addZone: contextAddZone,
    updateZone: contextUpdateZone,
    deleteZone: contextDeleteZone,
    moveZone: contextMoveZone,
    resizeZone: contextResizeZone,
    hasUnsavedChanges,
    markSaved: contextMarkSaved,
  } = floorPlanContext;

  // Local canvas state (edit-specific, not shared)
  const [canvas, dispatchCanvas] = useReducer(
    canvasReducer,
    undefined,
    createInitialCanvasState
  );

  // Undo/Redo hook (local to editor)
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

  const selectedTable = useMemo(
    () =>
      canvas.selectedTableId
        ? tablePositions.find(p => p.table_id === canvas.selectedTableId)
        : null,
    [tablePositions, canvas.selectedTableId]
  );

  const selectedZone = useMemo(
    () =>
      canvas.selectedZoneId
        ? zones.find(z => z.id === canvas.selectedZoneId)
        : null,
    [zones, canvas.selectedZoneId]
  );

  // ==================== SNAPSHOT HELPERS ====================

  const createSnapshot = useCallback(
    (): FloorPlanSnapshot => ({
      tables: [...tablePositions],
      zones: [...zones],
    }),
    [tablePositions, zones]
  );

  // ==================== CANVAS ACTIONS ====================

  const selectFloor = useCallback(
    (floorId: string) => {
      setActiveFloor(floorId);
      dispatchCanvas({ type: 'CLEAR_SELECTION' });
    },
    [setActiveFloor]
  );

  const selectTable = useCallback((tableId: string | null) => {
    dispatchCanvas({ type: 'SELECT_TABLE', payload: tableId });
  }, []);

  const selectZone = useCallback((zoneId: string | null) => {
    dispatchCanvas({ type: 'SELECT_ZONE', payload: zoneId });
  }, []);

  const setTool = useCallback((tool: FloorPlanTool) => {
    dispatchCanvas({ type: 'SET_TOOL', payload: tool });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatchCanvas({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPan = useCallback((pan: { x: number; y: number }) => {
    dispatchCanvas({ type: 'SET_PAN', payload: pan });
  }, []);

  const toggleGrid = useCallback(() => {
    dispatchCanvas({ type: 'TOGGLE_GRID' });
  }, []);

  const toggleSnap = useCallback(() => {
    dispatchCanvas({ type: 'TOGGLE_SNAP' });
  }, []);

  const toggleChairs = useCallback(() => {
    dispatchCanvas({ type: 'TOGGLE_CHAIRS' });
  }, []);

  // ==================== TABLE ACTIONS ====================

  const updateTablePosition = useCallback(
    (tableId: string, position: Partial<FloorPlanTablePosition>) => {
      const beforeSnapshot = createSnapshot();
      contextUpdateTablePosition(tableId, position);

      // Push to history after update
      const afterSnapshot: FloorPlanSnapshot = {
        tables: tablePositions.map(p =>
          p.table_id === tableId ? { ...p, ...position } : p
        ),
        zones,
      };
      pushHistory(
        'table_moved',
        `Moved table ${tableId}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
    },
    [
      createSnapshot,
      contextUpdateTablePosition,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
    ]
  );

  const addTable = useCallback(
    (tablePosition: FloorPlanTablePosition) => {
      const beforeSnapshot = createSnapshot();
      addTablePosition(tablePosition);

      const afterSnapshot: FloorPlanSnapshot = {
        tables: [...tablePositions, tablePosition],
        zones,
      };
      pushHistory(
        'table_added',
        `Added table ${tablePosition.table_id}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
      // Select the newly added table
      dispatchCanvas({ type: 'SELECT_TABLE', payload: tablePosition.table_id });
    },
    [
      createSnapshot,
      addTablePosition,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
    ]
  );

  const deleteTable = useCallback(
    (tableId: string) => {
      const beforeSnapshot = createSnapshot();
      deleteTablePosition(tableId);

      const afterSnapshot: FloorPlanSnapshot = {
        tables: tablePositions.filter(p => p.table_id !== tableId),
        zones,
      };
      pushHistory(
        'table_deleted',
        `Deleted table ${tableId}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
      // Clear selection if deleted table was selected
      if (canvas.selectedTableId === tableId) {
        dispatchCanvas({ type: 'SELECT_TABLE', payload: null });
      }
    },
    [
      createSnapshot,
      deleteTablePosition,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
      canvas.selectedTableId,
    ]
  );

  const moveTable = useCallback(
    (tableId: string, x: number, y: number) => {
      updateTablePosition(tableId, { x, y });
    },
    [updateTablePosition]
  );

  const rotateTable = useCallback(
    (tableId: string, angle: number) => {
      const currentPos = tablePositions.find(p => p.table_id === tableId);
      if (currentPos) {
        const newRotation = (currentPos.rotation + angle) % 360;
        updateTablePosition(tableId, { rotation: newRotation });
      }
    },
    [tablePositions, updateTablePosition]
  );

  const resizeTable = useCallback(
    (tableId: string, width: number, height: number) => {
      const beforeSnapshot = createSnapshot();
      contextUpdateTablePosition(tableId, { width, height });

      const afterSnapshot: FloorPlanSnapshot = {
        tables: tablePositions.map(p =>
          p.table_id === tableId ? { ...p, width, height } : p
        ),
        zones,
      };
      pushHistory(
        'table_resized',
        `Resized table ${tableId}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
    },
    [
      createSnapshot,
      contextUpdateTablePosition,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
    ]
  );

  const duplicateTable = useCallback(
    (tableId: string) => {
      const original = tablePositions.find(p => p.table_id === tableId);
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
    [tablePositions, addTable]
  );

  // ==================== ZONE ACTIONS ====================

  const addZone = useCallback(
    (zone: FloorZone) => {
      const beforeSnapshot = createSnapshot();
      contextAddZone(zone);

      const afterSnapshot: FloorPlanSnapshot = {
        tables: tablePositions,
        zones: [...zones, zone],
      };
      pushHistory(
        'zone_added',
        `Added zone ${zone.name}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
      // Select the newly added zone
      dispatchCanvas({ type: 'SELECT_ZONE', payload: zone.id });
    },
    [
      createSnapshot,
      contextAddZone,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
    ]
  );

  const moveZone = useCallback(
    (zoneId: string, x: number, y: number) => {
      const beforeSnapshot = createSnapshot();
      contextMoveZone(zoneId, x, y);

      const afterSnapshot: FloorPlanSnapshot = {
        tables: tablePositions,
        zones: zones.map(z =>
          z.id === zoneId ? { ...z, bounds: { ...z.bounds, x, y } } : z
        ),
      };
      pushHistory(
        'zone_moved',
        `Moved zone ${zoneId}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
    },
    [
      createSnapshot,
      contextMoveZone,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
    ]
  );

  const resizeZone = useCallback(
    (zoneId: string, width: number, height: number) => {
      const beforeSnapshot = createSnapshot();
      contextResizeZone(zoneId, width, height);

      const afterSnapshot: FloorPlanSnapshot = {
        tables: tablePositions,
        zones: zones.map(z =>
          z.id === zoneId ? { ...z, bounds: { ...z.bounds, width, height } } : z
        ),
      };
      pushHistory(
        'zone_resized',
        `Resized zone ${zoneId}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
    },
    [
      createSnapshot,
      contextResizeZone,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
    ]
  );

  const deleteZone = useCallback(
    (zoneId: string) => {
      const beforeSnapshot = createSnapshot();
      contextDeleteZone(zoneId);

      const afterSnapshot: FloorPlanSnapshot = {
        tables: tablePositions,
        zones: zones.filter(z => z.id !== zoneId),
      };
      pushHistory(
        'zone_deleted',
        `Deleted zone ${zoneId}`,
        beforeSnapshot,
        afterSnapshot
      );
      onChangesDetected?.(true);
      // Clear selection if deleted zone was selected
      if (canvas.selectedZoneId === zoneId) {
        dispatchCanvas({ type: 'SELECT_ZONE', payload: null });
      }
    },
    [
      createSnapshot,
      contextDeleteZone,
      tablePositions,
      zones,
      pushHistory,
      onChangesDetected,
      canvas.selectedZoneId,
    ]
  );

  // ==================== FLOOR ACTIONS ====================

  const addFloor = useCallback(
    (floor: Floor) => {
      contextAddFloor(floor);
      onChangesDetected?.(true);
      // Switch to the new floor
      setActiveFloor(floor.id);
      dispatchCanvas({ type: 'CLEAR_SELECTION' });
    },
    [contextAddFloor, onChangesDetected, setActiveFloor]
  );

  const updateFloor = useCallback(
    (floorId: string, floorUpdates: Partial<Floor>) => {
      contextUpdateFloor(floorId, floorUpdates);
      onChangesDetected?.(true);
    },
    [contextUpdateFloor, onChangesDetected]
  );

  const deleteFloor = useCallback(
    (floorId: string): boolean => {
      const success = contextDeleteFloor(floorId);
      if (success) {
        onChangesDetected?.(true);
        dispatchCanvas({ type: 'CLEAR_SELECTION' });
      }
      return success;
    },
    [contextDeleteFloor, onChangesDetected]
  );

  // ==================== PERSISTENCE ====================

  const markSaved = useCallback(() => {
    contextMarkSaved();
    onChangesDetected?.(false);
  }, [contextMarkSaved, onChangesDetected]);

  // ==================== UNDO/REDO ====================

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

  // ==================== CONVENIENCE METHODS ====================

  const zoomIn = useCallback(() => {
    setZoom(Math.min(canvas.zoom + 0.1, 2.0));
  }, [canvas.zoom, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(Math.max(canvas.zoom - 0.1, 0.5));
  }, [canvas.zoom, setZoom]);

  // ==================== EXPOSED STATE ====================

  // Exposed state with simplified interface (maintains backward compatibility)
  const exposedState = useMemo(
    () => ({
      activeFloorId,
      selectedTableId: canvas.selectedTableId,
      selectedZoneId: canvas.selectedZoneId,
      activeTool: canvas.activeTool,
      zoom: canvas.zoom,
      panOffset: canvas.pan,
      gridEnabled: canvas.gridEnabled,
      snapToGrid: canvas.snapToGrid,
      showChairs: canvas.showChairs,
      hasUnsavedChanges,
      tablePositions,
      zones,
      floors,
      canUndo,
      canRedo,
    }),
    [
      activeFloorId,
      canvas,
      hasUnsavedChanges,
      tablePositions,
      zones,
      floors,
      canUndo,
      canRedo,
    ]
  );

  // Build canvas object for backward compatibility
  const canvasCompat = useMemo(
    () => ({
      activeFloorId,
      selectedTableId: canvas.selectedTableId,
      selectedZoneId: canvas.selectedZoneId,
      activeTool: canvas.activeTool,
      zoom: canvas.zoom,
      pan: canvas.pan,
      gridEnabled: canvas.gridEnabled,
      snapToGrid: canvas.snapToGrid,
      showChairs: canvas.showChairs,
      showTableNumbers: canvas.showTableNumbers,
      showCapacity: canvas.showCapacity,
      hasUnsavedChanges,
    }),
    [activeFloorId, canvas, hasUnsavedChanges]
  );

  return {
    // Simplified state for orchestrator
    state: exposedState,

    // Full internal state (backward compatibility)
    canvas: canvasCompat,
    floors,
    zones,
    tablePositions,

    // Computed
    currentFloor,
    currentZones,
    currentTablePositions,
    selectedTable,
    selectedZone,

    // Floor actions
    setActiveFloor: selectFloor,
    addFloor,
    updateFloor,
    deleteFloor,

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
