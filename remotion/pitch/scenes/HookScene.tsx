import { AbsoluteFill } from "remotion";
import { FadeIn } from "../components/FadeIn";

// World Bank Logistics Performance Index 2023 + national logistics-cost
// figures — the "Latar Belakang Masalah" framing for the video.
const stats = [
  {
    value: "14,29%",
    label: "Biaya logistik terhadap PDB",
    copy: "Biaya logistik Indonesia mencapai 14,29% PDB, dengan target turun menjadi 8% pada 2045.",
  },
  {
    value: "3,0 / 5",
    label: "Logistics Performance Index",
    copy: "Indonesia memperoleh skor 3,0/5 dalam World Bank Logistics Performance Index 2023.",
  },
  {
    value: "2,7 / 5",
    label: "Timeliness",
    copy: "Indikator ketepatan waktu pengiriman Indonesia mendapat skor 2,7/5 pada LPI 2023.",
  },
];

export function HookScene({ durationInFrames }: { durationInFrames: number }) {
  const stagger = Math.max(
    20,
    Math.floor((durationInFrames * 0.5) / stats.length),
  );

  return (
    <AbsoluteFill
      className="bg-background"
      style={{ padding: "0 220px", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={20}>
        <p
          className="text-primary"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          LATAR BELAKANG MASALAH
        </p>
        <h1
          className="text-foreground"
          style={{
            marginTop: 14,
            maxWidth: 1200,
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          Logistik Indonesia masih menghadapi tekanan efisiensi.
        </h1>
      </FadeIn>

      <div
        style={{
          marginTop: 56,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 28,
        }}
      >
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={30 + i * stagger} duration={20}>
            <div
              className="rounded-2xl border border-border bg-surface"
              style={{ padding: 32 }}
            >
              <p
                className="text-primary"
                style={{
                  margin: 0,
                  fontSize: 56,
                  fontWeight: 700,
                  letterSpacing: -1,
                }}
              >
                {stat.value}
              </p>
              <h3
                className="text-foreground"
                style={{ marginTop: 18, fontSize: 21, fontWeight: 600 }}
              >
                {stat.label}
              </h3>
              <p
                className="text-muted"
                style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6 }}
              >
                {stat.copy}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}
