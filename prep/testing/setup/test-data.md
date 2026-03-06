# Test Data

## Seeded Database Data

The following data is created by the database seed and must exist before tests run.

### Stores
| ID | Name        | Slug        |
|----|-------------|-------------|
| 1  | Demo Store  | demo-store  |

### Users
See `credentials.md` — 3 seeded users across all 3 roles.

### Menu Data (Core/Menu Service)
- At least 2 categories (e.g., "Beverages", "Food")
- At least 3 menu items
- At least 1 modifier group with options

### Tables (Core Service)
- At least 4 tables in 1 area (e.g., "Main Hall")
- Table numbers: T1, T2, T3, T4

---

## Dynamic Test Data (created during tests)

### Playwright — Created per-session (timestamp-based to avoid conflicts)
```
QA Cat <timestamp>    — menu category created in menu.spec.ts
QA Item <timestamp>   — menu item created in menu.spec.ts
temp_testuser         — temp user in user-management.spec.ts
temp.{ts}@pos.test    — temp email to avoid collisions
```

### Playwright — Persistent QA users (created once via setup spec)
```
qa.sysadmin@pos.test
qa.storeadmin@pos.test
qa.user@pos.test
```

---

## Data Cleanup

### After Playwright Test Run
Temporary data created during tests should be cleaned up manually or via a teardown script.
Items to clean:
- QA users (qa.* emails) if re-running setup
- Temp menu items/categories (prefixed `QA `)
- Edited usernames (e.g., `edited_username_qa`)

### Database Reset (nuclear option)
```bash
# Reset the auth database
cd POS-Authentication
bunx prisma migrate reset --force

# Re-seed
bun run prisma/seed.ts
```

---

## Screenshots

All Playwright screenshots are saved to:
```
POS-Authentication-Frontend/e2e/screenshots/
```

Naming convention: `{page}_{role}_{action}.png`
Examples:
- `login_success_sysadmin.png`
- `menu_create_category.png`
- `rbac_storeadmin_no_users.png`

---

## Maestro Screenshots

All Maestro screenshots are saved inline during test execution via:
```yaml
- takeScreenshot: "{test_name}_{step}"
```

Output directory is managed by Maestro Cloud or local `~/.maestro/tests/` by default.
