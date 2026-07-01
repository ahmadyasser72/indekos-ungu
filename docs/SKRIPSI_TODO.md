# SKRIPSI TODO

**Tanggal:** 2026-07-01  
**Status:** Proposal → Skripsi Conversion Checklist

---

## 📋 RINGKASAN PERUBAHAN

Proposal skripsi sudah punya **3 BAB** (Pendahuluan, Tinjauan Pustaka, Metode Penelitian).  
Skripsi butuh **5 BAB** + tambahan halaman bagian awal + lampiran.

**Target:** Minimal 60 halaman (proposal minimal 40).

---

## ✅ CHECKLIST PERUBAHAN

### 🔹 BAB I PENDAHULUAN

- [x] 1.1 Latar Belakang — sudah ada
- [x] 1.2 Perumusan Masalah — sudah ada
- [x] 1.3 Batasan Masalah — sudah ada
- [x] 1.4 Tujuan Penelitian — sudah ada
- [x] 1.5 Manfaat Penelitian — sudah ada
- [ ] **1.6 Metode Penelitian** — **HARUS DITAMBAH**
  - Jelaskan metode SDLC yang dipakai (Waterfall/Prototype/RAD/etc)
  - Sebutkan tools & teknologi (Node.js, SQLite, Midtrans, Astro, dll)
  - Jelaskan tahapan penelitian (analisis → perancangan → implementasi → pengujian)
- [ ] **1.7 Sistematika Penulisan** — **HARUS DITAMBAH**
  - Ringkasan isi tiap BAB (5 paragraf untuk BAB I-V)
  - Contoh: "BAB I membahas latar belakang, rumusan masalah..."
  - Lihat contoh di PEDOMAN lampiran 17

---

### 🔹 BAB II TINJAUAN PUSTAKA

- [x] 2.1 Landasan Teori — sudah ada
- [x] 2.2 Penelitian Terkait — sudah ada
- [ ] **2.3 Profil Objek Penelitian** — **HARUS DITAMBAH**
  - Profil Kost Ungu Banjarbaru:
    - Nama, alamat lengkap, pemilik
    - Jumlah kamar, tipe kamar, harga sewa
    - Sistem pengelolaan saat ini (manual/semi-otomatis)
    - Permasalahan yang dihadapi sebelum sistem dibuat
    - Struktur organisasi (jika ada)

---

### 🔹 BAB III ANALISIS DAN PERANCANGAN SISTEM

- [ ] **Rename judul BAB** dari "METODE PENELITIAN" → **"ANALISIS DAN PERANCANGAN SISTEM"**
- [x] 3.1 Analisis Sistem yang Berjalan — sudah ada (Teknik Pengumpulan Data + flowchart manual)
- [x] 3.2 Analisis Kebutuhan Sistem — sudah ada
- [x] 3.3 Rancangan Model Sistem — sudah ada (Context Diagram, Use Case, Activity, Sequence, Class)
- [x] 3.4 Rancangan Basis Data — sudah ada (Tabel, ERD)
- [x] 3.5 Rancangan Antarmuka Masukan Sistem — sudah ada
- [x] 3.6 Rancangan Antarmuka Keluaran Sistem — sudah ada

**Catatan:** Konten BAB III sudah lengkap, hanya perlu ganti nama bab.

---

### 🔹 BAB IV IMPLEMENTASI DAN PENGUJIAN — **SELURUHNYA BARU**

Ini bab terbesar yang harus dibuat dari nol:

- [ ] **4.1 Spesifikasi Sistem**
  - **Hardware:**
    - Spesifikasi server/laptop dev (CPU, RAM, storage)
    - Spesifikasi minimal client (browser, device)
  - **Software:**
    - OS (Linux/Windows/macOS)
    - Node.js versi X
    - Database SQLite
    - Web framework (Astro)
    - Payment gateway (Midtrans)
    - Tools lain (Git, VS Code, Postman, dll)

- [ ] **4.2 Langkah-langkah Pembuatan Sistem**
  - Jelaskan model SDLC yang dipakai (dari sub-bab 1.6)
  - Tahapan pengembangan:
    1. Requirements gathering (wawancara, observasi)
    2. Analisis sistem
    3. Perancangan (diagram UML, database, UI/UX)
    4. Implementasi (coding modul per modul)
    5. Testing (unit test, integration test, black box)
    6. Deployment
  - Bisa pakai flowchart/diagram alur pengembangan

- [ ] **4.3 Hasil Tampilan Aplikasi**
  - Screenshot **semua halaman penting** dari sistem yang sudah jadi:
    - Login/Register
    - Dashboard Admin
    - Manajemen Kamar (CRUD)
    - Manajemen Penghuni (CRUD)
    - Pembayaran (Payment Gateway)
    - Notifikasi Otomatis (cron job log/hasil)
    - Manajemen Komplain
    - Chatbot (interaksi)
    - Laporan Transaksi
  - Setiap gambar diberi caption + penjelasan singkat fitur

- [ ] **4.4 Pengujian**
  - Jenis pengujian: **Black Box Testing**
  - Buat tabel test case untuk **setiap fungsi utama**:
    - Kolom: No | Fitur Diuji | Input | Expected Output | Actual Output | Status (Pass/Fail)
  - Contoh test case:
    - Login dengan kredensial valid → berhasil masuk
    - Login dengan kredensial invalid → muncul error message
    - Tambah kamar baru → data tersimpan di database
    - Proses pembayaran via Midtrans → status invoice ter-update
    - Chatbot menjawab pertanyaan FAQ → respons sesuai
    - Cron job kirim notifikasi → WhatsApp/email terkirim tepat waktu
  - Minimal **15-20 test case** untuk sistem kompleks seperti ini
  - Tambahkan kesimpulan hasil pengujian (berapa % pass rate)

---

### 🔹 BAB V PENUTUP — **SELURUHNYA BARU**

- [ ] **5.1 Kesimpulan**
  - Ringkas **Tujuan Penelitian** (dari BAB I sub 1.4)
  - Jelaskan apa yang **sudah tercapai** dari sistem yang dibuat
  - Contoh:
    - "Sistem berhasil mengotomatisasi proses pembayaran kost dengan payment gateway Midtrans"
    - "Chatbot berhasil mengurangi beban admin dalam menjawab pertanyaan penghuni"
    - "Notifikasi otomatis meningkatkan ketepatan waktu pembayaran"
  - Ringkas hasil pengujian (misal: "95% test case berhasil lulus black box testing")

- [ ] **5.2 Saran**
  - **Kekurangan sistem:**
    - Misal: belum ada mobile app, belum support multi-bahasa, belum ada dashboard analytics
  - **Ide pengembangan:**
    - Integrasi payment gateway lain (GoPay, OVO, DANA)
    - Mobile app (React Native/Flutter)
    - Fitur booking kamar online
    - Dashboard analytics untuk owner
    - Multi-tenancy (sistem bisa dipakai kost lain)
    - Integrasi IoT (smart lock, smart meter listrik)

---

## 📄 BAGIAN AWAL (Halaman Pre-Content)

Proposal hanya punya: Cover, Daftar Isi, Daftar Gambar, Daftar Tabel.

Skripsi **wajib** tambah 6 halaman baru:

- [ ] **Halaman Sampul Dalam**
  - Sama seperti cover, tapi di kertas dalam
  - Tambahkan nama **Pembimbing 1** dan **Pembimbing 2**

- [ ] **Lembar Pengesahan Pembimbing**
  - Template tanda tangan + NIP pembimbing 1 & 2
  - Lihat contoh di PEDOMAN lampiran 12

- [ ] **Lembar Pengesahan Penguji**
  - Template tanda tangan + NIP 3 penguji (ketua + 2 anggota)
  - Lihat contoh di PEDOMAN lampiran 13

- [ ] **Halaman Pernyataan Keaslian Skripsi**
  - Pernyataan bahwa skripsi adalah karya asli, bukan plagiat
  - Template ada di PEDOMAN lampiran 14

- [ ] **Halaman Abstrak**
  - **Bahasa Indonesia:**
    - Maksimal 500 kata
    - Isi: objek penelitian, masalah, metode pemecahan, hasil singkat, rekomendasi
    - Jarak 1 spasi
    - Diakhiri dengan **Keywords** (2-5 kata) dalam italic
  - **English Abstract (optional, tapi recommended):**
    - Terjemahan abstrak Indonesia
    - Format sama
  - Lihat contoh di PEDOMAN lampiran 15

- [ ] **Kata Pengantar**
  - Urutan ucapan terima kasih:
    1. Puji syukur kepada Allah SWT
    2. Shalawat kepada Nabi Muhammad SAW
    3. Kedua orang tua
    4. Dosen pembimbing 1 & 2
    5. Dosen penguji
    6. Pihak Kost Ungu Banjarbaru (objek penelitian)
    7. Teman-teman
  - Diakhiri dengan penutup singkat + nama + tempat tanggal

---

## 📎 BAGIAN AKHIR (Lampiran)

- [x] Daftar Pustaka — sudah ada
- [ ] **Lampiran-lampiran** — **HARUS DITAMBAH**
  - Lampiran A: Source code utama (controller/routes penting)
  - Lampiran B: Screenshot tambahan (jika ada)
  - Lampiran C: Surat izin penelitian (jika ada)
  - Lampiran D: Dokumentasi API (jika ada)
  - Lampiran E: Panduan instalasi sistem
  - Lampiran F: Panduan penggunaan user manual

---

## 📏 KETENTUAN TEKNIS

- **Kertas:** HVS A4, 80 gram (siap jilid)
- **Margin:** Kiri 4cm, Atas 4cm, Kanan 3cm, Bawah 3cm
- **Font:** Times New Roman
- **Ukuran huruf:** 12pt body text, 14pt judul bab
- **Spasi:** 1.5 spasi untuk body text, 1 spasi untuk abstrak
- **Halaman minimal:** **60 halaman** (dari BAB I sampai BAB V, tidak termasuk bagian awal & lampiran)
- **Penomoran:**
  - Bagian awal: romawi kecil (i, ii, iii, iv, ...)
  - BAB I dst: angka latin (1, 2, 3, ...)
  - Halaman pertama tiap bab: nomor di tengah bawah
  - Halaman lanjutan: nomor di pojok kanan atas

---

## 🎯 PRIORITAS KERJA

### Priority 1 (Wajib segera):

1. Tambah sub-bab 1.6 Metode Penelitian
2. Tambah sub-bab 1.7 Sistematika Penulisan
3. Tambah sub-bab 2.3 Profil Objek Penelitian
4. Rename BAB III judul

### Priority 2 (Konten utama):

5. Tulis BAB IV Implementasi dan Pengujian (4 sub-bab)
6. Tulis BAB V Penutup (2 sub-bab)

### Priority 3 (Halaman formal):

7. Buat Abstrak (Indonesia + English)
8. Buat Kata Pengantar
9. Buat halaman pengesahan (template placeholder)

### Priority 4 (Pelengkap):

10. Compile lampiran (kode, screenshot, dokumentasi)
11. Review formatting (margin, font, spasi, penomoran)

---

## 📊 PROGRESS TRACKER

**Current state:**

- BAB I: 83% complete (5/7 sub-bab)
- BAB II: 67% complete (2/3 sub-bab)
- BAB III: 100% complete (struktur), 0% complete (rename judul)
- BAB IV: 0% complete (belum ada)
- BAB V: 0% complete (belum ada)
- Bagian Awal: 33% complete (4/10 halaman)
- Bagian Akhir: 50% complete (Daftar Pustaka ada, lampiran belum)

**Estimated work remaining:**

- ~15-20 halaman untuk BAB IV (terbanyak)
- ~3-5 halaman untuk BAB V
- ~5-7 halaman untuk bagian awal tambahan
- ~10+ halaman untuk lampiran

**Total estimated final pages:** 75-90 halaman (sudah di atas minimal 60) ✅

---

## 📝 NOTES

- State project sekarang bisa lihat di folder `src/` (implementasi sistem)
- Screenshot untuk BAB IV bisa ambil dari dev/staging environment
- Test case untuk pengujian bisa generate dari fitur yang sudah jalan
- Kode untuk lampiran pilih yang paling representatif (auth, payment, chatbot, cron)

---

**Last updated:** 2026-07-01  
**Author:** Kiro (AI Assistant) 🐱
