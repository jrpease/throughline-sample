import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const dir = dirname(fileURLToPath(import.meta.url));
const dtcg = (f) => JSON.parse(readFileSync(join(dir, '../dtcg', f), 'utf8'));
const prims = dtcg('primitives.json');
const modes = { light: dtcg('semantic.light.json'), dark: dtcg('semantic.dark.json') };

const prim = (ref) => { // "{color.gray.900}" -> hex
  const path = ref.replace(/[{}]/g, '').split('.');
  let n = prims; for (const k of path) n = n[k];
  return n.$value;
};
const resolve = (mode, ...path) => { // semantic path -> hex
  let n = modes[mode].color; for (const k of path) n = n[k];
  const v = n.$value;
  return v.startsWith('{') ? prim(v) : v;
};
const rgb = (h) => h.replace('#','').match(/../g).map((x) => parseInt(x, 16));
const lin = (c) => { c/=255; return c<=0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
const L = (h) => { const [r,g,b]=rgb(h); return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b); };
const cr = (a,b) => { const x=L(a),y=L(b),hi=Math.max(x,y),lo=Math.min(x,y); return (hi+0.05)/(lo+0.05); };

// [label, fg-hex, bg-hex, threshold]
const pairs = (m) => {
  const c = (...p) => resolve(m, ...p);
  const canvas=c('bg','canvas'), subtle=c('bg','subtle'), muted=c('bg','muted');
  return [
    ['text.primary / canvas',   c('text','primary'),   canvas, 4.5],
    ['text.secondary / muted',   c('text','secondary'), muted,  4.5],
    ['text.disabled / canvas',   c('text','disabled'),  canvas, 3.0], // exempt; we still gate >=3
    ['border.default / canvas',  c('border','default'), canvas, 3.0],
    ['onBrand / brand.primary',  c('text','onBrand'),   c('brand','primary'), 4.5],
    ['link / canvas',            c('text','link'),      canvas, 4.5],
    ['focus.ring / canvas',      c('border','focus'),   canvas, 3.0],
  ];
};

let failed = 0;
for (const m of ['light','dark']) {
  console.log(`\n=== ${m.toUpperCase()} ===`);
  for (const [label, fg, bg, thr] of pairs(m)) {
    const r = cr(fg, bg); const ok = r >= thr;
    if (!ok) failed++;
    console.log(`${ok?'PASS':'FAIL'}  ${r.toFixed(2).padStart(6)} (need ${thr})  ${label}`);
  }
}
console.log(`\n${failed === 0 ? 'ALL PASS' : failed + ' FAILURES'}`);
process.exit(failed === 0 ? 0 : 1);
