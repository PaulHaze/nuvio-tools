# Sprint 01 — Layout mockups, login and page shell

**Status:** planned

## Goal

Decide how ArtNuvio looks and behaves **before** any of it is built, using throwaway HTML
mockups, as in the UI epic's mood board ([`docs/old/ui/01_Mood_Board.md`](../../old/ui/01_Mood_Board.md)).
No code is written until the layout is locked. Then put `/artnuvio` behind the site login, add the Frames table, and build the empty page
layout the owner chose.

The sprint has two phases, in this order:

1. **Mockups** (first). Build one or more mockups from the prompt in phase 1 below. The owner plays with
   them over a few rounds, and the winning layout is recorded under "Chosen layout" at the
   bottom of this file. Phase 2 does not start until that section is filled in.
2. **Build.** The tasks under "Build tasks", following "Chosen layout".

Read first: [epic README](./README.md), the ArtNuvio section of [`CONTEXT.md`](../../../CONTEXT.md),
[`docs/DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md),
[ADR 0006](../../adr/0006-basic-auth-instead-of-cloudflare-access.md),
[ADR 0008](../../adr/0008-one-site-tools-under-path-prefixes.md) and the placement rules in
[`docs/roadmap.md`](../../roadmap.md).

---

## Phase 1: Mockups

- **Prompt:** [`mockup-prompt.md`](./mockup-prompt.md). Self-contained: it can be handed to any
  LLM, with no repo access needed.
- **Attach with it:** [`html_UI_mocks/site-style-reference.html`](./html_UI_mocks/site-style-reference.html).
  It is generated from the site's real compiled CSS and the real home page markup, so it shows
  exactly how the site looks today, with an ArtNuvio page of every element in ArtNuvio's accent.
  It replaces the UI epic's mood boards as the visual baseline. Regenerate it if the site's
  styles change before the mockups are done.
- **Mockups go in** `html_UI_mocks/artnuvio-{model}.html`.

---

## Phase 1 notes

- **Builders:** Sonnet (medium) builds the first mock; other models may build their own from
  the same prompt for comparison. Opus runs the iteration rounds with the owner, who may ask
  for `-v2` files.
- **Done when:** "Chosen layout" below records the editor layout, Frame picker style, preview
  behaviour across Frames, Original input design, Save/result design, Replace-mode treatment,
  Library style and dialogs, plus anything learned at 768px. Later sprints build to it.

---

## Build tasks (phase 2)

- [ ] `src/middleware.ts`: protect `/artnuvio` and everything under it, exactly like
      `/listio` (same decoding, case and duplicate-slash rules). Keep `/listio/addon/` open.
      Home, Collectio and `robots.txt` stay public. Update the comment at the top.
- [ ] `test/site/basic-auth.test.ts`: add cases for `/artnuvio`, `/artnuvio/`,
      `/artnuvio/api/anything`, `/ARTNUVIO`, `//artnuvio` and `/artnuvi%6F` (all challenged
      without credentials, pass with the right ones). Existing tests must still pass.
- [ ] `src/tools/artnuvio/frames.ts`: the single source of truth for Frames:
      `type FrameId = 'hero' | 'landscape' | 'poster' | 'square'` and a `FRAMES` table with
      label, aspect and output size. Hero has two sizes: `full` 3840×2160 and `standard`
      1920×1080. Landscape 2560×1440, Poster 1000×1500, Square 1000×1000. Export a helper
      that returns the output size for a Frame (and, for Hero, the chosen size).
- [ ] `test/artnuvio/frames.test.ts`: every Frame's size matches its aspect exactly; Hero's
      two sizes are both 16:9.
- [ ] `src/pages/artnuvio/index.astro`: replace "Coming soon" with the **empty editor
      layout from "Chosen layout"**: the Frame picker, the preview area and the empty panels
      in their chosen places, using the site's tokens and shell classes (not the mock's CSS).
      It must work from 768px wide upwards. Keep the page thin: component code lives in
      `src/tools/artnuvio/`.
- [ ] Copy the chosen layout's key decisions (one short paragraph) into the
      [epic README](./README.md) under "Decisions every sprint relies on".

## Done when

- "Chosen layout" is filled in.
- In a private browser window, `/artnuvio` asks for a login; Listio still does too; the home
  page does not.
- The ArtNuvio page shows the chosen empty layout at 768, 1024 and 1440px.
- `pnpm test` and `pnpm check` pass.

---

## Chosen layout

The accepted design is [`html_UI_mocks/artnuvio-opus-v2.html`](./html_UI_mocks/artnuvio-opus-v2.html)
(build notes in [`artnuvio-opus-v2.md`](./html_UI_mocks/artnuvio-opus-v2.md)). It is the basis
for the build tasks above. Phase 2 builds to this file, not to the other mocks.

- **Editor layout:** layout A (Stage + rail). The control panel is on the **right**. Below 1024px
  it becomes a single column, in this order: Frame sizes (row of four), the image, the Original
  bar, the Fit/Cover + slider box with its hint line, the Name and Save card with the folder's
  four Frames, then the save result.
- **Width:** the page reflows at real window width (no shrink-to-fit). Width presets include 390.
- **Phone (below 600px):** Frame buttons become stacked tiles, the Folder set is 2×2, the control
  panel starts collapsed, and secondary hint text is hidden.
- **Library:** desktop unchanged. Below 600px, Shelf folders show as a 2×2 grid and the list
  view's Copy button is full width.
