# Offline Test Suite

> Full offline mode = airplane mode on device + SQLite only + dummy users + no API calls.
> All tests in this file run with network disabled.

---

## Prerequisites

- `bun expo start` running on host machine
- Device/emulator on same Wi-Fi as host
- Airplane mode enabled on device (or emulator network disabled)
- App installed via Expo Go or standalone build
- Fresh install OR cleared app data

---

## Maestro E2E Flows (Offline)

All flows live in `.maestro/` and `.maestro/pending/`.

### Authentication Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| `01_staff_login_offline.yaml` | Staff login EMP001/staff123 → Staff Dashboard | **written** |
| `02_manager_login_offline.yaml` | Manager login → Manager Dashboard | **written** |
| `03_kitchen_staff_login_offline.yaml` | Chef login → Kitchen/Dashboard | **written** |
| `04_admin_login_offline.yaml` | Admin login → Dashboard | **written** |
| `07_superadmin_login_offline.yaml` | Superadmin login → Dashboard | **written** |
| `08_session_persists_across_restart.yaml` | Re-open app → still logged in | **written** |
| `full_offline_test.yaml` | Full session: login → all tabs → re-open | **passing** |
| `pending_01_invalid_login.yaml` | Wrong credentials → error shown, no nav | pending |
| `pending_02_back_from_login.yaml` | Back button from StaffLogin → Welcome | pending |
| `pending_03_logout_flow.yaml` | Logout from Settings → Welcome | pending |

### Dashboard Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| (included in `full_offline_test.yaml`) | Manager Dashboard loads | **passing** |
| `pending/staff_dashboard_offline.yaml` | Staff Dashboard renders | pending |
| `pending/kitchen_dashboard_offline.yaml` | Kitchen Dashboard renders | pending |
| `pending/dashboard_refresh_offline.yaml` | Refresh does not crash | pending |

### Order Management Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| `pending/create_order_offline.yaml` | Create order from table selection | pending |
| `pending/add_items_to_order.yaml` | Add menu items to order | pending |
| `pending/confirm_order.yaml` | Confirm order → moves to confirmed | pending |
| `pending/view_order_details.yaml` | View single order detail | pending |
| `pending/cancel_order.yaml` | Cancel order with reason | pending |
| `pending/search_order.yaml` | Search by order number | pending |
| `pending/filter_orders.yaml` | Filter by status chip | pending |
| `pending/order_persistence.yaml` | Order survives app restart | pending |

### Kitchen Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| (included in `full_offline_test.yaml`) | Kitchen Display loads | **passing** |
| `pending/kitchen_start_ticket.yaml` | Tap Start → preparing status | pending |
| `pending/kitchen_ready_ticket.yaml` | Tap Ready → ready status | pending |
| `pending/kitchen_station_filter.yaml` | Station tab filter | pending |

### Table Management Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| `pending/table_set_occupied.yaml` | Set table to occupied | pending |
| `pending/table_set_available.yaml` | Set table back to available | pending |
| `pending/table_area_filter.yaml` | Area tab filter | pending |
| `pending/add_table_offline.yaml` | Add new table via modal | pending |

### Menu Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| (included in `full_offline_test.yaml`) | Menu tab loads | **passing** |
| `pending/menu_category_filter.yaml` | Tap category → items filter | pending |
| `pending/menu_item_availability.yaml` | Toggle item availability | pending |
| `pending/menu_search.yaml` | Search item by name | pending |

### Payment Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| `pending/cash_payment_offline.yaml` | Full cash payment with change | pending |
| `pending/card_payment_offline.yaml` | Card payment confirmation | pending |
| `pending/split_payment_offline.yaml` | Split payment flow | pending |

### Settings Flows

| Flow File | What It Tests | Status |
|-----------|---------------|--------|
| (included in `full_offline_test.yaml`) | Settings tab loads | **passing** |
| `pending_03_logout_flow.yaml` | Logout → Welcome screen | pending |
| `pending/edit_restaurant_name.yaml` | Edit restaurant name | pending |
| `pending/add_staff_user.yaml` | Add new staff member | pending |

---

## How to Run Offline E2E

```bash
# 1. Start Expo bundler on host machine
bun expo start --clear

# 2. Boot emulator (if not already running)
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
$ANDROID_SDK_ROOT/emulator/emulator -avd POS_Tablet &

# 3. Disable network on emulator (simulate offline)
# In Android Studio: Extended Controls → Cellular → No service
# OR via adb:
adb shell svc data disable
adb shell svc wifi disable

# 4. Run full offline suite
maestro test .maestro/full_offline_test.yaml

# 5. Run all Maestro flows
maestro test .maestro/

# 6. Re-enable network after testing
adb shell svc data enable
adb shell svc wifi enable
```

---

## Offline Acceptance Criteria

- [ ] All 5 dummy credential pairs log in without network
- [ ] Session persists across app close/restart (24h token)
- [ ] Token auto-refreshes locally for dummy users
- [ ] All seeded data visible immediately (tables, menu, users)
- [ ] Orders created offline persist in SQLite
- [ ] Kitchen tickets created when order confirmed (offline)
- [ ] Payment can be processed offline
- [ ] No API calls attempted during any offline flow (check logs)
- [ ] App does not crash on any offline flow
