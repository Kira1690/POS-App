/**
 * SimpleChart — Professional responsive bar chart for POS reports.
 * Features: capped bar widths, currency formatting, responsive sizing,
 * proper Y-axis labels, touch highlights, dark mode support.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { ChartProps } from '@/types/dashboard.types';

const fmtVal = (v: number): string => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  if (v >= 1) return v % 1 === 0 ? String(v) : `$${v.toFixed(0)}`;
  return String(v);
};

const MAX_BAR_WIDTH = 48;
const MIN_BAR_WIDTH = 14;

export const SimpleChart: React.FC<ChartProps & { barColor?: string | string[] }> = ({
  data,
  title,
  color,
  height = 200,
  barColor,
}) => {
  const { theme } = useTheme();
  const { isPhone, isSmallTablet, captionSize } = useResponsive();
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const chartHeight = height - 64;
  const barGap = isPhone ? 6 : 8;
  const maxBars = data?.length ?? 0;

  // Cap bar width so few-bar charts don't look bloated
  const computedBarWidth = useMemo(() => {
    if (maxBars === 0 || containerWidth === 0) return 20;
    const available = containerWidth - 40 - barGap * (maxBars + 1);
    const natural = Math.floor(available / maxBars);
    return Math.min(Math.max(natural, MIN_BAR_WIDTH), MAX_BAR_WIDTH);
  }, [maxBars, containerWidth, barGap]);

  const maxVal = useMemo(() => Math.max(...(data ?? []).map(d => d.value), 1), [data]);
  const ySteps = useMemo(() => {
    return [maxVal, Math.round(maxVal * 2 / 3), Math.round(maxVal / 3), 0];
  }, [maxVal]);

  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: isPhone ? 12 : 16,
      ...theme.shadows.sm,
      marginBottom: isPhone ? 8 : 12,
    },
    title: {
      fontSize: isPhone ? 12 : isSmallTablet ? 13 : 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 10,
    },
    chartWrap: {
      flexDirection: 'row',
      height: chartHeight,
    },
    yAxis: {
      width: 40,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingRight: 6,
      paddingBottom: 22,
    },
    yLabel: {
      fontSize: captionSize - 1,
      color: theme.colors.onSurfaceVariant,
    },
    barsArea: {
      flex: 1,
      position: 'relative',
    },
    gridLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.outline,
      opacity: 0.4,
    },
    barsRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: barGap,
      paddingBottom: 22,
      paddingHorizontal: barGap,
    },
    barCol: {
      alignItems: 'center',
      width: computedBarWidth,
    },
    bar: {
      width: computedBarWidth,
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      minHeight: 3,
    },
    barActive: {
      opacity: 0.85,
    },
    xLabel: {
      fontSize: Math.min(captionSize - 1, 10),
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
      textAlign: 'center',
    },
    tooltip: {
      position: 'absolute',
      top: -6,
      alignSelf: 'center',
      backgroundColor: theme.colors.onSurface,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
    },
    tooltipText: {
      fontSize: captionSize - 1,
      color: theme.colors.surface,
      fontWeight: '600',
    },
    empty: {
      height: chartHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: isPhone ? 11 : 13,
      color: theme.colors.onSurfaceVariant,
    },
  });

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card} onLayout={onLayout}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrap}>
        {/* Y-axis */}
        <View style={styles.yAxis}>
          {ySteps.map((v, i) => (
            <Text key={i} style={styles.yLabel}>{fmtVal(v)}</Text>
          ))}
        </View>

        {/* Bars area with grid lines */}
        <View style={styles.barsArea}>
          {/* Grid lines */}
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.gridLine, { top: `${(i / 3) * 100}%` }]} />
          ))}

          {/* Bars */}
          <View style={styles.barsRow}>
            {data.map((point, idx) => {
              const barH = Math.max((point.value / maxVal) * (chartHeight - 26), 3);
              const isActive = activeIdx === idx;
              const resolvedColor = isActive
                ? theme.colors.primary
                : barColor
                  ? (Array.isArray(barColor) ? (barColor[idx] ?? color) : barColor)
                  : color;

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.barCol}
                  onPress={() => setActiveIdx(isActive ? null : idx)}
                  activeOpacity={0.7}
                >
                  {isActive && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>{fmtVal(point.value)}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        backgroundColor: resolvedColor,
                        opacity: isActive ? 0.85 : 0.8,
                      },
                    ]}
                  />
                  <Text style={styles.xLabel} numberOfLines={1}>
                    {point.label || point.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};
