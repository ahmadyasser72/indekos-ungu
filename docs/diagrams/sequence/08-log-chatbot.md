# 08 — Log Chatbot

```mermaid
sequenceDiagram
    autonumber
    participant Staff as "Staff"
    participant Sistem as "Sistem"

    Staff->>Sistem: Buka log chatbot
    Sistem-->>Staff: Tampilkan riwayat pesan penghuni
    Staff->>Sistem: Filter / pilih log
    Staff->>Sistem: Hapus log pesan
    Sistem->>Sistem: Catat log audit
    Sistem-->>Staff: Konfirmasi berhasil
```
