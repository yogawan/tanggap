import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { AgentMessageCard } from "../../components/AgentMessageCard";
import { CameraRig } from "../../components/CameraRig";
import { Cursor, type CursorWaypoint } from "../../components/Cursor";
import { TypingText } from "../../components/TypingText";
import {
  completedMessage,
  notifyCustomerMessage,
  reassignShipmentMessage,
  updateEtaMessage,
  userInstructionMessage,
} from "../../data/script";
import { voiceoverFile } from "../data/narration";
import type { DemoBeatTimings } from "../metadata";

const CONTENT_X = 490;
const CONTENT_WIDTH = 1200;
const TEXTAREA_POINT = { x: 1090, y: 560 };
const SEND_BUTTON_POINT = { x: 1620, y: 615 };
const APPROVE_POINT = { x: 900, y: 700 };
const CLICK_LEAD = 10; // frames the cursor settles before registering a click

function InstructionBeat({
  clickFrame,
  typingDuration,
}: {
  clickFrame: number;
  typingDuration: number;
}) {
  const frame = useCurrentFrame();
  const focused = frame >= clickFrame;

  return (
    <div
      style={{
        position: "absolute",
        top: 440,
        left: CONTENT_X,
        width: CONTENT_WIDTH,
      }}
    >
      <div
        className="border bg-surface"
        style={{
          borderRadius: 32,
          borderColor: focused ? "var(--color-primary)" : "var(--color-border)",
          padding: "28px 100px 28px 28px",
          minHeight: 110,
          fontSize: 22,
          color: "var(--color-foreground)",
          boxShadow: "0 20px 45px -15px rgba(15,23,42,0.15)",
        }}
      >
        <TypingText
          text={userInstructionMessage.content}
          startFrame={clickFrame + 5}
          durationInFrames={typingDuration}
        />
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
        opacity: fadeIn,
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
 * The narrated video's live-demo beat: instruction → investigate →
 * approve → ETA + notify → completion, same SH-8821 data and visual
 * language as the short demo's AgentWorkspaceScene, but every sub-beat's
 * length comes from `beats` (real ElevenLabs audio durations, computed in
 * `../metadata.ts`) instead of hand-picked frame constants.
 */
export function DemoScene({
  durationInFrames,
  beats,
}: {
  durationInFrames: number;
  beats: DemoBeatTimings;
}) {
  const instructionDuration = beats.investigate - beats.instruction;
  const investigateDuration = beats.approve1 - beats.investigate;
  const approve1Duration = beats.etaNotify - beats.approve1;
  const etaNotifyDuration = beats.completion - beats.etaNotify;
  const completionDuration = durationInFrames - beats.completion;

  const bubble1Duration = investigateDuration + approve1Duration;
  const bubble1ApproveLocal = investigateDuration + 15;

  const etaHalf = Math.floor(etaNotifyDuration / 2);
  const notifyDuration = etaNotifyDuration - etaHalf;
  const etaApproveLocal = Math.max(20, etaHalf - 35);
  const notifyApproveLocal = Math.max(20, notifyDuration - 35);

  const sendClickFrame = beats.investigate - 20;

  const cursorWaypoints: CursorWaypoint[] = [
    { frame: 10, x: TEXTAREA_POINT.x, y: TEXTAREA_POINT.y },
    { frame: 20, x: TEXTAREA_POINT.x, y: TEXTAREA_POINT.y, click: true },
    {
      frame: sendClickFrame - CLICK_LEAD,
      x: SEND_BUTTON_POINT.x,
      y: SEND_BUTTON_POINT.y,
    },
    {
      frame: sendClickFrame,
      x: SEND_BUTTON_POINT.x,
      y: SEND_BUTTON_POINT.y,
      click: true,
    },
    {
      frame: beats.investigate,
      x: SEND_BUTTON_POINT.x,
      y: SEND_BUTTON_POINT.y,
    },
    {
      frame: beats.investigate + bubble1ApproveLocal - CLICK_LEAD,
      x: APPROVE_POINT.x,
      y: APPROVE_POINT.y,
    },
    {
      frame: beats.investigate + bubble1ApproveLocal,
      x: APPROVE_POINT.x,
      y: APPROVE_POINT.y,
      click: true,
    },
    {
      frame: beats.etaNotify + etaApproveLocal - CLICK_LEAD,
      x: APPROVE_POINT.x,
      y: APPROVE_POINT.y,
    },
    {
      frame: beats.etaNotify + etaApproveLocal,
      x: APPROVE_POINT.x,
      y: APPROVE_POINT.y,
      click: true,
    },
    {
      frame: beats.etaNotify + etaHalf + notifyApproveLocal - CLICK_LEAD,
      x: APPROVE_POINT.x,
      y: APPROVE_POINT.y,
    },
    {
      frame: beats.etaNotify + etaHalf + notifyApproveLocal,
      x: APPROVE_POINT.x,
      y: APPROVE_POINT.y,
      click: true,
    },
    { frame: durationInFrames, x: APPROVE_POINT.x, y: APPROVE_POINT.y },
  ];

  return (
    <AbsoluteFill className="bg-background">
      <CameraRig
        keyframes={[
          { frame: 0, scale: 1, originX: 960, originY: 540 },
          {
            frame: beats.investigate,
            scale: 1.05,
            originX: 1090,
            originY: 600,
          },
          { frame: beats.etaNotify, scale: 1.1, originX: 1090, originY: 600 },
          { frame: durationInFrames, scale: 1.08, originX: 1090, originY: 600 },
        ]}
      >
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
        </div>

        <Sequence from={0} durationInFrames={beats.investigate} layout="none">
          <InstructionBeat
            clickFrame={20}
            typingDuration={sendClickFrame - 20 - 20}
          />
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
            from={Math.max(0, beats.investigate - 40)}
            durationInFrames={40}
            layout="none"
          >
            <ThinkingIndicator />
          </Sequence>

          <Sequence
            from={beats.investigate}
            durationInFrames={bubble1Duration}
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
                approveClickLocalFrame={bubble1ApproveLocal}
                exitAtLocalFrame={bubble1Duration - 20}
              />
            </div>
          </Sequence>

          <Sequence
            from={beats.etaNotify}
            durationInFrames={etaHalf}
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
                approveClickLocalFrame={etaApproveLocal}
                exitAtLocalFrame={etaHalf - 15}
              />
            </div>
          </Sequence>

          <Sequence
            from={beats.etaNotify + etaHalf}
            durationInFrames={notifyDuration}
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
                approveClickLocalFrame={notifyApproveLocal}
                exitAtLocalFrame={notifyDuration - 15}
              />
            </div>
          </Sequence>

          <Sequence
            from={beats.completion}
            durationInFrames={completionDuration}
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

      <Sequence
        from={beats.instruction}
        durationInFrames={instructionDuration}
        layout="none"
      >
        <Audio src={staticFile(voiceoverFile("demoInstruction"))} />
      </Sequence>
      <Sequence
        from={beats.investigate}
        durationInFrames={investigateDuration}
        layout="none"
      >
        <Audio src={staticFile(voiceoverFile("demoInvestigate"))} />
      </Sequence>
      <Sequence
        from={beats.approve1}
        durationInFrames={approve1Duration}
        layout="none"
      >
        <Audio src={staticFile(voiceoverFile("demoApprove1"))} />
      </Sequence>
      <Sequence
        from={beats.etaNotify}
        durationInFrames={etaNotifyDuration}
        layout="none"
      >
        <Audio src={staticFile(voiceoverFile("demoEtaNotify"))} />
      </Sequence>
      <Sequence
        from={beats.completion}
        durationInFrames={completionDuration}
        layout="none"
      >
        <Audio src={staticFile(voiceoverFile("demoCompletion"))} />
      </Sequence>
    </AbsoluteFill>
  );
}
