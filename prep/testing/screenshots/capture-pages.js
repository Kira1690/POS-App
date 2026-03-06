/**
 * Automated page screenshot capture for QA validation
 * Run: npx playwright test --config=playwright.config.ts screenshots/capture-pages.js
 * Or: node screenshots/capture-pages.js (standalone with playwright)
 */
const { chromium } = require('playwright-core');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = '/home/kira/Documents/Github/POS/prep/testing/screenshots/web';

const PAGES = [
  { name: 'p01_web_dashboard', path: '/' },
  { name: 'p02_web_menu_categories', path: '/menu' },
  { name: 'p06_web_orders', path: '/orders' },
  { name: 'p08_web_tables_floor', path: '/tables' },
  { name: 'p10_web_kitchen', path: '/kitchen' },
  { name: 'p11_web_billing', path: '/billing' },
  { name: 'p12_web_customers', path: '/customers' },
  { name: 'p13_web_reports', path: '/reports' },
  { name: 'p14_web_staff', path: '/staff' },
  { name: 'p17_web_discounts', path: '/discounts' },
  { name: 'p15_web_stores', path: '/stores' },
  { name: 'p16_web_account', path: '/account' },
  { name: 'p18_web_users', path: '/users' },
  { name: 'p19_web_report_emails', path: '/report-emails' },
  { name: 'p20_web_logs', path: '/logs' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // Login first
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', 'qa.sysadmin@pos.test');
  await page.fill('input[type="password"], input[name="password"]', 'Test1234');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/');
  await page.waitForLoadState('networkidle');
  console.log('Login successful!');

  const results = [];

  for (const p of PAGES) {
    try {
      console.log(`Capturing ${p.name} (${p.path})...`);
      await page.goto(`${BASE_URL}${p.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // Allow dynamic content to load

      const path = `${SCREENSHOT_DIR}/${p.name}.png`;
      await page.screenshot({ path, fullPage: false });

      // Check for error states
      const hasError = await page.locator('text=Error').count() > 0;
      const hasEmpty = await page.locator('text=No data').count() > 0 ||
                       await page.locator('text=no results').count() > 0;

      results.push({ page: p.name, path: p.path, status: 'OK', hasError, hasEmpty });
      console.log(`  ✓ ${p.name} captured ${hasError ? '(has errors)' : ''} ${hasEmpty ? '(empty data)' : ''}`);
    } catch (err) {
      results.push({ page: p.name, path: p.path, status: 'FAIL', error: err.message });
      console.log(`  ✗ ${p.name} failed: ${err.message}`);
    }
  }

  await browser.close();

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
})();
