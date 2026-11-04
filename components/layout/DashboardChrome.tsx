"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // The agent workspace renders its own complete sidebar and mobile header.
  const showChrome = pathname !== "/agent";

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-full">
      {showChrome && (
        <>
          <Sidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
            className={`fixed inset-0 z-40 bg-foreground/40 transition-opacity duration-200 lg:hidden ${
              mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        </>
      )}
      <main className="min-h-screen min-w-0 flex-1">
        {showChrome && (
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Image
              src="/TRACIA-logo.png"
              alt="TRACIA"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 object-contain"
            />
            <span className="font-semibold text-foreground">TRACIA</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
