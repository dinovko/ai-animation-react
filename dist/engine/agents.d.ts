import type { AgentDef } from "../types";
/** Restrained, design-tool-like colours (600 shades keep the white label readable). */
export declare const AGENTS: Record<string, AgentDef>;
export declare const AGENT_LIST: AgentDef[];
export declare const getAgent: (id: string) => AgentDef;
/** A pool of `n` presentation agents (colour + name). The first four are Alpha..Delta. */
export declare function makeAgents(n: number): AgentDef[];
//# sourceMappingURL=agents.d.ts.map