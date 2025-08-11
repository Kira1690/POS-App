/**
 * Menu Category Panel - Professional left panel for category selection
 * Industry-standard POS category navigation with professional styling
 */

import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { MenuCategory } from '@/types/menu.types';

interface MenuCategoryPanelProps {
  categories: MenuCategory[];
  selectedCategory: MenuCategory | null;
  onCategorySelect: (category: MenuCategory) => void;
  isLoading?: boolean;
}

export const MenuCategoryPanel: React.FC<MenuCategoryPanelProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isLoading = false,
}) => {
  const theme = useTheme();

  const renderCategoryItem = ({ item }: { item: MenuCategory }) => {
    const isSelected = selectedCategory?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          {
            backgroundColor: isSelected 
              ? theme.colors.primary 
              : theme.colors.surface,
          },
        ]}
        onPress={() => onCategorySelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          {/* Category Icon (optional) */}
          <View style={[
            styles.categoryIcon,
            {
              backgroundColor: isSelected 
                ? theme.colors.onPrimary + '20' 
                : theme.colors.primary + '20',
            },
          ]}>
            <MaterialIcons 
              name={getCategoryIcon(item.name)}
              size={24}
              color={isSelected ? theme.colors.onPrimary : theme.colors.primary}
            />
          </View>

          {/* Category Details */}
          <View style={styles.categoryDetails}>
            <Text 
              variant="titleSmall"
              style={[
                styles.categoryName,
                {
                  color: isSelected 
                    ? theme.colors.onPrimary 
                    : theme.colors.onSurface,
                  fontWeight: isSelected ? '700' : '600',
                },
              ]}
            >
              {item.name}
            </Text>
            
            {item.description && (
              <Text 
                variant="bodySmall"
                style={[
                  styles.categoryDescription,
                  {
                    color: isSelected 
                      ? theme.colors.onPrimary + 'CC' 
                      : theme.colors.onSurface + 'AA',
                  },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>

          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <MaterialIcons 
                name="chevron-right"
                size={20}
                color={theme.colors.onPrimary}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text 
        variant="titleMedium"
        style={[
          styles.headerTitle,
          { color: theme.colors.onSurface }
        ]}
      >
        Menu Categories
      </Text>
      <Divider style={[styles.headerDivider, { backgroundColor: theme.colors.outline }]} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name="restaurant-menu"
        size={48}
        color={theme.colors.outline}
      />
      <Text 
        variant="bodyMedium"
        style={[
          styles.emptyStateText,
          { color: theme.colors.onSurface }
        ]}
      >
        No categories available
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text 
        variant="bodyMedium"
        style={[
          styles.loadingText,
          { color: theme.colors.onSurface }
        ]}
      >
        Loading categories...
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {isLoading ? (
        renderLoadingState()
      ) : categories.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      )}
    </View>
  );
};

// Helper function to get category icons
const getCategoryIcon = (categoryName: string): keyof typeof MaterialIcons.glyphMap => {
  const name = categoryName.toUpperCase();
  
  // Map category names to appropriate icons
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    'BEVERAGES': 'local-drink',
    'DRINKS': 'local-drink',
    'COFFEE': 'local-cafe',
    'CHINESE': 'restaurant',
    'NON VEG': 'restaurant',
    'MEAT': 'restaurant',
    'CHICKEN': 'restaurant',
    'SEAFOOD': 'set-meal',
    'SPECIAL': 'star',
    'CHEF SPECIAL': 'star',
    'VEG': 'eco',
    'VEGETARIAN': 'eco',
    'DESSERTS': 'cake',
    'SWEETS': 'cake',
    'APPETIZERS': 'restaurant-menu',
    'STARTERS': 'restaurant-menu',
    'MAIN COURSE': 'dinner-dining',
    'BREAD': 'breakfast-dining',
    'RICE': 'rice-bowl',
    'PIZZA': 'local-pizza',
    'BURGER': 'lunch-dining',
    'PASTA': 'restaurant',
    'SALAD': 'eco',
  };

  return iconMap[name] || 'restaurant-menu';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  headerDivider: {
    height: 1,
  },
  categoriesList: {
    padding: 16,
    paddingTop: 8,
  },
  categoryItem: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    marginBottom: 4,
  },
  categoryDescription: {
    lineHeight: 16,
  },
  selectionIndicator: {
    marginLeft: 8,
  },
  itemSeparator: {
    height: 12,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
  },

  // Loading state
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
});