"use client";

import { Player } from "@remotion/player";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { FPS, HEIGHT, TOTAL_DURATION, WIDTH } from "@/remotion/constants";
import { DemoVideo } from "@/remotion/DemoVideo";
import {
  FPS as PITCH_FPS,
  HEIGHT as PITCH_HEIGHT,
  WIDTH as PITCH_WIDTH,
} from "@/remotion/pitch/constants";
import {
  calculatePitchMetadata,
  type PitchSceneDurations,
  placeholderSceneDurations,
} from "@/remotion/pitch/metadata";
import { PitchVideo } from "@/remotion/pitch/PitchVideo";

type Tab = "pitch" | "short";

type PitchMetaState =
  | { status: "loading" }
  | {
      status: "ready";
      durationInFrames: number;
      sceneDurations: PitchSceneDurations;
    };

// <Player> (unlike <Composition>) doesn't resolve calculateMetadata itself —
// it needs durationInFrames/inputProps up front — so we run the same
// function the composition registers in Root.tsx and wait for the real
// ElevenLabs audio durations before mounting the pitch Player.
function usePitchMetadata(): PitchMetaState {
  const [state, setState] = useState<PitchMetaState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const defaultProps = { sceneDurations: placeholderSceneDurations };
    Promise.resolve(
      calculatePitchMetadata({
        defaultProps,
        props: defaultProps,
        abortSignal: new AbortController().signal,
        compositionId: "TRACIA-Pitch",
        isRendering: false,
      }),
    ).then((result) => {
      if (cancelled || !result.props) return;
      setState({
        status: "ready",
        durationInFrames: result.durationInFrames ?? 0,
        sceneDurations: result.props.sceneDurations,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "pitch", label: "Video Pitch Lengkap" },
  { id: "short", label: "Demo Singkat" },
];

export default function DemoPage() {
  const [tab, setTab] = useState<Tab>("pitch");
  const pitchMeta = usePitchMetadata();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 lg:py-12">
      <SectionIntro
        as="h1"
        eyebrow="PRODUCT WALKTHROUGH"
        title="Video Demo"
        copy="Simulasi end-to-end: instruksi pengguna, agent reasoning, approval, hingga task selesai — dirender dengan Remotion."
      />

      <div className="mt-8 inline-flex gap-1 rounded-full border border-border bg-surface p-1 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "bg-primary text-white"
                : "text-muted hover:bg-background hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="mt-4">
        {tab === "short" ? (
          <Player
            key="short"
            component={DemoVideo}
            durationInFrames={TOTAL_DURATION}
            fps={FPS}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            style={{ width: "100%", aspectRatio: "16 / 9" }}
            controls
            loop
            autoPlay
          />
        ) : pitchMeta.status === "loading" ? (
          <div
            className="flex items-center justify-center text-sm text-muted"
            style={{ width: "100%", aspectRatio: "16 / 9" }}
          >
            Memuat durasi narasi…
          </div>
        ) : (
          <Player
            key="pitch"
            component={PitchVideo}
            inputProps={{ sceneDurations: pitchMeta.sceneDurations }}
            durationInFrames={pitchMeta.durationInFrames}
            fps={PITCH_FPS}
            compositionWidth={PITCH_WIDTH}
            compositionHeight={PITCH_HEIGHT}
            style={{ width: "100%", aspectRatio: "16 / 9" }}
            controls
            loop
            autoPlay
          />
        )}
      </Card>

      <Card className="mt-6">
        <p className="text-sm font-medium text-foreground">Render ke MP4</p>
        <p className="mt-1 text-sm text-muted">
          Preview di atas berjalan langsung dari composition Remotion di{" "}
          <code className="font-mono">remotion/</code>. Untuk mengekspor video
          final, jalankan dari terminal:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 text-xs text-foreground">
          npm run remotion:render:pitch
        </pre>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-3 text-xs text-foreground">
          npm run remotion:render
        </pre>
        <p className="mt-2 text-xs text-muted">
          Atau <code className="font-mono">npm run remotion:studio</code> untuk
          membuka Remotion Studio dan menyesuaikan timeline sebelum merender.
        </p>
      </Card>
    </div>
  );
}
