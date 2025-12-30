/**
 * ModifierSelectionList Component
 * Displays available modifier groups for selection when creating/editing menu items
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { ModifierGroupWithStats, ModifierGroup } from '@/types/menu-management-extended.types';

interface ModifierSelectionListProps {
  /** Available modifier groups to choose from */
  modifierGroups: (ModifierGroup | ModifierGroupWithStats)[];
  /** Currently selected modifier group IDs */
  selectedGroupIds: string[];
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: string[]) => void;
  /** Show only active modifier groups */
  activeOnly?: boolean;
  /** Optional title */
  title?: string;
}

export const ModifierSelectionList: React.FC<ModifierSelectionListProps> = ({
  modifierGroups,
  selectedGroupIds,
  onSelectionChange,
  activeOnly = true,
  title = 'Select Modifiers',
}) => {
  const { theme } = useTheme();

  const filteredGroups = useMemo(() => {
    if (activeOnly) {
      return modifierGroups.filter(g => g.is_active);
    }
    return modifierGroups;
  }, [modifierGroups, activeOnly]);

  const handleToggleGroup = useCallback((groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      onSelectionChange(selectedGroupIds.filter(id => id !== groupId));
    } else {
      onSelectionChange([...selectedGroupIds, groupId]);
    }
  }, [selectedGroupIds, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredGroups.map(g => g.id);
    onSelectionChange(allIds);
  }, [filteredGroups, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const getSelectionText = useCallback((group: ModifierGroup | ModifierGroupWithStats) => {
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
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    selectionInfo: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
    actionButtonText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
    },
    emptyIcon: {
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    list: {
      gap: theme.spacing.sm,
    },
    groupCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      padding: theme.spacing.md,
    },
    groupCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    checkboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    groupInfo: {
      flex: 1,
    },
    groupTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    groupName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    badges: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
    badgeRequired: {
      backgroundColor: theme.colors.errorLight,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
    },
    badgeTextRequired: {
      color: theme.colors.error,
    },
    groupDescription: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    optionsPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    optionsIcon: {
      marginRight: theme.spacing.xs,
    },
    optionsText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    optionCount: {
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    separator: {
      color: theme.colors.outline,
      marginHorizontal: theme.spacing.xs,
    },
    selectionType: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    optionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: theme.spacing.xs,
    },
    optionChip: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
    optionChipText: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
  });

  if (filteredGroups.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon
            name="tune-variant"
            size={48}
            color={theme.colors.onSurfaceVariant}
            accessibilityLabel=""
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>
            No modifier groups available
          </Text>
          <Text style={styles.emptySubtext}>
            Create modifier groups in the Modifiers tab first
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.selectionInfo}>
            {selectedGroupIds.length} of {filteredGroups.length} selected
          </Text>
        </View>
        <View style={styles.actions}>
          {selectedGroupIds.length > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeselectAll}
              accessibilityLabel="Deselect all modifiers"
            >
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
          {selectedGroupIds.length < filteredGroups.length && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSelectAll}
              accessibilityLabel="Select all modifiers"
            >
              <Text style={styles.actionButtonText}>Select All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filteredGroups.map((group) => {
          const isSelected = selectedGroupIds.includes(group.id);
          const optionsCount = group.options?.length || 0;
          const optionsPreview = group.options?.slice(0, 3).map(o => o.name) || [];

          return (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupCard,
                isSelected && styles.groupCardSelected,
              ]}
              onPress={() => handleToggleGroup(group.id)}
              activeOpacity={0.7}
              accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${group.name} modifier group`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <View style={styles.groupHeader}>
                <View style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}>
                  {isSelected && (
                    <Icon
                      name="check"
                      size={16}
                      color={theme.colors.white}
                      accessibilityLabel=""
                    />
                  )}
                </View>
                <View style={styles.groupInfo}>
                  <View style={styles.groupTitleRow}>
                    <Text style={styles.groupName} numberOfLines={1}>
                      {group.name}
                    </Text>
                    <View style={styles.badges}>
                      {group.is_required && (
                        <View style={[styles.badge, styles.badgeRequired]}>
                          <Text style={[styles.badgeText, styles.badgeTextRequired]}>
                            Required
                          </Text>
                        </View>
                      )}
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {group.selection_type === 'single' ? 'Single' : 'Multi'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {group.description && (
                    <Text style={styles.groupDescription} numberOfLines={2}>
                      {group.description}
                    </Text>
                  )}
                  <View style={styles.optionsPreview}>
                    <Icon
                      name="format-list-bulleted"
                      size={14}
                      color={theme.colors.onSurfaceVariant}
                      accessibilityLabel=""
                      style={styles.optionsIcon}
                    />
                    <Text style={styles.optionsText}>
                      <Text style={styles.optionCount}>{optionsCount}</Text>
                      {' options'}
                    </Text>
                    <Text style={styles.separator}>|</Text>
                    <Text style={styles.selectionType}>
                      {getSelectionText(group)}
                    </Text>
                  </View>
                  {optionsPreview.length > 0 && (
                    <View style={styles.optionChips}>
                      {optionsPreview.map((name, index) => (
                        <View key={index} style={styles.optionChip}>
                          <Text style={styles.optionChipText}>{name}</Text>
                        </View>
                      ))}
                      {optionsCount > 3 && (
                        <View style={styles.optionChip}>
                          <Text style={styles.optionChipText}>
                            +{optionsCount - 3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ModifierSelectionList;
