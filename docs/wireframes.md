# 📄 Deskripsi Antarmuka Sistem Manajemen Kos

## 🧾 A. Antarmuka Masukan (Input)

Rancangan masukan sistem merupakan bagian yang menjelaskan bagaimana data dimasukkan ke dalam sistem oleh pengguna. Antarmuka masukan dirancang agar mudah digunakan, jelas, dan meminimalkan kesalahan dalam pengisian data. Setiap elemen input seperti field, tombol, dan pilihan disusun secara terstruktur agar pengguna dapat memahami alur pengisian dengan cepat.

Selain itu, rancangan antarmuka masukan disusun berdasarkan rancangan model sistem dan rancangan basis data yang telah dibuat sebelumnya. Hal ini bertujuan agar setiap data yang dimasukkan sesuai dengan struktur dan kebutuhan sistem, sehingga proses pengolahan data dapat berjalan dengan baik dan terintegrasi.

<details>
<summary>1. Dashboard</summary>

![Dashboard](wireframe-v2/png/input/1-dashboard.png)

Halaman dashboard menampilkan ringkasan kondisi sistem seperti jumlah kamar, penghuni aktif, tagihan, dan komplain. Selain itu, terdapat informasi tambahan seperti tagihan yang mendekati jatuh tempo dan komplain terbaru.

</details>

---

<details>
<summary>2. Manajemen Akun</summary>

![Akun](wireframe-v2/png/input/2-akun.png)

Halaman ini menampilkan daftar akun pengguna dalam bentuk tabel. Informasi yang ditampilkan meliputi username, role, dan status akun. Pengguna dapat mengelola data akun melalui halaman ini.

</details>

---

<details>
<summary>3. Manajemen Kamar</summary>

![Kamar](wireframe-v2/png/input/3-kamar.png)

Halaman ini menampilkan data kamar dalam bentuk tabel. Setiap kamar memiliki informasi seperti nomor kamar, jenis, harga sewa, dan status ketersediaan. Pengguna dapat menambah, mengedit, atau menghapus data kamar.

</details>

---

<details>
<summary>4. Manajemen Penghuni</summary>

![Penghuni](wireframe-v2/png/input/4-penghuni.png)

Halaman ini menampilkan daftar penghuni kos dalam bentuk tabel. Data yang ditampilkan mencakup nama lengkap, nomor HP, kamar yang ditempati, periode sewa, dan status keaktifan. Pengguna dapat mencari penghuni berdasarkan nama atau kamar.

</details>

---

<details>
<summary>5. Manajemen Komplain</summary>

![Komplain](wireframe-v2/png/input/5-komplain.png)

Halaman ini digunakan untuk mencatat dan memantau komplain dari penghuni. Setiap komplain memiliki informasi seperti deskripsi, status (terbuka, diproses, selesai), serta tanggal pelaporan dan penyelesaian.

</details>

---

<details>
<summary>6. Transaksi</summary>

![Transaksi](wireframe-v2/png/input/6-transaksi.png)

Halaman ini menampilkan daftar transaksi pembayaran penghuni. Informasi yang ditampilkan meliputi nomor invoice, nama penghuni, nominal pembayaran, tanggal jatuh tempo, dan status pembayaran.

</details>

---

<details>
<summary>7. Notifikasi</summary>

![Notifikasi](wireframe-v2/png/input/7-notifikasi.png)

Halaman ini menampilkan riwayat notifikasi yang telah dikirim ke penghuni. Setiap notifikasi mencatat waktu pengiriman, penghuni tujuan, jenis notifikasi, dan status terkirim atau gagal.

</details>

---

<details>
<summary>8. Log Chatbot</summary>

![Chatbot](wireframe-v2/png/input/8-chatbot.png)

Halaman ini menampilkan riwayat percakapan antara chatbot dengan penghuni. Setiap percakapan mencatat waktu, nama penghuni, arah pesan, dan isi pesan.

</details>

---

<details>
<summary>9. Audit Log</summary>

![Audit](wireframe-v2/png/input/9-audit.png)

Halaman ini mencatat aktivitas pengguna di dalam sistem. Setiap log mencatat waktu kejadian, pengguna yang melakukan aksi, jenis aksi, dan tabel yang diubah.

</details>

---

<details>
<summary>10. Login</summary>

![Login](wireframe-v2/png/input/10-login.png)

Halaman login digunakan untuk masuk ke dalam sistem. Terdapat dua input utama yaitu nama pengguna dan kata sandi, serta tombol masuk. Pengguna harus mengisi data dengan benar agar dapat mengakses sistem.

</details>

## 📋 B. Antarmuka Keluaran (Output)

Rancangan keluaran sistem merupakan bagian yang menjelaskan bagaimana data disajikan kepada pengguna dalam bentuk laporan. Antarmuka keluaran dirancang agar informatif, mudah dibaca, dan sesuai dengan kebutuhan pengguna dalam mengambil keputusan. Setiap laporan mencakup kop surat, statistik ringkasan, tabel data, serta tanda tangan untuk pengesahan.

Selain itu, rancangan antarmuka keluaran disusun berdasarkan kebutuhan informasi yang telah diidentifikasi sebelumnya. Hal ini bertujuan agar setiap laporan yang dihasilkan dapat memberikan gambaran yang jelas dan akurat mengenai kondisi sistem, sehingga mendukung proses evaluasi dan pengambilan keputusan.

<details>
<summary>1. Laporan Penghuni</summary>

![Laporan Penghuni](wireframe-v2/png/output/1-laporan-penghuni.png)

Laporan ini menampilkan daftar penghuni kos yang aktif. Data yang disajikan mencakup nama lengkap, nomor HP, kamar yang ditempati, periode sewa, dan status.

</details>

---

<details>
<summary>2. Laporan Kamar</summary>

![Laporan Kamar](wireframe-v2/png/output/2-laporan-kamar.png)

Laporan ini menampilkan data seluruh kamar kos. Informasi yang disajikan meliputi nomor kamar, jenis kamar, harga sewa per bulan, status ketersediaan, dan penghuni yang menempati.

</details>

---

<details>
<summary>3. Laporan Komplain</summary>

![Laporan Komplain](wireframe-v2/png/output/3-laporan-komplain.png)

Laporan ini menampilkan data pengaduan yang diajukan penghuni. Informasi yang disajikan mencakup penghuni, kamar, deskripsi, status, tanggal lapor, petugas yang menangani, dan tanggal selesai.

</details>

---

<details>
<summary>4. Laporan Transaksi</summary>

![Laporan Transaksi](wireframe-v2/png/output/4-laporan-transaksi.png)

Laporan ini menampilkan data transaksi keuangan dalam periode tertentu. Informasi yang disajikan meliputi nomor invoice, penghuni, kamar, nominal, jatuh tempo, dan status pembayaran.

</details>

---

<details>
<summary>5. Laporan Notifikasi</summary>

![Laporan Notifikasi](wireframe-v2/png/output/5-laporan-notifikasi.png)

Laporan ini menampilkan data pengiriman notifikasi dalam periode tertentu. Informasi yang disajikan mencakup tanggal dibuat dan dikirim, penghuni tujuan, nomor invoice terkait, jenis notifikasi, dan status pengiriman.

</details>

---

<details>
<summary>6. Log Chatbot</summary>

![Laporan Chatbot](wireframe-v2/png/output/6-laporan-chatbot.png)

Laporan ini menampilkan data percakapan chatbot dengan penghuni. Informasi yang disajikan meliputi waktu, penghuni, kamar, arah pesan, dan isi percakapan.

</details>

---

<details>
<summary>7. Audit Log</summary>

![Laporan Audit](wireframe-v2/png/output/7-laporan-audit.png)

Laporan ini menampilkan data aktivitas sistem yang dilakukan oleh pengguna. Informasi yang disajikan meliputi waktu kejadian, pengguna, jenis aksi, tabel target, dan identitas record yang diubah.

</details>

---

<details>
<summary>8. Invoice</summary>

![Invoice](wireframe-v2/png/output/8-invoice.png)

Halaman ini menampilkan tagihan pembayaran untuk penghuni. Informasi yang disajikan mencakup nomor invoice, periode tagihan, rincian biaya sewa dan utilitas, total tagihan, serta instruksi pembayaran.

</details>
