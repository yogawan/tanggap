import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export type CameraKeyframe = {
  frame: number;
  /** 1 = no zoom. >1 zooms in, anchored at (originX, originY). */
  scale: number;
  /** Focal point in the scene's own (unzoomed) pixel coordinates. */
  originX: number;
  originY: number;
};

/**
 * Simulates an editorial Ken-Burns camera move: scales the whole scene
 * around a moving focal point. Wrap a scene's content (including its
 * `Cursor`) in one `CameraRig` so the pointer pans/zooms together with the
 * UI, the way a real screen recording looks after a post-production zoom.
 */
export function CameraRig({
  keyframes,
  children,
}: {
  keyframes: CameraKeyframe[];
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const frames = keyframes.map((k) => k.frame);
  const easing = Easing.bezier(0.25, 0.1, 0.25, 1);

  const scale = interpolate(
    frame,
    frames,
    keyframes.map((k) => k.scale),
    {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      output: "perceptual-scale",
    },
  );

  const originX = interpolate(
    frame,
    frames,
    keyframes.map((k) => k.originX),
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const originY = interpolate(
    frame,
    frames,
    keyframes.map((k) => k.originY),
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        scale,
        transformOrigin: `${originX}px ${originY}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
