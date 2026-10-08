// The API reference, generated from the engine's OpenAPI document: one page per area, an
// operations table, then each operation with its scope, parameters, body and response fields.
// `yarn api:ref` (reads ../neuros-engine/openapi.json, or NEUROS_ENGINE_DIR). Never edit the
// output by hand; fix the route's summary or description in the engine and regenerate.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import GithubSlugger from 'github-slugger';

const ENGINE = resolve(process.env.NEUROS_ENGINE_DIR ?? '../neuros-engine');
const OUT = 'docs/30-api/reference';
const spec = JSON.parse(readFileSync(join(ENGINE, 'openapi.json'), 'utf8'));

/** The areas a company's systems call, in the order a reader meets them. Platform areas are Neuros' own. */
const AREAS = [
  ['Auth', 'auth', 'Signing in as a person, choosing a company, two-step verification and sessions.'],
  ['API clients', 'api-clients', 'Client credentials, scopes, secret rotation and the token endpoint.'],
  ['Organisation', 'organisation', 'Your company profile, addresses, contacts, tax identifiers and operating policies.'],
  ['Members', 'members', 'People in your company, invitations, roles and limits.'],
  ['Roles', 'roles', 'Roles and the permission catalogue.'],
  ['Onboarding', 'onboarding', 'Registering a company and its application to Neuros.'],
  ['Billing', 'billing', 'Your plan, usage, invoices and payments to Neuros.'],
  ['Reference data', 'reference-data', 'Countries, currencies and other shared lists.'],
  ['FX rates', 'fx-rates', 'Exchange rates your company records and approves.'],
  ['Tax', 'tax', 'Tax codes, rates and exemptions.'],
  ['Catalogue', 'catalogue', 'The shared product catalogue: browse, contribute and propose categories.'],
  ['Selling', 'selling', 'Offers, price lists, contract prices, promotions and the price check.'],
  ['Relationships', 'relationships', 'Accounts between sellers and buyers, and their terms.'],
  ['Quotations', 'quotations', 'Requests for quotation and quotations: ask, price, send, revise, accept.'],
  ['Orders', 'orders', 'Orders between a buyer and one seller: draft, submit, approve, accept, allocate, amend, cancel.'],
  ['Basket', 'basket', 'The buyer\'s open drafts, one per seller, checked out together; each order goes on its own.'],
  ['Fulfilment', 'fulfilment', 'Shipments of accepted orders: pick list, pack, dispatch, delivery proof, deliver, fail, cancel, receipt.'],
  ['Receivables', 'receivables', 'Sales invoices, payments received, credit notes and ageing; the buyer\'s purchase invoices.'],
  ['Payments', 'payments', 'Paying for orders: payment notices and confirmation, and escrow funding, release and refund.'],
  ['Disputes', 'disputes', 'Disputing part of a delivered order: evidence, messages, escalation, and the seller\'s decision.'],
  ['Returns', 'returns', 'Returning goods: request, authorise, receive into quarantine, inspect and credit.'],
  ['Suppliers', 'suppliers', 'Your suppliers outside Neuros, and where each is paid.'],
  ['Requisitions', 'requisitions', 'Requests to buy: approval within purchase limits, then orders on Neuros and purchase orders outside it.'],
  ['Purchase orders', 'purchase-orders', 'Orders to suppliers outside Neuros: approval over the limit, sent by email with a PDF, confirmed.'],
  ['Notifications', 'notifications', 'Your own notifications in a company: list, unread counts, mark read.'],
  ['Marketplace', 'marketplace', 'Searching offers and pricing them for your company.'],
  ['Inventory', 'inventory', 'Warehouses, stock, receipts, adjustments, transfers, counts, reorder and valuation.'],
  ['Ledger', 'ledger', 'Accounts, posting rules, periods, journals and the trial balance.'],
  ['Audit', 'audit', 'The audit trail of changes and API requests.'],
];

const METHOD_ORDER = ['get', 'post', 'put', 'patch', 'delete'];

/** Text safe inside MDX: no JSX, no expressions, no table breaks. */
const text = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/[{}<>]/g, (c) => ({ '{': '&#123;', '}': '&#125;', '<': '&lt;', '>': '&gt;' })[c]).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
const code = (s) => '`' + String(s).replace(/`/g, "'") + '`';
// The table links to each operation's heading by the id Docusaurus gives it (github-slugger, with
// -1, -2 for repeats), so the TOC and the table point at the same place.
const headingOf = (op, path, method) => text(op.summary ?? `${method.toUpperCase()} ${path}`);
let slugger = new GithubSlugger();
const anchors = new Map();
const anchor = (op) => anchors.get(op);

function typeOf(s) {
  if (!s) return 'any';
  if (s.$ref) return s.$ref.split('/').pop();
  if (s.enum) return s.enum.length > 12 ? `${s.type ?? 'string'} (one of ${s.enum.length})` : s.enum.map((e) => code(e)).join(' · ');
  if (s.type === 'array') return s.items?.enum ? `array of ${typeOf(s.items)}` : `${typeOf(s.items)}[]`;
  if (s.oneOf || s.anyOf || s.alternatives) return (s.oneOf ?? s.anyOf ?? s.alternatives).map(typeOf).join(' or ');
  if (s.format && s.type === 'string') return `string (${s.format})`;
  return s.type ?? 'object';
}

function rules(s) {
  if (!s) return '';
  const r = [];
  if (s.minLength !== undefined && s.maxLength !== undefined && s.minLength === s.maxLength) r.push(`${s.minLength} characters`);
  else {
    if (s.minLength) r.push(`at least ${s.minLength} characters`);
    if (s.maxLength) r.push(`at most ${s.maxLength} characters`);
  }
  if (s.minimum !== undefined) r.push(`≥ ${s.minimum}`);
  if (s.maximum !== undefined) r.push(`≤ ${s.maximum}`);
  if (s.default !== undefined) r.push(`default ${code(JSON.stringify(s.default))}`);
  if (s.nullable) r.push('may be null');
  return r.join(', ');
}

/** Rows for an object's fields, one level of nesting spelled out as parent.child. */
function fieldRows(schema, prefix = '', depth = 0) {
  const s = schema?.items && schema.type === 'array' ? schema.items : schema;
  if (!s?.properties) return [];
  const req = new Set(s.required ?? []);
  const rows = [];
  for (const [name, p] of Object.entries(s.properties)) {
    if (name === '_id') continue; // the same value as `id`
    const full = prefix + name;
    rows.push(`| ${code(full)}${req.has(name) ? ' *' : ''} | ${text(typeOf(p))} | ${text([p.description, rules(p)].filter(Boolean).join('. '))} |`);
    const inner = p.type === 'array' ? p.items : p;
    if (depth < 1 && inner?.properties) rows.push(...fieldRows(inner, `${full}${p.type === 'array' ? '[]' : ''}.`, depth + 1));
  }
  return rows;
}

const table = (head, rows) => (rows.length ? [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows, ''].join('\n') : '');

function describe(op) {
  // The engine appends "**Auth:** `org` · **Permission:** `x` — …" to each description; the page
  // shows auth and scope in their own line instead.
  return (op.description ?? '').split(/\n*\*\*Auth:\*\*/)[0].trim();
}

function scopeOf(op) {
  const cc = (op.security ?? []).find((s) => s.clientCredentials);
  if (cc) return { who: 'People and API clients', scope: cc.clientCredentials.join(' ') };
  if ((op.security ?? []).some((s) => s.bearerAuth)) return { who: 'People signed in (not API clients)', scope: (op.description ?? '').match(/\*\*Permission:\*\* `([^`]+)`/)?.[1] ?? null };
  return { who: 'No sign-in', scope: null };
}

function operation(path, method, op) {
  const out = [];
  const { who, scope } = scopeOf(op);
  out.push(`### ${headingOf(op, path, method)}`, '');
  out.push(`<span className="nh-method nh-method--${method}">${method.toUpperCase()}</span> ${code(path)}`, '');
  const d = describe(op);
  if (d) out.push(text(d), '');
  const facts = [`**Who can call it:** ${who}`];
  if (scope) facts.push(`**Scope:** ${code(scope)}`);
  const idem = (op.parameters ?? []).find((p) => p.in === 'header' && p.name.toLowerCase() === 'idempotency-key');
  if (idem) facts.push(`**Idempotency-Key:** ${idem.required ? 'required' : 'accepted'}`);
  if (/two-step|MFA/i.test(op.description ?? '')) facts.push('**Two-step verification:** the session must have signed in with it');
  out.push(facts.join(' · '), '');

  const params = (op.parameters ?? []).filter((p) => p.in !== 'header');
  out.push(table(['Parameter', 'In', 'Type', 'Notes'], params.map((p) => `| ${code(p.name)}${p.required ? ' *' : ''} | ${p.in} | ${text(typeOf(p.schema))} | ${text([p.description, rules(p.schema)].filter(Boolean).join('. '))} |`)));

  const body = op.requestBody?.content?.['application/json']?.schema;
  if (body) {
    out.push('**Request body**', '');
    out.push(table(['Field', 'Type', 'Notes'], fieldRows(body)) || `${text(typeOf(body))}\n`);
  }

  const [status, res] = Object.entries(op.responses ?? {}).find(([s]) => s.startsWith('2')) ?? [];
  if (status) {
    const schema = res.content?.['application/json']?.schema;
    out.push(`**Response** ${code(status)}${schema ? '' : ' — no body'}`, '');
    if (schema) {
      const paged = schema.properties?.data && schema.properties?.meta;
      if (paged) out.push('A page: `data` holds the items below, `meta` the page, limit, total and total pages.', '');
      out.push(table(['Field', 'Type', 'Notes'], fieldRows(paged ? schema.properties.data : schema)) || `${text(typeOf(schema))}\n`);
    }
  }
  return out.join('\n');
}

const byTag = new Map();
for (const [path, item] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(item)) {
    if (!METHOD_ORDER.includes(method)) continue;
    for (const tag of op.tags ?? []) byTag.set(tag, [...(byTag.get(tag) ?? []), { path, method, op }]);
  }
}

// Every public tag has a page: a new engine tag must be placed here, never silently left out.
// The operator console's own API (Platform …) is not part of the public reference.
const unplaced = [...byTag.keys()].filter((t) => !t.startsWith('Platform') && !AREAS.some(([tag]) => tag === t));
if (unplaced.length) throw new Error(`Tags with no area in tools/api-reference.mjs: ${unplaced.join(', ')}`);

// Only now replace the pages, so a refused run leaves the last good reference in place.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const index = [];
AREAS.forEach(([tag, slug, intro], i) => {
  const ops = byTag.get(tag);
  if (!ops?.length) return;
  ops.sort((a, b) => a.path.localeCompare(b.path) || METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method));
  // Headings above the operations on the page claim their slugs first.
  slugger = new GithubSlugger();
  slugger.slug('Operations');
  slugger.slug('Details');
  for (const { path, method, op } of ops) anchors.set(op, slugger.slug(headingOf(op, path, method).replace(/&#123;|&#125;|&lt;|&gt;|\\/g, '')));
  const rows = ops.map(({ path, method, op }) => `| [${method.toUpperCase()} ${code(path)}](#${anchor(op)}) | ${text(op.summary)} | ${scopeOf(op).scope ? code(scopeOf(op).scope) : '—'} |`);
  const page = [
    '---',
    `title: ${JSON.stringify(tag)}`,
    `sidebar_position: ${(i + 1) * 10}`,
    `description: ${JSON.stringify(intro)}`,
    '---',
    '',
    '{/* GENERATED by tools/api-reference.mjs from neuros-engine/openapi.json. Do not edit. */}',
    '',
    intro,
    '',
    `This page lists the ${ops.length} operations in this area, generated from the engine's OpenAPI document. Paths are relative to the API base URL. Fields marked * are required.`,
    '',
    '## Operations',
    '',
    table(['Operation', 'Purpose', 'API client scope'], rows),
    '## Details',
    '',
    ops.map(({ path, method, op }) => operation(path, method, op)).join('\n\n'),
    '',
  ].join('\n');
  writeFileSync(join(OUT, `${String((i + 1) * 10).padStart(3, '0')}-${slug}.mdx`), page);
  index.push(`| [${tag}](./${String((i + 1) * 10).padStart(3, '0')}-${slug}.mdx) | ${intro} | ${ops.length} |`);
});

writeFileSync(join(OUT, 'index.mdx'), [
  '---',
  'slug: /api/reference',
  'title: API reference',
  'sidebar_label: Use the reference',
  'sidebar_position: 0',
  '---',
  '',
  '{/* GENERATED by tools/api-reference.mjs from neuros-engine/openapi.json. Do not edit. */}',
  '',
  `Every operation a company can call, area by area, generated from the engine's OpenAPI document (version ${spec.info.version}). Each operation lists who can call it, the API client scope it needs, its parameters, request body and response fields.`,
  '',
  "Neuros' own platform operations are not listed: no company can call them.",
  '',
  table(['Area', 'What it covers', 'Operations'], index),
].join('\n'));

console.log(`api reference: ${index.length} areas written to ${OUT}`);
