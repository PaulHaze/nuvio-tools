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

## Rules for new code

- No raw hex values outside `src/lib/ui/main.css`. Use a token in CSS or a Tailwind token class.
- Do not add a light theme, a `data-theme` attribute or `dark:` variants.
