import mongoose from "mongoose";
import AgentExecution from "../models/AgentExecution";
import Driver, { type IDriver } from "../models/Driver";
import dbConnect from "../models/db";
import ExceptionModel, { type IException } from "../models/Exception";
import Notification from "../models/Notification";
import Shipment, { type IShipment } from "../models/Shipment";
import Vehicle, { type IVehicle } from "../models/Vehicle";

const hoursFromNow = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);

function mustGet<K, V>(map: Map<K, V>, key: K): V {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`Seed lookup failed for key: ${String(key)}`);
  }
  return value;
}

type VehicleSeed = {
  plateNumber: string;
  type: IVehicle["type"];
  status: IVehicle["status"];
  currentLocation: string;
};

// Hero scenario: B 1234 XYZ breaks down, B 5678 ABC is the replacement.
const vehicleSeeds: VehicleSeed[] = [
  {
    plateNumber: "B 1234 XYZ",
    type: "truck",
    status: "broken",
    currentLocation: "Jakarta",
  },
  {
    plateNumber: "B 5678 ABC",
    type: "truck",
    status: "available",
    currentLocation: "Jakarta",
  },
  {
    plateNumber: "B 2231 DEF",
    type: "van",
    status: "available",
    currentLocation: "Jakarta",
  },
  {
    plateNumber: "B 3342 GHI",
    type: "van",
    status: "in_use",
    currentLocation: "Surabaya",
  },
  {
    plateNumber: "B 4453 JKL",
    type: "motorcycle",
    status: "available",
    currentLocation: "Bandung",
  },
  {
    plateNumber: "B 5564 MNO",
    type: "truck",
    status: "in_use",
    currentLocation: "Jakarta",
  },
  {
    plateNumber: "B 6675 PQR",
    type: "van",
    status: "in_use",
    currentLocation: "Bandung",
  },
  {
    plateNumber: "B 7786 STU",
    type: "truck",
    status: "maintenance",
    currentLocation: "Semarang",
  },
  {
    plateNumber: "B 8897 VWX",
    type: "motorcycle",
    status: "available",
    currentLocation: "Surabaya",
  },
  {
    plateNumber: "B 9908 YZA",
    type: "van",
    status: "in_use",
    currentLocation: "Jakarta",
  },
];

type DriverSeed = {
  name: string;
  phone: string;
  status: IDriver["status"];
  currentLocation: string;
  vehiclePlate?: string;
};

// Hero scenario: Budi is stuck with the broken vehicle, Andi is the available replacement.
const driverSeeds: DriverSeed[] = [
  {
    name: "Budi",
    phone: "081234560001",
    status: "on_delivery",
    currentLocation: "Jakarta",
    vehiclePlate: "B 1234 XYZ",
  },
  {
    name: "Andi",
    phone: "081234560002",
    status: "available",
    currentLocation: "Jakarta",
  },
  {
    name: "Rudi",
    phone: "081234560003",
    status: "on_delivery",
    currentLocation: "Bandung",
    vehiclePlate: "B 6675 PQR",
  },
  {
    name: "Siti Rahma",
    phone: "081234560004",
    status: "available",
    currentLocation: "Surabaya",
  },
  {
    name: "Dewi Lestari",
    phone: "081234560005",
    status: "available",
    currentLocation: "Jakarta",
  },
  {
    name: "Agus Setiawan",
    phone: "081234560006",
    status: "on_delivery",
    currentLocation: "Surabaya",
    vehiclePlate: "B 3342 GHI",
  },
  {
    name: "Hendra Saputra",
    phone: "081234560007",
    status: "on_delivery",
    currentLocation: "Jakarta",
    vehiclePlate: "B 5564 MNO",
  },
  {
    name: "Fajar Nugroho",
    phone: "081234560008",
    status: "available",
    currentLocation: "Bandung",
  },
  {
    name: "Rina Wulandari",
    phone: "081234560009",
    status: "available",
    currentLocation: "Medan",
  },
  {
    name: "Yusuf Hidayat",
    phone: "081234560010",
    status: "off_duty",
    currentLocation: "Jakarta",
    vehiclePlate: "B 9908 YZA",
  },
];

type ShipmentSeed = {
  shipmentNumber: string;
  customer: { name: string; phone: string; address: string };
  origin: string;
  destination: string;
  status: IShipment["status"];
  priority: IShipment["priority"];
  vehiclePlate?: string;
  driverName?: string;
  estimatedDeliveryOffsetHours: number;
  actualDeliveryOffsetHours?: number;
};

const shipmentSeeds: ShipmentSeed[] = [
  // --- Narrative shipments (tied to the 5 exceptions below) ---
  {
    shipmentNumber: "SH-8821",
    customer: {
      name: "PT Maju Jaya",
      phone: "021-5550101",
      address: "Jl. Gatot Subroto No. 12, Jakarta",
    },
    origin: "Jakarta",
    destination: "Bandung",
    status: "delayed",
    priority: "high",
    vehiclePlate: "B 1234 XYZ",
    driverName: "Budi",
    estimatedDeliveryOffsetHours: -1,
  },
  {
    shipmentNumber: "SH-8834",
    customer: {
      name: "PT Sinar Abadi",
      phone: "024-5550202",
      address: "Jl. Pandanaran No. 5, Semarang",
    },
    origin: "Jakarta",
    destination: "Semarang",
    status: "delayed",
    priority: "high",
    vehiclePlate: "B 9908 YZA",
    driverName: "Yusuf Hidayat",
    estimatedDeliveryOffsetHours: -0.5,
  },
  {
    shipmentNumber: "SH-8841",
    customer: {
      name: "PT Lintas Nusantara",
      phone: "031-5550303",
      address: "Jl. Basuki Rahmat No. 88, Surabaya",
    },
    origin: "Surabaya",
    destination: "Jakarta",
    status: "delayed",
    priority: "high",
    vehiclePlate: "B 3342 GHI",
    driverName: "Agus Setiawan",
    estimatedDeliveryOffsetHours: -2,
  },
  {
    shipmentNumber: "SH-8816",
    customer: {
      name: "PT Graha Niaga",
      phone: "022-5550404",
      address: "Jl. Asia Afrika No. 22, Bandung",
    },
    origin: "Bandung",
    destination: "Jakarta",
    status: "delayed",
    priority: "normal",
    vehiclePlate: "B 6675 PQR",
    driverName: "Rudi",
    estimatedDeliveryOffsetHours: -0.25,
  },
  {
    shipmentNumber: "SH-8817",
    customer: {
      name: "PT Trans Jaya",
      phone: "021-5550505",
      address: "Jl. Thamrin No. 1, Jakarta",
    },
    origin: "Jakarta",
    destination: "Surabaya",
    status: "in_transit",
    priority: "normal",
    vehiclePlate: "B 5564 MNO",
    driverName: "Hendra Saputra",
    estimatedDeliveryOffsetHours: 6,
  },
  {
    shipmentNumber: "SH-8850",
    customer: {
      name: "PT Cipta Kargo",
      phone: "022-5550606",
      address: "Jl. Braga No. 9, Bandung",
    },
    origin: "Bandung",
    destination: "Jakarta",
    status: "delivered",
    priority: "normal",
    vehiclePlate: "B 2231 DEF",
    driverName: "Dewi Lestari",
    estimatedDeliveryOffsetHours: -30,
    actualDeliveryOffsetHours: -29,
  },

  // --- Filler history: delivered, no exception ---
  {
    shipmentNumber: "SH-8802",
    customer: {
      name: "PT Bumi Perkasa",
      phone: "021-5550701",
      address: "Jl. Rasuna Said No. 3, Jakarta",
    },
    origin: "Jakarta",
    destination: "Surabaya",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -48,
    actualDeliveryOffsetHours: -47,
  },
  {
    shipmentNumber: "SH-8803",
    customer: {
      name: "PT Mitra Sejahtera",
      phone: "022-5550702",
      address: "Jl. Dago No. 15, Bandung",
    },
    origin: "Bandung",
    destination: "Yogyakarta",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -46,
    actualDeliveryOffsetHours: -46.5,
  },
  {
    shipmentNumber: "SH-8804",
    customer: {
      name: "PT Sumber Rejeki",
      phone: "021-5550703",
      address: "Jl. Kebon Jeruk No. 7, Jakarta",
    },
    origin: "Jakarta",
    destination: "Medan",
    status: "delivered",
    priority: "low",
    estimatedDeliveryOffsetHours: -40,
    actualDeliveryOffsetHours: -39,
  },
  {
    shipmentNumber: "SH-8805",
    customer: {
      name: "PT Nusantara Cargo",
      phone: "024-5550704",
      address: "Jl. Pemuda No. 20, Semarang",
    },
    origin: "Semarang",
    destination: "Jakarta",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -36,
    actualDeliveryOffsetHours: -35,
  },
  {
    shipmentNumber: "SH-8806",
    customer: {
      name: "PT Karya Mandiri",
      phone: "031-5550705",
      address: "Jl. Diponegoro No. 11, Surabaya",
    },
    origin: "Surabaya",
    destination: "Denpasar",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -30,
    actualDeliveryOffsetHours: -29.5,
  },
  {
    shipmentNumber: "SH-8807",
    customer: {
      name: "PT Logistik Prima",
      phone: "021-5550706",
      address: "Jl. Kuningan No. 8, Jakarta",
    },
    origin: "Jakarta",
    destination: "Bandung",
    status: "delivered",
    priority: "low",
    estimatedDeliveryOffsetHours: -24,
    actualDeliveryOffsetHours: -23,
  },
  {
    shipmentNumber: "SH-8808",
    customer: {
      name: "CV Jaya Abadi",
      phone: "061-5550707",
      address: "Jl. Gatot Subroto No. 44, Medan",
    },
    origin: "Medan",
    destination: "Jakarta",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -20,
    actualDeliveryOffsetHours: -19,
  },
  {
    shipmentNumber: "SH-8809",
    customer: {
      name: "PT Delta Cargo",
      phone: "022-5550708",
      address: "Jl. Cihampelas No. 33, Bandung",
    },
    origin: "Bandung",
    destination: "Semarang",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -16,
    actualDeliveryOffsetHours: -15.5,
  },
  {
    shipmentNumber: "SH-8810",
    customer: {
      name: "PT Gema Express",
      phone: "021-5550709",
      address: "Jl. Senopati No. 6, Jakarta",
    },
    origin: "Jakarta",
    destination: "Yogyakarta",
    status: "delivered",
    priority: "low",
    estimatedDeliveryOffsetHours: -12,
    actualDeliveryOffsetHours: -11,
  },
  {
    shipmentNumber: "SH-8811",
    customer: {
      name: "PT Sentosa Logistik",
      phone: "0274-5550710",
      address: "Jl. Malioboro No. 2, Yogyakarta",
    },
    origin: "Yogyakarta",
    destination: "Jakarta",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -10,
    actualDeliveryOffsetHours: -9.5,
  },
  {
    shipmentNumber: "SH-8812",
    customer: {
      name: "PT Pelita Nusantara",
      phone: "021-5550711",
      address: "Jl. Sudirman No. 25, Jakarta",
    },
    origin: "Jakarta",
    destination: "Palembang",
    status: "delivered",
    priority: "normal",
    estimatedDeliveryOffsetHours: -8,
    actualDeliveryOffsetHours: -7,
  },
  {
    shipmentNumber: "SH-8813",
    customer: {
      name: "PT Anugerah Jaya",
      phone: "0711-5550712",
      address: "Jl. Sudirman No. 9, Palembang",
    },
    origin: "Palembang",
    destination: "Jakarta",
    status: "delivered",
    priority: "low",
    estimatedDeliveryOffsetHours: -5,
    actualDeliveryOffsetHours: -4.5,
  },

  // --- Filler history: cancelled ---
  {
    shipmentNumber: "SH-8814",
    customer: {
      name: "PT Borneo Trans",
      phone: "021-5550713",
      address: "Jl. Pluit Raya No. 14, Jakarta",
    },
    origin: "Jakarta",
    destination: "Balikpapan",
    status: "cancelled",
    priority: "normal",
    estimatedDeliveryOffsetHours: -18,
  },
  {
    shipmentNumber: "SH-8815",
    customer: {
      name: "PT Maju Jaya",
      phone: "021-5550101",
      address: "Jl. Gatot Subroto No. 12, Jakarta",
    },
    origin: "Jakarta",
    destination: "Denpasar",
    status: "cancelled",
    priority: "low",
    estimatedDeliveryOffsetHours: -14,
  },
];

type ExceptionSeed = {
  shipmentNumber: string;
  type: IException["type"];
  severity: IException["severity"];
  status: IException["status"];
  description: string;
  detectedAtOffsetHours: number;
  resolvedAtOffsetHours?: number;
};

const exceptionSeeds: ExceptionSeed[] = [
  {
    shipmentNumber: "SH-8821",
    type: "vehicle_breakdown",
    severity: "critical",
    status: "open",
    description:
      "Vehicle B 1234 XYZ breakdown di tengah jalan Jakarta-Bandung, mesin tidak bisa menyala.",
    detectedAtOffsetHours: -1,
  },
  {
    shipmentNumber: "SH-8834",
    type: "driver_unavailable",
    severity: "critical",
    status: "open",
    description:
      "Driver Yusuf Hidayat off-duty, belum ada pengganti yang di-assign untuk shipment ini.",
    detectedAtOffsetHours: -0.5,
  },
  {
    shipmentNumber: "SH-8841",
    type: "route_blocked",
    severity: "critical",
    status: "open",
    description:
      "Jalur utama Surabaya-Jakarta terendam banjir, belum ditemukan rute alternatif.",
    detectedAtOffsetHours: -2,
  },
  {
    shipmentNumber: "SH-8816",
    type: "late_delivery",
    severity: "medium",
    status: "investigating",
    description:
      "Shipment berjalan lebih lambat dari estimasi awal, berpotensi telat sampai Jakarta.",
    detectedAtOffsetHours: -0.25,
  },
  {
    shipmentNumber: "SH-8850",
    type: "late_delivery",
    severity: "low",
    status: "resolved",
    description:
      "Shipment sempat tertahan macet di Bandung, berhasil diselesaikan dan terkirim.",
    detectedAtOffsetHours: -30,
    resolvedAtOffsetHours: -29,
  },
];

async function seed() {
  await dbConnect();

  await Promise.all([
    Shipment.deleteMany({}),
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    ExceptionModel.deleteMany({}),
    AgentExecution.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const vehicleDocs = await Vehicle.insertMany(vehicleSeeds);
  const vehicleByPlate = new Map(
    vehicleDocs.map((v) => [v.plateNumber, v._id]),
  );

  const driverDocs = await Driver.insertMany(
    driverSeeds.map(({ vehiclePlate, ...rest }) => ({
      ...rest,
      vehicleId: vehiclePlate
        ? mustGet(vehicleByPlate, vehiclePlate)
        : undefined,
    })),
  );
  const driverByName = new Map(driverDocs.map((d) => [d.name, d._id]));

  const shipmentDocs = await Shipment.insertMany(
    shipmentSeeds.map(
      ({
        vehiclePlate,
        driverName,
        estimatedDeliveryOffsetHours,
        actualDeliveryOffsetHours,
        ...rest
      }) => ({
        ...rest,
        vehicleId: vehiclePlate
          ? mustGet(vehicleByPlate, vehiclePlate)
          : undefined,
        driverId: driverName ? mustGet(driverByName, driverName) : undefined,
        estimatedDelivery: hoursFromNow(estimatedDeliveryOffsetHours),
        actualDelivery:
          actualDeliveryOffsetHours !== undefined
            ? hoursFromNow(actualDeliveryOffsetHours)
            : undefined,
      }),
    ),
  );
  const shipmentByNumber = new Map(
    shipmentDocs.map((s) => [s.shipmentNumber, s._id]),
  );

  const exceptionDocs = await ExceptionModel.insertMany(
    exceptionSeeds.map(
      ({
        shipmentNumber,
        detectedAtOffsetHours,
        resolvedAtOffsetHours,
        ...rest
      }) => ({
        ...rest,
        shipmentId: mustGet(shipmentByNumber, shipmentNumber),
        detectedAt: hoursFromNow(detectedAtOffsetHours),
        resolvedAt:
          resolvedAtOffsetHours !== undefined
            ? hoursFromNow(resolvedAtOffsetHours)
            : undefined,
      }),
    ),
  );

  console.log("Seed complete:");
  console.log({
    vehicles: vehicleDocs.length,
    drivers: driverDocs.length,
    shipments: shipmentDocs.length,
    exceptions: exceptionDocs.length,
    agentExecutions: 0,
    notifications: 0,
  });
  console.log(
    "Hero scenario ready: SH-8821 (vehicle_breakdown, B 1234 XYZ broken, driver Budi, replacement candidates B 5678 ABC + Andi).",
  );
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  });
