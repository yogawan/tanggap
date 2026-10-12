import type mongoose from "mongoose";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import dbConnect from "@/models/db";
import ExceptionModel, { type IException } from "@/models/Exception";
import Shipment, { type IShipment } from "@/models/Shipment";

type ExceptionLean = {
  _id: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  type: IException["type"];
  severity: IException["severity"];
  status: IException["status"];
  description: string;
};

type ShipmentLean = {
  _id: mongoose.Types.ObjectId;
  shipmentNumber: IShipment["shipmentNumber"];
};

const severityOrder: IException["severity"][] = [
  "critical",
  "high",
  "medium",
  "low",
];

const severityTone: Record<IException["severity"], BadgeTone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "muted",
};

const statusTone: Record<IException["status"], BadgeTone> = {
  open: "danger",
  investigating: "warning",
  resolved: "success",
  ignored: "muted",
};

export default async function ExceptionsPage() {
  await dbConnect();

  const exceptions = await ExceptionModel.find({})
    .sort({ detectedAt: -1 })
    .lean<ExceptionLean[]>();
  const shipments = await Shipment.find({
    _id: { $in: exceptions.map((e) => e.shipmentId) },
  }).lean<ShipmentLean[]>();
  const shipmentById = new Map(shipments.map((s) => [s._id.toString(), s]));

  const grouped = severityOrder
    .map((severity) => ({
      severity,
      items: exceptions.filter((e) => e.severity === severity),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground">Exceptions</h1>
      <p className="mt-1 text-sm text-muted">
        All detected exceptions, grouped by severity.
      </p>

      <div className="mt-6 space-y-8">
        {grouped.map(({ severity, items }) => (
          <section key={severity}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {severity} ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map((exception) => {
                const shipment = shipmentById.get(
                  exception.shipmentId.toString(),
                );
                return (
                  <Card
                    key={exception._id.toString()}
                    className="flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {shipment?.shipmentNumber ?? "Unknown shipment"} —{" "}
                        {exception.type.replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {exception.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={severityTone[exception.severity]}>
                        {exception.severity}
                      </Badge>
                      <Badge tone={statusTone[exception.status]}>
                        {exception.status}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
