import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "../../models/db";

export type RiskLevel = "low" | "high";

export type ToolResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ToolDefinition<TInput, TOutput> = {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  inputSchema: z.ZodType<TInput>;
  handler: (rawInput: unknown) => Promise<ToolResult<TOutput>>;
};

export function defineTool<TInput, TOutput>(def: {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  inputSchema: z.ZodType<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}): ToolDefinition<TInput, TOutput> {
  return {
    name: def.name,
    description: def.description,
    riskLevel: def.riskLevel,
    inputSchema: def.inputSchema,
    async handler(rawInput) {
      const parsed = def.inputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error.issues.map((issue) => issue.message).join("; "),
        };
      }
      try {
        await dbConnect();
        const data = await def.execute(parsed.data);
        return { success: true, data };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}

export const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
  });
