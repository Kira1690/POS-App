/**
 * useCanvasGestures Hook
 * Zoom and pan gesture handling for the floor plan canvas
 * TODO: Implement with react-native-gesture-handler PinchGestureHandler
 */

import { useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';

interface UseCanvasGesturesOptions {
  initialZoom?: number;
  initialPanX?: number;
  initialPanY?: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
}

interface UseCanvasGesturesReturn {
  scale: ReturnType<typeof useSharedValue<number>>;
  translateX: ReturnType<typeof useSharedValue<number>>;
  translateY: ReturnType<typeof useSharedValue<number>>;
  handlePinchStart: () => void;
  handlePinchUpdate: (scale: number) => void;
  handlePinchEnd: () => void;
  handlePanStart: () => void;
  handlePanUpdate: (translationX: number, translationY: number) => void;
  handlePanEnd: () => void;
  resetTransform: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useCanvasGestures = (
  options: UseCanvasGesturesOptions = {}
): UseCanvasGesturesReturn => {
  const {
    initialZoom = 1.0,
    initialPanX = 0,
    initialPanY = 0,
    minZoom = 0.5,
    maxZoom = 2.0,
    onZoomChange,
    onPanChange,
  } = options;

  const scale = useSharedValue(initialZoom);
  const translateX = useSharedValue(initialPanX);
  const translateY = useSharedValue(initialPanY);
  const savedScale = useSharedValue(initialZoom);
  const savedTranslateX = useSharedValue(initialPanX);
  const savedTranslateY = useSharedValue(initialPanY);

  const clampZoom = useCallback(
    (value: number) => Math.min(Math.max(value, minZoom), maxZoom),
    [minZoom, maxZoom]
  );

  const handlePinchStart = useCallback(() => {
    savedScale.value = scale.value;
  }, [savedScale, scale]);

  const handlePinchUpdate = useCallback(
    (newScale: number) => {
      scale.value = clampZoom(savedScale.value * newScale);
    },
    [clampZoom, savedScale, scale]
  );

  const handlePinchEnd = useCallback(() => {
    onZoomChange?.(scale.value);
  }, [onZoomChange, scale]);

  const handlePanStart = useCallback(() => {
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  }, [savedTranslateX, savedTranslateY, translateX, translateY]);

  const handlePanUpdate = useCallback(
    (translationX: number, translationY: number) => {
      translateX.value = savedTranslateX.value + translationX;
      translateY.value = savedTranslateY.value + translationY;
    },
    [savedTranslateX, savedTranslateY, translateX, translateY]
  );

  const handlePanEnd = useCallback(() => {
    onPanChange?.({ x: translateX.value, y: translateY.value });
  }, [onPanChange, translateX, translateY]);

  const resetTransform = useCallback(() => {
    scale.value = initialZoom;
    translateX.value = initialPanX;
    translateY.value = initialPanY;
    onZoomChange?.(initialZoom);
    onPanChange?.({ x: initialPanX, y: initialPanY });
  }, [initialPanX, initialPanY, initialZoom, onPanChange, onZoomChange, scale, translateX, translateY]);

  const zoomIn = useCallback(() => {
    const newZoom = clampZoom(scale.value + 0.25);
    scale.value = newZoom;
    onZoomChange?.(newZoom);
  }, [clampZoom, onZoomChange, scale]);

  const zoomOut = useCallback(() => {
    const newZoom = clampZoom(scale.value - 0.25);
    scale.value = newZoom;
    onZoomChange?.(newZoom);
  }, [clampZoom, onZoomChange, scale]);

  return {
    scale,
    translateX,
    translateY,
    handlePinchStart,
    handlePinchUpdate,
    handlePinchEnd,
    handlePanStart,
    handlePanUpdate,
    handlePanEnd,
    resetTransform,
    zoomIn,
    zoomOut,
  };
};

export default useCanvasGestures;
