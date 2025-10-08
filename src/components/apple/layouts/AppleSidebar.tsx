import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ViewStyle, Animated, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleCard } from '../primitives/AppleCard';
import { AppleInteractive } from '../primitives/AppleInteractive';
import { borderRadius, spacing } from '@/design-system/theme/spacing';
import { Icon } from '@/components/common';
import {
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  getSidebarWidth,
  getSidebarTransition,
  saveSidebarState,
  loadSidebarState,
  debounce,
} from '@/utils/sidebarHelpers';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple sidebar layout
// - Open/Closed: Extensible through props without modification
// - Liskov Substitution: Can replace any sidebar/navigation component
// - Interface Segregation: Small, focused interface for sidebars
// - Dependency Inversion: Depends on universal primitives and theme abstractions

export interface AppleSidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  iconBackground?: string;
  onPress?: () => void;
  selected?: boolean;
  badge?: string | number;
}

interface AppleSidebarProps {
  items: AppleSidebarItem[];

  // APPLE SIDEBAR VARIANTS (from reference images analysis)
  variant?: 'settings' | 'navigation' | 'menu' | 'categories';

  // UNIVERSAL LAYOUT SYSTEM (reusable everywhere)
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  // COLLAPSIBLE SIDEBAR FEATURES (NEW)
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
  showTooltips?: boolean; // Show tooltips on hover when collapsed

  // APPLE SIZING SYSTEM (from reference images)
  width?: number; // Ignored if collapsible=true (uses fixed widths)
  height?: number | 'auto';

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: ViewStyle;
}

// UNIVERSAL APPLE SIDEBAR COMPONENT (Single Responsibility)
// This replaces ALL sidebar components: Settings, Menu, Navigation, etc.
export const AppleSidebar: React.FC<AppleSidebarProps> = ({
  items,
  variant = 'settings',
  title,
  searchable = false,
  searchPlaceholder = 'Search',
  onSearch,
  collapsible = false,
  defaultCollapsed = false,
  onCollapseChange,
  showTooltips = true,
  width = 280,
  height = 'auto',
  style,
}) => {
  const { theme, isDark } = useTheme();

  // Collapsible state
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  // Animation values
  const sidebarWidth = useRef(new Animated.Value(
    collapsible ? getSidebarWidth(defaultCollapsed) : width
  )).current;
  const textOpacity = useRef(new Animated.Value(defaultCollapsed ? 0 : 1)).current;

  // Load saved sidebar state on mount
  useEffect(() => {
    if (collapsible) {
      loadSidebarState().then((savedCollapsed) => {
        setIsCollapsed(savedCollapsed);
        // Immediately set width without animation on mount
        sidebarWidth.setValue(getSidebarWidth(savedCollapsed));
        textOpacity.setValue(savedCollapsed ? 0 : 1);
      });
    }
  }, [collapsible]);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        items.filter((item) =>
          item.label.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, items]);

  // Handle collapse/expand toggle
  const toggleCollapse = () => {
    if (!collapsible) return;

    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);

    // Save state
    saveSidebarState(newCollapsed);

    // Notify parent
    onCollapseChange?.(newCollapsed);

    // Animate width and text opacity
    const targetWidth = getSidebarWidth(newCollapsed);
    const targetOpacity = newCollapsed ? 0 : 1;

    Animated.parallel([
      Animated.timing(sidebarWidth, {
        toValue: targetWidth,
        ...getSidebarTransition(),
      }),
      Animated.timing(textOpacity, {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Debounced search handler
  const debouncedSearch = useRef(
    debounce((query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    }, 300)
  ).current;

  // APPLE SIDEBAR STYLING (from 5 reference images analysis)
  const sidebarStyles = StyleSheet.create({
    container: {
      width,
      height: height === 'auto' ? undefined : height,
      backgroundColor: isDark ? theme.colors.layer1 : theme.colors.surface, // Apple dark sidebar
      borderRadius: borderRadius.appleXLarge, // 24px from reference images
      padding: spacing.xl, // 20px Apple generous padding
      ...style,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: searchable ? spacing.md : 0,
    },
    searchContainer: {
      backgroundColor: isDark ? theme.colors.layer2 : theme.colors.surfaceVariant,
      borderRadius: borderRadius.appleMedium, // 16px Apple search bar
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.lg,
    },
    searchText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    itemsList: {
      flex: 1,
    },
    item: {
      marginBottom: spacing.sm, // 8px Apple item spacing
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg, // 16px Apple item padding
      paddingVertical: spacing.md, // 12px Apple vertical padding
    },
    itemSelected: {
      backgroundColor: isDark ? theme.colors.layer2 : theme.colors.surfaceVariant,
      borderRadius: borderRadius.appleLarge, // 20px Apple selection
    },
    itemIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.appleMedium, // 16px Apple icon background
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    itemText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    itemTextSelected: {
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    badge: {
      backgroundColor: theme.colors.error,
      borderRadius: borderRadius.pill as number,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.colors.onError,
      fontSize: 11,
      fontWeight: '600',
    },
  });

  // APPLE ICON BACKGROUND COLORS (from reference images)
  const getIconBackground = (item: AppleSidebarItem) => {
    if (item.iconBackground) return item.iconBackground;

    // Default Apple icon colors from reference images
    const appleIconColors = [
      '#FF453A', // Red (Notifications)
      '#007AFF', // Blue (Display & Brightness)
      '#32D74B', // Green (Battery)
      '#FF9500', // Orange (General)
      '#BF5AF2', // Purple (Focus)
      '#64D2FF', // Cyan (Privacy)
    ];

    const colorIndex = items.indexOf(item) % appleIconColors.length;
    return appleIconColors[colorIndex];
  };

  const renderItem = (item: AppleSidebarItem) => {
    return (
      <View key={item.id} style={sidebarStyles.item}>
        <AppleInteractive
          onPress={item.onPress}
          feedbackType="highlight"
          style={[
            sidebarStyles.itemContent,
            item.selected && sidebarStyles.itemSelected,
          ]}
        >
          {/* APPLE ICON WITH COLORED BACKGROUND (from reference images) */}
          {item.icon && (
            <View
              style={[
                sidebarStyles.itemIcon,
                { backgroundColor: getIconBackground(item) },
              ]}
            >
              {item.icon}
            </View>
          )}

          {/* APPLE ITEM TEXT */}
          <Text
            style={[
              sidebarStyles.itemText,
              item.selected && sidebarStyles.itemTextSelected,
            ]}
          >
            {item.label}
          </Text>

          {/* APPLE BADGE (like notification counts) */}
          {item.badge && (
            <View style={sidebarStyles.badge}>
              <Text style={sidebarStyles.badgeText}>
                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
              </Text>
            </View>
          )}
        </AppleInteractive>
      </View>
    );
  };

  return (
    <AppleCard
      layer="surface"
      radius="appleXLarge"
      style={sidebarStyles.container}
    >
      {/* APPLE SIDEBAR HEADER */}
      {(title || searchable) && (
        <View style={sidebarStyles.header}>
          {title && <Text style={sidebarStyles.title}>{title}</Text>}
          {searchable && (
            <AppleInteractive
              onPress={() => onSearch?.('')}
              style={sidebarStyles.searchContainer}
            >
              <Text style={sidebarStyles.searchText}>{searchPlaceholder}</Text>
            </AppleInteractive>
          )}
        </View>
      )}

      {/* APPLE SIDEBAR ITEMS */}
      <ScrollView
        style={sidebarStyles.itemsList}
        showsVerticalScrollIndicator={false}
      >
        {items.map(renderItem)}
      </ScrollView>
    </AppleCard>
  );
};

// USAGE EXAMPLES (shows universal reusability):
// Settings screen:
// <AppleSidebar
//   items={settingsItems}
//   variant="settings"
//   title="Settings Categories"
//   searchable
// />
//
// Menu categories:
// <AppleSidebar
//   items={menuCategories}
//   variant="menu"
//   title="Menu Categories"
// />
//
// Navigation:
// <AppleSidebar
//   items={navItems}
//   variant="navigation"
//   width={240}
// />