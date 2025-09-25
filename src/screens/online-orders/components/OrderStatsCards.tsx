import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnlineOrderStats, PlatformStatus } from '@/types/online-orders.types';
import { theme } from '@/constants/theme';

interface OrderStatsCardsProps {
  stats: OnlineOrderStats;
  platformStatuses: PlatformStatus[];
}

export default function OrderStatsCards({ stats, platformStatuses }: OrderStatsCardsProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const getPlatformStatusIcon = (status: PlatformStatus) => {
    if (!status.connected) return '🔴';
    switch (status.status) {
      case 'online': return '🟢';
      case 'paused': return '🟡';
      case 'offline': return '🔴';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Stats Cards */}
      <View style={styles.statsRow}>
        {/* Active Orders */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, styles.activeIcon]}>
            <Text style={styles.iconText}>📱</Text>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.active_orders}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
        </View>

        {/* Ready for Pickup */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, styles.pickupIcon]}>
            <Text style={styles.iconText}>⏱️</Text>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.ready_for_pickup}</Text>
            <Text style={styles.statLabel}>Ready for Pickup</Text>
          </View>
        </View>

        {/* Out for Delivery */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, styles.deliveryIcon]}>
            <Text style={styles.iconText}>🚗</Text>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.out_for_delivery}</Text>
            <Text style={styles.statLabel}>Out for Delivery</Text>
          </View>
        </View>

        {/* Today's Revenue */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, styles.revenueIcon]}>
            <Text style={styles.iconText}>💰</Text>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{formatCurrency(stats.todays_revenue)}</Text>
            <Text style={styles.statLabel}>Today's Online Revenue</Text>
          </View>
        </View>
      </View>

      {/* Platform Status Card */}
      <View style={styles.platformCard}>
        <Text style={styles.platformTitle}>Platform Status</Text>
        <View style={styles.platformStatuses}>
          <View style={styles.platformColumn}>
            {platformStatuses.slice(0, 2).map((platform) => (
              <Text key={platform.platform} style={styles.platformStatus}>
                {getPlatformStatusIcon(platform)} {platform.platform === 'ubereats' ? 'UberEats' : 
                 platform.platform === 'doordash' ? 'DoorDash' : 
                 platform.platform === 'grubhub' ? 'GrubHub' : 
                 platform.platform === 'postmates' ? 'Postmates' : platform.platform}
              </Text>
            ))}
          </View>
          <View style={styles.platformColumn}>
            {platformStatuses.slice(2).map((platform) => (
              <Text key={platform.platform} style={styles.platformStatus}>
                {getPlatformStatusIcon(platform)} {platform.platform === 'ubereats' ? 'UberEats' : 
                 platform.platform === 'doordash' ? 'DoorDash' : 
                 platform.platform === 'grubhub' ? 'GrubHub' : 
                 platform.platform === 'postmates' ? 'Postmates' : platform.platform}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightGray,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
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
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeIcon: {
    backgroundColor: theme.colors.primary,
  },
  pickupIcon: {
    backgroundColor: theme.colors.warning,
  },
  deliveryIcon: {
    backgroundColor: theme.colors.success,
  },
  revenueIcon: {
    backgroundColor: '#2E7D32',
  },
  iconText: {
    fontSize: 16,
    color: theme.colors.white,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  platformCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  platformTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  platformStatuses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformColumn: {
    flex: 1,
    gap: 5,
  },
  platformStatus: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});