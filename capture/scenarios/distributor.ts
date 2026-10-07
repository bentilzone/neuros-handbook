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

export default [...walk({
  persona: 'distributor',
  company: 'Lagos Industrial Supplies Ltd',
  sell: true,
  buy: true,
  stock: true,
  priceList: 'Gold resellers',
  journalWaiting: 'Office and warehouse rent, October',
  marketplaceSeller: 'Kumasi Pump Works Ltd',
}), credit];
