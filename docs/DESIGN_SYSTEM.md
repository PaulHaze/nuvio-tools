# Nuvio Tools design system

Usage rules only. The values live in `src/lib/ui/main.css` (the source of truth); this page does not repeat them. Use the token names from `:root` and Tailwind token classes, never raw colours.

## Theme

- Dark only. No light mode and no theme toggle. `color-scheme` is set to dark.
- Hybrid colour rule: the brand strip (site header, wordmark) always uses `--brand-*`. Everything below it inside a tool uses that tool's `--accent-*`, set by `data-tool`.
- Never use `--accent-*` in the header. Never use `--brand-*` inside a tool's content, except the shared header.
- `data-page` on `<html>` tints only `--bg`. `data-tool` swaps only the accent tokens. Surfaces, borders and text never tint.
- Derived tokens (anything built with `var()` from an accent token) must be declared on `:root, [data-tool]`. A `var()` resolves where it is declared, so a `:root`-only value keeps Home's accent inside a tool.

## Colour tokens

- `--bg`: page background. Home is the navy; tools only tint it via `data-page`.
- `--surface-1`: cards and panels.
- `--surface-2`: inputs and nested blocks inside a surface.
- `--border`: dividers and neutral outlines.
- `--text`: primary text. `--text-muted`: secondary text, captions, hints.
- `--accent`: fills (buttons, selected states), focus rings and accent borders.
- `--accent-hover`: hover state of an accent fill. For ArtNuvio it is darker than `--accent` on purpose.
- `--accent-tint`: subtle fills, badges, ghost hover.
- `--accent-glow`: box-shadow and aurora only. Not for text or borders.
- `--accent-ink`: accent used as text or icon colour (links, eyebrows, active labels).
- `--on-accent`: text and icons placed on an `--accent` fill.
- `--danger`, `--warning`, `--success`: status only (errors, cautions, confirmations). Not decoration.
- `--brand-from`, `--brand-to`, `--brand-fill-from`, `--brand-fill-to`: brand gradients for the header, wordmark and home hero only.

## Typography

- Outfit (`--font-display`, Tailwind `font-display`): headings, big numbers and short labels.
- Inter (`--font-sans`, Tailwind `font-sans`): body text, tables, inputs.
- Geist Mono (`--font-mono`, Tailwind `font-mono`): IDs, counts and eyebrows.
- Headings get their sizes and weights from the base layer. Do not restyle them per page.

## Shape and effects

- Radius is `--radius` (4px) everywhere. No rounded pills unless a token says so.
- Glow is subtle: `--glow-size` at rest, `--glow-hover` on hover. Glow uses `--accent-glow`.
- Glass is for cards only: `--card-bg` with `backdrop-filter: blur(var(--glass-blur))`.
- Aurora appears only behind heroes and in card corners, at `--aurora-opacity`.
- Dots are the page background (`html`) and nothing else draws a pattern.

## Interaction

- Every focusable element shows the accent focus ring (`:focus-visible`, `--accent`).
- Hover adds glow. Active nudges the element down 1px.
- Respect `prefers-reduced-motion`: motion is already reduced globally; new animations must follow it.
- Range sliders follow the mock's style (accent fill, 5px track, small accent thumb with a `--text` ring). Not built until a tool needs one.

## Shell classes

Plain CSS classes in `src/lib/ui/main.css` (`/* #region SHELL */`). Use them for the site shell, holding pages and home. The components epic will replace them with components; until then, reuse these rather than writing new ones.

- `.brand-header`: the site header only. Brand tokens, never a tool's accent.
- `.text-gradient`: a gradient phrase or wordmark. Brand on Home and the header; accent inside a tool, automatically.
- `.eyebrow`: short mono uppercase label above a heading, or a small caption.
- `.card`: glass surface for cards. `.card-glow` adds the corner aurora; use it on cards that are links or feature a tool.
- `.hero-aurora`: a hero section only. Never a card or a panel.
- `.btn`: primary action in a tool. `.btn-ghost`: secondary action. `.btn-brand`: the single brand call to action on Home; inside a tool it switches to the accent fill.
- `.badge`: a small status label (for example "Coming soon"). Not a button.

## Rules for new code

- No raw hex values outside `src/lib/ui/main.css`. Use a token in CSS or a Tailwind token class.
- Do not add a light theme, a `data-theme` attribute or `dark:` variants.
- Tool-specific CSS lives in `src/tools/<tool>/<tool>.css` and is imported by that tool's pages, never from `src/lib/`.
- Data (title names, list names in tables) uses the body font (`--font-sans`). Page and panel headings use the display font (`--font-display`).
