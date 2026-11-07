import type { AgentDef, CursorKind, GhostKind, LabelMode, RevealKind } from "../types";
import type { Box } from "../engine/geometry";
import { EMPTY_CLIP } from "../engine/presets";
import { runReveal, type RunHandle } from "../engine/runReveal";
import { discoverLayers, type Layer, type LayerKind } from "./discover";

export const SPEEDS = [0.5, 1, 2, 4] as const;

export interface AutoSnapshot {
  agents: number;
  total: number;
  done: number;
  running: number;
  speed: number;
  finished: boolean;
  hudOpen: boolean;
}

export interface AutoOptions {
  agents: AgentDef[];
  duration: number;
  labels: LabelMode;
  cursors: boolean;
  frames: boolean;
  ghosts: boolean;
  flag?: string;
  flagRate: number;
  maxLayers: number;
  viewportOnly: boolean;
  filter?: (el: Element) => boolean;
  onComplete?: () => void;
}

const KIND: Record<LayerKind, { reveal: RevealKind; cursor: CursorKind; ghost: GhostKind }> = {
  text: { reveal: "horizontal", cursor: "text", ghost: "gray" },
  media: { reveal: "rectangle", cursor: "cross", ghost: "gray" },
  control: { reveal: "diagonal", cursor: "arrow", ghost: "accent" },
  box: { reveal: "diagonal", cursor: "arrow", ghost: "none" },
};

const durationOf = (l: Layer): number => {
  if (l.kind === "text") return 220 + Math.min(l.width, 400) * 0.6;
  if (l.kind === "box") return 380 + Math.min(l.width, 900) * 0.25;
  return 380;
};
/** Deterministic pseudo-random in [0, 1) so a replay flags the same layers. */
const rnd = (i: number) => (((i + 1) * 2654435761) >>> 0) % 1000 / 1000;
const measure = (el: Element): Box | null => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
};

/**
 * Runs one automatic scan: discovers the layers under a root, hides them, and lets a pool of agents draw them.
 * A layer starts only after its parent layer is done. The whole thing is cancellable and restores the DOM.
 */
export class AutoController {
  private listeners = new Set<() => void>();
  private snap: AutoSnapshot = { agents: 0, total: 0, done: 0, running: 0, speed: 1, finished: false, hudOpen: true };
  private cancelFn: (() => void) | null = null;
  private last: { root: HTMLElement; opts: AutoOptions } | null = null;
  private speedNow = 1;

  subscribe = (l: () => void) => { this.listeners.add(l); return () => { this.listeners.delete(l); }; };
  getSnapshot = () => this.snap;
  private set(p: Partial<AutoSnapshot>) { this.snap = { ...this.snap, ...p }; this.listeners.forEach((l) => l()); }

  setSpeed(v: number) { this.speedNow = v; this.set({ speed: v }); }
  cycleSpeed() { const i = SPEEDS.indexOf(this.speedNow as (typeof SPEEDS)[number]); this.setSpeed(SPEEDS[(i + 1) % SPEEDS.length]); }
  closeHud() { this.set({ hudOpen: false }); }
  openHud() { this.set({ hudOpen: true }); }
  /** The "Tour" button: draw the same root again from scratch. */
  replay() { if (this.last) this.start(this.last.root, this.last.opts); }

  stop() { this.cancelFn?.(); this.cancelFn = null; }

  start(root: HTMLElement, opts: AutoOptions) {
    this.stop();
    this.last = { root, opts };
    const layers = discoverLayers(root, { maxLayers: opts.maxLayers, viewportOnly: false, filter: opts.filter });
    const n = layers.length;
    const saved = layers.map((l) => l.el.style.clipPath);
    layers.forEach((l) => { l.el.style.clipPath = EMPTY_CLIP; (l.el as HTMLElement).inert = true; });

    const state = new Uint8Array(n); // 0 pending, 1 running, 2 done
    const idle = opts.agents.map((_, i) => i).reverse();
    const handles = new Map<number, RunHandle>();
    const timers = new Set<number>();
    let done = 0, running = 0, head = 0, wave = 0, over = false;
    this.set({ agents: opts.agents.length, total: n, done: 0, running: 0, finished: n === 0 });

    // Layers below the fold stay hidden (and wait) until they scroll into view. With viewportOnly off all start at once.
    const inView = new Uint8Array(n).fill(opts.viewportOnly ? 0 : 1);
    let io: IntersectionObserver | null = null;

    const restore = () => {
      layers.forEach((l, i) => { l.el.style.clipPath = saved[i]; (l.el as HTMLElement).inert = false; });
    };
    const cancel = () => {
      if (over) return;
      over = true;
      io?.disconnect();
      timers.forEach(clearTimeout);
      handles.forEach((h) => h.cancel());
      restore();
    };
    this.cancelFn = cancel;
    if (n === 0) { opts.onComplete?.(); return; }

    const launch = (i: number, agentIdx: number, delay: number) => {
      const l = layers[i];
      const k = KIND[l.kind];
      const flagged = (opts.flag ? l.el.matches(opts.flag) : false) || rnd(i) < opts.flagRate;
      const begin = () => {
        timers.delete(t);
        if (over) return;
        const h = runReveal({
          el: l.el, agent: opts.agents[agentIdx], kind: k.reveal, duration: durationOf(l) * opts.duration,
          cursor: opts.cursors, frame: opts.frames, measure, speed: () => this.speedNow,
          visual: { cursorKind: k.cursor, labels: opts.labels, ghost: opts.ghosts ? k.ghost : "none", flag: flagged },
        });
        handles.set(i, h);
        void h.done.then(() => {
          if (over) return;
          handles.delete(i);
          l.el.style.clipPath = saved[i];
          (l.el as HTMLElement).inert = false;
          state[i] = 2; done++; running--; idle.push(agentIdx);
          this.set({ done, running });
          pump();
        });
      };
      const t = window.setTimeout(begin, delay);
      timers.add(t);
    };

    const pump = () => {
      if (over) return;
      while (idle.length) {
        while (head < n && state[head] !== 0) head++;
        let pick = -1;
        for (let i = head; i < n; i++) {
          if (state[i] === 0 && inView[i] === 1 && (layers[i].parent < 0 || state[layers[i].parent] === 2)) { pick = i; break; }
        }
        if (pick < 0) break;
        state[pick] = 1; running++;
        launch(pick, idle.pop() as number, wave < opts.agents.length ? wave++ * 45 : 0); // the first wave sets off one by one
        this.set({ running });
      }
      if (done === n) {
        io?.disconnect();
        this.cancelFn = null;
        over = true;
        this.set({ finished: true, running: 0 });
        opts.onComplete?.();
      }
    };
    if (opts.viewportOnly) {
      const at = new Map<Element, number>(layers.map((l, i) => [l.el, i]));
      io = new IntersectionObserver((entries) => {
        let changed = false;
        for (const e of entries) {
          const i = at.get(e.target);
          if (i !== undefined && e.isIntersecting && inView[i] === 0) { inView[i] = 1; changed = true; }
        }
        if (changed) pump();
      }, { rootMargin: "0px 0px -8% 0px" });
      layers.forEach((l) => io?.observe(l.el));
    } else pump();
  }
}
