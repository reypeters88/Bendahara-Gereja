/**
 * Tampilan Laporan Keuangan Resmi GMAHK & Ekspor Excel (Pisah Tabel Pemasukan & Pengeluaran)
 */
import { calculateFinancialSummary, calculateIncomeBreakdown, formatRupiah, formatDateIndo } from '../calculations.js';

export function renderLaporan(container, state, showToast) {
  const summary = calculateFinancialSummary(state);
  const pemasukanList = state.pemasukan || [];
  const pengeluaranList = state.pengeluaran || [];
  const kirimList = state.kirimDskt || [];

  container.innerHTML = `
    <!-- Header Controls & Print/Export Actions -->
    <div class="glass-card" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--text-primary));">Laporan Keuangan Bendahara Jemaat</h3>
        <p style="font-size: 0.85rem; color: hsl(var(--text-secondary));">
          Siap dicetak untuk Rapat Majelis Jemaat (Church Board) atau diekspor ke Excel / Google Sheets.
        </p>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-print-report" style="padding: 10px 18px;">
          <i data-lucide="printer"></i>
          <span>Cetak Laporan Majelis (Print)</span>
        </button>

        <button class="btn btn-primary" id="btn-export-excel" style="padding: 10px 18px; background: linear-gradient(135deg, #16a34a, #15803d);">
          <i data-lucide="file-spreadsheet"></i>
          <span>Ekspor ke Excel (Pisah Sheet Masuk/Keluar)</span>
        </button>
      </div>
    </div>

    <!-- Printable Report Container -->
    <div id="print-report-container">
      <!-- Kop Laporan Resmi -->
      <div style="text-align: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid var(--border-highlight);">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: hsl(var(--text-primary)); letter-spacing: 0.05em; text-transform: uppercase;">
          GEREJA MASEHI ADVENT HARI KETUJUH (GMAHK)
        </h2>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: hsl(var(--accent-gold)); margin-top: 4px;">
          ${state.settings.churchName || 'Jemaat Pusat'}
        </h3>
        <div style="font-size: 0.9rem; color: hsl(var(--text-secondary));">${state.settings.districtName || 'DSKT'}</div>
        <div style="font-size: 0.85rem; color: hsl(var(--text-muted)); margin-top: 4px;">
          Laporan Arus Kas Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <!-- Ringkasan Arus Kas -->
      <div class="stats-grid" style="margin-bottom: 30px;">
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
          <h3 style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--accent-blue));">
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
                <td style="color: hsl(var(--danger));">${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persepuluhan)||0), 0))}</td>
                <td>${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persembahanTerpadu)||0), 0))}</td>
                <td style="color: hsl(var(--success));">${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persembahanKhusus)||0), 0))}</td>
                <td style="color: hsl(var(--accent-blue));">${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.persembahanPembangunan)||0), 0))}</td>
                <td>${formatRupiah(pemasukanList.reduce((a, b) => a + (Number(b.lainLain)||0), 0))}</td>
                <td style="color: hsl(var(--accent-gold)); font-size: 1.1rem;">${formatRupiah(summary.totalUangMasuk)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- BAGIAN 2: TABEL PENGELUARAN -->
      <div class="glass-card" style="margin-bottom: 28px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(239, 68, 68, 0.4); padding-bottom: 12px;">
          <h3 style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--danger));">
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
                  <td style="font-weight: 800; color: hsl(var(--danger)); font-size: 1rem;">-${formatRupiah(item.amount)}</td>
                </tr>
              `).join('')}
              ${pengeluaranList.length === 0 ? `<tr><td colspan="5" style="text-align: center; padding: 30px;">Belum ada data pengeluaran.</td></tr>` : ''}
            </tbody>
            <tfoot>
              <tr style="background: rgba(0, 0, 0, 0.4); font-weight: 800;">
                <td colspan="4" style="text-align: right; padding: 16px;">TOTAL PENGELUARAN:</td>
                <td style="color: hsl(var(--danger)); font-size: 1.1rem;">-${formatRupiah(summary.totalPengeluaran)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- BAGIAN 3: TABEL PENGIRIMAN DSKT -->
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid rgba(245, 158, 11, 0.4); padding-bottom: 12px;">
          <h3 style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--warning));">
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
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelector('#btn-print-report')?.addEventListener('click', () => window.print());

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
          "No. Kuitansi": i.receiptNo,
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
