/**
 * ModifierGroupList Component
 * Displays a list of modifier groups with search and filtering
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ModifierGroup } from '@/types/menu-management-extended.types';
import ModifierGroupCard from './ModifierGroupCard';

interface ModifierGroupListProps {
  groups: ModifierGroup[];
  selectedGroupId?: string | null;
  onGroupSelect?: (group: ModifierGroup) => void;
  onAddGroup?: () => void;
  onEditGroup?: (group: ModifierGroup) => void;
  onDeleteGroup?: (group: ModifierGroup) => void;
  onAddOption?: (group: ModifierGroup) => void;
  onToggleGroupStatus?: (group: ModifierGroup) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

type FilterType = 'all' | 'active' | 'inactive' | 'required' | 'optional';

export const ModifierGroupList: React.FC<ModifierGroupListProps> = ({
  groups,
  selectedGroupId,
  onGroupSelect,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onAddOption,
  onToggleGroupStatus,
  isLoading = false,
  emptyMessage = 'No modifier groups found',
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredGroups = useMemo(() => {
    let filtered = groups;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query) ||
        group.options.some(opt => opt.name.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(g => g.is_active);
        break;
      case 'inactive':
        filtered = filtered.filter(g => !g.is_active);
        break;
      case 'required':
        filtered = filtered.filter(g => g.is_required);
        break;
      case 'optional':
        filtered = filtered.filter(g => !g.is_required);
        break;
    }

    return filtered;
  }, [groups, searchQuery, activeFilter]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const renderFilterButton = (filter: FilterType, label: string) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setActiveFilter(filter)}
        accessibilityLabel={`Filter by ${label}`}
        accessibilityState={{ selected: isActive }}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="tune-variant"
        size={48}
        color={theme.colors.onSurfaceSecondary}
      />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      {onAddGroup && (
        <TouchableOpacity style={styles.emptyButton} onPress={onAddGroup}>
          <MaterialCommunityIcons name="plus" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.emptyButtonText}>Add Modifier Group</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGroupItem = useCallback(({ item }: { item: ModifierGroup }) => (
    <ModifierGroupCard
      group={item}
      isSelected={selectedGroupId === item.id}
      onPress={onGroupSelect}
      onEdit={onEditGroup}
      onDelete={onDeleteGroup}
      onAddOption={onAddOption}
      onToggleStatus={onToggleGroupStatus}
    />
  ), [selectedGroupId, onGroupSelect, onEditGroup, onDeleteGroup, onAddOption, onToggleGroupStatus]);

  const keyExtractor = useCallback((item: ModifierGroup) => item.id, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    count: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    searchIcon: {
      marginRight: theme.spacing.xs,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    filterButtonTextActive: {
      color: theme.colors.onPrimary,
    },
    listContent: {
      padding: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    emptyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    statText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
  });

  const activeCount = groups.filter(g => g.is_active).length;
  const requiredCount = groups.filter(g => g.is_required).length;
  const totalOptions = groups.reduce((sum, g) => sum + g.options.length, 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Modifier Groups</Text>
            <Text style={styles.count}>{groups.length} groups</Text>
          </View>
          {onAddGroup && (
            <TouchableOpacity style={styles.addButton} onPress={onAddGroup}>
              <MaterialCommunityIcons name="plus" size={18} color={theme.colors.onPrimary} />
              <Text style={styles.addButtonText}>Add Group</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={theme.colors.onSurfaceSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search modifier groups..."
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search modifier groups"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <MaterialCommunityIcons name="close" size={18} color={theme.colors.onSurfaceSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('active', 'Active')}
          {renderFilterButton('inactive', 'Inactive')}
          {renderFilterButton('required', 'Required')}
          {renderFilterButton('optional', 'Optional')}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.success} />
            <Text style={styles.statText}>{activeCount} active</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="asterisk" size={14} color={theme.colors.primary} />
            <Text style={styles.statText}>{requiredCount} required</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="format-list-bulleted" size={14} color={theme.colors.onSurfaceSecondary} />
            <Text style={styles.statText}>{totalOptions} options</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderGroupItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

export default ModifierGroupList;
