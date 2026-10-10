# ui-04: Listio visual pass

**Status:** not started

**Depends on:** [ui-02](./02_Tokens_And_Fonts.md) (tokens) and [ui-03](./03_Site_Shell_And_Home.md)
(shell, `data-tool="listio"` on Listio pages, shell classes). Visual baseline: the Listio
specimen in [`moodboard-Astra-v2.html`](../html_UI_mocks/moodboard-Astra-v2.html) (buttons, ghost
buttons, the `.example` block, inputs, select, badge).

Last sprint of the ui epic.

## Goal

Make today's Listio screens look like they belong to the new design, using CSS only. Move Listio's
styles out of the site-wide `main.css` into Listio's own stylesheet, then restyle the existing
classes with the tokens and the mock's treatments. This is a light pass, not the Listio rebuild:
same markup, same layouts, same behaviour.

## What changes

### 1. Move Listio CSS out of `src/lib/ui/main.css`

`src/lib/` must not hold tool-specific code (ADR 0008; restructure sprint 01 left this for the
design-system work).

- Create `src/tools/listio/listio.css`. Move into it every rule from `main.css` that only Listio
  uses: `.listio-main` and everything scoped under it, `.page-heading`, `.panel`,
  `.collection-dialog`, `.list-*`, `.form-row`, `.new-entries`, `.notice`, `.error`,
  `.empty-state`, `list-manager`, `list-editor`, `.editor*`, `.add-source`, `.source-*`,
  `.title-grid`, `.title-card`, `.poster*`, `.rating`, `.review-controls`, `.view-tabs`,
  `.card-tools`, `.grid-sentinel`, `.conflict`, `.floating-actions`, `.discovery-panels`,
  `.search-grid`, `.media-badge`, `.match-review`. `main.css` keeps tokens, base, the shell region
  and the generic utilities (`bb`, `bb2`, `flex-center`, `prose`).
- Import it once from each Listio page's frontmatter: `import '@/tools/listio/listio.css';` in
  `src/pages/listio/index.astro`, `import.astro`, `export.astro` and `lists/[id].astro`.
- Before restyling, check every Listio screen still looks as it did after ui-03 (the move alone
  must change nothing visible). Grep the class names above in `src/` to confirm nothing outside
  Listio uses them; if something does, leave that rule in `main.css` and note it in the commit.

### 2. Restyle (in `listio.css`)

Use tokens only; no new hex values. Inside Listio, `--accent*` is already teal through `data-tool`.

- **Page heading:** add `class="page-heading hero-aurora"` in the four pages (the only markup change
  besides imports). `h1` keeps its `clamp(2rem, 5vw, 3rem)` size; weight 600, `letter-spacing:
-0.03em`. The `p` under it is `var(--text-muted)`.
- **Links** in `.listio-main` (`a` that is not `.panel` and not `.list-name`): `color:
var(--accent-ink)`, `text-underline-offset: 3px`, underline on hover. Back links ("← Combined
  Lists") are `var(--text-muted)`, `var(--text)` on hover.
- **Panels** (`.panel`): the shell `.card` treatment: `border: 1px solid var(--card-border)`,
  `border-radius: var(--radius)`, `background: var(--card-bg)`,
  `backdrop-filter: blur(var(--glass-blur))`, `box-shadow: 0 0 var(--glow-size) var(--accent-glow)`.
  Keep the `1.5rem` padding. `.panel h2` uses `var(--font-display)`, `1.3rem`, 600.
- **List grid cards** (`.list-grid > li.panel`): on `:hover` and `:focus-within`,
  `border-color: var(--accent)`. `.list-name` uses `var(--font-display)`, `1.25rem`, 600,
  `color: var(--text)`, `var(--accent-ink)` on hover. The "N Titles" line uses `var(--font-mono)`,
  `0.75rem`, `var(--text-muted)`.
- **New-entry tiles** (`.new-entries > .panel`, `+ New list` and `+ Multiple Lists`):
  `color: var(--accent-ink)`, hover `background: var(--accent-tint)` and `border-color:
var(--accent)`.
- **Form controls** (`input` other than checkbox/radio, `select`, `textarea` inside `.listio-main`
  and `.collection-dialog`): one shared rule replacing the repeated ones:
  `border: 1px solid var(--border)`, `border-radius: var(--radius)`,
  `background: var(--surface-2)`, `color: var(--text)`, `padding: 0.6rem 0.75rem`,
  `font: inherit`. `::placeholder` is `var(--text-muted)`. `:focus-visible` uses
  `outline: 2px solid var(--accent); outline-offset: 2px`. Remove the per-control duplicates
  (`.list-sort-control select`, `.list-filter-control input`, `.form-row input`, `.editor select`,
  `.discovery-panels textarea`) but keep their layout properties (`flex`, `min-width`, `width`).
- **Labels:** `.listio-main label` stays block and bold-ish (600) but `color: var(--text-muted)`,
  `font-size: 0.85rem`. `.home-toggle` and checkbox labels keep `var(--text)`.
- **Buttons** (`.listio-main button`): the `.btn` look from ui-03 (accent fill, `--on-accent` text,
  `var(--radius)`, `0.85rem`/600, hover glow, active nudge). Variants:
  - `button.danger`: transparent, `color: var(--danger)`, `border: 1px solid var(--danger)`;
    hover `background: color-mix(in srgb, var(--danger) 12%, transparent)`, no accent glow.
  - `.view-tabs button[aria-pressed='false']`: the ghost look (transparent, `var(--border)` border,
    `var(--text)`); hover `var(--accent-tint)` and `var(--accent)` border.
    `[aria-pressed='true']` keeps the accent fill.
  - `:disabled`: `opacity: 0.6`, no hover glow, `cursor: wait` (as today).
  - `.card-tools button`: compact `0.25rem 0.5rem` padding as today.
- **Summary** (`.listio-main summary`): `color: var(--accent-ink)`, 600.
- **Notice:** `background: var(--accent-tint)`, `border: 1px solid var(--card-border)`,
  `border-radius: var(--radius)`, `color: var(--text)`.
- **Error:** `color: var(--danger)` (as today after ui-02).
- **Title cards:** poster `img` and `.poster-placeholder` use `border-radius: var(--radius)`;
  placeholder `background: var(--surface-2)`, `border: 1px solid var(--border)`,
  `color: var(--text-muted)`. `.title-card h3` uses `var(--font-sans)` 600 (body font: titles are
  data). The overview `p` is `var(--text-muted)`. `.rating` keeps IMDb yellow on black, radius
  `var(--radius)`. `.media-badge` gets the `.badge` look (accent tint, accent-ink text,
  card-border, pill radius).
- **Floating actions:** glass: `background: var(--card-bg)`,
  `backdrop-filter: blur(var(--glass-blur))`, `border: 1px solid var(--card-border)`,
  `border-radius: var(--radius)`, `box-shadow: 0 8px 30px rgb(0 0 0 / 0.45), 0 0 var(--glow-size)
var(--accent-glow)`.
- **Collection dialog** (`dialog.panel.collection-dialog`): `background: var(--surface-1)` (solid,
  not glass, so the page behind does not show through text), `color: var(--text)`;
  `::backdrop` `rgb(0 0 0 / 60%)` with `backdrop-filter: blur(4px)`.
- **Dividers:** `.match-review` and similar `border-top` use `var(--border)`.

### 3. `docs/DESIGN_SYSTEM.md`

Add two rules: tool-specific CSS lives in `src/tools/<tool>/<tool>.css` and is imported by that
tool's pages, never from `src/lib/`; and data (title names, list names in tables) uses the body
font, while page and panel headings use the display font.

## Tasks

- [ ] Create `src/tools/listio/listio.css`, move Listio rules, import it in the four pages; check
      nothing changed visually
- [ ] Add `hero-aurora` to the four page headings
- [ ] Restyle panels, links, form controls, labels, buttons and variants, summary, notice, title
      cards, badges, floating actions, dialog
- [ ] Two rules in `DESIGN_SYSTEM.md`

## Done when

- `main.css` contains no Listio class names (grep the list in section 1)
- On `/listio`: glass list cards with teal-tinted borders that brighten on hover, teal buttons with
  dark text, red-outlined Delete buttons, dark inputs and select with teal focus rings, a soft teal
  aurora behind the heading
- In a list editor: panels, review tabs (pressed = teal fill, unpressed = ghost), title cards with
  4px posters, the teal media badge, the glass floating action bar, and the collection dialog all
  readable and on-theme
- `/listio/import` (single, multiple and collection modes) and `/listio/export` look consistent with
  the above
- Keyboard: tabbing through `/listio` and an editor shows a visible teal focus ring on every link,
  button, input, select, summary and checkbox
- No behaviour change: create, rename, delete, import, review, save and export work as before
- `pnpm test`, `pnpm build` and `pnpm lint:check` pass

## Out of scope

- Changing Listio markup beyond the CSS import and the `hero-aurora` class (new layouts, a data
  table view, icons, moving to Tailwind utilities) — that is the Listio rebuild
- Shared Astro/React components (next epic)
- Any Listio behaviour, copy, routes or data
- The home page, header, footer and holding pages (ui-03)

## Decisions

1. **Glass on dense screens (owner, 2026-10-10):** keep the backdrop blur on every Listio panel, as
   the mock does. Switch Listio panels to solid `--surface-1` later only if scrolling feels slow.
