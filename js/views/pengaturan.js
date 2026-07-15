/**
 * Tampilan & Logika Pengaturan, Saldo Awal & Sinkronisasi Google Sheets Webhook
 */
import { updateSettings, clearAllData, importBackupData } from '../state.js';
import { testWebhookUrl, syncToGoogleSheets, GOOGLE_SCRIPT_TEMPLATE_CODE } from '../google-script.js';

export function renderPengaturan(container, state, showToast) {
  const settings = state.settings || {};

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 24px;">
      
      <!-- Pengaturan Identitas Gereja & Saldo Awal -->
      <div class="glass-card">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-blue)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <i data-lucide="settings" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>
          Identitas Jemaat & Saldo Awal Kas
        </h3>

        <form id="form-settings">
          <div class="form-group">
            <label class="form-label">Nama Gereja / Jemaat</label>
            <input type="text" class="form-control" id="st-church" value="${settings.churchName || ''}" placeholder="Cth: Gereja Advent Jemaat Pusat" required />
          </div>

          <div class="form-group">
            <label class="form-label">Nama Daerah / Konferens (DSKT)</label>
            <input type="text" class="form-control" id="st-district" value="${settings.districtName || ''}" placeholder="Cth: DSKT - Daerah Sumatera Kawasan Tengah" required />
          </div>

          <div class="form-group">
            <label class="form-label">Nama Bendahara Jemaat</label>
            <input type="text" class="form-control" id="st-treasurer" value="${settings.treasurerName || ''}" placeholder="Cth: Bpk. R. Situmorang" />
          </div>

          <div style="border-top: 1px dashed var(--border-color); margin: 20px 0; padding-top: 16px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: hsl(var(--text-secondary)); margin-bottom: 14px;">
              Posisi Saldo Awal Kas (Sebelum Transaksi Periode Ini)
            </h4>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" style="color: hsl(var(--success));">Saldo Awal Kas Gereja (Rp)</label>
                <input type="number" class="form-control" id="st-saldo-grj" value="${Number(settings.saldoAwalGereja) || 0}" step="1000" />
              </div>
              <div class="form-group">
                <label class="form-label" style="color: hsl(var(--accent-blue));">Saldo Awal Kas Pembangunan (Rp)</label>
                <input type="number" class="form-control" id="st-saldo-pbg" value="${Number(settings.saldoAwalPembangunan) || 0}" step="1000" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" style="color: hsl(var(--danger));">Saldo Awal Titipan DSKT Belum Disetor (Rp)</label>
              <input type="number" class="form-control" id="st-saldo-dskt" value="${Number(settings.saldoAwalDskt) || 0}" step="1000" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px;">
            <i data-lucide="save"></i>
            <span>Simpan Pengaturan Jemaat</span>
          </button>
        </form>
      </div>

      <!-- Sinkronisasi Google Sheets & Backup Webhook -->
      <div class="glass-card">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-gold)); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <i data-lucide="cloud" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>
          Backup & Sinkronisasi ke Google Sheets
        </h3>

        <div style="margin-bottom: 20px;">
          <label class="form-label" style="margin-bottom: 8px; display: block;">URL Webhook Google Apps Script</label>
          <div style="display: flex; gap: 10px;">
            <input type="text" class="form-control" id="st-webhook" value="${settings.webhookUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" style="flex: 1; font-size: 0.85rem;" />
            <button type="button" class="btn btn-secondary" id="btn-test-webhook" style="padding: 10px 14px; white-space: nowrap;">
              <i data-lucide="zap"></i> Tes URL
            </button>
          </div>
          <p style="font-size: 0.78rem; color: hsl(var(--text-muted)); margin-top: 6px;">
            Masukkan URL Web App dari skrip Google Apps Script yang telah Anda pasang di spreadsheet.
          </p>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <button type="button" class="btn btn-gold" id="btn-sync-now" style="flex: 1; justify-content: center; padding: 14px;">
            <i data-lucide="refresh-cw"></i>
            <span>Sinkronkan ke Google Sheets Sekarang</span>
          </button>
          <button type="button" class="btn btn-secondary" id="btn-copy-template" style="padding: 14px 18px;" title="Salin Skrip Google Apps Script">
            <i data-lucide="copy"></i>
            <span>Salin Skrip (1-Klik)</span>
          </button>
        </div>

        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
          <h4 style="font-size: 0.9rem; font-weight: 700; color: hsl(var(--accent-gold)); margin-bottom: 8px;">
            Cara Memasang Backup ke Google Sheets (3 Langkah Mudah):
          </h4>
          <ol style="font-size: 0.82rem; color: hsl(var(--text-secondary)); padding-left: 18px; line-height: 1.6;">
            <li>Klik tombol <strong>"Salin Skrip (1-Klik)"</strong> di atas untuk menyalin kode resmi.</li>
            <li>Buka Google Sheets baru di Google Drive Anda -> klik menu <strong>Ekstensi -> Apps Script</strong> -> tempelkan (paste) kode lalu simpan.</li>
            <li>Klik tombol biru <strong>"Terapkan (Deploy) -> Buka penerapan baru"</strong> -> pilih jenis <strong>"Aplikasi Web (Web app)"</strong> -> atur Siapa saja (Anyone) -> klik Terapkan. Salin URL yang muncul ke kolom di atas!</li>
          </ol>
        </div>

        <!-- Backup & Impor File JSON Lokal -->
        <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: hsl(var(--text-primary)); margin-bottom: 12px;">
            Backup File Lokal (JSON Offline)
          </h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary" id="btn-download-json" style="flex: 1; justify-content: center; font-size: 0.85rem;">
              <i data-lucide="download"></i>
              <span>Unduh File Backup JSON</span>
            </button>
            <label class="btn btn-secondary" style="flex: 1; justify-content: center; font-size: 0.85rem; cursor: pointer; margin: 0;">
              <i data-lucide="upload"></i>
              <span>Impor Data JSON</span>
              <input type="file" id="input-import-json" accept=".json" style="display: none;" />
            </label>
          </div>
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <button type="button" class="btn btn-danger" id="btn-reset-all" style="padding: 8px 16px; font-size: 0.8rem; background: transparent; border-color: rgba(239,68,68,0.4);">
            <i data-lucide="alert-triangle"></i>
            <span>Reset / Bersihkan Seluruh Data Jemaat</span>
          </button>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Save settings
  container.querySelector('#form-settings')?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateSettings({
      churchName: container.querySelector('#st-church').value,
      districtName: container.querySelector('#st-district').value,
      treasurerName: container.querySelector('#st-treasurer').value,
      saldoAwalGereja: Number(container.querySelector('#st-saldo-grj').value) || 0,
      saldoAwalPembangunan: Number(container.querySelector('#st-saldo-pbg').value) || 0,
      saldoAwalDskt: Number(container.querySelector('#st-saldo-dskt').value) || 0,
      webhookUrl: container.querySelector('#st-webhook').value.trim()
    });
    showToast("Pengaturan identitas dan saldo awal berhasil disimpan!", "success");
    renderPengaturan(container, state, showToast);
  });

  // Test Webhook
  container.querySelector('#btn-test-webhook')?.addEventListener('click', async () => {
    const url = container.querySelector('#st-webhook').value.trim();
    if (!url) {
      showToast("Harap masukkan URL Webhook terlebih dahulu.", "warning");
      return;
    }
    showToast("Menguji koneksi ke Google Apps Script...", "info");
    const res = await testWebhookUrl(url);
    if (res.success) {
      updateSettings({ webhookUrl: url });
      showToast(res.message, "success");
    } else {
      showToast(res.message, "danger");
    }
  });

  // Sync to Google Sheets
  container.querySelector('#btn-sync-now')?.addEventListener('click', async () => {
    const url = container.querySelector('#st-webhook').value.trim() || state.settings.webhookUrl;
    if (!url) {
      showToast("URL Webhook belum diisi di atas.", "warning");
      return;
    }
    updateSettings({ webhookUrl: url });
    showToast("Mengirim seluruh transaksi ke Google Sheets (Sheet Pemasukan, Pengeluaran & Kirim DSKT)...", "info");
    const res = await syncToGoogleSheets(url, state);
    if (res.success) {
      showToast(res.message, "success");
    } else {
      showToast(res.message, "danger");
    }
  });

  // Copy Template Code
  container.querySelector('#btn-copy-template')?.addEventListener('click', () => {
    navigator.clipboard.writeText(GOOGLE_SCRIPT_TEMPLATE_CODE).then(() => {
      showToast("Skrip Google Apps Script berhasil disalin ke clipboard! Siap ditempel di Apps Script.", "success");
    }).catch(() => {
      showToast("Gagal menyalin otomatis, silakan buka file google-apps-script-template.gs.", "warning");
    });
  });

  // Download JSON Backup
  container.querySelector('#btn-download-json')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Backup_Bendahara_GMAHK_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast("File backup JSON berhasil diunduh.", "success");
  });

  // Import JSON Backup
  container.querySelector('#input-import-json')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const obj = JSON.parse(event.target.result);
        if (importBackupData(obj)) {
          showToast("Data backup berhasil diimpor!", "success");
          renderPengaturan(container, state, showToast);
        } else {
          showToast("Format file backup JSON tidak valid.", "danger");
        }
      } catch (err) {
        showToast("Error membaca file JSON: " + err.message, "danger");
      }
    };
    reader.readAsText(file);
  });

  // Reset All
  container.querySelector('#btn-reset-all')?.addEventListener('click', () => {
    if (confirm("PERINGATAN KRITIS: Seluruh data pemasukan dan pengeluaran akan dihapus dan dikembalikan ke saldo 0. Apakah Anda yakin?")) {
      clearAllData();
      showToast("Seluruh data telah dibersihkan.", "success");
      renderPengaturan(container, state, showToast);
    }
  });
}
