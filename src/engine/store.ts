import type { AgentState, AgentStatus } from "../types";

/**
 * Page-wide controller (module singleton, no provider needed): replay epoch, dev switches,
 * "already played" memory, per-agent queues and per-agent status for the dev panel.
 */
type Listener = () => void;
const KEY = "agentReveal.disabled";

const listeners = new Set<Listener>();
const played = new Set<string>();
const queues = new Map<string, Promise<void>>();

let epoch = 0;
type Mode = "auto" | "static";
let mode = "auto" as Mode;
let disabled = readDisabled();
let controls = { mode, disabled };
let agents: Record<string, AgentState> = {};

function readDisabled(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
const emit = () => listeners.forEach((l) => l());
const idle = (): AgentState => ({ status: "idle", progress: 0, target: null, queued: 0, done: 0 });
const statusOf = (a: AgentState): AgentStatus => (a.status === "working" ? "working" : a.queued > 0 ? "waiting" : a.done > 0 ? "done" : "idle");

function patch(id: string, fn: (a: AgentState) => Partial<AgentState>) {
  const cur = agents[id] ?? idle();
  const next = fn(cur);
  if (Object.keys(next).length === 0) return; // nothing changed: don't wake subscribers every frame
  agents = { ...agents, [id]: { ...cur, ...next } };
  emit();
}

export const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export const revealStore = {
  subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; },
  getEpoch: () => epoch,
  getControls: () => controls,
  getAgents: () => agents,

  /** Should this item animate right now? (respects dev switches, reduced motion and `once`) */
  shouldAnimate(id: string | undefined, once: boolean, localDisabled: boolean): boolean {
    if (localDisabled || disabled || mode === "static" || prefersReducedMotion()) return false;
    return !(once && id && played.has(id));
  },
  markPlayed(id: string) { played.add(id); },

  /** Play again from scratch. */
  replay() {
    mode = "auto"; played.clear(); queues.clear(); agents = {};
    controls = { mode, disabled }; epoch++; emit();
  },
  /** Show everything immediately, no animation. */
  reset() {
    mode = "static"; queues.clear(); agents = {};
    controls = { mode, disabled }; epoch++; emit();
  },
  setDisabled(v: boolean) {
    disabled = v;
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* storage unavailable */ }
    controls = { mode, disabled }; epoch++; emit();
  },

  /** One agent works on one item at a time: resolves with a release function when it is this item's turn. */
  acquire(agent: string): Promise<() => void> {
    const prev = queues.get(agent) ?? Promise.resolve();
    let release!: () => void;
    const mine = new Promise<void>((r) => { release = r; });
    queues.set(agent, prev.then(() => mine));
    return prev.then(() => release);
  },

  /** Lifecycle bookkeeping of one item for the agent status panel. */
  track(agent: string) {
    let stage: "idle" | "queued" | "working" | "end" = "idle";
    return {
      queue() { if (stage !== "idle") return; stage = "queued"; patch(agent, (a) => { const n = { ...a, queued: a.queued + 1 }; return { queued: n.queued, status: statusOf(n) }; }); },
      start(target: string) { if (stage !== "queued") return; stage = "working"; patch(agent, (a) => ({ queued: a.queued - 1, status: "working", progress: 0, target })); },
      progress(p: number) { if (stage !== "working") return; const r = Math.round(p * 20) / 20; patch(agent, (a) => (a.progress === r ? {} : { progress: r })); },
      finish() { if (stage !== "working") return; stage = "end"; patch(agent, (a) => { const n = { ...a, status: "idle" as AgentStatus, done: a.done + 1 }; return { done: n.done, status: statusOf(n), progress: 1, target: null }; }); },
      cancel() {
        const was = stage; if (was === "idle" || was === "end") return; stage = "end";
        patch(agent, (a) => { const n = { ...a, status: "idle" as AgentStatus, queued: was === "queued" ? a.queued - 1 : a.queued }; return { queued: n.queued, status: statusOf(n), target: null }; });
      },
    };
  },
};
