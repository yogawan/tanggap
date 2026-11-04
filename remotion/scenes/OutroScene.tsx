import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

/**
 * Clean brand close, matching the landing page's `FinalCta` panel styling.
 *
 * `logoSrc`/`tagline` default to the live app's own branding — the narrated
 * pitch video overrides them to TRACIA without touching the short demo,
 * which renders this same component unmodified.
 */
export function OutroScene({
  logoSrc = "TRACIA-logo.png",
  tagline = "Masalah terjadi. TRACIA tangani.",
}: {
  logoSrc?: string;
  tagline?: string;
}) {
  const frame = useCurrentFrame();

  const logoIn = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineIn = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      className="bg-primary-hover"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ textAlign: "center" }}>
        <Img
          src={staticFile(logoSrc)}
          style={{
            width: 140,
            height: 140,
            objectFit: "contain",
            margin: "0 auto",
            opacity: logoIn,
            scale: interpolate(logoIn, [0, 1], [0.85, 1]),
          }}
        />
        <p
          className="text-white"
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: -0.5,
            opacity: taglineIn,
            translate: `0px ${interpolate(taglineIn, [0, 1], [12, 0])}px`,
          }}
        >
          {tagline}
        </p>
      </div>
    </AbsoluteFill>
  );
}
