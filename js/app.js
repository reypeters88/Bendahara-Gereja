/**
 * Aplikasi WebApp Bendahara Gereja Advent (GMAHK) - Universal Bundle
 * Dirancang berjalan di semua lingkungan (File/Double-click lokal, Google Drive, Hosting) tanpa terblokir CORS Module.
 */

(function () {
  // ============================================================================
  // 1. DAFTAR DEPARTEMEN PENGELUARAN (30 POS RESMI)
  // ============================================================================
  const EXPENDITURE_DEPARTMENTS = [
    { id: 1, name: "Sosial/Pendidikan Teratai", icon: "heart-handshake", category: "Sosial & Pendidikan" },
    { id: 2, name: "Pelmas", icon: "users", category: "Pelayanan Masyarakat" },
    { id: 3, name: "Gembala Jemaat/Pendeta", icon: "book-open", category: "Pelayanan Rohani" },
    { id: 4, name: "Perlawatan: Sakit,Lahir Dukacita,Pernikahan", icon: "home", category: "Pelayanan Rohani" },
    { id: 5, name: "Koster Gereja", icon: "key", category: "Operasional & Staf" },
    { id: 6, name: "Administrator Gereja", icon: "briefcase", category: "Operasional & Staf" },
    { id: 7, name: "Pemeliharaan Snd.System, AC Dll", icon: "tool", category: "Pemeliharaan Gedung" },
    { id: 8, name: "Bendahara", icon: "dollar-sign", category: "Operasional & Staf" },
    { id: 9, name: "Air - ATB", icon: "droplet", category: "Utilitas" },
    { id: 10, name: "Listrik Gereja - PLN", icon: "zap", category: "Utilitas" },
    { id: 11, name: "Listrik R.Pastory/R. Serbaguna - PLN", icon: "zap-off", category: "Utilitas" },
    { id: 12, name: "Telephone /Kuota Internet/ Zoom", icon: "wifi", category: "Utilitas & Komunikasi" },
    { id: 13, name: "Rumah Tangga", icon: "coffee", category: "Operasional & Staf" },
    { id: 14, name: "P P + KPA +Retreat + Penginjilan", icon: "compass", category: "Pelayanan & Penginjilan" },
    { id: 15, name: "Pathfinder + Acara jemaat", icon: "flag", category: "Pemuda & Anak" },
    { id: 16, name: "Sekretaris", icon: "file-text", category: "Operasional & Staf" },
    { id: 17, name: "Diakon", icon: "shield", category: "Pelayanan Rohani" },
    { id: 18, name: "Komunikasi", icon: "share-2", category: "Utilitas & Komunikasi" },
    { id: 19, name: "Sekolah Sabat Dewasa + Anak2", icon: "book", category: "Pelayanan Rohani" },
    { id: 20, name: "Air Minum Gereja", icon: "cup-soda", category: "Utilitas" },
    { id: 21, name: "Diakones", icon: "heart", category: "Pelayanan Rohani" },
    { id: 22, name: "Poutluck + Konsumsi lainnya", icon: "utensils", category: "Acara & Konsumsi" },
    { id: 23, name: "PA CMG", icon: "smile", category: "Pemuda & Anak" },
    { id: 24, name: "Project/Maintenance/Others", icon: "hammer", category: "Pemeliharaan Gedung" },
    { id: 25, name: "Pertarakan Kesehatan", icon: "activity", category: "Pelayanan & Penginjilan" },
    { id: 26, name: "Musik & Biduan", icon: "music", category: "Pelayanan Rohani" },
    { id: 27, name: "BWA", icon: "sun", category: "Pelayanan Rohani" },
    { id: 28, name: "Proposal dari Jemaat lain", icon: "mail", category: "Sosial & Pendidikan" },
    { id: 29, name: "Lingkungan Gereja kebersihan Lingkungan", icon: "trash-2", category: "Pemeliharaan Gedung" },
    { id: 30, name: "Lain Lain", icon: "more-horizontal", category: "Lain-lain" }
  ];

  // ============================================================================
  // 2. PERHITUNGAN FINANSIAL & ALOKASI ARUS KAS
  // ============================================================================
  function calculateIncomeBreakdown(entry) {
    const psp = Number(entry.persepuluhan) || 0;
    const pt = Number(entry.persembahanTerpadu) || 0;
    const pk = Number(entry.persembahanKhusus) || 0;
    const pp = Number(entry.persembahanPembangunan) || 0;
    const ll = Number(entry.lainLain) || 0;

    const dsktFromTerpadu = pt * 0.5;
    const gerejaFromTerpadu = pt * 0.5;

    const kasDskt = psp + dsktFromTerpadu;
    const kasGereja = gerejaFromTerpadu + pk + ll;
    const kasPembangunan = pp;
    const total = psp + pt + pk + pp + ll;

    return {
      persepuluhan: psp,
      persembahanTerpadu: pt,
      persembahanKhusus: pk,
      persembahanPembangunan: pp,
      lainLain: ll,
      kasDskt,
      kasGereja,
      kasPembangunan,
      gerejaFromTerpadu,
      total
    };
  }

  function calculateFinancialSummary(state) {
    const settings = state.settings || {};
    const saldoAwalGereja = Number(settings.saldoAwalGereja) || 0;
    const saldoAwalPembangunan = Number(settings.saldoAwalPembangunan) || 0;
    const saldoAwalDskt = Number(settings.saldoAwalDskt) || 0;
    const saldoAwalTotal = saldoAwalGereja + saldoAwalPembangunan + saldoAwalDskt;

    const pemasukanList = state.pemasukan || [];
    const pengeluaranList = state.pengeluaran || [];
    const kirimDsktList = state.kirimDskt || [];

    let totalUangMasuk = 0;
    let totalMasukGereja = 0;
    let totalMasukPembangunan = 0;
    let totalMasukDskt = 0;

    pemasukanList.forEach(item => {
      const calc = calculateIncomeBreakdown(item);
      totalUangMasuk += calc.total;
      totalMasukGereja += calc.kasGereja;
      totalMasukPembangunan += calc.kasPembangunan;
      totalMasukDskt += calc.kasDskt;
    });

    let totalPengeluaran = 0;
    let totalPengeluaranGereja = 0;
    let totalPengeluaranPembangunan = 0;

    pengeluaranList.forEach(item => {
      const amount = Number(item.amount) || 0;
      totalPengeluaran += amount;
      if (item.isBuildingFund || item.departmentId === 24 || (item.departmentName && item.departmentName.toLowerCase().includes('pembangunan'))) {
        totalPengeluaranPembangunan += amount;
      } else {
        totalPengeluaranGereja += amount;
      }
    });

    let totalUangDikirimDskt = 0;
    kirimDsktList.forEach(item => {
      totalUangDikirimDskt += (Number(item.amount) || 0);
    });

    const sisaSaldoTotal = saldoAwalTotal + totalUangMasuk - totalUangDikirimDskt - totalPengeluaran;
    const saldoKasGereja = saldoAwalGereja + totalMasukGereja - totalPengeluaranGereja;
    const saldoKasPembangunan = saldoAwalPembangunan + totalMasukPembangunan - totalPengeluaranPembangunan;
    const kewajibanDsktBelumDisetor = saldoAwalDskt + totalMasukDskt - totalUangDikirimDskt;

    return {
      saldoAwalTotal,
      saldoAwalGereja,
      saldoAwalPembangunan,
      saldoAwalDskt,
      totalUangMasuk,
      totalMasukGereja,
      totalMasukPembangunan,
      totalMasukDskt,
      totalPengeluaran,
      totalPengeluaranGereja,
      totalPengeluaranPembangunan,
      totalUangDikirimDskt,
      sisaSaldoTotal,
      saldoKasGereja,
      saldoKasPembangunan,
      kewajibanDsktBelumDisetor
    };
  }

  function formatRupiah(amount) {
    const val = Math.round(Number(amount) || 0);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  }

  function formatDateIndo(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function generateReceiptNo(dateStr, state) {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return "TRT-010126-001";
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const monthStr = (dateStr || "").slice(0, 7); // Cth: "2026-07"
    
    // Cari transaksi di bulan & tahun yang sama (reset setiap pergantian bulan)
    const existingInMonth = (state.pemasukan || []).filter(item => {
      return item.date && item.date.slice(0, 7) === monthStr;
    });

    let highestSeq = 0;
    existingInMonth.forEach(item => {
      if (item.receiptNo) {
        const match = item.receiptNo.match(/(\d{3,})$/);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > highestSeq) highestSeq = seq;
        }
      }
    });

    const nextSeq = highestSeq + 1;
    return `TRT-${dd}${mm}${yy}-${String(nextSeq).padStart(3, '0')}`;
  }

  function generateVoucherNo(dateStr, state) {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return "VCH-010126-001";
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const monthStr = (dateStr || "").slice(0, 7);
    
    const existingInMonth = (state.pengeluaran || []).filter(item => {
      return item.date && item.date.slice(0, 7) === monthStr;
    });

    let highestSeq = 0;
    existingInMonth.forEach(item => {
      if (item.voucherNo) {
        const match = item.voucherNo.match(/(\d{3,})$/);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > highestSeq) highestSeq = seq;
        }
      }
    });

    const nextSeq = highestSeq + 1;
    return `VCH-${dd}${mm}${yy}-${String(nextSeq).padStart(3, '0')}`;
  }

  // ============================================================================
  // 3. STATE MANAGEMENT & STORAGE ADAPTER
  // ============================================================================
  const STORAGE_KEY = 'gmahk_bendahara_state_v1';
  const LISTENERS = [];

  const INITIAL_STATE = {
    settings: {
      churchName: "Gereja Advent Jemaat Pusat",
      districtName: "DSKT - Daerah Sumatera Kawasan Tengah / Konferens",
      treasurerName: "Bendahara Jemaat",
      saldoAwalGereja: 15000000,
      saldoAwalPembangunan: 45000000,
      saldoAwalDskt: 0,
      webhookUrl: "",
      theme: "dark"
    },
    members: [
      { id: "M1", name: "Keluarga Bpk. H. Tampubolon", phone: "081234567801", address: "Jl. Teratai No. 12" },
      { id: "M2", name: "Keluarga Bpk. S. Simanjuntak", phone: "081234567802", address: "Jl. Harapan No. 4" },
      { id: "M3", name: "Ibu M. Sitorus", phone: "081234567803", address: "Jl. Damai No. 8" },
      { id: "M4", name: "Keluarga Pdt. J. Sihombing", phone: "081234567804", address: "Pastory Gereja" },
      { id: "M5", name: "Sdr. D. Panjaitan", phone: "081234567805", address: "Jl. Pemuda No. 22" },
      { id: "M6", name: "Keluarga Bpk. R. Nainggolan", phone: "081234567806", address: "Jl. Advent No. 7" }
    ],
    pemasukan: [
      {
        id: "IN-20260704-01",
        date: "2026-07-04",
        sabbathName: "Sabat 1 - Juli 2026",
        memberId: "M1",
        memberName: "Keluarga Bpk. H. Tampubolon",
        persepuluhan: 1500000,
        persembahanTerpadu: 400000,
        persembahanKhusus: 250000,
        persembahanPembangunan: 500000,
        lainLain: 0,
        receiptNo: "KW-001",
        notes: "Persembahan Sabat Pertama"
      },
      {
        id: "IN-20260704-02",
        date: "2026-07-04",
        sabbathName: "Sabat 1 - Juli 2026",
        memberId: "M2",
        memberName: "Keluarga Bpk. S. Simanjuntak",
        persepuluhan: 2000000,
        persembahanTerpadu: 600000,
        persembahanKhusus: 300000,
        persembahanPembangunan: 1000000,
        lainLain: 100000,
        receiptNo: "KW-002",
        notes: "Ucapan Syukur Keluarga"
      },
      {
        id: "IN-20260711-01",
        date: "2026-07-11",
        sabbathName: "Sabat 2 - Juli 2026",
        memberId: "M3",
        memberName: "Ibu M. Sitorus",
        persepuluhan: 800000,
        persembahanTerpadu: 200000,
        persembahanKhusus: 150000,
        persembahanPembangunan: 200000,
        lainLain: 0,
        receiptNo: "KW-003",
        notes: ""
      }
    ],
    pengeluaran: [
      {
        id: "EX-20260705-01",
        date: "2026-07-05",
        departmentId: 10,
        departmentName: "Listrik Gereja - PLN",
        amount: 1250000,
        description: "Pembayaran Tagihan Listrik PLN Bulan Juni 2026",
        voucherNo: "VK-001",
        isBuildingFund: false
      },
      {
        id: "EX-20260706-01",
        date: "2026-07-06",
        departmentId: 5,
        departmentName: "Koster Gereja",
        amount: 2500000,
        description: "Tunjangan Koster Gereja Bulan Juli 2026",
        voucherNo: "VK-002",
        isBuildingFund: false
      },
      {
        id: "EX-20260708-01",
        date: "2026-07-08",
        departmentId: 4,
        departmentName: "Perlawatan: Sakit,Lahir Dukacita,Pernikahan",
        amount: 750000,
        description: "Bingkisan & Perlawatan Anggota Jemaat Sakit di RS",
        voucherNo: "VK-003",
        isBuildingFund: false
      },
      {
        id: "EX-20260710-01",
        date: "2026-07-10",
        departmentId: 19,
        departmentName: "Sekolah Sabat Dewasa + Anak2",
        amount: 600000,
        description: "Pembelian Alat Peraga & Bahan Sekolah Sabat Anak",
        voucherNo: "VK-004",
        isBuildingFund: false
      }
    ],
    kirimDskt: [
      {
        id: "TR-20260712-01",
        date: "2026-07-12",
        amount: 4000000,
        referenceNo: "TRX-BNI-982173",
        notes: "Setoran Persepuluhan & 50% Pers. Terpadu Sabat 1 & 2"
      }
    ]
  };

  let appState = null;

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        appState = JSON.parse(saved);
        appState.settings = { ...INITIAL_STATE.settings, ...appState.settings };
        appState.members = appState.members || INITIAL_STATE.members;
        appState.pemasukan = appState.pemasukan || INITIAL_STATE.pemasukan;
        appState.pengeluaran = appState.pengeluaran || INITIAL_STATE.pengeluaran;
        appState.kirimDskt = appState.kirimDskt || INITIAL_STATE.kirimDskt;
      } else {
        appState = JSON.parse(JSON.stringify(INITIAL_STATE));
        saveState();
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
      appState = JSON.parse(JSON.stringify(INITIAL_STATE));
    }
    return appState;
  }

  function saveState() {
    try {
      if (!appState) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
      notifyListeners();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
    }
  }

  function getState() {
    if (!appState) loadState();
    return appState;
  }

  function updateSettings(newSettings) {
    appState.settings = { ...appState.settings, ...newSettings };
    saveState();
  }

  function addMember(member) {
    const newMember = {
      id: member.id || "M" + Date.now(),
      name: member.name,
      phone: member.phone || "-",
      address: member.address || "-"
    };
    appState.members.push(newMember);
    saveState();
    return newMember;
  }

  function addMembersBulk(membersList) {
    const added = [];
    membersList.forEach((member, idx) => {
      if (!member.name || !member.name.trim()) return;
      const exists = appState.members.some(m => m.name.toLowerCase() === member.name.trim().toLowerCase());
      if (!exists) {
        const newMember = {
          id: "M" + Date.now() + "_" + idx,
          name: member.name.trim(),
          phone: member.phone ? member.phone.trim() : "-",
          address: member.address ? member.address.trim() : "-"
        };
        appState.members.push(newMember);
        added.push(newMember);
      }
    });
    if (added.length > 0) saveState();
    return added;
  }

  function addPemasukan(entry) {
    const newEntry = {
      id: entry.id || "IN-" + Date.now(),
      date: entry.date || new Date().toISOString().split('T')[0],
      sabbathName: entry.sabbathName || "Sabat",
      memberId: entry.memberId || "",
      memberName: entry.memberName || "Umum/Anonim",
      persepuluhan: Number(entry.persepuluhan) || 0,
      persembahanTerpadu: Number(entry.persembahanTerpadu) || 0,
      persembahanKhusus: Number(entry.persembahanKhusus) || 0,
      persembahanPembangunan: Number(entry.persembahanPembangunan) || 0,
      lainLain: Number(entry.lainLain) || 0,
      receiptNo: entry.receiptNo || generateReceiptNo(entry.date, appState),
      notes: entry.notes || ""
    };
    appState.pemasukan.unshift(newEntry);
    saveState();
    return newEntry;
  }

  function deletePemasukan(id) {
    appState.pemasukan = appState.pemasukan.filter(item => item.id !== id);
    saveState();
  }

  function addPengeluaran(entry) {
    const newEntry = {
      id: entry.id || "EX-" + Date.now(),
      date: entry.date || new Date().toISOString().split('T')[0],
      departmentId: Number(entry.departmentId) || 30,
      departmentName: entry.departmentName || "Lain Lain",
      amount: Number(entry.amount) || 0,
      description: entry.description || "",
      voucherNo: entry.voucherNo || generateVoucherNo(entry.date, appState),
      isBuildingFund: Boolean(entry.isBuildingFund)
    };
    appState.pengeluaran.unshift(newEntry);
    saveState();
    return newEntry;
  }

  function deletePengeluaran(id) {
    appState.pengeluaran = appState.pengeluaran.filter(item => item.id !== id);
    saveState();
  }

  function addKirimDskt(entry) {
    const newEntry = {
      id: entry.id || "TR-" + Date.now(),
      date: entry.date || new Date().toISOString().split('T')[0],
      amount: Number(entry.amount) || 0,
      referenceNo: entry.referenceNo || "-",
      notes: entry.notes || ""
    };
    appState.kirimDskt.unshift(newEntry);
    saveState();
    return newEntry;
  }

  function deleteKirimDskt(id) {
    appState.kirimDskt = appState.kirimDskt.filter(item => item.id !== id);
    saveState();
  }

  function subscribe(listener) {
    if (typeof listener === 'function') LISTENERS.push(listener);
  }

  function notifyListeners() {
    LISTENERS.forEach(listener => listener(appState));
  }

  function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    appState = JSON.parse(JSON.stringify(INITIAL_STATE));
    saveState();
  }

  function importBackupData(dataObj) {
    if (dataObj && dataObj.settings && dataObj.pemasukan && dataObj.pengeluaran) {
      appState = dataObj;
      saveState();
      return true;
    }
    return false;
  }

  // ============================================================================
  // 4. GOOGLE SHEETS CONNECTOR
  // ============================================================================
  async function testWebhookUrl(url) {
    if (!url || !url.startsWith("https://script.google.com")) {
      return { success: false, message: "URL tidak valid. Harus diawali dengan https://script.google.com/macros/s/..." };
    }
    try {
      const response = await fetch(url);
      if (!response.ok) return { success: false, message: `Status respon dari Google Script: ${response.status}` };
      const data = await response.json();
      return { success: true, message: data.message || "Koneksi berhasil ke Webhook Google Sheets!" };
    } catch (err) {
      return { success: false, message: "Gagal terhubung: Pastikan deployment Web App diatur 'Siapa saja (Anyone)' pada akses." };
    }
  }

  async function syncToGoogleSheets(url, stateData) {
    if (!url || !url.startsWith("https://script.google.com")) {
      return { success: false, message: "URL Webhook Google Sheets belum dikonfigurasi di menu Pengaturan." };
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
      return { success: false, message: `Terjadi kesalahan koneksi: ${err.message}` };
    }
  }

  const GOOGLE_SCRIPT_TEMPLATE_CODE = `function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMasuk = ss.getSheetByName("Sheet Pemasukan");
  if (!sheetMasuk) {
    sheetMasuk = ss.insertSheet("Sheet Pemasukan");
    sheetMasuk.appendRow(["ID Transaksi", "Tanggal", "Sabat / Minggu", "Nama Anggota", "Persepuluhan (100% DSKT)", "Pers. Terpadu (Total)", "50% Masuk Gereja", "50% Masuk DSKT", "Pers. Khusus (Gereja)", "Pers. Pembangunan", "Lain-lain", "Total Pemasukan", "No. Kuitansi", "Catatan"]);
    sheetMasuk.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sheetMasuk.setFrozenRows(1);
  }
  var sheetKeluar = ss.getSheetByName("Sheet Pengeluaran");
  if (!sheetKeluar) {
    sheetKeluar = ss.insertSheet("Sheet Pengeluaran");
    sheetKeluar.appendRow(["ID Transaksi", "Tanggal", "Kategori Departemen", "Keterangan / Uraian", "Jumlah Pengeluaran", "No. Voucher", "Dana Pembangunan?"]);
    sheetKeluar.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#b91c1c").setFontColor("#ffffff");
    sheetKeluar.setFrozenRows(1);
  }
  var sheetDskt = ss.getSheetByName("Sheet Kirim DSKT");
  if (!sheetDskt) {
    sheetDskt = ss.insertSheet("Sheet Kirim DSKT");
    sheetDskt.appendRow(["ID Transaksi", "Tanggal Kirim", "Jumlah Dikirim ke DSKT", "No. Referensi / Bank", "Catatan"]);
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
          return [item.id || "", item.date || "", item.sabbathName || "", item.memberName || "", psp, pt, pt * 0.5, pt * 0.5, pk, pp, ll, psp + pt + pk + pp + ll, item.receiptNo || "", item.notes || ""];
        });
        sheets.sheetMasuk.getRange(2, 1, rowsMasuk.length, 14).setValues(rowsMasuk);
      }

      if (sheets.sheetKeluar.getLastRow() > 1) {
        sheets.sheetKeluar.getRange(2, 1, sheets.sheetKeluar.getLastRow() - 1, 7).clearContent();
      }
      if (pengeluaranList.length > 0) {
        var rowsKeluar = pengeluaranList.map(function(item) {
          return [item.id || "", item.date || "", item.departmentName || "", item.description || "", Number(item.amount) || 0, item.voucherNo || "", item.isBuildingFund ? "Ya (Pembangunan)" : "Kas Jemaat"];
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

  // ============================================================================
  // 5. VIEW DEFINITIONS
  // ============================================================================
  let chartInstance = null;

  function renderDashboard(container, state, navigateTo) {
    const summary = calculateFinancialSummary(state);
    container.innerHTML = `
      <div class="formula-banner">
        <div class="formula-title">
          <i data-lucide="calculator"></i>
          <span>Rumus Arus Kas Bendahara Gereja Advent (Real-time Calculation)</span>
        </div>
        <div class="formula-flow">
          <div class="flow-box">
            <div class="flow-label">Saldo Awal (Total)</div>
            <div class="flow-number">${formatRupiah(summary.saldoAwalTotal)}</div>
          </div>
          <div class="flow-operator">+</div>
          <div class="flow-box">
            <div class="flow-label">Uang Masuk</div>
            <div class="flow-number" style="color: hsl(var(--success));">${formatRupiah(summary.totalUangMasuk)}</div>
          </div>
          <div class="flow-operator">-</div>
          <div class="flow-box">
            <div class="flow-label">Uang Dikirim DSKT</div>
            <div class="flow-number" style="color: hsl(var(--warning));">${formatRupiah(summary.totalUangDikirimDskt)}</div>
          </div>
          <div class="flow-operator">-</div>
          <div class="flow-box">
            <div class="flow-label">Pengeluaran</div>
            <div class="flow-number" style="color: hsl(var(--danger));">${formatRupiah(summary.totalPengeluaran)}</div>
          </div>
          <div class="flow-operator">=</div>
          <div class="flow-box result">
            <div class="flow-label" style="color: #4ade80;">Sisa Saldo Kas Keseluruhan</div>
            <div class="flow-number" style="color: #ffffff; font-size: 1.3rem;">${formatRupiah(summary.sisaSaldoTotal)}</div>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card" style="--stat-glow: rgba(34, 197, 94, 0.2); --icon-bg: rgba(34, 197, 94, 0.15); --icon-color: hsl(var(--success));">
          <div class="stat-header">
            <span class="stat-title">Saldo Kas Gereja (Operasional)</span>
            <div class="stat-icon"><i data-lucide="home"></i></div>
          </div>
          <div class="stat-value">${formatRupiah(summary.saldoKasGereja)}</div>
          <div class="stat-desc"><i data-lucide="info" style="width: 14px; height: 14px;"></i><span>50% Pers. Terpadu + Pers. Khusus + DLL</span></div>
        </div>

        <div class="stat-card" style="--stat-glow: rgba(59, 130, 246, 0.2); --icon-bg: rgba(59, 130, 246, 0.15); --icon-color: hsl(var(--accent-blue));">
          <div class="stat-header">
            <span class="stat-title">Saldo Kas Pembangunan</span>
            <div class="stat-icon"><i data-lucide="hammer"></i></div>
          </div>
          <div class="stat-value">${formatRupiah(summary.saldoKasPembangunan)}</div>
          <div class="stat-desc"><i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: hsl(var(--accent-blue));"></i><span>100% Persembahan Pembangunan</span></div>
        </div>

        <div class="stat-card" style="--stat-glow: rgba(239, 68, 68, 0.2); --icon-bg: rgba(239, 68, 68, 0.15); --icon-color: hsl(var(--danger));">
          <div class="stat-header">
            <span class="stat-title">Kewajiban DSKT Belum Disetor</span>
            <div class="stat-icon"><i data-lucide="send"></i></div>
          </div>
          <div class="stat-value">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</div>
          <div class="stat-desc"><i data-lucide="alert-circle" style="width: 14px; height: 14px; color: hsl(var(--danger));"></i><span>100% Persepuluhan + 50% Pers. Terpadu</span></div>
        </div>

        <div class="stat-card" style="--stat-glow: rgba(245, 158, 11, 0.2); --icon-bg: rgba(245, 158, 11, 0.15); --icon-color: hsl(var(--accent-gold));">
          <div class="stat-header">
            <span class="stat-title">Total Uang Masuk (Periode Ini)</span>
            <div class="stat-icon"><i data-lucide="trending-up"></i></div>
          </div>
          <div class="stat-value">${formatRupiah(summary.totalUangMasuk)}</div>
          <div class="stat-desc"><i data-lucide="users" style="width: 14px; height: 14px;"></i><span>Dari ${state.pemasukan.length} Transaksi Persembahan</span></div>
        </div>
      </div>

      <div class="view-split-grid" style="margin-bottom: 28px;">
        <div class="glass-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="font-size: 1.1rem; font-weight: 700;">Komposisi Alokasi Uang Masuk</h3>
            <span class="badge badge-gereja">Real-time Split</span>
          </div>
          <div style="position: relative; height: 260px; display: flex; align-items: center; justify-content: center;">
            <canvas id="dashboardChart"></canvas>
          </div>
        </div>

        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 16px;">Aksi Cepat Bendahara</h3>
            <p style="color: hsl(var(--text-secondary)); font-size: 0.9rem; margin-bottom: 24px;">Kelola transaksi Sabat ini, catat pengeluaran departemen, atau setor titipan DSKT dengan satu sentuhan.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
              <button class="btn btn-primary" id="btn-goto-masuk" style="width: 100%; justify-content: center; padding: 14px;"><i data-lucide="plus-circle"></i><span>Catat Masuk</span></button>
              <button class="btn btn-gold" id="btn-goto-keluar" style="width: 100%; justify-content: center; padding: 14px;"><i data-lucide="minus-circle"></i><span>Catat Keluar</span></button>
            </div>
            <button class="btn btn-secondary" id="btn-goto-dskt" style="width: 100%; justify-content: center; padding: 12px; border-color: rgba(239, 68, 68, 0.4); color: hsl(var(--danger));"><i data-lucide="send"></i><span>Setor Uang ke Kas DSKT (Konferens)</span></button>
          </div>
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; color: hsl(var(--text-muted));">
            <span>Google Sheets Sync Status:</span>
            <span style="color: ${state.settings.webhookUrl ? 'hsl(var(--success))' : 'hsl(var(--warning))'}; font-weight: 600;">${state.settings.webhookUrl ? 'Tersambung' : 'Belum Webhook'}</span>
          </div>
        </div>
      </div>

      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Transaksi Pemasukan Terakhir</h3>
          <button class="btn btn-secondary" id="btn-goto-laporan" style="padding: 6px 14px; font-size: 0.82rem;">Lihat Semua Laporan</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal / Sabat</th>
                <th>Nama Anggota / Kuitansi</th>
                <th>Persepuluhan (DSKT)</th>
                <th>Pers. Terpadu (50/50)</th>
                <th>Pers. Khusus (Gereja)</th>
                <th>Pers. Pembangunan</th>
                <th>Total Masuk</th>
              </tr>
            </thead>
            <tbody>
              ${state.pemasukan.slice(0, 5).map(item => {
                const calc = calculateIncomeBreakdown(item);
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${formatDateIndo(item.date)}</div>
                      <div style="font-size: 0.78rem; color: hsl(var(--text-muted));">No. ${item.receiptNo}</div>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: hsl(var(--accent-gold));">${item.memberName}</div>
                      <div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">No. ${item.receiptNo}</div>
                    </td>
                    <td><span class="badge badge-dskt">${formatRupiah(item.persepuluhan)}</span></td>
                    <td><span style="font-weight: 600;">${formatRupiah(item.persembahanTerpadu)}</span></td>
                    <td><span class="badge badge-gereja">${formatRupiah(item.persembahanKhusus)}</span></td>
                    <td><span class="badge badge-pembangunan">${formatRupiah(item.persembahanPembangunan)}</span></td>
                    <td style="font-weight: 800; color: hsl(var(--success));">${formatRupiah(calc.total)}</td>
                  </tr>
                `;
              }).join('')}
              ${state.pemasukan.length === 0 ? `<tr><td colspan="7" style="text-align: center; padding: 30px; color: hsl(var(--text-muted));">Belum ada transaksi.</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-goto-masuk')?.addEventListener('click', () => navigateTo('pemasukan'));
    container.querySelector('#btn-goto-keluar')?.addEventListener('click', () => navigateTo('pengeluaran'));
    container.querySelector('#btn-goto-dskt')?.addEventListener('click', () => navigateTo('kirim-dskt'));
    container.querySelector('#btn-goto-laporan')?.addEventListener('click', () => navigateTo('laporan'));

    setTimeout(() => {
      const canvas = document.getElementById('dashboardChart');
      if (canvas && window.Chart) {
        if (chartInstance) chartInstance.destroy();
        const ctx = canvas.getContext('2d');
        chartInstance = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Masuk Kas DSKT (100% Psp + 50% Tpd)', 'Masuk Kas Gereja (50% Tpd + Khs + DLL)', 'Masuk Kas Pembangunan (100%)'],
            datasets: [{
              data: [summary.totalMasukDskt || 1, summary.totalMasukGereja || 1, summary.totalMasukPembangunan || 1],
              backgroundColor: ['#ef4444', '#22c55e', '#3b82f6'],
              borderWidth: 2,
              borderColor: '#0f172a'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#e2e8f0', font: { size: 11, family: 'Plus Jakarta Sans' }, padding: 14, usePointStyle: true }
              }
            },
            cutout: '65%'
          }
        });
      }
    }, 100);
  }

  function renderPemasukan(container, state) {
    const members = state.members || [];
    const pemasukanList = state.pemasukan || [];
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="view-split-grid">
        <div class="glass-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
            <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-gold));">
              <i data-lucide="plus-circle" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>
              Input Persembahan Anggota
            </h3>
            <button class="btn btn-secondary" id="btn-add-member-modal" style="padding: 6px 12px; font-size: 0.8rem;"><i data-lucide="user-plus"></i> + Anggota Baru</button>
          </div>
          <form id="form-pemasukan">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Tanggal Transaksi</label>
                <input type="date" class="form-control" id="in-date" value="${today}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Nomor Kuitansi / Bukti</label>
                <input type="text" class="form-control" id="in-receipt" value="${generateReceiptNo(today, state)}" required style="font-weight: 700; color: hsl(var(--accent-gold));" />
              </div>
            </div>
            <div class="form-group" style="position: relative;">
              <label class="form-label">Nama Anggota / Pemberi Persembahan</label>
              <div class="autocomplete-wrapper" style="position: relative;">
                <div style="position: relative; display: flex; align-items: center;">
                  <i data-lucide="search" style="position: absolute; left: 14px; color: hsl(var(--text-muted)); width: 18px; height: 18px; pointer-events: none;"></i>
                  <input type="text" class="form-control" id="in-member" placeholder="🔍 Ketik awal/tengah/akhir nama atau pilih dari daftar..." value="Umum/Anonim" autocomplete="off" required style="padding-left: 42px; padding-right: 42px; font-weight: 600;" />
                  <button type="button" id="btn-toggle-member-list" tabindex="-1" style="position: absolute; right: 6px; background: transparent; border: none; color: hsl(var(--text-muted)); padding: 8px; cursor: pointer; display: flex; align-items: center;">
                    <i data-lucide="chevron-down"></i>
                  </button>
                </div>
                <div id="member-autocomplete-list" class="autocomplete-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 1100; background: hsl(var(--bg-card)); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-top: 6px; max-height: 280px; overflow-y: auto; box-shadow: 0 12px 30px rgba(0,0,0,0.6);">
                </div>
              </div>
            </div>
            <div class="form-grid" style="margin-top: 10px;">
              <div class="form-group">
                <label class="form-label" style="color: hsl(var(--danger)); font-weight: 700;">1. Persepuluhan (100% DSKT)</label>
                <input type="number" class="form-control calc-trigger" id="in-psp" placeholder="0" min="0" step="1000" />
              </div>
              <div class="form-group">
                <label class="form-label" style="color: hsl(var(--success)); font-weight: 700;">2. Pers. Terpadu (50% Grj / 50% DSKT)</label>
                <input type="number" class="form-control calc-trigger" id="in-tpd" placeholder="0" min="0" step="1000" />
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">3. Pers. Khusus (100% Kas Gereja)</label>
                <input type="number" class="form-control calc-trigger" id="in-khs" placeholder="0" min="0" step="1000" />
              </div>
              <div class="form-group">
                <label class="form-label" style="color: hsl(var(--accent-blue)); font-weight: 700;">4. Pers. Pembangunan (100% Pbg)</label>
                <input type="number" class="form-control calc-trigger" id="in-pbg" placeholder="0" min="0" step="1000" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">5. Lain-lain / Ucapan Syukur (Kas Gereja)</label>
              <input type="number" class="form-control calc-trigger" id="in-dll" placeholder="0" min="0" step="1000" />
            </div>
            <div class="form-group">
              <label class="form-label">Catatan Tambahan (Opsional)</label>
              <input type="text" class="form-control" id="in-notes" placeholder="Cth: Ucapan syukur ulang tahun pernikahan" />
            </div>
            <div class="allocation-info" id="live-split-box">
              <div class="alloc-item"><span class="alloc-title">Masuk Kas DSKT (100% Psp + 50% Tpd)</span><span class="alloc-val" id="split-dskt" style="color: hsl(var(--danger));">Rp 0</span></div>
              <div class="alloc-item"><span class="alloc-title">Masuk Kas Gereja (50% Tpd + Khs + DLL)</span><span class="alloc-val" id="split-gereja" style="color: hsl(var(--success));">Rp 0</span></div>
              <div class="alloc-item"><span class="alloc-title">Masuk Kas Pembangunan (100% Pbg)</span><span class="alloc-val" id="split-pembangunan" style="color: hsl(var(--accent-blue));">Rp 0</span></div>
              <div class="alloc-item" style="border-left: 1px solid var(--border-color); padding-left: 12px;"><span class="alloc-title">TOTAL PEMASUKAN</span><span class="alloc-val" id="split-total" style="color: hsl(var(--accent-gold)); font-size: 1.15rem;">Rp 0</span></div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px; padding: 14px; font-size: 1rem;"><i data-lucide="save"></i><span>Simpan Transaksi Pemasukan</span></button>
          </form>
        </div>

        <div class="glass-card">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">Riwayat Pemasukan Terakhir</h3>
          <div class="table-responsive" style="max-height: 650px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tanggal & Anggota</th>
                  <th>Rincian Persembahan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${pemasukanList.map(item => {
                  const calc = calculateIncomeBreakdown(item);
                  return `
                    <tr>
                      <td style="vertical-align: top; width: 38%;">
                        <div style="font-weight: 700; color: hsl(var(--accent-gold));">${item.memberName}</div>
                        <div style="font-size: 0.8rem; color: hsl(var(--text-muted));">${formatDateIndo(item.date)}</div>
                        <div style="font-size: 0.75rem; color: hsl(var(--text-secondary)); margin-top: 4px;">Kuitansi: ${item.receiptNo}</div>
                      </td>
                      <td style="vertical-align: top;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;"><span>Persepuluhan (DSKT):</span> <strong style="color: hsl(var(--danger));">${formatRupiah(item.persepuluhan)}</strong></div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;"><span>Pers. Terpadu (50/50):</span> <strong>${formatRupiah(item.persembahanTerpadu)}</strong></div>
                        ${item.persembahanKhusus ? `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;"><span>Pers. Khusus (Grj):</span> <strong style="color: hsl(var(--success));">${formatRupiah(item.persembahanKhusus)}</strong></div>` : ''}
                        ${item.persembahanPembangunan ? `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;"><span>Pers. Pembangunan:</span> <strong style="color: hsl(var(--accent-blue));">${formatRupiah(item.persembahanPembangunan)}</strong></div>` : ''}
                        <div style="border-top: 1px dashed var(--border-color); margin-top: 6px; padding-top: 4px; display: flex; justify-content: space-between; font-weight: 800; color: hsl(var(--accent-gold));"><span>Total:</span> <span>${formatRupiah(calc.total)}</span></div>
                      </td>
                      <td style="vertical-align: middle; text-align: center; width: 70px;">
                        <button class="icon-btn btn-print-kw" data-id="${item.id}" title="Cetak Kuitansi" style="margin-bottom: 6px; color: hsl(var(--accent-blue));"><i data-lucide="printer"></i></button>
                        <button class="icon-btn btn-del-masuk" data-id="${item.id}" title="Hapus Transaksi" style="color: hsl(var(--danger));"><i data-lucide="trash-2"></i></button>
                      </td>
                    </tr>
                  `;
                }).join('')}
                ${pemasukanList.length === 0 ? `<tr><td colspan="3" style="text-align: center; padding: 40px; color: hsl(var(--text-muted));">Belum ada data persembahan.</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" id="modal-member">
        <div class="modal-content" style="max-width: 580px;">
          <div class="modal-header">
            <h4 style="font-size: 1.15rem; font-weight: 700;">Tambah & Import Anggota Jemaat</h4>
            <button class="icon-btn btn-close-member-modal"><i data-lucide="x"></i></button>
          </div>
          <div style="display: flex; border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
            <button type="button" id="tab-btn-manual" style="flex: 1; padding: 12px; font-weight: 600; border: none; border-bottom: 2px solid hsl(var(--accent-gold)); background: transparent; color: hsl(var(--text-primary)); cursor: pointer;">1. Input Manual</button>
            <button type="button" id="tab-btn-massal" style="flex: 1; padding: 12px; font-weight: 600; border: none; border-bottom: 2px solid transparent; background: transparent; color: hsl(var(--text-muted)); cursor: pointer;">2. Import Massal (Excel / Teks)</button>
          </div>

          <div id="tab-content-manual">
            <form id="form-new-member">
              <div class="modal-body">
                <div class="form-group"><label class="form-label">Nama Kepala Keluarga / Anggota</label><input type="text" class="form-control" id="nm-name" placeholder="Cth: Keluarga Bpk. S. Hutapea" required /></div>
                <div class="form-group"><label class="form-label">Nomor WhatsApp / HP</label><input type="text" class="form-control" id="nm-phone" placeholder="Cth: 08123456789" /></div>
                <div class="form-group"><label class="form-label">Alamat / Lingkungan</label><input type="text" class="form-control" id="nm-address" placeholder="Cth: Lingkungan 2 - Jl. Mawar" /></div>
              </div>
              <div class="modal-footer"><button type="button" class="btn btn-secondary btn-close-member-modal">Batal</button><button type="submit" class="btn btn-primary">Simpan Anggota</button></div>
            </form>
          </div>

          <div id="tab-content-massal" style="display: none;">
            <div class="modal-body">
              <div style="background: rgba(59, 130, 246, 0.1); border: 1px dashed rgba(59, 130, 246, 0.4); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 16px;">
                <div style="font-weight: 700; color: hsl(var(--accent-blue)); font-size: 0.9rem; margin-bottom: 6px;">💡 Opsi A: Upload File Excel (.xlsx / .csv)</div>
                <div style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-bottom: 10px;">Gunakan kolom: <b>Nama Anggota</b>, <b>No HP</b> (opsional), <b>Alamat</b> (opsional).</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <input type="file" id="file-import-members" accept=".xlsx,.xls,.csv" style="display: none;" />
                  <button type="button" class="btn btn-secondary" id="btn-pick-excel" style="padding: 8px 14px; font-size: 0.8rem;"><i data-lucide="file-spreadsheet"></i> Pilih File Excel / CSV</button>
                  <button type="button" class="btn btn-gold" id="btn-dl-template" style="padding: 8px 14px; font-size: 0.8rem;"><i data-lucide="download"></i> Download Template Excel</button>
                </div>
                <div id="import-file-name" style="font-size: 0.8rem; color: hsl(var(--success)); margin-top: 8px; font-weight: 600;"></div>
              </div>

              <div style="background: rgba(245, 158, 11, 0.1); border: 1px dashed rgba(245, 158, 11, 0.4); padding: 14px; border-radius: var(--radius-sm);">
                <div style="font-weight: 700; color: hsl(var(--accent-gold)); font-size: 0.9rem; margin-bottom: 6px;">💡 Opsi B: Ketik / Paste Daftar Nama</div>
                <div style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-bottom: 8px;">1 nama per baris, atau format: <b>Nama, No HP, Alamat</b></div>
                <textarea class="form-control" id="text-import-members" rows="6" placeholder="Cth:&#10;Bpk. R. Situmorang&#10;Keluarga Bpk. S. Hutapea, 08123456789, Lingkungan 1&#10;Ibu M. Panjaitan"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-close-member-modal">Batal</button>
              <button type="button" class="btn btn-primary" id="btn-process-mass-import" style="background: linear-gradient(135deg, hsl(var(--success)), hsl(160, 84%, 30%));"><i data-lucide="check-circle"></i> Proses Import Massal</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" id="modal-receipt">
        <div class="modal-content" style="max-width: 520px; transition: max-width 0.25s ease;" id="receipt-print-area">
          <div class="modal-header" id="receipt-header-bar" style="background: linear-gradient(135deg, hsl(var(--accent-blue)), hsl(221, 83%, 45%)); color: white;">
            <div><h4 style="font-size: 1.2rem; font-weight: 800;">KUITANSI PERSEMBAHAN GMAHK</h4><div style="font-size: 0.8rem; opacity: 0.9;">${state.settings.churchName || 'Gereja Advent Jemaat Pusat'}</div></div>
            <button class="icon-btn" id="btn-close-receipt" style="background: rgba(255,255,255,0.2); color: white;"><i data-lucide="x"></i></button>
          </div>
          <div style="display: flex; gap: 8px; padding: 10px 16px; background: rgba(0,0,0,0.15); border-bottom: 1px solid var(--border-color); align-items: center; justify-content: space-between;" class="receipt-toolbar">
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn btn-sm active" id="btn-mode-standard" style="padding: 5px 10px; font-size: 0.78rem; border: 1px solid hsl(var(--accent-gold)); background: hsl(var(--accent-gold)); color: black; font-weight: 700;">📄 A4 / Standar</button>
              <button type="button" class="btn btn-sm btn-secondary" id="btn-mode-thermal" style="padding: 5px 10px; font-size: 0.78rem; border: 1px solid var(--border-color); color: hsl(var(--text-primary));">🖨️ Thermal POS 58/80mm</button>
            </div>
            <button type="button" class="btn btn-sm btn-secondary" id="btn-help-thermal" style="padding: 5px 10px; font-size: 0.78rem; color: hsl(var(--accent-blue)); font-weight: 600;"><i data-lucide="help-circle" style="width:14px;height:14px;"></i> Panduan Driver Windows</button>
          </div>
          <div class="modal-body" id="receipt-body" style="padding: 24px;"></div>
          <div class="modal-footer" style="justify-content: space-between;"><button type="button" class="btn btn-secondary" id="btn-close-receipt-2">Tutup</button><button type="button" class="btn btn-gold" id="btn-do-print" style="font-weight: 700;"><i data-lucide="printer"></i> Cetak Sekarang / PDF</button></div>
        </div>
      </div>

      <!-- Modal Panduan Driver Printer Thermal Windows -->
      <div class="modal-backdrop" id="modal-printer-help">
        <div class="modal-content" style="max-width: 620px;">
          <div class="modal-header" style="background: linear-gradient(135deg, hsl(160, 84%, 30%), hsl(var(--accent-blue))); color: white;">
            <div><h4 style="font-size: 1.15rem; font-weight: 800;"><i data-lucide="printer" style="margin-right:6px;"></i> Panduan Instalasi Driver Printer Thermal Windows</h4></div>
            <button class="icon-btn" id="btn-close-printer-help" style="background: rgba(255,255,255,0.2); color: white;"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body" style="padding: 20px; font-size: 0.88rem; line-height: 1.6; color: hsl(var(--text-primary)); max-height: 70vh; overflow-y: auto;">
            <div style="background: rgba(245, 158, 11, 0.15); border-left: 4px solid hsl(var(--accent-gold)); padding: 12px; margin-bottom: 16px; border-radius: 4px;">
              <b>📌 Mengapa Butuh Driver?</b> Windows memerlukan driver agar printer kasir (58mm/80mm USB atau Bluetooth) terdeteksi saat Anda menekan tombol <b>Cetak Sekarang</b> di aplikasi ini.
            </div>
            <h5 style="font-weight: 700; color: hsl(var(--accent-gold)); margin-bottom: 8px;">Langkah-Langkah Instalasi Driver di Windows:</h5>
            <ol style="padding-left: 20px; margin-bottom: 16px;">
              <li style="margin-bottom: 8px;"><b>Hubungkan Printer:</b> Colokkan kabel USB printer thermal ke laptop/komputer Windows Anda dan nyalakan printer.</li>
              <li style="margin-bottom: 8px;"><b>Gunakan CD Driver / Installer Bawaan:</b>
                <ul style="padding-left: 16px; margin-top: 4px; list-style: disc;">
                  <li>Jika merk <b>Xprinter / POS-58 / POS-80 / Blueprint / Panda / EPPOS</b>: jalankan file <code>POS Printer Driver Setup.exe</code> bawaan printer Anda.</li>
                  <li>Pilih OS <b>Windows 10 / Windows 11</b> dan pilih port USB (misal: <code>USB001</code> / <code>USB002</code>), lalu klik <b>Install Now</b>.</li>
                </ul>
              </li>
              <li style="margin-bottom: 8px;"><b>Atau Gunakan Driver Universal Windows (Tanpa CD):</b>
                <ul style="padding-left: 16px; margin-top: 4px; list-style: disc;">
                  <li>Buka <b>Windows Settings</b> ➔ <b>Bluetooth & devices</b> ➔ <b>Printers & scanners</b>.</li>
                  <li>Klik <b>Add device / Add printer</b> ➔ pilih <i>"The printer that I want isn't listed"</i>.</li>
                  <li>Pilih <i>"Add a local printer... with manual settings"</i> ➔ pilih port <code>USB001</code> ➔ di kolom Manufacturer pilih <b>Generic</b> ➔ pilih <b>Generic / Text Only</b> ➔ beri nama <code>Printer Thermal Gereja</code> dan klik Next sampai selesai.</li>
                </ul>
              </li>
              <li style="margin-bottom: 8px;"><b>Cara Cetak Sempurna di Aplikasi Ini:</b>
                <ul style="padding-left: 16px; margin-top: 4px; list-style: disc;">
                  <li>Aktifkan tombol <b>🖨️ Thermal POS 58/80mm</b> di atas pada jendela kuitansi ini.</li>
                  <li>Klik tombol <b>Cetak Sekarang</b>. Saat dialog print browser muncul, pilih Tujuan/Destination: <b>[Nama Printer Thermal Anda]</b>.</li>
                  <li>Klik menu <b>More settings</b> (Setelan tambahan) di dialog print ➔ ubah <b>Paper size</b> menjadi <code>58mm x 210mm</code> atau <code>80mm x 297mm</code> (Roll Paper), dan <b>Hilangkan centang</b> pada <i>Headers and footers</i>.</li>
                </ul>
              </li>
            </ol>
          </div>
          <div class="modal-footer"><button type="button" class="btn btn-primary" id="btn-close-printer-help-2" style="width: 100%;">Mengerti & Kembali ke Kuitansi</button></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dateInput = container.querySelector('#in-date');
    const receiptInput = container.querySelector('#in-receipt');
    if (dateInput && receiptInput) {
      dateInput.addEventListener('change', () => {
        receiptInput.value = generateReceiptNo(dateInput.value, state);
      });
    }

    container.querySelectorAll('.calc-trigger').forEach(input => {
      input.addEventListener('input', () => {
        const psp = Number(container.querySelector('#in-psp')?.value) || 0;
        const tpd = Number(container.querySelector('#in-tpd')?.value) || 0;
        const khs = Number(container.querySelector('#in-khs')?.value) || 0;
        const pbg = Number(container.querySelector('#in-pbg')?.value) || 0;
        const dll = Number(container.querySelector('#in-dll')?.value) || 0;
        const calc = calculateIncomeBreakdown({ persepuluhan: psp, persembahanTerpadu: tpd, persembahanKhusus: khs, persembahanPembangunan: pbg, lainLain: dll });
        container.querySelector('#split-dskt').textContent = formatRupiah(calc.kasDskt);
        container.querySelector('#split-gereja').textContent = formatRupiah(calc.kasGereja);
        container.querySelector('#split-pembangunan').textContent = formatRupiah(calc.kasPembangunan);
        container.querySelector('#split-total').textContent = formatRupiah(calc.total);
      });
    });

    // Autocomplete logika
    const inMemberInput = container.querySelector('#in-member');
    const dropdownList = container.querySelector('#member-autocomplete-list');
    const toggleBtn = container.querySelector('#btn-toggle-member-list');

    if (inMemberInput && dropdownList) {
      const allOptions = [
        { name: "Umum/Anonim", subtitle: "-- Persembahan Kantong Umum / Anonim --", isDefault: true },
        ...members.map(m => ({
          name: m.name,
          subtitle: `${m.address || '-'} • HP: ${m.phone || '-'}`
        }))
      ];

      function renderOptions(query = "") {
        const q = query.trim().toLowerCase();
        const filtered = allOptions.filter(opt => {
          if (!q) return true;
          return opt.name.toLowerCase().includes(q) || opt.subtitle.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
          dropdownList.innerHTML = `
            <div style="padding: 14px; text-align: center; color: hsl(var(--text-muted)); font-size: 0.85rem;">
              <div>Tidak ditemukan "${query}"</div>
              <div style="font-size: 0.78rem; color: hsl(var(--accent-gold)); margin-top: 4px;">💡 Anda bisa tetap pilih/ketik nama ini & langsung simpan (otomatis jadi anggota baru)</div>
            </div>
          `;
          return;
        }

        dropdownList.innerHTML = filtered.map((opt, idx) => `
          <div class="autocomplete-item" data-name="${opt.name.replace(/"/g, '&quot;')}" style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; transition: background 0.15s;">
            <div>
              <div style="font-weight: ${opt.isDefault ? '700' : '600'}; color: ${opt.isDefault ? 'hsl(var(--accent-gold))' : 'hsl(var(--text-primary))'};">${opt.name}</div>
              <div style="font-size: 0.78rem; color: hsl(var(--text-muted));">${opt.subtitle}</div>
            </div>
          </div>
        `).join('');

        dropdownList.querySelectorAll('.autocomplete-item').forEach(item => {
          item.addEventListener('click', () => {
            inMemberInput.value = item.getAttribute('data-name');
            dropdownList.style.display = 'none';
          });
          item.addEventListener('mouseenter', () => {
            item.style.background = 'rgba(59, 130, 246, 0.15)';
          });
          item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
          });
        });
      }

      inMemberInput.addEventListener('focus', () => {
        renderOptions(inMemberInput.value === "Umum/Anonim" ? "" : inMemberInput.value);
        dropdownList.style.display = 'block';
      });

      inMemberInput.addEventListener('input', () => {
        renderOptions(inMemberInput.value);
        dropdownList.style.display = 'block';
      });

      toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdownList.style.display === 'block') {
          dropdownList.style.display = 'none';
        } else {
          renderOptions("");
          dropdownList.style.display = 'block';
          inMemberInput.focus();
        }
      });

      const closeListener = (e) => {
        if (!container.contains(e.target) || (!inMemberInput.contains(e.target) && !dropdownList.contains(e.target) && !toggleBtn?.contains(e.target))) {
          dropdownList.style.display = 'none';
        }
      };
      document.addEventListener('click', closeListener);
    }

    container.querySelector('#form-pemasukan')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const entry = {
        date: container.querySelector('#in-date').value,
        sabbathName: "-",
        memberName: container.querySelector('#in-member').value,
        persepuluhan: container.querySelector('#in-psp').value,
        persembahanTerpadu: container.querySelector('#in-tpd').value,
        persembahanKhusus: container.querySelector('#in-khs').value,
        persembahanPembangunan: container.querySelector('#in-pbg').value,
        lainLain: container.querySelector('#in-dll').value,
        receiptNo: container.querySelector('#in-receipt').value || generateReceiptNo(container.querySelector('#in-date').value, state),
        notes: container.querySelector('#in-notes').value
      };
      if (Number(entry.persepuluhan) + Number(entry.persembahanTerpadu) + Number(entry.persembahanKhusus) + Number(entry.persembahanPembangunan) + Number(entry.lainLain) <= 0) {
        showToast("Harap isi setidaknya satu nominal persembahan!", "warning");
        return;
      }
      if (entry.memberName && entry.memberName !== "Umum/Anonim") {
        const exists = members.some(m => m.name.toLowerCase() === entry.memberName.trim().toLowerCase());
        if (!exists) {
          addMember({ name: entry.memberName.trim() });
        }
      }
      addPemasukan(entry);
      showToast("Transaksi persembahan berhasil disimpan dan dibagi secara otomatis!", "success");
      renderPemasukan(container, getState());
    });

    container.querySelectorAll('.btn-del-masuk').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Apakah Anda yakin ingin menghapus catatan pemasukan ini?")) {
          deletePemasukan(id);
          showToast("Transaksi berhasil dihapus.", "success");
          renderPemasukan(container, getState());
        }
      });
    });

    const modalMember = container.querySelector('#modal-member');
    container.querySelector('#btn-add-member-modal')?.addEventListener('click', () => modalMember.classList.add('active'));
    container.querySelectorAll('.btn-close-member-modal').forEach(btn => {
      btn.addEventListener('click', () => modalMember.classList.remove('active'));
    });

    const tabBtnManual = container.querySelector('#tab-btn-manual');
    const tabBtnMassal = container.querySelector('#tab-btn-massal');
    const tabManual = container.querySelector('#tab-content-manual');
    const tabMassal = container.querySelector('#tab-content-massal');
    if (tabBtnManual && tabBtnMassal) {
      tabBtnManual.addEventListener('click', () => {
        tabBtnManual.style.borderBottomColor = 'hsl(var(--accent-gold))';
        tabBtnManual.style.color = 'hsl(var(--text-primary))';
        tabBtnMassal.style.borderBottomColor = 'transparent';
        tabBtnMassal.style.color = 'hsl(var(--text-muted))';
        tabManual.style.display = 'block';
        tabMassal.style.display = 'none';
      });
      tabBtnMassal.addEventListener('click', () => {
        tabBtnMassal.style.borderBottomColor = 'hsl(var(--accent-gold))';
        tabBtnMassal.style.color = 'hsl(var(--text-primary))';
        tabBtnManual.style.borderBottomColor = 'transparent';
        tabBtnManual.style.color = 'hsl(var(--text-muted))';
        tabMassal.style.display = 'block';
        tabManual.style.display = 'none';
      });
    }

    const fileInput = container.querySelector('#file-import-members');
    const fileNameDisplay = container.querySelector('#import-file-name');
    container.querySelector('#btn-pick-excel')?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      fileNameDisplay.textContent = file ? `📄 Terpilih: ${file.name}` : '';
    });

    container.querySelector('#btn-dl-template')?.addEventListener('click', () => {
      if (!window.XLSX) {
        showToast("Pustaka Excel belum siap. Coba beberapa saat lagi.", "warning");
        return;
      }
      const sampleData = [
        { "Nama Anggota": "Keluarga Bpk. S. Hutapea", "No HP/WhatsApp": "08123456789", "Alamat/Lingkungan": "Lingkungan 1 - Jl. Mawar" },
        { "Nama Anggota": "Ibu M. Panjaitan", "No HP/WhatsApp": "08129876543", "Alamat/Lingkungan": "Lingkungan 2 - Jl. Melati" },
        { "Nama Anggota": "Sdr. J. Sitorus", "No HP/WhatsApp": "-", "Alamat/Lingkungan": "Lingkungan 3" }
      ];
      const ws = window.XLSX.utils.json_to_sheet(sampleData);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Template Anggota");
      window.XLSX.writeFile(wb, "template-import-anggota-gmahk.xlsx");
      showToast("Template Excel berhasil didownload!", "success");
    });

    container.querySelector('#btn-process-mass-import')?.addEventListener('click', () => {
      const parsedMembers = [];
      const rawText = container.querySelector('#text-import-members')?.value || '';
      if (rawText.trim()) {
        const lines = rawText.split(/\r?\n/);
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;
          const parts = trimmed.split(',').map(s => s.trim());
          parsedMembers.push({ name: parts[0], phone: parts[1] || '-', address: parts[2] || '-' });
        });
      }

      const file = fileInput?.files[0];
      if (file) {
        if (!window.XLSX) {
          showToast("Pustaka Excel tidak tersedia untuk membaca file.", "danger");
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = new Uint8Array(evt.target.result);
            const workbook = window.XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (rows && rows.length > 0) {
              let startRow = 0;
              let colName = 0, colPhone = 1, colAddr = 2;
              const headerRow = rows[0].map(c => String(c || '').toLowerCase());
              if (headerRow.some(h => h.includes('nama') || h.includes('name') || h.includes('anggota'))) {
                startRow = 1;
                headerRow.forEach((h, idx) => {
                  if (h.includes('nama') || h.includes('name') || h.includes('anggota')) colName = idx;
                  else if (h.includes('hp') || h.includes('wa') || h.includes('phone') || h.includes('telp')) colPhone = idx;
                  else if (h.includes('alamat') || h.includes('lingkungan') || h.includes('addr')) colAddr = idx;
                });
              }

              for (let i = startRow; i < rows.length; i++) {
                const r = rows[i];
                if (!r || !r[colName]) continue;
                const nameStr = String(r[colName]).trim();
                if (nameStr) {
                  parsedMembers.push({
                    name: nameStr,
                    phone: r[colPhone] ? String(r[colPhone]).trim() : '-',
                    address: r[colAddr] ? String(r[colAddr]).trim() : '-'
                  });
                }
              }
            }
            saveMassImport(parsedMembers);
          } catch (err) {
            console.error(err);
            showToast("Gagal membaca file Excel. Pastikan format file benar.", "danger");
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }

      saveMassImport(parsedMembers);

      function saveMassImport(list) {
        if (list.length === 0) {
          showToast("Tidak ada data anggota yang ditemukan untuk diimpor!", "warning");
          return;
        }
        const added = addMembersBulk(list);
        modalMember.classList.remove('active');
        if (container.querySelector('#text-import-members')) container.querySelector('#text-import-members').value = '';
        if (fileInput) fileInput.value = '';
        if (fileNameDisplay) fileNameDisplay.textContent = '';
        showToast(`Berhasil mengimpor ${added.length} anggota baru (${list.length - added.length} duplikat diabaikan).`, "success");
        renderPemasukan(container, getState());
      }
    });

    container.querySelector('#form-new-member')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newM = addMember({
        name: container.querySelector('#nm-name').value,
      address: container.querySelector('#nm-address').value
      });
      modalMember.classList.remove('active');
      showToast(`Anggota "${newM.name}" berhasil ditambahkan ke daftar!`, "success");
      renderPemasukan(container, getState());
    });

    const modalReceipt = container.querySelector('#modal-receipt');
    const modalPrinterHelp = container.querySelector('#modal-printer-help');
    let currentReceiptItem = null;

    function renderReceiptContent(item) {
      if (!item) return;
      const calc = calculateIncomeBreakdown(item);
      const isThermal = document.body.classList.contains('thermal-print-mode');
      container.querySelector('#receipt-body').innerHTML = `
        <div style="text-align: center; border-bottom: 2px dashed ${isThermal ? '#000' : 'var(--border-color)'}; padding-bottom: 14px; margin-bottom: 14px;" class="thermal-dash-line">
          <div style="font-size: 0.82rem; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'}; font-weight: 600;">TANDA TERIMA PERSEMBAHAN RESMI</div>
          <h3 style="font-size: 1.35rem; color: ${isThermal ? '#000' : 'hsl(var(--accent-gold))'}; margin-top: 4px; font-weight: 800;">No. ${item.receiptNo}</h3>
          <div style="font-size: 0.88rem; color: ${isThermal ? '#000' : 'hsl(var(--text-primary))'};">Tanggal: <strong>${formatDateIndo(item.date)}</strong></div>
        </div>
        <div style="margin-bottom: 14px;">
          <div style="font-size: 0.8rem; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'};">DITERIMA DARI:</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: ${isThermal ? '#000' : 'hsl(var(--text-primary))'};">${item.memberName}</div>
        </div>
        <div style="background: ${isThermal ? 'transparent' : 'rgba(0,0,0,0.25)'}; padding: ${isThermal ? '6px 0' : '14px'}; border-radius: var(--radius-sm); margin-bottom: 14px; border-top: ${isThermal ? '1px dashed #000' : 'none'}; border-bottom: ${isThermal ? '1px dashed #000' : 'none'};" class="thermal-dash-line">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span>1. Persepuluhan (DSKT):</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--danger))'};">${formatRupiah(item.persepuluhan)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span>2. Pers. Terpadu:</span> <strong>${formatRupiah(item.persembahanTerpadu)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span>3. Pers. Khusus (Grj):</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--success))'};">${formatRupiah(item.persembahanKhusus)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span>4. Pers. Pembangunan:</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--accent-blue))'};">${formatRupiah(item.persembahanPembangunan)}</strong>
          </div>
          ${Number(item.lainLain) > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span>5. Lain-lain:</span> <strong>${formatRupiah(item.lainLain)}</strong>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; border-top: 1px solid ${isThermal ? '#000' : 'var(--border-color)'}; padding-top: 8px; margin-top: 8px; font-size: 1.1rem; font-weight: 800; color: ${isThermal ? '#000' : 'hsl(var(--accent-gold))'};">
            <span>TOTAL:</span> <span>${formatRupiah(calc.total)}</span>
          </div>
        </div>
        <div style="font-size: 0.78rem; text-align: center; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'}; font-style: italic;">
          "Bawalah seluruh persembahan persepuluhan itu ke dalam rumah perbendaharaan..." (Maleakhi 3:10)
        </div>
      `;
    }

    container.querySelectorAll('.btn-print-kw').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = pemasukanList.find(i => i.id === id);
        if (!item) return;
        currentReceiptItem = item;
        renderReceiptContent(currentReceiptItem);
        modalReceipt?.classList.add('active');
      });
    });

    const btnModeStd = container.querySelector('#btn-mode-standard');
    const btnModeThm = container.querySelector('#btn-mode-thermal');

    btnModeStd?.addEventListener('click', () => {
      document.body.classList.remove('thermal-print-mode');
      btnModeStd.style.background = 'hsl(var(--accent-gold))';
      btnModeStd.style.color = 'black';
      btnModeStd.style.fontWeight = '700';
      if (btnModeThm) {
        btnModeThm.style.background = 'transparent';
        btnModeThm.style.color = 'hsl(var(--text-primary))';
        btnModeThm.style.fontWeight = 'normal';
      }
      renderReceiptContent(currentReceiptItem);
    });

    btnModeThm?.addEventListener('click', () => {
      document.body.classList.add('thermal-print-mode');
      btnModeThm.style.background = 'hsl(var(--accent-gold))';
      btnModeThm.style.color = 'black';
      btnModeThm.style.fontWeight = '700';
      if (btnModeStd) {
        btnModeStd.style.background = 'transparent';
        btnModeStd.style.color = 'hsl(var(--text-primary))';
        btnModeStd.style.fontWeight = 'normal';
      }
      renderReceiptContent(currentReceiptItem);
    });

    container.querySelector('#btn-help-thermal')?.addEventListener('click', () => modalPrinterHelp?.classList.add('active'));
    container.querySelector('#btn-close-printer-help')?.addEventListener('click', () => modalPrinterHelp?.classList.remove('active'));
    container.querySelector('#btn-close-printer-help-2')?.addEventListener('click', () => modalPrinterHelp?.classList.remove('active'));

    container.querySelector('#btn-close-receipt')?.addEventListener('click', () => modalReceipt?.classList.remove('active'));
    container.querySelector('#btn-close-receipt-2')?.addEventListener('click', () => modalReceipt?.classList.remove('active'));
    container.querySelector('#btn-do-print')?.addEventListener('click', () => {
      document.body.classList.add('printing-receipt');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-receipt');
      }, 800);
    });
  }

  function renderPengeluaran(container, state) {
    const pengeluaranList = state.pengeluaran || [];

    container.innerHTML = `
      <div class="view-split-grid">
        <div class="glass-card">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--danger)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;"><i data-lucide="minus-circle" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>Input Pengeluaran Departemen</h3>
          <form id="form-pengeluaran">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">Tanggal Pengeluaran</label><input type="date" class="form-control" id="ex-date" value="${today}" required /></div>
              <div class="form-group"><label class="form-label">Nomor Voucher / Bukti Kuitansi</label><input type="text" class="form-control" id="ex-voucher" value="${generateVoucherNo(today, state)}" required style="font-weight: 700; color: hsl(var(--accent-gold));" /></div>
            </div>
            <div class="form-group">
              <label class="form-label">Pilih Kategori Departemen / Pos Pengeluaran (30 Resmi)</label>
              <select class="form-control" id="ex-dept" required style="font-weight: 600;">
                ${EXPENDITURE_DEPARTMENTS.map(d => `<option value="${d.id}">${d.id}. ${d.name} (${d.category})</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">Nominal Pengeluaran (Rp)</label><input type="number" class="form-control" id="ex-amount" placeholder="0" min="1000" step="1000" required style="font-size: 1.15rem; font-weight: 700; color: hsl(var(--danger));" /></div>
            <div class="form-group"><label class="form-label">Keterangan / Uraian Pengeluaran</label><textarea class="form-control" id="ex-desc" rows="3" placeholder="Cth: Pembelian bahan makanan & perlawatan anggota sakit di RS Teratai" required></textarea></div>
            <div class="form-group" style="flex-direction: row; align-items: center; gap: 10px; background: rgba(59,130,246,0.08); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(59,130,246,0.2);">
              <input type="checkbox" id="ex-building" style="width: 18px; height: 18px; cursor: pointer;" />
              <label for="ex-building" style="font-size: 0.88rem; cursor: pointer; color: hsl(var(--text-primary)); font-weight: 600;">Ambil dari Kas Pembangunan (Centang jika pengeluaran khusus konstruksi/proyek fisik jemaat)</label>
            </div>
            <button type="submit" class="btn btn-danger" style="width: 100%; margin-top: 20px; padding: 14px; font-size: 1rem; justify-content: center;"><i data-lucide="save"></i><span>Simpan Pengeluaran</span></button>
          </form>
        </div>

        <div class="glass-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h3 style="font-size: 1.15rem; font-weight: 700;">Riwayat Pengeluaran Terakhir</h3>
            <span class="badge" style="background: rgba(239,68,68,0.15); color: hsl(var(--danger));">Total: ${pengeluaranList.length} Transaksi</span>
          </div>
          <div class="table-responsive" style="max-height: 650px; overflow-y: auto;">
            <table class="data-table">
              <thead><tr><th>Tanggal & Voucher</th><th>Departemen & Keterangan</th><th>Nominal</th><th>Aksi</th></tr></thead>
              <tbody>
                ${pengeluaranList.map(item => `
                  <tr>
                    <td style="width: 25%;">
                      <div style="font-weight: 600;">${formatDateIndo(item.date)}</div>
                      <div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">Voucher: ${item.voucherNo}</div>
                      ${item.isBuildingFund ? `<span class="badge badge-pembangunan" style="margin-top: 4px;">Kas Pembangunan</span>` : `<span class="badge badge-gereja" style="margin-top: 4px;">Kas Jemaat</span>`}
                    </td>
                    <td><div style="font-weight: 700; color: hsl(var(--text-primary));">${item.departmentName}</div><div style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin-top: 2px;">${item.description}</div></td>
                    <td style="font-weight: 800; color: hsl(var(--danger)); width: 22%;">-${formatRupiah(item.amount)}</td>
                    <td style="text-align: center; width: 60px;"><button class="icon-btn btn-del-keluar" data-id="${item.id}" title="Hapus Pengeluaran" style="color: hsl(var(--danger));"><i data-lucide="trash-2"></i></button></td>
                  </tr>
                `).join('')}
                ${pengeluaranList.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 40px; color: hsl(var(--text-muted));">Belum ada catatan pengeluaran.</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const exDateInput = container.querySelector('#ex-date');
    const exVoucherInput = container.querySelector('#ex-voucher');
    if (exDateInput && exVoucherInput) {
      exDateInput.addEventListener('change', () => {
        exVoucherInput.value = generateVoucherNo(exDateInput.value, state);
      });
    }

    container.querySelector('#form-pengeluaran')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const deptSelect = container.querySelector('#ex-dept');
      const deptId = deptSelect.value;
      const deptName = deptSelect.options[deptSelect.selectedIndex].text.replace(/^\d+\.\s*/, '').split(' (')[0];
      const entry = {
        date: container.querySelector('#ex-date').value,
        voucherNo: container.querySelector('#ex-voucher').value || generateVoucherNo(container.querySelector('#ex-date').value, state),
        departmentId: Number(deptId),
        departmentName: deptName,
        amount: container.querySelector('#ex-amount').value,
        description: container.querySelector('#ex-desc').value,
        isBuildingFund: container.querySelector('#ex-building').checked
      };
      addPengeluaran(entry);
      showToast(`Pengeluaran untuk "${entry.departmentName}" berhasil disimpan!`, "success");
      renderPengeluaran(container, getState());
    });

    container.querySelectorAll('.btn-del-keluar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Apakah Anda yakin ingin menghapus catatan pengeluaran ini?")) {
          deletePengeluaran(id);
          showToast("Pengeluaran berhasil dihapus.", "success");
          renderPengeluaran(container, getState());
        }
      });
    });
  }

  function renderKirimDskt(container, state) {
    const summary = calculateFinancialSummary(state);
    const kirimList = state.kirimDskt || [];
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;">
        <div>
          <span class="badge badge-dskt" style="margin-bottom: 8px;">Kewajiban Konferens / Daerah (DSKT)</span>
          <h3 style="font-size: 1.5rem; font-weight: 800; color: hsl(var(--text-primary));">Status Titipan Dana DSKT</h3>
          <p style="color: hsl(var(--text-secondary)); font-size: 0.9rem; max-width: 600px; margin-top: 4px;">Sesuai aturan GMAHK, 100% Persepuluhan dan 50% Persembahan Terpadu adalah milik Daerah/Konferens yang harus disetorkan secara berkala oleh Bendahara Jemaat.</p>
        </div>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="background: rgba(0,0,0,0.35); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">AKUMULASI TITIPAN DSKT</div><div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--text-primary));">${formatRupiah(summary.saldoAwalDskt + summary.totalMasukDskt)}</div></div>
          <div style="background: rgba(0,0,0,0.35); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">SUDAH DIKIRIM KE DSKT</div><div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--warning));">${formatRupiah(summary.totalUangDikirimDskt)}</div></div>
          <div style="background: rgba(239, 68, 68, 0.2); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid rgba(239,68,68,0.5); text-align: right;"><div style="font-size: 0.78rem; color: #fca5a5; font-weight: 700;">BELUM DISETOR (SISA TITIPAN)</div><div style="font-size: 1.4rem; font-weight: 800; color: #ffffff;">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</div></div>
        </div>
      </div>

      <div class="view-split-grid">
        <div class="glass-card">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--warning)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;"><i data-lucide="send" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>Catat Setoran / Pengiriman Uang ke DSKT</h3>
          <form id="form-dskt">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">Tanggal Setor / Transfer</label><input type="date" class="form-control" id="tr-date" value="${today}" required /></div>
              <div class="form-group"><label class="form-label">No. Referensi / Bukti Bank</label><input type="text" class="form-control" id="tr-ref" placeholder="Cth: TRX-BNI-8921" required /></div>
            </div>
            <div class="form-group">
              <label class="form-label">Nominal Setoran ke DSKT (Rp)</label>
              <input type="number" class="form-control" id="tr-amount" value="${Math.max(0, Math.round(summary.kewajibanDsktBelumDisetor))}" min="1000" step="1000" required style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--warning));" />
              <span style="font-size: 0.78rem; color: hsl(var(--text-muted)); margin-top: 4px;">*Otomatis terisi sisa titipan saat ini, namun bisa disesuaikan jika setoran sebagian.</span>
            </div>
            <div class="form-group"><label class="form-label">Catatan / Keterangan Setoran</label><textarea class="form-control" id="tr-notes" rows="3" placeholder="Cth: Setoran Persepuluhan dan 50% Pers. Terpadu bulan Juli 2026 via transfer rekening DSKT" required></textarea></div>
            <button type="submit" class="btn btn-gold" style="width: 100%; margin-top: 16px; padding: 14px; font-size: 1rem; justify-content: center;"><i data-lucide="check-circle"></i><span>Simpan Bukti Pengiriman ke DSKT</span></button>
          </form>
        </div>

        <div class="glass-card">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">Riwayat Pengiriman Uang ke DSKT</h3>
          <div class="table-responsive" style="max-height: 550px; overflow-y: auto;">
            <table class="data-table">
              <thead><tr><th>Tanggal & Ref</th><th>Keterangan</th><th>Jumlah Dikirim</th><th>Aksi</th></tr></thead>
              <tbody>
                ${kirimList.map(item => `
                  <tr>
                    <td style="width: 28%;"><div style="font-weight: 700;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">Ref: ${item.referenceNo}</div></td>
                    <td><div style="font-size: 0.88rem; color: hsl(var(--text-primary));">${item.notes}</div></td>
                    <td style="font-weight: 800; color: hsl(var(--warning)); width: 25%;">${formatRupiah(item.amount)}</td>
                    <td style="text-align: center; width: 60px;"><button class="icon-btn btn-del-dskt" data-id="${item.id}" title="Hapus Bukti Setoran" style="color: hsl(var(--danger));"><i data-lucide="trash-2"></i></button></td>
                  </tr>
                `).join('')}
                ${kirimList.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 40px; color: hsl(var(--text-muted));">Belum ada catatan setoran ke DSKT.</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#form-dskt')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const entry = {
        date: container.querySelector('#tr-date').value,
        referenceNo: container.querySelector('#tr-ref').value,
        amount: container.querySelector('#tr-amount').value,
        notes: container.querySelector('#tr-notes').value
      };
      addKirimDskt(entry);
      showToast("Bukti pengiriman dana ke DSKT berhasil disimpan!", "success");
      renderKirimDskt(container, getState());
    });

    container.querySelectorAll('.btn-del-dskt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Apakah Anda yakin ingin menghapus catatan pengiriman DSKT ini?")) {
          deleteKirimDskt(id);
          showToast("Bukti pengiriman berhasil dihapus.", "success");
          renderKirimDskt(container, getState());
        }
      });
    });
  }

  function renderLaporan(container, state) {
    const summary = calculateFinancialSummary(state);
    const pemasukanList = state.pemasukan || [];
    const pengeluaranList = state.pengeluaran || [];
    const kirimList = state.kirimDskt || [];

    container.innerHTML = `
      <div class="glass-card" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
        <div><h3 style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--text-primary));">Laporan Keuangan Bendahara Jemaat</h3><p style="font-size: 0.85rem; color: hsl(var(--text-secondary));">Siap dicetak untuk Rapat Majelis Jemaat (Church Board) atau diekspor ke Excel / Google Sheets.</p></div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="btn-print-report" style="padding: 10px 18px;"><i data-lucide="printer"></i><span>Cetak Laporan Majelis (Print)</span></button>
          <button class="btn btn-primary" id="btn-export-excel" style="padding: 10px 18px; background: linear-gradient(135deg, #16a34a, #15803d);"><i data-lucide="file-spreadsheet"></i><span>Ekspor ke Excel (Pisah Sheet Masuk/Keluar)</span></button>
        </div>
      </div>

      <div id="print-report-container">
        <div style="text-align: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid var(--border-highlight);">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: hsl(var(--text-primary)); letter-spacing: 0.05em; text-transform: uppercase;">GEREJA MASEHI ADVENT HARI KETUJUH (GMAHK)</h2>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: hsl(var(--accent-gold)); margin-top: 4px;">${state.settings.churchName || 'Jemaat Pusat'}</h3>
          <div style="font-size: 0.9rem; color: hsl(var(--text-secondary));">${state.settings.districtName || 'DSKT'}</div>
          <div style="font-size: 0.85rem; color: hsl(var(--text-muted)); margin-top: 4px;">Laporan Arus Kas Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
        </div>

        <div class="stats-grid" style="margin-bottom: 30px;">
          <div class="stat-card" style="--stat-glow: rgba(59,130,246,0.15);"><span class="stat-title">Saldo Kas Gereja (Operasional)</span><div class="stat-value" style="color: hsl(var(--success));">${formatRupiah(summary.saldoKasGereja)}</div><div class="stat-desc">Awal: ${formatRupiah(summary.saldoAwalGereja)}</div></div>
          <div class="stat-card" style="--stat-glow: rgba(59,130,246,0.15);"><span class="stat-title">Saldo Kas Pembangunan</span><div class="stat-value" style="color: hsl(var(--accent-blue));">${formatRupiah(summary.saldoKasPembangunan)}</div><div class="stat-desc">Awal: ${formatRupiah(summary.saldoAwalPembangunan)}</div></div>
          <div class="stat-card" style="--stat-glow: rgba(239,68,68,0.15);"><span class="stat-title">Titipan DSKT Belum Disetor</span><div class="stat-value" style="color: hsl(var(--danger));">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</div><div class="stat-desc">Sudah Dikirim: ${formatRupiah(summary.totalUangDikirimDskt)}</div></div>
          <div class="stat-card" style="--stat-glow: rgba(245,158,11,0.15);"><span class="stat-title">Sisa Saldo Kas Keseluruhan</span><div class="stat-value" style="color: hsl(var(--accent-gold)); font-size: 1.8rem;">${formatRupiah(summary.sisaSaldoTotal)}</div><div class="stat-desc">Total Uang Fisik / Rekening</div></div>
        </div>

        <div class="glass-card" style="margin-bottom: 28px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(59, 130, 246, 0.4); padding-bottom: 12px;"><h3 style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--accent-blue));">I. BAGIAN PEMASUKAN PERSEMBAHAN & PERSEPULUHAN</h3><span class="badge badge-pembangunan">${pemasukanList.length} Transaksi</span></div>
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr style="background: rgba(30, 58, 138, 0.4);"><th>Tanggal & No. Kuitansi</th><th>Anggota Jemaat</th><th>Persepuluhan (DSKT)</th><th>Pers. Terpadu (Total)</th><th>Pers. Khusus (Grj)</th><th>Pers. Pembangunan</th><th>Lain-lain</th><th>Total Pemasukan</th></tr></thead>
              <tbody>
                ${pemasukanList.map(item => {
                  const calc = calculateIncomeBreakdown(item);
                  return `<tr><td><div style="font-weight: 600;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-muted));">No. ${item.receiptNo}</div></td><td><div style="font-weight: 700; color: hsl(var(--accent-gold));">${item.memberName}</div></td><td style="color: hsl(var(--danger)); font-weight: 600;">${formatRupiah(item.persepuluhan)}</td><td style="font-weight: 600;"><div>${formatRupiah(item.persembahanTerpadu)}</div><div style="font-size: 0.72rem; color: hsl(var(--text-muted));">(Grj: ${formatRupiah(calc.gerejaFromTerpadu)} / DSKT: ${formatRupiah(item.persembahanTerpadu*0.5)})</div></td><td style="color: hsl(var(--success)); font-weight: 600;">${formatRupiah(item.persembahanKhusus)}</td><td style="color: hsl(var(--accent-blue)); font-weight: 600;">${formatRupiah(item.persembahanPembangunan)}</td><td>${formatRupiah(item.lainLain)}</td><td style="font-weight: 800; color: hsl(var(--success)); font-size: 1rem;">${formatRupiah(calc.total)}</td></tr>`;
                }).join('')}
                ${pemasukanList.length === 0 ? `<tr><td colspan="8" style="text-align: center; padding: 30px;">Belum ada data persembahan.</td></tr>` : ''}
              </tbody>
              <tfoot><tr style="background: rgba(0, 0, 0, 0.4); font-weight: 800;"><td colspan="2" style="text-align: right; padding: 16px;">TOTAL PEMASUKAN:</td><td style="color: hsl(var(--danger));">${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persepuluhan)||0), 0))}</td><td>${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persembahanTerpadu)||0), 0))}</td><td style="color: hsl(var(--success));">${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persembahanKhusus)||0), 0))}</td><td style="color: hsl(var(--accent-blue));">${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persembahanPembangunan)||0), 0))}</td><td>${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.lainLain)||0), 0))}</td><td style="color: hsl(var(--accent-gold)); font-size: 1.1rem;">${formatRupiah(summary.totalUangMasuk)}</td></tr></tfoot>
            </table>
          </div>
        </div>

        <div class="glass-card" style="margin-bottom: 28px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(239, 68, 68, 0.4); padding-bottom: 12px;"><h3 style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--danger));">II. BAGIAN PENGELUARAN OPERASIONAL & DEPARTEMEN</h3><span class="badge badge-dskt">${pengeluaranList.length} Transaksi</span></div>
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr style="background: rgba(153, 27, 27, 0.4);"><th>Tanggal & Voucher</th><th>Kategori Departemen</th><th>Keterangan / Uraian</th><th>Sumber Dana</th><th>Nominal Pengeluaran</th></tr></thead>
              <tbody>
                ${pengeluaranList.map(item => `<tr><td><div style="font-weight: 600;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-muted));">Voucher: ${item.voucherNo}</div></td><td style="font-weight: 700; color: hsl(var(--text-primary));">${item.departmentName}</td><td>${item.description}</td><td>${item.isBuildingFund ? `<span class="badge badge-pembangunan">Kas Pembangunan</span>` : `<span class="badge badge-gereja">Kas Jemaat</span>`}</td><td style="font-weight: 800; color: hsl(var(--danger)); font-size: 1rem;">-${formatRupiah(item.amount)}</td></tr>`).join('')}
                ${pengeluaranList.length === 0 ? `<tr><td colspan="5" style="text-align: center; padding: 30px;">Belum ada data pengeluaran.</td></tr>` : ''}
              </tbody>
              <tfoot><tr style="background: rgba(0, 0, 0, 0.4); font-weight: 800;"><td colspan="4" style="text-align: right; padding: 16px;">TOTAL PENGELUARAN:</td><td style="color: hsl(var(--danger)); font-size: 1.1rem;">-${formatRupiah(summary.totalPengeluaran)}</td></tr></tfoot>
            </table>
          </div>
        </div>

        <div class="glass-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(245, 158, 11, 0.4); padding-bottom: 12px;"><h3 style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--warning));">III. SETORAN / PENGIRIMAN KE KAS DSKT (KONFERENS/DAERAH)</h3><span class="badge" style="background: rgba(245,158,11,0.15); color: hsl(var(--warning));">${kirimList.length} Setoran</span></div>
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr style="background: rgba(180, 83, 9, 0.4);"><th>Tanggal & Referensi</th><th>Keterangan Setoran</th><th>Jumlah Setoran ke DSKT</th></tr></thead>
              <tbody>
                ${kirimList.map(item => `<tr><td><div style="font-weight: 600;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-muted));">Ref: ${item.referenceNo}</div></td><td>${item.notes}</td><td style="font-weight: 800; color: hsl(var(--warning)); font-size: 1rem;">${formatRupiah(item.amount)}</td></tr>`).join('')}
                ${kirimList.length === 0 ? `<tr><td colspan="3" style="text-align: center; padding: 30px;">Belum ada pengiriman ke DSKT.</td></tr>` : ''}
              </tbody>
              <tfoot><tr style="background: rgba(0, 0, 0, 0.4); font-weight: 800;"><td colspan="2" style="text-align: right; padding: 16px;">TOTAL DIKIRIM KE DSKT:</td><td style="color: hsl(var(--warning)); font-size: 1.1rem;">${formatRupiah(summary.totalUangDikirimDskt)}</td></tr></tfoot>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-print-report')?.addEventListener('click', () => window.print());

    container.querySelector('#btn-export-excel')?.addEventListener('click', () => {
      if (!window.XLSX) {
        showToast("Library Excel sedang dimuat, coba beberapa detik lagi.", "warning");
        return;
      }
      try {
        const wb = window.XLSX.utils.book_new();
        const rowsMasuk = pemasukanList.map(i => {
          const c = calculateIncomeBreakdown(i);
          return { "ID Transaksi": i.id, "Tanggal": i.date, "No. Kuitansi": i.receiptNo, "Nama Anggota": i.memberName, "Persepuluhan (DSKT)": i.persepuluhan, "Pers. Terpadu (Total)": i.persembahanTerpadu, "50% Masuk Kas Gereja": c.gerejaFromTerpadu, "50% Masuk Kas DSKT": c.kasDskt - i.persepuluhan, "Pers. Khusus (Gereja)": i.persembahanKhusus, "Pers. Pembangunan": i.persembahanPembangunan, "Lain-lain": i.lainLain, "Total Pemasukan": c.total, "Catatan": i.notes };
        });
        const wsMasuk = window.XLSX.utils.json_to_sheet(rowsMasuk);
        window.XLSX.utils.book_append_sheet(wb, wsMasuk, "Sheet Pemasukan");

        const rowsKeluar = pengeluaranList.map(i => ({ "ID Transaksi": i.id, "Tanggal": i.date, "Kategori Departemen": i.departmentName, "Keterangan / Uraian": i.description, "Jumlah Pengeluaran": i.amount, "No. Voucher": i.voucherNo, "Kas Pembangunan?": i.isBuildingFund ? "Ya (Pembangunan)" : "Kas Jemaat" }));
        const wsKeluar = window.XLSX.utils.json_to_sheet(rowsKeluar);
        window.XLSX.utils.book_append_sheet(wb, wsKeluar, "Sheet Pengeluaran");

        const rowsDskt = kirimList.map(i => ({ "ID Transaksi": i.id, "Tanggal Kirim": i.date, "Jumlah Dikirim ke DSKT": i.amount, "No. Referensi": i.referenceNo, "Catatan": i.notes }));
        const wsDskt = window.XLSX.utils.json_to_sheet(rowsDskt);
        window.XLSX.utils.book_append_sheet(wb, wsDskt, "Sheet Kirim DSKT");

        window.XLSX.writeFile(wb, `Laporan_Bendahara_GMAHK_${new Date().toISOString().slice(0, 10)}.xlsx`);
        showToast("Laporan berhasil diekspor menjadi file Excel (.xlsx) dengan pemisahan sheet!", "success");
      } catch (err) {
        showToast("Gagal mengekspor ke Excel: " + err.message, "danger");
      }
    });
  }

  function renderPengaturan(container, state) {
    const settings = state.settings || {};
    container.innerHTML = `
      <div class="view-split-grid">
        <div class="glass-card">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-blue)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;"><i data-lucide="settings" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>Identitas Jemaat & Saldo Awal Kas</h3>
          <form id="form-settings">
            <div class="form-group"><label class="form-label">Nama Gereja / Jemaat</label><input type="text" class="form-control" id="st-church" value="${settings.churchName || ''}" placeholder="Cth: Gereja Advent Jemaat Pusat" required /></div>
            <div class="form-group"><label class="form-label">Nama Daerah / Konferens (DSKT)</label><input type="text" class="form-control" id="st-district" value="${settings.districtName || ''}" placeholder="Cth: DSKT - Daerah Sumatera Kawasan Tengah" required /></div>
            <div class="form-group"><label class="form-label">Nama Bendahara Jemaat</label><input type="text" class="form-control" id="st-treasurer" value="${settings.treasurerName || ''}" placeholder="Cth: Bpk. R. Situmorang" /></div>
            <div style="border-top: 1px dashed var(--border-color); margin: 20px 0; padding-top: 16px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: hsl(var(--text-secondary)); margin-bottom: 14px;">Posisi Saldo Awal Kas (Sebelum Transaksi Periode Ini)</h4>
              <div class="form-grid">
                <div class="form-group"><label class="form-label" style="color: hsl(var(--success));">Saldo Awal Kas Gereja (Rp)</label><input type="number" class="form-control" id="st-saldo-grj" value="${Number(settings.saldoAwalGereja) || 0}" step="1000" /></div>
                <div class="form-group"><label class="form-label" style="color: hsl(var(--accent-blue));">Saldo Awal Kas Pembangunan (Rp)</label><input type="number" class="form-control" id="st-saldo-pbg" value="${Number(settings.saldoAwalPembangunan) || 0}" step="1000" /></div>
              </div>
              <div class="form-group"><label class="form-label" style="color: hsl(var(--danger));">Saldo Awal Titipan DSKT Belum Disetor (Rp)</label><input type="number" class="form-control" id="st-saldo-dskt" value="${Number(settings.saldoAwalDskt) || 0}" step="1000" /></div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px;"><i data-lucide="save"></i><span>Simpan Pengaturan Jemaat</span></button>
          </form>
        </div>

        <div class="glass-card">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-gold)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;"><i data-lucide="cloud" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>Backup & Sinkronisasi ke Google Sheets</h3>
          <div style="margin-bottom: 20px;">
            <label class="form-label" style="margin-bottom: 8px; display: block;">URL Webhook Google Apps Script</label>
            <div style="display: flex; gap: 10px;">
              <input type="text" class="form-control" id="st-webhook" value="${settings.webhookUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" style="flex: 1; font-size: 0.85rem;" />
              <button type="button" class="btn btn-secondary" id="btn-test-webhook" style="padding: 10px 14px; white-space: nowrap;"><i data-lucide="zap"></i> Tes URL</button>
            </div>
            <p style="font-size: 0.78rem; color: hsl(var(--text-muted)); margin-top: 6px;">Masukkan URL Web App dari file code.gs yang telah Anda pasang di Google Apps Script.</p>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 24px;">
            <button type="button" class="btn btn-gold" id="btn-sync-now" style="flex: 1; justify-content: center; padding: 14px;"><i data-lucide="refresh-cw"></i><span>Sinkronkan ke Google Sheets Sekarang</span></button>
            <button type="button" class="btn btn-secondary" id="btn-copy-template" style="padding: 14px 18px;" title="Salin Skrip Google Apps Script"><i data-lucide="copy"></i><span>Salin code.gs (1-Klik)</span></button>
          </div>
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: hsl(var(--accent-gold)); margin-bottom: 8px;">Cara Memasang Backup ke Google Sheets (3 Langkah Mudah):</h4>
            <ol style="font-size: 0.82rem; color: hsl(var(--text-secondary)); padding-left: 18px; line-height: 1.6;">
              <li>Klik tombol <strong>"Salin code.gs (1-Klik)"</strong> di atas (atau buka file <code>code.gs</code>).</li>
              <li>Buka Google Sheets baru di Google Drive Anda -> klik menu <strong>Ekstensi -> Apps Script</strong> -> tempelkan kode lalu simpan.</li>
              <li>Klik tombol biru <strong>"Terapkan (Deploy) -> Buka penerapan baru"</strong> -> pilih jenis <strong>"Aplikasi Web (Web app)"</strong> -> atur Siapa saja (Anyone) -> klik Terapkan. Salin URL yang muncul ke kolom di atas!</li>
            </ol>
          </div>
          <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: hsl(var(--text-primary)); margin-bottom: 12px;">Backup File Lokal (JSON Offline)</h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button type="button" class="btn btn-secondary" id="btn-download-json" style="flex: 1; justify-content: center; font-size: 0.85rem;"><i data-lucide="download"></i><span>Unduh File Backup JSON</span></button>
              <label class="btn btn-secondary" style="flex: 1; justify-content: center; font-size: 0.85rem; cursor: pointer; margin: 0;"><i data-lucide="upload"></i><span>Impor Data JSON</span><input type="file" id="input-import-json" accept=".json" style="display: none;" /></label>
            </div>
          </div>
          <div style="margin-top: 24px; text-align: center;"><button type="button" class="btn btn-danger" id="btn-reset-all" style="padding: 8px 16px; font-size: 0.8rem; background: transparent; border-color: rgba(239,68,68,0.4);"><i data-lucide="alert-triangle"></i><span>Reset / Bersihkan Seluruh Data Jemaat</span></button></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#form-settings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      updateSettings({
        churchName: container.querySelector('#st-church').value,
        districtName: container.querySelector('#st-district').value,
        treasurerName: container.querySelector('#st-treasurer').value,
        saldoAwalGereja: Number(container.querySelector('#st-saldo-grj').value) || 0,
        saldoAwalPembangunan: Number(container.querySelector('#st-saldo-pbg').value) || 0,
        saldoAwalDskt: Number(container.querySelector('#st-saldo-dskt').value) || 0,
        webhookUrl: container.querySelector('#st-webhook').value.trim()
      });
      showToast("Pengaturan identitas dan saldo awal berhasil disimpan!", "success");
      renderPengaturan(container, getState());
    });

    container.querySelector('#btn-test-webhook')?.addEventListener('click', async () => {
      const url = container.querySelector('#st-webhook').value.trim();
      if (!url) { showToast("Harap masukkan URL Webhook terlebih dahulu.", "warning"); return; }
      showToast("Menguji koneksi ke Google Apps Script...", "info");
      const res = await testWebhookUrl(url);
      if (res.success) { updateSettings({ webhookUrl: url }); showToast(res.message, "success"); }
      else { showToast(res.message, "danger"); }
    });

    container.querySelector('#btn-sync-now')?.addEventListener('click', async () => {
      const url = container.querySelector('#st-webhook').value.trim() || state.settings.webhookUrl;
      if (!url) { showToast("URL Webhook belum diisi di atas.", "warning"); return; }
      updateSettings({ webhookUrl: url });
      showToast("Mengirim seluruh transaksi ke Google Sheets...", "info");
      const res = await syncToGoogleSheets(url, state);
      if (res.success) { showToast(res.message, "success"); }
      else { showToast(res.message, "danger"); }
    });

    container.querySelector('#btn-copy-template')?.addEventListener('click', () => {
      navigator.clipboard.writeText(GOOGLE_SCRIPT_TEMPLATE_CODE).then(() => {
        showToast("Skrip code.gs berhasil disalin ke clipboard! Siap ditempel di Apps Script.", "success");
      }).catch(() => {
        showToast("Gagal menyalin otomatis, silakan buka file code.gs.", "warning");
      });
    });

    container.querySelector('#btn-download-json')?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `Backup_Bendahara_GMAHK_${new Date().toISOString().slice(0, 10)}.json`);
      dlAnchor.click();
      showToast("File backup JSON berhasil diunduh.", "success");
    });

    container.querySelector('#input-import-json')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const obj = JSON.parse(event.target.result);
          if (importBackupData(obj)) { showToast("Data backup berhasil diimpor!", "success"); renderPengaturan(container, getState()); }
          else { showToast("Format file backup JSON tidak valid.", "danger"); }
        } catch (err) { showToast("Error membaca file JSON: " + err.message, "danger"); }
      };
      reader.readAsText(file);
    });

    container.querySelector('#btn-reset-all')?.addEventListener('click', () => {
      if (confirm("PERINGATAN KRITIS: Seluruh data pemasukan dan pengeluaran akan dihapus dan dikembalikan ke saldo 0. Apakah Anda yakin?")) {
        clearAllData();
        showToast("Seluruh data telah dibersihkan.", "success");
        renderPengaturan(container, getState());
      }
    });
  }

  // ============================================================================
  // 6. CORE APP ROUTER & CONTROLLER
  // ============================================================================
  let currentView = 'dashboard';

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'info'; let color = 'hsl(var(--accent-blue))';
    if (type === 'success') { icon = 'check-circle'; color = 'hsl(var(--success))'; }
    if (type === 'warning') { icon = 'alert-triangle'; color = 'hsl(var(--warning))'; }
    if (type === 'danger') { icon = 'alert-circle'; color = 'hsl(var(--danger))'; }

    toast.innerHTML = `<i data-lucide="${icon}" style="color: ${color}; width: 20px; height: 20px; flex-shrink: 0;"></i><span style="font-size: 0.88rem; color: hsl(var(--text-primary)); font-weight: 500;">${message}</span>`;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function updatePageTitle(title) {
    const el = document.getElementById('topbar-page-title');
    if (el) el.textContent = title;
  }

  function updateThemeIcon(theme) {
    const iconEl = document.querySelector('#btn-theme-toggle i');
    if (iconEl && window.lucide) {
      if (theme === 'light') iconEl.setAttribute('data-lucide', 'moon');
      else iconEl.setAttribute('data-lucide', 'sun');
      window.lucide.createIcons();
    }
  }

  function updateTopbarInfo(state) {
    const badgeEl = document.getElementById('sync-status-badge');
    const churchEl = document.getElementById('sidebar-church-name');
    if (churchEl) churchEl.textContent = state.settings?.churchName || 'Gereja Advent Jemaat Pusat';
    if (badgeEl) {
      if (state.settings?.webhookUrl) {
        badgeEl.className = 'sync-badge synced';
        badgeEl.innerHTML = `<i data-lucide="check-circle" style="width:14px;height:14px;"></i><span>Sync Google Sheets Aktif</span>`;
      } else {
        badgeEl.className = 'sync-badge pending';
        badgeEl.innerHTML = `<i data-lucide="cloud-off" style="width:14px;height:14px;"></i><span>Offline / Lokal</span>`;
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function navigateTo(viewName) {
    currentView = viewName;
    const state = getState();
    const container = document.getElementById('view-container');
    if (!container) return;

    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) item.classList.add('active');
      else item.classList.remove('active');
    });

    if (window.innerWidth <= 768) {
      document.querySelector('.sidebar')?.classList.remove('mobile-open');
    }

    switch (viewName) {
      case 'dashboard':
        updatePageTitle('Dashboard & Arus Kas');
        renderDashboard(container, state, navigateTo);
        break;
      case 'pemasukan':
        updatePageTitle('Pencatatan Pemasukan (Persembahan & Persepuluhan)');
        renderPemasukan(container, state);
        break;
      case 'pengeluaran':
        updatePageTitle('Pencatatan Pengeluaran Departemen (30 Pos Resmi)');
        renderPengeluaran(container, state);
        break;
      case 'kirim-dskt':
        updatePageTitle('Setoran / Pengiriman Dana ke DSKT (Konferens/Daerah)');
        renderKirimDskt(container, state);
        break;
      case 'laporan':
        updatePageTitle('Laporan Keuangan & Ekspor Excel (Pisah Sheet)');
        renderLaporan(container, state);
        break;
      case 'pengaturan':
        updatePageTitle('Pengaturan Jemaat & Sinkronisasi Google Sheets');
        renderPengaturan(container, state);
        break;
      default:
        renderDashboard(container, state, navigateTo);
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initApp() {
    const state = getState();
    document.documentElement.setAttribute('data-theme', state.settings?.theme || 'dark');
    updateThemeIcon(state.settings?.theme || 'dark');

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(() => {});
      });
    }

    subscribe((newState) => {
      updateTopbarInfo(newState);
    });

    // Attach Navigation Listeners (Sidebar & Bottom Nav)
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) navigateTo(view);
      });
    });

    // Mobile Menu Toggle
    const sidebar = document.querySelector('.sidebar');
    const btnMenu = document.getElementById('btn-mobile-menu');
    btnMenu?.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !btnMenu.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });

    // Theme Toggle Button
    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      const currentState = getState();
      const newTheme = (currentState.settings?.theme === 'light') ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      updateSettings({ theme: newTheme });
      updateThemeIcon(newTheme);
    });

    // Universal Horizontal Drag-to-Scroll & Mousewheel Helper untuk .table-responsive
    document.addEventListener('mousedown', (e) => {
      const slider = e.target.closest('.table-responsive');
      if (!slider || e.target.closest('button, a, input, select, textarea, .btn')) return;
      
      let isDown = true;
      slider.style.cursor = 'grabbing';
      slider.style.userSelect = 'none';
      const startX = e.pageX - slider.offsetLeft;
      const scrollLeft = slider.scrollLeft;

      const onMouseMove = (moveEvent) => {
        if (!isDown) return;
        const x = moveEvent.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.8;
        if (Math.abs(walk) > 5) moveEvent.preventDefault();
        slider.scrollLeft = scrollLeft - walk;
      };

      const onMouseUp = () => {
        isDown = false;
        slider.style.cursor = 'default';
        slider.style.removeProperty('user-select');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    document.addEventListener('wheel', (e) => {
      const slider = e.target.closest('.table-responsive');
      if (!slider) return;
      if (e.shiftKey && e.deltaY !== 0) {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Registrasi Service Worker & Penanganan Install PWA Android/Tablet
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').then((reg) => {
          console.log('ServiceWorker berhasil diregistrasi dengan scope: ', reg.scope);
        }).catch((err) => {
          console.warn('ServiceWorker gagal diregistrasi (mungkin karena protokol file:// lokal): ', err);
        });
      });
    }

    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    const modalInstall = document.getElementById('modal-install-android');
    document.getElementById('btn-open-install-modal')?.addEventListener('click', () => {
      modalInstall?.classList.add('active');
    });
    document.getElementById('btn-close-install-modal')?.addEventListener('click', () => {
      modalInstall?.classList.remove('active');
    });
    document.getElementById('btn-close-install-modal-2')?.addEventListener('click', () => {
      modalInstall?.classList.remove('active');
    });

    document.getElementById('btn-native-install-trigger')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast("Aplikasi berhasil dipasang ke Layar Utama HP / Tablet!", "success");
          modalInstall?.classList.remove('active');
        }
        deferredPrompt = null;
      } else {
        const instText = document.getElementById('install-instruction-text');
        if (instText) {
          instText.style.display = 'block';
          showToast("Silakan ikuti panduan manual melalui ikon 3 titik browser Android Anda.", "info");
        }
      }
    });

    updateTopbarInfo(state);
    navigateTo(currentView);
  }

  // Ekspor fungsi utama ke window agar bisa diakses jika diperlukan
  window.BendaharaApp = { initApp, navigateTo, getState, showToast };

  // Jalankan inisialisasi saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
