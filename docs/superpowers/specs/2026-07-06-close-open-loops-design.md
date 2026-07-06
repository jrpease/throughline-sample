# Close open loops — design-system quality cleanup

_Date: 2026-07-06 · Follows the accessibility & architecture retrofit (PR #8, merged)._

## Purpose

The a11y/architecture retrofit is complete and merged. This phase closes the
tracked follow-ups that were deliberately deferred during that work — a
grab-bag of small accessibility, parity, and hygiene items recorded in
`HANDOFF.md` and `.superpowers/sdd/progress.md`. The goal is to bring the two
sides of the system (Figma and code) back into agreement and clear the debt so
the next feature phase starts from a clean base.

## Guiding constraint

This is a **Figma-source-of-truth** system: Figma variables → Style Dictionary
→ code tokens (`packages/tokens/build`). Components are hand-written in
`packages/ui` mirroring their Figma counterparts. Therefore:

- **Token changes** are made in Figma first, then flow to code via the token
  sync. They are validated by the `tokens:a11y` gate
  (`packages/tokens/scripts/check-a11y.mjs`).
- **Component changes** touch both sides to preserve parity.
- **Figma-only** changes (e.g. a Figma variant that already exists in code) do
  not produce a code diff.

## Non-goals

- No new user-facing components (that's a separate phase).
- No Figma library publish / Code Connect work.
- No refactor of the token architecture — it is canonical as of PR #8.
- The `check-a11y.mjs` resolver limitations (single-hop alias resolution,
  6-digit-hex assumption) are **documented, not fixed** — they only matter if a
  future pairing needs them, and none in scope does.

## Scope — three phases + one manual item

### Phase A — Accessibility: Switch bordered thumb + gate hardening

**Problem.** In the **Figma** Switch, the thumb is bound to `bg.canvas`, which
resolves near-black in dark mode; against the `bg.muted` track (`#353535`) that
is ≈2.6:1 — below the 3:1 WCAG 2.2 non-text minimum (1.4.11). Note the **code**
Switch already pins its thumb to `--color-gray-0` (white, non-adaptive), so the
two sides also *diverge* on the thumb story.

**Fix — bordered thumb (reconciles both).** Give the thumb a 1px border bound to
a high-contrast neutral token, so the required ≥3:1 edge comes from the outline
rather than the fill. This holds across both modes and both on/off states, and
lets both sides share one intentional design: an adaptive thumb fill with a
guaranteed border edge.

- **Token.** First try reusing `border/strong` (Light `gray/500`, Dark
  `gray/400`) as the thumb border. If it fails to clear 3:1 against **both** the
  off-track (`bg.muted`) and the on-track (`brand.primary`) in **either** mode,
  introduce a dedicated switch thumb-border semantic token instead. The
  `tokens:a11y` gate makes this call — no eyeballing.
- **Figma.** Add the 1px thumb border, bound to the chosen token, on the Switch
  component (all states).
- **Code.** Add the matching `border` to the thumb `<span>` in
  `packages/ui/src/components/Switch/Switch.tsx`, consuming the same token via a
  Tailwind theme class / `var(--…)`.

**Gate hardening.** Extend `check-a11y.mjs` with:
- A Switch **thumb-border ↔ track** assertion for the off-track (`bg.muted`) and
  on-track (`brand.primary`), both modes, threshold ≥3.0 — so this can't
  silently regress.
- The noted **`focus.ring ↔ border.focus`** collision assertion (the two must
  not resolve to the same value where they can appear adjacent).

### Phase B — Figma ↔ code parity

- **`destructive` Button type in Figma.** Code Button and the README list a
  `destructive` type; the Figma Button set has only 5 (`default`, `secondary`,
  `outline`, `ghost`, `link`). Add the 6th type × 3 sizes × 6 states (including a
  Focus state using the existing **Focus Ring On Fill** effect style), bound to
  the existing `danger.*` semantic tokens. **Figma-only** — code is unchanged.
- **Code Checkbox hover/active fills.** The Figma Checkbox has hover/active fill
  states the code component lacks. Add `hover:`/`active:` fill styling to
  `Checkbox.tsx` to match, consuming the same semantic tokens the Figma variants
  are bound to.
- **Code Tooltip left/right placements.** Widen the `side` prop from
  `"top" | "bottom"` to all four placements (Figma already has the placement
  axis). Add the positioning/arrow logic for `left`/`right`.
- **`bg/mutedHover` token.** Today the secondary button's **hover** and
  **active** states both resolve to `bg.mutedActive` (identical shade). Add a
  distinct `bg/mutedHover` semantic step so hover and active read differently.
  Created in Figma → synced to code → the secondary **hover** binding rebinds
  from `bg.mutedActive` to `bg.mutedHover` (Figma + code). Gated:
  `text.primary / bg.mutedHover ≥ 4.5`.

### Phase C — Status & hygiene

- **Draft → stable.** Bump **Select Menu** and **Select Menu Item** from
  `draft` to `stable` in `design-system.json` (`components.meta`) and on their
  Figma doc cards.
- **`"./styles"` export-map smoke test.** The `@ds/ui` package exposes
  `"./styles": "./src/styles/index.css"`, currently only exercised inside
  Storybook. Add a lightweight, CI-run check that resolves and imports
  `@ds/ui/styles` from outside Storybook, proving the export map works for real
  consumers. Kept minimal (a resolution/smoke check, not a full starter app —
  `apps/` stays empty for now; this can grow into a demo app in a later phase).

### Manual item (owner: Jordan, in Figma)

- **Set the Cover frame as the file thumbnail** (right-click the Cover frame →
  *Set as thumbnail*). The Figma API cannot set a file thumbnail, so this stays
  a manual checklist item — not automated.

## Suggested sequence

Because tokens flow Figma→code, the low-risk order is:

1. **Figma token work** — add `bg/mutedHover`; add the switch thumb-border token
   *if* `border/strong` doesn't clear the gate.
2. **Token sync** — Figma → code PR (new/changed tokens land in
   `packages/tokens/build`).
3. **Figma component work** — Switch bordered thumb; `destructive` Button type.
4. **Code component work** — Switch border; Checkbox hover/active; Tooltip
   left/right; secondary hover → `bg/mutedHover`.
5. **Gate hardening** — Switch thumb/track + `focus.ring`/`border.focus`
   assertions in `check-a11y.mjs`.
6. **Status & hygiene** — draft→stable; export-map smoke test.
7. **Validate & ship** — see below; open a PR; review Chromatic.

## Validation (every phase)

- `pnpm tokens:a11y` — **green** (all assertions, both modes), including the new
  Switch and collision assertions.
- `pnpm typecheck` — clean.
- `pnpm build-storybook` — compiles.
- **Chromatic** reviewed on the PR. Expected visual deltas only: Switch thumb
  outline; distinct secondary-hover shade; new `destructive` Figma Button
  variants (Figma-side, not a code snapshot); Tooltip left/right stories;
  Checkbox hover/active.

## Risks / watch-items

- **Shared-token side effects.** `border/strong` is reused elsewhere; if we bind
  the Switch thumb border to it, confirm no unintended visual change on other
  consumers before committing. A dedicated token avoids this if needed.
- **Figma read-back cache.** Per prior learnings, `figma_get_variables` serves a
  stale cache after writes — always pass `refreshCache:true` or read via the
  Plugin API when verifying Figma-side changes.
- **Active-file guard.** Two files may be connected to the bridge; every Figma
  write must verify the target file key (`OCiZiGpsJ4ncPD8r205BjC`) before/after.
- **`bg/mutedHover` closeness.** The new hover step must stay distinct from both
  `bg.muted` and `bg.mutedActive` while still passing `text.primary ≥ 4.5`.

## Success criteria

- Figma Switch thumb clears ≥3:1 in all four mode×state cells; code Switch
  matches; a gate assertion protects it.
- Figma Button has a `destructive` type at full variant coverage.
- Code Checkbox and Tooltip reach parity with their Figma richness
  (hover/active; four placements).
- Secondary hover and active are visually distinct via `bg/mutedHover`.
- Select Menu / Select Menu Item are `stable` in the manifest and Figma.
- The `@ds/ui/styles` export is proven to resolve in CI.
- All validation green; Chromatic deltas explained and accepted.
- Thumbnail item recorded for manual completion.
