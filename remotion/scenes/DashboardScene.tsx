import { AbsoluteFill, Img, staticFile } from "remotion";
import { Card } from "@/components/ui/Card";
import { CameraRig } from "../components/CameraRig";
import { Cursor, type CursorWaypoint } from "../components/Cursor";

const stats: { label: string; value: string | number; image: string }[] = [
  { label: "Total Shipments", value: 128, image: "Total Shipments.png" },
  { label: "Delayed Shipments", value: 6, image: "Delayed Shipments.png" },
  {
    label: "Critical Exceptions",
    value: 1,
    image: "Critical Exceptions.png",
  },
  {
    label: "Resolved Exceptions",
    value: 42,
    image: "Resolved Exceptions.png",
  },
  {
    label: "Agent Resolution Rate",
    value: "94%",
    image: "Agent Resolution Rate.png",
  },
];

// Sidebar nav link centers, in this scene's own coordinate space.
const AGENT_WORKSPACE_LINK = { x: 120, y: 160 };

const cursorWaypoints: CursorWaypoint[] = [
  { frame: 0, x: 1600, y: 180 },
  { frame: 45, x: 1600, y: 180 },
  { frame: 100, x: AGENT_WORKSPACE_LINK.x, y: AGENT_WORKSPACE_LINK.y },
  {
    frame: 118,
    x: AGENT_WORKSPACE_LINK.x,
    y: AGENT_WORKSPACE_LINK.y,
    click: true,
  },
  { frame: 135, x: AGENT_WORKSPACE_LINK.x, y: AGENT_WORKSPACE_LINK.y },
];

/**
 * Opening shot — a replica of the Overview dashboard's stat-card hero.
 * Slow zoom onto "Critical Exceptions", then the cursor glides to the
 * sidebar and clicks into the Agent Workspace, motivating the cut to
 * `AgentWorkspaceScene`.
 *
 * `brandName`/`logoSrc` default to the live app's own branding — the
 * narrated pitch video overrides them to TRACIA without touching the short
 * demo, which renders this same component unmodified.
 */
export function DashboardScene({
  brandName = "TRACIA",
  logoSrc = "TRACIA-logo.png",
}: {
  brandName?: string;
  logoSrc?: string;
}) {
  return (
    <AbsoluteFill className="bg-background">
      <CameraRig
        keyframes={[
          { frame: 0, scale: 1, originX: 1080, originY: 340 },
          { frame: 110, scale: 1.14, originX: 1080, originY: 340 },
          { frame: 135, scale: 1.14, originX: 1080, originY: 340 },
        ]}
      >
        <div
          className="border-r border-border bg-surface"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 240,
            height: 1080,
          }}
        >
          <div
            className="border-b border-border text-foreground"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 16,
              fontWeight: 600,
            }}
          >
            <Img
              src={staticFile(logoSrc)}
              style={{ width: 40, height: 40, objectFit: "contain" }}
            />
            {brandName}
          </div>
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 16,
            }}
          >
            <div
              className="bg-primary-light text-primary"
              style={{
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              Dashboard
            </div>
            <div
              className="text-muted"
              style={{
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              Agent Workspace
            </div>
          </nav>
        </div>

        <div style={{ position: "absolute", top: 96, left: 320, width: 1520 }}>
          <p
            className="text-primary"
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              margin: 0,
            }}
          >
            OPERATIONS OVERVIEW
          </p>
          <h1
            className="text-foreground"
            style={{
              marginTop: 10,
              fontSize: 48,
              fontWeight: 600,
              letterSpacing: -1,
            }}
          >
            Dashboard
          </h1>

          <div
            style={{
              marginTop: 48,
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 20,
            }}
          >
            {stats.map((stat) => (
              <Card key={stat.label}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <p
                      className="text-muted"
                      style={{ fontSize: 14, fontWeight: 500, margin: 0 }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="text-foreground"
                      style={{ marginTop: 8, fontSize: 30, fontWeight: 600 }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <Img
                    src={staticFile(stat.image)}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Cursor waypoints={cursorWaypoints} />
      </CameraRig>
    </AbsoluteFill>
  );
}
