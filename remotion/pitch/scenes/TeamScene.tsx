import { AbsoluteFill, Img, staticFile } from "remotion";
import { FadeIn } from "../components/FadeIn";

// Photos are 432x577 (3:4 portrait) cutouts already in public/, matched by
// filename to each member — see the Nov 4 additions in public/.
const team = [
  {
    name: "Lathif",
    role: "AI & Backend Developer",
    photo: "Lathif as a AI Dev.png",
  },
  {
    name: "Ali Sahat",
    role: "Frontend Developer",
    photo: "Ali as a Frontend Dev.png",
  },
  {
    name: "Yogawan",
    role: "UI/UX Designer",
    photo: "Yogawan as a UI-UX and Frontend Asistant.png",
  },
];

const PHOTO_HEIGHT = 300;
const PHOTO_WIDTH = Math.round(PHOTO_HEIGHT * (432 / 577));

export function TeamScene({ durationInFrames }: { durationInFrames: number }) {
  const stagger = Math.max(
    16,
    Math.floor((durationInFrames * 0.4) / team.length),
  );

  return (
    <AbsoluteFill
      className="bg-background"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={18} style={{ textAlign: "center" }}>
        <p
          className="text-primary"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          TIM PENGEMBANG
        </p>
        <h1
          className="text-foreground"
          style={{
            marginTop: 14,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          Tim di balik TRACIA
        </h1>
      </FadeIn>

      <div style={{ marginTop: 52, display: "flex", gap: 72 }}>
        {team.map((member, i) => (
          <FadeIn
            key={member.name}
            delay={24 + i * stagger}
            duration={20}
            style={{ textAlign: "center" }}
          >
            <Img
              src={staticFile(member.photo)}
              style={{
                width: PHOTO_WIDTH,
                height: PHOTO_HEIGHT,
                objectFit: "contain",
                margin: "0 auto",
              }}
            />
            <h3
              className="text-foreground"
              style={{
                marginTop: 16,
                fontSize: 24,
                fontWeight: 600,
                margin: "16px 0 0",
              }}
            >
              {member.name}
            </h3>
            <p className="text-muted" style={{ marginTop: 4, fontSize: 16 }}>
              {member.role}
            </p>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}
