# Playwright Testing Rules & Standards

## Core Principles

1. **Headed Chromium only** — `headless: false`, `channel: 'chromium'`. Never use Firefox or WebKit for this project.
2. **One role per describe block** — group tests by user role, not by page.
3. **Independent tests** — every `test()` must be able to run in isolation. Use `beforeEach` to log in; never rely on state from a prior test.
4. **No hardcoded waits** — never use `page.waitForTimeout()`. Use `waitForURL`, `waitForSelector`, `waitForResponse`, or Playwright locator auto-waiting.
5. **Page Object Model** — encapsulate selectors in `e2e/fixtures/`. Never repeat selectors across spec files.
6. **Screenshots on failure** — always configured; Playwright captures automatically on failure.
7. **Trace on failure** — `trace: 'on-first-retry'` in config.

---

## File Naming

```
e2e/
├── fixtures/       auth.ts, users.ts, pages/*.ts
├── setup/          *.spec.ts  (run-once setup)
├── auth/           login.spec.ts, session.spec.ts
├── users/          user-management.spec.ts, role-access.spec.ts
├── pages/          <page-name>.spec.ts
└── account/        account-settings.spec.ts
```

- Spec files: `<feature>.spec.ts`
- Fixture files: `<name>.ts` (no `.spec`)
- Test IDs prefix: `[AUTH]`, `[USERS]`, `[MENU]`, `[ORDERS]`, etc.

---

## Test Structure Template

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('[PAGE] Feature Name — Role: system_admin', () => {
  test.beforeEach(async ({ loginAsSysAdmin }) => {
    await loginAsSysAdmin();
  });

  test('should display correct heading', async ({ page }) => {
    await page.goto('/page');
    await expect(page.getByRole('heading', { name: 'Page Title' })).toBeVisible();
  });

  test('should create a new item', async ({ page }) => {
    await page.goto('/page/create');
    await page.getByLabel('Name').fill('Test Item');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Created successfully')).toBeVisible();
  });
});
```

---

## Locator Priority (use in this order)

1. `getByRole` — semantic ARIA roles (most resilient)
2. `getByLabel` — form labels
3. `getByPlaceholder` — input placeholders
4. `getByText` — visible text content
5. `getByTestId` — `data-testid` attributes (when others fail)
6. `locator('.css-class')` — CSS selectors (last resort)

Never use XPath. Never use positional selectors like `nth(0)` unless the list is dynamic and there is no alternative.

---

## Authentication Pattern

```typescript
// e2e/fixtures/auth.ts exports these helpers:
// loginAsSysAdmin()   → admin@system.com / SuperAdmin123!
// loginAsStoreAdmin() → admin@demo-store.com / StoreAdmin123!
// loginAsUser()       → user@demo-store.com / User123!

// Each helper:
// 1. Navigates to /login
// 2. Fills email + password
// 3. Clicks submit
// 4. Waits for redirect to /
// 5. Asserts user menu is visible
```

---

## Assertions

```typescript
// ✅ CORRECT
await expect(page.getByRole('heading')).toBeVisible();
await expect(page).toHaveURL('/users');
await expect(page.getByText('Saved')).toBeVisible();
await expect(page.getByRole('row')).toHaveCount(3);

// ❌ WRONG
expect(await page.isVisible('.heading')).toBe(true);  // no auto-wait
await page.waitForTimeout(2000);                        // hardcoded wait
```

---

## Error Handling in Tests

```typescript
// For operations that might fail (API calls), use response interceptor:
const responsePromise = page.waitForResponse(
  resp => resp.url().includes('/api/users') && resp.status() === 201
);
await page.getByRole('button', { name: 'Create' }).click();
const response = await responsePromise;
expect(response.status()).toBe(201);
```

---

## Role-Based Access Testing Pattern

```typescript
test('store_admin cannot access /logs', async ({ page, loginAsStoreAdmin }) => {
  await loginAsStoreAdmin();
  await page.goto('/logs');
  // Should redirect away or show 403
  await expect(page).not.toHaveURL('/logs');
});
```

---

## Data Cleanup

- Tests that CREATE data must tag themselves with `@cleanup`
- Cleanup happens in `afterEach` via API call (not UI)
- Use `page.request.delete('/api/users/:id')` for API cleanup
- If UI cleanup is needed, use a separate cleanup spec

---

## Timeout Configuration (in playwright.config.ts)

```typescript
timeout: 30_000,           // per test
actionTimeout: 10_000,     // per action (click, fill, etc.)
navigationTimeout: 15_000, // page navigations
```

---

## Screenshot Naming

Screenshots saved to `e2e/screenshots/` with format:
`{spec-name}_{test-name}_{timestamp}.png`

---

## Forbidden Patterns

```typescript
// ❌ Never do these:
await page.waitForTimeout(3000);           // hardcoded sleep
page.$$('.item')[0].click();               // non-Playwright element
const el = await page.$('#id');            // legacy API
expect(await page.textContent('h1')).toBe; // manual async, no auto-wait
test.only(...)                             // never commit .only
test.skip(...)                             // never commit .skip without ticket reference
```
