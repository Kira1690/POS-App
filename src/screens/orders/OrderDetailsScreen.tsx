/**
 * OrderDetailsScreen - Complete order management interface
 * Features order details, item modifications, status management, and timeline
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrderManagement } from '@/context/order';
import { useTheme } from '@/hooks/useTheme';
import { Order, OrderItem } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { OrderStatusBadge, OrderTimeline } from '@/components/business/order';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { showToast } from '@/utils/toast';

interface OrderDetailsScreenProps {
  navigation?: any;
  route?: {
    params?: {
      orderId?: string;
    };
  };
}

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const {
    selectedOrder,
    updateOrderStatus,
    cancelOrder,
  } = useOrderManagement();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  const order = selectedOrder;

  useEffect(() => {
    if (!order) {
      navigation?.goBack();
    }
  }, [order, navigation]);

  // Handle status update
  const handleStatusUpdate = useCallback(async (newStatus: OrderStatus) => {
    if (!order) return;

    setLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus);
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
    } finally {
      setLoading(false);
    }
  }, [order, updateOrderStatus]);

  // Handle order cancellation
  const handleCancelOrder = useCallback(async () => {
    if (!order || !cancelReason.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please provide a cancellation reason',
      });
      return;
    }

    setLoading(true);
    try {
      await cancelOrder(order.id, cancelReason.trim());
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
    } finally {
      setLoading(false);
    }
  }, [order, cancelReason, cancelOrder]);

  // Handle print operations
  const handlePrint = useCallback((type: 'KOT' | 'Receipt') => {
    if (!order) return;
    
    showToast({
      type: 'info',
      title: `Print ${type}`,
      message: `Printing ${type} for ${order.order_number}`,
    });
  }, [order]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get available status transitions
  const getAvailableStatusTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
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
  };

  const availableStatuses = getAvailableStatusTransitions(order.status);

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {order.order_number}
        </Text>
        <OrderStatusBadge status={order.status} size="small" />
      </View>
      
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => {/* Show options menu */}}
      >
        <MaterialIcons name="more-vert" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
    </View>
  );

  // Render order info section
  const renderOrderInfo = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Order Information
      </Text>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Table
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {order.table_id || 'Takeaway'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Order Time
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {formatDateTime(order.created_at)}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Items
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {order.items.length} items
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Total
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(order.total_amount)}
          </Text>
        </View>
      </View>
      
      {order.special_instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.onSurface }]}>
            Special Instructions
          </Text>
          <Text style={[styles.instructionsText, { color: theme.colors.onSurfaceVariant }]}>
            {order.special_instructions}
          </Text>
        </View>
      )}
    </View>
  );

  // Render order items section
  const renderOrderItems = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Order Items
      </Text>
      
      {order.items.map((item, index) => (
        <View key={item.id} style={styles.orderItem}>
          <View style={styles.itemMain}>
            <Text style={[styles.itemQuantity, { color: theme.colors.primary }]}>
              {item.quantity}×
            </Text>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>
                {item.menu_item.name}
              </Text>
              {item.special_instructions && (
                <Text style={[styles.itemInstructions, { color: theme.colors.onSurfaceVariant }]}>
                  Note: {item.special_instructions}
                </Text>
              )}
            </View>
            <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
              {formatCurrency(item.total_price)}
            </Text>
          </View>
          
          {index < order.items.length - 1 && (
            <View style={[styles.itemDivider, { backgroundColor: theme.colors.outline }]} />
          )}
        </View>
      ))}
      
      {/* Order totals */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            Subtotal
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {formatCurrency(order.subtotal)}
          </Text>
        </View>
        
        {order.tax_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tax
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(order.tax_amount)}
            </Text>
          </View>
        )}
        
        {order.discount_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Discount
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.error }]}>
              -{formatCurrency(order.discount_amount)}
            </Text>
          </View>
        )}
        
        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurface, fontWeight: '700' }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(order.total_amount)}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render order timeline
  const renderTimeline = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Order Progress
      </Text>
      <OrderTimeline order={order} />
    </View>
  );

  // Handle payment navigation
  const handlePaymentNavigation = useCallback(() => {
    if (!order) return;
    
    navigation.navigate('PaymentProcessing', {
      order: order,
      orderId: order.id,
    });
  }, [order, navigation]);

  // Render action buttons
  const renderActions = () => {
    if (order.status === OrderStatus.SERVED || order.status === OrderStatus.CANCELLED) {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.outline }]}
            onPress={() => handlePrint('Receipt')}
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
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.outline }]}
          onPress={() => handlePrint('KOT')}
        >
          <MaterialIcons name="print" size={20} color={theme.colors.onSurface} />
          <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>
            Print KOT
          </Text>
        </TouchableOpacity>
        
        {/* Payment Button - Available when order is ready */}
        {order.status === OrderStatus.READY && (
          <TouchableOpacity
            style={[styles.actionButton, styles.paymentButton, { backgroundColor: theme.colors.secondary }]}
            onPress={handlePaymentNavigation}
          >
            <MaterialIcons name="payment" size={20} color={theme.colors.onSecondary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>
              Process Payment
            </Text>
          </TouchableOpacity>
        )}
        
        {availableStatuses.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowStatusModal(true)}
          >
            <MaterialIcons name="update" size={20} color={theme.colors.onPrimary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
              Update Status
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
    );
  };

  // Render status update modal
  const renderStatusModal = () => (
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
          >
            <Text style={[styles.modalCancelText, { color: theme.colors.onSurfaceVariant }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render cancel order modal
  const renderCancelModal = () => (
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
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderOrderInfo()}
        {renderOrderItems()}
        {renderTimeline()}
      </ScrollView>
      
      {renderActions()}
      {renderStatusModal()}
      {renderCancelModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.headlineMedium,
    fontWeight: '700',
  },
  menuButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    margin: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...typography.titleLarge,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  infoItem: {
    width: '50%',
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...typography.labelMedium,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    ...typography.bodyLarge,
    fontWeight: '500',
  },
  instructionsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  instructionsTitle: {
    ...typography.titleSmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  instructionsText: {
    ...typography.bodyMedium,
    lineHeight: 20,
  },
  orderItem: {
    marginBottom: spacing.sm,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemQuantity: {
    ...typography.titleMedium,
    fontWeight: '700',
    minWidth: 40,
    marginRight: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.bodyLarge,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  itemInstructions: {
    ...typography.bodySmall,
    fontStyle: 'italic',
  },
  itemPrice: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  itemDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  totalsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  finalTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.2)',
  },
  totalLabel: {
    ...typography.bodyMedium,
  },
  totalValue: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs / 2,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
  },
  paymentButton: {
    // backgroundColor set dynamically
  },
  errorButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.headlineMedium,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.headlineSmall,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  statusOptionText: {
    ...typography.bodyLarge,
    fontWeight: '500',
    marginLeft: spacing.md,
  },
  reasonInput: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  modalActionText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  modalCancelText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;