# Sprint 03 — Load an Original locally

**Status:** planned

## Goal

The user can bring in an Original from their own computer, by choosing a file, dropping a
file on the preview, or pasting a copied image (⌘/Ctrl+V). It appears in the selected Frame in
Cover mode. No server involved.

Read first: [epic README](./README.md), `frames.ts` and `framing.ts`.
Follow "Chosen layout" in [sprint 01](./01_Mockups_Login_And_Page_Shell.md) for where
things go and how they look.

## Tasks

- [ ] An editor component in `src/tools/artnuvio/components/` (a React island, like Listio's
      editor) that owns the editor state: the loaded Original (an `ImageBitmap` plus its
      natural size and where it came from), the Frame and the Placement.
- [ ] "Original" panel: a **Choose file…** button (`accept="image/jpeg,image/png,image/webp,image/avif"`)
      and a hint that you can also drop a file or paste an image.
- [ ] Drop a file onto the preview area; paste an image anywhere on the page (ignore pastes
      while typing in a text field).
- [ ] Checks before decoding: an image type, and **≤ 25 MB**. Clear messages otherwise
      ("That isn't an image", "That image is over 25 MB"). Show a message if decoding fails.
- [ ] Remember where the Original came from: `{ kind: 'file', fileName }` or
      `{ kind: 'paste' }`. Sprint 09 saves this in the Artwork's record.
- [ ] Preview: a `<canvas>` showing the whole Frame at its aspect, scaled to fit the preview
      area, black background, the Original drawn with `placeMode(..., 'cover')`. Changing
      Frame redraws in Cover.
- [ ] Keep drawing in one small function (`drawPlacement(ctx, bitmap, frame, placement, size)`)
      in `src/tools/artnuvio/`, so sprint 05 can reuse it at full output size.

## Done when

- Choosing, dropping and pasting all show the Original in Cover in each Frame.
- Wrong types and oversized files show clear messages.
- `pnpm test` and `pnpm check` pass.
