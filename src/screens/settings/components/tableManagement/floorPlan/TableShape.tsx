/**
 * TableShape Component
 * SVG rendering of table shapes (round, square, rectangle, oval)
 */

import React, { useMemo } from 'react';
import { G, Circle, Rect, Ellipse, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { TableShape as TableShapeEnum, TableSize, TableStatus } from '@/types/settings/table-management.types';
import { TABLE_DIMENSIONS, RECTANGLE_DIMENSIONS, getTableDimensions } from './utils/chairPositions';

interface TableShapeProps {
  shape: TableShapeEnum;
  size: TableSize;
  status: TableStatus;
  isSelected?: boolean;
  tableNumber?: string;
  capacity?: number;
  showNumber?: boolean;
  showCapacity?: boolean;
  /** Custom width from resize operation - overrides size-based dimensions */
  customWidth?: number;
  /** Custom height from resize operation - overrides size-based dimensions */
  customHeight?: number;
}

/**
 * Get status color from theme
 */
const getStatusColor = (
  status: TableStatus,
  theme: ReturnType<typeof useTheme>['theme']
): string => {
  const statusColorMap: Record<TableStatus, string> = {
    [TableStatus.AVAILABLE]: theme.colors.success,
    [TableStatus.OCCUPIED]: theme.colors.error,
    [TableStatus.RESERVED]: theme.colors.warning,
    [TableStatus.CLEANING]: theme.colors.info,
    [TableStatus.OUT_OF_ORDER]: theme.colors.outline,
    [TableStatus.OUT_OF_SERVICE]: theme.colors.outline,
  };

  return statusColorMap[status] || theme.colors.outline;
};

const TableShape: React.FC<TableShapeProps> = ({
  shape,
  size,
  status,
  isSelected = false,
  tableNumber,
  capacity,
  showNumber = true,
  showCapacity = true,
  customWidth,
  customHeight,
}) => {
  const { theme } = useTheme();

  const statusColor = useMemo(() => getStatusColor(status, theme), [status, theme]);

  // Use custom dimensions if provided, otherwise fall back to default
  const dimensions = useMemo(() => {
    if (customWidth !== undefined && customHeight !== undefined) {
      return {
        width: customWidth,
        height: customHeight,
        radius: Math.min(customWidth, customHeight) / 2,
      };
    }
    return getTableDimensions(shape, size);
  }, [shape, size, customWidth, customHeight]);

  const strokeColor = isSelected ? theme.colors.primary : statusColor;
  const strokeWidth = isSelected ? 4 : 2;
  const fillColor = `${statusColor}20`; // 20% opacity

  // Center point
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Render shape based on type
  const renderShape = () => {
    const commonProps = {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
    };

    switch (shape) {
      case TableShapeEnum.ROUND:
        return (
          <Circle
            cx={centerX}
            cy={centerY}
            r={dimensions.radius - strokeWidth}
            {...commonProps}
          />
        );

      case TableShapeEnum.OVAL:
        return (
          <Ellipse
            cx={centerX}
            cy={centerY}
            rx={dimensions.width / 2 - strokeWidth}
            ry={dimensions.height / 2.5 - strokeWidth}
            {...commonProps}
          />
        );

      case TableShapeEnum.SQUARE:
        return (
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={dimensions.width - strokeWidth}
            height={dimensions.height - strokeWidth}
            rx={8}
            ry={8}
            {...commonProps}
          />
        );

      case TableShapeEnum.RECTANGLE:
        return (
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={dimensions.width - strokeWidth}
            height={dimensions.height - strokeWidth}
            rx={8}
            ry={8}
            {...commonProps}
          />
        );

      default:
        return (
          <Circle
            cx={centerX}
            cy={centerY}
            r={dimensions.radius - strokeWidth}
            {...commonProps}
          />
        );
    }
  };

  return (
    <G>
      {/* Table shape */}
      {renderShape()}

      {/* Table number */}
      {showNumber && tableNumber && (
        <SvgText
          x={centerX}
          y={centerY - (showCapacity && capacity ? 6 : 0)}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={statusColor}
          fontSize={14}
          fontWeight="700"
        >
          {tableNumber}
        </SvgText>
      )}

      {/* Capacity */}
      {showCapacity && capacity && (
        <SvgText
          x={centerX}
          y={centerY + (showNumber && tableNumber ? 10 : 0)}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={theme.colors.onSurface}
          fontSize={10}
          fontWeight="600"
          opacity={0.8}
        >
          {capacity} seats
        </SvgText>
      )}

      {/* Selection indicator ring */}
      {isSelected && (
        <Circle
          cx={centerX}
          cy={centerY}
          r={Math.max(dimensions.width, dimensions.height) / 2 + 4}
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth={2}
          strokeDasharray="4,4"
          opacity={0.8}
        />
      )}
    </G>
  );
};

export default React.memo(TableShape);
