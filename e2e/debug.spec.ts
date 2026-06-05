import { test } from '@playwright/test';
import { gotoApp, loginServer } from './helpers';

test('debug - capture all errors after login', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));

  // Capture failed network requests
  page.on('requestfailed', req => {
    failedRequests.push(`FAILED: ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });
  page.on('response', async res => {
    if (res.status() >= 400) {
      const body = await res.text().catch(() => '');
      failedRequests.push(`${res.status()} ${res.request().method()} ${res.url()} — ${body.slice(0, 200)}`);
    }
  });

  await gotoApp(page);
  await page.screenshot({ path: 'e2e/screenshots/debug-after-load.png' });

  await loginServer(page);
  await page.screenshot({ path: 'e2e/screenshots/debug-after-login.png' });

  // Wait for all post-login API calls to settle
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'e2e/screenshots/debug-settled.png' });

  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log(e));

  console.log('\n=== FAILED / 4xx-5xx REQUESTS ===');
  failedRequests.forEach(r => console.log(r));

  console.log('\n=== WARNINGS (API) ===');
  warnings.filter(w => w.includes('[API]') || w.includes('CORS') || w.includes('Error')).forEach(w => console.log(w));
});
