import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AgentRevealProps } from "../types";
import { getAgent } from "../engine/agents";
import { contentBox } from "../engine/geometry";
import { EMPTY_CLIP } from "../engine/presets";
import { runReveal, type RunHandle } from "../engine/runReveal";
import { revealStore } from "../engine/store";
import "../styles/agent-reveal.css";

type Phase = "pending" | "running" | "done";

/**
 * Wraps an existing component and reveals it as if an AI agent were discovering it:
 * the agent cursor drags a selection frame from the top-left corner to the bottom-right one while the
 * component is uncovered behind the scan boundary (clip-path). Geometry is detected, never specified.
 * The wrapper adds no styling of its own; afterwards it is a plain block with no clip and no inert state.
 */
export function AgentReveal({
  children, id, agent = "alpha", reveal = "diagonal", duration = 1200, delay = 0,
  disabled = false, cursor = true, frame = true, once = true, className, onStart, onComplete,
}: AgentRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const epoch = useSyncExternalStore(revealStore.subscribe, revealStore.getEpoch);
  // Hidden from the very first paint, so there is no flash of the finished component.
  const [phase, setPhase] = useState<Phase>(() => (revealStore.shouldAnimate(id, once, disabled) ? "pending" : "done"));
  const cb = useRef({ onStart, onComplete });
  cb.current = { onStart, onComplete };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!revealStore.shouldAnimate(id, once, disabled)) {
      el.inert = false;
      el.style.clipPath = "";
      setPhase("done");
      return;
    }
    setPhase("pending");
    el.style.clipPath = EMPTY_CLIP; // hidden right now, not only after the next render
    el.inert = true; // hidden content must not be focusable or clickable

    const def = getAgent(agent);
    const track = revealStore.track(def.id);
    let cancelled = false;
    let timer = 0;
    let run: RunHandle | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let release: (() => void) | null = null;
    const giveBack = () => { const r = release; release = null; r?.(); };

    const begin = async () => {
      track.queue();
      const rel = await revealStore.acquire(def.id);
      if (cancelled) { rel(); return; }
      release = rel;
      track.start(id ?? "item");
      cb.current.onStart?.();
      setPhase("running");
      run = runReveal({ el, agent: def, kind: reveal, duration, cursor, frame, onProgress: track.progress });
      await run.done;
      giveBack();
      if (cancelled) return;
      el.inert = false;
      setPhase("done");
      if (id) revealStore.markPlayed(id);
      track.finish();
      cb.current.onComplete?.();
    };

    const hasSize = () => { const b = contentBox(el); return !!b && b.width > 0 && b.height > 0; };
    // Start only when the component is really rendered, then when it comes into view.
    const whenVisible = () => {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io?.disconnect(); timer = window.setTimeout(begin, delay); }
      }, { rootMargin: "0px 0px -8% 0px" });
      io.observe(el);
    };
    if (hasSize()) whenVisible();
    else {
      ro = new ResizeObserver(() => { if (hasSize()) { ro?.disconnect(); whenVisible(); } });
      ro.observe(el);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      io?.disconnect();
      ro?.disconnect();
      run?.cancel();
      giveBack();
      track.cancel();
      el.style.clipPath = "";
      el.inert = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch, id, agent, reveal, duration, delay, disabled, cursor, frame, once]);

  return <div ref={ref} className={`ar${className ? ` ${className}` : ""}`} data-ar-phase={phase}>{children}</div>;
}
