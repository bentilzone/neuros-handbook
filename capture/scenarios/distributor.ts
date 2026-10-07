// Distributor guide (Lagos Industrial Supplies, NGN): buys, holds stock and sells on, so it walks
// every section.
import type { Page } from 'playwright';
import type { Scenario } from '../scenario';
import { walk } from '../walk';

const credit: Scenario = {
  id: 'distributor/customers/credit',
  persona: 'distributor',
  path: '/selling/customers',
  title: 'A customer’s credit',
  steps: async (page: Page) => {
    await page.getByRole('row').filter({ hasText: 'Ikeja Hardware' }).first().click();
    await page.getByText('Available', { exact: true }).scrollIntoViewIfNeeded();
  },
  callouts: [
    { n: 1, target: { text: 'Available', nth: 0 }, text: 'What they can still buy on credit: the limit less accepted orders not yet paid.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Change limit' }, text: 'The limit and its expiry, in your currency. Needs two-step sign-in.', side: 'left' },
    { n: 3, target: { role: 'button', name: 'Put on hold' }, text: 'Stop new credit orders, with a reason. Open orders and invoices stand.', side: 'left' },
  ],
};

const newQuotation: Scenario = { id: 'distributor/quotes/new', persona: 'distributor', path: '/selling/quotes', title: 'New quotation', fullPage: true, steps: async (page: Page) => { await page.getByRole('button', { name: 'New quotation' }).click(); } };

// From seed:trade: a draft for Ikeja Hardware the customer cannot see yet.
const draft: Scenario = {
  id: 'distributor/quotes/draft',
  persona: 'distributor',
  path: '/selling/quotes?status=draft',
  title: 'A draft quotation',
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Ikeja Hardware' }).first().click(); },
  callouts: [
    { n: 1, target: { text: /sees nothing until you send it/ }, text: 'A draft stays with you until you send it.', side: 'left' },
    { n: 2, target: { text: 'Quoted price', nth: 0 }, text: 'Where each price came from: your own price, or their contract, price list or standard price. Only you see this.', side: 'left' },
    { n: 3, target: { role: 'button', name: 'Send' }, text: 'Send fixes the prices and starts the validity.', side: 'left' },
  ],
};

// From seed:trade: Ikeja Hardware's order waiting for acceptance.
const order: Scenario = {
  id: 'distributor/orders/detail',
  persona: 'distributor',
  path: '/selling/orders?status=submitted',
  title: 'An order to accept',
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Ikeja Hardware' }).first().click(); },
  callouts: [
    { n: 1, target: { text: /^Total$/, nth: 1 }, text: 'The lines at the customer’s price, fixed when they ordered.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Accept' }, text: 'Accept claims credit if they pay on credit, and reserves the stock.', side: 'top' },
    { n: 3, target: { role: 'button', name: 'Reject' }, text: 'Reject with a reason they see.', side: 'top' },
  ],
};

export default [...walk({
  persona: 'distributor',
  company: 'Lagos Industrial Supplies Ltd',
  sell: true,
  buy: true,
  stock: true,
  priceList: 'Gold resellers',
  journalWaiting: 'Office and warehouse rent, October',
  marketplaceSeller: 'Kumasi Pump Works Ltd',
}), credit, newQuotation, draft, order];
