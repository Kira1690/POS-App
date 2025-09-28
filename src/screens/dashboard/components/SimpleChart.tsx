import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ChartProps } from '@/types/dashboard.types';

export const SimpleChart: React.FC<ChartProps> = ({
  data,
  title,
  color,
  height = 200,
  showGrid = true,
  animated = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      marginBottom: theme.spacing.md,
    },

    title: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },

    chartContainer: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'flex-end',
    },

    yAxisContainer: {
      justifyContent: 'space-between',
      height: '100%',
      paddingRight: theme.spacing.sm,
      paddingBottom: 20, // Space for x-axis labels
    },

    yAxisLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 10,
    },

    barsContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingBottom: 20, // Space for x-axis labels
    },

    barContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 1,
    },

    barWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '80%',
    },

    bar: {
      width: '100%',
      borderRadius: 2,
      minHeight: 2,
    },

    xAxisLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 9,
      marginTop: 4,
      textAlign: 'center',
    },

    summaryText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },

    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    noDataText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceLight,
    },
  });

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const getBarHeight = (value: number) => {
    const percentage = (value - minValue) / range;
    return Math.max(percentage * (height - 80), 10); // 80px for title and labels
  };

  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          <Text style={styles.yAxisLabel}>{maxValue.toLocaleString()}</Text>
          <Text style={styles.yAxisLabel}>
            {Math.round((maxValue + minValue) / 2).toLocaleString()}
          </Text>
          <Text style={styles.yAxisLabel}>{minValue.toLocaleString()}</Text>
        </View>

        {/* Chart bars */}
        <View style={styles.barsContainer}>
          {data.map((point, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: getBarHeight(point.value),
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.xAxisLabel} numberOfLines={1}>
                {point.label || point.date}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Value display */}
      <Text style={styles.summaryText}>
        Latest: {data[data.length - 1]?.value.toLocaleString()}
      </Text>
    </View>
  );
};