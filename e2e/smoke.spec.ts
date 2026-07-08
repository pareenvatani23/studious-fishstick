import { test, expect, Page } from '@playwright/test';

/**
 * Smoke tests — no backend/auth required. The CI web build is exported WITHOUT
 * Supabase env, so the app boots straight to its shell (Home + tabs) in a
 * local/empty mode. These are the deploy gate: they catch a build that
 * white-screens, crashes on boot, or drops a tab. (Deeper per-screen and
 * authenticated flows live in journey.spec.ts, which is env-gated.)
 */
const bodyText = (page: Page) => page.locator('body').innerText();

test('boots and paints a real screen with no uncaught JS errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await expect(
    page.getByText(/get started|already have an account|take a moment|home|reset|how it works/i).first()
  ).toBeVisible();
  expect((await bodyText(page)).trim().length, 'app rendered visible text').toBeGreaterThan(20);
  expect(errors, `uncaught page errors: ${errors.join(' | ')}`).toHaveLength(0);
});

test('app shell shows all six tabs', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);
  // Targets the no-auth shell used in CI; skip if the auth shell is shown.
  test.skip((await page.getByText('Get started').count()) > 0, 'auth shell shown — see journey.spec.ts');

  for (const tab of ['Home', 'Reset', 'Explore', 'Community', 'Insights', 'You']) {
    await expect(page.getByText(tab, { exact: true }).first(), `tab "${tab}" present`).toBeVisible({ timeout: 12000 });
  }
});

test('Home → Tools hub navigation works', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);
  test.skip((await page.getByText('Get started').count()) > 0, 'auth shell shown — see journey.spec.ts');

  await page.getByRole('button', { name: /see all/i }).first().click();
  await expect(page.getByText(/calm tools/i)).toBeVisible();
  // Tool cards present (proves the catalog + hub render). getByRole matches the
  // accessibility tree, which excludes the Home screen still mounted-but-hidden
  // underneath — so these resolve to the visible hub cards, by their aria-labels
  // ("Breathe: Box · 4-7-8", "Ground: 5-4-3-2-1 senses").
  await expect(page.getByRole('button', { name: /^Breathe:/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Ground:/ })).toBeVisible();
});
