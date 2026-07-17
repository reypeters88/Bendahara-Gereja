/**
 * Tampilan Khusus Menu Persentase & Analisis Proporsi Perbendaharaan GMAHK
 * Menampilkan rincian persentase pendapatan, alokasi pembagian hak dana, serta efisiensi pengeluaran departemen.
 */
import { calculateFinancialSummary, formatRupiah } from '../calculations.js';

export function renderPersentase(container, state, showToast) {
  const summary = calculateFinancialSummary(state);
  const pemasukanList = state.pemasukan || [];
  const pengeluaranList = state.pengeluaran || [];

  // Perhitungan total komponen pendapatan
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

  // Persentase Alokasi Hak Dana
  const pctDskt = ((totalHakDskt / totalMasuk) * 100).toFixed(1);
  const pctGereja = ((totalHakGereja / totalMasuk) * 100).toFixed(1);
  const pctPembangunan = ((totalHakPembangunan / totalMasuk) * 100).toFixed(1);

  // Grup Pengeluaran per Departemen
  const deptMap = {};
  pengeluaranList.forEach(item => {
    const dName = item.departmentName || "Lain-lain";
    if (!deptMap[dName]) deptMap[dName] = 0;
    deptMap[dName] += Number(item.amount) || 0;
  });
  const totalKeluar = summary.totalPengeluaran || 0;
  const totalKasTersediaGereja = summary.saldoAwalGereja + summary.totalMasukGereja || 1;

  const deptList = Object.keys(deptMap).map(name => ({
    name,
    amount: deptMap[name],
    percentKeluar: totalKeluar > 0 ? ((deptMap[name] / totalKeluar) * 100).toFixed(1) : "0.0",
    percentKas: ((deptMap[name] / totalKasTersediaGereja) * 100).toFixed(1)
  })).sort((a, b) => b.amount - a.amount);

  // Rasio Efisiensi & Kepatuhan
  const rasioPenyerapanGereja = ((summary.totalPengeluaranGereja / totalKasTersediaGereja) * 100).toFixed(1);
  const totalKewajibanDskt = summary.saldoAwalDskt + summary.totalMasukDskt || 1;
  const rasioKepatuhanDskt = ((summary.totalUangDikirimDskt / totalKewajibanDskt) * 100).toFixed(1);

  container.innerHTML = `
    <!-- Tombol Kembali / Back Line Icon -->
    <div style="margin-bottom: 16px;">
      <button type="button" class="btn btn-secondary" id="btn-back-dashboard-persentase" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--border-color); background: var(--surface-subtle); color: hsl(var(--text-primary)); cursor: pointer;">
        <i data-lucide="arrow-left" style="width: 18px; height: 18px; color: hsl(var(--accent-gold));"></i>
        <span>Kembali ke Dashboard</span>
      </button>
    </div>

    <!-- Header Card -->
    <div class="glass-card" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <h3 style="font-size: 1.35rem; font-weight: 800; color: hsl(var(--text-primary)); margin: 0; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="pie-chart" style="color: hsl(var(--accent-gold)); width: 26px; height: 26px;"></i> Analisis Persentase & Proporsi Dana
          </h3>
          <span class="badge badge-gereja" style="font-size: 0.75rem;">Real-Time Data</span>
        </div>
        <p style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin: 0; max-width: 700px;">
          Dasbor analisis statistik perbendaharaan yang memperlihatkan proporsi persentase sumber persembahan, alokasi pembagian hak dana, serta distribusi pengeluaran setiap departemen jemaat.
        </p>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-refresh-persentase" style="padding: 10px 16px;">
          <i data-lucide="refresh-cw"></i>
          <span>Perbarui Data</span>
        </button>
        <button class="btn btn-primary" id="btn-print-persentase" style="padding: 10px 18px;">
          <i data-lucide="printer"></i>
          <span>Cetak Lembar Analisis</span>
        </button>
      </div>
    </div>

    <!-- Overview 4 Kartu Utama -->
    <div class="stats-grid" style="margin-bottom: 28px;">
      <div class="stat-card" style="--stat-glow: rgba(212,175,55,0.15);">
        <span class="stat-title">Total Arus Kas Masuk (100%)</span>
        <div class="stat-value" style="color: hsl(var(--accent-gold));">${formatRupiah(summary.totalUangMasuk)}</div>
        <div class="stat-desc">Basis 100% dari ${pemasukanList.length} transaksi</div>
      </div>

      <div class="stat-card" style="--stat-glow: rgba(239,68,68,0.15);">
        <span class="stat-title">Proporsi Hak DSKT (Daerah)</span>
        <div class="stat-value" style="color: hsl(var(--danger));">${pctDskt}%</div>
        <div class="stat-desc">Nominal: ${formatRupiah(totalHakDskt)}</div>
      </div>

      <div class="stat-card" style="--stat-glow: rgba(34,197,94,0.15);">
        <span class="stat-title">Proporsi Kas Lokal Gereja</span>
        <div class="stat-value" style="color: hsl(var(--success));">${pctGereja}%</div>
        <div class="stat-desc">Nominal: ${formatRupiah(totalHakGereja)}</div>
      </div>

      <div class="stat-card" style="--stat-glow: rgba(59,130,246,0.15);">
        <span class="stat-title">Proporsi Kas Pembangunan</span>
        <div class="stat-value" style="color: hsl(var(--accent-blue));">${pctPembangunan}%</div>
        <div class="stat-desc">Nominal: ${formatRupiah(totalHakPembangunan)}</div>
      </div>
    </div>

    <!-- SECTION I & II: SUMBER PEMASUKAN & ALOKASI HAK DANA -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 24px; margin-bottom: 28px;">
      
      <!-- Card I: Proporsi Komponen Sumber Pemasukan -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
            <h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--accent-blue)); margin: 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="trending-up" style="width: 20px; height: 20px;"></i> I. Rincian Proporsi Sumber Pemasukan
            </h4>
            <span class="badge" style="background: rgba(59,130,246,0.15); color: hsl(var(--accent-blue));">5 Komponen</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- 1. Persepuluhan -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <div>
                  <span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persepuluhan</span>
                  <span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(100% Hak DSKT)</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--danger));">${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}%</span>
                  <span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalPersepuluhan)})</span>
                </div>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #ef4444, #f87171); width: ${((totalPersepuluhan / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
              </div>
            </div>

            <!-- 2. Persembahan Terpadu -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <div>
                  <span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persembahan Terpadu</span>
                  <span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(50% Grj / 50% DSKT)</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--accent-gold));">${((totalTerpadu / totalMasuk) * 100).toFixed(1)}%</span>
                  <span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalTerpadu)})</span>
                </div>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #f59e0b, #fbbf24); width: ${((totalTerpadu / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
              </div>
            </div>

            <!-- 3. Persembahan Khusus -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <div>
                  <span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persembahan Khusus</span>
                  <span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(100% Kas Gereja)</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--success));">${((totalKhusus / totalMasuk) * 100).toFixed(1)}%</span>
                  <span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalKhusus)})</span>
                </div>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #22c55e, #4ade80); width: ${((totalKhusus / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
              </div>
            </div>

            <!-- 4. Persembahan Pembangunan -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <div>
                  <span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Persembahan Pembangunan</span>
                  <span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(100% Kas Pembangunan)</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--accent-blue));">${((totalPembangunan / totalMasuk) * 100).toFixed(1)}%</span>
                  <span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalPembangunan)})</span>
                </div>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #3b82f6, #60a5fa); width: ${((totalPembangunan / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
              </div>
            </div>

            <!-- 5. Lain-lain -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <div>
                  <span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Pemasukan Lain-lain</span>
                  <span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 6px;">(Donasi/Bunga/Lainnya)</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-weight: 800; font-size: 0.95rem; color: hsl(var(--text-muted));">${((totalLain / totalMasuk) * 100).toFixed(1)}%</span>
                  <span style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-left: 6px;">(${formatRupiah(totalLain)})</span>
                </div>
              </div>
              <div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: hsl(var(--text-muted)); width: ${((totalLain / totalMasuk) * 100).toFixed(1)}%; height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; padding: 12px; background: rgba(59,130,246,0.08); border-radius: 10px; font-size: 0.8rem; color: hsl(var(--text-secondary));">
          <i data-lucide="info" style="width: 15px; height: 15px; vertical-align: -2px; margin-right: 4px; color: hsl(var(--accent-blue));"></i>
          Persentase dihitung dari total penerimaan uang masuk selama periode aktif sebesar <strong style="color: hsl(var(--accent-gold));">${formatRupiah(summary.totalUangMasuk)}</strong>.
        </div>
      </div>

      <!-- Card II: Alokasi Kebijakan Pembagian Hak Dana -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
            <h4 style="font-size: 1.05rem; font-weight: 800; color: hsl(var(--accent-gold)); margin: 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="shield" style="width: 20px; height: 20px;"></i> II. Alokasi Kebijakan Pembagian Dana
            </h4>
            <span class="badge badge-pembangunan">Rumus GMAHK</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Pos 1: Hak DSKT -->
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); padding: 16px; border-radius: 14px; position: relative; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 800; color: hsl(var(--danger)); font-size: 0.95rem;">1. Hak DSKT (Daerah / Konferens)</span>
                <span style="font-size: 1.25rem; font-weight: 800; color: hsl(var(--danger));">${pctDskt}%</span>
              </div>
              <div style="font-size: 0.82rem; color: hsl(var(--text-secondary)); line-height: 1.4;">
                Mencakup <strong>100% Persepuluhan</strong> + <strong>50% Persembahan Terpadu</strong>.
              </div>
              <div style="margin-top: 10px; font-weight: 700; font-size: 0.95rem; color: hsl(var(--text-primary)); display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(239,68,68,0.3); padding-top: 8px;">
                <span>Total Hak DSKT:</span>
                <span style="color: hsl(var(--danger)); font-size: 1.05rem;">${formatRupiah(totalHakDskt)}</span>
              </div>
            </div>

            <!-- Pos 2: Hak Kas Gereja -->
            <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); padding: 16px; border-radius: 14px; position: relative; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 800; color: hsl(var(--success)); font-size: 0.95rem;">2. Hak Kas Operasional Gereja</span>
                <span style="font-size: 1.25rem; font-weight: 800; color: hsl(var(--success));">${pctGereja}%</span>
              </div>
              <div style="font-size: 0.82rem; color: hsl(var(--text-secondary)); line-height: 1.4;">
                Mencakup <strong>50% Persembahan Terpadu</strong> + <strong>100% Khusus</strong> + <strong>Lain-lain</strong>.
              </div>
              <div style="margin-top: 10px; font-weight: 700; font-size: 0.95rem; color: hsl(var(--text-primary)); display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(34,197,94,0.3); padding-top: 8px;">
                <span>Total Hak Kas Gereja:</span>
                <span style="color: hsl(var(--success)); font-size: 1.05rem;">${formatRupiah(totalHakGereja)}</span>
              </div>
            </div>

            <!-- Pos 3: Hak Kas Pembangunan -->
            <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); padding: 16px; border-radius: 14px; position: relative; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 800; color: hsl(var(--accent-blue)); font-size: 0.95rem;">3. Hak Kas Pembangunan</span>
                <span style="font-size: 1.25rem; font-weight: 800; color: hsl(var(--accent-blue));">${pctPembangunan}%</span>
              </div>
              <div style="font-size: 0.82rem; color: hsl(var(--text-secondary)); line-height: 1.4;">
                Mencakup <strong>100% Persembahan Pembangunan</strong> untuk pemeliharaan gedung & proyek jemaat.
              </div>
              <div style="margin-top: 10px; font-weight: 700; font-size: 0.95rem; color: hsl(var(--text-primary)); display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(59,130,246,0.3); padding-top: 8px;">
                <span>Total Hak Pembangunan:</span>
                <span style="color: hsl(var(--accent-blue)); font-size: 1.05rem;">${formatRupiah(totalHakPembangunan)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; padding: 12px; background: rgba(212,175,55,0.08); border-radius: 10px; font-size: 0.8rem; color: hsl(var(--text-secondary));">
          <i data-lucide="check-circle-2" style="width: 15px; height: 15px; vertical-align: -2px; margin-right: 4px; color: hsl(var(--accent-gold));"></i>
          Pembagian otomatis menerapkan kebijakan <strong>50% Terpadu ke Daerah dan 50% ke Jemaat</strong>.
        </div>
      </div>
    </div>

    <!-- SECTION III: DISTRIBUSI PENGELUARAN PER DEPARTEMEN -->
    <div class="glass-card" style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
        <div>
          <h4 style="font-size: 1.15rem; font-weight: 800; color: hsl(var(--danger)); margin: 0; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="bar-chart-2" style="width: 22px; height: 22px;"></i> III. Peringkat Persentase Pengeluaran per Departemen Pelayanan
          </h4>
          <p style="font-size: 0.82rem; color: hsl(var(--text-secondary)); margin: 4px 0 0 0;">
            Menampilkan peringkat pos pengeluaran terbesar berdasarkan proporsi terhadap total pengeluaran dan serapan kas operasional jemaat.
          </p>
        </div>
        <span class="badge badge-dskt">${deptList.length} Departemen Aktif</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${deptList.map((d, index) => `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); padding: 14px 18px; border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background: rgba(239,68,68,0.2); color: hsl(var(--danger)); font-weight: 800; font-size: 0.78rem; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">#${index + 1}</span>
                <span style="font-weight: 800; font-size: 0.98rem; color: hsl(var(--text-primary));">${d.name}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="text-align: right;">
                  <div style="font-size: 0.72rem; color: hsl(var(--text-muted));">Serapan Kas Gereja:</div>
                  <div style="font-weight: 700; color: hsl(var(--warning)); font-size: 0.85rem;">${d.percentKas}% dari total dana</div>
                </div>
                <div style="text-align: right; min-width: 140px;">
                  <div style="font-weight: 800; font-size: 1.05rem; color: hsl(var(--danger));">${formatRupiah(d.amount)}</div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: hsl(var(--text-secondary));">${d.percentKeluar}% dari Total Pengeluaran</div>
                </div>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 5px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #ef4444, #f97316); width: ${d.percentKeluar}%; height: 100%; transition: width 0.6s ease;"></div>
            </div>
          </div>
        `).join('')}

        ${deptList.length === 0 ? `
          <div style="text-align: center; padding: 36px; color: hsl(var(--text-muted)); background: rgba(0,0,0,0.15); border-radius: 12px;">
            <i data-lucide="inbox" style="width: 40px; height: 40px; opacity: 0.5; margin-bottom: 10px;"></i>
            <div style="font-weight: 600; font-size: 0.95rem;">Belum ada pengeluaran tercatat untuk dianalisis persentasenya.</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- SECTION IV: RASIO KESEHATAN KAS -->
    <div class="glass-card">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
        <h4 style="font-size: 1.1rem; font-weight: 800; color: hsl(var(--success)); margin: 0; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="activity" style="width: 20px; height: 20px;"></i> IV. Indikator Rasio Efisiensi & Kesehatan Perbendaharaan
        </h4>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <!-- Rasio 1: Serapan Operasional -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 18px; border-radius: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Rasio Penyerapan Kas Operasional</span>
            <span style="font-weight: 800; font-size: 1.2rem; color: ${rasioPenyerapanGereja > 85 ? 'hsl(var(--danger))' : 'hsl(var(--success))'};">${rasioPenyerapanGereja}%</span>
          </div>
          <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 10px;">
            <div style="background: ${rasioPenyerapanGereja > 85 ? 'hsl(var(--danger))' : 'hsl(var(--success))'}; width: ${Math.min(rasioPenyerapanGereja, 100)}%; height: 100%;"></div>
          </div>
          <div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); line-height: 1.4;">
            Mengukur perbandingan antara <strong>Total Pengeluaran Gereja (${formatRupiah(summary.totalPengeluaranGereja)})</strong> terhadap <strong>Dana Kas Operasional Tersedia (${formatRupiah(totalKasTersediaGereja)})</strong>.
          </div>
        </div>

        <!-- Rasio 2: Kepatuhan DSKT -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 18px; border-radius: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; font-size: 0.92rem; color: hsl(var(--text-primary));">Rasio Kepatuhan Setoran DSKT</span>
            <span style="font-weight: 800; font-size: 1.2rem; color: ${rasioKepatuhanDskt >= 100 ? 'hsl(var(--success))' : 'hsl(var(--warning))'};">${rasioKepatuhanDskt}%</span>
          </div>
          <div style="background: rgba(255,255,255,0.06); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 10px;">
            <div style="background: ${rasioKepatuhanDskt >= 100 ? 'hsl(var(--success))' : 'hsl(var(--warning))'}; width: ${Math.min(rasioKepatuhanDskt, 100)}%; height: 100%;"></div>
          </div>
          <div style="font-size: 0.78rem; color: hsl(var(--text-secondary)); line-height: 1.4;">
            Mengukur perbandingan antara <strong>Dana Setoran ke Daerah (${formatRupiah(summary.totalUangDikirimDskt)})</strong> terhadap <strong>Total Kewajiban DSKT (${formatRupiah(totalKewajibanDskt)})</strong>.
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelector('#btn-back-dashboard-persentase')?.addEventListener('click', () => {
    if (typeof navigateTo === 'function') navigateTo('dashboard');
    else if (window.BendaharaApp?.navigateTo) window.BendaharaApp.navigateTo('dashboard');
  });

  container.querySelector('#btn-refresh-persentase')?.addEventListener('click', () => {
    renderPersentase(container, state, showToast);
    if (showToast) showToast("Analisis persentase berhasil diperbarui!", "success");
  });

  container.querySelector('#btn-print-persentase')?.addEventListener('click', () => {
    window.print();
  });
}
