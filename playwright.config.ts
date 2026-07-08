import { defineConfig } from '@playwright/test';

/**
 * E2E config — drives the exported WEB build of the app (a faithful render of the
 * RN UI) through a headless Chromium. Run `npm run e2e:export` first to build
 * `web-build/`, then `npm run e2e`. The pre-installed Chromium is used via
 * executablePath so no browser download is needed.
 */
// In CI we rely on `npx playwright install chromium` (managed browser). Locally,
// set PW_CHROME to a pre-installed Chromium to skip the download.
const CHROME = process.env.PW_CHROME;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8099',
    headless: true,
    viewport: { width: 390, height: 844 }, // phone-sized, matches the app UI
    launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'], ...(CHROME ? { executablePath: CHROME } : {}) },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 8099 -d web-build',
    url: 'http://localhost:8099',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
