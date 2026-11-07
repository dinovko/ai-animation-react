import { contentBox, easeInOutCubic } from "./geometry";
import { createVisual } from "./overlay";
import { EMPTY_CLIP, frameAt, toClipPath } from "./presets";
/**
 * One scan. Geometry is re-measured on every frame (getBoundingClientRect on `el` and its children, no writes
 * that affect layout in between), so scrolling, resizing and content changes are followed automatically.
 * The component itself is only clipped (clip-path): its layout, size and event handling are untouched.
 */
export function runReveal(o) {
    const { el } = o;
    const visual = createVisual(o.agent, { cursor: o.cursor, frame: o.frame });
    let raf = 0, t0 = 0, over = false;
    let resolve;
    const done = new Promise((r) => { resolve = r; });
    el.style.clipPath = EMPTY_CLIP;
    const end = (natural) => {
        if (over)
            return;
        over = true;
        cancelAnimationFrame(raf);
        el.style.clipPath = "";
        if (natural)
            visual.finish();
        else
            visual.destroy();
        resolve();
    };
    const tick = (now) => {
        if (over)
            return;
        if (!t0)
            t0 = now;
        const raw = Math.min(1, (now - t0) / Math.max(1, o.duration));
        const box = contentBox(el);
        if (box) {
            const wr = el.getBoundingClientRect();
            const f = frameAt(o.kind, easeInOutCubic(raw), box.width, box.height);
            el.style.clipPath = raw >= 1 ? "" : toClipPath(f.poly, box.left - wr.left, box.top - wr.top);
            visual.update(box, f);
        }
        o.onProgress?.(raw);
        if (raw < 1)
            raf = requestAnimationFrame(tick);
        else
            end(true);
    };
    raf = requestAnimationFrame(tick);
    return { done, cancel: () => end(false) };
}
//# sourceMappingURL=runReveal.js.map