/**
 * AssignModifiersModal Component
 * Modal for assigning modifier groups to a menu item
 * Allows multi-selection of modifier groups with visual feedback
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { MenuItemExtended, ModifierGroup } from '@/types/menu-management-extended.types';
import { menuStorageService } from '@/services/storage/MenuStorageService';

interface AssignModifiersModalProps {
  visible: boolean;
  menuItem: MenuItemExtended | null;
  onClose: () => void;
  onSave: (menuItemId: string, modifierGroupIds: string[]) => Promise<void>;
}

export const AssignModifiersModal: React.FC<AssignModifiersModalProps> = ({
  visible,
  menuItem,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const [allModifierGroups, setAllModifierGroups] = useState<ModifierGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load modifier groups and set selected ones
  useEffect(() => {
    if (visible && menuItem) {
      loadModifierGroups();
    }
  }, [visible, menuItem]);

  const loadModifierGroups = async () => {
    setIsLoading(true);
    try {
      const groups = await menuStorageService.getModifierGroups();
      setAllModifierGroups(groups);

      // Set currently assigned modifier groups
      if (menuItem?.modifier_assignments) {
        const assignedIds = menuItem.modifier_assignments.map((a) => a.modifier_group_id);
        setSelectedGroupIds(assignedIds);
      } else {
        setSelectedGroupIds([]);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleGroup = useCallback((groupId: string) => {
    setSelectedGroupIds((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const activeGroups = allModifierGroups.filter((g) => g.is_active);
    setSelectedGroupIds(activeGroups.map((g) => g.id));
  }, [allModifierGroups]);

  const handleDeselectAll = useCallback(() => {
    setSelectedGroupIds([]);
  }, []);

  const handleSave = async () => {
    if (!menuItem) return;

    setIsSaving(true);
    try {
      await onSave(menuItem.id, selectedGroupIds);
      onClose();
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedGroupIds([]);
    onClose();
  };

  const activeGroups = useMemo(() =>
    allModifierGroups.filter((g) => g.is_active),
    [allModifierGroups]
  );

  const inactiveGroups = useMemo(() =>
    allModifierGroups.filter((g) => !g.is_active),
    [allModifierGroups]
  );

  const renderModifierGroupItem = (group: ModifierGroup) => {
    const isSelected = selectedGroupIds.includes(group.id);
    const optionCount = group.options.length;
    const isRequired = group.is_required;

    return (
      <TouchableOpacity
        key={group.id}
        style={[
          styles.groupItem,
          {
            backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
          },
        ]}
        onPress={() => handleToggleGroup(group.id)}
        activeOpacity={0.7}
        accessibilityLabel={`${group.name}, ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityRole="button"
      >
        {/* Checkbox */}
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
              borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
            },
          ]}
        >
          {isSelected && (
            <MaterialCommunityIcons
              name="check"
              size={16}
              color={theme.colors.onPrimary}
            />
          )}
        </View>

        {/* Group Info */}
        <View style={styles.groupInfo}>
          <View style={styles.groupHeader}>
            <Text
              style={[
                styles.groupName,
                {
                  color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                },
              ]}
            >
              {group.name}
            </Text>
            {isRequired && (
              <View
                style={[
                  styles.requiredBadge,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Text style={[styles.requiredText, { color: theme.colors.white }]}>
                  Required
                </Text>
              </View>
            )}
          </View>

          {group.description && (
            <Text
              style={[
                styles.groupDescription,
                {
                  color: isSelected
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceSecondary,
                },
              ]}
              numberOfLines={2}
            >
              {group.description}
            </Text>
          )}

          <View style={styles.groupMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={14}
                color={
                  isSelected
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceSecondary
                }
              />
              <Text
                style={[
                  styles.metaText,
                  {
                    color: isSelected
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceSecondary,
                  },
                ]}
              >
                {optionCount} option{optionCount !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name={group.selection_type === 'single' ? 'radiobox-marked' : 'checkbox-marked'}
                size={14}
                color={
                  isSelected
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceSecondary
                }
              />
              <Text
                style={[
                  styles.metaText,
                  {
                    color: isSelected
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceSecondary,
                  },
                ]}
              >
                {group.selection_type === 'single' ? 'Single' : 'Multiple'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 600,
      height: '75%',
      maxHeight: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onPrimary,
      marginTop: theme.spacing.xs / 2,
    },
    closeButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing['3xl'],
    },
    actionsBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surfaceLight,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    selectionCount: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    bulkActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    bulkActionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    bulkActionText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    groupItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      marginBottom: theme.spacing.sm,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    groupInfo: {
      flex: 1,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs / 2,
      gap: theme.spacing.xs,
    },
    groupName: {
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    requiredBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    requiredText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    groupDescription: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: theme.spacing.xs,
    },
    groupMeta: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['3xl'],
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.surfaceLight,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    saveButtonTextDisabled: {
      color: theme.colors.onSurfaceSecondary,
    },
  });

  if (!menuItem) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Assign Modifiers</Text>
              <Text style={styles.subtitle}>{menuItem.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.emptyText,
                    { marginTop: theme.spacing.md },
                  ]}
                >
                  Loading modifier groups...
                </Text>
              </View>
            ) : (
              <>
                {/* Actions Bar */}
                <View style={styles.actionsBar}>
                  <Text style={styles.selectionCount}>
                    {selectedGroupIds.length} selected
                  </Text>
                  <View style={styles.bulkActions}>
                    <TouchableOpacity
                      style={styles.bulkActionButton}
                      onPress={handleSelectAll}
                      accessibilityLabel="Select all"
                      accessibilityRole="button"
                    >
                      <Text style={styles.bulkActionText}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.bulkActionButton}
                      onPress={handleDeselectAll}
                      accessibilityLabel="Deselect all"
                      accessibilityRole="button"
                    >
                      <Text style={styles.bulkActionText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Scrollable List */}
                <ScrollView
                  style={styles.content}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {allModifierGroups.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons
                        name="tune-variant"
                        size={48}
                        color={theme.colors.onSurfaceSecondary}
                        style={styles.emptyIcon}
                      />
                      <Text style={styles.emptyText}>
                        No modifier groups available.{'\n'}
                        Create modifier groups first.
                      </Text>
                    </View>
                  ) : (
                    <>
                      {activeGroups.length > 0 && (
                        <>
                          <Text style={styles.sectionHeader}>
                            Active Modifier Groups ({activeGroups.length})
                          </Text>
                          {activeGroups.map(renderModifierGroupItem)}
                        </>
                      )}

                      {inactiveGroups.length > 0 && (
                        <>
                          <Text style={styles.sectionHeader}>
                            Inactive Modifier Groups ({inactiveGroups.length})
                          </Text>
                          {inactiveGroups.map(renderModifierGroupItem)}
                        </>
                      )}
                    </>
                  )}
                </ScrollView>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isSaving && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel="Save assignments"
              accessibilityRole="button"
            >
              {isSaving && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.onPrimary}
                />
              )}
              <Text
                style={[
                  styles.saveButtonText,
                  isSaving && styles.saveButtonTextDisabled,
                ]}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AssignModifiersModal;
