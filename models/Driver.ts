import mongoose, { type Document, Schema } from "mongoose";

export interface IDriver extends Document {
  name: string;
  phone: string;
  status: "available" | "on_delivery" | "off_duty";
  currentLocation: string;
  vehicleId?: mongoose.Types.ObjectId;
}

const DriverSchema = new Schema(
  {
    name: String,
    phone: String,

    status: {
      type: String,
      enum: ["available", "on_delivery", "off_duty"],
      default: "available",
    },

    currentLocation: String,

    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
