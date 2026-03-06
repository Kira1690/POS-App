# Test Credentials

## Seeded Users (always available)

These users are created by the database seed and are always present in development.

| Role         | Email                   | Password          | Store        |
|--------------|-------------------------|-------------------|--------------|
| system_admin | admin@system.com        | SuperAdmin123!    | — (all)      |
| store_admin  | admin@demo-store.com    | StoreAdmin123!    | Demo Store   |
| user         | user@demo-store.com     | User123!          | Demo Store   |

## QA Test Users (created via dashboard)

These are created by `e2e/setup/create-test-users.spec.ts`.
Run this spec ONCE before running the full test suite.

| Role         | Email                       | Password          | Store      |
|--------------|-----------------------------|-------------------|------------|
| system_admin | qa.sysadmin@pos.test        | QaSysAdmin123!    | — (all)    |
| store_admin  | qa.storeadmin@pos.test      | QaStoreAdmin123!  | Demo Store |
| user         | qa.user@pos.test            | QaUser123!        | Demo Store |

## Blue Plate Bistro Staff (created by bistro-setup.spec.ts)

| Role         | Email                           | Password        | Access                         |
|--------------|---------------------------------|-----------------|--------------------------------|
| store_admin  | admin@blueplatebistro.io        | BPBAdmin2026!   | Full web dashboard + mobile POS |
| manager      | manager@blueplatebistro.io      | BPBMgr2026!     | Web + mobile + reports          |
| waiter       | waiter@blueplatebistro.io       | BPBWtr2026!     | Mobile: orders, tables, customers |
| kitchen_staff| kitchen@blueplatebistro.io      | BPBKit2026!     | Mobile: kitchen tickets only    |
| cashier      | cashier@blueplatebistro.io      | BPBCsh2026!     | Mobile: payments + billing      |

> **Bistro QA Runbook:** See `prep/testing/BISTRO-QA-RUNBOOK.md` for full step-by-step test instructions.

## Mobile App Users (Maestro tests — offline fallback)

| Role            | Email                        | Password         | Notes                      |
|-----------------|------------------------------|------------------|----------------------------|
| manager         | manager@foodcorner.com       | manager123       | Default offline credentials|
| restaurant_staff| staff@foodcorner.com         | staff123         | —                          |
| kitchen_staff   | kitchen@foodcorner.com       | kitchen123       | —                          |
| cashier         | cashier@foodcorner.com       | cashier123       | —                          |
| admin           | admin@foodcorner.com         | admin123         | —                          |
| superadmin      | superadmin@foodcorner.com    | superadmin123    | —                          |

> **Note:** Mobile app offline credentials (`manager@foodcorner.com`) are baked into the app's
> default state. When the backend is unreachable, the app silently uses these credentials and
> works fully offline with seeded SQLite data.

## Backend Service URLs

| Service        | URL                        | Notes                    |
|----------------|----------------------------|--------------------------|
| Auth Service   | http://localhost:3000      | Handles login/sessions   |
| Core Service   | http://localhost:5005      | Orders/tables/kitchen/WS |
| Menu Service   | http://localhost:5003      | Menu/categories/items    |
| API Gateway    | http://localhost:8080      | Single entry point       |
| Web Dashboard  | http://localhost:5173      | React/Vite frontend      |

## Environment Variables

### Web Dashboard (`POS-Authentication-Frontend/.env` or `.env.local`)
```
VITE_API_URL=http://localhost:3000
```

### Mobile App (`POS-App/.env`)
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
EXPO_PUBLIC_WS_URL=ws://10.0.2.2:5005
```
> **IMPORTANT:** Must use `10.0.2.2` (not `localhost`) — Android emulator uses this to reach the host machine.
