/**
 * Order Status Manager - Focused on status updates and status change modals
 * Follows Single Responsibility Principle - handles order status management only
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { OrderStatusBadge } from '@/components/business/order';
import { useTheme } from '@/hooks/useTheme';
import { showToast } from '@/utils/toast';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface OrderStatusManagerProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  loading?: boolean;
}

export const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  order,
  onStatusUpdate,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Get available status transitions based on current status
  const getAvailableStatusTransitions = useCallback((currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return [OrderStatus.CONFIRMED];
      case OrderStatus.CONFIRMED:
        return [OrderStatus.PREPARING];
      case OrderStatus.PREPARING:
        return [OrderStatus.READY];
      case OrderStatus.READY:
        return [OrderStatus.SERVED];
      default:
        return [];
    }
  }, []);

  const availableStatuses = getAvailableStatusTransitions(order.status);

  const handleStatusUpdate = useCallback(async (newStatus: OrderStatus) => {
    try {
      await onStatusUpdate(order.id, newStatus);
      setShowStatusModal(false);
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update order status',
      });
    }
  }, [order.id, onStatusUpdate]);

  if (availableStatuses.length === 0) {
    return null; // No status updates available
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.updateButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowStatusModal(true)}
        disabled={loading}
      >
        <MaterialIcons name="update" size={20} color={theme.colors.onPrimary} />
        <Text style={[styles.updateButtonText, { color: theme.colors.onPrimary }]}>
          Update Status
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Update Order Status
            </Text>
            
            {availableStatuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusOption, { borderColor: theme.colors.outline }]}
                onPress={() => handleStatusUpdate(status)}
                disabled={loading}
              >
                <OrderStatusBadge status={status} size="small" />
                <Text style={[styles.statusOptionText, { color: theme.colors.onSurface }]}>
                  Mark as {status}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setShowStatusModal(false)}
              disabled={loading}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.onSurfaceVariant }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  updateButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.headlineSmall,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  statusOptionText: {
    ...typography.bodyLarge,
    fontWeight: '500',
    marginLeft: spacing.md,
    textTransform: 'capitalize',
  },
  modalCancelButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
});