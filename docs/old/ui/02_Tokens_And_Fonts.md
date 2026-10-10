# ui-02: Dark-only tokens and fonts

**Status:** done (built in f339ac0; audit fixes applied, see docs/audits/ui-02-audit-opus.md)

**Depends on:** [ui-01](./01_Mood_Board.md) (the "Chosen direction", "Grill follow-up" and "Final
values" sections). Visual baseline:
[`moodboard-Astra-v2.html`](../html_UI_mocks/moodboard-Astra-v2.html) (its `<style>` block is the
reference for every value below).

## Goal

Replace the light/dark Emerald theme in `src/lib/ui/main.css` with the dark-only Nuvio Tools tokens
from the mood board, swap the fonts to Outfit + Inter + Geist Mono, remove the theme toggle, and
write a one-page `docs/DESIGN_SYSTEM.md` of usage rules. Every existing page must keep working and
stay readable: Listio's CSS is re-pointed at the new tokens mechanically (a straight variable swap),
not restyled. The site shell is [ui-03](./03_Site_Shell_And_Home.md); the Listio visual pass is
[ui-04](./04_Listio_Pass.md).

## What changes

### 1. Remove light mode and the theme toggle

- `src/lib/ui/main.css`: delete the light `:root { ... }` block, the `:root[data-theme='dark']`
  block and the `@custom-variant dark (...)` line (lines 6 and 26–79 today).
- Delete `src/lib/ui/ThemeToggle.astro`.
- `src/lib/ui/Layout.astro`: remove the `ThemeToggle` import, the `<div class="absolute top-1
right-1 z-99">` wrapper around it, and the whole `<script is:inline>` that applies the theme
  (`applyTheme` and its `astro:after-swap` listener). Add `<meta name="color-scheme" content="dark" />`
  in `<head>`. Leave `<body class="relative">` as is.
- Keep `src/lib/ui/utils/` (`cn`), `astro-icon` and `@iconify-json/lucide`. They become unused for
  now but ui-03 and the components epic use them.
- Grep `src/` for `data-theme`, `dark:` and `theme` afterwards; nothing theme-related should remain.

### 2. Tokens

Write one `:root` block with the values below (from the v2 mock). Use the names exactly: the mock,
`DESIGN_SYSTEM.md` and later epics all use them. Add a one-line comment per group.

```css
:root {
	color-scheme: dark;

	/* Neutrals: surfaces never tint per page or tool. */
	--bg: #080b16; /* Home navy; tool pages override, see below */
	--surface-1: #111625;
	--surface-2: #191f31;
	--border: #343c52;
	--text: #eef0fa;
	--text-muted: #a6aec5;

	/* Brand: constant on every page (header, wordmark, home hero). */
	--brand-from: #8580ff;
	--brand-to: #ba94ff;
	--brand-fill-from: #5145c9;
	--brand-fill-to: #7142b8;

	/* Accent: Home's defaults; [data-tool] replaces them. */
	--accent: #a39bff;
	--accent-hover: #b9b3ff;
	--accent-tint: #a39bff12;
	--accent-glow: #8b5cf638;
	--accent-ink: #a39bff; /* accent used as text/icon colour on dark */
	--on-accent: #101020; /* text on an --accent fill */

	/* Status (not in the mock; see Open questions). */
	--danger: #f87171;
	--warning: #fbbf24;
	--success: #4ade80;

	/* Shape and effects. */
	--radius: 4px;
	--glow-size: 10px;
	--glow-hover: 24px;
	--aurora-opacity: 0.45;
	--glass-blur: 18px;
	--hero-aurora-1: #6741d43b;
	--hero-aurora-2: #315beb18;
	--card-bg: color-mix(in srgb, var(--surface-1) 84%, transparent);
	--pattern-dot: #a6aec520;
}
```

**Per-page background** (only `--bg` changes; Final values table in ui-01). The attribute goes on
`<html>` in ui-03; this sprint only adds the rules:

```css
[data-page='listio'] {
	--bg: color-mix(in oklab, #14b8a0 3%, #07080c); /* ≈ #090C10 */
}
[data-page='artnuvio'] {
	--bg: color-mix(in oklab, #2f66e6 3%, #07080c); /* ≈ #080A11 */
}
[data-page='collectio'] {
	--bg: color-mix(in oklab, #d03cc8 3%, #07080c); /* ≈ #0C0A10 */
}
```

Home needs no rule (`:root` is Home). The owner may tune the `3%` later; keep it as a literal in
each rule.

**Tool accents** (`data-tool` swaps only accent tokens; brand tokens never change):

```css
[data-tool='listio'] {
	--accent: #2dd4cf;
	--accent-hover: #67e8e2;
	--accent-tint: #2dd4cf12;
	--accent-glow: #22d3ee30;
	--accent-ink: #2dd4cf;
	--on-accent: #052023;
}
[data-tool='artnuvio'] {
	--accent: #306fe0;
	--accent-hover: #2663cb;
	--accent-tint: #306fe016;
	--accent-glow: #306fe040;
	--accent-ink: #8fb8ff;
	--on-accent: #ffffff;
}
[data-tool='collectio'] {
	--accent: #e275ee;
	--accent-hover: #efa0f7;
	--accent-tint: #e275ee12;
	--accent-glow: #d946ef30;
	--accent-ink: #e275ee;
	--on-accent: #28072e;
}
```

**Tokens derived from the accent must be declared on both `:root` and `[data-tool]`.** A custom
property that uses `var()` resolves where it is declared, so a `:root`-only `--card-border` would
keep Home's accent inside a tool. Declare derived tokens in one rule:

```css
:root,
[data-tool] {
	--card-border: color-mix(in srgb, var(--accent) 30%, var(--border));
}
[data-tool] {
	--hero-aurora-1: var(--accent-glow);
	--hero-aurora-2: var(--accent-tint);
}
```

ArtNuvio's `--accent-hover` is darker than `--accent` on purpose (white text stays readable). Keep it.

### 3. Tailwind theme mapping

Replace the `@theme inline` colour block so utilities point at the new tokens. Final names:

| Utility colour name | Value                 | Example class           |
| ------------------- | --------------------- | ----------------------- |
| `bg`                | `var(--bg)`           | `bg-bg`                 |
| `surface-1`         | `var(--surface-1)`    | `bg-surface-1`          |
| `surface-2`         | `var(--surface-2)`    | `bg-surface-2`          |
| `border`            | `var(--border)`       | `border-border`         |
| `fg`                | `var(--text)`         | `text-fg`               |
| `muted`             | `var(--text-muted)`   | `text-muted`            |
| `brand-from`        | `var(--brand-from)`   | `from-brand-from`       |
| `brand-to`          | `var(--brand-to)`     | `to-brand-to`           |
| `accent`            | `var(--accent)`       | `bg-accent`             |
| `accent-hover`      | `var(--accent-hover)` | `hover:bg-accent-hover` |
| `accent-tint`       | `var(--accent-tint)`  | `bg-accent-tint`        |
| `accent-ink`        | `var(--accent-ink)`   | `text-accent-ink`       |
| `on-accent`         | `var(--on-accent)`    | `text-on-accent`        |
| `danger`            | `var(--danger)`       | `text-danger`           |
| `warning`           | `var(--warning)`      | `text-warning`          |
| `success`           | `var(--success)`      | `text-success`          |

That is `--color-bg: var(--bg);`, `--color-fg: var(--text);` and so on inside `@theme inline`.
Remove the old `--color-background*`, `--color-foreground`, `--color-primary*`,
`--color-secondary*`, `--color-caution` and `--color-alert` entries.

### 4. Fonts

The Astro Fonts API already downloads Fontsource fonts at build time and self-hosts them. Keep that
mechanism; just swap the families.

- `astro.config.mjs` `fonts`: replace Noto Sans and Anton with three entries, all
  `provider: fontProviders.fontsource()`, `styles: ['normal']`, `subsets: ['latin']`:
  - `name: 'Inter'`, `cssVariable: '--font-inter'`, `weights: ['400 700']`, `fallbacks: ['sans-serif']`
  - `name: 'Outfit'`, `cssVariable: '--font-outfit'`, `weights: ['400 700']`, `fallbacks: ['sans-serif']`
  - `name: 'Geist Mono'`, `cssVariable: '--font-geist-mono'`, `weights: ['400 500']`, `fallbacks: ['monospace']`
- `Layout.astro`: replace the two `<Font />` tags with
  `<Font cssVariable="--font-inter" preload />`, `<Font cssVariable="--font-outfit" preload />` and
  `<Font cssVariable="--font-geist-mono" />`.
- `main.css` `@theme inline`: `--font-sans: var(--font-inter);`,
  `--font-display: var(--font-outfit);`, `--font-mono: var(--font-geist-mono);`. Remove
  `--font-header`. These three Tailwind theme variables **are** the font tokens: plain CSS uses
  `var(--font-sans)` (body text), `var(--font-display)` (headings, big numbers) and
  `var(--font-mono)` (IDs, counts, eyebrows). Do not add a separate `--font-text` or
  `--font-display` to `:root`; it would clash with the theme variable.

If a weight range is rejected for a family at build time, list the single weights instead
(`[400, 500, 600, 700]`).

### 5. Base layer

Rewrite `@layer base` (keep `html { font-size: 90%; }` and the reduced-motion block as they are):

- `html`: `background-color: var(--bg)`, plus the dot pattern as a background image on the same
  element: `background-image: radial-gradient(var(--pattern-dot) 0.7px, transparent 0.9px);`
  `background-size: 16px 16px; background-attachment: fixed;`. No `body::before` overlay.
- `body`: `color: var(--text)`, `font-family: var(--font-sans)`, `line-height: 1.6`, background
  transparent (so the `html` background shows through).
- Headings use `var(--font-display)`, weight 600, `line-height: 1.2`. Sizes (the mock's px values at
  the 90% root, 1rem = 14.4px):
  - `h1`: `clamp(2.75rem, 4.2vw, 4.15rem)`, `letter-spacing: -0.04em`, `line-height: 1.08`
  - `h2`: `1.95rem`, `letter-spacing: -0.02em`
  - `h3`: `1.4rem`
  - `h4`: `1.1rem`, weight 500
  - `h5`, `h6`: `1rem`, weight 500
- `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }` site-wide.
- `::selection { background: var(--accent-tint); }` is optional; skip it if it looks wrong.
- `input[type='checkbox'], input[type='radio'] { accent-color: var(--accent); }`

Re-point the `prose` utility's variables to `--text`, `--accent-ink` and `--text-muted` (it is
unused today; keep it working rather than deleting it). Leave `bb`, `bb2` and `flex-center` alone.

### 6. Re-point existing rules (mechanical)

Every rule below `/* Combined List management ... */` in `main.css` (`.site-header`,
`.site-credits`, `.listio-main`, `.panel`, the list, editor and title-card rules) still uses the old
variables. Swap them using this table and change nothing else (no new layouts, sizes or
treatments; ui-03 and ui-04 restyle):

| Old                | New                                                       |
| ------------------ | --------------------------------------------------------- |
| `--background`     | `--surface-2` in form controls, `--bg` elsewhere          |
| `--background-100` | `--bg`                                                    |
| `--background-200` | `--surface-1`                                             |
| `--background-300` | `--border`                                                |
| `--foreground`     | `--text` (as a colour); `--border` (in a border)          |
| `--primary`        | `--accent-ink` (text, links); `--accent` (fills, borders) |
| `--primary-muted`  | `--accent-tint`                                           |
| `--secondary`      | `--accent` (the focus outline)                            |
| `--alert`          | `--danger`                                                |

`.listio-main button { color: var(--background) }` becomes `color: var(--on-accent)`. The rating
badge's `#f5c518` (IMDb yellow) and `rgb(0 0 0 / ...)` shadows stay.

Also update the three Tailwind classes that used the old names: `text-primary` becomes
`text-accent-ink` in `src/pages/404.astro`, `src/pages/artnuvio/index.astro` and
`src/pages/collectio/index.astro`.

Done right, `grep -nE -- '--(background|foreground|primary|secondary|caution|alert)' src` finds
nothing.

### 7. `docs/DESIGN_SYSTEM.md`

One page, **usage rules only**, no hex values (`main.css` is the source of truth and the doc must
say so). Cover:

- Dark only. No light mode, no theme toggle.
- The hybrid colour rule: the brand strip (header, wordmark) always uses `--brand-*`; everything
  below it in a tool uses the tool's `--accent-*` via `data-tool`. Never use `--accent` in the
  header and never use `--brand-*` inside a tool's content (except the shared header).
- `data-page` on `<html>` tints only `--bg`. `data-tool` swaps only the accent tokens. Surfaces,
  borders and text never tint.
- What each token is for: `--bg`, `--surface-1` (cards, panels), `--surface-2` (inputs, nested
  blocks), `--border`, `--text`, `--text-muted`, `--accent` (fills, focus, borders), `--accent-hover`,
  `--accent-tint` (subtle fills, badges, ghost hover), `--accent-glow` (box-shadow and aurora only),
  `--accent-ink` (accent as text/icon), `--on-accent` (text on accent fills), status colours.
- Derived tokens must be declared on `:root, [data-tool]` (the `var()` resolution rule above).
- Fonts: Outfit (`--font-display`) for headings, big numbers and short labels; Inter
  (`--font-sans`) for body, tables, inputs; Geist Mono (`--font-mono`) for IDs, counts and eyebrows.
- Shape and effects: 4px radius everywhere; glow is subtle (`--glow-size` at rest, `--glow-hover`
  on hover); glass (`--card-bg` + `backdrop-filter: blur(var(--glass-blur))`) for cards only;
  aurora only behind heroes and in card corners, at `--aurora-opacity`; dots are the page
  background and nothing else draws a pattern.
- Interaction: every focusable element shows the accent focus ring; hover adds glow, active nudges
  down 1px; respect `prefers-reduced-motion`.
- Range sliders follow Astra's style in the mock (accent fill, 5px track, small accent thumb with a
  `--text` ring). Not built until a tool needs one.
- No raw hex values outside `main.css`; use a token or a Tailwind token class.

Link it from `README.md` if README has a docs list; otherwise skip.

## Tasks

- [ ] Delete light theme, `dark` variant, `ThemeToggle.astro` and the theme script; add the
      `color-scheme` meta
- [ ] Add `:root` tokens, `data-page` and `data-tool` rules, and derived tokens
- [ ] Replace the Tailwind `@theme inline` colours and fonts
- [ ] Swap fonts in `astro.config.mjs` and `Layout.astro`
- [ ] Rewrite the base layer (background and dots, body, headings, focus, checkbox accent)
- [ ] Re-point every old variable in `main.css` and the three `text-primary` classes
- [ ] Write `docs/DESIGN_SYSTEM.md`

## Done when

- No light mode anywhere: no toggle, no `data-theme`, no `dark:` classes, no old variable names
  (the grep in section 6 is empty)
- Every page (`/`, `/listio`, `/listio/import`, `/listio/export`, a `/listio/lists/<id>` editor,
  `/artnuvio`, `/collectio`, a 404) renders on the navy `#080b16` background with the dot pattern,
  Inter body text and Outfit headings, with no unreadable text or invisible controls
- Built CSS contains the Inter, Outfit and Geist Mono `@font-face` rules served from the site
  (no Google Fonts request in the network tab)
- Manually adding `data-page="listio"` to `<html>` and `data-tool="listio"` to `<main>` in devtools
  turns the background slightly teal and Listio's buttons and focus ring teal
- `docs/DESIGN_SYSTEM.md` exists, has no hex values, and points to `main.css`
- `pnpm test`, `pnpm build` and `pnpm lint:check` pass

## Out of scope

- Wiring `data-page`/`data-tool` into `Layout.astro`, the brand header, the home page and the
  holding pages (ui-03)
- Restyling Listio (cards, buttons, inputs, moving its CSS out of `main.css`) (ui-04)
- Shared components (Astro/React button, card, input, slider). That is the next epic
- Range slider CSS (nothing uses a slider yet)
- Changing the 90% root font size or any spacing scale
- Favicon and logo artwork

## Decisions

1. **Status colours (owner, 2026-10-10):** keep `--danger #f87171`, `--warning #fbbf24`,
   `--success #4ade80`. Tune during the build if needed.
