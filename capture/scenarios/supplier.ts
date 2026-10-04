// Supplier guide (Kumasi Pump Works, GHS): sells to distributors and holds stock; buys nothing on
// Neuros, so it has no Marketplace or Suppliers.
import { walk } from '../walk';

export default walk({
  persona: 'supplier',
  company: 'Kumasi Pump Works Ltd',
  sell: true,
  buy: false,
  stock: true,
  priceList: 'Distributors',
  journalWaiting: 'Workshop rent, October',
});
