import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ManagerPerformanceMetrics, SystemAlert } from '@/types/advanced-features.types';
import { theme } from '@/constants/theme';

interface PerformanceMetricsCardsProps {
  metrics: ManagerPerformanceMetrics;
  alerts: SystemAlert[];
  onViewAlerts: () => void;
}

export default function PerformanceMetricsCards({ 
  metrics, 
  alerts, 
  onViewAlerts 
}: PerformanceMetricsCardsProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const getTrendIcon = (trend: number) => trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→';
  
  const getTrendColor = (trend: number) => trend > 0 ? theme.colors.success : 
                                        trend < 0 ? theme.colors.error : 
                                        theme.colors.textSecondary;

  return (
    <View style={styles.container}>
      <View style={styles.metricsRow}>
        {/* Revenue Card */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, styles.revenueIcon]}>
            <Text style={styles.iconText}>💰</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={[styles.metricNumber, { color: '#2E7D32' }]}>
              {formatCurrency(metrics.todays_revenue)}
            </Text>
            <Text style={[styles.trendText, { color: getTrendColor(metrics.revenue_trend) }]}>
              {getTrendIcon(metrics.revenue_trend)} {Math.abs(metrics.revenue_trend)}%
            </Text>
            <Text style={styles.metricLabel}>Today's Revenue</Text>
          </View>
        </View>

        {/* Orders Card */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, styles.ordersIcon]}>
            <Text style={styles.iconText}>📊</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={[styles.metricNumber, { color: theme.colors.primary }]}>
              {metrics.orders_processed}
            </Text>
            <Text style={[styles.trendText, { color: getTrendColor(metrics.orders_trend) }]}>
              {getTrendIcon(metrics.orders_trend)} {Math.abs(metrics.orders_trend)}%
            </Text>
            <Text style={styles.metricLabel}>Orders Processed</Text>
          </View>
        </View>

        {/* Service Time Card */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, styles.timeIcon]}>
            <Text style={styles.iconText}>⏱️</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={[styles.metricNumber, { color: theme.colors.warning }]}>
              {metrics.avg_service_time}
            </Text>
            <Text style={[styles.trendText, { color: getTrendColor(metrics.service_time_trend) }]}>
              {getTrendIcon(metrics.service_time_trend)} {Math.abs(metrics.service_time_trend)}%
            </Text>
            <Text style={styles.metricLabel}>Avg Service Time</Text>
          </View>
        </View>

        {/* Staff Card */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, styles.staffIcon]}>
            <Text style={styles.iconText}>👥</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={[styles.metricNumber, { color: '#9C27B0' }]}>
              {metrics.staff_on_duty}
            </Text>
            <Text style={styles.staffTotal}>
              / {metrics.total_staff} Staff
            </Text>
            <Text style={styles.metricLabel}>Currently On-Duty</Text>
          </View>
        </View>

        {/* Alerts Card */}
        <View style={[styles.metricCard, styles.alertsCard]}>
          <View style={[styles.metricIcon, styles.alertsIcon]}>
            <Text style={styles.iconText}>⚠️</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={[styles.metricNumber, { color: theme.colors.warning }]}>
              {metrics.active_alerts}
            </Text>
            <Text style={styles.metricLabel}>Active Alerts</Text>
          </View>
          <TouchableOpacity style={styles.viewAlertsButton} onPress={onViewAlerts}>
            <Text style={styles.viewAlertsText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightGray,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertsCard: {
    backgroundColor: '#FFF3E0',
    borderColor: theme.colors.warning,
    borderWidth: 2,
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  revenueIcon: {
    backgroundColor: '#2E7D32',
  },
  ordersIcon: {
    backgroundColor: theme.colors.primary,
  },
  timeIcon: {
    backgroundColor: theme.colors.warning,
  },
  staffIcon: {
    backgroundColor: '#9C27B0',
  },
  alertsIcon: {
    backgroundColor: theme.colors.warning,
  },
  iconText: {
    fontSize: 16,
    color: theme.colors.white,
  },
  metricContent: {
    flex: 1,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  staffTotal: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  viewAlertsButton: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewAlertsText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '600',
  },
});