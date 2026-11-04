import { AbsoluteFill, Img, staticFile } from "remotion";
import { FadeIn } from "../components/FadeIn";

export function InstitutionScene() {
  return (
    <AbsoluteFill
      className="bg-background"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={20} style={{ textAlign: "center" }}>
        <Img
          src={staticFile("UTY.png")}
          style={{
            width: 200,
            height: 200,
            objectFit: "contain",
            margin: "0 auto",
          }}
        />
      </FadeIn>
      <FadeIn
        delay={16}
        duration={20}
        style={{ marginTop: 28, textAlign: "center" }}
      >
        <p
          className="text-primary"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          INSTITUSI
        </p>
        <h1
          className="text-foreground"
          style={{
            marginTop: 12,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: -0.5,
          }}
        >
          Universitas Teknologi Yogyakarta
        </h1>
      </FadeIn>
    </AbsoluteFill>
  );
}
