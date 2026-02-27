/**
 * DeleteConfirmDialog Component
 * Reusable confirmation dialog for delete operations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';

interface DeleteConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  itemName?: string;
  warningMessage?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  visible,
  title,
  message,
  itemName,
  warningMessage,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    content: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.error + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      lineHeight: 20,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.warning + '20',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.warning,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    cancelButton: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline,
    },
    deleteButton: {
      backgroundColor: 'transparent',
    },
    deleteButtonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.onSurface,
    },
    deleteButtonText: {
      color: theme.colors.error,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon
                name="delete-alert-outline"
                size={32}
                color={theme.colors.error}
                accessibilityLabel=""
              />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {itemName && (
              <Text style={styles.itemName}>{itemName}</Text>
            )}

            {warningMessage && (
              <View style={styles.warningContainer}>
                <Icon
                  name="alert-circle-outline"
                  size={18}
                  color={theme.colors.warning}
                  accessibilityLabel=""
                />
                <Text style={styles.warningText}>{warningMessage}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              accessibilityLabel={cancelText}
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                isDeleting && styles.deleteButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={isDeleting}
              accessibilityLabel={confirmText}
              accessibilityRole="button"
              testID="btn-confirm-delete"
            >
              {isDeleting ? (
                <Icon
                  name="loading"
                  size={18}
                  color={theme.colors.error}
                  accessibilityLabel=""
                />
              ) : (
                <Icon
                  name="delete-outline"
                  size={18}
                  color={theme.colors.error}
                  accessibilityLabel=""
                />
              )}
              <Text style={[styles.buttonText, styles.deleteButtonText]}>
                {isDeleting ? 'Deleting...' : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmDialog;
