/**
 * SplitByItems - Item-based split component
 *
 * Allows assigning specific items to specific guests:
 * - Guest count selector
 * - Item list with guest assignment buttons
 * - Guest cards with assigned item totals
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { GuestSplit, BillItem } from '@/types/billing.types';
import { GuestCard } from './GuestCard';
import { ItemAssignment } from './ItemAssignment';

export interface SplitByItemsProps {
  items: BillItem[];
  guests: GuestSplit[];
  guestCount: number;
  minGuests?: number;
  maxGuests?: number;
  selectedGuestId?: string | null;
  onGuestCountChange: (count: number) => void;
  onAssignItem: (itemId: string, guestId: string) => void;
  onGuestSelect?: (guest: GuestSplit) => void;
  onGuestPay: (guest: GuestSplit) => void;
  formatPrice?: (price: number) => string;
}

export const SplitByItems: React.FC<SplitByItemsProps> = memo(
  ({
    items,
    guests,
    guestCount,
    minGuests = 2,
    maxGuests = 10,
    selectedGuestId,
    onGuestCountChange,
    onAssignItem,
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
      warningBox: {
        backgroundColor: theme.colors.warningContainer || '#FEF7E0',
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        marginTop: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
      },
      warningText: {
        ...theme.typography.caption,
        color: theme.colors.onWarningContainer || '#7A5700',
        marginLeft: theme.spacing.xs,
        flex: 1,
      },
      validBox: {
        backgroundColor: theme.colors.successContainer || '#E8F5E9',
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        marginTop: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
      },
      validText: {
        ...theme.typography.caption,
        color: theme.colors.success,
        marginLeft: theme.spacing.xs,
        flex: 1,
      },
      summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xs,
        marginTop: theme.spacing.sm,
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

    // Calculate unassigned items
    const assignedItemIds = useMemo(() => {
      const ids = new Set<string>();
      guests.forEach((guest) => {
        guest.assignedItems.forEach((ai) => ids.add(ai.itemId));
      });
      return ids;
    }, [guests]);

    const unassignedCount = items.filter(
      (item) => !assignedItemIds.has(item.id)
    ).length;

    const totalAssigned = guests.reduce((sum, g) => sum + g.subtotal, 0);
    const totalUnassigned = items
      .filter((item) => !assignedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.itemTotal, 0);

    const isValid = unassignedCount === 0;

    return (
      <>
        {/* Guest Count Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Guests</Text>
          <View style={styles.guestCountSection}>
            <TouchableOpacity
              style={[
                styles.countButton,
                guestCount <= minGuests && styles.countButtonDisabled,
              ]}
              onPress={handleDecrease}
              disabled={guestCount <= minGuests}
              activeOpacity={0.7}
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
        </View>

        {/* Items Assignment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign Items to Guests</Text>
          <ItemAssignment
            items={items}
            guests={guests}
            onAssignItem={onAssignItem}
            formatPrice={formatPrice}
          />

          {/* Validation Status */}
          {isValid ? (
            <View style={styles.validBox}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.validText}>
                All items assigned! Ready to process payments.
              </Text>
            </View>
          ) : (
            <View style={styles.warningBox}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color={theme.colors.onWarningContainer || '#7A5700'}
              />
              <Text style={styles.warningText}>
                {unassignedCount} item{unassignedCount !== 1 ? 's' : ''} not assigned
                ({formatPrice(totalUnassigned)} remaining)
              </Text>
            </View>
          )}

          {/* Summary */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Assigned Total</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalAssigned)}</Text>
          </View>
        </View>

        {/* Guest Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Totals</Text>
          <View style={styles.guestsGrid}>
            {guests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                isSelected={selectedGuestId === guest.id}
                showItemCount={true}
                onPress={onGuestSelect}
                onPayPress={onGuestPay}
                formatPrice={formatPrice}
              />
            ))}
          </View>
        </View>
      </>
    );
  }
);

SplitByItems.displayName = 'SplitByItems';

export default SplitByItems;
