# PROPOSAL SKRIPSI

**SISTEM INFORMASI MANAJEMEN KOST TERINTEGRASI PAYMENT GATEWAY DENGAN PENGINGAT OTOMATIS PADA KOST UNGU BANJARBARU**

**Oleh:**

**AHMAD YASSER
NPM: 2210010525**

![](data:image/png;base64...)

**PROGRAM STUDI S1 TEKNIK INFORMATIKA**

**FAKULTAS TEKNOLOGI INFORMASI**

**UNIVERSITAS ISLAM KALIMANTAN**

**MUHAMMAD ARSYAD AL BANJARI**

**BANJARMASIN
202\****6**

# DAFTAR ISI

**Halaman**

[PROPOSAL SKRIPSI i](#_Toc225328718)

[DAFTAR ISI ii](#_Toc225328719)

[DAFTAR GAMBAR iii](#_Toc225328720)

[DAFTAR TABEL v](#_Toc225328721)

[BAB I PENDAHULUAN 6](#_Toc225328722)

[1.1 Latar Belakang 6](#_Toc225328723)

[1.2 Perumusan Masalah 8](#_Toc225328724)

[1.3 Batasan Masalah 9](#_Toc225328725)

[1.4 Tujuan Penelitian 9](#_Toc225328726)

[1.5 Manfaat Penelitian 10](#_Toc225328727)

[BAB II TINJAUAN PUSTAKA 11](#_Toc225328728)

[2.1 Landasan Teori 11](#_Toc225328730)

[2.2 Penelitian Terkait 20](#_Toc225328731)

[BAB III METODE PENELITIAN 23](#_Toc225328732)

[3.1 Teknik Pengumpulan Data 23](#_Toc225328734)

[3.2 Analisis Sistem yang Berjalan 24](#_Toc225328735)

[3.3 Analisis Kebutuhan Sistem 27](#_Toc225328736)

[3.4 Rancangan Model Sistem 30](#_Toc225328737)

[3.5 Rancangan Basis Data 60](#_Toc225328738)

[3.6 Rancangan Antarmuka Masukan Sistem 69](#_Toc225328739)

[3.7 Rancangan Antarmuka Keluaran Sistem 75](#_Toc225328740)

[3.8 Tempat dan Jadwal Penelitian 84](#_Toc225328741)

[DAFTAR PUSTAKA 85](#_Toc225328742)

# DAFTAR GAMBAR

[Gambar 3. 1 Flowchart Pendaftaran 25](#_Toc225328844)

[Gambar 3. 2 Flowchart Pembayaran 26](#_Toc225328845)

[Gambar 3. 3 Flowchart Komplain 27](#_Toc225328846)

[Gambar 3. 4 Diagram Konteks 30](#_Toc225328847)

[Gambar 3. 5 Diagram Use Case 32](#_Toc225328848)

[Gambar 3. 6 Diagram Activity Verifikasi Akun 34](#_Toc225328849)

[Gambar 3. 7 Diagram Activity Manajemen Akun 35](#_Toc225328850)

[Gambar 3. 8 Diagram Activity Manajemen Kamar 36](#_Toc225328851)

[Gambar 3. 9 Diagram Activity Manajemen Penghuni 37](#_Toc225328852)

[Gambar 3. 10 Diagram Activity Lihat Laporan Transaksi 38](#_Toc225328853)

[Gambar 3. 11 Diagram Activity Manajemen Pengingat 39](#_Toc225328854)

[Gambar 3. 12 Diagram Activity Lihat Daftar Komplain 40](#_Toc225328855)

[Gambar 3. 13 Diagram Activity Interaksi Chatbot 41](#_Toc225328856)

[Gambar 3. 14 Diagram Activity Pembayaran 42](#_Toc225328857)

[Gambar 3. 15 Diagram Activity Terima Pengingat Tagihan 43](#_Toc225328858)

[Gambar 3. 16 Diagram Activity Lihat Riwayat Pembayaran 44](#_Toc225328859)

[Gambar 3. 17 Diagram Activity Cek Tagihan 45](#_Toc225328860)

[Gambar 3. 18 Diagram Activity Ajukan Komplain 46](#_Toc225328861)

[Gambar 3. 19 Diagram Sequence Verifikasi Akun 47](#_Toc225328862)

[Gambar 3. 20 Diagram Sequence Manajemen Akun 48](#_Toc225328863)

[Gambar 3. 21 Diagram Sequence Manajemen Kamar 49](#_Toc225328864)

[Gambar 3. 22 Diagram Sequence Manajemen Penghuni 50](#_Toc225328865)

[Gambar 3. 23 Diagram Sequence Lihat Laporan Transaksi 51](#_Toc225328866)

[Gambar 3. 24 Diagram Sequence Manajemen Pengingat 52](#_Toc225328867)

[Gambar 3. 25 Diagram Sequence Lihat Komplain 53](#_Toc225328868)

[Gambar 3. 26 Diagram Sequence Interaksi Chatbot 54](#_Toc225328869)

[Gambar 3. 27 Diagram Sequence Pembayaran 55](#_Toc225328870)

[Gambar 3. 28 Diagram Sequence Terima Pengingat Tagihan 56](#_Toc225328871)

[Gambar 3. 29 Diagram Sequence Lihat Riwayat Pembayaran 56](#_Toc225328872)

[Gambar 3. 30 Diagram Sequence Lihat Tagihan 57](#_Toc225328873)

[Gambar 3. 31 Diagram Sequence Ajukan Komplain 58](#_Toc225328874)

[Gambar 3. 32 Diagram Class 59](#_Toc225328875)

[Gambar 3. 33 Diagram ERD 68](#_Toc225328876)

[Gambar 3. 34 Rancangan Antarmuka Login 70](#_Toc225328877)

[Gambar 3. 35 Rancangan Antarmuka Dashboard 70](#_Toc225328878)

[Gambar 3. 36 Rancangan Antarmuka Manajemen Akun 71](#_Toc225328879)

[Gambar 3. 37 Rancangan Antarmuka Manajemen Kamar 71](#_Toc225328880)

[Gambar 3. 38 Rancangan Antarmuka Manajemen Penghuni 72](#_Toc225328881)

[Gambar 3. 39 Rancangan Antarmuka Transaksi 72](#_Toc225328882)

[Gambar 3. 40 Rancangan Antarmuka Notifikasi 73](#_Toc225328883)

[Gambar 3. 41 Rancangan Antarmuka Komplain 73](#_Toc225328884)

[Gambar 3. 42 Rancangan Antarmuka Log Chatbot 74](#_Toc225328885)

[Gambar 3. 43 Rancangan Antarmuka Audit Log 74](#_Toc225328886)

[Gambar 3. 44 Rancangan Antarmuka Keluaran Laporan Transaksi 75](#_Toc225328887)

[Gambar 3. 45 Rancangan Antarmuka Keluaran Struk Invoice 76](#_Toc225328888)

[Gambar 3. 46 Rancangan Antarmuka Keluaran Audit Log 77](#_Toc225328889)

[Gambar 3. 47 Rancangan Antarmuka Keluaran Interaksi Chatbot 78](#_Toc225328890)

[Gambar 3. 48 Rancangan Antarmuka Keluaran Daftar Penghuni 79](#_Toc225328891)

[Gambar 3. 49 Rancangan Antarmuka Keluaran Rekap Kamar 80](#_Toc225328892)

[Gambar 3. 50 Rancangan Antarmuka Keluaran Laporan Komplain 81](#_Toc225328893)

[Gambar 3. 51 Rancangan Antarmuka Keluaran Laporan Pengingat 82](#_Toc225328894)

[Gambar 3. 52 Rancangan Antarmuka Keluaran Rekap Tagihan 83](#_Toc225328895)

# DAFTAR TABEL

[Tabel 2. 1 Simbol Diagram Use Case 15](#_Toc225328795)

[Tabel 2. 2 Simbol Diagram Activity 15](#_Toc225328796)

[Tabel 2. 3 Simbol Diagram Sequence 16](#_Toc225328797)

[Tabel 2. 4 Simbol Diagram Class 17](#_Toc225328798)

[Tabel 2. 5 Penelitian Terkait 19](#_Toc225328799)

[Tabel 3. 1 Kebutuhan Fungsional 28](#_Toc225328800)

[Tabel 3. 2 Kebutuhan Non-Fungsional 29](#_Toc225328801)

[Tabel 3. 3 Rancangan Tabel users 61](#_Toc225328802)

[Tabel 3. 4 Rancangan Tabel tenants 61](#_Toc225328803)

[Tabel 3. 5 Rancangan Tabel rooms 62](#_Toc225328804)

[Tabel 3. 6 Rancangan Tabel leases 63](#_Toc225328805)

[Tabel 3. 7 Rancangan Tabel invoices 64](#_Toc225328806)

[Tabel 3. 8 Rancangan Tabel chatbot\_messages 65](#_Toc225328807)

[Tabel 3. 9 Rancangan Tabel Notifications 65](#_Toc225328808)

[Tabel 3. 10 Rancangan Tabel audit\_logs 66](#_Toc225328809)

[Tabel 3. 11 Rancangan Tabel complaints 67](#_Toc225328810)

[Tabel 3.12 Jadwal Penelitian 84](#_Toc225328811)

# BAB I PENDAHULUAN

## Latar Belakang

Objek penelitian ini berlokasi di Kost Ungu, yang beralamat di Jl. Sejahtera, Komplek Damai, RT 002/RW 006, Kelurahan Mentaos, Kec. Banjarbaru Utara, Kota Banjar Baru, Kalimantan Selatan 70714. Saat ini, pengelolaan operasional kos masih dilakukan secara manual, meliputi pencatatan data penghuni, pengelolaan kamar, pencatatan transaksi pembayaran, serta penanganan komplain. Proses yang berjalan masih bergantung pada pencatatan di buku atau media sederhana serta komunikasi langsung melalui pesan pribadi tanpa sistem terintegrasi. Hal ini menyebabkan berbagai kendala, seperti keterlambatan pembayaran, kesalahan pencatatan data, kesulitan dalam pelacakan riwayat transaksi, serta tidak terkelolanya komplain secara sistematis.

Seiring dengan perkembangan teknologi digital, khususnya dalam bidang sistem informasi, chatbot, dan integrasi layanan pembayaran, muncul peluang untuk meningkatkan efisiensi pengelolaan kos secara menyeluruh. Pemanfaatan chatbot sebagai media interaksi memungkinkan penghuni untuk mengakses berbagai layanan secara otomatis, seperti pengecekan tagihan, riwayat pembayaran, serta pengajuan komplain. Selain itu, integrasi dengan payment gateway memungkinkan proses pembayaran dilakukan secara digital dengan lebih cepat, aman, dan terdokumentasi dengan baik. Dukungan sistem notifikasi otomatis juga memungkinkan pengingat pembayaran dikirim secara berkala tanpa intervensi manual.

Permasalahan utama yang terjadi di Kost Ungu meliputi keterlambatan pembayaran akibat tidak adanya sistem pengingat yang terstruktur, kesalahan dalam pencatatan data penghuni dan transaksi, serta kurangnya transparansi dalam pengelolaan informasi. Selain itu, proses komunikasi antara penghuni dan pengelola masih belum terpusat, sehingga komplain sering kali tidak terdokumentasi dengan baik dan sulit ditindaklanjuti. Berdasarkan observasi, pengelola menghabiskan waktu yang cukup besar untuk melakukan verifikasi pembayaran, pencatatan ulang data, serta merespons pertanyaan penghuni secara manual.

Sebagai solusi, diusulkan pengembangan sistem manajemen kos berbasis digital yang terintegrasi dengan chatbot, payment gateway, dan notifikasi otomatis. Sistem ini mendukung pengelolaan akun, kamar, penghuni, penyewaan, tagihan, serta komplain. Penghuni dapat mengakses layanan melalui chatbot, seperti mengecek tagihan, melihat riwayat pembayaran, melakukan pembayaran, dan mengajukan komplain, sedangkan pengelola memantau operasional dan transaksi melalui web secara real-time. Selain itu, sistem menyediakan struk bukti pembayaran digital yang dihasilkan otomatis, tersimpan dalam sistem, dan dapat diakses secara online untuk memudahkan verifikasi pembayaran.

Beberapa penelitian terdahulu mendukung penerapan sistem ini. Studi oleh Habibah et al. (2024) menunjukkan bahwa penggunaan chatbot berbasis WhatsApp dalam sistem notifikasi mampu meningkatkan ketepatan waktu pembayaran. Penelitian oleh Pranatawijaya dan Yulianto (2022) juga membuktikan bahwa integrasi payment gateway dapat meningkatkan kemudahan dan keamanan transaksi digital. Selain itu, penelitian Rahmat dan Agus (2026) mengenai sistem informasi manajemen kos berbasis web menunjukkan peningkatan efisiensi dalam pengelolaan data penghuni dan transaksi. Hasil penelitian tersebut memperkuat bahwa integrasi berbagai teknologi dalam satu sistem terpadu dapat memberikan solusi yang lebih efektif dan komprehensif.

Dengan disusunnya latar belakang ini, maka diperoleh judul skripsi yang diusulkan yaitu “Rancang Bangun Sistem Manajemen Kos Berbasis Web dengan Integrasi Chatbot, Payment Gateway, dan Notifikasi Otomatis pada Kost Ungu”.

## Perumusan Masalah

Berdasarkan dari latar belakang masalah, maka perumusan masalah dari penelitian ini adalah sebagai berikut:

1. Bagaimana merancang sistem manajemen kos berbasis web dengan integrasi _chatbot_, _payment gateway_, dan notifikasi otomatis?
2. Bagaimana cara mengintegrasikan chatbot WhatsApp yang bisa berinteraksi dengan penghuni?
3. Bagaimana mengimplementasikan payment gateway yang mendukung berbagai metode pembayaran dalam sistem ini?
4. Bagaimana cara agar sistem secara otomatis mengirim pengingat kepada penghuni melalui chatbot WhatsApp?

## Batasan Masalah

Batasan masalah ditetapkan untuk memperjelas ruang lingkup, tingkat kedalaman pengembangan, serta kendala teknis/fungsional sistem. Berikut batasan masalah dalam pengembangan sistem pembayaran digital Kost Ungu:

1. Sistem yang dikembangkan berbasis web dan berfokus pada manajemen operasional kos.
2. Interaksi penghuni dengan sistem hanya dilakukan melalui chatbot WhatsApp.
3. Sistem menghasilkan dan menyimpan struk bukti pembayaran digital yang dapat diakses secara online sebagai bukti pembayaran.
4. Sistem tidak mencakup fitur di luar operasional kos, seperti manajemen inventaris selain kamar, sistem akuntansi lanjutan, atau integrasi dengan sistem perpajakan.
5. Menggunakan layanan pihak ketiga Duitku sebagai _payment gateway_ dan WhatsApp sebagai media komunikasi, tanpa pengembangan dari nol.

## Tujuan Penelitian

Tujuan dari pengembangan sistem pembayaran digital Kost Ungu, yang ingin dicapai sebagai berikut:

1. Merancang sistem manajemen kos berbasis web dengan integrasi _chatbot_, _payment gateway_, dan notifikasi otomatis.
2. Mengintegrasikan chatbot WhatsApp yang bisa berinteraksi dengan penghuni.
3. Mengimplementasikan payment gateway yang mendukung berbagai metode pembayaran.
4. Membuat sistem yang bisa secara otomatis mengirim pengingat kepada penghuni melalui chatbotWhatsApp.

## Manfaat Penelitian

Manfaat yang dapat diperoleh dari pembuatan sistem pembayaran digital Kost Ungu, diantaranya:

1. Meningkatkan efisiensi pengelolaan kos melalui digitalisasi data penghuni, kamar, penyewaan, transaksi, serta komplain dalam satu sistem terintegrasi.
2. Meringankan beban kerja pengelola melalui otomatisasi proses, seperti pencatatan transaksi, verifikasi pembayaran, pengiriman notifikasi, dan pengelolaan arsip digital.
3. Mengurangi keterlambatan pembayaran dengan adanya pengingat otomatis serta kemudahan pembayaran melalui integrasi payment gateway.
4. Meningkatkan kualitas layanan kepada penghuni melalui penggunaan chatbot sebagai media interaksi yang cepat, mudah, dan terpusat.
5. Meningkatkan akurasi dan transparansi data melalui pencatatan transaksi secara real-time serta penyimpanan struk bukti pembayaran digital yang dapat diakses kapan saja.
6. Mempermudah proses monitoring dan pengambilan keputusan bagi pengelola melalui penyediaan data dan laporan yang terorganisir.

# BAB II TINJAUAN PUSTAKA

## Landasan Teori

Landasan teori berfungsi sebagai dasar ilmiah dan referensi yang mendukung pengembangan sistem baru.

### Sistem Informasi Manajemen

Sistem Informasi Manajemen (SIM) merupakan suatu sistem yang dirancang untuk mengelola, mengolah, dan menyajikan informasi yang digunakan dalam mendukung kegiatan operasional, manajerial, serta pengambilan keputusan dalam suatu organisasi. SIM mengintegrasikan berbagai komponen seperti manusia, perangkat keras, perangkat lunak, prosedur, dan basis data untuk menghasilkan informasi yang akurat, relevan, dan tepat waktu. Dengan adanya SIM, proses pengelolaan data yang sebelumnya dilakukan secara manual dapat menjadi lebih efisien, terstruktur, dan meminimalisir kesalahan dalam pengolahan informasi (Hidayat & Tedyyana, 2026).

### Sistem Informasi Berbasis Website

Sistem informasi berbasis website merupakan sistem informasi yang diimplementasikan menggunakan teknologi web dan dapat diakses melalui jaringan internet menggunakan browser. Sistem ini umumnya menggunakan arsitektur _client-server_, di mana pengguna berinteraksi melalui antarmuka web sebagai _client_, sedangkan _server_ bertanggung jawab dalam pemrosesan data dan penyimpanan informasi. Keunggulan sistem berbasis web terletak pada kemudahan akses, fleksibilitas penggunaan tanpa instalasi khusus, serta kemampuannya untuk diakses secara _real-time_ dari berbagai perangkat (Fandopa & Santoso, 2022).

### Manajemen Komplain

Menurut Fadly et al. (2026) manajemen komplain adalah suatu proses sistematis dalam menerima, mencatat, mengelola, dan menindaklanjuti keluhan atau pengaduan dari pengguna atau pelanggan. Tujuan dari manajemen komplain adalah untuk meningkatkan kualitas layanan, menjaga kepuasan pengguna, serta memastikan setiap permasalahan dapat ditangani secara efektif dan terdokumentasi dengan baik. Dengan adanya sistem manajemen komplain yang terstruktur, organisasi dapat melakukan evaluasi terhadap layanan yang diberikan serta mengidentifikasi area yang perlu ditingkatkan.

### Bukti Pembayaran Digital

Bukti pembayaran digital merupakan dokumen elektronik yang digunakan sebagai bukti transaksi antara penjual dan pembeli yang berisi informasi terkait barang atau jasa, jumlah pembayaran, serta rincian transaksi lainnya. Berbeda dengan bukti pembayaran konvensional, bukti pembayaran digital disimpan dan dikelola dalam bentuk digital sehingga lebih mudah diakses, didistribusikan, dan diarsipkan. Penggunaan bukti pembayaran digital juga meningkatkan efisiensi, mengurangi penggunaan kertas, serta mempermudah proses verifikasi dan pelacakan transaksi (Syamsiah et al., 2026).

### Chatbot

_Chatbot_ adalah program komputer yang dirancang untuk mensimulasikan percakapan dengan pengguna melalui pesan teks atau suara secara otomatis. _Chatbot_ bekerja berdasarkan aturan tertentu (_rule-based_) atau menggunakan kecerdasan buatan (AI) untuk memahami dan merespons input pengguna. Dalam konteks sistem informasi, _chatbot_ dapat digunakan sebagai media interaksi yang memudahkan pengguna dalam mengakses layanan, seperti mendapatkan informasi, melakukan transaksi, atau menyampaikan keluhan tanpa perlu interaksi langsung dengan manusia (Muliyono, 2021).

### Notifikasi Otomatis (_Cron Job_)

Notifikasi otomatis merupakan mekanisme pengiriman pesan atau pemberitahuan kepada pengguna secara sistematis tanpa intervensi manual, yang biasanya dijalankan berdasarkan jadwal tertentu. Salah satu metode yang umum digunakan adalah Cron, yaitu penjadwalan tugas otomatis pada sistem berbasis server untuk menjalankan perintah atau proses pada waktu yang telah ditentukan. Dengan menggunakan Cron, sistem dapat mengirimkan pengingat pembayaran, pemberitahuan jatuh tempo, atau informasi lainnya secara berkala dan konsisten, sehingga meningkatkan efisiensi dan kedisiplinan pengguna (Fernanda & Rizky, 2024).

### Payment Gateway

Menurut Silvana et al., (2024) _payment gateway_ adalah layanan yang berfungsi sebagai perantara dalam proses transaksi pembayaran digital antara pengguna dan penyedia layanan keuangan. Sistem ini memungkinkan pengguna untuk melakukan pembayaran secara online menggunakan berbagai metode, seperti transfer bank, kartu kredit, atau dompet digital. _Payment gateway_ bekerja dengan mengenkripsi data transaksi untuk menjaga keamanan serta memastikan proses pembayaran berjalan dengan cepat, aman, dan dapat diverifikasi secara otomatis oleh sistem.

### Diagram Konteks

Diagram konteks atau _Data Flow Diagram_ (DFD) Level 0 merupakan representasi grafis tingkat tinggi yang menggambarkan keseluruhan sistem sebagai satu proses utama serta hubungan interaksi antara sistem dengan entitas eksternal. Diagram ini menunjukkan aliran data yang masuk dan keluar dari sistem tanpa menampilkan detail proses internal. Tujuan dari diagram konteks adalah untuk memberikan gambaran umum mengenai batasan sistem, aktor yang terlibat, serta arus data yang terjadi, sehingga memudahkan pemahaman terhadap ruang lingkup sistem yang dikembangkan (Irfan et al., 2024).

### UML (Unified Modeling Language)

Menurut Narulita et al. (2024) UML merupakan bahasa pemodelan visual yang digunakan untuk merancang, memvisualisasikan, dan mendokumentasikan sistem perangkat lunak. UML menyediakan berbagai jenis diagram yang masing-masing memiliki fungsi tertentu dalam menggambarkan aspek sistem. Berikut penjelasan beberapa diagram UML:

1. _Use case diagram_: digunakan untuk menggambarkan interaksi antara aktor dengan sistem serta fungsi-fungsi yang tersedia dalam sistem.

Tabel 2. 1 Simbol Diagram Use Case

|                               |               |                                                                    |
| ----------------------------- | ------------- | ------------------------------------------------------------------ |
| **Simbol**                    | **Nama**      | **Keterangan**                                                     |
| ![](data:image/png;base64...) | _Actor_       | Representasi pengguna atau entitas luar                            |
| ![](data:image/png;base64...) | _Use Case_    | Fitur atau fungsi sistem                                           |
| ![](data:image/png;base64...) | _Association_ | Hubungan antara aktor dan _use case_                               |
| ![](data:image/png;base64...) | _Include_     | Relasi di mana suatu _use case_ selalu menyertakan _use case_ lain |
| ![](data:image/png;base64...) | _Extend_      | Relasi opsional yang memperluas fungsi _use case_ tertentu         |

1. _Activity diagram_: digunakan untuk menggambarkan alur aktivitas atau proses bisnis dalam sistem secara berurutan.

Tabel 2. 2 Simbol Diagram Activity

|                               |                |                                                   |
| ----------------------------- | -------------- | ------------------------------------------------- |
| **Simbol**                    | **Nama**       | **Keterangan**                                    |
| ![](data:image/png;base64...) | _Initial Node_ | Titik awal proses                                 |
| ![](data:image/png;base64...) | _Activity_     | Aktivitas yang dilakukan                          |
| ![](data:image/png;base64...) | _Decision_     | Percabangan berdasarkan kondisi                   |
| ![](data:image/png;base64...) | _Merge_        | Penggabungan kembali alur setelah percabangan     |
| ![](data:image/png;base64...) | _Final Node_   | Titik akhir proses                                |
| ![](data:image/png;base64...) | _Swimlane_     | Pembagian aktivitas berdasarkan aktor atau bagian |

1. _Sequence diagram_: menggambarkan interaksi antar objek dalam sistem berdasarkan urutan waktu.

Tabel 2. 3 Simbol Diagram Sequence

|                               |               |                                             |
| ----------------------------- | ------------- | ------------------------------------------- |
| **Simbol**                    | **Nama**      | **Keterangan**                              |
| ![](data:image/png;base64...) | _Actor_       | Pengguna sistem                             |
| ![](data:image/png;base64...) | _Entity_      | Objek/data dalam sistem                     |
| ![](data:image/png;base64...) | _Lifeline_    | Garis waktu objek                           |
| ![](data:image/png;base64...) | _Activation_  | Periode aktif objek saat menjalankan proses |
| ![](data:image/png;base64...) | _Message_     | Pesan antar objek                           |
| ![](data:image/png;base64...) | _Loop_        | Perulangan proses                           |
| ![](data:image/png;base64...) | _Alternative_ | Percabangan kondisi (_if/else_)             |

1. _Class diagram_: digunakan untuk menggambarkan struktur kelas dalam sistem beserta atribut dan metode yang dimiliki.

Tabel 2. 4 Simbol Diagram Class

|                               |                |                         |
| ----------------------------- | -------------- | ----------------------- |
| **Simbol**                    | **Nama**       | **Keterangan**          |
| ![](data:image/png;base64...) | _Class_        | Representasi kelas      |
| +                             | _Public_       | Akses publik            |
| -                             | _Private_      | Akses privat            |
| #                             | _Protected_    | Akses terbatas          |
| ![](data:image/png;base64...) | _Association_  | Hubungan antar kelas    |
| 1..1                          | _One-to-One_   | Relasi satu ke satu     |
| 1..\*                         | _One-to-Many_  | Relasi satu ke banyak   |
| \*..\*                        | _Many-to-Many_ | Relasi banyak ke banyak |

### Basis Data (SQLite)

Basis data merupakan kumpulan data yang terorganisir dan disimpan secara sistematis sehingga dapat diakses, dikelola, dan diperbarui dengan mudah (Usman, et al., 2025). Salah satu sistem manajemen basis data yang ringan dan banyak digunakan adalah SQLite, yaitu sistem manajemen basis data yang bersifat ringan, mandiri (_self-contained_), dan tidak memerlukan _server_ terpisah (_serverless_), karena seluruh data disimpan dalam satu file pada media penyimpanan. SQLite juga memiliki konfigurasi yang sederhana serta efisien dalam penggunaan sumber daya, sehingga cocok digunakan untuk aplikasi skala kecil hingga menengah, termasuk aplikasi berbasis web (SQLite Consortium, 2024a; SQLite Consortium, 2024b).

### Bahasa Pemrograman (Node.js)

Bahasa pemrograman merupakan alat yang digunakan untuk menuliskan instruksi agar komputer dapat menjalankan suatu fungsi tertentu. Salah satu platform yang banyak digunakan dalam pengembangan aplikasi web adalah Node.js, yaitu _runtime_ JavaScript yang berjalan di sisi server. Node.js memungkinkan pengembang untuk membangun aplikasi yang cepat dan _scalable_ dengan menggunakan model _asynchronous_ dan _event-driven_, sehingga sangat cocok untuk aplikasi _real-time_ seperti sistem berbasis web yang terintegrasi dengan berbagai layanan (Kejora & Purwanti, 2025).

### Black Box Testing

Metode black box merupakan suatu pendekatan dalam analisis atau pengujian sistem yang berfokus pada hubungan antara input dan output tanpa memperhatikan proses internal yang terjadi di dalam sistem tersebut. Dalam konteks penelitian, khususnya pada pengembangan perangkat lunak atau sistem informasi, _black box_ digunakan untuk menyederhanakan pemahaman terhadap sistem dengan hanya mengamati apakah keluaran yang dihasilkan sudah sesuai dengan masukan yang diberikan. Fungsi utama dari pendekatan ini adalah sebagai dasar dalam pengujian sistem (_black box testing_) untuk memastikan bahwa sistem telah berjalan sesuai dengan kebutuhan dan spesifikasi yang ditentukan, serta membantu dalam mengevaluasi kinerja sistem tanpa harus memahami struktur atau kode program secara mendalam. Selain itu, penggunaan metode _black box_ juga mempermudah proses dokumentasi dan perancangan sistem karena peneliti cukup mendeskripsikan fungsi dan respons sistem terhadap berbagai kondisi input yang diberikan (Hudi & Karyanti, 2023; Zen, et al., 2024).

## Penelitian Terkait

Permasalahan manajemen pembayaran di Kost Ungu yang mengandalkan proses manual mendorong perlunya solusi berbasis teknologi untuk meningkatkan efisiensi dan transparansi, mengatasi keterlambatan pembayaran, kesalahan pencatatan, dan ketiadaan arsip digital di Kost Ungu. Penelitian terdahulu menunjukkan bahwa otomatisasi notifikasi pengingat, integrasi _payment gateway_, dan pembuatan struk _invoice_ digital dapat menjadi solusi komprehensif.

Tabel 2. 5 Penelitian Terkait

|                                                                                                                                                                      |                                                                                              |                                                                                            |                                                                                                                                                                             |                                                                                                                     |                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No                                                                                                                                                                   | Judul Penelitian                                                                             | Nama Peneliti dan Tahun                                                                    | Masalah                                                                                                                                                                     | Aplikasi                                                                                                            | Ketidaksesuaian                                                                                                                                               |
| 1                                                                                                                                                                    | Implementasi Otomatisasi Tagihan Pembayaran Kos dengan _WhatsApp Gateway_                    | Az Zahraina Nur Habibah, Rina Fiati, Esti Wijayanti, JITU, Vol. 8, No. 2, November 2024    | Kesulitan dalam memanajemen data kos seperti data penghuni, pembayaran, dan administrasi, karena sistem manual rentan kesalahan dan tidak efisien.                          | PHP dan HTML, menggunakan XAMPP, editor Visual Studio Code, serta integrasi WhatsApp Gateway dan cron job.          | Tidak menggunakan sistem payment gateway dan hanya sebatas notifikasi tagihan, bukan sistem transaksi digital otomatis yang terintegrasi                      |
| [https://doi.org/10.36596/jitu.v8i2.1312 /](https://doi.org/10.36596/jitu.v8i2.1312%20/) <https://ejournal.uby.ac.id/index.php/jitu/article/view/1312>               |                                                                                              |                                                                                            |                                                                                                                                                                             |                                                                                                                     |                                                                                                                                                               |
| 2                                                                                                                                                                    | Penerapan API Midtrans sebagai _Payment gateway_ pada Indekos Berbasis Website               | Viktor Handrianus Pranatawijaya, Hendra Yulianto, JOINTECOMS, Vol. 2, No. 4, Desember 2022 | Sulitnya pencatatan pembayaran kos secara rapi dan aman; penyewa juga tidak memiliki sistem praktis untuk melakukan pembayaran digital.                                     | PHP menggunakan metode waterfall, integrasi API Midtrans sebagai payment gateway.                                   | Tidak terdapat fitur notifikasi otomatis, sistem hanya fokus pada transaksi menggunakan Midtrans saja, tidak ada sistem pengingat atau arsip digital otomatis |
| [https://doi.org/10.47111/jointecoms.v2i4.8877 /](https://doi.org/10.47111/jointecoms.v2i4.8877%20/) <https://e-journal.upr.ac.id/index.php/jcoms/article/view/8877> |                                                                                              |                                                                                            |                                                                                                                                                                             |                                                                                                                     |                                                                                                                                                               |
| 3                                                                                                                                                                    | PERANCANGAN SISTEM INFORMASI MANAJEMEN KOS BERBASIS WEB MENGGUNAKAN UUID UNTUK KEAMANAN DATA | Rahmat Hidayat, Agus Tedyyana, JATI, Vol. 10, No. 2, Maret 2026                            | Pengelolaan dan pencarian rumah kos masih dilakukan secara manual sehingga menimbulkan inefisiensi, keterbatasan akses informasi, serta risiko kesalahan dan keamanan data. | Sistem informasi berbasis web menggunakan Laravel, MySQL, dan UUID, dengan pengujian menggunakan black box testing. | Tidak terdapat integrasi payment gateway, notifikasi otomatis, maupun struk _invoice_ digital.                                                                |
| [https://doi.org/10.36040/jati.v10i2.17349 /](https://doi.org/10.36040/jati.v10i2.17349%20/) <https://www.ejournal.itn.ac.id/jati/article/view/17349>                |                                                                                              |                                                                                            |                                                                                                                                                                             |                                                                                                                     |                                                                                                                                                               |

# BAB III METODE PENELITIAN

## Teknik Pengumpulan Data

Penelitian ini menggunakan beberapa metode untuk memperoleh, metode pengumpulan data tersebut antara lain:

1. Observasi

Pengumpulan data dengan mengamati langsung proses pembayaran Kost Ungu, meliputi cara pemilik kos mencatat transaksi dan bagaimana penyewa melakukan pembayaran. Peneliti akan mencatat kendala yang sering muncul seperti keterlambatan pembayaran, kesalahan pencatatan, ataupun keluhan dari kedua belah pihak. Pengamatan ini membantu memahami kebutuhan nyata di lapangan sebelum merancang solusi digital.

1. Wawancara

Metode ini dilakukan dengan mewawancarai pemilik Kost Ungu untuk mengetahui kesulitan mereka dalam mengelola pembayaran dan fitur apa yang diinginkan dalam sistem digital. Sementara itu, penghuni kos juga ditanyai mengenai preferensi metode pembayaran dan jenis pengingat yang mereka butuhkan.

1. Studi kepustakaan

Penelitian ini melibatkan pengkajian berbagai referensi terkait sistem pembayaran digital yang sudah ada, termasuk aplikasi sewa properti dan

manajemen kos. Studi literatur membantu peneliti untuk memahami best practices yang telah berhasil diimplementasikan di tempat lain.

1. Studi dokumentasi

Metode ini melibatkan analisis terhadap catatan keuangan pada Kost Ungu, seperti pembukuan manual, struk transfer, atau kwitansi pembayaran, untuk mengidentifikasi pola pembayaran dan masalah yang sering terjadi. Data dokumentasi ini berguna untuk merancang sistem pencatatan yang lebih akurat dan meminimalisir kesalahan yang mungkin timbul dari proses manual selama ini.

## Analisis Sistem yang Berjalan

Sebelum merancang sistem baru, penting untuk menganalisis sistem yang berjalan untuk memahami kelemahan, tantangan, dan kebutuhan yang ada. Dengan analisis yang mendalam, pengembangan sistem baru akan lebih terarah, efektif, dan sesuai kebutuhan pengguna.

Berdasarkan hasil observasi yang telah dilakukan pada Kost Ungu, sistem operasional kos yang berjalan saat ini masih bersifat manual dan belum terintegrasi dalam suatu sistem informasi. Analisis ini mengacu pada tiga proses utama, yaitu proses pendaftaran dan pengelolaan kamar, proses pembayaran, serta proses penanganan komplain.

![](data:image/png;base64...)

Gambar 3. 1 Flowchart Pendaftaran

Proses pendaftaran dimulai ketika calon penghuni datang untuk menyewa kamar, kemudian pengelola mencatat data penghuni secara manual dan mengecek ketersediaan kamar. Jika kamar tersedia, penghuni langsung menempati kamar yang ditentukan, sedangkan jika tidak tersedia, penghuni harus mencari alternatif kos lain. Proses ini masih memiliki kelemahan karena pencatatan dilakukan secara manual sehingga berisiko terjadi kesalahan data dan informasi ketersediaan kamar tidak diperbarui secara real-time.

![](data:image/png;base64...)

Gambar 3. 2 Flowchart Pembayaran

Proses pembayaran dimulai ketika penghuni memasuki jatuh tempo pembayaran sewa. Penghuni kemudian melakukan pembayaran baik secara langsung maupun melalui transfer dan selanjutnya memberikan konfirmasi kepada pengelola. Setelah itu, pengelola memeriksa pembayaran yang dilakukan dan mencatat transaksi secara manual ke dalam buku. Apabila penghuni belum melakukan pembayaran, maka pengelola akan mengingatkan secara langsung melalui komunikasi lisan kepada penghuni. Proses ini masih memiliki kelemahan karena tidak adanya sistem otomatisasi maupun pencatatan digital, sehingga berpotensi menyebabkan keterlambatan pembayaran, kesalahan pencatatan, serta tidak terdokumentasinya proses pengingat yang dilakukan.

![](data:image/png;base64...)

Gambar 3. 3 Flowchart Komplain

Proses komplain terjadi ketika penghuni menyampaikan keluhan baik melalui pesan pribadi maupun secara langsung kepada pengelola. Selanjutnya, pengelola menerima komplain tersebut, mencatat atau mengingatnya secara manual, dan kemudian menindaklanjuti sesuai kebutuhan. Karena tidak adanya sistem pencatatan yang terstruktur, komplain sering kali tidak terdokumentasi dengan baik, sulit dilacak status penyelesaiannya, serta berpotensi terabaikan atau terlambat ditangani.

## Analisis Kebutuhan Sistem

Berdasarkan analisis sistem berjalan, maka diperlukan suatu sistem manajemen kos berbasis digital yang mampu mengatasi permasalahan yang ada melalui integrasi chatbot, payment gateway, dan notifikasi otomatis. Kebutuhan sistem ini dibagi menjadi kebutuhan fungsional dan non-fungsional.

### Kebutuhan Fungsional

Kebutuhan fungsional merupakan layanan atau fitur yang harus disediakan oleh sistem agar dapat memenuhi kebutuhan pengguna.

Tabel 3. 1 Kebutuhan Fungsional

|                         |                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fitur**               | **Deskripsi**                                                                                                                                                 |
| Modul Login/Autentikasi | Admin, staff, dan owner dapat login sesuai hak akses, sedangkan penghuni melakukan verifikasi melalui _chatbot_.                                              |
| Manajemen Data Pengguna | Admin dapat mengelola data pengguna seperti admin, staff, dan owner.                                                                                          |
| Manajemen Data Kos      | Staff dapat mengelola data kamar, penghuni, dan penyewaan.                                                                                                    |
| Pengelolaan Pembayaran  | Sistem membuat tagihan, memproses pembayaran melalui _payment gateway_, dan memperbarui status pembayaran otomatis.                                           |
| Notifikasi Pembayaran   | Sistem mengirim pengingat pembayaran secara otomatis kepada penghuni.                                                                                         |
| Layanan _Chatbot_       | Penghuni dapat cek tagihan, melihat riwayat pembayaran, melakukan pembayaran, dan mengajukan komplain melalui _chatbot_.                                      |
| Pengelolaan Komplain    | Staff menerima dan menindaklanjuti komplain dari penghuni.                                                                                                    |
| Keluaran                | Owner dapat melihat laporan transaksi dan komplain secara real-time. Sementara penghuni mendapatkan bukti pembayaran digital yang bisa diakses secara online. |

### Kebutuhan Non-Fungsional

Kebutuhan non-fungsional merupakan aspek kualitas sistem yang harus dipenuhi.

Tabel 3. 2 Kebutuhan Non-Fungsional

|                              |                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategori**                 | **Deskripsi**                                                                                                                         |
| Perangkat Keras (_Hardware_) | Perangkat minimal menggunakan prosesor Intel Core i3 atau setara, RAM 8 GB, dan penyimpanan minimal 500 GB.                           |
| Perangkat Lunak (_Software_) | Sistem menggunakan Node.js sebagai _backend runtime_, serta dijalankan pada sistem operasi Windows/Linux.                             |
| Keamanan                     | Sistem hanya dapat diakses melalui proses login dengan autentikasi _username_ dan _password_.                                         |
| _Usability_                  | Antarmuka sistem harus _user-friendly_ dan mudah digunakan oleh admin, staff, dan owner, serta chatbot mudah digunakan oleh penghuni. |
| Audit                        | Sistem harus menyimpan setiap interaksi pengguna dengan sistem dan interaksi penghuni dengan _chatbot_.                               |

## Rancangan Model Sistem

Rancangan model sistem pada penelitian ini digunakan untuk menggambarkan alur kerja sistem serta hubungan antara komponen yang terlibat dalam sistem manajemen kos yang diusulkan. Model sistem ini bertujuan untuk memberikan gambaran secara menyeluruh mengenai proses yang terjadi, baik dari sisi pengguna maupun sistem, sehingga memudahkan dalam tahap implementasi.

### ContextDiagram

_Context diagram_ (DFD Level 0) merupakan diagram tingkat tinggi (_high-level_) yang digunakan untuk menggambarkan sistem sebagai satu kesatuan proses tunggal yang berinteraksi dengan entitas eksternal, diagram ini berfungsi untuk menunjukkan aliran data masuk dan keluar dari sistem. Pada sistem manajemen kos, _context diagram_ menunjukkan bagaimana admin, staff, owner, dan penghuni berinteraksi dengan sistem, serta jenis data apa saja yang dipertukarkan, termasuk penggunaan _chatbot_ sebagai media komunikasi utama bagi penghuni.

![](data:image/png;base64...)

Gambar 3. 4 Diagram Konteks

_Context diagram_ menggambarkan sistem sebagai satu kesatuan yang berinteraksi dengan entitas eksternal tanpa menampilkan detail proses internal. Dalam diagram ini, sistem manajemen kos dengan chatbot diposisikan sebagai pusat yang menerima input dan menghasilkan output kepada empat entitas utama, yaitu admin, staff, owner, dan penghuni.

Admin berinteraksi dengan sistem dalam konteks pengelolaan akun, di mana data yang diberikan berupa instruksi pengelolaan pengguna dan sistem mengembalikan informasi akun sebagai hasilnya. Staff berinteraksi dengan sistem dalam lingkup operasional, seperti pengelolaan kamar dan penghuni, serta menerima data operasional sebagai keluaran. Owner menggunakan sistem untuk memperoleh informasi strategis berupa laporan transaksi dan data komplain, tanpa melakukan manipulasi data secara langsung. Sementara itu, penghuni berinteraksi melalui chatbot dengan mengirimkan perintah tertentu dan menerima respons otomatis dari sistem.

### Use Case Diagram

_Use case diagram_ merupakan salah satu jenis diagram dalam UML (_Unified Modeling Language_) yang digunakan untuk menggambarkan interaksi antara aktor dengan sistem. Diagram ini berfokus pada apa saja fungsi atau layanan yang disediakan oleh sistem dari sudut pandang pengguna, tanpa menjelaskan bagaimana proses tersebut dijalankan secara teknis. Dalam konteks sistem manajemen kos, diagram ini berperan penting untuk memperjelas pembagian peran antara admin, staff, owner, dan penghuni, serta bagaimana mereka berinteraksi dengan sistem, terutama melalui _chatbot_.

![](data:image/png;base64...)

Gambar 3. 5 Diagram Use Case

_Use case diagram_ pada sistem ini menggambarkan interaksi antara aktor eksternal dengan sistem manajemen kos yang terintegrasi dengan layanan chatbot. Diagram ini menunjukkan bagaimana setiap aktor memanfaatkan fitur sistem sesuai dengan peran dan kebutuhan masing-masing. Secara umum, sistem menyediakan dua jalur interaksi utama, yaitu melalui antarmuka internal (untuk admin, staff, dan owner) serta melalui _chatbot_ (untuk penghuni). Aktor yang terlibat dalam sistem terdiri dari empat peran utama, yaitu:

- Admin: Bertanggung jawab terhadap pengelolaan akun pengguna dalam sistem.
- Staff: Menangani operasional harian seperti pengelolaan kamar, penghuni, pengingat, dan komplain.
- Owner: Berfokus pada pemantauan melalui laporan transaksi dan komplain tanpa terlibat langsung dalam operasional.
- Penghuni: berinteraksi dengan sistem melalui _chatbot_ untuk mengakses layanan seperti cek tagihan, pembayaran, riwayat transaksi, dan pengajuan komplain.

Setiap aktivitas utama dalam sistem, khususnya yang dilakukan oleh admin, staff, dan owner, memiliki keterkaitan (_include_) dengan proses verifikasi akun, yang berarti sebelum mengakses fitur tersebut pengguna diharuskan melalui proses autentikasi terlebih dahulu. Di sisi lain, aktivitas penghuni seperti mengajukan komplain, mengecek tagihan, melihat riwayat pembayaran, menerima pengingat, dan melakukan pembayaran merupakan perluasan (_extends_) dari use case utama interaksi dengan _chatbot_. Dengan demikian, _chatbot_ berperan sebagai pusat layanan bagi penghuni, sementara sistem menangani logika dan pengolahan data.

### Activity Diagram

_Activity diagram_ merupakan diagram UML yang digunakan untuk menggambarkan alur aktivitas atau proses bisnis dalam suatu sistem. Diagram ini menunjukkan urutan langkah-langkah yang dilakukan dari awal hingga akhir, termasuk percabangan keputusan, proses paralel, serta interaksi antar aktor atau komponen sistem. Dalam sistem manajemen kos, _activity diagram_ digunakan untuk menggambarkan proses seperti verifikasi akun, pengelolaan data, pembayaran, hingga pengiriman notifikasi, sehingga alur operasional sistem dapat dipahami secara menyeluruh.

1. Activity Diagram Verifikasi Akun

![](data:image/png;base64...)

Gambar 3. 6 Diagram Activity Verifikasi Akun

Proses verifikasi akun dimulai ketika pengguna memasukkan _username_ dan _password_ ke dalam sistem. Setelah itu, sistem melakukan validasi awal terhadap input yang diberikan. Selanjutnya, data kredensial tersebut diperiksa ke basis data untuk memastikan kecocokan. Jika hasil validasi menunjukkan bahwa data benar, maka sistem memberikan akses kepada pengguna dan pengguna diarahkan masuk ke dashboard. Sebaliknya, apabila data tidak valid, sistem akan menampilkan pesan kesalahan kepada pengguna dan proses berakhir.

1. Activity Diagram Manajemen Akun

![](data:image/png;base64...)

Gambar 3. 7 Diagram Activity Manajemen Akun

Proses manajemen akun diawali oleh admin dengan memilih menu manajemen akun. Admin kemudian dapat melakukan operasi seperti menambah, mengubah, atau menghapus akun. Setelah itu, sistem melakukan verifikasi terhadap hak akses admin. Jika otorisasi valid, sistem akan meneruskan proses ke basis data untuk memproses perubahan data pengguna. Setelah berhasil, sistem memberikan konfirmasi keberhasilan, dan admin menerima notifikasi sebagai hasil akhir dari proses.

1. Activity Diagram Manajemen Kamar

![](data:image/png;base64...)

Gambar 3. 8 Diagram Activity Manajemen Kamar

Proses manajemen kamar dimulai ketika staf melakukan pengelolaan data kamar. Data yang dimasukkan kemudian divalidasi oleh sistem untuk memastikan kelengkapan dan kebenaran. Setelah valid, sistem mengirimkan data ke basis data untuk memperbarui informasi atau status kamar. Sistem kemudian menampilkan hasil pembaruan, dan staf dapat melihat daftar kamar yang telah diperbarui.

1. Activity Diagram Manajemen Penghuni

![](data:image/png;base64...)

Gambar 3. 9 Diagram Activity Manajemen Penghuni

Proses manajemen penghuni dimulai dengan staf memasukkan data penghuni beserta informasi kontrak sewa. Sistem kemudian memvalidasi keterkaitan antara penghuni dan kamar yang dipilih. Jika valid, data disimpan ke dalam basis data, mencakup informasi penghuni dan detail sewa. Sistem selanjutnya memberikan konfirmasi bahwa pendaftaran berhasil, dan staf dapat melihat data penghuni baru yang telah ditambahkan ke dalam daftar.

1. Activity Diagram Lihat Laporan Transaksi

![](data:image/png;base64...)

Gambar 3. 10 Diagram Activity Lihat Laporan Transaksi

Proses lihat laporan transaksi dimulai ketika staf atau pemilik memilih rentang waktu laporan yang diinginkan. Sistem kemudian memfilter data transaksi berdasarkan rentang tersebut. Selanjutnya, sistem mengambil data tagihan dari basis data. Data tersebut kemudian diolah untuk menghitung total dan menghasilkan laporan. Hasil laporan kemudian ditampilkan kepada staf atau pemilik.

1. Activity Diagram Manajemen Pengingat

![](data:image/png;base64...)

Gambar 3. 11 Diagram Activity Manajemen Pengingat

Staf dapat melihat daftar pengingat yang pernah terkirim melalui sistem. Sistem akan mengambil informasi riwayat dari penyimpanan data dan memberikan tampilan daftar notifikasi kepada staf. Jika diinginkan, staf bisa menekan tombol pengiriman pengingat secara manual. Setelah itu, sistem akan segera mengirimkan pesan lewat chatbot dan mencatat riwayat pengiriman baru tersebut agar daftar riwayat selalu terbarui.

1. Activity Diagram Lihat Komplain

![](data:image/png;base64...)

Gambar 3. 12 Diagram Activity Lihat Daftar Komplain

Proses lihat daftar komplain dimulai ketika staf atau pemilik melihat daftar komplain yang tersedia. Sistem menampilkan laporan kerusakan yang telah diajukan oleh penghuni. Staf kemudian melakukan pembaruan status penanganan terhadap komplain tersebut. Sistem selanjutnya mengirimkan pemberitahuan kepada penghuni terkait perkembangan penanganan. Terakhir, basis data diperbarui, khususnya pada kolom yang menunjukkan pihak yang menyelesaikan komplain.

1. Activity Diagram Interaksi Chatbot

![](data:image/png;base64...)

Gambar 3. 13 Diagram Activity Interaksi Chatbot

Proses interaksi _chatbot_ dimulai saat penghuni berinteraksi dengan chatbot. Sistem terlebih dahulu memverifikasi nomor pengguna untuk memastikan identitas. Setelah itu, pesan yang dikirim disimpan ke dalam basis data sebagai log. Sistem kemudian memberikan respons sesuai dengan perintah atau pesan yang diterima. Penghuni akhirnya menerima balasan dari sistem.

1. Activity Diagram Pembayaran

![](data:image/png;base64...)

Gambar 3. 14 Diagram Activity Pembayaran

Proses pembayaran dimulai ketika penghuni melakukan pembayaran melalui tautan pembayaran yang tersedia. Payment gateway kemudian memproses transaksi tersebut. Setelah transaksi berhasil, sistem menerima notifikasi callback sebagai tanda keberhasilan. Selanjutnya, sistem memperbarui status invoice di basis data menjadi “PAID”. Penghuni kemudian menerima bukti pembayaran atau kuitansi sebagai konfirmasi pelunasan.

1. Activity Diagram Terima Pengingat Tagihan

![](data:image/png;base64...)

Gambar 3. 15 Diagram Activity Terima Pengingat Tagihan

Proses terima pengingat tagihan dimulai oleh cron yang secara otomatis memicu pengingat harian. Sistem kemudian memeriksa invoice yang telah jatuh tempo. Data tagihan dan informasi penghuni diambil dari basis data. Sistem kemudian mengirimkan notifikasi berupa pesan pengingat kepada penghuni. Penghuni akhirnya menerima pesan tersebut sebagai pengingat pembayaran.

1. Activity Diagram Lihat Riwayat Pembayaran

![](data:image/png;base64...)

Gambar 3. 16 Diagram Activity Lihat Riwayat Pembayaran

Proses lihat riwayat pembayaran dimulai ketika penghuni mengirimkan perintah untuk melihat riwayat pembayaran. Sistem kemudian memeriksa data riwayat pembayaran yang tersedia. Basis data mengembalikan data _invoice_ dengan status “PAID”. Sistem menyusun daftar riwayat pembayaran secara terstruktur, dan hasilnya dikirimkan kepada penghuni untuk ditampilkan.

1. Activity Diagram Cek Tagihan

![](data:image/png;base64...)

Gambar 3. 17 Diagram Activity Cek Tagihan

Proses cek tagihan dimulai saat penghuni mengirimkan perintah untuk mengecek tagihan. Sistem kemudian memeriksa tagihan yang masih aktif. Data _invoice_ dengan status “UNPAID” diambil dari basis data. Sistem kemudian merangkum informasi tagihan tersebut, dan hasilnya dikirimkan kepada penghuni sebagai informasi tagihan terkini.

1. Activity Diagram Ajukan Komplain

![](data:image/png;base64...)

Gambar 3. 18 Diagram Activity Ajukan Komplain

Proses pengajuan komplain dimulai ketika penghuni mengirimkan perintah untuk mengajukan komplain, kemudian dilanjutkan dengan memasukkan detail kerusakan. Sistem melakukan validasi terhadap data yang diberikan. Jika valid, data komplain disimpan sebagai _record_ baru di basis data. Sistem kemudian memberikan umpan balik bahwa komplain telah diterima, dan penghuni menerima nomor laporan atau ID komplain sebagai referensi.

### Sequence Diagram

_Sequence diagram_ merupakan diagram UML yang digunakan untuk menggambarkan interaksi antar objek dalam sistem berdasarkan urutan waktu. Diagram ini menampilkan bagaimana pesan atau komunikasi dikirimkan dari satu objek ke objek lain secara berurutan untuk menjalankan suatu fungsi tertentu. Pada sistem manajemen kos, digunakan untuk menggambarkan interaksi antara pengguna, sistem, basis data, dan layanan eksternal seperti _payment gateway_ atau _chatbot_, sehingga alur komunikasi data dapat divisualisasikan dengan lebih rinci dan sistematis.

1. Sequence Diagram Verifikasi Akun

![](data:image/png;base64...)

Gambar 3. 19 Diagram Sequence Verifikasi Akun

Proses verifikasi akun dimulai ketika pengguna memasukkan _username_ dan _password_ ke dalam sistem. Sistem kemudian mengirimkan permintaan ke basis data untuk melakukan validasi kredensial. Basis data mengembalikan data pengguna yang sesuai. Setelah itu, sistem melakukan verifikasi _password_ secara internal. Jika _password_ cocok, sistem memperbarui log terakhis diakses ke basis data dan mengarahkan pengguna ke _dashboard_ utama. Namun, jika _password_ tidak sesuai, sistem langsung mengirimkan pesan kesalahan kepada pengguna.

1. Sequence Diagram Manajemen Akun

![](data:image/png;base64...)

Gambar 3. 20 Diagram Sequence Manajemen Akun

Proses manajemen akun dimulai saat admin mengakses fitur manajemen akun. Sistem kemudian meminta daftar akun ke basis data, dan basis data mengembalikan data tersebut untuk ditampilkan kepada admin. Setelah itu, admin melakukan perubahan seperti menambah atau menghapus akun. Sistem melakukan validasi terhadap input yang diberikan, kemudian mengirimkan perintah ke basis data untuk menyimpan atau menghapus data pengguna. Setelah proses berhasil, sistem memberikan notifikasi sukses kepada admin.

1. Sequence Diagram Manajemen Kamar

![](data:image/png;base64...)

Gambar 3. 21 Diagram Sequence Manajemen Kamar

Proses manajemen kamar diawali oleh staf yang mengakses data kamar melalui sistem. Sistem kemudian melakukan _query_ ke basis data untuk mengambil daftar kamar, dan hasilnya dikirim kembali ke sistem untuk ditampilkan kepada staf. Selanjutnya, staf melakukan pembaruan terhadap informasi atau status kamar. Sistem menyimpan perubahan tersebut ke basis data, dan setelah berhasil, sistem memberikan notifikasi kepada staf bahwa proses telah selesai.

1. Sequence Diagram Manajemen Penghuni

![](data:image/png;base64...)

Gambar 3. 22 Diagram Sequence Manajemen Penghuni

Proses manajemen penghuni dimulai ketika staf melakukan registrasi penghuni baru. Sistem terlebih dahulu memeriksa ketersediaan kamar dengan mengirimkan permintaan ke basis data. Basis data mengembalikan informasi apakah kamar tersedia atau tidak. Jika kamar tersedia, sistem menyimpan data penghuni dan kontrak sewa ke basis data, lalu memberikan konfirmasi keberhasilan kepada staf. Jika kamar penuh, sistem memberikan peringatan kepada staf bahwa kamar tidak tersedia.

1. Sequence Diagram Lihat Laporan Transaksi

![](data:image/png;base64...)

Gambar 3. 23 Diagram Sequence Lihat Laporan Transaksi

Proses lihat laporan transaksi dimulai saat pengelola (staf atau pemilik) meminta laporan keuangan. Sistem kemudian mengambil data transaksi dari basis data yang mencakup invoice dan data sewa. Setelah data diterima, sistem melakukan perhitungan total pemasukan secara internal. Hasil perhitungan tersebut kemudian disajikan dalam bentuk tabel atau grafik kepada pengelola.

1. Sequence Diagram Manajemen Pengingat

![](data:image/png;base64...)

Gambar 3. 24 Diagram Sequence Manajemen Pengingat

Proses manajemen pengingat diawali saat staf meminta data riwayat pengingat kepada sistem. Sistem kemudian melakukan pencarian data di dalam sistem penyimpanan dan menampilkannya kembali kepada staf. Staf selanjutnya memberikan instruksi untuk melakukan pengiriman pengingat secara manual. Sistem akan meneruskan permintaan tersebut melalui _chatbot_ dan mencatat bukti pengiriman baru di dalam sistem penyimpanan, lalu memberikan konfirmasi akhir kepada staf.

1. Sequence Diagram Lihat Komplain

![](data:image/png;base64...)

Gambar 3. 25 Diagram Sequence Lihat Komplain

Proses lihat komplain dimulai ketika pengelola membuka modul komplain. Sistem mengambil daftar komplain dari basis data dan menampilkannya kepada pengelola. Jika pengelola bertindak sebagai staf yang menangani komplain, maka staf dapat memperbarui status komplain menjadi selesai. Sistem kemudian menyimpan informasi penanganan dan penanggung jawab ke basis data. Setelah berhasil, sistem memberikan konfirmasi kepada pengelola.

1. Sequence Diagram Interaksi Chatbot

![](data:image/png;base64...)

Gambar 3. 26 Diagram Sequence Interaksi Chatbot

Proses interaksi _chatbot_ dimulai saat penghuni mengirimkan pesan melalui chatbot. Sistem melakukan verifikasi nomor telepon ke basis data untuk memastikan identitas pengguna. Jika nomor valid, sistem menyimpan log interaksi dan mengidentifikasi kategori perintah yang diberikan. Setelah itu, sistem mengirimkan respons yang sesuai kepada penghuni. Jika nomor tidak dikenali, sistem langsung mengirimkan pesan penolakan.

1. Sequence Diagram Pembayaran

![](data:image/png;base64...)

Gambar 3. 27 Diagram Sequence Pembayaran

Proses pembayaran dimulai ketika penghuni memilih untuk membayar tagihan. Sistem mengirimkan permintaan ke _payment gateway_ untuk membuat _invoice_. _Payment gateway_ kemudian mengembalikan kode atau tautan pembayaran yang ditampilkan kepada penghuni. Setelah penghuni melakukan pembayaran, _payment gateway_ mengirimkan notifikasi (_callback_) ke sistem. Sistem kemudian memperbarui status _invoice_ menjadi “PAID” di basis data dan mengirimkan notifikasi pelunasan kepada penghuni.

1. Sequence Diagram Terima Pengingat Tagihan

![](data:image/png;base64...)

Gambar 3. 28 Diagram Sequence Terima Pengingat Tagihan

Proses terima pengingat tagihan dimulai oleh mesin penjadwal (cron) yang memicu sistem secara harian. Sistem kemudian meminta data tagihan yang mendekati jatuh tempo ke basis data. Setelah data diterima, sistem menyusun pesan pengingat secara otomatis. Pesan tersebut kemudian dikirimkan kepada penghuni melalui media komunikasi WhatsApp.

1. Sequence Diagram Lihat Riwayat Pembayaran

![](data:image/png;base64...)

Gambar 3. 29 Diagram Sequence Lihat Riwayat Pembayaran

Proses lihat riwayat pembayaran dimulai ketika penghuni meminta riwayat pembayaran. Sistem mengirimkan permintaan ke basis data untuk mengambil data _invoice_ dengan status sudah dibayar. Setelah data diterima, sistem memformat daftar riwayat pembayaran agar mudah dibaca. Hasilnya kemudian dikirimkan kembali kepada penghuni.

1. Sequence Diagram Cek Tagihan

![](data:image/png;base64...)

Gambar 3. 30 Diagram Sequence Lihat Tagihan

Proses cek tagihan dimulai saat penghuni meminta informasi tagihan aktif. Sistem mengambil data _invoice_ dengan status belum dibayar dari basis data. Setelah data diterima, sistem menghitung total tagihan secara keseluruhan. Informasi tersebut kemudian dikirimkan kepada penghuni dalam bentuk rincian tagihan beserta batas waktu pembayaran.

1. Sequence Diagram Ajukan Komplain

![](data:image/png;base64...)

Gambar 3. 31 Diagram Sequence Ajukan Komplain

Proses pengajuan komplain dimulai ketika penghuni mengirimkan laporan komplain ke sistem. Sistem terlebih dahulu melakukan validasi terhadap kelengkapan isi laporan. Setelah valid, sistem menyimpan data komplain ke dalam basis data. Basis data mengembalikan status sukses beserta ID komplain. Sistem kemudian mengirimkan konfirmasi kepada penghuni bahwa laporan telah diterima.

### Class Diagram

_Class diagram_ merupakan diagram UML yang digunakan untuk menggambarkan struktur statis dari sistem, termasuk kelas-kelas yang ada, atribut yang dimiliki, serta hubungan antar kelas. Diagram ini berfokus pada bagaimana data dan objek dalam sistem diorganisasikan. Dalam sistem manajemen kos, _class diagram_ berfungsi untuk memodelkan entitas seperti pengguna, penghuni, kamar, sewa, tagihan, notifikasi, dan komplain, sehingga seluruh proses bisnis dapat direpresentasikan secara terstruktur dan saling terhubung.

![](data:image/png;base64...)

Gambar 3. 32 Diagram Class

_Class diagram_ pada sistem ini menggambarkan struktur data serta hubungan antar entitas yang membentuk keseluruhan sistem manajemen kos. Setiap kelas merepresentasikan objek nyata dalam sistem, seperti pengguna, penghuni, kamar, transaksi, hingga komunikasi melalui _chatbot_. Diagram ini juga menunjukkan bagaimana data saling terhubung untuk mendukung proses bisnis yang ada.

Relasi antar kelas menunjukkan keterkaitan yang erat dalam sistem, seperti tenant yang dapat memiliki banyak lease dan komplain, _lease_ yang menghasilkan _invoice_, serta _invoice_ yang memicu notifikasi. Struktur ini dirancang untuk memastikan integritas data dan mendukung alur proses bisnis secara menyeluruh, mulai dari penyewaan kamar hingga penyelesaian komplain dan pembayaran.

## Rancangan Basis Data

Rancangan basis data merupakan tahap perancangan yang bertujuan untuk mendefinisikan struktur penyimpanan data yang akan digunakan oleh sistem. Pada sistem manajemen kos ini, rancangan basis data disusun untuk mendukung seluruh proses bisnis yang telah dianalisis sebelumnya, mulai dari pengelolaan pengguna, operasional kos, transaksi pembayaran, hingga interaksi melalui chatbot.

### Rancangan Tabel

Rancangan tabel pada sistem manajemen kos ini disusun berdasarkan hasil analisis dan perancangan yang telah dilakukan pada diagram sebelumnya, yaitu _context diagram_, _use case diagram_, _activity diagram_, _sequence diagram_, dan _class diagram_. Setiap tabel yang dibentuk merupakan representasi langsung dari entitas dan relasi yang telah diidentifikasi pada _class diagram_, serta mendukung alur proses bisnis yang tergambar dalam _activity diagram_ dan _sequence diagram_.

1. Tabel users

Tabel users digunakan untuk menyimpan data autentikasi pengguna sistem, yang mencakup admin, staff, owner, serta sistem otomatis seperti cron. Keberadaan tabel ini berkaitan langsung dengan proses verifikasi akun pada activity dan sequence diagram, di mana sistem melakukan validasi kredensial sebelum memberikan akses ke fitur tertentu.

Tabel 3. 3 Rancangan Tabel users

|                |                  |                                     |
| -------------- | ---------------- | ----------------------------------- |
| Nama Kolom     | Tipe Data        | Keterangan                          |
| id             | INTEGER (PK, AI) | ID pengguna.                        |
| username       | TEXT (Unique)    | Nama pengguna untuk masuk sistem.   |
| password\_hash | TEXT             | Kata sandi akun.                    |
| role           | TEXT             | Role akun (admin/staff/owner/cron). |
| last\_accessed | TIMESTAMP        | Kapan terakhir kali akun diakses.   |

Atribut seperti username, password\_hash, dan role memungkinkan sistem untuk mengatur hak akses sesuai dengan peran pengguna, sebagaimana dijelaskan pada _use case diagram_. Kolom last\_accessed digunakan untuk mencatat aktivitas terakhir pengguna sebagai bagian dari monitoring sistem.

1. Tabel tenants

Tabel tenants berfungsi sebagai pusat penyimpanan data penghuni kos. Data ini menjadi dasar bagi berbagai proses dalam sistem, seperti penyewaan kamar, pengiriman notifikasi, serta interaksi melalui _chatbot_.

Tabel 3. 4 Rancangan Tabel tenants

|                |                  |                                   |
| -------------- | ---------------- | --------------------------------- |
| Nama Kolom     | Tipe Data        | Keterangan                        |
| id             | INTEGER (PK, AI) | ID penghuni.                      |
| full\_name     | TEXT             | Nama lengkap penghuni.            |
| phone\_number  | TEXT (Unique)    | Nomor kontak untuk obrolan bot.   |
| origin\_region | TEXT NULL        | Daerah kediaman asal penghuni.    |
| created\_at    | TIMESTAMP        | Waktu pertama kali didata sistem. |

Kolom phone\_number memiliki peran penting karena digunakan sebagai identitas dalam komunikasi _chatbot_, sesuai dengan proses pada _sequence diagram_ interaksi _chatbot_. Tabel ini juga terhubung dengan banyak tabel lain, seperti leases, chatbot\_messages, notifications, dan complaints, sehingga menjadi salah satu entitas inti dalam sistem.

1. Tabel rooms

Tabel rooms menyimpan informasi terkait kamar yang tersedia dalam sistem. Data ini digunakan dalam proses manajemen kamar oleh staff, sebagaimana terlihat pada _activity diagram_ dan _sequence diagram_.

Tabel 3. 5 Rancangan Tabel rooms

|                |                  |                                           |
| -------------- | ---------------- | ----------------------------------------- |
| Nama Kolom     | Tipe Data        | Keterangan                                |
| id             | INTEGER (PK, AI) | ID kamar.                                 |
| room\_number   | TEXT (Unique)    | Nomor di pintu kamar.                     |
| room\_type     | TEXT NULL        | Jenis kamar.                              |
| monthly\_price | INTEGER          | Harga sewa setiap bulannya.               |
| is\_active     | BOOLEAN          | Penentu apakah kamar tersedia atau tidak. |

Kolom is\_active berfungsi untuk menunjukkan ketersediaan kamar, yang kemudian digunakan dalam proses validasi saat melakukan penyewaan (_lease_). Tabel ini berelasi dengan tabel leases, yang menghubungkan kamar dengan penghuni.

1. Tabel leases

Tabel leases merupakan penghubung antara penghuni (tabel tenants) dan kamar (tabel rooms). Tabel ini merepresentasikan proses penyewaan yang menjadi inti dari sistem manajemen kos.

Tabel 3. 6 Rancangan Tabel leases

|             |                  |                                                   |
| ----------- | ---------------- | ------------------------------------------------- |
| Nama Kolom  | Tipe Data        | Keterangan                                        |
| id          | INTEGER (PK, AI) | ID kontrak penyewaan.                             |
| tenant\_id  | INTEGER (FK)     | Penghuni yang menyewa kamarnya.                   |
| room\_id    | INTEGER (FK)     | Kamar mana yang mereka tempati.                   |
| start\_date | TIMESTAMP        | Tanggal mulainya sewa ini resmi dihitung.         |
| end\_date   | TIMESTAMP        | Tanggal berakhirnya masa penyewaan.               |
| is\_active  | BOOLEAN          | Penanda apakah penyewa ini masih tinggal di sana. |

Kolom seperti start\_date, end\_date, dan is\_active memungkinkan sistem untuk melacak masa sewa secara akurat. Keberadaan tabel ini sangat berkaitan dengan proses pada _activity diagram_ manajemen penghuni, di mana sistem harus memastikan ketersediaan kamar sebelum menyimpan data sewa.

1. Tabel invoices

Tabel invoices digunakan untuk mencatat seluruh tagihan yang dihasilkan dari proses penyewaan. Setiap data _invoice_ terhubung dengan satu data _lease_, sesuai dengan relasi pada _class diagram_.

Tabel 3. 7 Rancangan Tabel invoices

|                   |                  |                                               |
| ----------------- | ---------------- | --------------------------------------------- |
| Nama Kolom        | Tipe Data        | Keterangan                                    |
| id                | INTEGER (PK, AI) | ID lembar tagihan.                            |
| lease\_id         | INTEGER (FK)     | Data sewa yang sedang ditagihkan ke penghuni. |
| amount            | INTEGER          | Nominal uang yang wajib dibayar.              |
| due\_date         | TIMESTAMP        | Tanggal batas akhir setor uang.               |
| duitku\_reference | TEXT NULL        | Kode resi payment gateway (DUITKU).           |
| callback\_payload | TEXT NULL        | Payload raw hasil callback payment gateway.   |
| status            | TEXT             | Status pelunasan.                             |

Kolom seperti due\_date, status, dan duitku\_reference mendukung proses pembayaran yang tergambar pada _sequence diagram_ pembayaran. Selain itu, kolom callback\_payload digunakan untuk menyimpan data hasil _callback_ dari _payment gateway_, yang menunjukkan bahwa sistem terintegrasi dengan layanan eksternal.

1. Tabel chatbot\_messages

Tabel chatbot\_messages menyimpan riwayat komunikasi antara penghuni dan sistem melalui _chatbot_. Data ini digunakan untuk mencatat seluruh interaksi yang terjadi, baik pesan masuk maupun keluar.

Tabel 3. 8 Rancangan Tabel chatbot\_messages

|            |                  |                                       |
| ---------- | ---------------- | ------------------------------------- |
| Nama Kolom | Tipe Data        | Keterangan                            |
| id         | INTEGER (PK, AI) | ID log pesan berjalan.                |
| tenant\_id | INTEGER (FK)     | Penghuni yang sedang memakai chatbot. |
| direction  | TEXT             | Konteks pesan dikirim/diterima.       |
| message    | TEXT             | Isi tulisan pesannya.                 |
| sent\_at   | TIMESTAMP        | Waktu kapan pesan dikirim.            |

Tabel ini berkaitan langsung dengan _activity_ dan _sequence diagram_ interaksi _chatbot_, di mana setiap pesan yang dikirim akan disimpan sebagai log. Informasi ini dapat digunakan untuk analisis maupun pelacakan aktivitas pengguna.

1. Tabel notifications

Tabel notifications digunakan untuk mencatat seluruh notifikasi yang dikirimkan kepada penghuni, terutama yang berkaitan dengan tagihan.

Tabel 3. 9 Rancangan Tabel Notifications

|                      |                  |                                    |
| -------------------- | ---------------- | ---------------------------------- |
| Nama Kolom           | Tipe Data        | Keterangan                         |
| id                   | INTEGER (PK, AI) | ID pesan pemberitahuan.            |
| tenant\_id           | INTEGER (FK)     | Penghuni yang dikirimi notifikasi. |
| invoice\_id          | INTEGER (FK)     | Tagihan yang terkait.              |
| chatbot\_message\_id | INTEGER (FK)     | Pesan yang dikirimkan.             |
| type                 | TEXT             | Konteks pengingat.                 |
| status               | TEXT             | Status pengiriman notifikasi.      |

Relasi antara notifications, invoices, dan chatbot\_messages menunjukkan alur proses pengingat tagihan yang tergambar pada _activity_ dan _sequence diagram_ manajemen pengingat. Kolom type dan status memungkinkan sistem untuk mengelola jenis dan keberhasilan pengiriman notifikasi.

1. Tabel audit\_logs

Tabel audit\_logs berfungsi untuk mencatat setiap aktivitas perubahan data dalam sistem. Tabel ini penting untuk menjaga keamanan dan transparansi, terutama dalam sistem yang melibatkan banyak pengguna.

Tabel 3. 10 Rancangan Tabel audit\_logs

|             |                  |                                       |
| ----------- | ---------------- | ------------------------------------- |
| Nama Kolom  | Tipe Data        | Keterangan                            |
| id          | INTEGER (PK, AI) | ID rekam jejak perubahan sistem.      |
| user\_id    | INTEGER (FK)     | Pengguna yang mengubah datanya.       |
| action      | TEXT             | Aksi perubahannya.                    |
| table\_name | TEXT             | Tabel yang dirubah.                   |
| record\_id  | INTEGER          | ID dari record yang dirubah.          |
| created\_at | TIMESTAMP        | Waktu tindakan mengubah hal tersebut. |

Setiap perubahan yang dilakukan oleh _user_ akan direkam, termasuk jenis aksi, tabel yang terlibat, serta waktu kejadian. Meskipun tidak secara eksplisit ditampilkan dalam diagram, tabel ini mendukung kebutuhan non-fungsional seperti _auditing_ dan _logging_.

1. Tabel complaints

Tabel complaints digunakan untuk menyimpan data komplain yang diajukan oleh penghuni. Tabel ini berkaitan langsung dengan diagram proses pengajuan komplain.

Tabel 3. 11 Rancangan Tabel complaints

|              |                   |                               |
| ------------ | ----------------- | ----------------------------- |
| Nama Kolom   | Tipe Data         | Keterangan                    |
| id           | INTEGER (PK, AI)  | ID surat pengaduan.           |
| tenant\_id   | INTEGER (FK)      | Penghuni pelapor.             |
| description  | TEXT              | Isi detail dari kerusakannya. |
| status       | TEXT              | Status keluhan ini.           |
| resolved\_by | INTEGER NULL (FK) | Pengguna yang menyelesaikan.  |
| created\_at  | TIMESTAMP         | Waktu keluhan dibuat.         |

Kolom tenant\_id menunjukkan siapa yang mengajukan komplain, sedangkan resolved\_by menunjukkan pengguna (staf) yang menangani komplain tersebut. Sementara itu, kolom status digunakan untuk melacak proses resolusi penyelesaian komplain.

### Entity Relationship Diagram

_Entity relationship diagram_ (ERD) merupakan diagram yang digunakan untuk memodelkan struktur penyimpanan data dalam basis data dengan menunjukkan entitas, atribut, dan hubungan antarentitas tersebut. Berbeda dengan class diagram yang berfokus pada objek dalam kode program, ERD berfokus pada bagaimana data disimpan secara permanen di dalam tabel basis data. Dalam sistem manajemen kos ini, ERD memberikan panduan teknis yang jelas untuk memastikan bahwa seluruh informasi penting tersimpan dalam struktur yang efisien dan saling terintegrasi.

![](data:image/png;base64...)

Gambar 3. 33 Diagram ERD

ERD pada sistem ini memberikan gambaran menyeluruh tentang bagaimana data diorganisasikan di dalam basis data untuk mendukung kelancaran operasional. Setiap kotak dalam diagram merepresentasikan sebuah tabel yang menyimpan informasi spesifik, seperti profil penghuni, rincian kamar, dokumen tagihan, atau log interaksi _chatbot_. Hubungan antar kotak tersebut menunjukkan bagaimana sistem menghubungkan satu informasi dengan informasi lainnya guna mendukung proses bisnis utama.

Relasi di dalam ERD ini dirancang untuk menjaga keteraturan dan integritas data, seperti menghubungkan penghuni dengan kamar yang mereka tempati melalui kontrak sewa (_lease_), serta menghubungkan setiap pembayaran dengan dokumen tagihan yang sesuai. Dengan struktur yang terintegrasi ini, sistem dapat dengan mudah melacak riwayat penyewaan, mengelola data pembayaran secara akurat, serta memproses komplain dan notifikasi pengingat secara otomatis kepada penghuni yang bersangkutan.

## Rancangan Antarmuka Masukan Sistem

Rancangan masukan sistem merupakan bagian yang menjelaskan bagaimana data dimasukkan ke dalam sistem oleh pengguna. Antarmuka masukan dirancang agar mudah digunakan, jelas, dan meminimalkan kesalahan dalam pengisian data. Setiap elemen input seperti field, tombol, dan pilihan disusun secara terstruktur agar pengguna dapat memahami alur pengisian dengan cepat.

Selain itu, rancangan antarmuka masukan disusun berdasarkan rancangan model sistem dan rancangan basis data yang telah dibuat sebelumnya. Hal ini bertujuan agar setiap data yang dimasukkan sesuai dengan struktur dan kebutuhan sistem, sehingga proses pengolahan data dapat berjalan dengan baik dan terintegrasi.

1. Halaman Login

![](data:image/png;base64...)

Gambar 3. 34 Rancangan Antarmuka Login

Halaman login digunakan untuk masuk ke dalam sistem. Terdapat dua input utama yaitu _username_ dan _password_, serta tombol masuk. Pengguna harus mengisi data dengan benar agar dapat mengakses sistem.

1. Halaman Dashboard

![](data:image/png;base64...)

Gambar 3. 35 Rancangan Antarmuka Dashboard

Halaman dashboard menampilkan ringkasan kondisi sistem seperti jumlah kamar, penghuni aktif, tagihan, dan komplain. Selain itu, terdapat informasi tambahan seperti tagihan yang mendekati jatuh tempo dan komplain terbaru.

1. Halaman Manajemen Akun

![](data:image/png;base64...)

Gambar 3. 36 Rancangan Antarmuka Manajemen Akun

Halaman ini menampilkan daftar akun pengguna dalam bentuk tabel. Informasi yang ditampilkan meliputi _username_, _role_, dan waktu terakhir diakses. Admin dapat mengelola data akun melalui halaman ini.

1. Halaman Manajemen Kamar

![](data:image/png;base64...)

Gambar 3. 37 Rancangan Antarmuka Manajemen Kamar

Halaman ini menampilkan data kamar dalam bentuk kartu. Setiap kamar memiliki informasi seperti nomor kamar, jenis kamar, harga, dan status. Halaman ini digunakan untuk melihat dan mengelola kamar.

1. Halaman Manajemen Penghuni

![](data:image/png;base64...)

Gambar 3. 38 Rancangan Antarmuka Manajemen Penghuni

Halaman ini berisi daftar penghuni dalam bentuk tabel. Data yang ditampilkan meliputi nama, nomor hp, kamar, masa sewa, dan status. Digunakan untuk mengelola data penghuni kos.

1. Halaman Transaksi

![](data:image/png;base64...)

Gambar 3. 39 Rancangan Antarmuka Transaksi

Halaman ini digunakan untuk melihat data transaksi pembayaran. Terdapat filter periode untuk menampilkan data sesuai waktu tertentu, serta tabel berisi detail transaksi.

1. Halaman Notifikasi

![](data:image/png;base64...)

Gambar 3. 40 Rancangan Antarmuka Notifikasi

Halaman ini menampilkan daftar notifikasi (pengingat, pembayaran sukses, dan pesan kustom) yang telah dikirim. Digunakan untuk mengelola komunikasi dengan penghuni melalui _chatbot_.

1. Halaman Komplain

![](data:image/png;base64...)

Gambar 3. 41 Rancangan Antarmuka Komplain

Halaman ini menampilkan daftar komplain dari penghuni. Informasi yang ditampilkan meliputi status komplain, isi komplain, dan tombol aksi untuk menindaklanjuti komplain.

1. Halaman Log Chatbot

![](data:image/png;base64...)

Gambar 3. 42 Rancangan Antarmuka Log Chatbot

Halaman ini menampilkan riwayat percakapan antara pengguna dan _chatbot_. Data ditampilkan dalam bentuk daftar pesan yang dapat digunakan untuk monitoring interaksi _chatbot_.

1. Halaman Audit Log

![](data:image/png;base64...)

Gambar 3. 43 Rancangan Antarmuka Audit Log

Halaman ini berisi riwayat aktivitas pengguna dalam sistem. Informasi yang ditampilkan meliputi nama pengguna, waktu, aksi, dan data yang terlibat.

## Rancangan Antarmuka Keluaran Sistem

Rancangan keluaran sistem menjelaskan bagaimana informasi yang telah diolah oleh sistem disajikan kepada pengguna. Antarmuka keluaran dirancang dalam bentuk laporan dan tampilan data yang mudah dibaca, sehingga pengguna dapat memahami informasi dengan cepat tanpa memerlukan analisis yang kompleks.

Selain itu, rancangan antarmuka keluaran juga dibuat berdasarkan rancangan model sistem dan rancangan basis data yang telah dirancang sebelumnya. Dengan demikian, informasi yang ditampilkan sesuai dengan data yang tersimpan dalam sistem dan dapat mendukung kebutuhan pengguna dalam melakukan pemantauan serta pengambilan keputusan.

1. Laporan Transaksi

![](data:image/png;base64...)

Gambar 3. 44 Rancangan Antarmuka Keluaran Laporan Transaksi

Rancangan keluaran laporan transaksi menampilkan ringkasan transaksi pembayaran kos dalam periode tertentu yang mencakup total pemasukan, jumlah tagihan lunas dan belum lunas, serta tingkat pelunasan, disertai tabel detail berisi nomor _invoice_, nama penghuni, kamar, nominal, tanggal jatuh tempo, tanggal bayar, status, dan referensi transaksi yang dapat dicetak sebagai laporan administrasi.

1. Struk Invoice

![](data:image/png;base64...)

Gambar 3. 45 Rancangan Antarmuka Keluaran Struk Invoice

Rancangan keluaran ini berupa bukti pembayaran digital yang menampilkan informasi _invoice_ seperti nomor, tanggal terbit, jatuh tempo, data penghuni, rincian biaya, total pembayaran, metode pembayaran, tanggal transaksi, serta status pembayaran sehingga dapat digunakan sebagai bukti sah pembayaran.

1. Laporan Audit Log

![](data:image/png;base64...)

Gambar 3. 46 Rancangan Antarmuka Keluaran Audit Log

Rancangan keluaran ini menyajikan data aktivitas pengguna dalam sistem berdasarkan periode tertentu yang mencakup nama pengguna, _role_, serta tabel log berisi waktu aktivitas, jenis aksi, dan nama tabel yang diakses untuk keperluan monitoring dan keamanan sistem.

1. Laporan Interaksi Chatbot

![](data:image/png;base64...)

Gambar 3. 47 Rancangan Antarmuka Keluaran Interaksi Chatbot

Rancangan keluaran ini menampilkan riwayat komunikasi antara penghuni dan chatbot dalam periode tertentu yang mencakup identitas penghuni serta tabel berisi waktu pesan, arah pesan (masuk atau keluar), dan isi pesan untuk evaluasi layanan komunikasi.

1. Daftar Penghuni

![](data:image/png;base64...)

Gambar 3. 48 Rancangan Antarmuka Keluaran Daftar Penghuni

Rancangan keluaran ini berisi daftar penghuni yang masih aktif menempati kamar kos dengan informasi seperti nama lengkap, nomor telepon, kamar, tanggal mulai dan selesai sewa, dilengkapi total penghuni serta area tanda tangan sebagai validasi laporan.

1. Rekap Kamar

![](data:image/png;base64...)

Gambar 3. 49 Rancangan Antarmuka Keluaran Rekap Kamar

Rancangan keluaran ini menyajikan ringkasan kondisi kamar kos yang mencakup jumlah total kamar, kamar terisi, tersedia, dan nonaktif, serta tabel detail setiap kamar berisi nomor kamar, jenis, harga, status, penghuni, dan akhir masa sewa untuk memantau ketersediaan kamar.

1. Laporan Komplain

![](data:image/png;base64...)

Gambar 3. 50 Rancangan Antarmuka Keluaran Laporan Komplain

Rancangan keluaran ini menampilkan data komplain penghuni dalam periode tertentu yang mencakup jumlah komplain berdasarkan status serta tabel detail berisi nama penghuni, kamar, deskripsi masalah, tanggal pengajuan, status, dan pihak yang menangani untuk evaluasi pelayanan.

1. Laporan Pengingat

![](data:image/png;base64...)

Gambar 3. 51 Rancangan Antarmuka Keluaran Laporan Pengingat

Rancangan keluaran ini berisi riwayat pengiriman notifikasi tagihan kepada penghuni yang mencakup jumlah notifikasi terkirim, otomatis, manual, dan gagal, serta tabel detail berisi waktu kirim, penghuni, nomor invoice, jenis pengingat, dan status pengiriman.

1. Rekap Tagihan

![](data:image/png;base64...)

Gambar 3. 52 Rancangan Antarmuka Keluaran Rekap Tagihan

Rancangan keluaran ini menyajikan riwayat tagihan tiap penghuni yang mencakup identitas penghuni serta tabel berisi nomor invoice, periode, nominal, jatuh tempo, tanggal bayar, dan status, dilengkapi total keseluruhan tagihan sebagai ringkasan.

## Tempat dan Jadwal Penelitian

Penelitian ini dilaksanakan di Kost Ungu, Jl. Sejahtera, Komplek Damai, RT 002/RW 006, Kelurahan Mentaos, Kec. Banjarbaru Utara, Kota Banjar Baru, Kalimantan Selatan 70714. Sementara itu jadwal penelitian direncanakan selama 6 bulan, dengan rincian tahapan sebagai berikut:

Tabel 3.12 Jadwal Penelitian

|     |                                   |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |
| --- | --------------------------------- | ---------- | --- | --- | --- | ---------- | --- | --- | --- | ---------- | --- | --- | --- | ---------- | --- | --- | --- | ---------- | --- | --- | --- | ---------- | --- | --- | --- |
| No  | Uraian Kegiatan                   | Bulan Ke-1 |     |     |     | Bulan Ke-2 |     |     |     | Bulan Ke-3 |     |     |     | Bulan Ke-4 |     |     |     | Bulan Ke-5 |     |     |     | Bulan Ke-6 |     |     |     |
|     |                                   | 1          | 2   | 3   | 4   | 1          | 2   | 3   | 4   | 1          | 2   | 3   | 4   | 1          | 2   | 3   | 4   | 1          | 2   | 3   | 4   | 1          | 2   | 3   | 4   |
| 1   | Persiapan Penelitian              |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |
| 2   | Analisis Permasalahan             |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |
| 3   | Perancangan Sistem                |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |
| 4   | Pembuatan Aplikasi                |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |
| 5   | Testing dan Implementasi          |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |
| 6   | Dokumentasi dan Penulisan Laporan |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |            |     |     |     |

# DAFTAR PUSTAKA

Abelya, R. A., Putri, D. A., Nurdianto, M. A., Wicaksono, B. S., & Haromainy, M. M. (2025, August). Sistem Pemesanan Restoran Berbasis API Untuk Mengelola Menu Makanan dan Proses Pemesanan. _Prosiding Seminar Nasional Informatika Bela Negara, 5_, 246–254. doi:10.33005/santika.v5i1.676

Fadli, M., Simbolon, R., Santoso, I. M., Budiman, V. M., Rosadi, H., & Rahman, B. (2026, January). PERANCANGAN SISTEM INFORMASI FRONT OFFICE HOTEL BERBASIS WEB DENGAN PEMODELAN UML DAN INTEGRASI SMART ROOM. _Rabit : Jurnal Teknologi dan Sistem Informasi Univrab, 11_, 1699–1708. doi:10.36341/rabit.v11i1.7459

Fandopa, J. A., & Santoso, N. (2022, February). Pengembangan Sistem Informasi Manajemen Percetakan pada Gajayana Digital Printing Kota Malang berbasis Website. _Jurnal Pengembangan Teknologi Informasi Dan Ilmu Komputer, 6_, 5371–5379. Retrieved from https://j-ptiik.ub.ac.id/index.php/j-ptiik/article/view/11882

Fernanda, & Rizky, M. D. (2024, July). _RANCANG BANGUN SISTEM NOTIFIKASI WHATSAPP PADA JASA LAUNDRY MENGGUNAKAN CRONJOB._ phdthesis, Universitas Teknologi Digital Indonesia. Retrieved from https://eprints.utdi.ac.id/10441/

Habibah, A. Z., Fiati, R., & Wijayanti, E. (2024, November). Implementasi Otomatisasi Tagihan Pembayaran Kos dengan Whatsapp Gateway. _JITU : Journal Informatic Technology And Communication, 8_, 41–52. doi:10.36596/jitu.v8i2.1312

Hidayat, R., & Tedyyana, A. (2026, April). PERANCANGAN SISTEM INFORMASI MANAJEMEN KOS BERBASIS WEB MENGGUNAKAN UUID UNTUK KEAMANAN DATA. _Jurnal Mahasiswa Teknik Informatika, 10_, 2123-2130. doi:10.36040/jati.v10i2.17349

Hudi, F. C., & Karyanti, C. M. (2023, December). Pengujian Black Box Testing pada Sistem Informasi Assesment Berbasis WEB di Bidang Pariwisata. _Jurnal Ilmiah Komputasi, 22_. doi:10.32409/jikstik.22.4.3490

Irfan, M., Mirwansyah, D., & Az Zahro, K. (2024, January). PERANCANGAN SISTEM INFORMASI MONITORING AKADEMIK DENGAN MENGGUNAKAN DATA FLOW DIAGRAM. _Jurnal Locus Penelitian dan Pengabdian, 2_, 1201–1207. doi:10.58344/locus.v2i12.2352

Kadri, H., Agus, F., & Rahmi, R. (2024, December). Memahami Software untuk Mengembangkan Media Berbasis Komputer. _Innovative: Journal Of Social Science Research, 4_, 1643–1649. Retrieved from http://j-innovative.org/index.php/Innovative/article/view/17168

Kejora, A. P., & Purwanti, W. N. (2025). Efektivitas Penggunaan Node Js Dalam Pembuatan Rest Api Untuk Aplikasi Katastrofa. _Prosiding Seminar Nasional Sains dan Teknologi" SainTek"_, _2_, pp. 995–1008. Retrieved from https://conference.ut.ac.id/index.php/saintek/article/view/5135

Muliyono. (2021). _Identifikasi Chatbot dalam Meningkatkan Pelayanan Online Menggunakan Metode Natural Language Processing._ mathesis, Universitas Putra Indonesia YPTK. Retrieved from http://repository.upiyptk.ac.id/4399/

Narulita, S., Nugroho, A., & Abdillah, M. Z. (2024, August). Diagram Unified Modelling Language (UML) untuk Perancangan Sistem Informasi Manajemen Penelitian dan Pengabdian Masyarakat (SIMLITABMAS). _Bridge : Jurnal publikasi Sistem Informasi dan Telekomunikasi, 2_, 244–256. doi:10.62951/bridge.v2i3.174

Nisa’, C., Wijaya, A., Rizal, F., & Press, B. (2024, September). _TEORI UML DAN IMPLEMENTASI PRAKTEK: Panduan Untuk Pengembangan Perangkat Lunak._ Retrieved from https://www.researchgate.net/publication/385947602

Oktaviani, L., & Ayu, M. (2021). Pengembangan Sistem Informasi Sekolah Berbasis Web Dua Bahasa SMA Muhammadiyah Gading Rejo. _Jurnal Pengabdian Pada Masyarakat, 6_, 437–444. doi:10.30653/002.202162.731

Pranatawijaya, V. H., & Yulianto, H. (2022, December). Penerapan API (Application Programming Interface) MIDTRANS Sebagai Payment Gateway Pada Indekos Berbasis Website. _Journal of Information Technology and Computer Science, 2_, 254–262. doi:10.47111/jointecoms.v2i4.8877

Rafiezah Rizcha, Y., & Yaakub, S. (2023, March). Sistem Informasi Manajemen Sumber Daya Manusia Pada Universitas Muhammadiyah Jambi. _Jurnal Manajemen Sistem Informasi, 8_, 78–93. doi:10.33998/jurnalmsi.2023.8.1.765

Silvana, L. W., Agustiono, W., & Mufarroha, F. A. (2024, December). IMPLEMENTASI PAYMENT GATEWAY PADA MARKETPLACE DIGITAL PRODUCT BERBASIS WEBSITE DENGAN MENGGUNAKAN METODE AGILE. _Journal of Scientech Research and Development, 6_, 451–464. doi:10.56670/jsrd.v6i2.523

SQLite Consortium. (2024). _About SQLite_. Retrieved 3 24, 2026, from SQLite: https://www.sqlite.org/about.html

SQLite Consortium. (2024). _Appropriate Uses For SQLite_. Retrieved 3 24, 2026, from SQLite: https://www.sqlite.org/whentouse.html

Syamsiah, D., Nugroho, A. S., & Damayanti, E. E. (2026, January). Digitalisasi Pembuktian Elektronik dalam Sengketa Wanprestasi Transaksi Fintech. _JOSH: Journal of Sharia, 5_, 65–75. doi:10.55352/josh.v5i01.2436

Usman, A., Sumah, J., Purnama, P. A., Siregar, F. A., Putra, G. M., Siwalette, R., . . . Nasution, A. (2025, February). _Konsep Dasar Basis Data._ (R. M. Sari, Ed.) Serasi Media Teknologi. Retrieved from https://books.google.co.id/books?id=jTdNEQAAQBAJ

Zen, M., Irwan, Hafni, & Ananda, M. D. (2024, June). Implementasi dan Pengujian Menggunakan Metode BlackBox Testing Pada Sistem Informasi Tracer Study. _Bulletin of Computer Science Research, 4_, 327–340. doi:10.47065/bulletincsr.v4i4.359
