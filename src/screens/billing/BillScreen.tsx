/**
 * BillScreen - Main bill view with itemized order and split options
 * Displays order summary and provides access to split functionality
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { OrdersStackParamList } from '@/navigation/types';
import { useBillSplit } from '@/context/billing';
import { useUnifiedOrder, useUnifiedBilling } from '@/context/unified-order';
import { UnifiedOrder, UnifiedOrderItem, canAcceptPayment } from '@/types/unified-order.types';
import { ExtendedOrder, ExtendedOrderItem } from '@/types/order-extended.types';
import CombineBillsModal from './components/CombineBillsModal';
import BillTransferModal from './components/BillTransferModal';
import { DiscountModal, DiscountData } from '@/screens/orders/modals/DiscountModal';

// Adapter to convert UnifiedOrder to ExtendedOrder for BillSplitContext compatibility
const toExtendedOrder = (order: UnifiedOrder): ExtendedOrder => {
  return {
    ...order,
    status: order.status as any, // Status enums are compatible
    paymentStatus: order.paymentStatus as any,
    items: order.items.map(item => ({
      ...item,
      status: item.itemStatus as any,
    })) as ExtendedOrderItem[],
  } as ExtendedOrder;
};

type BillScreenNavigationProp = StackNavigationProp<OrdersStackParamList, 'Bill'>;
type BillScreenRouteProp = RouteProp<OrdersStackParamList, 'Bill'>;

interface BillItemRowProps {
  item: UnifiedOrderItem;
  formatPrice: (price: number) => string;
}

const BillItemRow: React.FC<BillItemRowProps> = React.memo(({ item, formatPrice }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    leftContent: {
      flex: 1,
    },
    name: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
    },
    modifiers: {
      marginTop: 4,
    },
    modifier: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.sm,
    },
    rightContent: {
      alignItems: 'flex-end',
    },
    quantity: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    price: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.name}>{item.name}</Text>
        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
          <View style={styles.modifiers}>
            {item.selectedModifiers.flatMap((modGroup, groupIndex) =>
              (modGroup.options || []).map((opt, optIndex) => (
                <Text key={`${groupIndex}-${optIndex}`} style={styles.modifier}>
                  + {opt.optionName}
                  {opt.priceAdjustment > 0 && ` (${formatPrice(opt.priceAdjustment)})`}
                </Text>
              ))
            )}
          </View>
        )}
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.quantity}>x{item.quantity}</Text>
        <Text style={styles.price}>{formatPrice(item.itemTotal)}</Text>
      </View>
    </View>
  );
});

BillItemRow.displayName = 'BillItemRow';

export const BillScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isPhone } = useResponsive();
  const navigation = useNavigation<BillScreenNavigationProp>();
  const route = useRoute<BillScreenRouteProp>();
  const { orderId, order: passedOrder } = route.params;

  // Use unified order context
  const { orders, getOrderById, processPayment, canProcessPayment, applyOrderDiscount } = useUnifiedOrder();
  const { setOrder, setSplitType, setGuestCount, state: billState } = useBillSplit();

  const [tipPercentage, setTipPercentage] = useState(0);
  const [isPaymentBlocked, setIsPaymentBlocked] = useState(false);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Find the order — prefer passed order, then context lookup, then getOrderById
  const order = useMemo(
    () => {
      const found = orders.find((o) => o.id === orderId || String(o.id) === String(orderId));
      if (found) return found;
      if (getOrderById) {
        const byId = getOrderById(orderId);
        if (byId) return byId;
      }
      // Fallback: use the order passed via navigation params
      return passedOrder || null;
    },
    [orders, orderId, getOrderById, passedOrder]
  );

  // Check if payment is allowed (order must be served)
  const canPay = useMemo(() => {
    if (!order) return false;
    return canAcceptPayment(order);
  }, [order]);

  // Initialize bill with order data
  useEffect(() => {
    if (order) {
      const extendedOrder = toExtendedOrder(order);
      setOrder(extendedOrder, extendedOrder.items);
    }
  }, [order, setOrder]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
      flex: 1,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    orderInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    orderLabel: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    orderValue: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginVertical: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outline,
    },
    summaryLabel: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
    },
    summaryValue: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 2,
      borderTopColor: theme.colors.primary,
      marginTop: theme.spacing.sm,
    },
    totalLabel: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
    },
    totalValue: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    tipSection: {
      marginTop: theme.spacing.md,
    },
    tipButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    tipButton: {
      flex: 1,
      minWidth: isPhone ? '28%' : undefined,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    tipButtonActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    tipButtonText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
    tipButtonTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    splitSection: {
      marginTop: theme.spacing.lg,
    },
    splitTitle: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.md,
    },
    splitOptions: {
      gap: theme.spacing.sm,
    },
    splitOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      paddingVertical: isPhone ? theme.spacing.xs : theme.spacing.sm,
      paddingHorizontal: isPhone ? theme.spacing.sm : theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    splitOptionIcon: {
      marginRight: theme.spacing.sm,
    },
    splitOptionContent: {
      flex: 1,
    },
    splitOptionTitle: {
      ...theme.typography.body1,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    splitOptionDescription: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    footer: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    payButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    payButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    discountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
    },
    discountLabel: {
      ...theme.typography.body1,
      color: theme.colors.success,
    },
    discountValue: {
      ...theme.typography.body1,
      color: theme.colors.success,
      fontWeight: '600',
    },
    discountButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    discountButtonText: {
      ...theme.typography.body2,
      color: theme.colors.primary,
    },
  });

  const formatPrice = useCallback((price: number): string => `$${price.toFixed(2)}`, []);

  const tipOptions = [
    { percentage: 0, label: 'No Tip' },
    { percentage: 15, label: '15%' },
    { percentage: 18, label: '18%' },
    { percentage: 20, label: '20%' },
    { percentage: 25, label: '25%' },
  ];

  const handleTipSelect = useCallback((percentage: number) => {
    setTipPercentage(percentage);
    // Calculate tip amount based on subtotal
    // This would be connected to the bill split context
  }, []);

  const handleSplitOption = useCallback(
    (splitType: 'equal' | 'by_items' | 'by_payment_method') => {
      if (!order) return;

      // Navigate to the appropriate split screen
      navigation.navigate('BillSplit', {
        orderId,
        splitType,
        guestCount: 2, // Default, will be configurable
      });
    },
    [navigation, orderId, order]
  );

  const handlePayFull = useCallback(() => {
    if (!order) return;

    // Enforce payment restriction - order must be served first
    if (!canPay) {
      Alert.alert(
        'Cannot Process Payment',
        `This order is currently "${order.status}". Payment can only be processed when the order is ready or served.`,
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('PaymentProcessing', {
      orderId,
      order,
    });
  }, [navigation, orderId, order, canPay]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDiscountApply = useCallback(async (discount: DiscountData) => {
    if (!order) return;
    try {
      await applyOrderDiscount(order.id, discount.type, discount.value);
      setShowDiscountModal(false);
    } catch {
      // error shown via toast in context
    }
  }, [order, applyOrderDiscount]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} testID="btn-bill-back">
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="receipt"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = order.items.reduce((sum: number, item: UnifiedOrderItem) => sum + item.itemTotal, 0);
  const discountAmount = order.discountAmount ?? 0;
  const tipAmount = subtotal * (tipPercentage / 100);
  const taxAmount = order.taxAmount ?? subtotal * 0.1;
  const total = subtotal - discountAmount + tipAmount + taxAmount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} testID="btn-bill-back">
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill - {order.tableName}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Order #</Text>
            <Text style={styles.orderValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Table</Text>
            <Text style={styles.orderValue}>{order.tableName}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Items</Text>
            <Text style={styles.orderValue}>
              {order.items.reduce((sum: number, item: UnifiedOrderItem) => sum + item.quantity, 0)}
            </Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item: UnifiedOrderItem) => (
            <BillItemRow key={item.id} item={item} formatPrice={formatPrice} />
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (10%)</Text>
            <Text style={styles.summaryValue}>{formatPrice(taxAmount)}</Text>
          </View>

          {(order.discountAmount ?? 0) > 0 && (
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>-{formatPrice(order.discountAmount ?? 0)}</Text>
            </View>
          )}

          {tipAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tip ({tipPercentage}%)</Text>
              <Text style={styles.summaryValue}>{formatPrice(tipAmount)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>

          {/* Discount button */}
          <TouchableOpacity
            style={styles.discountButton}
            onPress={() => setShowDiscountModal(true)}
            testID="btn-bill-discount"
          >
            <MaterialCommunityIcons name="tag-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.discountButtonText}>
              {(order.discountAmount ?? 0) > 0
                ? `Discount Applied: -${formatPrice(order.discountAmount ?? 0)}`
                : 'Apply Discount'}
            </Text>
          </TouchableOpacity>

          {/* Tip Section */}
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>Add Tip</Text>
            <View style={styles.tipButtons}>
              {tipOptions.map((option) => (
                <TouchableOpacity
                  key={option.percentage}
                  style={[
                    styles.tipButton,
                    tipPercentage === option.percentage && styles.tipButtonActive,
                  ]}
                  onPress={() => handleTipSelect(option.percentage)}
                  testID={`btn-tip-${option.percentage}`}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      tipPercentage === option.percentage && styles.tipButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Split / Combine Options */}
        <View style={styles.section}>
          <Text style={styles.splitTitle}>Split / Combine Bill</Text>
          <View style={styles.splitOptions}>
            <TouchableOpacity
              style={styles.splitOption}
              onPress={() => handleSplitOption('equal')}
              testID="btn-split-equally"
            >
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color={theme.colors.outline}
                style={styles.splitOptionIcon}
              />
              <View style={styles.splitOptionContent}>
                <Text style={styles.splitOptionTitle}>Split Equally</Text>
                <Text style={styles.splitOptionDescription}>
                  Divide the bill equally among guests
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.splitOption}
              onPress={() => handleSplitOption('by_items')}
              testID="btn-split-by-items"
            >
              <MaterialCommunityIcons
                name="format-list-checks"
                size={24}
                color={theme.colors.outline}
                style={styles.splitOptionIcon}
              />
              <View style={styles.splitOptionContent}>
                <Text style={styles.splitOptionTitle}>Split by Items</Text>
                <Text style={styles.splitOptionDescription}>
                  Assign items to individual guests
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.splitOption}
              onPress={() => handleSplitOption('by_payment_method')}
              testID="btn-split-by-payment"
            >
              <MaterialCommunityIcons
                name="credit-card-multiple"
                size={24}
                color={theme.colors.outline}
                style={styles.splitOptionIcon}
              />
              <View style={styles.splitOptionContent}>
                <Text style={styles.splitOptionTitle}>Multiple Payments</Text>
                <Text style={styles.splitOptionDescription}>
                  Pay with multiple cards or methods
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.splitOption}
              onPress={() => setShowCombineModal(true)}
              testID="btn-combine-bills"
            >
              <MaterialCommunityIcons
                name="call-merge"
                size={24}
                color={theme.colors.outline}
                style={styles.splitOptionIcon}
              />
              <View style={styles.splitOptionContent}>
                <Text style={styles.splitOptionTitle}>Combine Bills</Text>
                <Text style={styles.splitOptionDescription}>
                  Merge another table's order into this bill
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.splitOption}
              onPress={() => setShowTransferModal(true)}
              testID="btn-bill-transfer"
            >
              <MaterialCommunityIcons
                name="transfer"
                size={24}
                color={theme.colors.outline}
                style={styles.splitOptionIcon}
              />
              <View style={styles.splitOptionContent}>
                <Text style={styles.splitOptionTitle}>Transfer Items</Text>
                <Text style={styles.splitOptionDescription}>
                  Move items to another table's bill
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CombineBillsModal
        visible={showCombineModal}
        currentOrderId={orderId}
        onClose={() => setShowCombineModal(false)}
        onCombined={() => setShowCombineModal(false)}
      />

      <BillTransferModal
        visible={showTransferModal}
        currentOrderId={orderId}
        onClose={() => setShowTransferModal(false)}
        onTransferred={() => setShowTransferModal(false)}
      />

      <DiscountModal
        visible={showDiscountModal}
        currentAmount={order.subtotal}
        currentDiscount={
          order.discountType && order.discountValue
            ? { type: order.discountType as 'percentage' | 'fixed', value: order.discountValue, reason: '', requiresApproval: false }
            : undefined
        }
        onApply={handleDiscountApply}
        onRemove={() => setShowDiscountModal(false)}
        onCancel={() => setShowDiscountModal(false)}
      />

      <View style={styles.footer}>
        {/* Payment Status Indicator */}
        {!canPay && (
          <View style={{
            backgroundColor: theme.colors.warningContainer,
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.sm,
            marginBottom: theme.spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color={theme.colors.warning}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text style={{
              ...theme.typography.body2,
              color: theme.colors.warning,
              flex: 1,
            }}>
              Order status: {order?.status?.toUpperCase()}. Payment available when order is READY or SERVED.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.payButton,
            !canPay && { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.6 }
          ]}
          onPress={handlePayFull}
          disabled={!canPay}
          testID="btn-pay-full"
        >
          <MaterialCommunityIcons
            name={canPay ? "cash" : "lock"}
            size={24}
            color={theme.colors.onPrimary}
          />
          <Text style={styles.payButtonText}>
            {canPay ? `Pay ${formatPrice(total)}` : 'Awaiting Service'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BillScreen;
