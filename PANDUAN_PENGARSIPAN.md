# 📦 Panduan Pengarsipan Rutin Database Firebase & Backup Data
**Aplikasi PATRIOT SMAPAT (Platform Terintegrasi Informasi, dan Operasional Akademik)**

Panduan ini disusun untuk membantu **Wakasek Kurikulum / Administrator Sistem** melakukan pemeliharaan database secara rutin setiap akhir semester atau akhir tahun ajaran. 

Melakukan pengarsipan secara rutin sangat penting untuk:
1. **Menghemat Kuota Gratis Firebase**: Menjaga agar jumlah dokumen di Firestore tidak melebihi batas gratis harian (50.000 *reads*).
2. **Memaksimalkan Kecepatan Aplikasi**: Mengurangi beban loading data saat dashboard dibuka oleh guru dan kepala sekolah.
3. **Merapikan Administrasi**: Memulai lembar catatan baru untuk semester/tahun ajaran baru dengan data yang bersih.

---

## 📂 Tahap 1: Ekspor & Backup Seluruh Data ke Excel
Sebelum menghapus data apa pun di database Firebase, Anda **WAJIB** mengunduh rekapitulasi data semester berjalan sebagai arsip fisik sekolah.

Di dashboard **Wakasek Kurikulum**, silakan buka menu-menu berikut untuk mengunduh rekap Excel:

### 1. Rekap Jurnal Mengajar Guru
* Buka menu **Monitoring Jurnal** di sidebar.
* Gulir ke bagian bawah tabel jurnal, klik tombol hijau **"Unduh sebagai berkas EXCEL (.xlsx)"**.
* Berkas akan tersimpan otomatis dengan format nama: `Rekap_Jurnal_Mengajar_Kurikulum_YYYY-MM-DD.xlsx`.

### 2. Rekap Absensi Bulanan Siswa
* Buka menu **Rekap Absensi** di sidebar.
* Klik tombol **"Unduh Excel"** di atas tabel rekapitulasi absensi bulanan.
* Berkas akan tersimpan otomatis dengan format nama: `Rekap_Absensi_Sekolah_YYYY-MM-DD.xlsx`.

### 3. Rekap Jurnal Karakter 7KAIH Siswa
* Buka menu **Monitoring 7KAIH** di sidebar.
* Klik tombol **"Unduh Excel"** di pojok kanan atas tabel.
* Berkas akan tersimpan otomatis dengan format nama: `Rekap_Jurnal_7KAIH_Sekolah_YYYY-MM-DD.xlsx`.

### 4. Rekap Catatan Perkembangan Bimbingan Guru Wali
* Buka menu **Catatan Bimbingan** di sidebar.
* Klik tombol **"Unduh Excel"** di atas tabel monitoring bimbingan.
* Berkas akan tersimpan otomatis dengan format nama: `Rekap_Catatan_Bimbingan_Guru_Wali_Sekolah_YYYY-MM-DD.xlsx`.

### 5. Rekap Laporan Wali Kelas Masuk
* Buka menu **Laporan Wali Kelas** di sidebar.
* Klik tombol **"Unduh Excel"** di atas tabel laporan masuk.
* Berkas akan tersimpan otomatis dengan format nama: `Rekap_Laporan_Wali_Kelas_Sekolah_YYYY-MM-DD.xlsx`.

> [!IMPORTANT]
> Pastikan seluruh file `.xlsx` di atas sudah terunduh dengan sukses dan isinya telah diperiksa sebelum Anda melanjutkan ke Tahap 2.

---

## 🛑 Tahap 2: Pembersihan Database di Firebase Console
Setelah semua data di atas aman tersimpan di komputer Anda, Anda dapat membersihkan data transaksi di database Firestore.

### Langkah-langkah Pembersihan Aman:
1. Buka [Google Firebase Console](https://console.firebase.google.com/) melalui browser Anda.
2. Masuk ke proyek Anda (misalnya: `patriot-smapat` atau proyek yang Anda buat).
3. Di menu navigasi sebelah kiri, masuk ke **Build** &rarr; pilih **Firestore Database**.
4. Anda akan melihat daftar **Koleksi (Collections)** di kolom sebelah kiri.
5. Untuk menghapus data transaksi lama, **klik ikon titik tiga (`⋮`)** di sebelah kanan nama koleksi yang ingin dibersihkan, lalu pilih **"Delete collection" (Hapus koleksi)**.
6. Ketik nama koleksi tersebut untuk konfirmasi penghapusan, lalu klik **Delete** (Hapus).

### 📋 Daftar Koleksi yang WAJIB dibersihkan (Dihapus):
Hapus koleksi-koleksi berikut untuk mengosongkan data transaksi belajar mengajar semester lalu:
* `jurnals` (Berisi jurnal mengajar harian guru)
* `rekapabsen` (Berisi rekap absensi bulanan siswa)
* `jurnal7kaih` (Berisi catatan pembiasaan karakter siswa)
* `catatanbimbingan` (Berisi riwayat bimbingan guru wali)
* `laporans` (Berisi laporan wali kelas)
* `nilais` (Berisi riwayat input analisis nilai akademik)
* `kondisisiswa` (Berisi catatan khusus kondisi siswa)

### ⚠️ Daftar Koleksi yang DILARANG dihapus (Tetap Biarkan):
Jangan hapus koleksi berikut karena berisi konfigurasi utama dan akun pengguna sekolah:
* `users` (Akun login Guru, Wali Kelas, Wakasek, Kepala Sekolah)
* `gurumasters` (Beban tugas mengajar guru per kelas)
* `jadwals` (Roster jadwal mengajar terpasang)
* `sessions` / `settings` (Konfigurasi jam pelajaran sekolah dan parameter hari kerja)
* `students` (Database induk profil siswa)

---

## 🚀 Tahap 3: Persiapan Memulai Semester Baru
Setelah koleksi transaksi dihapus, database Firebase Anda akan berada dalam kondisi kosong untuk data harian, namun tetap menyimpan data guru, siswa, dan akun.

Sebelum mengumumkan penggunaan aplikasi kembali kepada guru-guru di awal semester baru:
1. **Perbarui Jadwal Mengajar (Jika Ada Perubahan)**:
   * Wakasek Kurikulum masuk ke menu **Manajemen Jadwal** &rarr; sesuaikan tugas mengajar atau jalankan *Generator Jadwal Otomatis* jika ada perubahan roster kelas.
2. **Instruksikan Guru untuk Melakukan Update**:
   * Bagikan pesan di grup koordinasi agar semua guru membuka aplikasi PATRIOT dan menekan tombol **"Update Aplikasi"** di pojok kanan atas halaman masing-masing. Ini bertujuan untuk mereset memori lokal browser (*service worker & cache*) agar sinkron dengan database baru yang bersih.

---
*Dokumen ini dibuat secara otomatis sebagai panduan administrasi Aplikasi PATRIOT SMAPAT.*
