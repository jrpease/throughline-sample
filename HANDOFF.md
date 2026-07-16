# Handoff — throughline-system-test design system

A session-to-session handoff so work can continue on another device. For the
machine-readable state, see `design-system.json` (or run
`/throughline:design-system-status`). This doc captures the **context and
decisions** that aren't in the manifest.

_Last updated: 2026-07-16 — usage docs for the 11 remaining components, **merged to `main` via PR #13**. Everything below is on `main`._

## 2026-07-16 — Usage docs for the 11 remaining components

Completed component documentation coverage. Button/Input/Card were already
documented (PR #12); this pass did **every other component** — Spinner, Badge,
Avatar, Checkbox, Radio, Switch, Textarea, Select, Tooltip, Select Menu, and
Select Menu Item — end to end, via `/throughline:document-component` looped over
the remaining list. All 14 components now have full usage docs on **all four
surfaces**. Merged via **PR #13**.

Per component:
- **Canonical doc record** — `design-system/docs/components/<Name>.doc.json`,
  inferred from the built component's real API (variants/states/slots/tokens),
  enriched from the archetype KB, framed for shadcn; `provenance` per block.
- **Figma component `description`** — compact markdown + `<!-- tl:doc <fp> -->` marker.
- **Figma doc-card Usage frame** — token-styled (When to use/not, Do/Don't,
  Accessibility, Variants/States, Doc fingerprint), cloned from the Button doc-card
  pattern and visually validated.
- **Storybook MDX** — `<Name>.mdx` in the Button format.
- **Manifest + digest** — `components.meta[*].doc` pointers with per-surface
  fingerprints in `design-system.json`; `docs:digest` regenerated (`index.json` +
  `llms.txt` now cover all 14).

**Gotchas worth remembering:**
- **Select Menu + Select Menu Item share one doc card** (`Select Menu — Documentation`,
  node `24:773`). Handled by appending **two labeled, stacked Usage frames**
  ("Usage — Select Menu" / "Usage — Select Menu Item") — one card, two doc bodies.
- **Doc-card enrichment is a clone-and-rewrite**, not a rebuild: clone the Button
  card's `Usage` frame (`197:512`), re-parent into each target card (all are
  VERTICAL auto-layout, so set the clone `layoutSizingHorizontal = "FILL"`), then
  overwrite the 2nd TEXT node in each named block frame. Preserves all token
  bindings and styling for free.
- **The `.doc.json` fingerprint must be computed with the repo's own
  `scripts/lib/doc-record.mjs` (`canonicalFingerprint`)** so it matches `docs:check`
  — the same 16-hex value is stamped into the MDX frontmatter comment, the Figma
  description marker, the doc-card `Doc Fingerprint` node, and the manifest surfaces.
- **Card header build-notes were left as-is** — the old header blurb (e.g. Spinner's
  "Lucide loader-circle…") is separate from the Usage body added here; not refreshed.

Validation clean: `docs:check` — no drift (Figma surfaces are `edit-unverified` by
design, checked live in the Figma session); `pnpm test:scripts` 18/18.

## 2026-07-13 — Storybook rendering bug fixes (Avatar, Select)

Two visual bugs spotted in Storybook, both root-caused and fixed (PR #11):

- **Avatar status dot cropped** — the root element combined `rounded-full` with
  `overflow-hidden`, so the status dot (`absolute bottom-0 right-0`, at the square
  box's corner, outside the circle) was sliced into a crescent. Fix: dropped
  `overflow-hidden` from the root and moved the circular mask onto the `<img>`
  itself (`rounded-full`). The image is still clipped to a circle; the dot renders
  fully on the edge with its ring.
- **Select text overlapped the chevron** — the base `selectVariants` reserved
  chevron clearance with `pr-9`, but the size variants used `px-3`/`px-4`, which
  *also* set `padding-right`. cva appends variant classes after the base and
  `twMerge` keeps the **last** conflicting class, so `px-3`'s 12px clobbered the
  36px clearance. Fix: removed `pr-9` from the base and set left/right padding
  explicitly per size (`pl-3 pr-8` / `pl-3 pr-9` / `pl-4 pr-10`).

**Gotcha worth remembering:** in this repo's `cva` + `cn`(=`twMerge`) pattern, a
`px-*`/`py-*` shorthand in a *variant* silently overrides a `pl-*`/`pr-*` set in
the *base* (base classes come first, twMerge keeps the last). When the base
reserves space on one side (icon clearance, etc.), use side-specific padding in
variants, not the axis shorthand.

## 2026-07-06 — Close open loops

Closed out the parity/follow-up gaps left after the accessibility & architecture retrofit
(PR #8). Spec + plan in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Summary:

- **Switch bordered thumb** — Figma thumbs got a 1px `border/strong` stroke; code `Switch`
  thumb changed to match, an adaptive `bg.canvas` fill + `border/strong` border. Two new
  boundary assertions in the `tokens:a11y` gate cover both states (off = border, 3.74 dark /
  3.92 light; on = fill, 6.87 dark / 3.57 light).
- **Figma `destructive` Button** — added the `destructive` type (18 cells) to the Figma
  Button set, at parity with code (which already had it).
- **Code/Figma parity** — code `Checkbox` gained hover/active fills; code `Tooltip` gained
  left/right placements — both now matching what Figma already had.
- **`bg/mutedHover`** — new tokens `gray.750` (`#3F3F3F`) and `bg/mutedHover` (Light →
  gray.200, Dark → gray.750), authored in Figma and mirrored into DTCG (a future real Figma
  sync should be a no-op for these two values). Secondary Button hover is now visually
  distinct from active instead of sharing `bg/mutedActive`. Gated:
  `text.primary / bg.mutedHover` = 10.17 light / 10.00 dark.
- **Component status** — already `final` for all components; no change needed.
- **CI** — added a `@ds/ui/styles` export-map smoke test (`packages/ui/scripts/check-styles-export.mjs`)
  plus a new fast CI job (`.github/workflows/ci.yml`) that runs it alongside typecheck/build.

Full local validation run clean: `tokens:a11y` **ALL PASS** (both modes, 18 checks/mode),
`typecheck` clean, `build-storybook` succeeds, `check:styles` **PASS**. Merged via **PR #9**
(CI + Chromatic build green; Chromatic "UI Tests" was blocked pending a plan/billing limit,
not a real diff).

**Remaining manual item:** set the **Cover** frame as the Figma file thumbnail (right-click →
*Set as thumbnail*) — the Figma API can't do this. Still not done.

## 2026-07-05 — Accessibility & architecture retrofit (v0.13 representation)

A full quality overhaul to bring this sample up to the plugin's current bar. Spec +
plan in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Summary:

- **Token architecture** — migrated the flat `Primitives` + `Semantic` collections to
  the canonical **per-category-per-tier** shape: `Color / Primitives`, `Space / Primitives`,
  `Radius / Primitives`, `Type / Primitives`, `Color / Semantic` (Light/Dark), `Space / Semantic`,
  `Effect / Primitives`. Mode axis now lives only on `Color / Semantic`. Old collections deleted
  after a zero-reference migration (3,655 bindings rebound old→new).
- **Accessibility (WCAG 2.2 AA, text + non-text)** — re-derived the gray ramp on an even
  perceptual curve (fixes invisible borders 1.3–1.6:1 → 3.3–3.8:1, unreadable disabled text,
  and the dark `bg.muted == border` collision). Every semantic pairing passes AA in both modes;
  proven by the committed `tokens:a11y` gate (`packages/tokens/scripts/check-a11y.mjs`) which
  was red before and is green after.
- **Focus system** — new shadow-based offset **Focus Ring** (Figma variable-bound effect style +
  code `--shadow-focus` / `--shadow-focus-danger`), replacing the old border/Tailwind-ring focus.
- **Components** — all 14 are now proper component sets with complete variant matrices and focus
  rings, 100% bound to semantic tokens (Tooltip, Select Menu, Select Menu Item promoted from single
  components; Checkbox/Radio/Switch gained focus + full states; inputs gained hover/active/error/size).
- **Drift + additions** — reconciled `bg/Base`→`bg/canvas`; promoted the `teal` ramp + `accent/tealSubtle`
  into code; added `border/strong`, `focus/ring`, `brand/primaryActive`, `bg/mutedActive`, and a
  `warning` text/fill split (amber.700 in light).

Minor follow-ups (see `.superpowers/sdd/progress.md`): dark-mode Switch off-thumb ~2.6:1;
no `destructive` button type in Figma; `"./styles"` export-map change unexercised outside Storybook.
(Resolved post-PR: green-on-green focus ring on the primary button — see below.)

**Focus-ring follow-up (post-PR):** the `Focus Ring` effect style had been manually set to a
50% hardcoded green (which also cleared its variable binding). A translucent ring can't meet the
3:1 non-text bar at the brand green — light mode tops out at 2.87 regardless of hue (50% of any
color over white can't get dark enough). Decision: **keep the ring solid.** Restored the effect
style's binding to the `color/focus/ring` variable (solid, mode-aware) and re-asserted `spread: 4`
(the bind call silently resets spread). Hardened `check-a11y.mjs` to composite each pairing at its
actual alpha, so a future translucent focus ring that drops below 3:1 fails the gate instead of
passing silently. Code (`focus.css`) was already solid — no change there.

**Neutral ring for solid-filled buttons (post-PR):** a same-hue focus ring is invisible on a colored
fill (green ring on the green primary, red ring on the red destructive). No single ring color can
clear 3:1 against *both* a colored fill and the page in dark mode (bright fill vs near-black page),
so the fix leans on the offset gap — the ring is adjacent to the page, not the fill — and uses a
mode-aware **neutral** ring that stays high-contrast against the page: new `color/focus/ringOnFill`
semantic (dark→gray.50, light→gray.900, ~15–17:1 vs canvas). Figma: new variable + `Focus Ring On Fill`
effect style, applied to the three `variant=default` Focus variants (the Figma Button set has no
`destructive` variant — shadcn-only). Code: `--shadow-focus-on-fill` in `focus.css`; the Button base
reads `--btn-focus` (fallback `--shadow-focus`) and the filled variants (`default`, `destructive`)
override it — a single-writer pattern so there's no Tailwind cascade race. Gate asserts
`focus.ringOnFill / canvas` ≥ 3:1.

**Figma component fixes (post-PR, Figma-only — no code diff):**
- **Checkbox** — all 15 variants' `box` fill/stroke bindings were *orphaned*: `boundVariables` metadata
  was present but not driving the render, so Figma painted stale literals. Hover/Active/Focus had black
  (`0,0,0`) literals → invisible strokes (and Focus had a black fill). Re-bound every box fill+stroke
  with a fresh `setBoundVariableForPaint` (literal = resolved value), which restores live, mode-aware
  bindings. Verified correct in both Dark and Light. Likely the same bulk-migration artifact could
  affect other migrated components — worth a spot-check on Radio/Switch if anything looks off.
- **Tooltip** — every variant had `layoutMode: NONE` with an absolutely-placed 9×9 square-at-45° arrow
  overlapping the bubble by only ~2px, so it read as a floating diamond and didn't reflow with text.
  Rebuilt each variant as auto-layout (VERTICAL for Top/Bottom, HORIZONTAL for Left/Right) stacking
  `[bubble, arrow]`/`[arrow, bubble]`, `counterAxisAlignItems: CENTER`, `itemSpacing: -6.36` (square
  center on the bubble edge → clean triangle notch), hugging both axes. Now responsive (verified: label
  grew to 351px, arrow stayed centered).

Parity gaps noted (Figma richer than code, pre-existing, not bugs): the code `Checkbox` has no
hover/active fill states; the code `Tooltip` supports only `top`/`bottom` (Figma has all four placements).

**Light-mode state-fill accessibility (post-PR):** the a11y gate only checked *default*-state pairings,
so three interactive-state fills were failing AA:
- **Secondary hover** — was bound to the primitive `color/gray/600` (non-adaptive), giving dark text on
  mid-gray = 2.40:1 in light. Re-bound (all sizes) to adaptive `bg/mutedActive` (8.09 light / 8.55 dark).
- **Primary active** — `brand.primaryActive` light was green.700; near-black text = 3.39:1. Changed light
  to **green.400** (brighten-on-press instead of darken) → 8.65:1. Figma-only render (code Button has no
  `:active`), but the token is fixed at source. Dark active (green.600, 4.97) unchanged.
- **Destructive (dark)** — white on `danger.default` = red.500 (`#EF4444`) = 3.57:1. Darkened dark
  `danger.default` → **red.600** (`#DC2626`) → 4.59:1. Safe: `danger.default` is used only as fill / focus
  ring / error border (never text-on-canvas); border/ring vs canvas stays above 3.0 (3.68 dark).
- **Gate hardened** — `check-a11y.mjs` now also asserts primary hover/active, secondary muted/mutedActive,
  destructive text, and danger-as-border. 17 checks/mode, all green.

Cosmetic follow-up: secondary hover and active now both resolve to `bg/mutedActive` (identical shade); add a
dedicated `bg/mutedHover` step if distinct hover/active shading is wanted.

---

## What this is

A design system built with the **throughline** Claude Code plugin (v0.2.0): a
two-tier token system, icons, and components authored in **Figma**, synced to
**code** via Style Dictionary, with **Storybook + Chromatic**. "One unbroken line
from design to code."

- **Repo:** https://github.com/jrpease/throughline-system-test (monorepo, pnpm + turborepo)
- **Figma file:** key `OCiZiGpsJ4ncPD8r205BjC` — "Throughline Plugin Test"
- **UI framework:** shadcn (React + Vite + Tailwind)
- **Coding level on record:** `new` (explanations are scaled up)
- **Current branch:** `main` (PR #8 merged — the a11y & architecture retrofit + review-round fixes; everything is on main)

## Current state (high level)

- ✅ Tokens: 2-tier (Primitives + Semantic), light/dark modes, styles (Text, Elevation)
- ✅ Foundations page, Icons (Lucide, ~68-icon subset, `lucide-react` installed)
- ✅ Repo at `github` stage, token sync (shadcn adapter), Storybook + Chromatic
- ✅ Cover page (built this session)
- ✅ Components (14): Button, Spinner, Badge, Avatar, Input, Checkbox, Switch,
  Card, Select, Radio, Textarea, Tooltip, **Select Menu**, **Select Menu Item**

## What happened this session

1. **Brought the system up to date with plugin v0.2.0** (was built on v0.1.0).
2. **Cover page** — built a branded Cover page (first page of the Figma file),
   bound to semantic tokens + spacing tokens.
3. **Manifest migrated to schemaVersion 2** — added `figma.coverPageBuilt`,
   `canPublish`, `libraryPublished`, `publishedAt`, `components.meta`,
   `components.instanceSwapUpgradePending`.
4. **New component: Select Menu** — the dropdown options panel that pairs with
   the Select trigger. Built end-to-end via `/throughline:new-component`
   (Figma → tokens → code + stories). Shipped in **PR #6 (merged)**.

## Decisions & gotchas (read before continuing)

- **Figma default variable mode is Dark** (mode id `4:1`; Light is `4:2`). Do NOT
  pin/override the mode without a reason — let nodes inherit the default. (There's
  a memory note about this; the cover page initially got wrongly pinned to Light.)
- **Cover page thumbnail is a manual step.** The Figma API can't set a file
  thumbnail — right-click the Cover frame in Figma → **Set as thumbnail**. Not yet done.
- **All 14 components are documented** (doc record + Figma description + doc-card
  Usage frame + Storybook MDX + digest). Re-run `/throughline:document-component`
  for a component after its API changes; `docs:check` gates drift.
- **Code Connect is OFF** (`storybook.codeConnect: false`). It needs a Figma
  Organization plan AND a published library (`figma.libraryPublished: false`).
  Until then, the repo component spec records the Figma↔code mapping.
- **Publishing gate:** `components.instanceSwapUpgradePending` is empty now. If you
  build a component with a typed icon/component slot before publishing the library,
  it falls back to toggle + manual-swap and gets queued here for a later upgrade pass.
- **Elevation is a Figma _style_, not a synced variable** — it does not appear as a
  CSS var. In code, use Tailwind `shadow-md`/`shadow-lg` (see `Card`, `SelectMenu`).

## Code conventions (match these)

- Components in `packages/ui/src/components/<Name>/<Name>.tsx` + `<Name>.stories.tsx`,
  exported from `packages/ui/src/index.ts`.
- `cva` + `VariantProps`, `React.forwardRef`, `displayName`, `cn()` from `../../lib/cn`.
- **Never hardcode values** — consume tokens via Tailwind theme classes
  (`text-foreground`, `border-input`, `ring-ring`) or raw `var(--color-*)` /
  `var(--radius-*)` utilities. Token CSS vars live in `packages/tokens/build/css`.
- Stories: `Meta`/`StoryObj`, `title: "Components/<Name>"`, `tags: ["autodocs"]`,
  controls wired to props, a story per meaningful variant. One gallery story for icons.
- Deterministic naming: Figma `Button` ↔ code `Button`.
- Chromatic: **full snapshots, TurboSnap OFF** (token changes are global).

## ⚠️ The throughline plugin is SEPARATE from this repo

Pulling this repo does **not** install the throughline plugin — they're two
different things:

- **This repo** = design-system _output_ (tokens, components, manifest, code).
  Travels via `git pull`.
- **throughline plugin** = a Claude Code _extension_ (the `/throughline:*`
  commands, the skills, AND the bundled figma-console MCP config that connects
  Claude to Figma). Lives in its OWN repo: `github.com/jrpease/throughline`.
  Installed into Claude Code per-device.

On the original machine the plugin marketplace is a **local directory**
(`/Users/jordanpease/Dev/throughline`) — that path won't exist elsewhere, which
is why the commands are missing after a fresh pull.

**Do you even need it?**
- Code-only work (edit components, `pnpm typecheck`, `build-storybook`, run app)
  → no plugin required; it's plain pnpm/Node.
- Design-system workflow (`/throughline:*` commands/skills + Figma connection)
  → install the plugin.

**Install on the other device (from GitHub, not the local path):**
```
claude plugin marketplace add jrpease/throughline
claude plugin install throughline@throughline-marketplace
```
Then reload Claude Code and set `FIGMA_ACCESS_TOKEN`. The figma-console MCP
server downloads via `npx` from the bundled config. (This machine runs v0.2.0;
the default branch may be newer — check out the `v0.2.0` tag if you need an
exact match.)

## Environment setup needed on the other device

1. **throughline plugin** installed in Claude Code (see section above) — this is
   what restores the `/throughline:*` commands and the Figma MCP config.
2. **Figma desktop app** (NOT browser) installed, signed in, with the file open.
3. **Desktop Bridge plugin** running in that file (the figma-console-mcp bridge).
4. **`FIGMA_ACCESS_TOKEN`** env var set to your personal Figma token (starts
   `figd_`). _Never paste it into chat_ — place it in the MCP env yourself.
5. **Node + pnpm**, then `pnpm install` at the repo root.
6. CI already has the `CHROMATIC_PROJECT_TOKEN` GitHub secret (no action needed).

Verify the Figma connection with the `figma_get_status` tool (probe), or just run
`/throughline:design-system-status`.

## Verify the code side

```
cd packages/ui
pnpm typecheck        # tsc --noEmit
pnpm build-storybook  # compiles all stories
pnpm storybook        # dev server on :6006
```

## Open loops / suggested next steps

- [ ] Set the Cover frame as the file thumbnail (manual, in Figma).
- [ ] (Optional) Publish the Figma library → unlocks Code Connect + typed
      instance-swap dropdowns; then re-run component-builder for the upgrade pass.
- [ ] Add more components via `/throughline:new-component` — new components should
      also be documented via `/throughline:document-component`.
- [ ] Token changes flow through `/sync-figma-tokens` (opens a PR; Chromatic re-snapshots).
- [x] ~~Document all 14 components~~ — done (PR #12 + PR #13).

## How to resume in a new session

1. Pull the repo and open it in Claude Code on the other device.
2. Ensure the environment setup above is done.
3. Say: _"Read HANDOFF.md and run /throughline:design-system-status to get oriented."_
