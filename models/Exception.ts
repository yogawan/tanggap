import mongoose, { type Document, Schema } from "mongoose";

export interface IException extends Document {
  shipmentId: mongoose.Types.ObjectId;
  type:
    | "vehicle_breakdown"
    | "driver_unavailable"
    | "route_blocked"
    | "late_delivery";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "ignored";
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
}

const ExceptionSchema = new Schema(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "vehicle_breakdown",
        "driver_unavailable",
        "route_blocked",
        "late_delivery",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "ignored"],
      default: "open",
    },

    description: String,

    detectedAt: {
      type: Date,
      default: Date.now,
    },

    resolvedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.Exception ||
  mongoose.model("Exception", ExceptionSchema);
