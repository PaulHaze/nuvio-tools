## Audit: last commit dbd7fc6 — ui-03: Site shell and home page

_Scope: ui-03 — Site shell and home page (from docs/sprints/ui/03_Site_Shell_And_Home.md)_

Nine source files audited, plus `public/favicon.svg` checked against the sprint's exact SVG: `src/lib/ui/Layout.astro`, `src/lib/ui/main.css`, `src/pages/index.astro`, `src/pages/404.astro`, `src/pages/artnuvio/index.astro`, `src/pages/collectio/index.astro`, and the four Listio pages (`index`, `import`, `export`, `lists/[id]`). The Listio pages got a one-line `tool` prop each, so they were checked as diffs. `.astro` is outside the default include list, so it was treated as source. The commit has one parent (54205c9), so it is not a merge. The commit is the only new commit since the sprint's starting SHA. `docs/DESIGN_SYSTEM.md` is docs and was not audited as code.

### Warning

- **Stale comment now labels the wrong CSS block.** `src/lib/ui/main.css:237` reads `/* Combined List management uses ordinary CSS over the shared tokens. */` and sits directly above `/* #region SHELL */` at line 238. In the original file this comment labelled the Listio block that starts at `.site-credits`. That block now starts at `.listio-main` (line 567), where it has no label. Moving the comment to just above `.listio-main` restores the original meaning.

### Suggestion

- **Sprint status and task checkboxes not updated.** `docs/sprints/ui/03_Site_Shell_And_Home.md` still reads `**Status:** not started`, and all eight task boxes are unchecked. The ui-02 audit's resolution updated the status line for the same reason. Updating it is a doc-only change and can go in the same follow-up.
- **Brand header uses `flex-wrap: wrap`, which the sprint does not specify.** `main.css:251`. The sprint gives a plain flex row. Wrap is a reasonable 375px safeguard, and the commit reports it as deliberate. The owner should confirm it is wanted. If the nav wraps at 375px, it will drop below the wordmark and look different from the mock.

### Positive observations

- Layout wiring matches section 1. `data-page` is on `<html>` with `tool ?? 'home'`. The header is outside `.site-body[data-tool]`, so the wordmark stays brand-coloured on tool pages. The four Listio pages and both holding pages pass `tool`.
- The brand header markup and CSS match section 2. The gradient fills are written with `color-mix` from the brand tokens, with no new hex, and the 11% and 4% alphas match the mock's `#…1c` and `#…0a`. The `aria-current` attribute is set per tool.
- The shell classes in section 3 are present, and each is written only in terms of tokens. `[data-tool]` overrides cover `.text-gradient` and `.btn-brand`. The `.card-glow > *` rule, the `.hero-aurora::before` inset and the `.btn` transition values all match the spec.
- The `.tool-card` anchors carry `data-tool`. Each card therefore redeclares the accent tokens on its own element, so its border, hover glow and focus ring use that card's accent, as "Done when" asks. The card's `--card-border` is derived on the same element, which keeps the cascade correct.
- Footer (section 6). The TMDB logo, link and attribution sentence are unchanged. The `h2` is kept for the landmark and styled with `.eyebrow`. The old `.site-header` is gone, and no references remain in `src/`.
- Favicon (section 7) matches the sprint's SVG exactly.
- Home page (section 4) keeps `export const prerender = false` and the `tools` array, and adds `slug`, `icon` and `status` fields. The Lucide icon names match the sprint. The "Coming soon" badge appears only for non-live tools.
- Holding pages and 404 (section 5) drop `min-h-screen`. They use the `hero-aurora` / `text-gradient` / `btn-ghost` pattern, and `tool` is set only on the two holding pages, so the 404 stays navy and brand.
- The new unlayered class names (`.card`, `.btn`, `.badge`, `.eyebrow`, `.tool-*`, `.shell-*`, `.wordmark`) do not appear on any Listio or other page markup, so they cannot clash with the existing Listio CSS or with the Tailwind utilities in `@layer`.
- Reduced motion is already handled by the global `prefers-reduced-motion` rule at the top of `main.css`, so the new transitions are covered without extra code.
- The Haiku report says `pnpm lint:check`, `pnpm test` (23 files, 222 tests) and `pnpm build` (astro check: 0 errors, 0 warnings) all pass. These were not re-run in this audit.

### Not verified (browser-only)

- Per-page tint: `data-page` on `<html>` gives the teal, blue and magenta backgrounds, and Home is navy.
- Per-card accent: focus rings and hover glow on each home-page card.
- Client-router tint update on Home → Listio → Home. This depends on Astro's `ClientRouter` copying `<html>` attributes, which the sprint assumes.
- 375px no-overflow, with the header in its wrapped state.
- Favicon shows in the tab.
- The browser check was not run in this audit, so none of the above is confirmed.

### Resolution

Not applicable. This audit is written for the owner to review and decide. No findings have been fixed in this step.
