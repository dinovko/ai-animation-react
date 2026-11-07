import type { RevealKind } from "../types";
import { type Pt } from "./geometry";
export interface FrameState {
    /** selection frame size, px (frame is anchored at the component's top-left corner) */
    fw: number;
    fh: number;
    /** cursor position relative to the component's top-left, px */
    cx: number;
    cy: number;
    /** visible region, px relative to the component's top-left */
    poly: Pt[];
}
export declare const EMPTY_CLIP = "polygon(0 0,0 0,0 0)";
/** Geometry of one reveal style at eased progress p (0..1) for a component of w × h. */
export declare function frameAt(kind: RevealKind, p: number, w: number, h: number): FrameState;
export declare function toClipPath(poly: Pt[], ox: number, oy: number): string;
//# sourceMappingURL=presets.d.ts.map