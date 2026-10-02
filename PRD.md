# PRD — Tanggap AI

**Product:** Tanggap AI  
**Category:** AI Agent  
**Theme:** Building Intelligent AI Agents for Enterprise Productivity  
**Platform:** Web Application  
**Status:** Competition MVP

---

## 1. Latar Belakang & Masalah

Operasional logistik menghadapi berbagai **shipment exceptions**, seperti:

- Kendaraan rusak
- Driver tidak tersedia
- Keterlambatan pengiriman
- Route blocked
- Perubahan ETA

Saat terjadi masalah, operator biasanya harus:

1. Mengecek shipment.
2. Mencari penyebab masalah.
3. Mengecek kendaraan dan driver.
4. Mencari resource pengganti.
5. Melakukan perubahan shipment.
6. Menghubungi customer.
7. Memastikan masalah benar-benar terselesaikan.

Proses tersebut membutuhkan banyak langkah manual dan koordinasi antar data operasional.

**Masalah utama:**

> Bagaimana jika AI Agent dapat menerima tujuan sederhana seperti **“Resolve shipment SH-8821”**, kemudian melakukan investigasi, menentukan solusi, menjalankan tindakan yang diperlukan, dan memverifikasi hasilnya secara otomatis?

---

# 2. Solusi

**LogiResolve AI** adalah AI Agent untuk menangani logistics exceptions secara end-to-end.

Agent tidak hanya memberikan rekomendasi, tetapi mampu:

**Detect → Investigate → Reason → Plan → Execute → Verify**

Contoh:

> **User:** “Resolve shipment SH-8821.”

Agent:

```text
Investigate shipment
        ↓
Check exception
        ↓
Identify vehicle breakdown
        ↓
Find available driver
        ↓
Find available vehicle
        ↓
Check compatibility
        ↓
Reassign shipment
        ↓
Update ETA
        ↓
Notify customer
        ↓
Verify resolution
```

Jika sebuah tindakan membutuhkan persetujuan, agent akan menggunakan **Human-in-the-Loop**.

---

# 3. Target User

### Primary User

**Logistics / Operations Staff**

Contohnya:

- Logistics Operator
- Dispatch Operator
- Operations Manager

### Secondary User

**Supervisor / Manager**

Untuk melihat:

- Exception yang terjadi
- Resolution rate
- Agent activity
- Operational performance

---

# 4. Core AI Agent Capabilities

## 4.1 Shipment Investigation

User dapat meminta:

> “Investigate SH-8821.”

Agent akan mengumpulkan:

- Shipment status
- Customer
- Driver
- Vehicle
- Exception
- ETA
- Location
- Delivery priority

---

## 4.2 Root Cause Analysis

User:

> “Why is SH-8821 delayed?”

Agent menganalisis data terkait untuk menentukan penyebab.

Contoh:

```text
Root Cause:
Vehicle breakdown

Evidence:
- Vehicle B 1234 XYZ → status: broken
- Shipment SH-8821 → delayed
- Driver Budi → assigned to affected vehicle
```

---

## 4.3 Recovery Planning

Agent menentukan langkah penyelesaian.

Contoh:

```text
Problem:
Vehicle breakdown

Plan:
1. Find available replacement vehicle
2. Find available driver
3. Validate availability
4. Reassign shipment
5. Recalculate ETA
6. Notify customer
```

---

## 4.4 Tool Execution

Agent dapat memanggil tools:

```text
getShipment()
getException()
getVehicle()
getDriver()

findAvailableDrivers()
findAvailableVehicles()

reassignShipment()
updateETA()

notifyCustomer()

verifyShipmentResolution()
```

Agent memilih tool berdasarkan kebutuhan task, bukan berdasarkan command statis dari user.

---

## 4.5 Autonomous Resolution

User cukup memberikan objective:

> **“Handle all critical logistics exceptions.”**

Agent:

```text
Find critical exceptions
        ↓
Investigate each exception
        ↓
Analyze root cause
        ↓
Create recovery plan
        ↓
Execute available actions
        ↓
Verify results
        ↓
Report unresolved cases
```

Contoh output:

```text
3 critical exceptions found.

✓ SH-8821
Vehicle breakdown → Reassigned → Resolved

✓ SH-8834
Driver unavailable → Replacement assigned → Resolved

⚠ SH-8841
Route blocked → No alternative route
→ Requires manual intervention
```

---

# 5. User Commands / Use Cases

### Investigation

```text
“What's the status of SH-8821?”

“Investigate SH-8821.”

“Why is SH-8821 delayed?”
```

### Resource Discovery

```text
“Find available drivers.”

“Find a replacement vehicle for SH-8821.”

“Find the best driver and vehicle for SH-8821.”
```

### Execution

```text
“Reassign SH-8821 to Andi.”

“Update the ETA for SH-8821.”

“Notify the customer about the delay.”
```

### Analytics

```text
“Show all delayed shipments.”

“What is causing most delivery delays?”

“Show critical exceptions.”
```

### Autonomous Workflow

```text
“Resolve SH-8821.”

“Handle all critical logistics exceptions.”
```

---

# 6. Human-in-the-Loop

Tidak semua action langsung dieksekusi.

### Low-risk action

Agent dapat menjalankan otomatis:

```text
Read shipment
Read vehicle
Read driver
Analyze exception
Calculate ETA
```

### High-risk action

Agent meminta approval:

```text
Reassign shipment
Change driver
Change vehicle
Send customer notification
```

Contoh:

```text
I've found a replacement vehicle.

Vehicle: B 5678 ABC
Driver: Andi
ETA: 16:30

Do you want me to reassign SH-8821?

[Approve] [Reject]
```

Setelah **Approve**, agent menjalankan tool.

---

# 7. System Architecture

```text
┌─────────────────────┐
│      User / Ops     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│     Next.js App     │
│   Dashboard + Chat  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Agent Orchestrator │
│                     │
│ • Context Manager   │
│ • Planner           │
│ • Tool Registry     │
│ • Guardrails        │
│ • Execution Manager │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│     DeepSeek LLM    │
│ Reasoning + Planning│
└──────────┬──────────┘
           ↓
      Tool Calling
           ↓
┌─────────────────────────────────┐
│           Tool Layer             │
│                                 │
│ Shipment │ Driver │ Vehicle     │
│ Exception│ Route  │ Notification│
└────────────────┬────────────────┘
                 ↓
┌─────────────────────┐
│   Mongoose Models   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   MongoDB Atlas     │
└─────────────────────┘
```

---

# 8. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Next.js Fullstack |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| LLM | DeepSeek API |
| AI Agent | Custom Agent Orchestrator |
| AI Capability | Tool Calling + Reasoning + Context |
| Deployment | Vercel |

### Prinsip penting

**DeepSeek tidak mengakses MongoDB secara langsung.**

Flow:

```text
DeepSeek
   ↓
Tool Call
   ↓
Validated Tool
   ↓
Mongoose
   ↓
MongoDB Atlas
   ↓
Tool Result
   ↓
DeepSeek
```

Hal ini membuat database access lebih terkontrol dan memungkinkan setiap action memiliki validation dan authorization.

---

# 9. Data Models

MVP menggunakan:

```text
Shipment
Driver
Vehicle
Exception
Notification
AgentExecution
```

### Relationship

```text
Shipment
 ├── Customer
 ├── Driver
 ├── Vehicle
 └── Exception

AgentExecution
 └── Shipment

Notification
 └── Shipment
```

---

# 10. Agent Execution Trace

Setiap execution disimpan sebagai `AgentExecution`.

Contoh:

```text
Task:
Resolve shipment SH-8821

01  Investigation
    getShipment()

02  Investigation
    getException()

03  Reasoning
    Vehicle breakdown detected

04  Tool Call
    findAvailableVehicles()

05  Tool Result
    B 5678 ABC available

06  Tool Call
    findAvailableDrivers()

07  Tool Result
    Andi available

08  Decision
    Replacement resources validated

09  Action
    reassignShipment()

10  Action
    updateETA()

11  Action
    notifyCustomer()

12  Verification
    Shipment successfully recovered
```

Ini juga menjadi **audit trail** dari aktivitas agent.

---

# 11. MVP Scope

Untuk competition MVP, fokus utama adalah:

### Exception Type

**Vehicle Breakdown**

### Main Workflow

```text
Shipment delayed
       ↓
Vehicle breakdown
       ↓
Agent investigates
       ↓
Find replacement vehicle
       ↓
Find available driver
       ↓
Validate resources
       ↓
Reassign shipment
       ↓
Update ETA
       ↓
Notify customer
       ↓
Verify resolution
```

Exception lain seperti:

- Driver unavailable
- Route blocked
- Late delivery

dapat menjadi extension setelah MVP.

---

# 12. Dashboard

### Overview

Menampilkan:

```text
Total Shipments
Delayed Shipments
Critical Exceptions
Resolved Exceptions
Agent Resolution Rate
```

### Exception Dashboard

```text
Critical
├── SH-8821 — Vehicle Breakdown
├── SH-8834 — Driver Unavailable
└── SH-8841 — Route Blocked
```

### AI Agent Workspace

Interface utama:

```text
┌────────────────────────────────────┐
│ LogiResolve AI                     │
├────────────────────────────────────┤
│ User: Resolve SH-8821              │
│                                    │
│ Agent: Investigating shipment...   │
│ ✓ Shipment found                   │
│ ✓ Vehicle checked                  │
│ ✓ Breakdown detected              │
│ ✓ Replacement found               │
│                                    │
│ [Approve Reassignment]             │
└────────────────────────────────────┘
```

---

# 13. Success Metrics

MVP akan mengukur:

- **Average Exception Resolution Time**
- **Number of Exceptions Resolved**
- **Resolution Success Rate**
- **Manual Intervention Rate**
- **Tool Execution Success Rate**
- **Task Completion Rate**
- **Average Agent Steps per Resolution**
- **Failed Execution Recovery Rate**

Target angka sebaiknya ditentukan setelah seed data dan pengujian MVP tersedia, bukan dibuat sebagai klaim sebelum pengujian.

---

# 14. Safety & Guardrails

Agent harus:

- Memvalidasi parameter tool.
- Tidak melakukan database mutation secara langsung.
- Menggunakan controlled tools.
- Memiliki permission untuk setiap action.
- Meminta approval untuk high-risk action.
- Mencatat seluruh execution.
- Menangani tool failure.
- Tidak menganggap action berhasil sebelum melakukan verification.

Contoh:

```text
reassignShipment()
       ↓
Tool failed
       ↓
Agent detects failure
       ↓
Retry / alternative plan
       ↓
Verify
       ↓
Report result
```

---

# 15. Demo Scenario

Demo 3–5 menit dapat menggunakan satu kasus utama:

### User

> **“Resolve shipment SH-8821.”**

### Agent

```text
Investigating SH-8821...

Shipment is delayed.

Root cause:
Vehicle B 1234 XYZ has broken down.

Searching replacement resources...

Vehicle B 5678 ABC is available.
Driver Andi is available.

Proposed recovery:
Reassign SH-8821 → B 5678 ABC + Andi.

[Approve]
```

### User

**Approve**

### Agent

```text
Reassignment successful.

ETA updated:
14:30 → 16:30

Customer notification sent.

Verifying shipment...

✓ Shipment recovered successfully.
✓ Exception resolved.
```

Lalu dashboard berubah:

```text
Critical Exceptions
3 → 2

Resolved Exceptions
12 → 13
```
