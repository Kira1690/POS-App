# Component Decomposition Strategy

## Overview

This document outlines the specific strategy for decomposing oversized React Native components into focused, maintainable components that adhere to SOLID principles and CLAUDE.md file size limits.

## Decomposition Principles

### 1. Single Responsibility Principle (SRP) Enforcement
- Each component handles ONE specific UI concern
- Business logic extracted to custom hooks
- API calls handled by services, not components

### 2. Component Size Limits
- **Maximum 300 lines per component**
- **Target 150-250 lines for optimal maintainability**
- Break into smaller components at 200+ lines

### 3. Composition Over Inheritance
- Build complex UIs from small, focused components
- Use component composition patterns
- Prefer props-based component communication

## Critical File Decomposition Plans

## 1. OrderDetailsScreen.tsx (776 lines → 5 components)

### Current Issues
- Single component handling entire order details workflow
- Mixed concerns: UI rendering + business logic + API calls + navigation
- Complex state management with multiple modals
- Tight coupling to multiple contexts

### Decomposition Strategy

#### 1.1 OrderDetailsHeader.tsx (80 lines)
**Responsibility:** Order header information and basic actions
```typescript
interface OrderDetailsHeaderProps {
  order: Order;
  onStatusUpdate: (status: OrderStatus) => void;
  onPrintReceipt: () => void;
}

const OrderDetailsHeader: React.FC<OrderDetailsHeaderProps> = ({
  order,
  onStatusUpdate,
  onPrintReceipt
}) => {
  // Order ID, timestamp, table info
  // Order status badge
  // Quick action buttons (print, duplicate)
};
```

#### 1.2 OrderItemsList.tsx (120 lines)
**Responsibility:** Order items display and item-level operations
```typescript
interface OrderItemsListProps {
  items: OrderItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddNote: (itemId: string, note: string) => void;
  readonly?: boolean;
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({
  items,
  onQuantityChange,
  onRemoveItem,
  onAddNote,
  readonly = false
}) => {
  // FlatList of order items
  // Quantity controls (if not readonly)
  // Special instructions/notes
  // Item status indicators
};
```

#### 1.3 OrderStatusManager.tsx (100 lines)
**Responsibility:** Order status management and updates
```typescript
interface OrderStatusManagerProps {
  order: Order;
  onStatusChange: (status: OrderStatus) => Promise<void>;
  availableStatuses: OrderStatus[];
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  order,
  onStatusChange,
  availableStatuses
}) => {
  // Status selection UI
  // Status change confirmation
  // Status history timeline
  // Business rule validation
};
```

#### 1.4 OrderTimeline.tsx (90 lines)
**Responsibility:** Order progress timeline display
```typescript
interface OrderTimelineProps {
  order: Order;
  showDetailedTimeline?: boolean;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({
  order,
  showDetailedTimeline = false
}) => {
  // Visual timeline of order progress
  // Timestamps for each status change
  // Kitchen preparation times
  // Service completion times
};
```

#### 1.5 OrderActionPanel.tsx (85 lines)
**Responsibility:** Order action buttons and operations
```typescript
interface OrderActionPanelProps {
  order: Order;
  onCancelOrder: () => void;
  onDuplicateOrder: () => void;
  onSendToKitchen: () => void;
  onGenerateReceipt: () => void;
}

const OrderActionPanel: React.FC<OrderActionPanelProps> = ({
  order,
  onCancelOrder,
  onDuplicateOrder,
  onSendToKitchen,
  onGenerateReceipt
}) => {
  // Action button grid
  // Context-sensitive actions based on order status
  // Confirmation dialogs
};
```

#### 1.6 Refactored OrderDetailsScreen.tsx (120 lines)
**Responsibility:** Layout composition and data coordination
```typescript
const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ 
  navigation, 
  route 
}) => {
  // Data loading and error handling only
  // Component composition and layout
  // Navigation handling
  // No business logic - delegated to hooks and components
  
  const orderData = useOrderData(orderId);
  const orderActions = useOrderActions();
  
  return (
    <SafeAreaView style={styles.container}>
      <OrderDetailsHeader 
        order={orderData.order}
        onStatusUpdate={orderActions.updateStatus}
        onPrintReceipt={orderActions.printReceipt}
      />
      <OrderItemsList 
        items={orderData.order?.items}
        onQuantityChange={orderActions.updateQuantity}
        onRemoveItem={orderActions.removeItem}
      />
      <OrderTimeline order={orderData.order} />
      <OrderActionPanel 
        order={orderData.order}
        onCancelOrder={orderActions.cancelOrder}
        onDuplicateOrder={orderActions.duplicateOrder}
      />
    </SafeAreaView>
  );
};
```

## 2. TableManagementScreen.tsx (623 lines → 5 components)

### Current Issues
- Single screen handling table display, filtering, selection, and status management
- Complex grid layout logic mixed with business operations
- Multiple modal management within single component

### Decomposition Strategy

#### 2.1 TableManagementHeader.tsx (60 lines)
**Responsibility:** Search, filters, and header actions
```typescript
interface TableManagementHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: TableStatus | 'ALL';
  onStatusFilterChange: (status: TableStatus | 'ALL') => void;
  onAddTable: () => void;
}
```

#### 2.2 TableGrid.tsx (120 lines)
**Responsibility:** Table display grid with responsive layout
```typescript
interface TableGridProps {
  tables: Table[];
  selectedTableId: string | null;
  onTableSelect: (tableId: string) => void;
  onTableLongPress: (tableId: string) => void;
  layout: 'grid' | 'list';
}
```

#### 2.3 TableDetailsPanel.tsx (100 lines)
**Responsibility:** Selected table information and details
```typescript
interface TableDetailsPanelProps {
  table: Table | null;
  currentOrder: Order | null;
  onStartOrder: () => void;
  onViewOrder: () => void;
  onEditTable: () => void;
}
```

#### 2.4 TableStatusManager.tsx (80 lines)
**Responsibility:** Table status change operations
```typescript
interface TableStatusManagerProps {
  table: Table;
  onStatusChange: (status: TableStatus) => Promise<void>;
  isVisible: boolean;
  onClose: () => void;
}
```

#### 2.5 Refactored TableManagementScreen.tsx (150 lines)
**Responsibility:** Layout composition and state coordination

## 3. OrderCartPanel.tsx (609 lines → 4 components)

### Current Issues
- Single component handling cart display, modifications, calculations, and actions
- Complex calculations mixed with UI rendering
- Tight coupling to multiple contexts

### Decomposition Strategy

#### 3.1 CartHeader.tsx (40 lines)
```typescript
interface CartHeaderProps {
  itemCount: number;
  onClearCart: () => void;
  tableInfo: Table;
}
```

#### 3.2 CartItemsList.tsx (120 lines)
```typescript
interface CartItemsListProps {
  items: CartItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddNote: (itemId: string, note: string) => void;
}
```

#### 3.3 CartTotals.tsx (60 lines)
```typescript
interface CartTotalsProps {
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  itemCount: number;
}
```

#### 3.4 CartActions.tsx (80 lines)
```typescript
interface CartActionsProps {
  onSubmitOrder: () => void;
  onSaveDraft: () => void;
  onViewCart: () => void;
  isSubmitDisabled: boolean;
  orderTotal: number;
}
```

## 4. MenuItemsGrid.tsx (538 lines → 4 components)

### Decomposition Strategy

#### 4.1 MenuItemCard.tsx (80 lines)
```typescript
interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
  onLongPress: () => void;
  isSelected?: boolean;
}
```

#### 4.2 MenuGrid.tsx (120 lines)
```typescript
interface MenuGridProps {
  items: MenuItem[];
  onItemSelect: (item: MenuItem) => void;
  layout: 'grid' | 'list';
  loading?: boolean;
}
```

#### 4.3 MenuFilters.tsx (60 lines)
```typescript
interface MenuFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: MenuCategory[];
}
```

#### 4.4 Refactored MenuItemsGrid.tsx (120 lines)
**Responsibility:** Data management and component coordination

## Custom Hooks Strategy

### Business Logic Extraction

#### useOrderBusinessLogic Hook
```typescript
// src/hooks/order/useOrderBusinessLogic.ts
export function useOrderBusinessLogic() {
  const validateOrderItems = useCallback((items: OrderItem[]) => {
    // Validation logic
  }, []);
  
  const calculateOrderTotals = useCallback((items: OrderItem[], taxRate: number) => {
    // Calculation logic
  }, []);
  
  const canUpdateOrderStatus = useCallback((order: Order, newStatus: OrderStatus) => {
    // Business rule validation
  }, []);
  
  return {
    validateOrderItems,
    calculateOrderTotals,
    canUpdateOrderStatus
  };
}
```

#### useOrderActions Hook
```typescript
// src/hooks/order/useOrderActions.ts
export function useOrderActions() {
  const orderService = useService<IOrderService>('orderService');
  
  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    // Action implementation
  }, [orderService]);
  
  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    // Cancellation logic
  }, [orderService]);
  
  return {
    updateStatus,
    cancelOrder,
    duplicateOrder,
    printReceipt
  };
}
```

### Data Management Hooks

#### useOrderData Hook
```typescript
// src/hooks/order/useOrderData.ts
export function useOrderData(orderId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOrder = useCallback(async (id: string) => {
    // Data fetching logic
  }, []);
  
  return {
    order,
    loading,
    error,
    fetchOrder
  };
}
```

## Component Performance Optimization

### 1. React.memo Implementation
```typescript
// Memoize components with props comparison
const OrderItemCard = React.memo<OrderItemCardProps>(({ 
  item, 
  onQuantityChange, 
  onRemove 
}) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.quantity === nextProps.item.quantity;
});
```

### 2. useMemo for Expensive Calculations
```typescript
const CartTotals: React.FC<CartTotalsProps> = ({ items, taxRate }) => {
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  }, [items, taxRate]);
  
  return (
    <View>
      <Text>Subtotal: {formatCurrency(calculations.subtotal)}</Text>
      <Text>Tax: {formatCurrency(calculations.tax)}</Text>
      <Text>Total: {formatCurrency(calculations.total)}</Text>
    </View>
  );
};
```

### 3. useCallback for Function Props
```typescript
const OrderItemsList: React.FC<OrderItemsListProps> = ({ 
  items, 
  onQuantityChange 
}) => {
  const renderItem = useCallback(({ item }: { item: OrderItem }) => (
    <OrderItemCard 
      item={item}
      onQuantityChange={onQuantityChange}
    />
  ), [onQuantityChange]);
  
  const keyExtractor = useCallback((item: OrderItem) => item.id, []);
  
  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};
```

## File Organization Structure

### New Component Structure
```
src/components/business/order/
├── details/
│   ├── OrderDetailsHeader.tsx          (80 lines)
│   ├── OrderItemsList.tsx              (120 lines)
│   ├── OrderStatusManager.tsx          (100 lines)
│   ├── OrderTimeline.tsx               (90 lines)
│   ├── OrderActionPanel.tsx            (85 lines)
│   └── index.ts
├── cart/
│   ├── CartHeader.tsx                  (40 lines)
│   ├── CartItemsList.tsx               (120 lines)
│   ├── CartTotals.tsx                  (60 lines)
│   ├── CartActions.tsx                 (80 lines)
│   └── index.ts
└── management/
    ├── OrderListItem.tsx               (80 lines)
    ├── OrderStatusBadge.tsx            (40 lines)
    ├── KitchenOrderCard.tsx            (100 lines - refactored)
    └── index.ts

src/screens/orders/
├── OrderDetailsScreen.tsx              (120 lines - refactored)
├── POSOrderScreen.tsx                  (150 lines - refactored)
├── OrderManagementScreen.tsx           (150 lines - refactored)
└── KitchenDisplayScreen.tsx            (150 lines - refactored)
```

## Testing Strategy for Decomposed Components

### 1. Unit Testing Individual Components
```typescript
// __tests__/OrderDetailsHeader.test.tsx
describe('OrderDetailsHeader', () => {
  it('displays order information correctly', () => {
    render(<OrderDetailsHeader order={mockOrder} onStatusUpdate={mockFn} />);
    expect(screen.getByText('Order #12345')).toBeInTheDocument();
  });
  
  it('calls onStatusUpdate when status button pressed', () => {
    const mockStatusUpdate = jest.fn();
    render(<OrderDetailsHeader order={mockOrder} onStatusUpdate={mockStatusUpdate} />);
    
    fireEvent.press(screen.getByText('Update Status'));
    expect(mockStatusUpdate).toHaveBeenCalled();
  });
});
```

### 2. Integration Testing Component Composition
```typescript
// __tests__/OrderDetailsScreen.test.tsx
describe('OrderDetailsScreen Integration', () => {
  it('renders all sub-components correctly', () => {
    render(<OrderDetailsScreen orderId="123" />);
    
    expect(screen.getByTestId('order-details-header')).toBeInTheDocument();
    expect(screen.getByTestId('order-items-list')).toBeInTheDocument();
    expect(screen.getByTestId('order-timeline')).toBeInTheDocument();
  });
});
```

### 3. Custom Hook Testing
```typescript
// __tests__/useOrderBusinessLogic.test.ts
describe('useOrderBusinessLogic', () => {
  it('calculates order totals correctly', () => {
    const { result } = renderHook(() => useOrderBusinessLogic());
    
    const total = result.current.calculateOrderTotals(mockItems, 0.0825);
    expect(total.subtotal).toBe(100);
    expect(total.tax).toBe(8.25);
    expect(total.total).toBe(108.25);
  });
});
```

## Migration Strategy

### 1. Incremental Component Replacement
- Replace components one by one in feature branches
- Use feature flags to switch between old and new components
- Maintain backward compatibility during transition

### 2. Parallel Development
- Keep existing components functional while building new ones
- Create new components alongside old ones
- Switch over when new components are fully tested

### 3. Gradual Integration
- Start with least coupled components (UI-only components)
- Move to more complex components with business logic
- Finish with main screen components that compose others

## Success Metrics

### Code Quality Targets
- **Component Size**: All components <300 lines
- **Cyclomatic Complexity**: <10 per component function
- **Test Coverage**: >85% for all new components
- **Performance**: <16ms render time per component

### Maintainability Improvements
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components can be reused in different contexts
- **Testability**: Each component can be tested in isolation
- **Readability**: Component purpose clear from name and structure

---

*Component Decomposition Strategy completed on: 2025-08-19*  
*Target: Transform 21 oversized files into 60+ focused, maintainable components*