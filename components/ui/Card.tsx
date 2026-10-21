import type { ReactNode } from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
