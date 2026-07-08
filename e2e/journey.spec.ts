import { test, expect, Page } from '@playwright/test';

/**
 * Authenticated happy-path. Runs only when E2E_EMAIL / E2E_PASSWORD are set
 * (a dedicated confirmed test account) AND the build was made with the Supabase
 * env (so the auth shell shows). Covers: sign in → onboarding (if needed) → app
 * shell → Tools hub → a non-AI tool → Community feed → Insights. It deliberately
 * does NOT trigger the AI reset (keeps CI cheap + deterministic).
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

const seeText = (page: Page, re: RegExp | string, timeout = 15000) =>
  page.getByText(re).first().waitFor({ state: 'visible', timeout });
const tapText = (page: Page, re: RegExp | string) => page.getByText(re).first().click();
const visible = (page: Page, re: RegExp | string) =>
  page.getByText(re).first().isVisible().catch(() => false);

test.describe('authenticated journey', () => {
  test.skip(!EMAIL || !PASSWORD, 'set E2E_EMAIL / E2E_PASSWORD (and build with Supabase env) to run');

  test('sign in → app shell → tools → community → insights', async ({ page }) => {
    await page.goto('/');
    await seeText(page, /already have an account/i);
    await tapText(page, /already have an account/i);

    await page.getByPlaceholder(/email/i).first().fill(EMAIL!);
    await page.getByPlaceholder(/password/i).first().fill(PASSWORD!);
    await page.getByText(/^sign in$/i).first().click();

    // Either onboarding or the app shell appears.
    await Promise.race([
      seeText(page, /how it works|here.s how/i, 25000),
      seeText(page, 'Home', 25000),
    ]);

    // Walk onboarding if this account hasn't completed it.
    if (await visible(page, /how it works|here.s how/i)) {
      await tapText(page, /got it/i);
      await seeText(page, /pick a look|calm/i);
      await tapText(page, /^next$/i);
      // Reminders screen — proceed via whatever "continue" affordance exists.
      for (const lbl of [/maybe later/i, /not now/i, /^next$/i, /allow/i, /^done$/i]) {
        if (await visible(page, lbl)) { await tapText(page, lbl); break; }
      }
      if (await visible(page, /let.s begin/i)) await tapText(page, /let.s begin/i);
    }

    // App shell (bottom tabs).
    await seeText(page, 'Home', 25000);
    await expect(page.getByText('Community').first()).toBeVisible();
    await expect(page.getByText('Insights').first()).toBeVisible();

    // Tools hub → a non-AI tool renders.
    await tapText(page, /see all/i);
    await seeText(page, /calm tools/i);
    await tapText(page, 'Ground');
    await seeText(page, /grounding|things you can/i);
    await page.goBack();

    // Community feed renders.
    await tapText(page, 'Community');
    await seeText(page, /helped|share|good thing|friend|come back/i, 20000);

    // Insights renders.
    await tapText(page, 'Insights');
    await seeText(page, /resets|consistency/i, 20000);
  });
});
