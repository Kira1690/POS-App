/**
 * BarChart — Reusable bar chart with responsive sizing, color support, labels, touch highlight.
 * Renamed from SimpleLineChart for clarity; imported as SimpleLineChart for backward compat.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
  date?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  title: string;
  height?: number;
  accentColor?: string;
  showValues?: boolean;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 320,
  accentColor,
  showValues = false,
  horizontal = false,
}) => {
  const { theme } = useTheme();
  const { isPhone, isSmallTablet, captionSize, bodySize } = useResponsive();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const primaryColor = accentColor ?? theme.colors.tertiary;
  const chartHeight = height - 80;

  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value), 1) : 1;
  const minValue = data.length > 0 ? Math.min(...data.map((d) => d.value)) : 0;
  const valueRange = maxValue - minValue || 1;

  const formatValue = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;

  const totalValue = data.reduce((s, d) => s + d.value, 0);
  const avgValue = data.length > 0 ? totalValue / data.length : 0;
  const growth =
    data.length > 1 && data[0].value > 0
      ? ((data[data.length - 1].value - data[0].value) / data[0].value) * 100
      : 0;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: isPhone ? 12 : isSmallTablet ? 14 : theme.spacing.lg,
      ...theme.shadows.md,
    },
    title: {
      fontSize: isPhone ? 13 : isSmallTablet ? 14 : 16,
      color: theme.colors.onSurface,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    chartArea: {
      height: chartHeight,
      flexDirection: horizontal ? 'column' : 'row',
      alignItems: horizontal ? 'flex-start' : 'flex-end',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    barWrap: {
      flex: horizontal ? undefined : 1,
      width: horizontal ? '100%' : undefined,
      alignItems: 'center',
      marginHorizontal: horizontal ? 0 : 2,
      marginBottom: horizontal ? 4 : 0,
    },
    valueLabel: {
      fontSize: captionSize,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: 2,
    },
    bar: {
      borderRadius: 4,
      minHeight: 4,
    },
    xLabel: {
      fontSize: captionSize,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.outline,
      marginTop: theme.spacing.sm,
    },
    statItem: { alignItems: 'center' },
    statValue: {
      fontSize: isPhone ? 14 : isSmallTablet ? 16 : 18,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    statLabel: {
      fontSize: captionSize,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: bodySize,
      color: theme.colors.onSurfaceSecondary,
      marginVertical: theme.spacing.lg,
    },
  });

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartArea}>
        {data.map((point, index) => {
          const barLength = Math.max(
            ((point.value - minValue) / valueRange) * (horizontal ? 160 : chartHeight - 30),
            4,
          );
          const isActive = activeIndex === index;
          const barColor = point.color ?? (isActive ? theme.colors.primary : primaryColor);

          if (horizontal) {
            return (
              <TouchableOpacity
                key={index}
                style={styles.barWrap}
                onPress={() => setActiveIndex(isActive ? null : index)}
                activeOpacity={0.8}
              >
                <Text style={styles.xLabel} numberOfLines={1}>{point.label}</Text>
                <View
                  style={[
                    styles.bar,
                    { width: barLength, height: 16, backgroundColor: barColor },
                  ]}
                />
                {showValues && (
                  <Text style={styles.valueLabel}>{point.value}</Text>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              style={styles.barWrap}
              onPress={() => setActiveIndex(isActive ? null : index)}
              activeOpacity={0.8}
            >
              {showValues && (
                <Text style={styles.valueLabel}>{formatValue(point.value)}</Text>
              )}
              <View
                style={[
                  styles.bar,
                  { height: barLength, width: '80%', backgroundColor: barColor },
                ]}
              />
              <Text style={styles.xLabel} numberOfLines={1}>{point.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatValue(totalValue)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatValue(avgValue)}</Text>
          <Text style={styles.statLabel}>Avg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: growth >= 0 ? theme.colors.success : theme.colors.error },
          ]}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Growth</Text>
        </View>
      </View>
    </View>
  );
};

// Backward-compat named export
export const SimpleLineChart = BarChart;
