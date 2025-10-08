import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleInteractive } from '../primitives/AppleInteractive';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles top tab navigation
// - Open/Closed: Extensible through tab configurations without modification
// - Liskov Substitution: Can replace any tab navigation component
// - Interface Segregation: Small, focused interface for tabs
// - Dependency Inversion: Depends on universal primitives and theme abstractions

export interface AppleTopTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface AppleTopTabNavigationProps {
  tabs: AppleTopTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  scrollable?: boolean;
  showIndicator?: boolean;
  style?: any;
}

/**
 * APPLE TOP TAB NAVIGATION COMPONENT
 *
 * Horizontal tab navigation following Apple's design language.
 * Inspired by macOS Finder's "Recents | Shared | Browse" navigation.
 *
 * Features:
 * - Smooth animated indicator
 * - Auto-scrolling to active tab
 * - Icon + label support
 * - Badge notifications
 * - Disabled state support
 * - Responsive (scrollable on mobile)
 *
 * Usage:
 * <AppleTopTabNavigation
 *   tabs={[
 *     { id: 'general', label: 'General', icon: <Icon /> },
 *     { id: 'tables', label: 'Tables' },
 *     { id: 'floors', label: 'Floors' }
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 */
export const AppleTopTabNavigation: React.FC<AppleTopTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  scrollable = true,
  showIndicator = true,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabRefs = useRef<{ [key: string]: View | null }>({});

  // Auto-scroll to active tab
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: activeIndex * 120, // Approximate tab width
        animated: true,
      });
    }
  }, [activeTab, tabs]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? theme.colors.layer1 : theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.layer2 : theme.colors.outline,
      ...style,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    tab: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.appleMedium as number,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      minHeight: 44, // Apple touch target
    },
    tabActive: {
      backgroundColor: isDark ? theme.colors.layer2 : theme.colors.surfaceVariant,
    },
    tabDisabled: {
      opacity: 0.4,
    },
    iconContainer: {
      marginRight: spacing.xs,
    },
    label: {
      ...typography.labelLarge,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    labelActive: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    labelDisabled: {
      color: theme.colors.onSurfaceDisabled,
    },
    badge: {
      backgroundColor: theme.colors.error,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: spacing.xs,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      ...typography.labelSmall,
      color: theme.colors.onError,
      fontSize: 11,
      fontWeight: '600',
    },
    indicatorContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: 'transparent',
    },
    indicator: {
      height: 2,
      backgroundColor: theme.colors.primary,
      borderRadius: 1,
    },
  });

  const renderTab = (tab: AppleTopTabItem) => {
    const isActive = tab.id === activeTab;
    const isDisabled = tab.disabled || false;

    return (
      <View
        key={tab.id}
        ref={(ref) => { tabRefs.current[tab.id] = ref; }}
      >
        <AppleInteractive
          onPress={() => !isDisabled && onTabChange(tab.id)}
          disabled={isDisabled}
          feedbackType="opacity"
          style={[
            styles.tab,
            isActive && styles.tabActive,
            isDisabled && styles.tabDisabled,
          ]}
        >
          {/* Icon */}
          {tab.icon && (
            <View style={styles.iconContainer}>
              {tab.icon}
            </View>
          )}

          {/* Label */}
          <Text
            style={[
              styles.label,
              isActive && styles.labelActive,
              isDisabled && styles.labelDisabled,
            ]}
          >
            {tab.label}
          </Text>

          {/* Badge */}
          {tab.badge !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
              </Text>
            </View>
          )}
        </AppleInteractive>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollable}
      >
        {tabs.map(renderTab)}
      </ScrollView>

      {/* Animated Indicator (Apple-style underline) */}
      {showIndicator && (
        <View style={styles.indicatorContainer}>
          <Animated.View
            style={[
              styles.indicator,
              {
                width: 60, // Approximate indicator width
                transform: [{ translateX: indicatorAnim }],
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

// USAGE EXAMPLES (shows universal reusability):
// Settings with sub-sections:
// <AppleTopTabNavigation
//   tabs={[
//     { id: 'general', label: 'General' },
//     { id: 'tables', label: 'Tables', badge: 12 },
//     { id: 'floors', label: 'Floors' },
//   ]}
//   activeTab="general"
//   onTabChange={setActiveTab}
// />
//
// Dashboard with icons:
// <AppleTopTabNavigation
//   tabs={[
//     { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
//     { id: 'analytics', label: 'Analytics', icon: <ChartIcon /> },
//   ]}
//   activeTab="overview"
//   onTabChange={setActiveTab}
// />
