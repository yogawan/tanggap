import { AbsoluteFill } from "remotion";
import { FadeIn } from "../components/FadeIn";

const systems = ["TMS", "ERP", "Fleet", "Tracking"];

export function IntegrationScene() {
  return (
    <AbsoluteFill
      className="bg-primary-hover"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={20} style={{ textAlign: "center" }}>
        <p
          className="text-primary-light"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          BUILT AROUND YOUR EXISTING SYSTEMS
        </p>
        <h1
          className="text-white"
          style={{
            marginTop: 14,
            maxWidth: 1000,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          Pertahankan sistemmu. Tambahkan kemampuan TRACIA.
        </h1>
      </FadeIn>

      <FadeIn
        delay={30}
        duration={20}
        style={{ marginTop: 56, display: "flex", gap: 16 }}
      >
        {systems.map((system) => (
          <div
            key={system}
            className="rounded-xl border border-white/15 bg-white/10"
            style={{ padding: "18px 36px" }}
          >
            <span
              className="text-white"
              style={{ fontSize: 20, fontWeight: 600 }}
            >
              {system}
            </span>
          </div>
        ))}
      </FadeIn>
    </AbsoluteFill>
  );
}
