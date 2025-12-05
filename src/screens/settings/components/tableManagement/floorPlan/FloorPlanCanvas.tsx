/**
 * FloorPlanCanvas Component
 * Two-layer architecture:
 * - Layer 1 (SVG): Visual rendering only - grid, zones, tables, chairs
 * - Layer 2 (Views): Gesture overlay for table selection and dragging
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius } from '@/design-system/theme/spacing';
import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
} from '@/types/settings/table-management.types';
import { MockTable } from '@/data/tables';
import FloorPlanGrid from './FloorPlanGrid';
import FloorPlanZone from './FloorPlanZone';
import TableVisual from './TableVisual';
import TableGestureOverlay from './TableGestureOverlay';
import ZoneGestureOverlay from './ZoneGestureOverlay';
import ResizeHandles from './ResizeHandles';
import { getTotalTableSpace } from './utils/chairPositions';
import { TableSize, TableShape } from '@/types/settings/table-management.types';

interface FloorPlanCanvasProps {
  floor: Floor;
  zones: FloorZone[];
  tablePositions: FloorPlanTablePosition[];
  tables: MockTable[];
  selectedTableId: string | null;
  selectedZoneId?: string | null;
  gridEnabled: boolean;
  snapToGrid: boolean;
  showChairs: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  activeTool?: string;
  onTableSelect: (tableId: string) => void;
  onTableMove: (tableId: string, x: number, y: number) => void;
  onTableResize?: (tableId: string, width: number, height: number) => void;
  onZoneSelect?: (zoneId: string) => void;
  onZoneMove?: (zoneId: string, x: number, y: number) => void;
  onZoneResize?: (zoneId: string, width: number, height: number) => void;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
  onCanvasClick?: (x: number, y: number) => void;
  onZoneDraw?: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

// Constants for zoom limits
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  floor,
  zones,
  tablePositions,
  tables,
  selectedTableId,
  selectedZoneId,
  gridEnabled,
  snapToGrid,
  showChairs,
  zoom,
  panOffset,
  activeTool = 'select',
  onTableSelect,
  onTableMove,
  onTableResize,
  onZoneSelect,
  onZoneMove,
  onZoneResize,
  onZoomChange,
  onPanChange,
  onCanvasClick,
  onZoneDraw,
}) => {
  const { theme } = useTheme();

  // Animated values for canvas transform (zoom/pan)
  const scale = useSharedValue(zoom);
  const translateX = useSharedValue(panOffset.x);
  const translateY = useSharedValue(panOffset.y);
  const savedScale = useSharedValue(zoom);
  const savedTranslateX = useSharedValue(panOffset.x);
  const savedTranslateY = useSharedValue(panOffset.y);

  // Zone drawing state
  const zoneStartX = useSharedValue(0);
  const zoneStartY = useSharedValue(0);
  const zoneEndX = useSharedValue(0);
  const zoneEndY = useSharedValue(0);

  // Update animated values when props change
  React.useEffect(() => {
    scale.value = zoom;
  }, [zoom, scale]);

  React.useEffect(() => {
    translateX.value = panOffset.x;
    translateY.value = panOffset.y;
  }, [panOffset.x, panOffset.y, translateX, translateY]);

  // Get table data by ID
  const getTableById = useMemo(() => {
    const tableMap = new Map(tables.map(t => [t.id, t]));
    return (tableId: string) => tableMap.get(tableId);
  }, [tables]);

  // Clamp zoom helper
  const clampZoom = useCallback(
    (value: number) => Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM),
    []
  );

  // Callbacks for gestures (run on JS thread)
  const handleZoomComplete = useCallback(
    (newZoom: number) => {
      onZoomChange?.(newZoom);
    },
    [onZoomChange]
  );

  const handlePanComplete = useCallback(
    (x: number, y: number) => {
      onPanChange?.({ x, y });
    },
    [onPanChange]
  );

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (activeTool === 'add_table' && onCanvasClick) {
        const adjustedX = (x - panOffset.x) / zoom;
        const adjustedY = (y - panOffset.y) / zoom;
        onCanvasClick(adjustedX, adjustedY);
      }
    },
    [activeTool, onCanvasClick, panOffset.x, panOffset.y, zoom]
  );

  const handleZoneDrawComplete = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      if (onZoneDraw) {
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        if (width >= 50 && height >= 50) {
          onZoneDraw({ x, y, width, height });
        }
      }
    },
    [onZoneDraw]
  );

  // Map shape string to TableShape enum
  const mapShape = useCallback((shape?: string): TableShape => {
    const shapeMap: Record<string, TableShape> = {
      round: TableShape.ROUND,
      square: TableShape.SQUARE,
      rectangle: TableShape.RECTANGLE,
      oval: TableShape.OVAL,
    };
    return shapeMap[shape?.toLowerCase() || 'round'] || TableShape.ROUND;
  }, []);

  // Get bounds for selected table (convert center-based to top-left bounds)
  const getSelectedTableBounds = useMemo(() => {
    if (!selectedTableId) return null;

    const position = tablePositions.find(p => p.table_id === selectedTableId);
    const table = position ? getTableById(position.table_id) : null;

    if (!position || !table) return null;

    // Use custom dimensions if set, otherwise calculate from shape/size
    let width: number;
    let height: number;

    if (position.width !== undefined && position.height !== undefined) {
      width = position.width;
      height = position.height;
    } else {
      const shape = mapShape(table.shape);
      const totalSpace = getTotalTableSpace(shape, TableSize.MEDIUM);
      width = totalSpace.width;
      height = totalSpace.height;
    }

    // Convert from center-based to top-left bounds
    return {
      x: position.x - width / 2,
      y: position.y - height / 2,
      width,
      height,
    };
  }, [selectedTableId, tablePositions, getTableById, mapShape]);

  // Handle table resize (convert from top-left bounds back to center position)
  const handleTableResize = useCallback(
    (bounds: { x: number; y: number; width: number; height: number }) => {
      if (!selectedTableId || !onTableResize) return;

      // Calculate new center position from bounds
      const newCenterX = bounds.x + bounds.width / 2;
      const newCenterY = bounds.y + bounds.height / 2;

      // Update position first (center-based)
      onTableMove(selectedTableId, newCenterX, newCenterY);

      // Update size
      onTableResize(selectedTableId, bounds.width, bounds.height);
    },
    [selectedTableId, onTableMove, onTableResize]
  );

  // Get bounds for selected zone
  const getSelectedZoneBounds = useMemo(() => {
    if (!selectedZoneId) return null;

    const zone = zones.find(z => z.id === selectedZoneId);
    if (!zone) return null;

    return {
      x: zone.bounds.x,
      y: zone.bounds.y,
      width: zone.bounds.width,
      height: zone.bounds.height,
    };
  }, [selectedZoneId, zones]);

  // Handle zone resize
  const handleZoneResize = useCallback(
    (bounds: { x: number; y: number; width: number; height: number }) => {
      if (!selectedZoneId) return;

      // Update position if zone was moved
      if (onZoneMove) {
        onZoneMove(selectedZoneId, bounds.x, bounds.y);
      }

      // Update size
      if (onZoneResize) {
        onZoneResize(selectedZoneId, bounds.width, bounds.height);
      }
    },
    [selectedZoneId, onZoneMove, onZoneResize]
  );

  // Canvas-level gestures (pinch zoom + two-finger pan)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clampZoom(savedScale.value * event.scale);
    })
    .onEnd(() => {
      runOnJS(handleZoomComplete)(scale.value);
    });

  const canvasPanGesture = Gesture.Pan()
    .minPointers(2)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      runOnJS(handlePanComplete)(translateX.value, translateY.value);
    });

  // Tap gesture for add_table mode
  const tapGesture = Gesture.Tap()
    .enabled(activeTool === 'add_table')
    .onEnd((event) => {
      runOnJS(handleCanvasClick)(event.x, event.y);
    });

  // Zone draw gesture for add_zone mode
  const zoneDrawGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .enabled(activeTool === 'add_zone')
    .onStart((event) => {
      const adjustedX = (event.x - panOffset.x) / zoom;
      const adjustedY = (event.y - panOffset.y) / zoom;
      zoneStartX.value = adjustedX;
      zoneStartY.value = adjustedY;
      zoneEndX.value = adjustedX;
      zoneEndY.value = adjustedY;
    })
    .onUpdate((event) => {
      const adjustedX = (event.x - panOffset.x) / zoom;
      const adjustedY = (event.y - panOffset.y) / zoom;
      zoneEndX.value = adjustedX;
      zoneEndY.value = adjustedY;
    })
    .onEnd(() => {
      runOnJS(handleZoneDrawComplete)(
        zoneStartX.value,
        zoneStartY.value,
        zoneEndX.value,
        zoneEndY.value
      );
    });

  // Combine canvas gestures based on active tool
  const canvasGestures = useMemo(() => {
    if (activeTool === 'add_zone') {
      return Gesture.Race(zoneDrawGesture, Gesture.Simultaneous(pinchGesture, canvasPanGesture));
    }
    if (activeTool === 'add_table') {
      return Gesture.Race(tapGesture, Gesture.Simultaneous(pinchGesture, canvasPanGesture));
    }
    // Select mode - only zoom/pan on canvas level, table gestures handled by overlay
    return Gesture.Simultaneous(pinchGesture, canvasPanGesture);
  }, [activeTool, pinchGesture, canvasPanGesture, tapGesture, zoneDrawGesture]);

  // Animated style for canvas transform
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: borderRadius.lg as number,
      overflow: 'hidden',
    },
    canvasContainer: {
      width: floor.canvas_width,
      height: floor.canvas_height,
    },
    gestureOverlayContainer: {
      ...StyleSheet.absoluteFillObject,
      pointerEvents: 'box-none',
    },
  });

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      <GestureDetector gesture={canvasGestures}>
        <Animated.View style={[styles.canvasContainer, animatedContainerStyle]}>
          {/* Layer 1: SVG Visual Layer (no touch events) */}
          <Svg
            width={floor.canvas_width}
            height={floor.canvas_height}
            viewBox={`0 0 ${floor.canvas_width} ${floor.canvas_height}`}
            pointerEvents="none"
          >
            {/* Grid */}
            <FloorPlanGrid
              width={floor.canvas_width}
              height={floor.canvas_height}
              gridSize={floor.grid_size}
              visible={gridEnabled}
            />

            {/* Zones */}
            <G>
              {zones.map(zone => (
                <FloorPlanZone
                  key={zone.id}
                  zone={zone}
                  isSelected={selectedZoneId === zone.id}
                  onPress={() => onZoneSelect?.(zone.id)}
                />
              ))}
            </G>

            {/* Tables (visual only) */}
            <G>
              {tablePositions.map(position => {
                const table = getTableById(position.table_id);
                if (!table) return null;

                return (
                  <TableVisual
                    key={position.table_id}
                    position={position}
                    table={table}
                    isSelected={selectedTableId === position.table_id}
                    showChairs={showChairs}
                  />
                );
              })}
            </G>
          </Svg>

          {/* Layer 2: Gesture Overlay (handles touch) */}
          {(activeTool === 'select' || activeTool === 'move') && (
            <View style={styles.gestureOverlayContainer}>
              {tablePositions.map(position => {
                const table = getTableById(position.table_id);
                if (!table) return null;

                return (
                  <TableGestureOverlay
                    key={`overlay-${position.table_id}`}
                    position={position}
                    table={table}
                    isSelected={selectedTableId === position.table_id}
                    gridSize={floor.grid_size}
                    snapToGrid={snapToGrid}
                    zoom={zoom}
                    panOffset={panOffset}
                    mode={activeTool === 'move' ? 'move' : 'select'}
                    onSelect={() => onTableSelect(position.table_id)}
                    onMove={(x, y) => onTableMove(position.table_id, x, y)}
                  />
                );
              })}

              {/* Resize Handles for selected table */}
              {selectedTableId && getSelectedTableBounds && (
                <ResizeHandles
                  bounds={getSelectedTableBounds}
                  zoom={zoom}
                  panOffset={panOffset}
                  gridSize={floor.grid_size}
                  snapToGrid={snapToGrid}
                  onResize={handleTableResize}
                />
              )}

              {/* Zone Gesture Overlays */}
              {zones.map(zone => (
                <ZoneGestureOverlay
                  key={`zone-overlay-${zone.id}`}
                  zone={zone}
                  isSelected={selectedZoneId === zone.id}
                  gridSize={floor.grid_size}
                  snapToGrid={snapToGrid}
                  zoom={zoom}
                  mode={activeTool === 'move' ? 'move' : 'select'}
                  onSelect={() => onZoneSelect?.(zone.id)}
                  onMove={(x, y) => onZoneMove?.(zone.id, x, y)}
                />
              ))}

              {/* Resize Handles for selected zone */}
              {selectedZoneId && getSelectedZoneBounds && (
                <ResizeHandles
                  bounds={getSelectedZoneBounds}
                  zoom={zoom}
                  panOffset={panOffset}
                  gridSize={floor.grid_size}
                  snapToGrid={snapToGrid}
                  minWidth={50}
                  minHeight={50}
                  onResize={handleZoneResize}
                />
              )}
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default React.memo(FloorPlanCanvas);
