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
