/**
 * Apple Collapsible Sidebar Component
 * Collapsible sidebar with animations, tooltips, and search
 * Following wireframe specification: prep/settings-table-management/sidebar-collapsible.md
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, spacing } from '@/design-system/theme/spacing';
import { Icon } from '@/components/common';
import {
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  getSidebarWidth,
  getSidebarTransition,
  saveSidebarState,
} from '@/utils/sidebarHelpers';

export interface AppleSidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  iconName?: string;
  iconBackground?: string;
  onPress?: () => void;
  selected?: boolean;
  badge?: string | number;
}

interface AppleSidebarCollapsibleProps {
  items: AppleSidebarItem[];
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  defaultCollapsed?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
  showTooltips?: boolean;
}

export const AppleSidebarCollapsible: React.FC<AppleSidebarCollapsibleProps> = ({
  items,
  title = 'Settings Categories',
  searchable = false,
  searchPlaceholder = 'Search settings...',
  onSearch,
  defaultCollapsed = false,
  onCollapseChange,
  showTooltips = true,
}) => {
  const { theme, isDark } = useTheme();

  // State
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Animation values
  const sidebarWidth = useRef(
    new Animated.Value(getSidebarWidth(defaultCollapsed))
  ).current;
  const textOpacity = useRef(new Animated.Value(defaultCollapsed ? 0 : 1)).current;

  // Initialize with defaultCollapsed prop (no saved state loading)
  useEffect(() => {
    setIsCollapsed(defaultCollapsed);
    sidebarWidth.setValue(getSidebarWidth(defaultCollapsed));
    textOpacity.setValue(defaultCollapsed ? 0 : 1);
  }, []);

  // Filter items based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        items.filter((item) => item.label.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, items]);

  // Toggle collapse/expand
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    saveSidebarState(newCollapsed);
    onCollapseChange?.(newCollapsed);

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

  // Handle search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: isDark ? theme.colors.surface : theme.colors.surface,
      borderRadius: borderRadius.xl as number,
      overflow: 'hidden',
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      alignItems: isCollapsed ? 'center' : 'flex-start',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      minHeight: 32,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    toggleButton: {
      padding: spacing.xs,
    },
    searchContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.onSurface,
      padding: 0,
    },
    itemsList: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    item: {
      marginBottom: spacing.sm,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg as number,
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      minHeight: 48,
    },
    itemSelected: {
      backgroundColor: theme.colors.primaryContainer,
    },
    // CRITICAL: Icon container ALWAYS 40x40 - NO changes between states
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md as number,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: isCollapsed ? 0 : spacing.md,
    },
    itemText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    itemTextSelected: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    badge: {
      backgroundColor: theme.colors.error,
      borderRadius: borderRadius.pill as number,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 18,
      alignItems: 'center',
    },
    badgeText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '600',
    },
    tooltip: {
      position: 'absolute',
      left: SIDEBAR_COLLAPSED_WIDTH + 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: borderRadius.md as number,
      padding: spacing.sm,
      paddingHorizontal: spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      zIndex: 1000,
    },
    tooltipText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    collapseButton: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    collapseText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginLeft: spacing.xs,
    },
  });

  const renderItem = (item: AppleSidebarItem) => {
    const showTooltip = isCollapsed && showTooltips && hoveredItemId === item.id;

    return (
      <View key={item.id} style={styles.item}>
        <TouchableOpacity
          onPress={item.onPress}
          onPressIn={() => setHoveredItemId(item.id)}
          onPressOut={() => setHoveredItemId(null)}
          style={[
            styles.itemContent,
            item.selected && styles.itemSelected,
          ]}
          accessibilityLabel={item.label}
          accessibilityRole="button"
        >
          {/* Icon Container - ALWAYS 40x40, NEVER changes */}
          {item.icon && (
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isCollapsed
                    ? 'transparent'
                    : (item.iconBackground || theme.colors.primary)
                },
              ]}
            >
              {item.icon}
            </View>
          )}

          {/* Text - fades out smoothly, always rendered */}
          <Animated.View style={{
            flex: 1,
            opacity: textOpacity,
            overflow: 'hidden',
          }}>
            <Text
              style={[
                styles.itemText,
                item.selected && styles.itemTextSelected,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Animated.View>

          {/* Badge - fades out smoothly */}
          {item.badge && (
            <Animated.View style={[styles.badge, {
              opacity: textOpacity,
              overflow: 'hidden',
            }]}>
              <Text style={styles.badgeText}>
                {typeof item.badge === 'number' && item.badge > 99
                  ? '99+'
                  : item.badge}
              </Text>
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Tooltip (collapsed mode only) */}
        {showTooltip && (
          <View style={styles.tooltip} pointerEvents="none">
            <Text style={styles.tooltipText}>{item.label}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { width: sidebarWidth }]}>
      {/* Header - minimal when collapsed */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {isCollapsed ? (
            // Show menu icon when collapsed
            <TouchableOpacity
              onPress={toggleCollapse}
              style={styles.toggleButton}
              accessibilityLabel="Expand sidebar"
              accessibilityRole="button"
            >
              <Icon
                name="menu"
                size={24}
                color={theme.colors.onSurface}
                accessibilityLabel="Menu icon"
              />
            </TouchableOpacity>
          ) : (
            // Show title and collapse button when expanded
            <>
              <Animated.View style={{ flex: 1, opacity: textOpacity, overflow: 'hidden' }}>
                <Text style={styles.title}>
                  {title}
                </Text>
              </Animated.View>
              <TouchableOpacity
                onPress={toggleCollapse}
                style={styles.toggleButton}
                accessibilityLabel="Collapse sidebar"
                accessibilityRole="button"
              >
                <Icon
                  name="chevron-left"
                  size={24}
                  color={theme.colors.onSurface}
                  accessibilityLabel="Collapse icon"
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Search - only show when expanded */}
        {!isCollapsed && searchable && (
          <Animated.View style={[styles.searchContainer, {
            opacity: textOpacity,
            overflow: 'hidden',
          }]}>
            <Icon
              name="magnify"
              size={18}
              color={theme.colors.onSurfaceVariant}
              style={styles.searchIcon}
              accessibilityLabel="Search icon"
            />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              onChangeText={handleSearchChange}
              value={searchQuery}
              accessibilityLabel="Search settings"
            />
          </Animated.View>
        )}
      </View>

      {/* Items List */}
      <ScrollView
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
      >
        {filteredItems.map(renderItem)}
      </ScrollView>

      {/* Collapse/Expand Button at Bottom */}
      {isCollapsed && (
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={toggleCollapse}
          accessibilityLabel="Expand sidebar"
          accessibilityRole="button"
        >
          <Icon
            name="chevron-right"
            size={20}
            color={theme.colors.onSurface}
            accessibilityLabel="Expand icon"
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};
