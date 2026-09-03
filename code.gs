/**
 * Aplikasi Wakasek Kurikulum - Backend Google Apps Script
 * Database: Google Sheets
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "API Aplikasi Wakasek Kurikulum aktif. Silakan gunakan metode POST."
  })).setMimeType(ContentService.MimeType.JSON);
}

// Inisialisasi Sheet dan Kolom secara Otomatis
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Define sheets and headers
  var sheetsDef = {
    "Users": ["ID", "Nama", "Email", "Role", "Password", "WaliKelasClass", "Mapel"],
    "JurnalMengajar": ["ID", "Tanggal", "Guru", "Kelas", "Materi", "Kehadiran", "Catatan", "Mode", "Mapel", "Sesi"],
    "PerangkatAjar": ["ID", "Nama_Guru", "Jenis_Dokumen", "Link_Drive", "Status", "Catatan"],
    "AnalisisNilai": ["ID", "Kelas", "Mapel", "Rata_Nilai", "Jumlah_Siswa_Remidial"],
    "Jadwal": ["ID", "Hari", "JamKe", "Kelas", "Guru", "Mapel"],
    "LaporanWali": ["ID", "Tanggal", "WaliKelas", "Kelas", "Kategori", "Judul", "Isi", "TindakLanjut"],
    "GuruMaster": ["ID", "NamaGuru", "Mapel", "Kelas", "JumlahJam"],
    "Settings": ["Key", "Value"],
    "RekapAbsen": ["ID", "Bulan", "Tahun", "WaliKelas", "Kelas", "NamaSiswa", "Hadir", "Sakit", "Izin", "Alpa"],
    "KondisiSiswa": ["ID", "Bulan", "Tahun", "WaliKelas", "Kelas", "NamaSiswa", "Kehadiran", "PrestasiAkademik", "PrestasiNonAkademik", "TujuanSetelahLulus"],
    "SiswaGuruWali": ["ID", "NIS", "NamaSiswa", "Kelas", "GuruWali"],
    "Siswa": ["ID", "NIS", "NamaSiswa", "Kelas", "Tingkatan"],
    "Jurnal7KAIH": ["ID", "Tanggal", "NIS", "NamaSiswa", "BangunPagi", "Beribadah", "Berolahraga", "MakanSehat", "GemarBelajar", "Bermasyarakat", "TidurCepat"],
    "CatatanBimbingan": ["ID", "Tanggal", "GuruWali", "NamaSiswa", "CatatanPerkembangan"],
    "KelasMapelPilihan": ["ID", "GuruEmail", "NamaKelas", "Tingkatan", "NamaSiswa", "NIS"],
    "Sesi": ["ID", "NamaSesi", "JamMulai", "JamSelesai"],
    "CatatanWaliKelas": ["ID", "Tanggal", "WaliKelas", "Kelas", "NamaSiswa", "Catatan"]
  };
  
  for (var name in sheetsDef) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(sheetsDef[name]);
    } else {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(sheetsDef[name]);
      } else {
        // Verifikasi dan migrasi header kolom jika ada kolom baru
        var lastCol = sheet.getLastColumn();
        var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
        var targetHeaders = sheetsDef[name];
        var needsUpdate = false;
        
        for (var idx = 0; idx < targetHeaders.length; idx++) {
          var h = targetHeaders[idx];
          if (currentHeaders.indexOf(h) === -1) {
            needsUpdate = true;
            break;
          }
        }
        
        if (needsUpdate) {
          sheet.getRange(1, 1, 1, targetHeaders.length).setValues([targetHeaders]);
        }
      }
    }
  }
  
  // Insert default users if sheet Users is empty
  var userSheet = ss.getSheetByName("Users");
  if (userSheet.getLastRow() <= 1) {
    var defaultUsers = [
      ["USR001", "Sri Rahayu S.Pd.,M.Pd. (Wakasek)", "wakasek@sekolah.com", "Wakasek", "wakasek123"],
      ["USR002", "Bu Siti (Guru Matematika)", "guru@sekolah.com", "Guru", "guru123"],
      ["USR003", "Pak Joko (Wali Kelas 10A)", "walikelas@sekolah.com", "Wali Kelas", "walikelas123"],
      ["USR004", "Pak Salim (Guru Wali)", "guruwali@sekolah.com", "Guru Wali", "wali123"],
      ["USR005", "Drs. H. Mulyono (Kepala Sekolah)", "kepala@sekolah.com", "Kepala Sekolah", "kepala123"]
    ];
    defaultUsers.forEach(function(row) {
      userSheet.appendRow(row);
    });
  }
  
  // Insert default schedules if sheet Jadwal is empty
  var jadwalSheet = ss.getSheetByName("Jadwal");
  if (jadwalSheet.getLastRow() <= 1) {
    var defaultSchedules = [
      ["SCH-001", "Senin", "Sesi 1", "10-A", "Bu Siti (Guru Matematika)", "Matematika Aljabar"],
      ["SCH-002", "Senin", "Sesi 2", "10-A", "Bu Siti (Guru Matematika)", "Matematika Aljabar"],
      ["SCH-003", "Selasa", "Sesi 3", "10-A", "Pak Joko (Wali Kelas 10A)", "Fisika Dasar"]
    ];
    defaultSchedules.forEach(function(row) {
      jadwalSheet.appendRow(row);
    });
  }

  // Insert default sessions if sheet Sesi is empty
  var sesiSheet = ss.getSheetByName("Sesi");
  if (sesiSheet.getLastRow() <= 1) {
    var defaultSesi = [
      ["SES-001", "Sesi 1", "07:00", "07:45"],
      ["SES-002", "Sesi 2", "07:45", "08:30"],
      ["SES-003", "Sesi 3", "08:30", "09:15"],
      ["SES-004", "Sesi 4", "09:30", "10:15"],
      ["SES-005", "Sesi 5", "10:15", "11:00"],
      ["SES-006", "Sesi 6", "11:00", "11:45"],
      ["SES-007", "Sesi 7", "12:30", "13:15"],
      ["SES-008", "Sesi 8", "13:15", "14:00"]
    ];
    defaultSesi.forEach(function(row) {
      sesiSheet.appendRow(row);
    });
  }

  // Insert default students for Guru Wali if sheet SiswaGuruWali is empty
  var sgwSheet = ss.getSheetByName("SiswaGuruWali");
  if (sgwSheet && sgwSheet.getLastRow() <= 1) {
    var defaultSgw = [
      ["SGW-001", "12345", "Ahmad Dani", "10-A", "Pak Salim (Guru Wali)"],
      ["SGW-002", "12346", "Budi Santoso", "10-A", "Pak Salim (Guru Wali)"]
    ];
    defaultSgw.forEach(function(row) {
      sgwSheet.appendRow(row);
    });
  }

  // Insert default students for Siswa Master if sheet Siswa is empty
  var siswaSheet = ss.getSheetByName("Siswa");
  if (siswaSheet && siswaSheet.getLastRow() <= 1) {
    var defaultSiswa = [
      ["SIS-001", "12345", "Ahmad Dani", "10-A"],
      ["SIS-002", "12346", "Budi Santoso", "10-A"],
      ["SIS-003", "12347", "Citra Lestari", "10-A"]
    ];
    defaultSiswa.forEach(function(row) {
      siswaSheet.appendRow(row);
    });
  }

  // Insert default Settings if sheet Settings is empty
  var settingsSheet = ss.getSheetByName("Settings");
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(["hari_belajar", "5"]);
  }
}

// API Handler Utama (POST)
function doPost(e) {
  initSheets();
  
  var response = { status: "error", message: "Aksi tidak dikenali" };
  
  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error("Payload request kosong.");
    }
    
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var payload = request.payload || {};
    
    // Auth bypass check
    if (action !== "login" && action !== "addJurnal7KAIH" && action !== "getSiswaPublic" && !payload.currentUserEmail) {
      throw new Error("Sesi pengguna tidak valid. Silakan login kembali.");
    }
    
    switch (action) {
      case "login":
        response = { status: "success", data: login(payload.email, payload.password) };
        break;
        
      case "getDashboard":
        response = { status: "success", data: getDashboard(payload.currentUserRole, payload.currentUserEmail, payload.currentUserName, payload.currentUserWaliKelasClass) };
        break;
        
      case "addJurnal":
        response = { status: "success", data: addJurnal(payload) };
        break;

      case "deleteJurnal":
        response = { status: "success", data: deleteJurnal(payload) };
        break;
        
      case "syncOfflineJurnal":
        response = { status: "success", data: syncOfflineJurnal(payload.jurnalList) };
        break;
        
      case "addPerangkat":
        response = { status: "success", data: addPerangkat(payload) };
        break;
        
      case "updatePerangkatStatus":
        response = { status: "success", data: updatePerangkatStatus(payload.id, payload.status, payload.catatan) };
        break;
        
      case "addAnalisisNilai":
        response = { status: "success", data: addAnalisisNilai(payload) };
        break;
        
      case "addJadwal":
        response = { status: "success", data: addJadwal(payload) };
        break;
        
      case "deleteJadwal":
        response = { status: "success", data: deleteJadwal(payload.id) };
        break;

      case "addSesi":
        if (payload.currentUserRole !== "Admin") throw new Error("Akses ditolak. Pengaturan sesi hanya dapat dilakukan oleh Admin.");
        response = { status: "success", data: addSesi(payload) };
        break;

      case "deleteSesi":
        if (payload.currentUserRole !== "Admin") throw new Error("Akses ditolak. Pengaturan sesi hanya dapat dilakukan oleh Admin.");
        response = { status: "success", data: deleteSesi(payload.id) };
        break;
        
      case "addLaporanWali":
        response = { status: "success", data: addLaporanWali(payload) };
        break;
        
      case "addRekapAbsen":
        response = { status: "success", data: addRekapAbsen(payload) };
        break;
        
      case "addKondisiSiswa":
        response = { status: "success", data: addKondisiSiswa(payload) };
        break;

      case "addGuruMaster":
        response = { status: "success", data: addGuruMaster(payload) };
        break;

      case "deleteGuruMaster":
        response = { status: "success", data: deleteGuruMaster(payload.id) };
        break;

      case "updateSettings":
        response = { status: "success", data: updateSettings(payload) };
        break;

      case "saveGeneratedSchedule":
        response = { status: "success", data: saveGeneratedSchedule(payload) };
        break;

      case "addTeacher":
        if (payload.currentUserRole !== "Admin" && payload.currentUserRole !== "Tenaga Kependidikan") throw new Error("Akses ditolak. Pengisian data guru hanya dapat dilakukan oleh Admin atau Tenaga Kependidikan.");
        response = { status: "success", data: addTeacher(payload) };
        break;

      case "deleteTeacher":
        if (payload.currentUserRole !== "Admin" && payload.currentUserRole !== "Tenaga Kependidikan") throw new Error("Akses ditolak. Penghapusan data guru hanya dapat dilakukan oleh Admin atau Tenaga Kependidikan.");
        response = { status: "success", data: deleteTeacher(payload) };
        break;

      case "addStudent":
        if (payload.currentUserRole !== "Admin" && payload.currentUserRole !== "Tenaga Kependidikan") throw new Error("Akses ditolak. Pengisian data siswa hanya dapat dilakukan oleh Admin atau Tenaga Kependidikan.");
        response = { status: "success", data: addStudent(payload) };
        break;

      case "deleteStudent":
        if (payload.currentUserRole !== "Admin" && payload.currentUserRole !== "Tenaga Kependidikan") throw new Error("Akses ditolak. Penghapusan data siswa hanya dapat dilakukan oleh Admin atau Tenaga Kependidikan.");
        response = { status: "success", data: deleteStudent(payload) };
        break;

      case "importStudents":
        if (payload.currentUserRole !== "Admin" && payload.currentUserRole !== "Tenaga Kependidikan") throw new Error("Akses ditolak. Impor data siswa hanya dapat dilakukan oleh Admin atau Tenaga Kependidikan.");
        response = { status: "success", data: importStudents(payload) };
        break;

      case "importTeachers":
        if (payload.currentUserRole !== "Admin" && payload.currentUserRole !== "Tenaga Kependidikan") throw new Error("Akses ditolak. Impor data guru hanya dapat dilakukan oleh Admin atau Tenaga Kependidikan.");
        response = { status: "success", data: importTeachers(payload) };
        break;
        
      case "addSiswaGuruWali":
        response = { status: "success", data: addSiswaGuruWali(payload) };
        break;
        
      case "deleteSiswaGuruWali":
        response = { status: "success", data: deleteSiswaGuruWali(payload.id) };
        break;
        
      case "addJurnal7KAIH":
        response = { status: "success", data: addJurnal7KAIH(payload) };
        break;
        
      case "getSiswaPublic":
        response = { status: "success", data: getSiswaPublic() };
        break;
        
      case "deleteJurnal7KAIH":
        response = { status: "success", data: deleteJurnal7KAIH(payload.id) };
        break;
        
      case "addCatatanBimbingan":
        response = { status: "success", data: addCatatanBimbingan(payload) };
        break;
        
      case "deleteCatatanBimbingan":
        response = { status: "success", data: deleteCatatanBimbingan(payload.id) };
        break;
        
      case "addCatatanWaliKelas":
        response = { status: "success", data: addCatatanWaliKelas(payload) };
        break;
        
      case "deleteCatatanWaliKelas":
        response = { status: "success", data: deleteCatatanWaliKelas(payload.id) };
        break;
        
      case "addSiswaMapelPilihan":
        response = { status: "success", data: addSiswaMapelPilihan(payload) };
        break;
        
      case "deleteSiswaMapelPilihan":
        response = { status: "success", data: deleteSiswaMapelPilihan(payload) };
        break;
        
      default:
        throw new Error("Aksi '" + action + "' tidak didukung oleh API.");
    }
    
  } catch (error) {
    response = { status: "error", message: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// 1. Fungsi Login
function login(email, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var dbEmail = data[i][2].toString().toLowerCase().trim();
    var dbPassword = data[i][4].toString().trim();
    
    if (dbEmail === email.toLowerCase().trim() && dbPassword === password.trim()) {
      var roleStr = data[i][3] ? data[i][3].toString() : "";
      var rolesList = roleStr.split(",").map(function(r) { return r.trim(); }).filter(Boolean);
      var profiles = [];
      rolesList.forEach(function(r) {
        var wClass = data[i][5] || "";
        if (r === "Wali Kelas" && !wClass) {
          var matchClass = data[i][1].match(/Wali\s+Kelas\s+([A-Za-z0-9\-]+)/i);
          if (matchClass && matchClass[1]) {
            wClass = matchClass[1].trim().replace(/^(\d+)([a-zA-Z])$/, "$1-$2");
          }
        }
        profiles.push({
          id: data[i][0],
          nama: data[i][1],
          email: data[i][2],
          role: r,
          waliKelasClass: wClass
        });
      });
      
      if (profiles.length > 1) {
        return { multiple: true, profiles: profiles };
      } else {
        var firstRole = rolesList[0] || "Guru";
        var wClass = data[i][5] || "";
        if (firstRole === "Wali Kelas" && !wClass) {
          var matchClass = data[i][1].match(/Wali\s+Kelas\s+([A-Za-z0-9\-]+)/i);
          if (matchClass && matchClass[1]) {
            wClass = matchClass[1].trim().replace(/^(\d+)([a-zA-Z])$/, "$1-$2");
          }
        }
        return {
          id: data[i][0],
          nama: data[i][1],
          email: data[i][2],
          role: roleStr || "Guru",
          waliKelasClass: wClass
        };
      }
    }
  }
  throw new Error("Email atau password salah.");
}

// 2. Mengambil Seluruh Data Dashboard Sesuai Role
function getDashboard(role, email, nama, waliKelasClass) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetJurnal = ss.getSheetByName("JurnalMengajar");
  var sheetPerangkat = ss.getSheetByName("PerangkatAjar");
  var sheetNilai = ss.getSheetByName("AnalisisNilai");
  var sheetUsers = ss.getSheetByName("Users");
  var sheetJadwal = ss.getSheetByName("Jadwal");
  var sheetLaporan = ss.getSheetByName("LaporanWali");
  var sheetRekap = ss.getSheetByName("RekapAbsen");
  var sheetKondisi = ss.getSheetByName("KondisiSiswa");
  var sheetSiswaGW = ss.getSheetByName("SiswaGuruWali");
  var sheetJurnal7KAIH = ss.getSheetByName("Jurnal7KAIH");
  var sheetCatatanBimbingan = ss.getSheetByName("CatatanBimbingan");
  var sheetSiswa = ss.getSheetByName("Siswa");
  var sheetSesi = ss.getSheetByName("Sesi");
  var sheetCatatanWali = ss.getSheetByName("CatatanWaliKelas");
  
  var jurnalRaw = sheetJurnal.getDataRange().getValues();
  var perangkatRaw = sheetPerangkat.getDataRange().getValues();
  var nilaiRaw = sheetNilai.getDataRange().getValues();
  var jadwalRaw = sheetJadwal.getDataRange().getValues();
  var laporanRaw = sheetLaporan.getLastRow() > 0 ? sheetLaporan.getDataRange().getValues() : [["ID", "Tanggal", "WaliKelas", "Kelas", "Kategori", "Judul", "Isi", "TindakLanjut"]];
  var rekapRaw = (sheetRekap && sheetRekap.getLastRow() > 0) ? sheetRekap.getDataRange().getValues() : [["ID", "Bulan", "Tahun", "WaliKelas", "Kelas", "NamaSiswa", "Hadir", "Sakit", "Izin", "Alpa"]];
  var kondisiRaw = (sheetKondisi && sheetKondisi.getLastRow() > 0) ? sheetKondisi.getDataRange().getValues() : [["ID", "Bulan", "Tahun", "WaliKelas", "Kelas", "NamaSiswa", "Kehadiran", "PrestasiAkademik", "PrestasiNonAkademik", "TujuanSetelahLulus"]];
  var siswaGWRaw = (sheetSiswaGW && sheetSiswaGW.getLastRow() > 0) ? sheetSiswaGW.getDataRange().getValues() : [["ID", "NIS", "NamaSiswa", "Kelas", "GuruWali"]];
  var jurnal7KAIHRaw = (sheetJurnal7KAIH && sheetJurnal7KAIH.getLastRow() > 0) ? sheetJurnal7KAIH.getDataRange().getValues() : [["ID", "Tanggal", "NIS", "NamaSiswa", "BangunPagi", "Beribadah", "Berolahraga", "MakanSehat", "GemarBelajar", "Bermasyarakat", "TidurCepat"]];
  var catatanBimbinganRaw = (sheetCatatanBimbingan && sheetCatatanBimbingan.getLastRow() > 0) ? sheetCatatanBimbingan.getDataRange().getValues() : [["ID", "Tanggal", "GuruWali", "NamaSiswa", "CatatanPerkembangan"]];
  var siswaRaw = (sheetSiswa && sheetSiswa.getLastRow() > 0) ? sheetSiswa.getDataRange().getValues() : [["ID", "NIS", "NamaSiswa", "Kelas"]];
  var sesiRaw = (sheetSesi && sheetSesi.getLastRow() > 0) ? sheetSesi.getDataRange().getValues() : [["ID", "NamaSesi", "JamMulai", "JamSelesai"]];
  var catatanWaliRaw = (sheetCatatanWali && sheetCatatanWali.getLastRow() > 0) ? sheetCatatanWali.getDataRange().getValues() : [["ID", "Tanggal", "WaliKelas", "Kelas", "NamaSiswa", "Catatan"]];
  
  var result = {
    role: role,
    stats: {},
    jurnalList: [],
    perangkatList: [],
    nilaiList: [],
    jadwalList: [],
    laporanWaliList: [],
    rekapAbsenList: [],
    kondisiSiswaList: [],
    siswaGuruWaliList: [],
    jurnal7KAIHList: [],
    catatanBimbinganList: [],
    catatanWaliKelasList: [],
    studentList: [],
    sesiList: []
  };
  
  // Format Sesi list
  for (var i = 1; i < sesiRaw.length; i++) {
    var row = sesiRaw[i];
    result.sesiList.push({
      id: row[0],
      namaSesi: row[1],
      jamMulai: row[2],
      jamSelesai: row[3]
    });
  }
  
  // Format Jurnal list
  for (var i = 1; i < jurnalRaw.length; i++) {
    var row = jurnalRaw[i];
    result.jurnalList.push({
      id: row[0],
      tanggal: row[1],
      guru: row[2],
      kelas: row[3],
      materi: row[4],
      kehadiran: row[5],
      catatan: row[6],
      mode: row[7] || "Tatap Muka",
      mapel: row[8] || "",
      sesi: row[9] || ""
    });
  }
  
  // Format Rekap Absen list
  for (var i = 1; i < rekapRaw.length; i++) {
    var row = rekapRaw[i];
    result.rekapAbsenList.push({
      id: row[0],
      bulan: row[1],
      tahun: row[2],
      waliKelas: row[3],
      kelas: row[4],
      namaSiswa: row[5],
      hadir: parseInt(row[6]) || 0,
      sakit: parseInt(row[7]) || 0,
      izin: parseInt(row[8]) || 0,
      alpa: parseInt(row[9]) || 0
    });
  }

  // Format Kondisi Siswa list
  for (var i = 1; i < kondisiRaw.length; i++) {
    var row = kondisiRaw[i];
    result.kondisiSiswaList.push({
      id: row[0],
      bulan: row[1],
      tahun: row[2],
      waliKelas: row[3],
      kelas: row[4],
      namaSiswa: row[5],
      kehadiran: row[6],
      prestasiAkademik: row[7],
      prestasiNonAkademik: row[8],
      tujuanSetelahLulus: row[9]
    });
  }
  
  // Format Perangkat list
  for (var i = 1; i < perangkatRaw.length; i++) {
    var row = perangkatRaw[i];
    result.perangkatList.push({
      id: row[0],
      namaGuru: row[1],
      jenisDokumen: row[2],
      linkDrive: row[3],
      status: row[4],
      catatan: row[5]
    });
  }
  
  // Format Analisis Nilai list
  for (var i = 1; i < nilaiRaw.length; i++) {
    var row = nilaiRaw[i];
    result.nilaiList.push({
      id: row[0],
      kelas: row[1],
      mapel: row[2],
      rataNilai: row[3],
      jumlahSiswaRemidial: row[4]
    });
  }

  // Format Jadwal list
  for (var i = 1; i < jadwalRaw.length; i++) {
    var row = jadwalRaw[i];
    if (row[0] && row[1]) {
      result.jadwalList.push({
        id: row[0],
        hari: row[1],
        jamKe: row[2],
        kelas: row[3],
        guru: row[4],
        mapel: row[5]
      });
    }
  }

  // Format Laporan Wali Kelas list
  for (var i = 1; i < laporanRaw.length; i++) {
    var row = laporanRaw[i];
    result.laporanWaliList.push({
      id: row[0],
      tanggal: row[1],
      waliKelas: row[2],
      kelas: row[3],
      kategori: row[4],
      judul: row[5],
      isi: row[6],
      tindakLanjut: row[7]
    });
  }

  // Format Siswa Guru Wali list
  for (var i = 1; i < siswaGWRaw.length; i++) {
    var row = siswaGWRaw[i];
    result.siswaGuruWaliList.push({
      id: row[0],
      nis: row[1],
      namaSiswa: row[2],
      kelas: row[3],
      guruWali: row[4]
    });
  }

  // Format Jurnal 7KAIH list
  for (var i = 1; i < jurnal7KAIHRaw.length; i++) {
    var row = jurnal7KAIHRaw[i];
    result.jurnal7KAIHList.push({
      id: row[0],
      tanggal: row[1],
      nis: row[2],
      namaSiswa: row[3],
      bangunPagi: row[4],
      beribadah: row[5],
      berolahraga: row[6],
      makanSehat: row[7],
      gemarBelajar: row[8],
      bermasyarakat: row[9],
      tidurCepat: row[10],
      guruWali: row[11] || "",
      kelas: row[12] || ""
    });
  }

  // Format Catatan Bimbingan list
  for (var i = 1; i < catatanBimbinganRaw.length; i++) {
    var row = catatanBimbinganRaw[i];
    result.catatanBimbinganList.push({
      id: row[0],
      tanggal: row[1],
      guruWali: row[2],
      namaSiswa: row[3],
      catatanPerkembangan: row[4]
    });
  }

  // Format Catatan Wali Kelas list
  for (var i = 1; i < catatanWaliRaw.length; i++) {
    var row = catatanWaliRaw[i];
    result.catatanWaliKelasList.push({
      id: row[0],
      tanggal: row[1],
      waliKelas: row[2],
      kelas: row[3],
      namaSiswa: row[4],
      catatan: row[5]
    });
  }

  // Format Student master list
  for (var i = 1; i < siswaRaw.length; i++) {
    var row = siswaRaw[i];
    result.studentList.push({
      id: row[0],
      nis: row[1],
      namaSiswa: row[2],
      kelas: row[3],
      tingkatan: row[4] || ""
    });
  }
  
  // Sort lists
  result.jurnalList.reverse();
  result.perangkatList.reverse();
  result.nilaiList.reverse();
  result.laporanWaliList.reverse();
  result.rekapAbsenList.reverse();
  result.kondisiSiswaList.reverse();
  result.siswaGuruWaliList.reverse();
  result.jurnal7KAIHList.reverse();
  result.catatanBimbinganList.reverse();
  result.catatanWaliKelasList.reverse();
  result.studentList.reverse();

  // Auto-merge missing students into studentList from other lists to prevent missing student names in Guru account
  var studentKeys = {};
  result.studentList.forEach(function(s) {
    var key = (s.namaSiswa ? s.namaSiswa.toLowerCase().trim() : "") + "|" + (s.kelas ? s.kelas.toLowerCase().trim() : "");
    studentKeys[key] = true;
  });
  
  result.siswaGuruWaliList.forEach(function(s) {
    var key = (s.namaSiswa ? s.namaSiswa.toLowerCase().trim() : "") + "|" + (s.kelas ? s.kelas.toLowerCase().trim() : "");
    if (s.namaSiswa && !studentKeys[key]) {
      result.studentList.push({
        id: s.id || ("SIS-AUTO-" + new Date().getTime()),
        nis: s.nis || "",
        namaSiswa: s.namaSiswa,
        kelas: s.kelas,
        tingkatan: ""
      });
      studentKeys[key] = true;
    }
  });

  result.rekapAbsenList.forEach(function(ra) {
    var key = (ra.namaSiswa ? ra.namaSiswa.toLowerCase().trim() : "") + "|" + (ra.kelas ? ra.kelas.toLowerCase().trim() : "");
    if (ra.namaSiswa && !studentKeys[key]) {
      result.studentList.push({
        id: ra.id || ("SIS-AUTO-" + new Date().getTime()),
        nis: "",
        namaSiswa: ra.namaSiswa,
        kelas: ra.kelas,
        tingkatan: ""
      });
      studentKeys[key] = true;
    }
  });

  // Format GuruMaster list
  var sheetGuruMaster = ss.getSheetByName("GuruMaster");
  var guruMasterRaw = sheetGuruMaster ? sheetGuruMaster.getDataRange().getValues() : [["ID", "NamaGuru", "Mapel", "Kelas", "JumlahJam"]];
  result.guruMasterList = [];
  for (var i = 1; i < guruMasterRaw.length; i++) {
    var row = guruMasterRaw[i];
    result.guruMasterList.push({
      id: row[0],
      guru: row[1],
      mapel: row[2],
      kelas: row[3],
      jumlahJam: parseInt(row[4]) || 0
    });
  }

  // Format KelasMapelPilihan list
  var sheetMapelPil = ss.getSheetByName("KelasMapelPilihan");
  var mapelPilRaw = sheetMapelPil ? sheetMapelPil.getDataRange().getValues() : [["ID", "GuruEmail", "NamaKelas", "Tingkatan", "NamaSiswa", "NIS"]];
  result.kelasMapelPilihanList = [];
  for (var i = 1; i < mapelPilRaw.length; i++) {
    var row = mapelPilRaw[i];
    result.kelasMapelPilihanList.push({
      id: row[0],
      guruEmail: row[1],
      namaKelas: row[2],
      tingkatan: row[3],
      namaSiswa: row[4],
      nis: row[5]
    });
  }

  // Format Settings list
  var sheetSettings = ss.getSheetByName("Settings");
  var settingsRaw = sheetSettings ? sheetSettings.getDataRange().getValues() : [["Key", "Value"]];
  result.settings = { hariBelajar: 5, daftarKelas: ["X.1", "X.2", "XI.1", "XI.2", "XII.1", "XII.2"] };
  for (var i = 1; i < settingsRaw.length; i++) {
    var row = settingsRaw[i];
    if (row[0].toString().trim() === "hari_belajar") {
      result.settings.hariBelajar = parseInt(row[1]) || 5;
    } else if (row[0].toString().trim() === "daftar_kelas") {
      var val = row[1].toString().trim();
      result.settings.daftarKelas = val ? val.split(",") : ["X.1", "X.2", "XI.1", "XI.2", "XII.1", "XII.2"];
    }
  }

  // Format Users list
  var usersRaw = sheetUsers.getDataRange().getValues();
  result.teacherList = [];
  for (var i = 1; i < usersRaw.length; i++) {
    var row = usersRaw[i];
    var roleStr = row[3] ? row[3].toString() : "";
    var roles = roleStr.split(",").map(function(r) { return r.trim(); });
    var isTeacher = roles.some(function(r) {
      return r === "Guru" || r === "Wali Kelas" || r === "Guru Wali" || r === "Kepala Sekolah" || r === "Wakasek" || r === "Guru BK" || r === "Tenaga Kependidikan";
    });
    if (isTeacher) {
      result.teacherList.push({
        id: row[0],
        nama: row[1],
        email: row[2],
        role: row[3],
        password: row[4],
        waliKelasClass: row[5] || "",
        mapel: row[6] || ""
      });
    }
  }
  
  // Create stats based on role
  var totalUsersCount = usersRaw.length > 1 ? usersRaw.length - 1 : 0;
  
  if (role === "Wakasek" || role === "Admin") {
    var totalGuru = totalUsersCount;
    var totalJurnal = result.jurnalList.length;
    
    var pendingPerangkat = 0;
    var approvedPerangkat = 0;
    result.perangkatList.forEach(function(item) {
      if (item.status === "Pending") pendingPerangkat++;
      else if (item.status === "Disetujui") approvedPerangkat++;
    });
    
    var sumRata = 0;
    result.nilaiList.forEach(function(item) {
      sumRata += parseFloat(item.rataNilai) || 0;
    });
    var avgNilai = result.nilaiList.length > 0 ? (sumRata / result.nilaiList.length).toFixed(1) : "0.0";
    
    result.stats = {
      totalGuru: totalGuru,
      totalJurnal: totalJurnal,
      pendingPerangkat: pendingPerangkat,
      approvedPerangkat: approvedPerangkat,
      avgNilaiSekolah: avgNilai,
      totalLaporanWali: result.laporanWaliList.length
    };
  } 
  else if (role === "Guru") {
    var guruJurnal = result.jurnalList.filter(function(j) {
      return isTeacherMatch(j.guru, nama);
    });
    var guruPerangkat = result.perangkatList.filter(function(p) {
      return isTeacherMatch(p.namaGuru, nama);
    });
    var guruJadwal = result.jadwalList.filter(function(jd) {
      return isTeacherMatch(jd.guru, nama);
    });
    
    var pending = 0;
    var disetujui = 0;
    guruPerangkat.forEach(function(p) {
      if (p.status === "Pending") pending++;
      else if (p.status === "Disetujui") disetujui++;
    });
    
    result.stats = {
      totalJurnalGuru: guruJurnal.length,
      pendingPerangkatGuru: pending,
      disetujuiPerangkatGuru: disetujui,
      totalJadwalGuru: guruJadwal.length
    };
    
    result.jurnalList = guruJurnal;
    result.perangkatList = guruPerangkat;
    result.guruJadwalList = guruJadwal;
    result.laporanWaliList = [];
    result.rekapAbsenList = result.rekapAbsenList; // Do not clear, so Guru can use as fallback for student names
    result.kondisiSiswaList = [];
    result.siswaGuruWaliList = result.siswaGuruWaliList; // Do not clear, so Guru can use as fallback for student names
    result.jurnal7KAIHList = [];
    result.catatanWaliKelasList = [];
  }
  else if (role === "Wali Kelas") {
    var myRekap = result.rekapAbsenList.filter(function(ra) {
      return isTeacherMatch(ra.waliKelas, nama);
    });
    
    result.stats = {
      totalJurnalSekolah: result.jurnalList.length,
      totalRekapSaya: myRekap.length
    };
    
    result.rekapAbsenList = myRekap;
    
    // Filter journals to class bimbingan if possible
    var myClass = waliKelasClass || "";
    if (!myClass) {
      var matchClass = nama.match(/Wali Kelas\s+([A-Za-zA-Z0-9\-]+)/i);
      if (matchClass && matchClass[1]) {
        myClass = matchClass[1].trim().replace(/^(\d+)([a-zA-Z])$/, "$1-$2");
      }
    }
    if (myClass) {
      result.jurnalList = result.jurnalList.filter(function(j) {
        return j.kelas.toLowerCase() === myClass.toLowerCase();
      });
    }
    
    result.laporanWaliList = [];
    result.kondisiSiswaList = [];
    result.siswaGuruWaliList = [];
    result.jurnal7KAIHList = [];
    result.catatanWaliKelasList = result.catatanWaliKelasList.filter(function(cw) {
      return isTeacherMatch(cw.waliKelas, nama);
    });
  }
  else if (role === "Guru Wali") {
    var myStudents = result.siswaGuruWaliList.filter(function(s) {
      return isTeacherMatch(s.guruWali, nama) || (s.guruWali && email && s.guruWali.toLowerCase().indexOf(email.toLowerCase()) !== -1);
    });
    
    var myStudentNisList = myStudents.map(function(s) { return s.nis ? s.nis.toString().trim() : ""; });
    var myStudentNamesList = myStudents.map(function(s) { return s.namaSiswa ? s.namaSiswa.toLowerCase().trim() : ""; });
    
    var myJurnal7KAIH = result.jurnal7KAIHList.filter(function(j) {
      var isMatchNis = j.nis && myStudentNisList.indexOf(j.nis.toString().trim()) !== -1;
      var isMatchName = j.namaSiswa && myStudentNamesList.indexOf(j.namaSiswa.toLowerCase().trim()) !== -1;
      var isMatchGW = isTeacherMatch(j.guruWali, nama) || (j.guruWali && email && j.guruWali.toLowerCase().indexOf(email.toLowerCase()) !== -1);
      return isMatchNis || isMatchName || isMatchGW;
    });
    
    var myCatatanBimbingan = result.catatanBimbinganList.filter(function(c) {
      return isTeacherMatch(c.guruWali, nama) || (c.guruWali && email && c.guruWali.toLowerCase().indexOf(email.toLowerCase()) !== -1);
    });
    
    result.stats = {
      totalSiswaBimbingan: myStudents.length,
      totalJurnal7KAIH: myJurnal7KAIH.length,
      totalCatatanBimbingan: myCatatanBimbingan.length
    };
    
    result.siswaGuruWaliList = myStudents;
    result.jurnal7KAIHList = myJurnal7KAIH;
    result.catatanBimbinganList = myCatatanBimbingan;
    
    result.jurnalList = [];
    result.perangkatList = [];
    result.nilaiList = [];
    result.laporanWaliList = [];
    result.kondisiSiswaList = [];
    
    var myRekap = result.rekapAbsenList.filter(function(ra) {
      return ra.namaSiswa && myStudentNamesList.indexOf(ra.namaSiswa.toLowerCase().trim()) !== -1;
    });
    result.rekapAbsenList = myRekap;
    
    var myCatatanWali = result.catatanWaliKelasList.filter(function(cw) {
      return cw.namaSiswa && myStudentNamesList.indexOf(cw.namaSiswa.toLowerCase().trim()) !== -1;
    });
    result.catatanWaliKelasList = myCatatanWali;
  }
  else if (role === "Kepala Sekolah") {
    var totalGuru = totalUsersCount;
    var totalJurnal = result.jurnalList.length;
    var pendingPerangkat = 0;
    var approvedPerangkat = 0;
    result.perangkatList.forEach(function(item) {
      if (item.status === "Pending") pendingPerangkat++;
      else if (item.status === "Disetujui") approvedPerangkat++;
    });
    
    var sumRata = 0;
    result.nilaiList.forEach(function(item) {
      sumRata += parseFloat(item.rataNilai) || 0;
    });
    var avgNilai = result.nilaiList.length > 0 ? (sumRata / result.nilaiList.length).toFixed(1) : "0.0";
    
    result.stats = {
      totalGuru: totalGuru,
      totalJurnal: totalJurnal,
      pendingPerangkat: pendingPerangkat,
      approvedPerangkat: approvedPerangkat,
      avgNilaiSekolah: avgNilai,
      totalLaporanWali: result.laporanWaliList.length,
      totalJurnal7KAIH: result.jurnal7KAIHList.length,
      totalCatatanBimbingan: result.catatanBimbinganList.length
    };
  }
  else if (role === "Guru BK") {
    result.stats = {
      totalSiswaBimbingan: result.studentList.length,
      totalJurnal7KAIH: result.jurnal7KAIHList.length,
      totalCatatanBimbingan: result.catatanBimbinganList.length
    };
    
    // Guru BK can guide any student in the school
    result.siswaGuruWaliList = result.studentList.map(function(s) {
      return {
        id: s.id,
        nis: s.nis,
        namaSiswa: s.namaSiswa,
        kelas: s.kelas,
        guruWali: "Guru BK"
      };
    });
    
    result.jurnalList = [];
    result.perangkatList = [];
    result.nilaiList = [];
    result.laporanWaliList = [];
    result.rekapAbsenList = [];
    result.kondisiSiswaList = [];
    result.catatanWaliKelasList = [];
  }
  else if (role === "Tenaga Kependidikan") {
    var totalGuru = sheetUsers.getDataRange().getValues().length - 1;
    var totalJurnal = result.jurnalList.length;
    var pendingPerangkat = 0;
    var approvedPerangkat = 0;
    result.perangkatList.forEach(function(item) {
      if (item.status === "Pending") pendingPerangkat++;
      else if (item.status === "Disetujui") approvedPerangkat++;
    });
    
    var sumRata = 0;
    result.nilaiList.forEach(function(item) {
      sumRata += parseFloat(item.rataNilai) || 0;
    });
    var avgNilai = result.nilaiList.length > 0 ? (sumRata / result.nilaiList.length).toFixed(1) : "0.0";
    
    result.stats = {
      totalGuru: totalGuru,
      totalJurnal: totalJurnal,
      pendingPerangkat: pendingPerangkat,
      approvedPerangkat: approvedPerangkat,
      avgNilaiSekolah: avgNilai,
      totalLaporanWali: result.laporanWaliList.length
    };
    result.catatanWaliKelasList = [];
  }
  
  return result;
}

// 3. Menambah Jurnal Mengajar
function addJurnal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("JurnalMengajar");
  var data = sheet.getDataRange().getValues();
  
  var id = payload.id || "";
  var tanggal = payload.tanggal || new Date().toISOString().substring(0, 10);
  var guru = payload.guru || payload.currentUserName;
  var kelas = payload.kelas || "";
  var materi = payload.materi || "";
  var kehadiran = payload.kehadiran || "";
  var catatan = payload.catatan || "";
  var mode = payload.mode || "Tatap Muka";
  var mapel = payload.mapel || "";
  var sesi = payload.sesi || "";
  
  // Jika ID dikirim, update baris yang sudah ada
  if (id) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.getRange(i + 1, 2, 1, 9).setValues([[tanggal, guru, kelas, materi, kehadiran, catatan, mode, mapel, sesi]]);
        SpreadsheetApp.flush();
        return { id: id, success: true };
      }
    }
  }
  
  var newId = "JR-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  sheet.appendRow([newId, tanggal, guru, kelas, materi, kehadiran, catatan, mode, mapel, sesi]);
  SpreadsheetApp.flush();
  
  return { id: newId, success: true };
}

// Menghapus Jurnal Mengajar Guru
function deleteJurnal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("JurnalMengajar");
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Jurnal tidak ditemukan.");
}

// 4. Sinkronisasi Data Jurnal Offline
function syncOfflineJurnal(jurnalList) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("JurnalMengajar");
  var count = 0;
  
  jurnalList.forEach(function(j) {
    var id = j.id || ("JR-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000));
    var tanggal = j.tanggal;
    var guru = j.guru;
    var kelas = j.kelas;
    var materi = j.materi;
    var kehadiran = j.kehadiran;
    var catatan = j.catatan;
    var mode = j.mode || "Tatap Muka";
    var mapel = j.mapel || "";
    var sesi = j.sesi || "";
    
    sheet.appendRow([id, tanggal, guru, kelas, materi, kehadiran, catatan, mode, mapel, sesi]);
    count++;
  });
  
  SpreadsheetApp.flush();
  return { syncedCount: count, success: true };
}

// 4b. Manajemen Sesi Pelajaran (Admin Only)
function addSesi(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Sesi");
  var data = sheet.getDataRange().getValues();
  
  var id = payload.id || "";
  var namaSesi = payload.namaSesi || "";
  var jamMulai = payload.jamMulai || "";
  var jamSelesai = payload.jamSelesai || "";
  
  if (id) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.getRange(i + 1, 2, 1, 3).setValues([[namaSesi, jamMulai, jamSelesai]]);
        SpreadsheetApp.flush();
        return { id: id, success: true };
      }
    }
  }
  
  var newId = "SES-" + new Date().getTime();
  sheet.appendRow([newId, namaSesi, jamMulai, jamSelesai]);
  SpreadsheetApp.flush();
  return { id: newId, success: true };
}

function deleteSesi(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Sesi");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Sesi tidak ditemukan.");
}

// 5. Menambah Dokumen Perangkat Ajar
function addPerangkat(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PerangkatAjar");
  var data = sheet.getDataRange().getValues();
  
  var id = payload.id || "";
  var namaGuru = payload.namaGuru || payload.currentUserName;
  var jenisDokumen = payload.jenisDokumen || "";
  var linkDrive = payload.linkDrive || "";
  var status = payload.status || "Pending";
  var catatan = payload.catatan || "";
  
  // Proses unggah berkas langsung ke Google Drive jika tersedia data Base64
  if (payload.fileBase64 && payload.fileName && payload.fileMimeType) {
    try {
      var byteData = Utilities.base64Decode(payload.fileBase64);
      var blob = Utilities.newBlob(byteData, payload.fileMimeType, payload.fileName);
      
      // Upload ke Google Drive root / folder script
      var file = DriveApp.createFile(blob);
      
      // Atur hak akses agar siapa saja yang memiliki link bisa membuka berkas
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Ambil tautan unduhan langsung berkas
      linkDrive = "https://drive.google.com/uc?export=download&id=" + file.getId();
    } catch (e) {
      linkDrive = "Gagal Unggah: " + e.toString();
    }
  }
  
  // Jika ID dikirim, lakukan update baris
  if (id) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        var finalLink = linkDrive || data[i][3].toString();
        sheet.getRange(i + 1, 2, 1, 5).setValues([[namaGuru, jenisDokumen, finalLink, status, catatan]]);
        SpreadsheetApp.flush();
        return { id: id, success: true, linkDrive: finalLink };
      }
    }
  }
  
  var newId = "PR-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  sheet.appendRow([newId, namaGuru, jenisDokumen, linkDrive, status, catatan]);
  SpreadsheetApp.flush();
  
  return { id: newId, success: true, linkDrive: linkDrive };
}

// Menghapus berkas Perangkat Ajar
function deletePerangkat(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PerangkatAjar");
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Perangkat tidak ditemukan.");
}

// Ekstrak File ID dari Tautan Google Drive
function getFileIdFromUrl(url) {
  var id = "";
  if (url.indexOf("id=") > -1) {
    id = url.split("id=")[1].split("&")[0];
  } else if (url.indexOf("/d/") > -1) {
    id = url.split("/d/")[1].split("/")[0];
  }
  return id;
}

// Download berkas Perangkat Ajar langsung ke perangkat
function downloadPerangkatFile(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PerangkatAjar");
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  
  var url = "";
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      url = data[i][3].toString();
      break;
    }
  }
  
  if (!url) throw new Error("File tidak ditemukan.");
  
  var fileId = getFileIdFromUrl(url);
  if (!fileId) throw new Error("Tautan file tidak valid.");
  
  var file = DriveApp.getFileById(fileId);
  var blob = file.getBlob();
  var base64 = Utilities.base64Encode(blob.getBytes());
  
  return {
    base64: base64,
    fileName: file.getName(),
    mimeType: blob.getContentType()
  };
}

// 6. Validasi/Pembaruan Status Perangkat Ajar oleh Kepala Sekolah
function updatePerangkatStatus(id, status, catatan) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PerangkatAjar");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.getRange(i + 1, 5, 1, 2).setValues([[status, catatan]]);
      SpreadsheetApp.flush();
      return { id: id, status: status, success: true };
    }
  }
  throw new Error("Dokumen dengan ID " + id + " tidak ditemukan.");
}

// 7. Menambah Analisis Nilai
function addAnalisisNilai(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("AnalisisNilai");
  
  var id = "NL-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var kelas = payload.kelas || "";
  var mapel = payload.mapel || "";
  var rataNilai = parseFloat(payload.rataNilai) || 0;
  var jumlahSiswaRemidial = parseInt(payload.jumlahSiswaRemidial) || 0;
  
  sheet.appendRow([id, kelas, mapel, rataNilai, jumlahSiswaRemidial]);
  SpreadsheetApp.flush();
  
  return { id: id, success: true };
}

// 8. Menambah/Mengubah Jadwal Mengajar Guru
function addJadwal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jadwal");
  var data = sheet.getDataRange().getValues();
  
  var id = payload.id || "";
  var hari = payload.hari.trim();
  var jamKe = payload.jamKe.toString().trim(); // Memuat waktu mengajar (misal: 08:00-09:30)
  var kelas = payload.kelas.trim();
  var guru = payload.guru.trim();
  var mapel = payload.mapel ? payload.mapel.trim() : "";
  
  // Jika ID dikirim, update baris jadwal yang ada
  if (id) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.getRange(i + 1, 2, 1, 5).setValues([[hari, jamKe, kelas, guru, mapel]]);
        SpreadsheetApp.flush();
        return { id: id, success: true };
      }
    }
  }
  
  var newId = "SCH-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  sheet.appendRow([newId, hari, jamKe, kelas, guru, mapel]);
  SpreadsheetApp.flush();
  
  return { id: newId, success: true };
}

// 9. Menghapus Jadwal Mengajar
function deleteJadwal(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jadwal");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Jadwal dengan ID " + id + " tidak ditemukan.");
}

// 10. Menambah Laporan Wali Kelas
function addLaporanWali(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("LaporanWali");
  
  var id = "LW-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var tanggal = new Date().toISOString().substring(0, 10);
  var waliKelas = payload.currentUserName;
  var kelas = payload.kelas || "";
  var kategori = payload.kategori || "";
  var judul = payload.judul || "";
  var isi = payload.isi || "";
  var tindakLanjut = payload.tindakLanjut || "";
  
  sheet.appendRow([id, tanggal, waliKelas, kelas, kategori, judul, isi, tindakLanjut]);
  SpreadsheetApp.flush();
  
  return { id: id, success: true };
}

// 11. Tambah/Edit Master Tugas Guru
function addGuruMaster(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("GuruMaster");
  if (!sheet) {
    sheet = ss.insertSheet("GuruMaster");
    sheet.appendRow(["ID", "NamaGuru", "Mapel", "Kelas", "JumlahJam"]);
  }
  
  var id = payload.id || "GM-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var guru = payload.guru || "";
  var mapel = payload.mapel || "";
  var kelas = payload.kelas || "";
  var jumlahJam = parseInt(payload.jumlahJam) || 0;
  
  if (payload.id) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.getRange(i + 1, 2, 1, 4).setValues([[guru, mapel, kelas, jumlahJam]]);
        SpreadsheetApp.flush();
        return { id: id, success: true };
      }
    }
  }
  
  sheet.appendRow([id, guru, mapel, kelas, jumlahJam]);
  SpreadsheetApp.flush();
  return { id: id, success: true };
}

// 12. Hapus Master Tugas Guru
function deleteGuruMaster(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("GuruMaster");
  if (!sheet) throw new Error("Sheet GuruMaster tidak ditemukan.");
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Data master guru tidak ditemukan.");
}

// 13. Update Konfigurasi Setelan Sekolah
function updateSettings(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    sheet = ss.insertSheet("Settings");
    sheet.appendRow(["Key", "Value"]);
  }
  
  var key = payload.key;
  var value = payload.value.toString();
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  
  sheet.appendRow([key, value]);
  SpreadsheetApp.flush();
  return { success: true };
}

// 14. Menyimpan Roster Hasil Generate Massal
function saveGeneratedSchedule(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jadwal");
  if (!sheet) {
    sheet = ss.insertSheet("Jadwal");
    sheet.appendRow(["ID", "Hari", "JamKe", "Kelas", "Guru", "Mapel"]);
  }
  
  // Hapus semua data lama (sisakan baris header)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  var scheduleList = payload.scheduleList || [];
  if (scheduleList.length > 0) {
    var rowsToWrite = [];
    var timestamp = new Date().getTime();
    scheduleList.forEach(function(item, idx) {
      var id = "SCH-" + timestamp + "-" + idx;
      rowsToWrite.push([
        id,
        item.hari,
        item.jamKe.toString(),
        item.kelas,
        item.guru,
        item.mapel
      ]);
    });
    
    // Tulis data secara massal (batch write)
    sheet.getRange(2, 1, rowsToWrite.length, 6).setValues(rowsToWrite);
  }
  
  SpreadsheetApp.flush();
  return { success: true, count: scheduleList.length };
}

// 10. Tambah Guru / Wali Kelas (Manajemen Guru)
function addTeacher(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  
  var id = payload.id || ("USR-" + new Date().getTime());
  var nama = payload.nama;
  var email = payload.email;
  var role = payload.role || "Guru"; 
  var password = payload.password;
  var waliKelasClass = payload.waliKelasClass || "";
  var mapel = payload.mapel || "";
  
  var data = sheet.getDataRange().getValues();
  var index = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      index = i;
      break;
    }
  }
  
  if (index !== -1) {
    // Edit User
    sheet.getRange(index + 1, 2).setValue(nama);
    sheet.getRange(index + 1, 3).setValue(email);
    sheet.getRange(index + 1, 4).setValue(role);
    sheet.getRange(index + 1, 5).setValue(password);
    sheet.getRange(index + 1, 6).setValue(waliKelasClass);
    sheet.getRange(index + 1, 7).setValue(mapel);
  } else {
    // Tambah Baru
    sheet.appendRow([id, nama, email, role, password, waliKelasClass, mapel]);
  }
  
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

// 11. Hapus Guru / Wali Kelas (Manajemen Guru) (Mendukung ID Tunggal maupun Massal)
function deleteTeacher(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  if (!sheet) throw new Error("Sheet Users tidak ditemukan.");
  
  var ids = [];
  if (payload && payload.ids) {
    ids = payload.ids;
  } else if (payload && payload.id) {
    ids = [payload.id];
  } else if (typeof payload === "string") {
    ids = [payload];
  } else if (payload && typeof payload === "object") {
    ids = [payload.id];
  }
  
  var data = sheet.getDataRange().getValues();
  var count = 0;
  // Hapus baris dari bawah ke atas agar indeks baris tidak bergeser
  for (var i = data.length - 1; i >= 1; i--) {
    if (ids.indexOf(data[i][0].toString()) !== -1) {
      sheet.deleteRow(i + 1);
      count++;
    }
  }
  
  SpreadsheetApp.flush();
  return { success: true, count: count };
}

// Tambah/Edit Data Siswa
function addStudent(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Siswa");
  if (!sheet) {
    sheet = ss.insertSheet("Siswa");
    sheet.appendRow(["ID", "NIS", "NamaSiswa", "Kelas", "Tingkatan"]);
  }
  
  var id = payload.id || ("SIS-" + new Date().getTime());
  var nis = payload.nis || "";
  var namaSiswa = payload.namaSiswa;
  var kelas = payload.kelas;
  var tingkatan = payload.tingkatan || "";
  
  var data = sheet.getDataRange().getValues();
  var index = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      index = i;
      break;
    }
  }
  
  if (index !== -1) {
    sheet.getRange(index + 1, 2).setValue(nis);
    sheet.getRange(index + 1, 3).setValue(namaSiswa);
    sheet.getRange(index + 1, 4).setValue(kelas);
    sheet.getRange(index + 1, 5).setValue(tingkatan);
  } else {
    sheet.appendRow([id, nis, namaSiswa, kelas, tingkatan]);
  }
  
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

// Hapus Data Siswa (Mendukung ID Tunggal maupun Massal)
function deleteStudent(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Siswa");
  if (!sheet) throw new Error("Sheet Siswa tidak ditemukan.");
  
  var ids = [];
  if (payload && payload.ids) {
    ids = payload.ids;
  } else if (payload && payload.id) {
    ids = [payload.id];
  } else {
    ids = [payload];
  }
  
  var data = sheet.getDataRange().getValues();
  var count = 0;
  // Hapus baris dari bawah ke atas agar indeks baris tidak bergeser
  for (var i = data.length - 1; i >= 1; i--) {
    if (ids.indexOf(data[i][0].toString()) !== -1) {
      sheet.deleteRow(i + 1);
      count++;
    }
  }
  
  SpreadsheetApp.flush();
  return { success: true, count: count };
}

// Impor Siswa Massal dari Excel
function importStudents(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Siswa");
  if (!sheet) {
    sheet = ss.insertSheet("Siswa");
    sheet.appendRow(["ID", "NIS", "NamaSiswa", "Kelas", "Tingkatan"]);
  }
  
  var list = payload.list || [];
  if (list.length === 0) return { success: true, count: 0 };
  
  var existingData = sheet.getDataRange().getValues();
  var existingNisMap = {};
  for (var i = 1; i < existingData.length; i++) {
    var nisKey = existingData[i][1] ? existingData[i][1].toString().trim() : "";
    if (nisKey) {
      existingNisMap[nisKey] = i + 1; // baris di excel
    }
  }
  
  var timestamp = new Date().getTime();
  list.forEach(function(item, idx) {
    var id = item.id || ("SIS-" + timestamp + "-" + idx + "-" + Math.floor(Math.random() * 100));
    var nis = item.nis ? item.nis.toString().trim() : "";
    var namaSiswa = item.namaSiswa || "";
    var kelas = item.kelas || "";
    var tingkatan = item.tingkatan || "";
    if (!tingkatan && kelas) {
      if (kelas.startsWith("10")) tingkatan = "X";
      else if (kelas.startsWith("11")) tingkatan = "XI";
      else if (kelas.startsWith("12")) tingkatan = "XII";
    }
    
    // Validasi duplikasi NIS: jika NIS sudah ada, update baris lama. Jika tidak, append baru
    if (nis && existingNisMap[nis]) {
      var rowNum = existingNisMap[nis];
      sheet.getRange(rowNum, 3).setValue(namaSiswa);
      sheet.getRange(rowNum, 4).setValue(kelas);
      sheet.getRange(rowNum, 5).setValue(tingkatan);
    } else {
      sheet.appendRow([id, nis, namaSiswa, kelas, tingkatan]);
    }
  });
  
  SpreadsheetApp.flush();
  return { success: true, count: list.length };
}

// Impor Guru Massal dari Excel
function importTeachers(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  
  var list = payload.list || [];
  if (list.length === 0) return { success: true, count: 0 };
  
  var existingData = sheet.getDataRange().getValues();
  var existingEmailMap = {};
  for (var i = 1; i < existingData.length; i++) {
    var emailKey = existingData[i][2] ? existingData[i][2].toString().toLowerCase().trim() : "";
    if (emailKey) {
      existingEmailMap[emailKey] = i + 1; // baris di excel
    }
  }
  
  var timestamp = new Date().getTime();
  list.forEach(function(item, idx) {
    var id = item.id || ("USR-" + timestamp + "-" + idx + "-" + Math.floor(Math.random() * 100));
    var nama = item.nama || "";
    var email = item.email ? item.email.toString().toLowerCase().trim() : "";
    var role = item.role || "Guru";
    var password = item.password ? item.password.toString().trim() : "guru123";
    var waliKelasClass = item.waliKelasClass || "";
    var mapel = item.mapel || "";
    
    if (email && existingEmailMap[email]) {
      var rowNum = existingEmailMap[email];
      sheet.getRange(rowNum, 2).setValue(nama);
      sheet.getRange(rowNum, 4).setValue(role);
      sheet.getRange(rowNum, 5).setValue(password);
      sheet.getRange(rowNum, 6).setValue(waliKelasClass);
      sheet.getRange(rowNum, 7).setValue(mapel);
    } else {
      sheet.appendRow([id, nama, email, role, password, waliKelasClass, mapel]);
    }
  });
  
  SpreadsheetApp.flush();
  return { success: true, count: list.length };
}

// 12. Menambah Rekap Absensi Bulanan Siswa (Wali Kelas)
function addRekapAbsen(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("RekapAbsen");
  
  var bulan = payload.bulan || "";
  var tahun = payload.tahun || "";
  var waliKelas = payload.currentUserName || "";
  var kelas = payload.kelas || "";
  var students = payload.students || [];
  
  students.forEach(function(s) {
    var id = "RA-" + new Date().getTime() + "-" + Math.floor(Math.random() * 10000);
    sheet.appendRow([
      id,
      bulan,
      tahun,
      waliKelas,
      kelas,
      s.namaSiswa,
      parseInt(s.hadir) || 0,
      parseInt(s.sakit) || 0,
      parseInt(s.izin) || 0,
      parseInt(s.alpa) || 0
    ]);
  });
  
  SpreadsheetApp.flush();
  return { success: true, count: students.length };
}

// 13. Menambah Kondisi Siswa Bulanan (Wali Kelas)
function addKondisiSiswa(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("KondisiSiswa");
  
  var id = "KS-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var bulan = payload.bulan || "";
  var tahun = payload.tahun || "";
  var waliKelas = payload.currentUserName || "";
  var kelas = payload.kelas || "";
  var namaSiswa = payload.namaSiswa || "";
  var kehadiran = payload.kehadiran || "";
  var prestasiAkademik = payload.prestasiAkademik || "";
  var prestasiNonAkademik = payload.prestasiNonAkademik || "";
  var tujuanSetelahLulus = payload.tujuanSetelahLulus || "";
  
  sheet.appendRow([
    id,
    bulan,
    tahun,
    waliKelas,
    kelas,
    namaSiswa,
    kehadiran,
    prestasiAkademik,
    prestasiNonAkademik,
    tujuanSetelahLulus
  ]);
  
  SpreadsheetApp.flush();
  return { id: id, success: true };
}

// 14. Menambah Siswa Bimbingan Guru Wali (Wakasek)
function addSiswaGuruWali(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("SiswaGuruWali");
  if (!sheet) {
    sheet = ss.insertSheet("SiswaGuruWali");
    sheet.appendRow(["ID", "NIS", "NamaSiswa", "Kelas", "GuruWali"]);
  }
  
  var id = payload.id || ("SGW-" + new Date().getTime());
  var nis = payload.nis || "";
  var namaSiswa = payload.namaSiswa;
  var kelas = payload.kelas;
  var guruWali = payload.guruWali;
  
  var data = sheet.getDataRange().getValues();
  var index = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      index = i;
      break;
    }
  }
  
  if (index !== -1) {
    sheet.getRange(index + 1, 2).setValue(nis);
    sheet.getRange(index + 1, 3).setValue(namaSiswa);
    sheet.getRange(index + 1, 4).setValue(kelas);
    sheet.getRange(index + 1, 5).setValue(guruWali);
  } else {
    sheet.appendRow([id, nis, namaSiswa, kelas, guruWali]);
  }
  
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

// 15. Hapus Siswa Bimbingan Guru Wali (Wakasek)
function deleteSiswaGuruWali(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("SiswaGuruWali");
  if (!sheet) throw new Error("Sheet SiswaGuruWali tidak ditemukan.");
  
  var data = sheet.getDataRange().getValues();
  var index = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      index = i;
      break;
    }
  }
  
  if (index !== -1) {
    sheet.deleteRow(index + 1);
    SpreadsheetApp.flush();
    return { success: true };
  } else {
    throw new Error("Siswa tidak ditemukan.");
  }
}

// 16. Menambah Jurnal 7KAIH (Siswa Publik)
// 16. Menambah Jurnal 7KAIH (Siswa Publik)
function addJurnal7KAIH(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jurnal7KAIH");
  if (!sheet) {
    sheet = ss.insertSheet("Jurnal7KAIH");
    sheet.appendRow(["ID", "Tanggal", "NIS", "NamaSiswa", "BangunPagi", "Beribadah", "Berolahraga", "MakanSehat", "GemarBelajar", "Bermasyarakat", "TidurCepat", "GuruWali", "Kelas"]);
  }
  
  var id = "JK-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var tanggal = payload.tanggal || new Date().toISOString().substring(0, 10);
  var nis = payload.nis || "";
  var namaSiswa = payload.namaSiswa || "";
  var bangunPagi = payload.bangunPagi || "Tidak";
  var beribadah = payload.beribadah || "Tidak";
  var berolahraga = payload.berolahraga || "Tidak";
  var makanSehat = payload.makanSehat || "Tidak";
  var gemarBelajar = payload.gemarBelajar || "Tidak";
  var bermasyarakat = payload.bermasyarakat || "Tidak";
  var tidurCepat = payload.tidurCepat || "Tidak";
  var kelas = payload.kelas || "";
  var guruWali = payload.guruWali || "";

  // Auto-lookup Guru Wali dan Kelas dari sheet SiswaGuruWali jika belum terisi
  if (!guruWali || !kelas) {
    var sgwSheet = ss.getSheetByName("SiswaGuruWali");
    if (sgwSheet && sgwSheet.getLastRow() > 1) {
      var sgwData = sgwSheet.getDataRange().getValues();
      for (var i = 1; i < sgwData.length; i++) {
        var dbNis = sgwData[i][1] ? sgwData[i][1].toString().trim() : "";
        var dbNama = sgwData[i][2] ? sgwData[i][2].toString().toLowerCase().trim() : "";
        if ((nis && dbNis === nis.toString().trim()) || (namaSiswa && dbNama === namaSiswa.toLowerCase().trim())) {
          if (!kelas) kelas = sgwData[i][3] || "";
          if (!guruWali) guruWali = sgwData[i][4] || "";
          break;
        }
      }
    }
  }
  
  sheet.appendRow([
    id,
    tanggal,
    nis,
    namaSiswa,
    bangunPagi,
    beribadah,
    berolahraga,
    makanSehat,
    gemarBelajar,
    bermasyarakat,
    tidurCepat,
    guruWali,
    kelas
  ]);
  
  SpreadsheetApp.flush();
  return { id: id, success: true, guruWali: guruWali, kelas: kelas };
}

// 17. Hapus Jurnal 7KAIH (Guru Wali/Wakasek)
function deleteJurnal7KAIH(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jurnal7KAIH");
  if (!sheet) throw new Error("Sheet Jurnal7KAIH tidak ditemukan.");
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Jurnal 7KAIH tidak ditemukan.");
}

// 18. Menambah Catatan Perkembangan Bimbingan (Guru Wali)
function addCatatanBimbingan(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("CatatanBimbingan");
  if (!sheet) {
    sheet = ss.insertSheet("CatatanBimbingan");
    sheet.appendRow(["ID", "Tanggal", "GuruWali", "NamaSiswa", "CatatanPerkembangan"]);
  }
  
  var id = "CB-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var tanggal = payload.tanggal || new Date().toISOString().substring(0, 10);
  var guruWali = payload.currentUserName || "";
  var namaSiswa = payload.namaSiswa || "";
  var catatanPerkembangan = payload.catatanPerkembangan || "";
  
  sheet.appendRow([
    id,
    tanggal,
    guruWali,
    namaSiswa,
    catatanPerkembangan
  ]);
  
  SpreadsheetApp.flush();
  return { id: id, success: true };
}

// 19. Hapus Catatan Perkembangan Bimbingan (Guru Wali/Wakasek)
function deleteCatatanBimbingan(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("CatatanBimbingan");
  if (!sheet) throw new Error("Sheet CatatanBimbingan tidak ditemukan.");
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Catatan perkembangan tidak ditemukan.");
}

// 20. Tambah Siswa Mapel Pilihan (Guru)
function addSiswaMapelPilihan(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("KelasMapelPilihan");
  if (!sheet) {
    sheet = ss.insertSheet("KelasMapelPilihan");
    sheet.appendRow(["ID", "GuruEmail", "NamaKelas", "Tingkatan", "NamaSiswa", "NIS"]);
  }
  
  var id = payload.id || ("KMP-" + new Date().getTime());
  var guruEmail = payload.guruEmail;
  var namaKelas = payload.namaKelas;
  var tingkatan = payload.tingkatan;
  var namaSiswa = payload.namaSiswa;
  var nis = payload.nis || "";
  
  sheet.appendRow([id, guruEmail, namaKelas, tingkatan, namaSiswa, nis]);
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

// 21. Hapus Siswa Mapel Pilihan (Guru)
function deleteSiswaMapelPilihan(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("KelasMapelPilihan");
  if (!sheet) throw new Error("Sheet KelasMapelPilihan tidak ditemukan.");
  
  var id = payload.id;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Siswa mapel pilihan tidak ditemukan.");
}

// Mengambil Data Siswa & Setelan untuk Form Publik Jurnal 7KAIH
function getSiswaPublic() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSiswa = ss.getSheetByName("Siswa");
  var siswaRaw = (sheetSiswa && sheetSiswa.getLastRow() > 0) ? sheetSiswa.getDataRange().getValues() : [["ID", "NIS", "NamaSiswa", "Kelas"]];
  
  var studentList = [];
  for (var i = 1; i < siswaRaw.length; i++) {
    var row = siswaRaw[i];
    studentList.push({
      nis: row[1] ? row[1].toString().trim() : "",
      namaSiswa: row[2] ? row[2].toString().trim() : "",
      kelas: row[3] ? row[3].toString().trim() : ""
    });
  }

  // Also read settings to get daftar_kelas
  var sheetSettings = ss.getSheetByName("Settings");
  var settingsRaw = sheetSettings ? sheetSettings.getDataRange().getValues() : [["Key", "Value"]];
  var daftarKelas = ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];
  for (var i = 1; i < settingsRaw.length; i++) {
    var row = settingsRaw[i];
    if (row[0].toString().trim() === "daftar_kelas") {
      var val = row[1].toString().trim();
      daftarKelas = val ? val.split(",") : daftarKelas;
    }
  }

  // If student table is empty, fall back to any students registered in SiswaGuruWali to ensure compatibility
  if (studentList.length === 0) {
    var sheetSgw = ss.getSheetByName("SiswaGuruWali");
    var sgwRaw = (sheetSgw && sheetSgw.getLastRow() > 0) ? sheetSgw.getDataRange().getValues() : [];
    for (var i = 1; i < sgwRaw.length; i++) {
      var row = sgwRaw[i];
      studentList.push({
        nis: row[1] ? row[1].toString().trim() : "",
        namaSiswa: row[2] ? row[2].toString().trim() : "",
        kelas: row[3] ? row[3].toString().trim() : ""
      });
    }
  }

  return {
    studentList: studentList,
    daftarKelas: daftarKelas
  };
}

// 22. Tambah / Edit Sesi Pelajaran (Admin)
function addSesi(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Sesi");
  if (!sheet) {
    sheet = ss.insertSheet("Sesi");
    sheet.appendRow(["ID", "NamaSesi", "JamMulai", "JamSelesai"]);
  }
  
  var id = payload.id;
  var namaSesi = payload.namaSesi;
  var jamMulai = payload.jamMulai;
  var jamSelesai = payload.jamSelesai;
  
  if (id) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.getRange(i + 1, 2).setValue(namaSesi);
        sheet.getRange(i + 1, 3).setValue(jamMulai);
        sheet.getRange(i + 1, 4).setValue(jamSelesai);
        SpreadsheetApp.flush();
        return { success: true, id: id };
      }
    }
  }
  
  var newId = "SES-" + new Date().getTime();
  sheet.appendRow([newId, namaSesi, jamMulai, jamSelesai]);
  SpreadsheetApp.flush();
  return { success: true, id: newId };
}

// 23. Hapus Sesi Pelajaran (Admin)
function deleteSesi(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Sesi");
  if (!sheet) throw new Error("Sheet Sesi tidak ditemukan.");
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Sesi pelajaran tidak ditemukan.");
}

// 24. Tambah Catatan Wali Kelas untuk Guru Wali
function addCatatanWaliKelas(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("CatatanWaliKelas");
  if (!sheet) {
    sheet = ss.insertSheet("CatatanWaliKelas");
    sheet.appendRow(["ID", "Tanggal", "WaliKelas", "Kelas", "NamaSiswa", "Catatan"]);
  }
  
  var id = payload.id || "CWK-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var tanggal = new Date().toISOString().substring(0, 10);
  var waliKelas = payload.waliKelas || payload.currentUserName || "";
  var kelas = payload.kelas || "";
  var namaSiswa = payload.namaSiswa || "";
  var catatan = payload.catatan || "";
  
  sheet.appendRow([id, tanggal, waliKelas, kelas, namaSiswa, catatan]);
  SpreadsheetApp.flush();
  return { id: id, success: true };
}

// 25. Hapus Catatan Wali Kelas
function deleteCatatanWaliKelas(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("CatatanWaliKelas");
  if (!sheet) throw new Error("Sheet CatatanWaliKelas tidak ditemukan.");
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Catatan Wali Kelas tidak ditemukan.");
}

// 26. Helper: Normalisasi & Pembersihan Nama Guru untuk Pencocokan Fleksibel
function cleanTeacherNameForMatching(name) {
  if (!name) return "";
  var s = String(name).toLowerCase();
  // Hapus teks dalam tanda kurung
  s = s.replace(/\(.*?\)/g, " ").replace(/\[.*?\]/g, " ").replace(/\{.*?\}/g, " ");
  // Hapus sapaan dan gelar depan
  s = s.replace(/\b(ibu|bapak|bpk|bu|pak|ustadzah|ustadz|ustad|dra|drs|prof|dr|ir|hj|h)\.?\s+/gi, " ");
  // Hapus gelar akademik berakhiran titik atau koma
  s = s.replace(/\b(s\.pd\.i|s\.pd\.sd|s\.pdi|s\.pd|m\.pd\.i|m\.pdi|m\.pd|s\.kom|m\.kom|s\.ti|s\.t|m\.t|s\.si|m\.si|s\.sn|m\.sn|s\.ag|m\.ag|s\.sos|m\.sos|s\.e|m\.e|s\.h|m\.h|s\.psi|m\.psi|s\.stat|m\.stat|s\.ab|m\.ab|s\.ap|m\.ap|s\.hum|m\.hum|s\.farm|m\.farm|s\.kel|m\.kel|s\.ip|m\.ip|s\.ik|m\.ik|m\.m|m\.ba|ph\.d|phd|gr)\b/gi, " ");
  // Hapus gelar tanpa titik
  s = s.replace(/\b(spdi|spd|mpdi|mpd|skom|mkom|ssi|msi|ssn|msn|sag|mag|ssos|msos|se|me|sh|mh|spsi|mpsi|mm|mba|phd|gr)\b/gi, " ");
  // Hapus karakter non-alphanumeric
  s = s.replace(/[^a-z0-9\s]/g, " ");
  // Rapikan spasi
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// 27. Helper: Cek Apakah Dua Nama Guru Merupakan Guru yang Sama
function isTeacherMatch(name1, name2) {
  if (!name1 || !name2) return false;
  var c1 = cleanTeacherNameForMatching(name1);
  var c2 = cleanTeacherNameForMatching(name2);
  if (!c1 || !c2) return false;
  if (c1 === c2) return true;
  if (c1.indexOf(c2) !== -1 || c2.indexOf(c1) !== -1) return true;
  
  // Token matching (jika minimal 1 kata unik cocok)
  var tokens1 = c1.split(" ").filter(function(w) { return w.length > 2; });
  var tokens2 = c2.split(" ").filter(function(w) { return w.length > 2; });
  if (tokens1.length > 0 && tokens2.length > 0) {
    var all1In2 = tokens1.every(function(w) { return c2.indexOf(w) !== -1; });
    var all2In1 = tokens2.every(function(w) { return c1.indexOf(w) !== -1; });
    if (all1In2 || all2In1) return true;
  }
  return false;
}
