// Reseller guide (Ikeja Hardware Resellers, NGN): buys from the sellers it has accounts with; no
// selling and no stock, so no Offers, Pricing, Customers or Inventory.
import type { Page } from 'playwright';
import type { Scenario } from '../scenario';
import { walk } from '../walk';

// From seed:trade: the quotation Lagos Industrial sent on Ikeja Hardware's request.
const quotation: Scenario = {
  id: 'reseller/buying-quotes/detail',
  persona: 'reseller',
  path: '/buying/quotes?status=sent',
  title: 'A quotation to decide on',
  fullPage: true,
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Lagos Industrial' }).first().click(); },
  callouts: [
    { n: 1, target: { text: /^Total$/, nth: 1 }, text: 'Each line with its tax, the freight and the total: fixed since the supplier sent it.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Accept' }, text: 'Accept agrees these prices and terms, and closes your request.', side: 'top' },
    { n: 3, target: { role: 'button', name: 'Decline' }, text: 'Decline with a reason; the supplier may send a revision.', side: 'top' },
  ],
};

// From seed:trade: the order Lagos Industrial accepted on credit.
const order: Scenario = {
  id: 'reseller/buying-orders/detail',
  persona: 'reseller',
  path: '/buying/orders?status=accepted',
  title: 'An accepted order',
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Lagos Industrial' }).first().click(); },
  callouts: [
    { n: 1, target: { text: 'Awaiting payment', nth: 1 }, text: 'The order, its payment and its stock, each with its own status.', side: 'bottom' },
    { n: 2, target: { role: 'button', name: /^DN-/ }, text: 'Its shipments: open one to follow it and confirm receipt.', side: 'top' },
  ],
};

// The same order's shipment, as the customer reads it.
const shipment: Scenario = {
  id: 'reseller/buying-orders/shipment',
  persona: 'reseller',
  path: '/buying/orders?status=accepted',
  title: 'A shipment on its way to you',
  steps: async (page: Page) => {
    await page.getByRole('row').filter({ hasText: 'Lagos Industrial' }).first().click();
    await page.getByRole('button', { name: /^DN-/ }).first().click();
  },
  callouts: [
    { n: 1, target: { text: 'LIS-TRK-0412', nth: 0 }, text: 'How it travels, and the reference to follow it.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Confirm receipt' }, text: 'Tell the supplier it arrived.', side: 'top' },
  ],
};

export default [...walk({
  persona: 'reseller',
  company: 'Ikeja Hardware Resellers',
  sell: false,
  buy: true,
  stock: false,
  journalWaiting: 'Shop rent, October',
  marketplaceSeller: 'Lagos Industrial Supplies Ltd',
}), quotation, order, shipment];
