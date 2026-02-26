/**
 * BillSplitScreen - Main screen for bill splitting functionality
 *
 * Provides three split modes:
 * - Equal Split: Divide bill equally among guests
 * - Split by Items: Assign items to specific guests
 * - Split by Payment: Pay with multiple payment methods
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/hooks/useTheme';
import { OrdersStackParamList } from '@/navigation/types';
import { useUnifiedOrder } from '@/context/unified-order';
import { useBillSplit } from '@/context/billing';
import { paymentStorageService } from '@/services/storage/PaymentStorageService';
import { showToast } from '@/utils/toast';
import { SplitType, GuestSplit, BillItem, BillSplit, PaymentMethodSplit } from '@/types/billing.types';
import {
  equalSplitCalculator,
  itemSplitCalculator,
} from '@/services/billing/SplitCalculators';
import { SplitByGuests, SplitByItems, SplitByPayment } from './components';

type BillSplitNavigationProp = StackNavigationProp<OrdersStackParamList, 'BillSplit'>;
type BillSplitRouteProp = RouteProp<OrdersStackParamList, 'BillSplit'>;

export const BillSplitScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<BillSplitNavigationProp>();
  const route = useRoute<BillSplitRouteProp>();
  const { orderId, splitType: initialSplitType, guestCount: initialGuestCount } = route.params;

  const { orders, processPayment } = useUnifiedOrder();
  const { state: billState, setSplitType, setGuestCount } = useBillSplit();

  // Local state
  const [activeTab, setActiveTab] = useState<SplitType>(initialSplitType || 'equal');
  const [guests, setGuests] = useState<GuestSplit[]>([]);
  const [guestCountInput, setGuestCountInput] = useState(initialGuestCount || 2);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentMethodSplit[]>([]);
  // Tracks whether the initial split has been saved to storage
  const splitSavedRef = useRef(false);

  // Find the order
  const order = useMemo(
    () => orders.find((o) => o.id === orderId) || null,
    [orders, orderId]
  );

  // Calculate bill items from order
  const billItems: BillItem[] = useMemo(() => {
    if (!order) return [];
    return order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      basePrice: item.basePrice,
      modifierTotal: item.modifierTotal,
      itemTotal: item.itemTotal,
      modifiers: item.selectedModifiers?.map((m) =>
        (m.options || []).map((o) => o.optionName).join(', ')
      ) || [],
      isAssigned: false,
      isShared: false,
    }));
  }, [order]);

  // Calculate totals
  const subtotal = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.itemTotal, 0) || 0,
    [order]
  );
  const taxRate = order?.taxRate || 0.0825;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  // Initialize guests based on split type
  useEffect(() => {
    if (activeTab === 'equal') {
      const result = equalSplitCalculator.calculate(
        totalAmount,
        taxAmount,
        0,
        guestCountInput
      );
      setGuests(result.guests);
      splitSavedRef.current = false; // mark for re-save when count/tab changes
    } else if (activeTab === 'by_items') {
      const result = itemSplitCalculator.initialize(billItems, guestCountInput, taxRate);
      setGuests(result.guests);
      splitSavedRef.current = false;
    }
  }, [activeTab, guestCountInput, totalAmount, taxAmount, billItems, taxRate]);

  // Persist split to storage so PaymentConfirmationScreen can update guest statuses
  useEffect(() => {
    if (!order || guests.length === 0 || splitSavedRef.current) return;

    const split: BillSplit = {
      orderId,
      orderNumber: order.orderNumber || '',
      splitType: activeTab,
      originalSubtotal: subtotal,
      originalTaxAmount: taxAmount,
      originalTipAmount: 0,
      originalTotal: totalAmount,
      guestCount: guestCountInput,
      guests,
      paymentSplits: [],
      unassignedItems: [],
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      isComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    paymentStorageService.saveSplit(split).then(() => {
      splitSavedRef.current = true;
    });
  }, [guests, order, orderId, activeTab, subtotal, taxAmount, totalAmount, guestCountInput]);

  // On every focus: reload guest payment statuses from storage and check for completion
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const reloadAndCheck = async () => {
        const split = await paymentStorageService.getSplit(orderId);
        if (cancelled || !split?.guests || split.guests.length === 0) return;

        // Merge stored payment statuses into current guest state
        setGuests((prevGuests) =>
          prevGuests.map((g) => {
            const stored = split.guests!.find((sg) => sg.id === g.id);
            return stored ? { ...g, paymentStatus: stored.paymentStatus } : g;
          })
        );

        // Check if all guests have paid
        const allPaid = split.guests.every((g) => g.paymentStatus === 'paid');
        if (allPaid && !split.isComplete) {
          // Mark split complete and finalize the order
          await paymentStorageService.updateSplit(orderId, { isComplete: true });
          await processPayment(orderId, 'split');
          showToast({
            type: 'success',
            title: 'All guests paid',
            message: 'Order is now complete',
          });
          // Navigate to OrderManagement — replace so BillSplit isn't in stack
          navigation.replace('OrderManagement');
        }
      };

      reloadAndCheck();
      return () => { cancelled = true; };
    }, [orderId, processPayment, navigation])
  );

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
    tabs: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
      marginHorizontal: theme.spacing.xs,
    },
    tabActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    tabText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
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
    guestCountSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
    },
    guestCountButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    guestCountValue: {
      ...theme.typography.h1,
      color: theme.colors.primary,
      marginHorizontal: theme.spacing.xl,
      minWidth: 60,
      textAlign: 'center',
    },
    guestsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    guestCard: {
      width: '48%',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    guestCardSelected: {
      borderColor: theme.colors.primary,
    },
    guestHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    guestColor: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: theme.spacing.sm,
    },
    guestName: {
      ...theme.typography.body1,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    guestAmount: {
      ...theme.typography.h4,
      color: theme.colors.primary,
    },
    guestStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    guestStatusText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.xs,
    },
    itemsList: {
      marginTop: theme.spacing.md,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
    },
    itemPrice: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    itemAssign: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    assignButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    assignButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
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
    footer: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    payAllButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    payAllButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });

  const formatPrice = useCallback((price: number): string => `$${price.toFixed(2)}`, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGuestCountChange = useCallback(
    (delta: number) => {
      const newCount = Math.max(2, Math.min(10, guestCountInput + delta));
      setGuestCountInput(newCount);
    },
    [guestCountInput]
  );

  const handleGuestSelect = useCallback((guestId: string) => {
    setSelectedGuestId((prev) => (prev === guestId ? null : guestId));
  }, []);

  const handleAssignItem = useCallback(
    (itemId: string, guestId: string) => {
      if (activeTab !== 'by_items') return;

      // Update guest assignments
      setGuests((prevGuests) => {
        const result = itemSplitCalculator.assignItemToGuest(
          {
            guests: prevGuests,
            unassignedItems: [],
            totalAssigned: 0,
            totalUnassigned: 0,
            isValid: false,
            validationErrors: [],
          },
          billItems,
          itemId,
          guestId,
          taxRate
        );
        return result.guests;
      });
    },
    [activeTab, billItems, taxRate]
  );

  const handlePayGuest = useCallback(
    (guest: GuestSplit) => {
      if (!order) return;

      navigation.navigate('PaymentProcessing', {
        orderId,
        order,
        splitPayment: {
          guestId: guest.id,
          guestName: guest.name,
          amount: guest.total,
        },
      });
    },
    [navigation, orderId, order]
  );

  const handlePayAll = useCallback(() => {
    if (!order) return;

    // Process all unpaid guests
    const unpaidGuests = guests.filter((g) => g.paymentStatus === 'pending');

    if (unpaidGuests.length === 0) {
      Alert.alert('All Paid', 'All guests have already paid.');
      return;
    }

    // Navigate to payment processing for each guest
    // For now, just process the first unpaid guest
    handlePayGuest(unpaidGuests[0]);
  }, [guests, handlePayGuest, order]);

  const handlePaymentsChange = useCallback((newPayments: PaymentMethodSplit[]) => {
    setPayments(newPayments);
  }, []);

  const handleProcessPayments = useCallback(() => {
    if (!order) return;

    // Navigate to payment processing with split payments
    navigation.navigate('PaymentProcessing', {
      orderId,
      order,
      splitPayments: payments,
    });
  }, [navigation, orderId, order, payments]);

  if (!order) {
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
          <Text style={styles.headerTitle}>Split Bill</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="receipt"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEqualSplit = () => (
    <SplitByGuests
      guests={guests}
      guestCount={guestCountInput}
      selectedGuestId={selectedGuestId}
      onGuestCountChange={(count) => setGuestCountInput(count)}
      onGuestSelect={(guest) => handleGuestSelect(guest.id)}
      onGuestPay={handlePayGuest}
      formatPrice={formatPrice}
    />
  );

  const renderItemSplit = () => (
    <SplitByItems
      items={billItems}
      guests={guests}
      guestCount={guestCountInput}
      selectedGuestId={selectedGuestId}
      onGuestCountChange={(count) => setGuestCountInput(count)}
      onAssignItem={handleAssignItem}
      onGuestSelect={(guest) => handleGuestSelect(guest.id)}
      onGuestPay={handlePayGuest}
      formatPrice={formatPrice}
    />
  );

  const renderPaymentSplit = () => (
    <SplitByPayment
      totalAmount={totalAmount}
      payments={payments}
      onPaymentsChange={handlePaymentsChange}
      onProcessPayments={handleProcessPayments}
      formatPrice={formatPrice}
    />
  );

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
        <Text style={styles.headerTitle}>Split Bill - {order.tableName}</Text>
      </View>

      {/* Split Type Tabs */}
      <View style={styles.tabs}>
        {[
          { type: 'equal' as SplitType, label: 'Equal', icon: 'account-group' },
          { type: 'by_items' as SplitType, label: 'By Items', icon: 'format-list-checks' },
          { type: 'by_payment_method' as SplitType, label: 'Payment', icon: 'credit-card-multiple' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.type}
            style={[styles.tab, activeTab === tab.type && styles.tabActive]}
            onPress={() => setActiveTab(tab.type)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.type ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[styles.tabText, activeTab === tab.type && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Bill Summary */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({(taxRate * 100).toFixed(1)}%)</Text>
            <Text style={styles.summaryValue}>{formatPrice(taxAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
          </View>
        </View>

        {/* Render based on active tab */}
        {activeTab === 'equal' && renderEqualSplit()}
        {activeTab === 'by_items' && renderItemSplit()}
        {activeTab === 'by_payment_method' && renderPaymentSplit()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payAllButton} onPress={handlePayAll}>
          <MaterialCommunityIcons
            name="cash-multiple"
            size={24}
            color={theme.colors.onPrimary}
          />
          <Text style={styles.payAllButtonText}>
            {activeTab === 'equal'
              ? `Pay All Guests (${guests.length})`
              : activeTab === 'by_items'
              ? 'Process Payments'
              : 'Complete Split Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BillSplitScreen;
