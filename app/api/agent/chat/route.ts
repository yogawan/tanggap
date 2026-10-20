import { z } from "zod";
import { runAgentTask } from "@/lib/agent";

const bodySchema = z.object({
  message: z.string().min(1),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const result = await runAgentTask(parsed.data.message);
    return Response.json({ data: result });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return Response.json({ error }, { status: 500 });
  }
}
