# 06 — Laporan Transaksi

```mermaid
sequenceDiagram
    autonumber
    participant Staff as "Staff"
    participant Sistem as "Sistem"

    Staff->>Sistem: Buka menu laporan
    Sistem-->>Staff: Tampilkan opsi filter periode
    Staff->>Sistem: Pilih periode laporan
    Sistem->>Sistem: Ambil data transaksi
    Sistem-->>Staff: Tampilkan laporan pendapatan & status bayar
```
