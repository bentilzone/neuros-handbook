// yarn capture [--persona distributor] [--only distributor/ledger] [--videos] [--app http://localhost:5176]
//
// Starts a throwaway seeded Neuros (stack.ts) unless --app points at one already running, signs in
// as each persona, and writes every scenario's PNG to static/shots/<id>.png and its callouts to
// src/data/shots.json; videos go to static/video. Changed shots are listed in capture/.out/report.md.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Page } from 'playwright';
import { startBrowser } from './browser';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { drawCallouts } from './callouts';
import { signedIn, VIEWPORT, type Persona } from './personas';
import type { Scenario, Shot, Video } from './scenario';
import { startStack, type Stack } from './stack';

const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : undefined; };
const SHOTS = 'static/shots';
const VIDEOS = 'static/video';
const MANIFEST = 'src/data/shots.json';
const OUT = 'capture/.out';

/** Animations off, caret hidden: the same page gives the same picture. */
// Mantine's overlay scrollbars flash for a second after a layout change (a drawer narrowing a table),
// so whether a shot caught one depended on timing. Hide them; the page's content is what matters.
const STILL = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.mantine-ScrollArea-scrollbar,.mantine-ScrollArea-corner{opacity:0!important}`;

async function loadScenarios(): Promise<Scenario[]> {
  const dir = 'capture/scenarios';
  const all: Scenario[] = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.ts')).sort()) {
    const mod = await import(`./scenarios/${f}`);
    all.push(...(mod.default as Scenario[]));
  }
  const ids = new Set<string>();
  for (const s of all) {
    if (ids.has(s.id)) throw new Error(`Two scenarios share the id ${s.id}`);
    ids.add(s.id);
  }
  return all;
}

const inflight = new WeakMap<Page, number>();
/** Count this tab's requests, so `settle` can wait for quiet without a page load to wait for. */
function track(page: Page) {
  inflight.set(page, 0);
  const add = (d: number) => inflight.set(page, Math.max(0, (inflight.get(page) ?? 0) + d));
  page.on('request', (r) => { if (r.resourceType() !== 'websocket') add(1); });
  page.on('requestfinished', () => add(-1));
  page.on('requestfailed', () => add(-1));
}

async function settle(page: Page) {
  // Quiet for half a second, or give up after ten: the live socket never "finishes".
  const until = Date.now() + 10_000;
  let quietSince = Date.now();
  while (Date.now() < until) {
    if ((inflight.get(page) ?? 0) > 0) quietSince = Date.now();
    else if (Date.now() - quietSince > 500) break;
    await page.waitForTimeout(100);
  }
  await page.evaluate((css) => {
    if (!document.getElementById('nh-still')) {
      const s = document.createElement('style');
      s.id = 'nh-still';
      s.textContent = css;
      document.head.appendChild(s);
    }
  }, STILL);
  await page.evaluate(() => document.fonts.ready);
  // SVG's own animations (the sign-in pages' network mark) ignore the CSS above: stop them at frame 0.
  await page.evaluate(() => document.querySelectorAll('svg').forEach((svg) => { svg.pauseAnimations(); svg.setCurrentTime(0); }));
  await page.waitForTimeout(300);
}

/** Navigate inside the app (React Router follows popstate): no reload, so no session refresh. */
async function go(page: Page, path: string) {
  await page.keyboard.press('Escape').catch(() => undefined);
  await page.evaluate(() => document.getElementById('nh-callouts')?.remove());
  // The bell opens the notifications list in the aside and it stays open across in-app navigation:
  // close it, so one scenario's bell never shows in the next picture.
  // A collapsed aside is moved off-screen, not hidden, so check it is on screen before clicking.
  const asideClose = page.locator('aside button[aria-label="Close"]');
  // count() does not wait; boundingBox() alone would wait for a button a panel has replaced.
  const box = (await asideClose.count()) ? await asideClose.boundingBox({ timeout: 500 }).catch(() => null) : null;
  if (box && box.x >= 0 && box.x < VIEWPORT.width) await asideClose.click({ timeout: 2000 }).catch(() => undefined);
  // Through a route that matches nothing, so the target page mounts fresh (drawers closed).
  for (const p of ['/__handbook__', path]) {
    await page.evaluate((to) => { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); }, p);
    await page.waitForTimeout(50);
  }
}

function changed(file: string, next: Buffer): 'new' | 'changed' | 'same' {
  if (!existsSync(file)) return 'new';
  const a = PNG.sync.read(readFileSync(file));
  const b = PNG.sync.read(next);
  if (a.width !== b.width || a.height !== b.height) return 'changed';
  const diff = pixelmatch(a.data, b.data, undefined, a.width, a.height, { threshold: 0.1 });
  // An absolute count, not a share of the frame: a changed label is a few hundred pixels, and a
  // ratio loose enough to ignore anti-aliasing kept such shots stale. Re-runs differ by zero.
  return diff > 20 ? 'changed' : 'same';
}

async function shoot(page: Page, s: Shot, manifest: Record<string, unknown>, report: string[]) {
  await go(page, s.path);
  await settle(page);
  if (s.steps) await s.steps(page);
  await settle(page);
  // Park the pointer in the corner: no row hover or tooltip left from the last click.
  await page.mouse.move(VIEWPORT.width - 2, VIEWPORT.height - 2);
  await page.waitForTimeout(150);
  // The seed runs at the real time, so clock times, "n minutes ago" and job durations differ on
  // every run (and the sign-in page greets by the hour). Pin them in the page, or each run reports every history panel as changed.
  await page.evaluate(() => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.nodeValue ?? '';
      const next = t.replace(/\b([01]?\d|2[0-3]):[0-5]\d\b/g, '09:30').replace(/\b(\d+|an?) (second|minute|hour)s? ago\b/g, '5 minutes ago').replace(/\b\d+ ms\b/g, '12 ms').replace(/\bGood (afternoon|evening)\b/g, 'Good morning');
      if (next !== t) n.nodeValue = next;
    }
  });
  if (s.callouts?.length) await drawCallouts(page, s.callouts);
  const png = await page.screenshot({ fullPage: !!s.fullPage });
  await page.evaluate(() => document.getElementById('nh-callouts')?.remove());
  if (s.persona !== 'visitor' && new URL(page.url()).pathname.startsWith('/login')) throw new Error('signed out before the shot');
  const file = join(SHOTS, `${s.id}.png`);
  mkdirSync(dirname(file), { recursive: true });
  const state = changed(file, png);
  if (state !== 'same') writeFileSync(file, png);
  const { width, height } = PNG.sync.read(png);
  manifest[s.id] = { file: `${s.id}.png`, width, height, title: s.title, callouts: (s.callouts ?? []).map(({ n, text }) => ({ n, text })) };
  report.push(`| ${state === 'same' ? '' : state === 'new' ? '🆕' : '✏️'} | \`${s.id}\` | ${s.title} |`);
  console.log(`  ${state.padEnd(7)} ${s.id}`);
}

const vttTime = (ms: number) => new Date(ms).toISOString().slice(11, 23);

async function record(browser: import('playwright').Browser, appUrl: string, v: Video) {
  const dir = join(OUT, 'video', v.id);
  rmSync(dir, { recursive: true, force: true });
  const ffmpeg = spawnSync('ffmpeg', ['-version']).status === 0;
  if (v.with && !ffmpeg) throw new Error('a side-by-side video needs ffmpeg');
  // Each tab records from the moment it opens; note when, so both can be cut to the same start.
  const tabs: { ctx: import('playwright').BrowserContext; page: Page; opened: number; path: string; dir: string }[] = [];
  for (const [i, who] of [[0, v.persona], ...(v.with ? [[1, v.with.persona]] : [])] as [number, Persona][]) {
    const opened = Date.now();
    const sub = join(dir, String(i));
    const { ctx, page } = await signedIn(browser, appUrl, who, { recordVideo: { dir: sub, size: VIEWPORT } });
    track(page);
    tabs.push({ ctx, page, opened, path: i ? v.with!.path : v.path, dir: sub });
  }
  for (const t of tabs) { await go(t.page, t.path); await settle(t.page); }
  const start = Date.now();
  const cues: { at: number; text: string }[] = [];
  const say = async (text: string) => { cues.push({ at: Date.now() - start, text }); await tabs[0].page.waitForTimeout(2500); };
  try {
    await v.steps(tabs[0].page, say, tabs[1]?.page);
  } catch (err) {
    // Keep what each tab recorded up to the failure, to see where the flow went wrong.
    for (const t of tabs) { const video = t.page.video()!; await t.ctx.close(); await video.saveAs(join(t.dir, 'failed.webm')).catch(() => undefined); }
    console.log(`  (recordings up to the failure in ${dir})`);
    throw err;
  }
  await tabs[0].page.waitForTimeout(1200);
  const end = Date.now() - start;
  // saveAs, not path(): the browser is in Docker, and the recording has to come back to this machine.
  const raws: { file: string; skip: number }[] = [];
  for (const t of tabs) {
    const video = t.page.video()!;
    await t.ctx.close();
    const file = join(t.dir, 'raw.webm');
    await video.saveAs(file);
    raws.push({ file, skip: (start - t.opened) / 1000 });
  }
  mkdirSync(VIDEOS, { recursive: true });
  const vtt = ['WEBVTT', '', ...cues.flatMap((c, i) => [`${vttTime(c.at)} --> ${vttTime(cues[i + 1]?.at ?? end)}`, c.text, ''])].join('\n');
  writeFileSync(join(VIDEOS, `${v.id}.vtt`), vtt);
  // MP4 plays everywhere; without ffmpeg (local machines) the WebM Playwright recorded is kept.
  if (ffmpeg) {
    const inputs = raws.flatMap((r) => ['-ss', r.skip.toFixed(2), '-t', (end / 1000).toFixed(2), '-i', r.file]);
    // Two tabs: each scaled to half of a 1920-wide frame, seller left, buyer right.
    const filter = raws.length > 1 ? ['-filter_complex', '[0:v]scale=960:-2[l];[1:v]scale=960:-2[r];[l][r]hstack=inputs=2[v]', '-map', '[v]'] : [];
    const mp4 = join(VIDEOS, `${v.id}.mp4`);
    const out = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, ...filter, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-crf', '28', mp4]);
    if (out.status !== 0) throw new Error(`ffmpeg: ${out.stderr}`);
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1', '-i', mp4, '-frames:v', '1', join(VIDEOS, `${v.id}.jpg`)]);
  } else {
    copyFileSync(raws[0].file, join(VIDEOS, `${v.id}.webm`));
  }
  console.log(`  video   ${v.id}${ffmpeg ? '' : ' (webm: install ffmpeg for mp4)'}`);
}

async function main() {
  const persona = arg('persona') as Persona | undefined;
  const only = arg('only');
  const all = await loadScenarios();
  const scenarios = all.filter((s) => (!persona || s.persona === persona) && (!only || s.id.startsWith(only)));
  if (!scenarios.length) throw new Error('No scenario matches');

  let stack: Stack | null = null;
  const appUrl = arg('app') ?? (stack = await startStack()).appUrl;
  const { browser, stop: stopBrowser } = await startBrowser();
  const manifest: Record<string, unknown> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  // A shot whose scenario is gone is stale: drop it from the manifest and delete its image.
  const known = new Set(all.map((s) => s.id));
  for (const id of Object.keys(manifest)) {
    if (known.has(id)) continue;
    delete manifest[id];
    rmSync(join(SHOTS, `${id}.png`), { force: true });
    console.log(`  removed ${id}`);
  }
  const report: string[] = [];
  const failed: string[] = [];
  try {
    // One broken scenario (a renamed button) must not cost the rest of the run.
    const attempt = async (s: Scenario, run: () => Promise<void>) => {
      try {
        await run();
      } catch (err) {
        const lines = (err as Error).message.split('\n');
        failed.push(`${s.id}: ${lines[0]}${(lines.find((l) => l.includes('waiting for')) ?? '').replace(/\u001b\[\d+m/g, '').trim().replace(/^-\s*/, ' — ')}`);
        console.log(`  FAILED  ${s.id}`);
      }
    };
    const byPersona = new Map<Persona, Shot[]>();
    for (const s of scenarios) if (s.kind !== 'video') byPersona.set(s.persona, [...(byPersona.get(s.persona) ?? []), s]);
    for (const [who, list] of byPersona) {
      console.log(`${who}:`);
      const { ctx, page } = await signedIn(browser, appUrl, who);
      track(page);
      for (const s of list) await attempt(s, () => shoot(page, s, manifest, report));
      await ctx.close();
    }
    // Videos last: a flow places orders and moves stock, and no picture may show what a video did.
    // A recording never comes out byte-identical, so re-recording on every run would make every
    // capture PR carry a video. Record one that is missing, named by --only, or with --videos.
    const videos = scenarios.filter((s): s is Video => s.kind === 'video' && (!!only || process.argv.includes('--videos') || !existsSync(join(VIDEOS, `${s.id}.vtt`))));
    if (videos.length) console.log('videos:');
    for (const v of videos) await attempt(v, () => record(browser, appUrl, v));
  } finally {
    await stopBrowser();
    // Keys sorted, so the manifest diff shows only what really changed.
    writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, 'report.md'), ['| | Shot | Title |', '|---|---|---|', ...report.filter((r) => !r.startsWith('|  |'))].join('\n') + '\n');
    await stack?.stop();
  }
  if (failed.length) {
    console.error(`\n${failed.length} scenario(s) failed:\n${failed.join('\n')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
