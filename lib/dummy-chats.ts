import type { StoredChat } from "./chat-history";

// Hardcoded showcase conversations for demos (judges/investors/lecturers) —
// not real executions, so messages never carry a real executionId.
export const dummyChats: StoredChat[] = [
  {
    id: "demo-resolve-sh-8821",
    title: "Resolve shipment SH-8821",
    createdAt: "2026-10-21T01:58:00.000Z",
    updatedAt: "2026-10-21T02:03:00.000Z",
    messages: [
      {
        role: "user",
        content: "Resolve shipment SH-8821",
        createdAt: "2026-10-21T01:58:00.000Z",
      },
      {
        role: "agent",
        status: "pending_approval",
        stages: ["investigate", "reason", "plan"],
        executionId: "demo-exec-resolve-1",
        tool: "reassignShipment",
        input: {
          shipmentNumber: "SH-8821",
          vehicleId: "65fa1e2b3c4d5e6f7a8b9c01",
          driverId: "65fa1e2b3c4d5e6f7a8b9c02",
        },
        content:
          "Investigasi SH-8821:\n- Status: delayed (prioritas: high)\n- Rute: Jakarta → Bandung, customer PT Sumber Makmur\n- Exception terdeteksi: vehicle_breakdown (severity: critical) — kendaraan B 9012 ABC overheat di KM 97 Tol Cipularang, pukul 09:14.\n- Driver Agus Wijaya aman dan standby menunggu kendaraan pengganti.\n\nKendaraan & driver pengganti tersedia:\n- Kendaraan: B 7741 XYZ (truck, available)\n- Driver: Budi Santoso (available, rating 4.9, berpengalaman rute Jakarta–Bandung)\n\nSaya akan reassign shipment ini ke kendaraan dan driver pengganti tersebut. Mohon persetujuan untuk melanjutkan.",
        createdAt: "2026-10-21T01:58:40.000Z",
      },
      {
        role: "agent",
        status: "pending_approval",
        stages: ["execute", "plan"],
        executionId: "demo-exec-resolve-2",
        tool: "updateETA",
        input: {
          shipmentNumber: "SH-8821",
          estimatedDelivery: "2026-10-21T18:45:00.000Z",
        },
        content:
          "✓ Reassignment berhasil — SH-8821 kini ditangani B 7741 XYZ dengan driver Budi Santoso, status berubah ke in_transit.\n\nKendaraan pengganti berangkat dari titik yang berbeda, jadi estimasi tiba perlu diperbarui dari 14:30 menjadi 18:45. Mohon persetujuan untuk update ETA.",
        createdAt: "2026-10-21T02:00:10.000Z",
      },
      {
        role: "agent",
        status: "pending_approval",
        stages: ["execute", "plan"],
        executionId: "demo-exec-resolve-3",
        tool: "notifyCustomer",
        input: {
          shipmentNumber: "SH-8821",
          channel: "whatsapp",
          message:
            "Halo PT Sumber Makmur, pengiriman SH-8821 dialihkan ke kendaraan pengganti karena kendala teknis. Estimasi tiba baru: 18:45 WIB. Mohon maaf atas ketidaknyamanannya.",
        },
        content:
          "✓ ETA diperbarui ke 18:45.\n\nSelanjutnya saya akan mengirim notifikasi ke customer (PT Sumber Makmur) mengenai perubahan kendaraan dan estimasi waktu tiba yang baru. Mohon persetujuan untuk mengirim notifikasi.",
        createdAt: "2026-10-21T02:01:20.000Z",
      },
      {
        role: "agent",
        status: "completed",
        stages: ["execute", "verify"],
        content:
          "✓ Notifikasi terkirim via WhatsApp.\n\nVerifikasi akhir: SH-8821 berstatus in_transit, kendaraan dan driver pengganti aktif menuju Bandung, exception vehicle_breakdown ditandai resolved.\n\nShipment SH-8821 selesai ditangani — dari deteksi masalah hingga resolusi memakan waktu kurang dari 5 menit tanpa intervensi manual di lapangan.",
        createdAt: "2026-10-21T02:03:00.000Z",
      },
    ],
  },
  {
    id: "demo-investigate-sh-8821",
    title: "Investigate SH-8821",
    createdAt: "2026-10-21T03:10:00.000Z",
    updatedAt: "2026-10-21T03:10:25.000Z",
    messages: [
      {
        role: "user",
        content: "Investigate SH-8821",
        createdAt: "2026-10-21T03:10:00.000Z",
      },
      {
        role: "agent",
        status: "completed",
        stages: ["investigate", "reason"],
        content:
          'Hasil investigasi SH-8821:\n\nShipment\n- Customer: PT Sumber Makmur\n- Rute: Jakarta → Bandung\n- Prioritas: high\n- Status saat ini: delayed\n- Estimasi tiba (awal): 14:30\n\nException\n- Tipe: vehicle_breakdown\n- Severity: critical\n- Terdeteksi: 09:14, di KM 97 Tol Cipularang\n- Deskripsi: kendaraan B 9012 ABC overheat dan tidak dapat melanjutkan perjalanan.\n\nDriver Agus Wijaya aman dan standby menunggu kendaraan pengganti.\n\nRekomendasi: reassign ke kendaraan dan driver pengganti yang tersedia agar pengiriman dapat segera dilanjutkan. Ketik "Resolve shipment SH-8821" jika ingin saya proses.',
        createdAt: "2026-10-21T03:10:25.000Z",
      },
    ],
  },
  {
    id: "demo-why-sh-8821-delayed",
    title: "Why is SH-8821 delayed?",
    createdAt: "2026-10-21T03:25:00.000Z",
    updatedAt: "2026-10-21T03:25:20.000Z",
    messages: [
      {
        role: "user",
        content: "Why is SH-8821 delayed?",
        createdAt: "2026-10-21T03:25:00.000Z",
      },
      {
        role: "agent",
        status: "completed",
        stages: ["reason"],
        content:
          "SH-8821 tertunda karena kendaraan yang bertugas (B 9012 ABC) mengalami overheat di KM 97 Tol Cipularang pukul 09:14 dan tidak dapat melanjutkan perjalanan menuju Bandung.\n\nIni tercatat sebagai exception bertipe vehicle_breakdown dengan severity critical. Driver (Agus Wijaya) sudah menghubungi pos terdekat dan menunggu kendaraan pengganti — tidak ada risiko keselamatan.\n\nDampak: estimasi tiba yang semula 14:30 berpotensi mundur signifikan jika tidak ada tindakan. Saya bisa langsung mencari kendaraan pengganti dan menyelesaikan shipment ini — tinggal konfirmasi.",
        createdAt: "2026-10-21T03:25:20.000Z",
      },
    ],
  },
  {
    id: "demo-find-available-drivers",
    title: "Find available drivers",
    createdAt: "2026-10-21T04:05:00.000Z",
    updatedAt: "2026-10-21T04:05:15.000Z",
    messages: [
      {
        role: "user",
        content: "Find available drivers",
        createdAt: "2026-10-21T04:05:00.000Z",
      },
      {
        role: "agent",
        status: "completed",
        stages: ["investigate"],
        content:
          "Driver dengan status available saat ini:\n\n1. Budi Santoso — rating 4.9, zona Jakarta–Bandung, kendaraan terakhir: truck\n2. Sari Wulandari — rating 4.8, zona Jakarta–Bekasi, kendaraan terakhir: van\n3. Hendra Gunawan — rating 4.7, zona Bandung–Cirebon, kendaraan terakhir: truck\n4. Dewi Anggraini — rating 4.9, zona Surabaya–Malang, kendaraan terakhir: van\n\n4 driver siap ditugaskan. Beri tahu saya shipment mana yang perlu driver pengganti, dan saya akan cocokkan dengan driver yang paling sesuai.",
        createdAt: "2026-10-21T04:05:15.000Z",
      },
    ],
  },
  {
    id: "demo-show-critical-exceptions",
    title: "Show critical exceptions",
    createdAt: "2026-10-21T04:40:00.000Z",
    updatedAt: "2026-10-21T04:40:20.000Z",
    messages: [
      {
        role: "user",
        content: "Show critical exceptions",
        createdAt: "2026-10-21T04:40:00.000Z",
      },
      {
        role: "agent",
        status: "completed",
        stages: ["investigate"],
        content:
          'Exception aktif dengan severity critical/high saat ini:\n\n1. SH-8821 — vehicle_breakdown (critical) — Jakarta → Bandung — kendaraan overheat, driver standby\n2. SH-8835 — driver_unavailable (high) — Surabaya → Malang — driver sakit mendadak, kendaraan idle\n3. SH-8790 — route_blocked (critical) — Jakarta → Semarang — jalur utama banjir, perlu reroute\n4. SH-8902 — late_delivery (high) — Medan → Pekanbaru — sudah melewati ETA 2 jam 15 menit\n\n4 shipment membutuhkan tindakan segera. Ketik "Handle all critical logistics exceptions" jika ingin saya proses semuanya secara berurutan.',
        createdAt: "2026-10-21T04:40:20.000Z",
      },
    ],
  },
  {
    id: "demo-handle-all-critical",
    title: "Handle all critical logistics exceptions",
    createdAt: "2026-10-21T05:00:00.000Z",
    updatedAt: "2026-10-21T05:07:00.000Z",
    messages: [
      {
        role: "user",
        content: "Handle all critical logistics exceptions",
        createdAt: "2026-10-21T05:00:00.000Z",
      },
      {
        role: "agent",
        status: "pending_approval",
        stages: ["investigate", "plan"],
        executionId: "demo-exec-batch-1",
        tool: "reassignShipment",
        input: {
          shipmentNumber: "SH-8821",
          vehicleId: "65fa1e2b3c4d5e6f7a8b9c01",
          driverId: "65fa1e2b3c4d5e6f7a8b9c02",
        },
        content:
          "Ditemukan 4 shipment dengan exception critical/high:\n1. SH-8821 — vehicle_breakdown (critical)\n2. SH-8835 — driver_unavailable (high)\n3. SH-8790 — route_blocked (critical)\n4. SH-8902 — late_delivery (high)\n\nMemproses satu per satu, mulai dari prioritas tertinggi.\n\n[1/4] SH-8821: kendaraan B 9012 ABC overheat di Tol Cipularang. Kendaraan & driver pengganti tersedia (B 7741 XYZ, Budi Santoso). Mohon persetujuan untuk reassign.",
        createdAt: "2026-10-21T05:00:45.000Z",
      },
      {
        role: "agent",
        status: "pending_approval",
        stages: ["execute", "plan"],
        executionId: "demo-exec-batch-2",
        tool: "reassignShipment",
        input: {
          shipmentNumber: "SH-8835",
          vehicleId: "65fa1e2b3c4d5e6f7a8b9c10",
          driverId: "65fa1e2b3c4d5e6f7a8b9c11",
        },
        content:
          "✓ [1/4] SH-8821 selesai — reassigned ke B 7741 XYZ / Budi Santoso, status in_transit.\n\n[2/4] SH-8835: driver sakit mendadak, kendaraan masih layak jalan. Driver pengganti tersedia (Sari Wulandari). Mohon persetujuan untuk reassign.",
        createdAt: "2026-10-21T05:02:10.000Z",
      },
      {
        role: "agent",
        status: "pending_approval",
        stages: ["execute", "plan"],
        executionId: "demo-exec-batch-3",
        tool: "updateETA",
        input: {
          shipmentNumber: "SH-8790",
          estimatedDelivery: "2026-10-21T15:20:00.000Z",
        },
        content:
          "✓ [2/4] SH-8835 selesai — driver diganti ke Sari Wulandari, status in_transit.\n\n[3/4] SH-8790: jalur utama Jakarta–Semarang banjir, rute dialihkan lewat Pantura. Estimasi tiba mundur dari 11:00 menjadi 15:20. Mohon persetujuan untuk update ETA.",
        createdAt: "2026-10-21T05:04:05.000Z",
      },
      {
        role: "agent",
        status: "pending_approval",
        stages: ["execute", "plan"],
        executionId: "demo-exec-batch-4",
        tool: "notifyCustomer",
        input: {
          shipmentNumber: "SH-8902",
          channel: "sms",
          message:
            "Mohon maaf, pengiriman SH-8902 mengalami keterlambatan. Tim kami sedang mempercepat proses pengiriman. ETA terbaru akan segera kami kirimkan.",
        },
        content:
          "✓ [3/4] SH-8790 selesai — ETA diperbarui, customer akan diberi tahu otomatis setelah ini.\n\n[4/4] SH-8902: sudah melewati ETA 2 jam 15 menit tanpa update. Saya akan kirim notifikasi permintaan maaf dan ETA baru ke customer. Mohon persetujuan untuk mengirim notifikasi.",
        createdAt: "2026-10-21T05:05:30.000Z",
      },
      {
        role: "agent",
        status: "completed",
        stages: ["execute", "verify"],
        content:
          "✓ [4/4] SH-8902 selesai — notifikasi terkirim ke customer.\n\nRingkasan: 4 dari 4 exception critical/high berhasil ditangani dan diverifikasi:\n- SH-8821 ✓ resolved (vehicle_breakdown)\n- SH-8835 ✓ resolved (driver_unavailable)\n- SH-8790 ✓ resolved (route_blocked)\n- SH-8902 ✓ resolved (late_delivery)\n\nSemua shipment kini berjalan normal. Tidak ada exception critical/high yang tersisa.",
        createdAt: "2026-10-21T05:07:00.000Z",
      },
    ],
  },
];
