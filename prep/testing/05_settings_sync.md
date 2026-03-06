# Settings Sync Verification

## Legend
- ✅ Verified | ❌ Failed | ⚠️ Partial | 🔲 Not tested | 📱 App-local (no sync expected)

---

## Settings Matrix

| Setting | Web Location | App Location | Direction | Verification Method | Status | Notes |
|---------|-------------|--------------|-----------|-------------------|--------|-------|
| Restaurant name | `/stores` → edit | Settings › Restaurant Profile | Web→App | Change on web; check app after 30s pull | 🔲 | |
| Restaurant address | `/stores` → edit | Settings › Restaurant Profile | Web→App | Same | 🔲 | |
| Restaurant phone | `/stores` → edit | Settings › Restaurant Profile | Web→App | Same | 🔲 | |
| Operating hours | `/stores` → edit | Settings › Restaurant Profile | Web→App | Same | 🔲 | |
| User first/last name | `/account` → Profile | Login session display | Web→App | Re-login on app | 🔲 | |
| User email | `/account` → Profile | Login session display | Web→App | Re-login on app | 🔲 | |
| Staff role | `/users` → edit | Navigation access | Web→App | Change role; verify new access on re-login | 🔲 | |
| Menu categories | `/menu` → categories | POS sidebar + Settings › Menu | Web→App (pull) | Create/update on web; verify in app | 🔲 | |
| Menu items | `/menu` → items | POS item grid | Web→App (pull) | Create/update on web; verify in app | 🔲 | |
| Modifier groups | `/menu` → modifiers | Modifier modal | Web→App (pull) | Create on web; verify in app | 🔲 | |
| Table definitions | `/tables` → API | Settings › Table Mgmt | Bidirectional | Both directions | 🔲 | |
| Floor areas | `/tables` → API | Floor tabs in Table Mgmt | Web→App (pull) | Create area on web; verify tab on app | 🔲 | |
| Tax rate | `/account settings?` | Settings › Payment Config | Web→App | Change on web; verify in app bill calculation | 🔲 | May be store-level setting |
| Kitchen stations | `/kitchen` (implicit) | Settings › Kitchen Mgmt | Web→App | Verify station names match | 🔲 | |
| Printer settings | — | Settings › Printers | App-local | No sync expected | 📱 | Hardware-local config |

---

## Test Steps

### Restaurant Name Sync (S01)
1. Web: Login as store_admin → `/stores` → edit QA-Blueplate-2026 → change name to `QA Blueplate Updated`
2. Mobile: Wait 60s for health check cycle or trigger manual sync
3. Mobile: Settings › Restaurant Profile → verify name shows `QA Blueplate Updated`
4. Revert: Change back to `QA Blueplate 2026`

### User Role Change Sync (S02)
1. Web: Login as system_admin → `/users` → edit `qa-waiter@blueplate2026.io` → change role to `cashier`
2. Mobile: Log out `qa-waiter` → log back in
3. Verify: New cashier navigation access (no kitchen tab, has payment screens)
4. Revert: Change role back to `waiter`

### Menu Category Sync (S03)
1. Web: Login as store_admin → `/menu` → Categories → Create `QA-Sync-Test-Cat`
2. Mobile: Wait 30s (pull interval)
3. Verify: `QA-Sync-Test-Cat` appears in POS sidebar
4. Cleanup: Delete `QA-Sync-Test-Cat` on web

---

## Results

| Test ID | Setting | Web Value | App Value | Match | Status |
|---------|---------|-----------|-----------|-------|--------|
| S01 | Restaurant name | QA Blueplate 2026 | | | 🔲 |
| S02 | User role | waiter | | | 🔲 |
| S03 | Menu category | QA-Sync-Test-Cat | | | 🔲 |
| S04 | Table area | QA-Floor | | | 🔲 |
| S05 | Menu item price | $4.99 | | | 🔲 |

---

## Known App-Local Settings (No Sync Expected)

| Setting | Why App-Local |
|---------|---------------|
| Printer configuration | Hardware-specific, IP/port of physical printer |
| Receipt template | Local print formatting preference |
| Offline mode toggle | Network-local preference |
| Biometric auth | Device-specific security setting |
