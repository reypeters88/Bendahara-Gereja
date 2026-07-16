/**
 * Tampilan & Logika Pengiriman Uang ke DSKT (Daerah / Konferens)
 * Mengontrol kewajiban titipan (100% Persepuluhan + 50% Pers. Terpadu) vs Uang yang sudah dikirim.
 */
import { calculateFinancialSummary, formatRupiah, formatDateIndo } from '../calculations.js';
import { addKirimDskt, deleteKirimDskt } from '../state.js';

export function renderKirimDskt(container, state, showToast) {
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

    <!-- DSKT Summary Banner -->
    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;">
      <div>
        <span class="badge badge-dskt" style="margin-bottom: 8px;">Kewajiban Konferens / Daerah (DSKT)</span>
        <h3 style="font-size: 1.5rem; font-weight: 800; color: hsl(var(--text-primary));">Status Titipan Dana DSKT</h3>
        <p style="color: hsl(var(--text-secondary)); font-size: 0.9rem; max-width: 600px; margin-top: 4px;">
          Sesuai aturan GMAHK, 100% Persepuluhan dan 50% Persembahan Terpadu adalah milik Daerah/Konferens yang harus disetorkan secara berkala oleh Bendahara Jemaat.
        </p>
      </div>

      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="background: rgba(0,0,0,0.35); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;">
          <div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">AKUMULASI TITIPAN DSKT</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--text-primary));">${formatRupiah(summary.saldoAwalDskt + summary.totalMasukDskt)}</div>
        </div>

        <div style="background: rgba(0,0,0,0.35); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: right;">
          <div style="font-size: 0.78rem; color: hsl(var(--text-muted)); font-weight: 600;">SUDAH DIKIRIM KE DSKT</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: hsl(var(--warning));">${formatRupiah(summary.totalUangDikirimDskt)}</div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.2); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid rgba(239,68,68,0.5); text-align: right;">
          <div style="font-size: 0.78rem; color: #fca5a5; font-weight: 700;">BELUM DISETOR (SISA TITIPAN)</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #ffffff;">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
      <!-- Form Input Pengiriman DSKT -->
      <div class="glass-card">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--warning)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <i data-lucide="send" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>
          Catat Setoran / Pengiriman Uang ke DSKT
        </h3>

        <form id="form-dskt">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Tanggal Setor / Transfer</label>
              <input type="date" class="form-control" id="tr-date" value="${today}" required />
            </div>
            <div class="form-group">
              <label class="form-label">No. Referensi / Bukti Bank</label>
              <input type="text" class="form-control" id="tr-ref" placeholder="Cth: TRX-BNI-8921" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nominal Setoran ke DSKT (Rp)</label>
            <input type="number" class="form-control" id="tr-amount" value="${Math.max(0, Math.round(summary.kewajibanDsktBelumDisetor))}" min="1000" step="1000" required style="font-size: 1.2rem; font-weight: 800; color: hsl(var(--warning));" />
            <span style="font-size: 0.78rem; color: hsl(var(--text-muted)); margin-top: 4px;">
              *Otomatis terisi sisa titipan saat ini, namun bisa disesuaikan jika setoran sebagian.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Catatan / Keterangan Setoran</label>
            <textarea class="form-control" id="tr-notes" rows="3" placeholder="Cth: Setoran Persepuluhan dan 50% Pers. Terpadu bulan Juli 2026 via transfer rekening DSKT" required></textarea>
          </div>

          <button type="submit" class="btn btn-gold" style="width: 100%; margin-top: 16px; padding: 14px; font-size: 1rem; justify-content: center;">
            <i data-lucide="check-circle"></i>
            <span>Simpan Bukti Pengiriman ke DSKT</span>
          </button>
        </form>
      </div>

      <!-- Riwayat Setoran DSKT -->
      <div class="glass-card">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">Riwayat Pengiriman Uang ke DSKT</h3>
        
        <div class="table-responsive" style="max-height: 550px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal & Ref</th>
                <th>Keterangan</th>
                <th>Jumlah Dikirim</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${kirimList.map(item => `
                <tr>
                  <td style="width: 28%;">
                    <div style="font-weight: 700;">${formatDateIndo(item.date)}</div>
                    <div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">Ref: ${item.referenceNo}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.88rem; color: hsl(var(--text-primary));">${item.notes}</div>
                  </td>
                  <td style="font-weight: 800; color: hsl(var(--warning)); width: 25%;">
                    ${formatRupiah(item.amount)}
                  </td>
                  <td style="text-align: center; width: 60px;">
                    <button class="icon-btn btn-del-dskt" data-id="${item.id}" title="Hapus Bukti Setoran" style="color: hsl(var(--danger));">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </td>
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
    renderKirimDskt(container, state, showToast);
  });

  container.querySelectorAll('.btn-del-dskt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm("Apakah Anda yakin ingin menghapus catatan pengiriman DSKT ini?")) {
        deleteKirimDskt(id);
        showToast("Bukti pengiriman berhasil dihapus.", "success");
        renderKirimDskt(container, state, showToast);
      }
    });
  });
}
