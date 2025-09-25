import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlatformStatus } from '@/types/online-orders.types';
import { theme } from '@/constants/theme';

interface PlatformStatusBarProps {
  statuses: PlatformStatus[];
}

export default function PlatformStatusBar({ statuses }: PlatformStatusBarProps) {
  const getStatusColor = (status: PlatformStatus) => {
    if (!status.connected) return theme.colors.error;
    switch (status.status) {
      case 'online': return theme.colors.success;
      case 'paused': return theme.colors.warning;
      case 'offline': return theme.colors.error;
      case 'error': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: PlatformStatus) => {
    if (!status.connected) return '🔴';
    switch (status.status) {
      case 'online': return '🟢';
      case 'paused': return '🟡';
      case 'offline': return '🔴';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'ubereats': return 'UberEats';
      case 'doordash': return 'DoorDash';
      case 'grubhub': return 'GrubHub';
      case 'postmates': return 'Postmates';
      default: return platform;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Status</Text>
      <View style={styles.statusGrid}>
        {statuses.map((status) => (
          <View key={status.platform} style={styles.statusItem}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {getStatusIcon(status)} {getPlatformName(status.platform)}
            </Text>
            {status.connected && (
              <Text style={styles.orderCount}>
                {status.daily_orders} orders today
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderCount: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
});