import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { pushCut } from "@remotion/transitions/push-cut";
import type { CSSProperties, ReactNode } from "react";
import { Sequence, staticFile } from "remotion";
import { DashboardScene } from "../scenes/DashboardScene";
import { OutroScene } from "../scenes/OutroScene";
import { TraceScene } from "../scenes/TraceScene";
import { AUDIO_LEAD_IN, AUDIO_TRAIL_HOLD, TRANSITION_DURATION } from "./constants";
import { type NarrationId, voiceoverFile } from "./data/narration";
import type { PitchVideoProps } from "./metadata";
import { CapabilitiesScene } from "./scenes/CapabilitiesScene";
import { DemoScene } from "./scenes/DemoScene";
import { HookScene } from "./scenes/HookScene";
import { InstitutionScene } from "./scenes/InstitutionScene";
import { IntegrationScene } from "./scenes/IntegrationScene";
import { SafetyScene } from "./scenes/SafetyScene";
import { ScaleScene } from "./scenes/ScaleScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { TeamScene } from "./scenes/TeamScene";
import { TitleCardScene } from "./scenes/TitleCardScene";

// Same reasoning as the short demo's DemoVideo.tsx: load the live app's
// fonts here so the standalone Remotion bundler (Studio/CLI render) matches
// what next/font/google already gives the in-app <Player> preview for free.
const { fontFamily: manropeFamily } = loadManrope("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: geistMonoFamily } = loadGeistMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

const WHOOSH_URL = "https://remotion.media/whoosh.wav";

function contentDuration(padded: number) {
  return padded - AUDIO_LEAD_IN - AUDIO_TRAIL_HOLD;
}

/** Wraps a single-clip scene with its lead-in silence and narration audio. */
function NarratedSegment({ audioId, children }: { audioId: NarrationId; children: ReactNode }) {
  return (
    <Sequence from={AUDIO_LEAD_IN} layout="none">
      {children}
      <Audio src={staticFile(voiceoverFile(audioId))} />
    </Sequence>
  );
}

/**
 * Every top-level segment's start frame in the final composition timeline.
 * `TransitionSeries` overlaps each segment with the previous one by
 * `TRANSITION_DURATION`, so segment N starts at
 * `sum(durations[0..N-1]) - N * TRANSITION_DURATION` — which is also
 * exactly where the pushCut/whoosh for that cut should land.
 */
function segmentStartFrames(durations: number[]): number[] {
  const starts = [0];
  for (let i = 1; i < durations.length; i++) {
    starts.push(starts[i - 1] + durations[i - 1] - TRANSITION_DURATION);
  }
  return starts;
}

/**
 * The long-form, narrated "TRACIA-Pitch" composition — TRACIA title/team/
 * institution opening, problem statement, solution, capabilities, a live
 * SH-8821 demo, scale/integration/safety, and an outro. Every segment's
 * length comes from `sceneDurations` (computed in `metadata.ts` from the
 * real ElevenLabs audio files), not hand-picked constants, so the video is
 * exactly as long as its narration.
 */
export function PitchVideo({ sceneDurations: d }: PitchVideoProps) {
  const segmentDurations = [
    d.title,
    d.team,
    d.institution,
    d.hook,
    d.solution,
    d.capabilities,
    d.demoIntro,
    d.demo,
    d.trace,
    d.scale,
    d.integration,
    d.safety,
    d.outro,
  ];
  // One cut per boundary between segments — skip index 0, nothing transitions into the opening.
  const transitionCutFrames = segmentStartFrames(segmentDurations).slice(1);

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
        <TransitionSeries.Sequence name="TitleCard" durationInFrames={d.title}>
          <NarratedSegment audioId="titleIntro">
            <TitleCardScene />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Team" durationInFrames={d.team}>
          <NarratedSegment audioId="teamIntro">
            <TeamScene durationInFrames={contentDuration(d.team)} />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Institution" durationInFrames={d.institution}>
          <NarratedSegment audioId="institutionIntro">
            <InstitutionScene />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Hook" durationInFrames={d.hook}>
          <NarratedSegment audioId="hook">
            <HookScene durationInFrames={contentDuration(d.hook)} />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Solution" durationInFrames={d.solution}>
          <NarratedSegment audioId="solution">
            <SolutionScene />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Capabilities" durationInFrames={d.capabilities}>
          <NarratedSegment audioId="capabilities">
            <CapabilitiesScene durationInFrames={contentDuration(d.capabilities)} />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="DemoIntro" durationInFrames={d.demoIntro}>
          <NarratedSegment audioId="demoIntro">
            <DashboardScene brandName="TRACIA" logoSrc="TRACIA-logo.png" />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Demo" durationInFrames={d.demo}>
          <Sequence from={AUDIO_LEAD_IN} layout="none">
            <DemoScene durationInFrames={contentDuration(d.demo)} beats={d.demoBeats} />
          </Sequence>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Trace" durationInFrames={d.trace}>
          <NarratedSegment audioId="demoTrace">
            <TraceScene durationInFrames={contentDuration(d.trace)} />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Scale" durationInFrames={d.scale}>
          <NarratedSegment audioId="scale">
            <ScaleScene durationInFrames={contentDuration(d.scale)} />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Integration" durationInFrames={d.integration}>
          <NarratedSegment audioId="integration">
            <IntegrationScene />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Safety" durationInFrames={d.safety}>
          <NarratedSegment audioId="safety">
            <SafetyScene durationInFrames={contentDuration(d.safety)} />
          </NarratedSegment>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence name="Outro" durationInFrames={d.outro}>
          <NarratedSegment audioId="outro">
            <OutroScene logoSrc="TRACIA-logo.png" tagline="Masalah terjadi. TRACIA tangani." />
          </NarratedSegment>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {transitionCutFrames.map((frame) => (
        <Audio key={`whoosh-${frame}`} src={WHOOSH_URL} from={frame} volume={0.5} />
      ))}
    </div>
  );
}
