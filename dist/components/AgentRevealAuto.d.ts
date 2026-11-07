import type { AgentRevealAutoProps } from "../types";
/**
 * Reveals a whole subtree without wrapping each block. The subtree is split into layers (text, media,
 * controls, decorated boxes) and a pool of agents draws them one by one. Each layer gets its own frame,
 * size chip, cursor and placeholder; some are framed in red. The wrapper uses `display: contents`.
 */
export declare function AgentRevealAuto({ children, id, agents, duration, speed, hud, labels, cursors, frames, ghosts, flag, flagRate, maxLayers, viewportOnly, filter, once, disabled, className, onComplete, }: AgentRevealAutoProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AgentRevealAuto.d.ts.map