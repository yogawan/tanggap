import { interpolate, useCurrentFrame } from "remotion";

/**
 * Reveals `text` one character at a time between `startFrame` and
 * `startFrame + durationInFrames`, with a blinking caret while active.
 * Deterministic per-frame — safe for server-side rendering, unlike a
 * real `setInterval`-driven typing effect.
 */
export function TypingText({
  text,
  startFrame,
  durationInFrames,
  className,
}: {
  text: string;
  startFrame: number;
  durationInFrames: number;
  className?: string;
}) {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, text.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const visible = text.slice(0, Math.round(progress));
  const caretActive =
    frame >= startFrame && frame < startFrame + durationInFrames + 20;
  const caretOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <span className={className}>
      {visible}
      {caretActive && (
        <span style={{ opacity: caretOn ? 1 : 0, marginLeft: 1 }}>|</span>
      )}
    </span>
  );
}
