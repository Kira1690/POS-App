import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SimpleChart } from './SimpleChart';
import { ChartDatasets } from '@/types/dashboard.types';
import { MockAnalyticsService } from '@/services/analytics/MockAnalyticsService';

interface ChartsSectionProps {
  restaurantId: string;
  loading?: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  restaurantId,
  loading = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },

    periodSelector: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: 4,
      marginBottom: theme.spacing.md,
    },

    periodButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },

    periodButtonActive: {
      backgroundColor: theme.colors.primary,
    },

    periodButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontWeight: '500',
    },

    periodButtonTextActive: {
      color: theme.colors.onSurfaceOnPrimary,
    },

    chartsGrid: {
      flexDirection: 'row',
    },

    chartColumn: {
      width: 300,
      marginRight: theme.spacing.md,
    },

    hourlyChartContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      height: 180,
    },

    hourlyChartTitle: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },

    hourlyBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 120,
      paddingBottom: 20,
    },

    hourlyBarContainer: {
      alignItems: 'center',
      marginHorizontal: 2,
      width: 20,
    },

    hourlyBarWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
    },

    hourlyBar: {
      width: '100%',
      borderRadius: 1,
      minHeight: 2,
    },

    hourlyLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 8,
      marginTop: 4,
    },

    // Loading states
    loadingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    loadingChart: {
      width: '48%',
      height: 180,
      backgroundColor: theme.colors.outlineLight,
      borderRadius: theme.borderRadius.md,
      opacity: 0.5,
    },
  });

  const [chartData, setChartData] = useState<ChartDatasets | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [chartLoading, setChartLoading] = useState(true);

  const analyticsService = MockAnalyticsService.getInstance();

  /**
   * Load chart data
   */
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setChartLoading(true);
        const data = await analyticsService.getChartData(restaurantId, period);
        setChartData(data);
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setChartLoading(false);
      }
    };

    loadChartData();
  }, [restaurantId, period, analyticsService]);

  if (loading || chartLoading || !chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Analytics Overview</Text>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingChart} />
          <View style={styles.loadingChart} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Analytics Overview</Text>
      
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['today', 'week', 'month'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(p as 'today' | 'week' | 'month')}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === p && styles.periodButtonTextActive,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Charts Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartsGrid}>
          <View style={styles.chartColumn}>
            <SimpleChart
              data={chartData.salesTrend}
              title="Sales Trend"
              color={theme.colors.success}
              height={180}
            />
            
            <SimpleChart
              data={chartData.orderTrend}
              title="Order Volume"
              color={theme.colors.info}
              height={180}
            />
          </View>

          <View style={styles.chartColumn}>
            <SimpleChart
              data={chartData.revenueTrend}
              title="Revenue Trend"
              color={theme.colors.info}
              height={180}
            />

            {/* Hourly Performance Chart */}
            <View style={styles.hourlyChartContainer}>
              <Text style={styles.hourlyChartTitle}>Today's Hourly Performance</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.hourlyBars}>
                  {chartData.hourlyData.map((hour, index) => {
                    const maxHourly = Math.max(...chartData.hourlyData.map(h => h.sales));
                    const barHeight = (hour.sales / maxHourly) * 120;
                    
                    return (
                      <View key={index} style={styles.hourlyBarContainer}>
                        <View style={styles.hourlyBarWrapper}>
                          <View
                            style={[
                              styles.hourlyBar,
                              {
                                height: Math.max(barHeight, 2),
                                backgroundColor: hour.sales > maxHourly * 0.7
                                  ? theme.colors.success
                                  : hour.sales > maxHourly * 0.4
                                  ? theme.colors.warning
                                  : theme.colors.onSurfaceLight,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.hourlyLabel}>
                          {hour.hour.toString().padStart(2, '0')}h
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};