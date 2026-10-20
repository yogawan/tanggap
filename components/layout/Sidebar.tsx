"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const links = [
  { href: "/overview", label: "Overview" },
  { href: "/exceptions", label: "Exceptions" },
  { href: "/agent", label: "Agent Workspace" },
];

export function Sidebar() {
  const pathname = usePathname();

  // The agent workspace renders these same links inside its own sidebar.
  if (pathname === "/agent") return null;

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
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
