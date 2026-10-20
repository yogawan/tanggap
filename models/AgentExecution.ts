import mongoose, { type Document, Schema } from "mongoose";

export interface IPendingApproval {
  tool: string;
  toolCallId: string;
  input: unknown;
  messages: unknown[];
  provider: string;
  model: string;
}

export interface IAgentExecution extends Document {
  task: string;
  shipmentId?: mongoose.Types.ObjectId;
  status: "running" | "completed" | "failed";
  steps: {
    type: "reasoning" | "tool_call" | "tool_result" | "decision";
    tool?: string;
    input?: unknown;
    output?: unknown;
    message?: string;
    timestamp: Date;
  }[];
  pendingApproval?: IPendingApproval | null;
  startedAt: Date;
  completedAt?: Date;
}

const AgentExecutionSchema = new Schema(
  {
    task: {
      type: String,
      required: true,
    },

    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
    },

    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },

    steps: [
      {
        type: {
          type: String,
          enum: ["reasoning", "tool_call", "tool_result", "decision"],
        },
        tool: String,
        input: Schema.Types.Mixed,
        output: Schema.Types.Mixed,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    pendingApproval: {
      type: Schema.Types.Mixed,
      default: null,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.AgentExecution ||
  mongoose.model("AgentExecution", AgentExecutionSchema);
