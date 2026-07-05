# Design System Quality Retrofit — v0.13 Representation

_Spec — 2026-07-05_

## Purpose

The `throughline-sample` repo is the public case study for the ThroughLine plugin
(the plugin README links to it directly). It was built on plugin **v0.2.0**; the plugin
is now **v0.13.0**. The system still works, but it no longer represents the plugin's
current quality bar. This is a **quality overhaul of the existing greenfield sample** —
we keep the greenfield "blank Figma file → synced code" story, and raise the token
architecture, color accessibility, and component correctness to what v0.13.0 produces.

**Source of truth is Figma.** Every change lands in the Figma file first
(`OCiZiGpsJ4ncPD8r205BjC`, "Throughline Plugin Test"), then flows to code via
`/sync-figma-tokens`. Code is never hand-edited ahead of Figma.

## Goals

1. **Token architecture** — migrate the flat two-collection setup to the canonical
   v0.13.0 shape: one collection per category per tier, so mode axes attach only where
   they belong.
2. **Color accessibility** — meet **WCAG 2.2 AA for text _and_ non-text** (4.5:1 body,
   3:1 large text / UI boundaries). Re-derive the gray ramp on an even perceptual curve.
3. **Component correctness** — every component is a proper variant matrix with a complete
   state set, bound to semantic tokens.
4. **Remap + reconcile drift** — re-point semantics onto the fixed ramp and eliminate the
   existing Figma↔code drift.
5. **Focus rings as shadows** — adopt the new focus-ring system: a token-driven, offset
   focus ring implemented as a shadow (Figma effect style + code box-shadow), replacing the
   ad-hoc border/Tailwind-ring approach, applied consistently across every interactive
   component.

## Non-goals

- No retrofit/brownfield narrative — this stays a greenfield showcase.
- No new install/packaging/README rewrite in this pass (tracked separately).
- No new component _types_ beyond what already exists (correctness, not expansion),
  except promoting the three single-components to proper sets.
- Changing brand hues: the near-black-on-green brand identity is **kept** (it passes AA).

## Locked decisions

| Decision | Choice |
|---|---|
| Story | Greenfield (unchanged) |
| Sequencing | **Figma-first, then `/sync-figma-tokens`** |
| A11y bar | **WCAG 2.2 AA, text + non-text** |
| Brand look | **Keep near-black-on-green** (`text.onBrand`/`brand.onPrimary` = gray.950) |
| Token architecture | **Careful in-place migration** to per-category-per-tier |
| Gray ramp | **Full re-derivation** on an even L\* curve |
| Teal | **Promote** to a first-class synced ramp (fixes the drift by completing it) |
| Border weight | **Accessible everywhere** — `border.default` meets 3:1 on all controls _and_ cards |
| Disabled text | Land at ~3.8–4.7:1 — legible but visibly muted (WCAG exempts disabled, this exceeds it) |
| Focus states | **Shadow-based offset focus ring** (Figma effect style + code box-shadow), token-driven, replacing the border/Tailwind-ring approach |

## Audit findings (ground truth)

Measured from the live Figma variables (138 vars, 2 collections) and the DTCG mirror.

**A11y failures (confirmed, WCAG):**

| Pairing | Light | Dark | Need |
|---|---|---|---|
| `border.default` on canvas | **1.55** | **1.27** | 3.0 |
| `bg.muted` vs `border.default` (dark) | — | **1.00** (same color) | must differ |
| `text.disabled` on canvas | **3.56** | **2.23** | 4.5 (text) |
| `warning` amber.600 as text | **3.19** | ok | 4.5 (text) |

**Root cause — lopsided gray ramp** (perceptual L\*): three near-whites bunched at the
top (100/97/92), a **17-point cliff** at 600→700 (33→16), four near-blacks crushed at the
bottom (16/8/5.5/2.7). Not enough distinct mid-dark grays → dark surfaces and borders
can't separate.

**Architecture:** flat `Primitives` (109 vars, single "Value" mode) + `Semantic`
(29 vars, Dark/Light modes on the whole collection).

**Component gaps:** `Tooltip`, `Select Menu`, `Select Menu Item` are single components
with **no variant matrix**; the other 12 are proper component sets.

**Figma↔code drift (violates the sample's "no drift" promise):**
- Figma has a full `color/teal/*` ramp (50–900) + `color/accent/tealSubtle` that **do not
  exist in the code** DTCG files.
- Figma still names the canvas token `color/bg/Base`; code renamed it to `bg.canvas`
  (commit 5420f2e). Names diverged.

---

## Thread 1 — Token architecture

**Target collections** (mode axis noted; single-mode unless stated):

| Collection | Tier | Modes | Contents |
|---|---|---|---|
| `Color / Primitives` | primitive | Value | all ramps: gray (re-derived), green, blue, red, amber, purple, teal |
| `Color / Semantic` | semantic | **Light, Dark** | bg, text, border, brand, secondary, accent, success, warning, danger, info |
| `Space / Primitives` | primitive | Value | space/0…24 |
| `Space / Semantic` | semantic | Value | space/inset/\*, space/gap/\* |
| `Radius / Primitives` | primitive | Value | radius/\* |
| `Type / Primitives` | primitive | Value | font/size, font/weight, font/family, font/lineHeight |

Mode axes (Light/Dark) now attach **only to `Color / Semantic`** — spacing, radius, and
type no longer carry a redundant mode axis. Semantic tier is created only where aliases
exist (color, space). Type semantics remain expressed as Figma **text styles**; elevation
remains an **effect style** (neither becomes a synced variable — matches current behavior).

**Migration rules (in-place, non-destructive):**
1. Create the new collections and variables; copy values over (preserving intentional
   ramps + brand identity).
2. Preserve **Dark as the default mode** in `Color / Semantic` (Figma default mode is Dark,
   `4:1`; there is a standing note not to re-pin nodes — keep default inheritance intact).
3. Re-bind every consuming node (components, styles, the Foundations page) to the new
   semantic variables.
4. Delete the old `Primitives` / `Semantic` collections **only after** a zero-reference
   check confirms nothing still points at them.

---

## Thread 2 — Accessibility (the new gray ramp)

Re-derived on an even CIE L\* curve. **Every step is distinct; the 600→700 cliff and the
near-black cluster are gone.**

| Step | Hex | L\* | Step | Hex | L\* |
|---|---|---|---|---|---|
| 0 | `#FFFFFF` | 100 | 500 | `#747474` | 49 |
| 50 | `#F9F9F9` | 98 | 600 | `#5E5E5E` | 40 |
| 100 | `#EBEBEB` | 93 | 700 | `#494949` | 31 |
| 200 | `#D1D1D1` | 84 | 800 | `#353535` | 22 |
| 300 | `#BBBBBB` | 76 | 900 | `#242424` | 14 |
| 400 | `#8E8E8E` | 59 | 950 | `#181818` | 8 |

**Semantic color remap** (only gray-derived tokens shown; the change column marks moves).
The dark surface ladder is deepened one step (canvas 900→950) so borders separate and the
`bg.muted == border.default` collision is resolved.

| Semantic token | Light → | Dark → | Change |
|---|---|---|---|
| `bg.canvas` | gray.0 | gray.950 | dark deepened |
| `bg.subtle` | gray.50 | gray.900 | dark deepened |
| `bg.muted` | gray.100 | gray.800 | dark deepened |
| `bg.inverse` | gray.900 | gray.0 | — |
| `text.primary` | gray.900 | gray.50 | — |
| `text.secondary` | gray.600 | gray.300 | — |
| `text.disabled` | gray.500 | gray.500 | **fixed** (was 400/600) |
| `text.onBrand` | gray.950 | gray.950 | keep (brand) |
| `border.default` | gray.400 | gray.500 | **fixed** (was 200/700) |
| `border.subtle` | gray.200 | gray.700 | decorative divider |
| `brand.onPrimary` | gray.950 | gray.950 | keep (brand) |

**Non-gray spot-fix:** `warning` gets a mode-aware split — `amber.700` (5.02:1) where used
as **text/icon** in light; `amber.600` stays for **fills/UI** (3.19:1 ≥ 3.0). Verify actual
usage during execution. All other hues (green/blue/red/purple) already pass and are unchanged.

**AA proof (all pass; worst-case backgrounds):**

```
LIGHT (canvas gray.0)                                 DARK (canvas gray.950)
text.primary 900 / canvas          15.52  PASS        text.primary 50 / canvas        16.87  PASS
text.secondary 600 / muted 100      5.44  PASS        text.secondary 300 / muted 800   6.39  PASS
text.disabled 500 / canvas          4.67  PASS        text.disabled 500 / canvas       3.80  PASS
border.default 400 / canvas [3:1]   3.28  PASS        border.default 500 / canvas [3:1] 3.80  PASS
onBrand 950 / brand green.600       4.97  PASS        onBrand 950 / brand green.500     6.87  PASS
                                                      border 500 vs muted 800 (sep)    2.62  visible
```

Border-contrast note: `border.default` meets the 3:1 non-text bar on **all** surfaces —
controls _and_ cards (decision: accessible everywhere, heavier than today's hairline is an
accepted trade). `border.subtle` remains an explicitly **decorative** hairline (dividers,
inner separators) and is exempt from 1.4.11 — kept lighter on purpose.

---

## Thread 3 — Component correctness

**Standard:** every component is a Figma **component set** with a complete variant matrix
(`type × size × state`) bound to semantic tokens, matching its code counterpart's variant
API. Canonical interactive state set: `default · hover · focus · active · disabled`
(+ `error` where the control has validation; + `selected`/`checked` where applicable).

**Known gaps to close:**
- `Tooltip` — single component → promote to a set (at minimum placement/side variants,
  and a state if it carries one).
- `Select Menu` / `Select Menu Item` — single components → `Select Menu Item` needs a
  proper state matrix (`default · hover · focus · selected · disabled`); `Select Menu`
  should compose it.

**Execution:** Phase begins with a **per-component variant audit** (all 15) using
`figma_analyze_component_set` / `figma_audit_component_accessibility`, producing a
matrix of present vs. required variants. Fill gaps, then re-verify token bindings (no
hardcoded values) after the Thread 1/2 remap. This is where `component-builder` /
`component-pipeline` do the work.

---

## Thread 4 — Remap + drift reconciliation

- **Teal (promote):** the `color/teal/*` ramp (standard Tailwind teal, `#F0FDFA…#134E4A`)
  + `color/accent/tealSubtle` exist in Figma but not in code. **Add the full ramp to the
  DTCG** and expose `accent.tealSubtle` (Light → teal.100 `#CCFBF1`, Dark → teal.900
  `#134E4A`) as a synced token. Verified AA: `text.primary` on `tealSubtle` = 13.8:1 light /
  9.0:1 dark. If teal is ever surfaced as **body text** (not just fill/subtle-bg), use
  `teal.700` in light (teal.600 is 3.74:1 — fine for fills/UI, short of 4.5 for text), same
  rule as amber.
- **`bg/Base` → `bg.canvas`:** rename the Figma variable to `bg/canvas` so Figma and code
  agree on the name. Re-bind consumers.
- After the remap, a clean `/sync-figma-tokens` run must produce a diff that is _only_ the
  intended changes — proving drift is gone.

---

## Thread 5 — Focus rings as shadows

**Today:** focus is an ad-hoc Tailwind `focus-visible:ring-2 ring-ring ring-offset-2`
in code (`--ring` just aliases `border.focus`), and in Figma focus is faked as a
**border-color swap** on the `focus` variant. There is no real ring primitive, and the two
sides aren't defined the same way.

**Target:** a single, token-driven **offset focus ring implemented as a shadow**, defined
once and applied everywhere.

**New tokens (semantic):**
- `focus.ring` — ring color (= the existing `border.focus`: green.600 light / green.500 dark).
- `focus.ringWidth` — `2px`.
- `focus.ringOffset` — `2px` (the gap ring, painted in `bg.canvas` so the ring reads on any fill).

**Figma:** create a **"Focus Ring" effect style** — a two-layer drop shadow with `0` blur
and `spread` acting as a solid ring: an inner layer at the offset radius in `bg.canvas`, an
outer layer in `focus.ring`. Bind it to the `focus` (and `focus-visible`) variant of every
interactive component set, replacing the border-color swap. Elevation is already an effect
style, so this matches the existing pattern.

**Code:** define `--shadow-focus` once as an offset ring and apply on `:focus-visible`:

```css
--shadow-focus: 0 0 0 var(--focus-ring-offset) var(--color-bg-canvas),
                0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--color-focus-ring);
/* usage */  :focus-visible { box-shadow: var(--shadow-focus); outline: none; }
```

Replace the per-component `ring-*` utilities with this shared token (error/destructive
controls swap `focus.ring` for `danger`). One definition, consistent everywhere.

**Accessibility (WCAG 2.4.11 Focus Appearance / 1.4.11, ≥3:1 vs adjacent):** verified —
ring vs surface = **3.57:1** light canvas, **3.39:1** light subtle, **6.87:1** dark canvas,
**4.74:1** dark muted. The `bg.canvas` offset layer guarantees separation even when the ring
sits directly against a same-hue component (e.g. a green button).

---

## Sequencing (Figma-first, gated)

Each phase pauses for confirmation before the next (the plugin's normal cadence).

0. **Chromatic baseline** — capture current Storybook snapshots _before any change_, so we
   can prove the live product's structure is intentional and diff against it.
1. **Architecture migration** (Thread 1) — new collections, values copied, Dark default
   preserved. No value changes yet.
2. **Gray ramp + remap** (Thread 2) — apply the new ramp and semantic remap in
   `Color / Semantic`; rebuild affected text/effect styles. Add the **focus tokens** and
   create the **"Focus Ring" effect style** (Thread 5).
3. **Reconcile drift** (Thread 4) — teal promotion + `bg.canvas` rename.
4. **Component correctness** (Thread 3) — variant audit → fill gaps → re-verify bindings →
   **swap every `focus` variant to the Focus Ring effect style** (Thread 5).
5. **Zero-reference check + delete old collections** (Thread 1 cleanup).
6. **Sync to code** — `/sync-figma-tokens`; regenerate DTCG + Style Dictionary outputs;
   open a PR. Chromatic re-snapshots (TurboSnap stays OFF — token changes are global).
7. **Refresh the Foundations page** so the visual stylesheet reflects the new ramp.

## Validation / done criteria

- Automated contrast check (the scratchpad script, promoted into the repo) passes AA for
  every semantic pairing in both modes — committed as a `tokens:a11y` check.
- `figma_lint_design` / component a11y audit clean on all 15 components.
- Every component set has its complete variant matrix; no hardcoded color values.
- Every interactive component's focus state uses the shared shadow-based focus ring (no
  leftover `ring-*` utilities or border-swap focus); ring contrast ≥3:1 in both modes.
- A fresh `/sync-figma-tokens` diff contains only intended changes (drift eliminated).
- Chromatic review shows only the intended visual deltas (border visibility, dark surfaces,
  disabled text), each explainable.
- `design-system.json` updated (collections list, `lastSync`, component meta).

## Resolved during brainstorming

All three prior open questions are decided (see **Locked decisions**):
1. **Teal** → promote to a first-class synced ramp; `tealSubtle` exposed, AA-verified.
2. **Disabled text** → land at ~3.8–4.7:1 (legible but muted; exceeds the WCAG exemption).
3. **Border weight** → accessible everywhere; `border.default` meets 3:1 on controls and cards,
   `border.subtle` stays a decorative hairline.

No open questions remain — ready for the implementation plan on your approval.
