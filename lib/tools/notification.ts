import type mongoose from "mongoose";
import { z } from "zod";
import Notification, { type INotification } from "../../models/Notification";
import Shipment from "../../models/Shipment";
import { defineTool } from "./shared";

export type NotificationDTO = {
  id: string;
  shipmentId?: string;
  recipient: string;
  channel: INotification["channel"];
  message: string;
  status: INotification["status"];
  sentAt?: Date;
};

const notifyCustomerInput = z.object({
  shipmentNumber: z.string(),
  channel: z.enum(["sms", "whatsapp", "email"]),
  message: z.string().min(1),
});

export const notifyCustomer = defineTool({
  name: "notifyCustomer",
  description:
    "Send a notification to the shipment's customer over sms, whatsapp, or email.",
  riskLevel: "high",
  inputSchema: notifyCustomerInput,
  async execute(input): Promise<NotificationDTO> {
    const shipment = await Shipment.findOne({
      shipmentNumber: input.shipmentNumber,
    }).lean<{ _id: mongoose.Types.ObjectId; customer: { phone: string } }>();
    if (!shipment) {
      throw new Error(`Shipment ${input.shipmentNumber} not found`);
    }

    // No real SMS/WhatsApp/email provider wired up for the MVP: the send is
    // simulated and recorded as sent immediately.
    const doc = await Notification.create({
      shipmentId: shipment._id,
      recipient: shipment.customer.phone,
      channel: input.channel,
      message: input.message,
      status: "sent",
      sentAt: new Date(),
    });

    return {
      id: doc._id.toString(),
      shipmentId: doc.shipmentId?.toString(),
      recipient: doc.recipient,
      channel: doc.channel,
      message: doc.message,
      status: doc.status,
      sentAt: doc.sentAt,
    };
  },
});
