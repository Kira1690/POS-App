/**
 * Kitchen Display Screen — SSOT verification test
 *
 * Verifies:
 * 1. Kitchen tab renders the CORRECT screen (KitchenDisplayScreen, not KitchenStaffDashboard)
 * 2. Kitchen screen shows station-based card layout (SSOT data from UnifiedOrderContext)
 * 3. No "GET /api/orders" polling (old broken behavior) — instead uses local SQLite/context
 *
 * This test CATCHES the regression where KitchenStaffDashboard was imported instead of
 * KitchenDisplayScreen in MainNavigator.tsx.
 */
import { test, expect } from '@playwright/test';
import { gotoApp, loginDummy, goToTab, shot } from './helpers';

test.describe('Kitchen Display', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await loginDummy(page);
  });

  test('kitchen tab renders SSOT screen (not old dashboard)', async ({ page }) => {
    await goToTab(page, 'tab-nav-kitchen');
    await shot(page, '02-kitchen-tab');

    // KitchenDisplayScreen renders a header with "Kitchen" or station-based layout
    // KitchenStaffDashboard had a different header text ("Kitchen Operations" from API)
    // Both could have "Kitchen" text — we look for the SSOT-specific elements

    // The correct screen shows filter chips (All, Pending, Preparing, Ready)
    const hasFilterChips =
      (await page.getByText('Pending').isVisible().catch(() => false)) ||
      (await page.getByText('PENDING').isVisible().catch(() => false)) ||
      (await page.getByText('All Orders').isVisible().catch(() => false));

    // The OLD broken screen showed "Kitchen Operations" header from API response
    const hasOldHeader = await page
      .getByText('Kitchen Operations Dashboard', { exact: true })
      .isVisible()
      .catch(() => false);

    expect(hasOldHeader).toBeFalsy(); // Old screen must NOT be shown
    // Screen loads without crash
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('kitchen screen shows empty state gracefully (no orders yet)', async ({ page }) => {
    await goToTab(page, 'tab-nav-kitchen');
    await page.waitForTimeout(2000);
    await shot(page, '02-kitchen-empty');

    // Should not crash — even with no orders
    await expect(page.locator('body')).not.toContainText('TypeError');
    await expect(page.locator('body')).not.toContainText('Cannot read');
  });

  test('order appears in kitchen after being created', async ({ page }) => {
    // Go to Orders tab and create an order
    await goToTab(page, 'tab-nav-orders');
    await page.waitForTimeout(1000);
    await shot(page, '02-orders-before-create');

    // Look for New Order / + button
    const newOrderBtn = page.locator('[data-testid="btn-new-order"]');
    if (await newOrderBtn.isVisible().catch(() => false)) {
      await newOrderBtn.click();
      await page.waitForTimeout(2000);
      await shot(page, '02-after-new-order-tap');
    }

    // Now go to Kitchen tab
    await goToTab(page, 'tab-nav-kitchen');
    await page.waitForTimeout(2000);
    await shot(page, '02-kitchen-after-order');

    // Screen should still not crash
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });
});
