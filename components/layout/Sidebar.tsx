"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/exceptions", label: "Exceptions" },
  { href: "/agent", label: "Agent Workspace" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 px-2">
        <p className="text-lg font-semibold text-foreground">Tanggap AI</p>
        <p className="text-xs text-muted">LogiResolve Agent</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-light text-primary"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
