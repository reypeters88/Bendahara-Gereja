/**
 * Modul Manajemen State & Penyimpanan Offline (LocalStorage/IndexedDB Adapter)
 */

import { calculateFinancialSummary } from './calculations.js';

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

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      appState = JSON.parse(saved);
      // Pastikan struktur state lengkap jika ada pembaruan
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
    console.error("Gagal memuat data dari storage:", err);
    appState = JSON.parse(JSON.stringify(INITIAL_STATE));
  }
  return appState;
}

export function saveState() {
  try {
    if (!appState) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    notifyListeners();
  } catch (err) {
    console.error("Gagal menyimpan data ke storage:", err);
  }
}

export function getState() {
  if (!appState) loadState();
  return appState;
}

export function updateSettings(newSettings) {
  appState.settings = { ...appState.settings, ...newSettings };
  saveState();
}

export function addMember(member) {
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

export function addMembersBulk(membersList) {
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

export function generateReceiptNo(dateStr, state) {
  const st = state || appState;
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return "TRT-010126-001";
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const monthStr = (dateStr || "").slice(0, 7);
  
  const existingInMonth = (st.pemasukan || []).filter(item => {
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

export function generateVoucherNo(dateStr, state) {
  const st = state || appState;
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return "VCH-010126-001";
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const monthStr = (dateStr || "").slice(0, 7);
  
  const existingInMonth = (st.pengeluaran || []).filter(item => {
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

export function addPemasukan(entry) {
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

export function deletePemasukan(id) {
  appState.pemasukan = appState.pemasukan.filter(item => item.id !== id);
  saveState();
}

export function addPengeluaran(entry) {
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

export function deletePengeluaran(id) {
  appState.pengeluaran = appState.pengeluaran.filter(item => item.id !== id);
  saveState();
}

export function addKirimDskt(entry) {
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

export function deleteKirimDskt(id) {
  appState.kirimDskt = appState.kirimDskt.filter(item => item.id !== id);
  saveState();
}

export function subscribe(listener) {
  if (typeof listener === 'function') {
    LISTENERS.push(listener);
  }
}

function notifyListeners() {
  LISTENERS.forEach(listener => listener(appState));
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  appState = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveState();
}

export function importBackupData(dataObj) {
  if (dataObj && dataObj.settings && dataObj.pemasukan && dataObj.pengeluaran) {
    appState = dataObj;
    saveState();
    return true;
  }
  return false;
}
