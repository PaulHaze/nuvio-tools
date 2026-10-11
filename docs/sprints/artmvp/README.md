# ArtNuvio MVP epic (`artmvp`)

Branches `artmvp-01` to `artmvp-12`. One file per sprint, worked in order. Update a
sprint's **Status** and tick its tasks as work happens.

## What the MVP is

A private tool (behind the site login) that turns an image into **Artwork** for a Nuvio
folder at exactly the right shape and size, and hosts it at a permanent URL. The image behind
that URL can later be **Replaced** without the URL changing, so Nuvio picks up the new art by
itself. Read the ArtNuvio section of [`CONTEXT.md`](../../../CONTEXT.md) first: Artwork,
Replace, Library, Original, Frame, Hero, Landscape, Poster, Square.

Out of scope for the MVP: text, gradients, colour overlays, blurred fill, accounts, a
database, going public (Turnstile, rate limits, takedowns). See "After the MVP" below.

## Decisions every sprint relies on

**Frames** (fixed shape and output size, defined once in `src/tools/artnuvio/frames.ts`):

| Frame     | Shape | Output size                                                       |
| --------- | ----- | ----------------------------------------------------------------- |
| Hero      | 16:9  | 3840×2160 when the Original allows it (see below), else 1920×1080 |
| Landscape | 16:9  | 2560×1440                                                         |
| Poster    | 2:3   | 1000×1500                                                         |
| Square    | 1:1   | 1000×1000                                                         |

- **Hero size:** 3840×2160 is offered only when the part of the Original inside the Frame has
  at least 3840×2160 real pixels (no enlarging). Then the user picks 3840×2160 or 1920×1080,
  each shown with its file size. Otherwise only 1920×1080 is offered. You can't force 4K.
- **Editor:** starts in **Cover** whenever an Original loads or the Frame changes. **Fit/Cover**
  radios. Moving the scale slider clears the radio; clicking a radio snaps back to that mode
  (scale and position reset). Slider range: ½ the Fit scale to 4× the Cover scale, zooming
  about the centre of the Frame. Empty space is **solid black**. Dragging is clamped: an
  image bigger than the Frame on an axis can't show a gap on that axis; an image smaller than
  the Frame on an axis stays fully inside it. Show "may look soft" when the Original is
  enlarged more than 1.35× at the size being saved. No wheel zoom or double-click.
- **Originals:** a URL (fetched through the site's proxy), a pasted image, or a file
  (picked or dropped). 25 MB limit. Only the finished Artwork is stored.
- **Output:** JPEG at quality 0.88. If a file is over 5 MB, re-encode at lower quality
  automatically.
- **URLs:** `https://img.nuvio-tools.com/a/<id>-<frame>.jpg` with a random `<id>`, served
  straight from R2 with a short cache time ([ADR 0009](../../adr/0009-artwork-served-from-own-subdomain.md)).
- **Names:** each Artwork has a Name. One Name can have at most one Artwork per Frame.
  An Artwork's Frame never changes.
- **Replace** keeps exactly one previous image per Artwork (overwritten on each Replace) and
  asks "This will replace the current image. Are you sure?". **Delete** warns that the
  Artwork will disappear from Nuvio, and also removes the previous image.
- **Screens:** desktop and tablet only, **768px minimum** (iPad portrait). No phone layout.
  Dragging works with touch as well as a mouse.
- **Private:** `/artnuvio` is behind the site's Basic Auth from sprint 01. Every sprint can be
  deployed safely. Only `img.nuvio-tools.com` is public.
- **Layout (chosen in sprint 01, mock `artnuvio-opus-v2`):** layout A, built in
  `src/tools/artnuvio/components/` to match the mock 1:1. From 1024px there are two independent
  columns: the preview, Original bar and Folder set on the left, and one sticky 21rem settings
  rail on the right (Frame picker as a 2×2 grid, Fill, Scale, Saved size, Name and Save, with a
  divider between sections). Below 1024px it is one column: the Frame row (four across), the
  preview, the Original bar, one Fill + Scale box (with Saved size), then one card with Name and
  Save on a row and the Folder set under it, then the save result. The page reflows at the real
  window width; the page column is the site's 64rem, widening to 80rem from 1360px and 92rem
  from 1800px. Below 600px, the Frame buttons are stacked tiles, the Folder set is 2×2, and
  secondary hints are hidden. Sprints after 01 build into this layout; they don't redesign it.

## Sprints

| #   | Sprint                                                                       | Status  |
| --- | ---------------------------------------------------------------------------- | ------- |
| 01  | [Layout mockups, login and page shell](./01_Mockups_Login_And_Page_Shell.md) | planned |
| 02  | [Framing maths](./02_Framing_Maths.md)                                       | planned |
| 03  | [Load an Original locally](./03_Load_Original_Locally.md)                    | planned |
| 04  | [Editor controls](./04_Editor_Controls.md)                                   | planned |
| 05  | [Export and download](./05_Export_And_Download.md)                           | planned |
| 06  | [Image proxy](./06_Image_Proxy.md)                                           | planned |
| 07  | [Load from a URL](./07_Load_From_URL.md)                                     | planned |
| 08  | [Storage layer](./08_Storage_Layer.md)                                       | planned |
| 09  | [Save](./09_Save.md)                                                         | planned |
| 10  | [Library](./10_Library.md)                                                   | planned |
| 11  | [Replace and Delete](./11_Replace_And_Delete.md)                             | planned |
| 12  | [Go live (private)](./12_Go_Live_Private.md)                                 | planned |

Sprints 01–05 need no server or storage: by 05 the tool can frame and download.
Sprint 01 starts with HTML layout mockups that the owner chooses from. Its build phase (and
`/start-sprint`) only begins once its "Chosen layout" section is filled in, and every UI sprint
after it follows that layout. Sprints 03 and 12 are simple enough for a light close.

## After the MVP (not scheduled)

- Text, overlay colours, gradients, blurred fill.
- "Restore previous" button (the previous image is already kept from sprint 11).
- Accounts and a database, so many users can keep and change their Artwork.
- Going public: Turnstile on save, per-IP rate limits, terms, a takedown process.
- A blog/tutorial on getting direct image URLs.

Design references: [roadmap](../../roadmap.md) · [glossary](../../../CONTEXT.md) ·
[ADRs](../../adr/) · [old handoff](../../artnuvio/ArtNuvio-HANDOFF.md) (a standalone prototype;
its content-hashed URLs are superseded by ADR 0009) · example images in
[`docs/images/artnuvio_examples/`](../../images/artnuvio_examples/)
