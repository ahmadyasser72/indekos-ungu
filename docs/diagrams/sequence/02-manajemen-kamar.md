# 02 — Manajemen Kamar

```mermaid
sequenceDiagram
    autonumber
    participant Staff as "Staff"
    participant Sistem as "Sistem"

    Staff->>Sistem: Buka menu kelola kamar
    Sistem-->>Staff: Tampilkan daftar kamar
    Staff->>Sistem: Pilih tambah/ubah/hapus kamar
    Sistem->>Sistem: Validasi nomor kamar unik
    Sistem->>Sistem: Simpan perubahan
    Sistem->>Sistem: Catat log audit
    Sistem-->>Staff: Konfirmasi berhasil
```
