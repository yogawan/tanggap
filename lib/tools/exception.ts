import type mongoose from "mongoose";
import { z } from "zod";
import ExceptionModel, { type IException } from "../../models/Exception";
import Shipment from "../../models/Shipment";
import { defineTool } from "./shared";

export type ExceptionDTO = {
  id: string;
  shipmentId: string;
  type: IException["type"];
  severity: IException["severity"];
  status: IException["status"];
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
};

type ExceptionLean = {
  _id: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  type: IException["type"];
  severity: IException["severity"];
  status: IException["status"];
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
};

function toExceptionDTO(doc: ExceptionLean): ExceptionDTO {
  return {
    id: doc._id.toString(),
    shipmentId: doc.shipmentId.toString(),
    type: doc.type,
    severity: doc.severity,
    status: doc.status,
    description: doc.description,
    detectedAt: doc.detectedAt,
    resolvedAt: doc.resolvedAt,
  };
}

const getExceptionInput = z.object({
  shipmentNumber: z.string(),
});

export const getException = defineTool({
  name: "getException",
  description:
    "Get the most recently detected exception for a shipment, by shipment number.",
  riskLevel: "low",
  inputSchema: getExceptionInput,
  async execute(input): Promise<ExceptionDTO> {
    const shipment = await Shipment.findOne({
      shipmentNumber: input.shipmentNumber,
    }).lean<{ _id: mongoose.Types.ObjectId }>();
    if (!shipment) {
      throw new Error(`Shipment ${input.shipmentNumber} not found`);
    }

    const doc = await ExceptionModel.findOne({ shipmentId: shipment._id })
      .sort({ detectedAt: -1 })
      .lean<ExceptionLean>();
    if (!doc) {
      throw new Error(
        `No exception found for shipment ${input.shipmentNumber}`,
      );
    }

    return toExceptionDTO(doc);
  },
});
