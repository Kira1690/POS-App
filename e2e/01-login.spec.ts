/**
 * Login smoke test — uses REAL server credentials against payment.gsmnyc.com
 *
 * Requires:
 * - .env: EXPO_PUBLIC_API_URL=https://payment.gsmnyc.com
 * - Expo web running: bun run web:e2e
 */
import { test, expect } from '@playwright/test';
import { gotoApp, loginServer, shot } from './helpers';

test.describe('Login', () => {
  test('welcome screen loads', async ({ page }) => {
    await gotoApp(page);
    await shot(page, '01-welcome');
    await expect(page.getByText('Welcome to FoodPOS')).toBeVisible();
  });

  test('login with admin@chubbyburger.com against gsmnyc.com', async ({ page }) => {
    await gotoApp(page);
    await shot(page, '01-pre-login');

    await loginServer(page);
    await shot(page, '01-after-login');

    // Should NOT see error messages
    const body = (await page.textContent('body')) ?? '';
    expect(body).not.toContain('Invalid credentials');
    expect(body).not.toContain('Login failed');

    // Should see main app tabs
    const hasTabs =
      (await page.getByText('Dashboard').isVisible().catch(() => false)) ||
      (await page.getByText('Order Management').isVisible().catch(() => false));
    expect(hasTabs).toBeTruthy();
    await shot(page, '01-logged-in');
  });
});
