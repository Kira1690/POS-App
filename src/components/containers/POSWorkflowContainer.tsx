/**
 * POSWorkflowContainer - Container for SkyTab-style POS 3-panel layout
 * Clean separation: Categories | Menu Items | Order Cart
 * Follows professional POS design patterns
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// SkyTab-style layout constants
const CATEGORY_PANEL_WIDTH = 240;
const CART_PANEL_WIDTH = 320;

interface POSWorkflowContainerProps {
  categoryPanel: React.ReactNode;
  menuPanel: React.ReactNode;
  cartPanel: React.ReactNode;
  headerPanel?: React.ReactNode;
  testID?: string;
}

/**
 * Professional POS workflow container with 3-panel SkyTab-style layout
 * 
 * Layout: [Categories] | [Menu Items] | [Order Cart]
 * Responsive: Adapts to tablet/mobile screen sizes
 * 
 * @param categoryPanel - Menu categories selection panel
 * @param menuPanel - Menu items grid/list panel
 * @param cartPanel - Order cart and checkout panel
 * @param headerPanel - Optional header panel
 * @param testID - Test identifier
 */
export const POSWorkflowContainer: React.FC<POSWorkflowContainerProps> = ({
  categoryPanel,
  menuPanel,
  cartPanel,
  headerPanel,
  testID = 'pos-workflow-container',
}) => {
  const { theme } = useTheme();

  if (!isTablet) {
    // Mobile layout: Stack vertically or use tabs
    return (
      <View 
        style={[
          styles.mobileContainer, 
          { backgroundColor: theme.colors.background }
        ]}
        testID={testID}
      >
        {headerPanel && (
          <View style={styles.headerPanel}>
            {headerPanel}
          </View>
        )}
        
        <View style={styles.mobileContent}>
          {/* Mobile: Show menu with floating cart */}
          <View style={styles.mobileMenuSection}>
            <View style={styles.mobileCategorySection}>
              {categoryPanel}
            </View>
            <View style={styles.mobileItemsSection}>
              {menuPanel}
            </View>
          </View>
          
          {/* Mobile: Floating cart panel */}
          <View style={[
            styles.mobileCartPanel,
            { backgroundColor: theme.colors.surface }
          ]}>
            {cartPanel}
          </View>
        </View>
      </View>
    );
  }

  // Tablet layout: Professional 3-panel SkyTab-style
  return (
    <View 
      style={[
        styles.tabletContainer, 
        { backgroundColor: theme.colors.background }
      ]}
      testID={testID}
    >
      {headerPanel && (
        <View style={styles.headerPanel}>
          {headerPanel}
        </View>
      )}
      
      <View style={styles.tabletContent}>
        {/* Left Panel: Categories */}
        <View style={[
          styles.categoryPanel,
          { backgroundColor: theme.colors.surfaceVariant }
        ]}>
          {categoryPanel}
        </View>
        
        {/* Center Panel: Menu Items */}
        <View style={[
          styles.menuPanel,
          { backgroundColor: theme.colors.background }
        ]}>
          {menuPanel}
        </View>
        
        {/* Right Panel: Order Cart */}
        <View style={[
          styles.cartPanel,
          { 
            backgroundColor: theme.colors.surface,
            borderLeftColor: theme.colors.outline,
          }
        ]}>
          {cartPanel}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Tablet Layout
  tabletContainer: {
    flex: 1,
  },
  tabletContent: {
    flex: 1,
    flexDirection: 'row',
  },
  categoryPanel: {
    width: CATEGORY_PANEL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.08)',
  },
  menuPanel: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  cartPanel: {
    width: CART_PANEL_WIDTH,
    borderLeftWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  
  // Mobile Layout
  mobileContainer: {
    flex: 1,
  },
  mobileContent: {
    flex: 1,
    position: 'relative',
  },
  mobileMenuSection: {
    flex: 1,
  },
  mobileCategorySection: {
    height: 60, // Horizontal category bar
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  mobileItemsSection: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  mobileCartPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%', // Can slide up to show more
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Shared
  headerPanel: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});