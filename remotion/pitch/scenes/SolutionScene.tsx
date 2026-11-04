import { AbsoluteFill, Img, staticFile } from "remotion";
import { FadeIn } from "../components/FadeIn";

export function SolutionScene() {
  return (
    <AbsoluteFill
      className="bg-primary-hover"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={20} style={{ textAlign: "center" }}>
        <Img
          src={staticFile("TRACIA.png")}
          style={{
            width: 140,
            height: 140,
            objectFit: "contain",
            margin: "0 auto",
          }}
        />
      </FadeIn>
      <FadeIn
        delay={14}
        duration={20}
        style={{ marginTop: 28, textAlign: "center" }}
      >
        <p
          className="text-primary-light"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          THE SOLUTION
        </p>
        <h1
          className="text-white"
          style={{
            marginTop: 14,
            maxWidth: 1000,
            fontSize: 52,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          TRACIA menghubungkan data dengan tindakan.
        </h1>
      </FadeIn>
    </AbsoluteFill>
  );
}
