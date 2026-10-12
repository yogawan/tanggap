"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const templates = [
  "Resolve shipment SH-8821",
  "Investigate SH-8821",
  "Why is SH-8821 delayed?",
  "Find available drivers",
  "Show critical exceptions",
  "Handle all critical logistics exceptions",
];

export default function AgentWorkspacePage() {
  return (
    <div className="p-8">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-light bg-primary-light/40 px-3.5 py-1.5 text-[10px] font-bold tracking-[.14em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        AI AGENT WORKSPACE
      </p>
      <h1 className="text-2xl font-semibold text-foreground">LogiResolve AI</h1>
      <p className="mt-1 text-sm text-muted">
        Beri satu goal, agent akan investigate, plan, lalu eksekusi tool yang
        diperlukan.
      </p>

      <Suspense
        fallback={<Card className="mt-6 h-[22rem] max-w-2xl animate-pulse" />}
      >
        <AgentForm />
      </Suspense>
    </div>
  );
}

function AgentForm() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState(
    () => searchParams.get("message") ?? "",
  );

  return (
    <Card className="mt-6 max-w-2xl">
      <p className="text-xs font-semibold tracking-wide text-muted">
        TEMPLATE MESSAGE
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template}
            type="button"
            onClick={() => setMessage(template)}
            className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary-light hover:bg-primary-light hover:text-primary"
          >
            {template}
          </button>
        ))}
      </div>

      <form
        className="mt-5 border-t border-border pt-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="agent-message" className="sr-only">
          Pesan untuk agent
        </label>
        <textarea
          id="agent-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Contoh: "Resolve shipment SH-8821"'
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Belum terhubung ke agent asli — lihat EXECUTION-PLAN.md Fase 5/6/7.
          </p>
          <Button type="submit" disabled={message.trim().length === 0}>
            Kirim
          </Button>
        </div>
      </form>
    </Card>
  );
}
