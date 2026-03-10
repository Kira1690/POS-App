/**
 * GuestCountModal — Shown when splitting a table.
 * Lets the user pick how many guests for the new split order.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@/components/common';
import { Table } from '@/types/table.types';

interface GuestCountModalProps {
  visible: boolean;
  table: Table | null;
  maxGuests: number;
  occupiedSeats: number;
  onConfirm: (guestCount: number) => void;
  onClose: () => void;
}

export const GuestCountModal: React.FC<GuestCountModalProps> = ({
  visible,
  table,
  maxGuests,
  occupiedSeats,
  onConfirm,
  onClose,
}) => {
  const { theme } = useTheme();
  const { modalMaxWidth, contentPadding, isPhone, isSmallTablet } = useResponsive();
  const [guestCount, setGuestCount] = useState(1);
  const compact = isPhone || isSmallTablet;

  useEffect(() => {
    if (visible) setGuestCount(1);
  }, [visible]);

  if (!table) return null;

  const capacity = table.capacity;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: contentPadding,
    },
    card: {
      width: '100%',
      maxWidth: modalMaxWidth,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 8,
    },
    header: {
      backgroundColor: theme.colors.tertiary + '18',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.tertiary + '33',
      paddingHorizontal: compact ? 14 : 20,
      paddingVertical: compact ? 10 : 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 8 : 10,
    },
    headerText: {
      flex: 1,
      fontSize: compact ? 14 : 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      paddingHorizontal: compact ? 14 : 20,
      paddingTop: compact ? 12 : 16,
      paddingBottom: compact ? 14 : 20,
      alignItems: 'center',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 6,
    },
    infoLabel: {
      fontSize: compact ? 12 : 13,
      color: theme.colors.onSurfaceVariant,
    },
    infoValue: {
      fontSize: compact ? 12 : 13,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline + '44',
      width: '100%',
      marginVertical: 14,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 16 : 20,
      marginTop: compact ? 6 : 8,
      marginBottom: 4,
    },
    stepperBtn: {
      width: compact ? 38 : 44,
      height: compact ? 38 : 44,
      borderRadius: compact ? 19 : 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    stepperBtnEnabled: {
      backgroundColor: theme.colors.tertiary + '15',
      borderColor: theme.colors.tertiary,
    },
    stepperBtnDisabled: {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.outline,
    },
    countText: {
      fontSize: compact ? 26 : 32,
      fontWeight: '700',
      color: theme.colors.onSurface,
      minWidth: compact ? 40 : 48,
      textAlign: 'center',
    },
    countLabel: {
      fontSize: compact ? 12 : 13,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: compact ? 8 : 10,
      paddingHorizontal: compact ? 12 : 16,
      paddingBottom: compact ? 12 : 16,
    },
    btnCancel: {
      flex: 1,
      paddingVertical: compact ? 10 : 13,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    btnConfirm: {
      flex: 1,
      paddingVertical: compact ? 10 : 13,
      borderRadius: 10,
      backgroundColor: theme.colors.tertiaryContainer,
      borderWidth: 1,
      borderColor: theme.colors.tertiary,
      alignItems: 'center',
    },
    btnCancelText: {
      fontSize: compact ? 13 : 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    btnConfirmText: {
      fontSize: compact ? 13 : 14,
      fontWeight: '600',
      color: theme.colors.tertiary,
    },
  });

  const canDecrement = guestCount > 1;
  const canIncrement = guestCount < maxGuests;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card} testID="modal-guest-count">
          {/* Header */}
          <View style={styles.header}>
            <Icon name="account-multiple-plus" size={20} color={theme.colors.tertiary} />
            <Text style={styles.headerText}>How many guests?</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="btn-guest-count-close">
              <Icon name="close" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Table</Text>
              <Text style={styles.infoValue}>{table.table_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capacity</Text>
              <Text style={styles.infoValue}>{capacity} seats</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Occupied</Text>
              <Text style={styles.infoValue}>{occupiedSeats} of {capacity} seats</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Remaining</Text>
              <Text style={[styles.infoValue, { color: theme.colors.success }]}>
                {maxGuests} seat{maxGuests !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Stepper */}
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, canDecrement ? styles.stepperBtnEnabled : styles.stepperBtnDisabled]}
                onPress={() => canDecrement && setGuestCount(g => g - 1)}
                disabled={!canDecrement}
                testID="btn-guest-decrement"
              >
                <Icon
                  name="minus"
                  size={22}
                  color={canDecrement ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>

              <Text style={styles.countText}>{guestCount}</Text>

              <TouchableOpacity
                style={[styles.stepperBtn, canIncrement ? styles.stepperBtnEnabled : styles.stepperBtnDisabled]}
                onPress={() => canIncrement && setGuestCount(g => g + 1)}
                disabled={!canIncrement}
                testID="btn-guest-increment"
              >
                <Icon
                  name="plus"
                  size={22}
                  color={canIncrement ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.countLabel}>guest{guestCount !== 1 ? 's' : ''}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose} testID="btn-guest-cancel">
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnConfirm}
              onPress={() => onConfirm(guestCount)}
              testID="btn-guest-confirm"
            >
              <Text style={styles.btnConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default GuestCountModal;
