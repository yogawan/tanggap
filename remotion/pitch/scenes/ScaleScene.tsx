import { AbsoluteFill } from "remotion";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { FadeIn } from "../components/FadeIn";

// Same four exceptions as lib/dummy-chats.ts's "demo-show-critical-exceptions" / "demo-handle-all-critical" chats.
const exceptions: {
  shipment: string;
  type: string;
  severity: "critical" | "high";
}[] = [
  { shipment: "SH-8821", type: "vehicle_breakdown", severity: "critical" },
  { shipment: "SH-8835", type: "driver_unavailable", severity: "high" },
  { shipment: "SH-8790", type: "route_blocked", severity: "critical" },
  { shipment: "SH-8902", type: "late_delivery", severity: "high" },
];

const severityTone: Record<"critical" | "high", BadgeTone> = {
  critical: "danger",
  high: "warning",
};

export function ScaleScene({ durationInFrames }: { durationInFrames: number }) {
  const stagger = Math.max(
    14,
    Math.floor((durationInFrames * 0.6) / exceptions.length),
  );

  return (
    <AbsoluteFill
      className="bg-background"
      style={{ padding: "0 300px", justifyContent: "center" }}
    >
      <FadeIn delay={0} duration={18}>
        <p
          className="text-primary"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, margin: 0 }}
        >
          HANDLES MORE THAN ONE AT A TIME
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
          4 exception kritis, ditangani berurutan
        </h1>
      </FadeIn>

      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {exceptions.map((exc, i) => (
          <FadeIn key={exc.shipment} delay={24 + i * stagger} duration={16}>
            <div
              className="rounded-xl border border-border bg-surface"
              style={{
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p
                className="text-foreground"
                style={{ margin: 0, fontSize: 20, fontWeight: 600 }}
              >
                {exc.shipment}{" "}
                <span className="text-muted" style={{ fontWeight: 400 }}>
                  — {exc.type.replace(/_/g, " ")}
                </span>
              </p>
              <Badge tone={severityTone[exc.severity]}>{exc.severity}</Badge>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}
