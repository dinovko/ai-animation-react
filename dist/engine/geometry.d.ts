export type Pt = [number, number];
export interface Box {
    left: number;
    top: number;
    width: number;
    height: number;
}
export declare const easeInOutCubic: (t: number) => number;
/** Viewport rectangle that bounds the real content of `el` (its element children), so margins don't inflate the frame. */
export declare function contentBox(el: HTMLElement): Box | null;
/** Sutherland–Hodgman clip of a polygon against one half-plane: keeps points where f(p) <= 0. */
export declare function clipHalfPlane(poly: Pt[], f: (p: Pt) => number): Pt[];
//# sourceMappingURL=geometry.d.ts.map