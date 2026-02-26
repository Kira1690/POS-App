# Settings Tests

## Screens Covered
- `SettingsScreen` — main settings hub (profile, staff, restaurant, system)
- `RestaurantProfileSettings` — name, address, contact, tax rate
- `UserManagementSettings` — staff list, roles, add/edit/deactivate
- `SystemSettings` — printer, display preferences, theme
- `AuthStorageService` — session and user persistence

---

## Unit Tests (Jest)

### Settings state / helpers
| Test | Description | Status |
|------|-------------|--------|
| Tax rate validation — must be 0–100 | Enter 101 → validation error | pending |
| Tax rate validation — decimal allowed | Enter 8.25 → valid | pending |
| Phone number format validation | Invalid format → error | pending |
| Email format validation | "notanemail" → error | pending |
| Password strength — minimum 8 chars | 7-char password → rejected | pending |
| Role enum validation — only valid roles accepted | "superuser" → rejected | pending |
| `formatCurrency(amount, currency)` returns correct string | 12.5, "USD" → "$12.50" | pending |
| `formatCurrency(0)` returns "$0.00" | Edge case | pending |

### AuthStorageService (settings-related)
| Test | Description | Status |
|------|-------------|--------|
| `updateUserProfile()` updates name/email without touching password | Before/after check | pending |
| `changePassword()` hashes and stores new password | Check hash, not plaintext | pending |
| `deactivateUser()` sets is_active=false | Status check | pending |
| `reactivateUser()` sets is_active=true | Status check | pending |
| `getUsersByRestaurant()` returns all staff for restaurantId | pending |
| `getUsersByRole()` returns only users with matching role | "kitchen_staff" filter | pending |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| SettingsScreen renders all settings sections | Snapshot or presence check | pending |
| Tapping "Restaurant Profile" navigates to profile settings | fireEvent.press | pending |
| Tapping "User Management" navigates to user list | fireEvent.press | pending |
| Tapping "System Settings" navigates to system settings | fireEvent.press | pending |
| RestaurantProfileSettings shows current restaurant name | Mock data loaded | pending |
| Save restaurant name calls updateRestaurantProfile() | Fill + save | pending |
| Tax rate field accepts decimal input | Type "8.25", no error | pending |
| Tax rate > 100 shows validation error | Type "150" | pending |
| UserManagementSettings lists all staff users | 5 users visible | pending |
| "Add Staff" button opens add user modal | fireEvent.press | pending |
| Add user form — all required fields present | Name, ID, role, password | pending |
| Add user validation — empty submit shows errors | Press Save with empty form | pending |
| Save user calls saveUser() | Fill form, press Save | pending |
| Edit user button opens edit modal with current values | fireEvent.press | pending |
| Deactivate user shows confirmation dialog | Press Deactivate | pending |
| Confirm deactivation calls deactivateUser() | Press Confirm | pending |
| Logout button present in Settings | assert "Logout" visible | pending |
| Tap Logout shows confirmation dialog | fireEvent.press | pending |
| Confirm Logout calls authService.logout() | Mock service | pending |
| After logout, navigation goes to Welcome screen | Check navigation | pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Settings tab loads from Dashboard | `full_offline_test.yaml` step | **passing** |
| Settings screen renders all sections | assert sections visible | pending |
| Edit restaurant name and save | `pending/edit_restaurant_name.yaml` | pending |
| Change tax rate | `pending/change_tax_rate.yaml` | pending |
| Add new staff user | `pending/add_staff_user.yaml` | pending |
| Edit staff user role | `pending/edit_staff_role.yaml` | pending |
| Deactivate and reactivate staff | pending |
| Logout flow — returns to Welcome | `pending_03_logout_flow.yaml` | pending |
| Settings changes persist after app restart | pending |

---

## E2E Tests — Online (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Restaurant profile saved to backend | `online/settings_profile.yaml` | pending |
| New staff user created via API | pending |
| Role change synced to backend | pending |
| Logout invalidates token on server | `online/04_logout_server.yaml` | pending |

---

## Acceptance Criteria

- [ ] All settings sections accessible from main Settings screen
- [ ] Restaurant profile updates persist in SQLite
- [ ] Tax rate change reflected in all new order calculations
- [ ] User management CRUD works offline
- [ ] Logout clears session and navigates to Welcome
- [ ] Settings changes survive app restart
- [ ] Role-based access: staff cannot see user management section
