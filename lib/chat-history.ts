// The five stages of TanggapAI's resolution workflow — see the "Capabilities"
// section on the landing page. Agent messages can tag which stage(s) of that
// workflow they cover so the chat UI can show matching labels.
export type AgentStage =
  | "investigate"
  | "reason"
  | "plan"
  | "execute"
  | "verify";

export type ChatMessage =
  | { role: "user"; content: string; createdAt: string }
  | {
      role: "agent";
      content: string;
      createdAt: string;
      // Absent only when the request never reached the server at all (e.g.
      // a network failure) — any server-reported outcome always has one.
      executionId?: string;
      status: "completed" | "failed";
      stages?: AgentStage[];
    }
  | {
      role: "agent";
      content: string;
      createdAt: string;
      executionId: string;
      status: "pending_approval";
      tool: string;
      input: unknown;
      stages?: AgentStage[];
    };

export type StoredChat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "tanggapai.chat-history";
const TITLE_MAX_LENGTH = 60;

function readAll(): StoredChat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredChat[]) : [];
  } catch {
    return [];
  }
}

function writeAll(chats: StoredChat[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function deriveTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  return trimmed.length > TITLE_MAX_LENGTH
    ? `${trimmed.slice(0, TITLE_MAX_LENGTH)}…`
    : trimmed;
}

export function listChats(): StoredChat[] {
  return readAll().sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
}

export function getChat(id: string): StoredChat | undefined {
  return readAll().find((chat) => chat.id === id);
}

export function createChat(firstMessage: string): StoredChat {
  const now = new Date().toISOString();
  const chat: StoredChat = {
    id: crypto.randomUUID(),
    title: deriveTitle(firstMessage),
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  const chats = readAll();
  chats.push(chat);
  writeAll(chats);
  return chat;
}

export function appendMessage(chatId: string, message: ChatMessage): void {
  const chats = readAll();
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return;
  chat.messages.push(message);
  chat.updatedAt = message.createdAt;
  writeAll(chats);
}

export function deleteChat(chatId: string): void {
  writeAll(readAll().filter((chat) => chat.id !== chatId));
}
