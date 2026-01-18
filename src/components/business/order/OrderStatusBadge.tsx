/**
 * OrderStatusBadge - Professional status indicator component
 * Provides color-coded status badges with consistent styling across all screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OrderStatus } from '@/types/common.types';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/design-system/theme/typography';
import { spacing, borderRadius } from '@/design-system/theme/spacing';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: any;
}

const getStatusConfig = (status: OrderStatus, theme: any) => {
  // Defensive: fallback if theme or theme.colors.status doesn't exist
  const statusColors = theme?.colors?.status || {
    pending: { bg: '#FFF8E1', text: '#E65100', border: '#FFB74D' },
    confirmed: { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
    preparing: { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' },
    ready: { bg: '#F3E5F5', text: '#7B1FA2', border: '#BA68C8' },
    served: { bg: '#E0F7FA', text: '#00838F', border: '#4DD0E1' },
    cancelled: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
    paid: { bg: '#E8F5E9', text: '#1B5E20', border: '#66BB6A' },
    completed: { bg: '#E8F5E9', text: '#1B5E20', border: '#66BB6A' },
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