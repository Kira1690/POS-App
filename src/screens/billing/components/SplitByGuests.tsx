/**
 * SplitByGuests - Equal split component
 *
 * Allows dividing the bill equally among guests:
 * - Guest count selector (+/-)
 * - Display of amount per guest
 * - Guest cards with payment status
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { GuestSplit } from '@/types/billing.types';
import { GuestCard } from './GuestCard';

export interface SplitByGuestsProps {
  guests: GuestSplit[];
  guestCount: number;
  minGuests?: number;
  maxGuests?: number;
  selectedGuestId?: string | null;
  onGuestCountChange: (count: number) => void;
  onGuestSelect?: (guest: GuestSplit) => void;
  onGuestPay: (guest: GuestSplit) => void;
  formatPrice?: (price: number) => string;
}

export const SplitByGuests: React.FC<SplitByGuestsProps> = memo(
  ({
    guests,
    guestCount,
    minGuests = 2,
    maxGuests = 10,
    selectedGuestId,
    onGuestCountChange,
    onGuestSelect,
    onGuestPay,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
  }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
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
      countButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
      },
      countButtonDisabled: {
        backgroundColor: theme.colors.surfaceLight,
      },
      countValue: {
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
      infoText: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
      },
      summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xs,
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
      },
      summaryLabel: {
        ...theme.typography.body2,
        color: theme.colors.onSurfaceVariant,
      },
      summaryValue: {
        ...theme.typography.body2,
        color: theme.colors.onSurface,
        fontWeight: '500',
      },
      paidValue: {
        color: theme.colors.success,
      },
    });

    const handleDecrease = useCallback(() => {
      if (guestCount > minGuests) {
        onGuestCountChange(guestCount - 1);
      }
    }, [guestCount, minGuests, onGuestCountChange]);

    const handleIncrease = useCallback(() => {
      if (guestCount < maxGuests) {
        onGuestCountChange(guestCount + 1);
      }
    }, [guestCount, maxGuests, onGuestCountChange]);

    const paidGuests = guests.filter((g) => g.paymentStatus === 'paid');
    const totalPaid = paidGuests.reduce((sum, g) => sum + g.total, 0);
    const totalDue = guests.reduce((sum, g) => sum + g.total, 0);

    return (
      <>
        {/* Guest Count Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Guests</Text>
          <View style={styles.guestCountSection}>
            <TouchableOpacity
              style={[
                styles.countButton,
                guestCount <= minGuests && styles.countButtonDisabled,
              ]}
              onPress={handleDecrease}
              disabled={guestCount <= minGuests}
              activeOpacity={0.7}
              testID="btn-guest-count-decrease"
            >
              <MaterialCommunityIcons
                name="minus"
                size={24}
                color={
                  guestCount <= minGuests
                    ? theme.colors.outline
                    : theme.colors.primary
                }
              />
            </TouchableOpacity>
            <Text style={styles.countValue}>{guestCount}</Text>
            <TouchableOpacity
              style={[
                styles.countButton,
                guestCount >= maxGuests && styles.countButtonDisabled,
              ]}
              onPress={handleIncrease}
              disabled={guestCount >= maxGuests}
              activeOpacity={0.7}
              testID="btn-guest-count-increase"
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={
                  guestCount >= maxGuests
                    ? theme.colors.outline
                    : theme.colors.primary
                }
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>
            Each guest pays {formatPrice(guests[0]?.total || 0)}
          </Text>
        </View>

        {/* Guest Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount Per Guest</Text>
          <View style={styles.guestsGrid}>
            {guests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                isSelected={selectedGuestId === guest.id}
                onPress={onGuestSelect}
                onPayPress={onGuestPay}
                formatPrice={formatPrice}
              />
            ))}
          </View>

          {/* Payment Summary */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Paid: {paidGuests.length}/{guests.length} guests
            </Text>
            <Text style={[styles.summaryValue, paidGuests.length > 0 && styles.paidValue]}>
              {formatPrice(totalPaid)} / {formatPrice(totalDue)}
            </Text>
          </View>
        </View>
      </>
    );
  }
);

SplitByGuests.displayName = 'SplitByGuests';

export default SplitByGuests;
