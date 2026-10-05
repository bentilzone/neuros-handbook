// handbook.manifest.json says which pages document each app route; neuros-client's coverage test
// trusts it. Refuse an entry with no pages, or a page that is not in docs/.
import { existsSync, readFileSync } from 'node:fs';

const { routes } = JSON.parse(readFileSync('handbook.manifest.json', 'utf8'));
const problems = [];
for (const [route, pages] of Object.entries(routes)) {
  if (!route.startsWith('/')) problems.push(`${route}: a route starts with /`);
  if (!Array.isArray(pages) || !pages.length) problems.push(`${route}: no pages`);
  for (const p of pages ?? []) if (!existsSync(`docs/${p}`)) problems.push(`${route}: docs/${p} does not exist`);
}
if (problems.length) {
  console.error(`handbook.manifest.json:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`handbook.manifest.json: ${Object.keys(routes).length} routes, every page exists`);
