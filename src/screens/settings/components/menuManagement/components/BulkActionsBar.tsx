/**
 * BulkActionsBar Component
 * Action bar for bulk operations on selected menu items
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
  onBulkAvailable: () => void;
  onBulkUnavailable: () => void;
  onBulkChangeCategory: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  onBulkAvailable,
  onBulkUnavailable,
  onBulkChangeCategory,
}) => {
  const { theme } = useTheme();

  const allSelected = selectedCount === totalCount && totalCount > 0;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    selectionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    closeButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    selectionText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.white,
    },
    selectAllButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    selectAllText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.white,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    actionsContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.spacing.xs,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      gap: theme.spacing.xs,
    },
    actionButtonDanger: {
      backgroundColor: theme.colors.error,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.white,
    },
    moreButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  });

  if (selectedCount === 0) return null;

  return (
    <View style={styles.container}>
      {/* Selection Info */}
      <View style={styles.selectionInfo}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClearSelection}
          accessibilityLabel="Clear selection"
          accessibilityRole="button"
        >
          <Icon name="close" size={18} color={theme.colors.white} accessibilityLabel="" />
        </TouchableOpacity>
        <Text style={styles.selectionText}>
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </Text>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={allSelected ? onClearSelection : onSelectAll}
          accessibilityLabel={allSelected ? 'Deselect all' : 'Select all'}
          accessibilityRole="button"
        >
          <Text style={styles.selectAllText}>
            {allSelected ? 'Deselect All' : `Select All (${totalCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBulkEdit}
          accessibilityLabel="Edit selected items"
          accessibilityRole="button"
        >
          <Icon name="pencil-outline" size={16} color={theme.colors.white} accessibilityLabel="" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBulkAvailable}
          accessibilityLabel="Mark selected as available"
          accessibilityRole="button"
        >
          <Icon name="eye-outline" size={16} color={theme.colors.white} accessibilityLabel="" />
          <Text style={styles.actionText}>Available</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBulkUnavailable}
          accessibilityLabel="Mark selected as unavailable"
          accessibilityRole="button"
        >
          <Icon name="eye-off-outline" size={16} color={theme.colors.white} accessibilityLabel="" />
          <Text style={styles.actionText}>Unavailable</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBulkChangeCategory}
          accessibilityLabel="Change category for selected items"
          accessibilityRole="button"
        >
          <Icon name="folder-move-outline" size={16} color={theme.colors.white} accessibilityLabel="" />
          <Text style={styles.actionText}>Move</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={onBulkDelete}
          accessibilityLabel="Delete selected items"
          accessibilityRole="button"
        >
          <Icon name="delete-outline" size={16} color={theme.colors.white} accessibilityLabel="" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BulkActionsBar;
