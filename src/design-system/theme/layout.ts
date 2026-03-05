/**
 * Layout Constants - POS-specific layout dimensions
 * Single source of truth for all layout-related values
 * Following Apple design principles and SOLID patterns
 */

import { spacing } from './spacing';

// POS Panel widths - Based on Apple's iPad split-view patterns
export const panelWidths = {
  // Sidebar widths
  sidebarCollapsed: 64,      // Minimum sidebar width (icons only)
  sidebarCompact: 180,       // Compact sidebar (labels truncated)
  sidebarDefault: 240,       // Default category sidebar width
  sidebarExpanded: 280,      // Expanded sidebar with full labels

  // Main content panels
  menuGridMinWidth: 400,     // Minimum menu grid width
  billPanelCompact: 280,     // Compact bill panel for tablets
  billPanelDefault: 320,     // Default bill panel width
  billPanelExpanded: 380,    // Expanded bill panel for large screens

  // Cart panel widths
  cartPanelMinWidth: 280,    // Minimum cart panel width
  cartPanelDefault: 320,     // Default cart panel width
  cartPanelMaxWidth: 400,    // Maximum cart panel width
} as const;

// POS Card dimensions - Based on Apple's card patterns
export const cardDimensions = {
  // Menu item cards
  menuItemCard: {
    minHeight: 100,
    defaultHeight: 130,
    maxHeight: 160,
    minWidth: 140,
  },

  // Table selection cards
  tableCard: {
    minHeight: 80,
    defaultHeight: 100,
    maxHeight: 120,
    minWidth: 100,
  },

  // Kitchen ticket cards
  kitchenTicketCard: {
    minHeight: 120,
    defaultHeight: 180,
    maxHeight: 280,
    minWidth: 200,
  },
} as const;

// Grid configurations - Based on screen width
export const gridConfig = {
  // Menu grid columns based on available width
  menuGrid: {
    mobile: 2,           // 2 columns on mobile + small tablet
    tablet: 3,           // 3 columns on tablet
    largeTablet: 3,      // 3 columns max — 4 is too cramped
  },

  // Table grid columns
  tableGrid: {
    mobile: 3,
    tablet: 4,
    largeTablet: 5,
  },

  // Category grid columns (horizontal scroll)
  categoryGrid: {
    itemWidth: 100,
    itemGap: spacing.sm,
  },
} as const;

// Icon sizes - Standardized icon dimensions
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,

  // Component-specific icon sizes
  button: 20,
  navItem: 24,
  cartAction: 16,
  emptyState: 64,
  headerAction: 20,
} as const;

// Divider and border dimensions
export const dividers = {
  thin: 1,
  default: 1,
  thick: 2,
} as const;

// Elevation presets for consistency
export const elevations = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,

  // Component-specific elevations
  card: 2,
  modal: 8,
  dropdown: 4,
  button: 2,
  buttonPressed: 1,
} as const;

// Opacity values for text/elements
export const opacities = {
  disabled: 0.38,
  secondary: 0.7,
  tertiary: 0.54,
  hint: 0.38,
  divider: 0.12,
  overlay: 0.5,
  scrim: 0.32,

  // Semantic opacity values (for color concatenation)
  textPrimary: 'FF',     // 100%
  textSecondary: 'B3',   // 70%
  textTertiary: '8A',    // 54%
  textHint: '61',        // 38%
  textDisabled: '61',    // 38%
  borderLight: '1F',     // 12%
  borderMedium: '3D',    // 24%
  borderDark: '61',      // 38%
} as const;

// Export type definitions
export type PanelWidthKey = keyof typeof panelWidths;
export type IconSizeKey = keyof typeof iconSizes;
export type ElevationKey = keyof typeof elevations;
export type OpacityKey = keyof typeof opacities;
