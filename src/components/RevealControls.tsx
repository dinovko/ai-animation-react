import { useSyncExternalStore } from "react";
import { AGENT_LIST } from "../engine/agents";
import { revealStore } from "../engine/store";
import "../styles/agent-reveal.css";

/** Development build (Vite `import.meta.env.DEV` or `NODE_ENV=development`), or any build when the URL contains `?agents` (also after `#` for hash routers). */
export function isRevealDevMode(): boolean {
  if (typeof location !== "undefined" && /[?&]agents\b/.test(location.search + location.hash)) return true;
  const env = (import.meta as ImportMeta & { env?: { DEV?: boolean; MODE?: string } }).env;
  if (env?.DEV === true || env?.MODE === "development") return true;
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
  return nodeEnv === "development";
}

export function RevealControls() {
  const agents = useSyncExternalStore(revealStore.subscribe, revealStore.getAgents);
  const c = useSyncExternalStore(revealStore.subscribe, revealStore.getControls);
  if (!isRevealDevMode()) return null;
  return (
    <div className="ar-dev" role="group" aria-label="Agent reveal (developer)">
      <div className="ar-dev-rows">
        {AGENT_LIST.map((a) => {
          const s = agents[a.id];
          const text = s ? `${s.status}${s.status === "working" ? ` ${Math.round(s.progress * 100)}%` : ""}` : "idle";
          return (
            <span key={a.id} className="ar-dev-agent" style={{ ["--c" as string]: a.color }} title={a.role}>
              <i />{a.name}<em>{text}</em>
            </span>
          );
        })}
      </div>
      <div className="ar-dev-btns">
        <button type="button" onClick={revealStore.replay} disabled={c.disabled}>{c.mode === "static" ? "Play" : "Replay"}</button>
        <button type="button" onClick={revealStore.reset}>Reset</button>
        <label><input type="checkbox" checked={c.disabled} onChange={(e) => revealStore.setDisabled(e.target.checked)} /> Off</label>
      </div>
    </div>
  );
}
