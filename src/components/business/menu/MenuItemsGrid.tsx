/**
 * Menu Items Grid - Professional center panel for menu item display
 * High-density grid optimized for restaurant POS environments
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  ActivityIndicator,
  Searchbar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { MenuItem, MenuCategory } from '@/types/menu.types';
import { formatPrice } from '@/utils/currency';
import { usePerformanceMonitoring, useFlatListOptimization } from '@/hooks/usePerformanceMonitoring';
import { MenuItemSkeletonCard } from '@/components/common/SkeletonLoader';
import { ProfessionalButton, FadeInAnimation, SlideInAnimation } from '@/components/common/ProfessionalAnimations';
import { performantDebounce } from '@/utils/performance';
import * as Haptics from 'expo-haptics';

interface MenuItemsGridProps {
  menuItems: MenuItem[];
  searchQuery: string;
  onSearch: (query: string) => void;
  onItemPress: (item: MenuItem) => void;
  onQuickAddToCart: (item: MenuItem) => void;
  isLoading?: boolean;
  selectedCategory: MenuCategory | null;
}

export const MenuItemsGrid: React.FC<MenuItemsGridProps> = ({
  menuItems,
  searchQuery,
  onSearch,
  onItemPress,
  onQuickAddToCart,
  isLoading = false,
  selectedCategory,
}) => {
  const theme = useTheme();
  const [layoutType, setLayoutType] = useState<'grid' | 'list'>('grid');
  
  // Professional performance monitoring
  const { startTracking, endTracking } = usePerformanceMonitoring({
    componentName: 'MenuItemsGrid',
    enableMemoryTracking: true,
    trackReRenders: true,
  });
  
  useEffect(() => {
    startTracking();
    return () => {
      endTracking();
    };
  }, [startTracking, endTracking]);

  // Calculate grid dimensions
  const screenData = Dimensions.get('window');
  const isTablet = screenData.width >= 768;
  const numColumns = isTablet ? (layoutType === 'grid' ? 3 : 1) : (layoutType === 'grid' ? 2 : 1);

  // Memoized filtered items with professional optimization
  const filteredItems = useMemo(() => {
    const startTime = performance.now();
    const filtered = (menuItems || []).filter(item => {
      if (!item.is_available) return false;
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query) ||
             (item.description && item.description.toLowerCase().includes(query));
    });
    
    const endTime = performance.now();
    if (__DEV__ && endTime - startTime > 5) {
      console.log(`⚡ MenuItemsGrid filtering: ${(endTime - startTime).toFixed(2)}ms for ${(menuItems || []).length} items`);
    }
    
    return filtered;
  }, [menuItems, searchQuery]);
  
  // Professional FlatList optimization
  const flatListOptimization = useFlatListOptimization(
    filteredItems.length, 
    layoutType === 'grid' ? 200 : 120
  );
  
  // Professional debounced search
  const debouncedOnSearch = useCallback(
    performantDebounce(onSearch, 300, 'MenuItemsGrid.search'),
    [onSearch]
  );

  const renderMenuItemCard = useCallback(({ item, index }: { item: MenuItem; index: number }) => {
    const isGridLayout = layoutType === 'grid';

    const handleItemPress = useCallback(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onItemPress(item);
    }, [item]);
    
    const handleQuickAdd = useCallback(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onQuickAddToCart(item);
    }, [item]);

    return (
      <SlideInAnimation
        direction="up"
        delay={index * 30}
        duration={250}
        style={{
          flex: 1,
          marginHorizontal: 4,
        }}
      >
        <TouchableOpacity
          style={[
            styles.menuItemCard,
            {
              backgroundColor: theme.colors.surface,
              width: isGridLayout ? undefined : '100%',
              flexDirection: isGridLayout ? 'column' : 'row',
            },
          ]}
          onPress={handleItemPress}
          activeOpacity={0.8}
        >
        {/* Item Image Placeholder */}
        <View style={[
          styles.itemImageContainer,
          {
            backgroundColor: theme.colors.primary + '10',
            width: isGridLayout ? '100%' : 80,
            height: isGridLayout ? 120 : 80,
            marginRight: isGridLayout ? 0 : 12,
            marginBottom: isGridLayout ? 12 : 0,
          },
        ]}>
          <MaterialIcons 
            name="restaurant"
            size={isGridLayout ? 32 : 24}
            color={theme.colors.primary + 'AA'}
          />
        </View>

        {/* Item Details */}
        <View style={[
          styles.itemDetails,
          { flex: isGridLayout ? 0 : 1 },
        ]}>
          <Text 
            variant="titleSmall"
            style={[
              styles.itemName,
              { color: theme.colors.onSurface }
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          
          {item.description && (
            <Text 
              variant="bodySmall"
              style={[
                styles.itemDescription,
                { color: theme.colors.onSurface + 'CC' }
              ]}
              numberOfLines={isGridLayout ? 3 : 2}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.itemFooter}>
            <View style={styles.priceContainer}>
              <Text 
                variant="titleMedium"
                style={[
                  styles.itemPrice,
                  { color: theme.colors.primary }
                ]}
              >
                {formatPrice(item.price)}
              </Text>
              
              {item.preparation_time_minutes && (
                <Text 
                  variant="bodySmall"
                  style={[
                    styles.prepTime,
                    { color: theme.colors.onSurface + '88' }
                  ]}
                >
                  {item.preparation_time_minutes}m
                </Text>
              )}
            </View>

            {/* Quick Add Button */}
            <ProfessionalButton
              onPress={handleQuickAdd}
              style={StyleSheet.flatten([
                styles.quickAddButton,
                { backgroundColor: theme.colors.primary }
              ])}
              hapticFeedback="medium"
              animationType="scale"
            >
              <MaterialIcons 
                name="add"
                size={18}
                color={theme.colors.onPrimary}
              />
            </ProfessionalButton>
          </View>
        </View>
        </TouchableOpacity>
      </SlideInAnimation>
    );
  }, [layoutType, theme, onItemPress, onQuickAddToCart]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search menu items..."
        onChangeText={debouncedOnSearch}
        value={searchQuery}
        style={[
          styles.searchBar,
          { backgroundColor: theme.colors.surfaceVariant }
        ]}
        inputStyle={{ color: theme.colors.onSurfaceVariant }}
        iconColor={theme.colors.onSurfaceVariant}
        placeholderTextColor={theme.colors.onSurfaceVariant + '88'}
      />

      {/* Category Info & Controls */}
      <View style={styles.controlsRow}>
        <View style={styles.categoryInfo}>
          {selectedCategory && (
            <Chip 
              icon="restaurant-menu"
              style={[
                styles.categoryChip,
                { backgroundColor: theme.colors.primaryContainer }
              ]}
              textStyle={{ color: theme.colors.onPrimaryContainer }}
            >
              {selectedCategory.name} ({filteredItems.length})
            </Chip>
          )}
        </View>

        <View style={styles.layoutControls}>
          <ProfessionalButton
            onPress={async () => {
              await Haptics.selectionAsync();
              setLayoutType('grid');
            }}
            style={StyleSheet.flatten([
              styles.layoutButton,
              layoutType === 'grid' && { backgroundColor: theme.colors.primary }
            ])}
            hapticFeedback="selection"
          >
            <MaterialIcons 
              name="view-module" 
              size={20} 
              color={layoutType === 'grid' ? theme.colors.onPrimary : theme.colors.primary}
            />
          </ProfessionalButton>
          
          <ProfessionalButton
            onPress={async () => {
              await Haptics.selectionAsync();
              setLayoutType('list');
            }}
            style={StyleSheet.flatten([
              styles.layoutButton,
              layoutType === 'list' && { backgroundColor: theme.colors.primary }
            ])}
            hapticFeedback="selection"
          >
            <MaterialIcons 
              name="view-list" 
              size={20} 
              color={layoutType === 'list' ? theme.colors.onPrimary : theme.colors.primary}
            />
          </ProfessionalButton>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name={searchQuery ? 'search-off' : 'restaurant-menu'}
        size={48}
        color={theme.colors.outline}
      />
      <Text 
        variant="titleMedium"
        style={[
          styles.emptyStateTitle,
          { color: theme.colors.onSurface }
        ]}
      >
        {searchQuery ? 'No items found' : 'No menu items available'}
      </Text>
      <Text 
        variant="bodyMedium"
        style={[
          styles.emptyStateDescription,
          { color: theme.colors.onSurface + 'AA' }
        ]}
      >
        {searchQuery ? 
          'Try adjusting your search terms' : 
          'Menu items will appear here when available'
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => {
    const skeletonItems = Array.from({ length: 8 }, (_, index) => index);
    
    return (
      <FlatList
        data={skeletonItems}
        keyExtractor={(item) => `skeleton_${item}`}
        renderItem={({ item, index }) => (
          <FadeInAnimation 
            delay={index * 50}
            style={{ flex: 1, marginHorizontal: 4 }}
          >
            <MenuItemSkeletonCard 
              layout={layoutType}
              style={styles.menuItemCard}
            />
          </FadeInAnimation>
        )}
        numColumns={numColumns}
        key={`skeleton_${numColumns}_${layoutType}`}
        contentContainerStyle={styles.menuItemsList}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        columnWrapperStyle={numColumns > 1 ? styles.row : null}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {isLoading ? (
        renderLoadingState()
      ) : filteredItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItemCard}
          numColumns={numColumns}
          key={`${numColumns}-${layoutType}`}
          contentContainerStyle={styles.menuItemsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          columnWrapperStyle={numColumns > 1 ? styles.row : null}
          // Professional performance optimizations
          {...flatListOptimization}
          // Enhanced performance settings
          disableIntervalMomentum={true}
          legacyImplementation={false}
          onEndReachedThreshold={0.8}
          // Professional viewability tracking
          onViewableItemsChanged={useCallback(({ viewableItems }: { viewableItems: any[] }) => {
            if (__DEV__ && viewableItems.length > 10) {
              console.log(`📊 MenuItemsGrid viewable items: ${viewableItems.length}`);
            }
          }, [])}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    elevation: 2,
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  layoutControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Menu items list
  menuItemsList: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemSeparator: {
    height: 16,
  },

  // Menu item card
  menuItemCard: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 180,
  },
  itemImageContainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 20,
  },
  itemDescription: {
    flex: 1,
    lineHeight: 16,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceContainer: {
    flex: 1,
  },
  itemPrice: {
    fontWeight: '700',
  },
  prepTime: {
    marginTop: 2,
  },
  quickAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyStateDescription: {
    textAlign: 'center',
    lineHeight: 20,
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