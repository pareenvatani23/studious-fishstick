import { test, expect, Page } from '@playwright/test';

/**
 * Smoke tests — no backend/auth required. The CI web build is exported WITHOUT
 * Supabase env, so the app boots straight to its shell (Home + tabs) in a
 * local/empty mode. That lets us navigate EVERY major screen and assert each
 * renders without a crash — the primary guard against a deploy that breaks a
 * screen. Interactive elements are targeted by accessibility role/label (which
 * React-Native-Web maps to real role="button" / aria-label) rather than raw
 * text nodes, which RN-Web often reports as non-clickable.
 */
const errorsFor = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
};
const bodyText = (page: Page) => page.locator('body').innerText();

test('boots and paints a real screen with no uncaught JS errors', async ({ page }) => {
  const errors = errorsFor(page);
  await page.goto('/');
  await expect(
    page.getByText(/get started|already have an account|take a moment|home|reset|how it works/i).first()
  ).toBeVisible();
  expect((await bodyText(page)).trim().length, 'app rendered visible text').toBeGreaterThan(20);
  expect(errors, `uncaught page errors: ${errors.join(' | ')}`).toHaveLength(0);
});

test('every bottom tab navigates and renders without crashing', async ({ page }) => {
  const errors = errorsFor(page);
  await page.goto('/');
  await page.waitForTimeout(1500);
  // This test targets the no-auth shell used in CI; skip if the auth shell shows.
  test.skip((await page.getByText('Get started').count()) > 0, 'auth shell shown — see journey.spec.ts');

  for (const tab of ['Reset', 'Explore', 'Community', 'Insights', 'You', 'Home']) {
    const btn = page.getByRole('button', { name: tab, exact: true }).first();
    await expect(btn, `tab "${tab}" present`).toBeVisible({ timeout: 12000 });
    await btn.click();
    await page.waitForTimeout(800);
    expect((await bodyText(page)).trim().length, `"${tab}" screen rendered content`).toBeGreaterThan(20);
  }
  // Note: we assert screens render; we don't fail on console/animation noise here
  // (the strict uncaught-error guard lives in the boot test above).
  if (errors.length) console.log('tab-nav non-fatal errors:', errors.join(' | '));
});

test('tools hub opens and a tool screen renders (no auth)', async ({ page }) => {
  const errors = errorsFor(page);
  await page.goto('/');
  await page.waitForTimeout(1500);
  test.skip((await page.getByText('Get started').count()) > 0, 'auth shell shown — see journey.spec.ts');

  await page.getByRole('button', { name: /see all/i }).first().click();
  await expect(page.getByText(/calm tools/i)).toBeVisible();
  // Open the Grounding tool via its accessible label ("Ground: 5-4-3-2-1 senses").
  await page.getByRole('button', { name: /^Ground:/ }).first().click();
  await expect(page.getByText(/grounding|things you can/i)).toBeVisible();
  if (errors.length) console.log('tools non-fatal errors:', errors.join(' | '));
});
