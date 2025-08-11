# POS Order System - Wireframes & Design Specifications

## Design Philosophy

### SkyTab-Inspired Modern POS
The design follows modern restaurant POS systems like SkyTab, focusing on:
- **Efficiency**: Minimal taps to complete common tasks
- **Clarity**: Clear visual hierarchy and information density
- **Touch-Optimized**: Proper touch targets for restaurant environment
- **Professional**: Clean, restaurant-appropriate aesthetic
- **Responsive**: Seamless experience across tablet and mobile devices

### Design Principles
1. **Information Hierarchy**: Most important info (order total, table number) prominently displayed
2. **Visual Grouping**: Related functions grouped with clear boundaries
3. **Consistent Patterns**: Same interactions work the same way throughout
4. **Error Prevention**: UI prevents invalid actions rather than showing errors
5. **Contextual Actions**: Actions available based on current state

## Screen Specifications

### 1. POS Order Screen (Primary Interface)

#### Tablet Layout (1024px+ width)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ POS Header Bar (64px height)                                           │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│ │ Table: T-12 │ │ Order #1234 │ │ Server: Jane│ │   16:45      │       │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────────────────────┤
│ Main Content Area (calc(100vh - 128px) height)                         │
│ ┌─────────────┬───────────────────────────────────┬─────────────────┐   │
│ │             │                                   │                 │   │
│ │ LEFT PANEL  │           CENTER PANEL            │   RIGHT PANEL   │   │
│ │ Order Cart  │        Menu Browsing              │  Table & Info   │   │
│ │             │                                   │                 │   │
│ │ (320px)     │            (flex: 1)              │    (280px)      │   │
│ │             │                                   │                 │   │
│ └─────────────┴───────────────────────────────────┴─────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│ Bottom Action Bar (64px height)                                        │
│ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐    │
│ │Save Pay.││Print KOT││Split Bill││Discount.││Add Cust.││More...  │    │
│ └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (< 768px width)
```
┌─────────────────────────────────────┐
│ Mobile Header (56px)                │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ Table: T-12 │ │ Total: ₹1,250   │ │
│ └─────────────┘ └─────────────────┘ │
├─────────────────────────────────────┤
│ Tab Navigation (48px)               │
│ ┌─────┐┌─────┐┌─────┐┌──────────┐   │
│ │Menu ││Cart ││Info ││ Actions  │   │
│ └─────┘└─────┘└─────┘└──────────┘   │
├─────────────────────────────────────┤
│                                     │
│ Content Panel                       │
│ (Changes based on active tab)       │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 2. Left Panel - Order Cart (Tablet)

#### Cart Header Section (80px height)
```
┌───────────────────────────────────────────┐
│ Order Cart Header                         │
│ ┌─────────────┐ ┌─────────────────────┐   │
│ │ Table: T-12 │ │ Order #1234         │   │
│ │ 4 Guests    │ │ Started: 16:42      │   │
│ └─────────────┘ └─────────────────────┘   │
└───────────────────────────────────────────┘
```

#### Cart Items List (scrollable, flex: 1)
```
┌───────────────────────────────────────────┐
│ Cart Items (Scrollable List)              │
│ ┌─────────────────────────────────────────┐│
│ │ ┌────┐ Chicken Tikka Masala        ₹320││
│ │ │ 2x │ ◦ Medium spicy               │  ││
│ │ └────┘ ◦ Extra rice          [−][+] │  ││
│ │ ─────────────────────────────────────── ││
│ │ ┌────┐ Garlic Naan                ₹80 ││
│ │ │ 3x │ ◦ Well done              [−][+] ││
│ │ └────┘                               │  ││
│ │ ─────────────────────────────────────── ││
│ │ ┌────┐ Mango Lassi               ₹120 ││
│ │ │ 2x │ ◦ Less sweet             [−][+] ││
│ │ └────┘                               │  ││
│ └─────────────────────────────────────────┘│
└───────────────────────────────────────────┘
```

#### Cart Summary (120px height)
```
┌───────────────────────────────────────────┐
│ Order Summary                             │
│ ┌─────────────────────────────────────────┐│
│ │ Subtotal:                       ₹1,040 ││
│ │ Tax (5%):                          ₹52 ││
│ │ ─────────────────────────────────────── ││
│ │ Total:                         ₹1,092 ││
│ └─────────────────────────────────────────┘│
│ ┌─────────────┐ ┌─────────────────────────┐│
│ │ Clear Cart  │ │ Add Items               ││
│ └─────────────┘ └─────────────────────────┘│
└───────────────────────────────────────────┘
```

### 3. Center Panel - Menu Browsing

#### Category Tabs Bar (56px height)
```
┌─────────────────────────────────────────────────────────────────┐
│ Menu Category Tabs                                              │
│ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐        │
│ │BEVERAGES││APPETIZERS││MAIN DISH││ DESSERTS││ SPECIAL │        │
│ │   (12)  ││   (18)   ││   (24)  ││   (8)   ││   (6)   │        │
│ └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Search & Filter Bar (48px height)
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────┐┌────────┐┌────────┐┌──────────┐   │
│ │ 🔍 Search menu items...  ││Filters ││ Veg Only││Sort: A-Z │   │
│ └───────────────────────────┘└────────┘└────────┘└──────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Menu Items Grid (scrollable, responsive columns)
```
┌─────────────────────────────────────────────────────────────────┐
│ Menu Items Grid (4-5 columns on tablet)                        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │   │
│ │Chicken T│ │Butter C.│ │Garlic N.│ │Mango L. │ │Biryani  │   │
│ │₹320  🌶🌶│ │₹280  🌶 │ │₹80      │ │₹120  🥛 │ │₹420  🌶 │   │
│ │ [+ Add] │ │ [+ Add] │ │ [+ Add] │ │ [+ Add] │ │ [+ Add] │   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │   │
│ │Dal Tadka│ │Roti     │ │Raita    │ │Tea      │ │Kulfi    │   │
│ │₹180  🌶 │ │₹40      │ │₹60      │ │₹40  ☕  │ │₹80  🍨  │   │
│ │ [+ Add] │ │ [+ Add] │ │ [+ Add] │ │ [+ Add] │ │ [+ Add] │   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Right Panel - Table & Customer Info

#### Table Information (120px height)
```
┌─────────────────────────────────────┐
│ Table Information                   │
│ ┌─────────────────────────────────┐ │
│ │ Table: T-12    Status: Occupied │ │
│ │ Capacity: 4    Guests: 4        │ │
│ │ Server: Jane D.  Section: A     │ │
│ │ Sat at: 16:30   Duration: 15min │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Customer Information (160px height)
```
┌─────────────────────────────────────┐
│ Customer Information                │
│ ┌─────────────────────────────────┐ │
│ │ Primary Guest                   │ │
│ │ Name: John Smith               │ │
│ │ Phone: +91 98765 43210         │ │
│ │ Email: john@email.com          │ │
│ │ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ Edit Info   │ │ Add Customer│ │ │
│ │ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Order Notes & Preferences (200px height)
```
┌─────────────────────────────────────┐
│ Order Notes & Preferences           │
│ ┌─────────────────────────────────┐ │
│ │ Special Requests:               │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Customer is allergic to     │ │ │
│ │ │ nuts. Please ensure no      │ │ │
│ │ │ cross-contamination.        │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                │ │
│ │ Preferences:                   │ │
│ │ ☑ Vegetarian    ☐ Vegan       │ │
│ │ ☑ Less Spicy    ☐ No Dairy    │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Add Note...                 │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5. Bottom Action Bar

#### Primary Actions (Most Common Operations)
```
┌─────────────────────────────────────────────────────────────────┐
│ Action Bar - Primary Operations                                 │
│ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐        │
│ │ Save &  ││ Print   ││ Split   ││ Apply   ││ Add     │        │
│ │ Payment ││ KOT     ││ Bill    ││ Discount││Customer │        │
│ └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Secondary Actions (Overflow Menu)
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌──────┐│
│ │ Hold    ││ Cancel  ││ Modify  ││ Reprint ││ Manager ││ More ││
│ │ Order   ││ Order   ││ Table   ││ Receipt ││ Override││  •••  ││
│ └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└──────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. MenuItemCard Component
```typescript
interface MenuItemCard {
  item: MenuItem
  onAddToCart: (item: MenuItem, quantity: number, modifiers?: ItemModifier[]) => void
  onViewDetails: (item: MenuItem) => void
  isInCart: boolean
  cartQuantity: number
  isAvailable: boolean
}
```

#### Visual Design (150px × 180px card)
```
┌─────────────────────────┐
│ ┌─────────────────────┐ │ ← Image Area (150×100px)
│ │                     │ │
│ │     Menu Item       │ │
│ │       Image         │ │
│ │                     │ │
│ └─────────────────────┘ │
│ Item Name (truncated)   │ ← Typography: 14px bold
│ Short description...    │ ← Typography: 12px gray
│ ┌─────┐ ┌─────────────┐ │
│ │ ₹320│ │ 🌶🌶 🥛      │ │ ← Price + Dietary Icons
│ └─────┘ └─────────────┘ │
│ ┌─────────────────────┐ │
│ │      [+ Add]        │ │ ← CTA Button (Primary Color)
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### States
- **Available**: Full opacity, active add button
- **Out of Stock**: 50% opacity, disabled button showing "Out of Stock"
- **In Cart**: Add button shows quantity controls or "Added ✓"
- **Loading**: Skeleton loader animation

### 2. CartItem Component
```typescript
interface CartItem {
  item: OrderItem
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onAddSpecialInstructions: (itemId: string, instructions: string) => void
  isEditable: boolean
}
```

#### Visual Design (320px width, ~80px height)
```
┌───────────────────────────────────────────┐
│ ┌────┐ Item Name                     ₹320 │ ← Quantity Badge + Name + Price
│ │ 2x │ Special instructions here...       │ ← Instructions (if any)
│ └────┘ ┌─┐┌───┐┌─┐              ┌───────┐│
│        │−││ 2 ││+│              │ Remove││ ← Quantity Controls + Remove
│        └─┘└───┘└─┘              └───────┘│
└───────────────────────────────────────────┘
```

### 3. MenuCategoryTabs Component
```typescript
interface MenuCategoryTabs {
  categories: MenuCategory[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
  itemCounts?: Record<string, number>
}
```

#### Tab Design (Auto-width, 56px height)
```
┌─────────┐┌─────────┐┌─────────┐
│BEVERAGES││APPETIZERS││ MAINS   │ ← Active tab: bold, colored background
│   (12)  ││   (18)   ││  (24)   │ ← Item count in gray
└─────────┘└─────────┘└─────────┘
```

### 4. OrderSummary Component
```typescript
interface OrderSummary {
  order: Order
  showDetailedBreakdown: boolean
  onApplyDiscount?: () => void
}
```

#### Summary Design (320px width, ~120px height)
```
┌─────────────────────────────────────────┐
│ Order Summary                           │
│ ┌─────────────────────────────────────┐ │
│ │ Items (6):                   ₹1,040 │ │ ← Item count + subtotal
│ │ Tax (5%):                       ₹52 │ │
│ │ Discount:                       -₹0 │ │ ← Only show if discount applied
│ │ ────────────────────────────────────│ │
│ │ Total:                       ₹1,092 │ │ ← Bold, larger text
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Interaction Patterns

### 1. Add Item to Cart Flow
1. **Initial State**: Menu item shows "[+ Add]" button
2. **Tap Add**: Shows quantity selector modal or directly adds 1x
3. **Quantity Selection**: Modal with quantity controls and modifiers
4. **Confirm**: Item added to cart, button shows "Added ✓" briefly
5. **Final State**: Button shows quantity "[2x] [+ Add More]"

### 2. Order Modification Flow
1. **Cart Item Tap**: Shows modification options
2. **Quantity Change**: Immediate update with optimistic UI
3. **Special Instructions**: Text input modal with save/cancel
4. **Remove Item**: Confirmation dialog for safety

### 3. Payment Flow
1. **Save & Payment Button**: Opens payment method selector
2. **Method Selection**: Shows available payment options
3. **Amount Confirmation**: Final total with breakdown
4. **Processing**: Loading state with payment device communication
5. **Completion**: Success screen with receipt options

### 4. Table Selection to Order Flow
1. **Table Selection**: Staff taps available table
2. **Order Creation**: System creates new order automatically
3. **Transition**: Smooth navigation to POS order interface
4. **Context Loading**: Order context loads with table information

## Responsive Design Rules

### Tablet Optimizations (≥768px)
- **Layout**: 3-panel horizontal layout
- **Touch Targets**: 44px minimum for finger navigation
- **Information Density**: Higher density appropriate for tablet viewing
- **Multi-Column**: 4-5 columns for menu items grid

### Mobile Adaptations (<768px)
- **Layout**: Tab-based single panel navigation
- **Touch Targets**: 48px minimum for thumb navigation
- **Information Density**: Reduced density for smaller screens
- **Single Column**: 2-3 columns for menu items grid

### Accessibility Requirements
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **High Contrast**: Support for high contrast mode
- **Keyboard Navigation**: Full keyboard accessibility
- **Touch Accessibility**: Minimum touch target sizes
- **Voice Control**: Support for voice navigation commands

## Animation & Transitions

### Micro-Interactions
- **Button Presses**: Subtle scale animation (0.95x on press)
- **Item Addition**: Cart icon bounce when items added
- **Quantity Changes**: Number change animation with scaling
- **Tab Switching**: Smooth slide transition between categories

### Page Transitions
- **Screen Navigation**: Slide transitions between major screens
- **Modal Appearance**: Scale-up animation from center
- **Panel Changes**: Smooth slide or fade transitions

### Performance Considerations
- **Animation Duration**: 200-300ms for most interactions
- **Easing**: Use platform-appropriate easing curves
- **Reduced Motion**: Respect user preferences for reduced motion
- **60fps Target**: All animations maintain 60fps performance

## Error States & Empty States

### Error Handling UI
- **Network Errors**: Retry button with clear error message
- **Payment Failures**: Clear error with alternative payment options
- **Validation Errors**: Inline field validation with helpful messages
- **System Errors**: Graceful degradation with offline capability

### Empty States
- **Empty Cart**: Friendly message with call-to-action to browse menu
- **No Search Results**: Helpful suggestions and search tips
- **Out of Stock**: Clear messaging with alternative suggestions
- **No Orders**: Welcome screen with getting started guidance

---

**Design System**: React Native Paper + Custom Components  
**Target Devices**: iPad (primary), Android tablets, smartphones  
**Design Resolution**: 1024×768 (tablet), 375×667 (mobile)  
**Color Scheme**: Light mode primary, dark mode support  
**Typography**: System fonts with proper hierarchy  
**Iconography**: Material Design icons + custom food icons  