// Run by the engine's own tsx, in the engine directory, before any seed (capture/stack.ts).
// On an empty database every collection and index is created lazily, and a seed's transaction that
// is first to touch a collection waits on the index build behind it — and retries for ever. Create
// them all up front, exactly as the engine's DB tests do (src/__tests__/helpers/mongo.ts).
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const engine = (p: string) => pathToFileURL(join(process.cwd(), p)).href;

async function main() {
  await import(engine('src/lib/db.ts')); // transaction ALS + JSON transforms, before models compile
  await import(engine('src/modules/index.ts')); // every route, so every model
  await import(engine('src/modules/hooks.ts'));
  await import(engine('src/modules/jobs.ts'));
  const mongoose = (await import(engine('node_modules/mongoose/index.js'))).default;
  await mongoose.connect(process.env.MONGODB_URI!);
  const models = Object.values(mongoose.models) as { syncIndexes: () => Promise<unknown> }[];
  await Promise.all(models.map((m) => m.syncIndexes()));
  console.log(`prepared ${models.length} collections`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
