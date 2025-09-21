/**
 * TableManagementContainer - Container for table management layout
 * Professional layout: Header | Sidebar + Table Grid + Order Panel
 * Responsive design for tablet and mobile devices
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Layout constants
const SIDEBAR_WIDTH = 240;
const ORDER_PANEL_WIDTH = 320;

interface TableManagementContainerProps {
  headerPanel: React.ReactNode;
  sidebarPanel?: React.ReactNode;
  tableGridPanel: React.ReactNode;
  orderPanel?: React.ReactNode;
  showSidebar?: boolean;
  showOrderPanel?: boolean;
  testID?: string;
}

/**
 * Container component for table management screen layout
 * Provides professional restaurant table management interface
 * 
 * @param headerPanel - Header with title and actions
 * @param sidebarPanel - Table status legend and filters
 * @param tableGridPanel - Main table grid display
 * @param orderPanel - Current order details (optional)
 * @param showSidebar - Whether to show sidebar
 * @param showOrderPanel - Whether to show order panel
 * @param testID - Test identifier
 */
export const TableManagementContainer: React.FC<TableManagementContainerProps> = ({
  headerPanel,
  sidebarPanel,
  tableGridPanel,
  orderPanel,
  showSidebar = true,
  showOrderPanel = false,
  testID = 'table-management-container',
}) => {
  const { theme } = useTheme();

  if (!isTablet) {
    // Mobile layout: Stack vertically with overlays
    return (
      <View 
        style={[
          styles.mobileContainer, 
          { backgroundColor: theme.colors.background }
        ]}
        testID={testID}
      >
        {/* Header */}
        <View style={[
          styles.headerSection,
          { backgroundColor: theme.colors.surface }
        ]}>
          {headerPanel}
        </View>
        
        {/* Main content */}
        <View style={styles.mobileContent}>
          {tableGridPanel}
          
          {/* Sidebar overlay */}
          {showSidebar && sidebarPanel && (
            <View style={[
              styles.mobileSidebarOverlay,
              { backgroundColor: theme.colors.surface }
            ]}>
              {sidebarPanel}
            </View>
          )}
          
          {/* Order panel overlay */}
          {showOrderPanel && orderPanel && (
            <View style={[
              styles.mobileOrderOverlay,
              { backgroundColor: theme.colors.surface }
            ]}>
              {orderPanel}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Tablet layout: Professional 3-panel layout
  return (
    <View 
      style={[
        styles.tabletContainer, 
        { backgroundColor: theme.colors.background }
      ]}
      testID={testID}
    >
      {/* Header */}
      <View style={[
        styles.headerSection,
        { 
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outline,
        }
      ]}>
        {headerPanel}
      </View>
      
      {/* Content area */}
      <View style={styles.tabletContent}>
        {/* Left Sidebar */}
        {showSidebar && sidebarPanel && (
          <View style={[
            styles.sidebarPanel,
            { 
              backgroundColor: theme.colors.surfaceVariant,
              borderRightColor: theme.colors.outline,
            }
          ]}>
            {sidebarPanel}
          </View>
        )}
        
        {/* Main table grid */}
        <View style={styles.mainTableSection}>
          {tableGridPanel}
        </View>
        
        {/* Right order panel */}
        {showOrderPanel && orderPanel && (
          <View style={[
            styles.orderPanel,
            { 
              backgroundColor: theme.colors.surface,
              borderLeftColor: theme.colors.outline,
            }
          ]}>
            {orderPanel}
          </View>
        )}
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
  headerSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sidebarPanel: {
    width: SIDEBAR_WIDTH,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRightWidth: 1,
  },
  mainTableSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  orderPanel: {
    width: ORDER_PANEL_WIDTH,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderLeftWidth: 1,
  },
  
  // Mobile Layout
  mobileContainer: {
    flex: 1,
  },
  mobileContent: {
    flex: 1,
    position: 'relative',
  },
  mobileSidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mobileOrderOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});