// Reseller guide (Ikeja Hardware Resellers, NGN): buys from the sellers it has accounts with; no
// selling and no stock, so no Offers, Pricing, Customers or Inventory.
import { walk } from '../walk';

export default walk({
  persona: 'reseller',
  company: 'Ikeja Hardware Resellers',
  sell: false,
  buy: true,
  stock: false,
  journalWaiting: 'Shop rent, October',
  marketplaceSeller: 'Lagos Industrial Supplies Ltd',
});
