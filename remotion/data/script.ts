import type { ChatMessage } from "@/lib/chat-history";
import { dummyChats } from "@/lib/dummy-chats";

// Reuse the app's own scripted showcase conversation instead of writing new
// copy — this is the exact dialogue a visitor sees in the real Agent
// Workspace when picking the "Selesaikan pengiriman SH-8821" demo chat.
const conversation = dummyChats.find(
  (chat) => chat.id === "demo-resolve-sh-8821",
);

if (!conversation) {
  throw new Error("lib/dummy-chats.ts: 'demo-resolve-sh-8821' entry not found");
}

function expectPendingApproval(message: ChatMessage) {
  if (message.role !== "agent" || message.status !== "pending_approval") {
    throw new Error("Expected a pending_approval agent message");
  }
  return message;
}

function expectCompleted(message: ChatMessage) {
  if (message.role !== "agent" || message.status !== "completed") {
    throw new Error("Expected a completed agent message");
  }
  return message;
}

export const userInstructionMessage = conversation.messages[0];
export const reassignShipmentMessage = expectPendingApproval(
  conversation.messages[1],
);
export const updateEtaMessage = expectPendingApproval(conversation.messages[2]);
export const notifyCustomerMessage = expectPendingApproval(
  conversation.messages[3],
);
export const completedMessage = expectCompleted(conversation.messages[4]);
