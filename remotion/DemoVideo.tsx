import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties } from "react";
import {
  AGENT_SCENE_DURATION,
  DASHBOARD_SCENE_DURATION,
  OUTRO_SCENE_DURATION,
  TRACE_SCENE_DURATION,
  TRANSITION_DURATION,
} from "./constants";
import { AgentWorkspaceScene } from "./scenes/AgentWorkspaceScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { OutroScene } from "./scenes/OutroScene";
import { TraceScene } from "./scenes/TraceScene";

// The live app gets Manrope/Geist Mono from `next/font/google` injected at
// the <html> tag — invisible to Remotion's standalone CLI bundler used by
// `remotion studio`/`remotion render`. Loading the same families here keeps
// the CLI-rendered MP4 visually identical to the in-app <Player> preview
// (which already has the real fonts for free, since it runs inside Next).
const { fontFamily: manropeFamily } = loadManrope("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: geistMonoFamily } = loadGeistMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export function DemoVideo() {
  return (
    <div
      style={
        {
          fontFamily: manropeFamily,
          "--font-geist-mono": geistMonoFamily,
          height: "100%",
        } as CSSProperties
      }
    >
      <TransitionSeries>
        <TransitionSeries.Sequence
          name="Dashboard"
          durationInFrames={DASHBOARD_SCENE_DURATION}
        >
          <DashboardScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence
          name="AgentWorkspace"
          durationInFrames={AGENT_SCENE_DURATION}
        >
          <AgentWorkspaceScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence
          name="Trace"
          durationInFrames={TRACE_SCENE_DURATION}
        >
          <TraceScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence
          name="Outro"
          durationInFrames={OUTRO_SCENE_DURATION}
        >
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </div>
  );
}
