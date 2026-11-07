import type { AgentDef, RevealKind } from "../types";
import { contentBox, easeInOutCubic, type Box } from "./geometry";
import { createVisual, type VisualOptions } from "./overlay";
import { EMPTY_CLIP, frameAt, toClipPath } from "./presets";

export interface RunOptions {
  el: HTMLElement | SVGElement;
  agent: AgentDef;
  kind: RevealKind;
  duration: number;
  cursor: boolean;
  frame: boolean;
  onProgress?: (raw: number) => void;
  /** Box to scan. Default: the union of the element's children (`contentBox`). */
  measure?: (el: HTMLElement | SVGElement) => Box | null;
  /** Live playback rate, read every frame. Default 1. */
  speed?: () => number;
  /** Extra visual options (cursor shape, labels, placeholder, flag). */
  visual?: Partial<Omit<VisualOptions, "cursor" | "frame">>;
}
export interface RunHandle {
  /** resolves when the scan ends (naturally or cancelled) and the clip is removed */
  done: Promise<void>;
  cancel: () => void;
}

/**
 * One scan. Geometry is re-measured on every frame (getBoundingClientRect on `el` and its children, no writes
 * that affect layout in between), so scrolling, resizing and content changes are followed automatically.
 * The component itself is only clipped (clip-path): its layout, size and event handling are untouched.
 */
export function runReveal(o: RunOptions): RunHandle {
  const { el } = o;
  const visual = createVisual(o.agent, { ...o.visual, cursor: o.cursor, frame: o.frame });
  let raf = 0, last = 0, elapsed = 0, over = false;
  let resolve!: () => void;
  const done = new Promise<void>((r) => { resolve = r; });

  el.style.clipPath = EMPTY_CLIP;

  const end = (natural: boolean) => {
    if (over) return;
    over = true;
    cancelAnimationFrame(raf);
    el.style.clipPath = "";
    if (natural) visual.finish(); else visual.destroy();
    resolve();
  };

  const tick = (now: number) => {
    if (over) return;
    if (!last) last = now;
    elapsed += (now - last) * (o.speed?.() ?? 1);
    last = now;
    const raw = Math.min(1, elapsed / Math.max(1, o.duration));
    const box = (o.measure ?? contentBox)(el as HTMLElement);
    if (box) {
      const wr = el.getBoundingClientRect();
      const p = easeInOutCubic(raw);
      const f = frameAt(o.kind, p, box.width, box.height);
      el.style.clipPath = raw >= 1 ? "" : toClipPath(f.poly, box.left - wr.left, box.top - wr.top);
      visual.update(box, f, p);
    }
    o.onProgress?.(raw);
    if (raw < 1) raf = requestAnimationFrame(tick); else end(true);
  };
  raf = requestAnimationFrame(tick);

  return { done, cancel: () => end(false) };
}
