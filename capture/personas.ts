// Who each guide is shot as: the seeded demo companies (neuros-engine src/scripts/seed.ts).
import type { Browser, BrowserContext } from 'playwright';
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

/** A browser context signed in as the persona, through the real sign-in page. */
export async function signedIn(browser: Browser, appUrl: string, persona: Persona, extra: Parameters<Browser['newContext']>[0] = {}): Promise<BrowserContext> {
  const ctx = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'light', reducedMotion: 'reduce', locale: 'en-GB', timezoneId: 'Africa/Lagos', ...extra });
  const page = await ctx.newPage();
  const who = PERSONAS[persona];
  await page.goto(`${appUrl}/login`);
  await page.getByPlaceholder('you@company.com').fill(who.email);
  await page.getByPlaceholder('Your password').fill(who.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  // The operator lands on a scope choice when the account also has companies; the demo admin has none.
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30_000 });
  await page.close();
  return ctx;
}
