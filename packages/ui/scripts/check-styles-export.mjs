import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(dir, '../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const sub = pkg.exports?.['./styles'];
if (!sub) {
  console.error('FAIL: package.json exports["./styles"] is missing');
  process.exit(1);
}
const target = resolve(dirname(pkgPath), sub);
if (!existsSync(target)) {
  console.error(`FAIL: exports["./styles"] -> ${sub} does not resolve to a file (${target})`);
  process.exit(1);
}
const css = readFileSync(target, 'utf8');
if (css.trim().length === 0) {
  console.error(`FAIL: ${sub} resolved but is empty`);
  process.exit(1);
}
// Sanity: the styles entry must pull in the base styles (proves the import chain is intact).
if (!css.includes('@import')) {
  console.error(`FAIL: ${sub} has no @import — expected it to bundle global.css/focus.css`);
  process.exit(1);
}
console.log(`PASS: @ds/ui/styles -> ${sub} resolves, non-empty, imports base styles.`);
