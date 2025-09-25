import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { InventoryAlert } from '@/types/inventory.types';
import { theme } from '@/constants/theme';

interface InventoryAlertsProps {
  alerts: InventoryAlert[];
  onAcknowledge: (alertId: string) => void;
  onRefresh: () => void;
}

export default function InventoryAlerts({ alerts, onAcknowledge, onRefresh }: InventoryAlertsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#C62828';
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return '📉';
      case 'out_of_stock': return '🚫';
      case 'expired': return '🗓️';
      case 'overstock': return '📦';
      case 'reorder': return '📋';
      default: return '⚠️';
    }
  };

  const renderAlert = ({ item: alert }: { item: InventoryAlert }) => (
    <View style={[
      styles.alertCard,
      { borderLeftColor: getPriorityColor(alert.priority) },
      alert.acknowledged && styles.acknowledgedAlert
    ]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIcons}>
          <Text style={styles.priorityIcon}>{getPriorityIcon(alert.priority)}</Text>
          <Text style={styles.typeIcon}>{getAlertTypeIcon(alert.type)}</Text>
        </View>
        
        <View style={styles.alertInfo}>
          <Text style={[
            styles.alertItemName,
            alert.acknowledged && styles.acknowledgedText
          ]}>
            {alert.item_name}
          </Text>
          <Text style={[
            styles.alertType,
            { color: getPriorityColor(alert.priority) }
          ]}>
            {alert.type.replace('_', ' ').toUpperCase()} - {alert.priority.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.alertTime}>
          {new Date(alert.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      <Text style={[
        styles.alertMessage,
        alert.acknowledged && styles.acknowledgedText
      ]}>
        {alert.message}
      </Text>

      <View style={styles.alertMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Current</Text>
          <Text style={[styles.metricValue, { color: getPriorityColor(alert.priority) }]}>
            {alert.current_quantity}
          </Text>
        </View>
        
        <View style={styles.metricDivider} />
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Threshold</Text>
          <Text style={styles.metricValue}>{alert.threshold_quantity}</Text>
        </View>
        
        <View style={styles.metricDivider} />
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Difference</Text>
          <Text style={[styles.metricValue, { color: theme.colors.error }]}>
            {alert.current_quantity - alert.threshold_quantity}
          </Text>
        </View>
      </View>

      {!alert.acknowledged && (
        <TouchableOpacity
          style={[styles.acknowledgeButton, { backgroundColor: getPriorityColor(alert.priority) }]}
          onPress={() => onAcknowledge(alert.id)}
        >
          <Text style={styles.acknowledgeButtonText}>✓ Acknowledge Alert</Text>
        </TouchableOpacity>
      )}

      {alert.acknowledged && (
        <View style={styles.acknowledgedBadge}>
          <Text style={styles.acknowledgedBadgeText}>✓ Acknowledged</Text>
        </View>
      )}
    </View>
  );

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyTitle}>No Active Alerts</Text>
        <Text style={styles.emptySubtitle}>All inventory levels are within normal ranges</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{unacknowledgedAlerts.length}</Text>
          <Text style={styles.summaryLabel}>Active Alerts</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {unacknowledgedAlerts.filter(a => a.priority === 'critical').length}
          </Text>
          <Text style={styles.summaryLabel}>Critical</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {acknowledgedAlerts.length}
          </Text>
          <Text style={styles.summaryLabel}>Resolved</Text>
        </View>
      </View>

      <FlatList
        data={[...unacknowledgedAlerts, ...acknowledgedAlerts]}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        style={styles.alertsList}
        contentContainerStyle={styles.alertsContent}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  summary: {
    flexDirection: 'row',
    gap: 15,
    padding: 15,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  alertsList: {
    flex: 1,
  },
  alertsContent: {
    padding: 15,
    gap: 12,
  },
  alertCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  acknowledgedAlert: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  alertIcons: {
    flexDirection: 'row',
    marginRight: 10,
  },
  priorityIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeIcon: {
    fontSize: 14,
  },
  alertInfo: {
    flex: 1,
  },
  alertItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  alertType: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertTime: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  alertMessage: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
    marginBottom: 12,
  },
  acknowledgedText: {
    color: theme.colors.textSecondary,
  },
  alertMetrics: {
    flexDirection: 'row',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  metricDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 10,
  },
  acknowledgeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  acknowledgeButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  acknowledgedBadge: {
    backgroundColor: theme.colors.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  acknowledgedBadgeText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '600',
  },
});