import { Easing, interpolate, useCurrentFrame } from "remotion";

export type CursorWaypoint = {
  frame: number;
  x: number;
  y: number;
  /** Mark this waypoint as a click — shows a ripple and a press dip. */
  click?: boolean;
};

const CLICK_RIPPLE_DURATION = 14;

/**
 * A fake pointer that glides between authored waypoints and flashes a
 * click-ripple at the ones marked `click`. Positioned in the same
 * coordinate space as the content it sits over, so it should be rendered
 * inside the same `CameraRig` as the UI it's "clicking" — that's what makes
 * it pan/zoom together with the screen like a real recording.
 */
export function Cursor({ waypoints }: { waypoints: CursorWaypoint[] }) {
  const frame = useCurrentFrame();
  const frames = waypoints.map((w) => w.frame);

  const x = interpolate(
    frame,
    frames,
    waypoints.map((w) => w.x),
    {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const y = interpolate(
    frame,
    frames,
    waypoints.map((w) => w.y),
    {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const lastClick = waypoints.filter((w) => w.click && w.frame <= frame).at(-1);
  const sinceClick = lastClick ? frame - lastClick.frame : Infinity;
  const isClicking = sinceClick <= CLICK_RIPPLE_DURATION;

  const press = isClicking
    ? interpolate(
        sinceClick,
        [0, CLICK_RIPPLE_DURATION / 2, CLICK_RIPPLE_DURATION],
        [1, 0.82, 1],
        { easing: Easing.bezier(0.33, 1, 0.68, 1) },
      )
    : 1;

  const rippleScale = isClicking
    ? interpolate(sinceClick, [0, CLICK_RIPPLE_DURATION], [0.3, 1.8], {
        easing: Easing.out(Easing.quad),
        extrapolateRight: "clamp",
        output: "perceptual-scale",
      })
    : 0;
  const rippleOpacity = isClicking
    ? interpolate(sinceClick, [0, CLICK_RIPPLE_DURATION], [0.45, 0], {
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        translate: `${x}px ${y}px`,
        zIndex: 999,
      }}
    >
      {isClicking && (
        <div
          style={{
            position: "absolute",
            top: -18,
            left: -18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#0f766e",
            opacity: rippleOpacity,
            scale: rippleScale,
          }}
        />
      )}
      <svg
        aria-hidden="true"
        width={30}
        height={30}
        viewBox="0 0 30 30"
        style={{
          scale: press,
          filter: "drop-shadow(0 2px 4px rgba(15,23,42,0.35))",
        }}
      >
        <path
          d="M4 2 L4 24 L10.5 18.5 L14.5 27 L18 25.3 L14 17 L23 17 Z"
          fill="white"
          stroke="#0f172a"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
