import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { InventoryFilters } from '@/types/inventory.types';
import { theme } from '@/constants/theme';

interface InventoryFiltersBarProps {
  filters: InventoryFilters;
  onFilterChange: (filters: InventoryFilters) => void;
  itemsCount: number;
}

const CATEGORIES = ['All', 'Vegetables', 'Meat', 'Dairy', 'Oils & Condiments'];
const STATUSES = [
  { key: 'all', label: 'All', color: theme.colors.textSecondary },
  { key: 'in_stock', label: 'In Stock', color: theme.colors.success },
  { key: 'low_stock', label: 'Low Stock', color: theme.colors.warning },
  { key: 'out_of_stock', label: 'Out of Stock', color: theme.colors.error },
  { key: 'expired', label: 'Expired', color: '#9C27B0' },
];

export default function InventoryFiltersBar({ filters, onFilterChange, itemsCount }: InventoryFiltersBarProps) {
  const handleCategoryFilter = (category: string) => {
    onFilterChange({
      ...filters,
      category: category === 'All' ? undefined : category,
    });
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      onFilterChange({ ...filters, status: undefined });
    } else {
      onFilterChange({ 
        ...filters, 
        status: [status as any] 
      });
    }
  };

  const handleSortChange = (sort_by: string) => {
    onFilterChange({
      ...filters,
      sort_by: sort_by as any,
      sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc',
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <View style={styles.container}>
      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>{itemsCount} items</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearText}>🔄 Clear Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  (filters.category === category || (!filters.category && category === 'All')) && styles.activeFilterButton
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text style={[
                  styles.filterButtonText,
                  (filters.category === category || (!filters.category && category === 'All')) && styles.activeFilterButtonText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Status Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {STATUSES.map((status) => {
              const isActive = !filters.status && status.key === 'all' || 
                             filters.status && filters.status.includes(status.key as any);
              return (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.statusButton,
                    { borderColor: status.color },
                    isActive && { backgroundColor: status.color }
                  ]}
                  onPress={() => handleStatusFilter(status.key)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    { color: isActive ? theme.colors.white : status.color }
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <Text style={styles.filterLabel}>Sort by</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'name', label: 'Name' },
            { key: 'stock_level', label: 'Stock' },
            { key: 'cost', label: 'Cost' },
            { key: 'usage_rate', label: 'Usage' },
          ].map((sort) => (
            <TouchableOpacity
              key={sort.key}
              style={[
                styles.sortButton,
                filters.sort_by === sort.key && styles.activeSortButton
              ]}
              onPress={() => handleSortChange(sort.key)}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sort_by === sort.key && styles.activeSortButtonText
              ]}>
                {sort.label}
                {filters.sort_by === sort.key && (
                  <Text style={styles.sortDirection}>
                    {filters.sort_order === 'asc' ? ' ↑' : ' ↓'}
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clearText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.lightGray,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: theme.colors.white,
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sortSection: {
    marginBottom: 5,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.lightGray,
  },
  activeSortButton: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  sortButtonText: {
    fontSize: 10,
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeSortButtonText: {
    color: theme.colors.white,
  },
  sortDirection: {
    fontSize: 10,
  },
});