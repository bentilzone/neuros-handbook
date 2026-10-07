// The page-by-page walk every persona guide is shot from: each page in sidebar order, then the
// drawers and forms it opens. A persona keeps the sections its company can see (selling, buying,
// stock) and names its own demo records; ids are `persona/page/state` either way.
import type { Page } from 'playwright';
import type { Persona } from './personas';
import type { Scenario, Shot } from './scenario';

export interface Walk {
  persona: Persona;
  /** The company the persona works in, as the header shows it. */
  company: string;
  /** Which trade sections its capabilities give it (N-028): supply sells, purchasing buys. */
  sell: boolean;
  buy: boolean;
  stock: boolean;
  /** Demo records the walk opens, from seed:trade. */
  priceList?: string;
  journalWaiting: string;
  /** A seller whose card in the marketplace shows a price worked out for this persona. */
  marketplaceSeller?: string;
}

const click = (name: string | RegExp) => async (page: Page) => { await page.getByRole('button', { name }).first().click(); };
const firstRow = async (page: Page) => { await page.getByRole('row').nth(1).click(); };
const tab = (name: string | RegExp) => async (page: Page) => { await page.getByRole('tab', { name }).click(); };

export function walk(w: Walk): Scenario[] {
  const shot = (id: string, path: string, title: string, extra: Partial<Shot> = {}): Shot => ({ id: `${w.persona}/${id}`, persona: w.persona, path, title, ...extra });
  const groups = ['Main', w.sell && 'Sell', w.buy && 'Buy', 'Stock & finance', 'System'].filter(Boolean).join(', ').replace(/, ([^,]*)$/, ' and $1');

  const main: Scenario[] = [
    shot('dashboard', '/', 'Dashboard', {
      callouts: [
        { n: 1, target: { role: 'link', name: 'Dashboard' }, text: `The sidebar: your company’s pages, grouped into ${groups}. Which groups you see depends on what your company does and what your role allows.`, side: 'right' },
        { n: 2, target: { text: w.company, nth: 0 }, text: 'The company you are working in. If you belong to several, click to switch.', side: 'bottom' },
        { n: 3, target: { text: 'Live', nth: 0 }, text: 'Live: this tab is connected, so changes others make appear on their own.', side: 'left' },
      ],
    }),
    shot('catalogue/browse', '/catalogue', 'Catalogue', {
      callouts: [
        { n: 1, target: { text: 'All categories' }, text: 'The category tree. Pick a category to list its products, sub-categories included.', side: 'right' },
        { n: 2, target: { role: 'textbox', name: /Search/ }, text: 'Search by name, brand or part number.', side: 'bottom' },
        // Contributing products is for sellers; a buyer only browses.
        w.sell
          ? { n: 3, target: { text: 'My contributions' }, text: 'The products your company contributed, where each one stands, and the button to contribute another.', side: 'bottom' }
          : { n: 3, target: { role: 'textbox', name: 'Product type' }, text: 'Narrow to one product type.', side: 'bottom' },
        { n: 4, target: { role: 'row', nth: 1 }, text: 'Click a product for its details, attributes and units.', side: 'bottom' },
      ],
    }),
  ];
  const contribute: Scenario[] = [
    shot('catalogue/mine', '/catalogue?view=mine', 'Catalogue: my contributions', {
      callouts: [{ n: 1, target: { role: 'button', name: 'Contribute a product' }, text: 'Add a product the catalogue doesn’t have yet. It goes to Neuros for review.', side: 'left' }],
    }),
    shot('catalogue/contribute', '/catalogue?view=mine', 'Contribute a product', { steps: click('Contribute a product'), callouts: [{ n: 1, target: { role: 'textbox', name: /^Category/ }, text: 'Pick the category first: it decides which attributes the product must describe.', side: 'left' }] }),
  ];
  const product: Scenario[] = [shot('catalogue/product', '/catalogue', 'A catalogue product', { steps: firstRow })];

  const sell: Scenario[] = [
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
    shot('pricing/price-list-detail', '/selling/pricing', 'A price list', { steps: async (p) => { await p.getByText(w.priceList ?? '').first().click(); }, fullPage: true }),
    shot('pricing/contracts', '/selling/pricing?tab=contracts', 'Pricing: contract prices'),
    shot('pricing/contract-new', '/selling/pricing?tab=contracts', 'New contract price', { steps: click('New contract price') }),
    shot('pricing/promotions', '/selling/pricing?tab=promotions', 'Pricing: promotions'),
    shot('pricing/promotion-new', '/selling/pricing?tab=promotions', 'New promotion', { steps: click('New promotion'), fullPage: true }),
    shot('pricing/check', '/selling/pricing?tab=check', 'Pricing: price check'),
    shot('quotes/list', '/selling/quotes', 'Quotes', {
      callouts: [
        { n: 1, target: { css: '[class*="SegmentedControl-root"]' }, text: 'Your quotations, and the requests customers sent you.', side: 'right' },
        { n: 2, target: { role: 'button', name: 'New quotation' }, text: 'Quote any approved customer, without waiting for a request.', side: 'left' },
        { n: 3, target: { role: 'textbox', name: 'Status' }, text: 'Drafts, sent, accepted, declined, expired, or replaced by a revision.', side: 'bottom' },
      ],
    }),
    shot('quotes/requests', '/selling/quotes?tab=requests', 'Quotes: requests received'),
    shot('orders/list', '/selling/orders', 'Orders', {
      callouts: [
        { n: 1, target: { role: 'textbox', name: 'Status' }, text: 'Orders waiting for you, accepted, rejected or cancelled.', side: 'bottom' },
        { n: 2, target: { text: /^Status$/ }, text: 'Three statuses each: the order, its payment, and its stock.', side: 'bottom' },
      ],
    }),
    shot('invoices/list', '/selling/invoices', 'Invoices', {
      callouts: [
        { n: 1, target: { css: '[class*="SegmentedControl-root"]' }, text: 'Invoices, the payments you received, and what each customer owes by age.', side: 'right' },
        { n: 2, target: { text: /^Outstanding$/ }, text: 'What is still owed on each invoice.', side: 'bottom' },
      ],
    }),
    shot('invoices/receipts', '/selling/invoices?tab=receipts', 'Invoices: payments received', {
      callouts: [{ n: 1, target: { role: 'button', name: 'Record payment' }, text: 'Record money a customer paid; it goes to their oldest invoices first.', side: 'left' }],
    }),
    shot('invoices/ageing', '/selling/invoices?tab=ageing', 'Invoices: ageing'),
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
  ];

  const buy: Scenario[] = [
    shot('marketplace/search', '/marketplace', 'Marketplace', {
      callouts: [
        { n: 1, target: { role: 'textbox', name: 'Search the marketplace' }, text: 'Search products, brands, part numbers or sellers.', side: 'bottom' },
        { n: 2, target: { text: 'Availability', nth: 0 }, text: 'Filters: availability, category, brand and seller, with what each would leave.', side: 'right' },
        w.sell
          ? { n: 3, target: { text: 'YOURS', nth: 0 }, text: 'Your own offers are marked, so you can see them as buyers do.', side: 'left' }
          : { n: 3, target: { role: 'textbox', name: 'Sort' }, text: 'Best match, newest, or by name.', side: 'bottom' },
        { n: 4, target: { text: 'Price for you', nth: 0 }, text: 'Offers only approved customers see: open one for your price.', side: 'bottom' },
      ],
    }),
    shot('marketplace/offer', '/marketplace', 'An offer in the marketplace', {
      steps: async (p) => { await p.getByRole('button').filter({ hasText: w.marketplaceSeller ?? '' }).first().click(); },
      callouts: [
        { n: 1, target: { role: 'button', name: 'Price it' }, text: 'Your price for a quantity, worked out from your account terms with this seller.', side: 'left' },
        { n: 2, target: { role: 'button', name: 'Add to order' }, text: 'Put it in the order you are building with this seller.', side: 'left' },
      ],
    }),
    shot('buying-quotes/list', '/buying/quotes', 'Quotes', {
      callouts: [
        { n: 1, target: { css: '[class*="SegmentedControl-root"]' }, text: 'Quotations suppliers sent you, and the requests you sent.', side: 'right' },
        { n: 2, target: { role: 'button', name: 'Request a quote' }, text: 'Ask a supplier to price some of their offers for you.', side: 'left' },
      ],
    }),
    shot('buying-quotes/new', '/buying/quotes', 'Request a quote', { steps: click('Request a quote') }),
    shot('buying-orders/list', '/buying/orders', 'Orders', {
      callouts: [{ n: 1, target: { role: 'button', name: 'New order' }, text: 'Draft an order to one supplier, at your price.', side: 'left' }],
    }),
    shot('buying-orders/new', '/buying/orders', 'New order', { steps: click('New order'), fullPage: true }),
    shot('buying-invoices/list', '/buying/invoices', 'Invoices', {
      callouts: [{ n: 1, target: { text: /^Due$/ }, text: 'When each invoice is due; overdue ones show in red.', side: 'bottom' }],
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
  ];

  const stock: Scenario[] = [
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
    shot('fulfilment/list', '/fulfilment', 'Fulfilment', {
      callouts: [
        { n: 1, target: { css: '[class*="SegmentedControl-root"]' }, text: 'Your shipments, and what to pick in each warehouse.', side: 'right' },
        { n: 2, target: { role: 'textbox', name: 'Status' }, text: 'Picking, packed, on its way, delivered or cancelled.', side: 'bottom' },
      ],
    }),
    shot('fulfilment/pick', '/fulfilment?tab=pick', 'Fulfilment: pick list'),
  ];

  const ledger: Scenario[] = [
    shot('ledger/journals', '/ledger', 'Ledger: journals', {
      callouts: [
        { n: 1, target: { role: 'button', name: 'New journal' }, text: 'Draft a manual journal. Someone else approves and posts it.', side: 'left' },
        { n: 2, target: { role: 'textbox', name: 'Status' }, text: 'Filter by state and by period.', side: 'bottom' },
        { n: 3, target: { text: /^From$/ }, text: 'Where it came from: Manual, or Stock and the other automatic sources.', side: 'bottom' },
        { n: 4, target: { text: 'Waiting for approval', nth: 0 }, text: 'Submitted, waiting for a colleague with posting rights.', side: 'right' },
      ],
    }),
    shot('ledger/journal-new', '/ledger', 'New journal', { steps: click('New journal') }),
    shot('ledger/journal-detail', '/ledger', 'A journal waiting for approval', { steps: async (p) => { await p.getByText(w.journalWaiting).first().click(); }, fullPage: true }),
    shot('ledger/accounts', '/ledger?tab=accounts', 'Ledger: accounts'),
    shot('ledger/account-new', '/ledger?tab=accounts', 'New account', { steps: click('New account') }),
    shot('ledger/account-entries', '/ledger?tab=accounts', 'An account’s entries', { steps: async (p) => { await p.getByText('Bank').first().click(); } }),
    shot('ledger/trial-balance', '/ledger?tab=trial-balance', 'Ledger: trial balance'),
    shot('ledger/periods', '/ledger?tab=periods', 'Ledger: periods'),
    shot('ledger/posting-rules', '/ledger?tab=posting-rules', 'Ledger: posting rules'),
  ];

  const system: Scenario[] = [
    shot('notifications/bell', '/', 'Notifications beside the page', {
      steps: click(/^Notifications/),
      callouts: [
        { n: 1, target: { role: 'button', name: /^Notifications/ }, text: 'Your unread count; orange when something needs you.', side: 'left' },
        { n: 2, target: { role: 'button', name: 'See all' }, text: 'Every notification, read and unread, by category.', side: 'left' },
      ],
    }),
    shot('notifications/list', '/notifications?show=all', 'Notifications', {
      callouts: [{ n: 1, target: { role: 'button', name: 'Mark all read' }, text: 'Clear them all, or only the category you filtered.', side: 'left' }],
    }),
    shot('members/list', '/members', 'Members'),
    shot('members/detail', '/members', 'A member', { steps: firstRow }),
    shot('roles/list', '/roles', 'Roles'),
    shot('roles/detail', '/roles', 'A role and its permissions', { steps: firstRow, fullPage: true }),
    shot('api-clients/list', '/api-clients', 'API clients'),
    shot('api-clients/new', '/api-clients', 'New API client', { steps: click('New client') }),
    shot('audit/log', '/audit', 'Audit log'),
    shot('audit/event', '/audit', 'An audit event', { steps: async (p) => { await p.getByText('Background job').first().click(); } }),
  ];

  const settings: Scenario[] = [
    shot('settings/profile', '/settings?tab=profile', 'Settings: profile'),
    shot('settings/preferences', '/settings?tab=preferences', 'Settings: preferences'),
    shot('settings/security', '/settings?tab=security', 'Settings: security', { fullPage: true }),
    shot('settings/access', '/settings?tab=access', 'Settings: role and access', { fullPage: true }),
    shot('settings/company', '/settings?tab=company', 'Settings: my company'),
    shot('settings/company-addresses', '/settings?tab=company', 'My company: addresses and contacts', { steps: tab(/Addresses/), fullPage: true }),
    shot('settings/company-tax', '/settings?tab=company', 'My company: tax', { steps: tab('Tax') }),
    shot('settings/company-policies', '/settings?tab=company', 'My company: operating policies', { steps: tab(/Operating policies/), fullPage: true }),
    shot('settings/company-capabilities', '/settings?tab=company', 'My company: capabilities', { steps: tab(/Capabilities/) }),
    shot('settings/company-log', '/settings?tab=company', 'My company: change log', { steps: tab(/Change log/) }),
    shot('settings/billing', '/settings?tab=billing', 'Settings: billing', { fullPage: true }),
    shot('settings/support', '/settings?tab=support', 'Settings: support access'),
  ];

  return [...main, ...(w.sell ? contribute : []), ...product, ...(w.sell ? sell : []), ...(w.buy ? buy : []), ...(w.stock ? stock : []), ...ledger, ...system, ...settings];
}
