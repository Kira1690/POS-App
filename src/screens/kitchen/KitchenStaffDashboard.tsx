/**
 * Kitchen Staff Dashboard — connected to real SQLite order data
 * Shows confirmed/preparing/ready orders with live elapsed timers and priority.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppleCard, AppleProgressBar } from '@/components/apple';
import { useUnifiedKitchen } from '@/context/unified-order/UnifiedOrderContext';
import { UnifiedOrder, UnifiedOrderStatus } from '@/types/unified-order.types';
import { formatCurrency } from '@/utils/currency';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getMinutesElapsed = (iso: string): number => {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
};

const mapKitchenStatus = (
  status: UnifiedOrderStatus,
): 'pending' | 'preparing' | 'ready' => {
  if (status === 'preparing') return 'preparing';
  if (status === 'ready') return 'ready';
  return 'pending'; // confirmed
};

const derivePriority = (elapsed: number, estimated: number): 'urgent' | 'high' | 'normal' => {
  if (elapsed > estimated * 1.2) return 'urgent';
  if (elapsed > estimated * 0.7) return 'high';
  return 'normal';
};

const estimatePrep = (order: UnifiedOrder): number =>
  order.estimatedPrepTime ?? Math.max(10, order.items.length * 5);

// ─── Order Card ─────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: UnifiedOrder;
  onUpdateStatus: (order: UnifiedOrder, next: UnifiedOrderStatus) => void;
}

const KitchenOrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const { theme } = useTheme();

  const elapsed = getMinutesElapsed(order.createdAt);
  const estimated = estimatePrep(order);
  const kitchenStatus = mapKitchenStatus(order.status);
  const priority = derivePriority(elapsed, estimated);
  const isOverdue = elapsed > estimated * 1.2;
  const progress = Math.min(elapsed / estimated, 1);

  // Status banner colours
  const statusConfig = {
    pending: {
      bg: '#3B82F6',
      label: 'CONFIRMED',
      next: 'preparing' as UnifiedOrderStatus,
      nextLabel: 'Start Preparing',
    },
    preparing: {
      bg: '#F59E0B',
      label: 'PREPARING',
      next: 'ready' as UnifiedOrderStatus,
      nextLabel: 'Mark Ready',
    },
    ready: {
      bg: '#10B981',
      label: 'READY',
      next: 'served' as UnifiedOrderStatus,
      nextLabel: 'Mark Served',
    },
  }[kitchenStatus];

  // Priority badge colour
  const priorityColor = {
    urgent: theme.colors.error,
    high: '#F59E0B',
    normal: theme.colors.onSurfaceVariant,
  }[priority];

  // Progress bar colour
  const progressColor: 'success' | 'warning' | 'error' =
    isOverdue ? 'error' : progress > 0.7 ? 'warning' : 'success';

  const styles = {
    card: {
      marginBottom: 12,
      padding: 0,
      overflow: 'hidden' as const,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    banner: {
      backgroundColor: statusConfig.bg,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    bannerLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
    },
    bannerStatus: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    bannerTime: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '500' as const,
    },
    body: {
      padding: 12,
    },
    topRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      marginBottom: 8,
    },
    orderNumber: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: theme.colors.onSurface,
    },
    meta: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: `${priorityColor}20`,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: priorityColor,
    },
    timerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      marginBottom: 8,
    },
    timerText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: isOverdue ? theme.colors.error : theme.colors.onSurfaceVariant,
      minWidth: 60,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginVertical: 8,
      opacity: 0.5,
    },
    itemsSection: {
      gap: 4,
      marginBottom: 10,
    },
    itemRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      paddingVertical: 3,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
    },
    itemName: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.onSurface,
      fontWeight: '500' as const,
    },
    itemQty: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600' as const,
    },
    itemNote: {
      fontSize: 11,
      color: theme.colors.primary,
      fontStyle: 'italic' as const,
      marginTop: 1,
    },
    specialNote: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: 4,
      marginBottom: 10,
    },
    specialNoteText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic' as const,
    },
    actionsRow: {
      flexDirection: 'row' as const,
      gap: 8,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    actionBtnText: {
      fontSize: 13,
      fontWeight: '700' as const,
    },
  };

  return (
    <AppleCard layer="surface" size="large" style={styles.card}>
      {/* Status Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          {isOverdue && (
            <MaterialIcons name="warning" size={14} color="#FFFFFF" />
          )}
          <Text style={styles.bannerStatus}>
            {isOverdue ? 'OVERDUE • ' : ''}{statusConfig.label}
          </Text>
        </View>
        <Text style={styles.bannerTime}>{elapsed}m ago</Text>
      </View>

      <View style={styles.body}>
        {/* Order info + priority */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.meta}>
              {order.tableName ? `${order.tableName} • ` : ''}
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {priority !== 'normal' && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Time progress */}
        <View style={styles.timerRow}>
          <MaterialIcons
            name="access-time"
            size={16}
            color={isOverdue ? theme.colors.error : theme.colors.onSurfaceVariant}
          />
          <Text style={styles.timerText}>{elapsed}m / {estimated}m</Text>
          <AppleProgressBar
            progress={progress}
            color={progressColor}
            size="small"
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.itemsSection}>
          {order.items.map((item) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <MaterialIcons
                  name="restaurant-menu"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
              </View>
              {item.specialInstructions ? (
                <Text style={styles.itemNote}>  Note: {item.specialInstructions}</Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* Special instructions */}
        {order.specialInstructions ? (
          <View style={styles.specialNote}>
            <MaterialIcons name="note" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.specialNoteText}>{order.specialInstructions}</Text>
          </View>
        ) : null}

        {/* Action button */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: statusConfig.bg }]}
            onPress={() => onUpdateStatus(order, statusConfig.next)}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
              {statusConfig.nextLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppleCard>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconColor, value, label }) => {
  const { theme } = useTheme();
  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      alignItems: 'center',
    }}>
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${iconColor}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
      }}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={{
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 2,
      }}>{value}</Text>
      <Text style={{
        fontSize: 11,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
      }}>{label}</Text>
    </View>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'pending' | 'preparing' | 'ready';

const KitchenStaffDashboard: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { orders, updateOrderStatus, refreshOrders, isLoading } = useUnifiedKitchen();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Compute stats from real data
  const stats = useMemo(() => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const active = orders.filter(o => o.status === 'preparing').length;
    const pending = orders.filter(o => o.status === 'confirmed').length;
    const ready = orders.filter(o => o.status === 'ready').length;

    const overdue = orders.filter(o => {
      const elapsed = getMinutesElapsed(o.createdAt);
      const estimated = estimatePrep(o);
      return elapsed > estimated * 1.2;
    }).length;

    // Average time for all kitchen orders (as elapsed so far)
    const avgTime = orders.length > 0
      ? Math.round(orders.reduce((sum, o) => sum + getMinutesElapsed(o.createdAt), 0) / orders.length)
      : 0;

    return { active, pending, ready, overdue, avgTime };
  }, [orders]);

  // Filtered + sorted orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      if (statusFilter === 'all') return true;
      return mapKitchenStatus(o.status) === statusFilter;
    });

    // Sort: overdue first, then by elapsed time descending
    return result.sort((a, b) => {
      const aElapsed = getMinutesElapsed(a.createdAt);
      const bElapsed = getMinutesElapsed(b.createdAt);
      const aEst = estimatePrep(a);
      const bEst = estimatePrep(b);
      const aOverdue = aElapsed > aEst * 1.2;
      const bOverdue = bElapsed > bEst * 1.2;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return bElapsed - aElapsed;
    });
  }, [orders, statusFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  }, [refreshOrders]);

  const handleUpdateStatus = useCallback(
    (order: UnifiedOrder, next: UnifiedOrderStatus) => {
      updateOrderStatus(order.id, next);
    },
    [updateOrderStatus],
  );

  const filterOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'pending', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
    { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
  ];

  const renderHeader = () => (
    <View style={{ padding: 16 }}>
      {/* Title */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '700', color: theme.colors.onSurface }}>
            Kitchen Dashboard
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {orders.length} active kitchen orders
          </Text>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.colors.primaryContainer,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: theme.borderRadius.md,
          }}
          onPress={handleRefresh}
          disabled={isLoading || refreshing}
        >
          <MaterialIcons name="refresh" size={18} color={theme.colors.onPrimaryContainer} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.onPrimaryContainer }}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overdue alert */}
      {stats.overdue > 0 && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: `${theme.colors.error}18`,
          borderWidth: 1,
          borderColor: `${theme.colors.error}40`,
          borderRadius: theme.borderRadius.md,
          padding: 12,
          marginBottom: 16,
        }}>
          <MaterialIcons name="warning" size={20} color={theme.colors.error} />
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: theme.colors.error }}>
            {stats.overdue} order{stats.overdue !== 1 ? 's' : ''} overdue — needs immediate attention
          </Text>
        </View>
      )}

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <StatCard icon="pending-actions" iconColor="#3B82F6" value={String(stats.pending)} label="Confirmed" />
        <StatCard icon="local-fire-department" iconColor="#F59E0B" value={String(stats.active)} label="Preparing" />
        <StatCard icon="check-circle" iconColor="#10B981" value={String(stats.ready)} label="Ready" />
        <StatCard icon="schedule" iconColor={theme.colors.onSurfaceVariant} value={`${stats.avgTime}m`} label="Avg Wait" />
      </View>

      {/* Status filter chips */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {filterOptions.map(opt => {
          const isActive = statusFilter === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: theme.borderRadius.full ?? 20,
                backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceVariant,
                borderWidth: 1,
                borderColor: isActive ? theme.colors.primary : theme.colors.outline,
              }}
              onPress={() => setStatusFilter(opt.key)}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: isActive ? theme.colors.onPrimary : theme.colors.onSurface,
              }}>{opt.label}</Text>
              <View style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : theme.colors.outline,
                borderRadius: 10,
                minWidth: 20,
                paddingHorizontal: 5,
                paddingVertical: 1,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: isActive ? '#FFFFFF' : theme.colors.onSurfaceVariant,
                }}>{opt.count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <MaterialIcons name="assignment" size={18} color={theme.colors.primary} />
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.onSurface }}>
          Kitchen Orders ({filteredOrders.length})
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background }}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
            <KitchenOrderCard order={item} onUpdateStatus={handleUpdateStatus} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{
              alignItems: 'center',
              padding: 40,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: theme.borderRadius.lg,
            }}>
              <MaterialIcons
                name="restaurant"
                size={52}
                color={theme.colors.onSurfaceVariant}
                style={{ marginBottom: 16 }}
              />
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.onSurface,
                marginBottom: 6,
              }}>
                No Orders to Prepare
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
              }}>
                {statusFilter === 'all'
                  ? 'All orders are up to date!'
                  : `No ${statusFilter} orders right now.`}
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default KitchenStaffDashboard;
