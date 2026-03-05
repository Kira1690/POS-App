/**
 * SplitPaymentModal
 * Split a single bill across multiple payment methods.
 * e.g. $30 cash + $20 card.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';

// ── Types ────────────────────────────────────────────────────────────────────

interface MethodOption {
  key: string;
  label: string;
  icon: string;
}

interface SplitItem {
  id: string;
  method: MethodOption;
  amount: number;
}

export interface SplitPaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onPayment: (splitItems: SplitItem[]) => void;
  onCancel: () => void;
  /** Pre-fill the list (e.g. from BillSplitScreen "Payment" tab) */
  initialSplits?: Array<{ id: string; method: string; amount: number; status?: string }>;
}

// ── Constants ────────────────────────────────────────────────────────────────

const METHODS: MethodOption[] = [
  { key: 'cash',      label: 'Cash',      icon: 'cash' },
  { key: 'card',      label: 'Card',      icon: 'credit-card' },
  { key: 'mobile',    label: 'Mobile',    icon: 'cellphone' },
  { key: 'gift_card', label: 'Gift Card', icon: 'gift-card' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  visible,
  totalAmount,
  onPayment,
  onCancel,
  initialSplits,
}) => {
  const { theme } = useTheme();
  const { isPhone, modalMaxWidth } = useResponsive();

  const [splits, setSplits] = useState<SplitItem[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<MethodOption | null>(null);
  const [inputAmount, setInputAmount] = useState('');

  // Pre-populate / reset when modal opens or closes
  useEffect(() => {
    if (visible && initialSplits && initialSplits.length > 0) {
      const mapped: SplitItem[] = initialSplits.map((s) => {
        const method = METHODS.find((m) => m.key === s.method) ?? {
          key: s.method,
          label: s.method.charAt(0).toUpperCase() + s.method.slice(1),
          icon: 'cash',
        };
        return { id: s.id, method, amount: s.amount };
      });
      setSplits(mapped);
    } else if (!visible) {
      setSplits([]);
      setSelectedMethod(null);
      setInputAmount('');
    }
  }, [visible, initialSplits]);

  const totalAdded = splits.reduce((sum, s) => sum + s.amount, 0);
  const remaining = Math.round((totalAmount - totalAdded) * 100) / 100;
  const canProcess = remaining <= 0.005; // within half-cent rounding

  const handleSelectMethod = useCallback((method: MethodOption) => {
    setSelectedMethod((prev) => (prev?.key === method.key ? null : method));
    setInputAmount('');
  }, []);

  const handleAddSplit = useCallback(() => {
    if (!selectedMethod) return;
    const parsed = parseFloat(inputAmount);
    if (isNaN(parsed) || parsed <= 0) return;
    const capped = Math.min(parsed, remaining > 0 ? remaining : parsed);

    setSplits((prev) => [
      ...prev,
      {
        id: `split_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        method: selectedMethod,
        amount: Math.round(capped * 100) / 100,
      },
    ]);
    setInputAmount('');
    setSelectedMethod(null);
  }, [selectedMethod, inputAmount, remaining]);

  const handleRemoveSplit = useCallback((id: string) => {
    setSplits((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleProcess = useCallback(() => {
    if (!canProcess) return;
    onPayment(splits);
  }, [canProcess, onPayment, splits]);

  const remainingColor =
    canProcess
      ? theme.colors.success
      : remaining < 0
      ? theme.colors.error
      : theme.colors.onSurface;

  const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1 },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialogCard: {
      width: '90%',
      height: '90%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    closeButton: { padding: spacing.sm },
    headerTitle: {
      ...typography.headlineSmall,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    headerSpacer: { width: 48 },

    balanceBar: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginBottom: spacing.xs,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 2,
    },
    balanceLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    balanceValue: {
      ...typography.bodyLarge,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    remainingLabel: {
      ...typography.bodyMedium,
      fontWeight: '700',
      color: remainingColor,
    },
    remainingValue: {
      ...typography.titleLarge,
      fontWeight: '700',
      color: remainingColor,
    },
    balanceDivider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginVertical: spacing.xs,
    },

    splitList: { flex: 1 },

    section: {
      backgroundColor: theme.colors.surface,
      margin: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    sectionTitle: {
      ...typography.titleMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: spacing.md,
    },
    methodRow: {
      flexDirection: 'row',
      flexWrap: isPhone ? 'wrap' : 'nowrap',
      gap: spacing.xs,
    },
    methodButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
    },
    methodLabel: {
      ...typography.labelSmall,
      fontWeight: '500',
      marginTop: 2,
    },
    amountInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    amountInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
    },
    currencySymbol: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      marginRight: 2,
    },
    amountInput: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      flex: 1,
      paddingVertical: spacing.sm,
    },
    addButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    addButtonDisabled: { opacity: 0.4 },
    addButtonText: {
      ...typography.labelLarge,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },

    splitsHeader: {
      ...typography.labelLarge,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    splitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xs,
      backgroundColor: theme.colors.surfaceLight,
    },
    splitRowIcon: { marginRight: spacing.sm },
    splitRowLabel: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      flex: 1,
    },
    splitRowAmount: {
      ...typography.bodyLarge,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginRight: spacing.sm,
    },
    removeButton: { padding: 2 },

    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    emptyText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: spacing.md,
    },

    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    processButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    processButtonText: {
      ...typography.labelLarge,
      fontWeight: '700',
    },
  });

  const renderSplitItem = useCallback(
    ({ item }: ListRenderItemInfo<SplitItem>) => (
      <View style={styles.splitRow}>
        <MaterialCommunityIcons
          name={item.method.icon as any}
          size={22}
          color={theme.colors.primary}
          style={styles.splitRowIcon}
        />
        <Text style={styles.splitRowLabel}>{item.method.label}</Text>
        <Text style={styles.splitRowAmount}>{formatCurrency(item.amount)}</Text>
        <TouchableOpacity
          onPress={() => handleRemoveSplit(item.id)}
          style={styles.removeButton}
          accessibilityLabel={`Remove ${item.method.label} split`}
          testID={`btn-split-remove-${item.id}`}
        >
          <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    ),
    [styles, theme.colors.primary, theme.colors.error, handleRemoveSplit]
  );

  const ListHeader = (
    <>
      {/* Method Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <View style={styles.methodRow}>
          {METHODS.map((method) => {
            const isSelected = selectedMethod?.key === method.key;
            return (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.methodButton,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceLight,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                  },
                ]}
                onPress={() => handleSelectMethod(method)}
                accessibilityLabel={method.label}
                testID={`btn-split-method-${method.key}`}
              >
                <MaterialCommunityIcons
                  name={method.icon as any}
                  size={24}
                  color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.methodLabel,
                    { color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant },
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Inline Amount Input */}
        {selectedMethod && (
          <View style={styles.amountInputRow}>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={inputAmount}
                onChangeText={setInputAmount}
                placeholder={remaining > 0 ? remaining.toFixed(2) : '0.00'}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={handleAddSplit}
                autoFocus
                testID="input-split-amount"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                (!inputAmount || parseFloat(inputAmount) <= 0) && styles.addButtonDisabled,
              ]}
              onPress={handleAddSplit}
              disabled={!inputAmount || parseFloat(inputAmount) <= 0}
              testID="btn-split-add"
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {splits.length > 0 && (
        <Text style={styles.splitsHeader}>Payment Splits</Text>
      )}
    </>
  );

  const EmptyComponent = (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="credit-card-plus-outline"
        size={48}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={styles.emptyText}>
        Add at least one payment method above
      </Text>
    </View>
  );

  const modalInner = (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel} testID="btn-split-close">
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Split Payment</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Balance Bar */}
          <View style={styles.balanceBar}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Bill Total</Text>
              <Text style={styles.balanceValue}>{formatCurrency(totalAmount)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Added</Text>
              <Text style={styles.balanceValue}>{formatCurrency(totalAdded)}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceRow}>
              <Text style={styles.remainingLabel}>
                {canProcess ? 'Balanced' : 'Remaining'}
              </Text>
              <Text style={styles.remainingValue}>
                {canProcess ? formatCurrency(0) : formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          {/* Splits List (with header embedded) */}
          <FlatList
            data={splits}
            keyExtractor={(item) => item.id}
            renderItem={renderSplitItem}
            style={styles.splitList}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={EmptyComponent}
          />

          {/* Process Payments Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.processButton,
                {
                  backgroundColor: canProcess
                    ? theme.colors.primary
                    : theme.colors.surfaceLight,
                },
              ]}
              onPress={handleProcess}
              disabled={!canProcess}
              testID="btn-split-process"
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color={canProcess ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.processButtonText,
                  {
                    color: canProcess
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {canProcess
                  ? 'Process Payments'
                  : `Remaining ${formatCurrency(remaining)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={!isPhone}
      presentationStyle={isPhone ? 'pageSheet' : 'overFullScreen'}
      onRequestClose={onCancel}
    >
      {isPhone ? (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {modalInner}
        </SafeAreaView>
      ) : (
        <View style={styles.overlay}>
          <View style={[styles.dialogCard, { maxWidth: modalMaxWidth, backgroundColor: theme.colors.background }]}>
            {modalInner}
          </View>
        </View>
      )}
    </Modal>
  );
};
