import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { makeAgents } from "../engine/agents";
import { revealStore } from "../engine/store";
import { AutoController } from "../auto/controller";
import { AutoHud } from "./AutoHud";
import { isRevealDevMode } from "./RevealControls";
import "../styles/agent-reveal.css";
/**
 * Reveals a whole subtree without wrapping each block. The subtree is split into layers (text, media,
 * controls, decorated boxes) and a pool of agents draws them one by one. Each layer gets its own frame,
 * size chip, cursor and placeholder; some are framed in red. The wrapper uses `display: contents`.
 */
export function AgentRevealAuto({ children, id, agents = 16, duration = 1, speed = 1, hud, labels = "size", cursors = true, frames = true, ghosts = true, flag, flagRate = 0.05, maxLayers = 500, viewportOnly = true, filter, once = true, disabled = false, className, onComplete, }) {
    const ref = useRef(null);
    const ctrl = useMemo(() => new AutoController(), []);
    const epoch = useSyncExternalStore(revealStore.subscribe, revealStore.getEpoch);
    const key = typeof agents === "number" ? String(agents) : agents.map((a) => a.id + a.color).join();
    const cb = useRef({ filter, onComplete });
    cb.current = { filter, onComplete };
    const showHud = hud ?? isRevealDevMode();
    const memoId = id ? `auto:${id}` : undefined;
    useEffect(() => { ctrl.setSpeed(speed); }, [ctrl, speed]);
    // Layout effect: the layers are hidden before the first paint, so the finished page never flashes.
    useLayoutEffect(() => {
        const root = ref.current;
        if (!root || !revealStore.shouldAnimate(memoId, once, disabled))
            return;
        const opts = {
            agents: typeof agents === "number" ? makeAgents(agents) : agents,
            duration, labels, cursors, frames, ghosts, flag, flagRate, maxLayers, viewportOnly,
            filter: (el) => cb.current.filter?.(el) ?? true,
            onComplete: () => { if (memoId)
                revealStore.markPlayed(memoId); cb.current.onComplete?.(); },
        };
        ctrl.start(root, opts);
        return () => ctrl.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctrl, epoch, memoId, key, duration, labels, cursors, frames, ghosts, flag, flagRate, maxLayers, viewportOnly, once, disabled]);
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: ref, className: `ar-auto${className ? ` ${className}` : ""}`, children: children }), showHud && !disabled ? _jsx(AutoHud, { ctrl: ctrl }) : null] }));
}
//# sourceMappingURL=AgentRevealAuto.js.map