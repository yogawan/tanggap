"use client";

import { Building2, Car, Radar, Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type SourceId = "tracking" | "tms" | "erp" | "fleet";

const ACTIVE_SOURCE: SourceId = "tracking";

const sources: { id: SourceId; label: string; icon: typeof Truck }[] = [
  { id: "tracking", label: "Tracking", icon: Radar },
  { id: "tms", label: "TMS", icon: Truck },
  { id: "erp", label: "ERP", icon: Building2 },
  { id: "fleet", label: "Fleet", icon: Car },
];

export function DataSourceSwitcher() {
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);

  return (
    <div>
      <p className="text-xs font-bold tracking-[.14em] text-muted">
        SUMBER DATA
      </p>
      <div className="mt-2 inline-flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1 shadow-card">
        {sources.map((source) => {
          const active = source.id === ACTIVE_SOURCE;
          return (
            <button
              key={source.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (!active) setPendingLabel(source.label);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <source.icon className="h-3.5 w-3.5" />
              {source.label}
              {active && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white ring-2 ring-white/40" />
              )}
            </button>
          );
        })}
      </div>

      <Modal
        open={pendingLabel !== null}
        onClose={() => setPendingLabel(null)}
        title="Fitur dalam pengembangan"
      >
        <p className="text-sm leading-6 text-muted">
          Integrasi{" "}
          <span className="font-semibold text-foreground">{pendingLabel}</span>{" "}
          masih dalam tahap pengembangan. Untuk saat ini, TRACIA hanya tersedia
          untuk sumber data{" "}
          <span className="font-semibold text-foreground">Tracking</span>.
        </p>
        <Button className="mt-5 w-full" onClick={() => setPendingLabel(null)}>
          Mengerti
        </Button>
      </Modal>
    </div>
  );
}
