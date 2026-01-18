/**
 * RecentOrdersList - Display recent orders with quick actions
 *
 * Features:
 * - Latest orders list with status indicators
 * - Quick view of order totals and items
 * - Navigation to order details
 * - Pull-to-refresh support
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface RecentOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  customerName?: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
}

export interface RecentOrdersListProps {
  orders: RecentOrder[];
  loading?: boolean;
  maxItems?: number;
  onOrderPress?: (order: RecentOrder) => void;
  onViewAll?: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  pending: { icon: 'clock-outline', color: '#FF9800', label: 'Pending' },
  preparing: { icon: 'chef-hat', color: '#2196F3', label: 'Preparing' },
  ready: { icon: 'check-circle-outline', color: '#4CAF50', label: 'Ready' },
  served: { icon: 'room-service-outline', color: '#9C27B0', label: 'Served' },
  completed: { icon: 'check-all', color: '#4CAF50', label: 'Completed' },
  cancelled: { icon: 'close-circle-outline', color: '#F44336', label: 'Cancelled' },
};

const ORDER_TYPE_ICONS: Record<string, string> = {
  dine_in: 'silverware-fork-knife',
  takeout: 'shopping-outline',
  delivery: 'moped',
};

export const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
  orders,
  loading = false,
  maxItems = 5,
  onOrderPress,
  onViewAll,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
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
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    viewAllText: {
      ...theme.typography.body2,
      color: theme.colors.primary,
    },
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    orderItemLast: {
      borderBottomWidth: 0,
    },
    statusIndicator: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    orderInfo: {
      flex: 1,
    },
    orderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: 2,
    },
    orderNumber: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    orderTypeIcon: {
      marginLeft: theme.spacing.xs,
    },
    tableNumber: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    orderDetails: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    orderRight: {
      alignItems: 'flex-end',
    },
    orderTotal: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    orderTime: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
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

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderOrderItem = useCallback(
    ({ item, index }: { item: RecentOrder; index: number }) => {
      const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
      const isLast = index === Math.min(orders.length, maxItems) - 1;

      return (
        <TouchableOpacity
          style={[styles.orderItem, isLast && styles.orderItemLast]}
          onPress={() => onOrderPress?.(item)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: `${statusConfig.color}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={statusConfig.icon as any}
              size={22}
              color={statusConfig.color}
            />
          </View>
          <View style={styles.orderInfo}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
              <MaterialCommunityIcons
                name={ORDER_TYPE_ICONS[item.orderType] as any}
                size={14}
                color={theme.colors.onSurfaceVariant}
                style={styles.orderTypeIcon}
              />
              {item.tableNumber && (
                <Text style={styles.tableNumber}>T{item.tableNumber}</Text>
              )}
            </View>
            <Text style={styles.orderDetails}>
              {item.itemCount} item{item.itemCount !== 1 ? 's' : ''}
              {item.customerName ? ` • ${item.customerName}` : ''}
            </Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>{formatCurrency(item.totalAmount)}</Text>
            <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [orders.length, maxItems, theme, onOrderPress]
  );

  const keyExtractor = useCallback((item: RecentOrder) => item.id, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Orders</Text>
        </View>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  const displayOrders = orders.slice(0, maxItems);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="receipt"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>Recent Orders</Text>
        </View>
        {onViewAll && orders.length > 0 && (
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

      {/* Orders List */}
      {displayOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="receipt-text-clock-outline"
            size={40}
            color={theme.colors.onSurfaceVariant}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No recent orders</Text>
        </View>
      ) : (
        <FlatList
          data={displayOrders}
          renderItem={renderOrderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

export default RecentOrdersList;
