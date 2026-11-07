/** Restrained, design-tool-like colours (600 shades keep the white label readable). */
export const AGENTS = {
    alpha: { id: "alpha", name: "Alpha", color: "#2563EB", role: "Main architecture" },
    beta: { id: "beta", name: "Beta", color: "#7C3AED", role: "Backend & services" },
    gamma: { id: "gamma", name: "Gamma", color: "#0891B2", role: "Data & infrastructure" },
    delta: { id: "delta", name: "Delta", color: "#EA580C", role: "Supporting components" },
};
export const AGENT_LIST = Object.values(AGENTS);
export const getAgent = (id) => AGENTS[id] ?? AGENTS.alpha;
//# sourceMappingURL=agents.js.map