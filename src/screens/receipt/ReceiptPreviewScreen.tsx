/**
 * ReceiptPreviewScreen - Full receipt preview with actions
 *
 * Features:
 * - Receipt visualization
 * - Print, email, SMS options
 * - Receipt format toggle (thermal/standard)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/hooks/useTheme';
import { OrdersStackParamList } from '@/navigation/types';
import { Receipt, ReceiptType, ProfessionalPayment } from '@/types/payment.types';
import { Order } from '@/types/order.types';
import { receiptService } from '@/services/receipt';
import { ReceiptTemplate } from './components/ReceiptTemplate';
import { ReceiptActions } from './components/ReceiptActions';

type ReceiptPreviewNavigationProp = StackNavigationProp<OrdersStackParamList, 'Receipt'>;
type ReceiptPreviewRouteProp = RouteProp<OrdersStackParamList, 'Receipt'>;

export const ReceiptPreviewScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ReceiptPreviewNavigationProp>();
  const route = useRoute<ReceiptPreviewRouteProp>();
  const { orderId, payment, order } = route.params || {};

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptWidth, setReceiptWidth] = useState<'narrow' | 'standard' | 'wide'>('standard');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
      flex: 1,
    },
    widthToggle: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    widthButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    widthButtonActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    content: {
      flex: 1,
    },
    receiptContainer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      minHeight: 400,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      marginTop: theme.spacing.md,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    errorText: {
      ...theme.typography.body1,
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    retryButton: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
    },
    retryButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
    },
    infoSection: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    infoLabel: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    infoValue: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
  });

  // Generate receipt on mount
  useEffect(() => {
    generateReceipt();
  }, []);

  const generateReceipt = useCallback(async () => {
    if (!order || !payment) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const generatedReceipt = await receiptService.generateReceipt({
        order: order as Order,
        payment: payment as ProfessionalPayment,
        type: ReceiptType.CUSTOMER,
      });
      setReceipt(generatedReceipt);
    } catch (error) {
      console.error('Failed to generate receipt:', error);
    } finally {
      setIsLoading(false);
    }
  }, [order, payment]);

  const handlePrint = useCallback(async () => {
    if (!receipt) return;
    await receiptService.printReceipt(receipt.id);
  }, [receipt]);

  const handleEmail = useCallback(
    async (email: string) => {
      if (!receipt) return;
      await receiptService.emailReceipt(receipt.id, email);
    },
    [receipt]
  );

  const handleSms = useCallback(
    async (phone: string) => {
      if (!receipt) return;
      await receiptService.smsReceipt(receipt.id, phone);
    },
    [receipt]
  );

  const handleShare = useCallback(() => {
    // Implement share functionality
    console.log('Share receipt');
  }, []);

  const handleDone = useCallback(() => {
    // Navigate back to order management or reset to home
    navigation.popToTop();
  }, [navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Generating receipt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (!receipt) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text style={styles.errorText}>
            Failed to generate receipt.{'\n'}Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateReceipt}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt Preview</Text>

        {/* Width Toggle */}
        <View style={styles.widthToggle}>
          {(['narrow', 'standard', 'wide'] as const).map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.widthButton, receiptWidth === w && styles.widthButtonActive]}
              onPress={() => setReceiptWidth(w)}
            >
              <MaterialCommunityIcons
                name={
                  w === 'narrow'
                    ? 'receipt'
                    : w === 'standard'
                    ? 'file-document-outline'
                    : 'file-document'
                }
                size={20}
                color={
                  receiptWidth === w ? theme.colors.primary : theme.colors.onSurfaceVariant
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Receipt Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order #:</Text>
          <Text style={styles.infoValue}>{receipt.header.orderNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Generated:</Text>
          <Text style={styles.infoValue}>
            {new Date(receipt.generatedAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Receipt Preview */}
      <ScrollView style={styles.content} contentContainerStyle={styles.receiptContainer}>
        <ReceiptTemplate receipt={receipt} width={receiptWidth} />
      </ScrollView>

      {/* Actions */}
      <ReceiptActions
        onPrint={handlePrint}
        onEmail={handleEmail}
        onSms={handleSms}
        onShare={handleShare}
        onDone={handleDone}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

export default ReceiptPreviewScreen;
