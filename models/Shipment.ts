import mongoose, { type Document, Schema } from "mongoose";

export interface IShipment extends Document {
  shipmentNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  origin: string;
  destination: string;
  status: "in_transit" | "delayed" | "delivered" | "cancelled";
  priority: "low" | "normal" | "high";
  vehicleId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  createdAt: Date;
}

const ShipmentSchema = new Schema(
  {
    shipmentNumber: { type: String, required: true, unique: true },

    customer: {
      name: String,
      phone: String,
      address: String,
    },

    origin: String,
    destination: String,

    status: {
      type: String,
      enum: ["in_transit", "delayed", "delivered", "cancelled"],
      default: "in_transit",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },

    estimatedDelivery: Date,
    actualDelivery: Date,
  },
  { timestamps: true },
);

export default mongoose.models.Shipment ||
  mongoose.model("Shipment", ShipmentSchema);
