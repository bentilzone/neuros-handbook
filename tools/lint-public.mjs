// yarn lint:public — the handbook is a public site. Fail on anything that must never be published:
// credentials, connection strings, cloud keys, internal hosts, personal email addresses.
// Demo accounts (@demo.neuros.local) are allowed: they exist only in seeded demo data.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['docs', 'src', 'capture/scenarios'];
const TEXT = new Set(['.md', '.mdx', '.ts', '.tsx', '.json', '.js', '.mjs', '.vtt']);
const RULES = [
  [/mongodb(\+srv)?:\/\/[^\s'"`]+/i, 'database connection string'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\b(sk|pk)_(live|test)_[0-9a-zA-Z]{8,}/, 'API secret'],
  [/\b[a-z0-9-]+\.(elasticbeanstalk|execute-api\.[a-z0-9-]+)\.amazonaws\.com/i, 'internal AWS host'],
  [/\b(localhost|127\.0\.0\.1):\d{2,5}/, 'local address'],
  [/password\s*[:=]\s*['"][^'"]{6,}['"]/i, 'password literal'],
  [/[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|icloud)\.com/i, 'personal email address'],
];
// The capture scenarios log in as demo users through env, never literals; the stack file may name localhost.
const ALLOW = [/^capture\/stack\.ts$/];

const files = [];
const walk = (dir) => {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (TEXT.has(extname(p))) files.push(p);
  }
};
ROOTS.forEach(walk);

const problems = [];
for (const file of files) {
  if (ALLOW.some((re) => re.test(file))) continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [re, what] of RULES) if (re.test(line)) problems.push(`${file}:${i + 1}  ${what}`);
  });
}
if (problems.length) {
  console.error(`Not publishable (${problems.length}):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`lint:public — ${files.length} files clean`);
