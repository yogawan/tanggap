import { StatCard } from "@/components/ui/StatCard";
import AgentExecution from "@/models/AgentExecution";
import dbConnect from "@/models/db";
import ExceptionModel from "@/models/Exception";
import Shipment from "@/models/Shipment";

export default async function OverviewPage() {
  await dbConnect();

  const [
    totalShipments,
    delayedShipments,
    criticalExceptions,
    resolvedExceptions,
    totalExecutions,
    completedExecutions,
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
  ]);

  const resolutionRate =
    totalExecutions === 0
      ? "—"
      : `${Math.round((completedExecutions / totalExecutions) * 100)}%`;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
      <p className="mt-1 text-sm text-muted">
        Operational snapshot across all shipments and exceptions.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Shipments" value={totalShipments} />
        <StatCard
          label="Delayed Shipments"
          value={delayedShipments}
          tone={delayedShipments > 0 ? "warning" : "foreground"}
        />
        <StatCard
          label="Critical Exceptions"
          value={criticalExceptions}
          tone={criticalExceptions > 0 ? "danger" : "foreground"}
        />
        <StatCard
          label="Resolved Exceptions"
          value={resolvedExceptions}
          tone="success"
        />
        <StatCard label="Agent Resolution Rate" value={resolutionRate} />
      </div>
    </div>
  );
}
