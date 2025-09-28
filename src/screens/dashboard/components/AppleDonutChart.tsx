/**
 * Apple-Style Donut Chart Component
 * Beautiful circular progress visualization like Apple's Activity rings
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface DonutDataPoint {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface AppleDonutChartProps {
  data: DonutDataPoint[];
  title: string;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  centerContent?: React.ReactNode;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const AppleDonutChart: React.FC<AppleDonutChartProps> = ({
  data,
  title,
  size = 200,
  strokeWidth = 12,
  animated = true,
  centerContent,
}) => {
  const { theme } = useTheme();
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      const animations = animatedValues.map((animatedValue, index) =>
        Animated.timing(animatedValue, {
          toValue: data[index]?.percentage || 0,
          duration: 1200,
          delay: index * 200,
          useNativeDriver: false,
        })
      );

      Animated.stagger(100, animations).start();
    } else {
      animatedValues.forEach((animatedValue, index) => {
        animatedValue.setValue(data[index]?.percentage || 0);
      });
    }
  }, [data, animated]);

  const getStrokeDasharray = (percentage: number) => {
    const strokeLength = (percentage / 100) * circumference;
    return `${strokeLength} ${circumference}`;
  };

  const getTotalValue = () => {
    return data.reduce((sum, item) => sum + item.value, 0);
  };

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
      alignItems: 'center',
    },
    title: {
      ...theme.typography.title3,
      color: theme.colors.onSurface,
      fontWeight: '600',
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    chartContainer: {
      position: 'relative',
      marginBottom: theme.spacing.lg,
    },
    centerContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerValue: {
      ...theme.typography.title2,
      color: theme.colors.onSurface,
      fontWeight: '700',
      textAlign: 'center',
    },
    centerLabel: {
      ...theme.typography.caption1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 4,
    },
    legendContainer: {
      width: '100%',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    legendLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.sm,
    },
    legendLabel: {
      ...theme.typography.callout,
      color: theme.colors.onSurface,
      flex: 1,
    },
    legendValue: {
      ...theme.typography.callout,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    legendPercentage: {
      ...theme.typography.caption1,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background circles */}
            {data.map((_, index) => (
              <Circle
                key={`bg-${index}`}
                cx={center}
                cy={center}
                r={radius - (index * (strokeWidth + 4))}
                stroke={theme.colors.outline}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.1}
              />
            ))}

            {/* Data circles */}
            {data.map((item, index) => (
              <AnimatedCircle
                key={`data-${index}`}
                cx={center}
                cy={center}
                r={radius - (index * (strokeWidth + 4))}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={animatedValues[index].interpolate({
                  inputRange: [0, 100],
                  outputRange: [
                    `0 ${circumference}`,
                    getStrokeDasharray(item.percentage),
                  ],
                })}
                strokeLinecap="round"
              />
            ))}
          </G>
        </Svg>

        {/* Center Content */}
        <View style={styles.centerContent}>
          {centerContent || (
            <>
              <Text style={styles.centerValue}>
                {formatValue(getTotalValue())}
              </Text>
              <Text style={styles.centerLabel}>Total Sales</Text>
            </>
          )}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={styles.legendLeft}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.legendValue}>{formatValue(item.value)}</Text>
              <Text style={styles.legendPercentage}>({item.percentage.toFixed(1)}%)</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};