import type mongoose from "mongoose";
import { z } from "zod";
import Driver, { type IDriver } from "../../models/Driver";
import { defineTool, objectIdSchema } from "./shared";

export type DriverDTO = {
  id: string;
  name: string;
  phone: string;
  status: IDriver["status"];
  currentLocation: string;
  vehicleId?: string;
};

export type DriverLean = {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  status: IDriver["status"];
  currentLocation: string;
  vehicleId?: mongoose.Types.ObjectId;
};

export function toDriverDTO(doc: DriverLean): DriverDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    status: doc.status,
    currentLocation: doc.currentLocation,
    vehicleId: doc.vehicleId?.toString(),
  };
}

const getDriverInput = z.union([
  z.object({ driverId: objectIdSchema }),
  z.object({ name: z.string() }),
]);

export const getDriver = defineTool({
  name: "getDriver",
  description: "Get a single driver by its id or name.",
  riskLevel: "low",
  inputSchema: getDriverInput,
  async execute(input) {
    const query =
      "driverId" in input ? { _id: input.driverId } : { name: input.name };
    const doc = await Driver.findOne(query).lean<DriverLean>();
    if (!doc) {
      throw new Error("Driver not found");
    }
    return toDriverDTO(doc);
  },
});

const findAvailableDriversInput = z.object({
  currentLocation: z.string().optional(),
});

export const findAvailableDrivers = defineTool({
  name: "findAvailableDrivers",
  description:
    "Find drivers with status 'available', optionally filtered by current location.",
  riskLevel: "low",
  inputSchema: findAvailableDriversInput,
  async execute(input) {
    const query: Record<string, unknown> = { status: "available" };
    if (input.currentLocation) query.currentLocation = input.currentLocation;
    const docs = await Driver.find(query).lean<DriverLean[]>();
    return docs.map(toDriverDTO);
  },
});
