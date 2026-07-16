/**
 * Modul Perhitungan Finansial & Alokasi Dana GMAHK
 * Mengatur pemecahan persentase persembahan dan menghitung posisi arus kas real-time.
 */

export function calculateIncomeBreakdown(entry) {
  const persepuluhan = Number(entry.persepuluhan) || 0;
  const persembahanTerpadu = Number(entry.persembahanTerpadu) || 0;
  const persembahanKhusus = Number(entry.persembahanKhusus) || 0;
  const persembahanPembangunan = Number(entry.persembahanPembangunan) || 0;
  const lainLain = Number(entry.lainLain) || 0;

  // 1. Persepuluhan 100% masuk Kas DSKT
  // 2. Persembahan Terpadu: 50% Kas Gereja, 50% Kas DSKT
  const dsktFromTerpadu = persembahanTerpadu * 0.5;
  const gerejaFromTerpadu = persembahanTerpadu * 0.5;

  const kasDskt = persepuluhan + dsktFromTerpadu;
  const kasGereja = gerejaFromTerpadu + persembahanKhusus + lainLain;
  const kasPembangunan = persembahanPembangunan;
  const total = persepuluhan + persembahanTerpadu + persembahanKhusus + persembahanPembangunan + lainLain;

  return {
    persepuluhan,
    persembahanTerpadu,
    persembahanKhusus,
    persembahanPembangunan,
    lainLain,
    kasDskt,
    kasGereja,
    kasPembangunan,
    total
  };
}

/**
 * Menghitung seluruh ringkasan Arus Kas Gereja berdasarkan rumus:
 * Saldo Awal + Uang Masuk - Uang Di Kirim DSKT - Pengeluaran = Sisa Saldo Gereja
 */
export function calculateFinancialSummary(state) {
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
    // Jika kategori berhubungan langsung dengan proyek/pembangunan (opsional, secara default kas gereja)
    if (item.isBuildingFund || item.departmentId === 24 || item.departmentName?.toLowerCase().includes('pembangunan')) {
      totalPengeluaranPembangunan += amount;
    } else {
      totalPengeluaranGereja += amount;
    }
  });

  let totalUangDikirimDskt = 0;
  kirimDsktList.forEach(item => {
    totalUangDikirimDskt += (Number(item.amount) || 0);
  });

  // Perhitungan Saldo Akhir sesuai rumus resmi perbendaharaan:
  // Sisa Saldo Gereja = Saldo Awal + Total Uang Masuk - Uang Dikirim Ke DSKT & Pembangunan - Pengeluaran
  const sisaSaldoTotal = saldoAwalTotal + totalUangMasuk - totalUangDikirimDskt - totalPengeluaran;

  // Rincian Saldo Per Buku Kas:
  const saldoKasGereja = saldoAwalGereja + totalMasukGereja - totalPengeluaranGereja;
  const saldoKasPembangunan = saldoAwalPembangunan + totalMasukPembangunan - totalPengeluaranPembangunan;
  const kewajibanDsktBelumDisetor = saldoAwalDskt + totalMasukDskt - totalUangDikirimDskt;

  const uangDikirimDsktDanPembangunan = totalUangDikirimDskt + totalPengeluaranPembangunan;
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
    sisaSaldoTotal,
    saldoKasGereja,
    saldoKasPembangunan,
    kewajibanDsktBelumDisetor,
    uangDikirimDsktDanPembangunan,
    pengeluaranOperasional,
    sisaSaldoGereja
  };
}

export function formatRupiah(amount) {
  const val = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
}

export function formatAngka(amount) {
  const val = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('id-ID').format(val);
}

export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Menghasilkan HTML Banner Rumus Arus Kas Bendahara Gereja Advent
 * Saldo Awal + Uang Masuk - Uang Dikirim Ke DSKT & Pembangunan - Pengeluaran = Sisa Saldo Gereja
 */
export function renderRumusArusKasBanner(summary) {
  return "";
}
