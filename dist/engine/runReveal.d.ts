import type { AgentDef, RevealKind } from "../types";
import { type Box } from "./geometry";
import { type VisualOptions } from "./overlay";
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
export declare function runReveal(o: RunOptions): RunHandle;
//# sourceMappingURL=runReveal.d.ts.map