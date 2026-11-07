import { clipHalfPlane } from "./geometry";
export const EMPTY_CLIP = "polygon(0 0,0 0,0 0)";
const rect = (a, b) => [[0, 0], [a, 0], [a, b], [0, b]];
/** Geometry of one reveal style at eased progress p (0..1) for a component of w × h. */
export function frameAt(kind, p, w, h) {
    w = Math.max(w, 1);
    h = Math.max(h, 1);
    switch (kind) {
        case "horizontal": {
            const fw = w * p;
            return { fw, fh: h, cx: fw, cy: h / 2, poly: rect(fw, h) };
        }
        case "vertical": {
            const fh = h * p;
            return { fw: w, fh, cx: w / 2, cy: fh, poly: rect(w, fh) };
        }
        case "rectangle": {
            const fw = w * p, fh = h * p;
            return { fw, fh, cx: fw, cy: fh, poly: rect(fw, fh) };
        }
        default: {
            // Diagonal scan: the cursor drags the frame corner along the diagonal; the revealed area is that
            // rectangle with its leading corner cut by a boundary perpendicular to the diagonal, trailing the cursor.
            const fw = w * p, fh = h * p;
            const T = 2 * p - 0.22 * (1 - p);
            return { fw, fh, cx: fw, cy: fh, poly: clipHalfPlane(rect(fw, fh), ([x, y]) => x / w + y / h - T) };
        }
    }
}
export function toClipPath(poly, ox, oy) {
    if (poly.length < 3)
        return EMPTY_CLIP;
    return `polygon(${poly.map(([x, y]) => `${(x + ox).toFixed(2)}px ${(y + oy).toFixed(2)}px`).join(",")})`;
}
//# sourceMappingURL=presets.js.map