# Sprint 05 — Export and download

**Status:** planned

## Goal

The user can turn the current framing into a finished JPEG at the exact output size and
download it. After this sprint the tool is already useful without any storage.

Read first: [epic README](./README.md) ("Hero size" and "Output" bullets), `framing.ts`,
`frames.ts`.
Follow "Chosen layout" in [sprint 01](./01_Mockups_Login_And_Page_Shell.md) for where
things go and how they look.

## Tasks

- [ ] `src/tools/artnuvio/export.ts`: render the Original onto an offscreen canvas at the
      output size using the same `drawPlacement` as the preview (so the result matches the
      preview exactly), black background, then `toBlob('image/jpeg', 0.88)`. If the blob is
      over **5 MB**, re-encode at 0.8, then 0.7, then 0.6 until it fits; fail with a clear
      message if it still doesn't.
- [ ] Hero size choice in the "Save" panel:
  - when `heroFullSizeAllowed` is true, radio buttons **3840×2160** and **1920×1080**, each
    with its file size (e.g. "1.4 MB"), worked out by actually encoding both. Do this after
    the user stops adjusting (debounce about 400 ms), not on every slider tick;
  - otherwise only 1920×1080, with a short note why ("too small for 3840×2160 at this zoom");
  - if 3840×2160 was selected and stops being allowed, switch to 1920×1080.
- [ ] Other Frames show their single size and file size.
- [ ] "May look soft" warning when `isSoft` is true for the size being saved.
- [ ] **Download JPEG** button: downloads e.g. `artnuvio-poster-1000x1500.jpg`.

## Done when

- Downloaded files have exactly the right pixel size for every Frame and both Hero sizes, and
  look the same as the preview.
- The Hero 4K option appears and disappears correctly as you zoom.
- `pnpm test` and `pnpm check` pass.
