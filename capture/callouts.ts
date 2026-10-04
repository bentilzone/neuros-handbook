// Numbered arrows drawn on the live page just before the screenshot, so they follow the UI
// wherever it moves. Targets are found by role, label or text — never by CSS class.
import type { Locator, Page } from 'playwright';

export type Target =
  | { role: Parameters<Page['getByRole']>[0]; name?: string | RegExp; nth?: number }
  | { label: string | RegExp; nth?: number }
  | { text: string | RegExp; nth?: number }
  | { css: string; nth?: number }; // last resort, for a region with no accessible name

export interface Callout {
  n: number;
  target: Target;
  /** The legend under the screenshot. Written for the reader, not the tester. */
  text: string;
  /** Where the numbered badge sits relative to the target. Default: the side with more room. */
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function locate(page: Page, t: Target): Locator {
  const l = 'role' in t ? page.getByRole(t.role, t.name !== undefined ? { name: t.name } : {})
    : 'label' in t ? page.getByLabel(t.label)
    : 'text' in t ? page.getByText(t.text)
    : page.locator(t.css);
  return l.nth(t.nth ?? 0);
}

export async function drawCallouts(page: Page, callouts: Callout[]) {
  const items = [];
  for (const c of callouts) {
    const el = locate(page, c.target);
    await el.waitFor({ state: 'visible', timeout: 15_000 });
    await el.scrollIntoViewIfNeeded();
    const box = await el.boundingBox();
    if (!box) throw new Error(`Callout ${c.n}: target has no box`);
    items.push({ n: c.n, side: c.side ?? null, box });
  }
  await page.evaluate(({ items, colour }) => {
    document.getElementById('nh-callouts')?.remove();
    const W = window.innerWidth;
    const H = window.innerHeight;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.id = 'nh-callouts';
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    svg.setAttribute('style', 'position:fixed;inset:0;pointer-events:none;z-index:2147483647');
    svg.innerHTML = `<defs><marker id="nh-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${colour}"/></marker></defs>`;
    const R = 13;
    const GAP = 54;
    for (const { n, side, box } of items) {
      const pad = 4;
      const x = box.x - pad, y = box.y - pad, w = box.width + pad * 2, h = box.height + pad * 2;
      const room = { left: x, right: W - (x + w), top: y, bottom: H - (y + h) };
      const s = side ?? (Object.entries(room).sort((a, b) => b[1] - a[1])[0][0] as keyof typeof room);
      // Kept inside the viewport whichever side was asked for. (No helper functions in here: the
      // bundler names them with a __name() call that does not exist in the page.)
      const cx = Math.min(Math.max(s === 'left' ? x - GAP : s === 'right' ? x + w + GAP : x + w / 2, R + 4), W - R - 4);
      const cy = Math.min(Math.max(s === 'top' ? y - GAP : s === 'bottom' ? y + h + GAP : y + h / 2, R + 4), H - R - 4);
      // The arrow runs from the badge's edge to the outline's nearest edge.
      const ex = s === 'left' ? x : s === 'right' ? x + w : cx;
      const ey = s === 'top' ? y : s === 'bottom' ? y + h : cy;
      const len = Math.hypot(ex - cx, ey - cy) || 1;
      const sx = cx + ((ex - cx) / len) * (R + 2);
      const sy = cy + ((ey - cy) / len) * (R + 2);
      svg.insertAdjacentHTML('beforeend', `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="none" stroke="${colour}" stroke-width="2.5"/>
        <line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${colour}" stroke-width="2.5" marker-end="url(#nh-head)"/>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="${colour}" stroke="#fff" stroke-width="2"/>
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#fff">${n}</text>`);
    }
    document.body.appendChild(svg);
  }, { items, colour: '#e8590c' });
}
