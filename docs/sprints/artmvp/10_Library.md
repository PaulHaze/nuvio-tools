# Sprint 10 — Library

**Status:** planned

## Goal

A Library page lists every Artwork by Name, so the user can find one later, copy its URL or
rename it.

Read first: [epic README](./README.md), the **Library** entry in [`CONTEXT.md`](../../../CONTEXT.md),
and sprint 08.
Follow "Chosen layout" in [sprint 01](./01_Mockups_Login_And_Page_Shell.md) for where
things go and how they look.

## Tasks

- [ ] `GET /artnuvio/api/artworks`: the list from `listArtworks`, each with its URL.
- [ ] `PATCH /artnuvio/api/artworks/<id>` `{ name }`: rename (409 if the new Name already
      has that Frame). Tests for both routes.
- [ ] Page `/artnuvio/library`, linked from the editor (and the editor linked back).
- [ ] One group per Name, sorted A–Z. Inside a group, the Artworks side by side in a fixed
      order (Hero, Landscape, Poster, Square), each as a thumbnail **at its real shape** with
      a Frame label and its pixel size.
- [ ] Each Artwork: **Copy Hero URL** (Frame name in the label), **Open**, and **Rename**.
      Renaming one Artwork renames only that Artwork.
- [ ] A filter box that matches Names as you type.
- [ ] Empty state: "No Artwork yet" with a link to the editor.
- [ ] Thumbnails load lazily (`loading="lazy"`); use the image URLs directly.

## Done when

- Everything saved in sprint 09 appears, grouped by Name, with the right shapes; copying and
  renaming work, and a renamed Artwork keeps its URL.
- `pnpm test` and `pnpm check` pass.
