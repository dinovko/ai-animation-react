const KEY = "agentReveal.disabled";
const listeners = new Set();
const played = new Set();
const queues = new Map();
let epoch = 0;
let mode = "auto";
let disabled = readDisabled();
let controls = { mode, disabled };
let agents = {};
function readDisabled() {
    try {
        return localStorage.getItem(KEY) === "1";
    }
    catch {
        return false;
    }
}
const emit = () => listeners.forEach((l) => l());
const idle = () => ({ status: "idle", progress: 0, target: null, queued: 0, done: 0 });
const statusOf = (a) => (a.status === "working" ? "working" : a.queued > 0 ? "waiting" : a.done > 0 ? "done" : "idle");
function patch(id, fn) {
    const cur = agents[id] ?? idle();
    const next = fn(cur);
    if (Object.keys(next).length === 0)
        return; // nothing changed: don't wake subscribers every frame
    agents = { ...agents, [id]: { ...cur, ...next } };
    emit();
}
export const prefersReducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const revealStore = {
    subscribe(l) { listeners.add(l); return () => { listeners.delete(l); }; },
    getEpoch: () => epoch,
    getControls: () => controls,
    getAgents: () => agents,
    /** Should this item animate right now? (respects dev switches, reduced motion and `once`) */
    shouldAnimate(id, once, localDisabled) {
        if (localDisabled || disabled || mode === "static" || prefersReducedMotion())
            return false;
        return !(once && id && played.has(id));
    },
    markPlayed(id) { played.add(id); },
    /** Play again from scratch. */
    replay() {
        mode = "auto";
        played.clear();
        queues.clear();
        agents = {};
        controls = { mode, disabled };
        epoch++;
        emit();
    },
    /** Show everything immediately, no animation. */
    reset() {
        mode = "static";
        queues.clear();
        agents = {};
        controls = { mode, disabled };
        epoch++;
        emit();
    },
    setDisabled(v) {
        disabled = v;
        try {
            localStorage.setItem(KEY, v ? "1" : "0");
        }
        catch { /* storage unavailable */ }
        controls = { mode, disabled };
        epoch++;
        emit();
    },
    /** One agent works on one item at a time: resolves with a release function when it is this item's turn. */
    acquire(agent) {
        const prev = queues.get(agent) ?? Promise.resolve();
        let release;
        const mine = new Promise((r) => { release = r; });
        queues.set(agent, prev.then(() => mine));
        return prev.then(() => release);
    },
    /** Lifecycle bookkeeping of one item for the agent status panel. */
    track(agent) {
        let stage = "idle";
        return {
            queue() { if (stage !== "idle")
                return; stage = "queued"; patch(agent, (a) => { const n = { ...a, queued: a.queued + 1 }; return { queued: n.queued, status: statusOf(n) }; }); },
            start(target) { if (stage !== "queued")
                return; stage = "working"; patch(agent, (a) => ({ queued: a.queued - 1, status: "working", progress: 0, target })); },
            progress(p) { if (stage !== "working")
                return; const r = Math.round(p * 20) / 20; patch(agent, (a) => (a.progress === r ? {} : { progress: r })); },
            finish() { if (stage !== "working")
                return; stage = "end"; patch(agent, (a) => { const n = { ...a, status: "idle", done: a.done + 1 }; return { done: n.done, status: statusOf(n), progress: 1, target: null }; }); },
            cancel() {
                const was = stage;
                if (was === "idle" || was === "end")
                    return;
                stage = "end";
                patch(agent, (a) => { const n = { ...a, status: "idle", queued: was === "queued" ? a.queued - 1 : a.queued }; return { queued: n.queued, status: statusOf(n), target: null }; });
            },
        };
    },
};
//# sourceMappingURL=store.js.map