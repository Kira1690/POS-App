/**
 * FloorPlanZone Component
 * SVG zone/area rendering for the floor plan canvas
 */

import React, { useMemo } from 'react';
import { G, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { FloorZone, ZoneType } from '@/types/settings/table-management.types';

interface FloorPlanZoneProps {
  zone: FloorZone;
  isSelected?: boolean;
  onPress?: () => void;
}

/**
 * Get zone color from theme based on zone type or color property
 */
const getZoneColor = (
  zone: FloorZone,
  theme: ReturnType<typeof useTheme>['theme']
): string => {
  // If zone has a specific color property, try to use it from theme
  const colorMap: Record<string, string> = {
    outline: theme.colors.outline,
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
  };

  if (zone.color && colorMap[zone.color]) {
    return colorMap[zone.color];
  }

  // Fallback to type-based colors
  const typeColorMap: Record<ZoneType, string> = {
    kitchen: theme.colors.outline,
    bar: theme.colors.info,
    entrance: theme.colors.outline,
    restroom: theme.colors.outline,
    storage: theme.colors.outline,
    vip: theme.colors.warning,
    outdoor: theme.colors.success,
    custom: theme.colors.primary,
  };

  return typeColorMap[zone.type] || theme.colors.outline;
};

const FloorPlanZone: React.FC<FloorPlanZoneProps> = ({
  zone,
  isSelected = false,
  onPress,
}) => {
  const { theme } = useTheme();

  const zoneColor = useMemo(() => getZoneColor(zone, theme), [zone, theme]);

  // Calculate fill opacity from zone opacity (0-1) to hex (00-FF)
  const fillOpacity = useMemo(() => {
    const opacityValue = Math.round(zone.opacity * 255);
    return opacityValue.toString(16).padStart(2, '0');
  }, [zone.opacity]);

  const fillColor = `${zoneColor}${fillOpacity}`;
  const strokeColor = isSelected ? theme.colors.primary : zoneColor;
  const strokeWidth = isSelected ? 3 : 2;

  // Calculate label position
  const labelX = zone.bounds.x + zone.bounds.width / 2;
  const labelY = zone.bounds.y + zone.bounds.height / 2;

  // Determine if zone should show as non-seating
  const isNonSeating = !zone.is_seating_area;

  return (
    <G onPress={onPress}>
      {/* Zone background */}
      <Rect
        x={zone.bounds.x}
        y={zone.bounds.y}
        width={zone.bounds.width}
        height={zone.bounds.height}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isNonSeating ? '8,4' : undefined}
        rx={8}
        ry={8}
      />

      {/* Zone name label */}
      <SvgText
        x={labelX}
        y={labelY - 6}
        textAnchor="middle"
        alignmentBaseline="middle"
        fill={zoneColor}
        fontSize={12}
        fontWeight="700"
        letterSpacing={0.5}
      >
        {zone.name.toUpperCase()}
      </SvgText>

      {/* Non-seating indicator */}
      {isNonSeating && (
        <SvgText
          x={labelX}
          y={labelY + 10}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={zoneColor}
          fontSize={9}
          fontWeight="500"
          opacity={0.7}
        >
          (Non-seating)
        </SvgText>
      )}

      {/* Locked indicator */}
      {zone.is_locked && (
        <SvgText
          x={zone.bounds.x + 8}
          y={zone.bounds.y + 14}
          fill={zoneColor}
          fontSize={10}
          opacity={0.6}
        >
          locked
        </SvgText>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <Rect
          x={zone.bounds.x - 2}
          y={zone.bounds.y - 2}
          width={zone.bounds.width + 4}
          height={zone.bounds.height + 4}
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth={2}
          strokeDasharray="4,4"
          rx={10}
          ry={10}
          opacity={0.8}
        />
      )}
    </G>
  );
};

export default React.memo(FloorPlanZone);
