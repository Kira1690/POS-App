/**
 * SplitByPayment - Multiple payment methods split component
 *
 * Allows splitting the bill across different payment methods:
 * - Add multiple payment methods (cash, card, etc.)
 * - Specify amount per payment method
 * - Track allocated vs remaining amounts
 */

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ExtendedPaymentMethod, PaymentMethodSplit, PaymentSplitResult } from '@/types/billing.types';
import { paymentSplitCalculator } from '@/services/billing/SplitCalculators';

export interface SplitByPaymentProps {
  totalAmount: number;
  payments: PaymentMethodSplit[];
  onPaymentsChange: (payments: PaymentMethodSplit[]) => void;
  onProcessPayments: () => void;
  formatPrice?: (price: number) => string;
}

interface PaymentMethodOption {
  method: ExtendedPaymentMethod;
  icon: string;
  label: string;
}

const PAYMENT_OPTIONS: PaymentMethodOption[] = [
  { method: 'cash', icon: 'cash', label: 'Cash' },
  { method: 'card', icon: 'credit-card', label: 'Card' },
  { method: 'mobile_payment', icon: 'cellphone', label: 'Mobile' },
  { method: 'gift_card', icon: 'card-account-details', label: 'Gift Card' },
];

export const SplitByPayment: React.FC<SplitByPaymentProps> = memo(
  ({
    totalAmount,
    payments,
    onPaymentsChange,
    onProcessPayments,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
  }) => {
    const { theme } = useTheme();
    const [addingMethod, setAddingMethod] = useState<ExtendedPaymentMethod | null>(null);
    const [inputAmount, setInputAmount] = useState('');

    const styles = StyleSheet.create({
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
      description: {
        ...theme.typography.body2,
        color: theme.colors.onSurfaceVariant,
        marginBottom: theme.spacing.md,
      },
      methodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        marginBottom: theme.spacing.sm,
      },
      methodButtonActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryContainer,
      },
      methodIcon: {
        marginRight: theme.spacing.md,
      },
      methodLabel: {
        ...theme.typography.body1,
        color: theme.colors.onSurface,
        flex: 1,
      },
      addIcon: {
        marginLeft: 'auto',
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        marginTop: theme.spacing.sm,
      },
      dollarSign: {
        ...theme.typography.h4,
        color: theme.colors.onSurfaceVariant,
        marginRight: theme.spacing.xs,
      },
      amountInput: {
        ...theme.typography.h4,
        color: theme.colors.onSurface,
        flex: 1,
      },
      addButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        marginLeft: theme.spacing.sm,
      },
      addButtonText: {
        ...theme.typography.button,
        color: theme.colors.onPrimary,
        fontSize: 14,
      },
      cancelButton: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        marginLeft: theme.spacing.xs,
      },
      cancelButtonText: {
        ...theme.typography.button,
        color: theme.colors.error,
        fontSize: 14,
      },
      paymentsList: {
        marginTop: theme.spacing.md,
      },
      paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
      },
      paymentInfo: {
        flex: 1,
        marginLeft: theme.spacing.md,
      },
      paymentMethod: {
        ...theme.typography.body1,
        color: theme.colors.onSurface,
        fontWeight: '500',
      },
      paymentAmount: {
        ...theme.typography.h4,
        color: theme.colors.primary,
      },
      removeButton: {
        padding: theme.spacing.xs,
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
        fontWeight: '500',
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
        ...theme.typography.h3,
        color: theme.colors.primary,
        fontWeight: '700',
      },
      remainingPositive: {
        color: theme.colors.error,
      },
      remainingZero: {
        color: theme.colors.success,
      },
      processButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.md,
      },
      processButtonDisabled: {
        backgroundColor: theme.colors.outline,
      },
      processButtonText: {
        ...theme.typography.button,
        color: theme.colors.onPrimary,
        marginLeft: theme.spacing.xs,
      },
      emptyState: {
        alignItems: 'center',
        padding: theme.spacing.lg,
      },
      emptyText: {
        ...theme.typography.body2,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
      },
    });

    const totalAllocated = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.round((totalAmount - totalAllocated) * 100) / 100;
    const isValid = Math.abs(remaining) <= 0.01;

    const handleMethodSelect = useCallback((method: ExtendedPaymentMethod) => {
      setAddingMethod(method);
      setInputAmount(remaining > 0 ? remaining.toFixed(2) : '');
    }, [remaining]);

    const handleAddPayment = useCallback(() => {
      if (!addingMethod) return;

      const amount = parseFloat(inputAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount.');
        return;
      }

      const result = paymentSplitCalculator.addPayment(
        { payments, totalAllocated, remaining, isValid: false, validationErrors: [] },
        totalAmount,
        addingMethod,
        amount
      );

      onPaymentsChange(result.payments);
      setAddingMethod(null);
      setInputAmount('');
    }, [addingMethod, inputAmount, payments, totalAmount, totalAllocated, remaining, onPaymentsChange]);

    const handleCancelAdd = useCallback(() => {
      setAddingMethod(null);
      setInputAmount('');
    }, []);

    const handleRemovePayment = useCallback(
      (paymentId: string) => {
        const result = paymentSplitCalculator.removePayment(
          { payments, totalAllocated, remaining, isValid: false, validationErrors: [] },
          totalAmount,
          paymentId
        );
        onPaymentsChange(result.payments);
      },
      [payments, totalAmount, totalAllocated, remaining, onPaymentsChange]
    );

    const getMethodInfo = (method: ExtendedPaymentMethod) => {
      return PAYMENT_OPTIONS.find((o) => o.method === method) || { icon: 'cash', label: method };
    };

    return (
      <>
        {/* Add Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Payment Methods</Text>
          <Text style={styles.description}>
            Split this bill across multiple payment methods.
          </Text>

          {PAYMENT_OPTIONS.map((option) => (
            <View key={option.method}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  addingMethod === option.method && styles.methodButtonActive,
                ]}
                onPress={() => handleMethodSelect(option.method)}
                disabled={addingMethod !== null && addingMethod !== option.method}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={24}
                  color={
                    addingMethod === option.method
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                  style={styles.methodIcon}
                />
                <Text style={styles.methodLabel}>{option.label}</Text>
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.addIcon}
                />
              </TouchableOpacity>

              {addingMethod === option.method && (
                <View style={styles.inputContainer}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={inputAmount}
                    onChangeText={setInputAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddPayment}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAdd}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Added Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Split</Text>

          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="credit-card-multiple-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.emptyText}>
                No payments added yet.{'\n'}Add payment methods above.
              </Text>
            </View>
          ) : (
            <View style={styles.paymentsList}>
              {payments.map((payment) => {
                const info = getMethodInfo(payment.method);
                return (
                  <View key={payment.id} style={styles.paymentItem}>
                    <MaterialCommunityIcons
                      name={info.icon as any}
                      size={24}
                      color={theme.colors.primary}
                    />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentMethod}>{info.label}</Text>
                      <Text style={styles.paymentAmount}>
                        {formatPrice(payment.amount)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemovePayment(payment.id)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={24}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Summary */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Bill</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Allocated</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalAllocated)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remaining</Text>
            <Text
              style={[
                styles.totalValue,
                remaining > 0.01
                  ? styles.remainingPositive
                  : remaining < -0.01
                  ? styles.remainingPositive
                  : styles.remainingZero,
              ]}
            >
              {formatPrice(Math.abs(remaining))}
              {remaining < -0.01 && ' (over)'}
            </Text>
          </View>

          {/* Process Button */}
          {payments.length > 0 && (
            <TouchableOpacity
              style={[
                styles.processButton,
                !isValid && styles.processButtonDisabled,
              ]}
              onPress={onProcessPayments}
              disabled={!isValid}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.colors.onPrimary}
              />
              <Text style={styles.processButtonText}>
                {isValid
                  ? 'Process All Payments'
                  : remaining > 0
                  ? `${formatPrice(remaining)} remaining`
                  : `${formatPrice(Math.abs(remaining))} over-allocated`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }
);

SplitByPayment.displayName = 'SplitByPayment';

export default SplitByPayment;
