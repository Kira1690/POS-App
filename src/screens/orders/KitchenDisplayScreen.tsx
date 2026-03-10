/**
 * KitchenDisplayScreen - Kitchen operations interface
 * Derived from UnifiedOrderContext — single source of truth.
 * Station views come from order_items.kitchen_station + item_status.
 * No kitchen_tickets table involved.
 */

import React, { useCallback, useState, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useKitchenStationViews,
  useKitchenStats,
  KitchenStationView,
} from '@/context/unified-order/UnifiedOrderContext';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { useKitchenConfig } from '@/context/kitchen/KitchenConfigContext';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { UnifiedItemStatus } from '@/types/unified-order.types';
import { showToast } from '@/utils/toast';
import { usePrinter } from '@/context/printer/PrinterContext';
import type { KitchenStation } from '@/types/order-extended.types';

interface KitchenDisplayScreenProps {
  navigation?: any;
}

const KitchenDisplayScreen: React.FC<KitchenDisplayScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { kitchenColumns, isPhone, isPortrait, statValueSize, captionSize } = useResponsive();
  const stationViews = useKitchenStationViews();
  const kitchenStats = useKitchenStats();
  const { updateItemStatus, refreshOrders, isLoading } = useUnifiedOrder();
  const { stations, allowEditWhenReady } = useKitchenConfig();
  const { printStationKOT } = usePrinter();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>('all');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      backgroundColor: isDark ? theme.colors.layer1 : theme.colors.surface,
      borderBottomColor: theme.colors.outline,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      ...theme.typography.h2,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    headerButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      marginLeft: theme.spacing.xs,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: isPhone && isPortrait ? 'wrap' : 'nowrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    statItem: {
      flex: isPhone && isPortrait ? 0 : 1,
      width: isPhone && isPortrait ? '48%' : undefined,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.xs / 2,
      marginBottom: isPhone && isPortrait ? theme.spacing.xs : 0,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    statNumber: {
      ...theme.typography.h2,
      fontWeight: '700',
      marginBottom: theme.spacing.xs / 2,
      fontSize: statValueSize,
    },
    statLabel: {
      ...theme.typography.caption,
      fontWeight: '600',
      fontSize: captionSize,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    stationTabsContainer: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
    },
    stationTab: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.xs,
      alignItems: 'center',
    },
    stationTabText: {
      ...theme.typography.body2,
      fontWeight: '600',
    },
    listContainer: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    ticketRow: {
      justifyContent: 'space-between',
      alignItems: 'stretch',
    },
    ticketCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs / 2,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    ticketOrderInfo: { flex: 1 },
    ticketOrderNumber: {
      ...theme.typography.body1,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    ticketTableName: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    ticketStation: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primaryContainer,
    },
    ticketStationText: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    ticketItems: { marginBottom: theme.spacing.sm },
    ticketItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    itemStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.xs,
    },
    ticketItemQuantity: {
      ...theme.typography.body2,
      fontWeight: '700',
      color: theme.colors.primary,
      minWidth: 24,
    },
    ticketItemName: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      flex: 1,
    },
    ticketItemModifiers: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginLeft: 32,
      fontStyle: 'italic',
    },
    ticketFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    ticketTime: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    ticketStatus: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
    },
    ticketStatusText: {
      ...theme.typography.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    ticketActions: {
      flexDirection: 'row',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    ticketActionButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    ticketActionText: {
      ...theme.typography.body2,
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
    },
    overdueBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.error,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    overdueText: {
      ...theme.typography.caption,
      color: theme.colors.onError,
      fontWeight: '700',
      fontSize: 10,
    },
    emptyListContainer: { flex: 1 },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      ...theme.typography.h3,
      fontWeight: '600',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    emptyMessage: {
      ...theme.typography.body1,
      textAlign: 'center',
      lineHeight: 24,
      color: theme.colors.onSurfaceVariant,
    },
  });

  // Refresh orders whenever this screen gains focus (ensures DB state is current)
  useFocusEffect(
    useCallback(() => {
      refreshOrders().catch(() => {/* ignore */});
    }, [refreshOrders])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to refresh kitchen orders' });
    } finally {
      setRefreshing(false);
    }
  }, [refreshOrders]);

  // Advance all items in a station view to the next status
  const handleStationAction = useCallback(
    async (view: KitchenStationView, targetStatus: UnifiedItemStatus) => {
      try {
        for (const item of view.items) {
          await updateItemStatus(view.order.id, item.id, targetStatus);
        }
        const statusLabels: Record<UnifiedItemStatus, string> = {
          pending: 'Pending',
          preparing: 'Preparing',
          ready: 'Ready',
          served: 'Served',
          cancelled: 'Cancelled',
        };
        if (targetStatus === 'served') {
          showToast({
            type: 'info',
            title: 'Order Served',
            message: 'Items marked as served. Payment can now be collected.',
          });
        } else {
          showToast({
            type: 'success',
            title: 'Status Updated',
            message: `Items moved to ${statusLabels[targetStatus]}`,
          });
        }
      } catch {
        showToast({ type: 'error', title: 'Error', message: 'Failed to update item status' });
      }
    },
    [updateItemStatus]
  );

  // Filtered views
  const viewsToShow = useMemo(() => {
    if (selectedStation === 'all') return stationViews;
    return stationViews.filter((v) => v.station === selectedStation);
  }, [stationViews, selectedStation]);

  // Active station slugs in current views
  const activeStations = useMemo(() => {
    const s = new Set(stationViews.map((v) => v.station));
    return Array.from(s);
  }, [stationViews]);

  const getStatusColor = (status: KitchenStationView['stationStatus']) => {
    const map = theme.colors.status;
    switch (status) {
      case 'pending': return { bg: map.pending.bg, text: map.pending.text };
      case 'preparing': return { bg: map.preparing.bg, text: map.preparing.text };
      case 'ready': return { bg: map.ready.bg, text: map.ready.text };
      case 'served': return { bg: map.served.bg, text: map.served.text };
      default: return { bg: theme.colors.surfaceLight, text: theme.colors.onSurfaceVariant };
    }
  };

  const getCardStatusStyles = (status: KitchenStationView['stationStatus']) => {
    const map = theme.colors.status;
    switch (status) {
      case 'pending':
        return { backgroundColor: map.pending.bg, borderColor: map.pending.border, borderWidth: 2 };
      case 'preparing':
        return { backgroundColor: map.preparing.bg, borderColor: map.preparing.border, borderWidth: 2 };
      case 'ready':
        return { backgroundColor: map.ready.bg, borderColor: map.ready.border, borderWidth: 3 };
      default:
        return { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 };
    }
  };

  const getNextAction = (status: KitchenStationView['stationStatus']): {
    text: string; icon: string; targetStatus: UnifiedItemStatus
  } | null => {
    switch (status) {
      case 'pending': return { text: 'Start', icon: 'play', targetStatus: 'preparing' };
      case 'preparing': return { text: 'Ready', icon: 'check', targetStatus: 'ready' };
      case 'ready': return { text: 'Served', icon: 'check-all', targetStatus: 'served' };
      default: return null;
    }
  };

  const getItemStatusColor = (itemStatus: string): string => {
    switch (itemStatus) {
      case 'served': return theme.colors.success;
      case 'ready': return theme.colors.status.ready.text;
      case 'preparing': return theme.colors.warning;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const formatElapsedTime = (createdAt: string): string => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (elapsed < 1) return 'Just now';
    if (elapsed === 1) return '1 min';
    return `${elapsed} mins`;
  };

  const formatStation = (station: string): string =>
    station.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Kitchen Display</Text>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={handleRefresh}
        >
          <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.onPrimaryContainer} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: theme.colors.status.pending.bg }]}>
          <Text style={[styles.statNumber, { color: theme.colors.status.pending.text }]}>
            {kitchenStats.pendingCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.status.pending.text }]}>
            Pending
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.colors.status.preparing.bg }]}>
          <Text style={[styles.statNumber, { color: theme.colors.status.preparing.text }]}>
            {kitchenStats.preparingCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.status.preparing.text }]}>
            Preparing
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.colors.status.ready.bg }]}>
          <Text style={[styles.statNumber, { color: theme.colors.status.ready.text }]}>
            {kitchenStats.readyCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.status.ready.text }]}>Ready</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={[styles.statNumber, { color: theme.colors.error }]}>
            {kitchenStats.overdueCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.error }]}>Overdue</Text>
        </View>
      </View>

      {/* Station filter tabs */}
      <FlatList
        horizontal
        data={['all', ...activeStations]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: stationKey }) => {
          const isSelected = selectedStation === stationKey;
          return (
            <TouchableOpacity
              style={[
                styles.stationTab,
                isSelected && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedStation(stationKey)}
            >
              <Text
                style={[
                  styles.stationTabText,
                  { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface },
                ]}
              >
                {stationKey === 'all' ? `All (${stationViews.length})` : formatStation(stationKey)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderCard = ({ item: view }: { item: KitchenStationView }) => {
    const statusColor = getStatusColor(view.stationStatus);
    const cardStyles = getCardStatusStyles(view.stationStatus);
    const nextAction = getNextAction(view.stationStatus);
    const isLocked = view.order.status === 'ready' && !allowEditWhenReady;

    return (
      <View style={[styles.ticketCard, cardStyles]}>
        {view.isOverdue && (
          <View style={styles.overdueBadge}>
            <Text style={styles.overdueText}>OVERDUE</Text>
          </View>
        )}

        <View style={styles.ticketHeader}>
          <View style={styles.ticketOrderInfo}>
            <Text style={styles.ticketOrderNumber}>#{view.order.orderNumber}</Text>
            <Text style={styles.ticketTableName}>{view.order.tableName}</Text>
          </View>
          <View style={styles.ticketStation}>
            <Text style={styles.ticketStationText}>{formatStation(view.station)}</Text>
          </View>
        </View>

        <View style={styles.ticketItems}>
          {view.items.slice(0, 5).map((item, index) => (
            <View key={item.id || index}>
              <View style={styles.ticketItem}>
                <View
                  style={[
                    styles.itemStatusDot,
                    { backgroundColor: getItemStatusColor(item.itemStatus) },
                  ]}
                />
                <Text style={styles.ticketItemQuantity}>{item.quantity}x</Text>
                <Text style={styles.ticketItemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                <Text style={styles.ticketItemModifiers} numberOfLines={1}>
                  {item.selectedModifiers.map((m) => m.optionName).join(', ')}
                </Text>
              )}
            </View>
          ))}
          {view.items.length > 5 && (
            <Text style={styles.ticketItemModifiers}>+{view.items.length - 5} more items</Text>
          )}
        </View>

        <View style={styles.ticketFooter}>
          <Text style={styles.ticketTime}>{formatElapsedTime(view.order.createdAt)}</Text>
          <View style={[styles.ticketStatus, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.ticketStatusText, { color: statusColor.text }]}>
              {view.stationStatus}
            </Text>
          </View>
        </View>

        <View style={styles.ticketActions}>
          {nextAction && (
            <TouchableOpacity
              style={[styles.ticketActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleStationAction(view, nextAction.targetStatus)}
              testID={`btn-kitchen-action-${nextAction.text.toLowerCase()}`}
              accessibilityLabel={nextAction.text}
            >
              <MaterialCommunityIcons
                name={nextAction.icon as any}
                size={18}
                color={theme.colors.onPrimary}
              />
              <Text style={[styles.ticketActionText, { color: theme.colors.onPrimary }]}>
                {nextAction.text}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.ticketActionButton, { backgroundColor: theme.colors.secondaryContainer, flex: nextAction ? 0.5 : 1 }]}
            onPress={() => printStationKOT(view.order, view.station as KitchenStation).catch(() => {})}
            testID="btn-reprint-kot"
            accessibilityLabel="Reprint KOT"
          >
            <MaterialCommunityIcons
              name="printer"
              size={18}
              color={theme.colors.onSecondaryContainer}
            />
            {!nextAction && (
              <Text style={[styles.ticketActionText, { color: theme.colors.onSecondaryContainer }]}>
                Reprint
              </Text>
            )}
          </TouchableOpacity>
          {/* Update Order button */}
          <TouchableOpacity
            style={[
              styles.ticketActionButton,
              {
                backgroundColor: isLocked ? theme.colors.surfaceVariant : theme.colors.tertiaryContainer,
                flex: 0.6,
              },
            ]}
            onPress={() => {
              if (isLocked) {
                showToast({ type: 'warning', title: 'Order Locked', message: 'Enable editing in Kitchen Settings.' });
                return;
              }
              if (navigation) {
                (navigation as any).navigate('POSOrder', {
                  editOrderId: view.order.id,
                  table: {
                    id: view.order.tableId,
                    table_number: view.order.tableName,
                    capacity: 4,
                    status: 'occupied',
                    restaurant_id: view.order.restaurantId || 'rest_001',
                    created_at: view.order.createdAt,
                    updated_at: view.order.updatedAt,
                  },
                });
              }
            }}
            disabled={isLocked}
            testID={`btn-update-order-${view.order.tableName?.toLowerCase().replace(/\s+/g, '-') ?? view.order.id}`}
          >
            <MaterialCommunityIcons
              name="pencil-plus"
              size={16}
              color={isLocked ? theme.colors.onSurfaceVariant : theme.colors.tertiary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="chef-hat" size={64} color={theme.colors.onSurfaceVariant} />
      <Text style={styles.emptyTitle}>No Active Orders</Text>
      <Text style={styles.emptyMessage}>
        New orders will appear here when sent to the kitchen
      </Text>
    </View>
  );

  const numColumns = kitchenColumns;

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={viewsToShow}
        keyExtractor={(item) => `${item.order.id}-${item.station}`}
        renderItem={renderCard}
        numColumns={numColumns}
        key={`kitchen-grid-${numColumns}`}
        columnWrapperStyle={numColumns > 1 ? styles.ticketRow : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          viewsToShow.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
        extraData={stationViews}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={0}
      />
    </SafeAreaView>
  );
};

export default KitchenDisplayScreen;
