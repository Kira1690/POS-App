/**
 * Kitchen Dashboard - Kitchen display system with order queues and timing
 * Matches wireframe 2.3 Kitchen Dashboard
 * Uses real data from UnifiedOrderContext (no tickets table)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import {
  useKitchenStationViews,
  useKitchenStats,
  useUnifiedOrder,
  type KitchenStationView,
} from '@/context/unified-order/UnifiedOrderContext';

const KitchenDashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const { theme } = useTheme();
  const { isLargeTablet, isPhone } = useResponsive();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real data from unified order system
  const stationViews = useKitchenStationViews();
  const kitchenStats = useKitchenStats();
  const { refreshOrders } = useUnifiedOrder();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      refreshOrders();
    }, [refreshOrders])
  );

  // Priority views: overdue station views
  const priorityViews = useMemo(() => {
    return stationViews.filter(v => v.isOverdue);
  }, [stationViews]);

  // Station summary cards
  const stationCards = useMemo(() => {
    const stationMap = new Map<string, { name: string; count: number }>();
    for (const view of stationViews) {
      const key = view.station;
      const existing = stationMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        stationMap.set(key, {
          name: view.station.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          count: 1,
        });
      }
    }
    const colors = [
      theme.colors.success,
      theme.colors.error,
      theme.colors.info,
      theme.colors.primary,
      theme.colors.warning,
      theme.colors.tertiary,
    ];
    return Array.from(stationMap.entries()).map(([key, val], index) => ({
      key,
      name: val.name,
      count: val.count,
      color: colors[index % colors.length],
    }));
  }, [stationViews, theme]);

  const chefName = authState.user?.name || 'Chef';
  const chefId = authState.user?.employeeId || '--';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  }, [refreshOrders]);

  const controlButtons = useMemo(() => [
    { label: 'Refresh Orders', icon: 'refresh', color: theme.colors.primary },
    { label: 'View All', icon: 'list', color: theme.colors.success },
    { label: 'Alerts', icon: 'warning', color: theme.colors.warning },
  ], [theme]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.sm : spacing.lg,
      paddingVertical: isPhone ? spacing.sm : spacing.lg,
      height: isPhone ? 56 : 100,
    },
    headerLeft: {
      flex: 1,
    },
    headerCenter: {
      flex: 2,
      alignItems: 'center',
    },
    headerRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    timeDisplay: {
      ...typography.titleLarge,
      color: theme.colors.onPrimary,
      fontWeight: '700',
    },
    headerTitle: {
      ...typography.headlineLarge,
      color: theme.colors.onPrimary,
      fontWeight: '700',
      fontSize: isPhone ? 16 : 32,
    },
    chefInfo: {
      ...typography.titleMedium,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    stationStatusBar: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    stationIndicator: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    stationText: {
      ...typography.titleMedium,
      color: theme.colors.onPrimary,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      padding: isPhone ? spacing.sm : spacing.lg,
    },
    priorityQueue: {
      padding: spacing.xl,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.error,
      marginBottom: spacing.xl,
    },
    priorityTitle: {
      ...typography.headlineSmall,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    priorityOrdersRow: {
      flexDirection: isLargeTablet ? 'row' : 'column',
      gap: spacing.lg,
    },
    priorityOrderCard: {
      flex: 1,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 3,
    },
    priorityOrderTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    priorityOrderTime: {
      ...typography.bodyLarge,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    priorityOrderItems: {
      alignItems: 'center',
    },
    priorityOrderItem: {
      ...typography.bodyMedium,
      marginBottom: spacing.xs,
    },
    activeOrdersQueue: {
      padding: spacing.xl,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: spacing.xl,
    },
    queueTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    ordersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.lg,
    },
    orderCard: {
      width: isLargeTablet ? '48%' : isPhone ? '100%' : '100%',
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
    },
    orderTitle: {
      ...typography.titleMedium,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    orderTime: {
      ...typography.bodyLarge,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    orderItems: {
      marginTop: spacing.sm,
    },
    orderItem: {
      ...typography.bodySmall,
      marginBottom: spacing.xs,
    },
    kitchenControls: {
      padding: spacing.xl,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    controlsTitle: {
      ...typography.titleLarge,
      color: theme.colors.onSurface,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    controlsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    controlButton: {
      width: isLargeTablet ? '30%' : '48%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      minHeight: 50,
    },
    controlButtonText: {
      color: theme.colors.onPrimary,
      ...typography.bodyMedium,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    timerDisplay: {
      ...typography.titleMedium,
      color: theme.colors.onSurface,
      fontWeight: '600',
      textAlign: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyStateText: {
      ...typography.bodyMedium,
      marginTop: spacing.md,
    },
  });

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.error }]}>
      <View style={styles.headerLeft}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="access-time" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.timeDisplay}>
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>

      <View style={styles.headerCenter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MaterialIcons name="restaurant" size={32} color={theme.colors.onPrimary} />
          <Text style={styles.headerTitle}>
            KITCHEN DISPLAY SYSTEM
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="person" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.chefInfo}>
            {chefName} ({chefId})
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStationStatus = () => (
    <View style={[styles.stationStatusBar, { backgroundColor: theme.colors.surface }]}>
      {stationCards.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm }}>
          <Text style={[styles.stationText, { color: theme.colors.onSurfaceVariant }]}>
            No active stations
          </Text>
        </View>
      ) : (
        stationCards.map((station) => (
          <TouchableOpacity
            key={station.key}
            style={[styles.stationIndicator, { backgroundColor: station.color }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="restaurant" size={16} color={theme.colors.onPrimary} />
              <Text style={styles.stationText}>{station.name} ({station.count})</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderPriorityQueue = () => (
    <View style={[styles.priorityQueue, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.priorityTitle, { color: theme.colors.error }]}>
        PRIORITY ORDERS - IMMEDIATE ATTENTION
      </Text>

      {priorityViews.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="check-circle" size={40} color={theme.colors.success} />
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            No priority orders at this time
          </Text>
        </View>
      ) : (
        <View style={styles.priorityOrdersRow}>
          {priorityViews.slice(0, 4).map((view) => {
            const overdueBy = Math.round(view.elapsedMinutes - (view.order.estimatedPrepTime ?? 20));
            return (
              <View
                key={`${view.order.id}-${view.station}`}
                style={[
                  styles.priorityOrderCard,
                  { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.error }
                ]}
              >
                <Text style={[styles.priorityOrderTitle, { color: theme.colors.onSurface }]}>
                  {view.order.tableName || 'Table'} - #{view.order.orderNumber}
                </Text>
                <Text style={[styles.priorityOrderTime, { color: theme.colors.onSurfaceVariant }]}>
                  OVERDUE by {overdueBy > 0 ? overdueBy : 0} min
                </Text>
                <View style={styles.priorityOrderItems}>
                  {view.items.slice(0, 3).map((item) => (
                    <Text key={item.id} style={[styles.priorityOrderItem, { color: theme.colors.onSurface }]}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                  {view.items.length > 3 && (
                    <Text style={[styles.priorityOrderItem, { color: theme.colors.onSurfaceVariant }]}>
                      +{view.items.length - 3} more items
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderActiveOrdersQueue = () => (
    <View style={[styles.activeOrdersQueue, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.queueTitle, { color: theme.colors.onSurface }]}>
        ACTIVE ORDERS QUEUE ({stationViews.length})
      </Text>

      {stationViews.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="inbox" size={40} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            No active orders in the queue
          </Text>
        </View>
      ) : (
        <View style={styles.ordersGrid}>
          {stationViews.slice(0, 8).map((view) => {
            const statusColor = view.stationStatus === 'ready'
              ? theme.colors.success
              : view.stationStatus === 'preparing'
                ? theme.colors.warning
                : theme.colors.info;
            const stationName = view.station.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return (
              <View
                key={`${view.order.id}-${view.station}`}
                style={[
                  styles.orderCard,
                  { backgroundColor: theme.colors.surfaceVariant, borderColor: statusColor }
                ]}
              >
                <Text style={[styles.orderTitle, { color: theme.colors.onSurface }]}>
                  {view.order.tableName || 'Table'} - {stationName}
                </Text>
                <Text style={[styles.orderTime, { color: statusColor }]}>
                  {view.stationStatus.toUpperCase()} | {view.order.estimatedPrepTime ?? 15}min est.
                </Text>
                <View style={styles.orderItems}>
                  {view.items.slice(0, 4).map((item) => (
                    <Text key={item.id} style={[styles.orderItem, { color: theme.colors.onSurface }]}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                  {view.items.length > 4 && (
                    <Text style={[styles.orderItem, { color: theme.colors.onSurfaceVariant }]}>
                      +{view.items.length - 4} more
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderKitchenControls = () => (
    <View style={[styles.kitchenControls, { backgroundColor: theme.colors.surface }]}>
      <Text style={styles.controlsTitle}>
        KITCHEN CONTROLS
      </Text>

      <View style={styles.controlsGrid}>
        {controlButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.controlButton,
              { backgroundColor: button.color }
            ]}
            onPress={button.label === 'Refresh Orders' ? onRefresh : undefined}
          >
            <MaterialIcons name={button.icon as keyof typeof MaterialIcons.glyphMap} size={24} color={theme.colors.onPrimary} />
            <Text style={styles.controlButtonText}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.timerDisplay}>
        Average Prep Time: {kitchenStats.avgPrepTime > 0 ? `${kitchenStats.avgPrepTime} minutes` : 'N/A'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderStationStatus()}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderPriorityQueue()}
        {renderActiveOrdersQueue()}
        {renderKitchenControls()}
      </ScrollView>
    </View>
  );
};

export default KitchenDashboard;
