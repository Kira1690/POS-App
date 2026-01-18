/**
 * GuestCard - Displays a guest's split information
 *
 * Reusable component showing:
 * - Guest name with color indicator
 * - Amount due
 * - Payment status
 * - Item count (optional)
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { GuestSplit } from '@/types/billing.types';

export interface GuestCardProps {
  guest: GuestSplit;
  isSelected?: boolean;
  showItemCount?: boolean;
  onPress?: (guest: GuestSplit) => void;
  onPayPress?: (guest: GuestSplit) => void;
  formatPrice?: (price: number) => string;
}

export const GuestCard: React.FC<GuestCardProps> = memo(
  ({
    guest,
    isSelected = false,
    showItemCount = false,
    onPress,
    onPayPress,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
  }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      card: {
        width: '48%',
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderWidth: 2,
        borderColor: isSelected ? theme.colors.primary : 'transparent',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
      },
      colorIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: theme.spacing.sm,
      },
      name: {
        ...theme.typography.body1,
        fontWeight: '600',
        color: theme.colors.onSurface,
        flex: 1,
      },
      itemCount: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
      },
      amount: {
        ...theme.typography.h4,
        color: theme.colors.primary,
        marginVertical: theme.spacing.xs,
      },
      statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
      },
      statusText: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
        marginLeft: theme.spacing.xs,
      },
      payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        marginTop: theme.spacing.sm,
      },
      payButtonText: {
        ...theme.typography.caption,
        color: theme.colors.onPrimary,
        fontWeight: '600',
        marginLeft: theme.spacing.xs,
      },
    });

    const handlePress = useCallback(() => {
      if (onPress) {
        onPress(guest);
      }
    }, [guest, onPress]);

    const handlePayPress = useCallback(() => {
      if (onPayPress) {
        onPayPress(guest);
      }
    }, [guest, onPayPress]);

    const isPaid = guest.paymentStatus === 'paid';
    const isProcessing = guest.paymentStatus === 'processing';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={[styles.colorIndicator, { backgroundColor: guest.color }]} />
          <Text style={styles.name}>{guest.name}</Text>
        </View>

        {showItemCount && (
          <Text style={styles.itemCount}>
            {guest.assignedItems.length} item{guest.assignedItems.length !== 1 ? 's' : ''}
          </Text>
        )}

        <Text style={styles.amount}>{formatPrice(guest.total)}</Text>

        <View style={styles.statusRow}>
          <MaterialCommunityIcons
            name={
              isPaid
                ? 'check-circle'
                : isProcessing
                ? 'clock-outline'
                : 'credit-card-outline'
            }
            size={16}
            color={
              isPaid
                ? theme.colors.success
                : isProcessing
                ? theme.colors.warning
                : theme.colors.onSurfaceVariant
            }
          />
          <Text
            style={[
              styles.statusText,
              isPaid && { color: theme.colors.success },
            ]}
          >
            {isPaid ? 'Paid' : isProcessing ? 'Processing...' : 'Pending'}
          </Text>
        </View>

        {!isPaid && onPayPress && (
          <TouchableOpacity style={styles.payButton} onPress={handlePayPress}>
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }
);

GuestCard.displayName = 'GuestCard';

export default GuestCard;
