# Test Execution Order

Run tests in this order to ensure dependencies are met.

---

## Prerequisites

1. **All backend services must be running:**
   ```bash
   # Terminal 1 — Auth Service
   cd POS-Authentication && bun run dev

   # Terminal 2 — Core Service
   cd POS-Services && bun run dev:core

   # Terminal 3 — Menu Service
   cd POS-Services && bun run dev:menu

   # Terminal 4 — API Gateway
   cd POS-API-Gateway && bun run dev

   # Terminal 5 — Web Dashboard
   cd POS-Authentication-Frontend && bun run dev
   ```

2. **Database must be seeded:**
   ```bash
   cd POS-Authentication
   bunx prisma migrate dev
   bun run prisma/seed.ts
   ```

3. **Mobile emulator must be running (for Maestro):**
   ```bash
   # Start Android emulator
   emulator -avd <your_avd_name>

   # Install & start app
   cd POS-App
   bun expo start --android --clear
   ```

---

## Web Dashboard — Playwright

### Phase 1: Setup (run once)
```bash
cd POS-Authentication-Frontend
bunx playwright test e2e/setup/create-test-users.spec.ts --headed --project=chromium
```
Creates QA users in the database. Required before role-specific tests.

### Phase 2: Auth Tests
```bash
bunx playwright test e2e/auth/ --headed --project=chromium
```
Files: `login.spec.ts`, `session.spec.ts`

### Phase 3: User Management Tests
```bash
bunx playwright test e2e/users/ --headed --project=chromium
```
Files: `user-management.spec.ts`, `role-access.spec.ts`

### Phase 4: Page Tests (all roles)
```bash
bunx playwright test e2e/pages/ --headed --project=chromium
```
Files: `dashboard.spec.ts`, `menu.spec.ts`, `orders.spec.ts`, `tables.spec.ts`,
`kitchen.spec.ts`, `reports.spec.ts`, `staff.spec.ts`, `stores.spec.ts`

### Phase 5: Account Tests
```bash
bunx playwright test e2e/account/ --headed --project=chromium
```
Files: `account-settings.spec.ts`

### Full Suite (all phases)
```bash
bunx playwright test --headed --project=chromium
```

---

## Mobile App — Maestro

### Pre-run Checklist
- [ ] Android emulator is booted
- [ ] POS-App is installed and running
- [ ] Backend services are all up
- [ ] App can reach API Gateway at `http://10.0.2.2:8080` (emulator LAN)

> **Note for emulator:** Replace `localhost` with `10.0.2.2` for Android emulator to reach host machine.
> Update `POS-App/.env`: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080`

### Phase 1: Authentication
```bash
maestro test POS-App/.maestro/login_success.yaml
maestro test POS-App/.maestro/login_wrong_password.yaml
maestro test POS-App/.maestro/logout.yaml
```

### Phase 2: Core Flows
```bash
maestro test POS-App/.maestro/orders_create_order.yaml
maestro test POS-App/.maestro/menu_browse.yaml
maestro test POS-App/.maestro/tables_view.yaml
maestro test POS-App/.maestro/kitchen_view.yaml
```

### Phase 3: Sync Tests (requires live backend)
```bash
maestro test POS-App/.maestro/sync_01_menu_pull.yaml
maestro test POS-App/.maestro/sync_02_order_push.yaml
maestro test POS-App/.maestro/sync_05_offline_resume.yaml
```

### Full Mobile Suite
```bash
maestro test POS-App/.maestro/sync_full_suite.yaml
```

---

## Recommended Full QA Run

```bash
# Step 1: Backend
cd POS-Authentication && bun run dev &
cd POS-Services && bun run dev &
cd POS-API-Gateway && bun run dev &
cd POS-Authentication-Frontend && bun run dev &

# Step 2: Web — setup (once)
cd POS-Authentication-Frontend
bunx playwright test e2e/setup/ --headed --project=chromium

# Step 3: Web — full suite
bunx playwright test --headed --project=chromium

# Step 4: Mobile — full suite (with emulator running)
cd POS-App
bun expo start --android --clear &
sleep 30
maestro test .maestro/sync_full_suite.yaml
```
