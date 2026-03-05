/**
 * Apple-Style Chart Component
 * Beautiful, interactive chart visualization with Apple design principles
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface ChartDataPoint {
  label: string;
  value: number;
  date: string;
}

interface AppleStyleChartProps {
  data: ChartDataPoint[];
  title: string;
  height?: number;
  showIndicators?: boolean;
  animated?: boolean;
  accentColor?: string;
}

export const AppleStyleChart: React.FC<AppleStyleChartProps> = ({
  data,
  title,
  height = 320,
  showIndicators = true,
  animated = true,
  accentColor,
}) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const chartHeight = height - 120; // Space for title, labels, and padding
  const chartWidth = screenWidth - 80; // Padding
  const padding = 20;

  const primaryColor = accentColor || theme.colors.tertiary;
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [animated]);

  const getPointPosition = (index: number, value: number) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
    const y = chartHeight - padding - ((value - minValue) / valueRange) * (chartHeight - padding * 2);
    return { x, y };
  };

  const createPath = () => {
    if (data.length === 0) return '';

    let path = '';
    data.forEach((point, index) => {
      const { x, y } = getPointPosition(index, point.value);
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        // Create smooth curve using quadratic bezier
        const prevPoint = getPointPosition(index - 1, data[index - 1].value);
        const cpx = (prevPoint.x + x) / 2;
        path += ` Q ${cpx} ${prevPoint.y} ${x} ${y}`;
      }
    });
    return path;
  };

  const createAreaPath = () => {
    if (data.length === 0) return '';

    let path = createPath();
    const lastPoint = getPointPosition(data.length - 1, data[data.length - 1].value);
    const firstPoint = getPointPosition(0, data[0].value);

    path += ` L ${lastPoint.x} ${chartHeight - padding}`;
    path += ` L ${firstPoint.x} ${chartHeight - padding}`;
    path += ' Z';

    return path;
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();

      const x = evt.nativeEvent.locationX - padding;
      const pointIndex = Math.round((x / (chartWidth - padding * 2)) * (data.length - 1));
      const clampedIndex = Math.max(0, Math.min(data.length - 1, pointIndex));
      setSelectedPoint(clampedIndex);
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX - padding;
      const pointIndex = Math.round((x / (chartWidth - padding * 2)) * (data.length - 1));
      const clampedIndex = Math.max(0, Math.min(data.length - 1, pointIndex));
      setSelectedPoint(clampedIndex);
    },
    onPanResponderRelease: () => {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      setTimeout(() => setSelectedPoint(null), 2000);
    },
  });

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
      overflow: 'hidden',
    },
    headerContainer: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.title3,
      color: theme.colors.onSurface,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.callout,
      color: theme.colors.onSurfaceVariant,
    },
    chartContainer: {
      position: 'relative',
      height: chartHeight,
      width: chartWidth,
      alignSelf: 'center',
    },
    svgContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    tooltipContainer: {
      position: 'absolute',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      ...theme.shadows.lg,
      borderWidth: 0.5,
      borderColor: theme.colors.outline,
      minWidth: 80,
      alignItems: 'center',
    },
    tooltipValue: {
      ...theme.typography.headline,
      color: primaryColor,
      fontWeight: '700',
      marginBottom: 2,
    },
    tooltipLabel: {
      ...theme.typography.caption1,
      color: theme.colors.onSurfaceVariant,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.lg,
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
    gridLine: {
      position: 'absolute',
      width: '100%',
      height: 0.5,
      backgroundColor: theme.colors.outline,
      opacity: 0.3,
    },
    yAxisLabel: {
      position: 'absolute',
      ...theme.typography.caption2,
      color: theme.colors.onSurfaceVariant,
      right: chartWidth + 8,
    },
    xAxisLabel: {
      position: 'absolute',
      ...theme.typography.caption2,
      color: theme.colors.onSurfaceVariant,
      top: chartHeight + 8,
      textAlign: 'center',
      width: 40,
      marginLeft: -20,
    },
  });

  const totalValue = data.reduce((sum, point) => sum + point.value, 0);
  const avgValue = totalValue / data.length;
  const growthRate = data.length > 1
    ? ((data[data.length - 1].value - data[0].value) / data[0].value * 100)
    : 0;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {growthRate >= 0 ? '📈' : '📉'} {Math.abs(growthRate).toFixed(1)}% this week
        </Text>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
          return (
            <View key={index} style={[styles.gridLine, { top: y }]} />
          );
        })}

        {/* Y-axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = minValue + ratio * valueRange;
          const y = chartHeight - padding - ratio * (chartHeight - padding * 2) - 8;
          return (
            <Text key={index} style={[styles.yAxisLabel, { top: y }]}>
              {formatValue(value)}
            </Text>
          );
        })}

        {/* X-axis Labels */}
        {data.map((point, index) => {
          const { x } = getPointPosition(index, point.value);
          return (
            <Text key={index} style={[styles.xAxisLabel, { left: x }]}>
              {point.label}
            </Text>
          );
        })}

        {/* SVG Chart */}
        <Animated.View style={styles.svgContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.05" />
              </SvgLinearGradient>
            </Defs>

            {/* Area Fill */}
            <Animated.View style={{ opacity: animatedValue }}>
              <Path
                d={createAreaPath()}
                fill="url(#gradient)"
              />
            </Animated.View>

            {/* Line */}
            <Animated.View style={{ opacity: animatedValue }}>
              <Path
                d={createPath()}
                stroke={primaryColor}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Animated.View>

            {/* Data Points */}
            {showIndicators && data.map((point, index) => {
              const { x, y } = getPointPosition(index, point.value);
              const isSelected = selectedPoint === index;

              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? primaryColor : theme.colors.surface}
                  stroke={primaryColor}
                  strokeWidth={isSelected ? 3 : 2}
                />
              );
            })}

            {/* Selection Line */}
            {selectedPoint !== null && (
              <Line
                x1={getPointPosition(selectedPoint, data[selectedPoint].value).x}
                y1={padding}
                x2={getPointPosition(selectedPoint, data[selectedPoint].value).x}
                y2={chartHeight - padding}
                stroke={primaryColor}
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.6"
              />
            )}
          </Svg>
        </Animated.View>

        {/* Tooltip */}
        {selectedPoint !== null && (
          <View
            style={[
              styles.tooltipContainer,
              {
                left: Math.max(10, Math.min(
                  chartWidth - 90,
                  getPointPosition(selectedPoint, data[selectedPoint].value).x - 40
                )),
                top: Math.max(10, getPointPosition(selectedPoint, data[selectedPoint].value).y - 60),
              },
            ]}
          >
            <Text style={styles.tooltipValue}>
              {formatValue(data[selectedPoint].value)}
            </Text>
            <Text style={styles.tooltipLabel}>
              {data[selectedPoint].label}
            </Text>
          </View>
        )}
      </View>

      {/* Statistics */}
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
    </Animated.View>
  );
};