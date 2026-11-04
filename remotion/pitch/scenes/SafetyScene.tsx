import { ShieldCheck } from "lucide-react";
import { AbsoluteFill } from "remotion";
import { FadeIn } from "../components/FadeIn";

const points = [
  {
    title: "Restricted Tools",
    copy: "TRACIA hanya dapat menggunakan tools yang diizinkan.",
  },
  {
    title: "Human Approval",
    copy: "Tindakan berisiko atau perubahan penting dapat membutuhkan persetujuan operator.",
  },
  {
    title: "Verified Results",
    copy: "TRACIA memeriksa respons sistem sebelum menyatakan tugas selesai.",
  },
];

export function SafetyScene({
  durationInFrames,
}: {
  durationInFrames: number;
}) {
  const stagger = Math.max(
    16,
    Math.floor((durationInFrames * 0.55) / points.length),
  );

  return (
    <AbsoluteFill
      className="bg-background"
      style={{ padding: "0 260px", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={18}>
        <p
          className="text-primary"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          CONTROLLED AUTONOMY
        </p>
        <h1
          className="text-foreground"
          style={{
            marginTop: 14,
            maxWidth: 1100,
            fontSize: 46,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          TRACIA sigap bertindak. Operator tetap memegang kendali.
        </h1>
      </FadeIn>

      <div
        style={{
          marginTop: 44,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {points.map((point, i) => (
          <FadeIn key={point.title} delay={28 + i * stagger} duration={18}>
            <div
              className="rounded-xl border border-border bg-surface"
              style={{
                padding: 22,
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <ShieldCheck
                className="text-primary"
                size={24}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <div>
                <h3
                  className="text-foreground"
                  style={{ margin: 0, fontSize: 20, fontWeight: 600 }}
                >
                  {point.title}
                </h3>
                <p
                  className="text-muted"
                  style={{ marginTop: 6, fontSize: 16, lineHeight: 1.5 }}
                >
                  {point.copy}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}
