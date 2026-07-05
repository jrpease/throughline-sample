# Design System Quality Retrofit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the greenfield `throughline-sample` up to the plugin's v0.13 quality bar — per-category token architecture, WCAG 2.2 AA colors, complete components, a shadow-based focus ring, and zero Figma↔code drift.

**Architecture:** Figma is the source of truth. All variable/style/component changes are made in the Figma file via the figma-console MCP bridge, verified by read-back + contrast math + screenshots, then flowed to code with `/sync-figma-tokens`. A repo-committed `tokens:a11y` check gates the color work: it fails on today's values and passes only after the corrected tokens land.

**Tech Stack:** Figma (figma-console MCP bridge), DTCG token JSON, Style Dictionary, pnpm + Turborepo, React + Tailwind (`cva`), Storybook + Chromatic. Node ≥ 18, pnpm.

## Global Constraints

- **Figma-first.** Never hand-edit token/component code ahead of Figma. Code is generated via `/sync-figma-tokens`.
- **Figma file:** key `OCiZiGpsJ4ncPD8r205BjC` ("Throughline Plugin Test"). Verify with `figma_get_status({probe:true})` before any write; abort if `currentFileKey` differs.
- **A11y bar:** WCAG 2.2 AA — 4.5:1 body text, 3:1 large text / non-text UI (borders, focus). Focus ring ≥3:1 vs adjacent (2.4.11).
- **Brand look:** keep near-black-on-green (`text.onBrand` / `brand.onPrimary` = `gray.950`). Do not change brand hues.
- **Figma default mode is Dark** (`4:1`); Light is `4:2`. Preserve Dark as the default mode in `Color / Semantic`. Never pin a node's mode without cause.
- **Never hardcode values** in code — consume tokens via Tailwind theme classes or `var(--*)`.
- **Deterministic naming:** Figma component name == code component name.
- **Chromatic:** full snapshots, **TurboSnap OFF** (token changes are global).
- **Component state set (canonical):** `default · hover · focus · active · disabled` (+ `error` where validated, + `selected`/`checked` where applicable).
- Every Figma write is followed by a read-back (`figma_get_variables` / `figma_analyze_component_set`) and, for visual nodes, a `figma_take_screenshot`.

**New gray ramp (target hex):**
```
0 #FFFFFF   200 #D1D1D1   500 #747474   800 #353535
50 #F9F9F9  300 #BBBBBB   600 #5E5E5E   900 #242424
100 #EBEBEB 400 #8E8E8E   700 #494949   950 #181818
```
**Semantic color remap (gray-derived; Light / Dark):** `bg.canvas` 0/950 · `bg.subtle` 50/900 · `bg.muted` 100/800 · `bg.inverse` 900/0 · `text.primary` 900/50 · `text.secondary` 600/300 · `text.disabled` 500/500 · `text.onBrand` 950/950 · `border.default` 400/500 · `border.subtle` 200/700 · `brand.onPrimary` 950/950.

---

## File / surface map

**Figma (source of truth):**
- Collections created: `Color / Primitives`, `Color / Semantic` (Light/Dark), `Space / Primitives`, `Space / Semantic`, `Radius / Primitives`, `Type / Primitives`.
- New effect style: `Focus Ring`.
- Collections deleted (end): old `Primitives`, old `Semantic`.
- Components: promote `Tooltip`, `Select Menu`, `Select Menu Item` to sets; focus-ring swap on all interactive sets.

**Code (generated + hand-wired glue):**
- Create: `packages/tokens/scripts/check-a11y.mjs` — contrast gate.
- Modify: `packages/tokens/package.json` — add `tokens:a11y` script.
- Modify (via sync): `packages/tokens/dtcg/*.json`, `packages/tokens/build/**` — new grays, teal, focus tokens.
- Modify: `packages/ui/src/styles/global.css` — `--shadow-focus` definition.
- Modify: `packages/ui/src/components/**/*.tsx` — replace `ring-*` utilities with the shared focus ring.
- Modify: `packages/ui/src/index.ts` — export any new teal-based tokens if surfaced.
- Modify: root `design-system.json`, `HANDOFF.md` — state update.

---

# Phase 0 — Baseline & safety gate

### Task 0.1: Commit the a11y contrast gate (red on current tokens)

**Files:**
- Create: `packages/tokens/scripts/check-a11y.mjs`
- Modify: `packages/tokens/package.json` (add script)

**Interfaces:**
- Produces: `pnpm --filter @throughline/tokens tokens:a11y` — exits 0 if all pairs pass, 1 otherwise; prints a per-pair table.
- Consumes: `packages/tokens/dtcg/primitives.json`, `semantic.light.json`, `semantic.dark.json` (resolves `{color.x.y}` aliases to hex).

- [ ] **Step 1: Write the checker**

```js
// packages/tokens/scripts/check-a11y.mjs
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
```

- [ ] **Step 2: Add the script**

In `packages/tokens/package.json`, add to `"scripts"`:
```json
"tokens:a11y": "node scripts/check-a11y.mjs"
```

- [ ] **Step 3: Run it — expect RED (proves the gate detects today's failures)**

Run: `pnpm --filter @throughline/tokens tokens:a11y`
Expected: FAIL lines for `border.default / canvas` (~1.55 light, ~1.27 dark) and possibly `text.disabled`; process exits 1.

> Note: `text.link` key exists in both semantic files (`text.link`). If a pair errors on a missing key, that itself is a drift finding — record it, don't silently skip.

- [ ] **Step 4: Commit**

```bash
git add packages/tokens/scripts/check-a11y.mjs packages/tokens/package.json
git commit -m "test(tokens): add tokens:a11y contrast gate (currently red)"
```

### Task 0.2: Capture the Chromatic baseline

**Files:** none (CI/snapshot state only)

- [ ] **Step 1: Build Storybook to confirm it compiles**

Run: `cd packages/ui && pnpm build-storybook`
Expected: builds with no errors (baseline of the *current* look).

- [ ] **Step 2: Record the current Chromatic build as the comparison baseline**

Run the existing Chromatic workflow (push to the branch, or `npx chromatic --project-token $CHROMATIC_PROJECT_TOKEN` if run locally). Note the resulting build number in the PR description — every later change diffs against it.
Expected: a green baseline build with all current stories snapshotted.

---

# Phase 1 — Token architecture migration (Figma)

> All tasks: first `figma_get_status({probe:true})` and confirm `currentFileKey === "OCiZiGpsJ4ncPD8r205BjC"`.

### Task 1.1: Create per-category primitive collections + copy values

**Interfaces:**
- Produces: collections `Color / Primitives`, `Space / Primitives`, `Radius / Primitives`, `Type / Primitives`, each with a single default mode `Value`, populated with the **current** primitive values (gray unchanged *for now* — the ramp change is Phase 2).

- [ ] **Step 1: Create the four collections** via `figma_create_variable_collection` (one call each): `Color / Primitives`, `Space / Primitives`, `Radius / Primitives`, `Type / Primitives`.

- [ ] **Step 2: Populate each** with the existing primitives using `figma_batch_create_variables`, preserving names verbatim (`color/green/500`, `space/4`, `radius/md`, `font/size/200`, …). Include the existing `color/teal/*` ramp in `Color / Primitives`. Copy current hex/number values exactly (no value changes this phase).

- [ ] **Step 3: Read back** with `figma_get_variables({format:'filtered', collection:'Color / Primitives'})` and assert counts: colors = 7 ramps (green/blue/red/amber/purple/gray/teal) + white → match source. Repeat for space/radius/type.
Expected: variable counts equal the originals; no `Value`-mode surprises.

- [ ] **Step 4: Screenshot + note** — no visual node yet; record the read-back JSON in the task log.

### Task 1.2: Create semantic collections (mode axis only on color)

**Interfaces:**
- Produces: `Color / Semantic` with modes **Dark (default), Light**; `Space / Semantic` single mode. Aliases point at the **new** primitive collections from Task 1.1.

- [ ] **Step 1: Create `Color / Semantic`** via `figma_create_variable_collection`; add the second mode with `figma_add_mode`; set names so **Dark is the default mode** (`figma_rename_mode` as needed). Create `Space / Semantic` (single `Value` mode).

- [ ] **Step 2: Create the semantic variables** with `figma_batch_create_variables`, aliasing to the new primitives — reproduce the current mapping exactly (still old grays): `color/bg/*`, `color/text/*`, `color/border/*`, `color/brand/*`, `color/secondary/default`, `color/accent/default`, `color/accent/tealSubtle`, `color/success|warning|danger|info/default`; and `space/inset/*`, `space/gap/*`. Keep both Light and Dark values per the current file.

- [ ] **Step 3: Read back** `figma_get_variables({format:'filtered', collection:'Color / Semantic', resolveAliases:true})`; assert every semantic resolves and Light/Dark both present; assert 0 aliases still point at the *old* `Primitives` collection.
Expected: all aliases resolve to `Color / Primitives`.

- [ ] **Step 4: Commit checkpoint (Figma-side)** — record collection IDs in the task log for the cleanup phase. (No code commit; Figma is the artifact.)

---

# Phase 2 — Gray ramp + remap + focus system (Figma)

### Task 2.1: Apply the re-derived gray ramp

- [ ] **Step 1: Update the 12 gray primitives** in `Color / Primitives` via `figma_batch_update_variables` to the target hex (see Global Constraints ramp table).

- [ ] **Step 2: Read back** `figma_get_variables({format:'filtered', namePattern:'color/gray', resolveAliases:true})`; assert each hex equals the target.
Expected: exact match on all 12.

### Task 2.2: Apply the semantic color remap

- [ ] **Step 1: Re-point the gray-derived semantics** in `Color / Semantic` (Light & Dark) via `figma_batch_update_variables` per the remap table (Global Constraints): `bg.*`, `text.primary/secondary/disabled/onBrand`, `border.default/subtle`, `brand.onPrimary`. Leave hue semantics (brand/secondary/accent/success/danger/info) as-is except warning (Task 2.3).

- [ ] **Step 2: Read back resolved values** and screenshot the Foundations page (`figma_take_screenshot`) to eyeball surfaces/borders.
Expected: borders now visibly darker; dark `bg.muted` (800) ≠ `border.default` (500).

### Task 2.3: Warning split + focus tokens + Focus Ring effect style

**Interfaces:**
- Produces: `focus/ring` (= green.600 light / green.500 dark), `focus/ringWidth` = 2, `focus/ringOffset` = 2 in `Color / Semantic` (color) and a numeric collection as appropriate; a **`Focus Ring`** effect style.

- [ ] **Step 1: Warning split** — set `color/warning/default` Light → `amber.700` (text-safe, 5.02:1); keep Dark → `amber.400`. If a separate fill vs text warning is desired, add `color/warning/fill` → `amber.600`. Read back.

- [ ] **Step 2: Create focus tokens** — `color/focus/ring` (Light `green.600`, Dark `green.500`); add `focus/ringWidth`=2 and `focus/ringOffset`=2 (as FLOAT variables in a suitable collection, e.g. `Radius / Primitives` renamed intent or a small `Effect / Primitives` — keep it discoverable). Read back.

- [ ] **Step 3: Create the `Focus Ring` effect style** via `figma_execute` — a two-layer drop shadow, `blur:0`: inner layer spread=`ringOffset` colored `bg.canvas`; outer layer spread=`ringOffset+ringWidth` colored `focus.ring`. Bind colors to the variables where the API allows; otherwise set resolved values per mode and note the binding limitation.

- [ ] **Step 4: Verify** — `figma_get_styles` shows `Focus Ring`; apply it to a scratch frame and `figma_take_screenshot` to confirm the offset ring renders on both a white and a green swatch.
Expected: ring visible with a clean gap on both.

---

# Phase 3 — Drift reconciliation (Figma)

### Task 3.1: Rename `bg/Base` → `bg/canvas`; confirm teal promotion staged

- [ ] **Step 1: Rename** the semantic variable `color/bg/Base` to `color/bg/canvas` via `figma_rename_variable` in `Color / Semantic`. Re-point any consumers still referencing the old name (search components/styles).

- [ ] **Step 2: Confirm teal** — `color/teal/*` present in `Color / Primitives` and `color/accent/tealSubtle` present in `Color / Semantic` (Light→teal.100, Dark→teal.900). These sync to code in Phase 6.

- [ ] **Step 3: Read back** `figma_get_variables({namePattern:'bg/canvas'})` and `namePattern:'teal'`; assert `bg/Base` no longer exists and `bg/canvas` resolves.
Expected: name unified; teal staged.

---

# Phase 4 — Component correctness + focus ring (Figma)

### Task 4.1: Per-component variant audit

- [ ] **Step 1: Audit all 15** — for each set run `figma_analyze_component_set` and `figma_audit_component_accessibility`; for the three single components (`Tooltip`, `Select Menu`, `Select Menu Item`) run `figma_get_component_details`. Produce a matrix: present variants vs. the canonical state set (Global Constraints).

- [ ] **Step 2: Record** the gap matrix in the task log. Expected output: explicit list of missing `type × size × state` cells per component.

### Task 4.2: Promote single components to sets; fill state gaps

- [ ] **Step 1: `Select Menu Item`** — build a component set with states `default · hover · focus · selected · disabled` (bind to semantic tokens; hover→`bg.subtle`, selected→`accent.tealSubtle` or `bg.muted` per design). Screenshot-verify.

- [ ] **Step 2: `Select Menu`** — compose the item set; ensure it references the item component (instance) rather than duplicating.

- [ ] **Step 3: `Tooltip`** — promote to a set with side/placement variants (top/right/bottom/left) at minimum. Screenshot-verify.

- [ ] **Step 4: Fill any other gaps** found in 4.1 across the 12 existing sets (missing states/sizes), binding to semantic tokens only.

### Task 4.3: Swap focus states to the Focus Ring effect style

- [ ] **Step 1:** For every interactive set's `focus`/`focus-visible` variant, remove the old border-color-swap focus treatment and apply the `Focus Ring` effect style. For validated controls (`Input`, `Textarea`, `Select`) in `error` state, use a red ring (bind ring color to `danger` for that variant).

- [ ] **Step 2: Screenshot** each focus variant; confirm the ring is present and offset.
Expected: consistent ring across Button/Input/Select/Checkbox/Radio/Switch/etc.

### Task 4.4: Re-verify bindings (no hardcoded values)

- [ ] **Step 1:** Run `figma_lint_design` (or `figma_scan_code_accessibility` where relevant) across the components page; assert no raw color fills — everything bound to `Color / Semantic`.
Expected: lint clean; any raw value flagged is fixed and re-scanned.

---

# Phase 5 — Cleanup (Figma)

### Task 5.1: Zero-reference check, then delete the old collections

- [ ] **Step 1: Zero-reference scan** — via `figma_execute`, walk all nodes/styles/variables and assert nothing still aliases the **old** `Primitives` (`VariableCollectionId:3:2`) or **old** `Semantic` (`VariableCollectionId:4:112`). Print any stragglers.
Expected: empty straggler list. If not empty, re-bind and re-run — do **not** delete yet.

- [ ] **Step 2: Delete** the old `Primitives` and `Semantic` collections via `figma_delete_variable_collection` (only after Step 1 is empty).

- [ ] **Step 3: Read back** `figma_get_variables({format:'summary'})`; assert exactly the six new collections remain and modes are correct (Dark default on `Color / Semantic`).
Expected: clean per-category structure; total collections = 6.

---

# Phase 6 — Sync to code

### Task 6.1: Run the token sync

**Files (generated):** `packages/tokens/dtcg/*.json`, `packages/tokens/build/**`

- [ ] **Step 1:** Run `/sync-figma-tokens` (token-sync-layer). It re-extracts Figma variables, rewrites DTCG, and rebuilds Style Dictionary outputs. Ensure the adapter emits: new grays, the `teal` ramp, `accent.tealSubtle`, `focus/*` tokens, and the `bg.canvas` name.

- [ ] **Step 2:** Inspect the DTCG diff. Expected: gray hex updated; `color.teal.*` + `accent.tealSubtle` added; `focus` tokens added; `bg.Base`→`bg.canvas`; **no unrelated churn**.

- [ ] **Step 3: Run the a11y gate — expect GREEN now**

Run: `pnpm --filter @throughline/tokens tokens:a11y`
Expected: `ALL PASS`, exit 0 (the same gate that was red in Task 0.1).

- [ ] **Step 4: Commit the generated tokens**

```bash
git add packages/tokens
git commit -m "feat(tokens): sync re-derived grays, teal, focus tokens from Figma"
```

### Task 6.2: Wire the shadow-based focus ring in code

**Files:**
- Modify: `packages/ui/src/styles/global.css`
- Modify: `packages/ui/src/components/**/*.tsx` (Button, Input, Textarea, Select, Checkbox, Radio, Switch, and any other focusable)

- [ ] **Step 1: Define the ring token** in `packages/ui/src/styles/global.css`:

```css
:root {
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --shadow-focus:
    0 0 0 var(--focus-ring-offset) var(--color-bg-canvas),
    0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--color-focus-ring);
  --shadow-focus-danger:
    0 0 0 var(--focus-ring-offset) var(--color-bg-canvas),
    0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--color-danger-default);
}
```

- [ ] **Step 2: Replace the Button focus utility.** In `packages/ui/src/components/Button/Button.tsx`, change the base string's focus segment from `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` to:
```
focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]
```

- [ ] **Step 3: Replace Input/Textarea/Select focus.** In `packages/ui/src/components/Input/Input.tsx`, replace `focus-within:ring-2` + `focus-within:ring-ring` / `focus-within:ring-destructive` with `focus-within:[box-shadow:var(--shadow-focus)]` and, for the error branch, `focus-within:[box-shadow:var(--shadow-focus-danger)]`. Apply the same swap to `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`.

- [ ] **Step 4: Typecheck**

Run: `cd packages/ui && pnpm typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src
git commit -m "feat(ui): shadow-based offset focus ring across interactive components"
```

### Task 6.3: Build + verify code

- [ ] **Step 1:** Run `cd packages/ui && pnpm build-storybook`. Expected: compiles clean.
- [ ] **Step 2:** Run `pnpm --filter @throughline/tokens tokens:a11y`. Expected: ALL PASS (regression guard).
- [ ] **Step 3:** Start `pnpm storybook`; spot-check Button/Input focus rings (Tab through), disabled text legibility, dark-mode borders. Expected: rings visible + offset; borders visible; disabled legible.

### Task 6.4: Chromatic review

- [ ] **Step 1:** Push the branch; let the Chromatic workflow run (TurboSnap OFF). 
- [ ] **Step 2:** Review diffs vs. the Phase 0 baseline. Expected deltas only: visible borders, deeper dark surfaces, legible disabled text, new focus rings, teal availability. Accept; investigate anything else.

---

# Phase 7 — Foundations page + manifest

### Task 7.1: Refresh the Foundations page

- [ ] **Step 1:** Regenerate/refresh the Figma Foundations page so swatches reflect the new grays, teal ramp, and a focus-ring sample. Use the token-sheet-builder flow. `figma_take_screenshot` to confirm.
- [ ] **Step 2:** Re-export the README asset `.github/assets/foundations.png` from the refreshed page.

### Task 7.2: Update manifest + handoff

**Files:** `design-system.json`, `HANDOFF.md`

- [ ] **Step 1:** Update `design-system.json`: `tokens.collections` → the six new collections; `tokens.lastSync`, `sync.lastRun` → now; add teal to any palette record; bump `components.meta` for the three promoted components (→ `final`); note focus-ring adoption.
- [ ] **Step 2:** Add a HANDOFF entry summarizing the retrofit (architecture, ramp, focus ring, teal, drift fixed).
- [ ] **Step 3: Commit**

```bash
git add design-system.json HANDOFF.md .github/assets/foundations.png
git commit -m "docs: refresh Foundations + manifest after a11y retrofit"
```

- [ ] **Step 4: Open the PR** against `main` summarizing the five threads; link the Chromatic build and the green `tokens:a11y` run.

---

## Self-review notes

- **Spec coverage:** Thread 1 → Phases 1,5; Thread 2 → Phase 2 + a11y gate (0.1/6.1); Thread 3 → Phase 4; Thread 4 (drift) → Phase 3 + 6.1; Thread 5 (focus) → 2.3, 4.3, 6.2. Baseline/validation → Phase 0, 6.3–6.4, 7. ✔ all threads mapped.
- **Ordering:** grays/remap (P2) precede component focus-swap (P4) so components bind to corrected tokens; old collections deleted only after zero-reference (P5); sync (P6) after Figma is final.
- **A11y arc:** the same `tokens:a11y` gate is red in 0.1 and green in 6.1/6.3 — the plan's red→green anchor.
- **Known soft spots (not placeholders, genuine audit-time work):** the exact per-component variant gaps (4.1) and whether `focus/ringWidth`/`ringOffset` live as FLOAT variables vs. constants depend on read-back; each has an explicit audit/verify step rather than an assumed answer.
