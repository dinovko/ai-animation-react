import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSyncExternalStore } from "react";
import { AGENT_LIST } from "../engine/agents";
import { revealStore } from "../engine/store";
import "../styles/agent-reveal.css";
/** Development build (Vite `import.meta.env.DEV` or `NODE_ENV=development`), or any build when the URL contains `?agents` (also after `#` for hash routers). */
export function isRevealDevMode() {
    if (typeof location !== "undefined" && /[?&]agents\b/.test(location.search + location.hash))
        return true;
    const env = import.meta.env;
    if (env?.DEV === true || env?.MODE === "development")
        return true;
    const nodeEnv = globalThis.process?.env?.NODE_ENV;
    return nodeEnv === "development";
}
export function RevealControls() {
    const agents = useSyncExternalStore(revealStore.subscribe, revealStore.getAgents);
    const c = useSyncExternalStore(revealStore.subscribe, revealStore.getControls);
    if (!isRevealDevMode())
        return null;
    return (_jsxs("div", { className: "ar-dev", role: "group", "aria-label": "Agent reveal (developer)", children: [_jsx("div", { className: "ar-dev-rows", children: AGENT_LIST.map((a) => {
                    const s = agents[a.id];
                    const text = s ? `${s.status}${s.status === "working" ? ` ${Math.round(s.progress * 100)}%` : ""}` : "idle";
                    return (_jsxs("span", { className: "ar-dev-agent", style: { ["--c"]: a.color }, title: a.role, children: [_jsx("i", {}), a.name, _jsx("em", { children: text })] }, a.id));
                }) }), _jsxs("div", { className: "ar-dev-btns", children: [_jsx("button", { type: "button", onClick: revealStore.replay, disabled: c.disabled, children: c.mode === "static" ? "Play" : "Replay" }), _jsx("button", { type: "button", onClick: revealStore.reset, children: "Reset" }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: c.disabled, onChange: (e) => revealStore.setDisabled(e.target.checked) }), " Off"] })] })] }));
}
//# sourceMappingURL=RevealControls.js.map