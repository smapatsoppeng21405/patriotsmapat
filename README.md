# 🏫 Panduan Deploy: Aplikasi PATRIOT (Platform Terintegrasi Informasi, dan Operasional Akademik) SMAPAT

Aplikasi berbasis Progressive Web App (PWA) yang responsif dan berpenampilan premium untuk operasional akademik terintegrasi meliputi Wakasek Kurikulum, Guru Mata Pelajaran, Wali Kelas, Guru Wali, dan Kepala Sekolah.

---

## 📂 Struktur Berkas Proyek
1. [index.html](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/index.html) - Halaman utama frontend (Single Page Application dengan CSS Premium & JS logic).
2. [code.gs](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/code.gs) - Kode backend Google Apps Script (GAS) untuk menghubungkan API dengan Google Sheets.
3. [manifest.json](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/manifest.json) - Konfigurasi agar aplikasi dapat diinstal di HP/Desktop (PWA).
4. [sw.js](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/sw.js) - Service worker untuk menangani akses offline (caching aset).
5. [icon.png](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/icon.png) - Ikon aplikasi SiKurikulum.

---

## 🛠️ Langkah 1: Setup Database Google Sheets & Deploy GAS API
1. Buka [Google Sheets](https://sheets.google.com/) baru di akun Google Anda. Beri nama Spreadsheet, misalnya: `Database SiKurikulum`.
2. Pada menu atas, klik **Ekstensi** (Extensions) &rarr; pilih **Apps Script**.
3. Hapus seluruh kode bawaan di dalam editor script, lalu buka berkas [code.gs](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/code.gs) di folder ini, salin seluruh kodenya, dan tempelkan (paste) ke editor Apps Script.
4. Klik ikon **Simpan** (ikon disket) atau tekan `Ctrl + S`.
5. **Inisialisasi Awal**:
   - Di bar bagian atas editor Apps Script, pilih fungsi **`initSheets`** pada dropdown menu pilihan fungsi.
   - Klik tombol **Run** (Jalankan) di sebelah kiri dropdown.
   - Anda perlu memberikan otorisasi akses akun Google jika diminta (klik *Review Permissions*, pilih email Anda, klik *Advanced*, klik *Go to Database SiKurikulum (unsafe)*, lalu klik *Allow*).
   - Fungsi ini akan membuat 4 sheet secara otomatis: `Users`, `JurnalMengajar`, `PerangkatAjar`, dan `AnalisisNilai`, serta memasukkan 3 akun uji coba default ke tabel `Users`.
6. **Menerbitkan Web App (Deploy)**:
   - Klik tombol **Deploy** (Terapkan) di pojok kanan atas &rarr; pilih **New deployment** (Terapkan baru).
   - Klik ikon gerigi (Select type) &rarr; pilih **Web app**.
   - Isi konfigurasi sebagai berikut:
     - **Description**: `SiKurikulum API v1`
     - **Execute as** (Jalankan sebagai): **Me** (Akun email Google Anda)
     - **Who has access** (Siapa yang memiliki akses): **Anyone** (Siapa saja, termasuk pengguna anonim)
   - Klik tombol **Deploy**.
   - Salin **Web App URL** yang dihasilkan (formatnya seperti `https://script.google.com/macros/s/XXXXXX/exec`). Simpan URL ini sementara di Notepad.

---

## 🔥 Pilihan Storage Super Cepat: Setup Google Firebase Firestore (< 100ms Realtime)
Untuk kecepatan maksimal dan sinkronisasi otomatis antar-perangkat tanpa delay Google Apps Script:
1. Buka [Google Firebase Console](https://console.firebase.google.com/) lalu klik **Add project** (Beri nama misalnya: `patriot-smapat`).
2. Masuk ke menu **Build** &rarr; **Firestore Database** &rarr; klik **Create database** (Pilih mode *Start in test mode*).
3. Masuk ke **Project Settings** (ikon gerigi) &rarr; scroll ke bawah ke bagian *Your apps* &rarr; klik ikon **Web (`</>`)**.
4. Salin objek `firebaseConfig` yang dihasilkan.
5. Buka berkas [index.html](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/index.html) dan tempelkan ke variabel **`FIREBASE_CONFIG`** di bagian awal `<script>`:
   ```javascript
   const FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "patriot-smapat.firebaseapp.com",
     projectId: "patriot-smapat",
     storageBucket: "patriot-smapat.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
6. Simpan `index.html`. Seluruh perangkat PC & HP kini akan terhubung secara *real-time* dengan kecepatan ultra tinggi (< 100ms)!

---

## 🔗 Langkah 2: Menghubungkan Frontend PWA ke Google Sheets
1. Buka berkas [index.html](file:///d:/APLIKASI%20PASYA/Aplikasi%20Kurikulum/index.html) menggunakan Text Editor (seperti VS Code atau Notepad).
2. Cari variabel **`GAS_API_URL`** yang terletak di bagian awal blok `<script>` (sekitar baris 1025):
   ```javascript
   const GAS_API_URL = ""; 
   ```
3. Tempelkan URL Web App Google Apps Script hasil salinan Anda dari **Langkah 1** di antara tanda kutip, contoh:
   ```javascript
   const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzXXXXXX/exec";
   ```
4. Simpan kembali berkas `index.html` (`Ctrl + S`).

> [!NOTE]
> **Mode Uji Coba Cepat (Mockup Mode)**:
> Jika variabel `GAS_API_URL` dibiarkan kosong `""`, aplikasi secara otomatis berjalan dalam **Mode Demo / Mockup**. Seluruh operasi (Login, Input Jurnal, Unggah Perangkat, Analisis Nilai, dan Validasi) akan disimpan secara lokal di memori browser (`LocalStorage`). Anda dapat membuka berkas `index.html` langsung di browser Anda untuk menguji antarmuka tanpa perlu setup Google Sheets terlebih dahulu.

---

## 🚀 Langkah 3: Hosting Frontend & Instalasi PWA
Agar aplikasi ini dapat diakses secara online oleh guru dari HP/Laptop masing-masing dan diinstal sebagai aplikasi:
1. Hubungkan atau unggah 4 berkas utama berikut ke layanan hosting statis gratis pilihan Anda (misalnya **Netlify, Vercel, atau GitHub Pages**):
   - `index.html`
   - `sw.js`
   - `manifest.json`
   - `icon.png`
2. **Cara Mengunggah ke Netlify (Sangat Mudah)**:
   - Masuk ke [Netlify Drop](https://app.netlify.com/drop).
   - Tarik (drag) seluruh isi folder `Aplikasi Kurikulum` dan jatuhkan (drop) di dalam kotak upload Netlify.
   - Dalam hitungan detik, Netlify akan memberikan tautan publik aplikasi Anda (contoh: `https://sikurikulum-sekolah.netlify.app`).
3. **Instalasi PWA di Laptop/PC & Handphone**:
   - **Tombol Instal Otomatis**: Cukup buka aplikasi di browser, ketuk tombol ungu/hijau **"Instal Aplikasi PATRIOT (HP & PC)"** di halaman awal atau header topbar.
   - **Laptop/PC (Google Chrome & Microsoft Edge)**: Klik ikon instal (layar dengan panah ke bawah) di sebelah kanan address bar browser Chrome/Edge, atau klik titik tiga &rarr; **Install PATRIOT SMAPAT**. Aplikasi akan berjalan di jendela terpisah tanpa baris browser seperti software desktop bawaan!
   - **Android (Chrome)**: Buka tautan aplikasi di Chrome. Klik tombol **Instal Aplikasi** yang muncul di layar atau klik titik tiga &rarr; **Tambahkan ke Layar Utama (Add to Home Screen)** / **Instal Aplikasi**.
   - **iOS/iPhone/iPad (Safari)**: Buka tautan aplikasi di Safari. Klik tombol **Share** (ikon kotak dengan panah ke atas), scroll ke bawah lalu pilih **Add to Home Screen (Tambah ke Layar Utama)**.

---

## 🔑 Data Akun Default untuk Uji Coba
Gunakan akun default berikut untuk mencoba tiga dashboard dengan peran berbeda:

1. **Wakil Kepala Sekolah (Wakasek) Kurikulum**:
   - **Email**: `wakasek@sekolah.com`
   - **Password**: `wakasek123`
   - *Fungsi*: Monitoring jurnal mengajar seluruh guru, menyetujui/merevisi dokumen perangkat ajar guru, memantau capaian nilai akademik sekolah, visualisasi grafik performa.

2. **Guru Kelas**:
   - **Email**: `guru@sekolah.com`
   - **Password**: `guru123`
   - *Fungsi*: Pengisian jurnal harian KBM kelas, mengajukan dokumen perangkat ajar (RPP, Prota, dll) via link Google Drive, melihat riwayat dan status validasi berkasnya sendiri.

3. **Wali Kelas**:
   - **Email**: `walikelas@sekolah.com`
   - **Password**: `walikelas123`
   - *Fungsi*: Input analisis rata-rata nilai akademik mata pelajaran di kelas bimbingannya, monitoring jurnal mengajar khusus untuk kelas bimbingannya.

---

## 📶 Fitur Kemampuan Offline & Sinkronisasi
- **Input Offline**: Apabila koneksi internet sekolah terganggu/putus saat Guru sedang mengisi Jurnal Mengajar, aplikasi akan memunculkan notifikasi dan menyimpan data jurnal secara lokal di memori internal.
- **Indikator Koneksi**: Muncul badge merah bertuliskan **Offline** di pojok kanan atas layar.
- **Sinkronisasi Otomatis**: Begitu perangkat mendeteksi jaringan kembali online, tombol kuning **Sync (Jumlah Antrean)** akan muncul. Pengguna cukup mengetuk tombol tersebut untuk mengunggah seluruh jurnal offline yang tersimpan langsung ke Google Sheets.

---

## 📅 Fitur Jadwal Anti-Tabrakan & Notifikasi HP/PC
1. **Validasi Anti-Tabrakan**:
   - Sistem memvalidasi input pembuatan jadwal secara real-time pada sisi client dan server.
   - *Bentrokan Guru*: Mencegah guru yang sama mengajar di kelas berbeda pada hari & jam pelajaran yang sama.
   - *Bentrokan Kelas*: Mencegah satu kelas diisi oleh dua guru berbeda pada hari & jam pelajaran yang sama.
2. **Notifikasi Mengajar Real-time (HP/PC)**:
   - Guru dapat mengklik tombol **"Aktifkan Notifikasi Jadwal"** pada tab Jadwal Saya untuk memberikan izin browser.
   - Aplikasi memonitor jam pelajaran saat ini di latar belakang. Ketika jam KBM Anda dimulai, perangkat Anda akan bergetar/memunculkan push alarm: *"⏰ Waktunya Mengajar! Kelas [Kelas], Mapel: [Mapel]"*.
3. **Pintasan Pengiriman Jurnal Cepat**:
   - Tepat ketika jam mengajar Anda berakhir, peranti HP/PC akan menerima push alarm: *"🔔 KBM Selesai! Isi Jurnal Mengajar"*.
   - Mengklik push alarm tersebut akan **membuka tab Isi Jurnal dan mengisi datanya secara otomatis (autofill)** meliputi Tanggal, Kelas, dan Mata Pelajaran. Guru hanya perlu mengetik ringkasan kehadiran/kejadian singkat dan menekan kirim.

---

## 📝 Fitur Laporan Wali Kelas
- **Pengiriman Laporan**: Wali Kelas memiliki menu khusus untuk mengirimkan laporan bulanan atau insidental terkait kelas bimbingannya (kategori: Akademik & Nilai, Ketertiban & Kehadiran, Sarana, Kasus Khusus) dilengkapi kolom tindak lanjut.
- **Tinjauan Wakasek**: Wakasek Kurikulum mendapatkan tab rekapitulasi laporan wali kelas masuk untuk memantau kondisi operasional seluruh kelas secara real-time.

---

## ⚙️ Fitur Data Utama Guru & Pembuatan Roster Otomatis (Baru)

### 1. Menu Data Utama Guru
Wakasek Kurikulum memiliki menu baru **"Data Utama Guru"** yang terbagi menjadi tiga bagian:
- **Manajemen Guru & Akun Pengguna (Baru)**:
  - Form untuk mendaftarkan akun baru (Nama Lengkap, Email, Password, serta Role: Guru / Wali Kelas) atau mengedit kredensial guru terdaftar.
  - Tabel rekapitulasi akun dengan aksi **Edit** dan **Hapus** terhubung langsung ke database Users Google Sheet.
  - Guru yang terdaftar di sini otomatis bisa login menggunakan email & password masing-masing.
- **Tugas Mengajar Guru (Master Data)**:
  - Form untuk mendistribusikan beban mata pelajaran guru per kelas (Nama Guru, Mata Pelajaran, Target Kelas, Jumlah Jam Pelajaran/JP).
  - Kolom **Nama Guru** sekarang otomatis berbentuk **dropdown select dinamis** berisi seluruh akun guru terdaftar, mencegah kesalahan ketik nama.
- **Daftar Master Tugas**:
  - Rekap alokasi JP per kelas untuk seluruh guru, dilengkapi tombol hapus dan edit tugas.


### 2. Pengaturan Hari Belajar
Pada menu Data Utama Guru, Wakasek dapat memilih durasi hari sekolah:
- **5 Hari Kerja**: Senin s.d. Jumat (Maksimal kapasitas alokasi JP per kelas = **40 JP**).
- **6 Hari Kerja**: Senin s.d. Sabtu (Maksimal kapasitas alokasi JP per kelas = **48 JP**).

### 3. Generator Jadwal Otomatis (Timetabling Solver)
- Di menu **Manajemen Jadwal**, Wakasek dapat mengklik tombol **"Buat Jadwal Otomatis Baru"**.
- Sistem akan menjalankan **Backtracking Algoritma Penjadwalan** secara dinamis untuk menyusun ribuan kemungkinan slot mengajar dalam hitungan milidetik.
- **Garansi Bebas Bentrok**: Menjamin guru tidak mengajar di 2 kelas bersamaan, dan kelas tidak diisi 2 guru bersamaan.
- **Batasan Pedagogis**: Sistem membatasi mata pelajaran yang sama maksimal **2 JP berurutan** dalam sehari agar siswa tidak jenuh.
- Setelah selesai, Wakasek dapat meninjau preview dan mengklik **"Simpan & Terapkan Jadwal Baru"** untuk memperbarui roster secara massal ke database Google Sheet.

### 4. Cetak Roster Per Kelas (Print & PDF)
- Pengguna dapat menuju menu **Manajemen Jadwal** (Wakasek) atau **Jadwal Saya** (Guru) untuk melihat sub-menu **Tinjau & Cetak Roster Mingguan Kelas**.
- Pilih kelas yang diinginkan (contoh: `10-A`). Roster mingguan dalam bentuk grid tabel pelajaran yang rapi akan muncul.
- Klik **"Cetak Roster Kelas (PDF)"** untuk memicu print dialog browser. Tampilan cetak telah didesain khusus (print-friendly) untuk menyembunyikan menu navigasi, sidebar, dan tombol aplikasi, menyisakan hanya tabel roster pelajaran yang bersih dan siap cetak/simpan ke PDF.

### 5. Penyesuaian Jadwal Roster Secara Manual (Baru)
- Wakasek dapat melakukan modifikasi halus atau memindahkan jadwal secara manual langsung dari grid roster mingguan kelas.
- Cukup **klik pada salah satu sel/slot pelajaran** di grid roster. Modal penyesuaian akan muncul menampilkan detail hari, jam ke, dan kelas.
- Pilih guru mata pelajaran & mata pelajaran dari dropdown tugas mengajar kelas tersebut, lalu klik **"Terapkan"**.
- **Proteksi Bentrok**: Sistem secara otomatis mengecek apakah guru yang dipindahkan sudah mengajar di kelas lain pada hari dan jam pelajaran yang sama. Jika ya, perubahan akan ditolak dan notifikasi bentrok akan muncul.
- Tombol **"Simpan Perubahan Roster (X Edit)"** akan muncul jika ada perubahan di layar. Klik tombol ini untuk menyimpan perubahan secara massal ke database Google Sheet. Klik **"Batal"** untuk mereset seluruh modifikasi layar kembali ke data semula.

### 6. Unggah File Perangkat Ajar Langsung Dari Perangkat (Baru)
- Guru tidak perlu lagi menyalin dan menempelkan link Google Drive secara manual.
- Pada form **Unggah Perangkat**, guru cukup mengklik **"Pilih File"** untuk mencari dokumen (PDF, Word, Excel, dll) langsung dari HP atau PC.
- Aplikasi membaca file tersebut sebagai string **Base64** dan mengirimkannya ke backend.
- Google Apps Script secara otomatis mengunggah berkas tersebut ke Google Drive pemilik Script, menyetel izin lihat publik bagi siapa saja yang memiliki tautan, dan menyematkan link tersebut ke baris data Google Sheets yang sesuai.



