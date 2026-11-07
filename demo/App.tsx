import { AgentRevealAuto } from "ai-animation-react";
import { Dashboard } from "./Dashboard";

export function App() {
  return (
    <AgentRevealAuto
      id="harbor"
      agents={24}
      duration={0.75}
      speed={2}
      labels="size"
      viewportOnly={false}
      flag="[data-flag]"
      flagRate={0.04}
      maxLayers={500}
      hud
    >
      <Dashboard />
    </AgentRevealAuto>
  );
}
