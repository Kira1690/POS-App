import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:19006',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // POS tablet viewport (landscape 1280x800)
    viewport: { width: 1280, height: 800 },
    // Use headed Chromium (separate from Brave) so you can watch tests run
    headless: false,
    launchOptions: {
      // Playwright uses its own Chromium install — not Brave or system Chrome
      executablePath: undefined,
      slowMo: 500, // 500ms between actions so you can follow along
    },
  },
  projects: [
    {
      name: 'pos-tablet',
      use: {
        browserName: 'chromium',
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: true,
      },
    },
  ],
});
