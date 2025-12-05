/**
 * Grid Snapping Utilities
 * Functions for snapping positions to grid in the floor plan editor
 */

/**
 * Snap a single value to the nearest grid line
 */
export const snapValueToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snap a position (x, y) to the nearest grid intersection
 */
export const snapPositionToGrid = (
  x: number,
  y: number,
  gridSize: number
): { x: number; y: number } => {
  return {
    x: snapValueToGrid(x, gridSize),
    y: snapValueToGrid(y, gridSize),
  };
};

/**
 * Snap a position with optional snapping toggle
 */
export const snapPositionConditional = (
  x: number,
  y: number,
  gridSize: number,
  snapEnabled: boolean
): { x: number; y: number } => {
  if (!snapEnabled) {
    return { x, y };
  }
  return snapPositionToGrid(x, y, gridSize);
};

/**
 * Get the grid cell index for a position
 */
export const getGridCellIndex = (
  x: number,
  y: number,
  gridSize: number
): { gridX: number; gridY: number } => {
  return {
    gridX: Math.floor(x / gridSize),
    gridY: Math.floor(y / gridSize),
  };
};

/**
 * Get position from grid cell index
 */
export const getPositionFromGridCell = (
  gridX: number,
  gridY: number,
  gridSize: number
): { x: number; y: number } => {
  return {
    x: gridX * gridSize,
    y: gridY * gridSize,
  };
};

/**
 * Check if a position is on a grid line
 */
export const isOnGridLine = (value: number, gridSize: number): boolean => {
  return value % gridSize === 0;
};

/**
 * Check if a position is at a grid intersection
 */
export const isAtGridIntersection = (
  x: number,
  y: number,
  gridSize: number
): boolean => {
  return isOnGridLine(x, gridSize) && isOnGridLine(y, gridSize);
};

/**
 * Constrain a position within canvas bounds
 */
export const constrainToCanvas = (
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  elementWidth: number = 0,
  elementHeight: number = 0
): { x: number; y: number } => {
  return {
    x: Math.min(Math.max(x, 0), canvasWidth - elementWidth),
    y: Math.min(Math.max(y, 0), canvasHeight - elementHeight),
  };
};

/**
 * Snap and constrain position in one operation
 */
export const snapAndConstrain = (
  x: number,
  y: number,
  gridSize: number,
  canvasWidth: number,
  canvasHeight: number,
  snapEnabled: boolean,
  elementWidth: number = 0,
  elementHeight: number = 0
): { x: number; y: number } => {
  // First snap if enabled
  const snapped = snapPositionConditional(x, y, gridSize, snapEnabled);

  // Then constrain to canvas bounds
  return constrainToCanvas(
    snapped.x,
    snapped.y,
    canvasWidth,
    canvasHeight,
    elementWidth,
    elementHeight
  );
};

/**
 * Calculate distance to nearest grid line
 */
export const distanceToNearestGridLine = (
  value: number,
  gridSize: number
): number => {
  const snapped = snapValueToGrid(value, gridSize);
  return Math.abs(value - snapped);
};

/**
 * Get visual snap indicator threshold (for showing snap guides)
 */
export const SNAP_INDICATOR_THRESHOLD = 10; // pixels

/**
 * Check if value is close enough to grid to show snap indicator
 */
export const shouldShowSnapIndicator = (
  value: number,
  gridSize: number,
  threshold: number = SNAP_INDICATOR_THRESHOLD
): boolean => {
  return distanceToNearestGridLine(value, gridSize) <= threshold;
};
