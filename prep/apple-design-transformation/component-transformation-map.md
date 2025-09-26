# Component Transformation Map

## 🗺️ COMPREHENSIVE COMPONENT-BY-COMPONENT MAPPING

Detailed implementation specifications for transforming each POS component to Apple's macOS design language.

## 🏗️ COMPONENT ARCHITECTURE MAPPING

### 1. SETTINGS SYSTEM TRANSFORMATION

#### SettingsScreen.tsx → Apple Settings Style

**Current File**: `src/screens/settings/SettingsScreen.tsx`

**Transformation Specifications**:

```typescript
// CURRENT → APPLE TRANSFORMATION

// Container System
container: {
  backgroundColor: theme.colors.background,     // #F2F2F7 → #000000
  // All other properties remain the same
}

// Left Panel (Sidebar)
leftPanel: {
  width: 280,                                   // ✅ KEEP
  backgroundColor: theme.colors.surface,        // #FFFFFF → #1C1C1E
  borderRadius: 16,                            // 16px → 24px
  padding: 20,                                 // ✅ KEEP
  borderWidth: 1,                              // REMOVE
  borderColor: theme.colors.outline,           // REMOVE
  height: 460,                                 // Make flexible → 'auto'
}

// Category Items
categoryItem: {
  paddingHorizontal: 15,                       // 15px → 18px
  paddingVertical: 12,                         // ✅ KEEP
  borderRadius: 12,                            // 12px → 18px
  marginBottom: 6,                             // ✅ KEEP
  backgroundColor: theme.colors.surfaceVariant, // Light → transparent
  borderWidth: 1,                              // REMOVE
  borderColor: theme.colors.outline,           // REMOVE
}

// Active Category Item
categoryItemActive: {
  backgroundColor: theme.colors.primary,        // #007AFF → #2C2C2E
  borderColor: theme.colors.primary,           // REMOVE
}

// Right Panel
rightPanel: {
  backgroundColor: theme.colors.surface,        // #FFFFFF → #1C1C1E
  borderRadius: 16,                            // 16px → 24px
  borderWidth: 1,                              // REMOVE
  borderColor: theme.colors.outline,           // REMOVE
}
```

**New Apple-Style Properties**:
```typescript
// Add these new styles for Apple compliance
appleSidebar: {
  backgroundColor: '#1C1C1E',
  borderRadius: 24,
  padding: 20,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
}

appleCategoryItem: {
  paddingHorizontal: 18,
  paddingVertical: 12,
  borderRadius: 18,
  marginBottom: 6,
  backgroundColor: 'transparent',
}

appleCategoryItemActive: {
  backgroundColor: '#2C2C2E',
}

appleContentPanel: {
  backgroundColor: '#1C1C1E',
  borderRadius: 24,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
}
```

#### Settings Component Files

**Files to Transform**:
- `RestaurantProfileSettings.tsx`
- `UserManagementSettings.tsx`
- `DeviceHardwareSettings.tsx`
- `PaymentConfigurationSettings.tsx`
- `IntegrationsSettings.tsx`
- `SecurityBackupSettings.tsx`
- `SystemLogsSettings.tsx`
- `HelpSupportSettings.tsx`

**Universal Settings Panel Transformation**:
```typescript
// Settings Panel Container
settingsPanel: {
  backgroundColor: 'transparent',               // Panel blends with parent
  padding: 24,                                 // 20px → 24px (more generous)
}

// Settings Section
settingsSection: {
  marginBottom: 32,                            // 24px → 32px (Apple spacing)
  backgroundColor: '#2C2C2E',                  // Apple secondary surface
  borderRadius: 20,                            // Apple card radius
  padding: 20,                                 // Generous internal padding
}

// Settings Row
settingsRow: {
  paddingVertical: 16,                         // 12px → 16px
  paddingHorizontal: 20,                       // More generous
  borderRadius: 16,                            // Apple row radius
  marginBottom: 8,                             // Proper spacing
}

// Toggle Switches (Custom Apple-style needed)
appleToggle: {
  width: 52,
  height: 32,
  borderRadius: 16,                            // Perfect pill shape
  backgroundColor: '#39393D',                  // Apple inactive color
  padding: 2,
}

appleToggleActive: {
  backgroundColor: '#007AFF',                  // Apple blue
}

appleToggleThumb: {
  width: 28,
  height: 28,
  borderRadius: 14,                            // Perfect circle
  backgroundColor: '#FFFFFF',
}
```

### 2. DASHBOARD SYSTEM TRANSFORMATION

#### DashboardScreen.tsx → Apple Dashboard Style

**Current File**: `src/screens/dashboard/DashboardScreen.tsx`

**Transformation Specifications**:

```typescript
// Main Container
container: {
  backgroundColor: ProfessionalTheme.colors.background, // #F2F2F7 → #000000
  // All other properties remain
}

// Dashboard Content
dashboardContent: {
  padding: 24,                                 // 20px → 24px (Apple generous)
  backgroundColor: '#000000',                  // Apple black background
}
```

#### Dashboard Component Files

**KPICard.tsx → Apple KPI Card**
```typescript
// Current card container transformation
cardContainer: {
  backgroundColor: theme.colors.surface,        // #FFFFFF → #1C1C1E
  borderRadius: 16,                            // 16px → 22px
  padding: 20,                                 // 20px → 24px
  marginBottom: 16,                            // 16px → 20px
  shadowColor: theme.colors.shadow,            // → '#000000'
  shadowOffset: { width: 0, height: 2 },      // → { width: 0, height: 4 }
  shadowOpacity: 0.1,                          // → 0.18
  shadowRadius: 4,                             // → 8
  elevation: 3,                                // → 8
}

// New Apple-style KPI card
appleKPICard: {
  backgroundColor: '#1C1C1E',
  borderRadius: 22,
  padding: 24,
  marginBottom: 20,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 8,
}

// KPI Value Text
kpiValue: {
  fontSize: 32,                                // Larger, more prominent
  fontWeight: '700',                           // Apple bold weight
  color: '#FFFFFF',                            // White on dark
  letterSpacing: -0.5,                         // Apple letter spacing
}

// KPI Label Text
kpiLabel: {
  fontSize: 14,                                // Apple secondary text size
  fontWeight: '500',                           // Apple medium weight
  color: '#EBEBF599',                          // Apple secondary text (60% opacity)
  textTransform: 'uppercase',                  // Apple-style labels
  letterSpacing: 0.5,                          // Apple tracking
}
```

**QuickActionButton.tsx → Apple Action Button**
```typescript
// Quick action button transformation
actionButton: {
  backgroundColor: '#2C2C2E',                  // Apple secondary surface
  borderRadius: 22,                            // Apple generous rounding
  paddingHorizontal: 24,                       // 20px → 24px
  paddingVertical: 16,                         // 12px → 16px
  marginHorizontal: 8,                         // 6px → 8px
  minHeight: 44,                               // Apple HIG minimum
  alignItems: 'center',
  justifyContent: 'center',
}

actionButtonPressed: {
  backgroundColor: '#48484A',                  // Apple pressed state
  transform: [{ scale: 0.96 }],               // Apple-style press feedback
}

// Action button text
actionButtonText: {
  fontSize: 16,                                // Apple button text size
  fontWeight: '600',                           // Apple semibold
  color: '#FFFFFF',                            // White text
  textAlign: 'center',
}

// Action button icon container
actionButtonIcon: {
  marginBottom: 8,                             // Space between icon and text
  width: 24,
  height: 24,
  borderRadius: 8,                             // Subtle rounding for icons
}
```

**ChartsSection.tsx → Apple Charts**
```typescript
// Chart container
chartContainer: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderRadius: 22,                            // Apple generous rounding
  padding: 24,                                 // Generous padding
  marginBottom: 20,                            // Apple spacing
}

// Chart title
chartTitle: {
  fontSize: 18,                                // Apple headline size
  fontWeight: '600',                           // Apple semibold
  color: '#FFFFFF',                            // White text
  marginBottom: 16,                            // Proper spacing
  letterSpacing: -0.2,                         // Apple letter spacing
}

// Chart elements (would need library-specific styling)
chartElements: {
  borderRadius: 8,                             // Rounded chart elements
  // Library-specific implementations for Victory, Recharts, etc.
}
```

### 3. TABLE MANAGEMENT TRANSFORMATION

#### TableManagementScreen.tsx → Apple Table Grid

**Current File**: `src/screens/tables/TableManagementScreen.tsx`

**Transformation Specifications**:

```typescript
// Table grid container
tableGrid: {
  backgroundColor: '#000000',                  // Apple black background
  padding: 24,                                 // Generous Apple padding
}

// Table card transformation
tableCard: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderRadius: 20,                            // Apple generous rounding
  padding: 20,                                 // Generous internal padding
  margin: 12,                                  // Apple spacing between cards
  minHeight: 120,                              // Adequate touch target
  minWidth: 140,                               // Proper aspect ratio
  shadowColor: '#000000',                      // Apple shadows
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.16,
  shadowRadius: 6,
  elevation: 6,
}

// Table card active state
tableCardActive: {
  backgroundColor: '#2C2C2E',                  // Apple selected state
  shadowOpacity: 0.22,                         // Enhanced shadow when selected
  transform: [{ scale: 1.02 }],               // Subtle scale feedback
}

// Table card pressed state
tableCardPressed: {
  backgroundColor: '#3A3A3C',                  // Apple pressed state
  transform: [{ scale: 0.98 }],               // Apple press feedback
}
```

**Table Status Indicators**:
```typescript
// Status pill (Apple-style)
statusPill: {
  borderRadius: 12,                            // Perfect pill shape
  paddingHorizontal: 12,
  paddingVertical: 6,
  alignSelf: 'flex-start',
  marginTop: 8,
}

// Status colors (Apple palette)
statusAvailable: {
  backgroundColor: '#32D74B',                  // Apple green
}

statusOccupied: {
  backgroundColor: '#FF453A',                  // Apple red
}

statusReserved: {
  backgroundColor: '#FF9F0A',                  // Apple orange
}

statusCleaning: {
  backgroundColor: '#BF5AF2',                  // Apple purple
}

// Status text
statusText: {
  fontSize: 12,
  fontWeight: '600',                           // Apple semibold
  color: '#FFFFFF',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
```

### 4. ORDER MANAGEMENT TRANSFORMATION

#### OrderManagementScreen.tsx → Apple Order Interface

**Transformation Specifications**:

```typescript
// Order card container
orderCard: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderRadius: 20,                            // Apple generous rounding
  padding: 20,                                 // Generous padding
  marginBottom: 16,                            // Apple spacing
  shadowColor: '#000000',                      // Apple shadows
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.16,
  shadowRadius: 6,
  elevation: 6,
}

// Order status pill
orderStatusPill: {
  borderRadius: 14,                            // Perfect pill
  paddingHorizontal: 14,
  paddingVertical: 8,
  alignSelf: 'flex-start',
}

// Order status colors (Apple palette)
statusDraft: {
  backgroundColor: '#8E8E93',                  // Apple gray
}

statusSubmitted: {
  backgroundColor: '#007AFF',                  // Apple blue
}

statusPreparing: {
  backgroundColor: '#FF9F0A',                  // Apple orange
}

statusReady: {
  backgroundColor: '#32D74B',                  // Apple green
}

statusServed: {
  backgroundColor: '#EBEBF5',                  // Apple light gray
}

// Order action buttons
orderActionButton: {
  backgroundColor: '#2C2C2E',                  // Apple secondary surface
  borderRadius: 20,                            // Apple button rounding
  paddingHorizontal: 20,
  paddingVertical: 12,
  marginHorizontal: 6,
  minHeight: 44,                               // Apple HIG minimum
}

orderActionButtonPrimary: {
  backgroundColor: '#007AFF',                  // Apple blue for primary actions
}

orderActionButtonDestructive: {
  backgroundColor: '#FF453A',                  // Apple red for destructive actions
}
```

### 5. PAYMENT INTERFACE TRANSFORMATION

#### PaymentProcessingScreen.tsx → Apple Payment Style

**Transformation Specifications**:

```typescript
// Payment container
paymentContainer: {
  backgroundColor: '#000000',                  // Apple black background
  padding: 24,                                 // Generous padding
}

// Payment method card
paymentMethodCard: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderRadius: 22,                            // Apple generous rounding
  padding: 24,                                 // Generous internal padding
  marginBottom: 20,                            // Apple spacing
  shadowColor: '#000000',                      // Apple shadows
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 8,
}

// Payment method button
paymentMethodButton: {
  backgroundColor: '#2C2C2E',                  // Apple secondary surface
  borderRadius: 20,                            // Apple button rounding
  paddingVertical: 16,                         // Generous vertical padding
  paddingHorizontal: 24,                       // Generous horizontal padding
  marginBottom: 12,                            // Proper spacing
  minHeight: 60,                               // Larger touch target for payment
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

paymentMethodButtonActive: {
  backgroundColor: '#007AFF',                  // Apple blue for selected payment method
}

// Payment amount display
paymentAmount: {
  fontSize: 48,                                // Large, prominent amount
  fontWeight: '700',                           // Apple bold
  color: '#FFFFFF',                            // White text
  textAlign: 'center',
  letterSpacing: -1.0,                         // Apple large text spacing
  marginBottom: 24,
}

// Payment confirm button
paymentConfirmButton: {
  backgroundColor: '#32D74B',                  // Apple green for success action
  borderRadius: 24,                            // Extra rounded for important action
  paddingVertical: 18,                         // Extra generous padding
  paddingHorizontal: 32,
  minHeight: 56,                               // Larger for important action
  shadowColor: '#32D74B',                      // Colored shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}
```

### 6. MENU MANAGEMENT TRANSFORMATION

#### MenuManagementScreen.tsx → Apple Menu Interface

**Transformation Specifications**:

```typescript
// Menu category card
menuCategoryCard: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderRadius: 20,                            // Apple generous rounding
  padding: 20,                                 // Generous padding
  marginHorizontal: 8,                         // Horizontal spacing
  marginBottom: 16,                            // Vertical spacing
  minHeight: 100,                              // Adequate touch target
  shadowColor: '#000000',                      // Apple shadows
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.16,
  shadowRadius: 6,
  elevation: 6,
}

// Menu item card
menuItemCard: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderRadius: 18,                            // Slightly smaller radius for items
  padding: 18,                                 // Proportional padding
  marginBottom: 12,                            // Proper spacing
  shadowColor: '#000000',                      // Apple shadows
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 4,
  elevation: 4,
}

// Search bar
menuSearchBar: {
  backgroundColor: '#2C2C2E',                  // Apple secondary surface
  borderRadius: 16,                            // Apple search bar rounding
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginBottom: 20,                            // Proper spacing
  fontSize: 16,
  color: '#FFFFFF',
}

// Filter button
menuFilterButton: {
  backgroundColor: '#2C2C2E',                  // Apple secondary surface
  borderRadius: 16,                            // Pill-like shape
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginRight: 8,
  marginBottom: 8,
}

menuFilterButtonActive: {
  backgroundColor: '#007AFF',                  // Apple blue for active filter
}
```

## 🔧 UNIVERSAL COMPONENT PATTERNS

### Apple-Style Form Elements

```typescript
// Text Input (Apple style)
appleTextInput: {
  backgroundColor: '#2C2C2E',                  // Apple input background
  borderRadius: 16,                            // Apple input rounding
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  color: '#FFFFFF',
  marginBottom: 16,
  minHeight: 44,                               // Apple HIG minimum
}

appleTextInputFocused: {
  backgroundColor: '#3A3A3C',                  // Slightly lighter when focused
  shadowColor: '#007AFF',                      // Blue focus ring
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 4,
}

// Apple-style section header
appleSectionHeader: {
  fontSize: 18,                                // Apple headline size
  fontWeight: '600',                           // Apple semibold
  color: '#FFFFFF',                            // White text
  marginTop: 32,                               // Generous top spacing
  marginBottom: 16,                            // Proper bottom spacing
  letterSpacing: -0.2,                         // Apple letter spacing
  textTransform: 'none',                       // No transform for headers
}

// Apple-style section content
appleSectionContent: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderRadius: 20,                            // Apple generous rounding
  padding: 20,                                 // Generous padding
  marginBottom: 24,                            // Section spacing
}
```

### Apple-Style Navigation Elements

```typescript
// Tab bar (if using bottom tabs)
appleTabBar: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderTopWidth: 0,                           // Remove default border
  paddingBottom: 8,                            // Account for safe area
  paddingTop: 8,
  shadowColor: '#000000',                      // Apple shadow
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 8,
}

// Tab bar item
appleTabBarItem: {
  borderRadius: 12,                            // Rounded tab items
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginHorizontal: 4,
}

appleTabBarItemActive: {
  backgroundColor: '#2C2C2E',                  // Apple selection background
}

// Header (navigation header)
appleHeader: {
  backgroundColor: '#1C1C1E',                  // Apple dark surface
  borderBottomWidth: 0,                        // Remove default border
  shadowColor: '#000000',                      // Apple shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
}
```

## 📱 IMPLEMENTATION PRIORITY MATRIX

### Phase 1: High Impact Components (Days 1-3)
1. **SettingsScreen.tsx** - Most visible transformation
2. **Universal Button System** - Used throughout app
3. **Design Token Updates** - Foundation for all components
4. **Toggle Switch System** - Clear Apple differentiation

### Phase 2: Core User Interface (Days 4-8)
1. **Dashboard Cards** - Main user interface
2. **Table Management** - Core POS workflow
3. **Order Cards** - Primary business function
4. **Payment Interface** - Critical user interactions

### Phase 3: Supporting Components (Days 9-12)
1. **Menu Management** - Product browsing
2. **Form Elements** - User input consistency
3. **Search Bars** - User interaction elements
4. **Navigation Elements** - Overall app consistency

### Phase 4: Polish & Consistency (Days 13-14)
1. **Icon System** - Visual consistency
2. **Modal Dialogs** - Secondary interactions
3. **Charts & Graphs** - Data visualization
4. **Micro-interactions** - Apple-style feedback

## 🎯 SUCCESS VALIDATION

### Component Checklist
- [ ] **Border Radius**: All components use Apple 20-24px standards
- [ ] **Colors**: Dark theme with Apple surface colors
- [ ] **Spacing**: Generous Apple-style padding
- [ ] **Typography**: Apple text hierarchy
- [ ] **Shadows**: Apple shadow system
- [ ] **Interactions**: 44pt touch targets, proper feedback
- [ ] **Animations**: Smooth Apple-style transitions

---

**Next Step**: Proceed to `implementation-timeline.md` for detailed day-by-day implementation schedule.