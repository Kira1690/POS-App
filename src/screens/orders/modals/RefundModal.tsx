/**
 * RefundModal — Process refunds for paid orders
 * Ported from Food-MobileApp-Frontend/paymentprocessor RefundPage.tsx
 * States: FORM → PROCESSING → SUCCESS → ERROR
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, shadows } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { refundService, validateRefundAmount, type CreateRefundRequest } from '@/services/api/refundService';
import { showToast } from '@/utils/toast';
import type { Order } from '@/types/order.types';

enum RefundState {
  FORM = 'FORM',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

const REFUND_REASONS = [
  'Customer request',
  'Wrong amount',
  'Duplicate charge',
  'Product issue',
  'Service issue',
  'Other',
];

interface RefundModalProps {
  visible: boolean;
  order: Order;
  restaurantId: string;
  userId: string;
  onClose: () => void;
  onRefundComplete: () => void;
  remainingAmount?: number;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  visible,
  order,
  restaurantId,
  userId,
  onClose,
  onRefundComplete,
  remainingAmount,
}) => {
  const { theme } = useTheme();

  // Support both snake_case (Order type) and camelCase (UnifiedOrder type)
  const orderTotal = Number((order as Record<string, unknown>).totalAmount ?? order.total_amount) || 0;
  const maxRefundAmount = remainingAmount !== undefined ? remainingAmount : orderTotal;
  const [refundState, setRefundState] = useState<RefundState>(RefundState.FORM);
  const [isPartialRefund, setIsPartialRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(maxRefundAmount.toFixed(2));
  const [refundReason, setRefundReason] = useState('');
  const [selectedReasonIndex, setSelectedReasonIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Animations
  const rotateAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  // Reset state on open
  useEffect(() => {
    if (visible) {
      setRefundState(RefundState.FORM);
      setIsPartialRefund(false);
      setRefundAmount(maxRefundAmount.toFixed(2));
      setRefundReason('');
      setSelectedReasonIndex(null);
      setErrorMessage('');
      setValidationError('');
    }
  }, [visible, maxRefundAmount]);

  // Validate amount (includes $10k limit and decimal precision check)
  useEffect(() => {
    if (!isPartialRefund) {
      setValidationError('');
      return;
    }
    const amount = parseFloat(refundAmount);
    const error = validateRefundAmount(amount, maxRefundAmount);
    setValidationError(error || '');
  }, [refundAmount, isPartialRefund, maxRefundAmount]);

  // Auto-dismiss success after 3s
  useEffect(() => {
    if (refundState !== RefundState.SUCCESS) return;
    const timer = setTimeout(() => {
      onRefundComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [refundState, onRefundComplete]);

  // Processing spinner animation
  useEffect(() => {
    if (refundState !== RefundState.PROCESSING) return;
    rotateAnim.setValue(0);
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [refundState, rotateAnim]);

  // Success scale animation
  useEffect(() => {
    if (refundState !== RefundState.SUCCESS) return;
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [refundState, scaleAnim]);

  // Error shake animation
  useEffect(() => {
    if (refundState !== RefundState.ERROR) return;
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [refundState, shakeAnim]);

  const handlePartialToggle = useCallback(() => {
    setIsPartialRefund((prev) => {
      if (prev) {
        setRefundAmount(maxRefundAmount.toFixed(2));
      }
      return !prev;
    });
  }, [maxRefundAmount]);

  const handleQuickSelect = useCallback(
    (percentage: number) => {
      const amount = ((maxRefundAmount * percentage) / 100).toFixed(2);
      setRefundAmount(amount);
    },
    [maxRefundAmount]
  );

  const handleSelectReason = useCallback((index: number) => {
    setSelectedReasonIndex(index);
    setRefundReason(REFUND_REASONS[index]);
  }, []);

  const isProcessDisabled = useMemo(() => {
    if (refundState !== RefundState.FORM) return true;
    if (validationError) return true;
    if (!refundReason) return true;
    const amount = parseFloat(refundAmount);
    return isNaN(amount) || amount <= 0 || amount > maxRefundAmount;
  }, [refundState, validationError, refundReason, refundAmount, maxRefundAmount]);

  const getRefundTypeLabel = useCallback((): string => {
    if (!isPartialRefund) return 'Full Refund';
    const amount = parseFloat(refundAmount);
    if (isNaN(amount)) return 'Partial Refund';
    if (Math.abs(amount - maxRefundAmount) < 0.01) return 'Full Refund';
    const pct = ((amount / maxRefundAmount) * 100).toFixed(0);
    return `${pct}% Partial Refund`;
  }, [isPartialRefund, refundAmount, maxRefundAmount]);

  const handleProcessRefund = useCallback(async () => {
    Keyboard.dismiss();
    const amount = parseFloat(refundAmount);

    // Full validation including $10k limit and decimal precision
    const validationErr = validateRefundAmount(amount, maxRefundAmount);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    setRefundState(RefundState.PROCESSING);

    try {
      // Look up the server transaction ID for this order
      // The order.id is the order ID, not the transaction ID
      let transactionId = Number(order.payment_id || (order as Record<string, unknown>).paymentId || (order as Record<string, unknown>).transactionId);

      // If no valid transaction ID, try to fetch it from the billing API
      if (!transactionId || isNaN(transactionId)) {
        try {
          const { apiClient } = await import('@/services/api/apiClient');
          const txnResp = await apiClient.get<{ data: Array<{ id: number }> }>(`/api/billing/transactions`, {
            params: { order_id: order.id, limit: 1 },
          });
          const txns = txnResp.data?.data;
          if (Array.isArray(txns) && txns.length > 0) {
            transactionId = txns[0].id;
          }
        } catch { /* fallback to order.id */ }
      }

      // Final fallback: use order.id (will fail if no matching transaction)
      if (!transactionId || isNaN(transactionId)) {
        transactionId = Number(order.id);
      }

      const request: CreateRefundRequest = {
        transaction_id: transactionId,
        restaurant_id: Number(restaurantId),
        amount,
        reason: refundReason.trim().slice(0, 500),
        method: 'original_payment',
        requested_by: Number(userId),
      };

      await refundService.createRefund(request);
      setRefundState(RefundState.SUCCESS);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'An unexpected error occurred while processing the refund.';
      setErrorMessage(msg);
      setRefundState(RefundState.ERROR);
    }
  }, [refundAmount, maxRefundAmount, order, restaurantId, userId, refundReason]);

  const handleRetry = useCallback(() => {
    setRefundState(RefundState.FORM);
    setErrorMessage('');
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        },
        modalContainer: {
          width: '100%',
          maxHeight: '92%',
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: borderRadius.xl,
          borderTopRightRadius: borderRadius.xl,
          ...shadows.lg,
        },
        scrollContent: {
          padding: spacing.xl,
          paddingBottom: spacing['3xl'],
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xl,
        },
        headerTitle: {
          ...typography.headlineMedium,
          fontWeight: '700',
          color: theme.colors.onSurface,
        },
        closeButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.surfaceVariant,
          justifyContent: 'center',
          alignItems: 'center',
        },
        summaryCard: {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.lg,
          ...shadows.sm,
        },
        summaryLabel: {
          ...typography.labelSmall,
          color: theme.colors.onSurfaceVariant,
          marginBottom: spacing.xs,
        },
        summaryContent: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        summaryAmount: {
          ...typography.headlineLarge,
          fontWeight: '700',
          color: theme.colors.onSurface,
        },
        summaryMeta: {
          alignItems: 'flex-end',
        },
        summaryText: {
          ...typography.labelSmall,
          color: theme.colors.onSurfaceVariant,
        },
        refundSection: {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          marginBottom: spacing.lg,
          ...shadows.sm,
        },
        sectionTitle: {
          ...typography.titleSmall,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: spacing.md,
        },
        amountContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          paddingHorizontal: spacing.lg,
          height: 64,
        },
        amountContainerEditable: {
          borderColor: theme.colors.info,
          borderWidth: 2,
        },
        amountContainerError: {
          borderColor: theme.colors.error,
          borderWidth: 2,
        },
        currencySymbol: {
          fontSize: 28,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginRight: spacing.xs,
        },
        amountInput: {
          flex: 1,
          fontSize: 28,
          fontWeight: '700',
          color: theme.colors.onSurface,
        },
        refundTypeLabel: {
          ...typography.labelSmall,
          color: theme.colors.success,
          textAlign: 'right',
          marginTop: spacing.xs,
          marginBottom: spacing.sm,
        },
        refundTypeLabelPartial: {
          color: theme.colors.warning,
        },
        errorLabel: {
          ...typography.labelSmall,
          color: theme.colors.error,
          marginTop: spacing.xs,
          marginBottom: spacing.sm,
        },
        checkboxContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.sm,
        },
        checkbox: {
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: theme.colors.info,
          marginRight: spacing.sm,
          justifyContent: 'center',
          alignItems: 'center',
        },
        checkboxChecked: {
          backgroundColor: theme.colors.info,
        },
        checkboxText: {
          ...typography.bodyMedium,
          color: theme.colors.onSurfaceVariant,
          flex: 1,
        },
        checkboxTextActive: {
          color: theme.colors.onSurface,
          fontWeight: '500',
        },
        quickSelectContainer: {
          marginTop: spacing.md,
        },
        quickSelectLabel: {
          ...typography.labelSmall,
          color: theme.colors.onSurfaceVariant,
          marginBottom: spacing.sm,
        },
        quickSelectRow: {
          flexDirection: 'row',
          gap: spacing.sm,
        },
        quickButton: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: borderRadius.md,
          paddingVertical: spacing.md,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.outline,
        },
        quickButtonActive: {
          backgroundColor: theme.colors.info,
          borderColor: theme.colors.info,
        },
        quickButtonText: {
          ...typography.labelMedium,
          fontWeight: '700',
          color: theme.colors.info,
        },
        quickButtonTextActive: {
          color: theme.colors.onTertiary,
        },
        hintsRow: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: spacing.xs,
        },
        hintText: {
          ...typography.labelSmall,
          color: theme.colors.onSurfaceVariant,
        },
        reasonContainer: {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          marginBottom: spacing.lg,
          ...shadows.sm,
        },
        reasonChips: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        reasonChip: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.button,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
        },
        reasonChipActive: {
          backgroundColor: theme.colors.info,
          borderColor: theme.colors.info,
        },
        reasonChipText: {
          ...typography.labelMedium,
          color: theme.colors.onSurface,
        },
        reasonChipTextActive: {
          color: theme.colors.onTertiary,
        },
        warningContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.warningLight,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          gap: spacing.sm,
          marginBottom: spacing.lg,
        },
        warningText: {
          flex: 1,
          ...typography.labelSmall,
          color: theme.colors.warning,
        },
        processButton: {
          backgroundColor: theme.colors.info,
          borderRadius: borderRadius.button,
          paddingVertical: spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 56,
          ...shadows.md,
        },
        processButtonDisabled: {
          opacity: 0.5,
        },
        processButtonText: {
          ...typography.titleSmall,
          fontWeight: '700',
          color: theme.colors.onTertiary,
        },
        stateContainer: {
          padding: spacing['3xl'],
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
        },
        stateIconCircle: {
          width: 96,
          height: 96,
          borderRadius: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
        },
        stateTitle: {
          ...typography.headlineMedium,
          fontWeight: '700',
          color: theme.colors.onSurface,
          marginBottom: spacing.sm,
          textAlign: 'center',
        },
        stateAmount: {
          ...typography.headlineSmall,
          fontWeight: '700',
          color: theme.colors.onSurface,
          marginTop: spacing.sm,
        },
        stateSubtext: {
          ...typography.bodyMedium,
          color: theme.colors.onSurfaceVariant,
          textAlign: 'center',
          marginTop: spacing.xs,
        },
        successDetailsCard: {
          width: '100%',
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginTop: spacing.xl,
        },
        successDetailLabel: {
          ...typography.labelSmall,
          color: theme.colors.onSurfaceVariant,
          marginBottom: spacing.xs,
        },
        successDetailValue: {
          ...typography.bodyMedium,
          fontWeight: '500',
          color: theme.colors.onSurface,
          marginBottom: spacing.md,
          textAlign: 'center',
        },
        successDivider: {
          height: 1,
          backgroundColor: theme.colors.outline,
          marginBottom: spacing.md,
        },
        autoCloseText: {
          ...typography.labelSmall,
          color: theme.colors.onSurfaceVariant,
          fontStyle: 'italic',
          marginTop: spacing.xl,
        },
        errorDetailsCard: {
          width: '100%',
          backgroundColor: theme.colors.errorLight,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginVertical: spacing.xl,
        },
        errorDetailsLabel: {
          ...typography.labelMedium,
          color: theme.colors.onSurfaceVariant,
          marginBottom: spacing.xs,
        },
        errorDetailsText: {
          ...typography.bodySmall,
          color: theme.colors.error,
        },
        retryButton: {
          width: '100%',
          backgroundColor: theme.colors.info,
          borderRadius: borderRadius.button,
          paddingVertical: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.sm,
          ...shadows.md,
        },
        retryButtonText: {
          ...typography.titleSmall,
          fontWeight: '700',
          color: theme.colors.onTertiary,
        },
        cancelButtonError: {
          width: '100%',
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: borderRadius.button,
          paddingVertical: spacing.lg,
          alignItems: 'center',
        },
        cancelButtonText: {
          ...typography.titleSmall,
          fontWeight: '600',
          color: theme.colors.onSurface,
        },
      }),
    [theme]
  );

  const renderForm = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      testID="refund-state-form"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Process Refund</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} testID="btn-refund-close">
          <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Original Transaction Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Original Transaction</Text>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryAmount}>${orderTotal.toFixed(2)}</Text>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryText}>Order #{order.order_number}</Text>
            {order.paid_at && (
              <Text style={styles.summaryText}>
                {new Date(order.paid_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Remaining Amount Info */}
      {remainingAmount !== undefined && remainingAmount < orderTotal && (
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.warningLight }]}>
          <Text style={styles.summaryLabel}>Available to Refund</Text>
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryAmount, { color: theme.colors.warning }]}>
              ${remainingAmount.toFixed(2)}
            </Text>
            <View style={styles.summaryMeta}>
              <Text style={styles.summaryText}>
                Already refunded: ${(orderTotal - remainingAmount).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Refund Amount Section */}
      <View style={styles.refundSection}>
        <Text style={styles.sectionTitle}>Refund Amount</Text>

        {/* Amount Input */}
        <View
          style={[
            styles.amountContainer,
            isPartialRefund && styles.amountContainerEditable,
            validationError ? styles.amountContainerError : null,
          ]}
        >
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={refundAmount}
            onChangeText={setRefundAmount}
            keyboardType="decimal-pad"
            editable={isPartialRefund}
            selectTextOnFocus={isPartialRefund}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            testID="input-refund-amount"
          />
        </View>

        {/* Refund Type / Validation */}
        {!validationError ? (
          <Text style={[styles.refundTypeLabel, isPartialRefund && styles.refundTypeLabelPartial]}>
            ({getRefundTypeLabel()})
          </Text>
        ) : (
          <Text style={styles.errorLabel}>{validationError}</Text>
        )}

        {/* Partial Refund Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handlePartialToggle}
          activeOpacity={0.7}
          testID="btn-refund-partial-toggle"
        >
          <View style={[styles.checkbox, isPartialRefund && styles.checkboxChecked]}>
            {isPartialRefund && (
              <MaterialIcons name="check" size={16} color={theme.colors.onTertiary} />
            )}
          </View>
          <Text style={[styles.checkboxText, isPartialRefund && styles.checkboxTextActive]}>
            Partial Refund (enter custom amount)
          </Text>
        </TouchableOpacity>

        {/* Quick Select Buttons */}
        {isPartialRefund && (
          <View style={styles.quickSelectContainer}>
            <Text style={styles.quickSelectLabel}>Quick Select:</Text>
            <View style={styles.quickSelectRow}>
              {[25, 50, 75].map((pct) => {
                const pctAmount = (maxRefundAmount * pct) / 100;
                const isActive = Math.abs(parseFloat(refundAmount) - pctAmount) < 0.01;
                return (
                  <TouchableOpacity
                    key={pct}
                    style={[styles.quickButton, isActive && styles.quickButtonActive]}
                    onPress={() => handleQuickSelect(pct)}
                    testID={`btn-refund-quick-${pct}`}
                  >
                    <Text style={[styles.quickButtonText, isActive && styles.quickButtonTextActive]}>
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.hintsRow}>
              {[25, 50, 75].map((pct) => (
                <Text key={pct} style={styles.hintText}>
                  ${((maxRefundAmount * pct) / 100).toFixed(2)}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Refund Reason */}
      <View style={styles.reasonContainer}>
        <Text style={styles.sectionTitle}>Refund Reason</Text>
        <View style={styles.reasonChips}>
          {REFUND_REASONS.map((reason, index) => {
            const isActive = selectedReasonIndex === index;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonChip, isActive && styles.reasonChipActive]}
                onPress={() => handleSelectReason(index)}
                testID={`btn-refund-reason-${index}`}
              >
                <Text style={[styles.reasonChipText, isActive && styles.reasonChipTextActive]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warningContainer}>
        <MaterialIcons name="warning" size={20} color={theme.colors.warning} />
        <Text style={styles.warningText}>
          This action cannot be undone. Please verify the amount before proceeding.
        </Text>
      </View>

      {/* Process Button */}
      <TouchableOpacity
        style={[styles.processButton, isProcessDisabled && styles.processButtonDisabled]}
        onPress={handleProcessRefund}
        disabled={isProcessDisabled}
        testID="btn-refund-submit"
      >
        <Text style={styles.processButtonText}>Process Refund</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderProcessing = () => {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.stateContainer} testID="refund-state-processing">
        <Animated.View style={{ transform: [{ rotate }] }}>
          <View style={[styles.stateIconCircle, { backgroundColor: theme.colors.infoLight }]}>
            <ActivityIndicator size="large" color={theme.colors.info} />
          </View>
        </Animated.View>
        <Text style={styles.stateTitle}>Processing Refund...</Text>
        <Text style={styles.stateSubtext}>Please wait</Text>
      </View>
    );
  };

  const renderSuccess = () => (
    <View style={styles.stateContainer} testID="refund-state-success">
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={[styles.stateIconCircle, { backgroundColor: theme.colors.successLight }]}>
          <MaterialIcons name="check-circle" size={48} color={theme.colors.success} />
        </View>
      </Animated.View>
      <Text style={[styles.stateTitle, { color: theme.colors.success }]}>Refund Successful</Text>
      <Text style={styles.stateAmount}>${refundAmount}</Text>
      <Text style={styles.stateSubtext}>({getRefundTypeLabel()})</Text>

      <View style={styles.successDetailsCard}>
        <Text style={styles.successDetailLabel}>Order</Text>
        <Text style={styles.successDetailValue}>#{order.order_number}</Text>
        <View style={styles.successDivider} />
        <Text style={styles.successDetailLabel}>Processed at</Text>
        <Text style={styles.successDetailValue}>{new Date().toLocaleString()}</Text>
      </View>

      <Text style={styles.autoCloseText}>Closing in 3 seconds...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.stateContainer} testID="refund-state-error">
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <View style={[styles.stateIconCircle, { backgroundColor: theme.colors.errorLight }]}>
          <MaterialIcons name="error" size={48} color={theme.colors.error} />
        </View>
      </Animated.View>
      <Text style={[styles.stateTitle, { color: theme.colors.error }]}>Refund Failed</Text>
      <Text style={styles.stateSubtext}>Please try again</Text>

      <View style={styles.errorDetailsCard}>
        <Text style={styles.errorDetailsLabel}>Error Details:</Text>
        <Text style={styles.errorDetailsText}>{errorMessage}</Text>
      </View>

      <TouchableOpacity style={styles.retryButton} onPress={handleRetry} testID="btn-refund-retry">
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButtonError} onPress={onClose} testID="btn-refund-cancel">
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {refundState === RefundState.FORM && renderForm()}
          {refundState === RefundState.PROCESSING && renderProcessing()}
          {refundState === RefundState.SUCCESS && renderSuccess()}
          {refundState === RefundState.ERROR && renderError()}
        </View>
      </View>
    </Modal>
  );
};
