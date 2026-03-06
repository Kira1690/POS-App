# Phase 6: Testing & Verification

## Objective
Verify the entire sync pipeline works end-to-end across all scenarios — online, offline, conflict, multi-device.

---

## Test Scenarios

### Sync Tests

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Menu sync (web → mobile) | Create menu item on web dashboard | Item appears on POS app within 5s |
| 2 | Menu sync (mobile → web) | Create menu item on POS app | Item appears on web dashboard |
| 3 | Order sync (mobile → server) | Create order on POS | Order appears in PostgreSQL |
| 4 | Order sync (multi-device) | Create order on POS Tab 1 | Order visible on POS Tab 2 |
| 5 | Kitchen sync | Update ticket status on kitchen display | Waiter POS shows "ready" |
| 6 | Payment sync | Process payment on POS | Web dashboard shows payment |
| 7 | Table sync | Seat customer → table occupied | Web dashboard shows occupied |
| 8 | Offline → online | Create 5 orders offline, restore network | All 5 orders sync to server |
| 9 | Conflict resolution | Update same order on 2 devices | No data corruption, conflict resolved |
| 10 | Settings sync | Change tax rate on web | POS uses new tax rate |
| 11 | User sync | Create staff on web | Staff can login on POS |
| 12 | Category sync | Delete category on web | POS removes category |
| 13 | Bulk sync | Push 50 offline orders | All 50 arrive in correct order |
| 14 | Initial sync | Fresh POS app login | Full menu, tables, areas loaded |
| 15 | Extended offline | 2 hours offline, then reconnect | All data syncs correctly |

### Role Access Tests

| # | Role | Action | Expected |
|---|------|--------|----------|
| 1 | waiter | Create order | Allowed |
| 2 | waiter | Delete order | Blocked (403) |
| 3 | kitchen_staff | Update ticket status | Allowed |
| 4 | kitchen_staff | Edit menu item | Blocked |
| 5 | manager | Edit menu, view reports | Allowed |
| 6 | manager | Create store | Blocked |
| 7 | store_admin | Create staff | Allowed |
| 8 | store_admin | View audit logs | Blocked |
| 9 | system_admin | Everything | Allowed |

### Performance Tests

| Metric | Target |
|--------|--------|
| Order push (single) | < 500ms |
| Menu pull (100 items) | < 2s |
| WebSocket message delivery | < 500ms |
| Full initial sync | < 10s |
| 50 offline orders push | < 15s |
| Dashboard page load | < 1.5s |

---

## Verification Checklist

- [ ] SQLite and PostgreSQL have identical data after sync
- [ ] No orphaned records (items without orders, etc.)
- [ ] No duplicate records after repeated syncs
- [ ] Timestamps consistent across time zones
- [ ] Type conversions (TEXT↔INT, JSON↔Relations) are lossless
- [ ] Sync queue drains completely (no stuck items)
- [ ] Sync errors logged with meaningful messages
- [ ] Sync status indicator accurate in app
- [ ] WebSocket reconnects after network drop
- [ ] Kafka consumer lag stays near zero
