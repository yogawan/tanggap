"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  SendHorizontal,
  ShieldAlert,
  Truck,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import { links as navLinks } from "@/components/layout/Sidebar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AgentTaskResult } from "@/lib/agent";
import {
  type AgentStage,
  appendMessage,
  type ChatMessage,
  createChat,
  listChats,
  type StoredChat,
} from "@/lib/chat-history";
import { dummyChats } from "@/lib/dummy-chats";
import { useTimeGreeting } from "@/lib/useTimeGreeting";

const dummyChatIds = new Set(dummyChats.map((chat) => chat.id));

const templates = [
  { icon: Wrench, text: "Resolve shipment SH-8821" },
  { icon: Search, text: "Investigate SH-8821" },
  { icon: AlertTriangle, text: "Why is SH-8821 delayed?" },
  { icon: Truck, text: "Find available drivers" },
  { icon: ClipboardList, text: "Show critical exceptions" },
  { icon: ShieldAlert, text: "Handle all critical logistics exceptions" },
];

const stageMeta: Record<AgentStage, { label: string; image: string }> = {
  investigate: { label: "Investigate", image: "/Investigate.png" },
  reason: { label: "Reason", image: "/Reason.png" },
  plan: { label: "Plan", image: "/Plan.png" },
  execute: { label: "Execute", image: "/Execute.png" },
  verify: { label: "Verify", image: "/Verify.png" },
};

// Each row fades a bit more than the last, like the landing page Hero.
const templateFadeOpacity = [
  "opacity-100",
  "opacity-[0.85]",
  "opacity-[0.70]",
  "opacity-[0.55]",
  "opacity-[0.40]",
  "opacity-[0.30]",
];

type ApiEnvelope = { data?: AgentTaskResult; error?: string };

async function callAgentApi(
  url: string,
  body: unknown,
): Promise<AgentTaskResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiEnvelope;
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? `Request failed (${res.status})`);
  }
  return json.data;
}

function resultToMessage(result: AgentTaskResult): ChatMessage {
  const createdAt = new Date().toISOString();
  if (result.status === "pending_approval") {
    return {
      role: "agent",
      content: result.message,
      status: "pending_approval",
      executionId: result.executionId,
      tool: result.tool,
      input: result.input,
      createdAt,
    };
  }
  if (result.status === "completed") {
    return {
      role: "agent",
      content: result.message,
      status: "completed",
      executionId: result.executionId,
      createdAt,
    };
  }
  return {
    role: "agent",
    content: result.error,
    status: "failed",
    executionId: result.executionId,
    createdAt,
  };
}

export default function AgentWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <AgentWorkspace />
    </Suspense>
  );
}

function AgentWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const greeting = useTimeGreeting();

  const [chats, setChats] = useState<StoredChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const autoSentRef = useRef(false);

  const allChats = [...dummyChats, ...chats];
  const activeChat = allChats.find((chat) => chat.id === activeChatId);
  const isDummyChat = activeChat ? dummyChatIds.has(activeChat.id) : false;

  useEffect(() => {
    setChats(listChats());
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only ever fires once per mount, guarded by autoSentRef — intentionally not re-running when router/handleSend identity changes
  useEffect(() => {
    if (autoSentRef.current) return;
    const initial = searchParams.get("message");
    if (!initial) return;
    autoSentRef.current = true;
    router.replace("/agent");
    void handleSend(initial);
  }, [searchParams]);

  function refreshChats() {
    setChats(listChats());
  }

  function handleNewChat() {
    setActiveChatId(null);
    setInput("");
  }

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    let chatId = activeChatId;
    if (!chatId) {
      const chat = createChat(trimmed);
      chatId = chat.id;
      setActiveChatId(chatId);
    }

    appendMessage(chatId, {
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    });
    refreshChats();
    setInput("");
    setSending(true);

    try {
      const result = await callAgentApi("/api/agent/chat", {
        message: trimmed,
      });
      appendMessage(chatId, resultToMessage(result));
    } catch (err) {
      appendMessage(chatId, {
        role: "agent",
        content: err instanceof Error ? err.message : String(err),
        status: "failed",
        createdAt: new Date().toISOString(),
      });
    } finally {
      refreshChats();
      setSending(false);
    }
  }

  async function handleDecision(approved: boolean) {
    if (!activeChat || sending) return;
    const last = activeChat.messages.at(-1);
    if (!last || last.role !== "agent" || last.status !== "pending_approval") {
      return;
    }

    setSending(true);
    try {
      const result = await callAgentApi("/api/agent/approve", {
        executionId: last.executionId,
        approved,
      });
      appendMessage(activeChat.id, resultToMessage(result));
    } catch (err) {
      appendMessage(activeChat.id, {
        role: "agent",
        content: err instanceof Error ? err.message : String(err),
        status: "failed",
        createdAt: new Date().toISOString(),
      });
    } finally {
      refreshChats();
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void handleSend(input);
  }

  const lastMessage = activeChat?.messages.at(-1);
  const awaitingDecision =
    !sending &&
    lastMessage?.role === "agent" &&
    lastMessage.status === "pending_approval";

  return (
    <div className="flex items-start">
      <aside
        className={`sticky top-0 h-screen shrink-0 overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ${
          collapsed ? "w-0 border-r-0" : "w-64"
        }`}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex items-center gap-2 border-b border-border p-4 font-semibold text-foreground">
            <Image
              src="/TanggapAI-Logo.png"
              alt="TanggapAI"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 object-contain"
            />
            TanggapAI
          </div>
          <div className="border-b border-border p-4">
            <Button className="w-full" onClick={handleNewChat}>
              + Chat Baru
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {allChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => setActiveChatId(chat.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  chat.id === activeChatId
                    ? "bg-primary-light text-primary"
                    : "text-foreground hover:bg-background"
                }`}
              >
                <span className="truncate">{chat.title || "Chat baru"}</span>
                {dummyChatIds.has(chat.id) && <Badge tone="info">Demo</Badge>}
              </button>
            ))}
          </div>
          <nav className="flex flex-col gap-1 border-t border-border p-4">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-light text-primary"
                      : "text-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
        className="sticky top-4 z-10 ml-2 flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        {!activeChat || activeChat.messages.length === 0 ? (
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
            <div className="text-center">
              <div className="flex justify-center">
                <Image
                  src="/Tanggap.png"
                  alt="Tanggap"
                  width={112}
                  height={112}
                  className="h-28 w-28 object-contain"
                />
              </div>
              <p className="mt-2 text-xl font-medium text-muted sm:text-2xl">
                {greeting}, aku Tanggap
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-.02em] text-foreground sm:text-4xl">
                Ada yang ingin kamu{" "}
                <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                  tangani
                </span>{" "}
                hari ini?
              </h1>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSubmit} className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-primary to-info opacity-40 blur-2xl"
                />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Jelaskan masalah operasional yang ingin diselesaikan..."
                  rows={5}
                  className="relative w-full resize-none rounded-[2rem] border border-border bg-surface py-7 pr-24 pl-7 text-lg text-foreground shadow-xl shadow-foreground/5 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={sending || input.trim().length === 0}
                  aria-label="Kirim instruksi"
                  className="absolute right-5 bottom-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
                >
                  <SendHorizontal className="h-6 w-6" />
                </button>
              </form>

              <div className="mt-8 flex flex-col gap-1">
                {templates.map((template, index) => (
                  <button
                    key={template.text}
                    type="button"
                    onClick={() => setInput(template.text)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary-light/40"
                  >
                    <template.icon
                      className="h-4 w-4 shrink-0 text-primary"
                      strokeWidth={1.75}
                    />
                    <span
                      className={`text-sm text-foreground ${templateFadeOpacity[index] ?? ""}`}
                    >
                      {template.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {isDummyChat && (
              <div className="border-b border-primary-light bg-primary-light/30 px-6 py-3 text-xs font-medium text-primary">
                Contoh skenario — menunjukkan bagaimana TanggapAI menyelesaikan
                kasus ini secara end-to-end.
              </div>
            )}
            <div className="space-y-4 p-6">
              {activeChat.messages.map((message, i) => (
                <MessageBubble
                  // biome-ignore lint/suspicious/noArrayIndexKey: messages are append-only, never reordered
                  key={i}
                  message={message}
                  actionable={
                    !isDummyChat &&
                    i === activeChat.messages.length - 1 &&
                    awaitingDecision
                  }
                  onDecision={handleDecision}
                />
              ))}
              {sending && (
                <div className="flex items-start justify-start gap-2">
                  <Image
                    src="/Tanggap.png"
                    alt="Tanggap"
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 object-contain"
                  />
                  <div className="rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3 text-sm text-muted">
                    Tanggap sedang bekerja…
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 px-6 pb-6">
              {isDummyChat ? (
                <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-4 text-center text-sm text-muted shadow-xl shadow-foreground/10">
                  Ini contoh demo yang sudah selesai.{" "}
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="font-medium text-primary hover:underline"
                  >
                    Mulai chat baru
                  </button>{" "}
                  untuk mencoba sendiri.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
                  <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-xl shadow-foreground/10">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder='Contoh: "Resolve shipment SH-8821"'
                      rows={2}
                      className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none"
                    />
                    <Button
                      type="submit"
                      disabled={sending || input.trim().length === 0}
                    >
                      Kirim
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  actionable,
  onDecision,
}: {
  message: ChatMessage;
  actionable: boolean;
  onDecision: (approved: boolean) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-lg rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  const tone: BadgeTone =
    message.status === "completed"
      ? "success"
      : message.status === "failed"
        ? "danger"
        : "primary";

  const label =
    message.status === "pending_approval"
      ? "Menunggu persetujuan"
      : message.status === "completed"
        ? "Selesai"
        : "Gagal";

  return (
    <div className="flex items-start justify-start gap-2">
      <Image
        src="/Tanggap.png"
        alt="Tanggap"
        width={64}
        height={64}
        className="h-16 w-16 shrink-0 object-contain"
      />
      <div className="max-w-lg space-y-3 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3 text-sm text-foreground">
        <div>
          <Badge tone={tone}>{label}</Badge>
          {message.stages && message.stages.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
              {message.stages.map((stage, i) => (
                <span key={stage} className="inline-flex items-center gap-2">
                  {i > 0 && <span className="text-border">|</span>}
                  <Image
                    src={stageMeta[stage].image}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                  {stageMeta[stage].label}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="whitespace-pre-wrap leading-6">{message.content}</p>
        {message.status === "pending_approval" && (
          <div className="rounded-xl border border-primary-light bg-primary-light/30 p-3">
            <p className="font-mono text-xs font-semibold text-primary">
              {message.tool}
            </p>
            <pre className="mt-1 overflow-x-auto text-xs text-muted">
              {JSON.stringify(message.input, null, 2)}
            </pre>
            {actionable && (
              <div className="mt-3 flex gap-2">
                <Button onClick={() => onDecision(true)}>Approve</Button>
                <Button variant="secondary" onClick={() => onDecision(false)}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
        {message.executionId && !message.executionId.startsWith("demo-") && (
          <Link
            href={`/agent/${message.executionId}`}
            className="inline-block text-xs font-medium text-primary hover:underline"
          >
            Lihat trace lengkap →
          </Link>
        )}
      </div>
    </div>
  );
}
