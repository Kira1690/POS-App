# Blue Plate Bistro — QA Test Runbook

Complete step-by-step guide to run the full end-to-end QA suite for the Blue Plate Bistro POS system. This runbook produces a 30-scenario mobile QA test, 14-check bidirectional sync verification, 17 web page screenshots, 20 mobile screen captures, and a final HTML evidence report.

**Last verified:** 2026-03-05
**Report location:** `prep/testing/index.html`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Start All Services](#2-start-all-services)
3. [Phase 1 — Restaurant Setup (Playwright)](#3-phase-1--restaurant-setup)
4. [Phase 2 — Seed Menu Data (Playwright)](#4-phase-2--seed-menu-data)
5. [Phase 3 — Build & Install APK](#5-phase-3--build--install-apk)
6. [Phase 4 — Run Mobile QA Suite (Maestro)](#6-phase-4--run-mobile-qa-suite)
7. [Phase 5 — Sync Verification (Playwright)](#7-phase-5--sync-verification)
8. [Phase 6 — Web Screenshots (Playwright)](#8-phase-6--web-screenshots)
9. [Phase 7 — Mobile Visual Tour (Maestro)](#9-phase-7--mobile-visual-tour)
10. [Phase 8 — Fresh ADB Screenshots](#10-phase-8--fresh-adb-screenshots)
11. [Phase 9 — Assemble HTML Report](#11-phase-9--assemble-html-report)
12. [Credentials Reference](#12-credentials-reference)
13. [Known Issues & Workarounds](#13-known-issues--workarounds)
14. [Troubleshooting](#14-troubleshooting)
15. [File Map](#15-file-map)

---

## 1. Prerequisites

### Software Required

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| Bun | latest | Package manager & runner |
| Android Studio | latest | Emulator (API 34) |
| Maestro | latest | Mobile UI testing |
| Playwright | latest | Web E2E testing |
| ADB | latest | Android Debug Bridge |

### Install Maestro (if not installed)
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Install Playwright browsers (if not installed)
```bash
cd POS-Authentication-Frontend
bunx playwright install chromium
```

### Android Emulator
- AVD: **Pixel Tablet API 34** (or any API 34+ device)
- Resolution: landscape preferred (1340x800 logical px)
- Ensure `adb devices` shows the emulator

### Database
```bash
# Auth DB — run migrations (if fresh)
cd POS-Authentication && bunx prisma migrate dev

# Core DB — use db push (has schema drift, NOT migrate dev)
cd POS-Services/POS-Core-Service && bunx prisma db push

# Menu DB — use db push
cd POS-Services/POS-Menu-Service && bunx prisma db push
```

---

## 2. Start All Services

Open 5 terminals (or use tmux/screen):

```bash
# Terminal 1 — Auth Service (port 3000)
cd POS-Authentication && bun run dev

# Terminal 2 — Core Service (port 5005)
cd POS-Services && bun run dev:core

# Terminal 3 — Menu Service (port 5003)
cd POS-Services && bun run dev:menu

# Terminal 4 — API Gateway (port 8080)
cd POS-API-Gateway && bun run dev

# Terminal 5 — Web Dashboard (port 5173)
cd POS-Authentication-Frontend && bun run dev
```

### Verify services are up
```bash
curl -s http://localhost:3000/health | head -1   # Auth
curl -s http://localhost:5005/health | head -1   # Core
curl -s http://localhost:5003/health | head -1   # Menu
curl -s http://localhost:8080/health | head -1   # Gateway
curl -s http://localhost:5173 | head -1          # Web (HTML)
```

### Start Android Emulator
```bash
# Via Android Studio → AVD Manager → Launch
# OR via command line:
emulator -avd <avd_name> &
adb wait-for-device
```

---

## 3. Phase 1 — Restaurant Setup

Creates the Blue Plate Bistro restaurant and 5 staff accounts via the web dashboard.

```bash
cd POS-Authentication-Frontend
bun playwright test e2e/qa/bistro-setup.spec.ts --headed
```

### What it does
- Logs in as `admin@system.com` (seeded super_admin)
- Creates "Blue Plate Bistro" store (42 West 38th St, New York)
- Creates 5 staff accounts (see [Credentials Reference](#12-credentials-reference))
- Saves screenshots to `prep/testing/screenshots/bistro-setup/`

### Verify
- Open http://localhost:5173 → log in as `admin@blueplatebistro.io` / `BPBAdmin2026!`
- Dashboard should load with "Blue Plate Bistro" header
- Staff page should show 5 users

### If already done
Skip this phase. The store persists in the database between runs. Only re-run if you've wiped the Auth database.

---

## 4. Phase 2 — Seed Menu Data

Creates all menu catalog data via direct API calls (not UI clicks — much more reliable).

```bash
cd POS-Authentication-Frontend
bun playwright test e2e/qa/bistro-web-data.spec.ts
```

### What it creates

| Entity | Count | Details |
|--------|-------|---------|
| Categories | 7 | Appetizers, Mains, Burgers, Salads, Desserts, Beverages, Daily Specials |
| Menu Items | 22 | Distributed across all categories with prices |
| Modifier Groups | 5 | Burger Size, Protein Temp, Salad Dressing, Side Choice, Drink Size |
| Modifier Options | ~20 | Options per group (e.g., Small/Medium/Large) |
| Combos | 2 | Dinner Special ($44.99), Lunch Combo ($18.99) |
| Sections | 3 | Main Floor, Patio, Bar |
| Tables | 13 | M1-M5 (Main), P1-P5 (Patio), B1-B3 (Bar) |

### Screenshots saved
`prep/testing/screenshots/bistro-web-data/bw00_*.png` through `bw06_*.png`

### Verify
- Open http://localhost:5173/menu → Categories tab: 7 categories, all Active
- Items tab: 22 items with correct category assignments
- Modifiers tab: 5 groups with option counts > 0
- Combos tab: 2 combos with prices
- http://localhost:5173/tables → 13 tables across 3 sections

### Re-running after previous data exists
The spec includes a BW-00 cleanup step that deletes existing data first. Safe to re-run.

---

## 5. Phase 3 — Build & Install APK

### Build debug APK
```bash
cd POS-App/android
./gradlew assembleDebug
```
Build output: `POS-App/android/app/build/outputs/apk/debug/app-debug.apk`

### Install on emulator
```bash
adb install -r POS-App/android/app/build/outputs/apk/debug/app-debug.apk
```

### Verify
```bash
# Launch app
adb shell am start -n com.ajinkya123.POSReactNativeApp/.MainActivity

# Wait 5 seconds, then check it's running
adb shell dumpsys activity activities | grep "mResumedActivity"
```

### Important .env settings (POS-App/.env)
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
EXPO_PUBLIC_WS_URL=ws://10.0.2.2:5005
```
**Must use 10.0.2.2** — Android emulator uses this to reach the host machine. NOT localhost.

### When to rebuild
- After ANY code changes to `POS-App/src/`
- After changing `.env` variables
- After `bun install` (new native dependencies)

---

## 6. Phase 4 — Run Mobile QA Suite

The core 30-scenario test covering the full restaurant workflow.

```bash
cd /home/kira/Documents/Github/POS
maestro test POS-App/.maestro/qa/bistro/QA_bistro_full.yaml
```

### Test Groups (QA_01–QA_30)

| Group | Scenarios | What It Tests |
|-------|-----------|---------------|
| A: Menu Verification | QA_01–QA_05 | Categories, items, modifiers, combos, tables in mobile POS |
| B: Order Creation | QA_06–QA_12 | Create 2 orders (Main Floor T1 + Patio T1), add items, combos, send to kitchen |
| C: Kitchen Workflow | QA_13–QA_17 | Pending → In Progress → Ready for both tickets, floor plan verification |
| D: Payment | QA_18–QA_22 | Cash payment (T1), card payment (Patio T1), change display, table freed |
| E: Web↔App Sync | QA_23–QA_26 | Web-created items appear on app, app-created orders appear on web |
| F: Customers & Reports | QA_27–QA_30 | Customer creation, order association, reports, final floor plan |

### Screenshots output
Maestro saves screenshots to the current working directory:
```
QA_00_login.png
QA_01_categories_loaded.png
QA_02_appetizers_grid.png
...
QA_30_final_floor_plan.png
```

### Copy screenshots to report directory
```bash
cp QA_*.png prep/testing/screenshots/bistro-mobile/
```

### Pre-conditions
- Phase 1 (bistro-setup) completed
- Phase 2 (bistro-web-data) completed
- APK installed and app reachable at 10.0.2.2:8080
- All backend services running

### Login credentials used by Maestro
```
Email: admin@blueplatebistro.io
Password: BPBAdmin2026!
```
Entered via testID selectors: `email-input`, `password-input`, `btn-manager-sign-in`

### If test fails mid-run
1. Check which QA_XX screenshot was last saved
2. Fix the issue (usually a timing problem or stale app state)
3. Re-run the full suite (it clears app state on start: `clearState: true`)

---

## 7. Phase 5 — Sync Verification

Verifies that data created on the mobile app appears on the web dashboard.

```bash
cd POS-Authentication-Frontend
bun playwright test e2e/qa/bistro-sync-verify.spec.ts
```

### What it checks (SV-01 through SV-10)

| Check | Domain | Verifies |
|-------|--------|----------|
| SV-01 | Orders | T1 order visible on /orders |
| SV-02 | Orders | Patio T1 order visible on /orders |
| SV-03 | Kitchen | Kitchen ticket status reflects Ready on web |
| SV-04 | Billing | Cash transaction appears on /billing |
| SV-05 | Billing | Card transaction appears on /billing |
| SV-06 | Tables | Table statuses match (occupied/available) |
| SV-07 | Customers | App-created customer appears on /customers |
| SV-08 | Reports | Today's revenue > $0 on /reports |
| SV-09 | Orders | Bar order visible on /orders |
| SV-10 | Menu | Web-created Daily Special syncs to app |

### Screenshots saved
`prep/testing/screenshots/bistro-sync/sv01_*.png` through `sv10_*.png`

### Pre-conditions
- Maestro QA suite (Phase 4) must have completed first
- Wait at least 30 seconds after Maestro finishes for sync push intervals to fire

---

## 8. Phase 6 — Web Screenshots

Captures all 17 web dashboard pages with Blue Plate Bistro data.

```bash
cd POS-Authentication-Frontend
bun playwright test e2e/qa/bistro-screenshots.spec.ts
```

### Pages captured (BP-01 through BP-17)

| # | Page | File |
|---|------|------|
| BP-01 | Dashboard | bp01_web_dashboard.png |
| BP-02 | Menu → Categories | bp02_web_menu_categories.png |
| BP-03 | Menu → Items | bp03_web_menu_items.png |
| BP-04 | Menu → Modifiers | bp04_web_modifiers.png |
| BP-05 | Menu → Combos | bp05_web_combos.png |
| BP-06 | Orders | bp06_web_orders.png |
| BP-07 | Order Detail | bp07_web_order_detail.png |
| BP-08 | Tables (all) | bp08_web_tables_floor.png |
| BP-09 | Tables → Main Floor | bp09_web_tables_main_floor.png |
| BP-10 | Kitchen | bp10_web_kitchen.png |
| BP-11 | Billing | bp11_web_billing.png |
| BP-12 | Customers | bp12_web_customers.png |
| BP-13 | Reports | bp13_web_reports.png |
| BP-14 | Staff | bp14_web_staff.png |
| BP-15 | Store Profile | bp15_web_store_bistro.png |
| BP-16 | Account | bp16_web_account.png |
| BP-17 | Users | bp17_web_users.png |

### Screenshots saved
`prep/testing/screenshots/bistro-web/bp*.png`

---

## 9. Phase 7 — Mobile Visual Tour

Optional Maestro flow that navigates all mobile screens for gallery screenshots.

```bash
cd /home/kira/Documents/Github/POS
maestro test POS-App/.maestro/qa/bistro/bistro_visual_tour.yaml
```

### Important caveats
- This produces `mob_01_*.png` through `mob_20_*.png` files
- The visual tour is FRAGILE — it often fails when:
  - System dialogs appear (permissions, keyboard)
  - App state has changed from previous test runs
  - Screen transitions are slower than expected
- **If the visual tour fails, use ADB manual screenshots instead** (Phase 8)

---

## 10. Phase 8 — Fresh ADB Screenshots

When Maestro visual tour fails (which is common), take manual screenshots via ADB. This produces clean, full-screen captures.

### ADB Screenshot Command
```bash
# Generic: capture current screen
adb exec-out screencap -p > screenshot.png
```

### Navigate & Capture Each Screen

```bash
# 1. Dashboard
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_01_dashboard.png

# 2. POS Grid (tap Order Management → New Order → select table)
# Navigate first via app UI, then:
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_02_pos_grid.png

# 3. Modifier Modal (tap a burger item)
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_03_modifier_modal.png

# 4. Table Selection / Floor Plan
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_04_floor_plan.png

# 5. Kitchen Display
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_05_kitchen.png

# 6. Order Management
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_06_orders_list.png

# 7-8. Can reuse QA screenshots:
cp QA_01_categories_loaded.png prep/testing/screenshots/bistro-mobile/mob_07_categories.png
cp QA_04_combos_list.png prep/testing/screenshots/bistro-mobile/mob_08_combos.png

# 9. Tables Dashboard (Settings → Table Management)
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_09_table_settings.png

# 10. Reports (Dashboard sidebar → Reports)
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_10_reports.png

# 11. Staff / User Management (Settings → User Management)
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_11_staff.png

# 12. Restaurant Profile (Settings → Restaurant Profile)
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_12_restaurant_profile.png

# 13. Settings Menu
adb exec-out screencap -p > prep/testing/screenshots/bistro-mobile/mob_13_account.png

# 14-20. Reuse QA screenshots for remaining slots:
cp QA_19_cash_payment.png prep/testing/screenshots/bistro-mobile/mob_14_payment_screen.png
cp QA_27_*.png prep/testing/screenshots/bistro-mobile/mob_15_customer_search.png
cp QA_16_patio_ready.png prep/testing/screenshots/bistro-mobile/mob_16_order_detail.png
cp QA_17_tables_occupied.png prep/testing/screenshots/bistro-mobile/mob_17_kitchen_settings.png
cp QA_18_*.png prep/testing/screenshots/bistro-mobile/mob_18_network_offline.png
cp QA_20_*.png prep/testing/screenshots/bistro-mobile/mob_19_sync_done.png
cp QA_21_*.png prep/testing/screenshots/bistro-mobile/mob_20_combos_in_pos.png
```

### ADB Navigation Helper Commands
```bash
# Tap coordinates (landscape mode, 1340x800)
adb shell input tap <x> <y>

# Go back
adb shell input keyevent KEYCODE_BACK

# Find element bounds (for tap coordinates)
adb shell uiautomator dump /dev/tty 2>/dev/null | tr '>' '\n' | grep -i "text.*Order"

# Check what's on screen
adb shell uiautomator dump /dev/tty 2>/dev/null | tr '>' '\n' | grep "text=" | head -20
```

---

## 11. Phase 9 — Assemble HTML Report

### Screenshot Directory Structure
```
prep/testing/screenshots/
├── bistro-setup/         ← Phase 1: bs01-bs06 (store creation)
├── bistro-web-data/      ← Phase 2: bw00-bw06 (data seeding verification)
├── bistro-mobile/        ← Phase 4+8: QA_01-QA_30 + mob_01-mob_20
├── bistro-sync/          ← Phase 5: sv01-sv10 (sync checks)
└── bistro-web/           ← Phase 6: bp01-bp17 (web pages)
```

### Verify all files present
```bash
echo "Setup:" && ls prep/testing/screenshots/bistro-setup/bs*.png | wc -l
echo "Web data:" && ls prep/testing/screenshots/bistro-web-data/bw*.png | wc -l
echo "Mobile QA:" && ls prep/testing/screenshots/bistro-mobile/QA_*.png | wc -l
echo "Mobile MOB:" && ls prep/testing/screenshots/bistro-mobile/mob_*.png | wc -l
echo "Sync:" && ls prep/testing/screenshots/bistro-sync/sv*.png | wc -l
echo "Web pages:" && ls prep/testing/screenshots/bistro-web/bp*.png | wc -l
```

Expected: 6 setup, 14 web-data, 30+ mobile QA, 20 mob, 10+ sync, 17 web

### Open Report
```
file:///home/kira/Documents/Github/POS/prep/testing/index.html
```

### Report Sections
| Section | Content |
|---------|---------|
| 1. Setup | Restaurant info, staff accounts, setup screenshots |
| 2. Web Data | Menu catalog summary, 9 data creation screenshots |
| 3. QA Matrix | 30 test scenarios with pass/partial/fail badges + thumbnails |
| 4. Sync Matrix | 14 bidirectional sync checks (SV-01–SV-10, WA-01–WA-04) |
| 5. Web Screens | 17 web dashboard page screenshots |
| 6. Mobile Screens | 20 mobile app screen gallery |
| 7. Comparison | 17 side-by-side web vs mobile pairs |
| 8. Bug Fix | ExistingOrderModal bug documentation |

---

## 12. Credentials Reference

### Blue Plate Bistro Staff

| Role | Email | Password | Access |
|------|-------|----------|--------|
| store_admin | admin@blueplatebistro.io | BPBAdmin2026! | Full web + mobile |
| manager | manager@blueplatebistro.io | BPBMgr2026! | Web + mobile + reports |
| waiter | waiter@blueplatebistro.io | BPBWtr2026! | Mobile: orders, tables |
| kitchen_staff | kitchen@blueplatebistro.io | BPBKit2026! | Mobile: kitchen only |
| cashier | cashier@blueplatebistro.io | BPBCsh2026! | Mobile: payments |

### System Accounts

| Role | Email | Password |
|------|-------|----------|
| super_admin | admin@system.com | SuperAdmin123! |
| store_admin (demo) | admin@demo-store.com | StoreAdmin123! |

### Mobile Offline Fallback (dummy auth)

| Role | Credential | Password |
|------|-----------|----------|
| manager | manager@foodcorner.com | manager123 |
| staff | EMP001 | staff123 |
| kitchen | CHEF001 | kitchen123 |

### Service URLs

| Service | URL | Emulator URL |
|---------|-----|-------------|
| Auth Service | http://localhost:3000 | http://10.0.2.2:3000 |
| Core Service | http://localhost:5005 | http://10.0.2.2:5005 |
| Menu Service | http://localhost:5003 | http://10.0.2.2:5003 |
| API Gateway | http://localhost:8080 | http://10.0.2.2:8080 |
| Web Dashboard | http://localhost:5173 | — |
| WebSocket | ws://localhost:5005 | ws://10.0.2.2:5005 |

---

## 13. Known Issues & Workarounds

### Issue 1: Maestro visual tour produces broken screenshots
**Symptom:** mob_ screenshots show black space, Android home screen, Maestro crosshairs, or crash screens.
**Cause:** System dialogs, focus loss, or timing issues during Maestro navigation.
**Workaround:** Skip Phase 7 entirely. Use Phase 8 (ADB manual screenshots) + copy QA_ screenshots to mob_ filenames.

### Issue 2: Reports screen crash (FIXED in APK)
**Symptom:** Expo crash screen "Something went wrong" when opening Reports.
**Cause:** `StyleSheet.create()` at module level accessing `theme.colors` before ThemeProvider initializes.
**Fix:** Moved StyleSheet inside component after `useTheme()` hook. Requires APK rebuild.

### Issue 3: User Management infinite spinner (FIXED in APK)
**Symptom:** Settings → User Management shows loading spinner forever.
**Cause:** `/api/users` call hangs with no timeout.
**Fix:** Added 8s timeout + inline error state fallback. Requires APK rebuild.

### Issue 4: Duplicate categories in mobile POS
**Symptom:** POS grid shows "Beverages x3, Mains x4" etc.
**Cause:** Multiple test runs without cleanup + stale SQLite cache.
**Workaround:** Use `clearState: true` in Maestro (already set in QA_bistro_full.yaml).

### Issue 5: Payment sync not reaching web billing
**Symptom:** Cash/card payments processed on mobile don't appear on web /billing.
**Cause:** `PaymentSyncProcessor.ts` sends to `/api/billing/sync/push` but payment record format doesn't match backend expectations for the billing queries.
**Status:** Payment records ARE saved to Core DB, but web billing page query doesn't pick them up.
**Workaround:** SV-04/SV-05 sync checks may show Partial or Fail.

### Issue 6: Web reports show $0.00
**Symptom:** Web /reports page shows $0.00 sales even after payments.
**Cause:** Reports query depends on `payment_records` table having `status = 'completed'` — payment sync doesn't always set this.
**Status:** Mobile reports work (uses local SQLite). Web reports depend on billing sync.

### Issue 7: Core DB schema drift
**Symptom:** `prisma migrate dev` fails in POS-Core-Service.
**Cause:** Manual schema changes applied via `prisma db push` that aren't in migration files.
**Workaround:** Always use `prisma db push` (NOT `prisma migrate dev`) for Core Service.

### Issue 8: BigInt error on order sync
**Symptom:** SyncEngine shows "Pushed 1 items" but order doesn't appear in Core DB.
**Cause:** `order.serializer.ts` calls `BigInt(created_by)` but `created_by` is a UUID string from Auth Service.
**Fix:** Already patched with try/catch + `BigInt(1)` fallback. If it regresses, check `POS-Services/POS-Core-Service/src/serializers/order.serializer.ts` line ~105.

---

## 14. Troubleshooting

### App can't reach backend from emulator
```bash
# Verify 10.0.2.2 routing works
adb shell curl -s http://10.0.2.2:8080/health

# Check .env has correct URL
cat POS-App/.env | grep API_URL
# Should be: EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

### Maestro can't find app
```bash
# Verify app is installed
adb shell pm list packages | grep ajinkya

# Verify app ID matches YAML
grep "appId" POS-App/.maestro/qa/bistro/QA_bistro_full.yaml
# Should be: com.ajinkya123.POSReactNativeApp
```

### Playwright tests fail to log in
```bash
# Check Auth Service is running
curl -s http://localhost:3000/health

# Try manual login
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Client-Type: web" \
  -d '{"email":"admin@blueplatebistro.io","password":"BPBAdmin2026!"}' | head -100
```

### SyncEngine not pushing data
```bash
# Check mobile app logs for sync activity
adb logcat -d | grep -i "SyncEngine" | tail -20

# Look for "Pushed X items" or "Push error"
adb logcat -d | grep "ReactNativeJS" | grep -i "sync\|push\|pull" | tail -20
```

### Screenshots are black or partial
- ADB screenshots of black/partial screens usually mean the emulator hasn't finished rendering
- Add a 2-second delay between navigation and screenshot: `sleep 2`
- For Maestro, add `- waitForAnimationToEnd` before `- takeScreenshot`

### Auth rate limit hit (429 errors)
```bash
# Check rate limit setting
grep "max:" POS-Authentication/src/middleware/rateLimit.ts
# Dev should be 200 (set in session 5 QA fixes)
# If still hitting limits, restart Auth Service
```

---

## 15. File Map

### Playwright Test Specs (POS-Authentication-Frontend/e2e/qa/)

| File | Purpose | Run When |
|------|---------|----------|
| `bistro-setup.spec.ts` | Create restaurant + 5 staff | Once (or after DB wipe) |
| `bistro-web-data.spec.ts` | Seed menu/tables via API | Before each QA run |
| `bistro-sync-verify.spec.ts` | Verify app→web sync (SV-01–SV-10) | After Maestro QA suite |
| `bistro-screenshots.spec.ts` | Capture 17 web pages (BP-01–BP-17) | After data + orders exist |

### Maestro YAML Files (POS-App/.maestro/qa/bistro/)

| File | Purpose | Scenarios |
|------|---------|-----------|
| `QA_bistro_full.yaml` | Full 30-scenario QA suite | QA_01–QA_30 |
| `bistro_visual_tour.yaml` | Screen gallery tour | mob_01–mob_20 |
| `explore_ordering.yaml` | Quick order flow test | — |
| `explore_settings.yaml` | Settings navigation test | — |
| `quick_login_explore.yaml` | Login + quick look | — |

### Screenshot Directories

| Directory | Contents | Count |
|-----------|----------|-------|
| `prep/testing/screenshots/bistro-setup/` | Store creation evidence | 6 |
| `prep/testing/screenshots/bistro-web-data/` | Data seeding verification | 14 |
| `prep/testing/screenshots/bistro-mobile/` | QA_*.png + mob_*.png | ~56 |
| `prep/testing/screenshots/bistro-sync/` | Sync verification evidence | 11 |
| `prep/testing/screenshots/bistro-web/` | Web page captures | 17 |

### Key Source Files (fixes applied during QA)

| File | Fix Applied |
|------|-------------|
| `POS-App/src/screens/reports/ReportsScreen.tsx` | StyleSheet moved inside component |
| `POS-App/src/screens/settings/components/UserManagementSettings.tsx` | Added timeout + error fallback |
| `POS-App/src/services/api/apiClient.ts` | Silent flag for sync (no toast on 401) |
| `POS-App/src/services/sync/processors/OrderSyncProcessor.ts` | Field mapping fixes |
| `POS-App/src/services/sync/processors/PaymentSyncProcessor.ts` | Sync push format |
| `POS-Services/POS-Core-Service/src/serializers/order.serializer.ts` | BigInt UUID fallback |
| `POS-Services/POS-Menu-Service/src/services/category.service.ts` | `is_active` in create() |
| `POS-Authentication-Frontend/src/services/menuService.ts` | Field transforms |
| `POS-Authentication/src/middleware/rateLimit.ts` | Dev limit: 200 req/15min |

---

## Quick Reference — Full Run in Order

```bash
# 0. Start all services (5 terminals)
# 1. Start emulator + install APK

# 2. Restaurant setup (skip if already done)
cd POS-Authentication-Frontend
bun playwright test e2e/qa/bistro-setup.spec.ts --headed

# 3. Seed data
bun playwright test e2e/qa/bistro-web-data.spec.ts

# 4. Run mobile QA (30 scenarios)
cd /home/kira/Documents/Github/POS
maestro test POS-App/.maestro/qa/bistro/QA_bistro_full.yaml
cp QA_*.png prep/testing/screenshots/bistro-mobile/

# 5. Wait 30s for sync, then verify
sleep 30
cd POS-Authentication-Frontend
bun playwright test e2e/qa/bistro-sync-verify.spec.ts

# 6. Web screenshots
bun playwright test e2e/qa/bistro-screenshots.spec.ts

# 7. ADB screenshots for mob_ files (see Phase 8 above)

# 8. Open report
# file:///home/kira/Documents/Github/POS/prep/testing/index.html
```
