### 1. `Shipment`

```ts
// models/Shipment.ts
import mongoose, { Schema, Document } from "mongoose";

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
  { timestamps: true }
);

export default mongoose.models.Shipment ||
  mongoose.model("Shipment", ShipmentSchema);
```

### 2. `Vehicle`

```ts
// models/Vehicle.ts
import mongoose, { Schema, Document } from "mongoose";

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
  { timestamps: true }
);

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);
```

### 3. `Driver`

```ts
// models/Driver.ts
import mongoose, { Schema, Document } from "mongoose";

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
  { timestamps: true }
);

export default mongoose.models.Driver ||
  mongoose.model("Driver", DriverSchema);
```

### 4. `Exception`

Ini penting karena **agent bekerja berdasarkan exception**.

```ts
// models/Exception.ts
import mongoose, { Schema, Document } from "mongoose";

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
  { timestamps: true }
);

export default mongoose.models.Exception ||
  mongoose.model("Exception", ExceptionSchema);
```

### 5. `AgentExecution`

Ini buat **Agent Trace / audit trail**.

```ts
// models/AgentExecution.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAgentExecution extends Document {
  task: string;
  shipmentId?: mongoose.Types.ObjectId;
  status: "running" | "completed" | "failed";
  steps: {
    type: "reasoning" | "tool_call" | "tool_result" | "decision";
    tool?: string;
    input?: unknown;
    output?: unknown;
    message?: string;
    timestamp: Date;
  }[];
  startedAt: Date;
  completedAt?: Date;
}

const AgentExecutionSchema = new Schema(
  {
    task: {
      type: String,
      required: true,
    },

    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
    },

    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },

    steps: [
      {
        type: {
          type: String,
          enum: ["reasoning", "tool_call", "tool_result", "decision"],
        },
        tool: String,
        input: Schema.Types.Mixed,
        output: Schema.Types.Mixed,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.AgentExecution ||
  mongoose.model("AgentExecution", AgentExecutionSchema);
```

### 6. `Notification`

Biar agent bisa demonstrate **action execution**.

```ts
// models/Notification.ts
import mongoose, { Schema, Document } from "mongoose";

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
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
```

---

## Struktur seed

Gua bakal bikin scenario seed yang **sengaja punya masalah**, supaya agent bisa langsung demo.

```txt
Seed Data
│
├── 10 Drivers
├── 10 Vehicles
├── 20 Shipments
├── 5 Exceptions
├── 0 AgentExecutions
└── 0 Notifications
```

Contoh scenario utama:

```txt
Shipment
SH-8821
│
├── Customer: PT Maju Jaya
├── Origin: Jakarta
├── Destination: Bandung
├── Status: delayed
├── Vehicle: B 1234 XYZ
└── Driver: Budi
        │
        ▼
Exception
VEHICLE_BREAKDOWN
        │
        ▼
Vehicle B 1234 XYZ
status = broken
        │
        ▼
Agent investigates
        │
        ├── findAvailableDriver()
        ├── findAvailableVehicle()
        ├── reassignShipment()
        ├── updateETA()
        └── notifyCustomer()
```

Jadi waktu demo lu tinggal ngomong:

> **"Resolve shipment SH-8821."**

Kemudian DeepSeek melakukan:

```text
Investigate shipment
        ↓
Check exception
        ↓
Check vehicle
        ↓
Identify breakdown
        ↓
Find available driver + vehicle
        ↓
Reassign shipment
        ↓
Calculate new ETA
        ↓
Notify customer
        ↓
Verify shipment
        ↓
RESOLVED
```
