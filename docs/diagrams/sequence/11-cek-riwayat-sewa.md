# Cek Riwayat Sewa

```mermaid
sequenceDiagram
    autonumber
    participant Penghuni as "Penghuni"
    participant WhatsAppBot as "WhatsApp Bot"
    participant Sistem as "Sistem"

    Penghuni->>WhatsAppBot: Kirim "riwayat"
    WhatsAppBot->>Sistem: Teruskan perintah
    Sistem->>Sistem: Cari semua kontrak & tagihan lunas
    Sistem-->>WhatsAppBot: Kirim riwayat pembayaran per kontrak
    WhatsAppBot-->>Penghuni: Tampilkan daftar riwayat sewa
```
