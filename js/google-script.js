/**
 * Modul Penghubung Sinkronisasi Google Sheets via Google Apps Script Webhook
 */

export async function testWebhookUrl(url) {
  if (!url || !url.startsWith("https://script.google.com")) {
    return { success: false, message: "URL tidak valid. Harus diawali dengan https://script.google.com/macros/s/..." };
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, message: `Status respon dari Google Script: ${response.status}` };
    }
    const data = await response.json();
    return { success: true, message: data.message || "Koneksi berhasil ke Webhook Google Sheets!" };
  } catch (err) {
    return { success: false, message: "Gagal terhubung: Pastikan deployment Web App diatur 'Siapa saja (Anyone)' pada akses." };
  }
}

export async function syncToGoogleSheets(url, stateData) {
  if (!url || !url.startsWith("https://script.google.com")) {
    return { success: false, message: "URL Webhook Google Sheets belum dikonfigurasi di menu Pengaturan." };
  }

  try {
    // Karena pembatasan CORS pada Google Apps Script di beberapa browser saat POST langsung,
    // kita gunakan mode no-cors jika dibutuhkan, atau standard POST dengan text/plain payload
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'sync_all',
        data: {
          pemasukan: stateData.pemasukan || [],
          pengeluaran: stateData.pengeluaran || [],
          kirimDskt: stateData.kirimDskt || []
        }
      })
    });

    if (response.ok || response.type === 'opaque') {
      return { success: true, message: "Data berhasil dikirim ke Google Sheets (Sheet Pemasukan, Pengeluaran & Kirim DSKT)!" };
    } else {
      return { success: false, message: `Gagal mengirim data. Status: ${response.status}` };
    }
  } catch (err) {
    // Jika fetch gagal karena error jaringan, beri tahu pengguna
    console.error("Sync error:", err);
    return { success: false, message: `Terjadi kesalahan koneksi saat mengirim ke Google Sheets: ${err.message}` };
  }
}

export const GOOGLE_SCRIPT_TEMPLATE_CODE = `function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
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
    if (payload.action === "sync_all") {
      var pemasukanList = payload.data.pemasukan || [];
      var pengeluaranList = payload.data.pengeluaran || [];
      var kirimDsktList = payload.data.kirimDskt || [];

      if (sheets.sheetMasuk.getLastRow() > 1) {
        sheets.sheetMasuk.getRange(2, 1, sheets.sheetMasuk.getLastRow() - 1, 14).clearContent();
      }
      if (pemasukanList.length > 0) {
        var rowsMasuk = pemasukanList.map(function(item) {
          var psp = Number(item.persepuluhan) || 0;
          var pt = Number(item.persembahanTerpadu) || 0;
          var pk = Number(item.persembahanKhusus) || 0;
          var pp = Number(item.persembahanPembangunan) || 0;
          var ll = Number(item.lainLain) || 0;
          return [
            item.id || "", item.date || "", item.sabbathName || "", item.memberName || "",
            psp, pt, pt * 0.5, pt * 0.5, pk, pp, ll, psp + pt + pk + pp + ll, item.receiptNo || "", item.notes || ""
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
          return [item.id || "", item.date || "", Number(item.amount) || 0, item.referenceNo || "", item.notes || ""];
        });
        sheets.sheetDskt.getRange(2, 1, rowsDskt.length, 5).setValues(rowsDskt);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "API Bendahara GMAHK Aktif!" })).setMimeType(ContentService.MimeType.JSON);
}`;
