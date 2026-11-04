import { AbsoluteFill, Img, staticFile } from "remotion";
import { FadeIn } from "../components/FadeIn";

/**
 * Opening title card — institution + product identity. Silent (no
 * narration beyond the titleIntro voiceover), gives the UTY/TRACIA logo
 * masthead, TRACIA wordmark, and formal description room to be read
 * before the narrated sections begin.
 */
export function TitleCardScene() {
  return (
    <AbsoluteFill
      className="bg-primary-hover"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <FadeIn
        delay={0}
        duration={20}
        style={{ display: "flex", alignItems: "center", gap: 28 }}
      >
        <Img
          src={staticFile("UTY.png")}
          style={{ width: 84, height: 84, objectFit: "contain" }}
        />
        <div style={{ width: 1, height: 56, backgroundColor: "rgba(255,255,255,0.3)" }} />
        <Img
          src={staticFile("TRACIA-logo.png")}
          style={{ width: 72, height: 72, objectFit: "contain" }}
        />
      </FadeIn>

      <FadeIn delay={16} duration={20} style={{ marginTop: 32, textAlign: "center" }}>
        <p
          className="text-primary-light"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 4, margin: 0 }}
        >
          AI AGENT PLATFORM
        </p>
        <h1
          className="text-white"
          style={{
            marginTop: 16,
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          TRACIA
        </h1>
      </FadeIn>

      <FadeIn
        delay={40}
        duration={22}
        style={{
          marginTop: 20,
          width: 68,
          height: 2,
          backgroundColor: "rgba(255,255,255,0.35)",
        }}
      />

      <FadeIn
        delay={52}
        duration={22}
        y={14}
        style={{ marginTop: 36, maxWidth: 1180, textAlign: "center" }}
      >
        <p
          className="text-primary-light"
          style={{ fontSize: 27, lineHeight: 1.6, margin: 0 }}
        >
          Platform AI Agent untuk Investigasi, Pemulihan, dan Verifikasi
          Exception Operasional Logistik Berbasis Large Language Model dan Tool
          Calling Terkendali.
        </p>
      </FadeIn>
    </AbsoluteFill>
  );
}
