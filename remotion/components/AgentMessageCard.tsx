import {
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AgentStage } from "@/lib/chat-history";

// Mirrors the (unexported) stageMeta map in app/(dashboard)/agent/page.tsx —
// same labels and public/ icons, kept local since that page doesn't export it.
const stageMeta: Record<AgentStage, { label: string; image: string }> = {
  investigate: { label: "Investigate", image: "Investigate.png" },
  reason: { label: "Reason", image: "Reason.png" },
  plan: { label: "Plan", image: "Plan.png" },
  execute: { label: "Execute", image: "Execute.png" },
  verify: { label: "Verify", image: "Verify.png" },
};

export type AgentMessageCardProps = {
  stages: AgentStage[];
  content: string;
  status: "pending_approval" | "completed";
  tool?: string;
  input?: unknown;
  showTraceLink?: boolean;
  /** Local frame (relative to this card's own Sequence) the cursor clicks Approve. */
  approveClickLocalFrame?: number;
  /** Local frame to start fading this card out (for crossfading into the next turn). Omit to keep it on screen. */
  exitAtLocalFrame?: number;
};

/**
 * Remotion-safe rebuild of the agent chat bubble from the real Agent
 * Workspace (`app/(dashboard)/agent/page.tsx`'s `MessageBubble`). Reuses
 * `Badge`/`Button` as-is (they have no Next.js/GSAP coupling); everything
 * that animates is driven by `useCurrentFrame()` instead of the real page's
 * mount-triggered `<Reveal>` (GSAP), which doesn't render deterministically
 * frame-by-frame.
 */
export function AgentMessageCard({
  stages,
  content,
  status,
  tool,
  input,
  showTraceLink = false,
  approveClickLocalFrame,
  exitAtLocalFrame,
}: AgentMessageCardProps) {
  const frame = useCurrentFrame();
  const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

  const enter = interpolate(frame, [0, 16], [0, 1], {
    easing: easeOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit =
    exitAtLocalFrame === undefined
      ? 1
      : interpolate(frame, [exitAtLocalFrame, exitAtLocalFrame + 15], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const body = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panel = interpolate(frame, [30, 46], [0, 1], {
    easing: easeOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const buttonsIn = interpolate(frame, [44, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonsOut =
    approveClickLocalFrame === undefined
      ? 1
      : interpolate(
          frame,
          [approveClickLocalFrame + 8, approveClickLocalFrame + 22],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
  const buttonsOpacity = Math.min(buttonsIn, buttonsOut);

  const approvePress =
    approveClickLocalFrame === undefined
      ? 1
      : interpolate(
          frame,
          [
            approveClickLocalFrame - 4,
            approveClickLocalFrame + 2,
            approveClickLocalFrame + 8,
          ],
          [1, 0.94, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  const traceLink = interpolate(frame, [38, 54], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tone: BadgeTone = status === "completed" ? "success" : "primary";
  const label = status === "completed" ? "Selesai" : "Menunggu persetujuan";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        opacity: enter * exit,
        translate: `0px ${interpolate(enter, [0, 1], [16, 0])}px`,
      }}
    >
      <Img
        src={staticFile("TRACIA.png")}
        style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }}
      />
      <div
        className="rounded-2xl rounded-bl-sm border border-border bg-surface text-foreground"
        style={{
          minWidth: 0,
          maxWidth: 920,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          fontSize: 20,
          lineHeight: 1.6,
        }}
      >
        <div>
          <Badge tone={tone}>{label}</Badge>
          {stages.length > 0 && (
            <div
              className="text-muted"
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {stages.map((stage, i) => {
                const badgeIn = interpolate(
                  frame,
                  [6 + i * 5, 14 + i * 5],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                return (
                  <span
                    key={stage}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: badgeIn,
                    }}
                  >
                    {i > 0 && <span className="text-border">|</span>}
                    <Img
                      src={staticFile(stageMeta[stage].image)}
                      style={{ width: 32, height: 32, objectFit: "contain" }}
                    />
                    {stageMeta[stage].label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <p
          className="text-foreground"
          style={{ whiteSpace: "pre-wrap", opacity: body, margin: 0 }}
        >
          {content}
        </p>

        {status === "pending_approval" && (
          <div
            className="rounded-xl border border-primary-light bg-primary-light/30"
            style={{
              padding: 16,
              opacity: panel,
              scale: interpolate(panel, [0, 1], [0.97, 1]),
              transformOrigin: "top left",
            }}
          >
            <p
              className="font-mono text-primary"
              style={{ fontSize: 15, fontWeight: 600, margin: 0 }}
            >
              {tool}
            </p>
            <pre
              className="text-muted"
              style={{ marginTop: 6, fontSize: 14, overflowX: "auto" }}
            >
              {JSON.stringify(input, null, 2)}
            </pre>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 10,
                opacity: buttonsOpacity,
              }}
            >
              <Button style={{ fontSize: 15, scale: approvePress }}>
                Approve
              </Button>
              <Button variant="secondary" style={{ fontSize: 15 }}>
                Reject
              </Button>
            </div>
          </div>
        )}

        {showTraceLink && (
          <div
            className="text-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 15,
              fontWeight: 500,
              opacity: traceLink,
            }}
          >
            Lihat trace lengkap →
          </div>
        )}
      </div>
    </div>
  );
}
