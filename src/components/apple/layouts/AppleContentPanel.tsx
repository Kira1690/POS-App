import React from 'react';
import { View, Text, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleCard } from '../primitives/AppleCard';
import { borderRadius, spacing } from '@/design-system/theme/spacing';
import { AppleTopTabNavigation, AppleTopTabItem } from './AppleTopTabNavigation';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple content panel layout
// - Open/Closed: Extensible through props without modification
// - Liskov Substitution: Can replace any content area component
// - Interface Segregation: Small, focused interface for content panels
// - Dependency Inversion: Depends on universal primitives and theme abstractions

interface AppleContentPanelProps {
  children: React.ReactNode;

  // APPLE CONTENT VARIANTS (from reference images analysis)
  variant?: 'settings' | 'dashboard' | 'form' | 'list' | 'detail';

  // APPLE HEADER SYSTEM (from reference images)
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;

  // TOP TAB NAVIGATION (NEW - for settings sub-sections)
  topTabs?: AppleTopTabItem[];
  activeTopTab?: string;
  onTopTabChange?: (tabId: string) => void;

  // UNIVERSAL LAYOUT SYSTEM (reusable everywhere)
  scrollable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';

  // APPLE BACKGROUND SYSTEM (uses layered colors)
  backgroundLayer?: 'background' | 'surface' | 'surfaceVariant' | 'surfaceElevated';

  // UNIVERSAL SIZING SYSTEM
  flex?: number;
  height?: number | 'auto';

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: ViewStyle;
}

// UNIVERSAL APPLE CONTENT PANEL COMPONENT (Single Responsibility)
// This provides the main content area for all screens with Apple styling
export const AppleContentPanel: React.FC<AppleContentPanelProps> = ({
  children,
  variant = 'settings',
  title,
  subtitle,
  headerActions,
  topTabs,
  activeTopTab,
  onTopTabChange,
  scrollable = true,
  padding = 'large',
  backgroundLayer = 'surface',
  flex = 1,
  height = 'auto',
  style,
}) => {
  const { theme, isDark } = useTheme();

  // APPLE PADDING SYSTEM (optimized for space utilization)
  const getPaddingValue = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return spacing.sm; // 8px
      case 'medium': return spacing.md; // 12px
      case 'large': return spacing.lg; // 16px (reduced from 20px)
      default: return spacing.lg;
    }
  };

  // APPLE CONTENT PANEL STYLING (from reference images analysis)
  const panelStyles = StyleSheet.create({
    container: {
      flex,
      height: height === 'auto' ? undefined : height,
      ...style,
    },
    content: {
      flex: 1,
      padding: getPaddingValue(),
    },
    header: {
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: isDark ? theme.colors.layer2 : 'transparent',
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: subtitle ? spacing.sm : 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });

  // APPLE HEADER RENDERING (from reference images structure)
  const renderHeader = () => {
    if (!title && !subtitle && !headerActions) return null;

    return (
      <View style={panelStyles.header}>
        <View style={panelStyles.headerTop}>
          <View style={{ flex: 1 }}>
            {title && <Text style={panelStyles.title}>{title}</Text>}
            {subtitle && <Text style={panelStyles.subtitle}>{subtitle}</Text>}
          </View>

          {headerActions && (
            <View style={panelStyles.headerActions}>
              {headerActions}
            </View>
          )}
        </View>
      </View>
    );
  };

  // APPLE CONTENT AREA (uses layered background system)
  const contentArea = (
    <View style={panelStyles.content}>
      {renderHeader()}

      {/* TOP TAB NAVIGATION (conditional) */}
      {topTabs && topTabs.length > 0 && activeTopTab && onTopTabChange && (
        <AppleTopTabNavigation
          tabs={topTabs}
          activeTab={activeTopTab}
          onTabChange={onTopTabChange}
        />
      )}

      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={panelStyles.scrollContent}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );

  return (
    <AppleCard
      layer={backgroundLayer}
      radius="appleXLarge"
      style={panelStyles.container}
      shadow={false} // Content panels don't need shadows, they use layered colors
    >
      {contentArea}
    </AppleCard>
  );
};

// SPECIALIZED CONTENT PANEL VARIANTS (following Open/Closed principle)

// SETTINGS CONTENT PANEL (for Settings screens)
export const AppleSettingsPanel: React.FC<Omit<AppleContentPanelProps, 'variant'>> = (props) => (
  <AppleContentPanel
    {...props}
    variant="settings"
    backgroundLayer="surface"
    padding="large"
  />
);

// DASHBOARD CONTENT PANEL (for Dashboard screens)
export const AppleDashboardPanel: React.FC<Omit<AppleContentPanelProps, 'variant'>> = (props) => (
  <AppleContentPanel
    {...props}
    variant="dashboard"
    backgroundLayer="surfaceVariant"
    padding="medium"
  />
);

// FORM CONTENT PANEL (for Forms and inputs)
export const AppleFormPanel: React.FC<Omit<AppleContentPanelProps, 'variant'>> = (props) => (
  <AppleContentPanel
    {...props}
    variant="form"
    backgroundLayer="surface"
    padding="large"
    scrollable={false}
  />
);

// LIST CONTENT PANEL (for Lists and tables)
export const AppleListPanel: React.FC<Omit<AppleContentPanelProps, 'variant'>> = (props) => (
  <AppleContentPanel
    {...props}
    variant="list"
    backgroundLayer="surface"
    padding="small"
  />
);

// DETAIL CONTENT PANEL (for Detail views)
export const AppleDetailPanel: React.FC<Omit<AppleContentPanelProps, 'variant'>> = (props) => (
  <AppleContentPanel
    {...props}
    variant="detail"
    backgroundLayer="surfaceElevated"
    padding="large"
  />
);

// USAGE EXAMPLES (shows universal reusability):
// Settings screen content:
// <AppleSettingsPanel title="General Settings">
//   {settingsContent}
// </AppleSettingsPanel>
//
// Dashboard main area:
// <AppleDashboardPanel
//   title="Restaurant Dashboard"
//   subtitle="Overview of today's operations"
//   headerActions={<AppleButton title="Refresh" />}
// >
//   {dashboardContent}
// </AppleDashboardPanel>
//
// Order detail view:
// <AppleDetailPanel title="Order #1234" headerActions={orderActions}>
//   {orderDetails}
// </AppleDetailPanel>
//
// Menu management:
// <AppleListPanel title="Menu Items">
//   {menuItemsList}
// </AppleListPanel>