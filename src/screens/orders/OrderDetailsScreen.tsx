/**
 * OrderDetailsScreen - Refactored screen using SOLID-compliant components
 * Layout composition, navigation, and data loading only
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUnifiedOrderManagement } from '@/context/unified-order';
import { useTheme } from '@/hooks/useTheme';
import { OrderStatus } from '@/types/common.types';
import {
  OrderDetailsHeader,
  OrderDetailsInfo,
  OrderItemsList,
  OrderTimeline,
  OrderStatusManager,
  OrderActionPanel
} from '@/components/business/order';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { showToast } from '@/utils/toast';
import { usePrinter } from '@/context/printer/PrinterContext';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';
import { RefundModal } from './modals/RefundModal';
import type { UnifiedOrder } from '@/types/unified-order.types';

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
    orders,
    selectedOrderId,
    updateOrderStatus,
    cancelOrder,
    isLoading: isLoadingDetails,
  } = useUnifiedOrderManagement();

  // Get selected order from orders list
  const order = useMemo(() => {
    const orderId = route?.params?.orderId || selectedOrderId;
    return orders.find((o) => o.id === orderId) || null;
  }, [orders, route?.params?.orderId, selectedOrderId]);

  // Track if user navigated away to a child screen (Bill, Payment, etc.)
  const navigatedToChild = useRef(false);
  const isFocused = useIsFocused();

  // Only navigate back if order is null, screen IS focused, and we didn't navigate to a child
  useEffect(() => {
    if (!order && isFocused && !navigatedToChild.current) {
      const timeout = setTimeout(() => {
        if (isFocused && !navigatedToChild.current) {
          navigation?.goBack();
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [order, navigation, isFocused]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handlePaymentNavigation = useCallback(() => {
    if (!order) return;
    navigatedToChild.current = true;
    navigation.navigate('Bill', {
      orderId: order.id,
      order,
    });
  }, [order, navigation]);

  const { printKOT, printReceipt } = usePrinter();
  const { isManagementLevel, user, restaurant } = useAuthStatus();
  const [showRefundModal, setShowRefundModal] = useState(false);

  const handleRefund = useCallback(() => {
    setShowRefundModal(true);
  }, []);

  const handleRefundComplete = useCallback(() => {
    setShowRefundModal(false);
    showToast({
      type: 'success',
      title: 'Refund Submitted',
      message: `Refund request for order ${(order as any)?.order_number || order?.id} has been submitted`,
    });
  }, [order]);

  const handlePrint = useCallback((type: 'KOT' | 'Receipt') => {
    if (!order) return;
    const unifiedOrder = order as unknown as UnifiedOrder;
    if (type === 'KOT') {
      printKOT(unifiedOrder).catch(() => {});
    } else {
      printReceipt(unifiedOrder).catch(() => {});
    }
  }, [order, printKOT, printReceipt]);

  // Error state for missing order
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <OrderDetailsHeader 
        order={order} 
        onBack={handleBack}
        onMenuPress={() => {/* Menu options */}}
      />
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OrderDetailsInfo order={order} />
        <OrderItemsList order={order} showTotals={true} />
        
        {/* Timeline Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Order Progress
          </Text>
          <OrderTimeline order={order} />
        </View>
      </ScrollView>
      
      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <OrderStatusManager
          order={order as any}
          onStatusUpdate={(orderId, newStatus) => updateOrderStatus(orderId, newStatus as any)}
          loading={isLoadingDetails}
        />
        {/* Add More Items — managers+ only for sent orders */}
        {isManagementLevel && (order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready') && (
          <TouchableOpacity
            style={[styles.addItemsButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => navigation?.navigate('POSOrder', { editOrderId: order.id })}
            testID="btn-add-items-to-order"
          >
            <MaterialIcons name="add-shopping-cart" size={20} color={theme.colors.primary} />
            <Text style={[styles.addItemsText, { color: theme.colors.primary }]}>
              Add More Items
            </Text>
          </TouchableOpacity>
        )}
        <OrderActionPanel
          order={order as any}
          onPrint={handlePrint}
          onPayment={(order.status === 'ready' || order.status === 'served') ? handlePaymentNavigation : undefined}
          onRefund={isManagementLevel && (order.status === 'paid' || (order as any).payment_status === 'paid' || (order as any).paymentStatus === 'paid') ? handleRefund : undefined}
          onCancelOrder={isManagementLevel ? (orderId) => cancelOrder(orderId, 'Cancelled by user') : undefined}
          loading={isLoadingDetails}
        />
      </View>

      {/* Refund Modal */}
      {order && (
        <RefundModal
          visible={showRefundModal}
          order={order as any}
          restaurantId={restaurant?.id?.toString() || user?.default_restaurant_id || ''}
          userId={user?.id?.toString() || ''}
          onClose={() => setShowRefundModal(false)}
          onRefundComplete={handleRefundComplete}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsSection: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.headlineSmall,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  addItemsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  addItemsText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;