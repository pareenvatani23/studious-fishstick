import { test, expect } from '@playwright/test';

/**
 * Smoke tests — no backend/auth required. Primary guard against a deploy that
 * white-screens the app or throws on boot. Robust to either entry screen:
 * with Supabase env the build lands on Welcome (auth); without it, on the app
 * shell (Home). Either way the app must mount and paint real content.
 */
test('boots and paints a real screen with no uncaught JS errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');

  // React mounted and painted something meaningful (not a blank/white screen).
  const anchor = page
    .getByText(/get started|already have an account|take a moment|home|reset|how it works/i)
    .first();
  await expect(anchor).toBeVisible();

  const body = (await page.locator('body').innerText()).trim();
  expect(body.length, 'app rendered visible text').toBeGreaterThan(20);
  expect(errors, `uncaught page errors: ${errors.join(' | ')}`).toHaveLength(0);
});

test('welcome → sign up (only when the auth shell is shown)', async ({ page }) => {
  await page.goto('/');
  const getStarted = page.getByText('Get started').first();
  test.skip((await getStarted.count()) === 0, 'auth shell not shown (Supabase env not set for build)');
  await getStarted.click();
  await expect(page.getByText(/your name/i)).toBeVisible();
});
