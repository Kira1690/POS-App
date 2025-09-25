import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface QuickActionsPanelProps {
  onPauseNewOrders: () => void;
  onBulkAcceptPending: () => void;
  onSyncMenuItems: () => void;
  onDailyReport: () => void;
  onPlatformSettings: () => void;
}

export default function QuickActionsPanel({
  onPauseNewOrders,
  onBulkAcceptPending,
  onSyncMenuItems,
  onDailyReport,
  onPlatformSettings,
}: QuickActionsPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.pauseButton} onPress={onPauseNewOrders}>
          <Text style={styles.pauseButtonText}>⏸️ Pause New Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptButton} onPress={onBulkAcceptPending}>
          <Text style={styles.acceptButtonText}>✅ Accept All Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.syncButton} onPress={onSyncMenuItems}>
          <Text style={styles.syncButtonText}>🔄 Sync Menu Items</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton} onPress={onDailyReport}>
          <Text style={styles.reportButtonText}>📊 Daily Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsButton} onPress={onPlatformSettings}>
          <Text style={styles.settingsButtonText}>⚙️ Platform Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 12,
    padding: 20,
    margin: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pauseButton: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  pauseButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 130,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  syncButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  syncButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: theme.colors.gray,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 110,
  },
  reportButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 130,
  },
  settingsButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});