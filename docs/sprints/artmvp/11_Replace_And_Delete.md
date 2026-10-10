# Sprint 11 — Replace and Delete

**Status:** planned

## Goal

The user can give an existing Artwork a new image without its URL changing, and can delete
Artwork they no longer use. This is the feature that makes ArtNuvio worth using.

Read first: [epic README](./README.md), [ADR 0009](../../adr/0009-artwork-served-from-own-subdomain.md),
the **Replace** entry in [`CONTEXT.md`](../../../CONTEXT.md), and sprints 08–10.
Follow "Chosen layout" in [sprint 01](./01_Mockups_Login_And_Page_Shell.md) for where
things go and how they look.

## Tasks

- [ ] `PUT /artnuvio/api/artworks/<id>`: same body and checks as `POST`, except the Frame must
      match the Artwork's Frame (it never changes). Calls `replaceImage`. Returns the same URL.
- [ ] `DELETE /artnuvio/api/artworks/<id>`: calls `deleteArtwork`.
- [ ] Library: a **Replace** button per Artwork opens the editor at `/artnuvio?replace=<id>`:
      the Frame is locked to that Artwork's Frame (other Frames disabled), the Name is shown
      and not editable, and the Save button reads **Replace image**.
- [ ] Replace asks: "This will replace the current image for Serial Killer movies (Poster).
      Nuvio will show the new one within a few minutes. Are you sure?"
- [ ] The 409 prompt from sprint 09 ("…already has a Poster. Replace it?") now offers
      **Replace** too, which does the same thing for the existing Artwork.
- [ ] Hero can switch between 3840×2160 and 1920×1080 on Replace; the URL stays the same.
- [ ] Library: a **Delete** button asks: "Delete Serial Killer movies (Poster)? Any Nuvio
      folder using this URL will lose its image. This can't be undone."
- [ ] Route tests: replace keeps the id and URL, writes the previous image, refuses a Frame
      change; delete removes everything.

## Done when

- Locally: replace a Poster from the Library; the same URL now serves the new image
  (hard-refresh), and `previous/` holds the old one. Replace again: still one previous image.
- Delete removes the Artwork from the Library and its URL returns 404.
- `pnpm test` and `pnpm check` pass.
