/**
 * CategorySidebar Component
 * Left sidebar with category cards featuring icons
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { CategoryWithStats } from '@/types/menu-management.types';

interface CategorySidebarProps {
  categories: CategoryWithStats[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (category: CategoryWithStats) => void;
  onDeleteCategory: (category: CategoryWithStats) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DEFAULT_ICON = 'food-outline';

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { theme } = useTheme();

  const totalItems = categories.reduce((sum, cat) => sum + (cat.stats?.itemCount || 0), 0);

  const styles = StyleSheet.create({
    container: {
      width: isCollapsed ? 64 : 260,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline,
      flexDirection: 'column',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    collapseButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      margin: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.tertiary,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.white,
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
    },
    // All Items Card
    allItemsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: 'transparent',
      gap: theme.spacing.sm,
    },
    allItemsCardSelected: {
      backgroundColor: theme.colors.tertiaryContainer,
      borderColor: theme.colors.tertiary,
    },
    allItemsIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    allItemsIconContainerSelected: {
      backgroundColor: theme.colors.tertiary,
    },
    allItemsContent: {
      flex: 1,
    },
    allItemsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    allItemsTitleSelected: {
      color: theme.colors.tertiary,
    },
    allItemsSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    // Category Card
    categoryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    categoryCardSelected: {
      borderColor: theme.colors.tertiary,
    },
    categoryIconContainer: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryContent: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    categoryNameSelected: {
      color: theme.colors.tertiary,
    },
    categoryMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: theme.spacing.xs,
    },
    categoryCount: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    inactiveBadge: {
      backgroundColor: theme.colors.errorLight,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    inactiveBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.error,
    },
    categoryActions: {
      flexDirection: 'row',
      gap: 4,
    },
    actionButton: {
      padding: 6,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
    },
    // Collapsed state styles
    collapsedAddButton: {
      margin: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.tertiary,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    collapsedCategory: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      marginTop: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
    },
    collapsedCategorySelected: {
      backgroundColor: theme.colors.tertiaryContainer,
    },
    collapsedIconContainer: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
  });

  // Collapsed view
  if (isCollapsed) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.collapseButton, { alignSelf: 'center', marginTop: theme.spacing.sm }]}
          onPress={onToggleCollapse}
          accessibilityLabel="Expand sidebar"
        >
          <Icon
            name="chevron-right"
            size={20}
            color={theme.colors.onSurfaceVariant}
            accessibilityLabel=""
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.collapsedAddButton}
          onPress={onAddCategory}
          accessibilityLabel="Add category"
          testID="btn-add-category"
        >
          <Icon name="plus" size={20} color={theme.colors.white} accessibilityLabel="" />
        </TouchableOpacity>

        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {/* All Items */}
          <TouchableOpacity
            style={[styles.collapsedCategory, !selectedCategoryId && styles.collapsedCategorySelected]}
            onPress={() => onCategorySelect(null)}
            accessibilityLabel="All items"
          >
            <View
              style={[
                styles.collapsedIconContainer,
                { backgroundColor: !selectedCategoryId ? theme.colors.tertiary : theme.colors.surfaceLight },
              ]}
            >
              <Icon
                name="view-grid"
                size={20}
                color={!selectedCategoryId ? '#FFFFFF' : theme.colors.onSurfaceVariant}
                accessibilityLabel=""
              />
            </View>
          </TouchableOpacity>

          {/* Categories */}
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            const categoryColor = category.color || theme.colors.tertiary;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.collapsedCategory, isSelected && styles.collapsedCategorySelected]}
                onPress={() => onCategorySelect(category.id)}
                accessibilityLabel={category.name}
              >
                <View style={[styles.collapsedIconContainer, { backgroundColor: categoryColor }]}>
                  <Icon
                    name={category.icon || DEFAULT_ICON}
                    size={18}
                    color={theme.colors.white}
                    accessibilityLabel=""
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Expanded view
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        {onToggleCollapse && (
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={onToggleCollapse}
            accessibilityLabel="Collapse sidebar"
          >
            <Icon
              name="chevron-left"
              size={20}
              color={theme.colors.onSurfaceVariant}
              accessibilityLabel=""
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Category Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddCategory}
        accessibilityLabel="Add new category"
        accessibilityRole="button"
        testID="btn-add-category"
      >
        <Icon name="plus" size={18} color={theme.colors.white} accessibilityLabel="" />
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>

      {/* Category List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {/* All Items Card */}
        <TouchableOpacity
          style={[styles.allItemsCard, !selectedCategoryId && styles.allItemsCardSelected]}
          onPress={() => onCategorySelect(null)}
          accessibilityLabel="Show all items"
          accessibilityRole="button"
          accessibilityState={{ selected: !selectedCategoryId }}
        >
          <View
            style={[
              styles.allItemsIconContainer,
              !selectedCategoryId && styles.allItemsIconContainerSelected,
            ]}
          >
            <Icon
              name="view-grid"
              size={22}
              color={!selectedCategoryId ? theme.colors.white : theme.colors.onSurfaceVariant}
              accessibilityLabel=""
            />
          </View>
          <View style={styles.allItemsContent}>
            <Text style={[styles.allItemsTitle, !selectedCategoryId && styles.allItemsTitleSelected]}>
              All Items
            </Text>
            <Text style={styles.allItemsSubtitle}>{totalItems} items total</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Categories</Text>

        {/* Category Cards */}
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const categoryColor = category.color || theme.colors.tertiary;
          const itemCount = category.stats?.itemCount || 0;

          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
              onPress={() => onCategorySelect(category.id)}
              accessibilityLabel={`${category.name} category with ${itemCount} items`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              {/* Icon */}
              <View style={[styles.categoryIconContainer, { backgroundColor: categoryColor }]}>
                <Icon
                  name={category.icon || DEFAULT_ICON}
                  size={24}
                  color={theme.colors.white}
                  accessibilityLabel=""
                />
              </View>

              {/* Content */}
              <View style={styles.categoryContent}>
                <Text
                  style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryCount}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </Text>
                  {!category.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Inactive</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions (visible when selected) */}
              {isSelected && (
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onEditCategory(category)}
                    accessibilityLabel={`Edit ${category.name}`}
                  >
                    <Icon
                      name="pencil-outline"
                      size={16}
                      color={theme.colors.primary}
                      accessibilityLabel=""
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onDeleteCategory(category)}
                    accessibilityLabel={`Delete ${category.name}`}
                  >
                    <Icon
                      name="delete-outline"
                      size={16}
                      color={theme.colors.error}
                      accessibilityLabel=""
                    />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Empty state */}
        {categories.length === 0 && (
          <View style={{ padding: theme.spacing.lg, alignItems: 'center' }}>
            <Icon
              name="folder-outline"
              size={48}
              color={theme.colors.onSurfaceVariant}
              accessibilityLabel=""
            />
            <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: theme.spacing.sm, textAlign: 'center' }}>
              No categories yet.{'\n'}Add your first category to organize items.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CategorySidebar;
