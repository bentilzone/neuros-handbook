// Every field of a form, as the person filling it in needs to understand it: what it means to them,
// what the other party sees because of it, what it commits them to, and the rules it must meet.
import type { ReactNode } from 'react';

export interface Field {
  name: string;
  required?: boolean;
  /** What this means to you. */
  meaning: ReactNode;
  /** What your customer, supplier or colleague sees because of it. Omit when nobody else does. */
  others?: ReactNode;
  /** What it commits you to, or what it changes later (locks, postings, prices). */
  implications?: ReactNode;
  /** Format, limits and defaults. */
  rules?: ReactNode;
}

export default function FieldTable({ fields }: { fields: Field[] }) {
  const others = fields.some((f) => f.others);
  const implications = fields.some((f) => f.implications);
  return (
    <table className="nh-fields">
      <thead>
        <tr>
          <th>Field</th>
          <th>What it means</th>
          {others && <th>Who else sees it</th>}
          {implications && <th>What it implies</th>}
        </tr>
      </thead>
      <tbody>
        {fields.map((f) => (
          <tr key={f.name}>
            <td>{f.name}{f.required && <span className="nh-req" title="Required">*</span>}</td>
            <td>{f.meaning}{f.rules && <div className="nh-rules">{f.rules}</div>}</td>
            {others && <td>{f.others ?? '—'}</td>}
            {implications && <td>{f.implications ?? '—'}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
