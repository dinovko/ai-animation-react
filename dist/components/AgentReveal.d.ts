import type { AgentRevealProps } from "../types";
/**
 * Wraps an existing component and reveals it as if an AI agent were discovering it:
 * the agent cursor drags a selection frame from the top-left corner to the bottom-right one while the
 * component is uncovered behind the scan boundary (clip-path). Geometry is detected, never specified.
 * The wrapper adds no styling of its own; afterwards it is a plain block with no clip and no inert state.
 */
export declare function AgentReveal({ children, id, agent, reveal, duration, delay, disabled, cursor, frame, once, className, onStart, onComplete, }: AgentRevealProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AgentReveal.d.ts.map