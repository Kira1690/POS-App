/**
 * ModifierAssignmentPanel Component
 * Panel for assigning modifier groups to menu items
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ModifierGroup, MenuItemExtended } from '@/types/menu-management-extended.types';

interface ModifierAssignmentPanelProps {
  group: ModifierGroup | null;
  menuItems: MenuItemExtended[];
  assignedItemIds: string[];
  onAssign: (groupId: string, itemIds: string[]) => void;
  onUnassign: (groupId: string, itemIds: string[]) => void;
  onClose?: () => void;
}

export const ModifierAssignmentPanel: React.FC<ModifierAssignmentPanelProps> = ({
  group,
  menuItems,
  assignedItemIds,
  onAssign,
  onUnassign,
  onClose,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set(assignedItemIds));
  const [viewMode, setViewMode] = useState<'all' | 'assigned' | 'unassigned'>('all');

  const filteredItems = useMemo(() => {
    let items = menuItems;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Apply view mode filter
    switch (viewMode) {
      case 'assigned':
        items = items.filter(item => assignedItemIds.includes(item.id));
        break;
      case 'unassigned':
        items = items.filter(item => !assignedItemIds.includes(item.id));
        break;
    }

    return items;
  }, [menuItems, searchQuery, viewMode, assignedItemIds]);

  const handleToggleItem = useCallback((itemId: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedItemIds(new Set(filteredItems.map(item => item.id)));
  }, [filteredItems]);

  const handleDeselectAll = useCallback(() => {
    setSelectedItemIds(new Set());
  }, []);

  const handleApply = useCallback(() => {
    if (!group) return;

    const currentAssigned = new Set(assignedItemIds);
    const newAssigned = selectedItemIds;

    // Items to assign (in selectedItemIds but not in assignedItemIds)
    const toAssign = Array.from(newAssigned).filter(id => !currentAssigned.has(id));
    // Items to unassign (in assignedItemIds but not in selectedItemIds)
    const toUnassign = Array.from(currentAssigned).filter(id => !newAssigned.has(id));

    if (toAssign.length > 0) {
      onAssign(group.id, toAssign);
    }
    if (toUnassign.length > 0) {
      onUnassign(group.id, toUnassign);
    }

    onClose?.();
  }, [group, assignedItemIds, selectedItemIds, onAssign, onUnassign, onClose]);

  const renderViewModeButton = (mode: 'all' | 'assigned' | 'unassigned', label: string, count: number) => {
    const isActive = viewMode === mode;
    return (
      <TouchableOpacity
        style={[styles.viewModeButton, isActive && styles.viewModeButtonActive]}
        onPress={() => setViewMode(mode)}
        accessibilityLabel={`Show ${label} items`}
        accessibilityState={{ selected: isActive }}
      >
        <Text style={[styles.viewModeText, isActive && styles.viewModeTextActive]}>
          {label}
        </Text>
        <View style={[styles.viewModeCount, isActive && styles.viewModeCountActive]}>
          <Text style={[styles.viewModeCountText, isActive && styles.viewModeCountTextActive]}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = useCallback(({ item }: { item: MenuItemExtended }) => {
    const isSelected = selectedItemIds.has(item.id);
    const wasAssigned = assignedItemIds.includes(item.id);
    const hasChanged = isSelected !== wasAssigned;

    return (
      <TouchableOpacity
        style={[styles.menuItem, isSelected && styles.menuItemSelected]}
        onPress={() => handleToggleItem(item.id)}
        accessibilityLabel={`${item.name}, ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={14} color={theme.colors.onPrimary} />
          )}
        </View>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemHeader}>
            <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
            {hasChanged && (
              <View style={[styles.changeBadge, isSelected ? styles.addBadge : styles.removeBadge]}>
                <Text style={styles.changeBadgeText}>
                  {isSelected ? 'Adding' : 'Removing'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
          {!item.is_available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableBadgeText}>Unavailable</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [selectedItemIds, assignedItemIds, handleToggleItem, theme.colors.onPrimary]);

  const keyExtractor = useCallback((item: MenuItemExtended) => item.id, []);

  const assignedCount = menuItems.filter(item => assignedItemIds.includes(item.id)).length;
  const unassignedCount = menuItems.length - assignedCount;
  const changesCount = Array.from(selectedItemIds).filter(id => !assignedItemIds.includes(id)).length +
    assignedItemIds.filter(id => !selectedItemIds.has(id)).length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    header: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    groupInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    groupName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      flex: 1,
    },
    groupBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
    },
    groupBadgeText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    viewModeContainer: {
      flexDirection: 'row',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      gap: theme.spacing.xs,
    },
    viewModeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.xs,
    },
    viewModeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    viewModeText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    viewModeTextActive: {
      color: theme.colors.onPrimary,
    },
    viewModeCount: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
    },
    viewModeCountActive: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    viewModeCountText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
    },
    viewModeCountTextActive: {
      color: theme.colors.onPrimary,
    },
    selectionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    selectionInfo: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
    },
    selectionInfoHighlight: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    selectionActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    selectionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    selectionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    listContent: {
      padding: theme.spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    menuItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
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
    menuItemContent: {
      flex: 1,
    },
    menuItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    menuItemName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      flex: 1,
    },
    menuItemPrice: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    changeBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    addBadge: {
      backgroundColor: theme.colors.successLight,
    },
    removeBadge: {
      backgroundColor: theme.colors.errorLight,
    },
    changeBadgeText: {
      fontSize: 10,
      fontWeight: '500',
      color: theme.colors.success,
    },
    unavailableBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
      marginTop: 4,
    },
    unavailableBadgeText: {
      fontSize: 10,
      color: theme.colors.onSurfaceSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    footerInfo: {
      flex: 1,
    },
    footerInfoText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    footerInfoHighlight: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    footerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    button: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      minWidth: 80,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
    },
    applyButtonDisabled: {
      backgroundColor: theme.colors.onSurfaceSecondary,
    },
    applyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

  if (!group) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="tune-variant"
          size={48}
          color={theme.colors.onSurfaceSecondary}
        />
        <Text style={styles.emptyText}>
          Select a modifier group to assign it to menu items
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Assign to Items</Text>
          {onClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close"
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.groupInfo}>
          <MaterialCommunityIcons
            name="tune-variant"
            size={18}
            color={theme.colors.primary}
            style={{ marginRight: theme.spacing.sm }}
          />
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={styles.groupBadge}>
            <Text style={styles.groupBadgeText}>
              {group.options.length} options
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={theme.colors.onSurfaceSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search menu items"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={18} color={theme.colors.onSurfaceSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.viewModeContainer}>
        {renderViewModeButton('all', 'All', menuItems.length)}
        {renderViewModeButton('assigned', 'Assigned', assignedCount)}
        {renderViewModeButton('unassigned', 'Unassigned', unassignedCount)}
      </View>

      <View style={styles.selectionBar}>
        <Text style={styles.selectionInfo}>
          <Text style={styles.selectionInfoHighlight}>{selectedItemIds.size}</Text> of {filteredItems.length} selected
        </Text>
        <View style={styles.selectionActions}>
          <TouchableOpacity style={styles.selectionButton} onPress={handleSelectAll}>
            <Text style={styles.selectionButtonText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectionButton} onPress={handleDeselectAll}>
            <Text style={styles.selectionButtonText}>Deselect All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="food-off"
              size={48}
              color={theme.colors.onSurfaceSecondary}
            />
            <Text style={styles.emptyText}>No menu items found</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          {changesCount > 0 ? (
            <Text style={styles.footerInfoText}>
              <Text style={styles.footerInfoHighlight}>{changesCount}</Text> changes pending
            </Text>
          ) : (
            <Text style={styles.footerInfoText}>No changes</Text>
          )}
        </View>
        <View style={styles.footerActions}>
          {onClose && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              styles.applyButton,
              changesCount === 0 && styles.applyButtonDisabled,
            ]}
            onPress={handleApply}
            disabled={changesCount === 0}
            accessibilityLabel="Apply changes"
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ModifierAssignmentPanel;
