/**
 * Chair Position Calculations
 * Utilities for calculating chair positions around tables
 */

import { TableShape, TableSize, ChairPosition } from '@/types/settings/table-management.types';

// ==================== CONSTANTS ====================

/**
 * Table dimensions by size
 */
export const TABLE_DIMENSIONS: Record<TableSize, { width: number; height: number; radius: number }> = {
  [TableSize.SMALL]: { width: 60, height: 60, radius: 30 },
  [TableSize.MEDIUM]: { width: 80, height: 80, radius: 40 },
  [TableSize.LARGE]: { width: 100, height: 100, radius: 50 },
};

/**
 * Rectangle table dimensions
 */
export const RECTANGLE_DIMENSIONS: Record<TableSize, { width: number; height: number }> = {
  [TableSize.SMALL]: { width: 80, height: 50 },
  [TableSize.MEDIUM]: { width: 100, height: 60 },
  [TableSize.LARGE]: { width: 120, height: 70 },
};

/**
 * Chair visual constants
 */
export const CHAIR_CONSTANTS = {
  radius: 8,
  offset: 6, // Distance from table edge
  strokeWidth: 1,
} as const;

// Import enums for default case
import { TableShape as TableShapeEnum, TableSize as TableSizeEnum } from '@/types/settings/table-management.types';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Get table dimensions based on shape and size
 */
export const getTableDimensions = (
  shape: TableShape,
  size: TableSize
): { width: number; height: number; radius: number } => {
  if (shape === TableShapeEnum.RECTANGLE) {
    const dims = RECTANGLE_DIMENSIONS[size] || RECTANGLE_DIMENSIONS[TableSizeEnum.MEDIUM];
    return { ...dims, radius: Math.min(dims.width, dims.height) / 2 };
  }
  return TABLE_DIMENSIONS[size] || TABLE_DIMENSIONS[TableSizeEnum.MEDIUM];
};

/**
 * Get table center point
 */
export const getTableCenter = (
  shape: TableShape,
  size: TableSize
): { x: number; y: number } => {
  const dims = getTableDimensions(shape, size);
  return {
    x: dims.width / 2,
    y: dims.height / 2,
  };
};

// ==================== CHAIR POSITION CALCULATIONS ====================

/**
 * Calculate chair positions around a round/oval table
 */
const calculateRoundTableChairs = (
  capacity: number,
  tableRadius: number
): ChairPosition[] => {
  const positions: ChairPosition[] = [];
  const chairDistance = tableRadius + CHAIR_CONSTANTS.offset + CHAIR_CONSTANTS.radius;
  const angleStep = 360 / capacity;
  const startAngle = -90; // Start from top

  for (let i = 0; i < capacity; i++) {
    const angle = startAngle + i * angleStep;
    const radians = toRadians(angle);

    positions.push({
      index: i,
      angle,
      distance: chairDistance,
      x: Math.cos(radians) * chairDistance,
      y: Math.sin(radians) * chairDistance,
    });
  }

  return positions;
};

/**
 * Calculate chair positions around a square table
 */
const calculateSquareTableChairs = (
  capacity: number,
  tableWidth: number
): ChairPosition[] => {
  const positions: ChairPosition[] = [];
  const chairDistance = tableWidth / 2 + CHAIR_CONSTANTS.offset + CHAIR_CONSTANTS.radius;

  // Distribute chairs to sides based on capacity
  const distribution = getSquareChairDistribution(capacity);

  let chairIndex = 0;

  // Top side
  for (let i = 0; i < distribution.top; i++) {
    const spacing = tableWidth / (distribution.top + 1);
    positions.push({
      index: chairIndex++,
      angle: -90,
      distance: chairDistance,
      x: -tableWidth / 2 + spacing * (i + 1),
      y: -chairDistance,
    });
  }

  // Right side
  for (let i = 0; i < distribution.right; i++) {
    const spacing = tableWidth / (distribution.right + 1);
    positions.push({
      index: chairIndex++,
      angle: 0,
      distance: chairDistance,
      x: chairDistance,
      y: -tableWidth / 2 + spacing * (i + 1),
    });
  }

  // Bottom side
  for (let i = 0; i < distribution.bottom; i++) {
    const spacing = tableWidth / (distribution.bottom + 1);
    positions.push({
      index: chairIndex++,
      angle: 90,
      distance: chairDistance,
      x: tableWidth / 2 - spacing * (i + 1),
      y: chairDistance,
    });
  }

  // Left side
  for (let i = 0; i < distribution.left; i++) {
    const spacing = tableWidth / (distribution.left + 1);
    positions.push({
      index: chairIndex++,
      angle: 180,
      distance: chairDistance,
      x: -chairDistance,
      y: tableWidth / 2 - spacing * (i + 1),
    });
  }

  return positions;
};

/**
 * Calculate chair positions around a rectangular table
 */
const calculateRectangleTableChairs = (
  capacity: number,
  tableWidth: number,
  tableHeight: number
): ChairPosition[] => {
  const positions: ChairPosition[] = [];
  const chairOffsetX = tableWidth / 2 + CHAIR_CONSTANTS.offset + CHAIR_CONSTANTS.radius;
  const chairOffsetY = tableHeight / 2 + CHAIR_CONSTANTS.offset + CHAIR_CONSTANTS.radius;

  // Distribute chairs to sides based on capacity
  const distribution = getRectangleChairDistribution(capacity);

  let chairIndex = 0;

  // Top side (long side)
  for (let i = 0; i < distribution.top; i++) {
    const spacing = tableWidth / (distribution.top + 1);
    positions.push({
      index: chairIndex++,
      angle: -90,
      distance: chairOffsetY,
      x: -tableWidth / 2 + spacing * (i + 1),
      y: -chairOffsetY,
    });
  }

  // Right side (short side)
  for (let i = 0; i < distribution.right; i++) {
    const spacing = tableHeight / (distribution.right + 1);
    positions.push({
      index: chairIndex++,
      angle: 0,
      distance: chairOffsetX,
      x: chairOffsetX,
      y: -tableHeight / 2 + spacing * (i + 1),
    });
  }

  // Bottom side (long side)
  for (let i = 0; i < distribution.bottom; i++) {
    const spacing = tableWidth / (distribution.bottom + 1);
    positions.push({
      index: chairIndex++,
      angle: 90,
      distance: chairOffsetY,
      x: tableWidth / 2 - spacing * (i + 1),
      y: chairOffsetY,
    });
  }

  // Left side (short side)
  for (let i = 0; i < distribution.left; i++) {
    const spacing = tableHeight / (distribution.left + 1);
    positions.push({
      index: chairIndex++,
      angle: 180,
      distance: chairOffsetX,
      x: -chairOffsetX,
      y: tableHeight / 2 - spacing * (i + 1),
    });
  }

  return positions;
};

/**
 * Get chair distribution for square tables
 */
const getSquareChairDistribution = (
  capacity: number
): { top: number; right: number; bottom: number; left: number } => {
  // Even distribution across 4 sides
  const perSide = Math.floor(capacity / 4);
  const remainder = capacity % 4;

  return {
    top: perSide + (remainder > 0 ? 1 : 0),
    right: perSide + (remainder > 1 ? 1 : 0),
    bottom: perSide + (remainder > 2 ? 1 : 0),
    left: perSide + (remainder > 3 ? 1 : 0),
  };
};

/**
 * Get chair distribution for rectangular tables
 * Prioritizes long sides (top/bottom)
 */
const getRectangleChairDistribution = (
  capacity: number
): { top: number; right: number; bottom: number; left: number } => {
  // Most chairs on long sides (top/bottom)
  if (capacity <= 2) {
    return { top: 1, right: 0, bottom: 1, left: 0 };
  }
  if (capacity <= 4) {
    return { top: 2, right: 0, bottom: 2, left: 0 };
  }
  if (capacity <= 6) {
    return { top: 2, right: 1, bottom: 2, left: 1 };
  }
  if (capacity <= 8) {
    return { top: 3, right: 1, bottom: 3, left: 1 };
  }
  if (capacity <= 10) {
    return { top: 3, right: 2, bottom: 3, left: 2 };
  }

  // For larger capacities
  const longSideEach = Math.floor(capacity * 0.35);
  const shortSideEach = Math.floor(capacity * 0.15);
  const remainder = capacity - (longSideEach * 2 + shortSideEach * 2);

  return {
    top: longSideEach + (remainder > 0 ? 1 : 0),
    bottom: longSideEach + (remainder > 1 ? 1 : 0),
    right: shortSideEach + (remainder > 2 ? 1 : 0),
    left: shortSideEach + (remainder > 3 ? 1 : 0),
  };
};

// ==================== MAIN EXPORT ====================

/**
 * Calculate chair positions for a table
 */
export const calculateChairPositions = (
  capacity: number,
  shape: TableShape,
  size: TableSize
): ChairPosition[] => {
  if (capacity <= 0) {
    return [];
  }

  const dims = getTableDimensions(shape, size);

  switch (shape) {
    case TableShapeEnum.ROUND:
    case TableShapeEnum.OVAL:
      return calculateRoundTableChairs(capacity, dims.radius);

    case TableShapeEnum.SQUARE:
      return calculateSquareTableChairs(capacity, dims.width);

    case TableShapeEnum.RECTANGLE:
      return calculateRectangleTableChairs(capacity, dims.width, dims.height);

    default:
      return calculateRoundTableChairs(capacity, dims.radius);
  }
};

/**
 * Get the total space needed for a table including chairs
 */
export const getTotalTableSpace = (
  shape: TableShape,
  size: TableSize
): { width: number; height: number } => {
  const dims = getTableDimensions(shape, size);
  const chairSpace = (CHAIR_CONSTANTS.offset + CHAIR_CONSTANTS.radius * 2) * 2;

  return {
    width: dims.width + chairSpace,
    height: dims.height + chairSpace,
  };
};
