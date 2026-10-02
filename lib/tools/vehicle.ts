import type mongoose from "mongoose";
import { z } from "zod";
import Vehicle, { type IVehicle } from "../../models/Vehicle";
import { defineTool, objectIdSchema } from "./shared";

export type VehicleDTO = {
  id: string;
  plateNumber: string;
  type: IVehicle["type"];
  status: IVehicle["status"];
  currentLocation: string;
};

export type VehicleLean = {
  _id: mongoose.Types.ObjectId;
  plateNumber: string;
  type: IVehicle["type"];
  status: IVehicle["status"];
  currentLocation: string;
};

export function toVehicleDTO(doc: VehicleLean): VehicleDTO {
  return {
    id: doc._id.toString(),
    plateNumber: doc.plateNumber,
    type: doc.type,
    status: doc.status,
    currentLocation: doc.currentLocation,
  };
}

const getVehicleInput = z.union([
  z.object({ vehicleId: objectIdSchema }),
  z.object({ plateNumber: z.string() }),
]);

export const getVehicle = defineTool({
  name: "getVehicle",
  description: "Get a single vehicle by its id or plate number.",
  riskLevel: "low",
  inputSchema: getVehicleInput,
  async execute(input) {
    const query =
      "vehicleId" in input
        ? { _id: input.vehicleId }
        : { plateNumber: input.plateNumber };
    const doc = await Vehicle.findOne(query).lean<VehicleLean>();
    if (!doc) {
      throw new Error("Vehicle not found");
    }
    return toVehicleDTO(doc);
  },
});

const findAvailableVehiclesInput = z.object({
  type: z.enum(["truck", "van", "motorcycle"]).optional(),
  currentLocation: z.string().optional(),
});

export const findAvailableVehicles = defineTool({
  name: "findAvailableVehicles",
  description:
    "Find vehicles with status 'available', optionally filtered by type and/or current location.",
  riskLevel: "low",
  inputSchema: findAvailableVehiclesInput,
  async execute(input) {
    const query: Record<string, unknown> = { status: "available" };
    if (input.type) query.type = input.type;
    if (input.currentLocation) query.currentLocation = input.currentLocation;
    const docs = await Vehicle.find(query).lean<VehicleLean[]>();
    return docs.map(toVehicleDTO);
  },
});
