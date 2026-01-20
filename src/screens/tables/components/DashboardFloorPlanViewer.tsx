/**
 * DashboardFloorPlanViewer Component
 * SIMPLE view-only floor plan for Dashboard with occupancy colors
 *
 * Features:
 * - Floor tabs for switching between floors
 * - Native ScrollView for scrolling
 * - Button-based zoom controls
 * - Table selection with status colors
 *
 * NO complex gesture logic, NO animated values
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useFloorPlan } from '@/context/floorPlan';
import { useTable } from '@/context/table';
import FloorPlanTabs from '@/screens/settings/components/tableManagement/floorPlan/FloorPlanTabs';
import { MOCK_TABLES, MockTable } from '@/data/tables';
import { TableStatus } from '@/types/common.types';
import { borderRadius } from '@/design-system/theme/spacing';
import FloorPlanViewerCanvas from './FloorPlanViewerCanvas';

interface DashboardFloorPlanViewerProps {
  /** Callback when a table is selected */
  onTableSelect?: (tableId: string | null) => void;
  /** Currently selected table ID */
  selectedTableId?: string | null;
  /** Map of table_id to status for occupancy colors */
  tableStatusMap?: Record<string, TableStatus>;
}

/**
 * Map string status to TableStatus enum
 */
const mapStringToStatus = (status: string): TableStatus => {
  const statusMap: Record<string, TableStatus> = {
    available: TableStatus.AVAILABLE,
    occupied: TableStatus.OCCUPIED,
    reserved: TableStatus.RESERVED,
    cleaning: TableStatus.CLEANING,
    out_of_service: TableStatus.OUT_OF_SERVICE,
  };
  return statusMap[status.toLowerCase()] || TableStatus.AVAILABLE;
};

const DashboardFloorPlanViewer: React.FC<DashboardFloorPlanViewerProps> = ({
  onTableSelect,
  selectedTableId = null,
  tableStatusMap: externalStatusMap,
}) => {
  const { theme } = useTheme();
  const floorPlan = useFloorPlan();

  // Use TableContext for synced table data (includes order-status sync)
  const { state: tableState, refreshTables } = useTable();

  // Convert Table[] from context to component format
  const tables: MockTable[] = useMemo(() => {
    if (tableState.tables.length > 0) {
      return tableState.tables.map(table => ({
        id: table.id,
        number: table.table_number,
        capacity: table.capacity,
        status: table.status as TableStatus, // Already synced with orders
        area: table.location || '',
        areaId: table.section || '',
        positionX: 0, // Will be overridden by floor plan positions
        positionY: 0,
        shape: 'square' as const,
      }));
    }
    return MOCK_TABLES;
  }, [tableState.tables]);

  const {
    floors,
    activeFloorId,
    setActiveFloor,
    currentFloor,
    currentZones,
    currentTablePositions,
  } = floorPlan;

  // Refresh tables when component mounts to ensure synced data
  useEffect(() => {
    if (__DEV__) {
      console.log(`[FloorPlanViewer] Using ${tables.length} tables from TableContext (synced with orders)`);
    }
    // Trigger refresh to ensure fresh data with order sync
    refreshTables();
  }, [refreshTables]);

  // Build status map from loaded tables if not provided externally
  const tableStatusMapFinal = useMemo(() => {
    if (externalStatusMap) return externalStatusMap;

    // Build from loaded tables status (from AsyncStorage or MOCK)
    const statusMap: Record<string, TableStatus> = {};
    tables.forEach(table => {
      statusMap[table.id] = mapStringToStatus(table.status);
    });
    return statusMap;
  }, [externalStatusMap, tables]);

  // Handle table selection
  const handleTableSelect = useCallback(
    (tableId: string) => {
      // Toggle selection
      const newSelection = tableId === selectedTableId ? null : tableId;
      onTableSelect?.(newSelection);
    },
    [selectedTableId, onTableSelect]
  );

  // Handle floor selection
  const handleFloorSelect = useCallback(
    (floorId: string) => {
      setActiveFloor(floorId);
      // Clear table selection when switching floors
      onTableSelect?.(null);
    },
    [setActiveFloor, onTableSelect]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    tabsRow: {
      marginBottom: 8,
    },
    canvasContainer: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.lg as number,
      overflow: 'hidden',
    },
  });

  // Don't render if no floor data
  if (!currentFloor) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Floor Tabs */}
      <View style={styles.tabsRow}>
        <FloorPlanTabs
          floors={floors}
          activeFloorId={activeFloorId}
          onFloorSelect={handleFloorSelect}
        />
      </View>

      {/* Canvas Container - SIMPLE viewer with ScrollView */}
      <View style={styles.canvasContainer}>
        <FloorPlanViewerCanvas
          floor={currentFloor}
          zones={currentZones}
          tablePositions={currentTablePositions}
          tables={tables}
          selectedTableId={selectedTableId}
          tableStatusMap={tableStatusMapFinal}
          onTableSelect={handleTableSelect}
        />
      </View>
    </View>
  );
};

export default React.memo(DashboardFloorPlanViewer);
