import type { AgentState } from "../types";
/**
 * Page-wide controller (module singleton, no provider needed): replay epoch, dev switches,
 * "already played" memory, per-agent queues and per-agent status for the dev panel.
 */
type Listener = () => void;
type Mode = "auto" | "static";
export declare const prefersReducedMotion: () => boolean;
export declare const revealStore: {
    subscribe(l: Listener): () => void;
    getEpoch: () => number;
    getControls: () => {
        mode: Mode;
        disabled: boolean;
    };
    getAgents: () => Record<string, AgentState>;
    /** Should this item animate right now? (respects dev switches, reduced motion and `once`) */
    shouldAnimate(id: string | undefined, once: boolean, localDisabled: boolean): boolean;
    markPlayed(id: string): void;
    /** Play again from scratch. */
    replay(): void;
    /** Show everything immediately, no animation. */
    reset(): void;
    setDisabled(v: boolean): void;
    /** One agent works on one item at a time: resolves with a release function when it is this item's turn. */
    acquire(agent: string): Promise<() => void>;
    /** Lifecycle bookkeeping of one item for the agent status panel. */
    track(agent: string): {
        queue(): void;
        start(target: string): void;
        progress(p: number): void;
        finish(): void;
        cancel(): void;
    };
};
export {};
//# sourceMappingURL=store.d.ts.map