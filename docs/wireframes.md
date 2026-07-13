# 📄 Deskripsi Antarmuka Sistem Manajemen Kos

Dokumen ini menjelaskan rancangan halaman antarmuka (wireframe) untuk aplikasi manajemen kos **Indekos Ungu**. Penjelasan di bawah ini memuat fungsi utama setiap halaman secara umum dan daftar tombol aksi yang dapat digunakan oleh pengelola kos.

---

## 🧾 A. Antarmuka Manajemen dan Pengelolaan Data (Input)

Halaman-halaman ini digunakan oleh pengelola atau pemilik kos untuk melihat, mencari, menyaring, dan mengelola data operasional kos sehari-hari.

---

<details>
<summary>1. Dashboard</summary>

![Dashboard](wireframe-v2/png/input/1-dashboard.png)

Halaman utama yang menampilkan ringkasan kondisi kos secara keseluruhan, seperti jumlah total kamar, kamar yang kosong atau terisi, penghuni aktif, total tagihan, serta jumlah komplain yang belum terselesaikan. Selain itu, terdapat peringatan tagihan yang mendekati jatuh tempo dan daftar komplain terbaru dari penghuni.

**Aksi/Fitur:** Pada halaman ini, pengguna dapat menggunakan tombol **Lihat Semua** pada bagian Tagihan Jatuh Tempo untuk membuka daftar transaksi terkait, serta menekan tombol **Lihat Komplain** pada daftar komplain terbaru untuk langsung membuka halaman komplain tersebut.

</details>

---

<details>
<summary>2. Manajemen Akun</summary>

![Akun](wireframe-v2/png/input/2-akun.png)

Setiap akun memiliki nama pengguna, peran, dan waktu terakhir mengakses sistem.

**Aksi/Fitur:** Halaman ini menyediakan tombol **Tambah Akun** untuk membuat akun pengguna baru melalui formulir pop-up, tombol **Edit** untuk mengubah informasi akun seperti nama atau peran, serta tombol **Hapus** untuk menghapus akun dari sistem. Selain itu, terdapat fitur **Pencarian** untuk mencari akun berdasarkan nama pengguna dan fitur **Saring (Filter)** untuk memilah akun berdasarkan peran tertentu.

</details>

---

<details>
<summary>3. Manajemen Kamar</summary>

![Kamar](wireframe-v2/png/input/3-kamar.png)

Halaman untuk melihat seluruh data unit kamar kos beserta status ketersediaannya. Informasi mencakup nomor kamar, tipe kamar, harga sewa bulanan, dan apakah kamar tersebut sedang kosong atau sedang ditempati penghuni. Data ditampilkan dalam bentuk kartu visual.

**Aksi/Fitur:** Pengelola dapat menggunakan tombol **Tambah Kamar** untuk menambahkan unit kamar baru ke dalam sistem, tombol **Detail** untuk melihat informasi lengkap beserta riwayat penghuninya, tombol **Edit Kamar** untuk mengubah rincian seperti nomor atau harga sewa, serta tombol **Hapus** untuk menghapus unit kamar. Halaman ini juga dilengkapi fitur **Pencarian** berdasarkan nomor atau tipe kamar, dan fitur **Saring (Filter)** untuk memilah kamar berdasarkan status kosong atau terisi.

</details>

---

<details>
<summary>4. Manajemen Penghuni</summary>

![Penghuni](wireframe-v2/png/input/4-penghuni.png)

Halaman untuk mengelola data penyewa yang menempati kamar kos. Informasi mencakup nama lengkap, nomor telepon, kamar yang ditempati, periode sewa, dan status keaktifan penghuni.

**Aksi/Fitur:** Berbagai aksi tersedia di halaman ini, mulai dari tombol **Tambah Penghuni** untuk mendaftarkan penyewa baru, **Permintaan Chat** untuk membuka daftar permintaan WhatsApp, hingga tombol **📄 PDF** untuk mengunduh atau mencetak daftar penghuni aktif. Untuk pengelolaan individu, tersedia tombol **Detail** guna melihat rincian lengkap, **Edit** untuk mengubah data diri, **Sewa Baru** untuk mendaftarkan kontrak baru, **Pindah Kamar** untuk memindahkan penghuni, **Chat** untuk membuka percakapan langsung via WhatsApp, dan **Berhenti Menginap** untuk menyelesaikan kontrak sewa. Pengguna juga dapat memanfaatkan fitur **Pencarian** untuk menemukan penghuni berdasarkan nama atau nomor kamar.

</details>

---

<details>
<summary>5. Manajemen Komplain</summary>

![Komplain](wireframe-v2/png/input/5-komplain.png)

Halaman untuk melacak keluhan atau kerusakan fasilitas dari penghuni kos. Setiap komplain mencakup deskripsi keluhan, status penanganan (terbuka, diproses, selesai), kamar terkait, nama penghuni pelapor, serta catatan tindak lanjut dari petugas.

**Aksi/Fitur:** Pengguna dapat membatasi tampilan melalui kotak **Pilih Periode**, mengubah status komplain menjadi "Sedang Diproses" dengan tombol **Tandai Proses**, atau menyelesaikannya beserta pencatatan hasil menggunakan tombol **Tandai Selesai**. Pencarian spesifik dapat dilakukan melalui fitur **Pencarian** berdasarkan kata kunci deskripsi, dan fitur **Saring (Filter)** tersedia untuk memilah komplain berdasarkan status penanganan.

</details>

---

<details>
<summary>6. Transaksi Keuangan</summary>

![Transaksi](wireframe-v2/png/input/6-transaksi.png)

Halaman untuk melihat tagihan pembayaran bulanan dari masing-masing penghuni kamar. Setiap transaksi mencakup nomor invoice, nama penghuni, nominal pembayaran, tanggal jatuh tempo, status pembayaran, dan referensi payment gateway (Duitku).

**Aksi/Fitur:** Halaman ini menyediakan kotak **Pilih Periode** untuk melihat transaksi pada bulan tertentu dan tombol **Generate** untuk membuat tagihan baru secara otomatis. Pengelola dapat menggunakan tombol **Tandai Lunas** jika pembayaran dilakukan secara langsung, tombol **Salin** untuk menyalin tautan pembayaran ke papan klip, atau **Buka Pembayaran** untuk mengakses portal daring penghuni. Untuk memudahkan penelusuran, tersedia fitur **Pencarian** berdasarkan nomor invoice atau nama penghuni, serta fitur **Saring (Filter)** berdasarkan status kelunasan tagihan.

</details>

---

<details>
<summary>7. Notifikasi</summary>

![Notifikasi](wireframe-v2/png/input/7-notifikasi.png)

Halaman untuk memantau pesan pengingat tagihan via WhatsApp yang dikirimkan oleh sistem secara otomatis maupun manual. Setiap notifikasi mencatat waktu pengiriman, penghuni tujuan, jenis notifikasi, dan status terkirim atau gagal.

**Aksi/Fitur:** Selain menampilkan banner **Sistem Otomatisasi Aktif** yang menginformasikan jadwal pengiriman otomatis setiap pukul 08:00 WITA, halaman ini memiliki tombol **Jalankan Manual** untuk mengirim pengingat secara langsung kepada penghuni yang belum lunas dan tombol **📄 PDF** untuk mencetak riwayat notifikasi. Pengguna juga dapat menggunakan kotak **Pilih Periode** untuk memfilter berdasarkan bulan pengiriman serta fitur **Pencarian** untuk menelusuri notifikasi berdasarkan nama penerima atau status.

</details>

---

<details>
<summary>8. Log Chatbot</summary>

![Chatbot](wireframe-v2/png/input/8-chatbot.png)

Halaman untuk melihat riwayat percakapan antara chatbot WhatsApp dengan para penghuni kos. Setiap percakapan mencatat waktu pesan dikirim, nama penghuni, arah pesan (dari penghuni atau dari bot), serta isi pesan.

**Aksi/Fitur:** Pada halaman ini, pengguna dapat memfilter riwayat percakapan berdasarkan bulan pelaporan melalui kotak **Pilih Periode** dan menggunakan fitur **Pencarian** untuk menemukan percakapan spesifik berdasarkan nama penghuni atau kata kunci isi pesan.

</details>

---

<details>
<summary>9. Audit Log</summary>

![Audit](wireframe-v2/png/input/9-audit.png)

Halaman untuk mencatat seluruh aktivitas pengguna di dalam sistem. Setiap catatan audit memuat waktu kejadian, nama pengguna yang melakukan aksi, jenis aksi yang dilakukan, data yang diubah, serta identitas record yang terpengaruh.

**Aksi/Fitur:** Tersedia tombol **Detail** untuk menampilkan rincian perubahan data yang terjadi pada catatan audit terkait, serta fitur **Pencarian** untuk mencari berdasarkan nama pengguna atau jenis aksi. Selain itu, pengguna dapat memanfaatkan fitur **Saring (Filter)** untuk memilah catatan berdasarkan jenis aksi spesifik seperti CREATE, UPDATE, atau DELETE.

</details>

---

<details>
<summary>10. Halaman Login</summary>

![Login](wireframe-v2/png/input/10-login.png)

Halaman masuk untuk mengakses sistem. Pengguna wajib memasukkan nama pengguna dan kata sandi yang benar. Jika login berhasil, pengguna akan diarahkan ke halaman dashboard sesuai perannya.

</details>

---

## 📋 B. Antarmuka Laporan dan Dokumen Keluaran (Output)

Halaman-halaman laporan ini menampilkan data operasional kos secara terstruktur dalam format cetak. Laporan ini memiliki kop surat resmi, ringkasan statistik, tabel data, serta tanda tangan untuk keperluan pengarsipan atau evaluasi.

---

<details>
<summary>1. Laporan Penghuni</summary>

![Laporan Penghuni](wireframe-v2/png/output/1-laporan-penghuni.png)

Laporan yang menampilkan daftar penghuni kos yang sedang aktif menempati kamar. Data mencakup nama lengkap, nomor telepon, kamar yang ditempati, periode sewa, dan status keaktifan.

</details>

---

<details>
<summary>2. Laporan Kamar</summary>

![Laporan Kamar](wireframe-v2/png/output/2-laporan-kamar.png)

Laporan yang menampilkan seluruh data unit kamar kos. Informasi mencakup nomor kamar, tipe kamar, harga sewa per bulan, status ketersediaan, serta nama penghuni yang menempati kamar tersebut.

</details>

---

<details>
<summary>3. Laporan Komplain</summary>

![Laporan Komplain](wireframe-v2/png/output/3-laporan-komplain.png)

Laporan yang menampilkan data pengaduan atau keluhan dari penghuni. Informasi mencakup nama penghuni, kamar terkait, deskripsi keluhan, status penanganan, tanggal pelaporan, petugas yang menangani, dan tanggal selesai.

</details>

---

<details>
<summary>4. Laporan Transaksi</summary>

![Laporan Transaksi](wireframe-v2/png/output/4-laporan-transaksi.png)

Laporan yang menampilkan data transaksi keuangan pembayaran dalam periode tertentu. Informasi mencakup nomor invoice, nama penghuni, kamar, nominal pembayaran, tanggal jatuh tempo, dan status kelunasan.

</details>

---

<details>
<summary>5. Laporan Notifikasi</summary>

![Laporan Notifikasi](wireframe-v2/png/output/5-laporan-notifikasi.png)

Laporan yang menampilkan data pengiriman pesan notifikasi pengingat tagihan. Informasi mencakup tanggal dibuat dan dikirim, nama penghuni tujuan, nomor invoice terkait, jenis notifikasi, serta status pengiriman (terkirim atau gagal).

</details>

---

<details>
<summary>6. Laporan Log Chatbot</summary>

![Laporan Chatbot](wireframe-v2/png/output/6-laporan-chatbot.png)

Laporan yang menampilkan data percakapan chatbot dengan penghuni. Informasi mencakup waktu percakapan, nama penghuni, kamar, arah pesan, dan isi percakapan.

</details>

---

<details>
<summary>7. Laporan Audit Log</summary>

![Laporan Audit](wireframe-v2/png/output/7-laporan-audit.png)

Laporan yang menampilkan catatan aktivitas pengguna di dalam sistem. Informasi mencakup waktu kejadian, nama pengguna, jenis aksi yang dilakukan, tabel data yang diubah, serta identitas record yang terpengaruh.

</details>

---

<details>
<summary>8. Invoice</summary>

![Invoice](wireframe-v2/png/output/8-invoice.png)

Halaman tagihan pembayaran yang dikirimkan kepada penghuni. Informasi mencakup nomor invoice, periode tagihan, rincian biaya sewa kamar, serta total tagihan yang harus dibayar.

</details>
