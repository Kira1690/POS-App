/**
 * PaymentConfirmationScreen
 * Professional payment confirmation with receipt options
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useReceiptManagement } from '@/context/payment';
import { useUnifiedOrder } from '@/context/unified-order';
import { paymentStorageService } from '@/services/storage/PaymentStorageService';
import { usePrinter } from '@/context/printer/PrinterContext';
import { Order } from '@/types/order.types';
import { ProfessionalPayment, ReceiptType } from '@/types/payment.types';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { showToast } from '@/utils/toast';

interface PaymentConfirmationScreenProps {
  navigation: any;
  route: {
    params: {
      payment: ProfessionalPayment;
      order: Order;
      orderId: string;
      splitPayment?: {
        guestId: string;
        guestName: string;
        amount: number;
      };
    };
  };
}

const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { isLargeTablet } = useResponsive();
  const {
    generateReceipt,
    printReceipt,
    emailReceipt,
    smsReceipt,
    receiptSettings,
  } = useReceiptManagement();
  const { processPayment } = useUnifiedOrder();
  const { printReceipt: contextPrintReceipt } = usePrinter();

  const { payment, order, orderId, splitPayment } = route.params;
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  // Mark order/guest paid when payment confirmation screen loads
  useEffect(() => {
    const markPaid = async () => {
      if (splitPayment) {
        // Per-guest split: update only this guest's status in storage
        const existing = await paymentStorageService.getSplit(orderId);
        if (existing?.guests && existing.guests.length > 0) {
          const updatedGuests = existing.guests.map((g) =>
            g.id === splitPayment.guestId
              ? { ...g, paymentStatus: 'paid' as const, paidAt: new Date().toISOString() }
              : g
          );
          const paidAmount = updatedGuests
            .filter((g) => g.paymentStatus === 'paid')
            .reduce((sum, g) => sum + g.total, 0);
          await paymentStorageService.updateSplit(orderId, {
            guests: updatedGuests,
            paidAmount,
            remainingAmount: Math.max(0, (existing.totalAmount || 0) - paidAmount),
          });
        }
      } else if (orderId && payment?.id) {
        // Full payment: mark entire order paid and release table
        await processPayment(orderId, payment.method, payment.transactionId || payment.id, {
          amount: payment.amount,
          cardBrand: payment.cardType,
          cardLastFour: payment.cardLast4,
          authorizationCode: payment.authorizationCode,
          processingFee: payment.processingFee,
        });
      }
    };
    markPaid();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate receipt on screen load
  useEffect(() => {
    const autoGenerateReceipt = async () => {
      if (receiptSettings.printAutomatically || payment.receiptPrinted) {
        try {
          setIsGeneratingReceipt(true);
          const receipt = await generateReceipt(payment.id, ReceiptType.CUSTOMER);
          setReceiptId(receipt.id);
          
          // Auto-print if enabled
          if (receiptSettings.printAutomatically) {
            await printReceipt(receipt.id);
          }
        } catch (error) {
        } finally {
          setIsGeneratingReceipt(false);
        }
      }
    };

    autoGenerateReceipt();
  }, [payment.id, receiptSettings, generateReceipt, printReceipt]);

  // Handle receipt actions
  const handlePrintReceipt = async () => {
    const printOrder = order as unknown as import('@/types/unified-order.types').UnifiedOrder;
    await contextPrintReceipt(printOrder);
  };

  const handleEmailReceipt = async () => {
    if (!receiptId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No receipt available to email',
      });
      return;
    }

    // For demo purposes, use a mock email
    const email = payment.customerEmail || 'customer@example.com';
    
    try {
      await emailReceipt(receiptId, email);
    } catch { /* silent */ }
  };

  const handleSmsReceipt = async () => {
    if (!receiptId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No receipt available to SMS',
      });
      return;
    }

    // For demo purposes, use a mock phone number
    const phone = payment.customerPhone || '+1234567890';
    
    try {
      await smsReceipt(receiptId, phone);
    } catch { /* silent */ }
  };

  // Handle navigation back to main flow
  const handleContinue = useCallback(() => {
    if (splitPayment) {
      // Return to BillSplitScreen so staff can pay the next guest.
      // Stack: BillSplit → PaymentProcessing (replaced) → here
      // goBack() takes us to BillSplit.
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }
  }, [splitPayment, navigation]);

  // Handle new order
  const handleNewOrder = () => {
    navigation.navigate('Tables', {
      screen: 'TableManagement',
    });
  };

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerContent}>
        <View style={[styles.successIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
          <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Payment Successful
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {splitPayment
            ? `${splitPayment.guestName} — ${formatCurrency(splitPayment.amount)} paid`
            : 'Transaction completed successfully'}
        </Text>
      </View>
    </View>
  );

  // Render payment details
  const renderPaymentDetails = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Payment Details
      </Text>
      
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
            Order Number
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
            {order?.orderNumber ?? (orderId?.slice(-6) ? `#${orderId.slice(-6)}` : 'N/A')}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
            Table
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
            {order?.tableId ? `Table ${order.tableId}` : 'Takeaway'}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
            Payment Method
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
            {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
            Amount Paid
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(payment.amount)}
          </Text>
        </View>

        {order?.subtotal != null && order.subtotal > 0 && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Subtotal
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
        )}

        {payment.taxAmount != null && payment.taxAmount > 0 && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tax
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(payment.taxAmount)}
            </Text>
          </View>
        )}

        {payment.processingFee != null && payment.processingFee > 0 && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              CC Surcharge
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(payment.processingFee)}
            </Text>
          </View>
        )}

        {payment.tipAmount != null && payment.tipAmount > 0 && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tip
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(payment.tipAmount)}
            </Text>
          </View>
        )}

        {payment.transactionId && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Transaction ID
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {payment.transactionId}
            </Text>
          </View>
        )}
        
        {payment.authorizationCode && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Authorization Code
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {payment.authorizationCode}
            </Text>
          </View>
        )}
        
        {payment.cardLast4 && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Card Number
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              **** **** **** {payment.cardLast4}
            </Text>
          </View>
        )}
        
        {payment.changeAmount && payment.changeAmount > 0 && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Change Given
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.secondary, fontWeight: '700' }]}>
              {formatCurrency(payment.changeAmount)}
            </Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
            Processed At
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
            {formatDateTime(payment.processedAt || payment.created_at || new Date().toISOString())}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render receipt options
  const renderReceiptOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Receipt Options
      </Text>
      
      <View style={styles.receiptButtons}>
        <TouchableOpacity
          style={[styles.receiptButton, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={handlePrintReceipt}
          disabled={isGeneratingReceipt}
          testID="btn-print-receipt"
        >
          <MaterialIcons name="print" size={24} color={theme.colors.onPrimaryContainer} />
          <Text style={[styles.receiptButtonText, { color: theme.colors.onPrimaryContainer }]}>
            Print Receipt
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.receiptButton, { backgroundColor: theme.colors.secondaryContainer }]}
          onPress={handleEmailReceipt}
          disabled={isGeneratingReceipt}
          testID="btn-email-receipt"
        >
          <MaterialIcons name="email" size={24} color={theme.colors.onSecondaryContainer} />
          <Text style={[styles.receiptButtonText, { color: theme.colors.onSecondaryContainer }]}>
            Email Receipt
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.receiptButton, { backgroundColor: theme.colors.tertiaryContainer }]}
          onPress={handleSmsReceipt}
          disabled={isGeneratingReceipt}
          testID="btn-sms-receipt"
        >
          <MaterialIcons name="sms" size={24} color={theme.colors.onTertiaryContainer} />
          <Text style={[styles.receiptButtonText, { color: theme.colors.onTertiaryContainer }]}>
            SMS Receipt
          </Text>
        </TouchableOpacity>
      </View>
      
      {isGeneratingReceipt && (
        <View style={styles.generatingReceipt}>
          <MaterialIcons name="receipt" size={20} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.generatingText, { color: theme.colors.onSurfaceVariant }]}>
            Generating receipt...
          </Text>
        </View>
      )}
    </View>
  );

  // Render action buttons
  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.newOrderButton,
          { backgroundColor: theme.colors.secondaryContainer },
        ]}
        onPress={handleNewOrder}
        testID="btn-new-order"
      >
        <MaterialIcons name="add" size={20} color={theme.colors.onSecondaryContainer} />
        <Text style={[styles.actionButtonText, { color: theme.colors.onSecondaryContainer }]}>
          New Order
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.continueButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={handleContinue}
        testID="btn-continue"
      >
        <MaterialIcons name="check" size={20} color={theme.colors.onPrimary} />
        <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
          {splitPayment ? 'Back to Bill Split' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}

      <View style={[styles.centerWrapper, isLargeTablet && styles.centerWrapperTablet]}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderPaymentDetails()}
          {renderReceiptOptions()}

          {/* Success Message */}
          <View style={[styles.section, { backgroundColor: `${theme.colors.primary}10` }]}>
            <View style={styles.successMessage}>
              <MaterialIcons name="celebration" size={24} color={theme.colors.primary} />
              <Text style={[styles.successText, { color: theme.colors.primary }]}>
                Thank you for your business!
              </Text>
            </View>
          </View>
        </ScrollView>

        {renderActionButtons()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerWrapper: {
    flex: 1,
  },
  centerWrapperTablet: {
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.headlineMedium,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyMedium,
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
  detailsGrid: {
    // Grid styling handled by flexWrap
  },
  detailItem: {
    width: '50%',
    marginBottom: spacing.md,
    paddingRight: spacing.sm,
  },
  detailLabel: {
    ...typography.labelMedium,
    marginBottom: spacing.xs / 2,
  },
  detailValue: {
    ...typography.bodyLarge,
    fontWeight: '500',
  },
  receiptButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs / 2,
  },
  receiptButton: {
    width: '31%',
    margin: spacing.xs / 2,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  receiptButtonText: {
    ...typography.labelMedium,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  generatingReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  generatingText: {
    ...typography.bodyMedium,
    marginLeft: spacing.sm,
    fontStyle: 'italic',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  successText: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginLeft: spacing.sm,
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
  newOrderButton: {
    // backgroundColor set dynamically
  },
  continueButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default PaymentConfirmationScreen;