// Operator guide: Neuros' own staff in the platform console, signed in as the seeded platform
// administrator. The work waiting in it (an application, a support request, a payment) comes from
// the engine's seed:platform; companies, plans and invoices from seed and seed:billing.
import type { Page } from 'playwright';
import type { Scenario, Shot } from '../scenario';

const shot = (id: string, path: string, title: string, extra: Partial<Shot> = {}): Shot => ({ id: `operator/${id}`, persona: 'operator', path, title, ...extra });
const click = (name: string | RegExp) => async (page: Page) => { await page.getByRole('button', { name }).first().click(); };
const firstRow = async (page: Page) => { await page.getByRole('row').nth(1).click(); };
const tab = (name: string | RegExp) => async (page: Page) => { await page.getByRole('tab', { name }).click(); };
const row = (text: string) => async (page: Page) => { await page.getByRole('row').filter({ hasText: text }).first().click(); };
/** A company's own page, opened the way staff reach it: Companies → Explore. */
const company = (name: string) => async (page: Page) => {
  await page.getByRole('row').filter({ hasText: name }).first().getByRole('button', { name: 'Explore' }).click();
  await page.waitForURL(/\/platform\/companies\/[0-9a-f]+/);
  await page.getByText('System administrator').first().waitFor();
};

const scenarios: Scenario[] = [
  shot('overview', '/', 'Platform overview', {
    callouts: [
      { n: 1, target: { role: 'link', name: 'Applications' }, text: 'The console’s pages, grouped into Management, Commercial and System. Which you see depends on your platform roles.', side: 'right' },
      { n: 2, target: { role: 'button', name: 'Applications to review' }, text: 'Businesses that applied and are waiting for a decision. Click to open the queue.', side: 'bottom' },
      { n: 3, target: { role: 'button', name: 'Support access' }, text: 'Support requests waiting for a company’s answer, and access that is open now.', side: 'bottom' },
    ],
  }),

  // Management
  shot('applications/list', '/platform/applications', 'Applications', {
    callouts: [
      { n: 1, target: { role: 'textbox', name: 'Status' }, text: 'Show one state: submitted, under review, changes asked, approved or rejected.', side: 'bottom' },
      { n: 2, target: { text: /^Asked to$/ }, text: 'What the business wants to do on Neuros: supply, distribute, buy.', side: 'bottom' },
      { n: 3, target: { role: 'row', nth: 1 }, text: 'Click an application to read it and decide.', side: 'bottom' },
    ],
  }),
  shot('applications/review', '/platform/applications', 'An application', {
    steps: row('Tema Fittings'),
    fullPage: true,
    callouts: [{ n: 1, target: { role: 'button', name: 'Start review' }, text: 'Take the application: it moves to Under review, so colleagues know someone has it.', side: 'left' }],
  }),
  shot('companies/list', '/platform/companies', 'Companies', {
    callouts: [
      { n: 1, target: { role: 'button', name: 'New company' }, text: 'Onboard a business directly, with its administrator, without an application.', side: 'left' },
      { n: 2, target: { text: /^Plan$/ }, text: 'The plan each company is on. No plan means it cannot work yet.', side: 'bottom' },
      { n: 3, target: { role: 'button', name: 'Explore', nth: 0 }, text: 'Open the company’s page: registration, administrator, roles, subscription and support.', side: 'left' },
    ],
  }),
  shot('companies/new', '/platform/companies', 'New company', { steps: click('New company') }),
  shot('companies/summary', '/platform/companies', 'A company at a glance', { steps: row('Lagos Industrial Supplies Ltd'), fullPage: true }),
  shot('companies/page', '/platform/companies', 'A company’s page', {
    steps: company('Lagos Industrial Supplies Ltd'),
    fullPage: true,
    callouts: [
      { n: 1, target: { text: 'Set by Neuros', nth: 0 }, text: 'What only Neuros can change: country, functional currency, timezone and legal name. Some lock once the books have entries.', side: 'right' },
      { n: 2, target: { text: 'System administrator', nth: 0 }, text: 'The person who holds the company’s top role. Only Neuros can hand it on.', side: 'left' },
      { n: 3, target: { role: 'button', name: 'Request support access' }, text: 'Ask the company to let you in, for a purpose and a set time. The company decides.', side: 'left' },
    ],
  }),
  shot('catalogue/review', '/platform/catalogue', 'Catalogue: review queue', {
    callouts: [
      { n: 1, target: { text: 'Review queue', nth: 0 }, text: 'Products sellers contributed, waiting for Neuros, then the category tree and the product types.', side: 'bottom' },
      { n: 2, target: { role: 'button', name: 'Add curated product' }, text: 'Add a product to the catalogue yourself, published straight away.', side: 'left' },
      { n: 3, target: { role: 'row', nth: 1 }, text: 'Click a product to check it, then publish it or ask for changes.', side: 'bottom' },
    ],
  }),
  shot('catalogue/product', '/platform/catalogue', 'A contributed product', { steps: firstRow, fullPage: true }),
  shot('catalogue/categories', '/platform/catalogue?tab=categories', 'Catalogue: a category and its attributes', { steps: async (p) => { await p.getByText('Pumps', { exact: true }).first().click(); await p.getByText('Inherited').or(p.getByText('This category')).first().waitFor(); }, fullPage: true }),
  shot('catalogue/types', '/platform/catalogue?tab=types', 'Catalogue: product types'),
  shot('support/list', '/platform/support', 'Support access', {
    callouts: [
      { n: 1, target: { role: 'button', name: 'Request access' }, text: 'Ask a company for time-boxed access to its workspace.', side: 'left' },
      { n: 2, target: { text: /^Purpose$/ }, text: 'Why access was asked for. The company reads it before deciding, and the audit trail keeps it.', side: 'bottom' },
      { n: 3, target: { text: /^Until$/ }, text: 'When open access ends on its own.', side: 'bottom' },
    ],
  }),
  shot('support/request', '/platform/support', 'Request support access', { steps: click('Request access') }),

  // Commercial
  shot('billing/overview', '/platform/billing', 'Billing: overview', {
    callouts: [
      { n: 1, target: { role: 'tab', name: 'Overview' }, text: 'The figures, then invoices, payments and the reports for the books.', side: 'bottom' },
      { n: 2, target: { text: 'Outstanding', nth: 0 }, text: 'What companies owe on open invoices, by currency.', side: 'bottom' },
    ],
  }),
  shot('billing/invoices', '/platform/billing?tab=invoices', 'Billing: invoices', {
    callouts: [{ n: 1, target: { role: 'button', name: 'New invoice' }, text: 'Raise a one-off invoice, outside a subscription.', side: 'left' }],
  }),
  shot('billing/invoice-new', '/platform/billing?tab=invoices', 'New invoice', { steps: click('New invoice'), fullPage: true }),
  shot('billing/invoice', '/platform/billing?tab=invoices', 'An invoice', { steps: firstRow, fullPage: true }),
  shot('billing/payments', '/platform/billing?tab=payments', 'Billing: payments', {
    callouts: [{ n: 1, target: { role: 'button', name: 'Record payment' }, text: 'Record money a company sent: a transfer, cash or mobile money.', side: 'left' }],
  }),
  shot('billing/payment-new', '/platform/billing?tab=payments', 'Record payment', { steps: click('Record payment'), fullPage: true }),
  shot('billing/payment', '/platform/billing?tab=payments', 'A payment', { steps: firstRow }),
  shot('billing/reports', '/platform/billing?tab=reports', 'Billing: reports', { fullPage: true }),
  shot('subscriptions/list', '/platform/subscriptions', 'Subscriptions', {
    callouts: [{ n: 1, target: { role: 'button', name: 'New subscription' }, text: 'Put a company on a plan.', side: 'left' }],
  }),
  shot('subscriptions/new', '/platform/subscriptions', 'New subscription', { steps: click('New subscription'), fullPage: true }),
  shot('subscriptions/detail', '/platform/subscriptions', 'A subscription', { steps: row('Lagos Industrial Supplies Ltd'), fullPage: true }),
  shot('plans/plans', '/platform/plans', 'Plans & add-ons: plans', {
    callouts: [
      { n: 1, target: { role: 'tab', name: 'Add-ons' }, text: 'Plans, and the add-ons a company can buy on top.', side: 'bottom' },
      { n: 2, target: { role: 'button', name: 'New plan' }, text: 'Create a plan offered to everyone, or a custom one for one company.', side: 'left' },
    ],
  }),
  shot('plans/plan-new', '/platform/plans', 'New plan', { steps: click('New plan'), fullPage: true }),
  shot('plans/add-ons', '/platform/plans?tab=add-ons', 'Plans & add-ons: add-ons'),
  shot('plans/add-on-new', '/platform/plans?tab=add-ons', 'New add-on', { steps: click('New add-on'), fullPage: true }),
  shot('billing-settings/business', '/platform/billing-settings?tab=business', 'Billing settings: business details', { fullPage: true }),
  shot('billing-settings/terms', '/platform/billing-settings?tab=terms', 'Billing settings: terms and reminders', { fullPage: true }),
  shot('billing-settings/payment', '/platform/billing-settings?tab=payment', 'Billing settings: payment details', { fullPage: true }),
  shot('billing-settings/tax', '/platform/billing-settings?tab=tax', 'Billing settings: tax', { fullPage: true }),

  // System
  shot('schedulers/list', '/platform/schedulers', 'Schedulers', {
    callouts: [
      { n: 1, target: { text: /^Every$/ }, text: 'How often each background job runs.', side: 'bottom' },
      { n: 2, target: { role: 'button', name: /^Run .* now$/, nth: 0 }, text: 'Run a job straight away, outside its schedule.', side: 'left' },
    ],
  }),
  shot('schedulers/change', '/platform/schedulers', 'Change schedule', { steps: click('Change schedule') }),
  shot('roles/organization', '/platform/roles?kind=organization', 'Roles & Access: company roles', {
    callouts: [
      { n: 1, target: { role: 'tab', name: 'Company roles' }, text: 'The roles every company starts with, and the roles of Neuros staff.', side: 'bottom' },
      { n: 2, target: { role: 'button', name: 'New role' }, text: 'Add a role for every company, or for one company only.', side: 'left' },
    ],
  }),
  shot('roles/detail', '/platform/roles?kind=organization', 'A role template', { steps: firstRow, fullPage: true }),
  shot('roles/new', '/platform/roles?kind=organization', 'New role', { steps: click('New role'), fullPage: true }),
  shot('roles/platform', '/platform/roles?kind=platform', 'Roles & Access: platform roles'),
  shot('staff/list', '/platform/staff', 'Platform staff', {
    callouts: [{ n: 1, target: { role: 'button', name: 'Add staff' }, text: 'Give someone a sign-in to this console, with platform roles.', side: 'left' }],
  }),
  shot('staff/add', '/platform/staff', 'Add platform staff', { steps: click('Add staff') }),
  shot('staff/roles', '/platform/staff', 'Change a person’s platform roles', { steps: click('Change roles') }),
  shot('audit/log', '/platform/audit', 'Platform audit log'),
  shot('audit/event', '/platform/audit', 'An audit event: a payment recorded', { steps: async (p) => { await p.getByText('RCT-2026-000001').first().click(); } }),

  // Settings: a platform person has no company, so only their own tabs.
  shot('settings/profile', '/settings?tab=profile', 'Settings: profile'),
  shot('settings/preferences', '/settings?tab=preferences', 'Settings: preferences'),
  shot('settings/notifications', '/settings?tab=notifications', 'Settings: notifications', { fullPage: true }),
  shot('notifications/list', '/platform/notifications?show=all', 'Notifications'),
  shot('settings/security', '/settings?tab=security', 'Settings: security', { fullPage: true }),
  shot('settings/access', '/settings?tab=access', 'Settings: role and access', { fullPage: true }),
];

export default scenarios;
