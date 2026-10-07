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

export default [...walk({
  persona: 'reseller',
  company: 'Ikeja Hardware Resellers',
  sell: false,
  buy: true,
  stock: false,
  journalWaiting: 'Shop rent, October',
  marketplaceSeller: 'Lagos Industrial Supplies Ltd',
}), quotation];
