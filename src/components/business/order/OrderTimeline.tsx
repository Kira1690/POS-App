/**
 * OrderTimeline - Professional order progress display component
 * Shows visual timeline of order progress with timestamps
 * Supports both UnifiedOrder and legacy Order types
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OrderStatus } from '@/types/common.types';
import { UnifiedOrderStatus } from '@/types/unified-order.types';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/design-system/theme/typography';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { formatTime } from '@/utils/date';
import { AnyOrder, getOrderTimestamps } from '@/utils/orderFormatHelpers';

type StatusType = OrderStatus | UnifiedOrderStatus;

interface OrderTimelineProps {
  order: AnyOrder;
  style?: any;
}

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: 'receipt' | 'check-circle' | 'restaurant' | 'notifications' | 'done-all';
  timestamp?: string;
  completed: boolean;
  active: boolean;
}

const getTimelineSteps = (order: AnyOrder): TimelineStep[] => {
  const currentStatusIndex = getStatusIndex(order.status);
  const timestamps = getOrderTimestamps(order);

  return [
    {
      status: OrderStatus.PENDING,
      label: 'Order Placed',
      icon: 'receipt' as const,
      timestamp: timestamps.createdAt,
      completed: true,
      active: currentStatusIndex === 0,
    },
    {
      status: OrderStatus.CONFIRMED,
      label: 'Confirmed',
      icon: 'check-circle' as const,
      timestamp: timestamps.submittedAt,
      completed: currentStatusIndex >= 1,
      active: currentStatusIndex === 1,
    },
    {
      status: OrderStatus.PREPARING,
      label: 'Preparing',
      icon: 'restaurant' as const,
      timestamp: timestamps.preparingAt,
      completed: currentStatusIndex >= 2,
      active: currentStatusIndex === 2,
    },
    {
      status: OrderStatus.READY,
      label: 'Ready',
      icon: 'notifications' as const,
      timestamp: timestamps.readyAt,
      completed: currentStatusIndex >= 3,
      active: currentStatusIndex === 3,
    },
    {
      status: OrderStatus.SERVED,
      label: 'Served',
      icon: 'done-all' as const,
      timestamp: timestamps.servedAt,
      completed: currentStatusIndex >= 4,
      active: currentStatusIndex === 4,
    },
  ].filter(step => order.status !== OrderStatus.CANCELLED || step.completed);
};

const getStatusIndex = (status: StatusType): number => {
  // Handle both enum values and string values
  const statusStr = String(status);
  switch (statusStr) {
    case 'pending':
    case OrderStatus.PENDING: return 0;
    case 'confirmed':
    case OrderStatus.CONFIRMED: return 1;
    case 'preparing':
    case OrderStatus.PREPARING: return 2;
    case 'ready':
    case OrderStatus.READY: return 3;
    case 'served':
    case OrderStatus.SERVED: return 4;
    default: return 0;
  }
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, style }) => {
  const { theme } = useTheme();

  // Guard against undefined order
  if (!order) {
    return (
      <View style={[styles.container, style]}>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          No order data
        </Text>
      </View>
    );
  }

  const steps = getTimelineSteps(order);
  const timestamps = getOrderTimestamps(order);

  // Special handling for cancelled orders
  if (order.status === OrderStatus.CANCELLED) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.cancelledContainer}>
          <MaterialIcons
            name="cancel"
            size={24}
            color={theme.colors.error}
          />
          <Text style={[styles.cancelledText, { color: theme.colors.error }]}>
            Order Cancelled
          </Text>
          <Text style={[styles.cancelledTime, { color: theme.colors.onSurfaceVariant }]}>
            {formatTime(timestamps.updatedAt || timestamps.createdAt)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {steps.map((step, index) => (
        <View key={step.status} style={styles.stepContainer}>
          <View style={styles.stepIndicator}>
            {/* Connection line to previous step */}
            {index > 0 && (
              <View 
                style={[
                  styles.connectionLine,
                  {
                    backgroundColor: step.completed 
                      ? theme.colors.primary 
                      : theme.colors.outline,
                  },
                ]} 
              />
            )}
            
            {/* Step circle */}
            <View 
              style={[
                styles.stepCircle,
                {
                  backgroundColor: step.completed
                    ? theme.colors.primary
                    : step.active
                    ? theme.colors.primaryContainer
                    : theme.colors.surface,
                  borderColor: step.completed || step.active
                    ? theme.colors.primary
                    : theme.colors.outline,
                },
              ]}
            >
              <MaterialIcons
                name={step.icon}
                size={16}
                color={
                  step.completed
                    ? theme.colors.onPrimary
                    : step.active
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceVariant
                }
              />
            </View>
            
            {/* Connection line to next step */}
            {index < steps.length - 1 && (
              <View 
                style={[
                  styles.connectionLine,
                  {
                    backgroundColor: step.completed 
                      ? theme.colors.primary 
                      : theme.colors.outline,
                  },
                ]} 
              />
            )}
          </View>
          
          {/* Step content */}
          <View style={styles.stepContent}>
            <Text 
              style={[
                styles.stepLabel,
                {
                  color: step.completed || step.active
                    ? theme.colors.onSurface
                    : theme.colors.onSurfaceVariant,
                  fontWeight: step.active ? '700' : '500',
                },
              ]}
            >
              {step.label}
            </Text>
            {step.timestamp && (
              <Text style={[styles.stepTime, { color: theme.colors.onSurfaceVariant }]}>
                {formatTime(step.timestamp)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 60,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 40,
  },
  connectionLine: {
    width: 2,
    height: 20,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    marginLeft: spacing.md,
    paddingTop: spacing.xs,
  },
  stepLabel: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs / 2,
  },
  stepTime: {
    ...typography.bodySmall,
  },
  cancelledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFEBEE',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  cancelledText: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginLeft: spacing.sm,
    flex: 1,
  },
  cancelledTime: {
    ...typography.bodySmall,
  },
});

export default OrderTimeline;