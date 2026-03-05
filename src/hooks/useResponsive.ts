/**
 * useResponsive — Single source of truth for all responsive layout decisions.
 *
 * Wraps useWindowDimensions() so every consumer automatically re-renders on
 * orientation change. Import this instead of calling Dimensions.get() or
 * useWindowDimensions() directly in screens/components.
 *
 * Breakpoints (matching design-system/theme/index.ts):
 *   phone:        width < 600
 *   smallTablet:  600 ≤ width < 800
 *   largeTablet:  width ≥ 800
 */

import { useWindowDimensions, Dimensions } from 'react-native';
import { gridConfig, panelWidths } from '@/design-system/theme/layout';
import { getResponsiveSpacing } from '@/design-system/theme/spacing';
import { getResponsiveTypography } from '@/design-system/theme/typography';

export type DeviceClass = 'phone' | 'smallTablet' | 'largeTablet';

export interface ResponsiveValues {
  screenWidth: number;
  screenHeight: number;
  deviceClass: DeviceClass;
  isPhone: boolean;
  isSmallTablet: boolean;
  isLargeTablet: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  // Layout decisions
  showPersistentSidebar: boolean;   // largeTablet only
  sidebarAsDrawer: boolean;         // phone only
  billPanelAsSheet: boolean;        // phone only
  // Grid counts
  menuGridColumns: number;          // 2 / 3 / 4
  tableGridColumns: number;         // 3 / 4 / 5
  kitchenColumns: number;           // 1 / 2 / 3
  orderListColumns: number;         // 1 / 1 / 2
  // Panel widths
  billPanelWidth: number;
  // Modal sizing
  modalWidth: number | string;
  modalMaxWidth: number;
  // Content spacing helpers
  contentPadding: number;           // phone: 8, smallTablet: 10, largeTablet: 16
  cardPadding: number;              // phone: 8, smallTablet: 10, largeTablet: 16
  sectionGap: number;               // phone: 8, smallTablet: 10, largeTablet: 16
  // Typography helpers
  headingSize: number;              // phone: 16, smallTablet: 18, largeTablet: 24
  subheadingSize: number;           // phone: 13, smallTablet: 14, largeTablet: 18
  bodySize: number;                 // phone: 12, smallTablet: 13, largeTablet: 14
  captionSize: number;              // phone: 10, smallTablet: 10, largeTablet: 12
  statValueSize: number;            // phone: 18, smallTablet: 22, largeTablet: 28
  chipRowHeight: number;            // phone: 44, others: 0 (chip nav not used on tablet)
  // Responsive helpers (pass screenWidth to existing util fns)
  responsiveSpacing: ReturnType<typeof getResponsiveSpacing>;
  responsiveTypography: ReturnType<typeof getResponsiveTypography>;
}

const PHONE_BREAKPOINT = 600;
const SMALL_TABLET_BREAKPOINT = 800;
const LARGE_LANDSCAPE_BREAKPOINT = 1200;

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  const isPortrait = height > width;
  const isLandscape = !isPortrait;

  // Use the physical screen's shorter dimension for device class detection.
  // useWindowDimensions() returns usable area (minus status/nav bars), which
  // can push the short side below breakpoints (e.g. 800px screen → 752px window).
  // Dimensions.get('screen') gives full physical size, and shortSide is
  // orientation-independent so it's stable across rotation.
  const screen = Dimensions.get('screen');
  const shortSide = Math.min(screen.width, screen.height);
  const isPhone = shortSide < PHONE_BREAKPOINT;
  const isSmallTablet = shortSide >= PHONE_BREAKPOINT && shortSide < SMALL_TABLET_BREAKPOINT;
  const isLargeTablet = shortSide >= SMALL_TABLET_BREAKPOINT;

  const deviceClass: DeviceClass = isPhone
    ? 'phone'
    : isSmallTablet
      ? 'smallTablet'
      : 'largeTablet';

  // Layout decisions
  const showPersistentSidebar = isLargeTablet;
  const sidebarAsDrawer = isPhone;
  const billPanelAsSheet = isPhone;

  // Grid columns from design-system gridConfig
  // Max 3 columns — 4 is too cramped even on large tablets
  const menuGridColumns = isPhone || isSmallTablet ? 2 : 3;

  const tableGridColumns = isPhone
    ? gridConfig.tableGrid.mobile     // 3
    : isSmallTablet
      ? gridConfig.tableGrid.mobile   // 3
      : 4;

  const kitchenColumns = isPhone
    ? 1
    : isSmallTablet
      ? 2
      : width > LARGE_LANDSCAPE_BREAKPOINT
        ? 3
        : 2;

  // Order list always single column — multi-column breaks OrderListItem layout
  const orderListColumns = 1;

  // Bill panel width
  let billPanelWidth: number;
  if (isPhone) {
    billPanelWidth = 0; // full-width sheet / hidden until needed
  } else if (isSmallTablet) {
    billPanelWidth = panelWidths.billPanelCompact;
  } else if (isPortrait) {
    billPanelWidth = panelWidths.billPanelDefault;
  } else {
    billPanelWidth = panelWidths.billPanelExpanded;
  }

  // Modal sizing
  const modalWidth: number | string = isPhone ? '100%' : '90%';
  const modalMaxWidth = isPhone ? width : 560;

  // Content spacing helpers — smallTablet values tightened for ≤700dp screens (e.g. Galaxy Tab A9)
  const contentPadding = isPhone ? 8 : isSmallTablet ? 10 : 16;
  const cardPadding = isPhone ? 8 : isSmallTablet ? 10 : 16;
  const sectionGap = isPhone ? 8 : isSmallTablet ? 10 : 16;

  // Typography helpers — smallTablet uses near-phone sizes to prevent overflow on 600-800dp screens
  const headingSize = isPhone ? 16 : isSmallTablet ? 18 : 24;
  const subheadingSize = isPhone ? 13 : isSmallTablet ? 14 : 18;
  const bodySize = isPhone ? 12 : isSmallTablet ? 13 : 14;
  const captionSize = isPhone ? 10 : isSmallTablet ? 10 : 12;
  const statValueSize = isPhone ? 18 : isSmallTablet ? 22 : 28;
  const chipRowHeight = isPhone ? 44 : 0;

  return {
    screenWidth: width,
    screenHeight: height,
    deviceClass,
    isPhone,
    isSmallTablet,
    isLargeTablet,
    isPortrait,
    isLandscape,
    showPersistentSidebar,
    sidebarAsDrawer,
    billPanelAsSheet,
    menuGridColumns,
    tableGridColumns,
    kitchenColumns,
    orderListColumns,
    billPanelWidth,
    modalWidth,
    modalMaxWidth,
    contentPadding,
    cardPadding,
    sectionGap,
    headingSize,
    subheadingSize,
    bodySize,
    captionSize,
    statValueSize,
    chipRowHeight,
    responsiveSpacing: getResponsiveSpacing(width),
    responsiveTypography: getResponsiveTypography(width),
  };
}
