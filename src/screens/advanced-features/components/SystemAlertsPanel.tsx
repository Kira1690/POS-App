import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SystemAlert } from '@/types/advanced-features.types';
import { theme } from '@/constants/theme';

interface SystemAlertsPanelProps {
  alerts: SystemAlert[];
  onAcknowledge: (alertId: string) => void;
}

export default function SystemAlertsPanel({ alerts, onAcknowledge }: SystemAlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return '#C62828';
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.primary;
      case 'success': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getAlertBackgroundColor = (type: string) => {
    switch (type) {
      case 'error': return '#FFEBEE';
      case 'warning': return '#FFF3E0';
      case 'info': return '#E3F2FD';
      case 'success': return '#E8F5E8';
      default: return theme.colors.lightGray;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Alerts</Text>
        <View style={styles.alertCount}>
          <Text style={styles.alertCountText}>
            {unacknowledgedAlerts.length} Active
          </Text>
        </View>
      </View>

      <ScrollView style={styles.alertsList} nestedScrollEnabled>
        {/* Unacknowledged Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <View style={styles.alertSection}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {unacknowledgedAlerts.map((alert) => (
              <View 
                key={alert.id} 
                style={[
                  styles.alertItem,
                  { 
                    backgroundColor: getAlertBackgroundColor(alert.type),
                    borderLeftColor: getAlertColor(alert.type)
                  }
                ]}
              >
                <View style={styles.alertContent}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                    <Text style={[styles.alertTitle, { color: getAlertColor(alert.type) }]}>
                      {alert.title}
                    </Text>
                    <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
                  </View>
                  
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  
                  {alert.source && (
                    <Text style={styles.alertSource}>Source: {alert.source}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.acknowledgeButton, { backgroundColor: getAlertColor(alert.type) }]}
                  onPress={() => onAcknowledge(alert.id)}
                >
                  <Text style={styles.acknowledgeButtonText}>✓ Ack</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <View style={styles.alertSection}>
            <Text style={styles.sectionTitle}>Recent (Acknowledged)</Text>
            {acknowledgedAlerts.slice(0, 5).map((alert) => (
              <View 
                key={alert.id} 
                style={[
                  styles.alertItem,
                  styles.acknowledgedAlertItem,
                  { borderLeftColor: getAlertColor(alert.type) }
                ]}
              >
                <View style={styles.alertContent}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                    <Text style={[styles.alertTitle, styles.acknowledgedAlertTitle]}>
                      {alert.title}
                    </Text>
                    <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
                  </View>
                  
                  <Text style={[styles.alertMessage, styles.acknowledgedAlertMessage]}>
                    {alert.message}
                  </Text>
                </View>

                <View style={styles.acknowledgedBadge}>
                  <Text style={styles.acknowledgedBadgeText}>✓</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Alerts */}
        {alerts.length === 0 && (
          <View style={styles.noAlertsContainer}>
            <Text style={styles.noAlertsIcon}>✅</Text>
            <Text style={styles.noAlertsText}>All systems operating normally</Text>
            <Text style={styles.noAlertsSubtext}>No active alerts or warnings</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>📋 View All Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionButton, styles.refreshButton]}>
          <Text style={styles.quickActionText}>🔄 Refresh Alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionButton, styles.settingsButton]}>
          <Text style={styles.quickActionText}>⚙️ Alert Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  alertCount: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertCountText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  alertsList: {
    flex: 1,
    marginBottom: 15,
  },
  alertSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  alertItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  acknowledgedAlertItem: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  alertContent: {
    flex: 1,
    marginRight: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  alertTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  acknowledgedAlertTitle: {
    color: theme.colors.textSecondary,
  },
  alertTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  alertMessage: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: 4,
  },
  acknowledgedAlertMessage: {
    color: theme.colors.textSecondary,
  },
  alertSource: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  acknowledgeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  acknowledgeButtonText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: '600',
  },
  acknowledgedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  acknowledgedBadgeText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noAlertsIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  noAlertsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginBottom: 4,
  },
  noAlertsSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.gray,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
  },
  settingsButton: {
    backgroundColor: theme.colors.warning,
  },
  quickActionText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: '600',
  },
});