/**
 * ZoneGestureOverlay Component
 * Transparent overlay for handling zone selection and dragging
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
import { FloorZone } from '@/types/settings/table-management.types';

interface ZoneGestureOverlayProps {
  zone: FloorZone;
  isSelected: boolean;
  gridSize: number;
  snapToGrid: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  mode: 'select' | 'move';
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}

const ZoneGestureOverlay: React.FC<ZoneGestureOverlayProps> = ({
  zone,
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

  // Shared values for overlay dimensions (MUST be shared values for worklet access)
  const overlayWidthSV = useSharedValue(zone.bounds.width);
  const overlayHeightSV = useSharedValue(zone.bounds.height);
  const zoomSV = useSharedValue(zoom);

  // Reanimated shared values for 60fps performance
  const translateX = useSharedValue(zone.bounds.x);
  const translateY = useSharedValue(zone.bounds.y);
  const startX = useSharedValue(zone.bounds.x);
  const startY = useSharedValue(zone.bounds.y);

  // Update shared values when props change
  React.useEffect(() => {
    overlayWidthSV.value = zone.bounds.width;
    overlayHeightSV.value = zone.bounds.height;
  }, [zone.bounds.width, zone.bounds.height, overlayWidthSV, overlayHeightSV]);

  React.useEffect(() => {
    zoomSV.value = zoom;
  }, [zoom, zoomSV]);

  // Update position when props change (external updates)
  React.useEffect(() => {
    translateX.value = zone.bounds.x;
    translateY.value = zone.bounds.y;
  }, [zone.bounds.x, zone.bounds.y, translateX, translateY]);

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
        .minDistance(5)
        .onStart(() => {
          'worklet';
          startX.value = translateX.value;
          startY.value = translateY.value;
          // Auto-select on drag start
          runOnJS(handleSelect)();
        })
        .onUpdate((event) => {
          'worklet';
          // Adjust for zoom level using shared value
          translateX.value = startX.value + event.translationX / zoomSV.value;
          translateY.value = startY.value + event.translationY / zoomSV.value;
        })
        .onEnd((event) => {
          'worklet';
          // Calculate final position using shared value
          const finalX = startX.value + event.translationX / zoomSV.value;
          const finalY = startY.value + event.translationY / zoomSV.value;

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
    [mode, zoomSV, gridSize, snapToGrid, translateX, translateY, startX, startY, handleSelect, handleMoveComplete]
  );

  // Combine gestures - only one will be active based on mode
  const combinedGesture = useMemo(
    () => Gesture.Race(tapGesture, panGesture),
    [tapGesture, panGesture]
  );

  // Animated style for smooth 60fps transforms (uses shared values only)
  // Zone bounds are top-left based, so we position directly without centering offset
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value * zoomSV.value },
        { translateY: translateY.value * zoomSV.value },
      ],
      width: overlayWidthSV.value,
      height: overlayHeightSV.value,
    };
  });

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      borderRadius: 4,
    },
    selected: {
      borderWidth: 3,
      borderColor: theme.colors.secondary,
      borderStyle: 'dashed',
      backgroundColor: 'rgba(0, 200, 100, 0.15)',
    },
    moveMode: {
      // Visual indicator for move mode
      backgroundColor: 'rgba(0, 200, 100, 0.08)',
      borderWidth: 2,
      borderColor: theme.colors.secondary,
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
        accessibilityLabel={`Zone ${zone.name}`}
        accessibilityHint={mode === 'move' ? 'Drag to move' : 'Tap to select'}
        accessibilityRole="button"
      />
    </GestureDetector>
  );
};

export default React.memo(ZoneGestureOverlay);
