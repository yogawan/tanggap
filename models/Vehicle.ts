import mongoose, { type Document, Schema } from "mongoose";

export interface IVehicle extends Document {
  plateNumber: string;
  type: "truck" | "van" | "motorcycle";
  status: "available" | "in_use" | "maintenance" | "broken";
  currentLocation: string;
}

const VehicleSchema = new Schema(
  {
    plateNumber: { type: String, required: true, unique: true },

    type: {
      type: String,
      enum: ["truck", "van", "motorcycle"],
    },

    status: {
      type: String,
      enum: ["available", "in_use", "maintenance", "broken"],
      default: "available",
    },

    currentLocation: String,
  },
  { timestamps: true },
);

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);
