/**
 * MenuEditorTabs Component
 * Tab navigation for Menu Management sections
 * Items | Modifiers | Combos
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { MenuManagementTab } from '@/types/menu-management-settings.types';

interface TabConfig {
  id: MenuManagementTab;
  label: string;
  icon: string;
  count?: number;
}

interface MenuEditorTabsProps {
  activeTab: MenuManagementTab;
  onTabChange: (tab: MenuManagementTab) => void;
  itemsCount?: number;
  modifiersCount?: number;
  combosCount?: number;
}

export const MenuEditorTabs: React.FC<MenuEditorTabsProps> = ({
  activeTab,
  onTabChange,
  itemsCount = 0,
  modifiersCount = 0,
  combosCount = 0,
}) => {
  const { theme } = useTheme();

  const tabs: TabConfig[] = [
    { id: 'items', label: 'Items', icon: 'food-outline', count: itemsCount },
    { id: 'modifiers', label: 'Modifiers', icon: 'tune-variant', count: modifiersCount },
    { id: 'combos', label: 'Combos', icon: 'tag-multiple-outline', count: combosCount },
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    tabActive: {
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    tabLabelActive: {
      color: theme.colors.tertiary,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: theme.colors.tertiaryContainer,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
      minWidth: 20,
      alignItems: 'center',
    },
    badgeActive: {
      backgroundColor: theme.colors.tertiary,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.tertiary,
    },
    badgeTextActive: {
      color: theme.colors.white,
    },
  });

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab, ${tab.count} items`}
            testID={`tab-menu-${tab.id}`}
          >
            <Icon
              name={tab.icon}
              size={18}
              color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
              accessibilityLabel=""
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.count !== undefined && tab.count > 0 && (
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MenuEditorTabs;
