# Table Management - Wireframes & Design Specifications

## Screen Layout Architecture

### 1. Main Table Management Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Header Bar] Restaurant Name | Time | User | Notifications | Settings        │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Sidebar]    │ [Table Grid Area]              │ [Order Panel]                │
│              │                                │                              │
│ Categories:  │ ┌─────┬─────┬─────┬─────┬─────┐ │ KOT #1234                   │
│ ▼ BEVERAGES  │ │ T1  │ T2  │ T3  │ T4  │ T5  │ │ ┌─────────────────────────┐ │
│ ▼ CHINESE    │ │ ●   │ ○   │ ●   │ ○   │ ●   │ │ │ Customer: John Doe      │ │
│ ▼ NON VEG    │ └─────┴─────┴─────┴─────┴─────┘ │ │ Waiter: Alice Smith     │ │
│ ▼ SPECIAL    │ ┌─────┬─────┬─────┬─────┬─────┐ │ └─────────────────────────┘ │
│ ▼ VEG        │ │ T6  │ T7  │ T8  │ T9  │ T10 │ │                              │
│              │ │ ○   │ ●   │ ○   │ ●   │ ○   │ │ [Order Items List]          │
│ [Search]     │ └─────┴─────┴─────┴─────┴─────┘ │ Item 1    Qty  Price        │
│              │ ┌─────┬─────┬─────┬─────┬─────┐ │ Item 2    Qty  Price        │
│              │ │ T11 │ T12 │ T13 │ T14 │ T15 │ │                              │
│              │ │ ●   │ ○   │ ●   │ ○   │ ●   │ │ Total: ₹0                   │
│              │ └─────┴─────┴─────┴─────┴─────┘ │                              │
│              │ ┌─────┬─────┬─────┬─────┬─────┐ │ [Print] [Save] [Pay]        │
│              │ │ T16 │ T17 │ T18 │ T19 │ T20 │ │                              │
│              │ │ ○   │ ●   │ ○   │ ●   │ ○   │ │                              │
│              │ └─────┴─────┴─────┴─────┴─────┘ │                              │
│              │ ┌─────┬─────┬─────┬─────┬─────┐ │                              │
│              │ │ T21 │ T22 │ T23 │ T24 │ T25 │ │                              │
│              │ │ ●   │ ○   │ ●   │ ○   │ ●   │ │                              │
│              │ └─────┴─────┴─────┴─────┴─────┘ │                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Bottom Actions] Add Table | Add Item | Add Customer | Change Table | Refresh │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Menu Item Selection Overlay

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Modal Header] Select Items - Category: VEG                     [X] Close   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Search Bar] Search by code or name...                      [Filter] [Sort] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┐   │
│ │ [Image]     │ [Image]     │ [Image]     │ [Image]     │ [Image]         │   │
│ │ Paneer      │ Dal Makhani │ Roti        │ Rice        │ Mixed Veg       │   │
│ │ ₹180        │ ₹160        │ ₹25         │ ₹80         │ ₹140            │   │
│ │ [+] ADD     │ [+] ADD     │ [+] ADD     │ [+] ADD     │ [+] ADD         │   │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘   │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┐   │
│ │ [Image]     │ [Image]     │ [Image]     │ [Image]     │ [Image]         │   │
│ │ Paneer Butter│ Chole       │ Naan        │ Jeera Rice  │ Palak Paneer    │   │
│ │ ₹220        │ ₹140        │ ₹35         │ ₹90         │ ₹200            │   │
│ │ [+] ADD     │ [+] ADD     │ [+] ADD     │ [+] ADD     │ [+] ADD         │   │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Design Specifications

### Color Scheme & Status Indicators

#### Table Status Colors
- **Available (Green)**: `colors.success[500]` - #4CAF50
- **Occupied (Red)**: `colors.error[500]` - #F44336  
- **Reserved (Orange)**: `colors.warning[500]` - #FFC107
- **Cleaning (Blue)**: `colors.primary[500]` - #2196F3
- **Out of Order (Gray)**: `colors.neutral[500]` - #9E9E9E

#### Interactive States
- **Hover**: 15% opacity overlay of status color
- **Selected**: Glassmorphism effect with status color border
- **Pressed**: 20% opacity overlay with 0.95 scale

### Typography Specifications

#### Component Text Styles
- **Table Numbers**: `typography.titleMedium` (18px, semibold)
- **Category Headers**: `typography.titleLarge` (22px, medium)
- **Menu Item Names**: `typography.bodyLarge` (16px, regular)
- **Menu Item Prices**: `typography.labelLarge` (14px, medium)
- **Order Total**: `typography.headlineSmall` (24px, regular)
- **Action Buttons**: `typography.buttonMedium` (16px, semibold)

### Spacing & Layout

#### Grid System
- **Table Grid**: 5x5 responsive grid with `spacing.md` (12px) gaps
- **Menu Item Grid**: 3-5 columns based on screen size
- **Sidebar Width**: 240px on tablets, collapsible on phones
- **Order Panel Width**: 320px on tablets, full-screen modal on phones

#### Component Spacing
- **Table Cards**: `spacing.sm` (8px) padding, `borderRadius.lg` (12px)
- **Menu Items**: `spacing.md` (12px) padding, `borderRadius.md` (8px)
- **Action Buttons**: `componentSpacing.buttonLarge` 
- **Modal Spacing**: `spacing.xl` (20px) padding

### Animation Specifications

#### Transition Timing
- **Table Selection**: 200ms ease-out
- **Modal Open/Close**: 300ms ease-in-out
- **List Animations**: 150ms ease-out with 50ms stagger
- **Status Changes**: 250ms ease-in-out

#### Micro-interactions
- **Button Press**: Scale down to 0.95 for 100ms
- **Card Hover**: Lift shadow with 200ms transition
- **Loading States**: Skeleton shimmer with 1.5s loop

### Responsive Design Breakpoints

#### Mobile (< 768px)
- Single column layout
- Collapsible sidebar
- Full-screen modals
- Touch-optimized spacing

#### Tablet (768px - 1024px)
- Dual-pane layout
- Sidebar visible
- Modal overlays
- Optimized for landscape

#### Desktop (> 1024px)
- Three-pane layout
- Enhanced hover states
- Keyboard shortcuts
- Multi-selection support

### Accessibility Features

#### Touch Targets
- **Minimum Size**: 48px x 48px (Android standard)
- **Comfortable Size**: 56px x 56px for primary actions
- **Table Cards**: 72px minimum for easy selection

#### Visual Accessibility
- **Color Contrast**: Minimum 4.5:1 for all text
- **Status Indicators**: Icons + colors for colorblind support
- **Focus Indicators**: 2px solid outline with high contrast
- **Text Scaling**: Support up to 200% zoom

#### Screen Reader Support
- **Semantic Structure**: Proper heading hierarchy
- **Live Regions**: Status updates announced
- **Action Labels**: Clear, descriptive button labels
- **State Descriptions**: Table status clearly announced

## Component Architecture

### Main Screen Components
1. **TableManagementScreen** (Main container)
2. **TableGrid** (Table layout display)
3. **TableCard** (Individual table component)
4. **MenuSidebar** (Category navigation)
5. **OrderPanel** (KOT management)
6. **ActionBar** (Bottom actions)

### Modal/Overlay Components
1. **MenuItemModal** (Item selection)
2. **CustomerModal** (Customer selection/creation)
3. **TableStatusModal** (Status management)
4. **OrderDetailsModal** (Order modifications)

### Interactive States
- Loading (skeleton screens)
- Empty states (no tables, no orders)
- Error states (connection issues)
- Offline mode indicators