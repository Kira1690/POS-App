/**
 * ResizeHandles Component
 * Displays resize handles around a selected element for resizing
 * Uses PanResponder for drag gestures (no worklet issues)
 */

import React, { useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ResizeHandlesProps {
  /** Bounds of the element being resized (top-left origin) */
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Current zoom level */
  zoom: number;
  /** Minimum width constraint */
  minWidth?: number;
  /** Minimum height constraint */
  minHeight?: number;
  /** Grid size for snapping */
  gridSize?: number;
  /** Whether to snap to grid */
  snapToGrid?: boolean;
  /** Callback when resizing */
  onResize: (bounds: { x: number; y: number; width: number; height: number }) => void;
  /** Callback when resize ends */
  onResizeEnd?: () => void;
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_SIZE = 12;
const HANDLE_HIT_SLOP = 10;

const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  bounds,
  zoom,
  minWidth = 40,
  minHeight = 40,
  gridSize = 20,
  snapToGrid = true,
  onResize,
  onResizeEnd,
}) => {
  const { theme } = useTheme();
  const startBoundsRef = useRef(bounds);

  // Snap value to grid if enabled
  const snap = useCallback(
    (value: number) => {
      if (!snapToGrid) return value;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Create a resize handler for a specific handle position
  const createResizeHandler = useCallback(
    (position: HandlePosition) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startBoundsRef.current = { ...bounds };
        },
        onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          const dx = gestureState.dx / zoom;
          const dy = gestureState.dy / zoom;
          const start = startBoundsRef.current;

          let newX = start.x;
          let newY = start.y;
          let newWidth = start.width;
          let newHeight = start.height;

          // Update bounds based on handle position
          switch (position) {
            case 'nw':
              newX = snap(start.x + dx);
              newY = snap(start.y + dy);
              newWidth = Math.max(minWidth, start.width - dx);
              newHeight = Math.max(minHeight, start.height - dy);
              break;
            case 'n':
              newY = snap(start.y + dy);
              newHeight = Math.max(minHeight, start.height - dy);
              break;
            case 'ne':
              newY = snap(start.y + dy);
              newWidth = Math.max(minWidth, start.width + dx);
              newHeight = Math.max(minHeight, start.height - dy);
              break;
            case 'e':
              newWidth = Math.max(minWidth, snap(start.width + dx));
              break;
            case 'se':
              newWidth = Math.max(minWidth, snap(start.width + dx));
              newHeight = Math.max(minHeight, snap(start.height + dy));
              break;
            case 's':
              newHeight = Math.max(minHeight, snap(start.height + dy));
              break;
            case 'sw':
              newX = snap(start.x + dx);
              newWidth = Math.max(minWidth, start.width - dx);
              newHeight = Math.max(minHeight, snap(start.height + dy));
              break;
            case 'w':
              newX = snap(start.x + dx);
              newWidth = Math.max(minWidth, start.width - dx);
              break;
          }

          onResize({ x: newX, y: newY, width: newWidth, height: newHeight });
        },
        onPanResponderRelease: () => {
          onResizeEnd?.();
        },
      });
    },
    [bounds, zoom, minWidth, minHeight, snap, onResize, onResizeEnd]
  );

  // Create pan responders for each handle
  const handles = useMemo(() => {
    const positions: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    return positions.map((position) => ({
      position,
      panResponder: createResizeHandler(position),
    }));
  }, [createResizeHandler]);

  // Calculate handle positions
  const getHandleStyle = useCallback(
    (position: HandlePosition) => {
      const halfSize = HANDLE_SIZE / 2;
      const x = bounds.x * zoom;
      const y = bounds.y * zoom;
      const width = bounds.width * zoom;
      const height = bounds.height * zoom;

      let left = 0;
      let top = 0;

      switch (position) {
        case 'nw':
          left = x - halfSize;
          top = y - halfSize;
          break;
        case 'n':
          left = x + width / 2 - halfSize;
          top = y - halfSize;
          break;
        case 'ne':
          left = x + width - halfSize;
          top = y - halfSize;
          break;
        case 'e':
          left = x + width - halfSize;
          top = y + height / 2 - halfSize;
          break;
        case 'se':
          left = x + width - halfSize;
          top = y + height - halfSize;
          break;
        case 's':
          left = x + width / 2 - halfSize;
          top = y + height - halfSize;
          break;
        case 'sw':
          left = x - halfSize;
          top = y + height - halfSize;
          break;
        case 'w':
          left = x - halfSize;
          top = y + height / 2 - halfSize;
          break;
      }

      return { left, top };
    },
    [bounds, zoom]
  );

  const styles = StyleSheet.create({
    handle: {
      position: 'absolute',
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
      backgroundColor: theme.colors.primary,
      borderRadius: HANDLE_SIZE / 2,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    cornerHandle: {
      // Corner handles are squares
      borderRadius: 2,
    },
  });

  const isCorner = (position: HandlePosition) =>
    ['nw', 'ne', 'se', 'sw'].includes(position);

  return (
    <>
      {handles.map(({ position, panResponder }) => (
        <View
          key={position}
          style={[
            styles.handle,
            isCorner(position) && styles.cornerHandle,
            getHandleStyle(position),
          ]}
          hitSlop={{ top: HANDLE_HIT_SLOP, bottom: HANDLE_HIT_SLOP, left: HANDLE_HIT_SLOP, right: HANDLE_HIT_SLOP }}
          {...panResponder.panHandlers}
        />
      ))}
    </>
  );
};

export default React.memo(ResizeHandles);
