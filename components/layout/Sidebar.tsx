"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const links = [
  { href: "/overview", label: "Dashboard" },
  { href: "/agent", label: "Agent Workspace" },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shrink-0 overflow-hidden border-r border-border bg-surface transition-transform duration-200 lg:sticky lg:inset-y-auto lg:left-auto lg:top-0 lg:z-0 lg:h-screen lg:w-60 lg:max-w-none lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full w-72 flex-col lg:w-60">
        <div className="flex items-center gap-2 border-b border-border p-4 font-semibold text-foreground">
          <Image
            src="/TRACIA-logo.png"
            alt="TRACIA"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 object-contain"
          />
          TRACIA
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="ml-auto rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
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
      </div>
    </aside>
  );
}
