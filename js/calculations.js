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
  const saldoAwal = summary.saldoAwalTotal || 0;
  const uangMasuk = summary.totalUangMasuk || 0;
  const dikirimDsktPembangunan = summary.uangDikirimDsktDanPembangunan || ((summary.totalUangDikirimDskt || 0) + (summary.totalPengeluaranPembangunan || 0));
  const pengeluaran = summary.pengeluaranOperasional || (summary.totalPengeluaranGereja || 0);
  const sisaSaldo = summary.sisaSaldoGereja || (summary.sisaSaldoTotal || 0);

  return `
    <div class="formula-banner" style="border: 1px solid rgba(212, 175, 55, 0.45); background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, var(--surface-subtle) 100%);">
      <div class="formula-title" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 14px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="background: rgba(212, 175, 55, 0.2); padding: 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="calculator" style="color: hsl(var(--accent-gold)); width: 22px; height: 22px;"></i>
          </div>
          <div>
            <span style="font-size: 1.08rem; font-weight: 800; color: hsl(var(--accent-gold)); display: block;">
              RUMUS ARUS KAS BENDAHARA GEREJA ADVENT (GMAHK)
            </span>
            <span style="font-size: 0.8rem; font-weight: 600; color: hsl(var(--text-secondary)); display: block; margin-top: 2px;">
              Saldo Awal + Uang Masuk - Uang Dikirim Ke DSKT & Pembangunan - Pengeluaran = Sisa Saldo Gereja
            </span>
          </div>
        </div>
        <span style="font-size: 0.74rem; font-weight: 800; background: rgba(212, 175, 55, 0.18); color: hsl(var(--accent-gold)); padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.4); text-transform: uppercase; letter-spacing: 0.04em;">
          Formula Resmi
        </span>
      </div>

      <div class="formula-flow" style="margin-bottom: 18px; gap: 10px;">
        <div class="flow-box" style="border-radius: 12px;">
          <div class="flow-label">Saldo Awal</div>
          <div class="flow-number">${formatRupiah(saldoAwal)}</div>
          <div style="font-size: 0.68rem; color: hsl(var(--text-muted)); margin-top: 2px;">(Kas Awal Bulan)</div>
        </div>
        <div class="flow-operator">+</div>
        <div class="flow-box" style="border-radius: 12px; background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.35);">
          <div class="flow-label" style="color: hsl(var(--success));">Uang Masuk</div>
          <div class="flow-number" style="color: hsl(var(--success));">${formatRupiah(uangMasuk)}</div>
          <div style="font-size: 0.68rem; color: hsl(var(--text-muted)); margin-top: 2px;">(Penerimaan Jemaat)</div>
        </div>
        <div class="flow-operator">-</div>
        <div class="flow-box" style="border-radius: 12px; background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.35);">
          <div class="flow-label" style="color: hsl(var(--warning));">Dikirim DSKT & Pembangunan</div>
          <div class="flow-number" style="color: hsl(var(--warning));">${formatRupiah(dikirimDsktPembangunan)}</div>
          <div style="font-size: 0.68rem; color: hsl(var(--text-muted)); margin-top: 2px;">(DSKT: Rp ${formatRupiah(summary.totalUangDikirimDskt || 0)} + Pemb: Rp ${formatRupiah(summary.totalPengeluaranPembangunan || 0)})</div>
        </div>
        <div class="flow-operator">-</div>
        <div class="flow-box" style="border-radius: 12px; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.35);">
          <div class="flow-label" style="color: hsl(var(--danger));">Pengeluaran</div>
          <div class="flow-number" style="color: hsl(var(--danger));">${formatRupiah(pengeluaran)}</div>
          <div style="font-size: 0.68rem; color: hsl(var(--text-muted)); margin-top: 2px;">(Operasional Departemen)</div>
        </div>
        <div class="flow-operator">=</div>
        <div class="flow-box result" style="border-radius: 12px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1.5px solid hsl(var(--accent-gold));">
          <div class="flow-label" style="color: hsl(var(--accent-gold)); font-weight: 800;">Sisa Saldo Gereja</div>
          <div class="flow-number" style="color: hsl(var(--text-primary)); font-size: 1.25rem; font-weight: 900;">${formatRupiah(sisaSaldo)}</div>
          <div style="font-size: 0.68rem; color: hsl(var(--accent-gold)); margin-top: 2px; font-weight: 700;">(Arus Kas Bersih)</div>
        </div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.25); border-left: 3.5px solid hsl(var(--accent-gold)); padding: 12px 16px; border-radius: 10px; font-size: 0.83rem; color: hsl(var(--text-secondary)); line-height: 1.45;">
        <strong style="color: hsl(var(--text-primary));">Aturan Wajib Perbendaharaan:</strong> Karena dana <strong style="color: hsl(var(--warning));">Pembangunan</strong> dan <strong style="color: hsl(var(--warning));">DSKT</strong> setiap akhir bulannya merupakan kewajiban yang harus dikirim dan dikeluarkan dari Kas Gereja, maka dalam perhitungan rumusan arus kas di atas dipisahkan dari pengeluaran operasional rutin agar posisi <strong style="color: hsl(var(--accent-gold));">Sisa Saldo Gereja</strong> akurat dan siap dipertanggungjawabkan.
      </div>
    </div>
  `;
}
