## Audit: last commit f339ac0 — ui-02: Dark-only tokens and fonts

_Scope: ui-02 — Dark-only tokens and fonts (from docs/sprints/ui/02_Tokens_And_Fonts.md)_

Six source files audited: `astro.config.mjs`, `src/lib/ui/Layout.astro`, `src/lib/ui/main.css`, `src/pages/404.astro`, `src/pages/artnuvio/index.astro`, `src/pages/collectio/index.astro`. The commit has one parent (075bef0), so it is not a merge.

### Warning

- **Header link used an accent token, against the design doc's own rule.** `src/lib/ui/main.css` `.site-header a` set `color: var(--accent-ink)`. `docs/DESIGN_SYSTEM.md` says "Never use `--accent-*` in the header", and ui-01 settled that the brand strip always uses `--brand-*`. The wordmark turned teal, blue or magenta per tool. The section 6 table mandated `--primary` → `--accent-ink`, which conflicted with that rule.

### Suggestion

- **Geist Mono `@font-face` declares `100 900`, not the requested `400 500`.** Checked in the built CSS: Astro's Fontsource provider declares every face as `100 900` from variable files, and the Geist Mono fallback is Astro's `Courier New` mapping. Both are Astro's output. The variable file serves 400 and 500, so behaviour is correct. Left unchanged.
- **Sprint status line still read "not started".** Harmless for code; updated.

### Positive observations

- Token values in the `:root`, `[data-page]` and `[data-tool]` blocks match the sprint. Derived tokens are declared on `:root, [data-tool]` as required.
- No old variable names, old Tailwind utilities, `dark:` classes, `data-theme`, or theme-toggle code remain in `src/`.
- No old theme tokens were dropped beyond those intended.
- `DESIGN_SYSTEM.md` contains no hex values.
- The theme script is removed from `Layout.astro`; `color-scheme: dark` is set.
- The `.listio-main button` text colour correctly becomes `--on-accent`. The IMDb yellow and rating shadows are preserved.

### Not verified (browser-only)

- Navy `#080b16` background and dot pattern render on every page.
- Devtools swap: `data-page="listio"` on `<html>` and `data-tool="listio"` on `<main>` gives the teal background and teal buttons/focus ring.
- No Google Fonts request in the network tab.

### Resolution

- Header warning fixed: `.site-header a` now uses the brand gradient (`--brand-from` → `--brand-to`) as clipped text, matching the design doc.
- Geist Mono weight suggestion: no change; behaviour verified in the built CSS as above.
- Sprint status line updated to done.
- `pnpm test`, `pnpm build` and `pnpm lint:check` re-run after the fix: all pass.
- `/audit-sum` skipped by decision: one Opus audit is enough for these simple UI builds, so no Astra audit is planned.
