# Dashboard Tests

## Screens Covered
- `DashboardScreen` — manager KPI overview (Today's Sales, Active Orders, Revenue, Avg Order Value)
- `ManagerDashboard` — sidebar + sales chart + recent orders
- `StaffDashboard` — shift metrics + tasks + quick actions
- `KitchenDashboard` — priority queue + active ticket grid
- Bottom tabs navigation

---

## Unit Tests (Jest)

### DashboardScreen calculations
| Test | Description | Status |
|------|-------------|--------|
| Today's sales = sum of all paid orders' totalAmount | Mock orders with mixed statuses | pending |
| Active orders count = non-terminal orders only | draft, confirmed, preparing, ready, served count; paid and cancelled excluded | pending |
| Avg order value = totalSales / paidOrderCount | Edge: 0 orders returns 0 | pending |
| Sales target progress = todaysSales / 5000 capped at 1 | 0%, 50%, 100%, overflow | pending |
| Order completion rate = servedOrders / totalOrders | Edge: 0 orders | pending |
| Table utilisation = occupied / total | Edge: 0 tables | pending |
| Time greeting — "Good Morning" before 12:00 | Mock Date | pending |
| Time greeting — "Good Afternoon" 12:00–17:00 | same | pending |
| Time greeting — "Good Evening" after 17:00 | same | pending |
| Status pill "Kitchen warning" when pendingTickets > 0 | Mock kitchenStats | pending |
| Status pill "Tables warning" when availableTables ≤ 2 | Mock tableStats | pending |

### ManagerDashboard
| Test | Description | Status |
|------|-------------|--------|
| Recent orders list shows last 5 orders sorted by created_at desc | Mock 10 orders | pending |
| Status color mapping — confirmed→info, preparing→warning, ready→success | Check each mapping | pending |
| Notification badge shows kitchenStats.overdueCount | Mock context | pending |
| Notification badge hidden when overdueCount = 0 | same | pending |
| Chart data built from last 7 calendar days | Mock Date + orders | pending |

### StaffDashboard
| Test | Description | Status |
|------|-------------|--------|
| My Orders Today — filters orders to current user only | Mock userId match | pending |
| Total amount = sum of todayOrder.totalAmount | 3 orders example | pending |
| Avg order value = total / count | Edge: 0 orders | pending |
| Table Status — counts from tableStats | Mock provider | pending |
| Task list renders all 3 static tasks with correct priority colors | Snapshot | pending |

### KitchenDashboard
| Test | Description | Status |
|------|-------------|--------|
| Priority orders = isOverdue OR isRush OR priority=urgent | Filter logic unit test | pending |
| Priority orders capped at 4 items displayed | 10 priority tickets → 4 shown | pending |
| Active queue = pending + preparing + ready only | served/cancelled excluded | pending |
| Active queue capped at 8 | More than 8 tickets → 8 shown | pending |
| Station pills built from distinct stations in tickets | 3 tickets → 2 stations | pending |
| Station count = tickets per station | pending |
| Item list truncated to 3 for priority cards | 5 items → shows 3 + "+2 more" | pending |
| Item list truncated to 4 for active cards | same pattern | pending |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| DashboardScreen renders with empty orders context | No crash, shows $0 values | pending |
| DashboardScreen renders with 5 paid orders | KPIs update correctly | pending |
| ManagerDashboard sidebar collapse/expand toggle | Tap collapse button, sidebar width changes | pending |
| ManagerDashboard "New Order" quick action navigates to table selection | fireEvent.press | pending |
| ManagerDashboard "View Tables" navigates to Table Management | same | pending |
| ManagerDashboard "Kitchen" navigates to Kitchen Display | same | pending |
| StaffDashboard "New Order" quick action triggers navigation | same | pending |
| StaffDashboard bottom tab "Tables" switches view | tap tab, screen changes | pending |
| KitchenDashboard refresh button calls refreshTickets() | fireEvent.press, assert mock called | pending |
| KitchenDashboard pull-to-refresh calls refreshTickets() | simulate pull | pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Manager sees Dashboard tab after login | `full_offline_test.yaml` (step 01) | **passing** |
| Manager Dashboard shows Key Metrics cards | assert "Key Metrics" visible | **passing** |
| Manager Dashboard shows Analytics Overview | assert "Analytics Overview" visible | **passing** |
| Sidebar navigation — tap "Orders" in sidebar | pending |
| Sidebar navigation — tap "Tables" in sidebar | pending |
| Sidebar navigation — tap "Kitchen" in sidebar | pending |
| Staff login → Staff Dashboard renders | pending |
| Kitchen staff login → Kitchen Dashboard renders | pending |
| Dashboard refresh button does not crash offline | pending |

---

## E2E Tests — Online (Maestro)

| Test | Flow file | Status |
|------|-------------|--------|
| Real order data appears in Today's Sales | `online/dashboard_real_data.yaml` | pending |
| Active order count matches backend | same | pending |
| Chart shows 7-day real data | same | pending |
| Notification badge shows real overdue count | same | pending |

---

## Acceptance Criteria

- [ ] All KPI calculations are accurate (verified by unit tests)
- [ ] All three dashboards (Manager, Staff, Kitchen) render without crash
- [ ] Sidebar toggle works on phone and tablet layouts
- [ ] Dashboard refreshes data on focus (useFocusEffect)
- [ ] Empty states show correctly when no orders/tickets exist
