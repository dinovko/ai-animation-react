import { useSyncExternalStore } from "react";
import type { AutoController } from "../auto/controller";
import { AGENT_LIST } from "../engine/agents";
import "../styles/agent-reveal.css";

/** Bottom bar of the automatic reveal: agents, layers done / total, progress, Tour, speed, close. */
export function AutoHud({ ctrl }: { ctrl: AutoController }) {
  const s = useSyncExternalStore(ctrl.subscribe, ctrl.getSnapshot);
  if (!s.hudOpen) return null;
  const pct = s.total ? Math.round((s.done / s.total) * 100) : 100;
  return (
    <div className="ar-hud" role="group" aria-label="Agent reveal">
      <span className="ar-hud-dots" aria-hidden="true">
        {AGENT_LIST.slice(0, 5).map((a) => <i key={a.id} style={{ background: a.color }} />)}
      </span>
      <span className="ar-hud-n"><b>{s.agents}</b> agents</span>
      <span className="ar-hud-sep" />
      <span className="ar-hud-n"><b>{s.done}</b> / {s.total} layers</span>
      <span className="ar-hud-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></span>
      <button type="button" onClick={() => ctrl.replay()} title="Draw again">Tour</button>
      <button type="button" onClick={() => ctrl.cycleSpeed()} title="Playback speed">{s.speed}×</button>
      <button type="button" className="ar-hud-x" onClick={() => ctrl.closeHud()} aria-label="Close">×</button>
    </div>
  );
}
