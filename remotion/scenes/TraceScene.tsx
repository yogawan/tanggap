import { Brain, CircleCheck, GitBranch, Wrench } from "lucide-react";
import type { ComponentType } from "react";
import { AbsoluteFill } from "remotion";
import { Badge } from "@/components/ui/Badge";
import { CameraRig } from "../components/CameraRig";

type StepType = "reasoning" | "tool_call" | "tool_result" | "decision";

type Step = {
  type: StepType;
  tool?: string;
  message: string;
  time: string;
};

// Adapted from the landing page's own "Example Trace" list
// (getShipment → ... → verifyResolution), narrated against this video's
// SH-8821 scenario. No literal per-step trace exists for this demo chat in
// lib/dummy-chats.ts (that file only has top-level chat turns), so this is
// authored to match both the landing page's trace and the chat dialogue.
const steps: Step[] = [
  {
    type: "tool_call",
    tool: "getShipment()",
    message: "Mengambil detail shipment SH-8821.",
    time: "01:58:02",
  },
  {
    type: "tool_call",
    tool: "getException()",
    message: "Mengambil exception aktif untuk SH-8821.",
    time: "01:58:05",
  },
  {
    type: "reasoning",
    message:
      "Kendaraan B 9012 ABC overheat di KM 97 — butuh kendaraan & driver pengganti.",
    time: "01:58:11",
  },
  {
    type: "tool_call",
    tool: "findAvailableVehicle()",
    message: "Menemukan B 7741 XYZ dan Budi Santoso sebagai pengganti.",
    time: "01:58:18",
  },
  {
    type: "decision",
    message: "Menunggu persetujuan operator untuk reassignment.",
    time: "01:58:40",
  },
  {
    type: "tool_call",
    tool: "reassignShipment()",
    message: "SH-8821 dialihkan ke kendaraan dan driver pengganti.",
    time: "02:00:02",
  },
  {
    type: "tool_result",
    message: "Status in_transit terverifikasi — exception resolved.",
    time: "02:03:00",
  },
];

const stepMeta: Record<
  StepType,
  { label: string; icon: ComponentType<{ size?: number }>; color: string }
> = {
  reasoning: { label: "Reasoning", icon: Brain, color: "var(--color-info)" },
  tool_call: {
    label: "Tool Call",
    icon: Wrench,
    color: "var(--color-primary)",
  },
  tool_result: {
    label: "Tool Result",
    icon: CircleCheck,
    color: "var(--color-success)",
  },
  decision: {
    label: "Decision",
    icon: GitBranch,
    color: "var(--color-warning)",
  },
};

/**
 * Replica of the Execution Trace page (`app/(dashboard)/agent/[executionId]/page.tsx`).
 * A slow camera pan down the step list sells "every action is traceable" —
 * no cursor here, this beat is about inspection, not interaction.
 *
 * `durationInFrames` sizes the pan to however long this scene actually
 * plays (default 150 matches the short demo's fixed-length usage; the
 * narrated pitch video passes its real audio-derived duration).
 */
export function TraceScene({
  durationInFrames = 150,
}: {
  durationInFrames?: number;
}) {
  return (
    <AbsoluteFill className="bg-background">
      <CameraRig
        keyframes={[
          { frame: 0, scale: 1.1, originX: 960, originY: 300 },
          { frame: durationInFrames, scale: 1.14, originX: 960, originY: 820 },
        ]}
      >
        <div style={{ position: "absolute", top: 90, left: 360, width: 1200 }}>
          <p
            className="text-muted"
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              margin: 0,
            }}
          >
            AGENT EXECUTION TRACE
          </p>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <h1
                className="text-foreground"
                style={{ fontSize: 32, fontWeight: 600, margin: 0 }}
              >
                Selesaikan pengiriman SH-8821
              </h1>
              <p className="text-muted" style={{ marginTop: 6, fontSize: 15 }}>
                Mulai 21 Okt 2026, 01:58 · Selesai 21 Okt 2026, 02:03
              </p>
            </div>
            <Badge tone="success">completed</Badge>
          </div>

          <ol
            className="border-l border-border"
            style={{
              marginTop: 36,
              paddingLeft: 32,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {steps.map((step, i) => {
              const meta = stepMeta[step.type];
              const Icon = meta.icon;
              return (
                <li key={step.message} style={{ position: "relative" }}>
                  <span
                    className="bg-background"
                    style={{
                      position: "absolute",
                      left: -49,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      border: `1px solid ${meta.color}`,
                      color: meta.color,
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <div
                    className="border border-border bg-surface"
                    style={{ borderRadius: 14, padding: 18 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ fontSize: 13, fontWeight: 700 }}
                      >
                        {String(i + 1).padStart(2, "0")} · {meta.label}
                      </span>
                      {step.tool && (
                        <span
                          className="font-mono text-primary"
                          style={{ fontSize: 13, fontWeight: 600 }}
                        >
                          {step.tool}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-foreground"
                      style={{
                        marginTop: 8,
                        fontSize: 18,
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {step.message}
                    </p>
                    <p
                      className="text-muted"
                      style={{ marginTop: 8, fontSize: 12 }}
                    >
                      {step.time}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
}
