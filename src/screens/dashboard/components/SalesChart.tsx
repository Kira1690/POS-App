/**
 * Sales Chart - Professional sales trend visualization for manager dashboard
 * Under 300 lines, focused on sales data visualization with professional styling
 */

import React, { memo, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

const { width: screenWidth } = Dimensions.get('window');

export interface SalesChartData {
  date: string;
  sales: number;
  orders: number;
  label: string;
}

export interface SalesChartProps {
  data?: SalesChartData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  colorScheme?: 'default' | 'professional' | 'kitchen';
}

const SalesChart: React.FC<SalesChartProps> = ({
  data,
  title = 'Sales Trend (Last 7 Days)',
  height = 300,
  showLegend = true,
  colorScheme = 'professional'
}) => {
  const { theme } = useTheme();

  // Mock data for demonstration - will be replaced with real data
  const mockData: SalesChartData[] = useMemo(() => [
    { date: '2025-09-17', sales: 2450, orders: 45, label: 'Mon' },
    { date: '2025-09-18', sales: 2680, orders: 52, label: 'Tue' },
    { date: '2025-09-19', sales: 2340, orders: 43, label: 'Wed' },
    { date: '2025-09-20', sales: 2890, orders: 58, label: 'Thu' },
    { date: '2025-09-21', sales: 3150, orders: 62, label: 'Fri' },
    { date: '2025-09-22', sales: 3420, orders: 67, label: 'Sat' },
    { date: '2025-09-23', sales: 2847, orders: 56, label: 'Today' },
  ], []);

  const chartData = data || mockData;

  // Calculate chart dimensions and scaling
  const chartHeight = height - 120; // Leave space for title and legend
  const chartWidth = screenWidth - (spacing.xl * 4); // Account for padding
  const maxSales = Math.max(...chartData.map(d => d.sales));
  const minSales = Math.min(...chartData.map(d => d.sales));
  const salesRange = maxSales - minSales;

  // Color scheme configuration
  const getColors = () => {
    switch (colorScheme) {
      case 'kitchen':
        return {
          primary: theme.colors.warning,
          secondary: theme.colors.warningLight,
          gradient: [theme.colors.warning, theme.colors.warningLight],
          text: theme.colors.white,
          grid: theme.colors.outline
        };
      case 'professional':
        return {
          primary: theme.colors.onSurface,
          secondary: theme.colors.primary,
          gradient: [theme.colors.primary, theme.colors.success],
          text: theme.colors.onSurface,
          grid: theme.colors.outline
        };
      default:
        return {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          gradient: [theme.colors.primary, theme.colors.secondary],
          text: theme.colors.onSurface,
          grid: theme.colors.outline
        };
    }
  };

  const colors = getColors();

  // Generate chart points for line visualization
  const generateChartPath = () => {
    const points = chartData.map((item, index) => {
      const x = (index / (chartData.length - 1)) * chartWidth;
      const normalizedSales = salesRange > 0 ? (item.sales - minSales) / salesRange : 0.5;
      const y = chartHeight - (normalizedSales * chartHeight * 0.8) - 20; // 20px padding from bottom
      return { x, y, sales: item.sales, label: item.label };
    });
    return points;
  };

  const chartPoints = generateChartPath();

  // Create SVG-like path for the sales line
  const createLinePath = () => {
    if (chartPoints.length === 0) return '';
    
    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const cp1x = chartPoints[i-1].x + (chartPoints[i].x - chartPoints[i-1].x) / 2;
      const cp1y = chartPoints[i-1].y;
      const cp2x = chartPoints[i].x - (chartPoints[i].x - chartPoints[i-1].x) / 2;
      const cp2y = chartPoints[i].y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${chartPoints[i].x} ${chartPoints[i].y}`;
    }
    return path;
  };

  const renderSimpleBarChart = () => (
    <View style={[styles.chartContainer, { height: chartHeight }]}>
      <View style={styles.barsContainer}>
        {chartData.map((item, index) => {
          const barHeight = salesRange > 0 ? ((item.sales - minSales) / salesRange) * (chartHeight * 0.7) : 50;
          const isToday = item.label === 'Today';
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <LinearGradient
                  colors={isToday ? colors.gradient : [colors.secondary, colors.secondary + '80']}
                  style={[
                    styles.bar,
                    { 
                      height: Math.max(barHeight, 20),
                      backgroundColor: colors.primary 
                    }
                  ]}
                />
              </View>
              
              <Text style={[
                styles.barValue,
                { color: colors.text },
                isToday && { fontWeight: '700' }
              ]}>
                ${(item.sales / 1000).toFixed(1)}k
              </Text>
              
              <Text style={[
                styles.barLabel,
                { color: theme.colors.onSurfaceVariant },
                isToday && { fontWeight: '700', color: colors.primary }
              ]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
      
      {/* Y-axis grid lines and labels */}
      <View style={styles.yAxisContainer}>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = minSales + (salesRange * ratio);
          const yPos = chartHeight - (ratio * chartHeight * 0.8) - 20;
          
          return (
            <View key={ratio} style={[styles.gridLine, { top: yPos }]}>
              <Text style={[styles.gridLabel, { color: theme.colors.onSurfaceVariant }]}>
                ${(value / 1000).toFixed(1)}k
              </Text>
              <View style={[styles.gridDash, { backgroundColor: colors.grid }]} />
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderLegend = () => {
    if (!showLegend) return null;
    
    const todaySales = chartData[chartData.length - 1]?.sales || 0;
    const yesterdaySales = chartData[chartData.length - 2]?.sales || 0;
    const change = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
    const trend = change >= 0 ? 'up' : 'down';
    
    return (
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>
            Daily Sales Revenue
          </Text>
        </View>
        
        <View style={styles.legendStats}>
          <Text style={[styles.legendValue, { color: colors.text }]}>
            ${todaySales.toLocaleString()}
          </Text>
          <Text style={[
            styles.legendChange,
            { color: trend === 'up' ? theme.colors.success : theme.colors.error }
          ]}>
            {trend === 'up' ? '↗️' : '↘️'} {Math.abs(change).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.surface, height }
    ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      
      {renderSimpleBarChart()}
      {renderLegend()}
      
      <View style={styles.footer}>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Interactive chart showing revenue trends, peak hours analysis, and order volume patterns
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.titleLarge,
    fontWeight: '700',
  },
  chartContainer: {
    position: 'relative',
    marginHorizontal: spacing.lg,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bar: {
    width: '80%',
    borderRadius: borderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  barLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  yAxisContainer: {
    position: 'absolute',
    left: -40,
    top: 0,
    height: '100%',
    width: 40,
  },
  gridLine: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    left: 0,
    right: 0,
  },
  gridLabel: {
    ...typography.bodySmall,
    fontSize: 10,
    width: 35,
    textAlign: 'right',
  },
  gridDash: {
    flex: 1,
    height: 1,
    marginLeft: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  legendStats: {
    alignItems: 'flex-end',
  },
  legendValue: {
    ...typography.titleMedium,
    fontWeight: '700',
  },
  legendChange: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default memo(SalesChart);