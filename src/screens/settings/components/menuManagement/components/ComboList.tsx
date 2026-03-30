/**
 * ComboList Component
 * Displays a list of combo deals with search and filtering
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ComboDeal } from '@/types/menu-management-extended.types';
import ComboCard from './ComboCard';

interface ComboListProps {
  combos: ComboDeal[];
  selectedComboId?: string | null;
  onComboSelect?: (combo: ComboDeal) => void;
  onAddCombo?: () => void;
  onEditCombo?: (combo: ComboDeal) => void;
  onDeleteCombo?: (combo: ComboDeal) => void;
  onToggleComboStatus?: (combo: ComboDeal) => void;
  onDuplicateCombo?: (combo: ComboDeal) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

type FilterType = 'all' | 'active' | 'inactive' | 'available_now' | 'limited';

export const ComboList: React.FC<ComboListProps> = ({
  combos,
  selectedComboId,
  onComboSelect,
  onAddCombo,
  onEditCombo,
  onDeleteCombo,
  onToggleComboStatus,
  onDuplicateCombo,
  isLoading = false,
  emptyMessage = 'No combo deals found',
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const isComboAvailableNow = useCallback((combo: ComboDeal): boolean => {
    if (!combo.is_active) return false;
    if (combo.availability.always_available) return true;

    const now = new Date();
    const currentDay = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    // Check day of week
    if (combo.availability.days_of_week && combo.availability.days_of_week.length > 0) {
      if (!combo.availability.days_of_week.includes(currentDay)) return false;
    }

    // Check time range
    if (combo.availability.start_time && combo.availability.end_time) {
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime < combo.availability.start_time || currentTime > combo.availability.end_time) {
        return false;
      }
    }

    // Check date range
    if (combo.availability.start_date && combo.availability.end_date) {
      const today = now.toISOString().split('T')[0];
      if (today < combo.availability.start_date || today > combo.availability.end_date) {
        return false;
      }
    }

    return true;
  }, []);

  const filteredCombos = useMemo(() => {
    let filtered = combos;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(combo =>
        combo.name.toLowerCase().includes(query) ||
        combo.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(c => c.is_active);
        break;
      case 'inactive':
        filtered = filtered.filter(c => !c.is_active);
        break;
      case 'available_now':
        filtered = filtered.filter(c => isComboAvailableNow(c));
        break;
      case 'limited':
        filtered = filtered.filter(c => !c.availability.always_available);
        break;
    }

    return filtered;
  }, [combos, searchQuery, activeFilter, isComboAvailableNow]);

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
        name="food-takeout-box"
        size={48}
        color={theme.colors.onSurfaceSecondary}
      />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      {onAddCombo && (
        <TouchableOpacity style={styles.emptyButton} onPress={onAddCombo}>
          <MaterialCommunityIcons name="plus" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.emptyButtonText}>Create Combo Deal</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderComboItem = useCallback(({ item }: { item: ComboDeal }) => (
    <ComboCard
      combo={item}
      isSelected={selectedComboId === item.id}
      onPress={onComboSelect}
      onEdit={onEditCombo}
      onDelete={onDeleteCombo}
      onToggleStatus={onToggleComboStatus}
      onDuplicate={onDuplicateCombo}
    />
  ), [selectedComboId, onComboSelect, onEditCombo, onDeleteCombo, onToggleComboStatus, onDuplicateCombo]);

  const keyExtractor = useCallback((item: ComboDeal) => item.id, []);

  // Calculate stats
  const activeCount = combos.filter(c => c.is_active).length;
  const availableNowCount = combos.filter(c => isComboAvailableNow(c)).length;
  const totalSavings = combos.reduce((sum, c) => sum + (Number(c.savings_amount) || 0), 0);
  const avgSavingsPercent = combos.length > 0
    ? combos.reduce((sum, c) => sum + (Number(c.savings_percentage) || 0), 0) / combos.length
    : 0;

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
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
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
    statHighlight: {
      fontWeight: '600',
      color: theme.colors.success,
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
  });

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
            <Text style={styles.title}>Combo Deals</Text>
            <Text style={styles.count}>{combos.length} combos</Text>
          </View>
          {onAddCombo && (
            <TouchableOpacity style={styles.addButton} onPress={onAddCombo}>
              <MaterialCommunityIcons name="plus" size={18} color={theme.colors.onPrimary} />
              <Text style={styles.addButtonText}>Add Combo</Text>
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
            placeholder="Search combo deals..."
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search combo deals"
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
          {renderFilterButton('available_now', 'Available Now')}
          {renderFilterButton('limited', 'Limited Time')}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.success} />
            <Text style={styles.statText}>{activeCount} active</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-check" size={14} color={theme.colors.primary} />
            <Text style={styles.statText}>{availableNowCount} available now</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="sale" size={14} color={theme.colors.success} />
            <Text style={styles.statText}>
              Avg <Text style={styles.statHighlight}>{avgSavingsPercent.toFixed(0)}%</Text> off
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredCombos}
        renderItem={renderComboItem}
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

export default ComboList;
