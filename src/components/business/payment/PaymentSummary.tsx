/**
 * PaymentSummary
 * Professional order summary with tip calculation for payment processing
 * Supports both UnifiedOrder and legacy Order types
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { usePaymentConfiguration } from '@/context/payment';
import { Order, OrderItem } from '@/types/order.types';
import { UnifiedOrder, UnifiedOrderItem } from '@/types/unified-order.types';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';

// Support both unified and legacy order types
type AnyOrder = Order | UnifiedOrder;
type AnyOrderItem = OrderItem | UnifiedOrderItem;

// Helper to get item name from either format
const getItemName = (item: AnyOrderItem): string => {
  if ('name' in item && typeof item.name === 'string') {
    return item.name;
  }
  if ('menu_item' in item && item.menu_item?.name) {
    return item.menu_item.name;
  }
  return 'Unknown Item';
};

// Helper to get item price from either format
const getItemPrice = (item: AnyOrderItem): number => {
  if ('itemTotal' in item) return item.itemTotal;
  if ('total_price' in item) return item.total_price;
  return 0;
};

// Helper to get modifiers display string from either format
const getItemModifiers = (item: AnyOrderItem): string[] => {
  // UnifiedOrderItem has selectedModifiers
  if ('selectedModifiers' in item && item.selectedModifiers) {
    const modifiers: string[] = [];
    for (const mod of item.selectedModifiers) {
      if (mod.options) {
        for (const opt of mod.options) {
          const prefix = opt.priceAdjustment > 0 ? '+' : '';
          const priceStr = opt.priceAdjustment !== 0
            ? ` (${prefix}$${opt.priceAdjustment.toFixed(2)})`
            : '';
          modifiers.push(`${opt.optionName}${priceStr}`);
        }
      }
    }
    return modifiers;
  }
  // Legacy OrderItem has modifiers
  if ('modifiers' in item && item.modifiers) {
    return item.modifiers.map((m: any) => m.name || m);
  }
  return [];
};

// Helper to get order totals from either format
const getOrderTotals = (order: AnyOrder) => ({
  subtotal: (order as any).subtotal ?? 0,
  taxAmount: (order as UnifiedOrder).taxAmount ?? (order as Order).tax_amount ?? 0,
  discountAmount: (order as UnifiedOrder).discountAmount ?? (order as any).discount_amount ?? 0,
  specialInstructions: (order as UnifiedOrder).specialInstructions ?? (order as Order).special_instructions,
});

interface PaymentSummaryProps {
  order: AnyOrder;
  tipAmount: number;
  tipPercentage: number;
  onTipCalculation: (percentage: number, amount?: number) => void;
  /** Override subtotal+tax display (e.g. for per-guest split amounts) */
  overrideTotal?: number;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  order,
  tipAmount,
  tipPercentage,
  onTipCalculation,
  overrideTotal,
}) => {
  const { theme } = useTheme();
  const { defaultTipRates, taxRate } = usePaymentConfiguration();

  // Guard against undefined order
  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Order Summary
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          No order data available
        </Text>
      </View>
    );
  }

  // Get order totals using helper (supports both formats)
  const orderTotals = getOrderTotals(order);

  // Calculate totals (override when a per-guest split amount is provided)
  const subtotal = overrideTotal !== undefined ? overrideTotal : orderTotals.subtotal;
  const discountAmount = overrideTotal !== undefined ? 0 : (orderTotals.discountAmount || 0);
  const tax = overrideTotal !== undefined ? 0 : (orderTotals.taxAmount || subtotal * taxRate);
  const total = subtotal - discountAmount + tax + tipAmount;

  // Render order items
  const renderOrderItems = () => (
    <View style={styles.orderItemsContainer}>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurface }]}>
        Order Items
      </Text>

      {(order.items || []).map((item: AnyOrderItem, index: number) => {
        const modifiers = getItemModifiers(item);
        return (
          <View key={item.id || index}>
            <View style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemQuantity, { color: theme.colors.primary }]}>
                  {item.quantity}×
                </Text>
                <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>
                  {getItemName(item)}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
                {formatCurrency(getItemPrice(item))}
              </Text>
            </View>
            {modifiers.length > 0 && (
              <View style={styles.itemModifiers}>
                {modifiers.map((mod, modIndex) => (
                  <Text
                    key={modIndex}
                    style={[styles.modifierText, { color: theme.colors.primary }]}
                  >
                    + {mod}
                  </Text>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {orderTotals.specialInstructions && (
        <View style={styles.specialInstructions}>
          <MaterialIcons name="note" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.instructionsText, { color: theme.colors.onSurfaceVariant }]}>
            {orderTotals.specialInstructions}
          </Text>
        </View>
      )}
    </View>
  );

  // Render tip calculator
  const renderTipCalculator = () => (
    <View style={styles.tipCalculatorContainer}>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurface }]}>
        Add Tip
      </Text>
      
      {/* Tip percentage buttons */}
      <View style={styles.tipButtonsContainer}>
        {defaultTipRates.map((rate) => (
          <TouchableOpacity
            key={rate}
            style={[
              styles.tipButton,
              {
                backgroundColor: tipPercentage === rate 
                  ? theme.colors.primary 
                  : theme.colors.surfaceVariant,
                borderColor: tipPercentage === rate 
                  ? theme.colors.primary 
                  : theme.colors.outline,
              },
            ]}
            onPress={() => onTipCalculation(rate)}
          >
            <Text style={[
              styles.tipButtonText,
              {
                color: tipPercentage === rate 
                  ? theme.colors.onPrimary 
                  : theme.colors.onSurfaceVariant,
                fontWeight: tipPercentage === rate ? '700' : '500',
              },
            ]}>
              {rate}%
            </Text>
            <Text style={[
              styles.tipButtonAmount,
              {
                color: tipPercentage === rate 
                  ? theme.colors.onPrimary 
                  : theme.colors.onSurfaceVariant,
              },
            ]}>
              {formatCurrency((subtotal + tax) * (rate / 100))}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Custom tip button */}
        <TouchableOpacity
          style={[
            styles.tipButton,
            styles.customTipButton,
            {
              backgroundColor: tipPercentage === 0 && tipAmount > 0
                ? theme.colors.secondary 
                : theme.colors.surfaceVariant,
              borderColor: tipPercentage === 0 && tipAmount > 0
                ? theme.colors.secondary 
                : theme.colors.outline,
            },
          ]}
          onPress={() => {
            // Show custom tip input (simplified for now)
            const customAmount = 5.00; // This would be from an input modal
            onTipCalculation(0, customAmount);
          }}
        >
          <Text style={[
            styles.tipButtonText,
            {
              color: tipPercentage === 0 && tipAmount > 0
                ? theme.colors.onSecondary 
                : theme.colors.onSurfaceVariant,
            },
          ]}>
            Custom
          </Text>
          <Text style={[
            styles.tipButtonAmount,
            {
              color: tipPercentage === 0 && tipAmount > 0
                ? theme.colors.onSecondary 
                : theme.colors.onSurfaceVariant,
            },
          ]}>
            {tipPercentage === 0 && tipAmount > 0 ? formatCurrency(tipAmount) : '$0.00'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* No tip button */}
      <TouchableOpacity
        style={[
          styles.noTipButton,
          {
            backgroundColor: tipAmount === 0 
              ? theme.colors.errorContainer 
              : 'transparent',
            borderColor: theme.colors.outline,
          },
        ]}
        onPress={() => onTipCalculation(0, 0)}
      >
        <Text style={[
          styles.noTipText,
          {
            color: tipAmount === 0 
              ? theme.colors.onErrorContainer 
              : theme.colors.onSurfaceVariant,
          },
        ]}>
          No Tip
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render payment totals
  const renderPaymentTotals = () => (
    <View style={styles.totalsContainer}>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurface }]}>
        Payment Summary
      </Text>
      
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
          Subtotal
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
          {formatCurrency(subtotal)}
        </Text>
      </View>
      
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
          Tax ({(taxRate * 100).toFixed(2)}%)
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
          {formatCurrency(tax)}
        </Text>
      </View>
      
      {discountAmount > 0 && (
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            Discount
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.error }]}>
            -{formatCurrency(discountAmount)}
          </Text>
        </View>
      )}

      {tipAmount > 0 && (
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            Tip {tipPercentage > 0 && `(${tipPercentage}%)`}
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.secondary }]}>
            {formatCurrency(tipAmount)}
          </Text>
        </View>
      )}
      
      <View style={[styles.totalRow, styles.finalTotalRow]}>
        <Text style={[styles.finalTotalLabel, { color: theme.colors.onSurface }]}>
          Total
        </Text>
        <Text style={[styles.finalTotalValue, { color: theme.colors.primary }]}>
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Order Summary
      </Text>
      
      {renderOrderItems()}
      {renderTipCalculator()}
      {renderPaymentTotals()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.bodyMedium,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  sectionSubtitle: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  orderItemsContainer: {
    marginBottom: spacing.lg,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    ...typography.titleSmall,
    fontWeight: '700',
    minWidth: 32,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.bodyMedium,
    flex: 1,
  },
  itemPrice: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  itemModifiers: {
    marginLeft: 40,
    marginBottom: spacing.xs,
  },
  modifierText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  specialInstructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.sm,
  },
  instructionsText: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
    flex: 1,
    fontStyle: 'italic',
  },
  tipCalculatorContainer: {
    marginBottom: spacing.lg,
  },
  tipButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs / 2,
  },
  tipButton: {
    width: '24%',
    margin: spacing.xs / 2,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  customTipButton: {
    width: '48%',
  },
  tipButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  tipButtonAmount: {
    ...typography.bodySmall,
    marginTop: spacing.xs / 2,
  },
  noTipButton: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  noTipText: {
    ...typography.labelMedium,
    fontWeight: '500',
  },
  totalsContainer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  finalTotalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.2)',
  },
  totalLabel: {
    ...typography.bodyMedium,
  },
  totalValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  finalTotalLabel: {
    ...typography.titleMedium,
    fontWeight: '700',
  },
  finalTotalValue: {
    ...typography.titleLarge,
    fontWeight: '700',
  },
});