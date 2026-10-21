import type mongoose from "mongoose";
import Image from "next/image";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { StatCard } from "@/components/ui/StatCard";
import AgentExecution from "@/models/AgentExecution";
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

const severityDot: Record<IException["severity"], string> = {
  critical: "bg-danger",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-muted",
};

const statusTone: Record<IException["status"], BadgeTone> = {
  open: "danger",
  investigating: "warning",
  resolved: "success",
  ignored: "muted",
};

export default async function OverviewPage() {
  await dbConnect();

  const [
    totalShipments,
    delayedShipments,
    criticalExceptions,
    resolvedExceptions,
    totalExecutions,
    completedExecutions,
    exceptions,
  ] = await Promise.all([
    Shipment.countDocuments({}),
    Shipment.countDocuments({ status: "delayed" }),
    ExceptionModel.countDocuments({
      severity: "critical",
      status: { $ne: "resolved" },
    }),
    ExceptionModel.countDocuments({ status: "resolved" }),
    AgentExecution.countDocuments({}),
    AgentExecution.countDocuments({ status: "completed" }),
    ExceptionModel.find({}).sort({ detectedAt: -1 }).lean<ExceptionLean[]>(),
  ]);

  const shipments = await Shipment.find({
    _id: { $in: exceptions.map((e) => e.shipmentId) },
  }).lean<ShipmentLean[]>();
  const shipmentById = new Map(shipments.map((s) => [s._id.toString(), s]));

  const resolutionRate =
    totalExecutions === 0
      ? "—"
      : `${Math.round((completedExecutions / totalExecutions) * 100)}%`;

  const grouped = severityOrder
    .map((severity) => ({
      severity,
      items: exceptions.filter((e) => e.severity === severity),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:py-12">
      <SectionIntro
        as="h1"
        eyebrow="OPERATIONS OVERVIEW"
        title="Dashboard"
        copy="Operational snapshot across all shipments and exceptions."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Shipments"
          value={totalShipments}
          image="/Total Shipments.png"
        />
        <StatCard
          label="Delayed Shipments"
          value={delayedShipments}
          tone={delayedShipments > 0 ? "warning" : "foreground"}
          image="/Delayed Shipments.png"
        />
        <StatCard
          label="Critical Exceptions"
          value={criticalExceptions}
          tone={criticalExceptions > 0 ? "danger" : "foreground"}
          image="/Critical Exceptions.png"
        />
        <StatCard
          label="Resolved Exceptions"
          value={resolvedExceptions}
          tone="success"
          image="/Resolved Exceptions.png"
        />
        <StatCard
          label="Agent Resolution Rate"
          value={resolutionRate}
          image="/Agent Resolution Rate.png"
        />
      </div>

      <section className="mt-16">
        <SectionIntro
          eyebrow="DETECTED ISSUES"
          title="Exceptions"
          copy="All detected exceptions, grouped by severity."
        />

        {grouped.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface py-14 text-center">
            <Image
              src="/Tanggap.png"
              alt="Tanggap"
              width={64}
              height={64}
              className="h-14 w-14 object-contain"
            />
            <p className="text-sm font-semibold text-foreground">
              No exceptions detected
            </p>
            <p className="max-w-sm text-sm leading-6 text-muted">
              All shipments are running smoothly right now.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {grouped.map(({ severity, items }) => (
              <section key={severity}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${severityDot[severity]}`}
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {severity}
                  </h3>
                  <span className="text-xs text-muted">({items.length})</span>
                </div>
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
        )}
      </section>
    </div>
  );
}
