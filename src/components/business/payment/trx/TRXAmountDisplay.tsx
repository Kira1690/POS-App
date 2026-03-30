import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface TRXAmountDisplayProps {
  amount: string;
  taxAmount?: string;
  tax?: string;
  surchargeAmount?: string;
  totalAmount?: string;
  total?: string;
  taxRate?: number;
  ccSurchargeRate?: number;
}

export const TRXAmountDisplay: React.FC<TRXAmountDisplayProps> = ({
  amount,
  taxAmount,
  tax,
  surchargeAmount,
  totalAmount,
  total,
  taxRate,
  ccSurchargeRate,
}) => {
  const { theme } = useTheme();

  const currencySymbol = '$';
  // Show actual rates from server config — no hardcoded fallbacks that hide zero values
  const displayTaxRate = taxRate !== undefined ? (taxRate * 100).toFixed(1) : '0.0';
  const displayCCSurchargeRate = ccSurchargeRate !== undefined ? (ccSurchargeRate * 100).toFixed(1) : '0.0';
  const displayTax = taxAmount || tax || '0.00';
  const displaySurcharge = surchargeAmount || '0.00';
  const displayTotal = totalAmount || total || amount;

  const styles = StyleSheet.create({
    amountContainer: {
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    amountCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.card,
    },
    currencySymbol: {
      ...theme.typography.largeTitle,
      color: theme.colors.onSurface,
      marginRight: theme.spacing.sm,
    },
    amountText: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    calculationContainer: {
      backgroundColor: theme.colors.surfaceLight,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.card,
    },
    calculationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    calculationLabel: {
      ...theme.typography.callout,
      color: theme.colors.onSurfaceSecondary,
    },
    calculationValue: {
      ...theme.typography.callout,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      marginBottom: 0,
    },
    totalLabel: {
      ...theme.typography.title3,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    totalValue: {
      ...theme.typography.title2,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
  });

  return (
    <>
      <View style={styles.amountContainer}>
        <View style={styles.amountCard}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <Text style={styles.amountText}>{amount}</Text>
        </View>
      </View>

      <View style={styles.calculationContainer}>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Subtotal</Text>
          <Text style={styles.calculationValue}>{currencySymbol}{amount}</Text>
        </View>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Tax ({displayTaxRate}%)</Text>
          <Text style={styles.calculationValue}>{currencySymbol}{displayTax}</Text>
        </View>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>CC Surcharge ({displayCCSurchargeRate}%)</Text>
          <Text style={styles.calculationValue}>{currencySymbol}{displaySurcharge}</Text>
        </View>
        <View style={[styles.calculationRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{currencySymbol}{displayTotal}</Text>
        </View>
      </View>
    </>
  );
};
