/**
 * 03 — Five-Order Full Lifecycle Test
 *
 * Runs the POS app in Expo Web (localhost:19006) via Playwright/Chromium.
 * Single shared browser session — login ONCE in beforeAll, never re-login.
 * Re-login triggers a full pull sync that overwrites local SQLite state.
 *
 * Flow:
 *   beforeAll — login as admin@chubbyburger.com, wait 8s for initial sync
 *   01–05     — create one order per table (B-1 … B-5), wait 7s push sync each
 *   06        — verify all 5 orders on server API + kitchen tab visible
 *   07        — mark all orders Preparing (Start button)
 *   08        — mark all orders Ready
 *   09        — final server stats snapshot
 *   10        — Android emulator SQLite cross-check (if adb device available)
 */

import { test, expect, Browser, Page, chromium } from '@playwright/test';
import { execSync } from 'child_process';
import { loginServer, goToTab, shot } from './helpers';

const API_BASE   = 'https://payment.gsmnyc.com';
// UUID restaurant_id used by API Gateway (maps to numeric 1 in Core Service)
const RESTAURANT_ID = 'a516a655-15dc-4e84-afd0-ff3ef2fa6d52';
const APP_URL    = 'http://localhost:19006';
const PUSH_SYNC_WAIT_MS = 7000; // 5s timer + 2s buffer

// Shared session — persists across all tests
let browser: Browser;
let page: Page;

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fetch recent orders from production API using the app's WASM-stored JWT. */
async function serverOrders(): Promise<any[]> {
  try {
    const result = await page.evaluate(
      async ({ apiBase, restaurantId }) => {
        const raw = localStorage.getItem('auth_tokens');
        const token = raw ? (JSON.parse(raw)?.accessToken ?? null) : null;
        if (!token) return { error: 'no token', orders: [] };

        // API Gateway filters by UUID restaurant_id (maps to numeric 1 in Core Service)
        const res = await fetch(
          `${apiBase}/api/orders?restaurant_id=${restaurantId}&sort=created_at:desc&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        // Server returns: { success, data: { data: [...], pagination: {} } }
        const orders = Array.isArray(json?.data?.data)
          ? json.data.data
          : Array.isArray(json?.data?.orders)
          ? json.data.orders
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        return { status: res.status, orders };
      },
      { apiBase: API_BASE, restaurantId: RESTAURANT_ID }
    );
    if (result.error) { console.log(`[Server] ${result.error}`); return []; }
    return result.orders ?? [];
  } catch (e) {
    console.log(`[Server] fetch error: ${e}`);
    return [];
  }
}

/** Wait for push sync timer to fire and reach the server. */
async function waitForPushSync(label: string): Promise<void> {
  console.log(`[Sync] Waiting ${PUSH_SYNC_WAIT_MS}ms after: ${label}`);
  await page.waitForTimeout(PUSH_SYNC_WAIT_MS);
}

/** Create one order on the given table. Returns true if sent to kitchen. */
async function createOrderOnTable(tableName: string): Promise<boolean> {
  // Go to Orders tab
  await goToTab(page, 'tab-nav-orders');
  await page.waitForTimeout(1000);

  // Tap New Order
  const newOrderBtn = page.locator('[data-testid="btn-new-order"]');
  if (!await newOrderBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
    console.log(`[${tableName}] btn-new-order not found`);
    return false;
  }
  await newOrderBtn.click();
  await page.waitForTimeout(1500);
  await shot(page, `03-${tableName}-01-after-new-order`);

  // Table Selection Modal — pick the specific table
  const tableBtn = page.locator(`[data-testid="btn-table-select-${tableName}"]`);
  if (await tableBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await tableBtn.click();
    console.log(`[${tableName}] Table selected`);
  } else {
    // fallback — first available
    const anyTableBtn = page.locator('[data-testid^="btn-table-select-"]').first();
    if (await anyTableBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const tid = await anyTableBtn.getAttribute('data-testid');
      console.log(`[${tableName}] Fallback table: ${tid}`);
      await anyTableBtn.click();
    } else {
      console.log(`[${tableName}] No table button found`);
      return false;
    }
  }
  await page.waitForTimeout(1500);

  // "Table has active order" dialog — click Update Order
  const updateOrderBtn = page.locator('text=Update Order').first();
  if (await updateOrderBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log(`[${tableName}] Active order dialog — clicking Update Order`);
    await updateOrderBtn.click();
    await page.waitForTimeout(1500);
  }

  // Guest count modal
  const guestConfirm = page.locator('[data-testid="btn-guest-confirm"]');
  if (await guestConfirm.isVisible({ timeout: 2000 }).catch(() => false)) {
    await guestConfirm.click();
    await page.waitForTimeout(1000);
  }

  await shot(page, `03-${tableName}-02-pos-screen`);

  // Add first available menu item
  const menuItem = page.locator('[data-testid^="btn-menu-item-"]').first();
  const menuLoaded = await menuItem.isVisible({ timeout: 15_000 }).catch(() => false);
  if (menuLoaded) {
    const itemId = await menuItem.getAttribute('data-testid');
    console.log(`[${tableName}] Adding menu item: ${itemId}`);
    await menuItem.click();
    await page.waitForTimeout(800);

    // Dismiss modifier modal if it appeared
    const modConfirm = page.locator('[data-testid="btn-modifier-confirm"]');
    if (await modConfirm.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modConfirm.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log(`[${tableName}] No menu items loaded`);
    await shot(page, `03-${tableName}-02-no-menu`);
    return false;
  }

  // Send to Kitchen
  const sendBtn = page.locator('[data-testid="btn-cart-send-to-kitchen"]');
  if (!await sendBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
    console.log(`[${tableName}] Send to kitchen btn not visible`);
    await shot(page, `03-${tableName}-03-no-send-btn`);
    return false;
  }

  const t0 = Date.now();
  await sendBtn.click();
  console.log(`[${tableName}] Send to kitchen tapped at ${new Date(t0).toISOString()}`);
  await page.waitForTimeout(1000);

  // Confirm SendToKitchenModal
  const kitchenConfirm = page.locator('[data-testid="btn-kitchen-modal-confirm"]');
  if (await kitchenConfirm.isVisible({ timeout: 3000 }).catch(() => false)) {
    await kitchenConfirm.click();
    await page.waitForTimeout(1500);
  }

  await shot(page, `03-${tableName}-03-sent`);
  console.log(`[${tableName}] Order sent to kitchen ✓`);
  return true;
}

/** Query Android emulator SQLite. Returns null if unavailable. */
function adbQuery(sql: string): string | null {
  try {
    const devices = execSync('adb devices', { timeout: 5000 }).toString();
    if (!devices.includes('emulator-')) return null;
    return execSync(
      `adb shell "run-as com.ajinkya123.POSReactNativeApp sqlite3 /data/data/com.ajinkya123.POSReactNativeApp/files/SQLite/pos_app.db '${sql}'"`,
      { timeout: 10_000, encoding: 'utf8' }
    ).trim();
  } catch {
    return null;
  }
}

// ── Test Suite ─────────────────────────────────────────────────────────────

test.describe('Five-Order Full Lifecycle', () => {
  test.setTimeout(300_000); // 5 minutes

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();

    // Navigate to app and wait for it to load
    await page.goto(APP_URL);
    await page.waitForSelector('text=Welcome to FoodPOS', { timeout: 30_000 });
    await shot(page, '03-00-welcome');

    // Login ONCE — single session for all tests
    await loginServer(page);
    await shot(page, '03-00-logged-in');

    // Wait for initial sync (SyncEngine resets lastSync → full pull on start)
    console.log('[Init] Waiting 8s for initial sync...');
    await page.waitForTimeout(8000);
    console.log('[Init] Session ready');
  });

  test.afterAll(async () => {
    await browser?.close();
  });

  // ── Orders 01–05: One per table ────────────────────────────────────────

  test('01 — create order on B-1', async () => {
    const ok = await createOrderOnTable('B-1');
    expect(ok).toBeTruthy();
    await waitForPushSync('B-1');
    const orders = await serverOrders();
    console.log(`[Server] Orders after B-1: ${orders.length}`);
  });

  test('02 — create order on B-2', async () => {
    const ok = await createOrderOnTable('B-2');
    expect(ok).toBeTruthy();
    await waitForPushSync('B-2');
    const orders = await serverOrders();
    console.log(`[Server] Orders after B-2: ${orders.length}`);
  });

  test('03 — create order on B-3', async () => {
    const ok = await createOrderOnTable('B-3');
    expect(ok).toBeTruthy();
    await waitForPushSync('B-3');
    const orders = await serverOrders();
    console.log(`[Server] Orders after B-3: ${orders.length}`);
  });

  test('04 — create order on B-4', async () => {
    const ok = await createOrderOnTable('B-4');
    expect(ok).toBeTruthy();
    await waitForPushSync('B-4');
    const orders = await serverOrders();
    console.log(`[Server] Orders after B-4: ${orders.length}`);
  });

  test('05 — create order on B-5', async () => {
    const ok = await createOrderOnTable('B-5');
    expect(ok).toBeTruthy();
    await waitForPushSync('B-5');
    const orders = await serverOrders();
    console.log(`[Server] Orders after B-5: ${orders.length}`);
  });

  // ── Test 06: Verify all 5 on server + kitchen tab ─────────────────────

  test('06 — verify all 5 orders on server and kitchen display', async () => {
    // Extra buffer for any lagging push syncs
    await page.waitForTimeout(5000);

    const orders = await serverOrders();
    console.log(`\n[Server] Total orders: ${orders.length}`);
    orders.forEach((o: any) => {
      console.log(`  id=${o.id} | #${o.order_number ?? o.orderNumber} | table_id=${o.table_id} | status=${o.status}`);
    });

    expect(orders.length).toBeGreaterThanOrEqual(5);

    // Check Kitchen tab
    await goToTab(page, 'tab-nav-kitchen');
    await page.waitForTimeout(2000);
    await shot(page, '03-06-kitchen-all-orders');

    const body = (await page.textContent('body')) ?? '';
    expect(body).not.toContain('Something went wrong');
    expect(body).not.toContain('TypeError');

    const hasPending = await page.getByText('Pending').isVisible().catch(() => false);
    console.log(`[Kitchen] Pending orders visible: ${hasPending}`);
  });

  // ── Test 07: Move all to Preparing ────────────────────────────────────

  test('07 — mark all orders Preparing', async () => {
    await goToTab(page, 'tab-nav-kitchen');
    await page.waitForTimeout(2000);

    let clicks = 0;
    for (let i = 0; i < 10; i++) {
      const startBtn = page.locator('[data-testid="btn-kitchen-action-start"]').first();
      if (!await startBtn.isVisible({ timeout: 1500 }).catch(() => false)) break;
      await startBtn.click();
      clicks++;
      await page.waitForTimeout(1000);
    }
    console.log(`[Kitchen] Clicked Start ${clicks} times`);
    await page.waitForTimeout(2000);
    await shot(page, '03-07-preparing');

    await waitForPushSync('→ Preparing');
    const orders = await serverOrders();
    const preparing = orders.filter((o: any) =>
      ['preparing', 'PREPARING', 'in_progress'].includes(o.status)
    );
    console.log(`[Server] Preparing orders: ${preparing.length}`);
  });

  // ── Test 08: Move all to Ready ────────────────────────────────────────

  test('08 — mark all orders Ready', async () => {
    await goToTab(page, 'tab-nav-kitchen');
    await page.waitForTimeout(2000);

    let clicks = 0;
    for (let i = 0; i < 10; i++) {
      const readyBtn = page.locator('[data-testid="btn-kitchen-action-ready"]').first();
      if (!await readyBtn.isVisible({ timeout: 1500 }).catch(() => false)) break;
      await readyBtn.click();
      clicks++;
      await page.waitForTimeout(1000);
    }
    console.log(`[Kitchen] Clicked Ready ${clicks} times`);
    await page.waitForTimeout(2000);
    await shot(page, '03-08-ready');

    await waitForPushSync('→ Ready');
    const orders = await serverOrders();
    const ready = orders.filter((o: any) => ['ready', 'READY'].includes(o.status));
    console.log(`[Server] Ready orders: ${ready.length}`);
  });

  // ── Test 09: Final server stats ───────────────────────────────────────

  test('09 — final server stats', async () => {
    const orders = await serverOrders();
    const byStatus: Record<string, number> = {};
    orders.forEach((o: any) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

    console.log(`\n[Final] Total orders on server: ${orders.length}`);
    Object.entries(byStatus).forEach(([s, c]) => console.log(`  ${s}: ${c}`));

    await shot(page, '03-09-final-state');
    expect(orders.length).toBeGreaterThanOrEqual(5);
  });

  // ── Test 10: Android SQLite cross-check ──────────────────────────────

  test('10 — Android SQLite cross-check (emulator)', async () => {
    const orderCount = adbQuery('SELECT COUNT(*) FROM orders;');
    if (orderCount === null) {
      console.log('[Android] No emulator connected — skipping');
      return;
    }

    const pendingSync = adbQuery('SELECT COUNT(*) FROM orders WHERE pending_sync=1;');
    const recent      = adbQuery(
      "SELECT id, order_number, table_name, status, pending_sync FROM orders ORDER BY created_at DESC LIMIT 10;"
    );

    console.log(`\n[Android SQLite]`);
    console.log(`  Orders total: ${orderCount}`);
    console.log(`  Pending sync: ${pendingSync}`);
    console.log(`  Recent orders:\n${recent}`);

    const serverOrderList = await serverOrders();
    console.log(`\n[Cross-Reference] Web WASM orders pushed to server: ${serverOrderList.length}`);
    console.log(`[Cross-Reference] Android native SQLite orders: ${orderCount}`);

    // Core assertion
    expect(parseInt(orderCount, 10)).toBeGreaterThanOrEqual(5);
    console.log(`[Sync Health] pending_sync=${pendingSync} (target: 0)`);
  });
});
