/**
 * Tampilan & Hub Pusat Laporan Keuangan GMAHK
 * Pilihan Sub-Menu: 1. Laporan & Expor Excel, 2. Laporan Keuangan, 3. Laporan Persentase
 */
import { calculateFinancialSummary, calculateIncomeBreakdown, formatRupiah, formatDateIndo } from '../calculations.js';

export function renderLaporan(container, state, showToast, activeTab = 'excel') {
  const summary = calculateFinancialSummary(state);
  const pemasukanList = state.pemasukan || [];
  const pengeluaranList = state.pengeluaran || [];
  const kirimList = state.kirimDskt || [];

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
    <!-- Header Navigasi Sub-Menu Laporan -->
    <div class="glass-card" style="margin-bottom: 24px; padding: 20px 24px;">
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 1.35rem; font-weight: 800; color: hsl(var(--text-primary)); display: flex; align-items: center; gap: 8px;">
          <i data-lucide="file-spreadsheet" style="color: hsl(var(--accent-gold));"></i> Lembaran Pusat Laporan Jemaat
        </h3>
        <p style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin: 4px 0 0 0;">
          Pilih lembaran atau jenis laporan di bawah ini untuk melihat tabel rincian, ringkasan majelis, atau analisis persentase perbendaharaan.
        </p>
      </div>

      <!-- 3 Pilihan Menu Sub-Tab -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 16px;">
        <button type="button" class="btn ${activeTab === 'excel' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-excel" style="flex: 1; min-width: 210px; justify-content: flex-start; padding: 14px 16px; border-radius: 12px;">
          <i data-lucide="table" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
          <div style="text-align: left; overflow: hidden;">
            <div style="font-weight: 800; font-size: 0.95rem; white-space: nowrap;">1. Laporan & Expor Excel</div>
            <div style="font-size: 0.72rem; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Tabel Masuk/Keluar & Download Excel</div>
          </div>
        </button>

        <button type="button" class="btn ${activeTab === 'keuangan' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-keuangan" style="flex: 1; min-width: 210px; justify-content: flex-start; padding: 14px 16px; border-radius: 12px;">
          <i data-lucide="file-text" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
          <div style="text-align: left; overflow: hidden;">
            <div style="font-weight: 800; font-size: 0.95rem; white-space: nowrap;">2. Laporan Keuangan</div>
            <div style="font-size: 0.72rem; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Ringkasan Eksekutif untuk Majelis & Jemaat</div>
          </div>
        </button>

        <button type="button" class="btn ${activeTab === 'persentase' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-persentase" style="flex: 1; min-width: 210px; justify-content: flex-start; padding: 14px 16px; border-radius: 12px;">
          <i data-lucide="pie-chart" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
          <div style="text-align: left; overflow: hidden;">
            <div style="font-weight: 800; font-size: 0.95rem; white-space: nowrap;">3. Laporan Persentase</div>
            <div style="font-size: 0.72rem; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Analisis Alokasi & Proporsi Departemen</div>
          </div>
        </button>
      </div>
    </div>

    <!-- KONTEN SUB-TAB 1: LAPORAN & EKSPOR EXCEL -->
    ${activeTab === 'excel' ? `
      <div class="glass-card" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
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
    ${activeTab === 'keuangan' ? `
      <div class="glass-card" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
        <div>
          <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--text-primary));">2. Laporan Keuangan Majelis & Pengumuman Jemaat</h4>
          <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 0;">
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

      <div class="glass-card" id="printable-financial-sheet" style="padding: 36px; background: rgba(15, 23, 42, 0.95); border: 1px solid var(--border-highlight);">
        <!-- Kop Resmi -->
        <div style="text-align: center; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 2px solid var(--border-highlight);">
          <h2 style="font-size: 1.45rem; font-weight: 800; color: hsl(var(--text-primary)); letter-spacing: 0.05em; margin: 0;">
            GEREJA MASEHI ADVENT HARI KETUJUH (GMAHK)
          </h2>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-gold)); margin: 6px 0 2px 0;">
            ${state.settings.churchName || 'Jemaat Pusat'}
          </h3>
          <div style="font-size: 0.88rem; color: hsl(var(--text-secondary));">${state.settings.districtName || 'Daerah / Konferens DSKT'}</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: hsl(var(--accent-blue)); margin-top: 6px;">
            LAPORAN PERBENDAHARAAN & ARUS KAS JEMAAT — PERIODE: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        <!-- A. SALDO AWAL -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--accent-gold)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">
            A. POSISI SALDO AWAL PERIODE
          </h4>
          <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0;">1. Saldo Awal Kas Operasional Gereja</td>
              <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatRupiah(summary.saldoAwalGereja)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">2. Saldo Awal Kas Pembangunan</td>
              <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatRupiah(summary.saldoAwalPembangunan)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">3. Saldo Awal Titipan DSKT Belum Disetor</td>
              <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatRupiah(summary.saldoAwalDskt)}</td>
            </tr>
            <tr style="border-top: 1px solid var(--border-color); font-weight: 800;">
              <td style="padding: 8px 0;">SUBTOTAL SALDO AWAL KESELURUHAN</td>
              <td style="text-align: right; color: hsl(var(--accent-gold)); font-size: 1rem;">${formatRupiah(summary.saldoAwalGereja + summary.saldoAwalPembangunan + summary.saldoAwalDskt)}</td>
            </tr>
          </table>
        </div>

        <!-- B. PENERIMAAN / PEMASUKAN DANA -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--success)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">
            B. PENERIMAAN / PEMASUKAN DANA PERIODE INI
          </h4>
          <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0;">1. Persepuluhan (100% Hak DSKT)</td>
              <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatRupiah(totalPersepuluhan)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">2. Persembahan Terpadu (50% Grj / 50% DSKT)</td>
              <td style="text-align: right; font-weight: 600; color: hsl(var(--text-primary));">${formatRupiah(totalTerpadu)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">3. Persembahan Khusus (100% Kas Gereja)</td>
              <td style="text-align: right; font-weight: 600; color: hsl(var(--success));">${formatRupiah(totalKhusus)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">4. Persembahan Pembangunan (100% Kas Pembangunan)</td>
              <td style="text-align: right; font-weight: 600; color: hsl(var(--accent-blue));">${formatRupiah(totalPembangunan)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">5. Pemasukan Lain-lain</td>
              <td style="text-align: right; font-weight: 600;">${formatRupiah(totalLain)}</td>
            </tr>
            <tr style="border-top: 1px solid var(--border-color); font-weight: 800;">
              <td style="padding: 8px 0;">SUBTOTAL PEMASUKAN PERIODE INI</td>
              <td style="text-align: right; color: hsl(var(--success)); font-size: 1rem;">${formatRupiah(summary.totalUangMasuk)}</td>
            </tr>
          </table>
        </div>

        <!-- C. PENGELUARAN OPERASIONAL -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--danger)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">
            C. PENGELUARAN DANA OPERASIONAL & DEPARTEMEN
          </h4>
          <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
            ${deptList.map(d => `
              <tr>
                <td style="padding: 6px 0;">• ${d.name}</td>
                <td style="text-align: right; font-weight: 600; color: hsl(var(--danger));">${formatRupiah(d.amount)}</td>
              </tr>
            `).join('')}
            ${deptList.length === 0 ? `<tr><td colspan="2" style="padding: 12px 0; text-align: center; color: hsl(var(--text-muted));">Belum ada pengeluaran periode ini.</td></tr>` : ''}
            <tr style="border-top: 1px solid var(--border-color); font-weight: 800;">
              <td style="padding: 8px 0;">SUBTOTAL PENGELUARAN PERIODE INI</td>
              <td style="text-align: right; color: hsl(var(--danger)); font-size: 1rem;">${formatRupiah(summary.totalPengeluaran)}</td>
            </tr>
          </table>
        </div>

        <!-- D. PENGIRIMAN DANA TITIPAN DSKT -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: hsl(var(--warning)); border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">
            D. SETORAN / PENGIRIMAN KE REKENING DSKT
          </h4>
          <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0;">Total Dana Titipan Disetor ke Konferens/Daerah (Periode Ini)</td>
              <td style="text-align: right; font-weight: 700; color: hsl(var(--warning));">${formatRupiah(summary.totalUangDikirimDskt)}</td>
            </tr>
          </table>
        </div>

        <!-- E. POSISI KAS AKHIR -->
        <div style="background: rgba(212, 175, 55, 0.12); border: 2px solid hsl(var(--accent-gold)); border-radius: var(--radius-md); padding: 20px; margin-top: 16px;">
          <h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--accent-gold)); margin: 0 0 14px 0; border-bottom: 1px solid rgba(212,175,55,0.4); padding-bottom: 8px;">
            E. REKAPITULASI SALDO KAS AKHIR JEMAAT
          </h4>
          <table style="width: 100%; font-size: 0.95rem; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">1. Saldo Kas Operasional Gereja</td>
              <td style="text-align: right; font-weight: 700; color: hsl(var(--success));">${formatRupiah(summary.saldoKasGereja)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">2. Saldo Kas Pembangunan</td>
              <td style="text-align: right; font-weight: 700; color: hsl(var(--accent-blue));">${formatRupiah(summary.saldoKasPembangunan)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">3. Titipan DSKT Belum Disetor (Kewajiban Kirim)</td>
              <td style="text-align: right; font-weight: 700; color: hsl(var(--danger));">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</td>
            </tr>
            <tr style="border-top: 2px solid hsl(var(--accent-gold)); font-size: 1.2rem; font-weight: 800;">
              <td style="padding: 14px 0 4px 0; color: hsl(var(--accent-gold));">SISA SALDO KAS KESELURUHAN (UANG FISIK/BANK):</td>
              <td style="padding: 14px 0 4px 0; text-align: right; color: hsl(var(--accent-gold));">${formatRupiah(summary.sisaSaldoTotal)}</td>
            </tr>
          </table>
        </div>

        <!-- Tanda Tangan -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px; text-align: center; font-size: 0.9rem;">
          <div>
            <div>Mengetahui / Menyetujui:</div>
            <div style="font-weight: 700; margin-top: 4px;">Gembala Jemaat / Pendeta</div>
            <div style="height: 70px;"></div>
            <div style="border-bottom: 1px solid var(--border-color); display: inline-block; min-width: 200px; font-weight: 700;">
               ( ................................................ )
            </div>
          </div>
          <div>
            <div>Dibuat Oleh:</div>
            <div style="font-weight: 700; margin-top: 4px;">Bendahara Jemaat</div>
            <div style="height: 70px;"></div>
            <div style="border-bottom: 1px solid var(--border-color); display: inline-block; min-width: 200px; font-weight: 700;">
              ${state.settings.treasurerName || '( ................................................ )'}
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- KONTEN SUB-TAB 3: LAPORAN PERSENTASE & ANALISIS -->
    ${activeTab === 'persentase' ? `
      <div class="glass-card" style="margin-bottom: 24px;">
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
  `;

  if (window.lucide) window.lucide.createIcons();

  // Tab Switching Handlers
  container.querySelector('#tab-btn-excel')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'excel');
  });
  container.querySelector('#tab-btn-keuangan')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'keuangan');
  });
  container.querySelector('#tab-btn-persentase')?.addEventListener('click', () => {
    renderLaporan(container, state, showToast, 'persentase');
  });

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
        "No. Referensi": i.referenceNo,
        "Catatan": i.notes
      }));
      const wsDskt = window.XLSX.utils.json_to_sheet(rowsDskt);
      window.XLSX.utils.book_append_sheet(wb, wsDskt, "Sheet Kirim DSKT");

      window.XLSX.writeFile(wb, `Laporan_Bendahara_GMAHK_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast("Laporan berhasil diekspor menjadi file Excel (.xlsx) dengan pemisahan sheet!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal mengekspor ke Excel: " + err.message, "danger");
    }
  });
}
