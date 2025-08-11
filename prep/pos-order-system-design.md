# POS Order System UI Design & Wireframes

## Executive Summary

This document provides comprehensive UI design specifications for transforming the existing table management system into a full-featured POS order interface, based on SkyTab POS reference design and modern UX principles.

## Current State Analysis

### Existing Implementation Strengths
- ✅ Responsive three-panel layout (sidebar, main, order panel)
- ✅ Proper tablet/mobile responsive behavior
- ✅ Clean Material Design 3 theming system
- ✅ Service layer architecture with TableService and MenuService
- ✅ Context-based state management with TableProvider
- ✅ Performance optimizations (FlatList, memoization)

### Key Components to Transform
- **TableManagementScreen** → **POSOrderScreen**
- **TableGrid** → **MenuItemGrid** 
- **OrderPanel** → **OrderCartPanel**
- **Sidebar Categories** → **MenuCategoryNavigation**

## Design System Foundation

### Layout Dimensions
```typescript
// Tablet Layout (>=768px width)
const TABLET_LAYOUT = {
  categoryPanel: { width: 240, minWidth: 200, maxWidth: 280 },
  menuArea: { flex: 1, minWidth: 400 },
  orderPanel: { width: 320, minWidth: 280, maxWidth: 360 },
  header: { height: 64 },
  actionBar: { height: 72 }
};

// Mobile Layout (<768px width)  
const MOBILE_LAYOUT = {
  header: { height: 56 },
  actionBar: { height: 64 },
  categoryTabs: { height: 48 },
  fullScreen: true // Single panel with navigation
};
```

### Color Scheme Enhancement
```typescript
// POS-specific colors extending existing theme
const POSColors = {
  // Order states
  orderActive: '#2196F3',      // Blue - current order
  orderPending: '#FF9800',     // Orange - pending orders  
  orderReady: '#4CAF50',       // Green - ready to serve
  orderServed: '#9E9E9E',      // Gray - completed
  
  // Table states  
  tableAvailable: '#E8F5E8',   // Light green
  tableOccupied: '#FFF3E0',    // Light orange
  tableReserved: '#E3F2FD',    // Light blue
  tableNeedsCleaning: '#FFEBEE', // Light red
  
  // Menu categories
  categoryActive: '#2196F3',
  categoryInactive: '#F5F5F5',
  
  // Action buttons
  addToOrder: '#4CAF50',
  removeFromOrder: '#F44336',
  modifyOrder: '#FF9800',
  printOrder: '#9C27B0',
  paymentReady: '#4CAF50',
};
```

## Wireframe Specifications

### 1. Main POS Order Screen Layout

#### Tablet Layout (Landscape)
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: Table #5 | Order #26018 | Staff: John | [Logout]         │ 64px
├──────────────────────────────────────────────────────────────────┤
│ [Category] │              Menu Items Grid              │ Order   │
│            │                                          │ Panel   │
│ APPETIZERS │ [Pizza]  [Burger]  [Pasta]  [Salad]     │         │
│ CHICKEN    │                                          │ Item 1  │
│ DRINKS     │ [Soup]   [Fries]   [Wings]  [Tacos]     │ Item 2  │
│ SEAFOOD    │                                          │ Item 3  │
│ DESSERTS   │ [Fish]   [Shrimp]  [Crab]   [Lobster]   │         │
│            │                                          │ Total:  │
│            │ [Search: "chicken wings..."]              │ $96.05  │
│     240px  │                    400px+                │  320px  │
├──────────────────────────────────────────────────────────────────┤
│ [SAVE] [PAYMENT] [SPLIT] [DISCOUNT] [PRINT] [VOID] [MORE]       │ 72px
└──────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (Portrait)
```
┌────────────────────────┐
│ Table #5 | Order #26018│ 56px
├────────────────────────┤
│ [≡] Categories    [🛒5]│ 48px
├────────────────────────┤
│                        │
│    Menu Items Grid     │
│                        │
│ [Pizza]     [Burger]   │
│                        │
│ [Pasta]     [Salad]    │
│                        │
│ [Soup]      [Fries]    │
│                        │
│                        │
├────────────────────────┤
│ [ORDER] [PAY] [MORE]   │ 64px
└────────────────────────┘
```

### 2. Menu Item Grid Component

#### Desktop Menu Item Card (120x100px)
```
┌──────────────────────┐
│     [Image]          │ 60px
│   "Chicken Wings"    │ 
│      $12.99          │ 
│ [Quick +] [Details]  │ 40px
└──────────────────────┘
```

#### Mobile Menu Item Card (160x120px)
```
┌─────────────────────────────┐
│          [Image]            │ 80px
│      "Chicken Wings"        │ 
│         $12.99              │ 
│    [+] Quantity [-]         │ 40px  
└─────────────────────────────┘
```

### 3. Order Cart Panel (320px width)

```
┌────────────────────────────┐
│ Order #26018               │
│ Table: 5 | Guests: 4       │
├────────────────────────────┤
│ Chicken Wings        x2    │
│ $12.99 each         $25.98 │
│ [🗑️] [✏️] [Special Note]   │
├────────────────────────────┤
│ Caesar Salad         x1    │  
│ $8.50 each          $8.50  │
│ [🗑️] [✏️] [No Croutons]    │
├────────────────────────────┤
│ Coca Cola           x3     │
│ $2.99 each          $8.97  │
│ [🗑️] [✏️]                 │
├────────────────────────────┤
│                            │
│ Subtotal:          $43.45  │
│ Tax:               $3.48   │
│ ─────────────────────────  │
│ Total:             $46.93  │
├────────────────────────────┤
│ [SAVE ORDER]               │
│ [SEND TO KITCHEN]          │
│ [PAYMENT]                  │
└────────────────────────────┘
```

### 4. Category Navigation Panel (240px width)

```
┌─────────────────────┐
│ MENU CATEGORIES     │
├─────────────────────┤
│ ● APPETIZERS    (8) │ Active
│   CHICKEN      (12) │
│   SEAFOOD       (6) │  
│   VEGETARIAN    (9) │
│   BEVERAGES    (15) │
│   DESSERTS      (5) │
├─────────────────────┤
│ QUICK ACTIONS       │
├─────────────────────┤
│ 🔍 Search Menu      │
│ ⭐ Popular Items    │
│ 🕒 Recent Orders    │
│ 💰 Price Ranges     │
└─────────────────────┘
```

## Screen Flow Architecture

### Navigation Flow
```
Table Selection → Order Taking → Item Selection → Cart Review → Payment
       ↓              ↓            ↓             ↓          ↓
Table Management → POS Screen → Menu Item → Order Cart → Payment Screen
  (existing)      (new main)   (selection)   (review)    (existing)
```

### State Transitions
```typescript
enum POSScreenMode {
  TABLE_SELECTION = 'table_selection',  // Current table management view
  ORDER_TAKING = 'order_taking',        // Main POS interface 
  ITEM_SELECTION = 'item_selection',    // Menu item details/modifiers
  ORDER_REVIEW = 'order_review',        // Cart review and modifications
  PAYMENT_FLOW = 'payment_flow'         // Payment processing
}
```

## Component Architecture

### 1. POSOrderScreen (Main Container)
```typescript
interface POSOrderScreenProps {
  initialMode?: POSScreenMode;
  selectedTable?: Table;
}

// Responsibilities:
// - Layout orchestration (3-panel vs single panel)
// - Screen mode management  
// - Global keyboard shortcuts
// - Auto-save order state
// - Real-time updates
```

### 2. MenuCategoryPanel
```typescript  
interface MenuCategoryPanelProps {
  categories: MenuCategory[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
  showQuickActions?: boolean;
}

// Features:
// - Category filtering with item counts
// - Search functionality
// - Popular items quick access
// - Recent orders history
```

### 3. MenuItemGrid  
```typescript
interface MenuItemGridProps {
  items: MenuItem[];
  selectedCategoryId?: string;
  onItemAdd: (item: MenuItem, quantity?: number) => void;
  onItemDetails: (item: MenuItem) => void;
  searchQuery?: string;
  layout: 'grid' | 'list';
}

// Features:  
// - Infinite scroll with virtualization
// - Quick add vs detailed add
// - Image lazy loading
// - Dietary indicators
// - Price formatting
```

### 4. OrderCartPanel
```typescript
interface OrderCartPanelProps {
  order: Order;
  onItemModify: (itemId: string, changes: Partial<OrderItem>) => void;
  onItemRemove: (itemId: string) => void; 
  onOrderAction: (action: OrderAction) => void;
  showPriceBreakdown?: boolean;
}

// Features:
// - Real-time calculation
// - Item modifications
// - Special instructions
// - Split bill functionality
// - Tax and discount handling
```

## Responsive Behavior Specifications

### Breakpoint Strategy
```typescript
const Breakpoints = {
  mobile: { max: 767 },      // Single panel, overlay navigation
  tablet: { min: 768, max: 1023 }, // Two panel (menu + order)
  desktop: { min: 1024 }     // Three panel (categories + menu + order)
};
```

### Mobile Adaptations
1. **Bottom Sheet Navigation**: Category selection via bottom sheet
2. **Floating Action Button**: Quick access to cart
3. **Swipe Gestures**: Swipe between categories
4. **Pull-to-Refresh**: Refresh menu items
5. **Haptic Feedback**: Touch feedback for interactions

### Tablet Optimizations
1. **Split View**: Menu items in main area, order panel always visible
2. **Drag and Drop**: Drag items directly to order panel
3. **Keyboard Shortcuts**: Support for external keyboards
4. **Multi-touch**: Pinch to zoom on item images

## Interaction Patterns

### Menu Item Selection
1. **Single Tap**: Add default quantity (1) with default options
2. **Long Press**: Show quick modifier options (size, extras)
3. **Double Tap**: Open detailed customization modal
4. **Swipe Up**: Add to favorites/recent items

### Order Management
1. **Tap Item**: Edit quantity and modifiers
2. **Swipe Left**: Quick remove item
3. **Swipe Right**: Duplicate item with modifications
4. **Long Press**: Show context menu (move, split, void)

### Category Navigation  
1. **Tap Category**: Switch to category items
2. **Long Press**: Show category details and filters
3. **Pull Down**: Refresh category items
4. **Search**: Live search across all categories

## Performance Requirements

### Render Performance
- Menu item grid: <16ms render time for 50 items
- Order calculations: <2ms for cart updates
- Category switching: <100ms transition time
- Search results: <200ms response time

### Memory Management  
- Menu images: Lazy loading with 50 item preload buffer
- Order history: Maintain last 10 orders in memory
- Menu data: Cache categories and popular items
- Auto cleanup: Clear unused image cache every 10 minutes

## Implementation Priority

### Phase 1: Core POS Interface (Week 1)
1. ✅ Transform TableManagementScreen to POSOrderScreen
2. ✅ Create MenuItemGrid component
3. ✅ Enhance OrderCartPanel with full functionality
4. ✅ Add responsive layout switching logic
5. ✅ Implement basic menu item selection flow

### Phase 2: Enhanced Features (Week 2)  
1. ⏳ Add item modifiers and special instructions
2. ⏳ Implement search and filtering
3. ⏳ Add order splitting and voiding
4. ⏳ Create item detail modals
5. ⏳ Add keyboard shortcuts for efficiency

### Phase 3: Advanced UX (Week 3)
1. ⏳ Implement drag-and-drop functionality
2. ⏳ Add haptic feedback and animations
3. ⏳ Create order history and favorites
4. ⏳ Add multi-language support
5. ⏳ Implement offline mode capabilities

## Integration Points

### Existing Services
- **TableService**: Table selection and status management
- **MenuService**: Menu categories and items
- **OrderService**: Order creation and management (to be enhanced)
- **AuthService**: User permissions and role-based features

### New Services Required
- **OrderItemService**: Individual order item management
- **ModifierService**: Menu item customizations
- **PrintService**: Receipt and kitchen order printing
- **PaymentIntegrationService**: Bridge to VP3350 payment app

## Success Metrics

### User Experience
- Order completion time: <2 minutes for 5 items
- Error rate: <1% for menu item selection
- Staff training time: <30 minutes for new users
- Customer satisfaction: >95% order accuracy

### Technical Performance
- App startup time: <3 seconds
- Menu load time: <1 second
- Order sync time: <500ms
- Memory usage: <150MB peak

This design specification provides the foundation for implementing a modern, efficient POS order system that maintains your existing architecture while significantly enhancing the user experience for restaurant staff.