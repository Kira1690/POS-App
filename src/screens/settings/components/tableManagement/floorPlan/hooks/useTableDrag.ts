/**
 * useTableDrag Hook
 * Drag gesture handling for floor plan tables
 * TODO: Implement with react-native-gesture-handler
 */

import { useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { snapPositionConditional } from '../utils/snapToGrid';

interface UseTableDragOptions {
  initialX: number;
  initialY: number;
  gridSize: number;
  snapToGrid: boolean;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

interface UseTableDragReturn {
  translateX: ReturnType<typeof useSharedValue<number>>;
  translateY: ReturnType<typeof useSharedValue<number>>;
  isDragging: ReturnType<typeof useSharedValue<boolean>>;
  handleDragStart: () => void;
  handleDragUpdate: (translationX: number, translationY: number) => void;
  handleDragEnd: () => void;
}

export const useTableDrag = (options: UseTableDragOptions): UseTableDragReturn => {
  const {
    initialX,
    initialY,
    gridSize,
    snapToGrid,
    onDragStart,
    onDragEnd,
  } = options;

  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const isDragging = useSharedValue(false);

  const handleDragStart = useCallback(() => {
    isDragging.value = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDragStart?.();
  }, [isDragging, onDragStart]);

  const handleDragUpdate = useCallback(
    (translationX: number, translationY: number) => {
      translateX.value = initialX + translationX;
      translateY.value = initialY + translationY;
    },
    [initialX, initialY, translateX, translateY]
  );

  const handleDragEnd = useCallback(() => {
    isDragging.value = false;

    // Snap to grid if enabled
    const finalPosition = snapPositionConditional(
      translateX.value,
      translateY.value,
      gridSize,
      snapToGrid
    );

    translateX.value = finalPosition.x;
    translateY.value = finalPosition.y;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDragEnd?.(finalPosition);
  }, [gridSize, isDragging, onDragEnd, snapToGrid, translateX, translateY]);

  return {
    translateX,
    translateY,
    isDragging,
    handleDragStart,
    handleDragUpdate,
    handleDragEnd,
  };
};

export default useTableDrag;
