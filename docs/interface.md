# 📄 Dokumentasi Antarmuka Sistem Manajemen Kos (Tangkapan Layar)

Dokumen ini menjelaskan tangkapan layar (_screenshot_) antarmuka aplikasi **Indekos Ungu** yang diambil langsung dari implementasi sistem. Penjelasan memuat fungsi utama tiap halaman serta tombol aksi yang tersedia bagi pengelola kos. Struktur dokumen mengikuti pembagian `input` (halaman pengelolaan data) dan `output` (laporan/dokumen cetak) seperti pada folder `wireframe-v2`.

---

## 🧾 A. Antarmuka Manajemen dan Pengelolaan Data (Input)

Halaman-halaman ini digunakan oleh pengelola atau pemilik kos untuk melihat, mencari, menyaring, dan mengelola data operasional kos sehari-hari.

---

<details>
<summary>1. Dashboard</summary>

![Dashboard](interface/input/1-dashboard.png)

Halaman utama yang menampilkan ringkasan kondisi kos secara keseluruhan, seperti jumlah total kamar, kamar yang kosong atau terisi, penghuni aktif, total tagihan, serta jumlah komplain yang belum terselesaikan. Terdapat pula peringatan tagihan yang mendekati jatuh tempo dan daftar komplain terbaru dari penghuni.

Bagian Tagihan Mendekati Jatuh Tempo menampilkan daftar tagihan yang perlu segera ditindaklanjuti beserta penghuni, kamar, nominal, jatuh tempo, dan statusnya. Bagian Komplain Terbaru menampilkan ringkasan keluhan terakhir beserta status penanganannya.

</details>

---

<details>
<summary>2. Manajemen Akun</summary>

![Akun](interface/input/2-akun.png)

Halaman pengelolaan akun pengguna sistem. Setiap akun memiliki nama pengguna, peran, dan waktu terakhir mengakses sistem.

Tombol Tambah Akun digunakan untuk membuat akun baru. Setiap baris akun memiliki tombol _Edit_ untuk mengubah informasi akun dan tombol Hapus untuk menghapus akun dari sistem. Tersedia fitur Pencarian berdasarkan nama pengguna dan _Filter_ berdasarkan peran.

</details>

---

<details>
<summary>3. Manajemen Kamar</summary>

![Kamar](interface/input/3-kamar.png)

Halaman untuk melihat seluruh data unit kamar kos beserta status ketersediaannya. Informasi mencakup nomor kamar, tipe kamar, harga sewa bulanan, dan status (Kosong, Terisi, atau Nonaktif). Data ditampilkan dalam bentuk kartu visual.

Tombol _PDF_ digunakan untuk mengunduh laporan kamar dan tombol Tambah Kamar untuk menambah unit baru. Setiap kartu kamar memiliki tombol Detail untuk melihat informasi lengkap, serta tombol _expand_ (^) untuk mengakses aksi _Edit_ Kamar dan Hapus. Tersedia fitur Pencarian berdasarkan nomor atau tipe kamar dan _Filter_ berdasarkan status.

</details>

---

<details>
<summary>4. Manajemen Penghuni</summary>

![Penghuni](interface/input/4-penghuni.png)

Halaman untuk mengelola data penyewa yang menempati kamar kos. Informasi mencakup nama lengkap, nomor telepon, kamar yang ditempati, periode sewa, dan status keaktifan penghuni.

Tombol _PDF_ digunakan untuk mengunduh laporan penghuni, tombol Tambah Penghuni untuk mendaftarkan penyewa baru, dan tombol Permintaan _Chat_ untuk membuka daftar permintaan _WhatsApp_. Setiap baris memiliki tombol _Chat_ (_WhatsApp_), Detail, dan _dropdown_ Aksi yang berisi opsi _Edit_ Penghuni, Pindah Kamar, Berhenti Menginap, serta Nonaktifkan Penghuni. Tersedia fitur Pencarian berdasarkan nama penghuni dan _Filter_ berdasarkan status.

</details>

---

<details>
<summary>5. Manajemen Komplain</summary>

![Komplain](interface/input/5-komplain.png)

Halaman untuk melacak keluhan atau kerusakan fasilitas dari penghuni kos. Setiap komplain mencakup deskripsi keluhan, status penanganan (Terbuka, Proses, Selesai), kamar terkait, nama penghuni pelapor, serta catatan tindak lanjut.

Tombol _PDF_ digunakan untuk mengunduh laporan komplain. Kotak Pilih Periode digunakan untuk memfilter berdasarkan rentang waktu. Tombol Tandai Proses digunakan untuk mengubah status menjadi sedang diproses, dan tombol Tandai Selesai untuk menyelesaikan komplain. Tersedia fitur Pencarian berdasarkan kata kunci deskripsi atau nama penghuni dan _Filter_ berdasarkan status penanganan.

</details>

---

<details>
<summary>6. Transaksi Keuangan</summary>

![Transaksi](interface/input/6-transaksi.png)

Halaman untuk melihat rekapitulasi tagihan dan riwayat pembayaran sewa bulanan penghuni. Setiap transaksi mencakup nomor _invoice_, nama penghuni, kamar, nominal, tanggal jatuh tempo, tanggal pembayaran, dan status pembayaran.

Tombol _PDF_ digunakan untuk mengunduh laporan transaksi. Kotak Pilih Periode digunakan untuk memfilter berdasarkan bulan. Tersedia fitur Pencarian berdasarkan nama penghuni atau nomor kamar dan _Filter_ berdasarkan status kelunasan.

</details>

---

<details>
<summary>7. Notifikasi</summary>

![Notifikasi](interface/input/7-notifikasi.png)

Halaman untuk memantau pesan pengingat tagihan via _WhatsApp_ yang dikirim sistem secara otomatis maupun manual. Setiap notifikasi mencatat waktu pengiriman, penghuni tujuan, jenis notifikasi, dan status terkirim atau gagal.

_Banner_ Sistem Otomatisasi Aktif menampilkan informasi jadwal pengiriman otomatis setiap pukul 08:00 WITA. Tombol Jalankan Manual digunakan untuk mengirim pengingat secara langsung kepada penghuni yang belum lunas. Tombol _PDF_ digunakan untuk mencetak riwayat notifikasi. Kotak Pilih Periode digunakan untuk memfilter berdasarkan bulan pengiriman dan fitur Pencarian untuk menelusuri berdasarkan nama penerima atau status.

</details>

---

<details>
<summary>8. Log Chatbot</summary>

![Chatbot](interface/input/8-chatbot.png)

Halaman untuk melihat riwayat percakapan antara _chatbot_ _WhatsApp_ dengan penghuni. Setiap percakapan mencatat waktu terkirim, nama penghuni, kamar, arah pesan (Masuk/Keluar), serta isi pesan.

Tombol _PDF_ digunakan untuk mengunduh laporan _chatbot_. Kotak Pilih Periode digunakan untuk memfilter berdasarkan bulan pelaporan dan fitur Pencarian untuk menemukan percakapan berdasarkan nama penghuni atau kata kunci isi pesan.

</details>

---

<details>
<summary>9. Audit Log</summary>

![Audit](interface/input/9-audit.png)

Halaman untuk mencatat seluruh aktivitas pengguna di dalam sistem. Setiap catatan memuat waktu kejadian, nama pengguna yang melakukan aksi, jenis aksi (CREATE/UPDATE/DELETE), tabel target, ID _record_, serta detail perubahan.

Tombol _PDF_ digunakan untuk mengunduh laporan audit dan tombol Detail per catatan audit untuk melihat rincian perubahan. Tersedia fitur Pencarian berdasarkan aksi, tabel, atau pengguna dan _Filter_ berdasarkan jenis aksi (CREATE, UPDATE, DELETE).

</details>

---

<details>
<summary>10. Halaman Login</summary>

![Login](interface/input/10-login.png)

Halaman masuk untuk mengakses sistem. Pengguna wajib memasukkan nama pengguna dan kata sandi yang benar. Jika berhasil, diarahkan ke _dashboard_ sesuai peran.

</details>

---

<details>
<summary>11. Manajemen Tagihan</summary>

![Tagihan](interface/input/11-tagihan.png)

Halaman untuk mengelola daftar tagihan per kontrak sewa penghuni. Data ditampilkan per grup kontrak sewa, mencakup nomor kamar, nama penghuni, periode sewa (tanggal awal _s/d_ sekarang), dan status keaktifan. Setiap tagihan mencakup nomor _invoice_, tanggal jatuh tempo, tanggal pembayaran, nominal, dan status (Lunas, Belum Bayar, Terlambat).

Tombol _PDF_ digunakan untuk mengunduh laporan tagihan. Kotak Pilih Periode digunakan untuk memfilter berdasarkan bulan. Tersedia fitur Pencarian berdasarkan nama penghuni atau nomor kamar dan _Filter_ berdasarkan status. Pada setiap tagihan, tersedia tombol Generate untuk membuat tautan pembayaran beserta Tandai Lunas jika _link_ belum di-generate, atau tombol Salin _Link_ untuk menyalin URL pembayaran beserta Tandai Lunas jika _link_ sudah di-generate, serta tombol _Invoice_ untuk membuka halaman _invoice_ penghuni.

</details>

---

## 📋 B. Antarmuka Laporan dan Dokumen Keluaran (Output)

Laporan ini menampilkan data operasional kos secara terstruktur dalam format cetak, dengan kop surat resmi, ringkasan statistik, tabel data, serta tanda tangan untuk pengarsipan atau evaluasi.

---

<details>
<summary>1. Laporan Penghuni</summary>

![Laporan Penghuni](interface/output/1-laporan-penghuni.png)

Laporan daftar penghuni kos yang sedang aktif menempati kamar. Data mencakup nama lengkap, nomor telepon, kamar, periode sewa, dan status keaktifan.

</details>

---

<details>
<summary>2. Laporan Kamar</summary>

![Laporan Kamar](interface/output/2-laporan-kamar.png)

Laporan seluruh data unit kamar kos. Informasi mencakup nomor kamar, tipe kamar, harga sewa per bulan, status ketersediaan, serta nama penghuni yang menempati.

</details>

---

<details>
<summary>3. Laporan Komplain</summary>

![Laporan Komplain](interface/output/3-laporan-komplain.png)

Laporan data pengaduan dari penghuni. Informasi mencakup nama penghuni, kamar terkait, deskripsi keluhan, status penanganan, tanggal pelaporan, petugas, dan tanggal selesai.

</details>

---

<details>
<summary>4. Laporan Transaksi</summary>

![Laporan Transaksi](interface/output/4-laporan-transaksi.png)

Laporan data transaksi keuangan pembayaran dalam periode tertentu. Informasi mencakup nomor _invoice_, nama penghuni, kamar, nominal, tanggal jatuh tempo, dan status kelunasan.

</details>

---

<details>
<summary>5. Laporan Notifikasi</summary>

![Laporan Notifikasi](interface/output/5-laporan-notifikasi.png)

Laporan data pengiriman pesan notifikasi pengingat tagihan. Informasi mencakup tanggal dibuat dan dikirim, nama penghuni tujuan, nomor _invoice_ terkait, jenis notifikasi, serta status pengiriman.

</details>

---

<details>
<summary>6. Laporan Log Chatbot</summary>

![Laporan Chatbot](interface/output/6-laporan-chatbot.png)

Laporan data percakapan _chatbot_ dengan penghuni. Informasi mencakup waktu percakapan, nama penghuni, kamar, arah pesan, dan isi percakapan.

</details>

---

<details>
<summary>7. Laporan Audit Log</summary>

![Laporan Audit](interface/output/7-laporan-audit.png)

Laporan catatan aktivitas pengguna di dalam sistem. Informasi mencakup waktu kejadian, nama pengguna, jenis aksi, tabel data yang diubah, serta identitas _record_ yang terpengaruh.

</details>

---

<details>
<summary>8. Invoice</summary>

![Invoice](interface/output/8-invoice.png)

Halaman tagihan pembayaran yang dikirimkan kepada penghuni. Informasi mencakup nomor _invoice_, periode tagihan, rincian biaya sewa kamar, serta total tagihan yang harus dibayar.

</details>

---

<details>
<summary>9. Laporan Tagihan</summary>

![Laporan Tagihan](interface/output/9-laporan-tagihan.png)

Laporan rekapitulasi tagihan per kontrak sewa penghuni dalam periode tertentu. Data dikelompokkan per kamar dan penghuni, mencakup nomor _invoice_, tanggal jatuh tempo, tanggal pembayaran, nominal, dan status kelunasan.

</details>

---

<details>
<summary>10. Laporan Tagihan Per Penghuni</summary>

![Laporan Tagihan Per Penghuni](interface/output/10-laporan-tagihan-per-penghuni.png)

Laporan riwayat tagihan untuk satu penghuni tertentu. Data mencakup informasi penghuni (nama, telepon, asal), serta seluruh tagihan yang dikelompokkan berdasarkan periode kontrak sewa.

</details>
