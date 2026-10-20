import OpenAI from "openai";

// Groq exposes an OpenAI-compatible endpoint (/openai/v1/chat/completions),
// so this reuses the `openai` SDK instead of adding `groq-sdk` as a second
// client — same ChatCompletion types as lib/deepseek.ts, zero changes needed
// in reasoning-loop.ts beyond picking which client/model to call.
export const GROQ_MODEL = "openai/gpt-oss-20b";

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
