const fs = require('fs');
const f = 'g:/My Drive/Apiksi/Gereja/js/app_v7.js';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/placeholder=".*?Ketik awal\/tengah\/akhir nama atau pilih dari daftar\.\.\."/, 'placeholder="🔍 Ketik awal/tengah/akhir nama atau pilih dari daftar..."');
fs.writeFileSync(f, c);
console.log("Fixed placeholder.");
