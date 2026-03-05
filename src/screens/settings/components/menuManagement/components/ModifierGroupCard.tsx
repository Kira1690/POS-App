/**
 * ModifierGroupCard Component
 * Displays a single modifier group with its options
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ModifierGroup } from '@/types/menu-management-extended.types';

interface ModifierGroupCardProps {
  group: ModifierGroup;
  isSelected?: boolean;
  onPress?: (group: ModifierGroup) => void;
  onEdit?: (group: ModifierGroup) => void;
  onDelete?: (group: ModifierGroup) => void;
  onAddOption?: (group: ModifierGroup) => void;
  onToggleStatus?: (group: ModifierGroup) => void;
}

export const ModifierGroupCard: React.FC<ModifierGroupCardProps> = ({
  group,
  isSelected = false,
  onPress,
  onEdit,
  onDelete,
  onAddOption,
  onToggleStatus,
}) => {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(group);
  }, [onPress, group]);

  const handleEdit = useCallback(() => {
    onEdit?.(group);
  }, [onEdit, group]);

  const handleDelete = useCallback(() => {
    onDelete?.(group);
  }, [onDelete, group]);

  const handleAddOption = useCallback(() => {
    onAddOption?.(group);
  }, [onAddOption, group]);

  const handleToggleStatus = useCallback(() => {
    onToggleStatus?.(group);
  }, [onToggleStatus, group]);

  const activeOptionsCount = group.options.filter(o => o.is_available).length;
  const totalOptionsCount = group.options.length;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.sm,
      backgroundColor: group.is_active ? theme.colors.success : theme.colors.onSurfaceSecondary,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
    badgeRequired: {
      backgroundColor: theme.colors.primaryLight,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    badgeTextRequired: {
      color: theme.colors.primary,
    },
    description: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
    },
    optionsContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    optionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    optionsTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
      textTransform: 'uppercase',
    },
    optionsCount: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    optionsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    optionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    optionChipInactive: {
      opacity: 0.5,
    },
    optionChipDefault: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    optionName: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    optionPrice: {
      fontSize: 11,
      color: theme.colors.success,
      marginLeft: theme.spacing.xs,
    },
    optionPriceNegative: {
      color: theme.colors.error,
    },
    emptyOptions: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      fontStyle: 'italic',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingTop: theme.spacing.sm,
    },
    selectionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    selectionText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    actionButtonDanger: {
      backgroundColor: theme.colors.errorLight,
    },
  });

  const renderOptionChip = (option: typeof group.options[0]) => {
    const priceAdjustment = option.price_adjustment;
    const priceText = priceAdjustment > 0
      ? `+$${priceAdjustment.toFixed(2)}`
      : priceAdjustment < 0
        ? `-$${Math.abs(priceAdjustment).toFixed(2)}`
        : '';

    return (
      <View
        key={option.id}
        style={[
          styles.optionChip,
          !option.is_available && styles.optionChipInactive,
          option.is_default && styles.optionChipDefault,
        ]}
      >
        <Text style={styles.optionName}>{option.name}</Text>
        {priceText ? (
          <Text style={[styles.optionPrice, priceAdjustment < 0 && styles.optionPriceNegative]}>
            {priceText}
          </Text>
        ) : null}
        {option.is_default && (
          <MaterialCommunityIcons
            name="star"
            size={10}
            color={theme.colors.primary}
            style={{ marginLeft: 2 }}
          />
        )}
      </View>
    );
  };

  const getSelectionText = () => {
    if (group.selection_type === 'single') {
      return 'Select one';
    }
    if (group.min_selections && group.max_selections) {
      return `Select ${group.min_selections}-${group.max_selections}`;
    }
    if (group.min_selections) {
      return `Min ${group.min_selections}`;
    }
    if (group.max_selections) {
      return `Max ${group.max_selections}`;
    }
    return 'Select any';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`Modifier group: ${group.name}`}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.statusIndicator} />
          <Text style={styles.title} numberOfLines={1}>{group.name}</Text>
        </View>
        <View style={styles.badges}>
          {group.is_required && (
            <View style={[styles.badge, styles.badgeRequired]}>
              <Text style={[styles.badgeText, styles.badgeTextRequired]}>Required</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {group.selection_type === 'single' ? 'Single' : 'Multiple'}
            </Text>
          </View>
        </View>
      </View>

      {group.description && (
        <Text style={styles.description} numberOfLines={2}>{group.description}</Text>
      )}

      <View style={styles.optionsContainer}>
        <View style={styles.optionsHeader}>
          <Text style={styles.optionsTitle}>Options</Text>
          <Text style={styles.optionsCount}>
            {activeOptionsCount}/{totalOptionsCount} active
          </Text>
        </View>
        {group.options.length > 0 ? (
          <View style={styles.optionsList}>
            {group.options.slice(0, 6).map(renderOptionChip)}
            {group.options.length > 6 && (
              <View style={styles.optionChip}>
                <Text style={styles.optionName}>+{group.options.length - 6} more</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyOptions}>No options added yet</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.selectionInfo}>
          <MaterialCommunityIcons
            name={group.selection_type === 'single' ? 'radiobox-marked' : 'checkbox-marked'}
            size={14}
            color={theme.colors.onSurfaceSecondary}
          />
          <Text style={styles.selectionText}>{getSelectionText()}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddOption}
            accessibilityLabel="Add modifier option"
            testID="btn-add-option"
          >
            <MaterialCommunityIcons name="plus" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleStatus}
            accessibilityLabel={group.is_active ? 'Deactivate' : 'Activate'}
          >
            <MaterialCommunityIcons
              name={group.is_active ? 'eye' : 'eye-off'}
              size={18}
              color={theme.colors.onSurfaceSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEdit}
            accessibilityLabel="Edit modifier group"
          >
            <MaterialCommunityIcons name="pencil" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleDelete}
            accessibilityLabel="Delete modifier group"
            testID="btn-delete-modifier-group"
          >
            <MaterialCommunityIcons name="delete" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ModifierGroupCard;
