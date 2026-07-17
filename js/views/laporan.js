/**
 * Tampilan & Hub Pusat Laporan Keuangan GMAHK
 * Pilihan Sub-Menu: 1. Laporan & Expor Excel, 2. Laporan Keuangan, 3. Laporan Persentase
 */
import { calculateFinancialSummary, calculateIncomeBreakdown, formatRupiah, formatAngka, formatDateIndo, angkaTerbilang } from '../calculations.js';

export function renderLaporan(container, state, showToast, activeTab = null, transYear = null, transMonth = null, transType = null, keuanganMode = 'standard', keuanganYear = null, keuanganQuarter = null) {
  const summary = calculateFinancialSummary(state);
  const pemasukanList = state.pemasukan || [];
  const pengeluaranList = state.pengeluaran || [];
  const kirimList = state.kirimDskt || [];
  const kirimPembList = state.kirimPembangunan || [];

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

    <!-- Header Navigasi Sub-Menu Laporan -->
    <!-- Header Navigasi Sub-Menu Laporan (Hanya tampil saat memilih menu utama / activeTab === null) -->
    ${activeTab === null ? `
      <div class="glass-card" style="margin-bottom: 24px; padding: 20px 24px;">
        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 1.35rem; font-weight: 800; color: hsl(var(--text-primary)); display: flex; align-items: center; gap: 8px;">
            <i data-lucide="file-spreadsheet" style="color: hsl(var(--accent-gold));"></i> Lembaran Pusat Laporan Jemaat
          </h3>
          <p style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin: 4px 0 0 0;">
            Pilih lembaran atau jenis laporan di bawah ini untuk melihat tabel rincian, ringkasan majelis, atau analisis persentase perbendaharaan.
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
              <div style="font-weight: 800; font-size: 1.05rem; line-height: 1.2;">5. Laporan Penerimaan DSKT</div>
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

      <!-- Ringkasan Arus Kas -->
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

      <!-- BAGIAN 1: TABEL PEMASUKAN -->
      <div class="glass-card" style="margin-bottom: 28px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(59, 130, 246, 0.4); padding-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--accent-blue));">
            I. BAGIAN PEMASUKAN PERSEMBAHAN & PERSEPULUHAN
          </h3>
          <span class="badge badge-pembangunan">${pemasukanList.length} Transaksi</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr style="background: rgba(30, 58, 138, 0.4);">
                <th>Tanggal & No. Kuitansi</th>
                <th>Anggota Jemaat</th>
                <th>Persepuluhan (DSKT)</th>
                <th>Pers. Terpadu (Total)</th>
                <th>Pers. Khusus (Grj)</th>
                <th>Pers. Pembangunan</th>
                <th>Lain-lain</th>
                <th>Total Pemasukan</th>
              </tr>
            </thead>
            <tbody>
              ${pemasukanList.map(item => {
                const calc = calculateIncomeBreakdown(item);
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${formatDateIndo(item.date)}</div>
                      <div style="font-size: 0.78rem; color: hsl(var(--text-muted));">No. ${item.receiptNo}</div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: hsl(var(--accent-gold));">${item.memberName}</div>
                    </td>
                    <td style="color: hsl(var(--danger)); font-weight: 600;">${formatRupiah(item.persepuluhan)}</td>
                    <td style="font-weight: 600;">
                      <div>${formatRupiah(item.persembahanTerpadu)}</div>
                      <div style="font-size: 0.72rem; color: hsl(var(--text-muted));">(Grj: ${formatRupiah(calc.gerejaFromTerpadu || item.persembahanTerpadu*0.5)} / DSKT: ${formatRupiah(item.persembahanTerpadu*0.5)})</div>
                    </td>
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
              <tr style="background: rgba(0, 0, 0, 0.4); font-weight: 800;">
                <td colspan="2" style="text-align: right; padding: 16px;">TOTAL PEMASUKAN:</td>
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

      <!-- BAGIAN 2: TABEL PENGELUARAN -->
      <div class="glass-card" style="margin-bottom: 28px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(239, 68, 68, 0.4); padding-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--danger));">
            II. BAGIAN PENGELUARAN OPERASIONAL & DEPARTEMEN
          </h3>
          <span class="badge badge-dskt">${pengeluaranList.length} Transaksi</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr style="background: rgba(153, 27, 27, 0.4);">
                <th>Tanggal & Voucher</th>
                <th>Kategori Departemen</th>
                <th>Keterangan / Uraian</th>
                <th>Sumber Dana</th>
                <th>Nominal Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              ${pengeluaranList.map(item => `
                <tr>
                  <td>
                    <div style="font-weight: 600;">${formatDateIndo(item.date)}</div>
                    <div style="font-size: 0.78rem; color: hsl(var(--text-muted));">Voucher: ${item.voucherNo}</div>
                  </td>
                  <td style="font-weight: 700; color: hsl(var(--text-primary));">${item.departmentName}</td>
                  <td>${item.description}</td>
                  <td>
                    ${item.isBuildingFund ? `<span class="badge badge-pembangunan">Kas Pembangunan</span>` : `<span class="badge badge-gereja">Kas Jemaat</span>`}
                  </td>
                  <td style="font-weight: 800; color: hsl(var(--danger)); font-size: 1rem;">${formatRupiah(item.amount)}</td>
                </tr>
              `).join('')}
              ${pengeluaranList.length === 0 ? `<tr><td colspan="5" style="text-align: center; padding: 30px;">Belum ada data pengeluaran.</td></tr>` : ''}
            </tbody>
            <tfoot>
              <tr style="background: rgba(0, 0, 0, 0.4); font-weight: 800;">
                <td colspan="4" style="text-align: right; padding: 16px;">TOTAL PENGELUARAN:</td>
                <td style="color: hsl(var(--danger)); font-size: 1.1rem;">${formatRupiah(summary.totalPengeluaran)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- BAGIAN 3: TABEL PENGIRIMAN DSKT -->
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(245, 158, 11, 0.4); padding-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--warning));">
            III. SETORAN / PENGIRIMAN KE KAS DSKT (KONFERENS/DAERAH)
          </h3>
          <span class="badge" style="background: rgba(245,158,11,0.15); color: hsl(var(--warning));">${kirimList.length} Setoran</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr style="background: rgba(180, 83, 9, 0.4);">
                <th>Tanggal & Referensi</th>
                <th>Keterangan Setoran</th>
                <th>Jumlah Setoran ke DSKT</th>
              </tr>
            </thead>
            <tbody>
              ${kirimList.map(item => `
                <tr>
                  <td>
                    <div style="font-weight: 600;">${formatDateIndo(item.date)}</div>
                    <div style="font-size: 0.78rem; color: hsl(var(--text-muted));">Ref: ${item.referenceNo}</div>
                  </td>
                  <td>${item.notes}</td>
                  <td style="font-weight: 800; color: hsl(var(--warning)); font-size: 1rem;">${formatRupiah(item.amount)}</td>
                </tr>
              `).join('')}
              ${kirimList.length === 0 ? `<tr><td colspan="3" style="text-align: center; padding: 30px;">Belum ada pengiriman ke DSKT.</td></tr>` : ''}
            </tbody>
            <tfoot>
              <tr style="background: rgba(0, 0, 0, 0.4); font-weight: 800;">
                <td colspan="2" style="text-align: right; padding: 16px;">TOTAL DIKIRIM KE DSKT:</td>
                <td style="color: hsl(var(--warning)); font-size: 1.1rem;">${formatRupiah(summary.totalUangDikirimDskt)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    ` : ''}

    <!-- KONTEN SUB-TAB 2: LAPORAN KEUANGAN (EXECUTIVE SUMMARY / MAJELIS) -->
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

    <!-- KONTEN SUB-TAB 3: LAPORAN PERSENTASE & ANALISIS -->
    ${activeTab === 'persentase' ? `
      <div class="glass-card print-hidden" style="margin-bottom: 24px;">
        <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--accent-gold)); margin-bottom: 6px;">3. Laporan Analisis Persentase & Proporsi Dana</h4>
        <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 0;">
          Analisis persentase alokasi sumber dana masuk serta proporsi pembagian pengeluaran pada setiap departemen pelayanan.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <!-- Card 1: Proporsi Sumber Pemasukan -->
        <div class="glass-card">
          <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--accent-blue)); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="trending-up" style="width: 18px; height: 18px;"></i> Proporsi Sumber Pemasukan
          </h4>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                <span>Persepuluhan (100% DSKT)</span>
                <span style="color: hsl(var(--danger));">${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalPersepuluhan)})</span>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 6px; overflow: hidden;">
                <div style="background: hsl(var(--danger)); width: ${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.5s ease;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                <span>Persembahan Terpadu (50/50)</span>
                <span style="color: hsl(var(--text-primary));">${((totalTerpadu / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalTerpadu)})</span>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 6px; overflow: hidden;">
                <div style="background: hsl(var(--accent-blue)); width: ${((totalTerpadu / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.5s ease;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                <span>Persembahan Khusus (Gereja)</span>
                <span style="color: hsl(var(--success));">${((totalKhusus / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalKhusus)})</span>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 6px; overflow: hidden;">
                <div style="background: hsl(var(--success)); width: ${((totalKhusus / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.5s ease;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                <span>Persembahan Pembangunan</span>
                <span style="color: hsl(var(--accent-gold));">${((totalPembangunan / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalPembangunan)})</span>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 6px; overflow: hidden;">
                <div style="background: hsl(var(--accent-gold)); width: ${((totalPembangunan / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.5s ease;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                <span>Lain-lain</span>
                <span style="color: hsl(var(--text-muted));">${((totalLain / totalMasuk) * 100).toFixed(1)}% (${formatRupiah(totalLain)})</span>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 6px; overflow: hidden;">
                <div style="background: hsl(var(--text-muted)); width: ${((totalLain / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.5s ease;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Alokasi Hak Dana -->
        <div class="glass-card">
          <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--accent-gold)); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="shield" style="width: 18px; height: 18px;"></i> Alokasi Pembagian Hak Dana Masuk
          </h4>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); padding: 14px; border-radius: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; color: hsl(var(--danger)); font-size: 0.9rem;">1. Hak DSKT (Konferens/Daerah)</span>
                <span style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--danger));">${((totalHakDskt / totalMasuk) * 100).toFixed(1)}%</span>
              </div>
              <div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); margin-top: 4px;">
                100% Persepuluhan + 50% Persembahan Terpadu (${formatRupiah(totalHakDskt)})
              </div>
            </div>

            <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); padding: 14px; border-radius: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; color: hsl(var(--success)); font-size: 0.9rem;">2. Hak Kas Lokal Gereja</span>
                <span style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--success));">${((totalHakGereja / totalMasuk) * 100).toFixed(1)}%</span>
              </div>
              <div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); margin-top: 4px;">
                50% Terpadu + Khusus + Lain-lain (${formatRupiah(totalHakGereja)})
              </div>
            </div>

            <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); padding: 14px; border-radius: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; color: hsl(var(--accent-blue)); font-size: 0.9rem;">3. Hak Kas Pembangunan</span>
                <span style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--accent-blue));">${((totalHakPembangunan / totalMasuk) * 100).toFixed(1)}%</span>
              </div>
              <div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); margin-top: 4px;">
                100% Persembahan Pembangunan (${formatRupiah(totalHakPembangunan)})
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Proporsi Pengeluaran per Departemen -->
      <div class="glass-card">
        <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--danger)); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="bar-chart-2" style="width: 18px; height: 18px;"></i> Persentase Pengeluaran per Departemen (Peringkat Pos Terbesar)
        </h4>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${deptList.map(d => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 4px;">
                <span>${d.name}</span>
                <span style="color: hsl(var(--danger));">${d.percent}% (${formatRupiah(d.amount)})</span>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #ef4444, #f97316); width: ${d.percent}%; height: 100%; transition: width 0.5s ease;"></div>
              </div>
            </div>
          `).join('')}
          ${deptList.length === 0 ? `<div style="text-align: center; padding: 24px; color: hsl(var(--text-muted));">Belum ada data pengeluaran yang tercatat untuk dianalisis.</div>` : ''}
        </div>
      </div>
    ` : ''}

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
      
      const jemaatName = state.settings?.churchName || "JEMAAT TERATAI BATAM";
      const ketuaName = state.settings?.ketuaJemaat || "Gerhard Panjaitan";
      const gembalaName = state.settings?.gembalaJemaat || "Pdt. Edisyaputra ginting";
      const bendaharaName = state.settings?.bendaharaName || "Reynold Pandiangan";
      
      const lastDay = new Date(dYear, dMonthNum, 0);
      const dateStr = formatDateIndo(lastDay);
      
      return \`
        <div class="glass-card print-hidden" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
          <div>
            <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--text-primary));">5. Laporan Penerimaan DSKT</h4>
            <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 0;">Pilih bulan laporan untuk mencetak form resmi pengiriman DSKT.</p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <select class="form-control" id="dskt-month" style="width: 140px; padding: 10px 16px;">
              \${Array.from({length: 12}, (_, i) => {
                const mStr = String(i + 1).padStart(2, '0');
                const mName = new Date(2000, i, 1).toLocaleString('id-ID', {month: 'long'});
                return \\\`<option value="\${mStr}" \${mStr === dMonthStr ? 'selected' : ''}>\${mName}</option>\\\`;
              }).join('')}
            </select>
            <select class="form-control" id="dskt-year" style="width: 100px; padding: 10px 16px;">
              \${availableYears.map(y => \\\`<option value="\${y}" \${y === dYear ? 'selected' : ''}>\${y}</option>\\\`).join('')}
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
            <div>GMAHK \${jemaatName}</div>
            <div>LAPORAN PENERIMAAN</div>
            <div>\${dateStr}</div>
          </div>
          
          <div style="font-weight: bold; text-decoration: underline; margin-bottom: 4px; font-size: 14px; text-transform: uppercase;">PENJELASAN</div>
          
          <table>
            <thead>
              <tr>
                <th rowspan="2">Keterangan</th>
                <th rowspan="2">Jumlah<br>(Rp)</th>
                <th rowspan="2">Ke<br>Konf/Daerah<br>(Rp)</th>
                <th rowspan="2">Ke Kas Jemaat<br>\${jemaatName}<br>(Rp)</th>
                <th>Pembangunan<br>\${jemaatName}</th>
                <th>Project<br>\${jemaatName}</th>
                <th rowspan="2">Lain-lain<br>(Rp)</th>
              </tr>
              <tr>
                <th>(Rp)</th>
                <th>(Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TTL Perpuluhan <span style="float: right;">\${unitPerpuluhan} Unit Pemberi</span></td>
                <td class="right">\${formatAngka(totalPerpuluhan)}</td>
                <td class="right">\${formatAngka(totalPerpuluhan)}</td>
                <td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>TTL Pers Terpadu <span style="float: right;">\${unitTerpadu} Unit Pemberi</span></td>
                <td class="right">\${formatAngka(totalTerpadu)}</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;- Konf./Daerah 50%</td>
                <td></td>
                <td class="right">\${formatAngka(terpaduKonf)}</td>
                <td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;- Jemaat 50%</td>
                <td></td><td></td>
                <td class="right">\${formatAngka(terpaduJemaat)}</td>
                <td></td><td></td><td></td>
              </tr>
              <tr>
                <td class="bold">Persembahan AWR & Radio /Daerah</td>
                <td class="right">-</td><td class="right">-</td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>TTL Pers Khusus Jemaat <span style="float: right;">\${unitKhusus} Unit Pemberi</span></td>
                <td class="right">\${formatAngka(totalKhusus)}</td>
                <td></td>
                <td class="right">\${formatAngka(totalKhusus)}</td>
                <td></td><td></td><td></td>
              </tr>
              <tr>
                <td>TTL Pers. Khusus Pembangunan <span style="float: right;">\${unitPembangunan} Unit Pemberi</span></td>
                <td class="right">\${formatAngka(totalPembangunan)}</td>
                <td></td><td></td>
                <td class="right">\${formatAngka(totalPembangunan)}</td>
                <td></td><td></td>
              </tr>
              <tr>
                <td>TTL Pers. Project Gereja <span style="float: right;">0 Unit Pemberi</span></td>
                <td class="right">-</td><td></td><td></td><td></td><td class="right">-</td><td></td>
              </tr>
              <tr>
                <td>TTL Pers. Lain-lain <span style="float: right;">\${unitLain} Unit Pemberi</span></td>
                <td class="right">\${formatAngka(totalLain)}</td>
                <td></td><td></td><td></td><td></td>
                <td class="right">\${formatAngka(totalLain)}</td>
              </tr>
              <tr class="bold" style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                <td class="center">Total Keseluruhan Rp.</td>
                <td class="right">\${formatAngka(totalAll)}</td>
                <td class="right">\${formatAngka(totalKonf)}</td>
                <td class="right">\${formatAngka(totalJemaat)}</td>
                <td class="right">\${formatAngka(totalPembangunan)}</td>
                <td class="right">-</td>
                <td class="right">\${formatAngka(totalLain)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="font-weight: bold; text-decoration: underline; margin-bottom: 4px; font-size: 14px; text-transform: uppercase;">IKHTISAR</div>
          
          <table>
            <tbody>
              <tr>
                <td>Jumlah yang dikirim ke Konferens/Daerah (Perpuluhan 100% + 50% dari Total Pers. Terpadu)</td>
                <td class="right bold" style="width: 150px;">\${formatAngka(totalKonf)}</td>
              </tr>
              <tr>
                <td>Jumlah Dana untuk Kas Gereja (Pers. Khusus Jemaat 100% + 50% dari TTL Pers. Terpadu)</td>
                <td class="right bold">\${formatAngka(totalJemaat)}</td>
              </tr>
              <tr>
                <td>Jumlah Dana untuk Pembangunan Gereja</td>
                <td class="right bold">\${formatAngka(totalPembangunan)}</td>
              </tr>
              <tr>
                <td>Jumlah Dana untuk Project</td>
                <td class="right bold">-</td>
              </tr>
              <tr>
                <td>Jumlah Dana Lain-lain</td>
                <td class="right bold">\${formatAngka(totalLain)}</td>
              </tr>
              <tr style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                <td class="bold">TOTAL KESELURUHAN</td>
                <td class="right bold">\${formatAngka(totalAll)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 10px; font-size: 14px; display: flex; gap: 8px;">
            <div style="white-space: nowrap;">Terbilang <span style="margin-left: 20px;"></span> </div>
            <div class="bold" style="font-style: italic;">\${angkaTerbilang(totalAll)}</div>
          </div>
          
          <table class="no-border" style="margin-top: 40px;">
            <tr>
              <td class="center" style="width: 33%;">
                <div>Dibuat Oleh :</div>
                <div style="margin-top: 80px; font-weight: bold; text-decoration: underline;">\${bendaharaName}</div>
                <div>Bendahara Jemaat</div>
              </td>
              <td class="center" style="width: 33%;">
                <div>Diperiksa,</div>
                <div style="margin-top: 80px; font-weight: bold; text-decoration: underline;">\${ketuaName}</div>
                <div>Ketua Jemaat</div>
              </td>
              <td class="center" style="width: 33%;">
                <div>Disetujui</div>
                <div style="margin-top: 80px; font-weight: bold; text-decoration: underline;">\${gembalaName}</div>
                <div>Gembala Jemaat</div>
              </td>
            </tr>
          </table>
          
        </div>
      \`;
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

  // Tab Switching Handlers
  container.querySelector('#tab-btn-excel')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'excel', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter);
  });
  container.querySelector('#tab-btn-keuangan')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'keuangan', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter);
  });
  container.querySelector('#tab-btn-persentase')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'persentase', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter);
  });
  container.querySelector('#tab-btn-transmital')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'transmital', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter);
  });
  container.querySelector('#tab-btn-dskt')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'dskt', transYear, transMonth, transType, keuanganMode, keuanganYear, keuanganQuarter);
  });

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

  // Print Handlers
  container.querySelector('#btn-print-report')?.addEventListener('click', () => window.print());
  container.querySelector('#btn-print-keuangan')?.addEventListener('click', () => window.print());

  // Export Excel Handler
  container.querySelector('#btn-export-excel')?.addEventListener('click', () => {
    if (!window.XLSX) {
      showToast("Library Excel (SheetJS) sedang dimuat, coba beberapa detik lagi.", "warning");
      return;
    }

    try {
      const wb = window.XLSX.utils.book_new();

      // 1. Sheet Pemasukan
      const rowsMasuk = pemasukanList.map(i => {
        const c = calculateIncomeBreakdown(i);
        return {
          "ID Transaksi": i.id,
          "Tanggal": i.date,
          "No. Kuitansi": i.receiptNo,
          "Nama Anggota": i.memberName,
          "Persepuluhan (DSKT)": i.persepuluhan,
          "Pers. Terpadu (Total)": i.persembahanTerpadu,
          "50% Masuk Kas Gereja": c.gerejaFromTerpadu,
          "50% Masuk Kas DSKT": c.kasDskt - i.persepuluhan,
          "Pers. Khusus (Gereja)": i.persembahanKhusus,
          "Pers. Pembangunan": i.persembahanPembangunan,
          "Lain-lain": i.lainLain,
          "Total Pemasukan": c.total,
          "Catatan": i.notes
        };
      });
      const wsMasuk = window.XLSX.utils.json_to_sheet(rowsMasuk);
      window.XLSX.utils.book_append_sheet(wb, wsMasuk, "Sheet Pemasukan");

      // 2. Sheet Pengeluaran
      const rowsKeluar = pengeluaranList.map(i => ({
        "ID Transaksi": i.id,
        "Tanggal": i.date,
        "Kategori Departemen": i.departmentName,
        "Keterangan / Uraian": i.description,
        "Jumlah Pengeluaran": i.amount,
        "No. Voucher": i.voucherNo,
        "Kas Pembangunan?": i.isBuildingFund ? "Ya (Pembangunan)" : "Kas Jemaat"
      }));
      const wsKeluar = window.XLSX.utils.json_to_sheet(rowsKeluar);
      window.XLSX.utils.book_append_sheet(wb, wsKeluar, "Sheet Pengeluaran");

      // 3. Sheet Kirim DSKT
      const rowsDskt = kirimList.map(i => ({
        "ID Transaksi": i.id,
        "Tanggal Kirim": i.date,
        "Jumlah Dikirim ke DSKT": i.amount,
        "No. Referensi / Bank": i.referenceNo,
        "Catatan": i.notes
      }));
      const wsDskt = window.XLSX.utils.json_to_sheet(rowsDskt);
      window.XLSX.utils.book_append_sheet(wb, wsDskt, "Sheet Kirim DSKT");

      // 4. Sheet Kirim Pembangunan
      const rowsPemb = kirimPembList.map(i => ({
        "ID Transaksi": i.id,
        "Tanggal Kirim": i.date,
        "Jumlah Dikirim": i.amount,
        "No. Referensi / Bank": i.referenceNo,
        "Catatan": i.notes
      }));
      const wsPemb = window.XLSX.utils.json_to_sheet(rowsPemb);
      window.XLSX.utils.book_append_sheet(wb, wsPemb, "Sheet Kirim Pembangunan");

      window.XLSX.writeFile(wb, `Laporan_Bendahara_GMAHK_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast("Laporan berhasil diekspor menjadi file Excel (.xlsx) dengan pemisahan sheet!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal mengekspor ke Excel: " + err.message, "danger");
    }
  });
}
