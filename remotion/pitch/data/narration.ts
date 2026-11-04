// Single source of truth for the pitch video's narration: both
// scripts/generate-voiceover.ts (TTS generation) and PitchVideo's
// calculateMetadata (duration-from-audio) read this same list, so the
// spoken text and the composition can never drift out of sync.

export type NarrationId =
  | "titleIntro"
  | "teamIntro"
  | "institutionIntro"
  | "hook"
  | "solution"
  | "capabilities"
  | "demoIntro"
  | "demoInstruction"
  | "demoInvestigate"
  | "demoApprove1"
  | "demoEtaNotify"
  | "demoCompletion"
  | "demoTrace"
  | "scale"
  | "integration"
  | "safety"
  | "outro";

export const VOICEOVER_DIR = "voiceover/tracia-pitch";

export function voiceoverFile(id: NarrationId): string {
  return `${VOICEOVER_DIR}/${id}.mp3`;
}

export const narrationSegments: { id: NarrationId; text: string }[] = [
  {
    id: "titleIntro",
    text: "Perkenalkan TRACIA — platform AI Agent untuk investigasi, pemulihan, dan verifikasi exception operasional logistik, dibangun di atas large language model dengan tool calling yang terkendali.",
  },
  {
    id: "teamIntro",
    text: "Proyek ini dikembangkan oleh tiga mahasiswa: Lathif sebagai AI dan Backend Developer, Ali Sahat sebagai Frontend Developer, dan Yogawan sebagai UI/UX Designer.",
  },
  {
    id: "institutionIntro",
    text: "Dikembangkan di Universitas Teknologi Yogyakarta.",
  },
  {
    id: "hook",
    text: "Logistik Indonesia masih menghadapi tekanan efisiensi. Biaya logistik mencapai empat belas koma dua sembilan persen dari produk domestik bruto — jauh dari target delapan persen pada tahun dua ribu empat puluh lima. Logistics Performance Index Indonesia berada di angka tiga dari lima, dengan skor ketepatan waktu pengiriman hanya dua koma tujuh. Di balik angka-angka ini, operator menghadapi masalah yang sama setiap hari: data yang tersebar, investigasi yang lambat, dan tindakan yang tidak selalu dipastikan benar-benar menyelesaikan masalah.",
  },
  {
    id: "solution",
    text: "Inilah TRACIA — platform AI Agent yang bekerja di atas sistem logistik yang sudah kamu pakai — menghubungkan data yang terpisah itu menjadi satu alur kerja, dan mengubahnya menjadi tindakan nyata.",
  },
  {
    id: "capabilities",
    text: "Setiap exception yang masuk, TRACIA tangani melalui lima tahap kerja. Investigate — mengumpulkan kondisi sebenarnya dari shipment, kendaraan, dan driver yang terlibat. Reason — menganalisis apa penyebab masalahnya. Plan — menyusun recovery plan berdasarkan resource yang tersedia. Execute — menjalankan tindakan lewat tools yang diizinkan. Dan Verify — memeriksa ulang hasilnya sebelum menyatakan tugas selesai. Lima tahap ini mengubah exception yang tadinya kacau, menjadi proses yang terstruktur.",
  },
  {
    id: "demoIntro",
    text: "Mari kita lihat TRACIA bekerja secara langsung, menangani satu kasus nyata.",
  },
  {
    id: "demoInstruction",
    text: "Semuanya dimulai dari satu instruksi sederhana yang diketik operator: Selesaikan pengiriman SH-8821.",
  },
  {
    id: "demoInvestigate",
    text: "Dalam hitungan detik, TRACIA menginvestigasi. Ditemukan: kendaraan B 9012 ABC mengalami overheat di KM 97, Tol Cipularang. Driver aman, tapi butuh kendaraan pengganti. TRACIA menemukan kendaraan dan driver yang tersedia — lalu berhenti sejenak, meminta persetujuan operator sebelum bertindak lebih jauh.",
  },
  {
    id: "demoApprove1",
    text: "Operator menyetujui. TRACIA langsung menjalankan reassignment-nya.",
  },
  {
    id: "demoEtaNotify",
    text: "Karena kendaraan pengganti berangkat dari titik berbeda, TRACIA memperbarui estimasi waktu tiba — dan sekali lagi, meminta persetujuan. Setelah disetujui, customer langsung diberi tahu lewat WhatsApp — tanpa operator perlu mengetik satu pesan pun.",
  },
  {
    id: "demoCompletion",
    text: "Dari deteksi masalah hingga semuanya selesai: reassignment, update ETA, notifikasi customer — kurang dari lima menit, tanpa intervensi manual di lapangan.",
  },
  {
    id: "demoTrace",
    text: "Dan setiap langkah yang diambil TRACIA tercatat lengkap. Tool apa yang dipanggil, kapan, dengan hasil apa — semuanya bisa ditelusuri kapan saja, bukan sekadar klaim keberhasilan.",
  },
  {
    id: "scale",
    text: "Ini bukan cuma soal satu shipment. Saat empat exception kritis muncul bersamaan, TRACIA memprosesnya satu per satu, tetap meminta persetujuan di setiap langkah penting — sampai semuanya kembali normal.",
  },
  {
    id: "integration",
    text: "TRACIA tidak menggantikan sistem TMS atau ERP yang sudah kamu pakai. TRACIA bekerja di atasnya — terhubung lewat API, mengorkestrasi tools yang tersedia, dan menjalankan tindakan yang diizinkan.",
  },
  {
    id: "safety",
    text: "TRACIA sigap bertindak. Tapi operator tetap memegang kendali penuh. Tools yang bisa digunakan dibatasi. Tindakan berisiko membutuhkan persetujuan. Dan setiap hasil diverifikasi sebelum dinyatakan selesai. Autonomous when possible. Human in the loop when necessary.",
  },
  {
    id: "outro",
    text: "Masalah terjadi. TRACIA tangani.",
  },
];
