# ArtNuvio mockup · Opus v2: build notes

Round 2 of [`artnuvio-opus.html`](./artnuvio-opus.html), built from the feedback in [`mockup-notes.md`](./mockup-notes.md). The file is [`artnuvio-opus-v2.html`](./artnuvio-opus-v2.html). v1 is left as it was so you can compare them.

## What changed

- **No more shrinking.** The page now opens at the real window width with "Shrink to fit" off, so it reflows instead of scaling down. The 390 / 768 / 1024 / 1440 / 1920 buttons still simulate widths.
- **Layout A stacks into one column below 1024px**, in this order:
  1. The Frame row (Hero / Landscape / Poster / Square), above the image.
  2. The preview, the same as before.
  3. The Original bar: name and size, Show cropped edges, New Original.
  4. One box for Fill and Scale: Fit/Cover and the slider on one row, with one hint line under both.
  5. One card for Name and the Folder set: the Name field on the left and Save on the right in one row, with the folder's four Frames underneath.
  6. The result (URL, copy and "Next" chips) after a save.
- **Phone try (below 600px):** the Frame buttons become compact stacked tiles, the preview is shorter, the "drop anywhere" text and "arrow keys" caption are hidden, the Original bar wraps onto two lines, the Folder set is 2×2, and the Replace banner stacks.
- **Library:** the desktop Library is unchanged. On phones only, the Shelf shows each folder as a 2×2 grid without the column header, and the Copy list puts the copy button full width.
- At 1024px and above, layout A is the same as v1. Layout B (Contact sheet) is not changed.

## Checks run

Headless Chrome at 1440, 1024, 768 and 390, covering the empty, loaded, saved, name-clash, Replace and both Library layouts. There were no script errors and no sideways scrolling at any width. Switching the simulated width across 1024 swaps the layout live. Fit/Cover, the shared hint and the Save name-clash prompt all work in the stacked layout.

## Open points

- **Saved size** wasn't in the feedback, so it sits as a second row inside the Fill + Scale box. It could move into the Name/Save card instead.
- **Phone:** Save is below the fold on a 390×844 screen. A sticky Save bar at the bottom would fix that if phone use matters. Pinch-to-zoom isn't wired; the slider and drag do the job. The paste box still says "⌘V", which means nothing on a touch device.
