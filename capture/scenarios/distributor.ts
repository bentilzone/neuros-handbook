// Distributor guide (Lagos Industrial Supplies). Sample set for H1; the full walk lands in H3.
import type { Scenario } from '../scenario';

const scenarios: Scenario[] = [
  {
    id: 'distributor/inventory/stock',
    persona: 'distributor',
    path: '/inventory',
    title: 'Inventory: stock on hand in each warehouse',
    callouts: [
      { n: 1, target: { css: '[class*="SegmentedControl-root"]' }, text: 'The tabs: stock, every movement, adjustments, transfers, counts, reorder rules, warehouses and valuation.', side: 'right' },
      { n: 2, target: { role: 'textbox', name: 'Warehouse' }, text: 'Narrow the list to one warehouse or one condition (sellable, quarantined, damaged).', side: 'bottom' },
      { n: 3, target: { role: 'button', name: 'Receive stock' }, text: 'Record a delivery that arrived without a purchase order — opening stock, a supplier drop.', side: 'left' },
      { n: 4, target: { role: 'row', nth: 1 }, text: 'One product in one warehouse: on hand, reserved for orders, and what is left to sell. Click a row for its detail.', side: 'bottom' },
    ],
  },
  {
    id: 'distributor/ledger/journals',
    persona: 'distributor',
    path: '/ledger',
    title: 'Ledger: every journal, automatic or manual',
    callouts: [
      { n: 1, target: { role: 'button', name: 'New journal' }, text: 'Draft a manual journal. It posts only after someone else approves it.', side: 'left' },
      { n: 2, target: { role: 'textbox', name: 'Status' }, text: 'Filter by state — drafts, waiting for approval, posted, reversed, cancelled — and by period.', side: 'bottom' },
      { n: 3, target: { text: 'Waiting for approval' }, text: 'A journal waiting for a colleague with posting rights.', side: 'right' },
    ],
  },
  {
    kind: 'video',
    id: 'distributor-manual-journal',
    persona: 'distributor',
    path: '/ledger',
    title: 'Drafting a manual journal that balances',
    steps: async (page, say) => {
      await say('Manual journals start as drafts. Open a new one from the Ledger.');
      await page.getByRole('button', { name: 'New journal' }).click();
      await page.getByRole('textbox', { name: /Memo/ }).fill('Generator diesel, October');
      await say('Pick an account for each line and enter its debit or credit.');
      const pick = async (label: string, option: RegExp) => {
        await page.getByRole('textbox', { name: label }).click();
        await page.getByRole('option', { name: option }).first().click();
      };
      await pick('Account 1', /Utilities|Repairs|Fuel|6\d{3}/);
      await page.getByRole('textbox', { name: 'Debit 1' }).fill('85000');
      await pick('Account 2', /Bank|Cash/);
      await page.getByRole('textbox', { name: 'Credit 2' }).fill('80000');
      await say('Until debits equal credits, the journal says by how much it is off and cannot be saved.');
      await page.getByRole('textbox', { name: 'Credit 2' }).fill('85000');
      await say('Balanced. Create the draft, then submit it for a colleague to approve and post.');
    },
  },
];

export default scenarios;
