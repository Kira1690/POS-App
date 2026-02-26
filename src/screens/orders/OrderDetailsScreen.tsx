/**
 * OrderDetailsScreen - Refactored screen using SOLID-compliant components
 * Layout composition, navigation, and data loading only
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from 'react-native';
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
import { spacing } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

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

  useEffect(() => {
    if (!order) {
      navigation?.goBack();
    }
  }, [order, navigation]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handlePaymentNavigation = useCallback(() => {
    if (!order) return;
    navigation.navigate('Bill', {
      orderId: order.id,
    });
  }, [order, navigation]);

  const handlePrint = useCallback((type: 'KOT' | 'Receipt') => {
    // Print functionality would be implemented here
    console.log(`Printing ${type} for order ${order?.orderNumber}`);
  }, [order]);

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
        <OrderActionPanel
          order={order as any}
          onPrint={handlePrint}
          onPayment={(order.status === 'ready' || order.status === 'served') ? handlePaymentNavigation : undefined}
          onCancelOrder={(orderId) => cancelOrder(orderId, 'Cancelled by user')}
          loading={isLoadingDetails}
        />
      </View>
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
});

export default OrderDetailsScreen;