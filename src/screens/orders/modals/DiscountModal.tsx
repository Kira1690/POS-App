/**
 * DiscountModal - Apply discounts to order or items
 *
 * Features:
 * - Percentage-based discounts
 * - Fixed amount discounts
 * - Discount reason tracking
 * - Manager approval flag
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface DiscountData {
  type: 'percentage' | 'fixed';
  value: number;
  reason: string;
  requiresApproval: boolean;
}

export interface DiscountModalProps {
  visible: boolean;
  currentAmount: number;
  itemName?: string; // If provided, discount is for a specific item
  currentDiscount?: DiscountData;
  onApply: (discount: DiscountData) => void;
  onRemove: () => void;
  onCancel: () => void;
}

const PRESET_PERCENTAGES = [5, 10, 15, 20, 25, 50];
const DISCOUNT_REASONS = [
  'Manager comp',
  'Customer complaint',
  'Birthday special',
  'Loyalty reward',
  'Error correction',
  'Promotion',
  'Employee discount',
  'Other',
];

export const DiscountModal: React.FC<DiscountModalProps> = ({
  visible,
  currentAmount,
  itemName,
  currentDiscount,
  onApply,
  onRemove,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    currentDiscount?.type || 'percentage'
  );
  const [percentageValue, setPercentageValue] = useState(
    currentDiscount?.type === 'percentage' ? currentDiscount.value.toString() : ''
  );
  const [fixedValue, setFixedValue] = useState(
    currentDiscount?.type === 'fixed' ? currentDiscount.value.toString() : ''
  );
  const [reason, setReason] = useState(currentDiscount?.reason || '');
  const [customReason, setCustomReason] = useState('');

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    headerSubtitle: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    content: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },
    typeToggle: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    typeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    typeButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    typeButtonText: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      marginLeft: theme.spacing.xs,
    },
    typeButtonTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    presetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    presetButton: {
      width: '30%',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    presetButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    presetText: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    presetTextActive: {
      color: theme.colors.primary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
    },
    inputPrefix: {
      ...theme.typography.h4,
      color: theme.colors.onSurfaceVariant,
      marginRight: theme.spacing.xs,
    },
    input: {
      flex: 1,
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      padding: theme.spacing.md,
    },
    inputSuffix: {
      ...theme.typography.h4,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.xs,
    },
    reasonsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    reasonChip: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    reasonChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    reasonText: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
    },
    reasonTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    customReasonInput: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      marginTop: theme.spacing.sm,
    },
    summaryBox: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    summaryValue: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    summaryTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      marginTop: theme.spacing.xs,
    },
    summaryTotalLabel: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    summaryTotalValue: {
      ...theme.typography.body1,
      color: theme.colors.success,
      fontWeight: '700',
    },
    discountAmount: {
      color: theme.colors.error,
    },
    footer: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    removeButton: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      alignItems: 'center',
    },
    cancelButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSurface,
    },
    applyButton: {
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    applyButtonDisabled: {
      backgroundColor: theme.colors.outline,
    },
    applyButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
  });

  useEffect(() => {
    if (visible && currentDiscount) {
      setDiscountType(currentDiscount.type);
      if (currentDiscount.type === 'percentage') {
        setPercentageValue(currentDiscount.value.toString());
        setFixedValue('');
      } else {
        setFixedValue(currentDiscount.value.toString());
        setPercentageValue('');
      }
      setReason(currentDiscount.reason);
    }
  }, [visible, currentDiscount]);

  const discountValue = discountType === 'percentage'
    ? parseFloat(percentageValue) || 0
    : parseFloat(fixedValue) || 0;

  const discountAmount = discountType === 'percentage'
    ? (currentAmount * discountValue) / 100
    : Math.min(discountValue, currentAmount);

  const newTotal = currentAmount - discountAmount;

  const isValid = discountValue > 0 && reason.length > 0;
  const requiresApproval = discountType === 'percentage' ? discountValue > 20 : discountAmount > 50;

  const handleApply = useCallback(() => {
    if (!isValid) return;

    onApply({
      type: discountType,
      value: discountValue,
      reason: reason === 'Other' ? customReason : reason,
      requiresApproval,
    });
  }, [discountType, discountValue, reason, customReason, requiresApproval, isValid, onApply]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>
                {itemName ? 'Item Discount' : 'Order Discount'}
              </Text>
              {itemName && <Text style={styles.headerSubtitle}>{itemName}</Text>}
            </View>
          </View>

          <ScrollView style={styles.content}>
            {/* Discount Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Discount Type</Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeButton, discountType === 'percentage' && styles.typeButtonActive]}
                  onPress={() => setDiscountType('percentage')}
                >
                  <MaterialCommunityIcons
                    name="percent"
                    size={20}
                    color={discountType === 'percentage' ? theme.colors.primary : theme.colors.onSurface}
                  />
                  <Text style={[styles.typeButtonText, discountType === 'percentage' && styles.typeButtonTextActive]}>
                    Percentage
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, discountType === 'fixed' && styles.typeButtonActive]}
                  onPress={() => setDiscountType('fixed')}
                >
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={20}
                    color={discountType === 'fixed' ? theme.colors.primary : theme.colors.onSurface}
                  />
                  <Text style={[styles.typeButtonText, discountType === 'fixed' && styles.typeButtonTextActive]}>
                    Fixed Amount
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Discount Value */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {discountType === 'percentage' ? 'Percentage Off' : 'Amount Off'}
              </Text>

              {discountType === 'percentage' ? (
                <>
                  <View style={styles.presetsGrid}>
                    {PRESET_PERCENTAGES.map((pct) => (
                      <TouchableOpacity
                        key={pct}
                        style={[styles.presetButton, percentageValue === pct.toString() && styles.presetButtonActive]}
                        onPress={() => setPercentageValue(pct.toString())}
                      >
                        <Text style={[styles.presetText, percentageValue === pct.toString() && styles.presetTextActive]}>
                          {pct}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={[styles.inputContainer, { marginTop: theme.spacing.sm }]}>
                    <TextInput
                      style={styles.input}
                      value={percentageValue}
                      onChangeText={setPercentageValue}
                      placeholder="Custom %"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={styles.inputSuffix}>%</Text>
                  </View>
                </>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={fixedValue}
                    onChangeText={setFixedValue}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    keyboardType="decimal-pad"
                    maxLength={8}
                  />
                </View>
              )}
            </View>

            {/* Reason */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reason (Required)</Text>
              <View style={styles.reasonsGrid}>
                {DISCOUNT_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reasonChip, reason === r && styles.reasonChipActive]}
                    onPress={() => setReason(r)}
                  >
                    <Text style={[styles.reasonText, reason === r && styles.reasonTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {reason === 'Other' && (
                <TextInput
                  style={styles.customReasonInput}
                  value={customReason}
                  onChangeText={setCustomReason}
                  placeholder="Enter reason..."
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                />
              )}
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Discount Summary</Text>
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Original Amount</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(currentAmount)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'})
                  </Text>
                  <Text style={[styles.summaryValue, styles.discountAmount]}>
                    -{formatCurrency(discountAmount)}
                  </Text>
                </View>
                <View style={styles.summaryTotalRow}>
                  <Text style={styles.summaryTotalLabel}>New Total</Text>
                  <Text style={styles.summaryTotalValue}>{formatCurrency(newTotal)}</Text>
                </View>
              </View>
              {requiresApproval && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.warning} />
                  <Text style={{ ...theme.typography.caption, color: theme.colors.warning, marginLeft: theme.spacing.xs }}>
                    Requires manager approval
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {currentDiscount && (
              <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, !isValid && styles.applyButtonDisabled]}
              onPress={handleApply}
              disabled={!isValid}
            >
              <MaterialCommunityIcons name="check" size={20} color={theme.colors.onPrimary} />
              <Text style={styles.applyButtonText}>Apply Discount</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default DiscountModal;
