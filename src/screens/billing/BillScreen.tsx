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
import { OrdersStackParamList } from '@/navigation/types';
import { useBillSplit } from '@/context/billing';
import { useEnhancedOrder } from '@/context/order';
import { ExtendedOrderItem } from '@/types/order-extended.types';

type BillScreenNavigationProp = StackNavigationProp<OrdersStackParamList, 'Bill'>;
type BillScreenRouteProp = RouteProp<OrdersStackParamList, 'Bill'>;

interface BillItemRowProps {
  item: ExtendedOrderItem;
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
            {item.selectedModifiers.map((mod, index) => (
              <Text key={index} style={styles.modifier}>
                + {mod.name}
                {mod.priceAdjustment > 0 && ` (${formatPrice(mod.priceAdjustment)})`}
              </Text>
            ))}
          </View>
        )}
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.quantity}>x{item.quantity}</Text>
        <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
      </View>
    </View>
  );
});

BillItemRow.displayName = 'BillItemRow';

export const BillScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<BillScreenNavigationProp>();
  const route = useRoute<BillScreenRouteProp>();
  const { orderId } = route.params;

  const { state: orderState, selectors } = useEnhancedOrder();
  const { setOrder, setSplitType, setGuestCount, state: billState } = useBillSplit();

  const [tipPercentage, setTipPercentage] = useState(0);

  // Find the order
  const order = useMemo(
    () => orderState.orders.find((o) => o.id === orderId) || null,
    [orderState.orders, orderId]
  );

  // Initialize bill with order data
  useEffect(() => {
    if (order) {
      setOrder(order, order.items);
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
      ...theme.typography.h4,
      color: theme.colors.onSurface,
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
      paddingVertical: theme.spacing.xs,
    },
    summaryLabel: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
    },
    summaryValue: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
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
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    tipButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
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
    },
    tipButtonTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    splitSection: {
      marginTop: theme.spacing.lg,
    },
    splitTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    splitOptions: {
      gap: theme.spacing.sm,
    },
    splitOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    splitOptionIcon: {
      marginRight: theme.spacing.md,
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

    navigation.navigate('PaymentProcessing', {
      orderId,
      order,
    });
  }, [navigation, orderId, order]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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

  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tipAmount = subtotal * (tipPercentage / 100);
  const taxAmount = subtotal * 0.1; // 10% tax
  const total = subtotal + tipAmount + taxAmount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
              {order.items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <BillItemRow key={item.id} item={item} formatPrice={formatPrice} />
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (10%)</Text>
            <Text style={styles.summaryValue}>{formatPrice(taxAmount)}</Text>
          </View>

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

        {/* Split Options */}
        <View style={styles.section}>
          <Text style={styles.splitTitle}>Split Bill</Text>
          <View style={styles.splitOptions}>
            <TouchableOpacity
              style={styles.splitOption}
              onPress={() => handleSplitOption('equal')}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={32}
                color={theme.colors.primary}
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
            >
              <MaterialCommunityIcons
                name="format-list-checks"
                size={32}
                color={theme.colors.primary}
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
            >
              <MaterialCommunityIcons
                name="credit-card-multiple"
                size={32}
                color={theme.colors.primary}
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
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayFull}>
          <MaterialCommunityIcons
            name="cash"
            size={24}
            color={theme.colors.onPrimary}
          />
          <Text style={styles.payButtonText}>Pay {formatPrice(total)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BillScreen;
