// A link from a shared page body (docs/_partials) to another page of the same guide. A persona
// without that page (a supplier has no Suppliers page) is sent to the distributor's, which has all.
import Link from '@docusaurus/Link';
import type { ReactNode } from 'react';

const PAGES: Record<string, string[]> = {
  supplier: ['dashboard', 'catalogue', 'offers', 'pricing', 'quotes', 'orders', 'invoices', 'customers', 'inventory', 'fulfilment', 'ledger', 'notifications', 'members', 'roles', 'api-clients', 'audit-log', 'settings'],
  distributor: ['dashboard', 'catalogue', 'offers', 'pricing', 'quotes', 'orders', 'invoices', 'customers', 'marketplace', 'buying-quotes', 'basket', 'buying-orders', 'buying-invoices', 'suppliers', 'inventory', 'fulfilment', 'ledger', 'notifications', 'members', 'roles', 'api-clients', 'audit-log', 'settings'],
  reseller: ['dashboard', 'catalogue', 'marketplace', 'buying-quotes', 'basket', 'buying-orders', 'buying-invoices', 'suppliers', 'ledger', 'notifications', 'members', 'roles', 'api-clients', 'audit-log', 'settings'],
};

export default function PageLink({ who, page, hash, children }: { who: string; page: string; hash?: string; children: ReactNode }) {
  const guide = PAGES[who]?.includes(page) ? who : 'distributor';
  return <Link to={`/${guide}/${page}${hash ? `#${hash}` : ''}`}>{children}</Link>;
}
