import type mongoose from "mongoose";
import { z } from "zod";
import Driver from "../../models/Driver";
import ExceptionModel from "../../models/Exception";
import Shipment, { type IShipment } from "../../models/Shipment";
import Vehicle from "../../models/Vehicle";
import { type DriverDTO, type DriverLean, toDriverDTO } from "./driver";
import { defineTool, objectIdSchema } from "./shared";
import { toVehicleDTO, type VehicleDTO, type VehicleLean } from "./vehicle";

export type ShipmentDTO = {
  id: string;
  shipmentNumber: string;
  customer: { name: string; phone: string; address: string };
  origin: string;
  destination: string;
  status: IShipment["status"];
  priority: IShipment["priority"];
  vehicle: VehicleDTO | null;
  driver: DriverDTO | null;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  createdAt: Date;
};

type ShipmentLean = {
  _id: mongoose.Types.ObjectId;
  shipmentNumber: string;
  customer: { name: string; phone: string; address: string };
  origin: string;
  destination: string;
  status: IShipment["status"];
  priority: IShipment["priority"];
  vehicleId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  createdAt: Date;
};

async function toShipmentDTO(doc: ShipmentLean): Promise<ShipmentDTO> {
  const [vehicleDoc, driverDoc] = await Promise.all([
    doc.vehicleId ? Vehicle.findById(doc.vehicleId).lean<VehicleLean>() : null,
    doc.driverId ? Driver.findById(doc.driverId).lean<DriverLean>() : null,
  ]);

  return {
    id: doc._id.toString(),
    shipmentNumber: doc.shipmentNumber,
    customer: doc.customer,
    origin: doc.origin,
    destination: doc.destination,
    status: doc.status,
    priority: doc.priority,
    vehicle: vehicleDoc ? toVehicleDTO(vehicleDoc) : null,
    driver: driverDoc ? toDriverDTO(driverDoc) : null,
    estimatedDelivery: doc.estimatedDelivery,
    actualDelivery: doc.actualDelivery,
    createdAt: doc.createdAt,
  };
}

async function findShipmentLeanOrThrow(
  shipmentNumber: string,
): Promise<ShipmentLean> {
  const doc = await Shipment.findOne({ shipmentNumber }).lean<ShipmentLean>();
  if (!doc) {
    throw new Error(`Shipment ${shipmentNumber} not found`);
  }
  return doc;
}

// ---- getShipment ----

const getShipmentInput = z.object({
  shipmentNumber: z.string(),
});

export const getShipment = defineTool({
  name: "getShipment",
  description:
    "Get full shipment detail (customer, route, status, assigned vehicle & driver) by shipment number.",
  riskLevel: "low",
  inputSchema: getShipmentInput,
  async execute(input): Promise<ShipmentDTO> {
    const doc = await findShipmentLeanOrThrow(input.shipmentNumber);
    return toShipmentDTO(doc);
  },
});

// ---- reassignShipment ----

const reassignShipmentInput = z.object({
  shipmentNumber: z.string(),
  vehicleId: objectIdSchema,
  driverId: objectIdSchema,
});

export const reassignShipment = defineTool({
  name: "reassignShipment",
  description:
    "Reassign a shipment to a replacement vehicle and driver. Both must currently be 'available'. Frees up the previous driver/vehicle.",
  riskLevel: "high",
  inputSchema: reassignShipmentInput,
  async execute(input): Promise<ShipmentDTO> {
    const shipment = await findShipmentLeanOrThrow(input.shipmentNumber);

    const [newVehicle, newDriver] = await Promise.all([
      Vehicle.findById(input.vehicleId),
      Driver.findById(input.driverId),
    ]);

    if (!newVehicle) throw new Error("Replacement vehicle not found");
    if (!newDriver) throw new Error("Replacement driver not found");
    if (newVehicle.status !== "available") {
      throw new Error(
        `Vehicle ${newVehicle.plateNumber} is not available (status: ${newVehicle.status})`,
      );
    }
    if (newDriver.status !== "available") {
      throw new Error(
        `Driver ${newDriver.name} is not available (status: ${newDriver.status})`,
      );
    }

    const [previousVehicle, previousDriver] = await Promise.all([
      shipment.vehicleId ? Vehicle.findById(shipment.vehicleId) : null,
      shipment.driverId ? Driver.findById(shipment.driverId) : null,
    ]);

    // Only free the previous vehicle if it was actively in use — a broken/maintenance
    // vehicle doesn't become available just because the shipment moved away from it.
    if (previousVehicle && previousVehicle.status === "in_use") {
      previousVehicle.status = "available";
      await previousVehicle.save();
    }
    if (previousDriver) {
      previousDriver.status = "available";
      await previousDriver.save();
    }

    newVehicle.status = "in_use";
    newDriver.status = "on_delivery";
    await Promise.all([newVehicle.save(), newDriver.save()]);

    const updated = await Shipment.findOneAndUpdate(
      { shipmentNumber: input.shipmentNumber },
      {
        vehicleId: newVehicle._id,
        driverId: newDriver._id,
        status: "in_transit",
      },
      { returnDocument: "after" },
    ).lean<ShipmentLean>();

    if (!updated) {
      throw new Error(
        `Shipment ${input.shipmentNumber} not found after update`,
      );
    }

    return toShipmentDTO(updated);
  },
});

// ---- updateETA ----

export type UpdateETAResult = {
  shipmentNumber: string;
  previousEta: Date;
  newEta: Date;
};

const updateETAInput = z.object({
  shipmentNumber: z.string(),
  // ISO string, not z.date() — tool args arrive as JSON from the LLM, and a
  // native Date can't be represented in the JSON Schema sent to DeepSeek.
  estimatedDelivery: z.iso.datetime(),
});

export const updateETA = defineTool({
  name: "updateETA",
  description:
    "Update a shipment's estimated delivery time. estimatedDelivery must be an ISO 8601 datetime string.",
  riskLevel: "high",
  inputSchema: updateETAInput,
  async execute(input): Promise<UpdateETAResult> {
    const previous = await findShipmentLeanOrThrow(input.shipmentNumber);

    const updated = await Shipment.findOneAndUpdate(
      { shipmentNumber: input.shipmentNumber },
      { estimatedDelivery: new Date(input.estimatedDelivery) },
      { returnDocument: "after" },
    ).lean<ShipmentLean>();

    if (!updated) {
      throw new Error(
        `Shipment ${input.shipmentNumber} not found after update`,
      );
    }

    return {
      shipmentNumber: input.shipmentNumber,
      previousEta: previous.estimatedDelivery,
      newEta: updated.estimatedDelivery,
    };
  },
});

// ---- verifyShipmentResolution ----

export type VerifyShipmentResolutionResult = {
  resolved: boolean;
  reason?: string;
  shipment: ShipmentDTO;
};

const verifyShipmentResolutionInput = z.object({
  shipmentNumber: z.string(),
});

export const verifyShipmentResolution = defineTool({
  name: "verifyShipmentResolution",
  description:
    "Check whether a shipment's blocking condition is actually cleared, and if so mark its open exceptions resolved.",
  riskLevel: "low",
  inputSchema: verifyShipmentResolutionInput,
  async execute(input): Promise<VerifyShipmentResolutionResult> {
    const doc = await findShipmentLeanOrThrow(input.shipmentNumber);

    const [vehicle, driver] = await Promise.all([
      doc.vehicleId
        ? Vehicle.findById(doc.vehicleId).lean<VehicleLean>()
        : null,
      doc.driverId ? Driver.findById(doc.driverId).lean<DriverLean>() : null,
    ]);

    const reasons: string[] = [];
    if (doc.status === "delayed" || doc.status === "cancelled") {
      reasons.push(`Shipment status is still '${doc.status}'`);
    }
    if (vehicle && vehicle.status === "broken") {
      reasons.push(`Assigned vehicle ${vehicle.plateNumber} is still broken`);
    }
    if (driver && driver.status === "off_duty") {
      reasons.push(`Assigned driver ${driver.name} is still off_duty`);
    }

    const resolved = reasons.length === 0;

    if (resolved) {
      await ExceptionModel.updateMany(
        { shipmentId: doc._id, status: { $in: ["open", "investigating"] } },
        { status: "resolved", resolvedAt: new Date() },
      );
    }

    return {
      resolved,
      reason: resolved ? undefined : reasons.join("; "),
      shipment: await toShipmentDTO(doc),
    };
  },
});
