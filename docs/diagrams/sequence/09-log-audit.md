# 09 — Log Audit

```mermaid
sequenceDiagram
    autonumber
    participant Staff as "Staff"
    participant Sistem as "Sistem"

    Staff->>Sistem: Buka log audit
    Sistem-->>Staff: Tampilkan daftar aktivitas
    Staff->>Sistem: Filter / pilih log
    Staff->>Sistem: Hapus log
    Sistem->>Sistem: Catat log audit (hapus log)
    Sistem-->>Staff: Konfirmasi berhasil
```
