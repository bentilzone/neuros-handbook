// Signing in: the public pages, as anyone sees them before they have a session. The two-step
// shot signs in as the operator (the only seeded account with an authenticator) and stops at the code.
import type { Page } from 'playwright';
import type { Scenario, Shot } from '../scenario';
import { OPERATOR } from '../stack';

const shot = (id: string, path: string, title: string, extra: Partial<Shot> = {}): Shot => ({ id: `visitor/${id}`, persona: 'visitor', path, title, ...extra });

const scenarios: Scenario[] = [
  shot('login', '/login', 'Sign in', {
    callouts: [
      { n: 1, target: { role: 'textbox', name: 'Email' }, text: 'The email you registered or were invited with.', side: 'right' },
      { n: 2, target: { role: 'link', name: 'Forgot password?' }, text: 'Sends a link to choose a new password.', side: 'left' },
      { n: 3, target: { role: 'link', name: 'Create an account' }, text: 'New to Neuros: create an account, then apply for your business.', side: 'right' },
    ],
  }),
  shot('mfa', '/login', 'Two-step verification', {
    steps: async (page: Page) => {
      await page.getByPlaceholder('you@company.com').fill(OPERATOR.email);
      await page.getByPlaceholder('Your password').fill(OPERATOR.password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await page.getByLabel('Authentication code').first().waitFor({ timeout: 15_000 });
    },
    callouts: [
      { n: 1, target: { label: 'Authentication code' }, text: 'The six-digit code your authenticator app shows now. The last digit submits.', side: 'top' },
      { n: 2, target: { text: 'Use a recovery code' }, text: 'Lost the phone: use one of the recovery codes you saved when you turned this on.', side: 'right' },
    ],
  }),
  shot('register', '/register', 'Create your account', { fullPage: true }),
  shot('forgot-password', '/forgot-password', 'Forgot your password?'),
  shot('resend-verification', '/resend-verification', 'Resend confirmation'),
];

export default scenarios;
