/**
 * DraggableTable Component
 * Individual draggable table for the floor plan canvas
 * Uses react-native-gesture-handler for drag functionality
 */

import React, { useMemo, useCallback } from 'react';
import { G, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import {
  FloorPlanTablePosition,
  TableShape as TableShapeEnum,
  TableSize,
  TableStatus,
} from '@/types/settings/table-management.types';
import { MockTable } from '@/data/tables';
import TableShape from './TableShape';
import ChairVisuals from './ChairVisuals';
import { getTableCenter, getTableDimensions } from './utils/chairPositions';
import { snapPositionConditional } from './utils/snapToGrid';

// Create animated SVG group
const AnimatedG = Animated.createAnimatedComponent(G);

interface DraggableTableProps {
  position: FloorPlanTablePosition;
  table: MockTable;
  isSelected?: boolean;
  showChairs?: boolean;
  gridSize: number;
  snapToGrid: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}

/**
 * Map string status to enum
 */
const mapStatus = (status: string): TableStatus => {
  const statusMap: Record<string, TableStatus> = {
    available: TableStatus.AVAILABLE,
    occupied: TableStatus.OCCUPIED,
    reserved: TableStatus.RESERVED,
    cleaning: TableStatus.CLEANING,
    out_of_service: TableStatus.OUT_OF_SERVICE,
  };
  return statusMap[status.toLowerCase()] || TableStatus.AVAILABLE;
};

/**
 * Map string shape to enum
 */
const mapShape = (shape?: string): TableShapeEnum => {
  const shapeMap: Record<string, TableShapeEnum> = {
    round: TableShapeEnum.ROUND,
    square: TableShapeEnum.SQUARE,
    rectangle: TableShapeEnum.RECTANGLE,
    oval: TableShapeEnum.OVAL,
  };
  return shapeMap[shape?.toLowerCase() || 'round'] || TableShapeEnum.ROUND;
};

const DraggableTable: React.FC<DraggableTableProps> = ({
  position,
  table,
  isSelected = false,
  showChairs = true,
  gridSize,
  snapToGrid,
  onSelect,
  onMove,
}) => {
  const { theme } = useTheme();

  const tableShape = useMemo(() => mapShape(table.shape), [table.shape]);
  const tableStatus = useMemo(() => mapStatus(table.status), [table.status]);
  const tableSize = TableSize.MEDIUM;

  const tableCenter = useMemo(
    () => getTableCenter(tableShape, tableSize),
    [tableShape, tableSize]
  );

  const tableDimensions = useMemo(
    () => getTableDimensions(tableShape, tableSize),
    [tableShape, tableSize]
  );

  // Animated values for position
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const isDragging = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Update position when props change
  React.useEffect(() => {
    translateX.value = position.x;
    translateY.value = position.y;
  }, [position.x, position.y, translateX, translateY]);

  // Haptic feedback handlers (run on JS thread)
  const triggerLightHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const triggerMediumHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Handle move completion
  const handleMoveComplete = useCallback(
    (x: number, y: number) => {
      onMove(x, y);
    },
    [onMove]
  );

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(triggerLightHaptic)();
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;

      // Snap to grid if enabled
      const finalPosition = snapPositionConditional(
        translateX.value,
        translateY.value,
        gridSize,
        snapToGrid
      );

      // Animate to snapped position
      translateX.value = withSpring(finalPosition.x, { damping: 15 });
      translateY.value = withSpring(finalPosition.y, { damping: 15 });

      runOnJS(triggerMediumHaptic)();
      runOnJS(handleMoveComplete)(finalPosition.x, finalPosition.y);
    })
    .minDistance(5);

  // Tap gesture for selection
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(onSelect)();
      runOnJS(triggerLightHaptic)();
    });

  // Combine gestures - tap or pan
  const composedGestures = Gesture.Race(tapGesture, panGesture);

  // Animated props for the group transform
  const animatedProps = useAnimatedProps(() => {
    return {
      x: translateX.value - tableCenter.x,
      y: translateY.value - tableCenter.y,
    };
  });

  // Calculate hit area for gestures (larger than visual for easier touch)
  const hitAreaPadding = 20;
  const hitAreaWidth = tableDimensions.width + hitAreaPadding * 2;
  const hitAreaHeight = tableDimensions.height + hitAreaPadding * 2;

  return (
    <GestureDetector gesture={composedGestures}>
      <AnimatedG animatedProps={animatedProps}>
        {/* Invisible hit area for better touch handling */}
        <Rect
          x={-hitAreaPadding}
          y={-hitAreaPadding}
          width={hitAreaWidth}
          height={hitAreaHeight}
          fill="transparent"
        />

        {/* Chair visuals (behind table) */}
        {showChairs && (
          <ChairVisuals
            capacity={table.capacity}
            shape={tableShape}
            size={tableSize}
            rotation={position.rotation}
          />
        )}

        {/* Table shape */}
        <TableShape
          shape={tableShape}
          size={tableSize}
          status={tableStatus}
          isSelected={isSelected}
          tableNumber={table.number}
          capacity={table.capacity}
          showNumber={true}
          showCapacity={true}
        />
      </AnimatedG>
    </GestureDetector>
  );
};

export default React.memo(DraggableTable);
