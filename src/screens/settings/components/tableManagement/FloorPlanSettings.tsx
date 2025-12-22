/**
 * Floor Plan Settings Component
 * Unified table management application - single screen for all operations
 * Desktop-style interface with fixed toolbar and scrollable canvas
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/design-system/theme/spacing';
import { MOCK_TABLES, MockTable } from '@/data/tables';
import { MOCK_FLOORS, MOCK_TABLE_POSITIONS, MOCK_ZONES } from '@/data/tables/mockFloorPlans';
import { FloorZone, ZoneType, TableShape } from '@/types/settings/table-management.types';

// Floor plan modular components
import {
  FloorPlanCanvas,
  FloorPlanToolbar,
  FloorPlanTabs,
  PropertiesPanel,
  AddTableModal,
  AddZoneModal,
  AddFloorModal,
  SettingsModal,
  useFloorPlanState,
} from './floorPlan';
import type { NewTableConfig, NewZoneConfig, NewFloorConfig } from './floorPlan';
import { Floor } from '@/types/settings/table-management.types';

interface FloorPlanSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const FloorPlanSettings: React.FC<FloorPlanSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Modal visibility states
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Pending position for new items
  const [pendingTablePosition, setPendingTablePosition] = useState<{ x: number; y: number } | null>(null);
  const [pendingZonePosition, setPendingZonePosition] = useState<{ x: number; y: number } | null>(null);

  // Track locally added tables (since MOCK_TABLES is static)
  const [addedTables, setAddedTables] = useState<MockTable[]>([]);

  // Combine MOCK_TABLES with locally added tables
  const allTables = useMemo(
    () => [...MOCK_TABLES, ...addedTables],
    [addedTables]
  );

  // Use the centralized floor plan state hook
  const {
    state,
    setActiveFloor,
    setActiveTool,
    setSelectedTable,
    toggleGrid,
    toggleSnapToGrid,
    toggleShowChairs,
    zoomIn,
    zoomOut,
    moveTable,
    rotateTable,
    resizeTable,
    deleteTable,
    duplicateTable,
    addTable,
    addFloor,
    selectZone,
    moveZone,
    resizeZone,
    addZone,
    undo,
    redo,
  } = useFloorPlanState({
    floors: MOCK_FLOORS,
    zones: MOCK_ZONES,
    initialTablePositions: MOCK_TABLE_POSITIONS,
  });

  // Get current floor data (from state which includes dynamically added floors)
  const currentFloor = useMemo(
    () => state.floors.find(f => f.id === state.activeFloorId) || state.floors[0],
    [state.floors, state.activeFloorId]
  );

  // Get zones for current floor from state
  const currentZones = useMemo(
    () => state.zones.filter(z => z.floor_id === state.activeFloorId),
    [state.zones, state.activeFloorId]
  );

  // Get table positions for current floor
  const currentTablePositions = useMemo(
    () => state.tablePositions.filter(tp => tp.floor_id === state.activeFloorId),
    [state.tablePositions, state.activeFloorId]
  );

  // Get selected table data
  const selectedTablePosition = useMemo(
    () => currentTablePositions.find(tp => tp.table_id === state.selectedTableId),
    [currentTablePositions, state.selectedTableId]
  );

  const selectedTable = useMemo(
    () => allTables.find(t => t.id === state.selectedTableId),
    [allTables, state.selectedTableId]
  );

  // Get selected zone data
  const selectedZone = useMemo(
    () => currentZones.find(z => z.id === state.selectedZoneId),
    [currentZones, state.selectedZoneId]
  );

  // Handlers
  const handleFloorSelect = useCallback((floorId: string) => {
    setActiveFloor(floorId);
    setSelectedTable(null);
  }, [setActiveFloor, setSelectedTable]);

  const handleTableSelect = useCallback((tableId: string) => {
    if (state.activeTool === 'select') {
      setSelectedTable(tableId === state.selectedTableId ? null : tableId);
    } else if (state.activeTool === 'delete') {
      Alert.alert(
        'Delete Table',
        'Remove this table from the floor plan?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteTable(tableId);
              onChangesDetected?.(true);
            },
          },
        ]
      );
    } else if (state.activeTool === 'rotate') {
      rotateTable(tableId, 45);
      onChangesDetected?.(true);
    }
  }, [state.activeTool, state.selectedTableId, setSelectedTable, deleteTable, rotateTable, onChangesDetected]);

  const handleTableMove = useCallback((tableId: string, x: number, y: number) => {
    moveTable(tableId, x, y);
    onChangesDetected?.(true);
  }, [moveTable, onChangesDetected]);

  const handleTableResize = useCallback((tableId: string, width: number, height: number) => {
    resizeTable(tableId, width, height);
    onChangesDetected?.(true);
  }, [resizeTable, onChangesDetected]);

  const handleZoneSelect = useCallback((zoneId: string) => {
    if (state.activeTool === 'select') {
      selectZone(zoneId === state.selectedZoneId ? null : zoneId);
    }
  }, [state.activeTool, state.selectedZoneId, selectZone]);

  const handleZoneMove = useCallback((zoneId: string, x: number, y: number) => {
    moveZone(zoneId, x, y);
    onChangesDetected?.(true);
  }, [moveZone, onChangesDetected]);

  const handleZoneResize = useCallback((zoneId: string, width: number, height: number) => {
    resizeZone(zoneId, width, height);
    onChangesDetected?.(true);
  }, [resizeZone, onChangesDetected]);

  const handleCloseZoneSelection = useCallback(() => {
    selectZone(null);
  }, [selectZone]);

  const handleDuplicate = useCallback(() => {
    if (state.selectedTableId) {
      duplicateTable(state.selectedTableId);
      onChangesDetected?.(true);
    }
  }, [state.selectedTableId, duplicateTable, onChangesDetected]);

  const handleDelete = useCallback(() => {
    if (state.selectedTableId) {
      deleteTable(state.selectedTableId);
      setSelectedTable(null);
      onChangesDetected?.(true);
    }
  }, [state.selectedTableId, deleteTable, setSelectedTable, onChangesDetected]);

  const handleRotate = useCallback(() => {
    if (state.selectedTableId) {
      rotateTable(state.selectedTableId, 45);
      onChangesDetected?.(true);
    }
  }, [state.selectedTableId, rotateTable, onChangesDetected]);

  const handleEdit = useCallback(() => {
    Alert.alert('Edit Table', 'Table editing modal would open here');
  }, []);

  const handleCloseSelection = useCallback(() => {
    setSelectedTable(null);
  }, [setSelectedTable]);

  const handleAddFloor = useCallback(() => {
    setShowAddFloorModal(true);
  }, []);

  // Add floor modal confirm handler
  const handleAddFloorConfirm = useCallback((config: NewFloorConfig) => {
    const newFloor: Floor = {
      id: `floor-${Date.now()}`,
      restaurant_id: 'rest_001',
      name: config.name,
      display_order: state.floors.length + 1,
      is_active: true,
      is_default: false,
      canvas_width: config.canvas_width,
      canvas_height: config.canvas_height,
      grid_size: config.grid_size,
      grid_enabled: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    addFloor(newFloor);
    setShowAddFloorModal(false);
    onChangesDetected?.(true);
  }, [state.floors.length, addFloor, onChangesDetected]);

  // Add floor modal cancel handler
  const handleAddFloorCancel = useCallback(() => {
    setShowAddFloorModal(false);
  }, []);

  // Toolbar action handlers
  const handleSettingsPress = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const handleSettingsSave = useCallback(() => {
    onChangesDetected?.(true);
  }, [onChangesDetected]);

  const handleSaveLayout = useCallback(() => {
    Alert.alert('Success', 'Floor plan layout saved successfully!');
    onChangesDetected?.(false);
  }, [onChangesDetected]);

  const handleExportLayout = useCallback(() => {
    Alert.alert('Export', 'Floor plan exported successfully!');
  }, []);

  const handleImportLayout = useCallback(() => {
    Alert.alert('Import', 'Import functionality will allow uploading JSON floor plan files');
  }, []);

  // Canvas click handler for adding tables
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (state.activeTool === 'add_table') {
      setPendingTablePosition({ x, y });
      setShowAddTableModal(true);
    }
  }, [state.activeTool]);

  // Zone click handler for adding zones (same as table - tap to add)
  const handleZoneClick = useCallback((x: number, y: number) => {
    if (state.activeTool === 'add_zone') {
      setPendingZonePosition({ x, y });
      setShowAddZoneModal(true);
    }
  }, [state.activeTool]);

  // Add table modal confirm handler
  const handleAddTableConfirm = useCallback((config: NewTableConfig) => {
    // Convert TableShape enum to MockTable shape union type
    const shapeMap: Record<TableShape, 'square' | 'round' | 'rectangle'> = {
      [TableShape.ROUND]: 'round',
      [TableShape.SQUARE]: 'square',
      [TableShape.RECTANGLE]: 'rectangle',
      [TableShape.OVAL]: 'round', // Oval falls back to round for MockTable
    };

    // Create new table entry
    const newTable: MockTable = {
      id: `new-${Date.now()}`,
      number: config.tableNumber,
      capacity: config.capacity,
      shape: shapeMap[config.shape],
      status: 'available',
      area: 'New Tables',
      areaId: state.activeFloorId,
      positionX: config.x,
      positionY: config.y,
    };

    // Add to local tables list
    setAddedTables(prev => [...prev, newTable]);

    // Add position to floor plan state
    addTable({
      table_id: newTable.id,
      floor_id: state.activeFloorId,
      x: config.x,
      y: config.y,
      rotation: 0,
    });

    // Close modal and reset state
    setShowAddTableModal(false);
    setPendingTablePosition(null);
    setActiveTool('select');
    onChangesDetected?.(true);
  }, [state.activeFloorId, addTable, setActiveTool, onChangesDetected]);

  // Add table modal cancel handler
  const handleAddTableCancel = useCallback(() => {
    setShowAddTableModal(false);
    setPendingTablePosition(null);
  }, []);

  // Helper to get zone color by type
  const getZoneColorByType = (type: ZoneType): string => {
    const colorMap: Record<ZoneType, string> = {
      kitchen: 'outline',
      bar: 'info',
      entrance: 'outline',
      vip: 'warning',
      outdoor: 'success',
      storage: 'outline',
      restroom: 'outline',
      custom: 'primary',
    };
    return colorMap[type] || 'primary';
  };

  // Add zone modal confirm handler
  const handleAddZoneConfirm = useCallback((config: NewZoneConfig) => {
    // Create new zone object
    const newZone: FloorZone = {
      id: `zone-${Date.now()}`,
      floor_id: state.activeFloorId,
      name: config.name,
      type: config.type,
      bounds: config.bounds,
      color: getZoneColorByType(config.type),
      icon: config.icon,
      is_seating_area: config.isSeatingArea,
      opacity: 0.2,
      is_locked: false,
      display_order: currentZones.length + 1,
    };

    // Add to state
    addZone(newZone);

    // Close modal and reset state
    setShowAddZoneModal(false);
    setPendingZonePosition(null);
    setActiveTool('select');
    onChangesDetected?.(true);
  }, [state.activeFloorId, currentZones.length, addZone, setActiveTool, onChangesDetected]);

  // Add zone modal cancel handler
  const handleAddZoneCancel = useCallback(() => {
    setShowAddZoneModal(false);
    setPendingZonePosition(null);
  }, []);

  // Disable scroll when in move mode to allow table dragging
  const scrollEnabled = state.activeTool !== 'move';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    // FIXED HEADER - Always visible
    fixedHeader: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    // CONTENT AREA - Canvas + Properties panel
    contentArea: {
      flex: 1,
      flexDirection: 'row',
    },
    canvasScrollContainer: {
      flex: 1,
    },
    canvasScroll: {
      flex: 1,
    },
    horizontalScrollContent: {
      flexGrow: 1,
    },
    canvasContent: {
      minHeight: 600,
      minWidth: currentFloor?.canvas_width || 1200,
      padding: spacing.md,
    },
    propertiesColumn: {
      width: 280,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
  });

  return (
    <View style={styles.container}>
      {/* FIXED HEADER - Tabs and Toolbar always visible */}
      <View style={styles.fixedHeader}>
        <FloorPlanTabs
          floors={state.floors}
          activeFloorId={state.activeFloorId}
          onFloorSelect={handleFloorSelect}
          onAddFloor={handleAddFloor}
        />
        <FloorPlanToolbar
          activeTool={state.activeTool}
          gridEnabled={state.gridEnabled}
          snapToGrid={state.snapToGrid}
          showChairs={state.showChairs}
          zoom={state.zoom}
          canUndo={state.canUndo}
          canRedo={state.canRedo}
          onToolChange={setActiveTool}
          onGridToggle={toggleGrid}
          onSnapToggle={toggleSnapToGrid}
          onChairsToggle={toggleShowChairs}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onUndo={undo}
          onRedo={redo}
          onSettingsPress={handleSettingsPress}
          onImport={handleImportLayout}
          onExport={handleExportLayout}
          onSave={handleSaveLayout}
        />
      </View>

      {/* CONTENT AREA - Canvas scrolls, properties always visible */}
      <View style={styles.contentArea}>
        {/* Scrollable Canvas - Nested ScrollViews for horizontal + vertical */}
        <View style={styles.canvasScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            scrollEnabled={scrollEnabled}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              scrollEnabled={scrollEnabled}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.canvasContent}
            >
              <FloorPlanCanvas
                floor={currentFloor}
                zones={currentZones}
                tablePositions={currentTablePositions}
                tables={allTables}
                selectedTableId={state.selectedTableId}
                selectedZoneId={state.selectedZoneId}
                gridEnabled={state.gridEnabled}
                snapToGrid={state.snapToGrid}
                showChairs={state.showChairs}
                zoom={state.zoom}
                panOffset={state.panOffset}
                activeTool={state.activeTool}
                onTableSelect={handleTableSelect}
                onTableMove={handleTableMove}
                onTableResize={handleTableResize}
                onZoneSelect={handleZoneSelect}
                onZoneMove={handleZoneMove}
                onZoneResize={handleZoneResize}
                onCanvasClick={handleCanvasClick}
                onZoneClick={handleZoneClick}
              />
            </ScrollView>
          </ScrollView>
        </View>

        {/* Properties Panel - Always visible (shows stats when nothing selected) */}
        <View style={styles.propertiesColumn}>
          <PropertiesPanel
            selectedTable={selectedTable}
            selectedTablePosition={selectedTablePosition}
            selectedZone={selectedZone}
            floor={currentFloor}
            tables={allTables}
            zones={currentZones}
            tablePositions={currentTablePositions}
            onCloseSelection={selectedZone ? handleCloseZoneSelection : handleCloseSelection}
            onDuplicateTable={handleDuplicate}
            onDeleteTable={handleDelete}
            onRotateTable={handleRotate}
            onEditTable={handleEdit}
          />
        </View>
      </View>

      {/* Modals */}
      {pendingTablePosition && (
        <AddTableModal
          visible={showAddTableModal}
          position={pendingTablePosition}
          floorId={state.activeFloorId}
          onConfirm={handleAddTableConfirm}
          onCancel={handleAddTableCancel}
        />
      )}
      {pendingZonePosition && (
        <AddZoneModal
          visible={showAddZoneModal}
          position={pendingZonePosition}
          floorId={state.activeFloorId}
          onConfirm={handleAddZoneConfirm}
          onCancel={handleAddZoneCancel}
        />
      )}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSettingsSave}
      />
      <AddFloorModal
        visible={showAddFloorModal}
        onConfirm={handleAddFloorConfirm}
        onCancel={handleAddFloorCancel}
      />
    </View>
  );
};

export default FloorPlanSettings;
