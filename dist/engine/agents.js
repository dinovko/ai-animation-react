/** Restrained, design-tool-like colours (600 shades keep the white label readable). */
export const AGENTS = {
    alpha: { id: "alpha", name: "Alpha", color: "#2563EB", role: "Main architecture" },
    beta: { id: "beta", name: "Beta", color: "#7C3AED", role: "Backend & services" },
    gamma: { id: "gamma", name: "Gamma", color: "#0891B2", role: "Data & infrastructure" },
    delta: { id: "delta", name: "Delta", color: "#EA580C", role: "Supporting components" },
};
export const AGENT_LIST = Object.values(AGENTS);
export const getAgent = (id) => AGENTS[id] ?? AGENTS.alpha;
const NAMES = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"];
/** 600-level hues. Red is left out on purpose: it is reserved for flagged frames. */
const PALETTE = ["#2563EB", "#7C3AED", "#0891B2", "#EA580C", "#16A34A", "#DB2777", "#CA8A04", "#4F46E5", "#0D9488", "#9333EA", "#0284C7", "#65A30D", "#C026D3", "#0E7490"];
/** A pool of `n` presentation agents (colour + name). The first four are Alpha..Delta. */
export function makeAgents(n) {
    const count = Math.max(1, Math.floor(n));
    return Array.from({ length: count }, (_, i) => {
        const base = AGENT_LIST[i];
        if (base)
            return base;
        const color = PALETTE[i % PALETTE.length];
        const shade = i >= PALETTE.length ? ` ${Math.floor(i / PALETTE.length) + 1}` : "";
        const name = (NAMES[i % NAMES.length] ?? `Agent ${i + 1}`) + (i >= NAMES.length ? shade : "");
        return { id: `agent-${i + 1}`, name, color, role: "Layer scanner" };
    });
}
//# sourceMappingURL=agents.js.map