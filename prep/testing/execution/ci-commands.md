# CI Commands Reference

Quick reference for running tests in different contexts.

---

## Playwright (Web Dashboard)

### Run all tests (headed, Chromium)
```bash
cd POS-Authentication-Frontend
bunx playwright test --headed --project=chromium
```

### Run a single spec file
```bash
bunx playwright test e2e/auth/login.spec.ts --headed --project=chromium
```

### Run tests matching a pattern
```bash
bunx playwright test --headed --project=chromium --grep "\[AUTH\]"
bunx playwright test --headed --project=chromium --grep "\[RBAC\]"
bunx playwright test --headed --project=chromium --grep "\[MENU\]"
```

### Run in headless mode (CI only)
```bash
bunx playwright test --project=chromium
```

### View HTML report
```bash
bunx playwright show-report
```

### Debug a failing test (step-through)
```bash
bunx playwright test e2e/auth/login.spec.ts --debug
```

### Run with increased timeout
```bash
bunx playwright test --timeout=60000 --headed --project=chromium
```

### Re-run only failed tests
```bash
bunx playwright test --last-failed --headed --project=chromium
```

---

## Maestro (Mobile App)

### Run a single flow
```bash
maestro test POS-App/.maestro/login_success.yaml
```

### Run a directory of flows
```bash
maestro test POS-App/.maestro/
```

### Run the sync test suite
```bash
maestro test POS-App/.maestro/sync_full_suite.yaml
```

### Run with specific device
```bash
maestro --device <device-id> test POS-App/.maestro/login_success.yaml
```

### List connected devices
```bash
maestro device list
```

### View Maestro Studio (visual editor)
```bash
maestro studio
```

---

## Backend Health Checks

```bash
# Check all services are up
curl http://localhost:3000/health          # Auth
curl http://localhost:5005/health          # Core
curl http://localhost:5003/health          # Menu
curl http://localhost:8080/health          # Gateway

# Check gateway proxies correctly
curl http://localhost:8080/api/menu/categories?restaurant_id=1 \
  -H "Authorization: Bearer <token>"

# Get auth token (for manual API testing)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.com","password":"SuperAdmin123!"}'
```

---

## Database Commands

```bash
# Auth DB
cd POS-Authentication
bunx prisma studio              # visual DB browser
bunx prisma migrate dev         # apply migrations
bun run prisma/seed.ts          # re-seed

# Check seeded users
bunx prisma db execute --stdin <<< "SELECT email, role FROM users;"
```

---

## Playwright Spec File Map

| Spec File                              | Tests Count | Coverage Area            |
|----------------------------------------|-------------|--------------------------|
| `e2e/setup/create-test-users.spec.ts`  | 3           | QA user creation (setup) |
| `e2e/auth/login.spec.ts`               | 7+          | Login/logout flows       |
| `e2e/auth/session.spec.ts`             | 4           | Session persistence      |
| `e2e/users/user-management.spec.ts`    | 8           | CRUD users               |
| `e2e/users/role-access.spec.ts`        | ~15         | RBAC per route           |
| `e2e/pages/dashboard.spec.ts`          | 3           | Nav per role             |
| `e2e/pages/menu.spec.ts`               | 5           | Menu management          |
| `e2e/pages/orders.spec.ts`             | 5           | Orders page              |
| `e2e/pages/tables.spec.ts`             | 4           | Floor plan page          |
| `e2e/pages/kitchen.spec.ts`            | 4           | Kitchen board            |
| `e2e/pages/reports.spec.ts`            | 5           | Analytics/reports        |
| `e2e/pages/staff.spec.ts`              | 5           | Staff management         |
| `e2e/pages/stores.spec.ts`             | 6           | Store management         |
| `e2e/account/account-settings.spec.ts` | 7           | Profile/password         |

**Total estimated: ~80+ Playwright tests**
