/**
 * TableGestureOverlay Component
 * Transparent overlay for handling table selection and dragging
 * Uses mode-based gestures: Select mode (tap only) vs Move mode (drag only)
 */

import React, { useMemo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { FloorPlanTablePosition, TableSize, TableShape } from '@/types/settings/table-management.types';
import { MockTable } from '@/data/tables';
import { getTotalTableSpace } from './utils/chairPositions';

interface TableGestureOverlayProps {
  position: FloorPlanTablePosition;
  table: MockTable;
  isSelected: boolean;
  gridSize: number;
  snapToGrid: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  mode: 'select' | 'move';
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}

/**
 * Map string shape to enum
 */
const mapShape = (shape?: string): TableShape => {
  const shapeMap: Record<string, TableShape> = {
    round: TableShape.ROUND,
    square: TableShape.SQUARE,
    rectangle: TableShape.RECTANGLE,
    oval: TableShape.OVAL,
  };
  return shapeMap[shape?.toLowerCase() || 'round'] || TableShape.ROUND;
};

const TableGestureOverlay: React.FC<TableGestureOverlayProps> = ({
  position,
  table,
  isSelected,
  gridSize,
  snapToGrid,
  zoom,
  panOffset,
  mode,
  onSelect,
  onMove,
}) => {
  const { theme } = useTheme();

  // Get table dimensions
  const tableShape = useMemo(() => mapShape(table.shape), [table.shape]);
  const tableSize = TableSize.MEDIUM;
  const totalSpace = useMemo(() => getTotalTableSpace(tableShape, tableSize), [tableShape, tableSize]);

  // Calculate overlay size
  const overlayWidth = totalSpace.width + 20;
  const overlayHeight = totalSpace.height + 20;

  // Reanimated shared values for 60fps performance
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const startX = useSharedValue(position.x);
  const startY = useSharedValue(position.y);

  // Update position when props change (external updates)
  React.useEffect(() => {
    translateX.value = position.x;
    translateY.value = position.y;
  }, [position.x, position.y, translateX, translateY]);

  // Haptic feedback callbacks
  const triggerLightHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const triggerMediumHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Callback for selection (used in both modes)
  const handleSelect = useCallback(() => {
    onSelect();
    triggerLightHaptic();
  }, [onSelect, triggerLightHaptic]);

  // Callback for move completion
  const handleMoveComplete = useCallback(
    (x: number, y: number) => {
      onMove(x, y);
      triggerMediumHaptic();
    },
    [onMove, triggerMediumHaptic]
  );

  // SELECT MODE: Tap gesture only - no dragging
  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(mode === 'select')
        .onEnd(() => {
          'worklet';
          runOnJS(handleSelect)();
        }),
    [mode, handleSelect]
  );

  // MOVE MODE: Pan gesture only - auto-selects on drag start
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(mode === 'move')
        .minDistance(5) // Very small threshold for immediate response
        .onStart(() => {
          'worklet';
          startX.value = translateX.value;
          startY.value = translateY.value;
          // Auto-select on drag start
          runOnJS(handleSelect)();
        })
        .onUpdate((event) => {
          'worklet';
          // Adjust for zoom level
          translateX.value = startX.value + event.translationX / zoom;
          translateY.value = startY.value + event.translationY / zoom;
        })
        .onEnd((event) => {
          'worklet';
          // Calculate final position
          const finalX = startX.value + event.translationX / zoom;
          const finalY = startY.value + event.translationY / zoom;

          // Snap to grid if enabled
          const snappedX = snapToGrid
            ? Math.round(finalX / gridSize) * gridSize
            : finalX;
          const snappedY = snapToGrid
            ? Math.round(finalY / gridSize) * gridSize
            : finalY;

          // Animate to final position with spring
          translateX.value = withSpring(snappedX, {
            damping: 15,
            stiffness: 150,
          });
          translateY.value = withSpring(snappedY, {
            damping: 15,
            stiffness: 150,
          });

          // Call onMove to update state
          runOnJS(handleMoveComplete)(snappedX, snappedY);
        }),
    [mode, zoom, gridSize, snapToGrid, translateX, translateY, startX, startY, handleSelect, handleMoveComplete]
  );

  // Combine gestures - only one will be active based on mode
  const combinedGesture = useMemo(
    () => Gesture.Race(tapGesture, panGesture),
    [tapGesture, panGesture]
  );

  // Animated style for smooth 60fps transforms
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value * zoom - overlayWidth / 2 },
        { translateY: translateY.value * zoom - overlayHeight / 2 },
      ],
    };
  });

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      width: overlayWidth,
      height: overlayHeight,
      borderRadius: 8,
      // Debug: uncomment to see the overlay
      // backgroundColor: 'rgba(255, 0, 0, 0.2)',
    },
    selected: {
      borderWidth: 3,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    moveMode: {
      // Visual indicator for move mode - show grab affordance
      backgroundColor: 'rgba(0, 122, 255, 0.05)',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dotted',
    },
  });

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        style={[
          styles.overlay,
          animatedStyle,
          mode === 'move' && styles.moveMode,
          isSelected && styles.selected,
        ]}
        accessibilityLabel={`Table ${table.number}`}
        accessibilityHint={mode === 'move' ? 'Drag to move' : 'Tap to select'}
        accessibilityRole="button"
      />
    </GestureDetector>
  );
};

export default React.memo(TableGestureOverlay);
