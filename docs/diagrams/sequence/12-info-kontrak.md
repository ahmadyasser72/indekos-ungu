# Info Kontrak

```mermaid
sequenceDiagram
    autonumber
    participant Penghuni as "Penghuni"
    participant WhatsAppBot as "WhatsApp Bot"
    participant Sistem as "Sistem"

    Penghuni->>WhatsAppBot: Kirim "info"
    WhatsAppBot->>Sistem: Teruskan perintah
    Sistem->>Sistem: Cari kontrak aktif & data kamar
    Sistem-->>WhatsAppBot: Kirim detail kontrak (nomor kamar, harga, tanggal mulai/selesai, durasi)
    WhatsAppBot-->>Penghuni: Tampilkan info kontrak
```
