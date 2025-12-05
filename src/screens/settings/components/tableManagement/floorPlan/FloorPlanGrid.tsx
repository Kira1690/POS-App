/**
 * FloorPlanGrid Component
 * SVG grid overlay for the floor plan canvas
 */

import React, { useMemo } from 'react';
import { Defs, Pattern, Rect, Line, G } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface FloorPlanGridProps {
  width: number;
  height: number;
  gridSize: number;
  visible?: boolean;
  showMajorLines?: boolean;
  majorLineInterval?: number;
}

const FloorPlanGrid: React.FC<FloorPlanGridProps> = ({
  width,
  height,
  gridSize,
  visible = true,
  showMajorLines = true,
  majorLineInterval = 5,
}) => {
  const { theme } = useTheme();

  // Generate grid pattern ID to avoid conflicts
  const patternId = useMemo(() => `grid-pattern-${gridSize}`, [gridSize]);
  const majorPatternId = useMemo(
    () => `major-grid-pattern-${gridSize * majorLineInterval}`,
    [gridSize, majorLineInterval]
  );

  if (!visible) {
    return null;
  }

  const minorLineColor = theme.colors.outline;
  const majorLineColor = theme.colors.onSurfaceVariant;

  return (
    <G>
      {/* Pattern definitions */}
      <Defs>
        {/* Minor grid pattern */}
        <Pattern
          id={patternId}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          {/* Vertical line */}
          <Line
            x1={gridSize}
            y1={0}
            x2={gridSize}
            y2={gridSize}
            stroke={minorLineColor}
            strokeWidth={0.5}
            opacity={0.2}
          />
          {/* Horizontal line */}
          <Line
            x1={0}
            y1={gridSize}
            x2={gridSize}
            y2={gridSize}
            stroke={minorLineColor}
            strokeWidth={0.5}
            opacity={0.2}
          />
        </Pattern>

        {/* Major grid pattern (every N cells) */}
        {showMajorLines && (
          <Pattern
            id={majorPatternId}
            width={gridSize * majorLineInterval}
            height={gridSize * majorLineInterval}
            patternUnits="userSpaceOnUse"
          >
            {/* Vertical major line */}
            <Line
              x1={gridSize * majorLineInterval}
              y1={0}
              x2={gridSize * majorLineInterval}
              y2={gridSize * majorLineInterval}
              stroke={majorLineColor}
              strokeWidth={1}
              opacity={0.3}
            />
            {/* Horizontal major line */}
            <Line
              x1={0}
              y1={gridSize * majorLineInterval}
              x2={gridSize * majorLineInterval}
              y2={gridSize * majorLineInterval}
              stroke={majorLineColor}
              strokeWidth={1}
              opacity={0.3}
            />
          </Pattern>
        )}
      </Defs>

      {/* Apply minor grid pattern */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={`url(#${patternId})`}
      />

      {/* Apply major grid pattern */}
      {showMajorLines && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={`url(#${majorPatternId})`}
        />
      )}

      {/* Origin crosshair (optional - for debugging) */}
      {/*
      <Line
        x1={0}
        y1={0}
        x2={20}
        y2={0}
        stroke={theme.colors.error}
        strokeWidth={2}
      />
      <Line
        x1={0}
        y1={0}
        x2={0}
        y2={20}
        stroke={theme.colors.success}
        strokeWidth={2}
      />
      */}
    </G>
  );
};

export default React.memo(FloorPlanGrid);
