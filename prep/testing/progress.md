# Test Suite Progress

> Last updated: 2026-02-25
> Legend: ✅ Done | 🔄 In Progress | ⏳ Pending | ❌ Blocked

---

## Summary

| Layer | Total | Done | In Progress | Pending |
|-------|-------|------|-------------|---------|
| Unit Tests (Jest) | 85 | 0 | 0 | 85 |
| Integration Tests (Jest) | 65 | 0 | 0 | 65 |
| E2E Offline (Maestro) | 55 | 8 | 0 | 47 |
| E2E Online (Maestro) | 30 | 0 | 0 | 30 |
| **Total** | **235** | **8** | **0** | **227** |

---

## By Feature

### 01 — Authentication
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (CoreAuthService) | 11 | 0 | pending |
| Unit (AuthStorageService) | 8 | 0 | pending |
| Unit (dummyData helpers) | 5 | 0 | pending |
| Integration (screens) | 9 | 0 | pending |
| E2E Offline | 10 | 7 | full_offline_test.yaml + 6 individual flows passing |
| E2E Online | 5 | 0 | pending |

**Passing Maestro flows:**
- `01_staff_login_offline.yaml` ✅ written
- `02_manager_login_offline.yaml` ✅ written
- `03_kitchen_staff_login_offline.yaml` ✅ written
- `04_admin_login_offline.yaml` ✅ written
- `07_superadmin_login_offline.yaml` ✅ written
- `08_session_persists_across_restart.yaml` ✅ written
- `full_offline_test.yaml` ✅ **PASSING** (7 steps)

---

### 02 — Dashboard
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (DashboardScreen) | 11 | 0 | pending |
| Unit (ManagerDashboard) | 5 | 0 | pending |
| Unit (StaffDashboard) | 5 | 0 | pending |
| Unit (KitchenDashboard) | 8 | 0 | pending |
| Integration | 10 | 0 | pending |
| E2E Offline | 9 | 3 | full_offline_test covers tabs 01-02 |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Manager Dashboard tab loads ✅
- "Key Metrics" visible ✅
- "Analytics Overview" visible ✅

---

### 03 — Order Management
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (UnifiedOrderStorageService) | 8 | 0 | pending |
| Unit (UnifiedOrderContext) | 10 | 0 | pending |
| Unit (Order calculations) | 6 | 0 | pending |
| Integration | 9 | 0 | pending |
| E2E Offline | 11 | 2 | full_offline_test covers tab load + empty state |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Order Management tab loads ✅
- "No Orders Found" / empty state ✅

---

### 04 — Kitchen
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (KitchenStorageService) | 9 | 0 | pending |
| Unit (EnhancedKitchenContext) | 9 | 0 | pending |
| Unit (KitchenTicketCard) | 7 | 0 | pending |
| Integration | 13 | 0 | pending |
| E2E Offline | 9 | 2 | full_offline_test covers tab load |
| E2E Online | 3 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Kitchen tab loads ✅
- "Kitchen Display" visible ✅

---

### 05 — Table Management
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (TableStorageService) | 13 | 0 | pending |
| Unit (TableContext) | 6 | 0 | pending |
| Unit (Table stats) | 4 | 0 | pending |
| Integration | 15 | 0 | pending |
| E2E Offline | 10 | 0 | pending |
| E2E Online | 3 | 0 | pending |

---

### 06 — Menu Management
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (MenuStorageService) | 15 | 0 | pending |
| Unit (MenuContext) | 4 | 0 | pending |
| Unit (Price calculations) | 4 | 0 | pending |
| Integration | 16 | 0 | pending |
| E2E Offline | 8 | 1 | full_offline_test covers tab load |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Menu tab loads ✅

---

### 07 — Payment
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (PaymentStorageService) | 8 | 0 | pending |
| Unit (Payment calculations) | 9 | 0 | pending |
| Unit (PaymentContext) | 5 | 0 | pending |
| Integration | 15 | 0 | pending |
| E2E Offline | 9 | 0 | pending |
| E2E Online | 4 | 0 | pending |

---

### 08 — Settings
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (Settings helpers) | 8 | 0 | pending |
| Unit (AuthStorageService settings) | 6 | 0 | pending |
| Integration | 19 | 0 | pending |
| E2E Offline | 9 | 1 | full_offline_test covers tab load |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Settings tab loads ✅

---

## Next Actions (Priority Order)

1. **Write Jest unit tests** — Start with `CoreAuthService` and `AuthStorageService` (highest ROI, already have service code)
2. **Write Jest unit tests** — `UnifiedOrderStorageService` and `UnifiedOrderContext`
3. **Write integration tests** — Auth screens (WelcomeScreen, StaffLoginScreen, ManagerLoginScreen)
4. **Write Maestro flows** — `pending_01_invalid_login.yaml` and `pending_03_logout_flow.yaml`
5. **Write Maestro flows** — Order creation flow (`create_order_offline.yaml`, `add_items_to_order.yaml`)
6. **Write Jest unit tests** — Dashboard calculations (DashboardScreen)
7. **Write Maestro flows** — Kitchen ticket flows

---

## How to Run Tests

```bash
# Jest (unit + integration)
bun test                          # all tests
bun test --testPathPattern auth   # auth only
bun test --coverage               # with coverage report

# Type check (must pass before commit)
bun run type-check

# Lint
bun run lint

# Maestro E2E offline
maestro test .maestro/full_offline_test.yaml    # main suite
maestro test .maestro/                           # all flows

# Maestro E2E online (requires backend)
maestro test .maestro/online/
```
