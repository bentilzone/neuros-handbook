// Distributor guide (Lagos Industrial Supplies, NGN): buys, holds stock and sells on, so it walks
// every section.
import { walk } from '../walk';

export default walk({
  persona: 'distributor',
  company: 'Lagos Industrial Supplies Ltd',
  sell: true,
  buy: true,
  stock: true,
  priceList: 'Gold resellers',
  journalWaiting: 'Office and warehouse rent, October',
  marketplaceSeller: 'Kumasi Pump Works Ltd',
});
