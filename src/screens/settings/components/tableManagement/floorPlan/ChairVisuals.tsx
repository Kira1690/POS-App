/**
 * ChairVisuals Component
 * Renders chair icons around tables based on capacity
 */

import React, { useMemo } from 'react';
import { G, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { TableShape, TableSize } from '@/types/settings/table-management.types';
import {
  calculateChairPositions,
  calculateChairPositionsWithDimensions,
  CHAIR_CONSTANTS,
  getTableCenter,
} from './utils/chairPositions';

interface ChairVisualsProps {
  capacity: number;
  shape: TableShape;
  size: TableSize;
  visible?: boolean;
  rotation?: number;
  /** Custom width from resize operation - overrides size-based dimensions */
  customWidth?: number;
  /** Custom height from resize operation - overrides size-based dimensions */
  customHeight?: number;
}

const ChairVisuals: React.FC<ChairVisualsProps> = ({
  capacity,
  shape,
  size,
  visible = true,
  rotation = 0,
  customWidth,
  customHeight,
}) => {
  const { theme } = useTheme();

  // Check if custom dimensions are provided
  const hasCustomDimensions = customWidth !== undefined && customHeight !== undefined;

  // Calculate chair positions - use custom dimensions if provided
  const chairPositions = useMemo(() => {
    if (hasCustomDimensions) {
      return calculateChairPositionsWithDimensions(capacity, shape, customWidth!, customHeight!);
    }
    return calculateChairPositions(capacity, shape, size);
  }, [capacity, shape, size, hasCustomDimensions, customWidth, customHeight]);

  // Get table center for rotation origin - use custom dimensions if provided
  const tableCenter = useMemo(() => {
    if (hasCustomDimensions) {
      return {
        x: customWidth! / 2,
        y: customHeight! / 2,
      };
    }
    return getTableCenter(shape, size);
  }, [shape, size, hasCustomDimensions, customWidth, customHeight]);

  if (!visible || capacity <= 0) {
    return null;
  }

  const chairFillColor = theme.colors.surfaceVariant;
  const chairStrokeColor = theme.colors.outline;

  return (
    <G
      rotation={rotation}
      origin={`${tableCenter.x}, ${tableCenter.y}`}
    >
      {chairPositions.map((chair) => (
        <G key={`chair-${chair.index}`}>
          {/* Chair circle */}
          <Circle
            cx={tableCenter.x + chair.x}
            cy={tableCenter.y + chair.y}
            r={CHAIR_CONSTANTS.radius}
            fill={chairFillColor}
            stroke={chairStrokeColor}
            strokeWidth={CHAIR_CONSTANTS.strokeWidth}
          />
          {/* Optional: small inner detail for chair look */}
          <Circle
            cx={tableCenter.x + chair.x}
            cy={tableCenter.y + chair.y}
            r={CHAIR_CONSTANTS.radius - 3}
            fill="none"
            stroke={chairStrokeColor}
            strokeWidth={0.5}
            opacity={0.5}
          />
        </G>
      ))}
    </G>
  );
};

export default React.memo(ChairVisuals);
