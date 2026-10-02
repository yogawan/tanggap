# Execution Plan — Tanggap AI (LogiResolve AI)

Dokumen ini adalah kelanjutan dari `PRD.md` dan `MONGOSEE-MODEL-PLAN.md`. Isinya urutan fase implementasi dari titik sekarang sampai demo-ready, supaya tiap sesi kerja tinggal nunjuk "lanjut Fase N" tanpa perlu re-explain context.

Setiap fase punya: Tujuan, Deliverables (path file), Tasks, dan Definition of Done (DoD). Checklist pakai `[ ]` biar progress-nya bisa di-update langsung di file ini.

---

## Status Saat Ini

- [x] Next.js 16 app scaffold (`app/`, default starter page)
- [x] Mongoose terpasang (`^9.10.3`)
- [x] 6 model: `Shipment`, `Vehicle`, `Driver`, `Exception`, `AgentExecution`, `Notification` di `models/`
- [x] `models/db.ts` — `dbConnect()` dengan global cache (anti multi-connect saat hot reload)
- [x] `.env.local` + `.env.example` — `MONGODB_URI` dan `DEEPSEEK_API_KEY` terisi
- [x] Seed data — `scripts/seed.ts`, 10 driver/10 vehicle/20 shipment/5 exception, skenario SH-8821 terverifikasi
- [x] Tool layer — `lib/tools/` (10 tool, semua dites manual terhadap seed data)
- [x] Agent orchestrator — `lib/agent/` (registry, context, guardrails, execution-manager, planner stub), simulasi manual resolve-SH-8821 lulus
- [~] DeepSeek integration — kode selesai & tervalidasi tanpa model asli (lihat Fase 5), **tapi belum pernah sukses manggil model asli karena saldo DeepSeek $0**
- [ ] API routes, dashboard UI — belum ada

Semua fase di bawah ini belum dikerjakan.

---

## Fase 1 — Environment & DB Connectivity

**Tujuan:** pastikan koneksi ke MongoDB Atlas benar-benar hidup sebelum nulis logic apapun di atasnya.

**Deliverables:**
- `.env.local` (tidak dikomit — sudah di-ignore)
- `.env.example` (dikomit, placeholder saja)

**Tasks:**
- [x] Buat cluster MongoDB Atlas (atau pakai yang sudah ada), whitelist IP / set `0.0.0.0/0` untuk dev.
- [x] Isi `MONGODB_URI` di `.env.local`.
- [x] Siapkan `DEEPSEEK_API_KEY` di `.env.local` (dipakai Fase 5).
- [x] Buat `.env.example` dengan key kosong sebagai dokumentasi.
- [x] Smoke test: dibuktikan lewat `scripts/seed.ts` — `dbConnect()` konek dan read/write ke Atlas sukses, tidak perlu script smoke-test terpisah.

**DoD:** smoke test konek sukses ke Atlas tanpa error. ✅ (lihat Fase 2)

---

## Fase 2 — Seed Data

**Tujuan:** isi database dengan skenario yang **sengaja bermasalah**, sesuai `MONGOSEE-MODEL-PLAN.md`, supaya agent punya kasus nyata buat didemoin.

**Deliverables:**
- `scripts/seed.ts`
- npm script `"seed": "tsx scripts/seed.ts"` (atau `ts-node`) di `package.json`

**Tasks:**
- [x] Generate 10 `Driver`, 10 `Vehicle`, 20 `Shipment`.
- [x] Generate 5 `Exception`, termasuk skenario utama:
  - `SH-8821` — PT Maju Jaya, Jakarta → Bandung, status `delayed`, vehicle `B 1234 XYZ` (status `broken`), driver Budi → exception `vehicle_breakdown`.
- [x] Sisakan minimal 1 vehicle `available` + 1 driver `available` sebagai kandidat replacement (misal `B 5678 ABC` + Andi), biar `findAvailableVehicles`/`findAvailableDrivers` di Fase 3 ada hasil.
- [x] `AgentExecution` dan `Notification` tetap kosong (diisi oleh agent saat runtime).
- [x] Script idempotent: drop collections dulu / upsert by unique key, biar bisa di-run ulang tanpa duplikat.

**DoD:** `npm run seed` jalan, data ketemu di Atlas, skenario SH-8821 bisa di-query manual dan cocok sama cerita di PRD §15. ✅ Terverifikasi — lihat ringkasan di bawah.

Ringkasan data yang ter-seed (selain skenario SH-8821):
- `SH-8834` (PT Sinar Abadi) — `driver_unavailable`, critical, open — driver Yusuf off_duty.
- `SH-8841` (PT Lintas Nusantara) — `route_blocked`, critical, open — banjir, belum ada rute alternatif.
- `SH-8816` (PT Graha Niaga) — `late_delivery`, medium, investigating.
- `SH-8850` (PT Cipta Kargo) — `late_delivery`, low, **resolved** (riwayat kasus yang sudah selesai).
- 14 shipment lain (`SH-8802`–`SH-8815`, minus `SH-8816`) sebagai histori `delivered`/`cancelled` tanpa exception, buat ngisi dashboard biar nggak kosong.

---

## Fase 3 — Tool Layer

**Tujuan:** bungkus semua akses Mongoose jadi fungsi-fungsi terkontrol (PRD §4.4 & §8 — "DeepSeek tidak mengakses MongoDB secara langsung").

**Deliverables:** `lib/tools/` — satu file per domain, re-export lewat `lib/tools/index.ts`.

| File | Fungsi |
|---|---|
| `lib/tools/shipment.ts` | `getShipment()`, `reassignShipment()`, `updateETA()`, `verifyShipmentResolution()` |
| `lib/tools/vehicle.ts` | `getVehicle()`, `findAvailableVehicles()` |
| `lib/tools/driver.ts` | `getDriver()`, `findAvailableDrivers()` |
| `lib/tools/exception.ts` | `getException()` |
| `lib/tools/notification.ts` | `notifyCustomer()` |

**Tasks:**
- [x] Setiap fungsi: validasi input (zod schema) → `dbConnect()` → query/mutation Mongoose → return shape yang predictable (bukan raw Mongoose document).
- [x] Setiap fungsi punya parameter & return type eksplisit (dipakai buat generate tool-calling schema di Fase 5).
- [x] Tandai tiap tool: **low-risk** (read-only: `getShipment`, `getException`, `getVehicle`, `getDriver`, `findAvailable*`, `verifyShipmentResolution`) vs **high-risk** (mutasi: `reassignShipment`, `updateETA`, `notifyCustomer`) — dipakai Fase 7 (HITL).
- [x] `reassignShipment()` harus update `Shipment.vehicleId`/`driverId`, dan set `Vehicle`/`Driver` status jadi `in_use`/`on_delivery`.
- [x] Error handling: tool gagal → return `{ success: false, error }`, jangan throw ke caller (biar agent bisa decide retry/alternative, sesuai PRD §14).

**DoD:** semua tool bisa dipanggil manual (unit test atau script) terhadap seed data Fase 2 dan hasilnya sesuai ekspektasi (termasuk kasus gagal). ✅ Terverifikasi via script sementara (udah dihapus) yang menjalankan full happy path SH-8821 (investigate → reassign → update ETA → notify → verify → exception auto-resolved) ditambah 3 kasus gagal (shipment not found, input invalid, vehicle yang di-reassign ternyata tidak available). Data sudah di-reseed ke kondisi pristine setelahnya.

**Catatan implementasi (di luar yang disebut tabel):**
- `lib/tools/shared.ts` — helper `defineTool()` (validasi + `dbConnect()` + try/catch + shape `{success,data|error}` seragam untuk semua tool) dan `objectIdSchema`. Setiap tool adalah object `{ name, description, riskLevel, inputSchema, handler }`, bukan fungsi polos — `description` ditambahkan dari awal karena bakal langsung kepake buat tool-calling schema DeepSeek di Fase 5.
- `lib/tools/index.ts` — `export const allTools = [...]`, array semua tool buat langsung dikonsumsi `tool-registry.ts` di Fase 4.
- `verifyShipmentResolution` ditandai **low-risk**: dia cuma mengecek kondisi + menandai `Exception` terkait jadi `resolved`, tidak mengubah resource customer-facing (vehicle/driver/notifikasi).
- `reassignShipment` cuma melepas vehicle lama ke `available` kalau statusnya `in_use` — vehicle yang `broken`/`maintenance` tetap di status itu (nggak otomatis "sembuh" cuma karena shipment-nya dipindah).

---

## Fase 4 — Agent Orchestrator (tanpa LLM dulu)

**Tujuan:** bangun "otak" di antara LLM dan Tool Layer (PRD §7), sebelum disambungkan ke DeepSeek, supaya logic-nya testable tanpa biaya API call.

**Deliverables:** `lib/agent/`

| File | Peran |
|---|---|
| `lib/agent/tool-registry.ts` | daftar tool + metadata (nama, schema param, risk level) dari Fase 3 |
| `lib/agent/context-manager.ts` | kumpulin context (shipment + relasi) jadi satu object buat prompt |
| `lib/agent/guardrails.ts` | cek permission & validasi sebelum tool high-risk dieksekusi |
| `lib/agent/execution-manager.ts` | jalanin tool call, catat tiap step ke `AgentExecution` |
| `lib/agent/planner.ts` | (stub dulu — logic planning sebenarnya ada di LLM, ini cuma penentu urutan default) |

**Tasks:**
- [x] `execution-manager` bikin 1 dokumen `AgentExecution` per task (`status: running`), lalu push ke `steps[]` tiap kali ada `reasoning | tool_call | tool_result | decision`.
- [x] `guardrails` nolak eksekusi tool high-risk tanpa flag `approved: true`.
- [x] Semua ini harus bisa dites dengan tool calls yang di-hardcode dulu (belum butuh DeepSeek).

**DoD:** simulasi manual "resolve SH-8821" (tool calls di-urutkan manual sesuai PRD §10) menghasilkan 1 `AgentExecution` dengan `steps` yang match trace di PRD §10, status akhir `completed`. ✅ Terverifikasi via script sementara (udah dihapus) — hasil akhir 20 steps, status `completed`:

```
01 tool_call   getShipment              07 tool_result findAvailableVehicles    14 tool_call   updateETA
02 tool_result getShipment              08 tool_call   findAvailableDrivers     15 tool_result updateETA
03 tool_call   getException             09 tool_result findAvailableDrivers     16 tool_call   notifyCustomer
04 tool_result getException             10 decision    Replacement validated    17 tool_result notifyCustomer
05 reasoning   vehicle_breakdown...      11 decision    (blocked, unapproved)    18 tool_call   verifyShipmentResolution
06 tool_call   findAvailableVehicles    12 tool_call   reassignShipment         19 tool_result verifyShipmentResolution
                                         13 tool_result reassignShipment         20 decision    Shipment recovered
```

**Catatan interpretasi:** skema `AgentExecution.steps[].type` cuma punya 4 nilai (`reasoning|tool_call|decision`), sedangkan trace ilustratif di PRD §10 pakai 7 label ("Investigation", "Action", "Verification", dst). Jadi "Investigation"/"Action"/"Verification" di PRD dipetakan ke pasangan `tool_call`+`tool_result` (step 01-04, 12-19), bukan label baru di schema — urutan & maknanya tetap identik dengan PRD, cuma granularitas-nya lebih rinci (setiap tool call pecah jadi 2 step, bukan 1 baris). Step 11 (guardrail nolak percobaan reassign tanpa approval) sengaja disisipkan buat membuktikan task guardrail di atas — baru di step 12 dia jalan setelah dikasih `approved: true`.

**Catatan implementasi (di luar yang disebut tabel):**
- `lib/agent/tool-registry.ts` — `Map` by name dari `allTools` (Fase 3), plus `listToolSummaries()` buat Fase 5.
- `verifyShipmentResolution` ditandai **low-risk** di Fase 3, jadi di simulasi dia jalan tanpa perlu `approved: true` — cuma `reassignShipment`/`updateETA`/`notifyCustomer` yang digerbangi guardrail.
- `AgentExecutionManager.linkShipment()` dipanggil setelah `getShipment` sukses (bukan di `start()`) — karena shipment ID-nya emang belum diketahui sebelum tool call pertama itu, sama seperti urutan PRD §10.
- `planner.ts` sengaja tetap tipis (cuma daftar stage nama, bukan tool call konkret) karena input tool seperti `vehicleId`/`driverId` nggak bisa di-hardcode — baru ketahuan dari hasil `findAvailable*` saat runtime. Fase 5 bikin planner ini jadi pass-through sepenuhnya.

---

## Fase 5 — DeepSeek LLM Integration

**Tujuan:** sambungkan reasoning ke DeepSeek API, gantikan urutan tool call manual dari Fase 4 dengan keputusan model.

**Deliverables:**
- `lib/deepseek.ts` — client + wrapper chat completion dengan tool calling
- `lib/agent/system-prompt.ts` — system prompt (persona, aturan HITL, daftar tool)
- `lib/agent/reasoning-loop.ts` *(tambahan di luar rencana awal — ini tempat "reasoning loop"-nya benar-benar diimplementasikan; nama `runAgentTask()`, nerima `createCompletion` opsional buat testing tanpa API asli)*

**Tasks:**
- [x] Define tool schema (JSON schema) dari metadata di `tool-registry.ts` (Fase 4), format sesuai tool-calling spec DeepSeek.
- [x] Reasoning loop: kirim pesan user → DeepSeek pilih tool → `execution-manager` jalanin → hasil dikirim balik ke DeepSeek → ulang sampai model bilang selesai atau butuh approval.
- [x] System prompt eksplisit larang DeepSeek "berasumsi berhasil" sebelum verifikasi (PRD §14).
- [x] Planner di Fase 4 sekarang jadi pass-through — `reasoning-loop.ts` nggak pernah manggil `planner.ts` sama sekali, urutan tool 100% keputusan model. `planner.ts` dibiarkan ada cuma sebagai referensi/fallback.

**DoD:** prompt bebas teks "Resolve shipment SH-8821" via script/CLI test menghasilkan urutan tool call yang masuk akal (tidak harus persis sama tiap run, tapi harus nyampe ke proposal reassignment) dan tercatat di `AgentExecution`. ⏳ **BELUM — blocked, saldo DeepSeek platform $0.** Satu-satunya real API call yang dicoba gagal di tahap paling awal (402 Insufficient Balance, sebelum model sempat reasoning sama sekali). Lihat "Yang udah vs belum tervalidasi" di bawah.

**Yang udah vs belum tervalidasi (karena saldo $0):**

✅ **Udah kebuktian, tanpa butuh saldo:**
- Konversi tool schema (`zod` → JSON Schema DeepSeek) — diinspeksi langsung buat semua 10 tool, hasilnya valid (`type`, `properties`, `required`, `additionalProperties:false`, `anyOf` buat union, enum, format `date-time`). Ketemu 1 bug nyata di proses ini: `updateETA` tadinya pakai `z.coerce.date()` yang nggak bisa direpresentasikan di JSON Schema (Date bukan tipe JSON) — udah diganti ke `z.iso.datetime()` (ISO string) + `new Date(...)` di eksekusinya.
- Mekanisme loop itu sendiri — dites pakai **model palsu** (`createCompletion` di-inject, nggak nyentuh API asli): skenario getShipment → getException → (findAvailableVehicles + findAvailableDrivers bareng satu turn) → reassignShipment. Hasilnya persis sesuai desain: 3 tool low-risk jalan otomatis + tercatat ke `AgentExecution`, lalu begitu model "minta" `reassignShipment` (high-risk), loop **berhenti sebelum eksekusi** (dibuktikan dari fake id ObjectId yang nggak valid tapi nggak pernah dicoba dieksekusi) dan return `status: "pending_approval"` dengan `AgentExecution.status` tetap `running`.
- Koneksi real ke DeepSeek — **1 kali** panggilan asli (`runAgentTask` tanpa stub) buat mastiin base URL/API key/nama model bener. Hasilnya: request nyampe ke billing layer DeepSeek dan ditolak spesifik `402 Insufficient Balance` (bukan 401/404/connection error) — artinya config udah benar, dan `isInsufficientBalanceError()` + error handling di loop nangkep ini dengan bersih (`status:"failed"` + pesan jelas, nggak crash). Panggilan ini aman/gratis karena DeepSeek nolak di admission layer sebelum ngitung token.

❌ **Belum bisa dibuktikan, nunggu top up:**
- Apakah model DeepSeek yang SUNGGUHAN bisa reasoning dengan benar — milih tool yang tepat, urutan yang masuk akal, berhenti di approval, nggak asal klaim berhasil (prompt di `system-prompt.ts` udah nulis aturan ini, tapi belum ada cara ngetes beneran jalan tanpa model asli).
- DoD resminya baru bisa di-declare selesai setelah top up + re-run.

**Rekomendasi:** top up kecil aja (DeepSeek murah banget per call, `deepseek-flash` ~$0.15/1M token cache-miss) buat sekali jalan CLI test "Resolve shipment SH-8821" lewat `runAgentTask()` tanpa stub — begitu itu lolos, Fase 5 baru bener-bener closed.

---

## Fase 6 — API Routes

**Tujuan:** expose orchestrator ke frontend.

**Deliverables:** `app/api/`

| Route | Fungsi |
|---|---|
| `app/api/agent/chat/route.ts` | terima message user, jalankan orchestrator, return response + (jika ada) pending approval |
| `app/api/agent/approve/route.ts` | terima keputusan Approve/Reject untuk action high-risk yang pending |
| `app/api/dashboard/overview/route.ts` | aggregate: total shipments, delayed, critical exceptions, resolved, resolution rate |
| `app/api/exceptions/route.ts` | list exceptions (filter by severity/status) |
| `app/api/shipments/[id]/route.ts` | detail shipment + relasi (buat investigation view) |

**Tasks:**
- [ ] Semua route cuma manggil `lib/agent/*` atau `lib/tools/*`, tidak ada Mongoose query langsung di route handler.
- [ ] Response shape konsisten (`{ data, error }`).

**DoD:** semua endpoint bisa di-hit via `curl`/Postman dan hasilnya sesuai data seed.

---

## Fase 7 — Human-in-the-Loop Flow

**Tujuan:** implementasi approval gate dari PRD §6.

**Tasks:**
- [ ] State "pending action" disimpan sementara (in-memory per session, atau field di `AgentExecution`) berisi tool + params yang nunggu approval.
- [ ] `app/api/agent/approve/route.ts` (Fase 6): kalau Approve → jalankan tool high-risk via `execution-manager`; kalau Reject → catat sebagai step `decision` dengan hasil rejected, agent berhenti/cari alternatif.
- [ ] Guardrails (Fase 4) jadi satu-satunya gate — tidak ada jalur lain buat trigger tool high-risk.

**DoD:** skenario Approve dan Reject keduanya menghasilkan state akhir yang benar dan tercatat di trace.

---

## Fase 8 — Dashboard UI

**Tujuan:** PRD §12.

**Deliverables:** replace `app/page.tsx` starter, tambah route baru.

| Page | Isi |
|---|---|
| `app/page.tsx` / `app/dashboard/page.tsx` | Overview cards (PRD §12) |
| `app/exceptions/page.tsx` | Exception Dashboard (list by severity) |
| `app/agent/page.tsx` | AI Agent Workspace — chat UI + tombol Approve/Reject (PRD §12) |

**Tasks:**
- [ ] Chat UI minimal: input, message list, render step-by-step progress agent ("✓ Shipment found", dst — PRD §12 contoh).
- [ ] Approve/Reject button muncul cuma kalau response dari `/api/agent/chat` punya pending action.
- [ ] Dashboard numbers fetch dari `app/api/dashboard/overview`.

**DoD:** demo flow end-to-end bisa dijalankan dari browser, bukan cuma dari API call manual.

---

## Fase 9 — Agent Execution Trace Viewer

**Tujuan:** PRD §10 — audit trail yang bisa dilihat, bukan cuma tersimpan.

**Deliverables:** `app/agent/[executionId]/page.tsx` atau panel di `app/agent/page.tsx`.

**Tasks:**
- [ ] Render `AgentExecution.steps[]` sebagai timeline (reasoning/tool_call/tool_result/decision dibedain visualnya).

**DoD:** trace SH-8821 keliatan persis urutannya seperti contoh di PRD §10.

---

## Fase 10 — Demo Scenario End-to-End + Metrics

**Tujuan:** validasi PRD §15 jalan mulus dari UI, dan isi angka-angka PRD §13.

**Tasks:**
- [ ] Jalankan ulang skenario "Resolve shipment SH-8821" dari UI, dari nol (re-seed), rekam hasilnya.
- [ ] Hitung metrics dasar dari data yang ada (resolution rate, avg steps per resolution) — PRD §13 bilang target angka ditentukan **setelah** ada data uji, bukan sebelum.
- [ ] Siapkan 1 skenario gagal (misal route blocked tanpa alternatif) buat nunjukin "Requires manual intervention" (PRD §4.5).

**DoD:** demo 3–5 menit sesuai PRD §15 bisa dijalankan tanpa manual DB editing di tengah jalan.

---

## Fase 11 — Deployment

**Tasks:**
- [ ] Set env vars (`MONGODB_URI`, `DEEPSEEK_API_KEY`) di Vercel project settings.
- [ ] Pastikan Atlas network access mengizinkan IP Vercel (atau `0.0.0.0/0` kalau sesuai toleransi risiko kompetisi).
- [ ] Deploy, re-run seed terhadap DB production/staging.

**DoD:** demo bisa diakses dari URL Vercel, bukan cuma `localhost`.

---

## Urutan Prioritas (kalau waktu kompetisi terbatas)

Jalur kritis buat demo PRD §15 minimal: **Fase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8**. Fase 9 (trace viewer) dan Fase 10 metrics bagus untuk nilai tambah tapi bisa di-skip kalau waktu sempit — trace tetap tersimpan di DB walau belum ada UI-nya. Fase 11 cuma dikerjakan kalau demo wajib online.

---

## Referensi

- `PRD.md` — product requirements, nomor section dirujuk di tiap fase di atas.
- `MONGOSEE-MODEL-PLAN.md` — schema model & skenario seed.
- `models/` — hasil Fase 0 (sudah selesai).
