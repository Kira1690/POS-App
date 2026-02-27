/**
 * PaymentProcessingScreen
 * Professional payment processing interface with VP3350 integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePayment, usePaymentProcessing, usePaymentUI } from '@/context/payment';
import { useTheme } from '@/hooks/useTheme';
import { Order } from '@/types/order.types';
import { 
  ProfessionalPaymentMethod, 
  ProcessPaymentRequest,
  PaymentProcessingStatus,
} from '@/types/payment.types';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';
import { showToast } from '@/utils/toast';

// Payment Method Components (will be implemented separately)
import { PaymentMethodSelector } from '@/components/business/payment/PaymentMethodSelector';
import { PaymentSummary } from '@/components/business/payment/PaymentSummary';
import { PaymentProgressIndicator } from '@/components/business/payment/PaymentProgressIndicator';
import { CashPaymentModal } from '@/components/business/payment/CashPaymentModal';
import { SplitPaymentModal } from '@/components/business/payment/SplitPaymentModal';
import { TRXPaymentModal } from '@/components/business/payment/TRXPaymentModal';

interface PaymentProcessingScreenProps {
  navigation: any;
  route: {
    params: {
      order: Order;
      orderId: string;
      /** Present when paying a single guest's share */
      splitPayment?: {
        guestId: string;
        guestName: string;
        amount: number;
      };
      /** Pre-built splits from the "Payment" tab in BillSplitScreen */
      splitPayments?: Array<{
        id: string;
        method: string;
        amount: number;
        status: string;
      }>;
    };
  };
}

const PaymentProcessingScreen: React.FC<PaymentProcessingScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const {
    processCardPayment,
    processCashPayment,
    processSplitPayment,
    processingStatus,
    isLoading,
    error,
    clearError,
    resetProcessingStatus,
  } = usePaymentProcessing();

  const {
    openSplitPaymentModal,
    showSplitPaymentModal,
    closeSplitPaymentModal,
  } = usePaymentUI();

  // Local state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<ProfessionalPaymentMethod | null>(null);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTRXModal, setShowTRXModal] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(18);

  // Get order from route params
  const order = route?.params?.order;
  const orderId = route?.params?.orderId || order?.id;
  const splitPayment = route?.params?.splitPayment;
  const splitPayments = route?.params?.splitPayments;

  // Reset processing status on mount to clear any previous FAILED status
  useEffect(() => {
    resetProcessingStatus();
  }, [resetProcessingStatus]);

  // Auto-open split modal when pre-built splits are passed from BillSplitScreen "Payment" tab
  useEffect(() => {
    if (splitPayments && splitPayments.length > 0) {
      openSplitPaymentModal();
    }
  }, [splitPayments, openSplitPaymentModal]);

  useEffect(() => {
    if (!order && !orderId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No order found for payment processing',
      });
      navigation.goBack();
    }
  }, [order, orderId, navigation]);

  // Calculate order totals
  const calculateTotals = useCallback(() => {
    if (!order) return { subtotal: 0, tax: 0, tip: 0, total: 0 };

    // Guest split: tax already included in equalSplitCalculator output
    if (splitPayment) {
      return { subtotal: splitPayment.amount, tax: 0, tip: 0, total: splitPayment.amount };
    }

    const subtotal = order.subtotal || 0;
    const tax = order.tax_amount || 0;
    const tip = tipAmount;
    const total = subtotal + tax + tip;

    return { subtotal, tax, tip, total };
  }, [order, tipAmount, splitPayment]);

  const totals = calculateTotals();

  // Handle payment method selection
  const handlePaymentMethodSelect = useCallback((method: ProfessionalPaymentMethod) => {
    setSelectedPaymentMethod(method);
    clearError();

    switch (method) {
      case ProfessionalPaymentMethod.CARD: {
        // Card Payment always routes to TRX terminal (like reference app)
        // TRXPaymentModal handles reconnect/not-connected states
        setShowTRXModal(true);
        break;
      }
      case ProfessionalPaymentMethod.CASH:
        setShowCashModal(true);
        break;
      case ProfessionalPaymentMethod.SPLIT:
        openSplitPaymentModal();
        break;
      case ProfessionalPaymentMethod.VP3350:
      case ProfessionalPaymentMethod.TRX:
        setShowTRXModal(true);
        break;
      default:
        showToast({
          type: 'info',
          title: 'Payment Method',
          message: `${method} payment selected`,
        });
    }
  }, [clearError, openSplitPaymentModal]);

  // Handle card payment
  const handleCardPayment = useCallback(async () => {
    if (!order) return;

    try {
      const request: ProcessPaymentRequest = {
        orderId: orderId,
        amount: totals.total,
        method: ProfessionalPaymentMethod.CARD,
        tipAmount: tipAmount,
        tipPercentage: tipPercentage,
        printReceipt: true,
      };

      const payment = await processCardPayment(request);

      // Navigate to payment confirmation
      navigation.replace('PaymentConfirmation', {
        payment,
        order,
        orderId,
        splitPayment,
      });
    } catch (error) {
      console.error('Card payment failed:', error);
    }
  }, [order, orderId, totals.total, tipAmount, tipPercentage, processCardPayment, navigation]);

  // Handle cash payment
  const handleCashPayment = useCallback(async (cashTendered: number) => {
    if (!order) return;

    try {
      const request: ProcessPaymentRequest = {
        orderId: orderId,
        amount: totals.total,
        method: ProfessionalPaymentMethod.CASH,
        cashTendered,
        tipAmount: tipAmount,
        tipPercentage: tipPercentage,
        printReceipt: true,
      };

      const payment = await processCashPayment(request);

      setShowCashModal(false);

      // Navigate to payment confirmation
      navigation.replace('PaymentConfirmation', {
        payment,
        order,
        orderId,
        splitPayment,
      });
    } catch (error) {
      console.error('Cash payment failed:', error);
    }
  }, [order, orderId, totals.total, tipAmount, tipPercentage, processCashPayment, navigation]);

  // Handle split payment
  const handleSplitPayment = useCallback(async (splitPayments: any[]) => {
    if (!order) return;

    try {
      const request: ProcessPaymentRequest = {
        orderId: orderId,
        amount: totals.total,
        method: ProfessionalPaymentMethod.SPLIT,
        splitPayments,
        tipAmount: tipAmount,
        tipPercentage: tipPercentage,
        printReceipt: true,
      };

      const payment = await processSplitPayment(request);

      closeSplitPaymentModal();

      // Navigate to payment confirmation
      navigation.replace('PaymentConfirmation', {
        payment,
        order,
        orderId,
        splitPayment,
      });
    } catch (error) {
      console.error('Split payment failed:', error);
    }
  }, [order, orderId, totals.total, tipAmount, tipPercentage, processSplitPayment, navigation, closeSplitPaymentModal]);

  // Handle tip calculation
  const handleTipCalculation = useCallback((percentage: number, amount?: number) => {
    if (amount !== undefined) {
      setTipAmount(amount);
      setTipPercentage(0); // Custom amount
    } else {
      const calculatedTip = (totals.subtotal + totals.tax) * (percentage / 100);
      setTipAmount(calculatedTip);
      setTipPercentage(percentage);
    }
  }, [totals.subtotal, totals.tax]);

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Payment Processing
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {splitPayment
            ? `${splitPayment.guestName} — ${formatCurrency(splitPayment.amount)}`
            : `${order?.tableId ? `Table ${order.tableId}` : 'Takeaway'} - Order #${order?.orderNumber}`}
        </Text>
      </View>
    </View>
  );

  // Render error state
  const renderError = () => {
    if (!error) return null;

    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
        <MaterialIcons name="error-outline" size={24} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.error }]}
          onPress={clearError}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.onError }]}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render action buttons
  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton, { borderColor: theme.colors.outline }]}
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <MaterialIcons name="cancel" size={20} color={theme.colors.onSurfaceVariant} />
        <Text style={[styles.actionButtonText, { color: theme.colors.onSurfaceVariant }]}>
          Cancel
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, styles.printButton, { backgroundColor: theme.colors.secondaryContainer }]}
        onPress={() => {
          showToast({
            type: 'info',
            title: 'Print Receipt',
            message: 'Receipt will be printed after payment',
          });
        }}
        disabled={isLoading}
      >
        <MaterialIcons name="print" size={20} color={theme.colors.onSecondaryContainer} />
        <Text style={[styles.actionButtonText, { color: theme.colors.onSecondaryContainer }]}>
          Print Receipt
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorStateContainer}>
          <MaterialIcons name="error" size={64} color={theme.colors.error} />
          <Text style={[styles.errorStateText, { color: theme.colors.error }]}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderError()}
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Payment Progress Indicator */}
        <PaymentProgressIndicator 
          status={processingStatus}
          isLoading={isLoading}
        />
        
        {/* Order Summary */}
        <PaymentSummary
          order={order}
          tipAmount={tipAmount}
          tipPercentage={tipPercentage}
          onTipCalculation={handleTipCalculation}
          overrideTotal={splitPayment ? splitPayment.amount : undefined}
        />
        
        {/* Payment Methods */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Payment Methods
          </Text>
          
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodSelect={handlePaymentMethodSelect}
            disabled={isLoading}
            total={totals.total}
          />
        </View>
      </ScrollView>
      
      {renderActionButtons()}
      
      {/* Payment Modals */}
      <CashPaymentModal
        visible={showCashModal}
        totalAmount={totals.total}
        onPayment={handleCashPayment}
        onCancel={() => setShowCashModal(false)}
      />
      
      <SplitPaymentModal
        visible={showSplitPaymentModal}
        totalAmount={totals.total}
        onPayment={handleSplitPayment}
        onCancel={closeSplitPaymentModal}
        initialSplits={splitPayments}
      />
      
      <TRXPaymentModal
        visible={showTRXModal}
        totalAmount={totals.total}
        onPayment={(result) => {
          setShowTRXModal(false);
          navigation.replace('PaymentConfirmation', {
            payment: result,
            order,
            orderId,
            splitPayment,
          });
        }}
        onCancel={() => setShowTRXModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.headlineMedium,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    marginTop: spacing.xs / 2,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
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
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    ...typography.bodyMedium,
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  retryButtonText: {
    ...typography.labelMedium,
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
  printButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorStateText: {
    ...typography.headlineMedium,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
});

export default PaymentProcessingScreen;