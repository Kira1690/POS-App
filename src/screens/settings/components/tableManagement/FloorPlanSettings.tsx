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
import { MOCK_FLOORS, MOCK_TABLE_POSITIONS, getZonesByFloor } from '@/data/tables/mockFloorPlans';
import { TableShape, ZoneBounds } from '@/types/settings/table-management.types';

// Floor plan modular components
import {
  FloorPlanCanvas,
  FloorPlanToolbar,
  FloorPlanTabs,
  PropertiesPanel,
  AddTableModal,
  AddZoneModal,
  SettingsModal,
  useFloorPlanState,
} from './floorPlan';
import type { NewTableConfig, NewZoneConfig } from './floorPlan';

interface FloorPlanSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const FloorPlanSettings: React.FC<FloorPlanSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Modal visibility states
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Pending position/bounds for new items
  const [pendingTablePosition, setPendingTablePosition] = useState<{ x: number; y: number } | null>(null);
  const [pendingZoneBounds, setPendingZoneBounds] = useState<ZoneBounds | null>(null);

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
    deleteTable,
    duplicateTable,
    addTable,
    undo,
    redo,
  } = useFloorPlanState({
    floors: MOCK_FLOORS,
    initialTablePositions: MOCK_TABLE_POSITIONS,
  });

  // Get current floor data
  const currentFloor = useMemo(
    () => MOCK_FLOORS.find(f => f.id === state.activeFloorId) || MOCK_FLOORS[0],
    [state.activeFloorId]
  );

  // Get zones for current floor
  const currentZones = useMemo(
    () => getZonesByFloor(state.activeFloorId),
    [state.activeFloorId]
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
    Alert.alert('Add Floor', 'Add new floor functionality would be implemented here');
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

  // Zone draw handler for adding zones
  const handleZoneDraw = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    if (state.activeTool === 'add_zone') {
      setPendingZoneBounds(bounds);
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

  // Add zone modal confirm handler
  const handleAddZoneConfirm = useCallback((config: NewZoneConfig) => {
    Alert.alert('Zone Added', `Zone "${config.name}" has been added to the floor plan.`);
    setShowAddZoneModal(false);
    setPendingZoneBounds(null);
    setActiveTool('select');
    onChangesDetected?.(true);
  }, [setActiveTool, onChangesDetected]);

  // Add zone modal cancel handler
  const handleAddZoneCancel = useCallback(() => {
    setShowAddZoneModal(false);
    setPendingZoneBounds(null);
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
    canvasContent: {
      minHeight: 600,
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
          floors={MOCK_FLOORS}
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
        {/* Scrollable Canvas */}
        <View style={styles.canvasScrollContainer}>
          <ScrollView
            style={styles.canvasScroll}
            contentContainerStyle={styles.canvasContent}
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={true}
          >
            <FloorPlanCanvas
              floor={currentFloor}
              zones={currentZones}
              tablePositions={currentTablePositions}
              tables={allTables}
              selectedTableId={state.selectedTableId}
              gridEnabled={state.gridEnabled}
              snapToGrid={state.snapToGrid}
              showChairs={state.showChairs}
              zoom={state.zoom}
              panOffset={state.panOffset}
              activeTool={state.activeTool}
              onTableSelect={handleTableSelect}
              onTableMove={handleTableMove}
              onCanvasClick={handleCanvasClick}
              onZoneDraw={handleZoneDraw}
            />
          </ScrollView>
        </View>

        {/* Properties Panel - Always visible (shows stats when nothing selected) */}
        <View style={styles.propertiesColumn}>
          <PropertiesPanel
            selectedTable={selectedTable}
            selectedTablePosition={selectedTablePosition}
            selectedZone={null}
            floor={currentFloor}
            tables={allTables}
            zones={currentZones}
            tablePositions={currentTablePositions}
            onCloseSelection={handleCloseSelection}
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
      {pendingZoneBounds && (
        <AddZoneModal
          visible={showAddZoneModal}
          bounds={pendingZoneBounds}
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
    </View>
  );
};

export default FloorPlanSettings;
