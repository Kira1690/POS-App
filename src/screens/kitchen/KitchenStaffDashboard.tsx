/**
 * Kitchen Staff Dashboard — fetches orders directly from API (no sync engine).
 * Shows confirmed/preparing/ready orders with live elapsed timers and priority.
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { AppleCard, AppleProgressBar } from '@/components/apple';
import { UnifiedOrder, UnifiedOrderStatus } from '@/types/unified-order.types';
import { formatCurrency } from '@/utils/currency';
import { apiClient } from '@/services/api/apiClient';

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
            testID={`btn-kitchen-action-${order.id}`}
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
  const { statValueSize, captionSize, cardPadding } = useResponsive();
  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      padding: cardPadding,
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
        fontSize: statValueSize,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 2,
      }}>{value}</Text>
      <Text style={{
        fontSize: captionSize,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
      }}>{label}</Text>
    </View>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'pending' | 'preparing' | 'ready';

// ─── Direct API helpers (no sync engine) ────────────────────────────────────

const KITCHEN_STATUSES = ['confirmed', 'preparing', 'ready'];

function mapApiOrder(raw: any): UnifiedOrder {
  const items = (raw.order_items ?? raw.items ?? []).map((item: any) => ({
    id: String(item.id),
    menuItemId: String(item.menu_item_id ?? ''),
    name: item.name ?? item.item_name ?? '',
    category: item.category ?? '',
    categoryId: item.category_id ?? '',
    basePrice: Number(item.base_price ?? item.price ?? 0),
    quantity: Number(item.quantity ?? 1),
    modifierTotal: Number(item.modifier_total ?? 0),
    itemTotal: Number(item.item_total ?? item.total ?? 0),
    selectedModifiers: item.selected_modifiers ?? item.modifiers ?? [],
    dietaryTags: item.dietary_tags ?? [],
    allergens: item.allergens ?? [],
    hasAllergenWarning: false,
    kitchenStation: item.kitchen_station ?? item.station ?? '',
    itemStatus: item.status ?? item.item_status ?? 'pending',
    specialInstructions: item.special_instructions ?? '',
    kitchenNotes: item.kitchen_notes ?? '',
    isComboItem: false,
    comboId: '',
    comboName: '',
    addedAt: item.created_at ?? new Date().toISOString(),
    modifiedAt: item.updated_at ?? new Date().toISOString(),
  }));

  return {
    id: String(raw.id),
    orderNumber: raw.order_number ?? '',
    restaurantId: String(raw.restaurant_id ?? '1'),
    tableId: String(raw.table_id ?? ''),
    tableName: raw.table_name ?? raw.table?.table_number ?? '',
    guestCount: Number(raw.guest_count ?? 1),
    customerId: raw.customer_id ? String(raw.customer_id) : undefined,
    createdBy: String(raw.created_by ?? ''),
    createdByName: raw.created_by_name ?? '',
    servedBy: raw.served_by ? String(raw.served_by) : undefined,
    servedByName: raw.served_by_name ?? undefined,
    subtotal: Number(raw.subtotal ?? 0),
    taxRate: Number(raw.tax_rate ?? 0),
    taxAmount: Number(raw.tax_amount ?? 0),
    discountType: raw.discount_type ?? undefined,
    discountValue: raw.discount_value != null ? Number(raw.discount_value) : undefined,
    discountAmount: Number(raw.discount_amount ?? 0),
    tipAmount: Number(raw.tip_amount ?? 0),
    totalAmount: Number(raw.total_amount ?? 0),
    status: (raw.status ?? 'draft') as UnifiedOrderStatus,
    paymentStatus: (raw.payment_status ?? 'pending') as any,
    specialInstructions: raw.special_instructions ?? undefined,
    cancellationReason: raw.cancellation_reason ?? undefined,
    submittedAt: raw.submitted_at ?? undefined,
    paidAt: raw.paid_at ?? undefined,
    cancelledAt: raw.cancelled_at ?? undefined,
    preparingAt: raw.preparing_at ?? undefined,
    readyAt: raw.ready_at ?? undefined,
    servedAt: raw.served_at ?? undefined,
    estimatedPrepTime: raw.estimated_prep_time != null ? Number(raw.estimated_prep_time) : undefined,
    actualPrepTime: raw.actual_prep_time != null ? Number(raw.actual_prep_time) : undefined,
    pendingSync: false,
    syncedAt: new Date().toISOString(),
    createdAt: raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? new Date().toISOString(),
    items,
  } as UnifiedOrder;
}

async function fetchKitchenOrders(): Promise<UnifiedOrder[]> {
  try {
    const res = await apiClient.get('/api/orders', { silent: true } as any);
    const data = res.data?.data;
    const arr: any[] = data?.data ?? (Array.isArray(data) ? data : []);
    return arr
      .filter((o: any) => KITCHEN_STATUSES.includes(o.status))
      .map(mapApiOrder);
  } catch {
    return [];
  }
}

async function updateStatusViaApi(orderId: string, status: UnifiedOrderStatus): Promise<boolean> {
  try {
    await apiClient.patch(`/api/orders/${orderId}/status`, { status }, { silent: true } as any);
    return true;
  } catch {
    return false;
  }
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const KitchenStaffDashboard: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { isPhone, headingSize } = useResponsive();

  // Direct API state — no sync engine
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guard: skip polling for 3s after a status update to prevent stale data overwriting optimistic UI
  const lastStatusUpdateRef = useRef<number>(0);

  // Fetch from API on mount + poll every 5s
  const loadOrders = useCallback(async () => {
    // Skip if we just updated status — server may not have propagated yet
    if (Date.now() - lastStatusUpdateRef.current < 3000) return;
    const fetched = await fetchKitchenOrders();
    setOrders(fetched);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchKitchenOrders().then(fetched => {
      setOrders(fetched);
      setIsLoading(false);
    });
    pollRef.current = setInterval(loadOrders, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadOrders]);

  // Compute stats from real data
  const stats = useMemo(() => {
    const active = orders.filter(o => o.status === 'preparing').length;
    const pending = orders.filter(o => o.status === 'confirmed').length;
    const ready = orders.filter(o => o.status === 'ready').length;

    const overdue = orders.filter(o => {
      const elapsed = getMinutesElapsed(o.createdAt);
      const estimated = estimatePrep(o);
      return elapsed > estimated * 1.2;
    }).length;

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
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const handleUpdateStatus = useCallback(
    async (order: UnifiedOrder, next: UnifiedOrderStatus) => {
      // Set guard to prevent poll from overwriting optimistic update
      lastStatusUpdateRef.current = Date.now();

      // Optimistic update — immediately reflect in UI
      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: next } : o
      ));

      // Call API — if it fails, revert by refetching
      const ok = await updateStatusViaApi(order.id, next);
      if (!ok) {
        lastStatusUpdateRef.current = 0; // allow poll to refetch
        const fetched = await fetchKitchenOrders();
        setOrders(fetched);
      }
    },
    [],
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isPhone ? 12 : 20 }}>
        <View>
          <Text style={{ fontSize: isPhone ? headingSize : 26, fontWeight: '700', color: theme.colors.onSurface }}>
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
          testID="btn-kitchen-refresh"
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

      {/* Stats row — 2×2 grid on phone, 4-in-a-row on tablet */}
      <View style={{
        flexDirection: 'row',
        flexWrap: isPhone ? 'wrap' : 'nowrap',
        gap: 10,
        marginBottom: isPhone ? 12 : 20,
      }}>
        {[
          { icon: 'pending-actions' as const, iconColor: '#3B82F6', value: String(stats.pending), label: 'Confirmed' },
          { icon: 'local-fire-department' as const, iconColor: '#F59E0B', value: String(stats.active), label: 'Preparing' },
          { icon: 'check-circle' as const, iconColor: '#10B981', value: String(stats.ready), label: 'Ready' },
          { icon: 'schedule' as const, iconColor: theme.colors.onSurfaceVariant, value: `${stats.avgTime}m`, label: 'Avg Wait' },
        ].map((stat) => (
          <View key={stat.label} style={{ flex: isPhone ? undefined : 1, width: isPhone ? '48%' : undefined }}>
            <StatCard {...stat} />
          </View>
        ))}
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
              testID={`tab-kitchen-filter-${opt.key}`}
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
