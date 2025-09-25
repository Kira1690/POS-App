import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SalesReport } from '@/types/reports.types';
import { theme } from '@/constants/theme';

interface SalesReportCardProps {
  report: SalesReport;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export default function SalesReportCard({ report, onExport }: SalesReportCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const getOrderTypePercentage = (type: keyof typeof report.orders, total: number) => {
    return total > 0 ? ((report.orders[type] / total) * 100).toFixed(1) : '0.0';
  };

  const getRevenueTypePercentage = (type: keyof typeof report.revenue, total: number) => {
    return total > 0 ? ((report.revenue[type] / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>📊 Sales Report</Text>
          <Text style={styles.period}>{report.period.toUpperCase()} • {report.date}</Text>
        </View>
        <View style={styles.exportButtons}>
          <TouchableOpacity 
            style={[styles.exportButton, styles.pdfButton]}
            onPress={() => onExport('pdf')}
          >
            <Text style={styles.exportButtonText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.exportButton, styles.excelButton]}
            onPress={() => onExport('excel')}
          >
            <Text style={styles.exportButtonText}>Excel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Revenue Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {formatCurrency(report.revenue.total)}
              </Text>
            </View>
          </View>
          
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>💵</Text>
              <View style={styles.breakdownContent}>
                <Text style={styles.breakdownLabel}>Cash</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(report.revenue.cash)}
                </Text>
                <Text style={styles.breakdownPercentage}>
                  {getRevenueTypePercentage('cash', report.revenue.total)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>💳</Text>
              <View style={styles.breakdownContent}>
                <Text style={styles.breakdownLabel}>Card</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(report.revenue.card)}
                </Text>
                <Text style={styles.breakdownPercentage}>
                  {getRevenueTypePercentage('card', report.revenue.total)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🌐</Text>
              <View style={styles.breakdownContent}>
                <Text style={styles.breakdownLabel}>Online</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(report.revenue.online)}
                </Text>
                <Text style={styles.breakdownPercentage}>
                  {getRevenueTypePercentage('online', report.revenue.total)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Orders Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders Analysis</Text>
          <View style={styles.ordersGrid}>
            <View style={styles.ordersStat}>
              <Text style={styles.ordersIcon}>📋</Text>
              <Text style={styles.ordersValue}>{report.orders.total}</Text>
              <Text style={styles.ordersLabel}>Total Orders</Text>
            </View>
            
            <View style={styles.ordersStat}>
              <Text style={styles.ordersIcon}>🍽️</Text>
              <Text style={styles.ordersValue}>{report.orders.dine_in}</Text>
              <Text style={styles.ordersLabel}>Dine-In</Text>
              <Text style={styles.ordersPercentage}>
                {getOrderTypePercentage('dine_in', report.orders.total)}%
              </Text>
            </View>
            
            <View style={styles.ordersStat}>
              <Text style={styles.ordersIcon}>🥡</Text>
              <Text style={styles.ordersValue}>{report.orders.takeout}</Text>
              <Text style={styles.ordersLabel}>Takeout</Text>
              <Text style={styles.ordersPercentage}>
                {getOrderTypePercentage('takeout', report.orders.total)}%
              </Text>
            </View>
            
            <View style={styles.ordersStat}>
              <Text style={styles.ordersIcon}>🚚</Text>
              <Text style={styles.ordersValue}>{report.orders.delivery}</Text>
              <Text style={styles.ordersLabel}>Delivery</Text>
              <Text style={styles.ordersPercentage}>
                {getOrderTypePercentage('delivery', report.orders.total)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Average Order Value</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(report.metrics.average_order_value)}
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Orders/Hour</Text>
              <Text style={styles.metricValue}>{report.metrics.orders_per_hour}</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Peak Hour</Text>
              <Text style={styles.metricValue}>{report.metrics.peak_hour}</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Customers</Text>
              <Text style={styles.metricValue}>{report.metrics.customer_count}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  period: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pdfButton: {
    backgroundColor: '#E53E3E',
  },
  excelButton: {
    backgroundColor: '#38A169',
  },
  exportButtonText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  breakdownItem: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  breakdownIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  breakdownContent: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  breakdownPercentage: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  ordersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ordersStat: {
    flex: 1,
    minWidth: 80,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  ordersIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  ordersValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  ordersLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  ordersPercentage: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});