// Daftar Resmi 30 Kategori Departemen Pengeluaran Gereja Masehi Advent Hari Ketujuh (GMAHK)
export const EXPENDITURE_DEPARTMENTS = [
  { id: 1, name: "Sosial/Pendidikan Teratai", icon: "heart-handshake", category: "Sosial & Pendidikan" },
  { id: 2, name: "Pelmas", icon: "users", category: "Pelayanan Masyarakat" },
  { id: 3, name: "Gembala Jemaat/Pendeta", icon: "book-open", category: "Pelayanan Rohani" },
  { id: 4, name: "Perlawatan: Sakit,Lahir Dukacita,Pernikahan", icon: "home", category: "Pelayanan Rohani" },
  { id: 5, name: "Koster Gereja", icon: "key", category: "Operasional & Staf" },
  { id: 6, name: "Administrator Gereja", icon: "briefcase", category: "Operasional & Staf" },
  { id: 7, name: "Pemeliharaan Snd.System, AC Dll", icon: "tool", category: "Pemeliharaan Gedung" },
  { id: 8, name: "Bendahara", icon: "dollar-sign", category: "Operasional & Staf" },
  { id: 9, name: "Air - ATB", icon: "droplet", category: "Utilitas" },
  { id: 10, name: "Listrik Gereja - PLN", icon: "zap", category: "Utilitas" },
  { id: 11, name: "Listrik R.Pastory/R. Serbaguna - PLN", icon: "zap-off", category: "Utilitas" },
  { id: 12, name: "Telephone /Kuota Internet/ Zoom", icon: "wifi", category: "Utilitas & Komunikasi" },
  { id: 13, name: "Rumah Tangga", icon: "coffee", category: "Operasional & Staf" },
  { id: 14, name: "P P + KPA +Retreat + Penginjilan", icon: "compass", category: "Pelayanan & Penginjilan" },
  { id: 15, name: "Pathfinder + Acara jemaat", icon: "flag", category: "Pemuda & Anak" },
  { id: 16, name: "Sekretaris", icon: "file-text", category: "Operasional & Staf" },
  { id: 17, name: "Diakon", icon: "shield", category: "Pelayanan Rohani" },
  { id: 18, name: "Komunikasi", icon: "share-2", category: "Utilitas & Komunikasi" },
  { id: 19, name: "Sekolah Sabat Dewasa + Anak2", icon: "book", category: "Pelayanan Rohani" },
  { id: 20, name: "Air Minum Gereja", icon: "cup-soda", category: "Utilitas" },
  { id: 21, name: "Diakones", icon: "heart", category: "Pelayanan Rohani" },
  { id: 22, name: "Poutluck + Konsumsi lainnya", icon: "utensils", category: "Acara & Konsumsi" },
  { id: 23, name: "PA CMG", icon: "smile", category: "Pemuda & Anak" },
  { id: 24, name: "Project/Maintenance/Others", icon: "hammer", category: "Pemeliharaan Gedung" },
  { id: 25, name: "Pertarakan Kesehatan", icon: "activity", category: "Pelayanan & Penginjilan" },
  { id: 26, name: "Musik & Biduan", icon: "music", category: "Pelayanan Rohani" },
  { id: 27, name: "BWA", icon: "sun", category: "Pelayanan Rohani" },
  { id: 28, name: "Proposal dari Jemaat lain", icon: "mail", category: "Sosial & Pendidikan" },
  { id: 29, name: "Lingkungan Gereja kebersihan Lingkungan", icon: "trash-2", category: "Pemeliharaan Gedung" },
  { id: 30, name: "Lain Lain", icon: "more-horizontal", category: "Lain-lain" }
];

export function getDepartmentById(id) {
  return EXPENDITURE_DEPARTMENTS.find(dep => dep.id === Number(id)) || EXPENDITURE_DEPARTMENTS[29];
}

export function getDepartmentByName(name) {
  return EXPENDITURE_DEPARTMENTS.find(dep => dep.name.toLowerCase() === name.toLowerCase()) || EXPENDITURE_DEPARTMENTS[29];
}
