/**
 * Simple Line Chart - Basic working chart without complex dependencies
 * Temporary component to fix Metro bundler issues
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ChartDataPoint {
  label: string;
  value: number;
  date: string;
}

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  title: string;
  height?: number;
  accentColor?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  height = 320,
  accentColor,
}) => {
  const { theme } = useTheme();

  const chartHeight = height - 80; // Space for title and labels
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  const primaryColor = accentColor || theme.colors.tertiary;

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    title: {
      ...theme.typography.title3,
      color: theme.colors.onSurface,
      fontWeight: '600',
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    chartContainer: {
      height: chartHeight,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    barContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    bar: {
      width: '80%',
      borderRadius: 4,
      marginBottom: 4,
    },
    label: {
      ...theme.typography.caption2,
      color: theme.colors.onSurfaceVariant,
      fontSize: 10,
      textAlign: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: theme.spacing.md,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.outline,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...theme.typography.headline,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    statLabel: {
      ...theme.typography.caption1,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
  });

  const totalValue = data.reduce((sum, point) => sum + point.value, 0);
  const avgValue = totalValue / data.length;
  const growthRate = data.length > 1
    ? ((data[data.length - 1].value - data[0].value) / data[0].value * 100)
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartContainer}>
        {data.map((point, index) => {
          const barHeight = Math.max(
            ((point.value - minValue) / valueRange) * (chartHeight - 40),
            8
          );

          return (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: primaryColor,
                  },
                ]}
              />
              <Text style={styles.label}>{point.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatValue(totalValue)}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatValue(avgValue)}</Text>
          <Text style={styles.statLabel}>Daily Avg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: growthRate >= 0 ? theme.colors.success : theme.colors.error }]}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Growth</Text>
        </View>
      </View>
    </View>
  );
};