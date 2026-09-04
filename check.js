const fs = require('fs');
const acorn = require('acorn');
const code = fs.readFileSync('js/app_v7.js', 'utf8');
try {
  acorn.parse(code, { ecmaVersion: 2020 });
  console.log('No syntax errors found by Acorn!');
} catch (e) {
  console.log('Syntax error at line ' + e.loc.line + ' column ' + e.loc.column);
  console.log(e.message);
  const lines = code.split('\n');
  console.log('---');
  console.log(lines[e.loc.line - 2]);
  console.log(lines[e.loc.line - 1]);
  console.log(lines[e.loc.line]);
}
