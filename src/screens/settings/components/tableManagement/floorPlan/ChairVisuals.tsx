/**
 * ChairVisuals Component
 * Renders chair icons around tables based on capacity
 */

import React, { useMemo } from 'react';
import { G, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { TableShape, TableSize } from '@/types/settings/table-management.types';
import { calculateChairPositions, CHAIR_CONSTANTS, getTableCenter } from './utils/chairPositions';

interface ChairVisualsProps {
  capacity: number;
  shape: TableShape;
  size: TableSize;
  visible?: boolean;
  rotation?: number;
}

const ChairVisuals: React.FC<ChairVisualsProps> = ({
  capacity,
  shape,
  size,
  visible = true,
  rotation = 0,
}) => {
  const { theme } = useTheme();

  // Calculate chair positions
  const chairPositions = useMemo(
    () => calculateChairPositions(capacity, shape, size),
    [capacity, shape, size]
  );

  // Get table center for rotation origin
  const tableCenter = useMemo(() => getTableCenter(shape, size), [shape, size]);

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
