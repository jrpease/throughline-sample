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
// parse #RGB/#RRGGBB (a=1) or #RRGGBBAA (alpha carried) into {r,g,b,a}
const parse = (h) => { const x = h.replace('#','').match(/../g).map((v) => parseInt(v, 16)); return { r:x[0], g:x[1], b:x[2], a: x[3] === undefined ? 1 : x[3]/255 }; };
const lin = (c) => { c/=255; return c<=0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
const lum = ({r,g,b}) => 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
// composite a (possibly translucent) foreground onto a solid background — matches how the browser renders it
const over = (fg, bg) => ({ r: fg.r*fg.a+bg.r*(1-fg.a), g: fg.g*fg.a+bg.g*(1-fg.a), b: fg.b*fg.a+bg.b*(1-fg.a) });
const cr = (a,b) => { const bg = parse(b), fg = over(parse(a), bg); const x=lum(fg),y=lum(bg),hi=Math.max(x,y),lo=Math.min(x,y); return (hi+0.05)/(lo+0.05); };

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
    ['border.focus / canvas',    c('border','focus'),   canvas, 3.0],
    // The shadow focus ring: composited over canvas at its actual alpha, it must still clear 3:1 (WCAG 2.4.11).
    // A translucent ring (alpha<1) that drops below 3:1 will fail here instead of silently passing.
    ['focus.ring / canvas',      c('focus','ring'),     canvas, 3.0],
    // Neutral ring for solid-filled controls (brand/destructive) — must clear 3:1 against the page.
    ['focus.ringOnFill / canvas', c('focus','ringOnFill'), canvas, 3.0],
    // --- Interactive STATE fills (default-state checks above miss these) ---
    // Primary button, text = onBrand (near-black), across hover/active fills.
    ['onBrand / brand.primaryHover',  c('text','onBrand'), c('brand','primaryHover'),  4.5],
    ['onBrand / brand.primaryActive', c('text','onBrand'), c('brand','primaryActive'), 4.5],
    // Secondary button, text = text.primary, across its fill + hover/active fill.
    ['text.primary / bg.muted',        c('text','primary'), muted,                 4.5],
    ['text.primary / bg.mutedActive',  c('text','primary'), c('bg','mutedActive'), 4.5],
    // Destructive button: white-ish text on the danger fill; and danger as a non-text border/ring.
    ['destructiveFg / danger.default', prim('{color.gray.50}'), c('danger','default'), 4.5],
    ['danger.default / canvas (border+ring)', c('danger','default'), canvas,           3.0],
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
