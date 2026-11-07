export type Pt = [number, number];
export interface Box { left: number; top: number; width: number; height: number }

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Viewport rectangle that bounds the real content of `el` (its element children), so margins don't inflate the frame. */
export function contentBox(el: HTMLElement): Box | null {
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  for (const c of Array.from(el.children)) {
    const q = c.getBoundingClientRect();
    if (q.width === 0 && q.height === 0) continue;
    l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom);
  }
  return Number.isFinite(l) ? { left: l, top: t, width: r - l, height: b - t } : null;
}

/** Sutherland–Hodgman clip of a polygon against one half-plane: keeps points where f(p) <= 0. */
export function clipHalfPlane(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const fa = f(a), fb = f(b);
    if (fa <= 0) out.push(a);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
