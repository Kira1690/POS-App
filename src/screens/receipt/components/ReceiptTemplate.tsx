/**
 * ReceiptTemplate - Visual receipt template component
 *
 * Renders a receipt in a thermal printer style format:
 * - Restaurant header
 * - Order details
 * - Item list
 * - Totals
 * - Payment info
 * - Footer
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Receipt } from '@/types/payment.types';

export interface ReceiptTemplateProps {
  receipt: Receipt;
  width?: 'narrow' | 'standard' | 'wide';
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = memo(
  ({ receipt, width = 'standard' }) => {
    const { theme } = useTheme();

    const containerWidth = width === 'narrow' ? 280 : width === 'wide' ? 400 : 320;

    const styles = StyleSheet.create({
      container: {
        width: containerWidth,
        backgroundColor: '#FFFFFF',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      header: {
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        borderStyle: 'dashed',
      },
      restaurantName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
        textAlign: 'center',
      },
      restaurantInfo: {
        fontSize: 11,
        color: '#666666',
        textAlign: 'center',
        marginTop: 2,
      },
      orderInfo: {
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        borderStyle: 'dashed',
      },
      orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
      },
      orderInfoLabel: {
        fontSize: 12,
        color: '#666666',
      },
      orderInfoValue: {
        fontSize: 12,
        color: '#000000',
        fontWeight: '500',
      },
      itemsSection: {
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        borderStyle: 'dashed',
      },
      itemRow: {
        flexDirection: 'row',
        marginBottom: 6,
      },
      itemQuantity: {
        width: 30,
        fontSize: 12,
        color: '#000000',
      },
      itemName: {
        flex: 1,
        fontSize: 12,
        color: '#000000',
      },
      itemPrice: {
        fontSize: 12,
        color: '#000000',
        fontWeight: '500',
        textAlign: 'right',
      },
      itemModifiers: {
        marginLeft: 30,
        marginBottom: 4,
      },
      modifierText: {
        fontSize: 10,
        color: '#666666',
        fontStyle: 'italic',
      },
      totalsSection: {
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        borderStyle: 'dashed',
      },
      totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
      },
      totalsLabel: {
        fontSize: 12,
        color: '#666666',
      },
      totalsValue: {
        fontSize: 12,
        color: '#000000',
      },
      grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: '#000000',
      },
      grandTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
      },
      grandTotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
      },
      paymentSection: {
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        borderStyle: 'dashed',
      },
      paymentTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
      },
      paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
      },
      paymentLabel: {
        fontSize: 11,
        color: '#666666',
      },
      paymentValue: {
        fontSize: 11,
        color: '#000000',
      },
      footer: {
        alignItems: 'center',
        marginTop: theme.spacing.sm,
      },
      thankYouText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
      },
      footerText: {
        fontSize: 10,
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
      },
      barcode: {
        alignItems: 'center',
        marginTop: theme.spacing.md,
      },
      barcodeText: {
        fontSize: 8,
        color: '#999999',
        letterSpacing: 2,
        fontFamily: 'monospace',
      },
    });

    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.restaurantName}>{receipt.header.restaurantName}</Text>
          <Text style={styles.restaurantInfo}>{receipt.header.restaurantAddress}</Text>
          <Text style={styles.restaurantInfo}>{receipt.header.restaurantPhone}</Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Order #:</Text>
            <Text style={styles.orderInfoValue}>{receipt.header.orderNumber}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Table:</Text>
            <Text style={styles.orderInfoValue}>{receipt.header.tableNumber}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Server:</Text>
            <Text style={styles.orderInfoValue}>{receipt.header.serverName}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Date:</Text>
            <Text style={styles.orderInfoValue}>
              {receipt.header.date} {receipt.header.time}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          {receipt.orderItems.map((item, index) => (
            <View key={index}>
              <View style={styles.itemRow}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
              </View>
              {item.modifiers && item.modifiers.length > 0 && (
                <View style={styles.itemModifiers}>
                  {item.modifiers.map((mod, modIndex) => (
                    <Text key={modIndex} style={styles.modifierText}>
                      - {mod}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(receipt.totals.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax ({receipt.totals.taxRate}%)</Text>
            <Text style={styles.totalsValue}>{formatCurrency(receipt.totals.tax)}</Text>
          </View>
          {receipt.totals.tip > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tip ({receipt.totals.tipRate}%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(receipt.totals.tip)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(receipt.totals.total)}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Details</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Method:</Text>
            <Text style={styles.paymentValue}>{receipt.payment.method}</Text>
          </View>
          {receipt.payment.cardLast4 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Card:</Text>
              <Text style={styles.paymentValue}>****{receipt.payment.cardLast4}</Text>
            </View>
          )}
          {receipt.payment.transactionId && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Transaction:</Text>
              <Text style={styles.paymentValue}>{receipt.payment.transactionId}</Text>
            </View>
          )}
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Amount:</Text>
            <Text style={styles.paymentValue}>{formatCurrency(receipt.payment.amount)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYouText}>{receipt.footer.thankYouMessage}</Text>
          <Text style={styles.footerText}>{receipt.footer.returnPolicy}</Text>
          <Text style={styles.footerText}>{receipt.footer.website}</Text>
        </View>

        {/* Barcode placeholder */}
        <View style={styles.barcode}>
          <Text style={styles.barcodeText}>||||| ||| || ||| ||||| || ||| |||||</Text>
          <Text style={styles.barcodeText}>{receipt.id}</Text>
        </View>
      </View>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

export default ReceiptTemplate;
