/**
 * TableVisual Component
 * SVG-only rendering of a table with chairs
 * No gesture handling - gestures are handled by TableGestureOverlay
 */

import React, { useMemo } from 'react';
import { G } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import {
  FloorPlanTablePosition,
  TableShape as TableShapeEnum,
  TableSize,
  TableStatus,
} from '@/types/settings/table-management.types';
import { MockTable } from '@/data/tables';
import TableShape from './TableShape';
import ChairVisuals from './ChairVisuals';
import { getTableCenter } from './utils/chairPositions';

interface TableVisualProps {
  position: FloorPlanTablePosition;
  table: MockTable;
  isSelected?: boolean;
  showChairs?: boolean;
}

/**
 * Map string status to enum
 */
const mapStatus = (status: string): TableStatus => {
  const statusMap: Record<string, TableStatus> = {
    available: TableStatus.AVAILABLE,
    occupied: TableStatus.OCCUPIED,
    reserved: TableStatus.RESERVED,
    cleaning: TableStatus.CLEANING,
    out_of_service: TableStatus.OUT_OF_SERVICE,
  };
  return statusMap[status.toLowerCase()] || TableStatus.AVAILABLE;
};

/**
 * Map string shape to enum
 */
const mapShape = (shape?: string): TableShapeEnum => {
  const shapeMap: Record<string, TableShapeEnum> = {
    round: TableShapeEnum.ROUND,
    square: TableShapeEnum.SQUARE,
    rectangle: TableShapeEnum.RECTANGLE,
    oval: TableShapeEnum.OVAL,
  };
  return shapeMap[shape?.toLowerCase() || 'round'] || TableShapeEnum.ROUND;
};

const TableVisual: React.FC<TableVisualProps> = ({
  position,
  table,
  isSelected = false,
  showChairs = true,
}) => {
  const { theme } = useTheme();

  const tableShape = useMemo(() => mapShape(table.shape), [table.shape]);
  const tableStatus = useMemo(() => mapStatus(table.status), [table.status]);
  const tableSize = TableSize.MEDIUM;

  const tableCenter = useMemo(
    () => getTableCenter(tableShape, tableSize),
    [tableShape, tableSize]
  );

  // Calculate position offset to center the table on the position point
  const offsetX = position.x - tableCenter.x;
  const offsetY = position.y - tableCenter.y;

  return (
    <G
      x={offsetX}
      y={offsetY}
      rotation={position.rotation}
      origin={`${tableCenter.x}, ${tableCenter.y}`}
    >
      {/* Chair visuals (behind table) */}
      {showChairs && (
        <ChairVisuals
          capacity={table.capacity}
          shape={tableShape}
          size={tableSize}
          rotation={position.rotation}
        />
      )}

      {/* Table shape */}
      <TableShape
        shape={tableShape}
        size={tableSize}
        status={tableStatus}
        isSelected={isSelected}
        tableNumber={table.number}
        capacity={table.capacity}
        showNumber={true}
        showCapacity={true}
      />
    </G>
  );
};

export default React.memo(TableVisual);
