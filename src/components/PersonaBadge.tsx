// Who sees a page: the kinds of company (capabilities) and the permission it needs.
const LABEL = { supply: 'Suppliers', distribution: 'Distributors', purchasing: 'Resellers and buyers', operator: 'Platform operator', everyone: 'Every company' } as const;

export default function PersonaBadge({ who, permission }: { who: (keyof typeof LABEL)[]; permission?: string | string[] }) {
  const perms = permission ? ([] as string[]).concat(permission) : [];
  return (
    <div className="nh-badges">
      {who.map((w) => <span key={w} className="nh-badge">{LABEL[w]}</span>)}
      {perms.map((p) => <span key={p} className="nh-badge nh-badge--perm" title="Permission needed">{p}</span>)}
    </div>
  );
}
