/**
 * ============================================================================
 * SKRIP BACKUP & SINKRONISASI BENDAHARA GEREJA ADVENT (GMAHK) KE GOOGLE SHEETS
 * File: code.gs (Siap dipasang di Google Apps Script editor Anda)
 * ============================================================================
 * 
 * PANDUAN PEMASANGAN (1 KLIK):
 * 1. Buka Google Sheets baru Anda di Google Drive, beri nama: "Backup Bendahara GMAHK".
 * 2. Klik menu: Ekstensi (Extensions) -> Apps Script.
 * 3. Hapus seluruh kode default di dalam file Kode.gs / code.gs, lalu tempelkan (paste) seluruh kode di bawah ini.
 * 4. Klik ikon Simpan (Save) / Ctrl+S.
 * 5. Klik tombol biru di kanan atas: "Terapkan" (Deploy) -> "Buka penerapan baru" (New deployment).
 * 6. Pilih jenis (Select type): "Aplikasi Web" (Web app).
 * 7. Isi deskripsi: "API Bendahara GMAHK", Jalankan sebagai (Execute as): "Saya" (Me), dan Siapa saja yang memiliki akses (Who has access): "Siapa saja" (Anyone).
 * 8. Klik "Terapkan" (Deploy), beri izin akses (Authorize access) jika diminta.
 * 9. Salin URL Aplikasi Web (Web App URL) yang diawali dengan https://script.google.com/macros/s/...
 * 10. Tempelkan URL tersebut ke dalam menu "Pengaturan & Google Sync" di Aplikasi WebApp Bendahara Gereja Anda.
 * ============================================================================
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Siapkan Sheet Pemasukan
  var sheetMasuk = ss.getSheetByName("Sheet Pemasukan");
  if (!sheetMasuk) {
    sheetMasuk = ss.insertSheet("Sheet Pemasukan");
    sheetMasuk.appendRow([
      "ID Transaksi", "Tanggal", "Sabat / Minggu", "Nama Anggota", 
      "Persepuluhan (100% DSKT)", "Pers. Terpadu (Total)", "50% Masuk Gereja", "50% Masuk DSKT", 
      "Pers. Khusus (Gereja)", "Pers. Pembangunan", "Lain-lain", "Total Pemasukan", "No. Kuitansi", "Catatan"
    ]);
    sheetMasuk.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sheetMasuk.setFrozenRows(1);
  }
  
  // 2. Siapkan Sheet Pengeluaran
  var sheetKeluar = ss.getSheetByName("Sheet Pengeluaran");
  if (!sheetKeluar) {
    sheetKeluar = ss.insertSheet("Sheet Pengeluaran");
    sheetKeluar.appendRow([
      "ID Transaksi", "Tanggal", "Kategori Departemen", "Keterangan / Uraian", 
      "Jumlah Pengeluaran", "No. Voucher", "Dana Pembangunan?"
    ]);
    sheetKeluar.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#b91c1c").setFontColor("#ffffff");
    sheetKeluar.setFrozenRows(1);
  }

  // 3. Siapkan Sheet Kirim DSKT
  var sheetDskt = ss.getSheetByName("Sheet Kirim DSKT");
  if (!sheetDskt) {
    sheetDskt = ss.insertSheet("Sheet Kirim DSKT");
    sheetDskt.appendRow([
      "ID Transaksi", "Tanggal Kirim", "Jumlah Dikirim ke DSKT", "No. Referensi / Bank", "Catatan"
    ]);
    sheetDskt.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#d97706").setFontColor("#ffffff");
    sheetDskt.setFrozenRows(1);
  }
  
  return { sheetMasuk: sheetMasuk, sheetKeluar: sheetKeluar, sheetDskt: sheetDskt };
}

function doPost(e) {
  try {
    var sheets = setupSheets();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === "sync_all") {
      // Sinkronisasi penuh semua data dari aplikasi ke Google Sheets
      var pemasukanList = payload.data.pemasukan || [];
      var pengeluaranList = payload.data.pengeluaran || [];
      var kirimDsktList = payload.data.kirimDskt || [];

      // Bersihkan data lama setelah baris header dan masukkan data baru
      if (sheets.sheetMasuk.getLastRow() > 1) {
        sheets.sheetMasuk.getRange(2, 1, sheets.sheetMasuk.getLastRow() - 1, 14).clearContent();
      }
      if (pemasukanList.length > 0) {
        var rowsMasuk = pemasukanList.map(function(item) {
          var psp = Number(item.persepuluhan) || 0;
          var pt = Number(item.persembahanTerpadu) || 0;
          var ptGereja = pt * 0.5;
          var ptDskt = pt * 0.5;
          var pk = Number(item.persembahanKhusus) || 0;
          var pp = Number(item.persembahanPembangunan) || 0;
          var ll = Number(item.lainLain) || 0;
          var total = psp + pt + pk + pp + ll;
          return [
            item.id || "", item.date || "", item.sabbathName || "", item.memberName || "",
            psp, pt, ptGereja, ptDskt, pk, pp, ll, total, item.receiptNo || "", item.notes || ""
          ];
        });
        sheets.sheetMasuk.getRange(2, 1, rowsMasuk.length, 14).setValues(rowsMasuk);
      }

      if (sheets.sheetKeluar.getLastRow() > 1) {
        sheets.sheetKeluar.getRange(2, 1, sheets.sheetKeluar.getLastRow() - 1, 7).clearContent();
      }
      if (pengeluaranList.length > 0) {
        var rowsKeluar = pengeluaranList.map(function(item) {
          return [
            item.id || "", item.date || "", item.departmentName || "", item.description || "",
            Number(item.amount) || 0, item.voucherNo || "", item.isBuildingFund ? "Ya (Pembangunan)" : "Kas Jemaat"
          ];
        });
        sheets.sheetKeluar.getRange(2, 1, rowsKeluar.length, 7).setValues(rowsKeluar);
      }

      if (sheets.sheetDskt.getLastRow() > 1) {
        sheets.sheetDskt.getRange(2, 1, sheets.sheetDskt.getLastRow() - 1, 5).clearContent();
      }
      if (kirimDsktList.length > 0) {
        var rowsDskt = kirimDsktList.map(function(item) {
          return [
            item.id || "", item.date || "", Number(item.amount) || 0, item.referenceNo || "", item.notes || ""
          ];
        });
        sheets.sheetDskt.getRange(2, 1, rowsDskt.length, 5).setValues(rowsDskt);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Sinkronisasi berhasil disimpan ke Google Sheets!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Aksi tidak dikenal." }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Webhook API Bendahara GMAHK Aktif & Siap Menerima Data!" }))
    .setMimeType(ContentService.MimeType.JSON);
}
