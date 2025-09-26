# Design Token Specifications

## 🎨 COMPREHENSIVE APPLE DESIGN TOKEN SYSTEM

Technical specifications for transforming our current design tokens to match Apple's macOS design language.

## 📐 BORDER RADIUS TOKEN SYSTEM

### Current vs Apple Border Radius Comparison

```typescript
// CURRENT DESIGN TOKENS (theme.ts)
borderRadius: {
  small: 8,         // ❌ Too small for Apple
  medium: 12,       // ❌ Too small for Apple
  large: 16,        // ❌ Too small for Apple
  button: 12,       // ❌ Too small for Apple
}

// NEW APPLE DESIGN TOKENS
borderRadius: {
  small: 12,        // ✅ Apple small elements (icons, badges)
  medium: 16,       // ✅ Apple medium elements (search bars, inputs)
  large: 20,        // ✅ Apple large elements (cards, panels)
  xlarge: 24,       // ✅ Apple extra large (hero cards, modals)
  button: 22,       // ✅ Apple button standard
  pill: '50%',      // ✅ Apple pill elements (toggles, status badges)

  // Component-specific tokens
  card: 20,         // Standard card radius
  cardLarge: 24,    // Large card radius (dashboard, settings)
  input: 16,        // Input field radius
  modal: 24,        // Modal dialog radius
  sidebar: 24,      // Sidebar panel radius
  toggle: '50%',    // Toggle switch radius (perfect pill)
  badge: 12,        // Small badge radius
  avatar: '50%',    // Avatar radius (perfect circle)
}
```

### Implementation Strategy

```typescript
// UPDATE STRATEGY: Update theme.ts in phases

// Phase 1: Core radius updates
const coreRadiusUpdates = {
  borderRadius: {
    small: 12,      // +50% increase from current 8px
    medium: 16,     // +33% increase from current 12px
    large: 20,      // +25% increase from current 16px
    xlarge: 24,     // New token for Apple generous rounding
    button: 22,     // +83% increase from current 12px
    pill: '50%',    // New token for perfect pills
  }
};

// Phase 2: Component-specific tokens
const componentRadiusTokens = {
  // Settings screen components
  settingsSidebar: 24,
  settingsPanel: 24,
  settingsItem: 18,

  // Dashboard components
  dashboardCard: 22,
  kpiCard: 22,
  chartContainer: 22,

  // Table management
  tableCard: 20,
  tableGrid: 20,

  // Order management
  orderCard: 20,
  orderStatus: 14,    // Pill-shaped status

  // Payment interface
  paymentCard: 22,
  paymentButton: 24,  // Extra rounded for important actions

  // Menu management
  menuCategory: 20,
  menuItem: 18,
  menuFilter: 16,     // Pill-shaped filters
};
```

## 🎨 COLOR SYSTEM TRANSFORMATION

### Current vs Apple Color System

```typescript
// CURRENT COLOR SYSTEM
colors: {
  // Current light theme
  background: '#F2F2F7',      // ❌ Light gray background
  surface: '#FFFFFF',         // ❌ White surfaces
  primary: '#1C1C1E',        // ✅ Already Apple-aligned
  accent: '#007AFF',         // ✅ Already Apple blue
}

// NEW APPLE DARK THEME SYSTEM
colors: {
  // Apple black background system
  background: '#000000',      // ✅ Pure black (Apple standard)

  // Apple surface hierarchy
  surface: '#1C1C1E',        // ✅ Primary dark surface
  surfaceSecondary: '#2C2C2E', // ✅ Secondary dark surface
  surfaceTertiary: '#3A3A3C',  // ✅ Tertiary surface for depth

  // Apple text hierarchy for dark theme
  text: '#FFFFFF',           // ✅ Primary white text
  textSecondary: '#EBEBF5',  // ✅ Secondary light gray text
  textTertiary: '#EBEBF599', // ✅ Tertiary text (60% opacity)
  textQuaternary: '#EBEBF54D', // ✅ Quaternary text (30% opacity)

  // Apple accent colors (from reference images)
  accent: '#007AFF',         // ✅ Apple blue
  accentGreen: '#32D74B',    // ✅ Apple green (success, battery)
  accentRed: '#FF453A',      // ✅ Apple red (error, attention)
  accentOrange: '#FF9F0A',   // ✅ Apple orange (warning)
  accentPurple: '#BF5AF2',   // ✅ Apple purple (focus)
  accentYellow: '#FFD60A',   // ✅ Apple yellow (attention)

  // Apple categorical colors (for settings icons)
  categoryRed: '#FF453A',    // Settings general icon background
  categoryBlue: '#007AFF',   // Settings privacy icon background
  categoryGreen: '#32D74B',  // Settings security icon background
  categoryOrange: '#FF9F0A', // Settings notifications icon background
  categoryPurple: '#BF5AF2', // Settings appearance icon background
  categoryGray: '#8E8E93',   // Settings other icon background

  // Apple semantic colors
  success: '#32D74B',        // Apple green
  warning: '#FF9F0A',        // Apple orange
  error: '#FF453A',          // Apple red
  info: '#007AFF',           // Apple blue

  // Apple UI element colors
  border: '#38383A',         // Apple dark border (when needed)
  separator: '#38383A',      // Apple separator line color
  overlay: 'rgba(0, 0, 0, 0.6)', // Apple modal overlay

  // Apple shadow colors
  shadow: '#000000',         // Pure black shadows
  shadowLight: 'rgba(0, 0, 0, 0.1)', // Light shadows
  shadowMedium: 'rgba(0, 0, 0, 0.18)', // Medium shadows
  shadowHeavy: 'rgba(0, 0, 0, 0.25)', // Heavy shadows
}
```

### Color Migration Strategy

```typescript
// PHASE 1: Background transformation
const backgroundMigration = {
  // Change main background from light to black
  'theme.colors.background': '#F2F2F7' → '#000000',

  // Update all surface colors to Apple dark theme
  'theme.colors.surface': '#FFFFFF' → '#1C1C1E',
  'theme.colors.surfaceVariant': '#F5F5F5' → '#2C2C2E',
};

// PHASE 2: Text color updates for dark theme
const textColorMigration = {
  // Update text colors for dark backgrounds
  'theme.colors.onSurface': '#1C1C1E' → '#FFFFFF',
  'theme.colors.onSurfaceVariant': '#666666' → '#EBEBF5',
  'theme.colors.onBackground': '#1C1C1E' → '#FFFFFF',
};

// PHASE 3: Component-specific color applications
const componentColorMapping = {
  // Settings screen
  settingsSidebar: '#1C1C1E',
  settingsItemActive: '#2C2C2E',
  settingsText: '#FFFFFF',

  // Dashboard
  dashboardBackground: '#000000',
  dashboardCard: '#1C1C1E',
  kpiValue: '#FFFFFF',
  kpiLabel: '#EBEBF599',

  // Tables
  tableCard: '#1C1C1E',
  tableCardActive: '#2C2C2E',
  tableStatusAvailable: '#32D74B',
  tableStatusOccupied: '#FF453A',
  tableStatusReserved: '#FF9F0A',

  // Orders
  orderCard: '#1C1C1E',
  orderStatusDraft: '#8E8E93',
  orderStatusSubmitted: '#007AFF',
  orderStatusPreparing: '#FF9F0A',
  orderStatusReady: '#32D74B',

  // Payment
  paymentCard: '#1C1C1E',
  paymentMethodButton: '#2C2C2E',
  paymentConfirm: '#32D74B',
};
```

## 📏 SPACING SYSTEM ENHANCEMENT

### Current vs Apple Spacing System

```typescript
// CURRENT SPACING TOKENS
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,        // ❌ Not generous enough for Apple
  xl: 20,        // ❌ Not generous enough for Apple
  xxl: 24,       // ❌ Limited spacing scale
}

// NEW APPLE SPACING SYSTEM
spacing: {
  // Base spacing scale (4px increments)
  xs: 4,         // ✅ Micro spacing
  sm: 8,         // ✅ Small spacing
  md: 12,        // ✅ Medium spacing
  lg: 16,        // ✅ Large spacing (Apple base)
  xl: 20,        // ✅ Extra large spacing
  xxl: 24,       // ✅ Double extra large
  xxxl: 28,      // ✅ Triple extra large (new)
  xxxxl: 32,     // ✅ Section spacing (new)

  // Component-specific spacing
  containerPadding: 24,      // Apple container padding
  cardPadding: 20,          // Apple card internal padding
  cardPaddingLarge: 24,     // Apple large card padding
  sectionSpacing: 32,       // Apple section separation
  itemSpacing: 16,          // Apple item separation

  // Touch target spacing
  touchTarget: 44,          // Apple HIG minimum touch target
  buttonPaddingH: 24,       // Apple button horizontal padding
  buttonPaddingV: 16,       // Apple button vertical padding

  // Settings-specific spacing
  sidebarPadding: 20,       // Apple sidebar internal padding
  sidebarItemSpacing: 6,    // Space between sidebar items
  panelPadding: 24,         // Apple panel internal padding

  // Dashboard-specific spacing
  dashboardPadding: 24,     // Dashboard container padding
  cardSpacing: 20,          // Space between dashboard cards
  kpiSpacing: 16,           // Space between KPI elements

  // Table management spacing
  tableGridPadding: 24,     // Table grid container padding
  tableCardMargin: 12,      // Margin around table cards
  tableCardPadding: 20,     // Internal table card padding

  // Form element spacing
  inputPadding: 16,         // Apple input internal padding
  inputSpacing: 16,         // Space between form inputs
  labelSpacing: 8,          // Space between label and input
}
```

### Spacing Implementation Strategy

```typescript
// SPACING UPDATE PHASES

// Phase 1: Universal spacing increases
const universalSpacingUpdates = {
  // Increase all container padding by 20%
  containerPadding: 20 → 24,

  // Increase card padding for Apple generosity
  cardPadding: 15 → 20,
  cardPaddingLarge: 20 → 24,

  // Increase section spacing for Apple hierarchy
  sectionSpacing: 24 → 32,
};

// Phase 2: Component-specific spacing
const componentSpacingMap = {
  // Settings screen spacing
  SettingsScreen: {
    leftPanelPadding: 20,     // Keep (already good)
    rightPanelPadding: 24,    // Increase for generosity
    categoryItemPadding: 18,  // Increase from 15
    breadcrumbPadding: 16,    // Increase from 10
  },

  // Dashboard spacing
  DashboardScreen: {
    containerPadding: 24,     // Increase from 20
    cardSpacing: 20,          // Increase from 16
    sectionSpacing: 32,       // Increase from 24
  },

  // Table management spacing
  TableManagement: {
    gridPadding: 24,          // Increase from 20
    cardMargin: 12,           // Increase from 8
    cardPadding: 20,          // Increase from 15
  },
};

// Phase 3: Touch target compliance
const touchTargetCompliance = {
  // Ensure all interactive elements meet Apple 44pt minimum
  buttonMinHeight: 44,
  touchTargetMinSize: 44,
  listItemMinHeight: 44,
  tabBarItemMinHeight: 49,  // Apple tab bar standard
};
```

## 🎭 SHADOW SYSTEM SPECIFICATIONS

### Apple Shadow System Implementation

```typescript
// CURRENT SHADOW SYSTEM (Limited)
shadows: {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}

// NEW APPLE SHADOW SYSTEM
shadows: {
  // Apple shadow hierarchy
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },

  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },

  xlarge: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },

  // Component-specific shadows
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 6,
  },

  cardLarge: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },

  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },

  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },

  buttonPressed: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  // Colored shadows for accent elements
  accentShadow: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  successShadow: {
    shadowColor: '#32D74B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
}
```

## 📝 TYPOGRAPHY SYSTEM ENHANCEMENT

### Apple Typography Token System

```typescript
// CURRENT TYPOGRAPHY (Basic)
typography: {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
}

// NEW APPLE TYPOGRAPHY SYSTEM
typography: {
  // Apple Display Text Hierarchy
  largeTitle: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.4,
    color: '#FFFFFF',  // Default white for dark theme
  },

  title1: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },

  title2: {
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 34,
    letterSpacing: -0.2,
    color: '#FFFFFF',
  },

  title3: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
    letterSpacing: -0.1,
    color: '#FFFFFF',
  },

  // Apple Body Text Hierarchy
  headline: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
    letterSpacing: 0,
    color: '#FFFFFF',
  },

  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#FFFFFF',
  },

  callout: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0,
    color: '#EBEBF5',
  },

  subheadline: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#EBEBF5',
  },

  footnote: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#EBEBF599',
  },

  caption1: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.2,
    color: '#EBEBF599',
  },

  caption2: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
    letterSpacing: 0.2,
    color: '#EBEBF599',
  },

  // Component-specific typography
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0,
    color: '#FFFFFF',
  },

  tabBarText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.2,
    color: '#EBEBF5',
  },

  navigationTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#FFFFFF',
  },

  // Special purpose typography
  monospace: {
    fontFamily: 'SF Mono', // Apple monospace font
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#FFFFFF',
  },

  // Numeric display (for amounts, counts)
  numericLarge: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
    letterSpacing: -1.0,
    color: '#FFFFFF',
  },

  numericMedium: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
}
```

## 🔄 ANIMATION & TRANSITION SPECIFICATIONS

### Apple Animation Token System

```typescript
// NEW APPLE ANIMATION SYSTEM
animations: {
  // Apple standard timing
  timing: {
    fast: 150,        // Quick interactions
    normal: 200,      // Standard Apple timing
    slow: 300,        // Deliberate transitions
    page: 400,        // Page transitions
  },

  // Apple easing curves
  easing: {
    easeOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',      // Apple standard
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',         // Apple acceleration
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',    // Apple balanced
    linear: 'linear',                                 // Linear when needed
  },

  // Component-specific animations
  button: {
    duration: 150,
    easing: 'easeOut',
    scale: 0.96,      // Apple press feedback
  },

  card: {
    duration: 200,
    easing: 'easeOut',
    scale: 1.02,      // Apple selection feedback
  },

  modal: {
    duration: 300,
    easing: 'easeOut',
  },

  toggle: {
    duration: 200,
    easing: 'easeInOut',
  },

  // Micro-interactions
  haptic: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
    success: 'success',
    warning: 'warning',
    error: 'error',
  },
}
```

## 🚀 IMPLEMENTATION CHECKLIST

### Design Token Migration Checklist

- [ ] **Border Radius Updates**
  - [ ] Update theme.ts with new Apple radius tokens
  - [ ] Replace all component borderRadius values
  - [ ] Test visual consistency across all screens

- [ ] **Color System Migration**
  - [ ] Implement Apple dark theme colors
  - [ ] Update all background colors to Apple standards
  - [ ] Update text colors for dark theme readability
  - [ ] Test color contrast compliance

- [ ] **Spacing System Enhancement**
  - [ ] Implement generous Apple spacing tokens
  - [ ] Update all component padding and margins
  - [ ] Ensure 44pt touch target compliance
  - [ ] Test spacing consistency across screens

- [ ] **Shadow System Implementation**
  - [ ] Implement Apple shadow hierarchy
  - [ ] Apply appropriate shadows to all cards and surfaces
  - [ ] Test shadow consistency and performance

- [ ] **Typography System Upgrade**
  - [ ] Implement Apple typography hierarchy
  - [ ] Update all text components with Apple tokens
  - [ ] Test typography readability and hierarchy

- [ ] **Animation System Setup**
  - [ ] Implement Apple timing and easing standards
  - [ ] Add Apple-style micro-interactions
  - [ ] Test animation performance and smoothness

---

**Next Step**: Proceed to `progress-tracking.md` for real-time implementation monitoring system.