import type { CSSProperties, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * Shared fade-up reveal for the pitch video's concept scenes (Hook,
 * Solution, Capabilities, Scale, Integration, Safety) — the narration-slide
 * equivalent of the short demo's AgentMessageCard entrance.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 18,
  y = 20,
  style,
}: {
  children?: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        ...style,
        opacity: progress,
        translate: `0px ${interpolate(progress, [0, 1], [y, 0])}px`,
      }}
    >
      {children}
    </div>
  );
}
