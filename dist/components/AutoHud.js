import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSyncExternalStore } from "react";
import { AGENT_LIST } from "../engine/agents";
import "../styles/agent-reveal.css";
/** Bottom bar of the automatic reveal: agents, layers done / total, progress, Tour, speed, close. */
export function AutoHud({ ctrl }) {
    const s = useSyncExternalStore(ctrl.subscribe, ctrl.getSnapshot);
    if (!s.hudOpen)
        return null;
    const pct = s.total ? Math.round((s.done / s.total) * 100) : 100;
    return (_jsxs("div", { className: "ar-hud", role: "group", "aria-label": "Agent reveal", children: [_jsx("span", { className: "ar-hud-dots", "aria-hidden": "true", children: AGENT_LIST.slice(0, 5).map((a) => _jsx("i", { style: { background: a.color } }, a.id)) }), _jsxs("span", { className: "ar-hud-n", children: [_jsx("b", { children: s.agents }), " agents"] }), _jsx("span", { className: "ar-hud-sep" }), _jsxs("span", { className: "ar-hud-n", children: [_jsx("b", { children: s.done }), " / ", s.total, " layers"] }), _jsx("span", { className: "ar-hud-bar", role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100, children: _jsx("i", { style: { width: `${pct}%` } }) }), _jsx("button", { type: "button", onClick: () => ctrl.replay(), title: "Draw again", children: "Tour" }), _jsxs("button", { type: "button", onClick: () => ctrl.cycleSpeed(), title: "Playback speed", children: [s.speed, "\u00D7"] }), _jsx("button", { type: "button", className: "ar-hud-x", onClick: () => ctrl.closeHud(), "aria-label": "Close", children: "\u00D7" })] }));
}
//# sourceMappingURL=AutoHud.js.map