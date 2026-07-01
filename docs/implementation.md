# Draft Implementasi Sistem E-Kos

Dokumen ini berisi rancangan detail implementasi sistem manajemen kos dengan integrasi pengingat otomatis berbasis _chatbot_.

Sistem ini dirancang dengan pendekatan yang mudah dipahami, berfokus pada keterbacaan struktur, dan menggunakan terminologi umum untuk mempermudah proses pengembangan selanjutnya.

---

## 1. Rancangan Model Sistem

### 1.1 Diagram Konteks

Context diagram merupakan diagram tingkat tinggi (high-level) yang digunakan untuk menggambarkan sistem sebagai satu kesatuan proses tunggal yang berinteraksi dengan entitas eksternal, diagram ini berfungsi untuk menunjukkan aliran data masuk dan keluar dari sistem. Pada sistem manajemen kos, context diagram menunjukkan bagaimana admin, staff, owner, dan penghuni berinteraksi dengan sistem, serta jenis data apa saja yang dipertukarkan, termasuk penggunaan chatbot sebagai media komunikasi utama bagi penghuni.

![Diagram Konteks](diagrams/0_context_diagram.png)

Context diagram menggambarkan sistem sebagai satu kesatuan yang berinteraksi dengan entitas eksternal tanpa menampilkan detail proses internal. Dalam diagram ini, sistem manajemen kos dengan chatbot diposisikan sebagai pusat yang menerima input dan menghasilkan output kepada empat entitas utama, yaitu admin, staff, owner, dan penghuni.

Admin berinteraksi dengan sistem dalam konteks pengelolaan akun, di mana data yang diberikan berupa instruksi pengelolaan pengguna dan sistem mengembalikan informasi akun sebagai hasilnya. Staff berinteraksi dengan sistem dalam lingkup operasional, seperti pengelolaan kamar dan penghuni, serta menerima data operasional sebagai keluaran. Owner menggunakan sistem untuk memperoleh informasi strategis berupa laporan transaksi dan data komplain, tanpa melakukan manipulasi data secara langsung. Sementara itu, penghuni berinteraksi melalui chatbot dengan mengirimkan perintah tertentu dan menerima respons otomatis dari sistem.

### 1.2 Use Case Diagram

Use case diagram merupakan salah satu jenis diagram dalam UML (Unified Modeling Language) yang digunakan untuk menggambarkan interaksi antara aktor dengan sistem. Diagram ini berfokus pada apa saja fungsi atau layanan yang disediakan oleh sistem dari sudut pandang pengguna, tanpa menjelaskan bagaimana proses tersebut dijalankan secara teknis. Dalam konteks sistem manajemen kos, diagram ini berperan penting untuk memperjelas pembagian peran antara admin, staff, owner, dan penghuni, serta bagaimana mereka berinteraksi dengan sistem, terutama melalui chatbot.

![Use Case Diagram](diagrams/0_use_case_diagram.png)

Use case diagram pada sistem ini menggambarkan interaksi antara aktor eksternal dengan sistem manajemen kos yang terintegrasi dengan layanan chatbot. Diagram ini menunjukkan bagaimana setiap aktor memanfaatkan fitur sistem sesuai dengan peran dan kebutuhan masing-masing. Secara umum, sistem menyediakan dua jalur interaksi utama, yaitu melalui antarmuka internal (untuk admin, staff, dan owner) serta melalui chatbot (untuk penghuni). Aktor yang terlibat dalam sistem terdiri dari empat peran utama, yaitu:

- **Admin**: Bertanggung jawab terhadap pengelolaan akun pengguna dalam sistem.
- **Staff**: Menangani operasional harian seperti pengelolaan kamar, penghuni, pengingat, dan komplain.
- **Owner**: Berfokus pada pemantauan melalui laporan transaksi dan komplain tanpa terlibat langsung dalam operasional.
- **Penghuni**: berinteraksi dengan sistem melalui chatbot untuk mengakses layanan seperti cek tagihan, pembayaran, riwayat transaksi, dan pengajuan komplain.

Setiap aktivitas utama dalam sistem, khususnya yang dilakukan oleh admin, staff, dan owner, memiliki keterkaitan (include) dengan proses verifikasi akun, yang berarti sebelum mengakses fitur tersebut pengguna diharuskan melalui proses autentikasi terlebih dahulu. Di sisi lain, aktivitas penghuni seperti mengajukan komplain, mengecek tagihan, melihat riwayat pembayaran, menerima pengingat, dan melakukan pembayaran merupakan perluasan (extends) dari use case utama interaksi dengan chatbot. Dengan demikian, chatbot berperan sebagai pusat layanan bagi penghuni, sementara sistem menangani logika dan pengolahan data.

### 1.3 Activity Diagrams

Activity diagram merupakan diagram UML yang digunakan untuk menggambarkan alur aktivitas atau proses bisnis dalam suatu sistem. Diagram ini menunjukkan urutan langkah-langkah yang dilakukan dari awal hingga akhir, termasuk percabangan keputusan, proses paralel, serta interaksi antar aktor atau komponen sistem. Dalam sistem manajemen kos, activity diagram digunakan untuk menggambarkan proses seperti verifikasi akun, pengelolaan data, pembayaran, hingga pengiriman notifikasi, sehingga alur operasional sistem dapat dipahami secara menyeluruh.

<details><summary><b>Activity Diagram Verifikasi Akun</b></summary><br>

![Activity Diagram Verifikasi Akun](diagrams/1_activity_diagram_verifikasi_akun.png)

Proses dimulai ketika pengguna memasukkan username dan password ke dalam sistem. Setelah itu, sistem melakukan validasi awal terhadap input yang diberikan. Selanjutnya, data kredensial tersebut diperiksa ke basis data untuk memastikan kecocokan. Jika hasil validasi menunjukkan bahwa data benar, maka sistem memberikan akses kepada pengguna dan pengguna diarahkan masuk ke dashboard. Sebaliknya, apabila data tidak valid, sistem akan menampilkan pesan kesalahan kepada pengguna dan proses berakhir.

</details>

<details><summary><b>Activity Diagram Manajemen Akun</b></summary><br>

![Activity Diagram Manajemen Akun](diagrams/2_activity_diagram_manajemen_akun.png)

Proses diawali oleh admin dengan memilih menu manajemen akun. Admin kemudian dapat melakukan operasi seperti menambah, mengubah, atau menghapus akun. Setelah itu, sistem melakukan verifikasi terhadap hak akses admin. Jika otorisasi valid, sistem akan meneruskan proses ke basis data untuk memproses perubahan data pengguna. Setelah berhasil, sistem memberikan konfirmasi keberhasilan, dan admin menerima notifikasi sebagai hasil akhir dari proses.

</details>

<details><summary><b>Activity Diagram Manajemen Kamar</b></summary><br>

![Activity Diagram Manajemen Kamar](diagrams/3_activity_diagram_manajemen_kamar.png)

Proses dimulai ketika staf melakukan pengelolaan data kamar. Data yang dimasukkan kemudian divalidasi oleh sistem untuk memastikan kelengkapan dan kebenaran. Setelah valid, sistem mengirimkan data ke basis data untuk memperbarui informasi atau status kamar. Sistem kemudian menampilkan hasil pembaruan, dan staf dapat melihat daftar kamar yang telah diperbarui.

</details>

<details><summary><b>Activity Diagram Manajemen Penghuni</b></summary><br>

![Activity Diagram Manajemen Penghuni](diagrams/4_activity_diagram_manajemen_penghuni.png)

Proses dimulai dengan staf memasukkan data penghuni beserta informasi kontrak sewa. Sistem kemudian memvalidasi keterkaitan antara penghuni dan kamar yang dipilih. Jika valid, data disimpan ke dalam basis data, mencakup informasi penghuni dan detail sewa. Sistem selanjutnya memberikan konfirmasi bahwa pendaftaran berhasil, dan staf dapat melihat data penghuni baru yang telah ditambahkan ke dalam daftar.

</details>

<details><summary><b>Activity Diagram Lihat Laporan Transaksi</b></summary><br>

![Activity Diagram Lihat Laporan Transaksi](diagrams/5_activity_diagram_lihat_laporan_transaksi.png)

Proses dimulai ketika staf atau pemilik memilih rentang waktu laporan yang diinginkan. Sistem kemudian memfilter data transaksi berdasarkan rentang tersebut. Selanjutnya, sistem mengambil data tagihan dari basis data. Data tersebut kemudian diolah untuk menghitung total dan menghasilkan laporan. Hasil laporan kemudian ditampilkan kepada staf atau pemilik.

</details>

<details><summary><b>Activity Diagram Manajemen Pengingat</b></summary><br>

![Activity Diagram Manajemen Pengingat](diagrams/6_activity_diagram_manajemen_pengingat.png)

Staf dapat melihat daftar pengingat yang pernah terkirim melalui sistem. Sistem akan mengambil informasi riwayat dari penyimpanan data dan memberikan tampilan daftar notifikasi kepada staf. Jika diinginkan, staf bisa menekan tombol pengiriman pengingat secara manual. Setelah itu, sistem akan segera mengirimkan pesan lewat chatbot dan mencatat riwayat pengiriman baru tersebut agar daftar riwayat selalu terbarui.

</details>

<details><summary><b>Activity Diagram Lihat Komplain</b></summary><br>

![Activity Diagram Lihat Komplain](diagrams/7_activity_diagram_lihat_komplain.png)

Proses dimulai ketika staf atau pemilik melihat daftar komplain yang tersedia. Sistem menampilkan laporan kerusakan yang telah diajukan oleh penghuni. Staf kemudian melakukan pembaruan status penanganan terhadap komplain tersebut. Sistem selanjutnya mengirimkan pemberitahuan kepada penghuni terkait perkembangan penanganan. Terakhir, basis data diperbarui, khususnya pada field yang menunjukkan pihak yang menyelesaikan komplain.

</details>

<details><summary><b>Activity Diagram Interaksi Chatbot</b></summary><br>

![Activity Diagram Interaksi Chatbot](diagrams/8_activity_diagram_interaksi_chatbot.png)

Proses dimulai saat penghuni berinteraksi dengan chatbot. Sistem terlebih dahulu memverifikasi nomor pengguna untuk memastikan keabsahan identitas. Setelah itu, pesan yang dikirim disimpan ke dalam basis data sebagai log. Sistem kemudian memberikan respons sesuai dengan perintah atau pesan yang diterima. Penghuni akhirnya menerima balasan dari sistem.

</details>

<details><summary><b>Activity Diagram Pembayaran</b></summary><br>

![Activity Diagram Pembayaran](diagrams/9_activity_diagram_pembayaran.png)

Proses dimulai ketika penghuni melakukan pembayaran melalui tautan pembayaran yang tersedia. Payment gateway kemudian memproses transaksi tersebut. Setelah transaksi berhasil, sistem menerima notifikasi callback sebagai tanda keberhasilan. Selanjutnya, sistem memperbarui status invoice di basis data menjadi “PAID”. Penghuni kemudian menerima bukti pembayaran atau kuitansi sebagai konfirmasi pelunasan.

</details>

<details><summary><b>Activity Diagram Terima Pengingat Tagihan</b></summary><br>

![Activity Diagram Terima Pengingat Tagihan](diagrams/10_activity_diagram_terima_pengingat_tagihan.png)

Proses dimulai oleh cron yang secara otomatis memicu pengingat harian. Sistem kemudian memeriksa invoice yang telah jatuh tempo. Data tagihan dan informasi penghuni diambil dari basis data. Sistem kemudian mengirimkan notifikasi berupa pesan pengingat kepada penghuni. Penghuni akhirnya menerima pesan tersebut sebagai pengingat pembayaran.

</details>

<details><summary><b>Activity Diagram Lihat Riwayat Pembayaran</b></summary><br>

![Activity Diagram Lihat Riwayat Pembayaran](diagrams/11_activity_diagram_lihat_riwayat_pembayaran.png)

Proses dimulai ketika penghuni mengirimkan perintah untuk melihat riwayat pembayaran. Sistem kemudian memeriksa data riwayat pembayaran yang tersedia. Basis data mengembalikan data invoice dengan status “PAID”. Sistem menyusun daftar riwayat pembayaran secara terstruktur, dan hasilnya dikirimkan kepada penghuni untuk ditampilkan.

</details>

<details><summary><b>Activity Diagram Cek Tagihan</b></summary><br>

![Activity Diagram Cek Tagihan](diagrams/12_activity_diagram_cek_tagihan.png)

Proses dimulai saat penghuni mengirimkan perintah untuk mengecek tagihan. Sistem kemudian memeriksa tagihan yang masih aktif. Data invoice dengan status “UNPAID” diambil dari basis data. Sistem kemudian merangkum informasi tagihan tersebut, dan hasilnya dikirimkan kepada penghuni sebagai informasi tagihan terkini.

</details>

<details><summary><b>Activity Diagram Ajukan Komplain</b></summary><br>

![Activity Diagram Ajukan Komplain](diagrams/13_activity_diagram_ajukan_komplain.png)

Proses dimulai ketika penghuni mengirimkan perintah untuk mengajukan komplain, kemudian dilanjutkan dengan memasukkan detail kerusakan. Sistem melakukan validasi terhadap data yang diberikan. Jika valid, data komplain disimpan sebagai record baru di basis data. Sistem kemudian memberikan umpan balik bahwa komplain telah diterima, dan penghuni menerima nomor laporan atau ID komplain sebagai referensi.

</details>

### 1.4 Sequence Diagrams

Sequence diagram merupakan diagram UML yang digunakan untuk menggambarkan interaksi antar objek dalam sistem berdasarkan urutan waktu. Diagram ini menampilkan bagaimana pesan atau komunikasi dikirimkan dari satu objek ke objek lain secara berurutan untuk menjalankan suatu fungsi tertentu. Pada sistem manajemen kos, sequence diagram digunakan untuk menggambarkan interaksi antara pengguna, sistem, basis data, dan layanan eksternal seperti payment gateway atau chatbot, sehingga alur komunikasi data dapat divisualisasikan dengan lebih rinci dan sistematis.

<details><summary><b>Sequence Diagram Verifikasi Akun</b></summary><br>

![Sequence Diagram Verifikasi Akun](diagrams/1_sequence_diagram_verifikasi_akun.png)

Proses dimulai ketika pengguna memasukkan username dan password ke dalam sistem. Sistem kemudian mengirimkan permintaan ke basis data untuk melakukan validasi kredensial. Basis data mengembalikan data pengguna yang sesuai. Setelah itu, sistem melakukan verifikasi password secara internal. Jika password cocok, sistem memperbarui log login ke basis data dan mengarahkan pengguna ke dashboard utama. Namun, jika password tidak sesuai, sistem langsung mengirimkan pesan kesalahan kepada pengguna.

</details>

<details><summary><b>Sequence Diagram Manajemen Akun</b></summary><br>

![Sequence Diagram Manajemen Akun](diagrams/2_sequence_diagram_manajemen_akun.png)

Proses dimulai saat admin mengakses fitur manajemen akun. Sistem kemudian meminta daftar akun ke basis data, dan basis data mengembalikan data tersebut untuk ditampilkan kepada admin. Setelah itu, admin melakukan perubahan seperti menambah atau menghapus akun. Sistem melakukan validasi terhadap input yang diberikan, kemudian mengirimkan perintah ke basis data untuk menyimpan atau menghapus data pengguna. Setelah proses berhasil, sistem memberikan notifikasi sukses kepada admin.

</details>

<details><summary><b>Sequence Diagram Manajemen Kamar</b></summary><br>

![Sequence Diagram Manajemen Kamar](diagrams/3_sequence_diagram_manajemen_kamar.png)

Proses diawali oleh staf yang mengakses data kamar melalui sistem. Sistem kemudian melakukan query ke basis data untuk mengambil daftar kamar, dan hasilnya dikirim kembali ke sistem untuk ditampilkan kepada staf. Selanjutnya, staf melakukan pembaruan terhadap informasi atau status kamar. Sistem menyimpan perubahan tersebut ke basis data, dan setelah berhasil, sistem memberikan notifikasi kepada staf bahwa proses telah selesai.

</details>

<details><summary><b>Sequence Diagram Manajemen Penghuni</b></summary><br>

![Sequence Diagram Manajemen Penghuni](diagrams/4_sequence_diagram_manajemen_penghuni.png)

Proses dimulai ketika staf melakukan registrasi penghuni baru. Sistem terlebih dahulu memeriksa ketersediaan kamar dengan mengirimkan permintaan ke basis data. Basis data mengembalikan informasi apakah kamar tersedia atau tidak. Jika kamar tersedia, sistem menyimpan data penghuni dan kontrak sewa ke basis data, lalu memberikan konfirmasi keberhasilan kepada staf. Jika kamar penuh, sistem memberikan peringatan kepada staf bahwa kamar tidak tersedia.

</details>

<details><summary><b>Sequence Diagram Lihat Laporan Transaksi</b></summary><br>

![Sequence Diagram Lihat Laporan Transaksi](diagrams/5_sequence_diagram_lihat_laporan_transaksi.png)

Proses dimulai saat pengelola (staf atau pemilik) meminta laporan keuangan. Sistem kemudian mengambil data transaksi dari basis data yang mencakup invoice dan data sewa. Setelah data diterima, sistem melakukan perhitungan total pemasukan secara internal. Hasil perhitungan tersebut kemudian disajikan dalam bentuk tabel atau grafik kepada pengelola.

</details>

<details><summary><b>Sequence Diagram Manajemen Pengingat</b></summary><br>

![Sequence Diagram Manajemen Pengingat](diagrams/6_sequence_diagram_manajemen_pengingat.png)

Proses diawali saat staf meminta data riwayat pengingat kepada sistem. Sistem kemudian melakukan pencarian data di dalam sistem penyimpanan dan menampilkannya kembali kepada staf. Staf selanjutnya memberikan instruksi untuk melakukan pengiriman pengingat secara manual. Sistem akan meneruskan permintaan tersebut melalui chatbot dan mencatat bukti pengiriman baru di dalam sistem penyimpanan, lalu memberikan konfirmasi akhir kepada staf.

</details>

<details><summary><b>Sequence Diagram Lihat Komplain</b></summary><br>

![Sequence Diagram Lihat Komplain](diagrams/7_sequence_diagram_lihat_komplain.png)

Proses dimulai ketika pengelola membuka modul komplain. Sistem mengambil daftar komplain dari basis data dan menampilkannya kepada pengelola. Jika pengelola bertindak sebagai staf yang menangani komplain, maka staf dapat memperbarui status komplain menjadi selesai. Sistem kemudian menyimpan informasi penanganan dan penanggung jawab ke basis data. Setelah berhasil, sistem memberikan konfirmasi kepada pengelola.

</details>

<details><summary><b>Sequence Diagram Interaksi Chatbot</b></summary><br>

![Sequence Diagram Interaksi Chatbot](diagrams/8_sequence_diagram_interaksi_chatbot.png)

Proses dimulai saat penghuni mengirimkan pesan melalui chatbot. Sistem melakukan verifikasi nomor telepon ke basis data untuk memastikan identitas pengguna. Jika nomor valid, sistem menyimpan log interaksi dan mengidentifikasi kategori perintah yang diberikan. Setelah itu, sistem mengirimkan respons yang sesuai kepada penghuni. Jika nomor tidak dikenali, sistem langsung mengirimkan pesan penolakan.

</details>

<details><summary><b>Sequence Diagram Pembayaran</b></summary><br>

![Sequence Diagram Pembayaran](diagrams/9_sequence_diagram_pembayaran.png)

Proses dimulai ketika penghuni memilih untuk membayar tagihan. Sistem mengirimkan permintaan ke payment gateway untuk membuat invoice virtual account. Gateway kemudian mengembalikan kode atau tautan pembayaran yang ditampilkan kepada penghuni. Setelah penghuni melakukan pembayaran, gateway mengirimkan notifikasi (callback) ke sistem. Sistem kemudian memperbarui status invoice menjadi “PAID” di basis data dan mengirimkan notifikasi pelunasan kepada penghuni.

</details>

<details><summary><b>Sequence Diagram Terima Pengingat Tagihan</b></summary><br>

![Sequence Diagram Terima Pengingat Tagihan](diagrams/10_sequence_diagram_terima_pengingat_tagihan.png)

Proses dimulai oleh mesin penjadwal yang memicu sistem secara harian. Sistem kemudian meminta data tagihan yang mendekati jatuh tempo ke basis data. Setelah data diterima, sistem menyusun pesan pengingat secara otomatis. Pesan tersebut kemudian dikirimkan kepada penghuni melalui media komunikasi WhatsApp.

</details>

<details><summary><b>Sequence Diagram Lihat Riwayat Pembayaran</b></summary><br>

![Sequence Diagram Lihat Riwayat Pembayaran](diagrams/11_sequence_diagram_lihat_riwayat_pembayaran.png)

Proses dimulai ketika penghuni meminta riwayat pembayaran. Sistem mengirimkan permintaan ke basis data untuk mengambil data invoice dengan status sudah dibayar. Setelah data diterima, sistem memformat daftar riwayat pembayaran agar mudah dibaca. Hasilnya kemudian dikirimkan kembali kepada penghuni.

</details>

<details><summary><b>Sequence Diagram Cek Tagihan</b></summary><br>

![Sequence Diagram Cek Tagihan](diagrams/12_sequence_diagram_cek_tagihan.png)

Proses dimulai saat penghuni meminta informasi tagihan aktif. Sistem mengambil data invoice dengan status belum dibayar dari basis data. Setelah data diterima, sistem menghitung total tagihan secara keseluruhan. Informasi tersebut kemudian dikirimkan kepada penghuni dalam bentuk rincian tagihan beserta batas waktu pembayaran.

</details>

<details><summary><b>Sequence Diagram Ajukan Komplain</b></summary><br>

![Sequence Diagram Ajukan Komplain](diagrams/13_sequence_diagram_ajukan_komplain.png)

Proses dimulai ketika penghuni mengirimkan laporan komplain ke sistem. Sistem terlebih dahulu melakukan validasi terhadap kelengkapan isi laporan. Setelah valid, sistem menyimpan data komplain ke dalam basis data. Basis data mengembalikan status sukses beserta ID komplain. Sistem kemudian mengirimkan konfirmasi kepada penghuni bahwa laporan telah diterima.

</details>

### 1.5 Class Diagram

Class diagram merupakan diagram UML yang digunakan untuk menggambarkan struktur statis dari sistem, termasuk kelas-kelas yang ada, atribut yang dimiliki, serta hubungan antar kelas. Diagram ini berfokus pada bagaimana data dan objek dalam sistem diorganisasikan. Dalam sistem manajemen kos, class diagram berfungsi untuk memodelkan entitas seperti pengguna, penghuni, kamar, sewa, tagihan, notifikasi, dan komplain, sehingga seluruh proses bisnis dapat direpresentasikan secara terstruktur dan saling terhubung.

![Class Diagram](diagrams/0_class_diagram.png)

Class diagram pada sistem ini menggambarkan struktur data serta hubungan antar entitas yang membentuk keseluruhan sistem manajemen kos. Setiap kelas merepresentasikan objek nyata dalam sistem, seperti pengguna, penghuni, kamar, transaksi, hingga komunikasi melalui chatbot. Diagram ini juga menunjukkan bagaimana data saling terhubung untuk mendukung proses bisnis yang ada.

Relasi antar kelas menunjukkan keterkaitan yang erat dalam sistem, seperti tenant yang dapat memiliki banyak lease dan komplain, lease yang menghasilkan invoice, serta invoice yang memicu notifikasi. Struktur ini dirancang untuk memastikan integritas data dan mendukung alur proses bisnis secara menyeluruh, mulai dari penyewaan kamar hingga penyelesaian komplain dan pembayaran.

---

## 2. Rancangan Basis Data

Rancangan basis data merupakan tahap perancangan yang bertujuan untuk mendefinisikan struktur penyimpanan data yang akan digunakan oleh sistem. Pada sistem manajemen kos ini, rancangan basis data disusun untuk mendukung seluruh proses bisnis yang telah dianalisis sebelumnya, mulai dari pengelolaan pengguna, operasional kos, transaksi pembayaran, hingga interaksi melalui chatbot.

Rancangan basis data pada sistem manajemen kos ini disusun berdasarkan hasil analisis dan perancangan yang telah dilakukan pada diagram sebelumnya, yaitu use case diagram, context diagram, activity diagram, sequence diagram, dan class diagram. Setiap tabel yang dibentuk merupakan representasi langsung dari entitas dan relasi yang telah diidentifikasi pada class diagram, serta mendukung alur proses bisnis yang tergambar dalam activity dan sequence diagram.

### 2.1 Entity Relationship Diagram

Entity relationship diagram (ERD) merupakan diagram yang digunakan untuk memodelkan struktur penyimpanan data dalam basis data dengan menunjukkan entitas, atribut, dan hubungan antarentitas tersebut. Berbeda dengan class diagram yang berfokus pada objek dalam kode program, ERD berfokus pada bagaimana data disimpan secara permanen di dalam tabel basis data. Dalam sistem manajemen kos ini, ERD memberikan panduan teknis yang jelas untuk memastikan bahwa seluruh informasi penting tersimpan dalam struktur yang efisien dan saling terintegrasi.

![Entity Relationship Diagram](diagrams/0_entity_relationship_diagram.png)

ERD pada sistem ini memberikan gambaran menyeluruh tentang bagaimana data diorganisasikan di dalam basis data untuk mendukung kelancaran operasional. Setiap kotak dalam diagram merepresentasikan sebuah tabel yang menyimpan informasi spesifik, seperti profil penghuni, rincian kamar, dokumen tagihan, atau log interaksi chatbot. Hubungan antar kotak tersebut menunjukkan bagaimana sistem menghubungkan satu informasi dengan informasi lainnya guna mendukung proses bisnis utama.

Relasi di dalam ERD ini dirancang untuk menjaga keteraturan dan integritas data, seperti menghubungkan penghuni dengan kamar yang mereka tempati melalui kontrak sewa (lease), serta menghubungkan setiap pembayaran dengan dokumen tagihan yang sesuai. Dengan struktur yang terintegrasi ini, sistem dapat dengan mudah melacak riwayat penyewaan, mengelola data pembayaran secara akurat, serta memproses komplain dan notifikasi pengingat secara otomatis kepada penghuni yang bersangkutan.

> **Catatan:** Diagram ERD di atas merupakan representasi awal. Rincian kolom dan tabel pada bagian berikut mencerminkan implementasi aktual, termasuk tabel `bot_auth` dan kolom-kolom tambahan yang tidak tergambar dalam diagram.

### 2.2 Rincian Tabel Basis Data

### `users`

Tabel users digunakan untuk menyimpan data autentikasi pengguna sistem, yang mencakup admin, staff, owner, serta sistem otomatis seperti cron. Keberadaan tabel ini berkaitan langsung dengan proses verifikasi akun pada activity dan sequence diagram, di mana sistem melakukan validasi kredensial sebelum memberikan akses ke fitur tertentu.

| Nama Kolom      | Tipe Data        | Keterangan                            |
| --------------- | ---------------- | ------------------------------------- |
| `id`            | INTEGER (PK, AI) | ID pengguna.                          |
| `username`      | TEXT (Unique)    | Nama pengguna untuk masuk sistem.     |
| `password_hash` | TEXT             | Kata sandi akun.                      |
| `display_name`  | TEXT NULL        | Nama tampilan pengguna.               |
| `role`          | TEXT             | Role akun (admin/staff/owner/system). |
| `last_accessed` | TIMESTAMP NULL   | Kapan terakhir kali akun diakses.     |

Atribut seperti username, password_hash, dan role memungkinkan sistem untuk mengatur hak akses sesuai dengan peran pengguna, sebagaimana dijelaskan pada use case diagram. Kolom display_name digunakan sebagai nama yang ditampilkan di UI dan laporan. Kolom last_accessed digunakan untuk mencatat aktivitas terakhir pengguna sebagai bagian dari monitoring sistem. Role `system` digunakan untuk aksi otomatis oleh cron dan chatbot.

### `tenants`

Tabel tenants berfungsi sebagai pusat penyimpanan data penghuni kos. Data ini menjadi dasar bagi berbagai proses dalam sistem, seperti penyewaan kamar, pengiriman notifikasi, serta interaksi melalui chatbot.

| Nama Kolom      | Tipe Data        | Keterangan                           |
| --------------- | ---------------- | ------------------------------------ |
| `id`            | INTEGER (PK, AI) | ID penghuni.                         |
| `full_name`     | TEXT             | Nama lengkap penghuni.               |
| `phone_number`  | TEXT             | Nomor kontak untuk obrolan bot.      |
| `origin_region` | TEXT NULL        | Daerah kediaman asal penghuni.       |
| `is_verified`   | BOOLEAN          | Status verifikasi nomor WhatsApp.    |

Kolom phone_number memiliki peran penting karena digunakan sebagai identitas dalam komunikasi chatbot, sesuai dengan proses pada sequence diagram interaksi chatbot. Kolom is_verified menandakan apakah penghuni telah mengkonfirmasi identitasnya melalui chatbot (dengan membalas "YA" saat pertama kali mengirim pesan). Tabel ini juga terhubung dengan banyak tabel lain, seperti leases, chatbot_messages, notifications, dan complaints, sehingga menjadi salah satu entitas inti dalam sistem.

### `rooms`

Tabel rooms menyimpan informasi terkait kamar yang tersedia dalam sistem. Data ini digunakan dalam proses manajemen kamar oleh staff, sebagaimana terlihat pada activity dan sequence diagram.

| Nama Kolom      | Tipe Data        | Keterangan                                |
| --------------- | ---------------- | ----------------------------------------- |
| `id`            | INTEGER (PK, AI) | ID kamar.                                 |
| `room_number`   | TEXT (Unique)    | Nomor di pintu kamar.                     |
| `room_type`     | TEXT             | Jenis kamar (standard/premium).           |
| `monthly_price` | INTEGER          | Harga sewa setiap bulannya.               |
| `is_active`     | BOOLEAN          | Penentu apakah kamar tersedia atau tidak. |

Kolom is_active berfungsi untuk menunjukkan ketersediaan kamar, yang kemudian digunakan dalam proses validasi saat melakukan penyewaan (lease). Tabel ini berelasi dengan tabel leases, yang menghubungkan kamar dengan penghuni.

### `leases`

Tabel leases merupakan penghubung antara penghuni (tenants) dan kamar (rooms). Tabel ini merepresentasikan proses penyewaan yang menjadi inti dari sistem manajemen kos.

| Nama Kolom   | Tipe Data        | Keterangan                                        |
| ------------ | ---------------- | ------------------------------------------------- |
| `id`         | INTEGER (PK, AI) | ID kontrak penyewaan.                             |
| `tenant_id`  | INTEGER (FK)     | Penghuni yang menyewa kamarnya.                   |
| `room_id`    | INTEGER (FK)     | Kamar mana yang mereka tempati.                   |
| `start_date` | TIMESTAMP        | Tanggal mulainya sewa ini resmi dihitung.         |
| `end_date`   | TIMESTAMP        | Tanggal berakhirnya masa penyewaan.               |
| `is_active`  | BOOLEAN          | Penanda apakah penyewa ini masih tinggal di sana. |

Atribut seperti start_date, end_date, dan is_active memungkinkan sistem untuk melacak masa sewa secara akurat. Keberadaan tabel ini sangat berkaitan dengan proses pada activity diagram manajemen penghuni serta sequence diagram registrasi penghuni, di mana sistem harus memastikan ketersediaan kamar sebelum menyimpan data sewa.

### `invoices`

Tabel invoices digunakan untuk mencatat seluruh tagihan yang dihasilkan dari proses penyewaan. Setiap data invoice terhubung dengan satu data lease, sesuai dengan relasi pada class diagram.

| Nama Kolom         | Tipe Data        | Keterangan                                    |
| ------------------ | ---------------- | --------------------------------------------- |
| `id`               | INTEGER (PK, AI) | ID lembar tagihan.                            |
| `lease_id`         | INTEGER (FK)     | Data sewa yang sedang ditagihkan ke penghuni. |
| `amount`           | INTEGER          | Nominal uang yang wajib dibayar.              |
| `due_date`         | TIMESTAMP        | Tanggal batas akhir setor uang.               |
| `paid_at`          | TIMESTAMP NULL   | Kapan tagihan dibayar.                        |
| `duitku_reference` | TEXT NULL        | Kode resi payment gateway (DUITKU).           |
| `callback_payload` | TEXT NULL        | Payload raw hasil callback payment gateway.   |
| `status`           | TEXT             | Status pelunasan (unpaid/paid/overdue).       |
| `created_at`       | TIMESTAMP        | Waktu tagihan dibuat.                         |

Kolom seperti due_date, status, dan duitku_reference mendukung proses pembayaran yang tergambar pada sequence diagram pembayaran. Selain itu, kolom callback_payload digunakan untuk menyimpan data hasil callback dari payment gateway, yang menunjukkan bahwa sistem terintegrasi dengan layanan eksternal.

### `chatbot_messages`

Tabel chatbot_messages menyimpan riwayat komunikasi antara penghuni dan sistem melalui chatbot. Data ini digunakan untuk mencatat seluruh interaksi yang terjadi, baik pesan masuk maupun keluar.

| Nama Kolom  | Tipe Data        | Keterangan                            |
| ----------- | ---------------- | ------------------------------------- |
| `id`        | INTEGER (PK, AI) | ID log pesan berjalan.                |
| `tenant_id` | INTEGER (FK)     | Penghuni yang sedang memakai chatbot. |
| `direction` | TEXT             | Konteks pesan dikirim/diterima.       |
| `message`   | TEXT             | Isi tulisan pesannya.                 |
| `sent_at`   | TIMESTAMP        | Waktu kapan pesan dikirim.            |

Tabel ini berkaitan langsung dengan activity dan sequence diagram interaksi chatbot, di mana setiap pesan yang dikirim akan disimpan sebagai log. Informasi ini dapat digunakan untuk analisis maupun pelacakan aktivitas pengguna.

### `notifications`

Tabel notifications digunakan untuk mencatat seluruh notifikasi yang dikirimkan kepada penghuni, terutama yang berkaitan dengan tagihan.

| Nama Kolom           | Tipe Data            | Keterangan                         |
| -------------------- | -------------------- | ---------------------------------- |
| `id`                 | INTEGER (PK, AI)     | ID pesan pemberitahuan.            |
| `tenant_id`          | INTEGER (FK)         | Penghuni yang dikirimi notifikasi. |
| `invoice_id`         | INTEGER (FK)         | Tagihan yang terkait.              |
| `chatbot_message_id` | INTEGER (Unique, FK) | Pesan yang dikirimkan.             |
| `type`               | TEXT                 | Konteks pengingat.                 |
| `status`             | TEXT                 | Status pengiriman notifikasi.      |

Relasi antara notifications, invoices, dan chatbot_messages menunjukkan alur proses pengingat tagihan yang tergambar pada activity dan sequence diagram manajemen pengingat. Kolom type dan status memungkinkan sistem untuk mengelola jenis dan keberhasilan pengiriman notifikasi.

### `audit_logs`

Tabel audit_logs berfungsi untuk mencatat setiap aktivitas perubahan data dalam sistem. Tabel ini penting untuk menjaga keamanan dan transparansi, terutama dalam sistem yang melibatkan banyak peran pengguna.

| Nama Kolom   | Tipe Data        | Keterangan                            |
| ------------ | ---------------- | ------------------------------------- |
| `id`         | INTEGER (PK, AI) | ID rekam jejak perubahan sistem.      |
| `user_id`    | INTEGER (FK)     | Pengguna yang mengubah datanya.       |
| `action`     | TEXT             | Aksi perubahannya (CREATE/UPDATE/DELETE/REJECT/LOGIN). |
| `table_name` | TEXT             | Tabel yang dirubah.                   |
| `record_id`  | INTEGER NULL     | ID dari record yang dirubah.          |
| `details`    | TEXT NULL        | Detail perubahan dalam format JSON.   |
| `created_at` | TIMESTAMP        | Waktu tindakan mengubah hal tersebut. |

Setiap perubahan yang dilakukan oleh user akan direkam, termasuk jenis aksi, tabel yang terlibat, serta waktu kejadian. Kolom details berisi JSON dengan struktur discriminated union yang menjelaskan konteks perubahan: create/update/delete (dengan perubahan data), cron (jadwal otomatis), bot (interaksi chatbot), reject (penolakan), payment (pembayaran), notification (notifikasi), atau generic. Kolom record_id bersifat nullable untuk aksi LOGIN yang tidak terkait record spesifik.

### `complaints`

Tabel complaints digunakan untuk menyimpan data komplain yang diajukan oleh penghuni. Tabel ini berkaitan langsung dengan use case dan diagram proses pengajuan serta penanganan komplain.

| Nama Kolom      | Tipe Data         | Keterangan                         |
| --------------- | ----------------- | ---------------------------------- |
| `id`            | INTEGER (PK, AI)  | ID surat pengaduan.                |
| `tenant_id`     | INTEGER (FK)      | Penghuni pelapor.                  |
| `description`   | TEXT              | Isi detail dari kerusakannya.      |
| `status`        | TEXT              | Status keluhan (open/in_progress/resolved). |
| `processed_at`  | TIMESTAMP NULL    | Kapan komplain mulai diproses.     |
| `resolved_by`   | INTEGER NULL (FK) | Pengguna yang menyelesaikan.       |
| `resolve_notes` | TEXT NULL         | Catatan penyelesaian.              |
| `resolved_at`   | TIMESTAMP NULL    | Kapan komplain diselesaikan.       |
| `created_at`    | TIMESTAMP         | Waktu keluhan dibuat.              |

Kolom tenant_id menunjukkan siapa yang mengajukan komplain, sedangkan resolved_by menunjukkan pengguna (staff) yang menangani komplain tersebut. Kolom status digunakan untuk melacak progres penyelesaian: `open` → `in_progress` → `resolved`. Setiap transisi status memicu notifikasi WhatsApp ke penghuni. Kolom processed_at dan resolved_at mencatat kapan komplain mulai ditangani dan diselesaikan.

### `bot_auth`

Tabel bot_auth digunakan sebagai key-value store untuk menyimpan session autentikasi WhatsApp (Baileys). Tabel ini tidak memiliki foreign key karena berfungsi sebagai penyimpanan sementara untuk kredensial bot.

| Nama Kolom | Tipe Data | Keterangan                         |
| ---------- | --------- | ---------------------------------- |
| `key`      | TEXT (PK) | Kunci autentikasi (credential key). |
| `value`    | TEXT      | Nilai kunci (credential value).    |

Tabel ini dikelola secara otomatis oleh library Baileys. Saat login, seluruh kredensial disimpan di sini. Saat logout, seluruh data dihapus. Struktur key menggunakan format Baileys dengan penggantian karakter `/` → `__` dan `:` → `-` untuk kompatibilitas dengan SQLite.

---

## 3. Fitur Tambahan

Bagian ini menjelaskan fitur-fitur yang diimplementasikan namun tidak tercakup dalam diagram UML awal.

### 3.1 Verifikasi Penghuni via Chatbot

Sistem menerapkan alur verifikasi dua langkah untuk penghuni baru:

1. Penghuni mengirim pesan pertama kali ke bot WhatsApp
2. Sistem memeriksa apakah nomor terdaftar dan apakah sudah diverifikasi (`is_verified`)
3. Jika belum diverifikasi, sistem meminta konfirmasi dengan pesan "YA"
4. Setelah konfirmasi, `is_verified` diatur ke `true` dan penghuni dapat menggunakan semua perintah

Nomor yang belum terdaftar menerima pesan penolakan dengan cooldown 30 detik untuk mencegah spam.

### 3.2 Jenis Notifikasi

Sistem mendukung empat jenis notifikasi yang dikirim melalui WhatsApp:

| Jenis | Deskripsi |
|-------|-----------|
| `welcome` | Pesan selamat datang untuk penghuni baru beserta instruksi verifikasi |
| `payment_success` | Konfirmasi pembayaran berhasil setelah callback Duitku diterima |
| `reminder` | Pengingat tagihan jatuh tempo (dikirim otomatis untuk invoice yang jatuh tempo dalam 3 hari) |
| `custom` | Notifikasi kustom (placeholder untuk pengembangan masa depan) |

### 3.3 Integrasi Payment Gateway (Duitku)

Alur pembayaran terintegrasi dengan payment gateway Duitku:

1. **Generate Link**: Scheduler membuat invoice dan menghasilkan payment link via API Duitku
2. **Distribusi**: Link dikirim ke penghuni melalui WhatsApp (perintah `tagihan` atau notifikasi `reminder`)
3. **Pembayaran**: Penghuni melakukan pembayaran melalui halaman Duitku
4. **Callback**: Duitku mengirim callback ke endpoint `/api/duitku/callback`
5. **Konfirmasi**: Sistem memverifikasi signature callback, memperbarui status invoice, dan mengirim notifikasi `payment_success`
6. **Redirect**: Penghuni diarahkan kembali ke halaman invoice setelah pembayaran

### 3.4 Laporan PDF

Sistem menghasilkan laporan dalam format PDF menggunakan puppeteer-core dengan layout formal monochrome. Semua laporan menggunakan layout bersama (`report-layout.astro`) yang mencakup kop surat, konten, dan blok tanda tangan.

| # | Laporan | Lokasi |
|---|---------|--------|
| 1 | Laporan Komplain | `manage/complaints/report/` |
| 2 | Daftar Penghuni Aktif | `manage/tenants/report/` |
| 3 | Rekap Status Kamar | `manage/rooms/report/` |
| 4 | Laporan Transaksi Bulanan | `report/transactions/report/` |
| 5 | Laporan Riwayat Notifikasi | `report/notifications/report/` |
| 6 | Laporan Aktivitas Pengguna (Audit) | `log/audit/report/` |
| 7 | Laporan Percakapan Chatbot | `log/chatbot/report/` |
| 8 | Struk Invoice Digital | `invoice/[id]/download` |

Setiap laporan dihasilkan melalui endpoint `download.ts` yang menggunakan `makeDownloadHandler()` — pola reusable yang memungkinkan setiap endpoint hanya memerlukan satu baris kode. Autentikasi untuk puppeteer ditangani melalui token in-memory (`_pdf_token`) yang diverifikasi oleh middleware.

### 3.5 Scheduler (Penjadwal Otomatis)

Sistem menggunakan tiga worker cron yang berjalan secara otomatis:

| Worker | Jadwal (UTC/WITA) | Fungsi |
|--------|-------------------|--------|
| Invoice Generation | 00:00/08:00 | Membuat tagihan bulanan untuk semua lease aktif, termasuk backfill untuk lease yang terlewat |
| Overdue Check | 16:00/00:00 | Menandai invoice yang belum dibayar melewati jatuh tempo sebagai `overdue` |
| Rent Reminder | 00:00/08:00 | Membuat record notifikasi `reminder` untuk invoice yang jatuh tempo dalam 3 hari |

Setiap worker mencatat aktivitasnya ke tabel `audit_logs` dengan action `CREATE` atau `UPDATE` dan detail JSON yang menjelaskan record yang terpengaruh.

### 3.6 Manajemen Penghuni Lanjutan

Sistem mendukung operasi pengelolaan penghuni yang lebih lengkap:

- **Pindah Kamar**: Memindahkan penghuni aktif ke kamar lain (lease lama diakhiri, lease baru dibuat)
- **Akhiri Sewa**: Mengakhiri masa sewa penghuni (`is_active` diatur ke `false`)
- **Daftar Ulang**: Mendaftarkan ulang penghuni yang masa sewanya sudah berakhir dengan lease baru
- **Indeks Unik**: Hanya satu lease aktif per penghuni yang diizinkan (partial unique index)

### 3.7 Sistem Pesan Chatbot

Bot WhatsApp memproses pesan dengan mekanisme:

1. **Filter**: Abaikan pesan sendiri, non-WhatsApp JID, dan pesan kosong
2. **Debounce**: Timer 5 detik per pengguna untuk menggabungkan pesan beruntun
3. **Rate Limiting**: Interval minimal 1 detik antar pengiriman pesan
4. **Cooldown**: 30 detik untuk nomor yang belum terdaftar
5. **Audit**: Seluruh pesan masuk dan keluar dicatat ke tabel `chatbot_messages`
