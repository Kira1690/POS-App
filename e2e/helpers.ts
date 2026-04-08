import { Page } from '@playwright/test';

const BASE = 'http://localhost:19006';

/**
 * Navigate to app root and wait for the Welcome screen to fully load.
 * Waits for SQLite DB init + React render (WASM takes a few seconds).
 */
export async function gotoApp(page: Page) {
  await page.goto(BASE);
  // Wait until "Welcome to FoodPOS" text appears (DB init complete)
  await page.waitForSelector('text=Welcome to FoodPOS', { timeout: 30_000 });
}

/**
 * Login as manager using email + password.
 */
export async function loginAsManager(page: Page, email: string, password: string) {
  // Tap Manager Login button
  await page.getByText('MANAGER LOGIN').click();
  // Wait for the email input to appear (login form loaded)
  await page.waitForSelector('text=Email Address', { timeout: 10_000 });

  // Fill email — click the first input after "Email Address" label
  const emailInput = page.locator('input').first();
  await emailInput.click();
  await emailInput.fill(email);

  // Fill password
  const passInput = page.locator('input').nth(1);
  await passInput.click();
  await passInput.fill(password);

  // Submit
  await page.getByText('SIGN IN').click();

  // Wait for navigation away from login screen
  await page.waitForTimeout(6000);
}

/**
 * Login with real server credentials (admin@chubbyburger.com).
 */
export async function loginServer(page: Page) {
  await loginAsManager(page, 'admin@chubbyburger.com', 'StoreAdmin123!');
}

/**
 * Login with offline/dummy credentials (no server needed).
 */
export async function loginDummy(page: Page) {
  await loginAsManager(page, 'manager@foodcorner.com', 'manager123');
}

/**
 * Tap a bottom tab by its testID.
 */
export async function goToTab(page: Page, tabTestId: string) {
  await page.locator(`[data-testid="${tabTestId}"]`).click();
  await page.waitForTimeout(2000);
}

/**
 * Save a screenshot to e2e/screenshots/.
 */
export async function shot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png` });
}
