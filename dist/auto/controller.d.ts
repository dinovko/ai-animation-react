import type { AgentDef, LabelMode } from "../types";
export declare const SPEEDS: readonly [0.5, 1, 2, 4];
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
/**
 * Runs one automatic scan: discovers the layers under a root, hides them, and lets a pool of agents draw them.
 * A layer starts only after its parent layer is done. The whole thing is cancellable and restores the DOM.
 */
export declare class AutoController {
    private listeners;
    private snap;
    private cancelFn;
    private last;
    private speedNow;
    subscribe: (l: () => void) => () => void;
    getSnapshot: () => AutoSnapshot;
    private set;
    setSpeed(v: number): void;
    cycleSpeed(): void;
    closeHud(): void;
    openHud(): void;
    /** The "Tour" button: draw the same root again from scratch. */
    replay(): void;
    stop(): void;
    start(root: HTMLElement, opts: AutoOptions): void;
}
//# sourceMappingURL=controller.d.ts.map