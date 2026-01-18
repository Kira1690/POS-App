/**
 * KitchenQueueWidget - Kitchen ticket queue overview
 *
 * Features:
 * - Station-based ticket counts
 * - Priority tickets highlight
 * - Average wait time display
 * - Quick navigation to kitchen display
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

export interface StationQueue {
  station: string;
  displayName: string;
  pendingCount: number;
  inProgressCount: number;
  avgWaitMinutes: number;
}

export interface KitchenQueueWidgetProps {
  stations: StationQueue[];
  totalPending: number;
  totalInProgress: number;
  priorityCount: number;
  loading?: boolean;
  onViewKitchen?: () => void;
  onStationPress?: (station: string) => void;
}

const STATION_ICONS: Record<string, string> = {
  hot_kitchen: 'fire',
  cold_kitchen: 'snowflake',
  grill: 'grill',
  desserts: 'cupcake',
  beverages: 'cup',
  bar: 'glass-cocktail',
  default: 'silverware-fork-knife',
};

export const KitchenQueueWidget: React.FC<KitchenQueueWidgetProps> = ({
  stations,
  totalPending,
  totalInProgress,
  priorityCount,
  loading = false,
  onViewKitchen,
  onStationPress,
}) => {
  const { theme } = useTheme();

  const maxWaitStation = useMemo(() => {
    if (stations.length === 0) return null;
    return stations.reduce((max, station) =>
      station.avgWaitMinutes > max.avgWaitMinutes ? station : max
    );
  }, [stations]);

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
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    viewButtonText: {
      ...theme.typography.body2,
      color: theme.colors.primary,
    },
    summaryRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      alignItems: 'center',
    },
    summaryValue: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    summaryLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    summaryCardPriority: {
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    summaryValuePriority: {
      color: theme.colors.error,
    },
    stationList: {
      gap: theme.spacing.xs,
    },
    stationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
    },
    stationIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    stationInfo: {
      flex: 1,
    },
    stationName: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    stationStats: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    stationWait: {
      alignItems: 'flex-end',
    },
    waitTime: {
      ...theme.typography.body2,
      color: theme.colors.warning,
      fontWeight: '600',
    },
    waitLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    waitTimeHigh: {
      color: theme.colors.error,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    emptyIcon: {
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
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
          <Text style={styles.title}>Kitchen Queue</Text>
        </View>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Loading kitchen data...</Text>
        </View>
      </View>
    );
  }

  const getStationIcon = (station: string) => {
    return STATION_ICONS[station] || STATION_ICONS.default;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="chef-hat"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>Kitchen Queue</Text>
        </View>
        {onViewKitchen && (
          <TouchableOpacity style={styles.viewButton} onPress={onViewKitchen}>
            <Text style={styles.viewButtonText}>View Kitchen</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalPending}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalInProgress}</Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>
        <View style={[styles.summaryCard, priorityCount > 0 && styles.summaryCardPriority]}>
          <Text style={[styles.summaryValue, priorityCount > 0 && styles.summaryValuePriority]}>
            {priorityCount}
          </Text>
          <Text style={styles.summaryLabel}>Priority</Text>
        </View>
      </View>

      {/* Station List */}
      {stations.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="check-circle"
            size={40}
            color={theme.colors.success}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>Kitchen is clear</Text>
        </View>
      ) : (
        <View style={styles.stationList}>
          {stations.map((station) => {
            const isHighWait = station.avgWaitMinutes > 15;
            return (
              <TouchableOpacity
                key={station.station}
                style={styles.stationRow}
                onPress={() => onStationPress?.(station.station)}
                activeOpacity={0.7}
              >
                <View style={styles.stationIcon}>
                  <MaterialCommunityIcons
                    name={getStationIcon(station.station) as any}
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{station.displayName}</Text>
                  <Text style={styles.stationStats}>
                    {station.pendingCount} pending, {station.inProgressCount} cooking
                  </Text>
                </View>
                <View style={styles.stationWait}>
                  <Text style={[styles.waitTime, isHighWait && styles.waitTimeHigh]}>
                    {station.avgWaitMinutes}m
                  </Text>
                  <Text style={styles.waitLabel}>avg wait</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default KitchenQueueWidget;
