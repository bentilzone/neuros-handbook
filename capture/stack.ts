// A throwaway Neuros: an in-memory MongoDB replica set, the engine seeded with every demo script,
// and a production build of the client pointed at it. Nothing touches a shared database, so every
// capture run starts from the same demo companies.
import { spawn, type ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

export const ENGINE_DIR = resolve(process.env.NEUROS_ENGINE_DIR ?? '../neuros-engine');
export const CLIENT_DIR = resolve(process.env.NEUROS_CLIENT_DIR ?? '../neuros-client');
const API_PORT = Number(process.env.CAPTURE_API_PORT ?? 2101);
const APP_PORT = Number(process.env.CAPTURE_APP_PORT ?? 5199);
export const API_URL = `http://localhost:${API_PORT}`;
export const APP_URL = `http://localhost:${APP_PORT}`;
/**
 * Passwords for this throwaway stack only, new on every run: the repo is public, so it must not
 * carry a password that works anywhere — the seed's shared demo one included (SEED_DEMO_PASSWORD).
 */
// With --app (a stack already running) pass that stack's passwords as CAPTURE_OPERATOR_PASSWORD / CAPTURE_DEMO_PASSWORD.
export const OPERATOR = { email: 'admin@neuros.local', password: process.env.CAPTURE_OPERATOR_PASSWORD ?? randomBytes(18).toString('base64url') };
export const DEMO_PASSWORD = process.env.CAPTURE_DEMO_PASSWORD ?? randomBytes(18).toString('base64url');

export interface Stack { appUrl: string; stop: () => Promise<void> }

const say = (s: string) => console.log(`[stack] ${s}`);

async function waitFor(url: string, what: string, ms = 120_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${what} did not come up at ${url}`);
}

/**
 * Run a command to completion WITHOUT blocking the event loop. spawnSync would freeze this process,
 * and with it the reader of mongod's log pipe: the pipe fills, mongod blocks on its own logging and
 * every query waits for ever.
 */
function run(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv, what: string): Promise<void> {
  say(what);
  return new Promise((done, fail) => {
    const p = spawn(cmd, args, { cwd, env, stdio: process.env.CAPTURE_VERBOSE ? 'inherit' : ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout?.on('data', (d) => { out += d; });
    p.stderr?.on('data', (d) => { out += d; });
    p.on('error', fail);
    p.on('exit', (code) => (code === 0 ? done() : fail(new Error(`${what} failed (${code}):\n${out}`))));
  });
}

export async function startStack(): Promise<Stack> {
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' }, binary: { version: process.env.MONGOMS_VERSION ?? '8.0.4' } });
  const secret = () => randomBytes(32).toString('hex');
  // Every key the engine reads is set here, so its own .env (which may point at a real database)
  // can fill nothing in: dotenv never overrides a variable that is already set.
  const engineEnv: NodeJS.ProcessEnv = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    NODE_ENV: 'development',
    PORT: String(API_PORT),
    APP_NAME: 'Neuros',
    PUBLIC_API_URL: API_URL,
    MONGODB_URI: mongo.getUri('neuros_handbook'),
    JWT_SECRET: secret(),
    JWT_REFRESH_SECRET: secret(),
    JWT_EXPIRES_IN: '60m',
    JWT_REFRESH_EXPIRES_IN: '1d',
    DATA_ENCRYPTION_KEY: secret(),
    DOCS_USERNAME: '',
    DOCS_PASSWORD_HASH: '',
    APP_URL,
    PLATFORM_MFA_REQUIRED: 'false',
    SEED_ADMIN_EMAIL: OPERATOR.email,
    SEED_ADMIN_PASSWORD: OPERATOR.password,
    SEED_DEMO_PASSWORD: DEMO_PASSWORD,
    CORS_ORIGINS: APP_URL,
    APP_DOMAIN: 'neuros.app',
    STORAGE_PROVIDER: 'local',
    LOCAL_STORAGE_DIR: mkdtempSync(join(tmpdir(), 'nh-storage-')),
    MAIL_PROVIDER: 'memory',
    MAIL_FROM: 'Neuros <no-reply@neuros.app>',
    PAYMENT_PROVIDER: 'simulated',
    JOBS_ENABLED: 'true',
  };
  await run(join(ENGINE_DIR, 'node_modules/.bin/tsx'), [resolve('capture/prepare-db.ts')], ENGINE_DIR, engineEnv, 'collections and indexes');
  // Order matters: companies need a plan before they can hold warehouses or trade.
  for (const script of ['seed', 'seed:catalogue', 'seed:billing', 'seed:trade']) await run('yarn', ['-s', script], ENGINE_DIR, engineEnv, `engine ${script}`);

  say(`engine on ${API_URL}`);
  const engine = spawn(join(ENGINE_DIR, 'node_modules/.bin/tsx'), ['src/server.ts'], { cwd: ENGINE_DIR, env: engineEnv, stdio: process.env.CAPTURE_VERBOSE ? 'inherit' : 'ignore' });
  await waitFor(`${API_URL}/health`, 'The engine');

  const outDir = mkdtempSync(join(tmpdir(), 'nh-client-'));
  const clientEnv = { ...process.env, VITE_API_BASE_URL: API_URL };
  await run('yarn', ['-s', 'vite', 'build', '--outDir', outDir, '--emptyOutDir'], CLIENT_DIR, clientEnv, 'client build');
  say(`client on ${APP_URL}`);
  const client = spawn('yarn', ['-s', 'vite', 'preview', '--outDir', outDir, '--port', String(APP_PORT), '--strictPort'], { cwd: CLIENT_DIR, env: clientEnv, stdio: 'ignore' });
  await waitFor(APP_URL, 'The client');

  const kill = (p: ChildProcess) => new Promise<void>((r) => { if (p.exitCode !== null) return r(); p.once('exit', () => r()); p.kill('SIGTERM'); });
  return {
    appUrl: APP_URL,
    stop: async () => {
      await Promise.all([kill(client), kill(engine)]);
      await mongo.stop();
    },
  };
}
