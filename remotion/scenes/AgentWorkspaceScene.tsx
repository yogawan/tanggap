import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { AgentMessageCard } from "../components/AgentMessageCard";
import { CameraRig } from "../components/CameraRig";
import { Cursor, type CursorWaypoint } from "../components/Cursor";
import { TypingText } from "../components/TypingText";
import {
  completedMessage,
  notifyCustomerMessage,
  reassignShipmentMessage,
  updateEtaMessage,
  userInstructionMessage,
} from "../data/script";

// Sidebar: x 0-260. Content column: x 490-1690 (1200 wide), centered in the
// remaining 1660px, matching the real Agent Workspace's chat column.
const CONTENT_X = 490;
const CONTENT_WIDTH = 1200;
const TEXTAREA_POINT = { x: 1090, y: 690 };
const SEND_BUTTON_POINT = { x: 1620, y: 745 };

// Beat timeline (scene-local frames). AGENT_SCENE_DURATION is 960 (see
// remotion/constants.ts) — kept in sync by eye against that constant.
const TEXTAREA_CLICK = 55;
const TYPING_START = 60;
const TYPING_DURATION = 85;
const SEND_CLICK = 180;
const CHAT_IN_START = 185;
const THINKING_IN = 195;
const AGENT_1_START = 250;
const AGENT_1_APPROVE_LOCAL = 165;
const AGENT_2_START = 430;
const AGENT_2_APPROVE_LOCAL = 140;
const AGENT_3_START = 585;
const AGENT_3_APPROVE_LOCAL = 140;
const AGENT_4_START = 740;
const AGENT_4_TRACE_CLICK_LOCAL = 160;

// Approximate on-screen Approve-button position for each turn (content
// length pushes it down/up slightly) — tuned by eye in Remotion Studio.
const APPROVE_POINTS = {
  1: { x: 900, y: 700 },
  2: { x: 900, y: 650 },
  3: { x: 900, y: 660 },
};
const TRACE_LINK_POINT = { x: 1250, y: 760 };

const cursorWaypoints: CursorWaypoint[] = [
  { frame: 10, x: 1300, y: 420 },
  { frame: 50, x: TEXTAREA_POINT.x, y: TEXTAREA_POINT.y },
  {
    frame: TEXTAREA_CLICK,
    x: TEXTAREA_POINT.x,
    y: TEXTAREA_POINT.y,
    click: true,
  },
  { frame: 150, x: TEXTAREA_POINT.x, y: TEXTAREA_POINT.y },
  { frame: 178, x: SEND_BUTTON_POINT.x, y: SEND_BUTTON_POINT.y },
  {
    frame: SEND_CLICK,
    x: SEND_BUTTON_POINT.x,
    y: SEND_BUTTON_POINT.y,
    click: true,
  },
  { frame: 195, x: SEND_BUTTON_POINT.x, y: SEND_BUTTON_POINT.y },
  {
    frame: AGENT_1_START + AGENT_1_APPROVE_LOCAL - 15,
    x: APPROVE_POINTS[1].x,
    y: APPROVE_POINTS[1].y,
  },
  {
    frame: AGENT_1_START + AGENT_1_APPROVE_LOCAL,
    x: APPROVE_POINTS[1].x,
    y: APPROVE_POINTS[1].y,
    click: true,
  },
  {
    frame: AGENT_1_START + AGENT_1_APPROVE_LOCAL + 5,
    x: APPROVE_POINTS[1].x,
    y: APPROVE_POINTS[1].y,
  },
  {
    frame: AGENT_2_START + AGENT_2_APPROVE_LOCAL - 15,
    x: APPROVE_POINTS[2].x,
    y: APPROVE_POINTS[2].y,
  },
  {
    frame: AGENT_2_START + AGENT_2_APPROVE_LOCAL,
    x: APPROVE_POINTS[2].x,
    y: APPROVE_POINTS[2].y,
    click: true,
  },
  {
    frame: AGENT_2_START + AGENT_2_APPROVE_LOCAL + 5,
    x: APPROVE_POINTS[2].x,
    y: APPROVE_POINTS[2].y,
  },
  {
    frame: AGENT_3_START + AGENT_3_APPROVE_LOCAL - 15,
    x: APPROVE_POINTS[3].x,
    y: APPROVE_POINTS[3].y,
  },
  {
    frame: AGENT_3_START + AGENT_3_APPROVE_LOCAL,
    x: APPROVE_POINTS[3].x,
    y: APPROVE_POINTS[3].y,
    click: true,
  },
  {
    frame: AGENT_3_START + AGENT_3_APPROVE_LOCAL + 5,
    x: APPROVE_POINTS[3].x,
    y: APPROVE_POINTS[3].y,
  },
  {
    frame: AGENT_4_START + AGENT_4_TRACE_CLICK_LOCAL - 20,
    x: TRACE_LINK_POINT.x,
    y: TRACE_LINK_POINT.y,
  },
  {
    frame: AGENT_4_START + AGENT_4_TRACE_CLICK_LOCAL,
    x: TRACE_LINK_POINT.x,
    y: TRACE_LINK_POINT.y,
    click: true,
  },
  { frame: 960, x: TRACE_LINK_POINT.x, y: TRACE_LINK_POINT.y },
];

function EmptyStateHero() {
  const frame = useCurrentFrame();
  const heroIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heroOut = interpolate(frame, [SEND_CLICK, SEND_CLICK + 25], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const focused = frame >= TEXTAREA_CLICK;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: CONTENT_X,
        width: CONTENT_WIDTH,
        opacity: heroIn * heroOut,
      }}
    >
      <div style={{ textAlign: "center", marginTop: 220 }}>
        <Img
          src={staticFile("TRACIA.png")}
          style={{
            width: 96,
            height: 96,
            objectFit: "contain",
            margin: "0 auto",
          }}
        />
        <p
          className="text-muted"
          style={{ marginTop: 14, fontSize: 24, fontWeight: 500 }}
        >
          Selamat siang, aku TRACIA
        </p>
        <h1
          className="text-foreground"
          style={{
            marginTop: 6,
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: -0.5,
          }}
        >
          Ada yang ingin kamu{" "}
          <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            tangani
          </span>{" "}
          hari ini?
        </h1>
      </div>

      <div style={{ position: "relative", marginTop: 56 }}>
        <div
          className="border bg-surface"
          style={{
            borderRadius: 32,
            borderColor: focused
              ? "var(--color-primary)"
              : "var(--color-border)",
            padding: "28px 100px 28px 28px",
            minHeight: 110,
            fontSize: 22,
            color: "var(--color-foreground)",
            boxShadow: "0 20px 45px -15px rgba(15,23,42,0.15)",
          }}
        >
          <TypingText
            text={userInstructionMessage.content}
            startFrame={TYPING_START}
            durationInFrames={TYPING_DURATION}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-primary)",
            scale: interpolate(
              frame,
              [SEND_CLICK - 4, SEND_CLICK + 2, SEND_CLICK + 8],
              [1, 0.88, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          <svg
            aria-hidden="true"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M3 11L21 3L13 21L11 13L3 11Z" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserBubble() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: CONTENT_X,
        width: CONTENT_WIDTH,
        display: "flex",
        justifyContent: "flex-end",
        opacity: enter,
        translate: `${interpolate(enter, [0, 1], [16, 0])}px 0px`,
      }}
    >
      <div
        className="bg-primary"
        style={{
          borderRadius: 20,
          borderBottomRightRadius: 6,
          padding: "16px 22px",
          color: "white",
          fontSize: 20,
          maxWidth: 760,
        }}
      >
        {userInstructionMessage.content}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [AGENT_1_START - THINKING_IN, AGENT_1_START - THINKING_IN + 15],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: CONTENT_WIDTH,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: fadeIn * fadeOut,
      }}
    >
      <Img
        src={staticFile("TRACIA.png")}
        style={{ width: 56, height: 56, objectFit: "contain" }}
      />
      <div
        className="border border-border bg-surface text-muted"
        style={{
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          padding: "16px 22px",
          fontSize: 18,
        }}
      >
        TRACIA sedang bekerja…
      </div>
    </div>
  );
}

/**
 * The core scene — empty-state greeting, typed instruction, send, then four
 * agent turns (reassignShipment → updateETA → notifyCustomer → completed)
 * that crossfade in the same on-screen slot rather than a scrolling feed,
 * each gated behind a simulated Approve click, ending on a click into the
 * execution trace link.
 */
export function AgentWorkspaceScene() {
  return (
    <AbsoluteFill className="bg-background">
      <CameraRig
        keyframes={[
          { frame: 0, scale: 1, originX: 960, originY: 540 },
          { frame: 180, scale: 1, originX: 960, originY: 540 },
          { frame: 250, scale: 1.05, originX: 1090, originY: 600 },
          { frame: 415, scale: 1.1, originX: 1090, originY: 600 },
          { frame: 900, scale: 1.08, originX: 1150, originY: 650 },
          { frame: 960, scale: 1.08, originX: 1150, originY: 650 },
        ]}
      >
        {/* Sidebar chrome, static for the whole scene */}
        <div
          className="border-r border-border bg-surface"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 260,
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
              src={staticFile("TRACIA-logo.png")}
              style={{ width: 40, height: 40, objectFit: "contain" }}
            />
            TRACIA
          </div>
          <div style={{ padding: 16 }}>
            <div
              className="bg-primary text-white"
              style={{
                borderRadius: 10,
                padding: "10px 0",
                textAlign: "center",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              + Chat Baru
            </div>
          </div>
          <div
            className="bg-primary-light text-primary"
            style={{
              margin: "0 16px",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Selesaikan pengiriman SH-8821
          </div>
        </div>

        <Sequence from={0} durationInFrames={SEND_CLICK + 30} layout="none">
          <EmptyStateHero />
        </Sequence>

        <Sequence from={CHAT_IN_START} layout="none">
          <UserBubble />
        </Sequence>

        <div
          style={{
            position: "absolute",
            top: 260,
            left: CONTENT_X,
            width: CONTENT_WIDTH,
          }}
        >
          <Sequence
            from={THINKING_IN}
            durationInFrames={AGENT_1_START - THINKING_IN + 15}
            layout="none"
          >
            <ThinkingIndicator />
          </Sequence>

          <Sequence
            from={AGENT_1_START}
            durationInFrames={AGENT_2_START - AGENT_1_START + 20}
            layout="none"
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CONTENT_WIDTH,
              }}
            >
              <AgentMessageCard
                stages={reassignShipmentMessage.stages ?? []}
                content={reassignShipmentMessage.content}
                status="pending_approval"
                tool={reassignShipmentMessage.tool}
                input={reassignShipmentMessage.input}
                approveClickLocalFrame={AGENT_1_APPROVE_LOCAL}
                exitAtLocalFrame={AGENT_2_START - AGENT_1_START}
              />
            </div>
          </Sequence>

          <Sequence
            from={AGENT_2_START}
            durationInFrames={AGENT_3_START - AGENT_2_START + 20}
            layout="none"
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CONTENT_WIDTH,
              }}
            >
              <AgentMessageCard
                stages={updateEtaMessage.stages ?? []}
                content={updateEtaMessage.content}
                status="pending_approval"
                tool={updateEtaMessage.tool}
                input={updateEtaMessage.input}
                approveClickLocalFrame={AGENT_2_APPROVE_LOCAL}
                exitAtLocalFrame={AGENT_3_START - AGENT_2_START}
              />
            </div>
          </Sequence>

          <Sequence
            from={AGENT_3_START}
            durationInFrames={AGENT_4_START - AGENT_3_START + 20}
            layout="none"
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CONTENT_WIDTH,
              }}
            >
              <AgentMessageCard
                stages={notifyCustomerMessage.stages ?? []}
                content={notifyCustomerMessage.content}
                status="pending_approval"
                tool={notifyCustomerMessage.tool}
                input={notifyCustomerMessage.input}
                approveClickLocalFrame={AGENT_3_APPROVE_LOCAL}
                exitAtLocalFrame={AGENT_4_START - AGENT_3_START}
              />
            </div>
          </Sequence>

          <Sequence from={AGENT_4_START} layout="none">
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CONTENT_WIDTH,
              }}
            >
              <AgentMessageCard
                stages={completedMessage.stages ?? []}
                content={completedMessage.content}
                status="completed"
                showTraceLink
              />
            </div>
          </Sequence>
        </div>

        <Cursor waypoints={cursorWaypoints} />
      </CameraRig>
    </AbsoluteFill>
  );
}
