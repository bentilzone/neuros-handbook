// The browser every capture uses: Chromium in Playwright's own Docker image, at the exact version of
// the playwright package. A laptop and CI then render text identically; a browser on the host would
// draw it with that system's fonts and anti-aliasing, and every CI run would rewrite every shot.
// `exposeNetwork` sends the browser's localhost back through this process, so the stack started on
// the host (engine :2101, client :5199) is reachable as it is from a local browser.
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { connect } from 'node:net';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { chromium, type Browser } from 'playwright';

const run = promisify(execFile);
const VERSION: string = createRequire(join(process.cwd(), 'package.json'))('playwright/package.json').version;
export const IMAGE = `mcr.microsoft.com/playwright:v${VERSION}-noble`;
const PORT = Number(process.env.CAPTURE_BROWSER_PORT ?? 3111);

const listening = (port: number) => new Promise<boolean>((done) => {
  const s = connect(port, '127.0.0.1', () => { s.end(); done(true); });
  s.on('error', () => done(false));
});

export interface CaptureBrowser { browser: Browser; stop: () => Promise<void> }

/** CAPTURE_HOST_BROWSER=1 uses the host's Chromium instead: quick to debug, but its shots differ. */
export async function startBrowser(): Promise<CaptureBrowser> {
  if (process.env.CAPTURE_HOST_BROWSER) {
    const browser = await chromium.launch();
    return { browser, stop: () => browser.close() };
  }
  // Async on purpose: a first pull takes minutes, and a blocked event loop stops the stack's log pipes.
  await run('docker', ['version', '--format', '{{.Server.Version}}']).catch(() => {
    throw new Error('Capture runs Chromium in Docker so shots match CI: start Docker (or set CAPTURE_HOST_BROWSER=1 to preview)');
  });
  console.log(`[browser] ${IMAGE}`);
  const { stdout } = await run('docker', [
    'run', '-d', '--rm', '--init', '--ipc=host', '--platform', 'linux/amd64', '-p', `127.0.0.1:${PORT}:${PORT}`, IMAGE,
    '/bin/sh', '-c', `npx -y playwright@${VERSION} run-server --port ${PORT} --host 0.0.0.0`,
  ], { maxBuffer: 1 << 20 });
  const id = stdout.trim();
  const stop = async () => { await run('docker', ['rm', '-f', id]).catch(() => undefined); };
  try {
    const until = Date.now() + 120_000;
    let browser: Browser | null = null;
    while (!browser) {
      if (Date.now() > until) throw new Error('The Playwright server in Docker did not start within two minutes');
      if (await listening(PORT)) browser = await chromium.connect(`ws://127.0.0.1:${PORT}/`, { exposeNetwork: '<loopback>' }).catch(() => null);
      if (!browser) await new Promise((r) => setTimeout(r, 1000));
    }
    const connected = browser;
    return { browser: connected, stop: async () => { await connected.close().catch(() => undefined); await stop(); } };
  } catch (err) {
    await stop();
    throw err;
  }
}
