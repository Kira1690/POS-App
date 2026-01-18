/**
 * KitchenOrderCard - Compact order display for kitchen screens
 * Shows order information optimized for kitchen workflow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { KitchenOrder } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/design-system/theme/typography';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { formatTime } from '@/utils/date';

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  onViewDetails?: (order: KitchenOrder) => void;
  compact?: boolean;
  style?: any;
}

const getPriorityColors = (priority: KitchenOrder['priority'], elapsedTime: number | undefined, theme: any) => {
  // Use theme status colors for professional Apple/Google style
  const statusColors = theme?.colors?.status;
  const priorityColors = theme?.colors?.priority;

  switch (priority) {
    case 'URGENT':
      return {
        background: statusColors?.cancelled?.bg || theme.colors.errorContainer,
        border: priorityColors?.urgent || theme.colors.error,
        text: priorityColors?.urgent || theme.colors.error,
      };
    case 'HIGH':
      return {
        background: statusColors?.pending?.bg || theme.colors.warningContainer,
        border: priorityColors?.high || theme.colors.warning,
        text: priorityColors?.high || theme.colors.warning,
      };
    case 'NORMAL':
      return {
        background: statusColors?.confirmed?.bg || theme.colors.primaryContainer,
        border: priorityColors?.normal || theme.colors.primary,
        text: priorityColors?.normal || theme.colors.primary,
      };
    default: // LOW
      return {
        background: statusColors?.served?.bg || theme.colors.surfaceVariant,
        border: priorityColors?.low || theme.colors.onSurfaceVariant,
        text: priorityColors?.low || theme.colors.onSurfaceVariant,
      };
  }
};

const getStatusActions = (currentStatus: string) => {
  switch (currentStatus) {
    case 'confirmed':
      return [
        { status: OrderStatus.PREPARING, label: 'Start Cooking', icon: 'restaurant' as const },
      ];
    case 'preparing':
      return [
        { status: OrderStatus.READY, label: 'Mark Ready', icon: 'notifications' as const },
      ];
    case 'ready':
      return [
        { status: OrderStatus.SERVED, label: 'Mark Served', icon: 'done-all' as const },
      ];
    default:
      return [];
  }
};

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  onStatusUpdate,
  onViewDetails,
  compact = false,
  style,
}) => {
  const { theme } = useTheme();
  const priorityColors = getPriorityColors(order.priority, order.elapsed_time, theme);
  const statusActions = getStatusActions(order.items[0]?.status || 'confirmed');

  // Helper to get item status color from theme
  const getItemStatusColor = (status?: string) => {
    const statusColors = theme?.colors?.status;
    switch (status) {
      case 'ready':
        return statusColors?.ready?.border || theme.colors.success;
      case 'preparing':
        return statusColors?.preparing?.border || theme.colors.warning;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const containerStyle = [
    styles.container,
    compact && styles.compactContainer,
    {
      backgroundColor: theme.colors.surface,
      borderColor: priorityColors.border,
    },
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => onViewDetails && onViewDetails(order)}
      activeOpacity={0.8}
    >
      {/* Priority indicator */}
      <View style={[styles.priorityBanner, { backgroundColor: priorityColors.background }]}>
        <Text style={[styles.priorityText, { color: priorityColors.text }]}>
          {order.priority}
        </Text>
        <Text style={[styles.elapsedTime, { color: priorityColors.text }]}>
          {order.elapsed_time}m ago
        </Text>
      </View>

      {/* Order header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
            {order.order_number}
          </Text>
          <Text style={[styles.tableNumber, { color: theme.colors.onSurfaceVariant }]}>
            Table {order.table_number}
          </Text>
        </View>
        
        <View style={styles.timing}>
          <MaterialIcons 
            name="schedule" 
            size={16} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
            {formatTime(order.created_at)}
          </Text>
        </View>
      </View>

      {/* Order items - Kitchen optimized display */}
      <View style={styles.itemsList}>
        {(order.items || []).slice(0, compact ? 2 : 3).map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={[styles.itemQuantity, { 
              color: theme.colors.onPrimary,
              backgroundColor: priorityColors.border 
            }]}>
              {item.quantity}
            </Text>
            <Text 
              style={[styles.itemName, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {item.menu_item.name}
            </Text>
            {/* Status indicator for individual items */}
            {item.status && (
              <View style={[styles.itemStatusDot, {
                backgroundColor: getItemStatusColor(item.status)
              }]} />
            )}
          </View>
        ))}
        
        {order.items.length > (compact ? 2 : 3) && (
          <Text style={[styles.moreItems, { color: theme.colors.onSurfaceVariant }]}>
            + {order.items.length - (compact ? 2 : 3)} more items
          </Text>
        )}
      </View>

      {/* Special instructions */}
      {order.special_instructions && !compact && (
        <View style={[styles.instructionsContainer, { borderTopColor: theme.colors.outline }]}>
          <MaterialIcons 
            name="note" 
            size={14} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text 
            style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {order.special_instructions}
          </Text>
        </View>
      )}

      {/* Kitchen notes */}
      {order.kitchen_notes && !compact && (
        <View style={styles.notesContainer}>
          <MaterialIcons 
            name="kitchen" 
            size={14} 
            color={theme.colors.primary} 
          />
          <Text 
            style={[styles.kitchenNotes, { color: theme.colors.primary }]}
            numberOfLines={2}
          >
            {order.kitchen_notes}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      {statusActions.length > 0 && !compact && (
        <View style={styles.actionsContainer}>
          {statusActions.map((action) => (
            <TouchableOpacity
              key={action.status}
              style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => onStatusUpdate && onStatusUpdate(order.id, action.status)}
            >
              <MaterialIcons
                name={action.icon}
                size={18}
                color={theme.colors.onPrimaryContainer}
              />
              <Text style={[styles.actionText, { color: theme.colors.onPrimaryContainer }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Estimated prep time indicator */}
      <View style={styles.prepTimeIndicator}>
        <View 
          style={[
            styles.prepTimeBar,
            { backgroundColor: theme.colors.outline },
          ]}
        >
          <View 
            style={[
              styles.prepTimeProgress,
              {
                width: `${Math.min((order.elapsed_time / order.estimated_prep_time) * 100, 100)}%`,
                backgroundColor: order.elapsed_time > order.estimated_prep_time 
                  ? priorityColors.border 
                  : theme.colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.prepTimeText, { color: theme.colors.onSurfaceVariant }]}>
          {order.estimated_prep_time}m est.
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    margin: 0, // Remove margin - spacing handled by wrapper
    marginBottom: spacing.md, // Only bottom margin for vertical spacing
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    minHeight: 180, // Consistent minimum height for grid alignment
  },
  compactContainer: {
    minHeight: 140, // Smaller height for compact mode
    marginBottom: spacing.sm,
  },
  priorityBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priorityText: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  elapsedTime: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...typography.titleMedium,
    fontWeight: '700',
    marginBottom: 2,
  },
  tableNumber: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  timing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTime: {
    ...typography.bodySmall,
    marginLeft: spacing.xs / 2,
  },
  itemsList: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  itemQuantity: {
    ...typography.labelSmall,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    minWidth: 24,
    paddingHorizontal: spacing.xs / 2,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.bodyMedium,
    flex: 1,
    fontSize: 14, // Larger for kitchen readability
    fontWeight: '500',
  },
  itemStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  moreItems: {
    ...typography.bodySmall,
    fontStyle: 'italic',
    marginTop: spacing.xs / 2,
    textAlign: 'center',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    marginTop: spacing.xs / 2,
    borderTopWidth: 1,
  },
  instructions: {
    ...typography.bodySmall,
    flex: 1,
    marginLeft: spacing.xs / 2,
    fontStyle: 'italic',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  kitchenNotes: {
    ...typography.bodySmall,
    flex: 1,
    marginLeft: spacing.xs / 2,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Right aligned - Apple/Google design guideline
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionText: {
    ...typography.labelMedium,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  prepTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  prepTimeBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  prepTimeProgress: {
    height: '100%',
    borderRadius: 2,
  },
  prepTimeText: {
    ...typography.labelSmall,
    fontWeight: '500',
  },
});

export default KitchenOrderCard;