/**
 * PaymentConfirmationScreen
 * Professional payment confirmation with receipt options
 */

import React, { useEffect, useState } from 'react';
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
import { useReceiptManagement } from '@/context/payment';
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
    };
  };
}

const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { 
    generateReceipt,
    printReceipt,
    emailReceipt,
    smsReceipt,
    receiptSettings,
  } = useReceiptManagement();

  const { payment, order, orderId } = route.params;
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);

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
          console.error('Receipt generation failed:', error);
        } finally {
          setIsGeneratingReceipt(false);
        }
      }
    };

    autoGenerateReceipt();
  }, [payment.id, receiptSettings, generateReceipt, printReceipt]);

  // Handle receipt actions
  const handlePrintReceipt = async () => {
    if (!receiptId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No receipt available to print',
      });
      return;
    }

    try {
      await printReceipt(receiptId);
    } catch (error) {
      console.error('Print receipt failed:', error);
    }
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
    } catch (error) {
      console.error('Email receipt failed:', error);
    }
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
    } catch (error) {
      console.error('SMS receipt failed:', error);
    }
  };

  // Handle navigation back to main flow
  const handleContinue = () => {
    // Navigate back to dashboard or order management
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

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
          Transaction completed successfully
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
            {order.order_number}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
            Table
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
            {order.table_id || 'Takeaway'}
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
            {formatDateTime(payment.processedAt || payment.created_at)}
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
      >
        <MaterialIcons name="check" size={20} color={theme.colors.onPrimary} />
        <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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