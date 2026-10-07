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
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Part paid' }).first().click(); },
  callouts: [
    { n: 1, target: { text: 'Part paid', nth: 1 }, text: 'The order, its payment and its stock, each with its own status.', side: 'bottom' },
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
    await page.getByRole('row').filter({ hasText: 'Part paid' }).first().click();
    await page.getByRole('button', { name: /^DN-/ }).first().click();
  },
  callouts: [
    { n: 1, target: { text: 'LIS-TRK-0412', nth: 0 }, text: 'How it travels, and the reference to follow it.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Confirm receipt' }, text: 'Tell the supplier it arrived.', side: 'top' },
  ],
};

// The same invoice, addressed to Ikeja Hardware.
const invoice: Scenario = {
  id: 'reseller/buying-invoices/detail',
  persona: 'reseller',
  path: '/buying/invoices',
  title: 'An invoice from a supplier',
  steps: async (page: Page) => { await page.getByRole('row').filter({ hasText: 'Lagos Industrial' }).first().click(); },
  callouts: [
    { n: 1, target: { text: /^Outstanding$/, nth: 1 }, text: 'What you still owe, and below, when it is due.', side: 'left' },
    { n: 2, target: { text: /^Payment RCT-/ }, text: 'Payments the supplier has recorded from you.', side: 'left' },
  ],
};

// From seed:trade: the basket Ikeja Hardware is still building with Lagos Industrial.
const edit: Scenario = {
  id: 'reseller/buying-orders/edit',
  persona: 'reseller',
  path: '/buying/orders?status=draft',
  title: 'Edit a draft order',
  steps: async (page: Page) => {
    await page.getByRole('row').filter({ hasText: 'Lagos Industrial' }).first().click();
    await page.getByRole('button', { name: 'Edit' }).click();
    // The whole form in view, so placing a callout never scrolls the aside under the others.
    await page.getByRole('button', { name: 'Save draft' }).scrollIntoViewIfNeeded();
  },
  callouts: [
    { n: 1, target: { role: 'textbox', name: /^Quantity of / }, text: 'Change a quantity; saving prices every line again.', side: 'left' },
    { n: 2, target: { role: 'button', name: /^Remove / }, text: 'Take a line out of the basket.', side: 'top' },
    { n: 3, target: { role: 'button', name: 'Save draft' }, text: 'Still yours alone until you submit it.', side: 'top' },
  ],
};

// From seed:trade: an escrow order funded with the partner.
const escrow: Scenario = {
  id: 'reseller/buying-orders/escrow',
  persona: 'reseller',
  path: '/buying/orders?status=accepted',
  title: 'An order paid into escrow',
  steps: async (page: Page) => {
    await page.getByRole('row').filter({ hasText: 'Stock reserved' }).first().click();
    await page.getByRole('button', { name: 'Release to the seller' }).scrollIntoViewIfNeeded();
  },
  callouts: [
    { n: 1, target: { text: 'Funds in escrow', nth: 0 }, text: 'The partner holds your money for this order.', side: 'left' },
    { n: 2, target: { role: 'button', name: 'Release to the seller' }, text: 'Your own instruction: delivery alone never releases it.', side: 'top' },
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
}), quotation, order, shipment, invoice, edit, escrow];
