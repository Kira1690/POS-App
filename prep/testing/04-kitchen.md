# Kitchen Tests

## Screens Covered
- `KitchenDisplayScreen` — live ticket grid, station tabs, status updates
- `KitchenTicketCard` — individual ticket with timer, items, actions
- `EnhancedKitchenContext` — kitchen state, ticket routing, stats
- `KitchenStorageService` — SQLite persistence for kitchen tickets

## Ticket Status Flow
```
pending → preparing → ready → served
                           ↓
                       cancelled (any stage)
```
> Kitchen staff update ticket status. Orders can only advance one step at a time.

---

## Unit Tests (Jest)

### KitchenStorageService
| Test | Description | Status |
|------|-------------|--------|
| `saveTicket()` inserts row into kitchen_tickets table | Mock DB, check INSERT called | pending |
| `saveTicket()` inserts all ticket_items rows | 3 items → 3 rows | pending |
| `getTicketById()` returns assembled ticket with items | SELECT + JOIN | pending |
| `getActiveTickets()` excludes served and cancelled | 5 tickets, 2 served → 3 returned | pending |
| `updateTicketStatus()` changes status field only | SELECT before/after | pending |
| `updateTicketStatus()` blocked for invalid transition | pending → ready should fail | pending |
| `getTicketsByStation()` returns tickets for specific station | Multiple stations | pending |
| `getOverdueTickets()` returns tickets past elapsed time threshold | Mock Date | pending |
| `initialize()` seeds empty DB — no duplicate seed on second call | Call twice, check row count | pending |

### EnhancedKitchenContext (reducer)
| Test | Description | Status |
|------|-------------|--------|
| `addTicket` action adds ticket to state | Dispatch, check state | pending |
| `updateTicketStatus` action changes status in list | Same ticketId | pending |
| `removeTicket` removes ticket from state | Check list length | pending |
| `setSelectedStation` updates active station filter | Check filter | pending |
| Tickets filtered by station — "Grill" station shows only grill tickets | pending |
| Priority queue: isOverdue OR isRush OR priority=urgent → priorityTickets | pending |
| Priority tickets capped at 4 in state selector | 10 urgent → 4 shown | pending |
| `refreshTickets()` fetches from storage and updates state | Mock storage | pending |
| overdueCount increments when elapsed > threshold | Mock timer | pending |

### KitchenTicketCard calculations
| Test | Description | Status |
|------|-------------|--------|
| Elapsed time string — "2m 30s" format | Mock Date | pending |
| Elapsed time string — ">60 min" for very old tickets | pending |
| isOverdue returns true when elapsed > 20 minutes | pending |
| isRush returns true when priority = "urgent" | pending |
| Item modifiers rendered as comma-separated string | 3 modifiers | pending |
| Items truncated to 3 + "+N more" for priority cards | 5 items → 3 + "+2 more" | pending |
| Items truncated to 4 + "+N more" for active cards | 6 items → 4 + "+2 more" | pending |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| KitchenDisplayScreen renders with no tickets | Empty state visible | pending |
| KitchenDisplayScreen renders with 3 active tickets | 3 cards visible | pending |
| Station tabs render from distinct stations in tickets | 2 stations → 2 tabs | pending |
| Tapping station tab filters ticket list | Tap "Grill", only grill tickets shown | pending |
| "All Stations" tab resets filter | Tap All, all tickets shown | pending |
| "Start" button on pending ticket calls updateTicketStatus("preparing") | fireEvent.press | pending |
| "Ready" button on preparing ticket calls updateTicketStatus("ready") | fireEvent.press | pending |
| Overdue ticket card shows overdue indicator/color | elapsed > 20min | pending |
| Rush/urgent ticket shows priority badge | priority="urgent" | pending |
| Refresh button calls refreshTickets() | Mock context, assert called | pending |
| Pull-to-refresh calls refreshTickets() | Simulate pull | pending |
| KitchenDashboard priority queue shows up to 4 cards | 10 urgent → 4 shown | pending |
| KitchenDashboard active queue shows up to 8 cards | 12 active → 8 shown | pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Kitchen tab loads from Dashboard | `full_offline_test.yaml` step 03 | **passing** |
| Kitchen Display shows correct screen title | assert "Kitchen Display" visible | **passing** |
| Kitchen Display shows empty state when no tickets | assert empty/no cards | pending |
| Ticket appears when order is confirmed from Order Management | Create order → confirm → check Kitchen | pending |
| Tap "Start" on ticket — status changes to "preparing" | assert card state change | pending |
| Tap "Ready" on ticket — status changes to "ready" | assert card state change | pending |
| Overdue indicator appears after threshold elapsed | pending |
| Station tab filter shows correct subset of tickets | pending |
| Pull-to-refresh does not crash offline | pending |

---

## E2E Tests — Online (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Ticket received via WebSocket when order placed on another device | `online/kitchen_websocket.yaml` | pending |
| Status update syncs to backend when kitchen marks ready | pending |
| Real overdue count shows on Manager Dashboard badge | pending |

---

## Acceptance Criteria

- [ ] Kitchen tickets appear immediately when an order is confirmed
- [ ] Status transitions are strictly enforced (no skipping)
- [ ] Elapsed timer is accurate and updates in real time
- [ ] Overdue tickets are visually distinct
- [ ] Station filtering works correctly
- [ ] Ticket items and modifiers display correctly
- [ ] Kitchen data persists in SQLite across app restarts
