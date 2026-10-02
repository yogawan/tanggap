import mongoose, { type Document, Schema } from "mongoose";

export interface INotification extends Document {
  shipmentId?: mongoose.Types.ObjectId;
  recipient: string;
  channel: "sms" | "whatsapp" | "email";
  message: string;
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
}

const NotificationSchema = new Schema(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
    },

    recipient: String,

    channel: {
      type: String,
      enum: ["sms", "whatsapp", "email"],
    },

    message: String,

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    sentAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
