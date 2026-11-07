import type { AgentDef, CursorKind, GhostKind, LabelMode } from "../types";
import type { Box } from "./geometry";
import type { FrameState } from "./presets";
export interface VisualOptions {
    cursor: boolean;
    frame: boolean;
    /** cursor shape, default "arrow" */
    cursorKind?: CursorKind;
    /** default "both" (name tag on the cursor and size chip on the frame) */
    labels?: LabelMode;
    /** placeholder fill that fades out as the layer is drawn */
    ghost?: GhostKind;
    /** red frame instead of the agent colour */
    flag?: boolean;
}
export interface Visual {
    update(box: Box, f: FrameState, p?: number): void;
    /** natural end: flash the highlight, fade frame + cursor, then remove */
    finish(): void;
    destroy(): void;
}
export declare function createVisual(agent: AgentDef, opts: VisualOptions): Visual;
//# sourceMappingURL=overlay.d.ts.map