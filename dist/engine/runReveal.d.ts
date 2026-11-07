import type { AgentDef, RevealKind } from "../types";
export interface RunOptions {
    el: HTMLElement;
    agent: AgentDef;
    kind: RevealKind;
    duration: number;
    cursor: boolean;
    frame: boolean;
    onProgress?: (raw: number) => void;
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