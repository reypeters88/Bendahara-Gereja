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
    const kirimPembangunanList = state.kirimPembangunan || [];

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

    let totalKirimPembangunan = 0;
    kirimPembangunanList.forEach(item => {
      totalKirimPembangunan += (Number(item.amount) || 0);
    });

    const sisaSaldoTotal = saldoAwalTotal + totalUangMasuk - totalUangDikirimDskt - totalKirimPembangunan - totalPengeluaran;
    const saldoKasGereja = saldoAwalGereja + totalMasukGereja - totalPengeluaranGereja;
    const saldoKasPembangunan = saldoAwalPembangunan + totalMasukPembangunan - totalPengeluaranPembangunan - totalKirimPembangunan;
    const kewajibanDsktBelumDisetor = saldoAwalDskt + totalMasukDskt - totalUangDikirimDskt;

    const uangDikirimDsktDanPembangunan = totalUangDikirimDskt + totalKirimPembangunan + totalPengeluaranPembangunan;
    const pengeluaranOperasional = totalPengeluaranGereja;
    const sisaSaldoGereja = sisaSaldoTotal;

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
      totalKirimPembangunan,
      sisaSaldoTotal,
      saldoKasGereja,
      saldoKasPembangunan,
      kewajibanDsktBelumDisetor,
      uangDikirimDsktDanPembangunan,
      pengeluaranOperasional,
      sisaSaldoGereja
    };
  }

  function angkaTerbilang(angka) {
    const bilangan = [
      "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"
    ];
    if (angka === 0 || !angka) return "Nol rupiah";
    function terbilang(n) {
      if (n < 12) return bilangan[n];
      if (n < 20) return bilangan[n - 10] + " belas";
      if (n < 100) return bilangan[Math.floor(n / 10)] + " puluh " + bilangan[n % 10];
      if (n < 200) return "seratus " + terbilang(n - 100);
      if (n < 1000) return bilangan[Math.floor(n / 100)] + " ratus " + terbilang(n % 100);
      if (n < 2000) return "seribu " + terbilang(n - 1000);
      if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " ribu " + terbilang(n % 1000);
      if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " juta " + terbilang(n % 1000000);
      if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " milyar " + terbilang(n % 1000000000);
      if (n < 1000000000000000) return terbilang(Math.floor(n / 1000000000000)) + " trilyun " + terbilang(n % 1000000000000);
      return "";
    }
    let result = terbilang(Math.abs(Math.round(Number(angka)))).trim().replace(/\s+/g, ' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + " rupiah";
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

  function formatAngka(amount) {
    const val = Math.round(Number(amount) || 0);
    return new Intl.NumberFormat('id-ID').format(val);
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

  function renderRumusArusKasBanner(summary) {
    return "";
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
      churchName: "Jemaat Teratai Batam",
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
    ],
    kirimPembangunan: []
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
        appState.kirimPembangunan = appState.kirimPembangunan || INITIAL_STATE.kirimPembangunan;
        if (appState.settings.churchName === "Gereja Advent Jemaat Pusat" || appState.settings.churchName === "Jemaat Pusat") {
          appState.settings.churchName = "Jemaat Teratai Batam";
          saveState();
        }
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

  function addKirimPembangunan(entry) {
    const newEntry = {
      id: entry.id || "TRP-" + Date.now(),
      date: entry.date || new Date().toISOString().split('T')[0],
      amount: Number(entry.amount) || 0,
      referenceNo: entry.referenceNo || "-",
      notes: entry.notes || ""
    };
    appState.kirimPembangunan.unshift(newEntry);
    saveState();
    return newEntry;
  }

  function deleteKirimPembangunan(id) {
    appState.kirimPembangunan = appState.kirimPembangunan.filter(item => item.id !== id);
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

  async function pullFromGoogleSheets(url) {
    if (!url) return { success: false, message: "URL Webhook Google Sheets belum dikonfigurasi di menu Pengaturan." };
    try {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(`${url}${separator}action=pull_all`, {
        method: 'GET'
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { success: false, message: "Gagal membaca respons JSON dari Google Sheets. Pastikan URL Webhook benar dan versi code.gs sudah diperbarui." };
      }
      
      if (data && data.status === "success" && data.data) {
        return { success: true, message: data.message, data: data.data };
      } else {
        return { success: false, message: data.message || "Terjadi kesalahan saat menarik data." };
      }
    } catch (err) {
      return { success: false, message: `Terjadi kesalahan koneksi saat menarik data: ${err.message}` };
    }
  }

  // === EXCEL HELPER FUNCTIONS ===
  function downloadExcel(filename, headers, sampleRow) {
    if (!window.XLSX) {
      showToast("Library Excel belum termuat.", "danger");
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wscols = headers.map(h => ({wch: Math.max(h.length, 15)}));
    ws['!cols'] = wscols;
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, filename);
  }



  function parseNumber(str) {
    if (!str) return 0;
    return Number(String(str).replace(/[^0-9-]/g, '')) || 0;
  }

  const GOOGLE_SCRIPT_TEMPLATE_CODE = `/**
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
    } else if (action === "pull_all") {
      var dataPemasukan = [];
      var dataPengeluaran = [];
      var dataKirimDskt = [];
      
      if (sheets.sheetMasuk.getLastRow() > 1) {
        var rows = sheets.sheetMasuk.getRange(2, 1, sheets.sheetMasuk.getLastRow() - 1, 14).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (!rows[i][0]) continue;
          dataPemasukan.push({
            id: String(rows[i][0]),
            date: String(rows[i][1]),
            sabbathName: String(rows[i][2]),
            memberName: String(rows[i][3]),
            persepuluhan: Number(rows[i][4]) || 0,
            persembahanTerpadu: Number(rows[i][5]) || 0,
            persembahanKhusus: Number(rows[i][8]) || 0,
            persembahanPembangunan: Number(rows[i][9]) || 0,
            lainLain: Number(rows[i][10]) || 0,
            receiptNo: String(rows[i][12]),
            notes: String(rows[i][13])
          });
        }
      }
      
      if (sheets.sheetKeluar.getLastRow() > 1) {
        var rows = sheets.sheetKeluar.getRange(2, 1, sheets.sheetKeluar.getLastRow() - 1, 7).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (!rows[i][0]) continue;
          var isBuilding = String(rows[i][6]).toLowerCase().indexOf('pembangunan') !== -1;
          dataPengeluaran.push({
            id: String(rows[i][0]),
            date: String(rows[i][1]),
            departmentName: String(rows[i][2]),
            departmentId: 1, // Default, not highly crucial as Name is used
            description: String(rows[i][3]),
            amount: Number(rows[i][4]) || 0,
            voucherNo: String(rows[i][5]),
            isBuildingFund: isBuilding
          });
        }
      }
      
      if (sheets.sheetDskt.getLastRow() > 1) {
        var rows = sheets.sheetDskt.getRange(2, 1, sheets.sheetDskt.getLastRow() - 1, 5).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (!rows[i][0]) continue;
          dataKirimDskt.push({
            id: String(rows[i][0]),
            date: String(rows[i][1]),
            amount: Number(rows[i][2]) || 0,
            referenceNo: String(rows[i][3]),
            notes: String(rows[i][4])
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Data berhasil ditarik dari Google Sheets!",
        data: {
          pemasukan: dataPemasukan,
          pengeluaran: dataPengeluaran,
          kirimDskt: dataKirimDskt
        }
      })).setMimeType(ContentService.MimeType.JSON);
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
`;

  // ============================================================================
  // 5. VIEW DEFINITIONS
  // ============================================================================
  let chartInstance = null;

  function renderDashboard(container, state, navigateTo) {
    const summary = calculateFinancialSummary(state);
    container.innerHTML = `
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
            <button class="btn btn-secondary" id="btn-goto-dskt" style="width: 100%; justify-content: center; padding: 12px; border-color: rgba(239, 68, 68, 0.4); color: hsl(var(--danger)); margin-bottom: 12px;"><i data-lucide="send"></i><span>Setor Uang ke Kas DSKT (Konferens/Daerah)</span></button>
            <button class="btn btn-secondary" id="btn-goto-pembangunan" style="width: 100%; justify-content: center; padding: 12px; border-color: rgba(59, 130, 246, 0.4); color: #3b82f6;"><i data-lucide="building"></i><span>Setor Uang ke Kas Pembangunan</span></button>
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
    container.querySelector('#btn-goto-pembangunan')?.addEventListener('click', () => navigateTo('kirim-pembangunan'));
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

  function renderJurnal(container, state, showToast, activeTab = null) {
    const summary = calculateFinancialSummary(state);
    const pemasukanList = state.pemasukan || [];
    const pengeluaranList = state.pengeluaran || [];
    const totalMasuk = pemasukanList.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
    const totalKeluar = pengeluaranList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    container.innerHTML = `
      <!-- Tombol Kembali / Back Line Icon -->
      <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
        ${activeTab !== null ? `
          <button type="button" class="btn btn-secondary" id="btn-back-to-jurnal-menu" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
            <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
            <span>Kembali ke Pilihan Menu Jurnal</span>
          </button>
        ` : ''}
        <button type="button" class="btn btn-secondary" id="btn-back-dashboard-jurnal" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
          <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      <!-- Header Navigasi Sub-Menu Jurnal (Hanya tampil saat memilih menu utama / activeTab === null) -->
      ${activeTab === null ? `
        <div class="glass-card" style="margin-bottom: 24px; padding: 20px 24px;">
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 1.35rem; font-weight: 800; color: hsl(var(--text-primary)); display: flex; align-items: center; gap: 8px;">
              <i data-lucide="book-open" style="color: hsl(var(--accent-gold));"></i> Buku Jurnal Kas Jemaat (Pemasukan & Pengeluaran)
            </h3>
            <p style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin: 4px 0 0 0;">
              Pilih lembaran pencatatan di bawah ini untuk mencatat transaksi penerimaan persembahan jemaat atau pengeluaran pos departemen.
            </p>
          </div>

          <!-- 3 Pilihan Menu Sub-Tab -->
          <div style="display: flex; gap: 14px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <button type="button" class="btn ${activeTab === 'pemasukan' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-masuk-jurnal" style="flex: 1; min-width: 220px; justify-content: flex-start; padding: 14px 18px; border-radius: 12px;">
              <i data-lucide="plus-circle" style="width: 22px; height: 22px; flex-shrink: 0; color: ${activeTab === 'pemasukan' ? '#fff' : 'hsl(var(--success))'};"></i>
              <div style="text-align: left; overflow: hidden;">
                <div style="font-weight: 800; font-size: 0.98rem; line-height: 1.2;">1. Pencatatan Pemasukan</div>
                <div style="font-size: 0.76rem; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                  Input Persembahan Baru
                </div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0; margin-left: auto;"></i>
            </button>

            <button type="button" class="btn ${activeTab === 'pengeluaran' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-keluar-jurnal" style="flex: 1; min-width: 220px; justify-content: flex-start; padding: 14px 18px; border-radius: 12px;">
              <i data-lucide="minus-circle" style="width: 22px; height: 22px; flex-shrink: 0; color: ${activeTab === 'pengeluaran' ? '#fff' : 'hsl(var(--danger))'};"></i>
              <div style="text-align: left; overflow: hidden;">
                <div style="font-weight: 800; font-size: 0.98rem; line-height: 1.2;">2. Pencatatan Pengeluaran</div>
                <div style="font-size: 0.76rem; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                  ${pengeluaranList.length} Transaksi | Rp ${formatRupiah(totalKeluar)}
                </div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0; margin-left: auto;"></i>
            </button>

            <button type="button" class="btn ${activeTab === 'history-masuk' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-history-masuk" style="flex: 1; min-width: 220px; justify-content: flex-start; padding: 14px 18px; border-radius: 12px;">
              <i data-lucide="history" style="width: 22px; height: 22px; flex-shrink: 0; color: ${activeTab === 'history-masuk' ? '#fff' : 'hsl(var(--accent-blue))'};"></i>
              <div style="text-align: left; overflow: hidden;">
                <div style="font-weight: 800; font-size: 0.98rem; line-height: 1.2;">3. History Pemasukan</div>
                <div style="font-size: 0.76rem; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                  ${pemasukanList.length} Transaksi | Cari Kuitansi
                </div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0; margin-left: auto;"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Wadah Dinamis untuk Konten Sub-Tab Jurnal -->
      <div id="jurnal-tab-content"></div>
    `;

    const subContainer = container.querySelector('#jurnal-tab-content');

    // Attach Event Listeners untuk Tab Switcher & Tombol Kembali
    container.querySelector('#btn-back-to-jurnal-menu')?.addEventListener('click', () => {
      renderJurnal(container, state, showToast, null);
    });
    container.querySelector('#btn-back-dashboard-jurnal')?.addEventListener('click', () => {
      if (typeof navigateTo === 'function') navigateTo('dashboard');
      else if (window.BendaharaApp?.navigateTo) window.BendaharaApp.navigateTo('dashboard');
    });
    container.querySelector('#tab-btn-masuk-jurnal')?.addEventListener('click', () => {
      renderJurnal(container, state, showToast, 'pemasukan');
    });
    container.querySelector('#tab-btn-keluar-jurnal')?.addEventListener('click', () => {
      renderJurnal(container, state, showToast, 'pengeluaran');
    });
    container.querySelector('#tab-btn-history-masuk')?.addEventListener('click', () => {
      renderJurnal(container, state, showToast, 'history-masuk');
    });

    if (activeTab === 'pengeluaran') {
      renderPengeluaran(subContainer, state);
    } else if (activeTab === 'pemasukan') {
      renderPemasukan(subContainer, state);
    } else if (activeTab === 'history-masuk') {
      renderHistoryPemasukan(subContainer, state);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function renderHistoryPemasukan(container, state) {
    const pemasukanList = state.pemasukan || [];
    container.innerHTML = `
      <div class="glass-card" style="max-width: 1000px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0;"><i data-lucide="history" style="color: hsl(var(--accent-blue)); margin-right: 8px;"></i> Riwayat Transaksi Pemasukan</h3>
          <div style="position: relative; max-width: 350px; width: 100%;">
            <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: hsl(var(--text-muted));"></i>
            <input type="text" id="search-history-pemasukan-tab" class="form-control" placeholder="Cari Nama Pemberi atau No Kuitansi..." style="padding-left: 40px; border-radius: 20px; font-size: 0.9rem; height: 42px; border: 1px solid var(--border-color);" />
          </div>
        </div>
        
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
                  <tr class="history-row-tab">
                    <td style="vertical-align: top; width: 38%;" class="searchable-text-tab">
                      <div style="font-weight: 700; color: hsl(var(--accent-gold)); font-size: 1.05rem;">${item.memberName}</div>
                      <div style="font-size: 0.85rem; color: hsl(var(--text-muted)); margin-top: 4px;">${formatDateIndo(item.date)}</div>
                      <div style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-top: 4px;">Kuitansi: <strong>${item.receiptNo}</strong></div>
                      ${item.notes ? `<div style="font-size: 0.8rem; font-style: italic; color: hsl(var(--text-muted)); margin-top: 4px;">"${item.notes}"</div>` : ''}
                    </td>
                    <td style="vertical-align: top;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Persepuluhan (DSKT):</span> <strong style="color: hsl(var(--danger));">${formatRupiah(item.persepuluhan)}</strong></div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Pers. Terpadu (50/50):</span> <strong>${formatRupiah(item.persembahanTerpadu)}</strong></div>
                      ${item.persembahanKhusus ? `<div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Pers. Khusus (Grj):</span> <strong style="color: hsl(var(--success));">${formatRupiah(item.persembahanKhusus)}</strong></div>` : ''}
                      ${item.persembahanPembangunan ? `<div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Pers. Pembangunan:</span> <strong style="color: hsl(var(--accent-blue));">${formatRupiah(item.persembahanPembangunan)}</strong></div>` : ''}
                      ${item.lainLain ? `<div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Lain-lain:</span> <strong>${formatRupiah(item.lainLain)}</strong></div>` : ''}
                      <div style="border-top: 1px dashed var(--border-color); margin-top: 8px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: 800; color: hsl(var(--accent-gold)); font-size: 1rem;"><span>Total:</span> <span>${formatRupiah(calc.total)}</span></div>
                    </td>
                    <td style="vertical-align: middle; text-align: center; width: 80px;">
                      <button class="icon-btn btn-print-kw" data-id="${item.id}" title="Cetak Kuitansi" style="margin-bottom: 10px; color: hsl(var(--accent-blue)); width: 40px; height: 40px;"><i data-lucide="printer"></i></button>
                      <button class="icon-btn btn-del-masuk-tab" data-id="${item.id}" title="Hapus Transaksi" style="color: hsl(var(--danger)); width: 40px; height: 40px;"><i data-lucide="trash-2"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
              ${pemasukanList.length === 0 ? `<tr><td colspan="3" style="text-align: center; padding: 40px; color: hsl(var(--text-muted));">Belum ada data riwayat persembahan.</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Search History Logic
    const searchInput = container.querySelector('#search-history-pemasukan-tab');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const rows = container.querySelectorAll('.history-row-tab');
        rows.forEach(row => {
          const textToSearch = row.querySelector('.searchable-text-tab')?.textContent.toLowerCase() || '';
          if (textToSearch.includes(val)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    }

    container.querySelectorAll('.btn-del-masuk-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Apakah Anda yakin ingin menghapus catatan pemasukan ini?")) {
          deletePemasukan(id);
          showToast("Transaksi berhasil dihapus.", "success");
          renderHistoryPemasukan(container, getState());
        }
      });
    });
  }

  function renderPemasukan(container, state) {
    const members = state.members || [];
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
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
      </div>

      <div class="modal-backdrop" id="modal-member">
        <div class="modal-content" style="max-width: 580px;">
          <div class="modal-header">
            <h4 style="font-size: 1.15rem; font-weight: 700;">Tambah & Import Anggota Jemaat</h4>
            <button class="icon-btn btn-close-member-modal"><i data-lucide="x"></i></button>
          </div>
          <div style="display: flex; border-bottom: 1px solid var(--border-color); background: var(--surface-subtle);">
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
            <div><h4 style="font-size: 1.2rem; font-weight: 800;">KUITANSI PERSEMBAHAN GMAHK</h4><div style="font-size: 0.8rem; opacity: 0.9;">${state.settings.churchName || 'Jemaat Teratai Batam'}</div></div>
            <button class="icon-btn" id="btn-close-receipt" style="background: rgba(255,255,255,0.2); color: white;"><i data-lucide="x"></i></button>
          </div>
          <div style="display: flex; gap: 8px; padding: 10px 16px; background: var(--surface-subtle); border-bottom: 1px solid var(--border-color); align-items: center; justify-content: space-between;" class="receipt-toolbar">
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
          <div style="font-size: 0.82rem; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'}; font-weight: 600;">TANDA TERIMA PERSEMBAHAN</div>
          <h3 style="font-size: 1.25rem; color: ${isThermal ? '#000' : 'hsl(var(--accent-gold))'}; margin-top: 4px; font-weight: 800; word-break: break-all;">No. ${item.receiptNo}</h3>
          <div style="font-size: 0.88rem; color: ${isThermal ? '#000' : 'hsl(var(--text-primary))'};">Tgl: <strong>${formatDateIndo(item.date)}</strong></div>
        </div>
        <div style="margin-bottom: 14px;">
          <div style="font-size: 0.8rem; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'};">DITERIMA DARI:</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: ${isThermal ? '#000' : 'hsl(var(--text-primary))'}; line-height: 1.3;">${item.memberName}</div>
        </div>
        <div style="background: ${isThermal ? 'transparent' : 'var(--surface-subtle)'}; padding: ${isThermal ? '6px 0' : '14px'}; border-radius: var(--radius-sm); margin-bottom: 14px; border-top: ${isThermal ? '1px dashed #000' : 'none'}; border-bottom: ${isThermal ? '1px dashed #000' : 'none'};" class="thermal-dash-line">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span style="flex: 1; min-width: 120px;">1. Persepuluhan:</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--danger))'}; text-align: right;">${formatRupiah(item.persepuluhan)}</strong>
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span style="flex: 1; min-width: 120px;">2. Pers. Terpadu:</span> <strong style="text-align: right;">${formatRupiah(item.persembahanTerpadu)}</strong>
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span style="flex: 1; min-width: 120px;">3. Khusus (Grj):</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--success))'}; text-align: right;">${formatRupiah(item.persembahanKhusus)}</strong>
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span style="flex: 1; min-width: 120px;">4. Pembangunan:</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--accent-blue))'}; text-align: right;">${formatRupiah(item.persembahanPembangunan)}</strong>
          </div>
          ${Number(item.lainLain) > 0 ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span style="flex: 1; min-width: 120px;">5. Lain-lain:</span> <strong style="text-align: right;">${formatRupiah(item.lainLain)}</strong>
          </div>` : ''}
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; border-top: 1px solid ${isThermal ? '#000' : 'var(--border-color)'}; padding-top: 8px; margin-top: 8px; font-size: 1.05rem; font-weight: 800; color: ${isThermal ? '#000' : 'hsl(var(--accent-gold))'};">
            <span>TOTAL:</span> <span>${formatRupiah(calc.total)}</span>
          </div>
        </div>
        <div style="font-size: 0.75rem; text-align: center; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'}; font-style: italic; line-height: 1.4;">
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
    const today = new Date().toISOString().split('T')[0];

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
                    <td style="font-weight: 800; color: hsl(var(--danger)); width: 22%;">${formatRupiah(item.amount)}</td>
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
      <!-- Tombol Kembali / Back Line Icon -->
      <div style="margin-bottom: 16px;">
        <button type="button" class="btn btn-secondary" id="btn-back-dashboard-dskt" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
          <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;">
        <div>
          <span class="badge badge-dskt" style="margin-bottom: 8px;">Kewajiban Konferens / Daerah (DSKT)</span>
          <h3 style="font-size: 1.5rem; font-weight: 800; color: hsl(var(--text-primary));">Status Titipan Dana DSKT</h3>
          <p style="color: hsl(var(--text-secondary)); font-size: 0.9rem; max-width: 600px; margin-top: 4px;">Sesuai aturan GMAHK, 100% Persepuluhan dan 50% Persembahan Terpadu adalah milik Daerah/Konferens yang harus disetorkan secara berkala oleh Bendahara Jemaat.</p>
        </div>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="background: var(--flow-box-bg); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">AKUMULASI TITIPAN DSKT</div><div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--text-primary));">${formatRupiah(summary.saldoAwalDskt + summary.totalMasukDskt)}</div></div>
          <div style="background: var(--flow-box-bg); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">SUDAH DIKIRIM KE DSKT</div><div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--warning));">${formatRupiah(summary.totalUangDikirimDskt)}</div></div>
          <div style="background: rgba(239, 68, 68, 0.15); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid rgba(239,68,68,0.5); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--danger)); font-weight: 700;">BELUM DISETOR (SISA TITIPAN)</div><div style="font-size: 1.4rem; font-weight: 800; color: hsl(var(--text-primary));">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</div></div>
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

    container.querySelector('#btn-back-dashboard-dskt')?.addEventListener('click', () => {
      if (typeof navigateTo === 'function') navigateTo('dashboard');
      else if (window.BendaharaApp?.navigateTo) window.BendaharaApp.navigateTo('dashboard');
    });

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

  function renderKirimPembangunan(container, state) {
    const summary = calculateFinancialSummary(state);
    const kirimList = state.kirimPembangunan || [];
    const today = new Date().toISOString().split('T')[0];

    const akumulasiMasuk = summary.saldoAwalPembangunan + summary.totalMasukPembangunan;

    container.innerHTML = `
      <!-- Tombol Kembali / Back Line Icon -->
      <div style="margin-bottom: 16px;">
        <button type="button" class="btn btn-secondary" id="btn-back-dashboard-pemb" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
          <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;">
        <div>
          <span class="badge badge-pembangunan" style="margin-bottom: 8px;">Manajemen Dana Pembangunan</span>
          <h3 style="font-size: 1.5rem; font-weight: 800; color: hsl(var(--text-primary));">Status Setoran Kas Pembangunan</h3>
          <p style="color: hsl(var(--text-secondary)); font-size: 0.9rem; max-width: 600px; margin-top: 4px;">Pencatatan khusus untuk penyetoran/pengiriman dana pembangunan ke bank/institusi terkait agar tidak tercampur dengan operasional rutin gereja.</p>
        </div>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="background: var(--flow-box-bg); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">AKUMULASI MASUK</div><div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--text-primary));">${formatRupiah(akumulasiMasuk)}</div></div>
          <div style="background: var(--flow-box-bg); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">TERPAKAI (PENGELUARAN)</div><div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--warning));">${formatRupiah(summary.totalPengeluaranPembangunan)}</div></div>
          <div style="background: var(--flow-box-bg); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;"><div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">SUDAH DISETOR</div><div style="font-size: 1.3rem; font-weight: 800; color: #3b82f6;">${formatRupiah(summary.totalKirimPembangunan)}</div></div>
          <div style="background: rgba(59, 130, 246, 0.15); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid rgba(59, 130, 246,0.5); text-align: right;"><div style="font-size: 0.78rem; color: #3b82f6; font-weight: 700;">SISA SALDO PEMBANGUNAN</div><div style="font-size: 1.4rem; font-weight: 800; color: hsl(var(--text-primary));">${formatRupiah(summary.saldoKasPembangunan)}</div></div>
        </div>
      </div>

      <div class="view-split-grid">
        <div class="glass-card">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #3b82f6; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;"><i data-lucide="building" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>Catat Setoran / Pengiriman Kas Pembangunan</h3>
          <form id="form-pembangunan">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">Tanggal Setor / Transfer</label><input type="date" class="form-control" id="trp-date" value="${today}" required /></div>
              <div class="form-group"><label class="form-label">No. Referensi / Bukti Transfer</label><input type="text" class="form-control" id="trp-ref" placeholder="Cth: TRX-BCA-5511" required /></div>
            </div>
            <div class="form-group">
              <label class="form-label">Nominal Setoran Pembangunan (Rp)</label>
              <input type="number" class="form-control" id="trp-amount" value="${Math.max(0, Math.round(summary.saldoKasPembangunan))}" min="1000" step="1000" required style="font-size: 1.2rem; font-weight: 800; color: #3b82f6;" />
              <span style="font-size: 0.78rem; color: hsl(var(--text-muted)); margin-top: 4px;">*Otomatis terisi total sisa saldo saat ini, namun bisa disesuaikan jika setoran sebagian.</span>
            </div>
            <div class="form-group"><label class="form-label">Catatan / Keterangan Setoran</label><textarea class="form-control" id="trp-notes" rows="3" placeholder="Cth: Penyetoran dana pembangunan gereja ke rekening panitia pembangunan" required></textarea></div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 16px; padding: 14px; font-size: 1rem; justify-content: center; background: linear-gradient(135deg, #3b82f6, #2563eb);"><i data-lucide="check-circle"></i><span>Simpan Bukti Setoran Pembangunan</span></button>
          </form>
        </div>

        <div class="glass-card">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">Riwayat Setoran Pembangunan</h3>
          <div class="table-responsive" style="max-height: 550px; overflow-y: auto;">
            <table class="data-table">
              <thead><tr><th>Tanggal & Ref</th><th>Keterangan</th><th>Jumlah Disetor</th><th>Aksi</th></tr></thead>
              <tbody>
                ${kirimList.map(item => `
                  <tr>
                    <td style="width: 28%;"><div style="font-weight: 700;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">Ref: ${item.referenceNo}</div></td>
                    <td><div style="font-size: 0.88rem; color: hsl(var(--text-primary));">${item.notes}</div></td>
                    <td style="font-weight: 800; color: #3b82f6; width: 25%;">${formatRupiah(item.amount)}</td>
                    <td style="text-align: center; width: 60px;"><button class="icon-btn btn-del-pembangunan" data-id="${item.id}" title="Hapus Bukti Setoran" style="color: hsl(var(--danger));"><i data-lucide="trash-2"></i></button></td>
                  </tr>
                `).join('')}
                ${kirimList.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 40px; color: hsl(var(--text-muted));">Belum ada catatan setoran pembangunan.</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-back-dashboard-pemb')?.addEventListener('click', () => {
      if (typeof navigateTo === 'function') navigateTo('dashboard');
      else if (window.BendaharaApp?.navigateTo) window.BendaharaApp.navigateTo('dashboard');
    });

    container.querySelector('#form-pembangunan')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const entry = {
        date: container.querySelector('#trp-date').value,
        referenceNo: container.querySelector('#trp-ref').value,
        amount: container.querySelector('#trp-amount').value,
        notes: container.querySelector('#trp-notes').value
      };
      addKirimPembangunan(entry);
      showToast("Bukti setoran dana pembangunan berhasil disimpan!", "success");
      renderKirimPembangunan(container, getState());
    });

    container.querySelectorAll('.btn-del-pembangunan').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Apakah Anda yakin ingin menghapus catatan setoran pembangunan ini?")) {
          deleteKirimPembangunan(id);
          showToast("Bukti setoran pembangunan berhasil dihapus.", "success");
          renderKirimPembangunan(container, getState());
        }
      });
    });
  }

  function renderTransmitalContent(state, transYear = null, transMonth = null, transType = null) {
    const yearsSet = new Set((state.pemasukan || []).map(i => {
      const d = new Date(i.date);
      return !isNaN(d.getTime()) ? d.getFullYear() : null;
    }).filter(y => y !== null));
    yearsSet.add(new Date().getFullYear());
    const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const typeNames = {
      'persepuluhan': 'PERPULUHAN',
      'hak_dskt': 'HAK DSKT (PERPULUHAN + 50% TERPADU)',
      'terpadu': 'PERSEMBAHAN TERPADU (TOTAL)',
      'khusus': 'PERSEMBAHAN KHUSUS (GEREJA)',
      'pembangunan': 'PERSEMBAHAN PEMBANGUNAN',
      'lain': 'LAIN-LAIN / UCAPAN SYUKUR',
      'all': 'TOTAL SEMUA PENERIMAAN'
    };

    const curYear = Number(transYear || availableYears[0] || new Date().getFullYear());
    const curMonth = Number(transMonth !== null ? transMonth : new Date().getMonth());
    const curType = transType || 'persepuluhan';

    const monthlyTotals = [];
    const monthlyUnits = [];
    let grandTotal = 0;
    let totalUnits = 0;

    for (let m = 0; m <= curMonth; m++) {
      const itemsMonth = (state.pemasukan || []).filter(item => {
        const d = new Date(item.date);
        return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === m;
      });

      let sumMonth = 0;
      const uniqueGivers = new Set();

      itemsMonth.forEach(item => {
        let amt = 0;
        if (curType === 'persepuluhan') amt = Number(item.persepuluhan) || 0;
        else if (curType === 'hak_dskt') amt = (Number(item.persepuluhan) || 0) + (Number(item.persembahanTerpadu) || 0) * 0.5;
        else if (curType === 'terpadu') amt = Number(item.persembahanTerpadu) || 0;
        else if (curType === 'khusus') amt = Number(item.persembahanKhusus) || 0;
        else if (curType === 'pembangunan') amt = Number(item.persembahanPembangunan) || 0;
        else if (curType === 'lain') amt = Number(item.lainLain) || 0;
        else if (curType === 'all') amt = (Number(item.persepuluhan) || 0) + (Number(item.persembahanTerpadu) || 0) + (Number(item.persembahanKhusus) || 0) + (Number(item.persembahanPembangunan) || 0) + (Number(item.lainLain) || 0);

        if (amt > 0) {
          sumMonth += amt;
          const gName = (item.memberName || 'Anonim').trim().toUpperCase();
          uniqueGivers.add(gName);
        }
      });

      monthlyTotals.push(sumMonth);
      const uCount = uniqueGivers.size;
      monthlyUnits.push(uCount);
      grandTotal += sumMonth;
      totalUnits += uCount;
    }

    const maxMonthlyAmount = Math.max(...monthlyTotals, 1);

    return `
      <div class="glass-card print-hidden" style="margin-bottom: 24px; padding: 18px 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; background: rgba(30, 58, 138, 0.25); border: 1px solid var(--border-color);">
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="calendar" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
            <label style="font-size: 0.88rem; font-weight: 700; color: hsl(var(--text-primary));">Tahun:</label>
            <select id="filter-trans-year" class="form-control" style="width: auto; padding: 6px 12px; font-weight: 700;">
              ${availableYears.map(y => `<option value="${y}" ${y === curYear ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="clock" style="width: 18px; height: 18px; color: hsl(var(--accent-blue));"></i>
            <label style="font-size: 0.88rem; font-weight: 700; color: hsl(var(--text-primary));">Batas Bulan (YTD):</label>
            <select id="filter-trans-month" class="form-control" style="width: auto; padding: 6px 12px; font-weight: 700;">
              ${monthNames.map((mName, idx) => `<option value="${idx}" ${idx === curMonth ? 'selected' : ''}>YTD ${mName}</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="filter" style="width: 18px; height: 18px; color: hsl(var(--success));"></i>
            <label style="font-size: 0.88rem; font-weight: 700; color: hsl(var(--text-primary));">Penerimaan:</label>
            <select id="filter-trans-type" class="form-control" style="width: auto; padding: 6px 12px; font-weight: 700; color: hsl(var(--accent-gold));">
              <option value="persepuluhan" ${curType === 'persepuluhan' ? 'selected' : ''}>Persepuluhan (100% DSKT)</option>
              <option value="hak_dskt" ${curType === 'hak_dskt' ? 'selected' : ''}>Hak DSKT (Persepuluhan + 50% Terpadu)</option>
              <option value="terpadu" ${curType === 'terpadu' ? 'selected' : ''}>Persembahan Terpadu (Total)</option>
              <option value="khusus" ${curType === 'khusus' ? 'selected' : ''}>Persembahan Khusus (Gereja)</option>
              <option value="pembangunan" ${curType === 'pembangunan' ? 'selected' : ''}>Persembahan Pembangunan</option>
              <option value="lain" ${curType === 'lain' ? 'selected' : ''}>Lain-lain / Ucapan Syukur</option>
              <option value="all" ${curType === 'all' ? 'selected' : ''}>Semua Penerimaan (Total Masuk)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn-secondary" id="btn-print-transmital" style="padding: 8px 16px; font-size: 0.85rem;">
            <i data-lucide="printer" style="width: 16px; height: 16px;"></i> Cetak Transmital
          </button>
          <button type="button" class="btn btn-primary" id="btn-export-transmital-excel" style="padding: 8px 16px; font-size: 0.85rem; background: linear-gradient(135deg, #16a34a, #15803d);">
            <i data-lucide="file-spreadsheet" style="width: 16px; height: 16px;"></i> Unduh Excel
          </button>
        </div>
      </div>

      <div class="glass-card" id="print-area-transmital" style="padding: 20px 24px; background: var(--sheet-bg); border: 1px solid var(--border-color);">
        <div style="text-align: center; margin-bottom: 22px;">
          <h2 style="font-size: 1.35rem; font-weight: 800; color: hsl(var(--text-primary)); text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">
            ${(state.settings && state.settings.churchName) || 'GMAHK TERATAI BATAM'}
          </h2>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--accent-gold)); text-transform: uppercase; margin: 6px 0 0 0;">
            ${typeNames[curType]}
          </h3>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: hsl(var(--text-secondary)); margin: 6px 0 0 0;">
            YTD ${monthNames[curMonth]} ${curYear}
          </h4>
        </div>

        <div class="table-responsive" style="border: 2px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.3); margin-top: 6px;">
          <table class="data-table table-compact-fit" style="width: 100%; min-width: 100% !important; border-collapse: collapse; text-align: center; table-layout: fixed;">
            <thead>
              <tr style="background: var(--table-header-bg); color: var(--table-header-text); border-bottom: 2px solid hsl(var(--accent-gold));">
                <th style="padding: 12px 8px; width: 14%; text-align: center !important; vertical-align: middle !important; border-right: 1px solid var(--border-color); font-size: 0.86rem; font-weight: 800; white-space: normal !important; word-wrap: break-word !important; line-height: 1.3 !important;">BULAN</th>
                <th style="padding: 12px 8px; width: 18%; text-align: center !important; vertical-align: middle !important; border-right: 1px solid var(--border-color); font-size: 0.86rem; font-weight: 800; white-space: normal !important; word-wrap: break-word !important; line-height: 1.3 !important;">UNIT PEMBERI</th>
                <th style="padding: 12px 8px; width: 28%; text-align: center !important; vertical-align: middle !important; border-right: 1px solid var(--border-color); font-size: 0.86rem; font-weight: 800; white-space: normal !important; word-wrap: break-word !important; line-height: 1.3 !important;">TOTAL (Rp)</th>
                <th style="padding: 12px 8px; width: 40%; text-align: center !important; vertical-align: middle !important; font-size: 0.86rem; font-weight: 800; white-space: normal !important; word-wrap: break-word !important; line-height: 1.3 !important;">GRAFIK KONTRIBUSI</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const barGradients = [
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
                  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
                  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber/Gold
                  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
                  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
                  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', // Cyan
                  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', // Teal
                  'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', // Rose
                  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
                  'linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)', // Lime
                  'linear-gradient(135deg, #d946ef 0%, #a21caf 100%)', // Fuchsia
                  'linear-gradient(135deg, #eab308 0%, #a16207 100%)'  // Yellow
                ];

                return monthlyTotals.map((amt, idx) => {
                  const units = monthlyUnits[idx];
                  const pct = grandTotal > 0 ? ((amt / grandTotal) * 100).toFixed(2) : "0.00";
                  const pctIndo = pct.replace('.', ',') + '%';
                  const barWidth = maxMonthlyAmount > 0 ? Math.round((amt / maxMonthlyAmount) * 100) : 0;
                  const activeGradient = barGradients[idx % barGradients.length];

                  return `
                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s; background: ${amt > 0 ? 'var(--surface-subtle)' : 'transparent'};">
                      <td style="padding: 11px 8px; font-weight: 800; border-right: 1px solid var(--border-color); text-align: center; color: hsl(var(--text-primary)); font-size: 0.88rem;">${monthNamesShort[idx]}</td>
                      <td style="padding: 11px 8px; font-weight: 700; border-right: 1px solid var(--border-color); text-align: center; color: ${units > 0 ? 'hsl(var(--accent-gold))' : 'hsl(var(--text-muted))'}; font-size: 0.88rem;">${units}</td>
                      <td style="padding: 11px 8px; font-weight: 800; border-right: 1px solid var(--border-color); text-align: right; color: ${amt > 0 ? 'hsl(var(--success))' : 'hsl(var(--text-muted))'}; font-size: 0.88rem;">${formatRupiah(amt)}</td>
                      <td style="padding: 10px 12px; text-align: left; vertical-align: middle;">
                        ${barWidth > 0 ? `
                          <div style="width: 100%; background: var(--input-bg); height: 24px; border-radius: 6px; overflow: hidden; border: 1px solid var(--input-border); box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);">
                            <div style="width: ${barWidth}%; height: 100%; background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.22) 0px, rgba(255, 255, 255, 0.22) 8px, transparent 8px, transparent 16px), ${activeGradient}; border-radius: 5px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; border-right: 1px solid rgba(255,255,255,0.4);">
                              ${barWidth >= 15 ? `<span style="font-size: 0.74rem; font-weight: 800; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.85); white-space: nowrap;">${pctIndo}</span>` : ''}
                            </div>
                          </div>
                        ` : `
                          <div style="width: 100%; background: var(--surface-subtle); height: 22px; border-radius: 6px; overflow: hidden; border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 0.72rem; color: hsl(var(--text-muted)); font-style: italic;">0%</span>
                          </div>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('');
              })()}
            </tbody>
            <tfoot>
              <tr style="background: var(--table-header-bg); font-weight: 800; border-top: 2px solid var(--border-highlight);">
                <td style="padding: 14px 8px; text-align: center; border-right: 1px solid var(--border-color); font-size: 0.9rem; color: hsl(var(--text-primary));">Jumlah</td>
                <td style="padding: 14px 8px; text-align: center; border-right: 1px solid var(--border-color); color: hsl(var(--accent-gold)); font-size: 0.95rem;">${totalUnits}</td>
                <td style="padding: 14px 8px; text-align: right; border-right: 1px solid var(--border-color); color: hsl(var(--success)); font-size: 1.02rem;">${formatRupiah(grandTotal)}</td>
                <td style="padding: 14px 8px; text-align: left; font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">Akumulasi ${monthNamesShort[0]} - ${monthNamesShort[curMonth]} ${curYear}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  function renderLaporan(container, state, showToast, activeTab = null, transYear = null, transMonth = null, transType = null, keuanganMode = 'standard', keuanganYear = null, keuanganQuarter = null) {
    const summary = calculateFinancialSummary(state);
    const pemasukanList = state.pemasukan || [];
    const pengeluaranList = state.pengeluaran || [];
    const kirimList = state.kirimDskt || [];

    const yearsSet = new Set([
      ...pemasukanList.map(i => { const d = new Date(i.date); return !isNaN(d.getTime()) ? d.getFullYear() : null; }),
      ...pengeluaranList.map(i => { const d = new Date(i.date); return !isNaN(d.getTime()) ? d.getFullYear() : null; }),
      ...kirimList.map(i => { const d = new Date(i.date); return !isNaN(d.getTime()) ? d.getFullYear() : null; })
    ].filter(y => y !== null));
    yearsSet.add(new Date().getFullYear());
    const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

    const curKeuYear = Number(keuanganYear || availableYears[0] || new Date().getFullYear());
    const curKeuQuarter = Number(keuanganQuarter || Math.floor(new Date().getMonth() / 3) + 1);

    function computeQuarterlyData(state, year, q) {
      const mIndices = [(q - 1) * 3, (q - 1) * 3 + 1, (q - 1) * 3 + 2];
      const mNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const settings = state.settings || {};

      const getMonthBreakdown = (mIdx) => {
        const startOfThisMonth = new Date(year, mIdx, 1);
        const endOfThisMonth = new Date(year, mIdx + 1, 0, 23, 59, 59);

        let priorMasukGereja = 0, priorMasukPemb = 0, priorMasukDskt = 0;
        (state.pemasukan || []).forEach(item => {
          if (!item.date) return;
          const dDate = new Date(item.date);
          if (!isNaN(dDate.getTime()) && dDate < startOfThisMonth) {
            const calc = calculateIncomeBreakdown(item);
            priorMasukGereja += calc.kasGereja;
            priorMasukPemb += calc.kasPembangunan;
            priorMasukDskt += calc.kasDskt;
          }
        });

        let priorKeluarGereja = 0, priorKeluarPemb = 0;
        (state.pengeluaran || []).forEach(item => {
          if (!item.date) return;
          const dDate = new Date(item.date);
          if (!isNaN(dDate.getTime()) && dDate < startOfThisMonth) {
            const amt = Number(item.amount) || 0;
            if (item.isBuildingFund || item.departmentId === 24 || item.departmentName?.toLowerCase().includes('pembangunan')) {
              priorKeluarPemb += amt;
            } else {
              priorKeluarGereja += amt;
            }
          }
        });

        let priorKirimDskt = 0;
        (state.kirimDskt || []).forEach(item => {
          if (!item.date) return;
          const dDate = new Date(item.date);
          if (!isNaN(dDate.getTime()) && dDate < startOfThisMonth) {
            priorKirimDskt += (Number(item.amount) || 0);
          }
        });

        const saldoAwalGereja = (Number(settings.saldoAwalGereja) || 0) + priorMasukGereja - priorKeluarGereja;
        const saldoAwalPemb = (Number(settings.saldoAwalPembangunan) || 0) + priorMasukPemb - priorKeluarPemb;
        const saldoAwalDskt = (Number(settings.saldoAwalDskt) || 0) + priorMasukDskt - priorKirimDskt;
        const saldoAwalTotal = saldoAwalGereja + saldoAwalPemb + saldoAwalDskt;

        let persepuluhan = 0, terpadu = 0, khusus = 0, pembangunan = 0, lain = 0;
        let masukGereja = 0, masukPemb = 0, masukDskt = 0, totalMasuk = 0;
        (state.pemasukan || []).forEach(item => {
          if (!item.date) return;
          const dDate = new Date(item.date);
          if (!isNaN(dDate.getTime()) && dDate >= startOfThisMonth && dDate <= endOfThisMonth) {
            const calc = calculateIncomeBreakdown(item);
            persepuluhan += calc.persepuluhan;
            terpadu += calc.persembahanTerpadu;
            khusus += calc.persembahanKhusus;
            pembangunan += calc.persembahanPembangunan;
            lain += calc.lainLain;
            totalMasuk += calc.total;
            masukGereja += calc.kasGereja;
            masukPemb += calc.kasPembangunan;
            masukDskt += calc.kasDskt;
          }
        });

        const deptMap = {};
        let keluarGereja = 0, keluarPemb = 0, totalKeluar = 0;
        (state.pengeluaran || []).forEach(item => {
          if (!item.date) return;
          const dDate = new Date(item.date);
          if (!isNaN(dDate.getTime()) && dDate >= startOfThisMonth && dDate <= endOfThisMonth) {
            const amt = Number(item.amount) || 0;
            totalKeluar += amt;
            if (item.isBuildingFund || item.departmentId === 24 || item.departmentName?.toLowerCase().includes('pembangunan')) {
              keluarPemb += amt;
            } else {
              keluarGereja += amt;
            }
            const dName = item.departmentName || "Lain-lain";
            deptMap[dName] = (deptMap[dName] || 0) + amt;
          }
        });

        let totalKirim = 0;
        (state.kirimDskt || []).forEach(item => {
          if (!item.date) return;
          const dDate = new Date(item.date);
          if (!isNaN(dDate.getTime()) && dDate >= startOfThisMonth && dDate <= endOfThisMonth) {
            totalKirim += (Number(item.amount) || 0);
          }
        });

        const saldoKasGereja = saldoAwalGereja + masukGereja - keluarGereja;
        const saldoKasPemb = saldoAwalPemb + masukPemb - keluarPemb;
        const kewajibanDskt = saldoAwalDskt + masukDskt - totalKirim;
        const sisaSaldoTotal = saldoAwalTotal + totalMasuk - totalKirim - totalKeluar;

        return {
          monthIdx: mIdx,
          monthName: mNames[mIdx],
          saldoAwalGereja, saldoAwalPemb, saldoAwalDskt, saldoAwalTotal,
          persepuluhan, terpadu, khusus, pembangunan, lain, totalMasuk,
          masukGereja, masukPemb, masukDskt,
          deptMap, totalKeluar, keluarGereja, keluarPemb,
          totalKirim,
          saldoKasGereja, saldoKasPemb, kewajibanDskt, sisaSaldoTotal
        };
      };

      const m1 = getMonthBreakdown(mIndices[0]);
      const m2 = getMonthBreakdown(mIndices[1]);
      const m3 = getMonthBreakdown(mIndices[2]);

      const allDeptsSet = new Set([...Object.keys(m1.deptMap), ...Object.keys(m2.deptMap), ...Object.keys(m3.deptMap)]);
      const deptsSummary = Array.from(allDeptsSet).map(name => {
        const amt1 = m1.deptMap[name] || 0;
        const amt2 = m2.deptMap[name] || 0;
        const amt3 = m3.deptMap[name] || 0;
        return { name, amt1, amt2, amt3, total: amt1 + amt2 + amt3 };
      }).sort((a, b) => b.total - a.total);

      const qTotal = {
        saldoAwalGereja: m1.saldoAwalGereja,
        saldoAwalPemb: m1.saldoAwalPemb,
        saldoAwalDskt: m1.saldoAwalDskt,
        saldoAwalTotal: m1.saldoAwalTotal,
        persepuluhan: m1.persepuluhan + m2.persepuluhan + m3.persepuluhan,
        terpadu: m1.terpadu + m2.terpadu + m3.terpadu,
        khusus: m1.khusus + m2.khusus + m3.khusus,
        pembangunan: m1.pembangunan + m2.pembangunan + m3.pembangunan,
        lain: m1.lain + m2.lain + m3.lain,
        totalMasuk: m1.totalMasuk + m2.totalMasuk + m3.totalMasuk,
        totalKeluar: m1.totalKeluar + m2.totalKeluar + m3.totalKeluar,
        keluarPemb: m1.keluarPemb + m2.keluarPemb + m3.keluarPemb,
        totalKirim: m1.totalKirim + m2.totalKirim + m3.totalKirim,
        saldoKasGereja: m3.saldoKasGereja,
        saldoKasPemb: m3.saldoKasPemb,
        kewajibanDskt: m3.kewajibanDskt,
        sisaSaldoTotal: m3.sisaSaldoTotal
      };

      return { m1, m2, m3, deptsSummary, qTotal, quarterNames: `${mNames[mIndices[0]]}, ${mNames[mIndices[1]]}, & ${mNames[mIndices[2]]}` };
    }

    // Perhitungan persentase untuk Tab 3
    const totalMasuk = summary.totalUangMasuk || 1; // Mencegah division by zero
    const totalPersepuluhan = pemasukanList.reduce((a, b) => a + (Number(b.persepuluhan) || 0), 0);
    const totalTerpadu = pemasukanList.reduce((a, b) => a + (Number(b.persembahanTerpadu) || 0), 0);
    const totalKhusus = pemasukanList.reduce((a, b) => a + (Number(b.persembahanKhusus) || 0), 0);
    const totalPembangunan = pemasukanList.reduce((a, b) => a + (Number(b.persembahanPembangunan) || 0), 0);
    const totalLain = pemasukanList.reduce((a, b) => a + (Number(b.lainLain) || 0), 0);

    // Alokasi Posisi Dana
    const totalHakDskt = totalPersepuluhan + (totalTerpadu * 0.5);
    const totalHakGereja = (totalTerpadu * 0.5) + totalKhusus + totalLain;
    const totalHakPembangunan = totalPembangunan;

    // Grup Pengeluaran per Departemen
    const deptMap = {};
    pengeluaranList.forEach(item => {
      const dName = item.departmentName || "Lain-lain";
      if (!deptMap[dName]) deptMap[dName] = 0;
      deptMap[dName] += Number(item.amount) || 0;
    });
    const deptList = Object.keys(deptMap).map(name => ({
      name,
      amount: deptMap[name],
      percent: summary.totalPengeluaran > 0 ? ((deptMap[name] / summary.totalPengeluaran) * 100).toFixed(1) : "0.0"
    })).sort((a, b) => b.amount - a.amount);

    container.innerHTML = `
      <!-- Tombol Kembali / Back Line Icon -->
      <div class="print-hidden" style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
        ${activeTab !== null ? `
          <button type="button" class="btn btn-secondary" id="btn-back-to-laporan-menu" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
            <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
            <span>Kembali ke Pilihan Menu Laporan</span>
          </button>
        ` : ''}
        <button type="button" class="btn btn-secondary" id="btn-back-dashboard-laporan" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
          <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      <!-- Header Navigasi Sub-Menu Laporan (Hanya tampil saat memilih menu utama / activeTab === null) -->
      ${activeTab === null ? `
        <div class="glass-card" style="margin-bottom: 24px; padding: 20px 24px;">
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 1.35rem; font-weight: 800; color: hsl(var(--text-primary)); display: flex; align-items: center; gap: 8px;">
              <i data-lucide="file-spreadsheet" style="color: hsl(var(--accent-gold));"></i> Lembaran Pusat Laporan Jemaat
            </h3>
            <p style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin: 4px 0 0 0;">
              Pilih lembaran atau jenis laporan di bawah ini untuk melihat tabel rincian, ringkasan majelis, analisis persentase, atau rekap transmital bulanan.
            </p>
          </div>

          <!-- 4 Pilihan Menu Sub-Tab (Berurut ke bawah) -->
          <div style="display: flex; flex-direction: column; gap: 14px; border-top: 1px solid var(--border-color); padding-top: 18px;">
            <button type="button" class="btn ${activeTab === 'excel' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-excel" style="width: 100%; justify-content: flex-start; align-items: center; padding: 16px 20px; border-radius: 14px; transition: all 0.2s ease; text-align: left; gap: 16px;">
              <div style="background: ${activeTab === 'excel' ? 'rgba(255,255,255,0.2)' : 'rgba(212, 175, 55, 0.15)'}; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="table" style="width: 24px; height: 24px; color: ${activeTab === 'excel' ? '#ffffff' : 'hsl(var(--accent-gold))'};"></i>
              </div>
              <div style="overflow: hidden; flex: 1;">
                <div style="font-weight: 800; font-size: 1.05rem; line-height: 1.2;">1. Laporan & Expor Excel</div>
                <div style="font-size: 0.82rem; opacity: 0.88; margin-top: 3px;">Tabel Rincian Seluruh Transaksi Masuk/Keluar & Unduh Excel 3 Sheet Terpisah</div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0;"></i>
            </button>

            <button type="button" class="btn ${activeTab === 'keuangan' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-keuangan" style="width: 100%; justify-content: flex-start; align-items: center; padding: 16px 20px; border-radius: 14px; transition: all 0.2s ease; text-align: left; gap: 16px;">
              <div style="background: ${activeTab === 'keuangan' ? 'rgba(255,255,255,0.2)' : 'rgba(59, 130, 246, 0.15)'}; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="file-text" style="width: 24px; height: 24px; color: ${activeTab === 'keuangan' ? '#ffffff' : 'hsl(var(--accent-blue))'};"></i>
              </div>
              <div style="overflow: hidden; flex: 1;">
                <div style="font-weight: 800; font-size: 1.05rem; line-height: 1.2;">2. Laporan Keuangan Majelis</div>
                <div style="font-size: 0.82rem; opacity: 0.88; margin-top: 3px;">Ringkasan Eksekutif Resmi (Mode Standar 1-Kolom & Mode Triwulan 4-Kolom per Bulan)</div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0;"></i>
            </button>

            <button type="button" class="btn ${activeTab === 'persentase' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-persentase" style="width: 100%; justify-content: flex-start; align-items: center; padding: 16px 20px; border-radius: 14px; transition: all 0.2s ease; text-align: left; gap: 16px;">
              <div style="background: ${activeTab === 'persentase' ? 'rgba(255,255,255,0.2)' : 'rgba(34, 197, 94, 0.15)'}; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="pie-chart" style="width: 24px; height: 24px; color: ${activeTab === 'persentase' ? '#ffffff' : 'hsl(var(--success))'};"></i>
              </div>
              <div style="overflow: hidden; flex: 1;">
                <div style="font-weight: 800; font-size: 1.05rem; line-height: 1.2;">3. Laporan Persentase & Proporsi</div>
                <div style="font-size: 0.82rem; opacity: 0.88; margin-top: 3px;">Analisis Alokasi Proporsi Dana DSKT vs Lokal & Peringkat Distribusi Departemen</div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0;"></i>
            </button>

            <button type="button" class="btn ${activeTab === 'transmital' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-transmital" style="width: 100%; justify-content: flex-start; align-items: center; padding: 16px 20px; border-radius: 14px; transition: all 0.2s ease; text-align: left; gap: 16px;">
              <div style="background: ${activeTab === 'transmital' ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.15)'}; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="send" style="width: 24px; height: 24px; color: ${activeTab === 'transmital' ? '#ffffff' : 'hsl(var(--danger))'};"></i>
              </div>
              <div style="overflow: hidden; flex: 1;">
                <div style="font-weight: 800; font-size: 1.05rem; line-height: 1.2;">4. Laporan Transmital</div>
                <div style="font-size: 0.82rem; opacity: 0.88; margin-top: 3px;">Rekap Bulanan YTD, Jumlah Unit Pemberi DSKT, & Grafik Batang Kontributif</div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0;"></i>
            </button>

            <button type="button" class="btn ${activeTab === 'dskt' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-dskt" style="width: 100%; justify-content: flex-start; align-items: center; padding: 16px 20px; border-radius: 14px; transition: all 0.2s ease; text-align: left; gap: 16px;">
              <div style="background: ${activeTab === 'dskt' ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.15)'}; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="file-check-2" style="width: 24px; height: 24px; color: ${activeTab === 'dskt' ? '#ffffff' : '#8b5cf6'};"></i>
              </div>
              <div style="overflow: hidden; flex: 1;">
                <div style="font-weight: 800; font-size: 1.05rem; line-height: 1.2;">5. Laporan Ke DSKT</div>
                <div style="font-size: 0.82rem; opacity: 0.88; margin-top: 3px;">Form Resmi Lembaran Jemaat, Tembusan Konferens, & Tanda Tangan</div>
              </div>
              <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.6; flex-shrink: 0;"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- KONTEN SUB-TAB 1: LAPORAN & EKSPOR EXCEL -->
      ${activeTab === 'excel' ? `
        <div class="glass-card print-hidden" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
          <div>
            <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--text-primary));">1. Laporan Rincian & Ekspor Excel</h4>
            <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 0;">
              Daftar lengkap seluruh transaksi pemasukan, pengeluaran, dan pengiriman DSKT beserta tombol download Excel 3 Sheet terpisah.
            </p>
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-print-report" style="padding: 10px 18px;">
              <i data-lucide="printer"></i>
              <span>Cetak Rincian Tabel</span>
            </button>
            <button class="btn btn-primary" id="btn-export-excel" style="padding: 10px 18px; background: linear-gradient(135deg, #16a34a, #15803d);">
              <i data-lucide="file-spreadsheet"></i>
              <span>Ekspor ke Excel (.xlsx) 3 Sheet</span>
            </button>
          </div>
        </div>

        <div class="stats-grid" style="margin-bottom: 28px;">
          <div class="stat-card" style="--stat-glow: rgba(59,130,246,0.15);">
            <span class="stat-title">Saldo Kas Gereja (Operasional)</span>
            <div class="stat-value" style="color: hsl(var(--success));">${formatRupiah(summary.saldoKasGereja)}</div>
            <div class="stat-desc">Awal: ${formatRupiah(summary.saldoAwalGereja)}</div>
          </div>
          <div class="stat-card" style="--stat-glow: rgba(59,130,246,0.15);">
            <span class="stat-title">Saldo Kas Pembangunan</span>
            <div class="stat-value" style="color: hsl(var(--accent-blue));">${formatRupiah(summary.saldoKasPembangunan)}</div>
            <div class="stat-desc">Awal: ${formatRupiah(summary.saldoAwalPembangunan)}</div>
          </div>
          <div class="stat-card" style="--stat-glow: rgba(239,68,68,0.15);">
            <span class="stat-title">Titipan DSKT Belum Disetor</span>
            <div class="stat-value" style="color: hsl(var(--danger));">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</div>
            <div class="stat-desc">Sudah Dikirim: ${formatRupiah(summary.totalUangDikirimDskt)}</div>
          </div>
          <div class="stat-card" style="--stat-glow: rgba(245,158,11,0.15);">
            <span class="stat-title">Sisa Saldo Kas Keseluruhan</span>
            <div class="stat-value" style="color: hsl(var(--accent-gold)); font-size: 1.8rem;">${formatRupiah(summary.sisaSaldoTotal)}</div>
            <div class="stat-desc">Total Uang Fisik / Rekening</div>
          </div>
        </div>

        <div class="glass-card" style="margin-bottom: 28px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(59, 130, 246, 0.4); padding-bottom: 12px;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--accent-blue));">I. BAGIAN PEMASUKAN PERSEMBAHAN & PERSEPULUHAN</h3>
            <span class="badge badge-pembangunan">${pemasukanList.length} Transaksi</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr style="background: var(--table-header-bg); color: var(--table-header-text);">
                  <th>Tanggal & No. Kuitansi</th><th>Anggota Jemaat</th><th>Persepuluhan (DSKT)</th><th>Pers. Terpadu (Total)</th><th>Pers. Khusus (Grj)</th><th>Pers. Pembangunan</th><th>Lain-lain</th><th>Total Pemasukan</th>
                </tr>
              </thead>
              <tbody>
                ${pemasukanList.map(item => {
                  const calc = calculateIncomeBreakdown(item);
                  return `
                    <tr>
                      <td><div style="font-weight: 600;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-muted));">No. ${item.receiptNo}</div></td>
                      <td><div style="font-weight: 700; color: hsl(var(--accent-gold));">${item.memberName}</div></td>
                      <td style="color: hsl(var(--danger)); font-weight: 600;">${formatRupiah(item.persepuluhan)}</td>
                      <td style="font-weight: 600;"><div>${formatRupiah(item.persembahanTerpadu)}</div><div style="font-size: 0.72rem; color: hsl(var(--text-muted));">(Grj: ${formatRupiah(calc.gerejaFromTerpadu || item.persembahanTerpadu*0.5)} / DSKT: ${formatRupiah(item.persembahanTerpadu*0.5)})</div></td>
                      <td style="color: hsl(var(--success)); font-weight: 600;">${formatRupiah(item.persembahanKhusus)}</td>
                      <td style="color: hsl(var(--accent-blue)); font-weight: 600;">${formatRupiah(item.persembahanPembangunan)}</td>
                      <td>${formatRupiah(item.lainLain)}</td>
                      <td style="font-weight: 800; color: hsl(var(--success)); font-size: 1rem;">${formatRupiah(calc.total)}</td>
                    </tr>
                  `;
                }).join('')}
                ${pemasukanList.length === 0 ? `<tr><td colspan="8" style="text-align: center; padding: 30px;">Belum ada data persembahan.</td></tr>` : ''}
              </tbody>
              <tfoot>
                <tr style="background: var(--table-header-bg); font-weight: 800; border-top: 2px solid var(--border-highlight);">
                  <td colspan="2" style="text-align: right; padding: 16px; color: hsl(var(--text-primary));">TOTAL PEMASUKAN:</td>
                  <td style="color: hsl(var(--danger));">${formatRupiah(totalPersepuluhan)}</td>
                  <td>${formatRupiah(totalTerpadu)}</td>
                  <td style="color: hsl(var(--success));">${formatRupiah(totalKhusus)}</td>
                  <td style="color: hsl(var(--accent-blue));">${formatRupiah(totalPembangunan)}</td>
                  <td>${formatRupiah(totalLain)}</td>
                  <td style="color: hsl(var(--accent-gold)); font-size: 1.1rem;">${formatRupiah(summary.totalUangMasuk)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="glass-card" style="margin-bottom: 28px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(239, 68, 68, 0.4); padding-bottom: 12px;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--danger));">II. BAGIAN PENGELUARAN OPERASIONAL & DEPARTEMEN</h3>
            <span class="badge badge-dskt">${pengeluaranList.length} Transaksi</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr style="background: var(--table-header-bg); color: var(--table-header-text);">
                  <th>Tanggal & Voucher</th><th>Kategori Departemen</th><th>Keterangan / Uraian</th><th>Sumber Dana</th><th>Nominal Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                ${pengeluaranList.map(item => `
                  <tr>
                    <td><div style="font-weight: 600;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-muted));">Voucher: ${item.voucherNo}</div></td>
                    <td style="font-weight: 700; color: hsl(var(--text-primary));">${item.departmentName}</td>
                    <td>${item.description}</td>
                    <td>${item.isBuildingFund ? `<span class="badge badge-pembangunan">Kas Pembangunan</span>` : `<span class="badge badge-gereja">Kas Jemaat</span>`}</td>
                    <td style="font-weight: 800; color: hsl(var(--danger)); font-size: 1rem;">${formatRupiah(item.amount)}</td>
                  </tr>
                `).join('')}
                ${pengeluaranList.length === 0 ? `<tr><td colspan="5" style="text-align: center; padding: 30px;">Belum ada data pengeluaran.</td></tr>` : ''}
              </tbody>
              <tfoot>
                <tr style="background: var(--table-header-bg); font-weight: 800; border-top: 2px solid var(--border-highlight);">
                  <td colspan="4" style="text-align: right; padding: 16px; color: hsl(var(--text-primary));">TOTAL PENGELUARAN:</td>
                  <td style="color: hsl(var(--danger)); font-size: 1.1rem;">${formatRupiah(summary.totalPengeluaran)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="glass-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(245, 158, 11, 0.4); padding-bottom: 12px;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--warning));">III. SETORAN / PENGIRIMAN KE KAS DSKT (KONFERENS/DAERAH)</h3>
            <span class="badge" style="background: rgba(245,158,11,0.15); color: hsl(var(--warning));">${kirimList.length} Setoran</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr style="background: var(--table-header-bg); color: var(--table-header-text);"><th>Tanggal & Referensi</th><th>Keterangan Setoran</th><th>Jumlah Setoran ke DSKT</th></tr>
              </thead>
              <tbody>
                ${kirimList.map(item => `
                  <tr>
                    <td><div style="font-weight: 600;">${formatDateIndo(item.date)}</div><div style="font-size: 0.78rem; color: hsl(var(--text-muted));">Ref: ${item.referenceNo}</div></td>
                    <td>${item.notes}</td>
                    <td style="font-weight: 800; color: hsl(var(--warning)); font-size: 1rem;">${formatRupiah(item.amount)}</td>
                  </tr>
                `).join('')}
                ${kirimList.length === 0 ? `<tr><td colspan="3" style="text-align: center; padding: 30px;">Belum ada pengiriman ke DSKT.</td></tr>` : ''}
              </tbody>
              <tfoot>
                <tr style="background: var(--table-header-bg); font-weight: 800; border-top: 2px solid var(--border-highlight);">
                  <td colspan="2" style="text-align: right; padding: 16px; color: hsl(var(--text-primary));">TOTAL DIKIRIM KE DSKT:</td>
                  <td style="color: hsl(var(--warning)); font-size: 1.1rem;">${formatRupiah(summary.totalUangDikirimDskt)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- KONTEN SUB-TAB 2: LAPORAN KEUANGAN -->
      ${activeTab === 'keuangan' ? (() => {
        const qData = computeQuarterlyData(state, curKeuYear, curKeuQuarter);
        const isQ = keuanganMode === 'quarterly';
        return `
        <div class="glass-card print-hidden" style="margin-bottom: 24px;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px;">
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--text-primary)); margin: 0;">2. Laporan Keuangan Majelis & Pengumuman Jemaat</h4>
              <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 4px 0 0 0;">
                Lembaran neraca eksekutif resmi yang merangkum posisi kas awal, penerimaan, pengeluaran per departemen, dan sisa saldo jemaat.
              </p>
            </div>
            <div>
              <button class="btn btn-gold" id="btn-print-keuangan" style="padding: 10px 20px; font-weight: 800;">
                <i data-lucide="printer"></i>
                <span>Cetak Lembar Keuangan Majelis</span>
              </button>
            </div>
          </div>

          <div style="background: var(--surface-subtle, rgba(255,255,255,0.03)); padding: 14px 18px; border-radius: 12px; border: 1px solid var(--border-color); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span style="font-size: 0.88rem; font-weight: 700; color: hsl(var(--text-primary)); display: flex; align-items: center; gap: 6px;">
                <i data-lucide="filter" style="width: 16px; height: 16px; color: hsl(var(--accent-gold));"></i> Mode Laporan:
              </span>
              <div style="display: flex; background: var(--input-bg, rgba(0,0,0,0.2)); border: 1px solid var(--border-color); border-radius: 8px; padding: 3px; gap: 4px;">
                <button type="button" id="btn-mode-std" class="btn ${!isQ ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 6px;">
                  Keseluruhan / Periode Standar
                </button>
                <button type="button" id="btn-mode-triwulan" class="btn ${isQ ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 6px;">
                  Per 3 Bulan (Triwulan Breakdown)
                </button>
              </div>
            </div>

            ${isQ ? `
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label style="font-size: 0.82rem; font-weight: 600; color: hsl(var(--text-secondary));">Tahun:</label>
                  <select id="keuangan-year-select" class="form-control" style="padding: 6px 12px; font-size: 0.85rem; width: auto; border-radius: 8px;">
                    ${availableYears.map(y => `<option value="${y}" ${Number(curKeuYear) === Number(y) ? 'selected' : ''}>${y}</option>`).join('')}
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label style="font-size: 0.82rem; font-weight: 600; color: hsl(var(--text-secondary));">Triwulan:</label>
                  <select id="keuangan-quarter-select" class="form-control" style="padding: 6px 12px; font-size: 0.85rem; width: auto; border-radius: 8px;">
                    <option value="1" ${Number(curKeuQuarter) === 1 ? 'selected' : ''}>Triwulan I (Januari, Februari, Maret)</option>
                    <option value="2" ${Number(curKeuQuarter) === 2 ? 'selected' : ''}>Triwulan II (April, Mei, Juni)</option>
                    <option value="3" ${Number(curKeuQuarter) === 3 ? 'selected' : ''}>Triwulan III (Juli, Agustus, September)</option>
                    <option value="4" ${Number(curKeuQuarter) === 4 ? 'selected' : ''}>Triwulan IV (Oktober, November, Desember)</option>
                  </select>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="glass-card" id="printable-financial-sheet" style="padding: 36px; background: var(--sheet-bg, rgba(15, 23, 42, 0.95)); border: 1px solid var(--sheet-border, var(--border-highlight));">
          <div style="text-align: center; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 2px solid var(--border-highlight);">
            <h2 style="font-size: 1.45rem; font-weight: 800; color: hsl(var(--text-primary)); letter-spacing: 0.05em; margin: 0;">GEREJA MASEHI ADVENT HARI KETUJUH (GMAHK)</h2>
            <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-gold)); margin: 6px 0 2px 0;">${state.settings.churchName || 'Jemaat Teratai Batam'}</h3>
            <div style="font-size: 0.88rem; color: hsl(var(--text-secondary));">${state.settings.districtName || 'Daerah / Konferens DSKT'}</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: hsl(var(--accent-blue)); margin-top: 6px;">
              ${isQ ? `LAPORAN PERBENDAHARAAN & ARUS KAS JEMAAT — TRIWULAN ${curKeuQuarter === 1 ? 'I' : curKeuQuarter === 2 ? 'II' : curKeuQuarter === 3 ? 'III' : 'IV'} (${qData.quarterNames.toUpperCase()} ${curKeuYear})` : `LAPORAN PERBENDAHARAAN & ARUS KAS JEMAAT — PERIODE: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}`}
            </div>
          </div>

          ${isQ ? `
            <div style="margin-bottom: 24px; overflow-x: auto;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--accent-gold)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">A. POSISI SALDO AWAL PERIODE</h4>
              <table style="width: 100%; font-size: 0.88rem; border-collapse: collapse; min-width: 650px;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border-highlight); color: hsl(var(--text-primary)); font-weight: 700;">
                    <th style="text-align: left; padding: 6px 4px; width: 36%;">Posisi Saldo Awal</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m1.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m2.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m3.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--accent-gold));">Awal Triwulan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 6px 4px;">1. Saldo Awal Kas Operasional Gereja</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m1.saldoAwalGereja)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m2.saldoAwalGereja)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m3.saldoAwalGereja)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--text-primary));">${formatAngka(qData.qTotal.saldoAwalGereja)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">2. Saldo Awal Kas Pembangunan</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m1.saldoAwalPemb)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m2.saldoAwalPemb)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m3.saldoAwalPemb)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatAngka(qData.qTotal.saldoAwalPemb)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">3. Saldo Awal Titipan DSKT Belum Disetor</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m1.saldoAwalDskt)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m2.saldoAwalDskt)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m3.saldoAwalDskt)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(qData.qTotal.saldoAwalDskt)}</td>
                  </tr>
                  <tr style="border-top: 1px solid var(--border-color); font-weight: 800;">
                    <td style="padding: 8px 4px;">SUBTOTAL SALDO AWAL KESELURUHAN</td>
                    <td style="text-align: right; color: hsl(var(--accent-gold));">${formatAngka(qData.m1.saldoAwalTotal)}</td>
                    <td style="text-align: right; color: hsl(var(--accent-gold));">${formatAngka(qData.m2.saldoAwalTotal)}</td>
                    <td style="text-align: right; color: hsl(var(--accent-gold));">${formatAngka(qData.m3.saldoAwalTotal)}</td>
                    <td style="text-align: right; color: hsl(var(--accent-gold)); font-size: 0.95rem;">${formatAngka(qData.qTotal.saldoAwalTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-bottom: 24px; overflow-x: auto;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--success)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">B. PENERIMAAN / PEMASUKAN DANA PERIODE INI</h4>
              <table style="width: 100%; font-size: 0.88rem; border-collapse: collapse; min-width: 650px;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border-highlight); color: hsl(var(--text-primary)); font-weight: 700;">
                    <th style="text-align: left; padding: 6px 4px; width: 36%;">Sumber Pemasukan</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m1.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m2.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m3.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--success));">Total Triwulan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 6px 4px;">1. Persepuluhan (100% Hak DSKT)</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m1.persepuluhan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m2.persepuluhan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m3.persepuluhan)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(qData.qTotal.persepuluhan)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">2. Persembahan Terpadu (50% Grj / 50% DSKT)</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m1.terpadu)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m2.terpadu)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m3.terpadu)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--text-primary));">${formatAngka(qData.qTotal.terpadu)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">3. Persembahan Khusus (100% Kas Gereja)</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(qData.m1.khusus)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(qData.m2.khusus)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(qData.m3.khusus)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--success));">${formatAngka(qData.qTotal.khusus)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">4. Persembahan Pembangunan (100% Kas Pemb.)</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m1.pembangunan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m2.pembangunan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m3.pembangunan)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatAngka(qData.qTotal.pembangunan)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">5. Pemasukan Lain-lain</td>
                    <td style="text-align: right; font-weight: 600;">${formatAngka(qData.m1.lain)}</td>
                    <td style="text-align: right; font-weight: 600;">${formatAngka(qData.m2.lain)}</td>
                    <td style="text-align: right; font-weight: 600;">${formatAngka(qData.m3.lain)}</td>
                    <td style="text-align: right; font-weight: 700;">${formatAngka(qData.qTotal.lain)}</td>
                  </tr>
                  <tr style="border-top: 1px solid var(--border-color); font-weight: 800;">
                    <td style="padding: 8px 4px;">SUBTOTAL PEMASUKAN PERIODE INI</td>
                    <td style="text-align: right; color: hsl(var(--success));">${formatAngka(qData.m1.totalMasuk)}</td>
                    <td style="text-align: right; color: hsl(var(--success));">${formatAngka(qData.m2.totalMasuk)}</td>
                    <td style="text-align: right; color: hsl(var(--success));">${formatAngka(qData.m3.totalMasuk)}</td>
                    <td style="text-align: right; color: hsl(var(--success)); font-size: 0.95rem;">${formatAngka(qData.qTotal.totalMasuk)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-bottom: 24px; overflow-x: auto;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--warning)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">C. SETORAN / PENGIRIMAN KE REKENING DSKT & PEMBANGUNAN</h4>
              <table style="width: 100%; font-size: 0.88rem; border-collapse: collapse; min-width: 650px;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border-highlight); color: hsl(var(--text-primary)); font-weight: 700;">
                    <th style="text-align: left; padding: 6px 4px; width: 36%;">Uraian Setoran</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m1.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m2.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m3.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--warning));">Total Triwulan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 6px 4px;">1. Persepuluhan (100% Hak DSKT)</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m1.persepuluhan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m2.persepuluhan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m3.persepuluhan)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(qData.qTotal.persepuluhan)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">2. Persembahan Terpadu (50% Hak DSKT)</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m1.terpadu * 0.5)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m2.terpadu * 0.5)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(qData.m3.terpadu * 0.5)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--text-primary));">${formatAngka(qData.qTotal.terpadu * 0.5)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">3. Persembahan Pembangunan (100% Pembangunan)</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m1.pembangunan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m2.pembangunan)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(qData.m3.pembangunan)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatAngka(qData.qTotal.pembangunan)}</td>
                  </tr>
                  <tr style="border-top: 1px solid var(--border-color); font-weight: 800;">
                    <td style="padding: 8px 4px;">TOTAL DANA TITIPAN DISETOR KE DSKT & PEMBANGUNAN</td>
                    <td style="text-align: right; color: hsl(var(--warning));">${formatAngka(qData.m1.totalKirim + qData.m1.keluarPemb)}</td>
                    <td style="text-align: right; color: hsl(var(--warning));">${formatAngka(qData.m2.totalKirim + qData.m2.keluarPemb)}</td>
                    <td style="text-align: right; color: hsl(var(--warning));">${formatAngka(qData.m3.totalKirim + qData.m3.keluarPemb)}</td>
                    <td style="text-align: right; color: hsl(var(--warning)); font-size: 0.95rem;">${formatAngka(qData.qTotal.totalKirim + qData.qTotal.keluarPemb)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-bottom: 24px; overflow-x: auto;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--danger)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">D. PENGELUARAN DANA OPERASIONAL & DEPARTEMEN</h4>
              <table style="width: 100%; font-size: 0.88rem; border-collapse: collapse; min-width: 650px;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border-highlight); color: hsl(var(--text-primary)); font-weight: 700;">
                    <th style="text-align: left; padding: 6px 4px; width: 36%;">Departemen / Pelayanan</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m1.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m2.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m3.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--danger));">Total Triwulan</th>
                  </tr>
                </thead>
                <tbody>
                  ${qData.deptsSummary.map(d => `
                    <tr>
                      <td style="padding: 6px 4px;">• ${d.name}</td>
                      <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(d.amt1)}</td>
                      <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(d.amt2)}</td>
                      <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(d.amt3)}</td>
                      <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(d.total)}</td>
                    </tr>
                  `).join('')}
                  ${qData.deptsSummary.length === 0 ? `<tr><td colspan="5" style="padding: 14px 0; text-align: center; color: hsl(var(--text-muted));">Belum ada pengeluaran pada periode triwulan ini.</td></tr>` : ''}
                  <tr style="border-top: 1px solid var(--border-color); font-weight: 800;">
                    <td style="padding: 8px 4px;">SUBTOTAL PENGELUARAN PERIODE INI</td>
                    <td style="text-align: right; color: hsl(var(--danger));">${formatAngka(qData.m1.totalKeluar)}</td>
                    <td style="text-align: right; color: hsl(var(--danger));">${formatAngka(qData.m2.totalKeluar)}</td>
                    <td style="text-align: right; color: hsl(var(--danger));">${formatAngka(qData.m3.totalKeluar)}</td>
                    <td style="text-align: right; color: hsl(var(--danger)); font-size: 0.95rem;">${formatAngka(qData.qTotal.totalKeluar)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid hsl(var(--success)); border-radius: var(--radius-md); padding: 20px; margin-top: 16px; overflow-x: auto;">
              <h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--success)); margin: 0 0 14px 0; border-bottom: 1px solid rgba(16,185,129,0.4); padding-bottom: 8px;">E. PERHITUNGAN SALDO KAS GEREJA (RUMUS ARUS KAS)</h4>
              <table style="width: 100%; font-size: 0.92rem; border-collapse: collapse; min-width: 650px;">
                <thead>
                  <tr style="border-bottom: 2px solid rgba(16,185,129,0.4); color: hsl(var(--text-primary)); font-weight: 700;">
                    <th style="text-align: left; padding: 6px 4px; width: 36%;">Komponen Rumus Arus Kas</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m1.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m2.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">${qData.m3.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--success));">Total Triwulan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 6px 4px;">• Subtotal Saldo Awal</td>
                    <td style="text-align: right; font-weight: 600;">${formatAngka(qData.m1.saldoAwalTotal)}</td>
                    <td style="text-align: right; font-weight: 600;">${formatAngka(qData.m2.saldoAwalTotal)}</td>
                    <td style="text-align: right; font-weight: 600;">${formatAngka(qData.m3.saldoAwalTotal)}</td>
                    <td style="text-align: right; font-weight: 700;">${formatAngka(qData.qTotal.saldoAwalTotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">• Subtotal Pemasukan</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(qData.m1.totalMasuk)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(qData.m2.totalMasuk)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(qData.m3.totalMasuk)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--success));">${formatAngka(qData.qTotal.totalMasuk)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">• Dana Titipan Ke DSKT dan Pembangunan</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--warning));">${formatAngka(qData.m1.totalKirim + qData.m1.keluarPemb)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--warning));">${formatAngka(qData.m2.totalKirim + qData.m2.keluarPemb)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--warning));">${formatAngka(qData.m3.totalKirim + qData.m3.keluarPemb)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--warning));">${formatAngka(qData.qTotal.totalKirim + qData.qTotal.keluarPemb)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px;">• Subtotal Pengeluaran</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m1.keluarGereja)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m2.keluarGereja)}</td>
                    <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(qData.m3.keluarGereja)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(qData.qTotal.totalKeluar - qData.qTotal.keluarPemb)}</td>
                  </tr>
                  <tr style="border-top: 2px solid hsl(var(--success)); font-size: 1.1rem; font-weight: 800;">
                    <td style="padding: 14px 4px 4px 4px; color: hsl(var(--success));">SALDO NOMINAL (SISA SALDO GEREJA):</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--success));">${formatAngka(qData.m1.sisaSaldoTotal)}</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--success));">${formatAngka(qData.m2.sisaSaldoTotal)}</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--success));">${formatAngka(qData.m3.sisaSaldoTotal)}</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--success)); font-size: 1.05rem;">${formatAngka(qData.qTotal.sisaSaldoTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="background: rgba(212, 175, 55, 0.12); border: 2px solid hsl(var(--accent-gold)); border-radius: var(--radius-md); padding: 20px; margin-top: 16px; overflow-x: auto;">
              <h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--accent-gold)); margin: 0 0 14px 0; border-bottom: 1px solid rgba(212,175,55,0.4); padding-bottom: 8px;">F. REKAPITULASI SALDO KAS AKHIR JEMAAT</h4>
              <table style="width: 100%; font-size: 0.92rem; border-collapse: collapse; min-width: 650px;">
                <thead>
                  <tr style="border-bottom: 2px solid rgba(212,175,55,0.4); color: hsl(var(--text-primary)); font-weight: 700;">
                    <th style="text-align: left; padding: 6px 4px; width: 36%;">Posisi Buku Kas Akhir</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">Akhir ${qData.m1.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">Akhir ${qData.m2.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--text-secondary));">Akhir ${qData.m3.monthName}</th>
                    <th style="text-align: right; padding: 6px 4px; width: 16%; color: hsl(var(--accent-gold));">Akhir Triwulan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 6px 4px; font-weight: 600;">1. Saldo Kas Operasional Gereja</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--success));">${formatAngka(qData.m1.saldoKasGereja)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--success));">${formatAngka(qData.m2.saldoKasGereja)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--success));">${formatAngka(qData.m3.saldoKasGereja)}</td>
                    <td style="text-align: right; font-weight: 800; color: hsl(var(--success));">${formatAngka(qData.qTotal.saldoKasGereja)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px; font-weight: 600;">2. Saldo Kas Pembangunan</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatAngka(qData.m1.saldoKasPemb)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatAngka(qData.m2.saldoKasPemb)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatAngka(qData.m3.saldoKasPemb)}</td>
                    <td style="text-align: right; font-weight: 800; color: hsl(var(--accent-blue));">${formatAngka(qData.qTotal.saldoKasPemb)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 4px; font-weight: 600;">3. Titipan DSKT Belum Disetor (Kewajiban Kirim)</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(qData.m1.kewajibanDskt)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(qData.m2.kewajibanDskt)}</td>
                    <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(qData.m3.kewajibanDskt)}</td>
                    <td style="text-align: right; font-weight: 800; color: hsl(var(--danger));">${formatAngka(qData.qTotal.kewajibanDskt)}</td>
                  </tr>
                  <tr style="border-top: 2px solid hsl(var(--accent-gold)); font-size: 1.15rem; font-weight: 800;">
                    <td style="padding: 14px 4px 4px 4px; color: hsl(var(--accent-gold));">SISA SALDO KAS KESELURUHAN (UANG FISIK/BANK):</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--accent-gold)); font-size: 1.05rem;">${formatAngka(qData.m1.sisaSaldoTotal)}</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--accent-gold)); font-size: 1.05rem;">${formatAngka(qData.m2.sisaSaldoTotal)}</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--accent-gold)); font-size: 1.05rem;">${formatAngka(qData.m3.sisaSaldoTotal)}</td>
                    <td style="padding: 14px 4px 4px 4px; text-align: right; color: hsl(var(--accent-gold));">${formatAngka(qData.qTotal.sisaSaldoTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : `
            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--accent-gold)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">A. POSISI SALDO AWAL PERIODE</h4>
              <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                <tr><td style="padding: 6px 0;">1. Saldo Awal Kas Operasional Gereja</td><td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(summary.saldoAwalGereja)}</td></tr>
                <tr><td style="padding: 6px 0;">2. Saldo Awal Kas Pembangunan</td><td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(summary.saldoAwalPembangunan)}</td></tr>
                <tr><td style="padding: 6px 0;">3. Saldo Awal Titipan DSKT Belum Disetor</td><td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(summary.saldoAwalDskt)}</td></tr>
                <tr style="border-top: 1px solid var(--border-color); font-weight: 800;"><td style="padding: 8px 0;">SUBTOTAL SALDO AWAL KESELURUHAN</td><td style="text-align: right; color: hsl(var(--accent-gold)); font-size: 1rem;">${formatAngka(summary.saldoAwalGereja + summary.saldoAwalPembangunan + summary.saldoAwalDskt)}</td></tr>
              </table>
            </div>

            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--success)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">B. PENERIMAAN / PEMASUKAN DANA PERIODE INI</h4>
              <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                <tr><td style="padding: 6px 0;">1. Persepuluhan (100% Hak DSKT)</td><td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(totalPersepuluhan)}</td></tr>
                <tr><td style="padding: 6px 0;">2. Persembahan Terpadu (50% Grj / 50% DSKT)</td><td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(totalTerpadu)}</td></tr>
                <tr><td style="padding: 6px 0;">3. Persembahan Khusus (100% Kas Gereja)</td><td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(totalKhusus)}</td></tr>
                <tr><td style="padding: 6px 0;">4. Persembahan Pembangunan (100% Kas Pembangunan)</td><td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(totalPembangunan)}</td></tr>
                <tr><td style="padding: 6px 0;">5. Pemasukan Lain-lain</td><td style="text-align: right; font-weight: 600;">${formatAngka(totalLain)}</td></tr>
                <tr style="border-top: 1px solid var(--border-color); font-weight: 800;"><td style="padding: 8px 0;">SUBTOTAL PEMASUKAN PERIODE INI</td><td style="text-align: right; color: hsl(var(--success)); font-size: 1rem;">${formatAngka(summary.totalUangMasuk)}</td></tr>
              </table>
            </div>

            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--warning)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">C. SETORAN / PENGIRIMAN KE REKENING DSKT & PEMBANGUNAN</h4>
              <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                <tr><td style="padding: 6px 0;">1. Persepuluhan (100% Hak DSKT)</td><td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(totalPersepuluhan)}</td></tr>
                <tr><td style="padding: 6px 0;">2. Persembahan Terpadu (50% Hak DSKT)</td><td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatAngka(totalTerpadu * 0.5)}</td></tr>
                <tr><td style="padding: 6px 0;">3. Persembahan Pembangunan (100% Pembangunan)</td><td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatAngka(totalPembangunan)}</td></tr>
                <tr style="border-top: 1px solid var(--border-color); font-weight: 800;"><td style="padding: 8px 0;">TOTAL DANA TITIPAN DISETOR KE DSKT & PEMBANGUNAN</td><td style="text-align: right; color: hsl(var(--warning)); font-size: 1rem;">${formatAngka(summary.uangDikirimDsktDanPembangunan)}</td></tr>
              </table>
            </div>

            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--danger)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">D. PENGELUARAN DANA OPERASIONAL & DEPARTEMEN</h4>
              <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                ${deptList.map(d => `<tr><td style="padding: 6px 0;">• ${d.name}</td><td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(d.amount)}</td></tr>`).join('')}
                ${deptList.length === 0 ? `<tr><td colspan="2" style="padding: 12px 0; text-align: center; color: hsl(var(--text-muted));">Belum ada pengeluaran periode ini.</td></tr>` : ''}
                <tr style="border-top: 1px solid var(--border-color); font-weight: 800;"><td style="padding: 8px 0;">SUBTOTAL PENGELUARAN PERIODE INI</td><td style="text-align: right; color: hsl(var(--danger)); font-size: 1rem;">${formatAngka(summary.totalPengeluaran)}</td></tr>
              </table>
            </div>

            <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid hsl(var(--success)); border-radius: var(--radius-md); padding: 20px; margin-top: 16px;">
              <h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--success)); margin: 0 0 14px 0; border-bottom: 1px solid rgba(16,185,129,0.4); padding-bottom: 8px;">E. PERHITUNGAN SALDO KAS GEREJA (RUMUS ARUS KAS)</h4>
              <table style="width: 100%; font-size: 0.95rem; border-collapse: collapse;">
                <tr><td style="padding: 6px 0;">• Subtotal Saldo Awal</td><td style="text-align: right; font-weight: 600;">${formatAngka(summary.saldoAwalTotal)}</td></tr>
                <tr><td style="padding: 6px 0;">• Subtotal Pemasukan</td><td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatAngka(summary.totalUangMasuk)}</td></tr>
                <tr><td style="padding: 6px 0;">• Dana Titipan Ke DSKT dan Pembangunan</td><td style="text-align: right; font-weight: 600; color: hsl(var(--warning));">${formatAngka(summary.uangDikirimDsktDanPembangunan)}</td></tr>
                <tr><td style="padding: 6px 0;">• Subtotal Pengeluaran</td><td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatAngka(summary.pengeluaranOperasional)}</td></tr>
                <tr style="border-top: 2px solid hsl(var(--success)); font-size: 1.15rem; font-weight: 800;"><td style="padding: 14px 0 4px 0; color: hsl(var(--success));">SALDO NOMINAL (SISA SALDO GEREJA):</td><td style="padding: 14px 0 4px 0; text-align: right; color: hsl(var(--success));">${formatAngka(summary.sisaSaldoTotal)}</td></tr>
              </table>
            </div>

            <div style="background: rgba(212, 175, 55, 0.12); border: 2px solid hsl(var(--accent-gold)); border-radius: var(--radius-md); padding: 20px; margin-top: 16px;">
              <h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--accent-gold)); margin: 0 0 14px 0; border-bottom: 1px solid rgba(212,175,55,0.4); padding-bottom: 8px;">F. REKAPITULASI SALDO KAS AKHIR JEMAAT</h4>
              <table style="width: 100%; font-size: 0.95rem; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; font-weight: 600;">1. Saldo Kas Operasional Gereja</td><td style="text-align: right; font-weight: 700; color: hsl(var(--success));">${formatAngka(summary.saldoKasGereja)}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">2. Saldo Kas Pembangunan</td><td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatAngka(summary.saldoKasPembangunan)}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">3. Titipan DSKT Belum Disetor (Kewajiban Kirim)</td><td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatAngka(summary.kewajibanDsktBelumDisetor)}</td></tr>
                <tr style="border-top: 2px solid hsl(var(--accent-gold)); font-size: 1.2rem; font-weight: 800;"><td style="padding: 14px 0 4px 0; color: hsl(var(--accent-gold));">SISA SALDO KAS KESELURUHAN (UANG FISIK/BANK):</td><td style="padding: 14px 0 4px 0; text-align: right; color: hsl(var(--accent-gold));">${formatAngka(summary.sisaSaldoTotal)}</td></tr>
              </table>
            </div>
          `}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px; text-align: center; font-size: 0.9rem;">
            <div><div>Mengetahui / Menyetujui:</div><div style="font-weight: 700; margin-top: 4px;">Gembala Jemaat / Pendeta</div><div style="height: 70px;"></div><div style="border-bottom: 1px solid var(--border-color); display: inline-block; min-width: 200px; font-weight: 700;">( ................................................ )</div></div>
            <div><div>Dibuat Oleh:</div><div style="font-weight: 700; margin-top: 4px;">Bendahara Jemaat</div><div style="height: 70px;"></div><div style="border-bottom: 1px solid var(--border-color); display: inline-block; min-width: 200px; font-weight: 700;">${state.settings.treasurerName || '( ................................................ )'}</div></div>
          </div>
        </div>
      `;
      })() : ''}

      <!-- KONTEN SUB-TAB 3: LAPORAN PERSENTASE -->
      ${activeTab === 'persentase' ? `
        <div class="glass-card print-hidden" style="margin-bottom: 24px;">
          <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--accent-gold)); margin-bottom: 6px;">3. Laporan Analisis Persentase & Proporsi Dana</h4>
          <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 0;">Analisis persentase alokasi sumber dana masuk serta proporsi pembagian pengeluaran pada setiap departemen pelayanan.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; margin-bottom: 24px;">
          <div class="glass-card">
            <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--accent-blue)); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i data-lucide="trending-up" style="width: 18px; height: 18px;"></i> Proporsi Sumber Pemasukan</h4>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;"><span>Persepuluhan (100% DSKT)</span><span style="color: hsl(var(--danger));">${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalPersepuluhan)})</span></div><div style="background: var(--surface-hover); height: 10px; border-radius: 6px; overflow: hidden;"><div style="background: hsl(var(--danger)); width: ${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;"><span>Persembahan Terpadu (50/50)</span><span style="color: hsl(var(--text-primary));">${((totalTerpadu / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalTerpadu)})</span></div><div style="background: var(--surface-hover); height: 10px; border-radius: 6px; overflow: hidden;"><div style="background: hsl(var(--accent-blue)); width: ${((totalTerpadu / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;"><span>Persembahan Khusus (Gereja)</span><span style="color: hsl(var(--success));">${((totalKhusus / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalKhusus)})</span></div><div style="background: var(--surface-hover); height: 10px; border-radius: 6px; overflow: hidden;"><div style="background: hsl(var(--success)); width: ${((totalKhusus / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;"><span>Persembahan Pembangunan</span><span style="color: hsl(var(--accent-gold));">${((totalPembangunan / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalPembangunan)})</span></div><div style="background: var(--surface-hover); height: 10px; border-radius: 6px; overflow: hidden;"><div style="background: hsl(var(--accent-gold)); width: ${((totalPembangunan / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;"><span>Lain-lain</span><span style="color: hsl(var(--text-muted));">${((totalLain / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalLain)})</span></div><div style="background: var(--surface-hover); height: 10px; border-radius: 6px; overflow: hidden;"><div style="background: hsl(var(--text-muted)); width: ${((totalLain / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
            </div>
          </div>

          <div class="glass-card">
            <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--accent-gold)); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i data-lucide="shield" style="width: 18px; height: 18px;"></i> Alokasi Pembagian Hak Dana Masuk</h4>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); padding: 14px; border-radius: 12px;"><div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-weight: 800; color: hsl(var(--danger)); font-size: 0.9rem;">1. Hak DSKT (Konferens/Daerah)</span><span style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--danger));">${((totalHakDskt / totalMasuk) * 100).toFixed(1)}%</span></div><div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); margin-top: 4px;">100% Persepuluhan + 50% Persembahan Terpadu (${formatRupiah(totalHakDskt)})</div></div>
              <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); padding: 14px; border-radius: 12px;"><div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-weight: 800; color: hsl(var(--success)); font-size: 0.9rem;">2. Hak Kas Lokal Gereja</span><span style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--success));">${((totalHakGereja / totalMasuk) * 100).toFixed(1)}%</span></div><div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); margin-top: 4px;">50% Terpadu + Khusus + Lain-lain (${formatRupiah(totalHakGereja)})</div></div>
              <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); padding: 14px; border-radius: 12px;"><div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-weight: 800; color: hsl(var(--accent-blue)); font-size: 0.9rem;">3. Hak Kas Pembangunan</span><span style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--accent-blue));">${((totalHakPembangunan / totalMasuk) * 100).toFixed(1)}%</span></div><div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); margin-top: 4px;">100% Persembahan Pembangunan (${formatRupiah(totalHakPembangunan)})</div></div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--danger)); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i data-lucide="bar-chart-2" style="width: 18px; height: 18px;"></i> Persentase Pengeluaran per Departemen (Peringkat Pos Terbesar)</h4>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${deptList.map(d => `<div><div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 4px;"><span>${d.name}</span><span style="color: hsl(var(--danger));">${d.percent}% (${formatRupiah(d.amount)})</span></div><div style="background: var(--surface-hover); height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: linear-gradient(90deg, #ef4444, #f97316); width: ${d.percent}%; height: 100%;"></div></div></div>`).join('')}
            ${deptList.length === 0 ? `<div style="text-align: center; padding: 24px; color: hsl(var(--text-muted));">Belum ada data pengeluaran yang tercatat untuk dianalisis.</div>` : ''}
          </div>
        </div>
      ` : ''}
      ${activeTab === 'transmital' ? renderTransmitalContent(state, transYear, transMonth, transType) : ''}

      ${activeTab === 'dskt' ? (() => {
        const dYear = transYear ? Number(transYear) : new Date().getFullYear();
        const dMonthStr = transMonth || String(new Date().getMonth() + 1).padStart(2, '0');
        const dMonthNum = Number(dMonthStr);
        const pList = (state.pemasukan || []).filter(item => {
          if (!item.date) return false;
          const d = new Date(item.date);
          return d.getFullYear() === dYear && (d.getMonth() + 1) === dMonthNum;
        });
        let unitPerpuluhan = 0, totalPerpuluhan = 0;
        let unitTerpadu = 0, totalTerpadu = 0;
        let unitKhusus = 0, totalKhusus = 0;
        let unitPembangunan = 0, totalPembangunan = 0;
        let unitLain = 0, totalLain = 0;
        pList.forEach(item => {
          const p = Number(item.persepuluhan) || 0;
          const t = Number(item.persembahanTerpadu) || 0;
          const k = Number(item.persembahanKhusus) || 0;
          const b = Number(item.persembahanPembangunan) || 0;
          const l = Number(item.lainLain) || 0;
          if (p > 0) { unitPerpuluhan++; totalPerpuluhan += p; }
          if (t > 0) { unitTerpadu++; totalTerpadu += t; }
          if (k > 0) { unitKhusus++; totalKhusus += k; }
          if (b > 0) { unitPembangunan++; totalPembangunan += b; }
          if (l > 0) { unitLain++; totalLain += l; }
        });
        const terpaduKonf = totalTerpadu * 0.5;
        const terpaduJemaat = totalTerpadu * 0.5;
        const totalAll = totalPerpuluhan + totalTerpadu + totalKhusus + totalPembangunan + totalLain;
        const totalKonf = totalPerpuluhan + terpaduKonf;
        const totalJemaat = terpaduJemaat + totalKhusus;
        
        const availableYears = [new Date().getFullYear()];
        (state.pemasukan || []).forEach(item => {
          if (item.date) {
            const y = new Date(item.date).getFullYear();
            if (!availableYears.includes(y)) availableYears.push(y);
          }
        });
        availableYears.sort((a, b) => b - a);
        
        const jemaatName = state.settings?.churchName || "JEMAAT TERATAI BATAM";
        const ketuaName = state.settings?.ketuaJemaat || "Gerhard Panjaitan";
        const gembalaName = state.settings?.gembalaJemaat || "Pdt. Edisyaputra Ginting";
        const bendaharaName = state.settings?.treasurerName || "Bendahara Jemaat";
        const lastDay = new Date(dYear, dMonthNum, 0);
        
        return `
          <div class="glass-card print-hidden" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--text-primary));">5. Laporan Penerimaan DSKT</h4>
              <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 0;">Pilih bulan laporan untuk mencetak form resmi pengiriman DSKT.</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <select class="form-control" id="dskt-month" style="width: 140px; padding: 10px 16px;">
                ${Array.from({length: 12}, (_, i) => {
                  const mStr = String(i + 1).padStart(2, '0');
                  const mName = new Date(2000, i, 1).toLocaleString('id-ID', {month: 'long'});
                  return "<option value='" + mStr + "' " + (mStr === dMonthStr ? "selected" : "") + ">" + mName + "</option>";
                }).join('')}
              </select>
              <select class="form-control" id="dskt-year" style="width: 100px; padding: 10px 16px;">
                ${availableYears.map(y => "<option value='" + y + "' " + (y === dYear ? "selected" : "") + ">" + y + "</option>").join('')}
              </select>
              <button class="btn btn-primary" id="btn-print-dskt" style="padding: 10px 18px; background: linear-gradient(135deg, #8b5cf6, #6d28d9);">
                <i data-lucide="printer"></i>
                <span>Cetak Laporan DSKT</span>
              </button>
            </div>
          </div>

          <div id="printable-dskt-report" style="background: #ffffff; color: #000000; padding: 40px; font-family: 'Times New Roman', Times, serif; max-width: 1000px; margin: 0 auto; overflow-x: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border-radius: 4px;">
            <style>
              #printable-dskt-report table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
              #printable-dskt-report th, #printable-dskt-report td { border: 1px solid #000; padding: 6px 8px; }
              #printable-dskt-report th { text-align: center; font-weight: bold; }
              #printable-dskt-report .right { text-align: right; }
              #printable-dskt-report .center { text-align: center; }
              #printable-dskt-report .bold { font-weight: bold; }
              #printable-dskt-report .no-border { border: none !important; }
              #printable-dskt-report .no-border td { border: none !important; }
              @media print {
                body * { visibility: hidden; }
                #printable-dskt-report, #printable-dskt-report * { visibility: visible; }
                #printable-dskt-report { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; border: none; box-shadow: none; border-radius: 0; }
                .print-hidden { display: none !important; }
              }
            </style>
            
            <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; text-transform: uppercase;">
              <div>GMAHK ${jemaatName}</div>
              <div>LAPORAN PENERIMAAN</div>
              <div>${lastDay.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
            </div>
            
            <div style="font-weight: bold; text-decoration: underline; margin-bottom: 4px; font-size: 14px; text-transform: uppercase;">PENJELASAN</div>
            
            <table>
              <thead>
                <tr>
                  <th rowspan="2">Keterangan</th>
                  <th rowspan="2">Jumlah<br>(Rp)</th>
                  <th rowspan="2">Ke<br>Konf/Daerah<br>(Rp)</th>
                  <th rowspan="2">Ke Kas Jemaat<br>${jemaatName}<br>(Rp)</th>
                  <th>Pembangunan<br>${jemaatName}</th>
                  <th>Project<br>${jemaatName}</th>
                  <th rowspan="2">Lain-lain<br>(Rp)</th>
                </tr>
                <tr>
                  <th>(Rp)</th>
                  <th>(Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>TTL Perpuluhan <span style="float: right;">${unitPerpuluhan} Unit Pemberi</span></td>
                  <td class="right">${formatRupiah(totalPerpuluhan).replace('Rp', '').trim()}</td>
                  <td class="right">${formatRupiah(totalPerpuluhan).replace('Rp', '').trim()}</td>
                  <td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                  <td>TTL Pers Terpadu <span style="float: right;">${unitTerpadu} Unit Pemberi</span></td>
                  <td class="right">${formatRupiah(totalTerpadu).replace('Rp', '').trim()}</td>
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                  <td>&nbsp;&nbsp;&nbsp;&nbsp;- Konf./Daerah 50%</td>
                  <td></td>
                  <td class="right">${formatRupiah(terpaduKonf).replace('Rp', '').trim()}</td>
                  <td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                  <td>&nbsp;&nbsp;&nbsp;&nbsp;- Jemaat 50%</td>
                  <td></td><td></td>
                  <td class="right">${formatRupiah(terpaduJemaat).replace('Rp', '').trim()}</td>
                  <td></td><td></td><td></td>
                </tr>
                <tr>
                  <td class="bold">Persembahan AWR & Radio /Daerah</td>
                  <td class="right">-</td><td class="right">-</td><td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                  <td>TTL Pers Khusus Jemaat <span style="float: right;">${unitKhusus} Unit Pemberi</span></td>
                  <td class="right">${formatRupiah(totalKhusus).replace('Rp', '').trim()}</td>
                  <td></td>
                  <td class="right">${formatRupiah(totalKhusus).replace('Rp', '').trim()}</td>
                  <td></td><td></td><td></td>
                </tr>
                <tr>
                  <td>TTL Pers. Khusus Pembangunan <span style="float: right;">${unitPembangunan} Unit Pemberi</span></td>
                  <td class="right">${formatRupiah(totalPembangunan).replace('Rp', '').trim()}</td>
                  <td></td><td></td>
                  <td class="right">${formatRupiah(totalPembangunan).replace('Rp', '').trim()}</td>
                  <td></td><td></td>
                </tr>
                <tr>
                  <td>TTL Pers. Project Gereja <span style="float: right;">0 Unit Pemberi</span></td>
                  <td class="right">-</td><td></td><td></td><td></td><td class="right">-</td><td></td>
                </tr>
                <tr>
                  <td>TTL Pers. Lain-lain <span style="float: right;">${unitLain} Unit Pemberi</span></td>
                  <td class="right">${formatRupiah(totalLain).replace('Rp', '').trim()}</td>
                  <td></td><td></td><td></td><td></td>
                  <td class="right">${formatRupiah(totalLain).replace('Rp', '').trim()}</td>
                </tr>
                <tr class="bold" style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                  <td class="center">Total Keseluruhan Rp.</td>
                  <td class="right">${formatRupiah(totalAll).replace('Rp', '').trim()}</td>
                  <td class="right">${formatRupiah(totalKonf).replace('Rp', '').trim()}</td>
                  <td class="right">${formatRupiah(totalJemaat).replace('Rp', '').trim()}</td>
                  <td class="right">${formatRupiah(totalPembangunan).replace('Rp', '').trim()}</td>
                  <td class="right">-</td>
                  <td class="right">${formatRupiah(totalLain).replace('Rp', '').trim()}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="font-weight: bold; text-decoration: underline; margin-bottom: 4px; font-size: 14px; text-transform: uppercase;">IKHTISAR</div>
            
            <table>
              <tbody>
                <tr>
                  <td>Jumlah yang dikirim ke Konferens/Daerah (Perpuluhan 100% + 50% dari Total Pers. Terpadu)</td>
                  <td class="right bold" style="width: 150px;">${formatRupiah(totalKonf).replace('Rp', '').trim()}</td>
                </tr>
                <tr>
                  <td>Jumlah Dana untuk Kas Gereja (Pers. Khusus Jemaat 100% + 50% dari TTL Pers. Terpadu)</td>
                  <td class="right bold">${formatRupiah(totalJemaat).replace('Rp', '').trim()}</td>
                </tr>
                <tr>
                  <td>Jumlah Dana untuk Pembangunan Gereja</td>
                  <td class="right bold">${formatRupiah(totalPembangunan).replace('Rp', '').trim()}</td>
                </tr>
                <tr>
                  <td>Jumlah Dana untuk Project</td>
                  <td class="right bold">-</td>
                </tr>
                <tr>
                  <td>Jumlah Dana Lain-lain</td>
                  <td class="right bold">${formatRupiah(totalLain).replace('Rp', '').trim()}</td>
                </tr>
                <tr style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                  <td class="bold">TOTAL KESELURUHAN</td>
                  <td class="right bold">${formatRupiah(totalAll).replace('Rp', '').trim()}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="margin-top: 10px; font-size: 14px; display: flex; gap: 8px;">
              <div style="white-space: nowrap;">Terbilang <span style="margin-left: 20px;"></span> </div>
              <div class="bold" style="font-style: italic;">${angkaTerbilang(totalAll)}</div>
            </div>
            
            <table class="no-border" style="margin-top: 40px;">
              <tr>
                <td class="center" style="width: 33%;">
                  <div>Dibuat Oleh :</div>
                  <div style="margin-top: 80px; font-weight: bold; text-decoration: underline;">${bendaharaName}</div>
                  <div>Bendahara Jemaat</div>
                </td>
                <td class="center" style="width: 33%;">
                  <div>Diperiksa,</div>
                  <div style="margin-top: 80px; font-weight: bold; text-decoration: underline;">${ketuaName}</div>
                  <div>Ketua Jemaat</div>
                </td>
                <td class="center" style="width: 33%;">
                  <div>Disetujui</div>
                  <div style="margin-top: 80px; font-weight: bold; text-decoration: underline;">${gembalaName}</div>
                  <div>Gembala Jemaat</div>
                </td>
              </tr>
            </table>
            
          </div>
        `;
      })() : ''}
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-back-to-laporan-menu')?.addEventListener('click', () => {
      renderLaporan(container, state, showToast, null, transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter);
    });
    container.querySelector('#btn-back-dashboard-laporan')?.addEventListener('click', () => {
      if (typeof navigateTo === 'function') navigateTo('dashboard');
      else if (window.BendaharaApp?.navigateTo) window.BendaharaApp.navigateTo('dashboard');
    });

    container.querySelector('#tab-btn-excel')?.addEventListener('click', () => renderLaporan(container, state, showToast, 'excel', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter));
    container.querySelector('#tab-btn-keuangan')?.addEventListener('click', () => renderLaporan(container, state, showToast, 'keuangan', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter));
    container.querySelector('#tab-btn-persentase')?.addEventListener('click', () => renderLaporan(container, state, showToast, 'persentase', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter));
    container.querySelector('#tab-btn-transmital')?.addEventListener('click', () => renderLaporan(container, state, showToast, 'transmital', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter));
    container.querySelector('#tab-btn-dskt')?.addEventListener('click', () => renderLaporan(container, state, showToast, 'dskt', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter));

    if (activeTab === 'keuangan') {
      container.querySelector('#btn-mode-std')?.addEventListener('click', () => {
        renderLaporan(container, state, showToast, 'keuangan', transYear, transMonth, transType, 'standard', keuanganYear, keuanganQuarter);
      });
      container.querySelector('#btn-mode-triwulan')?.addEventListener('click', () => {
        renderLaporan(container, state, showToast, 'keuangan', transYear, transMonth, transType, 'quarterly', keuanganYear, keuanganQuarter);
      });
      container.querySelector('#keuangan-year-select')?.addEventListener('change', (e) => {
        renderLaporan(container, state, showToast, 'keuangan', transYear, transMonth, transType, keuanganMode, e.target.value, keuanganQuarter);
      });
      container.querySelector('#keuangan-quarter-select')?.addEventListener('change', (e) => {
        renderLaporan(container, state, showToast, 'keuangan', transYear, transMonth, transType, keuanganMode, keuanganYear, e.target.value);
      });
    }

    if (activeTab === 'transmital') {
      const yearSelect = container.querySelector('#filter-trans-year');
      const monthSelect = container.querySelector('#filter-trans-month');
      const typeSelect = container.querySelector('#filter-trans-type');

      const updateFilter = () => {
        renderLaporan(container, state, showToast, 'transmital', yearSelect.value, monthSelect.value, typeSelect.value, keuanganMode, keuanganYear, keuanganQuarter);
      };

      yearSelect?.addEventListener('change', updateFilter);
      monthSelect?.addEventListener('change', updateFilter);
      typeSelect?.addEventListener('change', updateFilter);

      container.querySelector('#btn-print-transmital')?.addEventListener('click', () => window.print());

      container.querySelector('#btn-export-transmital-excel')?.addEventListener('click', () => {
        if (!window.XLSX) {
          if (showToast) showToast("Library Excel sedang dimuat, coba beberapa detik lagi.", "warning");
          return;
        }
        try {
          const curY = Number(yearSelect.value);
          const curM = Number(monthSelect.value);
          const curT = typeSelect.value;
          const tNames = {
            'persepuluhan': 'PERPULUHAN', 'hak_dskt': 'HAK DSKT', 'terpadu': 'PERSEMBAHAN TERPADU',
            'khusus': 'PERSEMBAHAN KHUSUS', 'pembangunan': 'PERSEMBAHAN PEMBANGUNAN', 'lain': 'LAIN-LAIN', 'all': 'SEMUA PENERIMAAN'
          };
          const mShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

          const wb = window.XLSX.utils.book_new();
          const rows = [];
          
          for (let m = 0; m <= curM; m++) {
            const itemsMonth = (state.pemasukan || []).filter(item => {
              const d = new Date(item.date);
              return !isNaN(d.getTime()) && d.getFullYear() === curY && d.getMonth() === m;
            });
            let sumMonth = 0;
            const uniqueGivers = new Set();
            itemsMonth.forEach(item => {
              let amt = 0;
              if (curT === 'persepuluhan') amt = Number(item.persepuluhan) || 0;
              else if (curT === 'hak_dskt') amt = (Number(item.persepuluhan) || 0) + (Number(item.persembahanTerpadu) || 0) * 0.5;
              else if (curT === 'terpadu') amt = Number(item.persembahanTerpadu) || 0;
              else if (curT === 'khusus') amt = Number(item.persembahanKhusus) || 0;
              else if (curT === 'pembangunan') amt = Number(item.persembahanPembangunan) || 0;
              else if (curT === 'lain') amt = Number(item.lainLain) || 0;
              else if (curT === 'all') amt = (Number(item.persepuluhan) || 0) + (Number(item.persembahanTerpadu) || 0) + (Number(item.persembahanKhusus) || 0) + (Number(item.persembahanPembangunan) || 0) + (Number(item.lainLain) || 0);
              if (amt > 0) { sumMonth += amt; uniqueGivers.add((item.memberName || 'Anonim').trim().toUpperCase()); }
            });
            rows.push({
              "Bulan": mShort[m],
              "Unit Pemberi": uniqueGivers.size,
              "Total": sumMonth
            });
          }
          const totalAll = rows.reduce((a, b) => a + b.Total, 0);
          const totalU = rows.reduce((a, b) => a + b["Unit Pemberi"], 0);
          rows.forEach(r => {
            r["%"] = totalAll > 0 ? ((r.Total / totalAll) * 100).toFixed(2) + '%' : '0.00%';
          });
          rows.push({ "Bulan": "Jumlah", "Unit Pemberi": totalU, "Total": totalAll, "%": "100.00%" });

          window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(rows), "Transmital YTD");
          window.XLSX.writeFile(wb, `Laporan_Transmital_${tNames[curT]}_YTD_${mShort[curM]}_${curY}.xlsx`);
          if (showToast) showToast("Laporan Transmital berhasil diekspor ke Excel (.xlsx)!", "success");
        } catch (err) {
          if (showToast) showToast("Gagal mengekspor: " + err.message, "danger");
        }
      });
    }

    container.querySelector('#btn-print-report')?.addEventListener('click', () => window.print());
    container.querySelector('#btn-print-keuangan')?.addEventListener('click', () => window.print());

    container.querySelector('#btn-export-excel')?.addEventListener('click', () => {
      if (!window.XLSX) {
        if (showToast) showToast("Library Excel sedang dimuat, coba beberapa detik lagi.", "warning");
        return;
      }
      try {
        const wb = window.XLSX.utils.book_new();
        const rowsMasuk = pemasukanList.map(i => {
          const c = calculateIncomeBreakdown(i);
          return { "ID": i.id, "Tanggal": i.date, "No. Kuitansi": i.receiptNo, "Anggota": i.memberName, "Persepuluhan": i.persepuluhan, "Pers. Terpadu": i.persembahanTerpadu, "50% Kas Grj": c.gerejaFromTerpadu, "50% Kas DSKT": c.kasDskt - i.persepuluhan, "Pers. Khusus": i.persembahanKhusus, "Pers. Pembangunan": i.persembahanPembangunan, "Lain-lain": i.lainLain, "Total": c.total, "Catatan": i.notes };
        });
        window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(rowsMasuk), "Sheet Pemasukan");

        const rowsKeluar = pengeluaranList.map(i => ({ "ID": i.id, "Tanggal": i.date, "Departemen": i.departmentName, "Keterangan": i.description, "Jumlah": i.amount, "No. Voucher": i.voucherNo, "Sumber Dana": i.isBuildingFund ? "Kas Pembangunan" : "Kas Jemaat" }));
        window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(rowsKeluar), "Sheet Pengeluaran");

        const rowsDskt = kirimList.map(i => ({ "ID": i.id, "Tanggal": i.date, "Jumlah": i.amount, "No. Referensi": i.referenceNo, "Catatan": i.notes }));
        window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(rowsDskt), "Sheet Kirim DSKT");

        window.XLSX.writeFile(wb, `Laporan_Bendahara_GMAHK_${new Date().toISOString().slice(0, 10)}.xlsx`);
        if (showToast) showToast("Laporan berhasil diekspor menjadi file Excel (.xlsx) dengan pemisahan sheet!", "success");
      } catch (err) {
        if (showToast) showToast("Gagal mengekspor ke Excel: " + err.message, "danger");
      }
    });

    if (activeTab === 'dskt') {
      container.querySelector('#dskt-month')?.addEventListener('change', (e) => {
        renderLaporan(container, state, showToast, 'dskt', transYear, e.target.value, transType, keuanganMode, keuanganYear, keuanganQuarter);
      });
      container.querySelector('#dskt-year')?.addEventListener('change', (e) => {
        renderLaporan(container, state, showToast, 'dskt', e.target.value, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter);
      });
      container.querySelector('#btn-print-dskt')?.addEventListener('click', () => {
        window.print();
      });
    }
  }

  function renderPersentase(container, state, showToast) {
    const summary = calculateFinancialSummary(state);
    const pemasukanList = state.pemasukan || [];
    const pengeluaranList = state.pengeluaran || [];

    const totalMasuk = summary.totalUangMasuk || 1;
    const totalPersepuluhan = pemasukanList.reduce((a, b) => a + (Number(b.persepuluhan) || 0), 0);
    const totalTerpadu = pemasukanList.reduce((a, b) => a + (Number(b.persembahanTerpadu) || 0), 0);
    const totalKhusus = pemasukanList.reduce((a, b) => a + (Number(b.persembahanKhusus) || 0), 0);
    const totalPembangunan = pemasukanList.reduce((a, b) => a + (Number(b.persembahanPembangunan) || 0), 0);
    const totalLain = pemasukanList.reduce((a, b) => a + (Number(b.lainLain) || 0), 0);

    const totalHakDskt = totalPersepuluhan + (totalTerpadu * 0.5);
    const totalHakGereja = (totalTerpadu * 0.5) + totalKhusus + totalLain;
    const totalHakPembangunan = totalPembangunan;

    const pctDskt = ((totalHakDskt / totalMasuk) * 100).toFixed(1);
    const pctGereja = ((totalHakGereja / totalMasuk) * 100).toFixed(1);
    const pctPembangunan = ((totalHakPembangunan / totalMasuk) * 100).toFixed(1);

    const deptMap = {};
    pengeluaranList.forEach(item => {
      const dName = item.departmentName || "Lain-lain";
      if (!deptMap[dName]) deptMap[dName] = 0;
      deptMap[dName] += Number(item.amount) || 0;
    });
    const totalKeluar = summary.totalPengeluaran || 0;
    const totalKasTersediaGereja = summary.saldoAwalGereja + summary.totalMasukGereja || 1;

    const deptList = Object.keys(deptMap).map(name => ({
      name,
      amount: deptMap[name],
      percentKeluar: totalKeluar > 0 ? ((deptMap[name] / totalKeluar) * 100).toFixed(1) : "0.0",
      percentKas: ((deptMap[name] / totalKasTersediaGereja) * 100).toFixed(1)
    })).sort((a, b) => b.amount - a.amount);

    const rasioPenyerapanGereja = ((summary.totalPengeluaranGereja / totalKasTersediaGereja) * 100).toFixed(1);
    const totalKewajibanDskt = summary.saldoAwalDskt + summary.totalMasukDskt || 1;
    const rasioKepatuhanDskt = ((summary.totalUangDikirimDskt / totalKewajibanDskt) * 100).toFixed(1);

    container.innerHTML = `
      <!-- Tombol Kembali / Back Line Icon -->
      <div style="margin-bottom: 16px;">
        <button type="button" class="btn btn-secondary" id="btn-back-dashboard-persentase" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
          <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      <div class="glass-card" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <h3 style="font-size: 1.35rem; font-weight: 800; color: hsl(var(--text-primary)); margin: 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="pie-chart" style="color: hsl(var(--accent-gold)); width: 26px; height: 26px;"></i> Analisis Persentase & Proporsi Dana
            </h3>
            <span class="badge badge-gereja" style="font-size: 0.75rem;">Real-Time Data</span>
          </div>
          <p style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin: 0; max-width: 700px;">
            Dasbor analisis statistik perbendaharaan yang memperlihatkan proporsi persentase sumber persembahan, alokasi pembagian hak dana, serta distribusi pengeluaran setiap departemen jemaat.
          </p>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="btn-refresh-persentase" style="padding: 10px 16px;">
            <i data-lucide="refresh-cw"></i>
            <span>Perbarui Data</span>
          </button>
          <button class="btn btn-primary" id="btn-print-persentase" style="padding: 10px 18px;">
            <i data-lucide="printer"></i>
            <span>Cetak Lembar Analisis</span>
          </button>
        </div>
      </div>

      <div class="stats-grid" style="margin-bottom: 28px;">
        <div class="stat-card" style="--stat-glow: rgba(212,175,55,0.15);"><span class="stat-title">Total Arus Kas Masuk (100%)</span><div class="stat-value" style="color: hsl(var(--accent-gold));">${formatRupiah(summary.totalUangMasuk)}</div><div class="stat-desc">Basis 100% dari ${pemasukanList.length} transaksi</div></div>
        <div class="stat-card" style="--stat-glow: rgba(239,68,68,0.15);"><span class="stat-title">Proporsi Hak DSKT (Daerah)</span><div class="stat-value" style="color: hsl(var(--danger));">${pctDskt}%</div><div class="stat-desc">Nominal: ${formatRupiah(totalHakDskt)}</div></div>
        <div class="stat-card" style="--stat-glow: rgba(34,197,94,0.15);"><span class="stat-title">Proporsi Kas Lokal Gereja</span><div class="stat-value" style="color: hsl(var(--success));">${pctGereja}%</div><div class="stat-desc">Nominal: ${formatRupiah(totalHakGereja)}</div></div>
        <div class="stat-card" style="--stat-glow: rgba(59,130,246,0.15);"><span class="stat-title">Proporsi Kas Pembangunan</span><div class="stat-value" style="color: hsl(var(--accent-blue));">${pctPembangunan}%</div><div class="stat-desc">Nominal: ${formatRupiah(totalHakPembangunan)}</div></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 24px; margin-bottom: 28px;">
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;"><h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--accent-blue)); margin: 0; display: flex; align-items: center; gap: 8px;"><i data-lucide="trending-up" style="width: 20px; height: 20px;"></i> I. Rincian Proporsi Sumber Pemasukan</h4><span class="badge" style="background: rgba(59,130,246,0.15); color: hsl(var(--accent-blue));">5 Komponen</span></div>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div><div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;"><div><span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persepuluhan</span><span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(100% Hak DSKT)</span></div><div style="text-align: right;"><span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--danger));">${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}%</span><span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalPersepuluhan)})</span></div></div><div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: linear-gradient(90deg, #ef4444, #f87171); width: ${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;"><div><span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persembahan Terpadu</span><span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(50% Grj / 50% DSKT)</span></div><div style="text-align: right;"><span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--accent-gold));">${((totalTerpadu / totalMasuk) * 100).toFixed(1)}%</span><span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalTerpadu)})</span></div></div><div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: linear-gradient(90deg, #f59e0b, #fbbf24); width: ${((totalTerpadu / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;"><div><span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persembahan Khusus</span><span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(100% Kas Gereja)</span></div><div style="text-align: right;"><span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--success));">${((totalKhusus / totalMasuk) * 100).toFixed(1)}%</span><span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalKhusus)})</span></div></div><div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: linear-gradient(90deg, #22c55e, #4ade80); width: ${((totalKhusus / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;"><div><span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persembahan Pembangunan</span><span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(100% Kas Pembangunan)</span></div><div style="text-align: right;"><span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--accent-blue));">${((totalPembangunan / totalMasuk) * 100).toFixed(1)}%</span><span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalPembangunan)})</span></div></div><div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: linear-gradient(90deg, #3b82f6, #60a5fa); width: ${((totalPembangunan / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
              <div><div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;"><div><span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Pemasukan Lain-lain</span><span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(Donasi/Bunga/Lainnya)</span></div><div style="text-align: right;"><span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--text-muted));">${((totalLain / totalMasuk) * 100).toFixed(1)}%</span><span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalLain)})</span></div></div><div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: hsl(var(--text-muted)); width: ${((totalLain / totalMasuk) * 100).toFixed(1)}%; height: 100%;"></div></div></div>
            </div>
          </div>
          <div style="margin-top: 20px; padding: 12px; background: rgba(59,130,246,0.08); border-radius: 10px; font-size: 0.8rem; color: hsl(var(--text-secondary));"><i data-lucide="info" style="width: 15px; height: 15px; vertical-align: -2px; margin-right: 4px; color: hsl(var(--accent-blue));"></i> Persentase dihitung dari total penerimaan uang masuk sebesar <strong style="color: hsl(var(--accent-gold));">${formatRupiah(summary.totalUangMasuk)}</strong>.</div>
        </div>

        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;"><h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--accent-gold)); margin: 0; display: flex; align-items: center; gap: 8px;"><i data-lucide="shield" style="width: 20px; height: 20px;"></i> II. Alokasi Kebijakan Pembagian Dana</h4><span class="badge badge-pembangunan">Rumus GMAHK</span></div>
            <div style="display: flex; flex-direction: column; gap: 18px;">
              <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); padding: 16px; border-radius: 14px;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"><span style="font-weight: 800; color: hsl(var(--danger)); font-size: 0.95rem;">1. Hak DSKT (Daerah / Konferens)</span><span style="font-size: 1.25rem; font-weight: 800; color: hsl(var(--danger));">${pctDskt}%</span></div><div style="font-size: 0.82rem; color: hsl(var(--text-secondary));">Mencakup <strong>100% Persepuluhan</strong> + <strong>50% Persembahan Terpadu</strong>.</div><div style="margin-top: 10px; font-weight: 700; font-size: 0.95rem; color: hsl(var(--text-primary)); display: flex; justify-content: space-between; border-top: 1px dashed rgba(239,68,68,0.3); padding-top: 8px;"><span>Total Hak DSKT:</span><span style="color: hsl(var(--danger)); font-size: 1.05rem;">${formatRupiah(totalHakDskt)}</span></div></div>
              <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); padding: 16px; border-radius: 14px;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"><span style="font-weight: 800; color: hsl(var(--success)); font-size: 0.95rem;">2. Hak Kas Operasional Gereja</span><span style="font-size: 1.25rem; font-weight: 800; color: hsl(var(--success));">${pctGereja}%</span></div><div style="font-size: 0.82rem; color: hsl(var(--text-secondary));">Mencakup <strong>50% Persembahan Terpadu</strong> + <strong>100% Khusus</strong> + <strong>Lain-lain</strong>.</div><div style="margin-top: 10px; font-weight: 700; font-size: 0.95rem; color: hsl(var(--text-primary)); display: flex; justify-content: space-between; border-top: 1px dashed rgba(34,197,94,0.3); padding-top: 8px;"><span>Total Hak Kas Gereja:</span><span style="color: hsl(var(--success)); font-size: 1.05rem;">${formatRupiah(totalHakGereja)}</span></div></div>
              <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); padding: 16px; border-radius: 14px;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"><span style="font-weight: 800; color: hsl(var(--accent-blue)); font-size: 0.95rem;">3. Hak Kas Pembangunan</span><span style="font-size: 1.25rem; font-weight: 800; color: hsl(var(--accent-blue));">${pctPembangunan}%</span></div><div style="font-size: 0.82rem; color: hsl(var(--text-secondary));">Mencakup <strong>100% Persembahan Pembangunan</strong> untuk proyek jemaat.</div><div style="margin-top: 10px; font-weight: 700; font-size: 0.95rem; color: hsl(var(--text-primary)); display: flex; justify-content: space-between; border-top: 1px dashed rgba(59,130,246,0.3); padding-top: 8px;"><span>Total Hak Pembangunan:</span><span style="color: hsl(var(--accent-blue)); font-size: 1.05rem;">${formatRupiah(totalHakPembangunan)}</span></div></div>
            </div>
          </div>
          <div style="margin-top: 20px; padding: 12px; background: rgba(212,175,55,0.08); border-radius: 10px; font-size: 0.8rem; color: hsl(var(--text-secondary));"><i data-lucide="check-circle-2" style="width: 15px; height: 15px; vertical-align: -2px; margin-right: 4px; color: hsl(var(--accent-gold));"></i> Pembagian menerapkan aturan <strong>50% Terpadu ke Daerah & 50% ke Jemaat</strong>.</div>
        </div>
      </div>

      <div class="glass-card" style="margin-bottom: 28px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
          <div><h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--danger)); margin: 0; display: flex; align-items: center; gap: 8px;"><i data-lucide="bar-chart-2" style="width: 22px; height: 22px;"></i> III. Peringkat Persentase Pengeluaran per Departemen Pelayanan</h4><p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 4px 0 0 0;">Menampilkan peringkat pos pengeluaran terbesar berdasarkan proporsi terhadap total pengeluaran & serapan kas operasional.</p></div>
          <span class="badge badge-dskt">${deptList.length} Departemen Aktif</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${deptList.map((d, idx) => `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); padding: 14px 18px; border-radius: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;"><span style="background: rgba(239,68,68,0.2); color: hsl(var(--danger)); font-weight: 800; font-size: 0.78rem; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">#${idx + 1}</span><span style="font-weight: 800; font-size: 0.98rem; color: hsl(var(--text-primary));">${d.name}</span></div>
                <div style="display: flex; align-items: center; gap: 16px;"><div style="text-align: right;"><div style="font-size: 0.72rem; color: hsl(var(--text-muted));">Serapan Kas Gereja:</div><div style="font-weight: 700; color: hsl(var(--warning)); font-size: 0.85rem;">${d.percentKas}% dari total dana</div></div><div style="text-align: right; min-width: 140px;"><div style="font-weight: 800; font-size: 1.05rem; color: hsl(var(--danger));">${formatRupiah(d.amount)}</div><div style="font-size: 0.75rem; font-weight: 700; color: hsl(var(--text-secondary));">${d.percentKeluar}% dari Total Pengeluaran</div></div></div>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 5px; overflow: hidden;"><div style="background: linear-gradient(90deg, #ef4444, #f97316); width: ${d.percentKeluar}%; height: 100%;"></div></div>
            </div>
          `).join('')}
          ${deptList.length === 0 ? `<div style="text-align: center; padding: 36px; color: hsl(var(--text-muted)); background: rgba(0,0,0,0.15); border-radius: 12px;"><i data-lucide="inbox" style="width: 40px; height: 40px; opacity: 0.5; margin-bottom: 10px;"></i><div style="font-weight: 600;">Belum ada pengeluaran tercatat untuk dianalisis persentasenya.</div></div>` : ''}
        </div>
      </div>

      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;"><h4 style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--success)); margin: 0; display: flex; align-items: center; gap: 8px;"><i data-lucide="activity" style="width: 20px; height: 20px;"></i> IV. Indikator Rasio Efisiensi & Kesehatan Perbendaharaan</h4></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 18px; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Rasio Penyerapan Kas Operasional</span><span style="font-weight: 800; font-size: 1.2rem; color: ${rasioPenyerapanGereja > 85 ? 'hsl(var(--danger))' : 'hsl(var(--success))'};">${rasioPenyerapanGereja}%</span></div>
            <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 10px;"><div style="background: ${rasioPenyerapanGereja > 85 ? 'hsl(var(--danger))' : 'hsl(var(--success))'}; width: ${Math.min(rasioPenyerapanGereja, 100)}%; height: 100%;"></div></div>
            <div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">Mengukur perbandingan antara <strong>Total Pengeluaran Gereja (${formatRupiah(summary.totalPengeluaranGereja)})</strong> terhadap <strong>Dana Kas Operasional Tersedia (${formatRupiah(totalKasTersediaGereja)})</strong>.</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 18px; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Rasio Kepatuhan Setoran DSKT</span><span style="font-weight: 800; font-size: 1.2rem; color: ${rasioKepatuhanDskt >= 100 ? 'hsl(var(--success))' : 'hsl(var(--warning))'};">${rasioKepatuhanDskt}%</span></div>
            <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 10px;"><div style="background: ${rasioKepatuhanDskt >= 100 ? 'hsl(var(--success))' : 'hsl(var(--warning))'}; width: ${Math.min(rasioKepatuhanDskt, 100)}%; height: 100%;"></div></div>
            <div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">Mengukur perbandingan antara <strong>Dana Setoran ke Daerah (${formatRupiah(summary.totalUangDikirimDskt)})</strong> terhadap <strong>Total Kewajiban DSKT (${formatRupiah(totalKewajibanDskt)})</strong>.</div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-back-dashboard-persentase')?.addEventListener('click', () => {
      if (typeof navigateTo === 'function') navigateTo('dashboard');
      else if (window.BendaharaApp?.navigateTo) window.BendaharaApp.navigateTo('dashboard');
    });

    container.querySelector('#btn-refresh-persentase')?.addEventListener('click', () => {
      renderPersentase(container, state, showToast);
      if (showToast) showToast("Analisis persentase berhasil diperbarui!", "success");
    });
    container.querySelector('#btn-print-persentase')?.addEventListener('click', () => window.print());
  }

  function renderPengaturan(container, state) {
    const settings = state.settings || {};
    const summary = calculateFinancialSummary(state);
    container.innerHTML = `
      <!-- Tombol Kembali / Back Line Icon -->
      <div style="margin-bottom: 16px;">
        <button type="button" class="btn btn-secondary" id="btn-back-dashboard-pengaturan" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
          <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      <div class="view-split-grid">
        <div class="glass-card">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-blue)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;"><i data-lucide="settings" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>Identitas Jemaat & Saldo Awal Kas</h3>
          <form id="form-settings">
            <div class="form-group"><label class="form-label">Nama Gereja / Jemaat</label><input type="text" class="form-control" id="st-church" value="${settings.churchName || ''}" placeholder="Cth: Jemaat Teratai Batam" required /></div>
            <div class="form-group"><label class="form-label">Nama Daerah / Konferens (DSKT)</label><input type="text" class="form-control" id="st-district" value="${settings.districtName || ''}" placeholder="Cth: DSKT - Daerah Sumatera Kawasan Tengah" required /></div>
            <div class="form-group"><label class="form-label">Nama Bendahara Jemaat</label><input type="text" class="form-control" id="st-treasurer" value="${settings.treasurerName || ''}" placeholder="Cth: Bpk. R. Situmorang" /></div>
            <div class="form-group"><label class="form-label">Nama Ketua Jemaat</label><input type="text" class="form-control" id="st-ketua" value="${settings.ketuaJemaat || ''}" placeholder="Cth: Bpk. Gerhard Panjaitan" /></div>
            <div class="form-group"><label class="form-label">Nama Gembala Jemaat / Pendeta</label><input type="text" class="form-control" id="st-gembala" value="${settings.gembalaJemaat || ''}" placeholder="Cth: Pdt. Edisyaputra Ginting" /></div>
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
          <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="st-autopull" ${settings.autoPullOnLoad ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: hsl(var(--accent-blue)); cursor: pointer;" />
            <label for="st-autopull" style="font-size: 0.9rem; cursor: pointer; user-select: none;">Tarik Data Otomatis Saat Aplikasi Dibuka</label>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <button type="button" class="btn btn-gold" id="btn-sync-now" style="flex: 1; justify-content: center; padding: 14px;"><i data-lucide="upload-cloud"></i><span>Kirim / Sync Data ke Sheets</span></button>
            <button type="button" class="btn btn-primary" id="btn-pull-now" style="flex: 1; justify-content: center; padding: 14px; background: linear-gradient(135deg, hsl(160, 84%, 30%), hsl(var(--accent-blue))); border: none; color: white;"><i data-lucide="download-cloud"></i><span>Tarik Data dari Sheets</span></button>
          </div>
          <div style="margin-bottom: 24px; display: flex; justify-content: center;">
            <button type="button" class="btn btn-secondary" id="btn-copy-template" style="padding: 10px 18px;" title="Salin Skrip Google Apps Script"><i data-lucide="copy"></i><span>Salin code.gs (1-Klik)</span></button>
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
          <div style="border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: hsl(var(--text-primary)); margin-bottom: 12px;">Impor Data dari Excel</h4>
            <p style="font-size: 0.8rem; color: hsl(var(--text-muted)); margin-bottom: 12px;">Unduh template di bawah, isi data di Excel, simpan file seperti biasa (.xlsx), lalu unggah untuk menggabungkannya ke aplikasi.</p>
            
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;">
              <button type="button" class="btn btn-secondary" id="btn-download-csv-pemasukan" style="flex: 1; justify-content: center; font-size: 0.85rem;"><i data-lucide="file-spreadsheet"></i><span>Template Pemasukan</span></button>
              <label class="btn btn-primary" style="flex: 1; justify-content: center; font-size: 0.85rem; cursor: pointer; margin: 0; background: linear-gradient(135deg, hsl(160, 84%, 30%), hsl(var(--accent-blue))); border: none; color: white;"><i data-lucide="upload"></i><span>Unggah Excel Pemasukan</span><input type="file" id="input-import-csv-pemasukan" accept=".xlsx, .xls" style="display: none;" /></label>
            </div>

            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button type="button" class="btn btn-secondary" id="btn-download-csv-pengeluaran" style="flex: 1; justify-content: center; font-size: 0.85rem;"><i data-lucide="file-spreadsheet"></i><span>Template Pengeluaran</span></button>
              <label class="btn btn-primary" style="flex: 1; justify-content: center; font-size: 0.85rem; cursor: pointer; margin: 0; background: linear-gradient(135deg, hsl(340, 80%, 40%), hsl(var(--danger))); border: none; color: white;"><i data-lucide="upload"></i><span>Unggah Excel Pengeluaran</span><input type="file" id="input-import-csv-pengeluaran" accept=".xlsx, .xls" style="display: none;" /></label>
            </div>
          </div>
          <div style="margin-top: 24px; text-align: center;"><button type="button" class="btn btn-danger" id="btn-reset-all" style="padding: 8px 16px; font-size: 0.8rem; background: transparent; border-color: rgba(239,68,68,0.4);"><i data-lucide="alert-triangle"></i><span>Reset / Bersihkan Seluruh Data Jemaat</span></button></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-back-dashboard-pengaturan')?.addEventListener('click', () => {
      if (typeof navigateTo === 'function') navigateTo('dashboard');
      else if (window.BendaharaApp?.navigateTo) window.BendaharaApp.navigateTo('dashboard');
    });

    container.querySelector('#form-settings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      updateSettings({
        churchName: container.querySelector('#st-church').value,
        districtName: container.querySelector('#st-district').value,
        treasurerName: container.querySelector('#st-treasurer').value,
        ketuaJemaat: container.querySelector('#st-ketua').value,
        gembalaJemaat: container.querySelector('#st-gembala').value,
        saldoAwalGereja: Number(container.querySelector('#st-saldo-grj').value) || 0,
        saldoAwalPembangunan: Number(container.querySelector('#st-saldo-pbg').value) || 0,
        saldoAwalDskt: Number(container.querySelector('#st-saldo-dskt').value) || 0,
        webhookUrl: container.querySelector('#st-webhook').value.trim(),
        autoPullOnLoad: container.querySelector('#st-autopull') ? container.querySelector('#st-autopull').checked : false
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

    container.querySelector('#btn-pull-now')?.addEventListener('click', async () => {
      const url = container.querySelector('#st-webhook').value.trim() || state.settings.webhookUrl;
      if (!url) { showToast("URL Webhook belum diisi di atas.", "warning"); return; }
      updateSettings({ webhookUrl: url });
      
      if (!confirm("Peringatan: Data di aplikasi ini akan DITIMPA sepenuhnya dengan data dari Google Sheets!\\nPastikan Sheet berisi data yang valid.\\nLanjutkan?")) return;
      
      showToast("Menarik data dari Google Sheets...", "info");
      const res = await pullFromGoogleSheets(url);
      if (res.success && res.data) {
        state.pemasukan = res.data.pemasukan || [];
        state.pengeluaran = res.data.pengeluaran || [];
        state.kirimDskt = res.data.kirimDskt || [];
        localStorage.setItem('gmahk_bendahara_state_v1', JSON.stringify(state));
        showToast("Data berhasil ditarik dan diperbarui! Memuat ulang...", "success");
        setTimeout(() => window.location.reload(), 1500);
      } else { 
        showToast(res.message, "danger"); 
      }
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

    container.querySelector('#btn-download-csv-pemasukan')?.addEventListener('click', () => {
      downloadExcel("Template_Pemasukan.xlsx", ["Tanggal (YYYY-MM-DD)", "Sabat / Minggu", "Nama Anggota", "Persepuluhan", "Persembahan Terpadu", "Persembahan Khusus (Gereja)", "Persembahan Pembangunan", "Lain-lain", "No Kuitansi", "Catatan"], ["2023-10-15", "Sabat ke-3", "John Doe", 500000, 100000, 50000, 0, 0, "KWT-001", "Transfer Bank"]);
      showToast("Template Excel Pemasukan berhasil diunduh.", "success");
    });

    container.querySelector('#btn-download-csv-pengeluaran')?.addEventListener('click', () => {
      downloadExcel("Template_Pengeluaran.xlsx", ["Tanggal (YYYY-MM-DD)", "Kategori / Departemen", "Keterangan / Uraian", "Jumlah Pengeluaran", "No Voucher", "Dana Pembangunan (Ya/Tidak)"], ["2023-10-16", "Operasional Gereja", "Bayar Listrik PLN", 250000, "VK-001", "Tidak"]);
      showToast("Template Excel Pengeluaran berhasil diunduh.", "success");
    });

    function processExcelFile(file, isPemasukan) {
      if (!window.XLSX) { showToast("Library Excel belum termuat.", "danger"); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, {type: 'array', cellDates: true});
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1, raw: false, dateNF: "yyyy-mm-dd"});
          
          if (rows.length < 2) throw new Error("File Excel kosong atau tidak ada data.");
          let imported = 0;
          for (let i = 1; i < rows.length; i++) {
            const cols = rows[i];
            if (!cols || cols.length < 3 || !cols[0]) continue; // Skip invalid
            
            const dateStr = String(cols[0]).trim();
            if (isPemasukan) {
              const newItem = {
                id: "TRM-" + Date.now() + Math.floor(Math.random()*1000) + i,
                date: dateStr,
                sabbathName: String(cols[1] || "-"),
                memberName: String(cols[2] || "-"),
                persepuluhan: parseNumber(cols[3]),
                persembahanTerpadu: parseNumber(cols[4]),
                persembahanKhusus: parseNumber(cols[5]),
                persembahanPembangunan: parseNumber(cols[6]),
                lainLain: parseNumber(cols[7]),
                receiptNo: String(cols[8] || ("KWT-EXC-" + Date.now().toString().slice(-4))),
                notes: String(cols[9] || "")
              };
              state.pemasukan.push(newItem);
            } else {
              const isBuild = String(cols[5]).toLowerCase().includes('ya');
              const newItem = {
                id: "OUT-" + Date.now() + Math.floor(Math.random()*1000) + i,
                date: dateStr,
                departmentName: String(cols[1] || "-"),
                departmentId: 1, // Default fallback
                description: String(cols[2] || "-"),
                amount: parseNumber(cols[3]),
                voucherNo: String(cols[4] || ("VK-EXC-" + Date.now().toString().slice(-4))),
                isBuildingFund: isBuild
              };
              state.pengeluaran.push(newItem);
            }
            imported++;
          }
          localStorage.setItem('gmahk_bendahara_state_v1', JSON.stringify(state));
          showToast(`Berhasil mengimpor ${imported} data ${isPemasukan ? 'pemasukan' : 'pengeluaran'}! Memuat ulang...`, "success");
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) { showToast("Error memproses Excel: " + err.message, "danger"); }
      };
      reader.readAsArrayBuffer(file);
    }

    container.querySelector('#input-import-csv-pemasukan')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processExcelFile(file, true);
      e.target.value = "";
    });

    container.querySelector('#input-import-csv-pengeluaran')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processExcelFile(file, false);
      e.target.value = "";
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
    if (churchEl) churchEl.textContent = state.settings?.churchName || 'Jemaat Teratai Batam';
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
      const dv = item.getAttribute('data-view');
      const isJurnalView = (viewName === 'jurnal' || viewName === 'pemasukan' || viewName === 'pengeluaran');
      if (dv === viewName || (isJurnalView && dv === 'jurnal')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelector('.sidebar')?.classList.remove('mobile-open');

    switch (viewName) {
      case 'dashboard':
        updatePageTitle('Dashboard & Arus Kas');
        renderDashboard(container, state, navigateTo);
        break;
      case 'jurnal':
      case 'pemasukan':
      case 'pengeluaran':
        updatePageTitle('Buku Jurnal Kas Jemaat (Pemasukan & Pengeluaran)');
        renderJurnal(container, state, showToast, (viewName === 'pengeluaran') ? 'pengeluaran' : (viewName === 'pemasukan' ? 'pemasukan' : null));
        break;
      case 'kirim-dskt':
        updatePageTitle('Setoran / Pengiriman Dana ke DSKT (Konferens/Daerah)');
        renderKirimDskt(container, state, showToast);
        break;
      case 'kirim-pembangunan':
        updatePageTitle('Setoran Kas Pembangunan');
        renderKirimPembangunan(container, state);
        break;
      case 'laporan':
        updatePageTitle('Pusat Laporan Jemaat');
        renderLaporan(container, state, showToast);
        break;
      case 'persentase':
        updatePageTitle('Analisis Persentase & Proporsi Dana');
        renderPersentase(container, state, showToast);
        break;
      case 'pengaturan':
        updatePageTitle('Pengaturan Jemaat & Sinkronisasi Google Sheets');
        renderPengaturan(container, state, showToast);
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

    // Sidebar Autohide Menu Toggle (Semua Layar: Desktop, Tablet & HP)
    const sidebar = document.querySelector('.sidebar');
    const btnMenu = document.getElementById('btn-mobile-menu');
    btnMenu?.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar?.classList.toggle('mobile-open');
    });

    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !btnMenu?.contains(e.target)) {
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

    document.getElementById('btn-refresh-sync')?.addEventListener('click', async () => {
      if (!state.settings?.webhookUrl) {
        showToast("Belum ada Webhook URL. Silakan atur di menu Pengaturan.", "warning");
        return;
      }
      showToast("Sedang menarik data terbaru dari server...", "info");
      const icon = document.querySelector('#btn-refresh-sync i');
      if (icon) {
        icon.style.transition = 'transform 1s linear';
        icon.style.transform = 'rotate(720deg)';
      }
      try {
        const res = await pullFromGoogleSheets(state.settings.webhookUrl);
        if (res.success && res.data) {
          let dataChanged = false;
          if (JSON.stringify(state.pemasukan) !== JSON.stringify(res.data.pemasukan || [])) { state.pemasukan = res.data.pemasukan || []; dataChanged = true; }
          if (JSON.stringify(state.pengeluaran) !== JSON.stringify(res.data.pengeluaran || [])) { state.pengeluaran = res.data.pengeluaran || []; dataChanged = true; }
          if (JSON.stringify(state.kirimDskt) !== JSON.stringify(res.data.kirimDskt || [])) { state.kirimDskt = res.data.kirimDskt || []; dataChanged = true; }
          
          if (dataChanged) {
            localStorage.setItem('gmahk_bendahara_state_v1', JSON.stringify(state));
            showToast("Sinkronisasi sukses! Halaman akan dimuat ulang.", "success");
            setTimeout(() => window.location.reload(), 1000);
          } else {
            showToast("Data sudah yang paling terbaru (tersinkronisasi).", "success");
            if (icon) {
              setTimeout(() => { icon.style.transition = 'none'; icon.style.transform = 'rotate(0deg)'; }, 1000);
            }
          }
        } else {
          showToast(res.message || "Gagal menarik data dari server.", "danger");
        }
      } catch (e) {
        showToast("Terjadi kesalahan jaringan saat sinkronisasi.", "danger");
      }
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

    // Auto-Pull on Load (Selalu Tarik Saat Aplikasi Dibuka Jika Ada Webhook)
    if (state.settings && state.settings.webhookUrl) {
      setTimeout(async () => {
        showToast("Sinkronisasi otomatis (memeriksa data server)...", "info");
        try {
          const res = await pullFromGoogleSheets(state.settings.webhookUrl);
          if (res.success && res.data) {
            let dataChanged = false;
            if (JSON.stringify(state.pemasukan) !== JSON.stringify(res.data.pemasukan || [])) { state.pemasukan = res.data.pemasukan || []; dataChanged = true; }
            if (JSON.stringify(state.pengeluaran) !== JSON.stringify(res.data.pengeluaran || [])) { state.pengeluaran = res.data.pengeluaran || []; dataChanged = true; }
            if (JSON.stringify(state.kirimDskt) !== JSON.stringify(res.data.kirimDskt || [])) { state.kirimDskt = res.data.kirimDskt || []; dataChanged = true; }
            
            if (dataChanged) {
              localStorage.setItem('gmahk_bendahara_state_v1', JSON.stringify(state));
              showToast("Ada data baru! Aplikasi otomatis diperbarui.", "success");
              setTimeout(() => window.location.reload(), 1500);
            } else {
              showToast("Data Anda sudah sinkron (terbaru).", "info");
            }
          }
        } catch(e) {
          console.error("Auto pull failed", e);
        }
      }, 2000);
    }
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
