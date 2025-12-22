/**
 * FloorPlanViewerCanvas Component
 * SIMPLE view-mode floor plan viewer using native ScrollView
 *
 * Features:
 * - Native ScrollView for horizontal and vertical scrolling
 * - Simple + / - buttons for zoom control
 * - Single scale transform (no complex animations)
 * - Upper-left positioning (no complex centering)
 *
 * NO gesture-handler, NO reanimated complex logic
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
  TableStatus,
} from '@/types/settings/table-management.types';
import { MockTable } from '@/data/tables';
import { FloorPlanCanvas } from '@/screens/settings/components/tableManagement/floorPlan';
import { borderRadius } from '@/design-system/theme/spacing';

// Zoom limits
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.2;
const DEFAULT_ZOOM = 0.5;

interface FloorPlanViewerCanvasProps {
  floor: Floor;
  zones: FloorZone[];
  tablePositions: FloorPlanTablePosition[];
  tables: MockTable[];
  selectedTableId: string | null;
  tableStatusMap?: Record<string, TableStatus>;
  onTableSelect: (tableId: string) => void;
}

export interface FloorPlanViewerCanvasRef {
  resetZoom: () => void;
}

const FloorPlanViewerCanvas: React.FC<FloorPlanViewerCanvasProps> = ({
  floor,
  zones,
  tablePositions,
  tables,
  selectedTableId,
  tableStatusMap,
  onTableSelect,
}) => {
  const { theme } = useTheme();

  // SIMPLE: One state for zoom level
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);

  // Zoom handlers - SIMPLE button actions
  const handleZoomIn = useCallback(() => {
    setZoomLevel(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(z => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(DEFAULT_ZOOM);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      marginBottom: 8,
    },
    zoomButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    zoomButtonDisabled: {
      backgroundColor: theme.colors.outline,
    },
    zoomText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      minWidth: 50,
      textAlign: 'center',
    },
    resetButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.sm as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    resetButtonText: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.lg as number,
      overflow: 'hidden',
    },
    contentWrapper: {
      // Scale transform from top-left origin
      transformOrigin: 'top left',
    },
    hintText: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 4,
    },
  });

  // Calculate scaled dimensions for ScrollView content size
  const scaledWidth = floor.canvas_width * zoomLevel;
  const scaledHeight = floor.canvas_height * zoomLevel;

  return (
    <View style={styles.container}>
      {/* Zoom Controls - Simple buttons */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.zoomButton,
            zoomLevel <= MIN_ZOOM && styles.zoomButtonDisabled,
          ]}
          onPress={handleZoomOut}
          disabled={zoomLevel <= MIN_ZOOM}
        >
          <MaterialIcons
            name="remove"
            size={20}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>

        <TouchableOpacity
          style={[
            styles.zoomButton,
            zoomLevel >= MAX_ZOOM && styles.zoomButtonDisabled,
          ]}
          onPress={handleZoomIn}
          disabled={zoomLevel >= MAX_ZOOM}
        >
          <MaterialIcons name="add" size={20} color={theme.colors.onPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* SIMPLE: Native ScrollView for pan - horizontal wrapper */}
      <View style={styles.scrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          nestedScrollEnabled={true}
          contentContainerStyle={{ minWidth: scaledWidth }}
        >
          {/* Vertical scroll inside horizontal */}
          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            contentContainerStyle={{ minHeight: scaledHeight }}
          >
            {/* SIMPLE: Single scale transform */}
            <View
              style={[
                styles.contentWrapper,
                { transform: [{ scale: zoomLevel }] },
              ]}
            >
              <FloorPlanCanvas
                floor={floor}
                zones={zones}
                tablePositions={tablePositions}
                tables={tables}
                selectedTableId={selectedTableId}
                selectedZoneId={null}
                gridEnabled={false}
                snapToGrid={false}
                showChairs={true}
                zoom={1} // Fixed - wrapper handles scale
                panOffset={{ x: 0, y: 0 }} // Fixed - ScrollView handles pan
                mode="view"
                tableStatusMap={tableStatusMap}
                onTableSelect={onTableSelect}
                onTableMove={() => {}} // No-op in view mode
              />
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Hint Text */}
      <Text style={styles.hintText}>
        Scroll to pan, use buttons to zoom
      </Text>
    </View>
  );
};

export default React.memo(FloorPlanViewerCanvas);
