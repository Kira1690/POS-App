/**
 * TRXPaymentModal — TRX terminal payment flow
 * Uses MML TCP/IP protocol via useTRXTerminalConnection and useTRXPaymentProcessor.
 * Renamed from VP3350PaymentModal (VP3350 is a different device).
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useTRXTerminalConnection } from '@/hooks/trx/useTRXTerminalConnection';
import { useTRXPaymentProcessor } from '@/hooks/trx/useTRXPaymentProcessor';
import { useTRXSettings } from '@/hooks/trx/useTRXSettings';
import { TRXStatusHeader } from '@/components/business/payment/trx/TRXStatusHeader';
import { TRXAmountDisplay } from '@/components/business/payment/trx/TRXAmountDisplay';
import { TRXPaymentProgressModal } from '@/components/business/payment/trx/TRXPaymentProgressModal';
import { PaymentState } from '@/services/trx/interfaces/IPaymentProcessor';
import { formatCurrency } from '@/utils/currency';

interface TRXPaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onPayment: (result: unknown) => void;
  onCancel: () => void;
}

export const TRXPaymentModal: React.FC<TRXPaymentModalProps> = ({
  visible,
  totalAmount,
  onPayment,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { isPhone, modalMaxWidth } = useResponsive();
  const { settings } = useTRXSettings();
  const [tipAmount, setTipAmount] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const {
    isConnected,
    isConnecting,
    isScanning,
    connectionStatus,
    processPayment: terminalProcessPayment,
    reconnectTerminal,
  } = useTRXTerminalConnection();

  const {
    taxRate,
    ccSurchargeRate,
    transactionStatus,
    transactionResult,
    isProcessing,
    paymentStartTime,
    approvalCode,
    cardBrand,
    lastFour,
    errorMessage,
    transactionAmount,
    handleProcessPayment,
    dismissPaymentModal,
    clearTransaction,
  } = useTRXPaymentProcessor(totalAmount);

  // On modal open: attempt reconnect if not connected but storage has a terminal
  useEffect(() => {
    if (visible && !isConnected && !isConnecting && !isReconnecting) {
      setIsReconnecting(true);
      reconnectTerminal().finally(() => setIsReconnecting(false));
    }
  }, [visible, isConnected, isConnecting, isReconnecting, reconnectTerminal]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      clearTransaction();
      setTipAmount(0);
      setIsReconnecting(false);
    }
  }, [visible, clearTransaction]);

  // Calculate display values from totalAmount prop (+ tip for grand total)
  const taxAmount = (totalAmount * taxRate).toFixed(2);
  const surchargeAmount = ((totalAmount + totalAmount * taxRate) * ccSurchargeRate).toFixed(2);
  const grandTotal = (totalAmount + parseFloat(taxAmount) + parseFloat(surchargeAmount) + tipAmount).toFixed(2);

  // Handle charge button press
  const handleCharge = useCallback(async () => {
    if (!isConnected) return;
    await handleProcessPayment(async (amount: number, tax: number) =>
      terminalProcessPayment(amount + tipAmount, tax)
    );
  }, [isConnected, terminalProcessPayment, handleProcessPayment, tipAmount]);

  // Handle payment modal dismiss — on SUCCESS, call onPayment
  const handleModalDismiss = useCallback(() => {
    dismissPaymentModal();

    if (transactionStatus === PaymentState.SUCCESS) {
      onPayment({
        id: `trx_${Date.now()}`,
        success: true,
        amount: parseFloat(grandTotal),
        transactionId: `TRX_${Date.now()}`,
        authorizationCode: approvalCode || '',
        cardLast4: lastFour || '',
        cardType: cardBrand || 'Card',
        method: 'trx',
        approvalCode,
        cardBrand,
        lastFour,
        processedAt: new Date().toISOString(),
      });
    }
  }, [dismissPaymentModal, transactionStatus, grandTotal, approvalCode, lastFour, cardBrand, onPayment]);

  // Handle manual reconnect
  const handleReconnect = useCallback(async () => {
    setIsReconnecting(true);
    await reconnectTerminal();
    setIsReconnecting(false);
  }, [reconnectTerminal]);

  const showProgressModal = transactionStatus !== PaymentState.IDLE;
  const showReconnecting = isReconnecting || isConnecting || isScanning;

  const innerContent = (
    <>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel} testID="btn-trx-close">
            <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            TRX Terminal Payment
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Terminal Status */}
          <TRXStatusHeader
            title="TRX Terminal"
            posConnected={isConnected}
            isConnecting={showReconnecting}
            statusText={showReconnecting ? 'Reconnecting...' : connectionStatus}
            statusColor={isConnected ? theme.colors.success : theme.colors.error}
            transactionStatus={transactionStatus}
            transactionResult={transactionResult}
          />

          {/* Reconnect Button — shown when not connected and not already reconnecting */}
          {!isConnected && !showReconnecting && (
            <TouchableOpacity
              style={[styles.reconnectButton, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={handleReconnect}
              testID="btn-trx-reconnect"
            >
              <MaterialIcons name="refresh" size={20} color={theme.colors.onPrimaryContainer} />
              <Text style={[styles.reconnectText, { color: theme.colors.onPrimaryContainer }]}>
                Reconnect Terminal
              </Text>
            </TouchableOpacity>
          )}

          {/* Reconnecting indicator */}
          {showReconnecting && !isConnected && (
            <View style={[styles.reconnectingContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.reconnectingText, { color: theme.colors.onSurfaceVariant }]}>
                Reconnecting to terminal...
              </Text>
            </View>
          )}

          {/* Amount Display */}
          <TRXAmountDisplay
            amount={totalAmount.toFixed(2)}
            taxAmount={taxAmount}
            surchargeAmount={surchargeAmount}
            totalAmount={grandTotal}
            taxRate={taxRate}
            ccSurchargeRate={ccSurchargeRate}
          />
        </ScrollView>

        {/* Tip Selector */}
        {settings.gratuityEnabled && !isProcessing && (
          <View style={[styles.tipContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
            <Text style={[styles.tipLabel, { color: theme.colors.onSurface }]}>Add Tip</Text>
            <View style={styles.tipRow}>
              {(settings.defaultTipRates ?? [15, 18, 20, 25]).map((pct: number) => {
                const amt = totalAmount * (pct / 100);
                const isActive = Math.abs(tipAmount - amt) < 0.01;
                return (
                  <TouchableOpacity
                    key={pct}
                    style={[
                      styles.tipChip,
                      { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceLight },
                      isActive && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                    ]}
                    onPress={() => setTipAmount(isActive ? 0 : amt)}
                    testID={`btn-tip-${pct}`}
                  >
                    <Text style={[
                      styles.tipChipText,
                      { color: theme.colors.onSurface },
                      isActive && { color: theme.colors.onPrimary },
                    ]}>
                      {pct}%{'\n'}{formatCurrency(amt)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[
                  styles.tipChip,
                  { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceLight },
                  tipAmount === 0 && { backgroundColor: theme.colors.surfaceVariant },
                ]}
                onPress={() => setTipAmount(0)}
                testID="btn-tip-0"
              >
                <Text style={[styles.tipChipText, { color: theme.colors.onSurface }]}>No Tip</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Charge Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
            onPress={onCancel}
            testID="btn-trx-cancel"
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.onSurfaceVariant }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chargeButton,
              {
                backgroundColor: isConnected && !isProcessing ? theme.colors.primary : theme.colors.surfaceVariant,
                opacity: isConnected && !isProcessing ? 1 : 0.5,
              },
            ]}
            onPress={handleCharge}
            disabled={!isConnected || isProcessing}
            testID="btn-trx-charge"
          >
            <MaterialIcons
              name="payment"
              size={20}
              color={isConnected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text style={[
              styles.chargeButtonText,
              { color: isConnected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
            ]}>
              {isProcessing ? 'Processing...' : `Charge ${formatCurrency(parseFloat(grandTotal))}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Progress Overlay */}
        <TRXPaymentProgressModal
          visible={showProgressModal}
          currentState={transactionStatus}
          amount={`$${transactionAmount || grandTotal}`}
          startTime={paymentStartTime || undefined}
          approvalCode={approvalCode || undefined}
          cardBrand={cardBrand || undefined}
          lastFour={lastFour || undefined}
          errorMessage={errorMessage || undefined}
          onDismiss={handleModalDismiss}
          onCancel={onCancel}
        />
    </>
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
          {innerContent}
        </SafeAreaView>
      ) : (
        <View style={styles.overlay}>
          <View style={[styles.dialogCard, { maxWidth: modalMaxWidth, backgroundColor: theme.colors.background }]}>
            {innerContent}
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  reconnectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reconnectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  reconnectingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chargeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  chargeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  tipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tipChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 64,
  },
  tipChipText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
