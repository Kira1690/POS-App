# Order Management - Implementation Phases

## Overview

This document outlines the phased implementation approach for the Order Management system. The implementation is divided into 6 phases, designed to deliver incremental value while maintaining system stability.

---

## Implementation Timeline

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    IMPLEMENTATION TIMELINE                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  PHASE 1          PHASE 2          PHASE 3          PHASE 4          PHASE 5          PHASE 6          │
│  Foundation       Menu & Cart      Kitchen          Billing          Integration      Polish            │
│                                                                                                          │
│  ████████████     ████████████     ████████████     ████████████     ████████████     ████████████     │
│  ████████████     ████████████     ████████████     ████████████     ████████████     ████████████     │
│                                                                                                          │
│  Week 1           Week 1-2         Week 2-3         Week 3-4         Week 4           Week 4-5         │
│  (5 days)         (7 days)         (6 days)         (7 days)         (4 days)         (5 days)         │
│                                                                                                          │
│  • Data types     • Menu display   • Ticket gen     • Bill screen    • Dashboard      • Testing        │
│  • Storage        • Modifiers      • Station view   • Split types    • Analytics      • Bug fixes      │
│  • Context        • Cart logic     • Status flow    • Payments       • Real-time      • Performance    │
│  • Navigation     • Combos         • Allergens      • Receipts       • Sync           • Documentation  │
│                                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (Week 1)

### Objectives
- Set up core data types and interfaces
- Implement AsyncStorage services
- Create enhanced Order Context
- Set up navigation structure

### Tasks

#### 1.1 Data Types & Interfaces
```
Files to Create:
├── src/types/order-extended.types.ts       # Enhanced order types
├── src/types/kitchen-ticket.types.ts       # Kitchen ticket types
├── src/types/billing.types.ts              # Billing & split types
└── src/types/payment-extended.types.ts     # Enhanced payment types
```

**Deliverables:**
- [ ] Complete `Order` interface with full modifier support
- [ ] Complete `OrderItem` interface with modifiers, allergens, kitchen station
- [ ] Complete `KitchenTicket` and `KitchenTicketItem` interfaces
- [ ] Complete `BillSplit`, `GuestSplit`, `PaymentMethodSplit` interfaces
- [ ] Type exports and barrel files

#### 1.2 Storage Services
```
Files to Create:
├── src/services/storage/OrderStorageService.ts
├── src/services/storage/KitchenStorageService.ts
├── src/services/storage/PaymentStorageService.ts
└── src/services/storage/SyncQueueService.ts
```

**Deliverables:**
- [ ] `OrderStorageService` with CRUD for orders
- [ ] Draft order support (unsent orders)
- [ ] `KitchenStorageService` for ticket persistence
- [ ] `SyncQueueService` for future API sync
- [ ] Storage key constants

#### 1.3 Enhanced Order Context
```
Files to Create/Modify:
├── src/context/order/OrderContext.tsx      # Refactor
├── src/context/order/orderReducer.ts       # New reducer
├── src/context/order/orderActions.ts       # Action creators
└── src/context/order/orderSelectors.ts     # Memoized selectors
```

**Deliverables:**
- [ ] New state structure with cart, orders, kitchen tickets
- [ ] Actions for cart management with modifiers
- [ ] Actions for order submission and status updates
- [ ] Integration with storage services
- [ ] Backward compatibility with existing screens

#### 1.4 Navigation Setup
```
Files to Modify:
├── src/navigation/OrdersStackNavigator.tsx
├── src/navigation/MainNavigator.tsx
└── src/navigation/navigationTypes.ts
```

**Deliverables:**
- [ ] New routes for ordering, bill, bill split screens
- [ ] Navigation params type definitions
- [ ] Screen placeholder components

### Phase 1 Acceptance Criteria
- [ ] All new types compile without errors
- [ ] Storage services read/write correctly
- [ ] Order context provides new state shape
- [ ] Navigation to new screens works
- [ ] Existing functionality not broken

---

## Phase 2: Menu Integration & Cart (Week 1-2)

### Objectives
- Build new Ordering Screen with menu integration
- Implement modifier selection flow
- Implement combo selection flow
- Build enhanced cart with modifier display

### Tasks

#### 2.1 Ordering Screen Layout
```
Files to Create:
├── src/screens/orders/OrderingScreen.tsx
├── src/screens/orders/components/
│   ├── CategorySidebar.tsx
│   ├── MenuItemGrid.tsx
│   ├── MenuItemCard.tsx
│   ├── OrderHeader.tsx
│   └── QuickSearchBar.tsx
```

**Deliverables:**
- [ ] Three-column layout (sidebar, grid, cart)
- [ ] Category sidebar from MenuContext
- [ ] Menu item grid with dietary tags
- [ ] Header with table info and actions
- [ ] Search functionality

#### 2.2 Modifier Selection Modal
```
Files to Create:
├── src/screens/orders/modals/ModifierSelectionModal.tsx
├── src/screens/orders/components/
│   ├── ModifierGroup.tsx
│   ├── ModifierOption.tsx
│   ├── QuantitySelector.tsx
│   └── SpecialInstructionsInput.tsx
```

**Deliverables:**
- [ ] Modal with item details and image
- [ ] Required/optional modifier groups
- [ ] Single/multiple selection support
- [ ] Price adjustment display
- [ ] Quantity selection
- [ ] Special instructions input
- [ ] Real-time item total calculation

#### 2.3 Combo Selection Modal
```
Files to Create:
├── src/screens/orders/modals/ComboSelectionModal.tsx
├── src/screens/orders/components/
│   ├── ComboItemSelector.tsx
│   └── ComboSummary.tsx
```

**Deliverables:**
- [ ] Combo details display
- [ ] Step-by-step item selection
- [ ] Substitution options with price adjustments
- [ ] Savings display
- [ ] Validation (all required selections)

#### 2.4 Enhanced Cart
```
Files to Create:
├── src/screens/orders/components/
│   ├── OrderCart.tsx
│   ├── CartItemRow.tsx
│   ├── CartItemModifiers.tsx
│   ├── CartSummary.tsx
│   └── CartActions.tsx
```

**Deliverables:**
- [ ] Cart with full modifier display
- [ ] Inline quantity adjustment
- [ ] Edit modifiers option
- [ ] Remove item with confirmation
- [ ] Subtotal, tax, total calculation
- [ ] "Send to Kitchen" button
- [ ] "View Bill" button

#### 2.5 Menu Context Integration
```
Files to Modify:
├── src/screens/orders/OrderingScreen.tsx
└── src/context/order/OrderContext.tsx
```

**Deliverables:**
- [ ] Subscribe to menu changes
- [ ] Handle price updates in cart
- [ ] Handle item unavailability
- [ ] Real-time sync with MenuContext

### Phase 2 Acceptance Criteria
- [ ] Can browse menu items by category
- [ ] Can add items with modifiers to cart
- [ ] Can add combos to cart
- [ ] Cart displays all modifiers correctly
- [ ] Can edit/remove cart items
- [ ] Totals calculate correctly with modifiers
- [ ] Menu changes reflect in ordering screen

---

## Phase 3: Kitchen Integration (Week 2-3)

### Objectives
- Implement ticket generation from orders
- Build multi-station kitchen display
- Implement status flow (pending → preparing → ready)
- Add allergen warnings

### Tasks

#### 3.1 Ticket Routing Engine
```
Files to Create:
├── src/services/kitchen/TicketRoutingService.ts
├── src/services/kitchen/StationConfigService.ts
├── src/config/kitchenStations.ts
└── src/services/kitchen/PrepTimeService.ts
```

**Deliverables:**
- [ ] Category to station mapping
- [ ] Ticket generation from order
- [ ] Priority calculation
- [ ] Prep time estimation
- [ ] Allergen flag propagation

#### 3.2 Kitchen Context
```
Files to Create:
├── src/context/kitchen/KitchenContext.tsx
├── src/context/kitchen/kitchenReducer.ts
├── src/context/kitchen/kitchenActions.ts
└── src/context/kitchen/kitchenSelectors.ts
```

**Deliverables:**
- [ ] Ticket state by station
- [ ] Status update actions
- [ ] Filtering and sorting
- [ ] Stats calculation (pending, preparing, ready)

#### 3.3 Kitchen Display Screen
```
Files to Create:
├── src/screens/kitchen/KitchenDisplayScreen.tsx
├── src/screens/kitchen/components/
│   ├── StationTabs.tsx
│   ├── TicketKanban.tsx
│   ├── TicketColumn.tsx
│   ├── TicketCard.tsx
│   ├── TicketItemRow.tsx
│   ├── PrepTimer.tsx
│   ├── AllergenBadge.tsx
│   └── KitchenStats.tsx
```

**Deliverables:**
- [ ] Station tabs with counts
- [ ] Kanban columns (Pending, Preparing, Ready)
- [ ] Ticket cards with full details
- [ ] Modifier display on items
- [ ] Allergen warnings (prominent)
- [ ] Prep time countdown
- [ ] Overdue indicators

#### 3.4 Status Flow & Actions
```
Files to Create:
├── src/screens/kitchen/components/
│   ├── TicketActions.tsx
│   ├── ItemStatusToggle.tsx
│   └── DelayReasonModal.tsx
```

**Deliverables:**
- [ ] Start ticket (pending → preparing)
- [ ] Mark item ready
- [ ] Mark all ready
- [ ] Delay with reason
- [ ] Mark served

#### 3.5 Kitchen-Order Sync
```
Files to Create:
├── src/services/kitchen/KitchenOrderSyncService.ts
├── src/services/kitchen/KitchenEventService.ts
```

**Deliverables:**
- [ ] Order status updates from kitchen
- [ ] Item status sync
- [ ] Order ready notification
- [ ] Event emission for dashboard

#### 3.6 Send to Kitchen Flow
```
Files to Create:
├── src/screens/orders/modals/SendToKitchenModal.tsx
```

**Deliverables:**
- [ ] Confirmation dialog
- [ ] Station breakdown preview
- [ ] Allergen summary
- [ ] Print KOT option
- [ ] Success feedback

### Phase 3 Acceptance Criteria
- [ ] Orders generate correct tickets by station
- [ ] Kitchen display shows all stations
- [ ] Tickets display modifiers and allergens
- [ ] Status updates flow correctly
- [ ] Order status syncs with kitchen
- [ ] Prep timers work correctly

---

## Phase 4: Billing & Payment (Week 3-4)

### Objectives
- Build bill presentation screen
- Implement all three split types
- Integrate payment processing
- Generate receipts

### Tasks

#### 4.1 Bill Screen
```
Files to Create:
├── src/screens/billing/BillScreen.tsx
├── src/screens/billing/components/
│   ├── BillHeader.tsx
│   ├── BillItemList.tsx
│   ├── BillItemRow.tsx
│   ├── BillSummary.tsx
│   └── BillActions.tsx
```

**Deliverables:**
- [ ] Itemized bill with modifiers
- [ ] Clear pricing breakdown
- [ ] Subtotal, tax, total
- [ ] Discount display (if applied)
- [ ] Action buttons (discount, tip, split, pay)

#### 4.2 Bill Split Context
```
Files to Create:
├── src/context/billing/BillSplitContext.tsx
├── src/context/billing/billSplitReducer.ts
├── src/services/billing/EqualSplitCalculator.ts
├── src/services/billing/ItemSplitCalculator.ts
└── src/services/billing/PaymentSplitValidator.ts
```

**Deliverables:**
- [ ] Split state management
- [ ] Equal split calculation
- [ ] Item split calculation with shared items
- [ ] Payment split validation
- [ ] Rounding handling

#### 4.3 Equal Split UI
```
Files to Create:
├── src/screens/billing/BillSplitScreen.tsx
├── src/screens/billing/components/
│   ├── SplitTypeSelector.tsx
│   ├── EqualSplitView.tsx
│   ├── GuestCountSelector.tsx
│   └── GuestPaymentList.tsx
```

**Deliverables:**
- [ ] Guest count selection
- [ ] Amount per person display
- [ ] Individual payment processing
- [ ] Payment method per guest
- [ ] Progress tracking

#### 4.4 Item Split UI
```
Files to Create:
├── src/screens/billing/components/
│   ├── ItemSplitView.tsx
│   ├── GuestSelector.tsx
│   ├── ItemAssignmentList.tsx
│   ├── SharedItemModal.tsx
│   └── GuestSummaryCard.tsx
```

**Deliverables:**
- [ ] Guest creation/management
- [ ] Item assignment by tapping
- [ ] Shared item splitting
- [ ] Proportional tax calculation
- [ ] Per-guest summary

#### 4.5 Payment Method Split UI
```
Files to Create:
├── src/screens/billing/components/
│   ├── PaymentSplitView.tsx
│   ├── PaymentMethodCard.tsx
│   └── SplitValidation.tsx
```

**Deliverables:**
- [ ] Add multiple payment methods
- [ ] Amount input per method
- [ ] Remaining balance display
- [ ] Validation messages
- [ ] Sequential processing

#### 4.6 Payment Processing Integration
```
Files to Modify:
├── src/context/payment/PaymentContext.tsx
├── src/screens/payment/PaymentProcessingScreen.tsx
```

**Deliverables:**
- [ ] Split payment support
- [ ] Partial payment tracking
- [ ] Cash change calculation
- [ ] Card processing
- [ ] Payment success/failure handling

#### 4.7 Receipt Generation
```
Files to Create:
├── src/services/receipt/ReceiptService.ts
├── src/services/receipt/ReceiptTemplates.ts
├── src/screens/billing/components/
│   └── ReceiptPreview.tsx
```

**Deliverables:**
- [ ] Full receipt format
- [ ] Split receipt format
- [ ] Print integration
- [ ] Email receipt option

### Phase 4 Acceptance Criteria
- [ ] Bill displays correctly with modifiers
- [ ] Equal split calculates correctly
- [ ] Item split assigns and calculates correctly
- [ ] Payment method split works
- [ ] All payment types process correctly
- [ ] Receipts generate for all scenarios

---

## Phase 5: Integration & Dashboard (Week 4)

### Objectives
- Connect to Dashboard for analytics
- Implement real-time updates
- Add order history and search
- Prepare for API integration

### Tasks

#### 5.1 Dashboard Integration
```
Files to Create/Modify:
├── src/screens/dashboard/components/
│   ├── OrderStats.tsx
│   ├── RevenueWidget.tsx
│   ├── PopularItemsWidget.tsx
│   └── KitchenPerformance.tsx
```

**Deliverables:**
- [ ] Active orders count
- [ ] Today's revenue
- [ ] Popular items tracking
- [ ] Average prep time
- [ ] Table turnover stats

#### 5.2 Event System
```
Files to Create:
├── src/services/events/OrderEventService.ts
├── src/services/events/EventTypes.ts
```

**Deliverables:**
- [ ] Order created event
- [ ] Order completed event
- [ ] Item added event
- [ ] Payment received event
- [ ] Dashboard subscription

#### 5.3 Order Management Enhancements
```
Files to Modify:
├── src/screens/orders/OrderManagementScreen.tsx
├── src/screens/orders/components/
│   ├── OrderList.tsx
│   ├── OrderCard.tsx
│   ├── OrderFilters.tsx
│   └── OrderSearch.tsx
```

**Deliverables:**
- [ ] Enhanced order list
- [ ] Filter by status, date, table
- [ ] Search by order number
- [ ] Quick actions on cards
- [ ] Order timeline view

#### 5.4 Real-Time Updates
```
Files to Create:
├── src/hooks/useRealTimeOrders.ts
├── src/hooks/useRealTimeKitchen.ts
```

**Deliverables:**
- [ ] Auto-refresh order list
- [ ] Kitchen status polling
- [ ] Optimistic updates
- [ ] Conflict resolution

#### 5.5 Table Integration
```
Files to Modify:
├── src/context/table/TableContext.tsx
├── src/screens/tables/TableManagementScreen.tsx
```

**Deliverables:**
- [ ] Table status sync with orders
- [ ] Quick "Add Items" from occupied table
- [ ] View order from table
- [ ] Release table on payment

#### 5.6 API Preparation
```
Files to Create:
├── src/services/api/OrderApiService.ts
├── src/services/api/KitchenApiService.ts
├── src/services/api/PaymentApiService.ts
```

**Deliverables:**
- [ ] API service interfaces
- [ ] Mock implementations
- [ ] Sync queue integration
- [ ] Error handling patterns

### Phase 5 Acceptance Criteria
- [ ] Dashboard shows real-time stats
- [ ] Order management has full features
- [ ] Table integration works seamlessly
- [ ] API service structure ready
- [ ] Sync queue tracks changes

---

## Phase 6: Polish & Testing (Week 4-5)

### Objectives
- Comprehensive testing
- Bug fixes and edge cases
- Performance optimization
- Documentation

### Tasks

#### 6.1 Unit Testing
```
Test Files to Create:
├── src/services/billing/__tests__/
├── src/services/kitchen/__tests__/
├── src/context/order/__tests__/
└── src/context/kitchen/__tests__/
```

**Deliverables:**
- [ ] Calculator service tests
- [ ] Context action tests
- [ ] Storage service tests
- [ ] 80%+ code coverage

#### 6.2 Integration Testing
```
Test Files to Create:
├── src/screens/orders/__tests__/
├── src/screens/billing/__tests__/
└── src/screens/kitchen/__tests__/
```

**Deliverables:**
- [ ] Order flow tests
- [ ] Kitchen flow tests
- [ ] Payment flow tests
- [ ] Split bill tests

#### 6.3 Edge Case Handling
```
Areas to Test:
- Zero quantity items
- Negative modifiers
- Empty orders
- Partial payments
- Rounding edge cases
- Large orders (50+ items)
- Network failures
- Storage full scenarios
```

**Deliverables:**
- [ ] Edge case documentation
- [ ] Error boundary implementation
- [ ] Graceful degradation
- [ ] User-friendly error messages

#### 6.4 Performance Optimization
```
Areas to Optimize:
- List virtualization
- Memoization
- Re-render prevention
- Storage batch operations
- Image loading
```

**Deliverables:**
- [ ] < 100ms order screen render
- [ ] < 50ms cart update
- [ ] Smooth scrolling (60fps)
- [ ] Memory leak fixes

#### 6.5 Accessibility
```
Areas to Address:
- Screen reader support
- Keyboard navigation
- Color contrast
- Touch targets
- Focus management
```

**Deliverables:**
- [ ] WCAG 2.1 AA compliance
- [ ] Accessibility labels
- [ ] High contrast support

#### 6.6 Documentation
```
Documentation to Create:
├── docs/
│   ├── order-management-guide.md
│   ├── kitchen-display-guide.md
│   ├── bill-splitting-guide.md
│   └── api-integration-guide.md
```

**Deliverables:**
- [ ] User guides
- [ ] API integration guide
- [ ] Troubleshooting guide
- [ ] Code documentation

### Phase 6 Acceptance Criteria
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Accessibility audit passed
- [ ] Documentation complete

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Legacy code conflicts | High | Keep legacy screens as fallback, gradual migration |
| Performance issues | Medium | Continuous profiling, early optimization |
| Data migration | Medium | Automated migration scripts, data validation |
| Storage limits | Low | Implement data cleanup, compression |

### Timeline Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict scope control, defer non-essential features |
| Integration delays | Medium | Mock services, parallel development |
| Testing bottleneck | Medium | Start testing early, automated tests |

---

## Success Metrics

### Functional
- [ ] Complete order flow works end-to-end
- [ ] All three split types function correctly
- [ ] Kitchen receives and processes tickets
- [ ] Payments complete successfully

### Performance
- [ ] Order screen loads in < 100ms
- [ ] Cart updates in < 50ms
- [ ] Kitchen display updates in real-time
- [ ] No UI jank during scrolling

### Quality
- [ ] 80%+ test coverage
- [ ] No critical bugs
- [ ] All edge cases handled
- [ ] Accessibility compliant

### User Experience
- [ ] Max 3 taps to add item with modifiers
- [ ] Clear feedback on all actions
- [ ] Intuitive split bill flow
- [ ] Fast payment processing

---

## Related Documents

- [Master Plan](./plan.md)
- [User Flow Documentation](./user-flow.md)
- [Wireframes](./wireframes.md)
- [Data Flow Architecture](./data-flow.md)
- [Kitchen Integration](./kitchen-integration.md)
- [Bill Splitting](./bill-splitting.md)
- [Progress Tracking](./progress.md)
