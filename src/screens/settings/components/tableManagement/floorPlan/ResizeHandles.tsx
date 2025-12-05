/**
 * ResizeHandles Component
 * Displays resize handles around a selected element for resizing
 * Uses react-native-gesture-handler for proper gesture coordination
 */

import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
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
  /** Pan offset of the canvas */
  panOffset?: { x: number; y: number };
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

const HANDLE_SIZE = 14;
const HANDLE_HIT_SLOP = 12;

const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  bounds,
  zoom,
  panOffset = { x: 0, y: 0 },
  minWidth = 40,
  minHeight = 40,
  gridSize = 20,
  snapToGrid = true,
  onResize,
  onResizeEnd,
}) => {
  const { theme } = useTheme();

  // Shared values for worklet-safe access
  const zoomSV = useSharedValue(zoom);
  const minWidthSV = useSharedValue(minWidth);
  const minHeightSV = useSharedValue(minHeight);
  const gridSizeSV = useSharedValue(gridSize);
  const snapToGridSV = useSharedValue(snapToGrid);

  // Start bounds captured when drag begins
  const startX = useSharedValue(bounds.x);
  const startY = useSharedValue(bounds.y);
  const startWidth = useSharedValue(bounds.width);
  const startHeight = useSharedValue(bounds.height);

  // Current bounds (for visual updates during drag)
  const currentX = useSharedValue(bounds.x);
  const currentY = useSharedValue(bounds.y);
  const currentWidth = useSharedValue(bounds.width);
  const currentHeight = useSharedValue(bounds.height);

  // Update shared values when props change
  React.useEffect(() => {
    zoomSV.value = zoom;
  }, [zoom, zoomSV]);

  React.useEffect(() => {
    minWidthSV.value = minWidth;
    minHeightSV.value = minHeight;
  }, [minWidth, minHeight, minWidthSV, minHeightSV]);

  React.useEffect(() => {
    gridSizeSV.value = gridSize;
    snapToGridSV.value = snapToGrid;
  }, [gridSize, snapToGrid, gridSizeSV, snapToGridSV]);

  // Update current bounds when props change (external updates)
  React.useEffect(() => {
    currentX.value = bounds.x;
    currentY.value = bounds.y;
    currentWidth.value = bounds.width;
    currentHeight.value = bounds.height;
  }, [bounds, currentX, currentY, currentWidth, currentHeight]);

  // Snap helper function (worklet)
  const snapValue = useCallback((value: number, shouldSnap: boolean, grid: number) => {
    'worklet';
    if (!shouldSnap) return value;
    return Math.round(value / grid) * grid;
  }, []);

  // Callback to update parent state
  const handleResizeUpdate = useCallback(
    (x: number, y: number, width: number, height: number) => {
      onResize({ x, y, width, height });
    },
    [onResize]
  );

  const handleResizeComplete = useCallback(() => {
    onResizeEnd?.();
  }, [onResizeEnd]);

  // Create gesture for a specific handle position
  const createHandleGesture = useCallback(
    (position: HandlePosition) => {
      return Gesture.Pan()
        .minDistance(1)
        .onStart(() => {
          'worklet';
          // Capture current bounds at drag start
          startX.value = currentX.value;
          startY.value = currentY.value;
          startWidth.value = currentWidth.value;
          startHeight.value = currentHeight.value;
        })
        .onUpdate((event) => {
          'worklet';
          const dx = event.translationX / zoomSV.value;
          const dy = event.translationY / zoomSV.value;

          let newX = startX.value;
          let newY = startY.value;
          let newWidth = startWidth.value;
          let newHeight = startHeight.value;

          // Update bounds based on handle position
          switch (position) {
            case 'nw':
              newX = snapValue(startX.value + dx, snapToGridSV.value, gridSizeSV.value);
              newY = snapValue(startY.value + dy, snapToGridSV.value, gridSizeSV.value);
              newWidth = Math.max(minWidthSV.value, startWidth.value - dx);
              newHeight = Math.max(minHeightSV.value, startHeight.value - dy);
              break;
            case 'n':
              newY = snapValue(startY.value + dy, snapToGridSV.value, gridSizeSV.value);
              newHeight = Math.max(minHeightSV.value, startHeight.value - dy);
              break;
            case 'ne':
              newY = snapValue(startY.value + dy, snapToGridSV.value, gridSizeSV.value);
              newWidth = Math.max(minWidthSV.value, startWidth.value + dx);
              newHeight = Math.max(minHeightSV.value, startHeight.value - dy);
              break;
            case 'e':
              newWidth = Math.max(minWidthSV.value, snapValue(startWidth.value + dx, snapToGridSV.value, gridSizeSV.value));
              break;
            case 'se':
              newWidth = Math.max(minWidthSV.value, snapValue(startWidth.value + dx, snapToGridSV.value, gridSizeSV.value));
              newHeight = Math.max(minHeightSV.value, snapValue(startHeight.value + dy, snapToGridSV.value, gridSizeSV.value));
              break;
            case 's':
              newHeight = Math.max(minHeightSV.value, snapValue(startHeight.value + dy, snapToGridSV.value, gridSizeSV.value));
              break;
            case 'sw':
              newX = snapValue(startX.value + dx, snapToGridSV.value, gridSizeSV.value);
              newWidth = Math.max(minWidthSV.value, startWidth.value - dx);
              newHeight = Math.max(minHeightSV.value, snapValue(startHeight.value + dy, snapToGridSV.value, gridSizeSV.value));
              break;
            case 'w':
              newX = snapValue(startX.value + dx, snapToGridSV.value, gridSizeSV.value);
              newWidth = Math.max(minWidthSV.value, startWidth.value - dx);
              break;
          }

          // Update shared values for visual feedback
          currentX.value = newX;
          currentY.value = newY;
          currentWidth.value = newWidth;
          currentHeight.value = newHeight;

          // Call parent callback
          runOnJS(handleResizeUpdate)(newX, newY, newWidth, newHeight);
        })
        .onEnd(() => {
          'worklet';
          runOnJS(handleResizeComplete)();
        });
    },
    [
      startX, startY, startWidth, startHeight,
      currentX, currentY, currentWidth, currentHeight,
      zoomSV, minWidthSV, minHeightSV, gridSizeSV, snapToGridSV,
      snapValue, handleResizeUpdate, handleResizeComplete
    ]
  );

  // Memoize handle gestures
  const handleGestures = useMemo(() => {
    const positions: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    return positions.map((position) => ({
      position,
      gesture: createHandleGesture(position),
    }));
  }, [createHandleGesture]);

  // Calculate handle position (considers zoom but NOT pan - handles are in transformed container)
  const getHandlePosition = useCallback(
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

  // Animated style for each handle (updates during drag)
  const createAnimatedHandleStyle = useCallback(
    (position: HandlePosition) => {
      return useAnimatedStyle(() => {
        const halfSize = HANDLE_SIZE / 2;
        const x = currentX.value * zoomSV.value;
        const y = currentY.value * zoomSV.value;
        const width = currentWidth.value * zoomSV.value;
        const height = currentHeight.value * zoomSV.value;

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
      });
    },
    [currentX, currentY, currentWidth, currentHeight, zoomSV]
  );

  const isCorner = (position: HandlePosition) =>
    ['nw', 'ne', 'se', 'sw'].includes(position);

  const styles = StyleSheet.create({
    handle: {
      position: 'absolute',
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
      backgroundColor: theme.colors.primary,
      borderRadius: HANDLE_SIZE / 2,
      borderWidth: 2,
      borderColor: theme.colors.surface,
      // Ensure handles are above other elements
      zIndex: 1000,
      elevation: 10,
    },
    cornerHandle: {
      borderRadius: 3,
    },
  });

  // Render individual handle component
  const ResizeHandle: React.FC<{ position: HandlePosition; gesture: ReturnType<typeof Gesture.Pan> }> =
    React.memo(({ position, gesture }) => {
      const animatedStyle = createAnimatedHandleStyle(position);

      return (
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.handle,
              isCorner(position) && styles.cornerHandle,
              animatedStyle,
            ]}
            hitSlop={{
              top: HANDLE_HIT_SLOP,
              bottom: HANDLE_HIT_SLOP,
              left: HANDLE_HIT_SLOP,
              right: HANDLE_HIT_SLOP,
            }}
          />
        </GestureDetector>
      );
    });

  return (
    <>
      {handleGestures.map(({ position, gesture }) => (
        <ResizeHandle key={position} position={position} gesture={gesture} />
      ))}
    </>
  );
};

export default React.memo(ResizeHandles);
