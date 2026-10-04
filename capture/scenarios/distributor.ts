// Distributor guide (Lagos Industrial Supplies): every page from the Dashboard to the last Settings
// tab, in sidebar order, then the drawers and forms each page opens.
import type { Page } from 'playwright';
import type { Scenario, Shot } from '../scenario';

const shot = (id: string, path: string, title: string, extra: Partial<Shot> = {}): Shot => ({ id: `distributor/${id}`, persona: 'distributor', path, title, ...extra });
const click = (name: string | RegExp) => async (page: Page) => { await page.getByRole('button', { name }).first().click(); };
const firstRow = async (page: Page) => { await page.getByRole('row').nth(1).click(); };
const panel = { css: 'aside' };

const scenarios: Scenario[] = [
  // ---- Main
  shot('dashboard', '/', 'Dashboard', {
    callouts: [
      { n: 1, target: { role: 'link', name: 'Dashboard' }, text: 'The sidebar: your company’s pages, grouped into Main, Sell, Buy, Stock & finance and System. Which groups you see depends on what your company does and what your role allows.', side: 'right' },
      { n: 2, target: { text: 'Lagos Industrial Supplies Ltd', nth: 0 }, text: 'The company you are working in. If you belong to several, click to switch.', side: 'bottom' },
      { n: 3, target: { text: 'Live', nth: 0 }, text: 'Live: this tab is connected, so changes others make appear on their own.', side: 'left' },
    ],
  }),
  shot('catalogue/browse', '/catalogue', 'Catalogue', {
    callouts: [
      { n: 1, target: { text: 'All categories' }, text: 'The category tree. Pick a category to list its products, sub-categories included.', side: 'right' },
      { n: 2, target: { role: 'textbox', name: /Search/ }, text: 'Search by name, brand or part number.', side: 'bottom' },
      { n: 3, target: { text: 'My contributions' }, text: 'The products your company contributed, where each one stands, and the button to contribute another.', side: 'bottom' },
      { n: 4, target: { role: 'row', nth: 1 }, text: 'Click a product for its details, attributes and units.', side: 'bottom' },
    ],
  }),
  shot('catalogue/mine', '/catalogue?view=mine', 'Catalogue: my contributions', {
    callouts: [{ n: 1, target: { role: 'button', name: 'Contribute a product' }, text: 'Add a product the catalogue doesn’t have yet. It goes to Neuros for review.', side: 'left' }],
  }),
  shot('catalogue/contribute', '/catalogue?view=mine', 'Contribute a product', { steps: click('Contribute a product'), callouts: [{ n: 1, target: { role: 'textbox', name: /^Category/ }, text: 'Pick the category first: it decides which attributes the product must describe.', side: 'left' }] }),
  shot('catalogue/product', '/catalogue', 'A catalogue product', { steps: firstRow }),

  // ---- Sell
  shot('offers/list', '/selling/offers', 'Offers', {
    callouts: [
      { n: 1, target: { role: 'button', name: 'New offer' }, text: 'Put a catalogue product on sale with your SKU, price and terms.', side: 'left' },
      { n: 2, target: { role: 'textbox', name: 'Status' }, text: 'Show drafts, published or withdrawn offers.', side: 'bottom' },
      { n: 3, target: { text: /^Who sees it$/ }, text: 'Who can find each offer: everyone, approved customers, or invited buyers only.', side: 'bottom' },
      { n: 4, target: { role: 'row', nth: 1 }, text: 'Click an offer for its detail, publish or withdraw, and the price check.', side: 'bottom' },
    ],
  }),
  shot('offers/new', '/selling/offers', 'New offer', { steps: click('New offer'), fullPage: true }),
  shot('offers/detail', '/selling/offers', 'An offer', { steps: firstRow, fullPage: true }),
  shot('pricing/price-lists', '/selling/pricing', 'Pricing: price lists', {
    callouts: [
      { n: 1, target: { css: '[class*="SegmentedControl-root"]' }, text: 'Price lists, contract prices, promotions, and the price check.', side: 'right' },
      { n: 2, target: { role: 'button', name: 'New price list' }, text: 'Create a list of prices for a group of customers.', side: 'left' },
      { n: 3, target: { role: 'row', nth: 1 }, text: 'Click a list to add, change or remove its prices.', side: 'bottom' },
    ],
  }),
  shot('pricing/price-list-new', '/selling/pricing', 'New price list', { steps: click('New price list') }),
  shot('pricing/price-list-detail', '/selling/pricing', 'A price list', { steps: async (p) => { await p.getByText('Gold resellers').first().click(); }, fullPage: true }),
  shot('pricing/contracts', '/selling/pricing?tab=contracts', 'Pricing: contract prices'),
  shot('pricing/contract-new', '/selling/pricing?tab=contracts', 'New contract price', { steps: click('New contract price') }),
  shot('pricing/promotions', '/selling/pricing?tab=promotions', 'Pricing: promotions'),
  shot('pricing/promotion-new', '/selling/pricing?tab=promotions', 'New promotion', { steps: click('New promotion'), fullPage: true }),
  shot('pricing/check', '/selling/pricing?tab=check', 'Pricing: price check'),
  shot('customers/list', '/selling/customers', 'Customers', {
    callouts: [
      { n: 1, target: { text: /waiting for approval/i, nth: 0 }, text: 'Requests waiting for your answer.', side: 'bottom' },
      { n: 2, target: { role: 'button', name: 'Open an account' }, text: 'Invite a company you already trade with, with its terms.', side: 'left' },
      { n: 3, target: { text: /^Price list$/ }, text: 'The terms each customer trades on: their price list and how they pay.', side: 'bottom' },
      { n: 4, target: { role: 'button', name: /^Approve / }, text: 'Approve a request, setting its terms as you do.', side: 'left' },
    ],
  }),
  shot('customers/approve', '/selling/customers', 'Approve a customer, with terms', { steps: click(/^Approve /), fullPage: true }),
  shot('customers/detail', '/selling/customers', 'A customer’s account', { steps: firstRow, fullPage: true }),

  // ---- Buy
  shot('marketplace/search', '/marketplace', 'Marketplace', {
    callouts: [
      { n: 1, target: { role: 'textbox', name: 'Search the marketplace' }, text: 'Search products, brands, part numbers or sellers.', side: 'bottom' },
      { n: 2, target: { text: 'Availability', nth: 0 }, text: 'Filters: availability, category, brand and seller, with what each would leave.', side: 'right' },
      { n: 3, target: { text: 'YOURS', nth: 0 }, text: 'Your own offers are marked, so you can see them as buyers do.', side: 'left' },
      { n: 4, target: { text: 'Price for you', nth: 0 }, text: 'Offers only approved customers see: open one for your price.', side: 'bottom' },
    ],
  }),
  shot('marketplace/offer', '/marketplace', 'An offer in the marketplace', {
    steps: async (p) => { await p.getByRole('button').filter({ hasText: 'Kumasi Pump Works Ltd' }).first().click(); },
    callouts: [{ n: 1, target: { role: 'button', name: 'Price it' }, text: 'Your price for a quantity, worked out from your account terms with this seller.', side: 'left' }],
  }),
  shot('suppliers/list', '/suppliers', 'Suppliers', {
    callouts: [
      { n: 1, target: { role: 'button', name: 'Find suppliers' }, text: 'Find sellers on Neuros and ask for an account.', side: 'left' },
      { n: 2, target: { text: /^Your reference$/ }, text: 'Your own code for each supplier; only you see it.', side: 'bottom' },
      { n: 3, target: { text: /^You pay$/ }, text: 'How each supplier lets you pay.', side: 'bottom' },
    ],
  }),
  shot('suppliers/find', '/suppliers', 'Find suppliers', { steps: click('Find suppliers') }),
  shot('suppliers/detail', '/suppliers', 'A supplier account', { steps: firstRow }),

  // ---- Stock & finance: inventory
  shot('inventory/stock', '/inventory', 'Inventory: stock', {
    callouts: [
      { n: 1, target: { css: '[class*="SegmentedControl-root"]' }, text: 'Stock, movements, adjustments, transfers, counts, reorder, warehouses and valuation.', side: 'right' },
      { n: 2, target: { role: 'textbox', name: 'Warehouse' }, text: 'Narrow to one warehouse, one condition or one product.', side: 'bottom' },
      { n: 3, target: { role: 'button', name: 'Receive stock' }, text: 'Record goods that arrived: opening stock, a delivery without an order.', side: 'left' },
      { n: 4, target: { text: /^Free to sell$/ }, text: 'On hand minus what orders have reserved: what you can still sell.', side: 'left' },
    ],
  }),
  shot('inventory/receive', '/inventory', 'Receive stock', { steps: click('Receive stock') }),
  shot('inventory/balance', '/inventory', 'A stock balance', { steps: firstRow, fullPage: true }),
  shot('inventory/movements', '/inventory?tab=movements', 'Inventory: movements'),
  shot('inventory/adjustments', '/inventory?tab=adjustments', 'Inventory: adjustments'),
  shot('inventory/adjustment-new', '/inventory?tab=adjustments', 'Propose an adjustment', { steps: click('Propose adjustment') }),
  shot('inventory/transfers', '/inventory?tab=transfers', 'Inventory: transfers'),
  shot('inventory/counts', '/inventory?tab=counts', 'Inventory: counts'),
  shot('inventory/count-open', '/inventory?tab=counts', 'Open a count', { steps: click('Open a count') }),
  shot('inventory/reorder', '/inventory?tab=reorder', 'Inventory: reorder'),
  shot('inventory/reorder-new', '/inventory?tab=reorder', 'New reorder rule', { steps: click('New rule') }),
  shot('inventory/warehouses', '/inventory?tab=warehouses', 'Inventory: warehouses'),
  shot('inventory/warehouse', '/inventory?tab=warehouses', 'A warehouse, with zones and bins', { steps: firstRow }),
  shot('inventory/valuation', '/inventory?tab=valuation', 'Inventory: valuation'),

  // ---- Stock & finance: ledger
  shot('ledger/journals', '/ledger', 'Ledger: journals', {
    callouts: [
      { n: 1, target: { role: 'button', name: 'New journal' }, text: 'Draft a manual journal. Someone else approves and posts it.', side: 'left' },
      { n: 2, target: { role: 'textbox', name: 'Status' }, text: 'Filter by state and by period.', side: 'bottom' },
      { n: 3, target: { text: /^From$/ }, text: 'Where it came from: Manual, or Stock and the other automatic sources.', side: 'bottom' },
      { n: 4, target: { text: 'Waiting for approval', nth: 0 }, text: 'Submitted, waiting for a colleague with posting rights.', side: 'right' },
    ],
  }),
  shot('ledger/journal-new', '/ledger', 'New journal', { steps: click('New journal') }),
  shot('ledger/journal-detail', '/ledger', 'A journal waiting for approval', { steps: async (p) => { await p.getByText('Office and warehouse rent, October').first().click(); }, fullPage: true }),
  shot('ledger/accounts', '/ledger?tab=accounts', 'Ledger: accounts'),
  shot('ledger/account-new', '/ledger?tab=accounts', 'New account', { steps: click('New account') }),
  shot('ledger/account-entries', '/ledger?tab=accounts', 'An account’s entries', { steps: async (p) => { await p.getByText('Bank').first().click(); } }),
  shot('ledger/trial-balance', '/ledger?tab=trial-balance', 'Ledger: trial balance'),
  shot('ledger/periods', '/ledger?tab=periods', 'Ledger: periods'),
  shot('ledger/posting-rules', '/ledger?tab=posting-rules', 'Ledger: posting rules'),

  // ---- System
  shot('members/list', '/members', 'Members'),
  shot('members/detail', '/members', 'A member', { steps: firstRow }),
  shot('roles/list', '/roles', 'Roles'),
  shot('roles/detail', '/roles', 'A role and its permissions', { steps: firstRow, fullPage: true }),
  shot('api-clients/list', '/api-clients', 'API clients'),
  shot('api-clients/new', '/api-clients', 'New API client', { steps: click('New client') }),
  shot('audit/log', '/audit', 'Audit log'),
  shot('audit/event', '/audit', 'An audit event', { steps: async (p) => { await p.getByText('Background job').first().click(); } }),

  // ---- Settings
  shot('settings/profile', '/settings?tab=profile', 'Settings: profile'),
  shot('settings/preferences', '/settings?tab=preferences', 'Settings: preferences'),
  shot('settings/security', '/settings?tab=security', 'Settings: security', { fullPage: true }),
  shot('settings/access', '/settings?tab=access', 'Settings: role and access', { fullPage: true }),
  shot('settings/company', '/settings?tab=company', 'Settings: my company'),
  shot('settings/company-addresses', '/settings?tab=company', 'My company: addresses and contacts', { steps: async (p) => { await p.getByRole('tab', { name: /Addresses/ }).click(); }, fullPage: true }),
  shot('settings/company-tax', '/settings?tab=company', 'My company: tax', { steps: async (p) => { await p.getByRole('tab', { name: 'Tax' }).click(); } }),
  shot('settings/company-policies', '/settings?tab=company', 'My company: operating policies', { steps: async (p) => { await p.getByRole('tab', { name: /Operating policies/ }).click(); }, fullPage: true }),
  shot('settings/company-capabilities', '/settings?tab=company', 'My company: capabilities', { steps: async (p) => { await p.getByRole('tab', { name: /Capabilities/ }).click(); } }),
  shot('settings/company-log', '/settings?tab=company', 'My company: change log', { steps: async (p) => { await p.getByRole('tab', { name: /Change log/ }).click(); } }),
  shot('settings/billing', '/settings?tab=billing', 'Settings: billing', { fullPage: true }),
  shot('settings/support', '/settings?tab=support', 'Settings: support access'),
];

export default scenarios;
