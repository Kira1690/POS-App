import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SimpleChart } from './SimpleChart';
import { ProfessionalTheme } from '@/constants/theme';
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
              color={ProfessionalTheme.colors.success}
              height={180}
            />
            
            <SimpleChart
              data={chartData.orderTrend}
              title="Order Volume"
              color={ProfessionalTheme.colors.info}
              height={180}
            />
          </View>

          <View style={styles.chartColumn}>
            <SimpleChart
              data={chartData.revenueTrend}
              title="Revenue Trend"
              color={ProfessionalTheme.colors.chart.accent}
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
                                  ? ProfessionalTheme.colors.success
                                  : hour.sales > maxHourly * 0.4
                                  ? ProfessionalTheme.colors.warning
                                  : ProfessionalTheme.colors.textLight,
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ProfessionalTheme.spacing.md,
    marginBottom: ProfessionalTheme.spacing.lg,
  },

  sectionTitle: {
    ...ProfessionalTheme.typography.h4,
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.md,
  },

  periodSelector: {
    flexDirection: 'row',
    backgroundColor: ProfessionalTheme.colors.surfaceLight,
    borderRadius: ProfessionalTheme.borderRadius.md,
    padding: 4,
    marginBottom: ProfessionalTheme.spacing.md,
  },

  periodButton: {
    flex: 1,
    paddingVertical: ProfessionalTheme.spacing.sm,
    paddingHorizontal: ProfessionalTheme.spacing.md,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    alignItems: 'center',
  },

  periodButtonActive: {
    backgroundColor: ProfessionalTheme.colors.primary,
  },

  periodButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontWeight: '500',
  },

  periodButtonTextActive: {
    color: ProfessionalTheme.colors.textOnPrimary,
  },

  chartsGrid: {
    flexDirection: 'row',
  },

  chartColumn: {
    width: 300,
    marginRight: ProfessionalTheme.spacing.md,
  },

  hourlyChartContainer: {
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.md,
    padding: ProfessionalTheme.spacing.md,
    ...ProfessionalTheme.shadows.sm,
    height: 180,
  },

  hourlyChartTitle: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.sm,
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
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
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
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: ProfessionalTheme.borderRadius.md,
    opacity: 0.5,
  },
});