import type { AgentDef } from "../types";
import type { Box } from "./geometry";
import type { FrameState } from "./presets";
export interface Visual {
    update(box: Box, f: FrameState): void;
    /** natural end: flash the highlight, fade frame + cursor, then remove */
    finish(): void;
    destroy(): void;
}
export declare function createVisual(agent: AgentDef, opts: {
    cursor: boolean;
    frame: boolean;
}): Visual;
//# sourceMappingURL=overlay.d.ts.map