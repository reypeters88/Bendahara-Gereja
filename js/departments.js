// Daftar Resmi 30 Kategori Departemen Pengeluaran Gereja Masehi Advent Hari Ketujuh (GMAHK)
export const EXPENDITURE_DEPARTMENTS = [
  { id: 6001, name: "Sosial/Pendidikan Teratai", icon: "heart-handshake", category: "Sosial & Pendidikan" },
  { id: 6002, name: "Pelmas", icon: "users", category: "Pelayanan Masyarakat" },
  { id: 6003, name: "Gembala Jemaat/Pendeta", icon: "book-open", category: "Pelayanan Rohani" },
  { id: 6004, name: "Perlawatan: Sakit,Lahir Dukacita,Pernikahan", icon: "home", category: "Pelayanan Rohani" },
  { id: 6005, name: "Koster Gereja", icon: "key", category: "Operasional & Staf" },
  { id: 6006, name: "Administrator Gereja", icon: "briefcase", category: "Operasional & Staf" },
  { id: 6007, name: "Pemeliharaan Snd.System, AC Dll", icon: "tool", category: "Pemeliharaan Gedung" },
  { id: 6008, name: "Bendahara", icon: "dollar-sign", category: "Operasional & Staf" },
  { id: 6009, name: "Air - ATB", icon: "droplet", category: "Utilitas" },
  { id: 6010, name: "Listrik Gereja - PLN", icon: "zap", category: "Utilitas" },
  { id: 6011, name: "Listrik R.Pastory/R. Serbaguna - PLN", icon: "zap", category: "Utilitas" },
  { id: 6012, name: "Telephone /Kuota Internet/ Zoom", icon: "wifi", category: "Utilitas" },
  { id: 6013, name: "Rumah Tangga", icon: "home", category: "Operasional & Staf" },
  { id: 6014, name: "P P + KPA +Retreat + Penginjilan", icon: "star", category: "Kependetaan & Anak" },
  { id: 6015, name: "Pathfinder + Acara jemaat", icon: "flag", category: "Kependetaan & Anak" },
  { id: 6016, name: "Sekretaris", icon: "clipboard", category: "Operasional & Staf" },
  { id: 6017, name: "Diakon", icon: "user", category: "Departemen Gereja" },
  { id: 6018, name: "Komunikasi", icon: "radio", category: "Departemen Gereja" },
  { id: 6019, name: "Sekolah Sabat Dewasa + Anak2", icon: "book", category: "Pelayanan Rohani" },
  { id: 6020, name: "Air Minum Gereja", icon: "coffee", category: "Utilitas" },
  { id: 6021, name: "Diakones", icon: "user-check", category: "Departemen Gereja" },
  { id: 6022, name: "Poutluck + Konsumsi lainnya", icon: "utensils", category: "Operasional & Staf" },
  { id: 6023, name: "PA CMG", icon: "users", category: "Departemen Gereja" },
  { id: 6024, name: "Project/Maintenance/Others", icon: "hammer", category: "Pemeliharaan Gedung" },
  { id: 6025, name: "Pertarakan Kesehatan", icon: "activity", category: "Kesehatan" },
  { id: 6026, name: "Musik & Biduan", icon: "music", category: "Departemen Gereja" },
  { id: 6027, name: "BWA", icon: "smile", category: "Kependetaan & Anak" },
  { id: 6028, name: "Proposal dari Jemaat lain", icon: "file-text", category: "Sosial & Pendidikan" },
  { id: 6029, name: "Lingkungan Gereja kebersihan Lingkungan", icon: "sun", category: "Pemeliharaan Gedung" },
  { id: 6030, name: "Lain Lain", icon: "more-horizontal", category: "Lain-lain" }
];

export function getDepartmentById(id) {
  const numId = Number(id);
  const searchId = (numId >= 1 && numId <= 30) ? 6000 + numId : numId;
  return EXPENDITURE_DEPARTMENTS.find(dep => dep.id === searchId) || EXPENDITURE_DEPARTMENTS[29];
}

export function getDepartmentByName(name) {
  return EXPENDITURE_DEPARTMENTS.find(dep => dep.name.toLowerCase() === name.toLowerCase()) || EXPENDITURE_DEPARTMENTS[29];
}
