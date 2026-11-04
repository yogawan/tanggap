import { getAudioDuration } from "@remotion/media-utils";
import type { CalculateMetadataFunction } from "remotion";
import { staticFile } from "remotion";
import { AUDIO_LEAD_IN, AUDIO_TRAIL_HOLD, FPS, TRANSITION_DURATION } from "./constants";
import { type NarrationId, voiceoverFile } from "./data/narration";

export type DemoBeatTimings = {
  instruction: number;
  investigate: number;
  approve1: number;
  etaNotify: number;
  completion: number;
};

export type PitchSceneDurations = {
  title: number;
  team: number;
  institution: number;
  hook: number;
  solution: number;
  capabilities: number;
  demoIntro: number;
  demo: number;
  demoBeats: DemoBeatTimings;
  trace: number;
  scale: number;
  integration: number;
  safety: number;
  outro: number;
};

export type PitchVideoProps = {
  sceneDurations: PitchSceneDurations;
};

// Placeholder shown before calculateMetadata resolves (Studio's initial
// render, and the type default for <Composition defaultProps>). Overwritten
// on every load with the real measured audio durations below.
export const placeholderSceneDurations: PitchSceneDurations = {
  title: 13 * FPS,
  team: 10 * FPS,
  institution: 3 * FPS,
  hook: 30 * FPS,
  solution: 15 * FPS,
  capabilities: 37 * FPS,
  demoIntro: 4 * FPS,
  demo: 61 * FPS,
  demoBeats: {
    instruction: 0,
    investigate: 8,
    approve1: 30,
    etaNotify: 35,
    completion: 50,
  },
  trace: 12 * FPS,
  scale: 12 * FPS,
  integration: 14 * FPS,
  safety: 20 * FPS,
  outro: 3 * FPS,
};

async function framesFor(id: NarrationId): Promise<number> {
  const seconds = await getAudioDuration(staticFile(voiceoverFile(id)));
  return Math.round(seconds * FPS);
}

export const calculatePitchMetadata: CalculateMetadataFunction<
  PitchVideoProps
> = async () => {
  const [
    title,
    team,
    institution,
    hook,
    solution,
    capabilities,
    demoIntro,
    instruction,
    investigate,
    approve1,
    etaNotify,
    completion,
    trace,
    scale,
    integration,
    safety,
    outro,
  ] = await Promise.all([
    framesFor("titleIntro"),
    framesFor("teamIntro"),
    framesFor("institutionIntro"),
    framesFor("hook"),
    framesFor("solution"),
    framesFor("capabilities"),
    framesFor("demoIntro"),
    framesFor("demoInstruction"),
    framesFor("demoInvestigate"),
    framesFor("demoApprove1"),
    framesFor("demoEtaNotify"),
    framesFor("demoCompletion"),
    framesFor("demoTrace"),
    framesFor("scale"),
    framesFor("integration"),
    framesFor("safety"),
    framesFor("outro"),
  ]);

  const pad = (frames: number) => AUDIO_LEAD_IN + frames + AUDIO_TRAIL_HOLD;

  const demoBeatDurations = [
    instruction,
    investigate,
    approve1,
    etaNotify,
    completion,
  ];
  const demoBeatStarts = demoBeatDurations.map((_, i) =>
    demoBeatDurations.slice(0, i).reduce((sum, d) => sum + d, 0),
  );
  const demoBeats: DemoBeatTimings = {
    instruction: demoBeatStarts[0],
    investigate: demoBeatStarts[1],
    approve1: demoBeatStarts[2],
    etaNotify: demoBeatStarts[3],
    completion: demoBeatStarts[4],
  };
  const demoTotal = demoBeatDurations.reduce((sum, d) => sum + d, 0);

  const sceneDurations: PitchSceneDurations = {
    title: pad(title),
    team: pad(team),
    institution: pad(institution),
    hook: pad(hook),
    solution: pad(solution),
    capabilities: pad(capabilities),
    demoIntro: pad(demoIntro),
    demo: pad(demoTotal),
    demoBeats,
    trace: pad(trace),
    scale: pad(scale),
    integration: pad(integration),
    safety: pad(safety),
    outro: pad(outro),
  };

  const segments = [
    sceneDurations.title,
    sceneDurations.team,
    sceneDurations.institution,
    sceneDurations.hook,
    sceneDurations.solution,
    sceneDurations.capabilities,
    sceneDurations.demoIntro,
    sceneDurations.demo,
    sceneDurations.trace,
    sceneDurations.scale,
    sceneDurations.integration,
    sceneDurations.safety,
    sceneDurations.outro,
  ];
  const durationInFrames =
    segments.reduce((sum, d) => sum + d, 0) -
    (segments.length - 1) * TRANSITION_DURATION;

  return {
    durationInFrames,
    props: { sceneDurations },
  };
};
