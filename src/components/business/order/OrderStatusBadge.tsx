/**
 * OrderStatusBadge - Professional status indicator component
 * Provides color-coded status badges with consistent styling across all screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OrderStatus } from '@/types/common.types';
import { UnifiedOrderStatus } from '@/types/unified-order.types';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/design-system/theme/typography';
import { spacing, borderRadius } from '@/design-system/theme/spacing';

type StatusType = OrderStatus | UnifiedOrderStatus;

interface OrderStatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: any;
}

const getStatusConfig = (status: StatusType, theme: any) => {
  // Defensive: fallback if theme or theme.colors.status doesn't exist
  // Using distinct colors for each status - matching theme.ts and colors.ts
  // CONFIRMED=Green, PREPARING=Purple, READY=Cyan for easy visual distinction
  const statusColors = theme?.colors?.status || {
    pending: { bg: '#FFF3E0', text: '#E65100', border: '#FF9800' },      // Orange - waiting
    confirmed: { bg: '#E8F5E9', text: '#2E7D32', border: '#4CAF50' },    // GREEN - accepted (distinct from Ready)
    preparing: { bg: '#F3E5F5', text: '#7B1FA2', border: '#AB47BC' },    // Purple - cooking
    ready: { bg: '#E1F5FE', text: '#0277BD', border: '#03A9F4' },        // Cyan - ready to serve
    served: { bg: '#F5F5F5', text: '#616161', border: '#9E9E9E' },       // Gray - delivered
    cancelled: { bg: '#FFEBEE', text: '#C62828', border: '#EF5350' },    // Red - cancelled
    paid: { bg: '#E8F5E9', text: '#2E7D32', border: '#66BB6A' },         // Green - paid
    completed: { bg: '#E8F5E9', text: '#2E7D32', border: '#66BB6A' },    // Green - done
  };

  switch (status) {
    case OrderStatus.PENDING:
      return {
        label: 'Pending',
        icon: 'schedule' as const,
        colors: {
          background: statusColors.pending.bg,
          text: statusColors.pending.text,
          border: statusColors.pending.border,
        },
      };
    case OrderStatus.CONFIRMED:
      return {
        label: 'Confirmed',
        icon: 'check-circle-outline' as const,
        colors: {
          background: statusColors.confirmed.bg,
          text: statusColors.confirmed.text,
          border: statusColors.confirmed.border,
        },
      };
    case OrderStatus.PREPARING:
      return {
        label: 'Preparing',
        icon: 'restaurant' as const,
        colors: {
          background: statusColors.preparing.bg,
          text: statusColors.preparing.text,
          border: statusColors.preparing.border,
        },
      };
    case OrderStatus.READY:
      return {
        label: 'Ready',
        icon: 'notifications' as const,
        colors: {
          background: statusColors.ready.bg,
          text: statusColors.ready.text,
          border: statusColors.ready.border,
        },
      };
    case OrderStatus.SERVED:
      return {
        label: 'Served',
        icon: 'done-all' as const,
        colors: {
          background: statusColors.served.bg,
          text: statusColors.served.text,
          border: statusColors.served.border,
        },
      };
    case OrderStatus.CANCELLED:
      return {
        label: 'Cancelled',
        icon: 'cancel' as const,
        colors: {
          background: statusColors.cancelled.bg,
          text: statusColors.cancelled.text,
          border: statusColors.cancelled.border,
        },
      };
    default:
      // Handle 'paid' and 'completed' statuses from UnifiedOrderStatus
      if (status === 'paid' || status === 'completed') {
        return {
          label: 'Paid',
          icon: 'check-circle' as const,
          colors: {
            background: statusColors.paid.bg,
            text: statusColors.paid.text,
            border: statusColors.paid.border,
          },
        };
      }
      // Handle 'draft' status from UnifiedOrderStatus
      if (status === 'draft') {
        return {
          label: 'Draft',
          icon: 'edit' as const,
          colors: {
            background: statusColors.pending.bg,
            text: statusColors.pending.text,
            border: statusColors.pending.border,
          },
        };
      }
      return {
        label: 'Unknown',
        icon: 'help-outline' as const,
        colors: {
          background: theme.colors.surfaceVariant,
          text: theme.colors.onSurfaceVariant,
          border: theme.colors.outline,
        },
      };
  }
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs / 2,
        iconSize: 14,
        textStyle: typography.labelSmall,
      };
    case 'large':
      return {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        iconSize: 20,
        textStyle: typography.labelLarge,
      };
    default: // medium
      return {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        iconSize: 16,
        textStyle: typography.labelMedium,
      };
  }
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
  style,
}) => {
  const { theme } = useTheme();
  const statusConfig = getStatusConfig(status, theme);
  const sizeConfig = getSizeConfig(size);

  const badgeStyle = [
    styles.badge,
    {
      backgroundColor: statusConfig.colors.background,
      borderColor: statusConfig.colors.border,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      paddingVertical: sizeConfig.paddingVertical,
    },
    style,
  ];

  const textStyle = [
    sizeConfig.textStyle,
    {
      color: statusConfig.colors.text,
      fontWeight: '600' as const,
    },
  ];

  return (
    <View style={badgeStyle}>
      <View style={styles.badgeContent}>
        {showIcon && (
          <MaterialIcons
            name={statusConfig.icon}
            size={sizeConfig.iconSize}
            color={statusConfig.colors.text}
            style={styles.icon}
          />
        )}
        <Text style={textStyle}>{statusConfig.label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs / 2,
  },
});

export default OrderStatusBadge;