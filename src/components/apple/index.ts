// UNIVERSAL APPLE DESIGN SYSTEM
// Complete implementation following SOLID principles and Apple's design language
// Based on analysis of 5 Apple macOS reference images

// FOUNDATIONAL PRIMITIVES (Single Responsibility)
export {
  AppleCard,
  ApplePill,
  AppleInteractive,
} from './primitives';

// UNIVERSAL COMPONENTS (Open/Closed Principle)
export { AppleButton } from './AppleButton';

// INTERACTIVE COMPONENTS (Phase 3)
export {
  AppleToggle,
  AppleSettingsToggle,
  AppleSuccessToggle,
  AppleLargeToggle,
  AppleSmallToggle,
} from './AppleToggle';

export {
  AppleStatusPill,
  TableStatusPill,
  OrderStatusPill,
  StaffStatusPill,
  SystemStatusPill,
} from './AppleStatusPill';

export {
  AppleProgressBar,
  BatteryProgressBar,
  StorageProgressBar,
  LoadingProgressBar,
  OrderProgressBar,
  KitchenEfficiencyBar,
} from './AppleProgressBar';

// LAYOUT COMPONENTS (Interface Segregation)
export {
  AppleSidebar,
  AppleTopTabNavigation,
  AppleContentPanel,
  AppleSettingsPanel,
  AppleDashboardPanel,
  AppleFormPanel,
  AppleListPanel,
  AppleDetailPanel,
} from './layouts';

export type { AppleSidebarItem, AppleTopTabItem } from './layouts';

// SPECIALIZED COMPONENTS (Composition over Inheritance)
export {
  AppleStatsCard,
} from './components';

// APPLE DESIGN PHILOSOPHY:
// This design system replaces ALL component-specific styling throughout the app.
// Every component follows SOLID principles and uses Apple's 4-layer depth system.
//
// LAYER SYSTEM (from Apple reference images):
// - Layer 0: Pure black background (#000000)
// - Layer 1: Primary surfaces (#1C1C1E) - sidebar, main panels
// - Layer 2: Secondary surfaces (#2C2C2E) - selected states, nested cards
// - Layer 3: Interactive surfaces (#3A3A3C) - hover states, deeper nesting
//
// BORDER RADIUS SYSTEM (from Apple reference images):
// - Small elements: 12px (Apple minimum)
// - Medium elements: 16px (Apple standard)
// - Large elements: 20px (Apple preferred)
// - Extra large: 24px (Apple maximum)
// - Pills: 50% (Apple signature shape)
//
// REUSABILITY EXAMPLES:
// Settings: <AppleSidebar> + <AppleSettingsPanel>
// Dashboard: <AppleDashboardPanel> with <AppleCard> components
// Tables: <AppleCard> with <ApplePill> status indicators
// Orders: <AppleDetailPanel> with <AppleButton> actions
// Payments: <AppleFormPanel> with <AppleButton> variants