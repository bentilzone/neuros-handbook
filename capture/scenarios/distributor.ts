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

// From seed:trade: the credit order's shipment, dispatched by own fleet.
const shipment: Scenario = {
  id: 'distributor/fulfilment/detail',
  persona: 'distributor',
  path: '/fulfilment?status=dispatched',
  title: 'A shipment on its way',
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Ikeja Hardware' }).first().click(); },
  callouts: [
    { n: 1, target: { text: 'LIS-TRK-0412', nth: 1 }, text: 'How it goes and its tracking reference: the customer sees both.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Add proof' }, text: 'Attach the signed delivery note or a photo.', side: 'top' },
    { n: 3, target: { role: 'button', name: 'Delivered' }, text: 'Delivered needs proof first.', side: 'top' },
    { n: 4, target: { role: 'button', name: 'Delivery failed' }, text: 'Record why it did not arrive; it goes back to packed.', side: 'bottom' },
  ],
};

// From seed:trade: the credit order's invoice, half paid by transfer.
const invoice: Scenario = {
  id: 'distributor/invoices/detail',
  persona: 'distributor',
  path: '/selling/invoices',
  title: 'An invoice part paid',
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Ikeja Hardware' }).filter({ hasText: 'Part paid' }).first().click(); },
  callouts: [
    { n: 1, target: { text: /^Outstanding$/, nth: 1 }, text: 'What the customer still owes on it.', side: 'left' },
    { n: 2, target: { text: /^Payment RCT-/ }, text: 'Each payment and credit note that settled part of it.', side: 'left' },
    { n: 3, target: { role: 'button', name: 'Record payment' }, text: 'Record what they paid against this invoice.', side: 'top' },
    { n: 4, target: { role: 'button', name: 'Credit note' }, text: 'Reduce what they owe, with a reason they see.', side: 'bottom' },
  ],
};

// From seed:trade: a prepay order Ikeja Hardware says it has paid.
const payment: Scenario = {
  id: 'distributor/orders/payment',
  persona: 'distributor',
  path: '/selling/orders?status=accepted',
  title: 'A payment to confirm',
  steps: async (page: Page) => {
    await page.getByRole('row').filter({ hasText: 'Not reserved' }).first().click();
    await page.getByRole('button', { name: 'Confirm received' }).scrollIntoViewIfNeeded();
  },
  callouts: [
    { n: 1, target: { text: /IH-TRF-5530/ }, text: 'What the customer says they paid, and their bank reference.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Confirm received' }, text: 'Once it is in your bank: records the receipt and, on prepay, reserves the stock.', side: 'top' },
    { n: 3, target: { role: 'button', name: 'Not received' }, text: 'It never arrived: tell them why.', side: 'bottom' },
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
  disputes: 'selling',
}), credit, newQuotation, draft, order, shipment, invoice, payment];
