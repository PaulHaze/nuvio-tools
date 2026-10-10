# Sprint 09 — Save

**Status:** planned

## Goal

The user names their Artwork and saves it, and gets a permanent URL to copy into Nuvio.

Read first: [epic README](./README.md), sprint 05 (export) and sprint 08 (storage).
Follow "Chosen layout" in [sprint 01](./01_Mockups_Login_And_Page_Shell.md) for where
things go and how they look.

## Tasks

- [ ] `POST /artnuvio/api/artworks` (multipart: `image` plus a JSON `meta` with name, frame,
      width, height, original and placement). Thin page, logic in `src/tools/artnuvio/`.
      Server checks:
  - `image` starts with the JPEG magic bytes (`FF D8 FF`) and is **≤ 5 MB**;
  - `frame` is a real Frame, and width × height is one of that Frame's output sizes;
  - name is 1–80 characters after trimming.
    Returns `201 { id, url, record }`, or `409 { existingId, url }` when the Name already has an
    Artwork in that Frame.
- [ ] "Save" panel: a **Name** field (e.g. "Serial Killer movies") and a **Save** button,
      using the export from sprint 05 (including the Hero size choice).
- [ ] On 409: "Serial Killer movies already has a Poster. Replace it?" For this sprint, a
      **Cancel** only; sprint 11 wires up Replace from here.
- [ ] Result: the URL in a read-only field, a **Copy Poster URL** button (Frame name in the
      label) and an **Open** link.
- [ ] After saving, the Original and Name stay loaded so the user can switch Frame and save
      the next Artwork for the same folder (switching Frame resets to Cover).
- [ ] Route tests (`test/artnuvio/artwork-routes.test.ts`): accepts a valid JPEG; rejects
      PNG bytes, oversize files, unknown Frames, wrong sizes and empty names; returns 409
      for a duplicate Name + Frame.

## Done when

- Locally: save a Poster and a Hero with the same Name, open both URLs (served by the dev
  route), and the images are right.
- `pnpm test` and `pnpm check` pass.
