/**
 * Server credentials login test
 * Tests against the real production server: https://payment.gsmnyc.com
 *
 * Requires:
 * - .env pointing to production (EXPO_PUBLIC_API_URL=https://payment.gsmnyc.com)
 * - Expo web running: bun expo start --web
 * - Internet connection to payment.gsmnyc.com
 */
import { test, expect } from '@playwright/test';
import { gotoApp, loginServer, shot } from './helpers';

test.describe('Server Login (production)', () => {
  test('login with admin@chubbyburger.com against gsmnyc.com', async ({ page }) => {
    await gotoApp(page);
    await shot(page, '03-welcome');

    await loginServer(page);
    await shot(page, '03-after-server-login');

    // On success, should NOT see error messages
    const body = (await page.textContent('body')) ?? '';
    const hasError =
      body.includes('Invalid credentials') ||
      body.includes('Login failed') ||
      body.includes('Network Error') ||
      body.includes('Something went wrong');

    expect(hasError).toBeFalsy();

    // Should see main app tabs
    const hasTabs =
      (await page.getByText('Dashboard').isVisible().catch(() => false)) ||
      (await page.getByText('Order Management').isVisible().catch(() => false));
    expect(hasTabs).toBeTruthy();
  });
});
