import type { AgentDef } from "../types";
import type { Box } from "./geometry";
import type { FrameState } from "./presets";

/**
 * Visual layer for one running reveal: a Figma-style selection frame and an agent cursor.
 * Plain DOM updated from a rAF loop (transform / size only) so no React tree is created per frame.
 * Everything lives in one fixed, pointer-events:none overlay and is removed when the reveal ends.
 */
let root: HTMLDivElement | null = null;
function getRoot(): HTMLDivElement {
  if (!root || !root.isConnected) {
    root = document.createElement("div");
    root.className = "ar-overlay";
    root.setAttribute("aria-hidden", "true");
    document.body.appendChild(root);
  }
  return root;
}

const CURSOR_SVG =
  '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M2 2v13.6l3.7-3.3 2.6 5.8 2.3-1-2.5-5.7h5.1z" fill="var(--c)" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>';

export interface Visual {
  update(box: Box, f: FrameState): void;
  /** natural end: flash the highlight, fade frame + cursor, then remove */
  finish(): void;
  destroy(): void;
}

export function createVisual(agent: AgentDef, opts: { cursor: boolean; frame: boolean }): Visual {
  const wrap = document.createElement("div");
  wrap.className = "ar-agent";
  wrap.style.setProperty("--c", agent.color);
  wrap.style.visibility = "hidden"; // until the first measured frame

  let fr: HTMLDivElement | null = null;
  let dim: HTMLSpanElement | null = null;
  let cur: HTMLDivElement | null = null;

  if (opts.frame) {
    fr = document.createElement("div");
    fr.className = "ar-frame";
    fr.innerHTML = '<i class="ar-h tl"></i><i class="ar-h tr"></i><i class="ar-h bl"></i><i class="ar-h br"></i>';
    dim = document.createElement("span");
    dim.className = "ar-dim";
    fr.appendChild(dim);
    wrap.appendChild(fr);
  }
  if (opts.cursor) {
    cur = document.createElement("div");
    cur.className = "ar-cursor";
    cur.innerHTML = CURSOR_SVG;
    const tag = document.createElement("div");
    tag.className = "ar-tag";
    const dot = document.createElement("i");
    dot.className = "ar-dot";
    const name = document.createElement("span");
    name.textContent = agent.name;
    tag.append(dot, name);
    cur.appendChild(tag);
    wrap.appendChild(cur);
  }
  getRoot().appendChild(wrap);

  const timers: number[] = [];
  let lastDim = "";
  let flipped = false;

  return {
    update(box, f) {
      wrap.style.visibility = "visible";
      if (fr && dim) {
        fr.style.transform = `translate3d(${box.left}px,${box.top}px,0)`;
        fr.style.width = `${f.fw}px`;
        fr.style.height = `${f.fh}px`;
        const d = `${Math.round(f.fw)} × ${Math.round(f.fh)}`;
        if (d !== lastDim) { dim.textContent = d; lastDim = d; }
      }
      if (cur) {
        const x = box.left + f.cx, y = box.top + f.cy;
        cur.style.transform = `translate3d(${x - 2}px,${y - 2}px,0)`;
        const flip = x > window.innerWidth - 150;
        if (flip !== flipped) { flipped = flip; cur.classList.toggle("flip", flip); }
      }
    },
    finish() {
      cur?.classList.add("ar-out");
      fr?.classList.add("ar-done");
      timers.push(window.setTimeout(() => fr?.classList.add("ar-out"), 300), window.setTimeout(() => wrap.remove(), 700));
    },
    destroy() {
      timers.forEach(clearTimeout);
      wrap.remove();
    },
  };
}
