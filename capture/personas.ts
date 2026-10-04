// Who each guide is shot as: the seeded demo companies (neuros-engine src/scripts/seed.ts).
import type { Browser, BrowserContext, Page } from 'playwright';
import { DEMO_PASSWORD, OPERATOR } from './stack';

export type Persona = 'supplier' | 'distributor' | 'reseller' | 'operator';

const DEMO = DEMO_PASSWORD;
export const PERSONAS: Record<Persona, { email: string; password: string; company: string }> = {
  supplier: { email: 'supplier1@demo.neuros.local', password: DEMO, company: 'Kumasi Pump Works Ltd' },
  distributor: { email: 'dist1@demo.neuros.local', password: DEMO, company: 'Lagos Industrial Supplies Ltd' },
  reseller: { email: 'res1@demo.neuros.local', password: DEMO, company: 'Ikeja Hardware Resellers' },
  operator: { ...OPERATOR, company: 'Neuros platform' },
};

export const VIEWPORT = { width: 1440, height: 900 };

/**
 * A browser tab signed in as the persona through the real sign-in page, kept open for the whole run.
 * Every shot navigates inside this tab (see `go` in run.ts) instead of opening a new one: a new tab
 * boots by refreshing the session, and Neuros rotates refresh tokens and signs out a family whose
 * old token is used again, which is what a tab closed mid-refresh leaves the next one holding.
 */
export async function signedIn(browser: Browser, appUrl: string, persona: Persona, extra: Parameters<Browser['newContext']>[0] = {}): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'light', reducedMotion: 'reduce', locale: 'en-GB', timezoneId: 'Africa/Lagos', ...extra });
  const page = await ctx.newPage();
  const who = PERSONAS[persona];
  await page.goto(`${appUrl}/login`);
  await page.getByPlaceholder('you@company.com').fill(who.email);
  await page.getByPlaceholder('Your password').fill(who.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  // The operator lands on a scope choice when the account also has companies; the demo admin has none.
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30_000 });
  return { ctx, page };
}
