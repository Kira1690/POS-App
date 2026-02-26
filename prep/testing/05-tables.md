# Table Management Tests

## Screens Covered
- `TableManagementScreen` — floor plan view, table grid, area tabs
- `TableStatusCard` — individual table card with status, capacity, actions
- `TableStorageService` — SQLite persistence for tables and areas
- `TableContext` / `UnifiedTableContext` — global table state

## Table Status Flow
```
available → occupied → reserved
    ↑           ↓
    └── cleaning ←┘
```
> Tables can also be set to "reserved" without being occupied first.

---

## Unit Tests (Jest)

### TableStorageService
| Test | Description | Status |
|------|-------------|--------|
| `initialize()` seeds mock tables on empty DB | Check row count after init | pending |
| `initialize()` is idempotent — skips if data exists | Call twice, count same | pending |
| `getTables()` returns all tables with area info | SELECT with JOIN | pending |
| `getTablesByArea()` returns only tables in given area | 3 areas, filter one | pending |
| `updateTableStatus()` changes status field only | Before/after check | pending |
| `getAvailableTables()` excludes occupied and reserved | 5 tables, 2 occupied → 3 | pending |
| `getOccupiedTables()` returns only occupied tables | pending |
| `saveTable()` inserts new table | Check INSERT | pending |
| `updateTable()` updates capacity/name/position | Check UPDATE | pending |
| `deleteTable()` removes table | Check DELETE | pending |
| `getAreas()` returns all distinct areas | 3 areas returned | pending |
| `saveArea()` inserts new area | Check INSERT | pending |
| `deleteArea()` removes area and its tables | Cascade check | pending |

### TableContext (reducer)
| Test | Description | Status |
|------|-------------|--------|
| `setTables` action replaces table list | Dispatch, check state | pending |
| `updateTableStatus` action changes status in-place | Same tableId | pending |
| `setSelectedArea` updates area filter | Check filter field | pending |
| Available count = tables with status "available" | 5 tables, 2 available → count=2 | pending |
| Occupied count = tables with status "occupied" | pending |
| Utilisation % = occupied / total | Edge: 0 tables → 0% | pending |

### Table stats calculations
| Test | Description | Status |
|------|-------------|--------|
| Total capacity = sum of all table.capacity | 3 tables (2+4+6) = 12 | pending |
| Available tables count excludes reserved and cleaning | pending |
| Table filter by area — "Indoor" shows only indoor tables | pending |
| Table search by number — "T-05" matches table 5 | pending |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| TableManagementScreen renders with no tables | Empty state visible | pending |
| TableManagementScreen renders seeded mock tables | 6+ cards visible | pending |
| Area tabs render from distinct areas | 3 areas → 3 tabs + "All" | pending |
| Tap area tab filters table list | Tap "Outdoor", only outdoor tables shown | pending |
| Tap "All" tab resets filter | All tables shown | pending |
| Available table card shows green status indicator | status="available" | pending |
| Occupied table card shows red/orange status | status="occupied" | pending |
| Tapping table card opens table detail/action modal | fireEvent.press | pending |
| "Set Occupied" action calls updateTableStatus("occupied") | Mock context | pending |
| "Set Available" action calls updateTableStatus("available") | Mock context | pending |
| "Add Table" button opens add table modal | fireEvent.press | pending |
| Table form validation — name required | Submit empty form, error shown | pending |
| Table form validation — capacity must be positive integer | Enter "0", error shown | pending |
| Save new table calls saveTable() | Fill form, press Save | pending |
| Delete table calls deleteTable() with confirmation | Press Delete, confirm dialog | pending |
| Edit table calls updateTable() | Edit capacity, save | pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Tables tab loads from Dashboard | `full_offline_test.yaml` step | **passing** |
| Tables screen shows seeded mock tables | assert table cards visible | pending |
| Area tab filter — tap Indoor, only indoor tables shown | pending |
| Tap table card — status action modal appears | pending |
| Set table to Occupied | pending |
| Set table back to Available | pending |
| Add a new table via modal | pending |
| Edit table capacity | pending |
| Delete table with confirmation | pending |
| Table status change persists after app restart | pending |

---

## E2E Tests — Online (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Table status change syncs to backend | `online/table_status_sync.yaml` | pending |
| Table occupied on one device appears occupied on another | Real-time via WebSocket | pending |
| New table saved to backend and reflected across devices | pending |

---

## Acceptance Criteria

- [ ] Mock tables are seeded on first launch (offline)
- [ ] All table status transitions work correctly
- [ ] Area filtering works for all areas
- [ ] Table CRUD operations persist in SQLite
- [ ] Table utilisation stats are accurate
- [ ] Empty state shown when no tables exist for an area
- [ ] Table status visible on Dashboard KPI cards
