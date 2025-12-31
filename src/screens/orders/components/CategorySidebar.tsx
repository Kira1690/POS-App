/**
 * CategorySidebar - Left panel for category navigation
 * Displays menu categories with icons and selection state
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { MenuCategory } from '@/types/menu.types';

interface CategorySidebarProps {
  categories: MenuCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  showAllOption?: boolean;
}

interface CategoryItemProps {
  category: MenuCategory;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = React.memo(
  ({ category, isSelected, onPress }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        marginHorizontal: theme.spacing.xs,
        marginVertical: theme.spacing.xs / 2,
        borderRadius: theme.borderRadius.md,
        backgroundColor: isSelected ? theme.colors.primaryContainer : 'transparent',
      },
      iconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
      },
      textContainer: {
        flex: 1,
      },
      name: {
        ...theme.typography.body1,
        fontWeight: isSelected ? '600' : '400',
        color: isSelected ? theme.colors.primary : theme.colors.onSurface,
      },
      count: {
        ...theme.typography.caption,
        color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
        marginTop: 2,
      },
    });

    const getCategoryIcon = (categoryName: string): keyof typeof MaterialCommunityIcons.glyphMap => {
      const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
        appetizers: 'food-variant',
        starters: 'food-variant',
        mains: 'food',
        entrees: 'food',
        salads: 'leaf',
        soups: 'bowl-mix',
        desserts: 'cupcake',
        sweets: 'candy',
        beverages: 'cup',
        drinks: 'glass-cocktail',
        sides: 'food-drumstick',
        pizza: 'pizza',
        pasta: 'noodles',
        burgers: 'hamburger',
        seafood: 'fish',
        grill: 'grill',
        vegetarian: 'leaf',
        vegan: 'sprout',
        breakfast: 'egg-fried',
        lunch: 'food-turkey',
        dinner: 'silverware-fork-knife',
        specials: 'star',
        combo: 'package-variant',
        kids: 'human-child',
        default: 'food-outline',
      };

      const lowerName = categoryName.toLowerCase();
      for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerName.includes(key)) {
          return icon;
        }
      }
      return iconMap.default;
    };

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getCategoryIcon(category.name)}
            size={24}
            color={isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {category.name}
          </Text>
          {category.item_count !== undefined && (
            <Text style={styles.count}>
              {category.item_count} items
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

CategoryItem.displayName = 'CategoryItem';

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
    },
    listContent: {
      paddingVertical: theme.spacing.sm,
    },
    allItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      marginVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.md,
      backgroundColor: !selectedCategoryId ? theme.colors.primaryContainer : 'transparent',
    },
    allIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: !selectedCategoryId ? theme.colors.primary : theme.colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    allText: {
      ...theme.typography.body1,
      fontWeight: !selectedCategoryId ? '600' : '400',
      color: !selectedCategoryId ? theme.colors.primary : theme.colors.onSurface,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
    },
  });

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      onSelectCategory(categoryId);
    },
    [onSelectCategory]
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuCategory }) => (
      <CategoryItem
        category={item}
        isSelected={selectedCategoryId === item.id}
        onPress={() => handleSelectCategory(item.id)}
      />
    ),
    [selectedCategoryId, handleSelectCategory]
  );

  const keyExtractor = useCallback((item: MenuCategory) => item.id, []);

  const ListHeader = showAllOption ? (
    <>
      <TouchableOpacity
        style={styles.allItemContainer}
        onPress={() => onSelectCategory('')}
        activeOpacity={0.7}
      >
        <View style={styles.allIconContainer}>
          <MaterialCommunityIcons
            name="view-grid"
            size={24}
            color={!selectedCategoryId ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
          />
        </View>
        <Text style={styles.allText}>All Items</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
    </>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CategorySidebar;
