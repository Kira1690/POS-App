import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';

interface ReportFiltersBarProps {
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
  selectedCategory: string;
  onFilterChange: (period: 'daily' | 'weekly' | 'monthly', category: string) => void;
}

const PERIODS = [
  { key: 'daily', label: 'Daily', icon: '📅' },
  { key: 'weekly', label: 'Weekly', icon: '📊' },
  { key: 'monthly', label: 'Monthly', icon: '📈' },
] as const;

const CATEGORIES = [
  { key: 'all', label: 'All Categories', icon: '🔄' },
  { key: 'food', label: 'Food', icon: '🍽️' },
  { key: 'beverages', label: 'Beverages', icon: '🥤' },
  { key: 'appetizers', label: 'Appetizers', icon: '🥗' },
  { key: 'desserts', label: 'Desserts', icon: '🍰' },
  { key: 'specials', label: 'Specials', icon: '⭐' },
];

export default function ReportFiltersBar({ 
  selectedPeriod, 
  selectedCategory, 
  onFilterChange 
}: ReportFiltersBarProps) {
  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    onFilterChange(period, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange(selectedPeriod, category);
  };

  return (
    <View style={styles.container}>
      {/* Period Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Time Period</Text>
        <View style={styles.filterButtons}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.filterButton,
                selectedPeriod === period.key && styles.activeFilterButton
              ]}
              onPress={() => handlePeriodChange(period.key)}
            >
              <Text style={styles.filterIcon}>{period.icon}</Text>
              <Text style={[
                styles.filterButtonText,
                selectedPeriod === period.key && styles.activeFilterButtonText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
        >
          <View style={styles.categoryFilters}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.key && styles.activeCategoryButton
                ]}
                onPress={() => handleCategoryChange(category.key)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.key && styles.activeCategoryButtonText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatLabel}>Period</Text>
          <Text style={styles.quickStatValue}>
            {PERIODS.find(p => p.key === selectedPeriod)?.label}
          </Text>
        </View>
        
        <View style={styles.quickStatDivider} />
        
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatLabel}>Filter</Text>
          <Text style={styles.quickStatValue}>
            {CATEGORIES.find(c => c.key === selectedCategory)?.label}
          </Text>
        </View>
        
        <View style={styles.quickStatDivider} />
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => onFilterChange('daily', 'all')}
        >
          <Text style={styles.resetButtonText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.lightGray,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: theme.colors.white,
  },
  categoryScrollView: {
    marginHorizontal: -5,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryButtonText: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeCategoryButtonText: {
    color: theme.colors.white,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 5,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  quickStatValue: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },
  quickStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: theme.colors.warning,
  },
  resetButtonText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '600',
  },
});