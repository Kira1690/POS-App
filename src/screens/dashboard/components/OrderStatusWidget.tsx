/**
 * OrderStatusWidget - Real-time order status overview
 *
 * Features:
 * - Visual status breakdown with progress bars
 * - Live order counts by status
 * - Quick navigation to order management
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface OrderStatusCounts {
  pending: number;
  preparing: number;
  ready: number;
  served: number;
  completed: number;
  cancelled: number;
}

export interface OrderStatusWidgetProps {
  counts: OrderStatusCounts;
  loading?: boolean;
  onViewAll?: () => void;
  onStatusPress?: (status: keyof OrderStatusCounts) => void;
}

interface StatusConfig {
  key: keyof OrderStatusCounts;
  label: string;
  icon: string;
  color: string;
}

export const OrderStatusWidget: React.FC<OrderStatusWidgetProps> = ({
  counts,
  loading = false,
  onViewAll,
  onStatusPress,
}) => {
  const { theme } = useTheme();

  const statusConfigs: StatusConfig[] = useMemo(() => [
    { key: 'pending', label: 'Pending', icon: 'clock-outline', color: theme.colors.warning },
    { key: 'preparing', label: 'Preparing', icon: 'chef-hat', color: theme.colors.info },
    { key: 'ready', label: 'Ready', icon: 'check-circle-outline', color: theme.colors.success },
    { key: 'served', label: 'Served', icon: 'room-service-outline', color: theme.colors.primary },
    { key: 'completed', label: 'Completed', icon: 'check-all', color: '#4CAF50' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline', color: theme.colors.error },
  ], [theme]);

  const totalOrders = useMemo(() => {
    return counts.pending + counts.preparing + counts.ready + counts.served;
  }, [counts]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
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
      marginBottom: theme.spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
    },
    totalBadge: {
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    totalText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    viewAllText: {
      ...theme.typography.body2,
      color: theme.colors.primary,
    },
    statusGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -theme.spacing.xs,
    },
    statusItem: {
      width: '33.33%',
      paddingHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    statusCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      alignItems: 'center',
    },
    statusIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    statusCount: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    statusLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    progressSection: {
      marginTop: theme.spacing.sm,
    },
    progressLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    progressSegment: {
      height: '100%',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl,
    },
    loadingText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginTop: theme.spacing.sm,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Order Status</Text>
        </View>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Loading order data...</Text>
        </View>
      </View>
    );
  }

  const activeStatuses = statusConfigs.filter(
    (config) => !['completed', 'cancelled'].includes(config.key)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Order Status</Text>
          {totalOrders > 0 && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>{totalOrders} Active</Text>
            </View>
          )}
        </View>
        {onViewAll && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Grid */}
      <View style={styles.statusGrid}>
        {statusConfigs.map((config) => (
          <View key={config.key} style={styles.statusItem}>
            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => onStatusPress?.(config.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.statusIconContainer,
                  { backgroundColor: `${config.color}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={config.icon as any}
                  size={20}
                  color={config.color}
                />
              </View>
              <Text style={styles.statusCount}>{counts[config.key]}</Text>
              <Text style={styles.statusLabel}>{config.label}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Progress Bar */}
      {totalOrders > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Active Order Distribution</Text>
          <View style={styles.progressBar}>
            {activeStatuses.map((config) => {
              const percentage = (counts[config.key] / totalOrders) * 100;
              if (percentage === 0) return null;
              return (
                <View
                  key={config.key}
                  style={[
                    styles.progressSegment,
                    {
                      width: `${percentage}%`,
                      backgroundColor: config.color,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderStatusWidget;
