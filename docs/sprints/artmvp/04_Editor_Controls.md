# Sprint 04 — Editor controls

**Status:** planned

## Goal

The user can adjust the framing: Fit/Cover, the scale slider, and dragging, all following the
rules in the epic README. Every rule comes from `framing.ts`; the UI only calls it.

Read first: [epic README](./README.md) ("Editor" bullet) and `framing.ts`.
Follow "Chosen layout" in [sprint 01](./01_Mockups_Login_And_Page_Shell.md) for where
things go and how they look.

## Tasks

- [ ] "Adjust" panel with **Fit** / **Cover** radios and a **Scale** slider.
- [ ] Slider: range from `scaleRange`; moving it calls `zoomTo`, which clears the radio
      (neither Fit nor Cover is selected).
- [ ] Clicking Fit or Cover (even the one already selected) calls `placeMode`, resetting
      scale and position.
- [ ] Drag inside the preview to move the image (`panBy`), converting screen pixels to Frame
      pixels. Use pointer events with pointer capture, so dragging outside the canvas keeps
      working, and `touch-action: none` on the preview so it also works by touch on an iPad. Show a grab/grabbing cursor. Dragging doesn't change the radio.
- [ ] Empty space is solid black.
- [ ] Changing Frame, or loading a new Original, resets to Cover.
- [ ] No mouse-wheel zoom and no double-click reset.
- [ ] Component tests (Vitest + happy-dom, like Listio's `.test.tsx` files) for the radio
      clearing and resetting behaviour, if practical. The maths is already tested in sprint 02.

## Done when

- By hand: Fit shows the whole image with black bars; Cover fills the Frame; the slider
  clears the radio; clicking a radio snaps back; you can't drag a gap into view on a covered
  axis or push a small image off the Frame.
- `pnpm test` and `pnpm check` pass.
