/**
 * Tampilan & Logika Pencatatan Uang Masuk (Persepuluhan, Persembahan Terpadu, Khusus, Pembangunan, Lain-lain)
 */
import { addPemasukan, deletePemasukan, addMember, addMembersBulk, formatRupiah, formatDateIndo, generateReceiptNo } from '../state.js';
import { calculateIncomeBreakdown } from '../calculations.js';

export function renderPemasukan(container, state, showToast) {
  const members = state.members || [];
  const pemasukanList = state.pemasukan || [];
  const today = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
      <!-- Form Input Pemasukan -->
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: hsl(var(--accent-gold));">
            <i data-lucide="plus-circle" style="display: inline; vertical-align: -3px; margin-right: 6px;"></i>
            Input Persembahan Anggota
          </h3>
          <button class="btn btn-secondary" id="btn-add-member-modal" style="padding: 6px 12px; font-size: 0.8rem;">
            <i data-lucide="user-plus"></i> + Anggota Baru
          </button>
        </div>

        <form id="form-pemasukan">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Tanggal Transaksi</label>
              <input type="date" class="form-control" id="in-date" value="${today}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Kuitansi / Bukti</label>
              <input type="text" class="form-control" id="in-receipt" value="${generateReceiptNo(today, state)}" required style="font-weight: 700; color: hsl(var(--accent-gold));" />
            </div>
          </div>

          <div class="form-group" style="position: relative;">
            <label class="form-label">Nama Anggota / Pemberi Persembahan</label>
            <div class="autocomplete-wrapper" style="position: relative;">
              <div style="position: relative; display: flex; align-items: center;">
                <i data-lucide="search" style="position: absolute; left: 14px; color: hsl(var(--text-muted)); width: 18px; height: 18px; pointer-events: none;"></i>
                <input type="text" class="form-control" id="in-member" placeholder="🔍 Ketik awal/tengah/akhir nama atau pilih dari daftar..." value="Umum/Anonim" autocomplete="off" required style="padding-left: 42px; padding-right: 42px; font-weight: 600;" />
                <button type="button" id="btn-toggle-member-list" tabindex="-1" style="position: absolute; right: 6px; background: transparent; border: none; color: hsl(var(--text-muted)); padding: 8px; cursor: pointer; display: flex; align-items: center;">
                  <i data-lucide="chevron-down"></i>
                </button>
              </div>
              <div id="member-autocomplete-list" class="autocomplete-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 1100; background: hsl(var(--bg-card)); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-top: 6px; max-height: 280px; overflow-y: auto; box-shadow: 0 12px 30px rgba(0,0,0,0.6);">
              </div>
            </div>
          </div>

          <div class="form-grid" style="margin-top: 10px;">
            <div class="form-group">
              <label class="form-label" style="color: hsl(var(--danger)); font-weight: 700;">
                1. Persepuluhan (100% DSKT)
              </label>
              <input type="number" class="form-control calc-trigger" id="in-psp" placeholder="0" min="0" />
            </div>

            <div class="form-group">
              <label class="form-label" style="color: hsl(var(--success)); font-weight: 700;">
                2. Pers. Terpadu (50% Grj / 50% DSKT)
              </label>
              <input type="number" class="form-control calc-trigger" id="in-tpd" placeholder="0" min="0" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">3. Pers. Khusus (100% Kas Gereja)</label>
              <input type="number" class="form-control calc-trigger" id="in-khs" placeholder="0" min="0" />
            </div>

            <div class="form-group">
              <label class="form-label" style="color: hsl(var(--accent-blue)); font-weight: 700;">
                4. Pers. Pembangunan (100% Pbg)
              </label>
              <input type="number" class="form-control calc-trigger" id="in-pbg" placeholder="0" min="0" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">5. Lain-lain / Ucapan Syukur (Kas Gereja)</label>
            <input type="number" class="form-control calc-trigger" id="in-dll" placeholder="0" min="0" />
          </div>

          <div class="form-group">
            <label class="form-label">Catatan Tambahan (Opsional)</label>
            <input type="text" class="form-control" id="in-notes" placeholder="Cth: Ucapan syukur ulang tahun pernikahan" />
          </div>

          <!-- Live Split Allocation Box -->
          <div class="allocation-info" id="live-split-box">
            <div class="alloc-item">
              <span class="alloc-title">Masuk Kas DSKT (100% Psp + 50% Tpd)</span>
              <span class="alloc-val" id="split-dskt" style="color: hsl(var(--danger));">Rp 0</span>
            </div>
            <div class="alloc-item">
              <span class="alloc-title">Masuk Kas Gereja (50% Tpd + Khs + DLL)</span>
              <span class="alloc-val" id="split-gereja" style="color: hsl(var(--success));">Rp 0</span>
            </div>
            <div class="alloc-item">
              <span class="alloc-title">Masuk Kas Pembangunan (100% Pbg)</span>
              <span class="alloc-val" id="split-pembangunan" style="color: hsl(var(--accent-blue));">Rp 0</span>
            </div>
            <div class="alloc-item" style="border-left: 1px solid var(--border-color); padding-left: 12px;">
              <span class="alloc-title">TOTAL PEMASUKAN</span>
              <span class="alloc-val" id="split-total" style="color: hsl(var(--accent-gold)); font-size: 1.15rem;">Rp 0</span>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px; padding: 14px; font-size: 1rem;">
            <i data-lucide="save"></i>
            <span>Simpan Transaksi Pemasukan</span>
          </button>
        </form>
      </div>

      <!-- Riwayat Pemasukan -->
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0;">Riwayat Pemasukan Terakhir</h3>
          <div style="position: relative; max-width: 300px; width: 100%;">
            <i data-lucide="search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: hsl(var(--text-muted));"></i>
            <input type="text" id="search-history-pemasukan" class="form-control" placeholder="Cari Nama atau No Kuitansi..." style="padding-left: 32px; border-radius: 20px; font-size: 0.85rem; height: 36px; border: 1px solid var(--border-color);" />
          </div>
        </div>
        
        <div class="table-responsive" style="max-height: 650px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal & Anggota</th>
                <th>Rincian Persembahan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="history-pemasukan-tbody">
              ${pemasukanList.map(item => {
                const calc = calculateIncomeBreakdown(item);
                return `
                  <tr class="history-row">
                    <td style="vertical-align: top; width: 38%;" class="searchable-text">
                      <div style="font-weight: 700; color: hsl(var(--accent-gold));">${item.memberName}</div>
                      <div style="font-size: 0.8rem; color: hsl(var(--text-muted));">${formatDateIndo(item.date)}</div>
                      <div style="font-size: 0.75rem; color: hsl(var(--text-secondary)); margin-top: 4px;">Kuitansi: ${item.receiptNo}</div>
                      ${item.notes ? `<div style="font-size: 0.75rem; font-style: italic; color: hsl(var(--text-muted)); margin-top: 2px;">"${item.notes}"</div>` : ''}
                    </td>
                    <td style="vertical-align: top;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;">
                        <span>Persepuluhan (DSKT):</span> <strong style="color: hsl(var(--danger));">${formatRupiah(item.persepuluhan)}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;">
                        <span>Pers. Terpadu (50/50):</span> <strong>${formatRupiah(item.persembahanTerpadu)}</strong>
                      </div>
                      ${item.persembahanKhusus ? `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;"><span>Pers. Khusus (Grj):</span> <strong style="color: hsl(var(--success));">${formatRupiah(item.persembahanKhusus)}</strong></div>` : ''}
                      ${item.persembahanPembangunan ? `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;"><span>Pers. Pembangunan:</span> <strong style="color: hsl(var(--accent-blue));">${formatRupiah(item.persembahanPembangunan)}</strong></div>` : ''}
                      ${item.lainLain ? `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;"><span>Lain-lain:</span> <strong>${formatRupiah(item.lainLain)}</strong></div>` : ''}
                      <div style="border-top: 1px dashed var(--border-color); margin-top: 6px; padding-top: 4px; display: flex; justify-content: space-between; font-weight: 800; color: hsl(var(--accent-gold));">
                        <span>Total:</span> <span>${formatRupiah(calc.total)}</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle; text-align: center; width: 70px;">
                      <button class="icon-btn btn-print-kw" data-id="${item.id}" title="Cetak Kuitansi" style="margin-bottom: 6px; color: hsl(var(--accent-blue));">
                        <i data-lucide="printer"></i>
                      </button>
                      <button class="icon-btn btn-del-masuk" data-id="${item.id}" title="Hapus Transaksi" style="color: hsl(var(--danger));">
                        <i data-lucide="trash-2"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
              ${pemasukanList.length === 0 ? `<tr><td colspan="3" style="text-align: center; padding: 40px; color: hsl(var(--text-muted));">Belum ada data persembahan.</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Anggota Baru -->
    <div class="modal-backdrop" id="modal-member">
      <div class="modal-content" style="max-width: 580px;">
        <div class="modal-header">
          <h4 style="font-size: 1.15rem; font-weight: 700;">Tambah & Import Anggota Jemaat</h4>
          <button class="icon-btn btn-close-member-modal"><i data-lucide="x"></i></button>
        </div>
        <div style="display: flex; border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
          <button type="button" id="tab-btn-manual" style="flex: 1; padding: 12px; font-weight: 600; border: none; border-bottom: 2px solid hsl(var(--accent-gold)); background: transparent; color: hsl(var(--text-primary)); cursor: pointer;">1. Input Manual</button>
          <button type="button" id="tab-btn-massal" style="flex: 1; padding: 12px; font-weight: 600; border: none; border-bottom: 2px solid transparent; background: transparent; color: hsl(var(--text-muted)); cursor: pointer;">2. Import Massal (Excel / Teks)</button>
        </div>

        <div id="tab-content-manual">
          <form id="form-new-member">
            <div class="modal-body">
              <div class="form-group"><label class="form-label">Nama Kepala Keluarga / Anggota</label><input type="text" class="form-control" id="nm-name" placeholder="Cth: Keluarga Bpk. S. Hutapea" required /></div>
              <div class="form-group"><label class="form-label">Nomor WhatsApp / HP</label><input type="text" class="form-control" id="nm-phone" placeholder="Cth: 08123456789" /></div>
              <div class="form-group"><label class="form-label">Alamat / Lingkungan</label><input type="text" class="form-control" id="nm-address" placeholder="Cth: Lingkungan 2 - Jl. Mawar" /></div>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-secondary btn-close-member-modal">Batal</button><button type="submit" class="btn btn-primary">Simpan Anggota</button></div>
          </form>
        </div>

        <div id="tab-content-massal" style="display: none;">
          <div class="modal-body">
            <div style="background: rgba(59, 130, 246, 0.1); border: 1px dashed rgba(59, 130, 246, 0.4); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 16px;">
              <div style="font-weight: 700; color: hsl(var(--accent-blue)); font-size: 0.9rem; margin-bottom: 6px;">💡 Opsi A: Upload File Excel (.xlsx / .csv)</div>
              <div style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-bottom: 10px;">Gunakan kolom: <b>Nama Anggota</b>, <b>No HP</b> (opsional), <b>Alamat</b> (opsional).</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <input type="file" id="file-import-members" accept=".xlsx,.xls,.csv" style="display: none;" />
                <button type="button" class="btn btn-secondary" id="btn-pick-excel" style="padding: 8px 14px; font-size: 0.8rem;"><i data-lucide="file-spreadsheet"></i> Pilih File Excel / CSV</button>
                <button type="button" class="btn btn-gold" id="btn-dl-template" style="padding: 8px 14px; font-size: 0.8rem;"><i data-lucide="download"></i> Download Template Excel</button>
              </div>
              <div id="import-file-name" style="font-size: 0.8rem; color: hsl(var(--success)); margin-top: 8px; font-weight: 600;"></div>
            </div>

            <div style="background: rgba(245, 158, 11, 0.1); border: 1px dashed rgba(245, 158, 11, 0.4); padding: 14px; border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: hsl(var(--accent-gold)); font-size: 0.9rem; margin-bottom: 6px;">💡 Opsi B: Ketik / Paste Daftar Nama</div>
              <div style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-bottom: 8px;">1 nama per baris, atau format: <b>Nama, No HP, Alamat</b></div>
              <textarea class="form-control" id="text-import-members" rows="6" placeholder="Cth:&#10;Bpk. R. Situmorang&#10;Keluarga Bpk. S. Hutapea, 08123456789, Lingkungan 1&#10;Ibu M. Panjaitan"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-close-member-modal">Batal</button>
            <button type="button" class="btn btn-primary" id="btn-process-mass-import" style="background: linear-gradient(135deg, hsl(var(--success)), hsl(160, 84%, 30%));"><i data-lucide="check-circle"></i> Proses Import Massal</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Kuitansi Digital -->
    <!-- Modal Kuitansi Digital -->
    <div class="modal-backdrop" id="modal-receipt">
      <div class="modal-content" style="max-width: 520px; transition: max-width 0.25s ease;" id="receipt-print-area">
        <div class="modal-header" id="receipt-header-bar" style="background: linear-gradient(135deg, hsl(var(--accent-blue)), hsl(221, 83%, 45%)); color: white;">
          <div>
            <h4 style="font-size: 1.2rem; font-weight: 800;">KUITANSI PERSEMBAHAN GMAHK</h4>
            <div style="font-size: 0.8rem; opacity: 0.9;">${state.settings.churchName || 'Jemaat Teratai Batam'}</div>
          </div>
          <button class="icon-btn" id="btn-close-receipt" style="background: rgba(255,255,255,0.2); color: white;"><i data-lucide="x"></i></button>
        </div>
        <div style="display: flex; gap: 8px; padding: 10px 16px; background: rgba(0,0,0,0.15); border-bottom: 1px solid var(--border-color); align-items: center; justify-content: space-between;" class="receipt-toolbar">
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-sm active" id="btn-mode-standard" style="padding: 5px 10px; font-size: 0.78rem; border: 1px solid hsl(var(--accent-gold)); background: hsl(var(--accent-gold)); color: black; font-weight: 700;">📄 A4 / Standar</button>
            <button type="button" class="btn btn-sm btn-secondary" id="btn-mode-thermal" style="padding: 5px 10px; font-size: 0.78rem; border: 1px solid var(--border-color); color: hsl(var(--text-primary));">🖨️ Thermal POS 58/80mm</button>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" id="btn-help-thermal" style="padding: 5px 10px; font-size: 0.78rem; color: hsl(var(--accent-blue)); font-weight: 600;"><i data-lucide="help-circle" style="width:14px;height:14px;"></i> Panduan Driver Windows</button>
        </div>
        <div class="modal-body" id="receipt-body" style="padding: 24px;">
          <!-- Isi kuitansi akan di-render secara dinamis -->
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
          <button type="button" class="btn btn-secondary" id="btn-close-receipt-2">Tutup</button>
          <button type="button" class="btn btn-gold" id="btn-do-print" style="font-weight: 700;">
            <i data-lucide="printer"></i> Cetak Sekarang / PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Panduan Driver Printer Thermal Windows -->
    <div class="modal-backdrop" id="modal-printer-help">
      <div class="modal-content" style="max-width: 620px;">
        <div class="modal-header" style="background: linear-gradient(135deg, hsl(160, 84%, 30%), hsl(var(--accent-blue))); color: white;">
          <div><h4 style="font-size: 1.15rem; font-weight: 800;"><i data-lucide="printer" style="margin-right:6px;"></i> Panduan Instalasi Driver Printer Thermal Windows</h4></div>
          <button class="icon-btn" id="btn-close-printer-help" style="background: rgba(255,255,255,0.2); color: white;"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" style="padding: 20px; font-size: 0.88rem; line-height: 1.6; color: hsl(var(--text-primary)); max-height: 70vh; overflow-y: auto;">
          <div style="background: rgba(245, 158, 11, 0.15); border-left: 4px solid hsl(var(--accent-gold)); padding: 12px; margin-bottom: 16px; border-radius: 4px;">
            <b>📌 Mengapa Butuh Driver?</b> Windows memerlukan driver agar printer kasir (58mm/80mm USB atau Bluetooth) terdeteksi saat Anda menekan tombol <b>Cetak Sekarang</b> di aplikasi ini.
          </div>
          <h5 style="font-weight: 700; color: hsl(var(--accent-gold)); margin-bottom: 8px;">Langkah-Langkah Instalasi Driver di Windows:</h5>
          <ol style="padding-left: 20px; margin-bottom: 16px;">
            <li style="margin-bottom: 8px;"><b>Hubungkan Printer:</b> Colokkan kabel USB printer thermal ke laptop/komputer Windows Anda dan nyalakan printer.</li>
            <li style="margin-bottom: 8px;"><b>Gunakan CD Driver / Installer Bawaan:</b>
              <ul style="padding-left: 16px; margin-top: 4px; list-style: disc;">
                <li>Jika merk <b>Xprinter / POS-58 / POS-80 / Blueprint / Panda / EPPOS</b>: jalankan file <code>POS Printer Driver Setup.exe</code> bawaan printer Anda.</li>
                <li>Pilih OS <b>Windows 10 / Windows 11</b> dan pilih port USB (misal: <code>USB001</code> / <code>USB002</code>), lalu klik <b>Install Now</b>.</li>
              </ul>
            </li>
            <li style="margin-bottom: 8px;"><b>Atau Gunakan Driver Universal Windows (Tanpa CD):</b>
              <ul style="padding-left: 16px; margin-top: 4px; list-style: disc;">
                <li>Buka <b>Windows Settings</b> ➔ <b>Bluetooth & devices</b> ➔ <b>Printers & scanners</b>.</li>
                <li>Klik <b>Add device / Add printer</b> ➔ pilih <i>"The printer that I want isn't listed"</i>.</li>
                <li>Pilih <i>"Add a local printer... with manual settings"</i> ➔ pilih port <code>USB001</code> ➔ di kolom Manufacturer pilih <b>Generic</b> ➔ pilih <b>Generic / Text Only</b> ➔ beri nama <code>Printer Thermal Gereja</code> dan klik Next sampai selesai.</li>
              </ul>
            </li>
            <li style="margin-bottom: 8px;"><b>Cara Cetak Sempurna di Aplikasi Ini:</b>
              <ul style="padding-left: 16px; margin-top: 4px; list-style: disc;">
                <li>Aktifkan tombol <b>🖨️ Thermal POS 58/80mm</b> di atas pada jendela kuitansi ini.</li>
                <li>Klik tombol <b>Cetak Sekarang</b>. Saat dialog print browser muncul, pilih Tujuan/Destination: <b>[Nama Printer Thermal Anda]</b>.</li>
                <li>Klik menu <b>More settings</b> (Setelan tambahan) di dialog print ➔ ubah <b>Paper size</b> menjadi <code>58mm x 210mm</code> atau <code>80mm x 297mm</code> (Roll Paper), dan <b>Hilangkan centang</b> pada <i>Headers and footers</i>.</li>
              </ul>
            </li>
          </ol>
        </div>
        <div class="modal-footer"><button type="button" class="btn btn-primary" id="btn-close-printer-help-2" style="width: 100%;">Mengerti & Kembali ke Kuitansi</button></div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const dateInput = container.querySelector('#in-date');
  const receiptInput = container.querySelector('#in-receipt');
  if (dateInput && receiptInput) {
    dateInput.addEventListener('change', () => {
      receiptInput.value = generateReceiptNo(dateInput.value, state);
    });
  }

  // Live Split Calculator triggers
  const triggerInputs = container.querySelectorAll('.calc-trigger');
  triggerInputs.forEach(input => {
    input.addEventListener('input', () => {
      const psp = Number(container.querySelector('#in-psp')?.value) || 0;
      const tpd = Number(container.querySelector('#in-tpd')?.value) || 0;
      const khs = Number(container.querySelector('#in-khs')?.value) || 0;
      const pbg = Number(container.querySelector('#in-pbg')?.value) || 0;
      const dll = Number(container.querySelector('#in-dll')?.value) || 0;

      const calc = calculateIncomeBreakdown({ persepuluhan: psp, persembahanTerpadu: tpd, persembahanKhusus: khs, persembahanPembangunan: pbg, lainLain: dll });

      container.querySelector('#split-dskt').innerHTML = formatRupiah(calc.kasDskt);
      container.querySelector('#split-gereja').innerHTML = formatRupiah(calc.kasGereja);
      container.querySelector('#split-pembangunan').innerHTML = formatRupiah(calc.kasPembangunan);
      container.querySelector('#split-total').innerHTML = formatRupiah(calc.total);
    });
  });

  // Autocomplete logika
  const inMemberInput = container.querySelector('#in-member');
  const dropdownList = container.querySelector('#member-autocomplete-list');
  const toggleBtn = container.querySelector('#btn-toggle-member-list');

  if (inMemberInput && dropdownList) {
    const allOptions = [
      { name: "Umum/Anonim", subtitle: "-- Persembahan Kantong Umum / Anonim --", isDefault: true },
      ...members.map(m => ({
        name: m.name,
        subtitle: `${m.address || '-'} • HP: ${m.phone || '-'}`
      }))
    ];

    function renderOptions(query = "") {
      const q = query.trim().toLowerCase();
      const filtered = allOptions.filter(opt => {
        if (!q) return true;
        return opt.name.toLowerCase().includes(q) || opt.subtitle.toLowerCase().includes(q);
      });

      if (filtered.length === 0) {
        dropdownList.innerHTML = `
          <div style="padding: 14px; text-align: center; color: hsl(var(--text-muted)); font-size: 0.85rem;">
            <div>Tidak ditemukan "${query}"</div>
            <div style="font-size: 0.78rem; color: hsl(var(--accent-gold)); margin-top: 4px;">💡 Anda bisa tetap pilih/ketik nama ini & langsung simpan (otomatis jadi anggota baru)</div>
          </div>
        `;
        return;
      }

      dropdownList.innerHTML = filtered.map((opt, idx) => `
        <div class="autocomplete-item" data-name="${opt.name.replace(/"/g, '&quot;')}" style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; transition: background 0.15s;">
          <div>
            <div style="font-weight: ${opt.isDefault ? '700' : '600'}; color: ${opt.isDefault ? 'hsl(var(--accent-gold))' : 'hsl(var(--text-primary))'};">${opt.name}</div>
            <div style="font-size: 0.78rem; color: hsl(var(--text-muted));">${opt.subtitle}</div>
          </div>
        </div>
      `).join('');

      dropdownList.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          inMemberInput.value = item.getAttribute('data-name');
          dropdownList.style.display = 'none';
        });
        item.addEventListener('mouseenter', () => {
          item.style.background = 'rgba(59, 130, 246, 0.15)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'transparent';
        });
      });
    }

    inMemberInput.addEventListener('focus', () => {
      renderOptions(inMemberInput.value === "Umum/Anonim" ? "" : inMemberInput.value);
      dropdownList.style.display = 'block';
    });

    inMemberInput.addEventListener('input', () => {
      renderOptions(inMemberInput.value);
      dropdownList.style.display = 'block';
    });

    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdownList.style.display === 'block') {
        dropdownList.style.display = 'none';
      } else {
        renderOptions("");
        dropdownList.style.display = 'block';
        inMemberInput.focus();
      }
    });

    const closeListener = (e) => {
      if (!container.contains(e.target) || (!inMemberInput.contains(e.target) && !dropdownList.contains(e.target) && !toggleBtn?.contains(e.target))) {
        dropdownList.style.display = 'none';
      }
    };
    document.addEventListener('click', closeListener);
  }

  // Submit Income Entry
  container.querySelector('#form-pemasukan')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const entry = {
      date: container.querySelector('#in-date').value,
      sabbathName: "-",
      memberName: container.querySelector('#in-member').value,
      persepuluhan: container.querySelector('#in-psp').value,
      persembahanTerpadu: container.querySelector('#in-tpd').value,
      persembahanKhusus: container.querySelector('#in-khs').value,
      persembahanPembangunan: container.querySelector('#in-pbg').value,
      lainLain: container.querySelector('#in-dll').value,
      receiptNo: container.querySelector('#in-receipt').value || generateReceiptNo(container.querySelector('#in-date').value, state),
      notes: container.querySelector('#in-notes').value
    };

    if (Number(entry.persepuluhan) + Number(entry.persembahanTerpadu) + Number(entry.persembahanKhusus) + Number(entry.persembahanPembangunan) + Number(entry.lainLain) <= 0) {
      showToast("Harap isi setidaknya satu nominal persembahan!", "warning");
      return;
    }

    if (entry.memberName && entry.memberName !== "Umum/Anonim") {
      const exists = members.some(m => m.name.toLowerCase() === entry.memberName.trim().toLowerCase());
      if (!exists) {
        addMember({ name: entry.memberName.trim() });
      }
    }

    addPemasukan(entry);
    showToast("Transaksi persembahan berhasil disimpan dan dibagi secara otomatis!", "success");
    renderPemasukan(container, state, showToast);
  });

  // Search History Logic
  const searchInput = container.querySelector('#search-history-pemasukan');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      const rows = container.querySelectorAll('.history-row');
      rows.forEach(row => {
        const textToSearch = row.querySelector('.searchable-text')?.textContent.toLowerCase() || '';
        if (textToSearch.includes(val)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Delete Income Entry
  container.querySelectorAll('.btn-del-masuk').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm("Apakah Anda yakin ingin menghapus catatan pemasukan ini?")) {
        deletePemasukan(id);
        showToast("Transaksi berhasil dihapus.", "success");
        renderPemasukan(container, state, showToast);
      }
    });
  });

  // Member Modal logic
  const modalMember = container.querySelector('#modal-member');
  container.querySelector('#btn-add-member-modal')?.addEventListener('click', () => modalMember.classList.add('active'));
  container.querySelectorAll('.btn-close-member-modal').forEach(btn => {
    btn.addEventListener('click', () => modalMember.classList.remove('active'));
  });

  const tabBtnManual = container.querySelector('#tab-btn-manual');
  const tabBtnMassal = container.querySelector('#tab-btn-massal');
  const tabManual = container.querySelector('#tab-content-manual');
  const tabMassal = container.querySelector('#tab-content-massal');
  if (tabBtnManual && tabBtnMassal) {
    tabBtnManual.addEventListener('click', () => {
      tabBtnManual.style.borderBottomColor = 'hsl(var(--accent-gold))';
      tabBtnManual.style.color = 'hsl(var(--text-primary))';
      tabBtnMassal.style.borderBottomColor = 'transparent';
      tabBtnMassal.style.color = 'hsl(var(--text-muted))';
      tabManual.style.display = 'block';
      tabMassal.style.display = 'none';
    });
    tabBtnMassal.addEventListener('click', () => {
      tabBtnMassal.style.borderBottomColor = 'hsl(var(--accent-gold))';
      tabBtnMassal.style.color = 'hsl(var(--text-primary))';
      tabBtnManual.style.borderBottomColor = 'transparent';
      tabBtnManual.style.color = 'hsl(var(--text-muted))';
      tabMassal.style.display = 'block';
      tabManual.style.display = 'none';
    });
  }

  const fileInput = container.querySelector('#file-import-members');
  const fileNameDisplay = container.querySelector('#import-file-name');
  container.querySelector('#btn-pick-excel')?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    fileNameDisplay.textContent = file ? `📄 Terpilih: ${file.name}` : '';
  });

  container.querySelector('#btn-dl-template')?.addEventListener('click', () => {
    if (!window.XLSX) {
      showToast("Pustaka Excel belum siap. Coba beberapa saat lagi.", "warning");
      return;
    }
    const sampleData = [
      { "Nama Anggota": "Keluarga Bpk. S. Hutapea", "No HP/WhatsApp": "08123456789", "Alamat/Lingkungan": "Lingkungan 1 - Jl. Mawar" },
      { "Nama Anggota": "Ibu M. Panjaitan", "No HP/WhatsApp": "08129876543", "Alamat/Lingkungan": "Lingkungan 2 - Jl. Melati" },
      { "Nama Anggota": "Sdr. J. Sitorus", "No HP/WhatsApp": "-", "Alamat/Lingkungan": "Lingkungan 3" }
    ];
    const ws = window.XLSX.utils.json_to_sheet(sampleData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Template Anggota");
    window.XLSX.writeFile(wb, "template-import-anggota-gmahk.xlsx");
    showToast("Template Excel berhasil didownload!", "success");
  });

  container.querySelector('#btn-process-mass-import')?.addEventListener('click', () => {
    const parsedMembers = [];
    const rawText = container.querySelector('#text-import-members')?.value || '';
    if (rawText.trim()) {
      const lines = rawText.split(/\r?\n/);
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const parts = trimmed.split(',').map(s => s.trim());
        parsedMembers.push({ name: parts[0], phone: parts[1] || '-', address: parts[2] || '-' });
      });
    }

    const file = fileInput?.files[0];
    if (file) {
      if (!window.XLSX) {
        showToast("Pustaka Excel tidak tersedia untuk membaca file.", "danger");
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = window.XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (rows && rows.length > 0) {
            let startRow = 0;
            let colName = 0, colPhone = 1, colAddr = 2;
            const headerRow = rows[0].map(c => String(c || '').toLowerCase());
            if (headerRow.some(h => h.includes('nama') || h.includes('name') || h.includes('anggota'))) {
              startRow = 1;
              headerRow.forEach((h, idx) => {
                if (h.includes('nama') || h.includes('name') || h.includes('anggota')) colName = idx;
                else if (h.includes('hp') || h.includes('wa') || h.includes('phone') || h.includes('telp')) colPhone = idx;
                else if (h.includes('alamat') || h.includes('lingkungan') || h.includes('addr')) colAddr = idx;
              });
            }

            for (let i = startRow; i < rows.length; i++) {
              const r = rows[i];
              if (!r || !r[colName]) continue;
              const nameStr = String(r[colName]).trim();
              if (nameStr) {
                parsedMembers.push({
                  name: nameStr,
                  phone: r[colPhone] ? String(r[colPhone]).trim() : '-',
                  address: r[colAddr] ? String(r[colAddr]).trim() : '-'
                });
              }
            }
          }
          saveMassImport(parsedMembers);
        } catch (err) {
          console.error(err);
          showToast("Gagal membaca file Excel. Pastikan format file benar.", "danger");
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    saveMassImport(parsedMembers);

    function saveMassImport(list) {
      if (list.length === 0) {
        showToast("Tidak ada data anggota yang ditemukan untuk diimpor!", "warning");
        return;
      }
      const added = addMembersBulk(list);
      modalMember.classList.remove('active');
      if (container.querySelector('#text-import-members')) container.querySelector('#text-import-members').value = '';
      if (fileInput) fileInput.value = '';
      if (fileNameDisplay) fileNameDisplay.textContent = '';
      showToast(`Berhasil mengimpor ${added.length} anggota baru (${list.length - added.length} duplikat diabaikan).`, "success");
      renderPemasukan(container, state, showToast);
    }
  });

  container.querySelector('#form-new-member')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newM = addMember({
      name: container.querySelector('#nm-name').value,
      phone: container.querySelector('#nm-phone').value,
      address: container.querySelector('#nm-address').value
    });
    modalMember.classList.remove('active');
    showToast(`Anggota "${newM.name}" berhasil ditambahkan ke daftar!`, "success");
    renderPemasukan(container, state, showToast);
  });

  // Receipt Modal logic
  const modalReceipt = container.querySelector('#modal-receipt');
  const modalPrinterHelp = container.querySelector('#modal-printer-help');
  let currentReceiptItem = null;

  function renderReceiptContent(item) {
    if (!item) return;
    const calc = calculateIncomeBreakdown(item);
    const isThermal = document.body.classList.contains('thermal-print-mode');
    container.querySelector('#receipt-body').innerHTML = `
      <div style="text-align: center; border-bottom: 2px dashed ${isThermal ? '#000' : 'var(--border-color)'}; padding-bottom: 14px; margin-bottom: 14px;" class="thermal-dash-line">
        <div style="font-size: 0.82rem; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'}; font-weight: 600;">TANDA TERIMA PERSEMBAHAN RESMI</div>
        <h3 style="font-size: 1.35rem; color: ${isThermal ? '#000' : 'hsl(var(--accent-gold))'}; margin-top: 4px; font-weight: 800;">No. ${item.receiptNo}</h3>
        <div style="font-size: 0.88rem; color: ${isThermal ? '#000' : 'hsl(var(--text-primary))'};">Tanggal: <strong>${formatDateIndo(item.date)}</strong></div>
      </div>
      <div style="margin-bottom: 14px;">
        <div style="font-size: 0.8rem; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'};">DITERIMA DARI:</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: ${isThermal ? '#000' : 'hsl(var(--text-primary))'};">${item.memberName}</div>
      </div>
      <div style="background: ${isThermal ? 'transparent' : 'rgba(0,0,0,0.25)'}; padding: ${isThermal ? '6px 0' : '14px'}; border-radius: var(--radius-sm); margin-bottom: 14px; border-top: ${isThermal ? '1px dashed #000' : 'none'}; border-bottom: ${isThermal ? '1px dashed #000' : 'none'};" class="thermal-dash-line">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
          <span>1. Persepuluhan (DSKT):</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--danger))'};">${formatRupiah(item.persepuluhan)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
          <span>2. Pers. Terpadu:</span> <strong>${formatRupiah(item.persembahanTerpadu)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
          <span>3. Pers. Khusus (Grj):</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--success))'};">${formatRupiah(item.persembahanKhusus)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
          <span>4. Pers. Pembangunan:</span> <strong style="color: ${isThermal ? '#000' : 'hsl(var(--accent-blue))'};">${formatRupiah(item.persembahanPembangunan)}</strong>
        </div>
        ${Number(item.lainLain) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
          <span>5. Lain-lain:</span> <strong>${formatRupiah(item.lainLain)}</strong>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; border-top: 1px solid ${isThermal ? '#000' : 'var(--border-color)'}; padding-top: 8px; margin-top: 8px; font-size: 1.1rem; font-weight: 800; color: ${isThermal ? '#000' : 'hsl(var(--accent-gold))'};">
          <span>TOTAL:</span> <span>${formatRupiah(calc.total)}</span>
        </div>
      </div>
      <div style="font-size: 0.78rem; text-align: center; color: ${isThermal ? '#000' : 'hsl(var(--text-muted))'}; font-style: italic;">
        "Bawalah seluruh persembahan persepuluhan itu ke dalam rumah perbendaharaan..." (Maleakhi 3:10)
      </div>
    `;
  }

  container.querySelectorAll('.btn-print-kw').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = pemasukanList.find(i => i.id === id);
      if (!item) return;
      currentReceiptItem = item;
      renderReceiptContent(currentReceiptItem);
      modalReceipt?.classList.add('active');
    });
  });

  const btnModeStd = container.querySelector('#btn-mode-standard');
  const btnModeThm = container.querySelector('#btn-mode-thermal');

  btnModeStd?.addEventListener('click', () => {
    document.body.classList.remove('thermal-print-mode');
    btnModeStd.style.background = 'hsl(var(--accent-gold))';
    btnModeStd.style.color = 'black';
    btnModeStd.style.fontWeight = '700';
    if (btnModeThm) {
      btnModeThm.style.background = 'transparent';
      btnModeThm.style.color = 'hsl(var(--text-primary))';
      btnModeThm.style.fontWeight = 'normal';
    }
    renderReceiptContent(currentReceiptItem);
  });

  btnModeThm?.addEventListener('click', () => {
    document.body.classList.add('thermal-print-mode');
    btnModeThm.style.background = 'hsl(var(--accent-gold))';
    btnModeThm.style.color = 'black';
    btnModeThm.style.fontWeight = '700';
    if (btnModeStd) {
      btnModeStd.style.background = 'transparent';
      btnModeStd.style.color = 'hsl(var(--text-primary))';
      btnModeStd.style.fontWeight = 'normal';
    }
    renderReceiptContent(currentReceiptItem);
  });

  container.querySelector('#btn-help-thermal')?.addEventListener('click', () => modalPrinterHelp?.classList.add('active'));
  container.querySelector('#btn-close-printer-help')?.addEventListener('click', () => modalPrinterHelp?.classList.remove('active'));
  container.querySelector('#btn-close-printer-help-2')?.addEventListener('click', () => modalPrinterHelp?.classList.remove('active'));

  container.querySelector('#btn-close-receipt')?.addEventListener('click', () => modalReceipt?.classList.remove('active'));
  container.querySelector('#btn-close-receipt-2')?.addEventListener('click', () => modalReceipt?.classList.remove('active'));
  container.querySelector('#btn-do-print')?.addEventListener('click', () => {
    document.body.classList.add('printing-receipt');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-receipt');
    }, 800);
  });
}
