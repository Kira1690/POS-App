import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardMetrics } from '@/types/reports.types';
import { theme } from '@/constants/theme';

interface MetricsDashboardProps {
  metrics: DashboardMetrics;
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
}

export default function MetricsDashboard({ metrics, selectedPeriod }: MetricsDashboardProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const getTrendIcon = (change: number) => change > 0 ? '↗️' : change < 0 ? '↘️' : '→';
  
  const getTrendColor = (change: number) => change > 0 ? theme.colors.success : 
                                          change < 0 ? theme.colors.error : 
                                          theme.colors.textSecondary;

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'weekly': return 'vs Last Week';
      case 'monthly': return 'vs Last Month';
      default: return 'vs Yesterday';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Performance</Text>
      
      <View style={styles.metricsGrid}>
        {/* Revenue Metric */}
        <View style={[styles.metricCard, styles.revenueCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricIcon}>💰</Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#2E7D32' }]}>
            {formatCurrency(metrics.today.revenue)}
          </Text>
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor(metrics.comparison.revenue_change) }]}>
              {getTrendIcon(metrics.comparison.revenue_change)} {Math.abs(metrics.comparison.revenue_change)}%
            </Text>
            <Text style={styles.comparisonText}>{getPeriodLabel()}</Text>
          </View>
        </View>

        {/* Orders Metric */}
        <View style={[styles.metricCard, styles.ordersCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricIcon}>📋</Text>
            <Text style={styles.metricLabel}>Orders</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
            {metrics.today.orders}
          </Text>
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor(metrics.comparison.orders_change) }]}>
              {getTrendIcon(metrics.comparison.orders_change)} {Math.abs(metrics.comparison.orders_change)}%
            </Text>
            <Text style={styles.comparisonText}>{getPeriodLabel()}</Text>
          </View>
        </View>

        {/* Customers Metric */}
        <View style={[styles.metricCard, styles.customersCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricIcon}>👥</Text>
            <Text style={styles.metricLabel}>Customers</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#9C27B0' }]}>
            {metrics.today.customers}
          </Text>
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor(metrics.comparison.customers_change) }]}>
              {getTrendIcon(metrics.comparison.customers_change)} {Math.abs(metrics.comparison.customers_change)}%
            </Text>
            <Text style={styles.comparisonText}>{getPeriodLabel()}</Text>
          </View>
        </View>

        {/* AOV Metric */}
        <View style={[styles.metricCard, styles.aovCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricIcon}>🧾</Text>
            <Text style={styles.metricLabel}>Avg Order</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.warning }]}>
            {formatCurrency(metrics.today.average_order_value)}
          </Text>
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor(metrics.comparison.aov_change) }]}>
              {getTrendIcon(metrics.comparison.aov_change)} {Math.abs(metrics.comparison.aov_change)}%
            </Text>
            <Text style={styles.comparisonText}>{getPeriodLabel()}</Text>
          </View>
        </View>
      </View>

      {/* Peak Hours Section */}
      <View style={styles.peakHoursSection}>
        <Text style={styles.sectionTitle}>Peak Hours Today</Text>
        <View style={styles.peakHoursList}>
          {metrics.peak_hours.map((hour, index) => (
            <View key={index} style={styles.peakHourItem}>
              <Text style={styles.peakHourTime}>{hour.hour}</Text>
              <View style={styles.peakHourStats}>
                <Text style={styles.peakHourOrders}>{hour.orders} orders</Text>
                <Text style={styles.peakHourRevenue}>{formatCurrency(hour.revenue)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightGray,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  customersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  aovCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  comparisonText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  peakHoursSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  peakHoursList: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  peakHourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  peakHourTime: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  peakHourStats: {
    alignItems: 'flex-end',
  },
  peakHourOrders: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  peakHourRevenue: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
});