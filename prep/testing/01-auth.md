# Authentication Tests

## Screens Covered
- `WelcomeScreen` — role selector
- `StaffLoginScreen` — employee ID + password
- `ManagerLoginScreen` — email + password + optional MFA
- `CoreAuthService` — session, token refresh, dummy user logic
- `AuthStorageService` — SQLite session persistence

---

## Unit Tests (Jest)

### CoreAuthService
| Test | File | Status |
|------|------|--------|
| `login()` with valid dummy staff credentials returns LoginResponse | `__tests__/services/auth/CoreAuthService.test.ts` | pending |
| `login()` with valid dummy manager credentials returns LoginResponse | same | pending |
| `login()` with invalid credentials throws error | same | pending |
| `refreshToken()` detects dummy user and refreshes locally (no API call) | same | pending |
| `refreshToken()` calls API for non-dummy user | same | pending |
| `isAuthenticated()` returns true when session is valid | same | pending |
| `isAuthenticated()` attempts local dummy refresh when session expired | same | pending |
| `isAuthenticated()` falls through to API when not a dummy user | same | pending |
| `validateToken()` returns true for valid SQLite session | same | pending |
| `validateToken()` refreshes locally for expired dummy session | same | pending |
| `logout()` clears SQLite session | same | pending |

### AuthStorageService
| Test | File | Status |
|------|------|--------|
| `saveSession()` stores session row in auth_session table | `__tests__/services/storage/AuthStorageService.test.ts` | pending |
| `getSession()` reads stored session and parses JSON columns | same | pending |
| `hasValidSession()` returns true when expiresAt > now + 30s | same | pending |
| `hasValidSession()` returns false when session expired | same | pending |
| `updateTokens()` overwrites tokens without touching user data | same | pending |
| `clearSession()` deletes session row | same | pending |
| `seedDummyUsers()` inserts all 9 DUMMY_CREDENTIALS users | same | pending |
| `seedDummyUsers()` is idempotent (skips if already seeded) | same | pending |

### dummyData helpers
| Test | File | Status |
|------|------|--------|
| `findUserByCredentials('EMP001', 'staff123', true)` returns staff user | `__tests__/constants/dummyData.test.ts` | pending |
| `findUserByCredentials('manager@foodcorner.com', 'manager123', false)` returns manager | same | pending |
| `findUserByCredentials('wrong', 'wrong', false)` returns null | same | pending |
| `generateDummyTokens()` returns expiresIn of 86400 (24 hours) | same | pending |
| `generateDummyTokens()` token contains user id | same | pending |

---

## Integration Tests (Jest + mocked DB)

| Test | Description | Status |
|------|-------------|--------|
| WelcomeScreen renders all three buttons | Snapshot + presence checks | pending |
| Tapping "Continue as Staff Member" navigates to StaffLogin | `fireEvent.press` + navigation mock | pending |
| Tapping "Manager Login" navigates to ManagerLogin | same | pending |
| StaffLoginScreen shows validation error for empty submit | `fireEvent.press` on Clock In with empty fields | pending |
| StaffLoginScreen fills form and submits successfully | Fill testID inputs, assert nav to Dashboard | pending |
| ManagerLoginScreen shows email + password fields | Render check | pending |
| ManagerLoginScreen submits and navigates to Dashboard | Fill + press Sign In | pending |
| AuthProvider restores session on mount (auto-login) | Mount with mocked `authStorageService.getSession()` returning valid session | pending |
| AuthProvider clears session and navigates to Welcome on logout | Call logout, assert Welcome shown | pending |

---

## E2E Tests — Offline (Maestro)

Maestro flows: `.maestro/01_staff_login_offline.yaml` etc.

| Test | Flow file | Status |
|------|-----------|--------|
| Staff login — EMP001 / staff123 → Staff Dashboard | `01_staff_login_offline.yaml` | **written** |
| Manager login — manager@foodcorner.com / manager123 → Dashboard | `02_manager_login_offline.yaml` | **written** |
| Kitchen staff login — CHEF001 / kitchen123 → Kitchen or Dashboard | `03_kitchen_staff_login_offline.yaml` | **written** |
| Admin login — admin@foodcorner.com / admin123 → Dashboard | `04_admin_login_offline.yaml` | **written** |
| Superadmin login — superadmin@foodpos.com / super123 → Dashboard | `07_superadmin_login_offline.yaml` | **written** |
| Session persists across app restart (24h token, no re-login) | `08_session_persists_across_restart.yaml` | **written** |
| Full offline test — login → all tabs → re-open → still logged in | `full_offline_test.yaml` | **passing** |
| Invalid credentials shows error, stays on login screen | `pending_01_invalid_login.yaml` | pending |
| Back button from StaffLogin returns to Welcome | `pending_02_back_from_login.yaml` | pending |
| Logout from Settings returns to Welcome | `pending_03_logout_flow.yaml` | pending |

---

## E2E Tests — Online / Local Backend (Maestro)

> Requires backend running at `http://localhost:4000`

| Test | Flow file | Status |
|------|-----------|--------|
| Real API login with valid credentials | `online/01_real_login.yaml` | pending |
| Real API login with invalid credentials shows server error | `online/02_real_login_invalid.yaml` | pending |
| Token refresh automatically on expiry | `online/03_token_refresh.yaml` | pending |
| Logout invalidates token on server | `online/04_logout_server.yaml` | pending |
| MFA flow for manager login | `online/05_mfa_flow.yaml` | pending |

---

## Acceptance Criteria

- [ ] All 5 dummy credential pairs log in offline without network
- [ ] Session survives app close and re-open (SQLite persistence)
- [ ] Token auto-refreshes locally for dummy users — no network call
- [ ] Invalid credentials show meaningful error message
- [ ] Back navigation works from every auth screen
- [ ] Logout clears session and returns to Welcome screen
