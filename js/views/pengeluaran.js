/**
 * Tampilan & Logika Pencatatan Pengeluaran (30 Kategori Departemen GMAHK)
 */
import { EXPENDITURE_DEPARTMENTS } from '../departments.js';
import { addPengeluaran, deletePengeluaran, formatRupiah, formatDateIndo } from '../state.js';

export function renderPengeluaran(container, state, showToast) {
  const pengeluaranList = state.pengeluaran || [];
  const today = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
      <!-- Form Input Pengeluaran -->
      <div class="glass-card">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--danger)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <i data-lucide="minus-circle" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>
          Input Pengeluaran Departemen
        </h3>

        <form id="form-pengeluaran">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Tanggal Pengeluaran</label>
              <input type="date" class="form-control" id="ex-date" value="${today}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Voucher / Bukti Kuitansi</label>
              <input type="text" class="form-control" id="ex-voucher" placeholder="Cth: VK-201" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Pilih Kategori Departemen / Pos Pengeluaran (30 Resmi)</label>
            <select class="form-control" id="ex-dept" required style="font-weight: 600;">
              ${EXPENDITURE_DEPARTMENTS.map(d => `<option value="${d.id}">${d.id}. ${d.name} (${d.category})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Nominal Pengeluaran (Rp)</label>
            <input type="number" class="form-control" id="ex-amount" placeholder="0" min="1000" step="1000" required style="font-size: 1.15rem; font-weight: 700; color: hsl(var(--danger));" />
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan / Uraian Pengeluaran</label>
            <textarea class="form-control" id="ex-desc" rows="3" placeholder="Cth: Pembelian bahan makanan & perlawatan anggota sakit di RS Teratai" required></textarea>
          </div>

          <div class="form-group" style="flex-direction: row; align-items: center; gap: 10px; background: rgba(59,130,246,0.08); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(59,130,246,0.2);">
            <input type="checkbox" id="ex-building" style="width: 18px; height: 18px; cursor: pointer;" />
            <label for="ex-building" style="font-size: 0.88rem; cursor: pointer; color: hsl(var(--text-primary)); font-weight: 600;">
              Ambil dari Kas Pembangunan (Centang jika pengeluaran khusus konstruksi/proyek fisik jemaat)
            </label>
          </div>

          <button type="submit" class="btn btn-danger" style="width: 100%; margin-top: 20px; padding: 14px; font-size: 1rem; justify-content: center;">
            <i data-lucide="save"></i>
            <span>Simpan Pengeluaran</span>
          </button>
        </form>
      </div>

      <!-- Riwayat Pengeluaran -->
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h3 style="font-size: 1.15rem; font-weight: 700;">Riwayat Pengeluaran Terakhir</h3>
          <span class="badge" style="background: rgba(239,68,68,0.15); color: hsl(var(--danger));">Total: ${pengeluaranList.length} Transaksi</span>
        </div>

        <div class="table-responsive" style="max-height: 650px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal & Voucher</th>
                <th>Departemen & Keterangan</th>
                <th>Nominal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${pengeluaranList.map(item => `
                <tr>
                  <td style="width: 25%;">
                    <div style="font-weight: 600;">${formatDateIndo(item.date)}</div>
                    <div style="font-size: 0.78rem; color: hsl(var(--text-secondary));">Voucher: ${item.voucherNo}</div>
                    ${item.isBuildingFund ? `<span class="badge badge-pembangunan" style="margin-top: 4px;">Kas Pembangunan</span>` : `<span class="badge badge-gereja" style="margin-top: 4px;">Kas Jemaat</span>`}
                  </td>
                  <td>
                    <div style="font-weight: 700; color: hsl(var(--text-primary));">${item.departmentName}</div>
                    <div style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin-top: 2px;">${item.description}</div>
                  </td>
                  <td style="font-weight: 800; color: hsl(var(--danger)); width: 22%;">
                    -${formatRupiah(item.amount)}
                  </td>
                  <td style="text-align: center; width: 60px;">
                    <button class="icon-btn btn-del-keluar" data-id="${item.id}" title="Hapus Pengeluaran" style="color: hsl(var(--danger));">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </td>
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

  container.querySelector('#form-pengeluaran')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const deptSelect = container.querySelector('#ex-dept');
    const deptId = deptSelect.value;
    const deptName = deptSelect.options[deptSelect.selectedIndex].text.replace(/^\d+\.\s*/, '').split(' (')[0];

    const entry = {
      date: container.querySelector('#ex-date').value,
      voucherNo: container.querySelector('#ex-voucher').value,
      departmentId: Number(deptId),
      departmentName: deptName,
      amount: container.querySelector('#ex-amount').value,
      description: container.querySelector('#ex-desc').value,
      isBuildingFund: container.querySelector('#ex-building').checked
    };

    addPengeluaran(entry);
    showToast(`Pengeluaran untuk "${entry.departmentName}" berhasil disimpan!`, "success");
    renderPengeluaran(container, state, showToast);
  });

  container.querySelectorAll('.btn-del-keluar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm("Apakah Anda yakin ingin menghapus catatan pengeluaran ini?")) {
        deletePengeluaran(id);
        showToast("Pengeluaran berhasil dihapus.", "success");
        renderPengeluaran(container, state, showToast);
      }
    });
  });
}
