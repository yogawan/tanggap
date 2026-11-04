import { AbsoluteFill, Img, staticFile } from "remotion";
import { FadeIn } from "../components/FadeIn";

const capabilities = [
  { number: "01", image: "Investigate.png", title: "Investigate" },
  { number: "02", image: "Reason.png", title: "Reason" },
  { number: "03", image: "Plan.png", title: "Plan" },
  { number: "04", image: "Execute.png", title: "Execute" },
  { number: "05", image: "Verify.png", title: "Verify" },
];

export function CapabilitiesScene({
  durationInFrames,
}: {
  durationInFrames: number;
}) {
  const stagger = Math.max(
    16,
    Math.floor((durationInFrames * 0.75) / capabilities.length),
  );

  return (
    <AbsoluteFill
      className="bg-surface"
      style={{ padding: "0 160px", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={20} style={{ textAlign: "center" }}>
        <p
          className="text-primary"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          MEET YOUR AI AGENT
        </p>
        <h1
          className="text-foreground"
          style={{
            marginTop: 14,
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          Lima tahap kerja TRACIA
        </h1>
      </FadeIn>

      <div
        style={{
          marginTop: 56,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 20,
        }}
      >
        {capabilities.map((cap, i) => (
          <FadeIn key={cap.number} delay={30 + i * stagger} duration={18}>
            <div
              className="rounded-2xl border border-border bg-background"
              style={{ padding: 24, textAlign: "center" }}
            >
              <span
                className="text-border"
                style={{ fontSize: 32, fontWeight: 700 }}
              >
                {cap.number}
              </span>
              <Img
                src={staticFile(cap.image)}
                style={{
                  width: 56,
                  height: 56,
                  objectFit: "contain",
                  margin: "16px auto 0",
                }}
              />
              <h3
                className="text-foreground"
                style={{ marginTop: 16, fontSize: 20, fontWeight: 600 }}
              >
                {cap.title}
              </h3>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}
