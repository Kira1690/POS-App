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

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useFloorPlan } from '@/context/floorPlan';
import FloorPlanTabs from '@/screens/settings/components/tableManagement/floorPlan/FloorPlanTabs';
import { MOCK_TABLES } from '@/data/tables';
import { TableStatus } from '@/types/settings/table-management.types';
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

  const {
    floors,
    activeFloorId,
    setActiveFloor,
    currentFloor,
    currentZones,
    currentTablePositions,
  } = floorPlan;

  // Build status map from mock data if not provided externally
  const tableStatusMapFinal = useMemo(() => {
    if (externalStatusMap) return externalStatusMap;

    // Build from MOCK_TABLES status
    const statusMap: Record<string, TableStatus> = {};
    MOCK_TABLES.forEach(table => {
      statusMap[table.id] = mapStringToStatus(table.status);
    });
    return statusMap;
  }, [externalStatusMap]);

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
          tables={MOCK_TABLES}
          selectedTableId={selectedTableId}
          tableStatusMap={tableStatusMapFinal}
          onTableSelect={handleTableSelect}
        />
      </View>
    </View>
  );
};

export default React.memo(DashboardFloorPlanViewer);
