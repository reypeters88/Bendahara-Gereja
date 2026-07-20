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

  let totalKirimPembangunan = 0;
  kirimPembangunanList.forEach(item => {
    totalKirimPembangunan += (Number(item.amount) || 0);
  });

  // Perhitungan Saldo Akhir sesuai rumus resmi perbendaharaan:
  // Sisa Saldo Gereja = Saldo Awal + Total Uang Masuk - Uang Dikirim Ke DSKT & Pembangunan - Pengeluaran
  const sisaSaldoTotal = saldoAwalTotal + totalUangMasuk - totalUangDikirimDskt - totalKirimPembangunan - totalPengeluaran;

  // Rincian Saldo Per Buku Kas:
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

export function formatRupiah(amount) {
  const val = Math.round(Number(amount) || 0);
  const numString = new Intl.NumberFormat('id-ID').format(val);
  return `<span style="display: flex; justify-content: space-between; width: 100%;"><span>Rp</span> <span>${numString}</span></span>`;
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

export function angkaTerbilang(angka) {
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
  
  let result = terbilang(Math.abs(Math.round(Number(angka)))).trim().replace(/\\s+/g, ' ');
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result + " rupiah";
}
