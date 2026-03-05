/**
 * CashPaymentModal
 * Professional cash payment interface with change calculation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';

interface CashPaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onPayment: (cashTendered: number) => void;
  onCancel: () => void;
}

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  visible,
  totalAmount,
  onPayment,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { isPhone, modalMaxWidth } = useResponsive();
  const [cashTendered, setCashTendered] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  // Quick amount buttons
  const quickAmounts = [
    Math.ceil(totalAmount / 5) * 5, // Round up to nearest $5
    Math.ceil(totalAmount / 10) * 10, // Round up to nearest $10
    Math.ceil(totalAmount / 20) * 20, // Round up to nearest $20
    Math.ceil((totalAmount + 5) / 10) * 10, // Add $5 tip, round up to $10
  ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Remove duplicates

  // Calculate change
  const cashAmount = parseFloat(cashTendered) || 0;
  const changeAmount = cashAmount - totalAmount;
  const isValidPayment = cashAmount >= totalAmount;

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCashTendered('');
      setSelectedAmount(null);
    }
  }, [visible]);

  // Handle quick amount selection
  const handleQuickAmountSelect = (amount: number) => {
    setCashTendered(amount.toFixed(2));
    setSelectedAmount(amount);
  };

  // Handle number pad input
  const handleNumberInput = (digit: string) => {
    if (digit === 'clear') {
      setCashTendered('');
      setSelectedAmount(null);
      return;
    }

    if (digit === 'backspace') {
      setCashTendered(prev => prev.slice(0, -1));
      setSelectedAmount(null);
      return;
    }

    // Handle decimal point
    if (digit === '.') {
      if (cashTendered.includes('.')) return;
      setCashTendered(prev => prev + '.');
      setSelectedAmount(null);
      return;
    }

    // Add digit
    const newValue = cashTendered + digit;
    const numValue = parseFloat(newValue);
    
    // Prevent values over $9999.99
    if (numValue > 9999.99) return;
    
    setCashTendered(newValue);
    setSelectedAmount(null);
  };

  // Handle payment confirmation
  const handleConfirmPayment = () => {
    if (!isValidPayment) {
      Alert.alert(
        'Insufficient Cash',
        `Please enter an amount of ${formatCurrency(totalAmount)} or more.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (changeAmount > 50) {
      Alert.alert(
        'Large Change Amount',
        `Change due: ${formatCurrency(changeAmount)}. Do you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => onPayment(cashAmount) },
        ]
      );
      return;
    }

    onPayment(cashAmount);
  };

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
        <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
        Cash Payment
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  // Render amount display
  const renderAmountDisplay = () => (
    <View style={[styles.amountContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
        Total Amount
      </Text>
      <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
        {formatCurrency(totalAmount)}
      </Text>
      
      <View style={styles.cashInputContainer}>
        <Text style={[styles.cashLabel, { color: theme.colors.onSurfaceVariant }]}>
          Cash Tendered
        </Text>
        <Text style={[
          styles.cashAmount, 
          { 
            color: isValidPayment ? theme.colors.onSurface : theme.colors.error,
          }
        ]}>
          ${cashTendered || '0.00'}
        </Text>
      </View>

      {cashAmount > 0 && (
        <View style={styles.changeContainer}>
          <Text style={[styles.changeLabel, { color: theme.colors.onSurfaceVariant }]}>
            Change Due
          </Text>
          <Text style={[
            styles.changeAmount, 
            { 
              color: isValidPayment ? theme.colors.secondary : theme.colors.error,
            }
          ]}>
            {formatCurrency(Math.max(0, changeAmount))}
          </Text>
        </View>
      )}
    </View>
  );

  // Render quick amount buttons
  const renderQuickAmounts = () => (
    <View style={styles.quickAmountsContainer}>
      <Text style={[styles.quickAmountsTitle, { color: theme.colors.onSurface }]}>
        Quick Amounts
      </Text>
      <View style={styles.quickAmountsGrid}>
        {quickAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.quickAmountButton,
              {
                backgroundColor: selectedAmount === amount
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: selectedAmount === amount
                  ? theme.colors.primary
                  : theme.colors.outline,
              },
            ]}
            onPress={() => handleQuickAmountSelect(amount)}
            testID={`btn-cash-quick-${amount}`}
          >
            <Text style={[
              styles.quickAmountText,
              {
                color: selectedAmount === amount 
                  ? theme.colors.onPrimary 
                  : theme.colors.onSurface,
                fontWeight: selectedAmount === amount ? '700' : '500',
              },
            ]}>
              {formatCurrency(amount)}
            </Text>
            {amount > totalAmount && (
              <Text style={[
                styles.quickAmountChange,
                {
                  color: selectedAmount === amount 
                    ? theme.colors.onPrimary 
                    : theme.colors.onSurfaceVariant,
                },
              ]}>
                Change: {formatCurrency(amount - totalAmount)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render number pad
  const renderNumberPad = () => {
    const numberPadButtons = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', 'backspace'],
    ];

    return (
      <View style={styles.numberPadContainer}>
        {numberPadButtons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberPadRow}>
            {row.map((button) => (
              <TouchableOpacity
                key={button}
                style={[
                  styles.numberPadButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => handleNumberInput(button)}
              >
                {button === 'backspace' ? (
                  <MaterialIcons name="backspace" size={24} color={theme.colors.onSurface} />
                ) : (
                  <Text style={[styles.numberPadText, { color: theme.colors.onSurface }]}>
                    {button}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {/* Clear button */}
        <TouchableOpacity
          style={[
            styles.clearButton,
            { backgroundColor: theme.colors.errorContainer },
          ]}
          onPress={() => handleNumberInput('clear')}
        >
          <Text style={[styles.clearButtonText, { color: theme.colors.onErrorContainer }]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render action buttons
  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.cancelButton,
          { borderColor: theme.colors.outline },
        ]}
        onPress={onCancel}
        testID="btn-cash-cancel"
      >
        <Text style={[styles.actionButtonText, { color: theme.colors.onSurfaceVariant }]}>
          Cancel
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.confirmButton,
          {
            backgroundColor: isValidPayment ? theme.colors.primary : theme.colors.surfaceVariant,
            opacity: isValidPayment ? 1 : 0.5,
          },
        ]}
        onPress={handleConfirmPayment}
        disabled={!isValidPayment}
        testID="btn-cash-confirm"
      >
        <MaterialIcons 
          name="check" 
          size={20} 
          color={isValidPayment ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
        />
        <Text style={[
          styles.actionButtonText,
          { 
            color: isValidPayment ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
            marginLeft: spacing.sm,
          },
        ]}>
          Confirm Payment
        </Text>
      </TouchableOpacity>
    </View>
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
          {renderHeader()}
          <View style={[styles.content, { flex: 1 }]}>
            {renderAmountDisplay()}
            {renderQuickAmounts()}
            {renderNumberPad()}
          </View>
          {renderActionButtons()}
        </SafeAreaView>
      ) : (
        <View style={styles.overlay}>
          <View style={[styles.dialogCard, { maxWidth: modalMaxWidth, backgroundColor: theme.colors.background }]}>
            {renderHeader()}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {renderAmountDisplay()}
              {renderQuickAmounts()}
              {renderNumberPad()}
            </ScrollView>
            {renderActionButtons()}
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
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.headlineSmall,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48, // Same width as close button
  },
  content: {
    padding: spacing.md,
  },
  amountContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  totalAmount: {
    ...typography.displaySmall,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  cashInputContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cashLabel: {
    ...typography.bodyMedium,
  },
  cashAmount: {
    ...typography.headlineLarge,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  changeContainer: {
    alignItems: 'center',
  },
  changeLabel: {
    ...typography.bodyMedium,
  },
  changeAmount: {
    ...typography.titleLarge,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  quickAmountsContainer: {
    marginBottom: spacing.lg,
  },
  quickAmountsTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs / 2,
  },
  quickAmountButton: {
    width: '48%',
    margin: spacing.xs / 2,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAmountText: {
    ...typography.titleMedium,
  },
  quickAmountChange: {
    ...typography.bodySmall,
    marginTop: spacing.xs / 2,
  },
  numberPadContainer: {
  },
  numberPadRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  numberPadButton: {
    flex: 1,
    height: 60,
    marginHorizontal: spacing.xs / 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  numberPadText: {
    ...typography.headlineSmall,
    fontWeight: '600',
  },
  clearButton: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs / 2,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
});