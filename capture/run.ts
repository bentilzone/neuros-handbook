// yarn capture [--persona distributor] [--only distributor/ledger] [--app http://localhost:5176]
//
// Starts a throwaway seeded Neuros (stack.ts) unless --app points at one already running, signs in
// as each persona, and writes every scenario's PNG to static/shots/<id>.png and its callouts to
// src/data/shots.json; videos go to static/video. Changed shots are listed in capture/.out/report.md.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { chromium, type BrowserContext, type Page } from 'playwright';
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
const STILL = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}`;

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

async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.addStyleTag({ content: STILL });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

function changed(file: string, next: Buffer): 'new' | 'changed' | 'same' {
  if (!existsSync(file)) return 'new';
  const a = PNG.sync.read(readFileSync(file));
  const b = PNG.sync.read(next);
  if (a.width !== b.width || a.height !== b.height) return 'changed';
  const diff = pixelmatch(a.data, b.data, undefined, a.width, a.height, { threshold: 0.1 });
  return diff > a.width * a.height * 0.0005 ? 'changed' : 'same';
}

async function shoot(ctx: BrowserContext, appUrl: string, s: Shot, manifest: Record<string, unknown>, report: string[]) {
  const page = await ctx.newPage();
  try {
    await page.goto(appUrl + s.path);
    await settle(page);
    if (s.steps) await s.steps(page);
    await settle(page);
    if (s.callouts?.length) await drawCallouts(page, s.callouts);
    const png = await page.screenshot({ fullPage: !!s.fullPage });
    const file = join(SHOTS, `${s.id}.png`);
    mkdirSync(dirname(file), { recursive: true });
    const state = changed(file, png);
    if (state !== 'same') writeFileSync(file, png);
    const { width, height } = PNG.sync.read(png);
    manifest[s.id] = { file: `${s.id}.png`, width, height, title: s.title, callouts: (s.callouts ?? []).map(({ n, text }) => ({ n, text })) };
    report.push(`| ${state === 'same' ? '' : state === 'new' ? '🆕' : '✏️'} | \`${s.id}\` | ${s.title} |`);
    console.log(`  ${state.padEnd(7)} ${s.id}`);
  } finally {
    await page.close();
  }
}

const vttTime = (ms: number) => new Date(ms).toISOString().slice(11, 23);

async function record(browser: import('playwright').Browser, appUrl: string, v: Video) {
  const dir = join(OUT, 'video', v.id);
  rmSync(dir, { recursive: true, force: true });
  const ctx = await signedIn(browser, appUrl, v.persona, { recordVideo: { dir, size: VIEWPORT } });
  const page = await ctx.newPage();
  const start = Date.now();
  const cues: { at: number; text: string }[] = [];
  const say = async (text: string) => { cues.push({ at: Date.now() - start, text }); await page.waitForTimeout(900); };
  await page.goto(appUrl + v.path);
  await settle(page);
  await v.steps(page, say);
  await page.waitForTimeout(1200);
  const end = Date.now() - start;
  const raw = await page.video()!.path();
  await ctx.close();
  mkdirSync(VIDEOS, { recursive: true });
  const vtt = ['WEBVTT', '', ...cues.flatMap((c, i) => [`${vttTime(c.at)} --> ${vttTime(cues[i + 1]?.at ?? end)}`, c.text, ''])].join('\n');
  writeFileSync(join(VIDEOS, `${v.id}.vtt`), vtt);
  // MP4 plays everywhere; without ffmpeg (local machines) the WebM Playwright recorded is kept.
  const ffmpeg = spawnSync('ffmpeg', ['-version']).status === 0;
  if (ffmpeg) {
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-crf', '28', join(VIDEOS, `${v.id}.mp4`)]);
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1', '-i', raw, '-frames:v', '1', join(VIDEOS, `${v.id}.jpg`)]);
  } else {
    copyFileSync(raw, join(VIDEOS, `${v.id}.webm`));
  }
  console.log(`  video   ${v.id}${ffmpeg ? '' : ' (webm: install ffmpeg for mp4)'}`);
}

async function main() {
  const persona = arg('persona') as Persona | undefined;
  const only = arg('only');
  const scenarios = (await loadScenarios()).filter((s) => (!persona || s.persona === persona) && (!only || s.id.startsWith(only)));
  if (!scenarios.length) throw new Error('No scenario matches');

  let stack: Stack | null = null;
  const appUrl = arg('app') ?? (stack = await startStack()).appUrl;
  const browser = await chromium.launch();
  const manifest: Record<string, unknown> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  const report: string[] = [];
  const failed: string[] = [];
  try {
    const byPersona = new Map<Persona, Scenario[]>();
    for (const s of scenarios) byPersona.set(s.persona, [...(byPersona.get(s.persona) ?? []), s]);
    for (const [who, list] of byPersona) {
      console.log(`${who}:`);
      const ctx = await signedIn(browser, appUrl, who);
      for (const s of list) {
        try {
          if (s.kind === 'video') await record(browser, appUrl, s);
          else await shoot(ctx, appUrl, s, manifest, report);
        } catch (err) {
          // One broken scenario (a renamed button) must not cost the rest of the run.
          failed.push(`${s.id}: ${(err as Error).message.split('\n')[0]}`);
          console.log(`  FAILED  ${s.id}`);
        }
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
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
