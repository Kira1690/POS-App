# POS System — Master QA Testing Strategy

## Key Documents

| Document | Purpose |
|----------|---------|
| [`BISTRO-QA-RUNBOOK.md`](./BISTRO-QA-RUNBOOK.md) | Step-by-step guide to run full QA suite (30 scenarios, 14 sync checks, 87 screenshots) |
| [`SPRINT-COMPLETION-REPORT.md`](./SPRINT-COMPLETION-REPORT.md) | Gantt chart v4 task-by-task completion status (22/22 implemented, session history) |
| [`REMAINING-WORK-PLAN.md`](./REMAINING-WORK-PLAN.md) | 11 remaining items: P0 stubs, P1 features, P2 sync fixes, with execution phases |
| [`index.html`](./index.html) | HTML evidence report — open in browser for visual QA results |

---

## Overview

Two test runners cover the full POS system:

| Runner | Target | Mode |
|--------|--------|------|
| **Playwright** | POS Web Dashboard (`localhost:5173`) | Chromium, headed (visible) |
| **Maestro** | POS Mobile App (Android emulator) | Native APK on `10.0.2.2:8080` |

---

## Credentials Reference

### Web Dashboard (POS-Authentication-Frontend)

| Role | Email | Password | Access |
|------|-------|----------|--------|
| system_admin | `admin@system.com` | `SuperAdmin123!` | Everything |
| store_admin | `admin@demo-store.com` | `StoreAdmin123!` | Demo Store only |
| user | `user@demo-store.com` | `User123!` | Demo Store, read-heavy |

### Additional QA Users (created via UI in `setup/create-test-users.spec.ts`)

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| system_admin | `qa.sysadmin@pos.test` | `QASysAdmin123!` | Second sysadmin to test limits |
| store_admin | `qa.storeadmin@pos.test` | `QAStoreAdmin123!` | Second store_admin |
| user | `qa.user@pos.test` | `QAUser123!` | Second regular user |

### Mobile App (POS-App — Dummy Offline Auth)

| Role | Credential | Password | Entry |
|------|-----------|----------|-------|
| manager | `manager@foodcorner.com` | `manager123` | Manager Login |
| restaurant_staff | `EMP001` | `staff123` | Staff Login |
| kitchen_staff | `CHEF001` | `kitchen123` | Staff Login |
| admin | `admin@foodcorner.com` | `admin123` | Manager Login |
| superadmin | `superadmin@foodpos.com` | `super123` | Manager Login |

---

## Test Execution Order

### Web Dashboard (Playwright)

Run in this order — each phase depends on the previous:

```bash
# Phase 0: Pre-flight (backend must be running)
cd POS-Authentication-Frontend
bunx playwright test e2e/setup/create-test-users.spec.ts --headed --project=chromium

# Phase 1: Authentication
bunx playwright test e2e/auth/ --headed --project=chromium

# Phase 2: User Management (system_admin features)
bunx playwright test e2e/users/ --headed --project=chromium

# Phase 3: All pages per role
bunx playwright test e2e/pages/ --headed --project=chromium

# Phase 4: Account & Settings
bunx playwright test e2e/account/ --headed --project=chromium

# Run ALL (after setup is done)
bunx playwright test --headed --project=chromium
```

### Mobile App (Maestro)

```bash
# Pre-flight
adb shell pm clear host.exp.exponent
bun expo start --clear   # in POS-App directory

# Full offline suite (all 5 roles + all features)
maestro test .maestro/qa_full_suite.yaml

# Individual suites
maestro test .maestro/01_staff_login_offline.yaml
maestro test .maestro/02_manager_login_offline.yaml
maestro test .maestro/03_kitchen_staff_login_offline.yaml

# Split payment suite
maestro test .maestro/split-payment-tests/

# Sync tests (backend must be running at port 8080)
maestro test .maestro/sync_full_suite.yaml
```

---

## Services Required

```bash
# Auth Service (port 3000)
cd POS-Authentication && bun run dev

# Core Service (port 5005)
cd POS-Services && bun run dev:core

# Menu Service (port 5003)
cd POS-Services && bun run dev:menu

# API Gateway (port 8080)
cd POS-API-Gateway && bun run dev

# Web Dashboard (port 5173)
cd POS-Authentication-Frontend && bun run dev

# Android emulator
# Start via Android Studio or: emulator -avd <avd_name>

# Expo dev server (port 8081)
cd POS-App && bun expo start --clear
```

---

## Folder Structure

```
prep/testing/
├── README.md                    ← This file (master strategy)
├── BISTRO-QA-RUNBOOK.md         ← ★ Step-by-step Bistro QA guide (start here)
├── SPRINT-COMPLETION-REPORT.md  ← ★ Gantt chart completion status + session history
├── REMAINING-WORK-PLAN.md       ← ★ 11 remaining items with execution phases
├── index.html                   ← HTML evidence report (open in browser)
├── bistro_manifest.md           ← Bistro restaurant/login verification log
├── rules/
│   ├── playwright-rules.md      ← Playwright coding standards
│   └── maestro-rules.md         ← Maestro coding standards
├── scenarios/
│   ├── web-dashboard-scenarios.md       ← All web test scenarios
│   ├── mobile-app-scenarios.md          ← Mobile offline test scenarios
│   ├── mobile-sync-integration-plan.md  ← 55 sync/integration test cases
│   └── roles-matrix.md                  ← Role × feature access matrix
├── setup/
│   ├── credentials.md           ← All test credentials reference
│   └── test-data.md             ← Menu items, orders, table IDs used in tests
├── execution/
│   ├── run-order.md             ← Sequential test run guide
│   ├── ci-commands.md           ← One-liners for CI pipelines
│   └── web-dashboard-test-results.md  ← 102/102 Playwright results
└── screenshots/
    ├── bistro-setup/            ← Store creation evidence (6 files)
    ├── bistro-web-data/         ← Data seeding verification (14 files)
    ├── bistro-mobile/           ← QA + mob screenshots (56+ files)
    ├── bistro-sync/             ← Sync verification evidence (11 files)
    └── bistro-web/              ← Web page captures (17 files)

POS-Authentication-Frontend/e2e/
├── fixtures/
│   ├── auth.ts                  ← Login helpers for each role
│   └── users.ts                 ← Test user definitions
├── setup/
│   └── create-test-users.spec.ts  ← Creates QA users via dashboard UI (run once)
├── auth/
│   ├── login.spec.ts            ← Login/logout all 3 roles
│   └── session.spec.ts          ← Session persistence & token refresh
├── users/
│   ├── user-management.spec.ts  ← CRUD for users (system_admin)
│   └── role-access.spec.ts      ← Role-based route restrictions
├── pages/
│   ├── dashboard.spec.ts        ← Home page per role
│   ├── menu.spec.ts             ← Menu management CRUD
│   ├── orders.spec.ts           ← Orders page
│   ├── tables.spec.ts           ← Tables page
│   ├── kitchen.spec.ts          ← Kitchen page
│   ├── reports.spec.ts          ← Reports & analytics
│   ├── staff.spec.ts            ← Staff page
│   └── stores.spec.ts           ← Stores management
└── account/
    └── account-settings.spec.ts ← Profile, sessions, password
```
