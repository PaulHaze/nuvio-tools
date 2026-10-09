# ui-01: Design System Mood Board

Epic: **ui** (design system). Branch: `ui-01`. Next sprint: `ui-02` (tokens in code).

This file doubles as a **self-contained prompt**. It can be handed to any LLM (Claude, GPT, GLM,
etc.) with the four reference images attached. The builder does not need access to the repo.

---

## The prompt

You are building a **design mood board**: one self-contained HTML file that lets me try different
colour, font and effect combinations for a small web project, live, using a control panel. It is
a throwaway exploration tool, not production code. I will open it in a browser, play with the
controls, and tell you which combination I like.

### The project

**Nuvio Tools** is a small site of three dashboard-style tools for users of **Nuvio**, a streaming
media app with a community of add-on and tool makers:

- **Listio:** builds curated movie/show lists from Trakt, MDBList and IMDb and publishes them as
  catalogs. Dense UI: tables of titles, search, forms.
- **ArtNuvio:** fits an image to Nuvio's poster/hero/landscape sizes, with options to add text.
  UI is mostly a preview canvas plus sliders (font size, image size), text inputs and selects.
- **Collectio:** a visual manager for Nuvio collections and their folders (drag and drop, folder
  artwork).

The site has a **Home** page (an entry page with a card for each tool) and one section per tool.

### The look I want

- **Dark only.** No light mode.
- **Clean, sleek, mildly futuristic, dashboard-like.** Sharp and easy to read. Not flamboyant, not
  overly stylised. I am _not_ trying to be unique: sites in the Nuvio community share a recognisable
  style (deep purple/blue gradients, near-black backgrounds, soft neon glows, glassy cards) and I
  want to fit in with it for familiarity.
- Reference sites in the same space:
  - https://nuviosync.com/about
  - https://personalized.virtualpavi.com/
  - https://xperience-app.com/
  - https://pictorium.elfhosted.com/
  - https://nuvio-account-cloner.vercel.app/ — I like its colours and elements, but its heading
    font (Syne) goes **too far**. For reference, it uses: background `#0a0a0f`, surfaces `#111118`
    / `#1a1a24`, borders `#2a2a38` / `#3a3a50`, accent `#6c63ff`, text `#e8e8f0`, muted text
    `#7a7a96`, accent glow `#6c63ff26`, 3px radius.

### Colour

Attached images (if you can see them). The four tool/home images are **colour references only**:
ignore the icons and objects in them, just take the palette.

- `color_example.png`: an infographic in exactly the style I want: near-black navy background,
  glassy cards each with its own neon accent (purple, blue, teal, green, violet), glowing borders,
  white headings with a gradient-highlighted phrase, and muted grey-lavender body text.
- `nuvio_tools_home.png`: **Home / brand** colour. Deep indigo → violet-blue gradient.
- `listio_example.png`: **Listio**. Teal / cyan.
- `artnuvio_example.png`: **ArtNuvio**. Intense royal blue.
- `collectio_example.png`: **Collectio**. Magenta / purple. Push it towards magenta / pink-violet
  so that it stands apart from the indigo brand.

Starting points (tune them, don't treat them as fixed):

| Role         | Approx. hue                                      |
| ------------ | ------------------------------------------------ |
| Brand (Home) | indigo `#4f46e5` → violet `#8b5cf6` gradient     |
| Listio       | teal/cyan around `#22d3ee` / `#14b8a6`           |
| ArtNuvio     | royal blue around `#3b82f6` / `#2563eb`          |
| Collectio    | magenta/pink-violet around `#d946ef` / `#c026d3` |

**How colour is applied (fixed rule, hybrid model):**

- The **brand strip** (top header bar and site logo) always uses the Home indigo→violet gradient,
  on every page, including inside a tool.
- Everything **below** the header in a tool section uses that **tool's accent**: primary buttons,
  focus rings, slider fills, active states, card glows, links, the background glow.
- Implement this with CSS custom properties: a tool section sets `data-tool="listio"` (or
  `artnuvio` / `collectio`) and that attribute swaps a small set of `--accent-*` variables. The
  brand variables never change.

Each tool needs at least: an accent, a stronger/hover variant, a subtle tint for backgrounds,
a glow colour (with alpha), and a readable "on-accent" text colour. Text must meet WCAG AA contrast
against its background.

### Fonts

Two fonts: a **display** font (headings, big numbers, labels) and a **text** font (body, tables,
inputs). Load them from Google Fonts for this mock. The font-pair control offers:

1. Space Grotesk + Inter
2. Sora + Inter
3. Geist + Geist (with Geist Mono for IDs/counts)
4. Outfit + Manrope
5. Syne + Inter (calibration only: this is the "too far" reference)

Add a monospace face (e.g. Geist Mono or JetBrains Mono) for things like IMDb IDs and counts.

### The control panel

A small floating panel (collapsible) that changes everything live through CSS variables:

- **Preset**: 3–4 named, one-click combinations you think are strongest (e.g. "Nuvio Classic",
  "Sharp Dashboard", "Soft Glass"). Choosing a preset sets all the controls below.
- **Font pair**: the five above.
- **Background**: tinted navy (like the images) / neutral near-black (like the account cloner).
- **Background pattern**: none / fine grid / dots / subtle noise.
- **Aurora glow**: on/off. A soft, blurred colour glow behind the hero and sections, like the
  neon light pools in the images.
- **Radius**: sharp (~4px) / medium (~10px) / soft (~16px).
- **Glass**: on/off. Translucent cards with backdrop blur vs solid surfaces.
- **Glow intensity**: off / subtle / strong (border and hover glows).
- **Border style**: hairline neutral / accent-tinted.

Save the current state in the URL hash so I can copy a link and say "this one". Also show a
small readout of the current choices (font names, key hex values) so I can name them.

### What the page shows

1. **Home mock**
   - Header bar (brand strip): "Nuvio Tools" wordmark in the brand gradient, a few nav links.
   - Hero: a large heading with one phrase in the brand gradient (like "The Essential Setup Order"
     in `color_example.png`), a muted tagline, one primary button.
   - Three **tool cards** (Listio, ArtNuvio, Collectio), each in its own accent via `data-tool`:
     an icon placeholder, name, one-line description, glowing accent border on hover.

2. **Type scale strip**: H1, H2, H3, H4, body, small, muted label, mono, all in the current font
   pair, each labelled with its size and weight.

3. **One specimen square per tool** (three, side by side), each wrapped in `data-tool`. Keep each
   one small. Each contains:
   - **Type:** a heading, a line of body text, a muted label.
   - **Buttons:** primary and secondary/ghost, with real `:hover`, `:active` and `:focus-visible`
     states (I will tab through them with the keyboard).
   - **An example card:** e.g. a Title or folder card with a pill/badge ("12 Titles", "Draft")
     and a big number in the display font.
   - **Form controls:** a text input (with focus ring), a **range slider** styled with the accent
     (like ArtNuvio's font size / image size), and a select or toggle.

Use realistic placeholder content (movie list names, catalog counts, poster sizes), not lorem
ipsum.

### Technical constraints

- **One self-contained `.html` file.** Inline `<style>` and `<script>`, vanilla JS only, no build
  step, no frameworks, no external JS. Only Google Fonts is loaded externally.
- Everything themable goes through CSS custom properties with clear semantic names (e.g. `--bg`,
  `--surface-1`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--brand-from`, `--brand-to`,
  `--accent`, `--accent-hover`, `--accent-tint`, `--accent-glow`, `--on-accent`, `--radius`,
  `--font-display`, `--font-text`, `--font-mono`).
- Respect `prefers-reduced-motion`. Visible keyboard focus everywhere.
- Desktop first, but it shouldn't break at narrower widths.
- Keep the code readable: I'll be tweaking values by hand.

### Out of scope

No real components, routing or app logic. This is a mood board only. Everything except the
chosen typography and tokens will be thrown away.

### Deliverable

The HTML file, saved as `docs/sprints/html_UI_mocks/moodboard-{model}.html` (e.g.
`moodboard-sonnet.html`, `moodboard-gpt.html`). Then give a short note listing your presets and
which one you would pick and why.

---

## Sprint notes (not part of the prompt)

- **Decisions settled before the sprint** (grill session, 2026-10-09):
  - Colour mapping: Home indigo→violet, Listio teal/cyan, ArtNuvio royal blue, Collectio
    magenta/pink-violet (follows the image filenames).
  - Hybrid accent model: brand strip always Home gradient, tool accent below it, via `data-tool`.
  - Dark only.
  - Mood board is one switcher-driven HTML file, not a static grid.
  - No components in this epic. Mock HTML is disposable; only typography and tokens carry forward.
- **Builders:** Sonnet (medium) builds the first version; other LLMs may build their own
  `moodboard-{model}.html` from the same prompt for comparison. Opus runs the iteration rounds
  with the owner.
- **Done when:** every control has a chosen winner (palettes for brand + three tools, neutrals,
  font pair, type scale, radius, borders, glow, glass, background pattern, hover/active/focus
  rules), recorded at the bottom of this file as input for `ui-02`.
- **ui-02 (next):** rewrite `src/lib/ui/main.css` as dark-only tokens (remove the light `:root`
  and the `dark` custom variant), add the `data-tool` accent swap, self-host the two fonts via
  Fontsource, and write a one-page `docs/DESIGN_SYSTEM.md` holding the usage rules only (no
  values; `main.css` is the source of truth). Listio picks up the new tokens as-is; fix only real
  breakage. The epic ends there.
- **After this epic:** shared components epic (used by all three tools), then the Listio rebuild.

## Chosen direction

### Settled decisions:

OVERALL: I think Astra was pretty good and has got the closest across the board. (docs/sprints/html_UI_mocks/moodboard-Astra.html)

FONT PAIRING:

- Headlines/Headers: Outfit
- Body: Inter
- Mono font: Geist Mono

COLOUR SCHEMES: Afterglow from ASTRA

THEME (including glow, borders etc):

BG: Tinted (navy/green/magenta depending on which tool we are in). Not QUITE as tinted as the html, but more than the dark black option

Corners: Sharp

Glow: Subtle

This combinations but with slightly less 'Aurora Glow'

file:///Users/paulhayes/code/AI/nuvio_projects/nuvio-tools/docs/sprints/html_UI_mocks/moodboard-Astra.html#font=sora&background=navy&pattern=dots&radius=medium&glow=strong&border=accent&aurora=on&glass=on

INDIVIDUAL ELEMENTS:

- Background: Dots of Astra
- Sliders: Astra

In fact all of Astra's elements are fine and will make a good baseline to build from.
