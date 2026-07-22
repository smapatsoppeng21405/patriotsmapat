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
    "Users": ["ID", "Nama", "Email", "Role", "Password", "WaliKelasClass"],
    "JurnalMengajar": ["ID", "Tanggal", "Guru", "Kelas", "Materi", "Kehadiran", "Catatan", "Mode"],
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
    "Jurnal7KIH": ["ID", "Tanggal", "NIS", "NamaSiswa", "BangunPagi", "Beribadah", "Berolahraga", "MakanSehat", "GemarBelajar", "Bermasyarakat", "TidurCepat"],
    "CatatanBimbingan": ["ID", "Tanggal", "GuruWali", "NamaSiswa", "CatatanPerkembangan"],
    "KelasMapelPilihan": ["ID", "GuruEmail", "NamaKelas", "Tingkatan", "NamaSiswa", "NIS"]
  };
  
  for (var name in sheetsDef) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(sheetsDef[name]);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(sheetsDef[name]);
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
      ["USR005", "Bu Retno (Kepala Sekolah)", "kepala@sekolah.com", "Kepala Sekolah", "kepala123"]
    ];
    defaultUsers.forEach(function(row) {
      userSheet.appendRow(row);
    });
  }
  
  // Insert default schedules if sheet Jadwal is empty
  var jadwalSheet = ss.getSheetByName("Jadwal");
  if (jadwalSheet.getLastRow() <= 1) {
    var defaultSchedules = [
      ["SCH-001", "Senin", "1", "10-A", "Bu Siti (Guru Matematika)", "Matematika Aljabar"],
      ["SCH-002", "Senin", "2", "10-A", "Bu Siti (Guru Matematika)", "Matematika Aljabar"],
      ["SCH-003", "Selasa", "3", "10-A", "Pak Joko (Wali Kelas 10A)", "Fisika Dasar"]
    ];
    defaultSchedules.forEach(function(row) {
      jadwalSheet.appendRow(row);
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
    if (action !== "login" && action !== "addJurnal7KIH" && !payload.currentUserEmail) {
      throw new Error("Sesi pengguna tidak valid. Silakan login kembali.");
    }
    
    switch (action) {
      case "login":
        response = { status: "success", data: login(payload.email, payload.password) };
        break;
        
      case "getDashboard":
        response = { status: "success", data: getDashboard(payload.currentUserRole, payload.currentUserEmail, payload.currentUserName) };
        break;
        
      case "addJurnal":
        response = { status: "success", data: addJurnal(payload) };
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
        response = { status: "success", data: addTeacher(payload) };
        break;

      case "deleteTeacher":
        response = { status: "success", data: deleteTeacher(payload.id) };
        break;

      case "addStudent":
        response = { status: "success", data: addStudent(payload) };
        break;

      case "deleteStudent":
        response = { status: "success", data: deleteStudent(payload.id) };
        break;

      case "importStudents":
        response = { status: "success", data: importStudents(payload) };
        break;

      case "importTeachers":
        response = { status: "success", data: importTeachers(payload) };
        break;
        
      case "addSiswaGuruWali":
        response = { status: "success", data: addSiswaGuruWali(payload) };
        break;
        
      case "deleteSiswaGuruWali":
        response = { status: "success", data: deleteSiswaGuruWali(payload.id) };
        break;
        
      case "addJurnal7KIH":
        response = { status: "success", data: addJurnal7KIH(payload) };
        break;
        
      case "deleteJurnal7KIH":
        response = { status: "success", data: deleteJurnal7KIH(payload.id) };
        break;
        
      case "addCatatanBimbingan":
        response = { status: "success", data: addCatatanBimbingan(payload) };
        break;
        
      case "deleteCatatanBimbingan":
        response = { status: "success", data: deleteCatatanBimbingan(payload.id) };
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
        profiles.push({
          id: data[i][0],
          nama: data[i][1],
          email: data[i][2],
          role: r,
          waliKelasClass: data[i][5] || ""
        });
      });
      
      if (profiles.length > 1) {
        return { multiple: true, profiles: profiles };
      } else {
        return {
          id: data[i][0],
          nama: data[i][1],
          email: data[i][2],
          role: roleStr || "Guru",
          waliKelasClass: data[i][5] || ""
        };
      }
    }
  }
  throw new Error("Email atau password salah.");
}

// 2. Mengambil Seluruh Data Dashboard Sesuai Role
function getDashboard(role, email, nama) {
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
  var sheetJurnal7KIH = ss.getSheetByName("Jurnal7KIH");
  var sheetCatatanBimbingan = ss.getSheetByName("CatatanBimbingan");
  var sheetSiswa = ss.getSheetByName("Siswa");
  
  var jurnalRaw = sheetJurnal.getDataRange().getValues();
  var perangkatRaw = sheetPerangkat.getDataRange().getValues();
  var nilaiRaw = sheetNilai.getDataRange().getValues();
  var jadwalRaw = sheetJadwal.getDataRange().getValues();
  var laporanRaw = sheetLaporan.getLastRow() > 0 ? sheetLaporan.getDataRange().getValues() : [["ID", "Tanggal", "WaliKelas", "Kelas", "Kategori", "Judul", "Isi", "TindakLanjut"]];
  var rekapRaw = (sheetRekap && sheetRekap.getLastRow() > 0) ? sheetRekap.getDataRange().getValues() : [["ID", "Bulan", "Tahun", "WaliKelas", "Kelas", "NamaSiswa", "Hadir", "Sakit", "Izin", "Alpa"]];
  var kondisiRaw = (sheetKondisi && sheetKondisi.getLastRow() > 0) ? sheetKondisi.getDataRange().getValues() : [["ID", "Bulan", "Tahun", "WaliKelas", "Kelas", "NamaSiswa", "Kehadiran", "PrestasiAkademik", "PrestasiNonAkademik", "TujuanSetelahLulus"]];
  var siswaGWRaw = (sheetSiswaGW && sheetSiswaGW.getLastRow() > 0) ? sheetSiswaGW.getDataRange().getValues() : [["ID", "NIS", "NamaSiswa", "Kelas", "GuruWali"]];
  var jurnal7KIHRaw = (sheetJurnal7KIH && sheetJurnal7KIH.getLastRow() > 0) ? sheetJurnal7KIH.getDataRange().getValues() : [["ID", "Tanggal", "NIS", "NamaSiswa", "BangunPagi", "Beribadah", "Berolahraga", "MakanSehat", "GemarBelajar", "Bermasyarakat", "TidurCepat"]];
  var catatanBimbinganRaw = (sheetCatatanBimbingan && sheetCatatanBimbingan.getLastRow() > 0) ? sheetCatatanBimbingan.getDataRange().getValues() : [["ID", "Tanggal", "GuruWali", "NamaSiswa", "CatatanPerkembangan"]];
  var siswaRaw = (sheetSiswa && sheetSiswa.getLastRow() > 0) ? sheetSiswa.getDataRange().getValues() : [["ID", "NIS", "NamaSiswa", "Kelas"]];
  
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
    jurnal7KIHList: [],
    catatanBimbinganList: [],
    studentList: []
  };
  
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
      mode: row[7] || "Tatap Muka"
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
    result.jadwalList.push({
      id: row[0],
      hari: row[1],
      jamKe: row[2],
      kelas: row[3],
      guru: row[4],
      mapel: row[5]
    });
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

  // Format Jurnal 7KIH list
  for (var i = 1; i < jurnal7KIHRaw.length; i++) {
    var row = jurnal7KIHRaw[i];
    result.jurnal7KIHList.push({
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
      tidurCepat: row[10]
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
  result.jurnal7KIHList.reverse();
  result.catatanBimbinganList.reverse();
  result.studentList.reverse();

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
  result.settings = { hariBelajar: 5, daftarKelas: ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"] };
  for (var i = 1; i < settingsRaw.length; i++) {
    var row = settingsRaw[i];
    if (row[0].toString().trim() === "hari_belajar") {
      result.settings.hariBelajar = parseInt(row[1]) || 5;
    } else if (row[0].toString().trim() === "daftar_kelas") {
      var val = row[1].toString().trim();
      result.settings.daftarKelas = val ? val.split(",") : ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];
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
      return r === "Guru" || r === "Wali Kelas" || r === "Guru Wali" || r === "Kepala Sekolah" || r === "Wakasek";
    });
    if (isTeacher) {
      result.teacherList.push({
        id: row[0],
        nama: row[1],
        email: row[2],
        role: row[3],
        password: row[4],
        waliKelasClass: row[5] || ""
      });
    }
  }
  
  // Create stats based on role
  if (role === "Wakasek") {
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
  } 
  else if (role === "Guru") {
    var guruJurnal = result.jurnalList.filter(function(j) {
      return j.guru.toLowerCase() === nama.toLowerCase();
    });
    var guruPerangkat = result.perangkatList.filter(function(p) {
      return p.namaGuru.toLowerCase() === nama.toLowerCase();
    });
    var guruJadwal = result.jadwalList.filter(function(jd) {
      return jd.guru.toLowerCase() === nama.toLowerCase();
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
    result.rekapAbsenList = [];
    result.kondisiSiswaList = [];
    result.siswaGuruWaliList = [];
    result.jurnal7KIHList = [];
  }
  else if (role === "Wali Kelas") {
    var myRekap = result.rekapAbsenList.filter(function(ra) {
      return ra.waliKelas.toLowerCase() === nama.toLowerCase();
    });
    
    result.stats = {
      totalJurnalSekolah: result.jurnalList.length,
      totalRekapSaya: myRekap.length
    };
    
    result.rekapAbsenList = myRekap;
    
    // Filter journals to class bimbingan if possible
    var myClass = "";
    var matchClass = nama.match(/Wali Kelas\s+([A-Za-zA-Z0-9\-]+)/i);
    if (matchClass && matchClass[1]) {
      myClass = matchClass[1].trim();
    }
    if (myClass) {
      result.jurnalList = result.jurnalList.filter(function(j) {
        return j.kelas.toLowerCase() === myClass.toLowerCase();
      });
    }
    
    result.laporanWaliList = [];
    result.kondisiSiswaList = [];
    result.siswaGuruWaliList = [];
    result.jurnal7KIHList = [];
  }
  else if (role === "Guru Wali") {
    var myStudents = result.siswaGuruWaliList.filter(function(s) {
      return s.guruWali.toLowerCase().indexOf(nama.toLowerCase()) !== -1 || s.guruWali.toLowerCase().indexOf(email.toLowerCase()) !== -1;
    });
    
    var myStudentNisList = myStudents.map(function(s) { return s.nis ? s.nis.toString().trim() : ""; });
    var myStudentNamesList = myStudents.map(function(s) { return s.namaSiswa ? s.namaSiswa.toLowerCase().trim() : ""; });
    
    var myJurnal7KIH = result.jurnal7KIHList.filter(function(j) {
      var isMatchNis = j.nis && myStudentNisList.indexOf(j.nis.toString().trim()) !== -1;
      var isMatchName = j.namaSiswa && myStudentNamesList.indexOf(j.namaSiswa.toLowerCase().trim()) !== -1;
      return isMatchNis || isMatchName;
    });
    
    var myCatatanBimbingan = result.catatanBimbinganList.filter(function(c) {
      return c.guruWali.toLowerCase().indexOf(nama.toLowerCase()) !== -1 || c.guruWali.toLowerCase().indexOf(email.toLowerCase()) !== -1;
    });
    
    result.stats = {
      totalSiswaBimbingan: myStudents.length,
      totalJurnal7KIH: myJurnal7KIH.length,
      totalCatatanBimbingan: myCatatanBimbingan.length
    };
    
    result.siswaGuruWaliList = myStudents;
    result.jurnal7KIHList = myJurnal7KIH;
    result.catatanBimbinganList = myCatatanBimbingan;
    
    result.jurnalList = [];
    result.perangkatList = [];
    result.nilaiList = [];
    result.laporanWaliList = [];
    result.rekapAbsenList = [];
    result.kondisiSiswaList = [];
  }
  else if (role === "Kepala Sekolah") {
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
      totalLaporanWali: result.laporanWaliList.length,
      totalJurnal7KIH: result.jurnal7KIHList.length,
      totalCatatanBimbingan: result.catatanBimbinganList.length
    };
  }
  
  return result;
}

// 3. Menambah Jurnal Mengajar
function addJurnal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("JurnalMengajar");
  
  var id = "JR-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var tanggal = payload.tanggal || new Date().toISOString().substring(0, 10);
  var guru = payload.guru || payload.currentUserName;
  var kelas = payload.kelas || "";
  var materi = payload.materi || "";
  var kehadiran = payload.kehadiran || "";
  var catatan = payload.catatan || "";
  var mode = payload.mode || "Tatap Muka";
  
  sheet.appendRow([id, tanggal, guru, kelas, materi, kehadiran, catatan, mode]);
  SpreadsheetApp.flush();
  
  return { id: id, success: true };
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
    
    sheet.appendRow([id, tanggal, guru, kelas, materi, kehadiran, catatan, mode]);
    count++;
  });
  
  SpreadsheetApp.flush();
  return { syncedCount: count, success: true };
}

// 5. Menambah Dokumen Perangkat Ajar
function addPerangkat(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PerangkatAjar");
  
  var id = "PR-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  var namaGuru = payload.namaGuru || payload.currentUserName;
  var jenisDokumen = payload.jenisDokumen || "";
  var linkDrive = payload.linkDrive || "";
  var status = "Pending";
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
      
      // Ambil tautan unduhan/tinjauan berkas
      linkDrive = file.getUrl();
    } catch (e) {
      linkDrive = "Gagal Unggah: " + e.toString();
    }
  }
  
  sheet.appendRow([id, namaGuru, jenisDokumen, linkDrive, status, catatan]);
  SpreadsheetApp.flush();
  
  return { id: id, success: true, linkDrive: linkDrive };
}

// 6. Validasi/Pembaruan Status Perangkat Ajar oleh Wakasek
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

// 8. Menambah Jadwal Mengajar dengan VALIDASI ANTI TABRAKAN
function addJadwal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jadwal");
  var data = sheet.getDataRange().getValues();
  
  var hari = payload.hari.trim();
  var jamKe = payload.jamKe.toString().trim();
  var kelas = payload.kelas.trim();
  var guru = payload.guru.trim();
  var mapel = payload.mapel.trim();
  
  // Looping validasi baris jadwal terdaftar
  for (var i = 1; i < data.length; i++) {
    var dbHari = data[i][1].toString().trim();
    var dbJamKe = data[i][2].toString().trim();
    var dbKelas = data[i][3].toString().trim();
    var dbGuru = data[i][4].toString().trim();
    var dbMapel = data[i][5].toString().trim();
    
    // Syarat 1: Hari & Jam sama, Guru sama (GURU TABRAKAN MENGAJAR DI DUA KELAS)
    if (dbHari === hari && dbJamKe === jamKe && dbGuru === guru) {
      throw new Error("Tabrakan Jadwal Guru! " + guru + " sudah mengajar di kelas " + dbKelas + " pada " + hari + " Jam Ke-" + jamKe);
    }
    
    // Syarat 2: Hari & Jam sama, Kelas sama (KELAS TABRAKAN DIISI DUA GURU)
    if (dbHari === hari && dbJamKe === jamKe && dbKelas === kelas) {
      throw new Error("Tabrakan Jadwal Kelas! Kelas " + kelas + " sudah diisi oleh " + dbGuru + " (" + dbMapel + ") pada " + hari + " Jam Ke-" + jamKe);
    }
  }
  
  var id = "SCH-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  sheet.appendRow([id, hari, jamKe, kelas, guru, mapel]);
  SpreadsheetApp.flush();
  
  return { id: id, success: true };
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
    sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
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
  } else {
    // Tambah Baru
    sheet.appendRow([id, nama, email, role, password, waliKelasClass]);
  }
  
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

// 11. Hapus Guru / Wali Kelas (Manajemen Guru)
function deleteTeacher(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  
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
    throw new Error("Guru tidak ditemukan.");
  }
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
    
    if (email && existingEmailMap[email]) {
      var rowNum = existingEmailMap[email];
      sheet.getRange(rowNum, 2).setValue(nama);
      sheet.getRange(rowNum, 4).setValue(role);
      sheet.getRange(rowNum, 5).setValue(password);
    } else {
      sheet.appendRow([id, nama, email, role, password]);
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

// 16. Menambah Jurnal 7KIH (Siswa Publik)
// 16. Menambah Jurnal 7KIH (Siswa Publik)
function addJurnal7KIH(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jurnal7KIH");
  if (!sheet) {
    sheet = ss.insertSheet("Jurnal7KIH");
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

// 17. Hapus Jurnal 7KIH (Guru Wali/Wakasek)
function deleteJurnal7KIH(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Jurnal7KIH");
  if (!sheet) throw new Error("Sheet Jurnal7KIH tidak ditemukan.");
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  throw new Error("Jurnal 7KIH tidak ditemukan.");
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
