import { test, expect, Page } from '@playwright/test';

/**
 * Smoke tests — no backend/auth required. The CI web build is exported WITHOUT
 * Supabase env, so the app boots straight to its shell (Home + tabs) in a
 * local/empty mode. That lets us navigate EVERY major screen and assert each
 * renders without a crash — the primary guard against a deploy that breaks a
 * screen. (The authenticated, real-backend flow lives in journey.spec.ts and is
 * env-gated.)
 */

const errorsFor = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
};
const tapTab = (page: Page, name: string) => page.getByText(name, { exact: true }).first().click();
const see = (page: Page, re: RegExp | string, timeout = 15000) =>
  expect(page.getByText(re).first()).toBeVisible({ timeout });

test('boots and paints a real screen with no uncaught JS errors', async ({ page }) => {
  const errors = errorsFor(page);
  await page.goto('/');
  await see(page, /get started|already have an account|take a moment|home|reset|how it works/i);
  const body = (await page.locator('body').innerText()).trim();
  expect(body.length, 'app rendered visible text').toBeGreaterThan(20);
  expect(errors, `uncaught page errors: ${errors.join(' | ')}`).toHaveLength(0);
});

test('every bottom tab renders without crashing', async ({ page }) => {
  const errors = errorsFor(page);
  await page.goto('/');
  // If the app shows the auth shell (Supabase env was provided), skip — this
  // test targets the no-auth shell used in CI.
  await page.waitForTimeout(1500);
  const authShell = (await page.getByText('Get started').count()) > 0;
  test.skip(authShell, 'auth shell shown (Supabase env set) — covered by journey.spec.ts');

  for (const [tab, expected] of [
    ['Reset', /take a moment|begin/i],
    ['Explore', /explore|lesson/i],
    ['Community', /community|share|helped|good thing|come back|one beautiful/i],
    ['Insights', /insights|resets|consistency/i],
    ['You', /you|profile|settings|theme|account/i],
    ['Home', /home|reset|steadier|take a/i],
  ] as const) {
    await tapTab(page, tab);
    await see(page, expected, 12000);
  }
  expect(errors, `uncaught page errors while tabbing: ${errors.join(' | ')}`).toHaveLength(0);
});

test('tools hub opens and a tool runs (no auth)', async ({ page }) => {
  const errors = errorsFor(page);
  await page.goto('/');
  await page.waitForTimeout(1500);
  test.skip((await page.getByText('Get started').count()) > 0, 'auth shell shown — see journey.spec.ts');

  // Home → "See all" → Tools hub
  await page.getByText(/see all/i).first().click();
  await see(page, /calm tools/i);
  // Open Grounding and step through it
  await page.getByText('Ground', { exact: true }).first().click();
  await see(page, /grounding|things you can/i);
  // Advance the 5-4-3-2-1 steps to completion
  for (let i = 0; i < 5; i++) {
    const next = page.getByText(/^next$/i).first();
    if (await next.isVisible().catch(() => false)) { await next.click(); await page.waitForTimeout(300); }
  }
  const done = page.getByText(/^done$/i).first();
  if (await done.isVisible().catch(() => false)) await done.click();
  expect(errors, `uncaught page errors in tool: ${errors.join(' | ')}`).toHaveLength(0);
});
