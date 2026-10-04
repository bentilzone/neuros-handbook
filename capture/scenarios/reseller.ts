// Reseller guide (Ikeja Hardware Resellers). Sample set for H1; the full walk lands in H4.
import type { Scenario } from '../scenario';

const scenarios: Scenario[] = [
  {
    id: 'reseller/marketplace/search',
    persona: 'reseller',
    path: '/marketplace',
    title: 'Marketplace: offers from every seller you can buy from',
    callouts: [
      { n: 1, target: { role: 'textbox', name: 'Search the marketplace' }, text: 'Search by product, brand, part number or seller.', side: 'bottom' },
      { n: 2, target: { role: 'textbox', name: 'Sort' }, text: 'Most relevant first, or by price.', side: 'bottom' },
      { n: 3, target: { text: 'Availability', nth: 0 }, text: 'Filter by availability, category, brand and seller. The counts are what each filter would leave.', side: 'right' },
      { n: 4, target: { css: 'main button[aria-label]', nth: 0 }, text: 'An offer card: the seller’s price for you where you have an account, its availability and the seller. Click for the detail and your price in any unit.', side: 'bottom' },
    ],
  },
];

export default scenarios;
