/**
 * Order Action Panel - Focused on action buttons and order operations
 * Follows Single Responsibility Principle - handles order actions only
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { useTheme } from '@/hooks/useTheme';
import { showToast } from '@/utils/toast';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface OrderActionPanelProps {
  order: Order;
  onPrint: (type: 'KOT' | 'Receipt') => void;
  onPayment?: () => void;
  onCancelOrder: (orderId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export const OrderActionPanel: React.FC<OrderActionPanelProps> = ({
  order,
  onPrint,
  onPayment,
  onCancelOrder,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelOrder = useCallback(async () => {
    if (!cancelReason.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please provide a cancellation reason',
      });
      return;
    }

    try {
      await onCancelOrder(order.id, cancelReason.trim());
      setShowCancelModal(false);
      setCancelReason('');
      showToast({
        type: 'success',
        title: 'Order Cancelled',
        message: `Order ${order.order_number} has been cancelled`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel order',
      });
    }
  }, [order.id, order.order_number, cancelReason, onCancelOrder]);

  // Show limited actions for completed/cancelled orders
  if (order.status === OrderStatus.SERVED || order.status === OrderStatus.CANCELLED) {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.outline }]}
          onPress={() => onPrint('Receipt')}
        >
          <MaterialIcons name="print" size={20} color={theme.colors.onSurface} />
          <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>
            Print Receipt
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.outline }]}
          onPress={() => onPrint('KOT')}
        >
          <MaterialIcons name="print" size={20} color={theme.colors.onSurface} />
          <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>
            Print KOT
          </Text>
        </TouchableOpacity>
        
        {/* Payment Button - Available when order is ready */}
        {order.status === OrderStatus.READY && onPayment && (
          <TouchableOpacity
            style={[styles.actionButton, styles.paymentButton, { backgroundColor: theme.colors.secondary }]}
            onPress={onPayment}
          >
            <MaterialIcons name="payment" size={20} color={theme.colors.onSecondary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>
              Process Payment
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.errorButton, { borderColor: theme.colors.error }]}
          onPress={() => setShowCancelModal(true)}
        >
          <MaterialIcons name="cancel" size={20} color={theme.colors.error} />
          <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
            Cancel Order
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cancel Order Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Cancel Order
            </Text>
            
            <Text style={[styles.modalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Please provide a reason for cancelling this order:
            </Text>
            
            <TextInput
              style={[styles.reasonInput, { 
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface,
              }]}
              placeholder="Cancellation reason..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                <Text style={[styles.modalActionText, { color: theme.colors.onSurfaceVariant }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalActionButton, { backgroundColor: theme.colors.error }]}
                onPress={handleCancelOrder}
                disabled={loading || !cancelReason.trim()}
              >
                <Text style={[styles.modalActionText, { color: theme.colors.onError }]}>
                  Cancel Order
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 48,
    flex: 1,
    minWidth: 120,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  paymentButton: {
    // backgroundColor set via props
  },
  errorButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    ...typography.labelMedium,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.headlineSmall,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalSubtitle: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  reasonInput: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalActionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalActionText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
});