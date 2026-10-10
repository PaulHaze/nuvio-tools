# ui-03: Site shell and home page

**Status:** done

**Depends on:** [ui-02](./02_Tokens_And_Fonts.md) (tokens, fonts, `DESIGN_SYSTEM.md`). Visual
baseline: the header, hero, tool cards and footer in
[`moodboard-Astra-v2.html`](../html_UI_mocks/moodboard-Astra-v2.html). Copy its CSS values; the
mock's markup, workbench panel, type strip, specimens and JS are not carried over.

## Goal

Put the new look on everything outside Listio's own content: wire `data-page` and `data-tool`
through the layout, build the brand header and footer, rebuild the home page as the mock's hero plus
three tool cards, and restyle the ArtNuvio, Collectio and 404 holding pages. Add the handful of
shared CSS classes these need to `main.css`. Listio's pages get the shell (header, tint, accent) for
free; their content is restyled in [ui-04](./04_Listio_Pass.md).

## What changes

### 1. Layout wiring (`src/lib/ui/Layout.astro`)

- New optional prop `tool?: 'listio' | 'artnuvio' | 'collectio'`. Absent means Home (also used by
  the 404 page).
- `<html lang="en" data-page={tool ?? 'home'}>`. `<ClientRouter />` copies `<html>` attributes on
  navigation, so the tint follows the page.
- Wrap `<slot />` and the footer in `<div class="site-body" data-tool={tool}>` (Astro omits the
  attribute when `tool` is undefined). The header stays **outside** this wrapper so it always uses
  the brand and Home tokens.
- Pass `tool="listio"` from all four Listio pages (`src/pages/listio/index.astro`, `import.astro`,
  `export.astro`, `lists/[id].astro`), `tool="artnuvio"` and `tool="collectio"` from the holding
  pages. Nothing else in the Listio pages changes in this sprint.

### 2. Brand header

Replace `<header class="site-header">` with the mock's brand strip. Markup (adapt as needed):

```astro
<header class="brand-header">
	<div class="brand-header-inner">
		<a class="wordmark" href="/" aria-label="Nuvio Tools home">
			<span class="brand-icon" aria-hidden="true">
				n
			</span>
			<span class="text-gradient">Nuvio Tools</span>
		</a>
		<nav aria-label="Tools">
			<a href="/listio" aria-current={tool === 'listio' ? 'page' : undefined}>
				Listio
			</a>
			<a href="/artnuvio" ...>
				ArtNuvio
			</a>
			<a href="/collectio" ...>
				Collectio
			</a>
		</nav>
	</div>
</header>
```

CSS (in `main.css`, replacing `.site-header`), from the mock:

- `.brand-header`: `border-top: 2px solid var(--brand-from)`, `border-bottom: 1px solid var(--border)`,
  `background: linear-gradient(100deg, #5145c91c, #7142b80a)` (brand fills at low alpha; write them
  as `color-mix(in srgb, var(--brand-fill-from) 11%, transparent)` and
  `color-mix(in srgb, var(--brand-fill-to) 4%, transparent)` so no new hex appears).
- `.brand-header-inner`: flex, `align-items: center`, `gap: 2rem`, same max width and side padding
  as the page content (`max-width: 64rem; margin: 0 auto; padding: 1.25rem 1.5rem`).
- `.wordmark`: flex, `gap: 0.75rem`, `font: 700 1.45rem var(--font-display)`, `white-space: nowrap`.
- `.brand-icon`: `2.3rem` square, `border-radius: 8px`, white text, centred,
  `background: linear-gradient(140deg, var(--brand-fill-from), var(--brand-fill-to))`.
- `nav`: `margin-left: auto`, flex, `gap: 1.75rem`, `color: var(--text-muted)`, `font-size: 0.9rem`.
  `a:hover` and `a[aria-current='page']` use `color: var(--text)`. The current link also gets a
  `2px` bottom border in `var(--brand-from)` (header is brand, so not the accent).
- Header focus rings use `var(--brand-from)`, not the accent: add
  `.brand-header :focus-visible { outline-color: var(--brand-from); }`.
- At `max-width: 600px` (mock): hide `.brand-icon`, wordmark `1.2rem`, nav `gap: 0.85rem`,
  `font-size: 0.8rem`.

### 3. Shared shell classes (`main.css`, a `/* #region SHELL */` block)

Plain CSS classes, not components. Values from the mock:

- `.text-gradient`: `background: linear-gradient(105deg, var(--brand-from), var(--brand-to))`,
  `background-clip: text`, `-webkit-text-fill-color: transparent`. Inside `[data-tool]` it uses
  `linear-gradient(105deg, var(--accent-ink), color-mix(in srgb, var(--accent-ink) 60%, #fff))`
  (the mock's `main[data-tool] .gradient` rule). Header is outside `[data-tool]`, so the wordmark
  stays brand.
- `.eyebrow`: `font: 500 0.75rem/1.5 var(--font-mono)`, uppercase, `letter-spacing: 0.15em`,
  `color: var(--text-muted)`.
- `.card`: `border: 1px solid var(--card-border)`, `border-radius: var(--radius)`,
  `background: var(--card-bg)`, `backdrop-filter: blur(var(--glass-blur))`,
  `box-shadow: 0 0 var(--glow-size) var(--accent-glow)`.
- `.card-glow`: `position: relative; overflow: hidden;` plus a `::before` with
  `inset: 0`, `background: radial-gradient(ellipse at 80% 0%, var(--accent-glow), transparent 70%)`,
  `opacity: var(--aurora-opacity)`, `pointer-events: none`. Direct children get
  `position: relative` so they sit above it.
- `.hero-aurora`: `position: relative; isolation: isolate;` with a `::before` at `z-index: -1`,
  `inset: -30px -20px -20px`, `background: radial-gradient(ellipse at 55% 30%, var(--hero-aurora-1),
transparent 65%), radial-gradient(ellipse at 20% 60%, var(--hero-aurora-2), transparent 60%)`,
  `opacity: var(--aurora-opacity)`, `pointer-events: none`.
- `.btn`: the mock's `.button` (inline-flex, `gap: 0.6rem`, `padding: 0.7rem 1.1rem`,
  `border: 1px solid transparent`, `border-radius: var(--radius)`, `background: var(--accent)`,
  `color: var(--on-accent)`, `font-size: 0.85rem`, `font-weight: 600`,
  `transition: background .16s, box-shadow .16s, transform .16s`). `:hover` background
  `var(--accent-hover)` and `box-shadow: 0 0 var(--glow-hover) var(--accent-glow)`. `:active`
  `transform: translateY(1px) scale(.98)`.
- `.btn-ghost`: transparent background, `border-color: var(--border)`, `color: var(--text)`;
  `:hover` `background: var(--accent-tint)`, `border-color: var(--accent)`.
- `.btn-brand`: `background: linear-gradient(110deg, var(--brand-fill-from), var(--brand-fill-to))`,
  white text; `:hover` reverses the gradient. Inside `[data-tool]` it falls back to the accent
  fill (the mock's `main[data-tool] .brand-button` rules).
- `.badge`: `background: var(--accent-tint)`, `color: var(--accent-ink)`,
  `border: 1px solid var(--card-border)`, `border-radius: 999px`, `padding: 0.15rem 0.5rem`,
  `font-size: 0.7rem`, `white-space: nowrap`.

Add a short section to `docs/DESIGN_SYSTEM.md` naming these classes and when to use each (rules
only, no values). Note there that the components epic will replace them with components.

### 4. Home page (`src/pages/index.astro`)

Replace the three `panel` squares. Layout: `<main>` with `max-width: 64rem`, `margin: 0 auto`,
`padding: 0 1.5rem 3rem`.

- **Hero** (`<section class="hero-aurora">`, `padding: 4.5rem 0 3rem`):
  - `.eyebrow`: "Your library. Your way."
  - `h1`: "A better home for" + `<br>` + `<span class="text-gradient">everything you love.</span>`
  - `p`: "Curate the watchlist. Craft the artwork. Bring it all together. Three focused tools for
    your Nuvio setup." (`color: var(--text-muted)`, `max-width: 34rem`, `font-size: 1.05rem`)
  - `<a class="btn btn-brand" href="#tools">Explore the tools <span aria-hidden="true">↗</span></a>`
    next to an `.eyebrow` "Made for the Nuvio community".
- **Tools section** (`id="tools"`): a heading row (`h2` "One toolkit. A little more you." at the
  mock's section size, `1.2rem`/500, and an `.eyebrow` "Three tools"), then a 3-column grid
  (`gap: 1rem`; one column under `600px`).
- **Tool cards**, one `<a class="card card-glow tool-card" data-tool="…" href="…">` each, from the
  existing `tools` array:
  - top row: an icon box (`2.6rem` square, `border: 1px solid var(--card-border)`,
    `background: var(--accent-tint)`, `color: var(--accent-ink)`, `border-radius: var(--radius)`)
    holding an `astro-icon` Lucide icon (`lucide:list` for Listio, `lucide:image` for ArtNuvio,
    `lucide:folder` for Collectio), and an `.eyebrow` "01" / "02" / "03" on the right.
  - `h3` tool name (`1.45rem`, 600), `p` the existing one-line description
    (`color: var(--text-muted)`, `font-size: 0.85rem`).
  - footer row (`border-top: 1px solid var(--border)`, `padding-top: 0.9rem`, `margin-top: 1.25rem`,
    `font: 0.75rem var(--font-mono)`, `color: var(--accent-ink)`, space-between): "Open Listio" and
    `↗` for Listio; a `.badge` "Coming soon" for ArtNuvio and Collectio.
  - `:hover`: `border-color: var(--accent)`, `box-shadow: 0 0 var(--glow-hover) var(--accent-glow)`,
    with the mock's `.18s` transition.
- Keep `export const prerender = false;` and the existing `tools` array (add `icon` and `status`
  fields to it rather than hard-coding three cards).

### 5. Holding pages and 404

`src/pages/artnuvio/index.astro`, `src/pages/collectio/index.astro` and `src/pages/404.astro` use
the same small pattern: a `<main>` (same width and padding as home) with a `.hero-aurora` section
containing an `.eyebrow` ("ArtNuvio / Coming soon", "Collectio / Coming soon", "404"), an `h1`
with the tool name in `.text-gradient` (404: "Page not found"), a muted line ("Coming soon." /
"Sorry, we couldn't find that page."), and `<a class="btn btn-ghost" href="/">← Back to Nuvio
Tools</a>`. Because the holding pages pass `tool`, their gradient, aurora and button follow the
tool accent; the 404 stays brand. Drop the old `min-h-screen` centring.

### 6. Footer

Restyle `.site-credits` (it is inside `.site-body` now): `max-width: 64rem`, `margin: 3rem auto 0`,
`padding: 1.5rem`, `border-top: 1px solid var(--border)`, `color: var(--text-muted)`,
`font-size: 0.8rem`. The `h2` "Credits" becomes an `.eyebrow`-styled heading (keep it an `h2` for
the landmark). Keep the TMDB logo, link and attribution sentence exactly (TMDB's terms require
them).

### 7. Favicon (`public/favicon.svg`)

Replace the Astro starter logo with the brand icon: a rounded square in the brand fill gradient
with a white "n" drawn as a stroke (a path, not text, so it doesn't depend on fonts). Use exactly:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
	<defs>
		<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#5145c9" />
			<stop offset="1" stop-color="#7142b8" />
		</linearGradient>
	</defs>
	<rect width="32" height="32" rx="7" fill="url(#g)" />
	<path d="M10.5 23V14.5a5.5 5.5 0 0 1 11 0V23" fill="none" stroke="#fff" stroke-width="3.5"
		stroke-linecap="round" />
</svg>
```

The `<link rel="icon">` in `Layout.astro` already points at `/favicon.svg`; leave it. This is a
placeholder mark, to be revised in a later logo pass.

## Tasks

- [x] `Layout.astro`: `tool` prop, `data-page` on `<html>`, `.site-body[data-tool]` wrapper
- [x] Pass `tool` from the four Listio pages and both holding pages
- [x] Brand header markup and CSS (replaces `.site-header`)
- [x] Shell classes in `main.css`; short section in `DESIGN_SYSTEM.md`
- [x] Home page: hero and three tool cards
- [x] Holding pages and 404 in the new pattern
- [x] Footer restyle
- [x] Favicon replaced with the brand "n" mark

## Done when

- Every page has the brand header: gradient wordmark, brand icon, nav to the three tools, the
  current tool marked with `aria-current="page"`. The header looks identical on Home and inside
  Listio
- `/` shows the hero (indigo aurora, gradient phrase, brand button) and three glass cards in teal,
  royal blue and magenta, each glowing in its own accent on hover; tabbing shows a focus ring in
  each card's accent
- `/listio/*` pages have the teal-tinted background and teal focus rings and buttons below the
  header; `/artnuvio` is blue-tinted, `/collectio` magenta-tinted; `/` and the 404 are navy
- Navigating between pages with the client router updates the tint (check Home → Listio → Home)
- At 375px wide nothing overflows; cards stack in one column
- With `prefers-reduced-motion: reduce` there are no transitions
- The browser tab shows the gradient "n" favicon, not the Astro logo
- `pnpm test`, `pnpm build` and `pnpm lint:check` pass

## Out of scope

- Listio's own content (panels, forms, buttons, title cards, list grid): ui-04
- Astro/React components for buttons, cards, inputs (next epic)
- Any ArtNuvio or Collectio feature beyond the holding pages
- A mobile menu (the three nav links fit at 375px)
- Final logo artwork and social images (the favicon is a placeholder mark)

## Decisions

1. **Home copy (owner, 2026-10-10):** keep the placeholder copy above; it gets rewritten later as
   a text-only change.
2. **Favicon (owner, 2026-10-10):** replace it in this sprint with a simple brand "n" mark
   (section 7). It can be revised later.
