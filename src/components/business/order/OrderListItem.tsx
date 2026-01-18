/**
 * OrderListItem - Professional order row display component
 * Shows order information with professional styling and action buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderStatus, PaymentStatus } from '@/types/common.types';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/design-system/theme/typography';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency } from '@/utils/currency';
import { formatTimeAgo, formatTime } from '@/utils/date';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface OrderListItemProps {
  order: Order;
  onPress?: (order: Order) => void;
  onViewDetails?: (order: Order) => void;
  onPrintKOT?: (order: Order) => void;
  onUpdateStatus?: (order: Order) => void;
  onProcessPayment?: (order: Order) => void; // New payment functionality
  showActions?: boolean;
  style?: any;
}

const getOrderPriorityColor = (order: Order, theme: any) => {
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60)
  );
  const estimatedTime = order.estimated_prep_time || 15;

  // Defensive: fallback if theme or theme.colors.priority doesn't exist
  const priority = theme?.colors?.priority || {
    urgent: '#D32F2F',
    high: '#F57C00',
    normal: '#1976D2',
    low: '#388E3C',
  };

  if (elapsedMinutes > estimatedTime + 10) {
    return priority.urgent;
  } else if (elapsedMinutes > estimatedTime) {
    return priority.high;
  } else if (elapsedMinutes > estimatedTime * 0.8) {
    return priority.normal;
  }

  return priority.low;
};

const getCardStatusStyles = (status: OrderStatus, theme: any) => {
  // Defensive: check if theme or theme.colors.status exists
  if (!theme?.colors?.status) {
    return {}; // Return empty object if status colors not available
  }

  const statusColors = theme.colors.status;
  const statusKey = status.toLowerCase() as keyof typeof statusColors;
  const colors = statusColors[statusKey] || statusColors.pending;

  return {
    backgroundColor: colors.bg,
    borderLeftColor: colors.border,
    borderLeftWidth: 4,
  };
};

const OrderListItem: React.FC<OrderListItemProps> = ({
  order,
  onPress,
  onViewDetails,
  onPrintKOT,
  onUpdateStatus,
  onProcessPayment,
  showActions = true,
  style,
}) => {
  const { theme } = useTheme();

  // Defensive: ensure theme is valid before using
  if (!theme || !theme.colors) {
    console.error('[OrderListItem] Invalid theme object:', theme);
    return null; // Don't render if theme is broken
  }

  const priorityColor = getOrderPriorityColor(order, theme);
  const cardStatusStyles = getCardStatusStyles(order.status, theme);

  const handlePress = () => {
    if (onPress) {
      onPress(order);
    } else if (onViewDetails) {
      onViewDetails(order);
    }
  };

  const containerStyle = [
    styles.container,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
    },
    cardStatusStyles, // Apply status-based card styling
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Priority indicator line */}
      <View style={[styles.priorityLine, { backgroundColor: priorityColor }]} />
      
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
              {order.order_number}
            </Text>
            {order.table_id && (
              <Text style={[styles.tableInfo, { color: theme.colors.onSurfaceVariant }]}>
                Table {order.table_id}
              </Text>
            )}
          </View>

          <View style={styles.badgeRow}>
            {/* Paid badge */}
            {order.payment_status === PaymentStatus.COMPLETED && (
              <View style={[styles.paidBadge, { backgroundColor: theme.colors.successContainer }]}>
                <MaterialIcons name="check-circle" size={12} color={theme.colors.success} />
                <Text style={[styles.paidBadgeText, { color: theme.colors.success }]}>Paid</Text>
              </View>
            )}
            <OrderStatusBadge status={order.status} size="small" />
          </View>
        </View>

        {/* Order details row */}
        <View style={styles.detailsRow}>
          <View style={styles.orderDetails}>
            <Text style={[styles.itemCount, { color: theme.colors.onSurfaceVariant }]}>
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </Text>
            <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
              {formatTimeAgo(order.created_at)}
            </Text>
          </View>
          
          <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
            {formatCurrency(order.total_amount)}
          </Text>
        </View>

        {/* Special instructions */}
        {order.special_instructions && (
          <View style={styles.instructionsRow}>
            <MaterialIcons 
              name="note" 
              size={14} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.noteIcon}
            />
            <Text 
              style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {order.special_instructions}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        {showActions && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => onViewDetails && onViewDetails(order)}
            >
              <MaterialIcons 
                name="visibility" 
                size={16} 
                color={theme.colors.onPrimaryContainer} 
              />
              <Text style={[styles.actionText, { color: theme.colors.onPrimaryContainer }]}>
                View
              </Text>
            </TouchableOpacity>

            {/* Payment Button - Only show for unpaid orders ready for payment */}
            {(order.status === OrderStatus.READY || order.status === OrderStatus.SERVED) &&
             order.payment_status !== PaymentStatus.COMPLETED &&
             onProcessPayment && (
              <TouchableOpacity
                style={[styles.actionButton, styles.paymentButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => onProcessPayment(order)}
              >
                <MaterialIcons
                  name="payment"
                  size={16}
                  color={theme.colors.onPrimary}
                />
                <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
                  Payment
                </Text>
              </TouchableOpacity>
            )}

            {order.status !== OrderStatus.SERVED && order.status !== OrderStatus.CANCELLED && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.secondaryContainer }]}
                  onPress={() => onPrintKOT && onPrintKOT(order)}
                >
                  <MaterialIcons 
                    name="print" 
                    size={16} 
                    color={theme.colors.onSecondaryContainer} 
                  />
                  <Text style={[styles.actionText, { color: theme.colors.onSecondaryContainer }]}>
                    Print
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.tertiaryContainer }]}
                  onPress={() => onUpdateStatus && onUpdateStatus(order)}
                >
                  <MaterialIcons 
                    name="update" 
                    size={16} 
                    color={theme.colors.onTertiaryContainer} 
                  />
                  <Text style={[styles.actionText, { color: theme.colors.onTertiaryContainer }]}>
                    Update
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Timing information for active orders */}
        {(order.status === OrderStatus.PREPARING || order.status === OrderStatus.READY) && (
          <View style={styles.timingRow}>
            <MaterialIcons 
              name="schedule" 
              size={14} 
              color={priorityColor} 
            />
            <Text style={[styles.timingText, { color: priorityColor }]}>
              {order.status === OrderStatus.PREPARING 
                ? `Cooking for ${formatTimeAgo(order.preparing_at || order.created_at)}`
                : `Ready since ${formatTime(order.ready_at || order.created_at)}`
              }
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priorityLine: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  paidBadgeText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  orderNumber: {
    ...typography.titleMedium,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  tableInfo: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCount: {
    ...typography.bodyMedium,
    marginRight: spacing.md,
  },
  orderTime: {
    ...typography.bodySmall,
  },
  totalAmount: {
    ...typography.titleMedium,
    fontWeight: '700',
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  noteIcon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  instructions: {
    ...typography.bodySmall,
    flex: 1,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  paymentButton: {
    // Prominent payment button styling
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    ...typography.labelSmall,
    fontWeight: '600',
    marginLeft: spacing.xs / 2,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  timingText: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default OrderListItem;