import { z } from "zod";
import { resumeAgentTask } from "@/lib/agent";

const bodySchema = z.object({
  executionId: z.string().min(1),
  approved: z.boolean(),
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
    return Response.json(
      { error: "executionId and approved are required" },
      { status: 400 },
    );
  }

  try {
    const result = await resumeAgentTask(parsed.data.executionId, {
      approved: parsed.data.approved,
    });
    return Response.json({ data: result });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return Response.json({ error }, { status: 500 });
  }
}
