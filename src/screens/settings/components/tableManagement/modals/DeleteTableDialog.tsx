/**
 * Delete Table Confirmation Dialog
 * Type "DELETE" confirmation for table deletion
 * Phase 2 - Complete Modal System
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { MOCK_TABLES, MockTable } from '@/data/tables';

interface DeleteTableDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableId: string;
}

export const DeleteTableDialog: React.FC<DeleteTableDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  tableId,
}) => {
  const { theme } = useTheme();
  const [confirmationText, setConfirmationText] = useState('');

  // Find the table being deleted
  const table = useMemo(
    () => MOCK_TABLES.find((t) => t.id === tableId),
    [tableId]
  );

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (visible) {
      setConfirmationText('');
    }
  }, [visible]);

  // Check if deletion can proceed
  const canDelete = confirmationText === 'DELETE';

  // Check if table has active reservation
  const hasActiveReservation = table?.status === 'reserved';

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
      setConfirmationText('');
    }
  };

  if (!table) return null;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialogContainer: {
      width: '85%',
      maxWidth: 450,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.xl as number,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.lg,
      backgroundColor: theme.colors.error,
    },
    headerIcon: {
      padding: spacing.xs,
    },
    headerTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      color: theme.colors.white,
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    warningText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      lineHeight: 22,
    },
    detailsSection: {
      marginTop: spacing.sm,
    },
    detailsTitle: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: spacing.xs,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    detailBullet: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.onSurface,
      marginRight: spacing.sm,
    },
    detailText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    alertSection: {
      backgroundColor: theme.colors.error + '15',
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      marginTop: spacing.sm,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    alertTitle: {
      ...typography.bodyMedium,
      fontWeight: '700',
      color: theme.colors.error,
    },
    alertText: {
      ...typography.bodySmall,
      color: theme.colors.error,
      lineHeight: 20,
    },
    confirmationSection: {
      marginTop: spacing.md,
    },
    confirmationLabel: {
      ...typography.bodyMedium,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: spacing.xs,
    },
    confirmationInput: {
      ...typography.bodyMedium,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      padding: spacing.md,
      color: theme.colors.onSurface,
      fontWeight: '700',
      letterSpacing: 1,
    },
    confirmationInputValid: {
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.success + '10',
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.dialogContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Icon
                name="alert-circle"
                size={28}
                color={theme.colors.white}
                accessibilityLabel="Warning"
              />
            </View>
            <Text style={styles.headerTitle}>Delete Table {table.number}?</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Warning Message */}
            <Text style={styles.warningText}>
              Are you sure you want to delete this table? This action cannot be undone.
            </Text>

            {/* Table Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Table Details:</Text>
              <View style={styles.detailItem}>
                <View style={styles.detailBullet} />
                <Text style={styles.detailText}>Table Number: {table.number}</Text>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.detailBullet} />
                <Text style={styles.detailText}>Capacity: {table.capacity} seats</Text>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.detailBullet} />
                <Text style={styles.detailText}>Area: {table.area}</Text>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.detailBullet} />
                <Text style={styles.detailText}>
                  Current Status: {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Active Reservation Warning */}
            {hasActiveReservation && (
              <View style={styles.alertSection}>
                <View style={styles.alertHeader}>
                  <Icon
                    name="alert-circle-outline"
                    size={20}
                    color={theme.colors.error}
                    accessibilityLabel="Warning"
                  />
                  <Text style={styles.alertTitle}>WARNING:</Text>
                </View>
                <Text style={styles.alertText}>
                  This table has an active reservation until 7:30 PM. Deleting will cancel the
                  reservation.
                </Text>
              </View>
            )}

            {/* Confirmation Input */}
            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationLabel}>Type DELETE to confirm:</Text>
              <TextInput
                style={[
                  styles.confirmationInput,
                  canDelete && styles.confirmationInputValid,
                ]}
                value={confirmationText}
                onChangeText={setConfirmationText}
                placeholder=""
                placeholderTextColor={theme.colors.onSurfaceVariant}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <AppleButton
              title="Cancel"
              variant="secondary"
              size="medium"
              icon={
                <Icon
                  name="close"
                  size={18}
                  color={theme.colors.onSurface}
                  accessibilityLabel="Cancel"
                />
              }
              iconPosition="left"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <AppleButton
              title="Delete Table"
              variant="danger"
              size="medium"
              icon={
                <Icon
                  name="delete"
                  size={18}
                  color={theme.colors.white}
                  accessibilityLabel="Delete"
                />
              }
              iconPosition="left"
              onPress={handleConfirm}
              disabled={!canDelete}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
