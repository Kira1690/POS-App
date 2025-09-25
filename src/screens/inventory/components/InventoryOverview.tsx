import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { InventoryAnalytics, InventoryAlert } from '@/types/inventory.types';
import { theme } from '@/constants/theme';

interface InventoryOverviewProps {
  analytics: InventoryAnalytics;
  alerts: InventoryAlert[];
  onRefresh: () => void;
  onViewAlerts: () => void;
  onViewItems: () => void;
}

export default function InventoryOverview({ 
  analytics, 
  alerts, 
  onRefresh, 
  onViewAlerts, 
  onViewItems 
}: InventoryOverviewProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical' && !alert.acknowledged);
  const highAlerts = alerts.filter(alert => alert.priority === 'high' && !alert.acknowledged);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>📈 Inventory Overview</Text>
        
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.totalItemsCard]}>
            <Text style={styles.metricIcon}>📦</Text>
            <Text style={styles.metricValue}>{analytics.total_items}</Text>
            <Text style={styles.metricLabel}>Total Items</Text>
          </View>
          
          <View style={[styles.metricCard, styles.totalValueCard]}>
            <Text style={styles.metricIcon}>💰</Text>
            <Text style={[styles.metricValue, { color: theme.colors.success }]}>
              {formatCurrency(analytics.total_value)}
            </Text>
            <Text style={styles.metricLabel}>Total Value</Text>
          </View>
          
          <View style={[styles.metricCard, styles.turnoverCard]}>
            <Text style={styles.metricIcon}>🔄</Text>
            <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
              {analytics.turnover_rate.toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>Turnover Rate</Text>
          </View>
        </View>
      </View>

      {/* Stock Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>🚨 Stock Status</Text>
        
        <View style={styles.statusGrid}>
          <TouchableOpacity 
            style={[styles.statusCard, styles.lowStockCard]}
            onPress={onViewItems}
          >
            <Text style={styles.statusIcon}>⚠️</Text>
            <Text style={[styles.statusValue, { color: theme.colors.warning }]}>
              {analytics.low_stock_items}
            </Text>
            <Text style={styles.statusLabel}>Low Stock</Text>
            <Text style={styles.statusAction}>Tap to view ›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statusCard, styles.outOfStockCard]}
            onPress={onViewItems}
          >
            <Text style={styles.statusIcon}>🚫</Text>
            <Text style={[styles.statusValue, { color: theme.colors.error }]}>
              {analytics.out_of_stock_items}
            </Text>
            <Text style={styles.statusLabel}>Out of Stock</Text>
            <Text style={styles.statusAction}>Tap to view ›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statusCard, styles.expiredCard]}
            onPress={onViewItems}
          >
            <Text style={styles.statusIcon}>🗓️</Text>
            <Text style={[styles.statusValue, { color: '#9C27B0' }]}>
              {analytics.expired_items}
            </Text>
            <Text style={styles.statusLabel}>Expired</Text>
            <Text style={styles.statusAction}>Tap to view ›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsTitle}>🆘 Critical Alerts</Text>
            <TouchableOpacity onPress={onViewAlerts}>
              <Text style={styles.viewAllText}>View All ({alerts.length})</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.alertsList}>
            {criticalAlerts.slice(0, 3).map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <Text style={styles.alertIcon}>🔴</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertItemName}>{alert.item_name}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
                <Text style={styles.alertTime}>
                  {new Date(alert.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Waste Summary */}
      <View style={styles.wasteContainer}>
        <Text style={styles.sectionTitle}>🗑️ Waste This Month</Text>
        
        <View style={styles.wasteCard}>
          <View style={styles.wasteMetric}>
            <Text style={styles.wasteValue}>
              {analytics.waste_this_month.quantity} items
            </Text>
            <Text style={styles.wasteLabel}>Quantity Wasted</Text>
          </View>
          
          <View style={styles.wasteDivider} />
          
          <View style={styles.wasteMetric}>
            <Text style={[styles.wasteValue, { color: theme.colors.error }]}>
              {formatCurrency(analytics.waste_this_month.cost)}
            </Text>
            <Text style={styles.wasteLabel}>Cost Impact</Text>
          </View>
        </View>
        
        <Text style={styles.wasteNote}>
          💡 Focus on reducing waste to improve profitability
        </Text>
      </View>

      {/* Reorder Suggestions */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.sectionTitle}>📦 Reorder Suggestions</Text>
        
        <View style={styles.suggestionsList}>
          {analytics.reorder_suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Text style={styles.suggestionIcon}>📋</Text>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.generateOrderButton}>
          <Text style={styles.generateOrderText}>🚀 Generate Purchase Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Add Item</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Stock Take</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={styles.actionText}>Record Waste</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  metricsContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  totalItemsCard: {
    borderLeftColor: theme.colors.primary,
  },
  totalValueCard: {
    borderLeftColor: theme.colors.success,
  },
  turnoverCard: {
    borderLeftColor: theme.colors.warning,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statusContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  lowStockCard: {
    borderColor: theme.colors.warning,
  },
  outOfStockCard: {
    borderColor: theme.colors.error,
  },
  expiredCard: {
    borderColor: '#9C27B0',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statusAction: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  alertsContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  alertsList: {
    gap: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertItemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  alertTime: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  wasteContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  wasteCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  wasteMetric: {
    flex: 1,
    alignItems: 'center',
  },
  wasteDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 15,
  },
  wasteValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  wasteLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  wasteNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  suggestionsContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  suggestionsList: {
    marginBottom: 15,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 12,
    color: theme.colors.text,
    flex: 1,
  },
  generateOrderButton: {
    backgroundColor: theme.colors.success,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  generateOrderText: {
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});