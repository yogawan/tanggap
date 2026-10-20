// @/app/page.tsx
"use client";

import {
  ArrowRight,
  ChevronDown,
  CircleCheck,
  ClipboardList,
  Hourglass,
  Network,
  Route,
  Search,
  SendHorizontal,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useTimeGreeting } from "@/lib/useTimeGreeting";

const examplePrompts = [
  { icon: Search, text: "Investigasi shipment SH-8821 yang terlambat." },
  { icon: Truck, text: "Cari kendaraan dan driver pengganti." },
  { icon: ClipboardList, text: "Ringkas semua exception kritis." },
  { icon: Route, text: "Buat recovery plan untuk shipment bermasalah." },
];

// Each row fades a bit more than the last.
const textFadeOpacity = [
  "opacity-100",
  "opacity-[0.75]",
  "opacity-[0.55]",
  "opacity-[0.35]",
];

const problems = [
  {
    number: "01",
    image: "/Data Terpisah.png",
    title: "Data Terpisah",
    copy: "Informasi shipment, kendaraan, driver, dan rute tersebar di berbagai sistem.",
  },
  {
    number: "02",
    image: "/Recovery Manual.png",
    title: "Recovery Manual",
    copy: "Investigasi dan koordinasi tindakan membutuhkan waktu serta intervensi operator.",
  },
  {
    number: "03",
    image: "/Verifikasi Terlewat.png",
    title: "Verifikasi Terlewat",
    copy: "Tindakan yang berhasil dikirim belum tentu berarti masalah sudah terselesaikan.",
  },
];

const capabilities = [
  {
    number: "01",
    image: "/Investigate.png",
    title: "Investigate",
    copy: "Mengumpulkan data shipment, kendaraan, driver, dan exception untuk memahami kondisi sebenarnya.",
  },
  {
    number: "02",
    image: "/Reason.png",
    title: "Reason",
    copy: "Menganalisis informasi dan mengidentifikasi penyebab masalah berdasarkan data yang tersedia.",
  },
  {
    number: "03",
    image: "/Plan.png",
    title: "Plan",
    copy: "Menyusun recovery plan berdasarkan resource, ketersediaan, dan aturan operasional.",
  },
  {
    number: "04",
    image: "/Execute.png",
    title: "Execute",
    copy: "Menjalankan tindakan melalui tools yang tersedia dan diizinkan.",
  },
  {
    number: "05",
    image: "/Verify.png",
    title: "Verify",
    copy: "Memeriksa hasil eksekusi dan memastikan status sesuai kondisi aktual.",
  },
];

const recoverySteps = [
  {
    number: "01",
    title: "Investigate",
    copy: "Tanggap memeriksa status shipment, kendaraan, driver, dan exception.",
  },
  {
    number: "02",
    title: "Identify",
    copy: "Tanggap menemukan bahwa kendaraan mengalami breakdown.",
  },
  {
    number: "03",
    title: "Plan",
    copy: "Tanggap mencari kendaraan dan driver pengganti yang memenuhi persyaratan.",
  },
  {
    number: "04",
    title: "Request Approval",
    copy: "Tanggap meminta persetujuan sebelum melakukan tindakan yang memerlukannya.",
  },
  {
    number: "05",
    title: "Execute",
    copy: "Tanggap menjalankan reassignment, memperbarui ETA, dan mengirim notifikasi melalui tools yang tersedia.",
  },
  {
    number: "06",
    title: "Verify",
    copy: "Tanggap memeriksa hasil tindakan dan melaporkan status aktual.",
  },
];

const executionTrace = [
  { status: "done", label: "getShipment()" },
  { status: "done", label: "getException()" },
  { status: "done", label: "findAvailableVehicle()" },
  { status: "done", label: "findAvailableDriver()" },
  { status: "pending", label: "requestApproval()" },
  { status: "done", label: "reassignShipment()" },
  { status: "done", label: "verifyResolution()" },
] as const;

const integrationSteps = [
  {
    title: "Connect",
    copy: "Mengakses data dari sistem operasional yang tersedia.",
  },
  {
    title: "Orchestrate",
    copy: "Tanggap menentukan tools yang diperlukan berdasarkan objective dan konteks.",
  },
  {
    title: "Act",
    copy: "Tools menjalankan tindakan yang diizinkan dan mengembalikan hasil untuk diverifikasi.",
  },
];

const safetyPoints = [
  {
    title: "Restricted Tools",
    copy: "Tanggap hanya dapat menggunakan tools yang diizinkan.",
  },
  {
    title: "Human Approval",
    copy: "Tindakan berisiko atau perubahan penting dapat membutuhkan persetujuan operator.",
  },
  {
    title: "Verified Results",
    copy: "Tanggap memeriksa respons sistem sebelum menyatakan tugas selesai.",
  },
];

const faqs = [
  {
    q: "Apa itu TanggapAI?",
    a: "TanggapAI adalah platform AI Agent untuk membantu menangani exception operasional logistik.",
  },
  {
    q: "Siapa Tanggap?",
    a: "Tanggap adalah AI Agent utama TanggapAI sekaligus maskot yang merepresentasikan karakter sigap dan responsif.",
  },
  {
    q: "Apakah Tanggap menggantikan TMS atau ERP?",
    a: "Tidak. Tanggap bekerja di atas sistem yang sudah ada melalui API dan tools yang tersedia.",
  },
  {
    q: "Apakah Tanggap bisa bertindak otomatis?",
    a: "Tanggap dapat menjalankan tindakan yang diizinkan. Tindakan tertentu memerlukan persetujuan operator.",
  },
  {
    q: "Bagaimana Tanggap mengetahui tindakan berhasil?",
    a: "Tanggap memeriksa hasil tool dan status aktual dari sistem sebelum melaporkan penyelesaian.",
  },
  {
    q: "Apakah integrasi logistik sudah tersedia?",
    a: "Prototype dapat menggunakan simulated logistics API sampai integrasi eksternal diimplementasikan.",
  },
];

const navLinks = [
  { href: "#platform", label: "Platform" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#integrasi", label: "Integrasi" },
  { href: "/about", label: "Tentang" },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Capabilities />
      <HowItWorks />
      <ExecutionTrace />
      <Integration />
      <Safety />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}

// ---- shared bits ----

function WaletMascot({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "h-11 w-11", md: "h-28 w-28", lg: "h-44 w-44" };
  const pixelSizes = { sm: 44, md: 112, lg: 176 };
  return (
    <Image
      src="/Tanggap.png"
      alt="Tanggap"
      width={pixelSizes[size]}
      height={pixelSizes[size]}
      className={`shrink-0 object-contain ${sizeClasses[size]}`}
    />
  );
}

function Logo({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <Image
      src="/TanggapAI-Logo.png"
      alt="TanggapAI"
      width={96}
      height={96}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold tracking-[.18em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-.03em] text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted">{copy}</p>
    </div>
  );
}

function LinkButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "light";
  children: ReactNode;
}) {
  const variantClasses =
    variant === "light"
      ? "bg-white text-primary-hover hover:bg-primary-light"
      : "bg-primary text-white shadow-lg shadow-primary/15 hover:bg-primary-hover";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${variantClasses}`}
    >
      {children}
    </Link>
  );
}

// ---- sections ----

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <Logo />
          TanggapAI
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <LinkButton href="/agent">
          Coba TanggapAI <ArrowRight className="h-4 w-4" />
        </LinkButton>
      </div>
    </header>
  );
}

function Hero() {
  const greeting = useTimeGreeting();

  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/indonesia.png')] bg-cover bg-center bg-no-repeat opacity-15"
      />
      <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="text-center">
          <div className="flex justify-center">
            <WaletMascot size="md" />
          </div>
          <p className="mt-2 text-xl font-medium text-muted sm:text-2xl">
            {greeting}, aku Tanggap
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.02em] text-foreground sm:text-4xl">
            Ada yang ingin kamu{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              tangani
            </span>{" "}
            hari ini?
          </h1>
        </div>
        <div className="mt-8">
          <HeroPromptBox />
        </div>
      </div>
    </section>
  );
}

function HeroPromptBox() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    router.push(`/agent?message=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-primary to-info opacity-40 blur-2xl"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Jelaskan masalah operasional yang ingin diselesaikan..."
          rows={5}
          className="relative w-full resize-none rounded-[2rem] border border-border bg-surface py-7 pr-24 pl-7 text-lg text-foreground shadow-xl shadow-foreground/5 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          aria-label="Kirim instruksi"
          className="absolute right-5 bottom-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
        >
          <SendHorizontal className="h-6 w-6" />
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-1">
        {examplePrompts.map((example, index) => (
          <button
            key={example.text}
            type="button"
            onClick={() => setMessage(example.text)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary-light/40"
          >
            <example.icon
              className="h-4 w-4 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <span
              className={`text-sm text-foreground ${textFadeOpacity[index] ?? ""}`}
            >
              {example.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Problem() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
      <SectionIntro
        eyebrow="THE PROBLEM"
        title="Sistem mencatat masalah. Operator harus menyelesaikannya."
        copy="Ketika exception terjadi, operator perlu menghubungkan data, mencari penyebab, menentukan tindakan, dan memastikan masalah benar-benar terselesaikan."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {problems.map((problem) => (
          <article
            key={problem.number}
            className="rounded-2xl border border-border bg-surface p-6 shadow-card"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-primary">
                {problem.number}
              </span>
              <Image
                src={problem.image}
                alt={problem.title}
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
            </div>
            <h3 className="mt-9 text-lg font-semibold tracking-[-.02em] text-foreground">
              {problem.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">{problem.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section
      id="tentang"
      className="bg-primary-hover py-20 text-white lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-bold tracking-[.18em] text-primary-light">
            THE SOLUTION
          </p>
          <h2 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">
            TanggapAI menghubungkan data dengan tindakan.
          </h2>
          <p className="mt-5 leading-7 text-primary-light/80">
            TanggapAI menempatkan Tanggap sebagai AI Agent yang bekerja di atas
            sistem logistik melalui API untuk membantu menyelesaikan exception
            operasional.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_.85fr] lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-center text-xs font-bold tracking-[.14em] text-primary-light">
              WORKFLOW
            </p>
            <div className="mt-6 flex flex-col items-center gap-1.5 text-center text-sm font-semibold">
              <span className="rounded-lg border border-white/15 bg-white/10 px-4 py-2">
                TMS · ERP · Fleet · Tracking
              </span>
              <span className="text-primary-light">↓</span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-4 py-2">
                TanggapAI Platform
              </span>
              <span className="text-primary-light">↓</span>
              <span className="rounded-lg bg-white px-5 py-2.5 text-primary-hover">
                Tanggap AI Agent
              </span>
              <span className="text-primary-light">↓</span>
              <span className="max-w-xs rounded-lg border border-primary-light/40 bg-primary-light/10 px-4 py-2 text-[11px] font-bold tracking-wide text-primary-light">
                Investigate - Reason - Plan - Execute - Verify
              </span>
              <span className="text-primary-light">↓</span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-4 py-2">
                Operational Actions
              </span>
              <span className="text-xs font-normal text-primary-light/70">
                Reassign Shipment · Update ETA · Notify Customer
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                title: "Terhubung",
                copy: "Mengakses data dan kapabilitas sistem melalui API.",
              },
              {
                title: "Bertindak",
                copy: "Menjalankan tools sesuai izin dan aturan operasional.",
              },
              {
                title: "Terverifikasi",
                copy: "Memeriksa hasil tindakan sebelum melaporkan penyelesaian.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-primary-light/70">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section
      id="platform"
      className="border-y border-border bg-surface py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionIntro
          eyebrow="MEET YOUR AI AGENT"
          title="Tanggap tidak hanya menjawab. Tanggap membantu menyelesaikan."
          copy="Lima tahap kerja Tanggap mengubah exception menjadi proses penyelesaian yang terstruktur."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {capabilities.map((capability) => (
            <article
              key={capability.number}
              className="relative rounded-2xl border border-border bg-background p-6"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl font-bold tracking-[-.08em] text-border">
                  {capability.number}
                </span>
                <Image
                  src={capability.image}
                  alt={capability.title}
                  width={56}
                  height={56}
                  className="h-14 w-14 object-contain"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {capability.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {capability.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
    >
      <SectionIntro
        centered
        eyebrow="SEE TANGGAP IN ACTION"
        title="Satu instruksi. Workflow recovery yang terkoordinasi."
        copy="Tanggap membantu operator menangani shipment yang mengalami gangguan melalui investigasi hingga verifikasi."
      />

      <div className="mx-auto mt-12 max-w-3xl">
        <div className="mb-10 rounded-2xl border border-primary-light bg-primary-light/30 px-6 py-4 text-center">
          <p className="text-xs font-bold tracking-[.14em] text-primary">
            USER INSTRUCTION
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            &quot;Selesaikan shipment SH-8821.&quot;
          </p>
        </div>

        <ol className="space-y-6">
          {recoverySteps.map((step) => (
            <li key={step.number} className="flex items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {step.number}
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <LinkButton
            href={`/agent?message=${encodeURIComponent("Selesaikan shipment SH-8821.")}`}
          >
            Coba Skenario Ini <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

function ExecutionTrace() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-28">
      <SectionIntro
        eyebrow="TRANSPARENT EXECUTION"
        title="Setiap tindakan Tanggap memiliki jejak."
        copy="Pantau bagaimana Tanggap memanggil tools, menerima respons sistem, dan memverifikasi hasil."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-7">
          <p className="mb-4 text-xs font-bold tracking-[.14em] text-muted">
            EXAMPLE TRACE
          </p>
          <ul className="space-y-3">
            {executionTrace.map((step) => (
              <li
                key={step.label}
                className="flex items-center gap-3 font-mono text-sm"
              >
                {step.status === "done" ? (
                  <CircleCheck className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Hourglass className="h-4 w-4 shrink-0 text-warning" />
                )}
                <span
                  className={
                    step.status === "done" ? "text-foreground" : "text-muted"
                  }
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm leading-6 text-muted">
          Setiap langkah penting dapat ditelusuri melalui catatan eksekusi dan
          status hasilnya. Status ditampilkan sesuai hasil eksekusi aktual,
          bukan simulasi keberhasilan yang tidak terjadi.
        </p>
      </div>
    </section>
  );
}

function Integration() {
  return (
    <section
      id="integrasi"
      className="bg-primary-hover py-20 text-white lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-bold tracking-[.18em] text-primary-light">
            BUILT AROUND YOUR EXISTING SYSTEMS
          </p>
          <h2 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">
            Pertahankan sistemmu. Tambahkan kemampuan Tanggap.
          </h2>
          <p className="mt-5 leading-7 text-primary-light/80">
            TanggapAI dirancang untuk menghubungkan AI Agent dengan sistem
            logistik melalui API tanpa harus mengganti sistem operasional yang
            sudah ada.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="grid gap-3">
            {integrationSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-primary-light/70">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="grid grid-cols-2 gap-3 text-center text-xs font-semibold">
              {["TMS", "ERP", "Fleet", "Tracking"].map((system) => (
                <span
                  key={system}
                  className="rounded-lg border border-white/15 bg-white/10 px-4 py-3"
                >
                  {system}
                </span>
              ))}
            </div>
            <Network className="h-5 w-5 text-primary-light" />
            <WaletMascot size="md" />
            <p className="text-center text-xs text-primary-light/70">
              Simulated logistics API dipakai sampai integrasi vendor sungguhan
              tersedia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Safety() {
  return (
    <section
      id="safety"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-[.18em] text-primary">
            CONTROLLED AUTONOMY
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.03em] text-foreground sm:text-4xl">
            Tanggap sigap bertindak. Operator tetap memegang kendali.
          </h2>
          <p className="mt-5 leading-7 text-muted">
            TanggapAI menggabungkan otomatisasi dengan kontrol manusia untuk
            menjaga tindakan tetap sesuai aturan operasional.
          </p>
          <p className="mt-6 border-l-2 border-primary pl-4 text-sm font-medium italic text-foreground">
            &quot;Autonomous when possible. Human-in-the-loop when
            necessary.&quot;
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-card">
          <div className="flex justify-center">
            <WaletMascot size="lg" />
          </div>
          <div className="mt-6 grid gap-3">
            {safetyPoints.map((point) => (
              <div
                key={point.title}
                className="flex items-start gap-3 rounded-xl border border-border p-4"
              >
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {point.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
      <SectionIntro
        centered
        eyebrow="FAQ"
        title="Pertanyaan yang sering diajukan"
        copy="Hal-hal dasar seputar TanggapAI dan Tanggap."
      />
      <div className="mt-10 divide-y divide-border border-y border-border">
        {faqs.map((faq, index) => (
          <details key={faq.q} className="group py-5" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-semibold text-foreground">
              {faq.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-primary transition group-open:rotate-180" />
            </summary>
            <p className="max-w-2xl pt-3 pr-8 text-sm leading-6 text-muted">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="mx-auto max-w-7xl rounded-3xl bg-primary-hover px-7 py-14 text-center text-white sm:px-12 lg:py-20">
        <div className="flex justify-center">
          <WaletMascot size="md" />
        </div>
        <p className="mt-6 text-[11px] font-bold tracking-[.18em] text-primary-light">
          READY TO RESPOND?
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-.03em] sm:text-5xl">
          Jangan biarkan exception berhenti di dashboard.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-primary-light/80">
          Ceritakan masalah operasionalmu kepada Tanggap. Mulai investigasi,
          temukan langkah recovery, dan verifikasi hasilnya melalui TanggapAI.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/agent" variant="light">
            Coba TanggapAI <ArrowRight className="h-4 w-4" />
          </LinkButton>
          <a
            href="#cara-kerja"
            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Lihat Cara Kerja
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Logo />
            TanggapAI
          </div>
          <p className="mt-3 text-sm font-medium text-primary">
            &quot;Masalah terjadi. Tanggap tangani.&quot;
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Platform AI Agent untuk membantu penanganan exception dalam
            operasional logistik.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold tracking-wide text-muted">PLATFORM</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <a href="#platform" className="hover:text-foreground">
                Kemampuan Tanggap
              </a>
            </li>
            <li>
              <a href="#cara-kerja" className="hover:text-foreground">
                Cara Kerja
              </a>
            </li>
            <li>
              <a href="#integrasi" className="hover:text-foreground">
                Integrasi
              </a>
            </li>
            <li>
              <a href="#safety" className="hover:text-foreground">
                Safety &amp; Control
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold tracking-wide text-muted">
            RESOURCES
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link href="/overview" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/agent" className="hover:text-foreground">
                Demo
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-6 text-center text-xs text-muted sm:px-8">
        © 2026 TanggapAI. AI Agent untuk Operasional Logistik.
      </div>
    </footer>
  );
}
