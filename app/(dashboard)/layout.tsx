import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full">
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
