/**
 * OrderListItem - Professional order card display component
 * Follows Apple/Google design guidelines with consistent theming
 * Matches KitchenOrderCard design patterns for homogeneous UX
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OrderStatus, PaymentStatus } from '@/types/common.types';
import { useTheme } from '@/hooks/useTheme';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency } from '@/utils/currency';
import { formatTimeAgo, formatTime } from '@/utils/date';
import {
  AnyOrder,
  getOrderNumber,
  getTableName,
  getCreatedAt,
  getOrderTotals,
  getSpecialInstructions,
  getOrderTimestamps,
} from '@/utils/orderFormatHelpers';

interface OrderListItemProps {
  order: AnyOrder;
  onPress?: (order: AnyOrder) => void;
  onViewDetails?: (order: AnyOrder) => void;
  onPrintKOT?: (order: AnyOrder) => void;
  onUpdateStatus?: (order: AnyOrder) => void;
  onProcessPayment?: (order: AnyOrder) => void;
  showActions?: boolean;
  style?: any;
  /** Reduce padding 25% on phones */
  compact?: boolean;
}

const OrderListItem: React.FC<OrderListItemProps> = ({
  order,
  onPress,
  onViewDetails,
  onPrintKOT,
  onUpdateStatus,
  onProcessPayment,
  showActions = true,
  style,
  compact = false,
}) => {
  const { theme, isDark } = useTheme();

  // Defensive: ensure theme is valid
  if (!theme || !theme.colors) {
    return null;
  }

  // Get status colors from theme (Single Source of Truth)
  const getStatusColors = () => {
    const statusColors = theme.colors.status;
    if (!statusColors) {
      return { bg: theme.colors.surfaceLight, text: theme.colors.onSurface, border: theme.colors.outline };
    }
    const statusKey = order.status.toLowerCase() as keyof typeof statusColors;
    return statusColors[statusKey] || statusColors.pending;
  };

  const statusColors = getStatusColors();

  // Get order properties
  const orderNumber = getOrderNumber(order);
  const tableId = getTableName(order);
  const createdAt = getCreatedAt(order);
  const totals = getOrderTotals(order);
  const specialInstructions = getSpecialInstructions(order);
  const timestamps = getOrderTimestamps(order);
  const itemCount = order.items?.length ?? 0;
  const paymentStatus = (order as any).paymentStatus ?? (order as any).payment_status;

  const handlePress = () => {
    if (onPress) onPress(order);
    else if (onViewDetails) onViewDetails(order);
  };

  // Get elapsed time
  const getElapsedTime = () => {
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60)
    );
    if (elapsedMinutes < 1) return 'Just now';
    return `${elapsedMinutes}m ago`;
  };

  // Get status label
  const getStatusLabel = () => {
    const status = order.status.toLowerCase();
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Dynamic styles using theme - Following Apple/Google design guidelines
  const styles = StyleSheet.create({
    // Card container - consistent with KitchenOrderCard
    container: {
      backgroundColor: theme.colors.surface, // Always surface color for card
      borderRadius: theme.borderRadius.lg,
      marginVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.sm,
      borderWidth: 2,
      borderColor: statusColors.border, // Status color only on border
      overflow: 'hidden',
      // Apple-style shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    // Status banner at top - matches KitchenOrderCard pattern
    statusBanner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: statusColors.bg,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: statusColors.text,
    },
    elapsedTime: {
      fontSize: 11,
      fontWeight: '600',
      color: statusColors.text,
    },
    // Content area
    content: {
      padding: compact ? theme.spacing.sm : theme.spacing.md,
    },
    // Header row with order info and badge
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    tableInfo: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    // Badge area
    badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    paidBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.status?.paid?.bg,
      gap: 2,
    },
    paidBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.status?.paid?.text,
    },
    // Details row
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    detailsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    detailText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginLeft: 4,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    // Instructions section
    instructionsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    instructionsText: {
      fontSize: 13,
      flex: 1,
      fontStyle: 'italic',
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.xs,
    },
    // Actions container - buttons on RIGHT side (Apple/Google guideline)
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end', // Right aligned
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    // Action button - consistent styling
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    actionButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    actionButtonSecondary: {
      backgroundColor: theme.colors.primaryContainer,
    },
    actionButtonTertiary: {
      backgroundColor: theme.colors.surfaceLight,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
    },
    // Timing row for active orders
    timingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    timingText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
      color: theme.colors.warning,
    },
  });

  // Per-table testID: "B-1" → "order-card-b-1" (used by Maestro to target specific orders)
  const tableSlug = tableId ? tableId.toLowerCase().replace(/[^a-z0-9-]/g, '-') : undefined;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={tableSlug ? `order-card-${tableSlug}` : undefined}
    >
      {/* Status Banner - Consistent with KitchenOrderCard */}
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>{getStatusLabel()}</Text>
        <Text style={styles.elapsedTime}>{getElapsedTime()}</Text>
      </View>

      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
            {tableId && (
              <Text style={styles.tableInfo}>Table {tableId}</Text>
            )}
          </View>

          <View style={styles.badgeContainer}>
            {paymentStatus === PaymentStatus.COMPLETED && (
              <View style={styles.paidBadge}>
                <MaterialIcons name="check-circle" size={10} color={theme.colors.status?.paid?.text} />
                <Text style={styles.paidBadgeText}>PAID</Text>
              </View>
            )}
            <OrderStatusBadge status={order.status} size="small" />
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailsLeft}>
            <View style={styles.detailItem}>
              <MaterialIcons name="restaurant-menu" size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.detailText}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.detailText}>{formatTimeAgo(createdAt)}</Text>
            </View>
          </View>
          <Text style={styles.totalAmount}>{formatCurrency(totals.totalAmount)}</Text>
        </View>

        {/* Special Instructions */}
        {specialInstructions && (
          <View style={styles.instructionsContainer}>
            <MaterialIcons name="note" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.instructionsText} numberOfLines={2}>
              {specialInstructions}
            </Text>
          </View>
        )}

        {/* Action Buttons - Right Aligned */}
        {showActions && (
          <View style={styles.actionsContainer}>
            {/* Print Button - Show for non-completed orders */}
            {order.status !== OrderStatus.SERVED && order.status !== OrderStatus.CANCELLED && onPrintKOT && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonTertiary]}
                onPress={() => onPrintKOT(order)}
              >
                <MaterialIcons name="print" size={16} color={theme.colors.onSurface} />
                <Text style={[styles.actionText, { color: theme.colors.onSurface }]}>Print</Text>
              </TouchableOpacity>
            )}

            {/* View Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => onViewDetails && onViewDetails(order)}
              testID="btn-order-view"
            >
              <MaterialIcons name="visibility" size={16} color={theme.colors.onPrimaryContainer} />
              <Text style={[styles.actionText, { color: theme.colors.onPrimaryContainer }]}>View</Text>
            </TouchableOpacity>

            {/* Payment Button - Only for ready/served unpaid orders */}
            {(order.status === OrderStatus.READY || order.status === OrderStatus.SERVED) &&
             paymentStatus !== PaymentStatus.COMPLETED &&
             onProcessPayment && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => onProcessPayment(order)}
                testID="btn-order-pay"
              >
                <MaterialIcons name="payment" size={16} color={theme.colors.onPrimary} />
                <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>Pay</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Timing Info for Active Orders */}
        {(order.status === OrderStatus.PREPARING || order.status === OrderStatus.READY) && (
          <View style={styles.timingRow}>
            <MaterialIcons name="timer" size={14} color={theme.colors.warning} />
            <Text style={styles.timingText}>
              {order.status === OrderStatus.PREPARING
                ? `Cooking: ${formatTimeAgo(timestamps.preparingAt || createdAt)}`
                : `Ready: ${formatTime(timestamps.readyAt || createdAt)}`
              }
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default OrderListItem;
