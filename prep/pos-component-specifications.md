# POS Component Specifications & Wireframes

## Overview

This document provides detailed component specifications for the POS order system transformation. Each component includes wireframes, props interfaces, styling specifications, and interaction patterns.

## 1. POSOrderScreen (Main Container)

### Layout Wireframe
```
Tablet Layout (1024px+ width):
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Table #5 • Order #26018 • Staff: John Doe • [Save] [Settings] [🔄] │ 64px
├──────────┬─────────────────────────────────────────────────┬────────────────┤
│          │                                                 │ Order #26018   │
│ Category │              Menu Item Grid                     │                │
│ Panel    │                                                 │ Table 5        │
│          │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ Guests: 4      │
│ • APPS   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │                │
│   MAINS  │ │ Pizza   │ │ Burger  │ │ Pasta   │ │ Salad   │ │ Items:         │
│   DRINKS │ │ $12.99  │ │ $9.99   │ │ $13.99  │ │ $7.99   │ │ Wings     x2   │
│   DESS   │ │ [+ ADD] │ │ [+ ADD] │ │ [+ ADD] │ │ [+ ADD] │ │ $25.98         │
│          │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │                │
│ 🔍 Search│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ Salad     x1   │
│ ⭐ Popular│ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ $8.50          │
│ 📋 Recent│ │ Soup    │ │ Fries   │ │ Wings   │ │ Tacos   │ │                │
│          │ │ $5.99   │ │ $4.99   │ │ $12.99  │ │ $8.99   │ │ Coke      x3   │
│   240px  │ │ [+ ADD] │ │ [+ ADD] │ │ [+ ADD] │ │ [+ ADD] │ │ $8.97          │
│          │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │                │
│          │                                                 │ ───────────    │
│          │ [🔍 Search menu items...]                       │ Subtotal:      │
│          │                                                 │ $43.45         │
│          │                                   400px+ flex   │ Tax: $3.48     │
│          │                                                 │ Total: $46.93  │
│          │                                                 │                │
│          │                                                 │ [SAVE ORDER]   │
│          │                                                 │ [SEND KITCHEN] │
│          │                                                 │ [PAYMENT] 💳   │
│          │                                                 │     320px      │
├──────────┴─────────────────────────────────────────────────┴────────────────┤
│ [💾 SAVE] [🍴 KITCHEN] [💰 PAYMENT] [✂️ SPLIT] [🎫 DISCOUNT] [🖨️ PRINT] [⚙️]│ 72px
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Portrait)
```
┌─────────────────────────────┐
│ T5 • Order #26018 • [⚙️] [🛒3]│ 56px
├─────────────────────────────┤
│ [≡ APPS] [MAINS] [DRINKS]   │ 48px (Scrollable tabs)
├─────────────────────────────┤
│                             │
│   ┌─────────┐ ┌─────────┐   │
│   │ [IMG]   │ │ [IMG]   │   │
│   │ Pizza   │ │ Burger  │   │
│   │ $12.99  │ │ $9.99   │   │
│   │ [+ ADD] │ │ [+ ADD] │   │
│   └─────────┘ └─────────┘   │
│                             │
│   ┌─────────┐ ┌─────────┐   │
│   │ [IMG]   │ │ [IMG]   │   │
│   │ Pasta   │ │ Salad   │   │
│   │ $13.99  │ │ $7.99   │   │
│   │ [+ ADD] │ │ [+ ADD] │   │
│   └─────────┘ └─────────┘   │
│                             │
│ [🔍 Search menu...]         │
├─────────────────────────────┤
│ [💾 SAVE] [🍴 KITCHEN] [💰] │ 64px
└─────────────────────────────┘
```

### Component Interface
```typescript
interface POSOrderScreenProps {
  initialTable?: Table;
  initialMode?: POSScreenMode;
  onOrderComplete?: (orderId: string) => void;
  onTableChange?: (table: Table) => void;
}

interface POSOrderScreenState {
  currentMode: POSScreenMode;
  selectedTable: Table | null;
  currentOrder: Order | null;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}
```

### Styling Specifications
```typescript
const POSOrderScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: isTablet ? 64 : 56,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabletLayout: {
    flexDirection: 'row',
    flex: 1,
  },
  mobileLayout: {
    flex: 1,
  },
  actionBar: {
    height: isTablet ? 72 : 64,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
};
```

## 2. MenuCategoryPanel

### Wireframe
```
Desktop/Tablet (240px width):
┌─────────────────────────┐
│ MENU CATEGORIES         │
├─────────────────────────┤
│ ● APPETIZERS       (8)  │ ← Active state
│   MAIN COURSES    (15)  │
│   CHICKEN         (12)  │
│   SEAFOOD          (8)  │
│   VEGETARIAN       (9)  │
│   BEVERAGES       (18)  │
│   DESSERTS         (6)  │
├─────────────────────────┤
│ QUICK ACCESS            │
├─────────────────────────┤
│ 🔍 Search Menu          │
│ ⭐ Popular Items   (12) │
│ 🕒 Recent Orders    (5) │
│ 🔥 Today's Special (3)  │
│ 💰 Under $10       (23) │
├─────────────────────────┤
│ FILTERS                 │
├─────────────────────────┤
│ □ Vegetarian            │
│ □ Gluten Free           │  
│ □ Spicy                 │
│ □ Chef's Recommendation │
└─────────────────────────┘
```

### Mobile (Bottom Sheet/Tabs)
```
Mobile Category Tabs (Horizontal scroll):
┌─────────────────────────────────────────────────┐
│ [● APPS] [MAINS] [CHICKEN] [SEAFOOD] [DRINKS] → │ 48px
└─────────────────────────────────────────────────┘

Mobile Category Sheet (When expanded):
┌─────────────────────────────┐
│ ■ Categories                │ Handle
├─────────────────────────────┤
│ ● APPETIZERS           (8)  │
│   MAIN COURSES        (15)  │
│   CHICKEN             (12)  │
│   SEAFOOD              (8)  │
│   BEVERAGES           (18)  │
│   DESSERTS             (6)  │
├─────────────────────────────┤
│ 🔍 Search Menu              │
│ ⭐ Popular • 🔥 Specials     │
└─────────────────────────────┘
```

### Component Interface
```typescript
interface MenuCategoryPanelProps {
  categories: MenuCategory[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
  onQuickActionSelect: (action: QuickAction) => void;
  showItemCounts?: boolean;
  showFilters?: boolean;
  layout: 'sidebar' | 'tabs' | 'bottomSheet';
}

interface MenuCategory {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  color?: string;
  itemCount: number;
  isActive: boolean;
  sortOrder: number;
}

interface QuickAction {
  id: string;
  type: 'search' | 'popular' | 'recent' | 'special' | 'price_filter';
  label: string;
  icon: string;
  count?: number;
  action: () => void;
}
```

### Interaction Patterns
```typescript
const categoryInteractions = {
  // Desktop/Tablet
  onCategoryTap: (categoryId: string) => {
    // Immediate category switch
    setSelectedCategory(categoryId);
    loadMenuItems(categoryId);
  },
  
  onCategoryLongPress: (categoryId: string) => {
    // Show category options (filters, sort, etc.)
    showCategoryOptions(categoryId);
  },

  // Mobile  
  onCategorySwipe: (direction: 'left' | 'right') => {
    // Navigate to next/previous category
    const nextCategory = getAdjacentCategory(selectedCategory, direction);
    setSelectedCategory(nextCategory);
  },
  
  onQuickActionTap: (action: QuickAction) => {
    switch (action.type) {
      case 'search':
        openSearchModal();
        break;
      case 'popular':
        showPopularItems();
        break;
      case 'recent':
        showRecentOrders();
        break;
    }
  },
};
```

## 3. MenuItemGrid

### Item Card Wireframe
```
Desktop Item Card (140x120px):
┌─────────────────────────┐
│      [IMAGE 140x80]     │ 80px image
│ "Buffalo Chicken Wings" │ 
│ ★★★★☆ (4.2) • Spicy 🌶️ │ Ratings & tags
│ $12.99                  │ Price
│ [🔍 Details] [+ ADD]    │ Actions
└─────────────────────────┘ 120px total

Tablet Item Card (160x140px):
┌───────────────────────────┐
│       [IMAGE 160x90]      │ 90px image
│ "Buffalo Chicken Wings"   │ Name
│ Fresh wings tossed in...  │ Description (truncated)
│ ★★★★☆ (4.2) • 🌶️ Spicy   │ Rating & dietary info
│ $12.99                    │ Price  
│ [-] [2] [+] [ADD TO ORDER]│ Quantity & add button
└───────────────────────────┘ 140px total

Mobile Item Card (180x160px):
┌─────────────────────────────┐
│        [IMAGE 180x100]      │ 100px image
│ "Buffalo Chicken Wings"     │ Name
│ Crispy wings tossed in our  │ Description
│ signature buffalo sauce...   │ (2 lines)
│ ★★★★☆ (4.2) • 🌶️ • 🥗 GF   │ Ratings & tags  
│ $12.99                      │ Price
│ [- 0 +] [ADD TO ORDER] 💚   │ Quantity selector
└─────────────────────────────┘ 160px total
```

### Grid Layout Specifications
```typescript
const MenuItemGridLayout = {
  desktop: {
    numColumns: 4,
    itemSize: { width: 140, height: 120 },
    spacing: 16,
    containerPadding: 24,
  },
  tablet: {
    numColumns: 3,
    itemSize: { width: 160, height: 140 },
    spacing: 12,
    containerPadding: 16,
  },
  mobile: {
    numColumns: 2,
    itemSize: { width: 180, height: 160 },
    spacing: 8,
    containerPadding: 16,
  },
};
```

### Component Interface
```typescript
interface MenuItemGridProps {
  items: MenuItem[];
  selectedCategoryId?: string;
  onItemAdd: (item: MenuItem, quantity: number) => void;
  onItemDetails: (item: MenuItem) => void;
  searchQuery?: string;
  layout?: 'grid' | 'list';
  isLoading?: boolean;
  onLoadMore?: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number; // minutes
  rating: number;
  reviewCount: number;
  dietaryInfo: DietaryTag[];
  allergenInfo: AllergenTag[];
  modifierGroups: ModifierGroup[];
  variants: MenuItemVariant[];
}

interface DietaryTag {
  id: string;
  name: string; // 'vegetarian', 'vegan', 'gluten-free', 'spicy', etc.
  icon: string;
  color: string;
}
```

### Loading States
```
Loading Skeleton:
┌─────────────────────────┐
│ ████████████████████    │ Image placeholder
│ ████████████ ████       │ Name placeholder  
│ ██████ ████████ ████    │ Description placeholder
│ ████ ████████           │ Price/rating placeholder
│ [████████] [████████]   │ Button placeholders
└─────────────────────────┘
```

## 4. OrderCartPanel

### Detailed Wireframe
```
Order Panel (320px width):
┌──────────────────────────────┐
│ Order #26018          [⚙️]   │ Header with settings
│ Table: 5 • Guests: 4         │ Table info
│ Started: 2:45 PM             │ Timestamp
├──────────────────────────────┤
│ ORDER ITEMS                  │ Section header
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Buffalo Wings         x2 │ │ Item row
│ │ $12.99 each    = $25.98  │ │ Price calculation
│ │ 🔥 Extra Spicy           │ │ Modifications
│ │ [🗑️] [✏️] [📝 Note]      │ │ Item actions
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Caesar Salad          x1 │ │
│ │ $8.50 each     = $8.50   │ │
│ │ No Croutons, Extra Dress │ │ Custom instructions
│ │ [🗑️] [✏️] [📝 Note]      │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Coca Cola             x3 │ │
│ │ $2.99 each     = $8.97   │ │
│ │ [🗑️] [✏️]                │ │
│ └──────────────────────────┘ │
│                              │
│ + Add Special Instructions   │ Order-level notes
├──────────────────────────────┤
│ PRICING BREAKDOWN            │
├──────────────────────────────┤
│ Subtotal:           $43.45   │
│ Tax (8.25%):         $3.58   │
│ Service Charge:      $2.17   │
│ ─────────────────────────── │
│ TOTAL:              $49.20   │
│                              │
│ 💰 Payment Method: Cash      │ Selected payment method
├──────────────────────────────┤
│ ORDER ACTIONS                │
├──────────────────────────────┤
│ [💾 SAVE ORDER]             │ Primary actions
│ [🍴 SEND TO KITCHEN]        │
│ [💳 PAYMENT]                │
├──────────────────────────────┤
│ [✂️ SPLIT] [🎫 DISCOUNT]     │ Secondary actions
│ [🖨️ PRINT] [❌ VOID]        │
└──────────────────────────────┘
```

### Mobile Order Panel (Bottom Sheet)
```
Mobile Order Summary (Collapsed):
┌─────────────────────────────┐
│ [🛒 3 items] [$49.20] [VIEW]│ 48px
└─────────────────────────────┘

Mobile Order Panel (Expanded):
┌─────────────────────────────┐
│ ■ Order #26018       [✕]    │ Handle + close
├─────────────────────────────┤
│ Wings x2           $25.98   │ Condensed item view
│ Caesar Salad       $8.50    │
│ Coke x3            $8.97    │
├─────────────────────────────┤
│ Total: $49.20               │
├─────────────────────────────┤
│ [SAVE] [KITCHEN] [PAYMENT]  │ Action buttons
└─────────────────────────────┘
```

### Component Interface
```typescript
interface OrderCartPanelProps {
  order: Order;
  onItemModify: (itemId: string, changes: Partial<OrderItem>) => void;
  onItemRemove: (itemId: string) => void;
  onItemDuplicate: (itemId: string) => void;
  onOrderAction: (action: OrderAction) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  showPriceBreakdown?: boolean;
  allowModifications?: boolean;
  layout: 'panel' | 'bottomSheet' | 'modal';
}

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifications: OrderItemModification[];
  specialInstructions: string;
  totalPrice: number;
}

interface OrderAction {
  type: 'save' | 'kitchen' | 'payment' | 'split' | 'discount' | 'print' | 'void';
  data?: any;
}
```

## 5. Action Bar Component

### Wireframe
```
Desktop Action Bar (Full width, 72px height):
┌─────────────────────────────────────────────────────────────────────────────┐
│ [💾 SAVE ORDER] [🍴 SEND KITCHEN] [💳 PAYMENT] [✂️ SPLIT BILL] [🎫 DISCOUNT] │
│ [🖨️ PRINT KOT] [📋 ORDER HISTORY] [❌ VOID ORDER] [⚙️ SETTINGS] [🔄 SYNC]  │
└─────────────────────────────────────────────────────────────────────────────┘

Mobile Action Bar (Full width, 64px height):  
┌─────────────────────────────────────────────────────┐
│ [💾 SAVE] [🍴 KITCHEN] [💳 PAY] [⋯ MORE]            │
└─────────────────────────────────────────────────────┘
```

### Button Specifications
```typescript
interface ActionButton {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
  isEnabled: boolean;
  isLoading?: boolean;
  badge?: {
    count: number;
    color: string;
  };
  shortcut?: string; // Keyboard shortcut
}

const actionButtons: ActionButton[] = [
  {
    id: 'save',
    label: 'Save Order',
    icon: '💾',
    color: theme.colors.primary,
    shortcut: 'Ctrl+S',
  },
  {
    id: 'kitchen', 
    label: 'Send to Kitchen',
    icon: '🍴',
    color: theme.colors.success,
    shortcut: 'Ctrl+K',
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: '💳', 
    color: theme.colors.success,
    shortcut: 'Ctrl+P',
  },
  // ... more buttons
];
```

## Responsive Behavior Matrix

### Component Visibility by Screen Size
| Component | Mobile | Tablet | Desktop |
|-----------|---------|---------|---------|
| MenuCategoryPanel | Tabs | Sidebar | Sidebar |
| MenuItemGrid | 2 cols | 3 cols | 4 cols |
| OrderCartPanel | Bottom Sheet | Fixed Panel | Fixed Panel |
| ActionBar | 4 buttons | 6 buttons | All buttons |
| SearchBar | Modal | Inline | Inline |

### Interaction Adaptations
| Action | Mobile | Tablet | Desktop |
|--------|---------|---------|---------|
| Add Item | Tap + | Tap + | Tap + / Drag |
| View Details | Tap item | Long press | Right click |
| Category Switch | Swipe tabs | Tap sidebar | Click sidebar |
| Order Review | Bottom sheet | Fixed panel | Fixed panel |
| Search | Full screen | Overlay | Inline |

This component specification provides the detailed foundation needed to implement a professional POS order system that works seamlessly across all device types while maintaining excellent performance and user experience.