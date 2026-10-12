// @/app/about/page.tsx
import { ArrowRight, Network, Route, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const values = [
  {
    icon: Network,
    title: "Terhubung",
    copy: "Tanggap bekerja di atas sistem logistik yang sudah ada melalui API, tanpa menggantikan TMS atau ERP.",
  },
  {
    icon: Route,
    title: "Sigap",
    copy: "Dari investigasi hingga eksekusi, Tanggap menyusun recovery plan secara terstruktur dan cepat.",
  },
  {
    icon: ShieldCheck,
    title: "Terverifikasi",
    copy: "Setiap tindakan diperiksa hasilnya sebelum dinyatakan selesai, dengan persetujuan operator saat diperlukan.",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <Image
              src="/TanggapAI-Logo.png"
              alt="TanggapAI"
              width={96}
              height={96}
              className="h-14 w-14 shrink-0 object-contain"
            />
            TanggapAI
          </Link>
          <Link
            href="/agent"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/15 transition-colors hover:bg-primary-hover"
          >
            Coba TanggapAI <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <p className="text-xs font-bold tracking-[.18em] text-primary">
          TENTANG KAMI
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.03em] text-foreground sm:text-4xl">
          Masalah terjadi.{" "}
          <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Tanggap tangani.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted">
          TanggapAI adalah platform AI Agent untuk membantu operator logistik
          menangani exception operasional — dari shipment yang terlambat
          hingga kendaraan yang bermasalah — melalui proses investigasi,
          perencanaan, eksekusi, dan verifikasi yang terstruktur.
        </p>
      </section>

      <section className="border-y border-border bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-[-.03em] text-foreground sm:text-3xl">
              Siapa Tanggap?
            </h2>
            <p className="mt-4 leading-7 text-muted">
              Tanggap adalah AI Agent utama TanggapAI sekaligus maskot yang
              merepresentasikan karakter sigap dan responsif. Tanggap bekerja
              di atas sistem operasional yang sudah ada melalui API dan tools
              yang diizinkan, dengan operator tetap memegang kendali atas
              tindakan yang berisiko.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-border bg-background p-6 shadow-card"
              >
                <value.icon
                  className="h-6 w-6 text-primary"
                  strokeWidth={1.75}
                />
                <h3 className="mt-5 text-lg font-semibold tracking-[-.02em] text-foreground">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {value.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl rounded-3xl bg-primary-hover px-7 py-14 text-center text-white sm:px-12 lg:py-20">
          <p className="text-[11px] font-bold tracking-[.18em] text-primary-light">
            READY TO RESPOND?
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-.03em] sm:text-5xl">
            Jangan biarkan exception berhenti di dashboard.
          </h2>
          <div className="mt-8 flex justify-center">
            <Link
              href="/agent"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-primary-hover shadow-lg transition-colors hover:bg-primary-light"
            >
              Coba TanggapAI <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto px-5 py-6 text-center text-xs text-muted sm:px-8">
          © 2026 TanggapAI. AI Agent untuk Operasional Logistik.
        </div>
      </footer>
    </main>
  );
}
