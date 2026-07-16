/**
 * Tampilan Dashboard Utama
 */
import { calculateFinancialSummary, renderRumusArusKasBanner, formatRupiah, formatDateIndo } from '../calculations.js';

let chartInstance = null;

export function renderDashboard(container, state, navigateTo) {
  const summary = calculateFinancialSummary(state);

  container.innerHTML = `
    <!-- Cash Flow Formula Banner -->
    ${renderRumusArusKasBanner(summary)}

    <!-- Financial Cards Grid -->
    <div class="stats-grid">
      <div class="stat-card" style="--stat-glow: rgba(34, 197, 94, 0.2); --icon-bg: rgba(34, 197, 94, 0.15); --icon-color: hsl(var(--success));">
        <div class="stat-header">
          <span class="stat-title">Saldo Kas Gereja (Operasional)</span>
          <div class="stat-icon"><i data-lucide="home"></i></div>
        </div>
        <div class="stat-value">${formatRupiah(summary.saldoKasGereja)}</div>
        <div class="stat-desc">
          <i data-lucide="info" style="width: 14px; height: 14px;"></i>
          <span>50% Pers. Terpadu + Pers. Khusus + Lainnya</span>
        </div>
      </div>

      <div class="stat-card" style="--stat-glow: rgba(59, 130, 246, 0.2); --icon-bg: rgba(59, 130, 246, 0.15); --icon-color: hsl(var(--accent-blue));">
        <div class="stat-header">
          <span class="stat-title">Saldo Kas Pembangunan</span>
          <div class="stat-icon"><i data-lucide="hammer"></i></div>
        </div>
        <div class="stat-value">${formatRupiah(summary.saldoKasPembangunan)}</div>
        <div class="stat-desc">
          <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: hsl(var(--accent-blue));"></i>
          <span>100% Persembahan Pembangunan Jemaat</span>
        </div>
      </div>

      <div class="stat-card" style="--stat-glow: rgba(239, 68, 68, 0.2); --icon-bg: rgba(239, 68, 68, 0.15); --icon-color: hsl(var(--danger));">
        <div class="stat-header">
          <span class="stat-title">Kewajiban DSKT Belum Disetor</span>
          <div class="stat-icon"><i data-lucide="send"></i></div>
        </div>
        <div class="stat-value">${formatRupiah(summary.kewajibanDsktBelumDisetor)}</div>
        <div class="stat-desc">
          <i data-lucide="alert-circle" style="width: 14px; height: 14px; color: hsl(var(--danger));"></i>
          <span>100% Persepuluhan + 50% Pers. Terpadu</span>
        </div>
      </div>

      <div class="stat-card" style="--stat-glow: rgba(245, 158, 11, 0.2); --icon-bg: rgba(245, 158, 11, 0.15); --icon-color: hsl(var(--accent-gold));">
        <div class="stat-header">
          <span class="stat-title">Total Uang Masuk (Periode Ini)</span>
          <div class="stat-icon"><i data-lucide="trending-up"></i></div>
        </div>
        <div class="stat-value">${formatRupiah(summary.totalUangMasuk)}</div>
        <div class="stat-desc">
          <i data-lucide="users" style="width: 14px; height: 14px;"></i>
          <span>Dari ${state.pemasukan.length} Transaksi Persembahan</span>
        </div>
      </div>
    </div>

    <!-- Charts & Quick Action Section -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; margin-bottom: 28px;">
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
          <p style="color: hsl(var(--text-secondary)); font-size: 0.9rem; margin-bottom: 24px;">
            Kelola transaksi Sabat ini, catat pengeluaran departemen, atau setor titipan DSKT dengan satu sentuhan.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
            <button class="btn btn-primary" id="btn-goto-masuk" style="width: 100%; justify-content: center; padding: 14px;">
              <i data-lucide="plus-circle"></i>
              <span>Catat Uang Masuk</span>
            </button>
            <button class="btn btn-gold" id="btn-goto-keluar" style="width: 100%; justify-content: center; padding: 14px;">
              <i data-lucide="minus-circle"></i>
              <span>Catat Pengeluaran</span>
            </button>
          </div>

          <button class="btn btn-secondary" id="btn-goto-dskt" style="width: 100%; justify-content: center; padding: 12px; border-color: rgba(239, 68, 68, 0.4); color: hsl(var(--danger));">
            <i data-lucide="send"></i>
            <span>Setor Uang ke Kas DSKT (Konferens/Daerah)</span>
          </button>
        </div>

        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; color: hsl(var(--text-muted));">
          <span>Google Sheets Sync Status:</span>
          <span style="color: ${state.settings.webhookUrl ? 'hsl(var(--success))' : 'hsl(var(--warning))'}; font-weight: 600;">
            ${state.settings.webhookUrl ? 'Tersambung ke Cloud' : 'Belum Atur Webhook'}
          </span>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Overview -->
    <div class="glass-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
        <h3 style="font-size: 1.1rem; font-weight: 700;">Transaksi Pemasukan Terakhir (Sabat/Minggu Ini)</h3>
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
            ${state.pemasukan.slice(0, 5).map(item => `
              <tr>
                <td>
                  <div style="font-weight: 600;">${formatDateIndo(item.date)}</div>
                  <div style="font-size: 0.78rem; color: hsl(var(--text-muted));">No. ${item.receiptNo}</div>
                </td>
                <td>
                  <div style="font-weight: 600; color: hsl(var(--accent-gold));">${item.memberName}</div>
                </td>
                <td><span class="badge badge-dskt">${formatRupiah(item.persepuluhan)}</span></td>
                <td><span style="font-weight: 600;">${formatRupiah(item.persembahanTerpadu)}</span></td>
                <td><span class="badge badge-gereja">${formatRupiah(item.persembahanKhusus)}</span></td>
                <td><span class="badge badge-pembangunan">${formatRupiah(item.persembahanPembangunan)}</span></td>
                <td style="font-weight: 800; color: hsl(var(--success));">${formatRupiah(item.persepuluhan + item.persembahanTerpadu + item.persembahanKhusus + item.persembahanPembangunan + item.lainLain)}</td>
              </tr>
            `).join('')}
            ${state.pemasukan.length === 0 ? `<tr><td colspan="7" style="text-align: center; padding: 30px; color: hsl(var(--text-muted));">Belum ada transaksi persembahan dicatat.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Render Icons
  if (window.lucide) window.lucide.createIcons();

  // Attach navigation events
  container.querySelector('#btn-goto-masuk')?.addEventListener('click', () => navigateTo('pemasukan'));
  container.querySelector('#btn-goto-keluar')?.addEventListener('click', () => navigateTo('pengeluaran'));
  container.querySelector('#btn-goto-dskt')?.addEventListener('click', () => navigateTo('kirim-dskt'));
  container.querySelector('#btn-goto-laporan')?.addEventListener('click', () => navigateTo('laporan'));

  // Render Chart.js
  setTimeout(() => {
    const canvas = document.getElementById('dashboardChart');
    if (canvas && window.Chart) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      const ctx = canvas.getContext('2d');
      chartInstance = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Masuk Kas DSKT (100% Psp + 50% Tpd)', 'Masuk Kas Gereja (50% Tpd + Khs + DLL)', 'Masuk Kas Pembangunan (100%)'],
          datasets: [{
            data: [
              summary.totalMasukDskt || 1,
              summary.totalMasukGereja || 1,
              summary.totalMasukPembangunan || 1
            ],
            backgroundColor: [
              '#ef4444', // Red for DSKT
              '#22c55e', // Green for Local Church
              '#3b82f6'  // Blue for Building Fund
            ],
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
              labels: {
                color: '#e2e8f0',
                font: { size: 11, family: 'Plus Jakarta Sans' },
                padding: 14,
                usePointStyle: true
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }, 100);
}
