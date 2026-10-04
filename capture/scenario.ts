// A screenshot or a video, described once: who, where, what to do first, and what to point at.
import type { Page } from 'playwright';
import type { Callout } from './callouts';
import type { Persona } from './personas';

export interface Shot {
  kind?: 'shot';
  /** `persona/page/state` — the key pages use in <Shot id="…" />. */
  id: string;
  persona: Persona;
  /** App path, query included (`/ledger?tab=periods`). */
  path: string;
  /** Alt text when the page gives no caption. */
  title: string;
  /** Open a drawer, fill a form, pick a tab… before the picture. */
  steps?: (page: Page) => Promise<void>;
  callouts?: Callout[];
  /** Grow the picture to the page's full height (long settings pages). */
  fullPage?: boolean;
}

export interface Video {
  kind: 'video';
  /** File name under static/video (`.mp4`, `.webm`, `.vtt`, `.jpg`). */
  id: string;
  persona: Persona;
  path: string;
  title: string;
  /** The flow. `say` adds a caption from that moment until the next one. */
  steps: (page: Page, say: (text: string) => Promise<void>) => Promise<void>;
}

export type Scenario = Shot | Video;
