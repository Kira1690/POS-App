import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SystemHealthItem } from '@/types/advanced-features.types';
import { theme } from '@/constants/theme';

interface SystemStatusPanelProps {
  systemHealth: SystemHealthItem[];
  onSystemOperation: (operation: string) => void;
}

export default function SystemStatusPanel({ systemHealth, onSystemOperation }: SystemStatusPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'offline': return theme.colors.error;
      case 'error': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Status & Controls</Text>
      
      {/* System Health */}
      <View style={styles.healthSection}>
        <Text style={styles.healthTitle}>System Health</Text>
        <View style={styles.healthItems}>
          {systemHealth.map((item, index) => (
            <View key={index} style={styles.healthItem}>
              <Text style={[styles.healthName, { color: getStatusColor(item.status) }]}>
                {item.icon} {item.name}: {item.details}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.backupButton]}
          onPress={() => onSystemOperation('backup')}
        >
          <Text style={styles.actionButtonText}>💾 Backup Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.syncButton]}
          onPress={() => onSystemOperation('sync')}
        >
          <Text style={styles.actionButtonText}>🔄 Sync Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.logsButton]}
          onPress={() => onSystemOperation('logs')}
        >
          <Text style={styles.actionButtonText}>📋 System Logs</Text>
        </TouchableOpacity>
      </View>
      
      {/* End of Day Operations */}
      <View style={styles.eodSection}>
        <Text style={styles.eodTitle}>End of Day Operations</Text>
        <View style={styles.eodActions}>
          <TouchableOpacity 
            style={styles.eodButton}
            onPress={() => onSystemOperation('close_day')}
          >
            <Text style={styles.eodButtonText}>🌅 Close Business Day</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.eodButton, styles.reportButton]}
            onPress={() => onSystemOperation('daily_report')}
          >
            <Text style={styles.eodButtonText}>📊 Generate Daily Report</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.eodButton, styles.cashButton]}
          onPress={() => onSystemOperation('cash_count')}
        >
          <Text style={styles.eodButtonText}>💰 Cash Count & Reconciliation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 380,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 350,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  healthSection: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  healthItems: {
    gap: 4,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthName: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  backupButton: {
    backgroundColor: theme.colors.success,
  },
  syncButton: {
    backgroundColor: theme.colors.primary,
  },
  logsButton: {
    backgroundColor: theme.colors.gray,
  },
  actionButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  eodSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    flex: 1,
  },
  eodTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  eodActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  eodButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  reportButton: {
    backgroundColor: '#FF7043',
  },
  cashButton: {
    backgroundColor: '#795548',
  },
  eodButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
});