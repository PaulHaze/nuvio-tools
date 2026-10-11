# Sprint 02 — Framing maths

**Status:** completed

## Goal

All the rules for placing an Original inside a Frame exist as plain, pure TypeScript
functions with thorough unit tests. No DOM, no canvas, no UI. Sprints 04, 05 and 11 only call
these functions; they never re-derive the maths.

Read first: [epic README](./README.md) ("Editor" and "Hero size" bullets) and
`src/tools/artnuvio/frames.ts` from sprint 01.

## The model

Work in the Frame's **full-size output pixels** (for Hero, always 3840×2160; the 1920×1080
version is the same picture at half size). A placement is:

```ts
type Mode = 'cover' | 'fit' | null; // null = the user has moved the slider
interface Placement {
	mode: Mode;
	scale: number; // output pixels per Original pixel
	cx: number; // where the Original's centre sits, in Frame pixels
	cy: number;
}
```

The drawn image is `iw * scale` by `ih * scale`, centred at `(cx, cy)`.

## Tasks

- [x] `src/tools/artnuvio/framing.ts` with these pure functions:
  - `coverScale(image, frame)` = `max(fw / iw, fh / ih)`; `fitScale` = `min(...)`.
  - `scaleRange(image, frame)` → `{ min: 0.5 * fitScale, max: 4 * coverScale }`.
  - `placeMode(image, frame, mode)` → a centred Placement at that mode's scale.
  - `clampCentre(image, frame, placement)` → the Placement with `cx`/`cy` clamped, per axis:
    - if the drawn size on that axis is **≥** the Frame's, the image must cover the Frame on
      that axis (left edge ≤ 0 and right edge ≥ frame width);
    - if it is **smaller**, the image must stay fully inside (left ≥ 0, right ≤ frame width).
  - `zoomTo(image, frame, placement, newScale)` → clamp `newScale` to `scaleRange`, keep the
    Original point that is at the Frame's centre at the Frame's centre, set `mode` to `null`,
    then `clampCentre`.
  - `panBy(image, frame, placement, dx, dy)` → move the centre by `(dx, dy)` Frame pixels,
    then `clampCentre`. `mode` is unchanged (dragging doesn't clear the Fit/Cover radio).
  - `enlargement(placement, savedScaleFactor)` → how much the Original is being enlarged at
    the size being saved (`scale * savedScaleFactor`, where the factor is 1, or 0.5 for a
    1920×1080 Hero). `isSoft(...)` is true when that is **> 1.35**.
  - `heroFullSizeAllowed(placement)` → true when `scale <= 1` for the 3840×2160 Hero, so
    the visible part has at least 3840×2160 real pixels.
- [x] `test/artnuvio/framing.test.ts`: cover and fit for wide, tall and square Originals in
      every Frame; slider limits; zoom keeps the centre point fixed; clamping on each axis in
      both the "bigger" and "smaller" cases (no gaps, never off the Frame); panning can't
      escape; the softness threshold either side of 1.35; Hero full size allowed at exactly
      `scale = 1` and refused just above.

## Done when

- `pnpm test` passes with the new tests, and every rule above has at least one test.
- `framing.ts` imports nothing from the DOM or Astro.

## Verification

- `pnpm test`: 25 test files and 266 tests passed, including 36 framing tests.
