# POS Order System - Technical Architecture

## Architecture Overview

The POS Order System follows a **Service Layer Architecture** with **Context-based State Management**, building upon the existing table management foundation while introducing new order flow capabilities.

### Core Architectural Principles

1. **Service Layer Pattern**: All business logic encapsulated in dedicated service classes
2. **Context API State Management**: Centralized state with React Context and useReducer
3. **Dependency Injection**: Services injected into providers for testability
4. **Interface Segregation**: Small, focused interfaces following SOLID principles
5. **Immutable State Updates**: All state changes through pure reducer functions
6. **Error Boundary Pattern**: Comprehensive error handling with user-friendly recovery

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           POS Order System                              │
│                                                                         │
│ ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐│
│ │   Presentation      │  │    State            │  │    Service          ││
│ │      Layer          │  │   Management        │  │      Layer          ││
│ │                     │  │                     │  │                     ││
│ │ ┌─────────────────┐ │  │ ┌─────────────────┐ │  │ ┌─────────────────┐ ││
│ │ │ POSOrderScreen  │ │  │ │ OrderContext    │ │  │ │ OrderService    │ ││
│ │ │ MenuBrowsing    │ │  │ │ TableContext    │ │  │ │ CartService     │ ││
│ │ │ OrderCart       │ │  │ │ MenuContext     │ │  │ │ MenuService     │ ││
│ │ │ PaymentModal    │ │  │ │ PaymentContext  │ │  │ │ PaymentService  │ ││
│ │ └─────────────────┘ │  │ └─────────────────┘ │  │ └─────────────────┘ ││
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘│
│                                    │                         │            │
│ ┌─────────────────────┐            │              ┌─────────────────────┐│
│ │   Infrastructure    │            │              │   External          ││
│ │      Layer          │            │              │  Integrations       ││
│ │                     │            │              │                     ││
│ │ ┌─────────────────┐ │            │              │ ┌─────────────────┐ ││
│ │ │ WebSocket       │ │─────────────────────────────│ │ VP3350 Bridge  │ ││
│ │ │ API Client      │ │            │              │ │ Print Service   │ ││
│ │ │ Local Storage   │ │            │              │ │ Kitchen API     │ ││
│ │ └─────────────────┘ │            │              │ └─────────────────┘ ││
│ └─────────────────────┘            │              └─────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## Service Layer Architecture

### 1. Order Management Services

#### OrderManagementService
**Responsibility**: Core order lifecycle management
**File**: `src/services/order/OrderManagementService.ts`

```typescript
interface IOrderManagementService {
  // Order lifecycle
  createOrder(tableId: string, customerId?: string): Promise<ApiResponse<Order>>
  updateOrder(orderId: string, updates: OrderUpdate): Promise<ApiResponse<Order>>
  finalizeOrder(orderId: string): Promise<ApiResponse<OrderReceipt>>
  cancelOrder(orderId: string, reason: string): Promise<ApiResponse<void>>
  holdOrder(orderId: string, reason: string): Promise<ApiResponse<void>>
  
  // Order retrieval
  getActiveOrdersByTable(tableId: string): Promise<ApiResponse<Order[]>>
  getOrderHistory(filters: OrderHistoryFilters): Promise<ApiResponse<PaginatedOrders>>
  getOrderById(orderId: string): Promise<ApiResponse<Order>>
  
  // Real-time subscriptions
  subscribeToOrderUpdates(orderId: string, callback: OrderUpdateCallback): void
  unsubscribeFromOrderUpdates(orderId: string): void
}

class OrderManagementService implements IOrderManagementService {
  constructor(
    private apiClient: OrderApiClient,
    private webSocketService: OrderWebSocketService,
    private calculationService: OrderCalculationService
  ) {}

  async createOrder(tableId: string, customerId?: string): Promise<ApiResponse<Order>> {
    try {
      const orderData = {
        table_id: tableId,
        customer_id: customerId,
        status: OrderStatus.DRAFT,
        created_at: new Date().toISOString(),
        items: [],
        total: 0
      }
      
      const response = await this.apiClient.createOrder(orderData)
      
      // Subscribe to real-time updates for new order
      if (response.success && response.data) {
        this.subscribeToOrderUpdates(response.data.id, (order) => {
          // Handle real-time order updates
        })
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  // Additional methods following same pattern...
}
```

#### CartService
**Responsibility**: Shopping cart operations and item management
**File**: `src/services/order/CartService.ts`

```typescript
interface ICartService {
  // Item management
  addItem(orderId: string, item: CartItemRequest): Promise<ApiResponse<Order>>
  updateItemQuantity(orderId: string, itemId: string, quantity: number): Promise<ApiResponse<Order>>
  removeItem(orderId: string, itemId: string): Promise<ApiResponse<Order>>
  updateItemModifiers(orderId: string, itemId: string, modifiers: ItemModifier[]): Promise<ApiResponse<Order>>
  
  // Special instructions
  addSpecialInstructions(orderId: string, itemId: string, instructions: string): Promise<ApiResponse<Order>>
  updateOrderNotes(orderId: string, notes: string): Promise<ApiResponse<Order>>
  
  // Cart operations
  clearCart(orderId: string): Promise<ApiResponse<Order>>
  duplicateOrder(sourceOrderId: string, targetTableId: string): Promise<ApiResponse<Order>>
  saveCartDraft(orderId: string): Promise<ApiResponse<void>>
  loadCartDraft(orderId: string): Promise<ApiResponse<Order>>
}

class CartService implements ICartService {
  constructor(
    private apiClient: OrderApiClient,
    private calculationService: OrderCalculationService,
    private menuService: MenuService
  ) {}

  async addItem(orderId: string, item: CartItemRequest): Promise<ApiResponse<Order>> {
    try {
      // Validate item availability
      const menuItem = await this.menuService.getItemById(item.menu_item_id)
      if (!menuItem.success || !menuItem.data?.available) {
        return {
          success: false,
          error: 'Item is not available',
          data: null
        }
      }

      // Calculate item price with modifiers
      const itemPrice = await this.calculationService.calculateItemPrice(
        menuItem.data,
        item.modifiers || []
      )

      const cartItem: OrderItem = {
        id: generateId(),
        menu_item_id: item.menu_item_id,
        name: menuItem.data.name,
        quantity: item.quantity,
        unit_price: itemPrice.unitPrice,
        total_price: itemPrice.totalPrice,
        modifiers: item.modifiers || [],
        special_instructions: item.special_instructions
      }

      const response = await this.apiClient.addOrderItem(orderId, cartItem)
      return response
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  // Additional methods...
}
```

#### OrderCalculationService
**Responsibility**: Price calculations, tax, and discount logic
**File**: `src/services/order/OrderCalculationService.ts`

```typescript
interface IOrderCalculationService {
  calculateItemPrice(menuItem: MenuItem, modifiers: ItemModifier[]): Promise<ItemPriceCalculation>
  calculateOrderSubtotal(items: OrderItem[]): Promise<number>
  calculateTax(subtotal: number, taxRate: number): Promise<number>
  applyDiscount(total: number, discount: DiscountRule): Promise<DiscountCalculation>
  calculateOrderTotal(order: Order): Promise<OrderTotalCalculation>
  validatePricing(order: Order): Promise<PricingValidation>
}

interface OrderTotalCalculation {
  subtotal: number
  tax: number
  discount: number
  total: number
  breakdown: PriceBreakdownItem[]
}

class OrderCalculationService implements IOrderCalculationService {
  constructor(private configService: ConfigService) {}

  async calculateOrderTotal(order: Order): Promise<OrderTotalCalculation> {
    const subtotal = await this.calculateOrderSubtotal(order.items)
    const taxRate = await this.configService.getTaxRate()
    const tax = await this.calculateTax(subtotal, taxRate)
    
    let discount = 0
    if (order.discount) {
      const discountCalculation = await this.applyDiscount(subtotal, order.discount)
      discount = discountCalculation.amount
    }

    const total = subtotal + tax - discount

    return {
      subtotal,
      tax,
      discount,
      total,
      breakdown: [
        { type: 'subtotal', amount: subtotal },
        { type: 'tax', amount: tax },
        { type: 'discount', amount: -discount },
        { type: 'total', amount: total }
      ]
    }
  }

  // Additional calculation methods...
}
```

### 2. Menu Browsing Services

#### MenuBrowsingService
**Responsibility**: Enhanced menu operations for POS interface
**File**: `src/services/menu/MenuBrowsingService.ts`

```typescript
interface IMenuBrowsingService {
  // Category management
  getMenuCategories(restaurantId: string): Promise<ApiResponse<MenuCategory[]>>
  getCategoryItems(categoryId: string): Promise<ApiResponse<MenuItem[]>>
  
  // Search and filtering
  searchMenuItems(query: string, filters: MenuSearchFilters): Promise<ApiResponse<MenuItem[]>>
  getPopularItems(restaurantId: string, limit?: number): Promise<ApiResponse<MenuItem[]>>
  
  // Item details
  getItemDetails(itemId: string): Promise<ApiResponse<MenuItemDetails>>
  getItemModifiers(itemId: string): Promise<ApiResponse<ItemModifier[]>>
  checkItemAvailability(itemId: string): Promise<ApiResponse<ItemAvailability>>
  
  // Real-time updates
  subscribeToMenuUpdates(restaurantId: string, callback: MenuUpdateCallback): void
  unsubscribeFromMenuUpdates(restaurantId: string): void
}

class MenuBrowsingService implements IMenuBrowsingService {
  constructor(
    private apiClient: MenuApiClient,
    private cacheService: CacheService,
    private webSocketService: MenuWebSocketService
  ) {}

  async searchMenuItems(
    query: string, 
    filters: MenuSearchFilters
  ): Promise<ApiResponse<MenuItem[]>> {
    try {
      // Check cache first for performance
      const cacheKey = `search:${query}:${JSON.stringify(filters)}`
      const cached = await this.cacheService.get(cacheKey)
      if (cached) {
        return { success: true, data: cached }
      }

      const response = await this.apiClient.searchItems({
        query,
        categories: filters.categories,
        dietary_restrictions: filters.dietaryRestrictions,
        price_range: filters.priceRange,
        availability_only: filters.availableOnly
      })

      if (response.success) {
        await this.cacheService.set(cacheKey, response.data, 300) // 5-minute cache
      }

      return response
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  // Additional methods...
}
```

### 3. Payment Integration Services

#### POSPaymentService
**Responsibility**: Payment processing integration with VP3350 and other methods
**File**: `src/services/payment/POSPaymentService.ts`

```typescript
interface IPOSPaymentService {
  // Payment processing
  processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult>
  processRefund(refundRequest: RefundRequest): Promise<RefundResult>
  processSplitPayment(splitRequest: SplitPaymentRequest): Promise<SplitPaymentResult>
  
  // Payment methods
  getAvailablePaymentMethods(): Promise<PaymentMethod[]>
  validatePaymentMethod(method: PaymentMethod, amount: number): Promise<ValidationResult>
  
  // Device management
  checkPaymentDeviceStatus(): Promise<DeviceStatus>
  initializePaymentDevice(): Promise<boolean>
}

class POSPaymentService implements IPOSPaymentService {
  constructor(
    private vp3350Bridge: VP3350POSBridge,
    private cashService: CashPaymentService,
    private digitalWalletService: DigitalWalletService
  ) {}

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate payment request
      const validation = await this.validatePaymentMethod(
        paymentRequest.method, 
        paymentRequest.amount
      )
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          transactionId: null
        }
      }

      // Route to appropriate payment processor
      switch (paymentRequest.method.type) {
        case PaymentMethodType.CARD:
          return await this.vp3350Bridge.processCardPayment(paymentRequest)
        
        case PaymentMethodType.CASH:
          return await this.cashService.processCashPayment(paymentRequest)
        
        case PaymentMethodType.DIGITAL_WALLET:
          return await this.digitalWalletService.processPayment(paymentRequest)
        
        default:
          throw new Error(`Unsupported payment method: ${paymentRequest.method.type}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        transactionId: null
      }
    }
  }

  // Additional methods...
}
```

## Context-Based State Management

### 1. OrderContext Architecture

#### OrderContext Structure
**File**: `src/context/order/OrderContext.tsx`

```typescript
interface OrderState {
  // Current order being built
  activeOrder: Order | null
  activeOrderId: string | null
  
  // Cart state
  cart: {
    items: OrderItem[]
    subtotal: number
    tax: number
    discount: number
    total: number
    itemCount: number
  }
  
  // UI state
  isLoading: boolean
  isProcessingPayment: boolean
  error: string | null
  
  // Order history and drafts
  orderHistory: Order[]
  draftOrders: Record<string, Order> // Keyed by table ID
  
  // Payment state
  paymentMethods: PaymentMethod[]
  selectedPaymentMethod: PaymentMethod | null
}

interface OrderContextValue {
  state: OrderState
  actions: {
    // Order management
    createOrder: (tableId: string, customerId?: string) => Promise<void>
    loadOrder: (orderId: string) => Promise<void>
    saveOrder: () => Promise<void>
    finalizeOrder: () => Promise<void>
    cancelOrder: (reason: string) => Promise<void>
    
    // Cart management
    addItem: (item: CartItemRequest) => Promise<void>
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>
    removeItem: (itemId: string) => Promise<void>
    clearCart: () => Promise<void>
    
    // Payment
    processPayment: (paymentRequest: PaymentRequest) => Promise<void>
    
    // Error handling
    clearError: () => void
  }
}
```

#### OrderReducer Pattern
**File**: `src/context/order/OrderReducer.ts`

```typescript
type OrderAction = 
  | { type: 'CREATE_ORDER_START' }
  | { type: 'CREATE_ORDER_SUCCESS'; payload: Order }
  | { type: 'CREATE_ORDER_ERROR'; payload: string }
  | { type: 'ADD_ITEM_START' }
  | { type: 'ADD_ITEM_SUCCESS'; payload: OrderItem }
  | { type: 'ADD_ITEM_ERROR'; payload: string }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ORDER_TOTALS'; payload: OrderTotalCalculation }
  | { type: 'PROCESS_PAYMENT_START' }
  | { type: 'PROCESS_PAYMENT_SUCCESS'; payload: PaymentResult }
  | { type: 'PROCESS_PAYMENT_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'CREATE_ORDER_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }

    case 'CREATE_ORDER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        activeOrder: action.payload,
        activeOrderId: action.payload.id,
        cart: {
          items: action.payload.items || [],
          subtotal: action.payload.subtotal || 0,
          tax: action.payload.tax || 0,
          discount: action.payload.discount || 0,
          total: action.payload.total || 0,
          itemCount: (action.payload.items || []).reduce((sum, item) => sum + item.quantity, 0)
        }
      }

    case 'ADD_ITEM_SUCCESS':
      const updatedItems = [...state.cart.items, action.payload]
      return {
        ...state,
        isLoading: false,
        cart: {
          ...state.cart,
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      }

    case 'UPDATE_ITEM_QUANTITY':
      const itemsAfterQuantityUpdate = state.cart.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return {
        ...state,
        cart: {
          ...state.cart,
          items: itemsAfterQuantityUpdate,
          itemCount: itemsAfterQuantityUpdate.reduce((sum, item) => sum + item.quantity, 0)
        }
      }

    case 'UPDATE_ORDER_TOTALS':
      return {
        ...state,
        cart: {
          ...state.cart,
          subtotal: action.payload.subtotal,
          tax: action.payload.tax,
          discount: action.payload.discount,
          total: action.payload.total
        }
      }

    // Additional cases...

    default:
      return state
  }
}
```

### 2. Integration with Existing Contexts

#### Context Composition Pattern
**File**: `src/context/AppProvider.tsx`

```typescript
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <TableProvider>
        <MenuProvider>
          <OrderProvider>
            <PaymentProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </PaymentProvider>
          </OrderProvider>
        </MenuProvider>
      </TableProvider>
    </AuthProvider>
  )
}

// Usage in navigation
const RootNavigator = () => (
  <AppProvider>
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  </AppProvider>
)
```

## Data Flow Architecture

### 1. Order Creation Flow

```
Table Selection → Order Creation → Menu Browsing → Cart Building → Payment → Receipt
     ↓                ↓               ↓               ↓            ↓          ↓
TableContext → OrderContext → MenuContext → OrderContext → Payment → Kitchen
```

#### Detailed Data Flow

1. **Table Selection**:
   ```typescript
   // TableContext action
   selectTable(table) → createOrderForTable(table.id) → OrderContext.createOrder()
   ```

2. **Order Creation**:
   ```typescript
   // OrderService call
   OrderService.createOrder(tableId) → API → WebSocket subscription → State update
   ```

3. **Menu Browsing**:
   ```typescript
   // MenuContext integration
   MenuService.getCategories() → MenuService.getItems() → Display in UI
   ```

4. **Item Addition**:
   ```typescript
   // Cart management
   addItem(item) → CartService.addItem() → OrderCalculation → State update
   ```

5. **Payment Processing**:
   ```typescript
   // Payment flow
   processPayment(request) → PaymentService → VP3350Bridge → Receipt generation
   ```

### 2. Real-Time Update Flow

```typescript
// WebSocket event handling
OrderWebSocketService.onOrderUpdate((order) => {
  OrderContext.dispatch({ type: 'ORDER_UPDATED', payload: order })
})

MenuWebSocketService.onItemAvailability((update) => {
  MenuContext.dispatch({ type: 'ITEM_AVAILABILITY_CHANGED', payload: update })
})

TableWebSocketService.onTableStatus((update) => {
  TableContext.dispatch({ type: 'TABLE_STATUS_CHANGED', payload: update })
})
```

## Performance Architecture

### 1. Component Optimization Patterns

#### Memoization Strategy
```typescript
// Menu item cards memoized for performance
const MenuItemCard = React.memo(({ item, onAddToCart, isInCart }) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(item, 1)
  }, [item, onAddToCart])

  return (
    <TouchableOpacity onPress={handleAddToCart}>
      {/* Card content */}
    </TouchableOpacity>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-renders
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isInCart === nextProps.isInCart &&
    prevProps.item.available === nextProps.item.available
  )
})
```

#### FlatList Optimization
```typescript
// Menu items grid with performance optimization
const MenuItemGrid = ({ items, onItemSelect }) => {
  const renderItem = useCallback(({ item }) => (
    <MenuItemCard 
      item={item}
      onAddToCart={onItemSelect}
      isInCart={cartItems.has(item.id)}
    />
  ), [onItemSelect, cartItems])

  const keyExtractor = useCallback((item) => item.id, [])
  
  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  }), [])

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      numColumns={getNumColumns()}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      updateCellsBatchingPeriod={50}
    />
  )
}
```

### 2. State Management Optimization

#### Selective Context Subscriptions
```typescript
// Custom hooks for selective context subscriptions
const useOrderCart = () => {
  const { state } = useOrder()
  return useMemo(() => ({
    items: state.cart.items,
    total: state.cart.total,
    itemCount: state.cart.itemCount
  }), [state.cart.items, state.cart.total, state.cart.itemCount])
}

const useOrderStatus = () => {
  const { state } = useOrder()
  return useMemo(() => ({
    isLoading: state.isLoading,
    error: state.error
  }), [state.isLoading, state.error])
}
```

#### Debounced Updates
```typescript
// Debounced order total calculations
const useDebouncedOrderCalculation = (order: Order) => {
  const [totals, setTotals] = useState<OrderTotalCalculation | null>(null)
  
  useEffect(() => {
    const calculateTotals = debounce(async () => {
      const calculation = await OrderCalculationService.calculateOrderTotal(order)
      setTotals(calculation)
    }, 300)
    
    calculateTotals()
    
    return () => calculateTotals.cancel()
  }, [order.items, order.discount])
  
  return totals
}
```

## Error Handling Architecture

### 1. Error Boundary Pattern

```typescript
// POS-specific error boundary
class POSErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    LoggingService.logError('POS_ERROR', error, errorInfo)
    
    // Attempt graceful recovery
    if (error.message.includes('payment')) {
      // Payment errors need special handling
      this.handlePaymentError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return <POSErrorFallback onRetry={this.handleRetry} />
    }
    
    return this.props.children
  }
}
```

### 2. Service-Level Error Handling

```typescript
// Standardized error handling pattern
abstract class BaseService {
  protected async handleServiceCall<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<ApiResponse<T>> {
    try {
      const result = await operation()
      return { success: true, data: result }
    } catch (error) {
      // Log error with context
      LoggingService.logError(context, error)
      
      // Determine error type and response
      if (error.code === 'NETWORK_ERROR') {
        return {
          success: false,
          error: 'Network connection failed. Please check your connection.',
          data: null
        }
      }
      
      if (error.code === 'VALIDATION_ERROR') {
        return {
          success: false,
          error: error.message,
          data: null,
          validationErrors: error.validationErrors
        }
      }
      
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        data: null
      }
    }
  }
}
```

## Security Architecture

### 1. Payment Security
- **PCI Compliance**: VP3350 device handles sensitive card data
- **Token-Based**: No sensitive payment data stored locally
- **Encryption**: All payment communications encrypted
- **Audit Trail**: Complete payment transaction logging

### 2. Order Security
- **Authorization**: Role-based access to order functions
- **Validation**: Server-side validation for all order operations
- **Audit Logging**: Order modifications tracked with user attribution
- **Data Integrity**: Order totals verified server-side

### 3. API Security
- **JWT Authentication**: All API calls authenticated with JWT tokens
- **Request Signing**: Critical operations signed with HMAC
- **Rate Limiting**: API rate limits prevent abuse
- **Input Validation**: All inputs validated and sanitized

## Testing Architecture

### 1. Service Layer Testing
```typescript
// Example service test
describe('OrderManagementService', () => {
  let service: OrderManagementService
  let mockApiClient: jest.Mocked<OrderApiClient>
  
  beforeEach(() => {
    mockApiClient = createMockApiClient()
    service = new OrderManagementService(mockApiClient, mockWebSocket, mockCalculation)
  })

  describe('createOrder', () => {
    it('should create order with valid table ID', async () => {
      // Arrange
      const tableId = 'table_123'
      const expectedOrder = createMockOrder({ table_id: tableId })
      mockApiClient.createOrder.mockResolvedValue({ success: true, data: expectedOrder })
      
      // Act
      const result = await service.createOrder(tableId)
      
      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.table_id).toBe(tableId)
      expect(mockApiClient.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ table_id: tableId })
      )
    })
  })
})
```

### 2. Context Testing
```typescript
// Example context test
describe('OrderContext', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <OrderProvider services={mockServices}>
        {ui}
      </OrderProvider>
    )
  }

  it('should add item to cart', async () => {
    // Arrange
    const TestComponent = () => {
      const { state, actions } = useOrder()
      return (
        <div>
          <span data-testid="cart-count">{state.cart.itemCount}</span>
          <button onClick={() => actions.addItem(mockCartItem)}>
            Add Item
          </button>
        </div>
      )
    }

    // Act
    const { getByTestId, getByText } = renderWithProvider(<TestComponent />)
    fireEvent.click(getByText('Add Item'))
    
    // Assert
    await waitFor(() => {
      expect(getByTestId('cart-count')).toHaveTextContent('1')
    })
  })
})
```

## Deployment Architecture

### 1. Bundle Structure
```
dist/
├── assets/
│   ├── images/
│   └── fonts/
├── js/
│   ├── main.js (Core app bundle)
│   ├── pos.js (POS-specific features)
│   └── vendor.js (Third-party libraries)
└── manifest.json
```

### 2. Performance Monitoring
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Performance Metrics**: Real User Monitoring (RUM)
- **Error Tracking**: Sentry or similar error tracking
- **Analytics**: Usage analytics for POS features

---

**Architecture Version**: 1.0  
**Last Updated**: 2025-08-11  
**Review Date**: 2025-09-11  
**Maintainer**: Claude Code  