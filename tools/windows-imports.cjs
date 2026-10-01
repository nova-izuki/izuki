// Read PE imports without launching the app or installing diagnostic tools.
const fs = require('node:fs');
const b = fs.readFileSync(process.argv[2]);
const pe = b.readUInt32LE(0x3c), opt = pe + 24;
const plus = b.readUInt16LE(opt) === 0x20b;
const sections = [];
for (let i = 0, p = opt + b.readUInt16LE(pe + 20); i < b.readUInt16LE(pe + 6); i++, p += 40)
  sections.push({ rva: b.readUInt32LE(p + 12), size: Math.max(b.readUInt32LE(p + 8), b.readUInt32LE(p + 16)), raw: b.readUInt32LE(p + 20) });
const offset = rva => { const s = sections.find(s => rva >= s.rva && rva < s.rva + s.size); if (!s) throw Error('Invalid RVA ' + rva); return s.raw + rva - s.rva; };
const str = p => b.toString('ascii', p, b.indexOf(0, p));
const imports = [];
for (let p = offset(b.readUInt32LE(opt + (plus ? 112 : 96) + 8)); b.readUInt32LE(p + 12); p += 20) {
  const dll = str(offset(b.readUInt32LE(p + 12))), symbols = [];
  for (let q = offset(b.readUInt32LE(p) || b.readUInt32LE(p + 16)); ; q += plus ? 8 : 4) {
    const n = plus ? b.readBigUInt64LE(q) : BigInt(b.readUInt32LE(q));
    if (!n) break;
    symbols.push(n & (1n << BigInt(plus ? 63 : 31)) ? '#' + (n & 0xffffn) : str(offset(Number(n)) + 2));
  }
  imports.push({ dll, symbols });
}
console.log(JSON.stringify(imports));
