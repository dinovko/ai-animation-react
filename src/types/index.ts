import type { ReactNode } from "react";

export type RevealKind = "diagonal" | "horizontal" | "vertical" | "rectangle";

/** A visual agent: purely a presentation entity (cursor + colour + name), not a model. */
export interface AgentDef {
  id: string;
  name: string;
  color: string;
  role: string;
}

export type AgentStatus = "idle" | "waiting" | "working" | "done";

export interface AgentState {
  status: AgentStatus;
  /** 0..1 progress of the item the agent is currently revealing */
  progress: number;
  /** id of the item being revealed */
  target: string | null;
  queued: number;
  done: number;
}

export interface AgentRevealProps {
  children: ReactNode;
  /** Stable id. With `once` it is what remembers that the item has already been revealed. */
  id?: string;
  /** Agent that performs the reveal (alpha | beta | gamma | delta). Items of one agent run one after another. */
  agent?: string;
  reveal?: RevealKind;
  /** Scan duration, ms. */
  duration?: number;
  /** Delay after the element becomes visible in the viewport, ms. */
  delay?: number;
  disabled?: boolean;
  /** Draw the agent cursor. */
  cursor?: boolean;
  /** Draw the selection frame. */
  frame?: boolean;
  /** Play only the first time (per page load / until replay). */
  once?: boolean;
  className?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export type CursorKind = "arrow" | "text" | "cross";
/** What the overlay writes next to a frame / cursor: the agent name, the `w × h` size chip, both, or nothing. */
export type LabelMode = "name" | "size" | "both" | "none";
export type GhostKind = "none" | "gray" | "accent";

export interface AgentRevealAutoProps {
  children: ReactNode;
  /** Stable id for the "play once" memory. Without it the scan plays on every mount. */
  id?: string;
  /** Number of agents (the pool size) or your own list. Default 16. */
  agents?: number | AgentDef[];
  /** Multiplier of every layer's scan time (1 = default). Use `speed` for the live playback rate. */
  duration?: number;
  /** Initial playback rate: 0.5, 1, 2 or 4. The HUD cycles through them. */
  speed?: number;
  /** Bottom bar: agents, layers done / total, progress, Tour, speed, close. Default: only in dev mode. */
  hud?: boolean;
  /** Text next to frames. Default "size". */
  labels?: LabelMode;
  cursors?: boolean;
  frames?: boolean;
  /** Gray / accent placeholders that fade out while a layer is being drawn. Default true. */
  ghosts?: boolean;
  /** Elements matching this selector get a red frame. */
  flag?: string;
  /** Share (0..1) of layers that are additionally framed in red, picked deterministically. Default 0.05. */
  flagRate?: number;
  /** Stop discovery after this many layers (document order). Default 500. */
  maxLayers?: number;
  /** Only layers that intersect the viewport when the scan starts. Default true. */
  viewportOnly?: boolean;
  /** Return false to leave an element (and its subtree) out. Elements with `data-ar-skip` are always left out. */
  filter?: (el: Element) => boolean;
  once?: boolean;
  disabled?: boolean;
  className?: string;
  onComplete?: () => void;
}
