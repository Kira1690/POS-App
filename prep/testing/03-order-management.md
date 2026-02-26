# Order Management Tests

## Screens Covered
- `OrderManagementScreen` — order list + search + filters
- `OrdersDashboard` — analytics + order cards
- `OrderDetails` — single order view (status, items, actions)
- `Ordering` screen — item selection POS interface
- `UnifiedOrderContext` — single source of truth for all order state
- `UnifiedOrderStorageService` — SQLite persistence for orders

## Status Flow (enforced by system)
```
draft → confirmed → preparing → ready → served → paid
                                              ↓
                                          cancelled (any stage)
```
> Kitchen is the ONLY source of status updates (except payment).
> Payment button only appears after status = "served".

---

## Unit Tests (Jest)

### UnifiedOrderStorageService
| Test | Description | Status |
|------|-------------|--------|
| `saveOrder()` inserts row into orders table | Mock DB, check INSERT called | pending |
| `saveOrder()` inserts all order_items rows | 3 items → 3 rows | pending |
| `getOrderById()` returns assembled Order with items | SELECT + JOIN | pending |
| `getActiveOrders()` excludes paid and cancelled | 5 orders, 2 paid → 3 returned | pending |
| `updateOrderStatus()` changes status field only | SELECT before/after | pending |
| `updateOrderStatus()` blocked for invalid transition | confirmed → served should fail | pending |
| `deleteOrder()` removes order and all its items | Cascade check | pending |
| `getOrdersByTable()` returns orders for specific tableId | Multiple tables | pending |

### UnifiedOrderContext (reducer)
| Test | Description | Status |
|------|-------------|--------|
| `createOrder` action adds order to state | Dispatch, check state | pending |
| `updateOrder` action replaces order in list | Same orderId | pending |
| `cancelOrder` sets status to cancelled | Check status field | pending |
| `setSearchQuery` filters orders by number | "001" matches ORD-001 | pending |
| `setSearchQuery` filters by table name | "Table 5" matches | pending |
| `setSearchQuery` filters by special instructions | "no onion" matches | pending |
| `setStatusFilter('paid')` shows only paid orders | 3 paid + 2 others → 3 | pending |
| `setStatusFilter('active')` shows draft+confirmed+preparing+ready+served | pending |
| `setPaymentStatusFilter('unpaid')` shows orders with payment_status=pending | pending |
| Payment blocked when order status ≠ served | Attempt to pay 'preparing' order | pending |

### Order calculations
| Test | Description | Status |
|------|-------------|--------|
| subtotal = sum of (item.base_price + item.modifier_total) × item.quantity | 2 items | pending |
| tax_amount = subtotal × tax_rate | 8.25% example | pending |
| discount_amount calculated for percentage discount | 10% off $100 = $10 | pending |
| discount_amount calculated for fixed discount | $5 off | pending |
| total = subtotal + tax - discount + tip | Full calculation | pending |
| Order number format = "ORD-" + padded sequential number | pending |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| OrderManagementScreen renders with no orders | Empty state visible | pending |
| OrderManagementScreen renders with 3 orders | 3 cards visible | pending |
| Search input filters list in real time | Type "T-05", only table 5 orders shown | pending |
| Status filter "draft" shows only drafts | Tap Draft chip, list updates | pending |
| Status filter "all" resets filter | Tap All chip | pending |
| Payment filter "paid" shows paid orders only | Tap Paid chip | pending |
| "+ New Order" button opens table selection | fireEvent.press, modal/nav opens | pending |
| Refresh button calls refreshOrders() | Mock context, assert called | pending |
| OrdersDashboard analytics cards show correct totals | Inject 5 orders, check $values | pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Order Management tab loads from Dashboard | `full_offline_test.yaml` step 02 | **passing** |
| Order Management shows "No Orders Found" empty state | assert visible | **passing** |
| "+ New Order" button is visible | assert "New Order" visible | **passing** |
| Create a new order from table selection | `pending/create_order_offline.yaml` | pending |
| Add items to order from menu | `pending/add_items_to_order.yaml` | pending |
| Confirm order — moves to confirmed status | `pending/confirm_order.yaml` | pending |
| View order details | `pending/view_order_details.yaml` | pending |
| Cancel order with reason | `pending/cancel_order.yaml` | pending |
| Search for order by number | `pending/search_order.yaml` | pending |
| Filter orders by status chip | `pending/filter_orders.yaml` | pending |
| Order persists after app restart | `pending/order_persistence.yaml` | pending |
| Kitchen ticket created when order confirmed | Check Kitchen Display after confirm | pending |

---

## E2E Tests — Online (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Create order syncs to backend | `online/create_order_online.yaml` | pending |
| Backend status update reflected in app | Real-time via WebSocket | pending |
| Order conflict resolution (same table, 2 devices) | pending |
| Payment processed online and receipt returned | pending |

---

## Acceptance Criteria

- [ ] Orders can be created offline and persist in SQLite
- [ ] Status flow is strictly enforced (no skipping steps)
- [ ] Payment only becomes available after "served" status
- [ ] Kitchen ticket is created when order is confirmed
- [ ] Search works across order number, table name, and instructions
- [ ] All status filters show correct counts
- [ ] Orders sync to backend when connectivity is restored
