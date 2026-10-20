import { ArrowLeft, Brain, CircleCheck, GitBranch, Wrench } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import AgentExecution from "@/models/AgentExecution";
import dbConnect from "@/models/db";

type StepType = "reasoning" | "tool_call" | "tool_result" | "decision";

type Step = {
  type: StepType;
  tool?: string;
  input?: unknown;
  output?: unknown;
  message?: string;
  timestamp: Date;
};

type ExecutionLean = {
  task: string;
  status: "running" | "completed" | "failed";
  steps: Step[];
  startedAt: Date;
  completedAt?: Date;
};

const statusTone: Record<ExecutionLean["status"], BadgeTone> = {
  running: "warning",
  completed: "success",
  failed: "danger",
};

const stepMeta: Record<
  StepType,
  { label: string; icon: ComponentType<{ className?: string }>; tone: string }
> = {
  reasoning: {
    label: "Reasoning",
    icon: Brain,
    tone: "border-info/30 bg-info/10 text-info",
  },
  tool_call: {
    label: "Tool Call",
    icon: Wrench,
    tone: "border-primary-light bg-primary-light text-primary",
  },
  tool_result: {
    label: "Tool Result",
    icon: CircleCheck,
    tone: "border-success/30 bg-success/10 text-success",
  },
  decision: {
    label: "Decision",
    icon: GitBranch,
    tone: "border-warning/30 bg-warning/10 text-warning",
  },
};

function formatTime(date: Date) {
  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export default async function ExecutionTracePage({
  params,
}: {
  params: Promise<{ executionId: string }>;
}) {
  const { executionId } = await params;
  await dbConnect();

  let exec: ExecutionLean | null;
  try {
    exec = await AgentExecution.findById(executionId).lean<ExecutionLean>();
  } catch {
    notFound();
  }
  if (!exec) notFound();

  return (
    <div className="p-8">
      <Link
        href="/agent"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Agent Workspace
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.14em] text-muted">
            AGENT EXECUTION TRACE
          </p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">
            {exec.task}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Mulai {formatTime(exec.startedAt)}
            {exec.completedAt && ` · Selesai ${formatTime(exec.completedAt)}`}
          </p>
        </div>
        <Badge tone={statusTone[exec.status]}>{exec.status}</Badge>
      </div>

      <ol className="mt-8 space-y-4 border-l border-border pl-6">
        {exec.steps.map((step, i) => {
          const meta = stepMeta[step.type];
          const Icon = meta.icon;
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: steps are append-only, never reordered
              key={i}
              className="relative"
            >
              <span
                className={`absolute -left-[2.05rem] flex h-7 w-7 items-center justify-center rounded-full border bg-background ${meta.tone}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold tracking-wide text-muted">
                    {String(i + 1).padStart(2, "0")} · {meta.label}
                  </span>
                  {step.tool && (
                    <span className="font-mono text-xs font-semibold text-primary">
                      {step.tool}
                    </span>
                  )}
                </div>
                {step.message && (
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {step.message}
                  </p>
                )}
                {step.input !== undefined && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-2 text-xs text-muted">
                    {JSON.stringify(step.input, null, 2)}
                  </pre>
                )}
                {step.output !== undefined && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-2 text-xs text-muted">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                )}
                <p className="mt-2 text-[10px] text-muted">
                  {formatTime(step.timestamp)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
