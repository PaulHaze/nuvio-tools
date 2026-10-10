# Sprint 08 — Storage layer

**Status:** planned

## Goal

An R2 bucket binding, a local stand-in for it, and one module that owns every read and write
of Artwork. No UI and no routes yet; sprints 09–11 call this module.

Read first: [epic README](./README.md), [ADR 0009](../../adr/0009-artwork-served-from-own-subdomain.md),
[ADR 0004](../../adr/0004-temporary-node-dev-server.md) and `src/dev/cloudflare-workers.ts`.

## Keys in the bucket

| Key                         | What                                                          |
| --------------------------- | ------------------------------------------------------------- |
| `a/<id>-<frame>.jpg`        | The live image. Its public URL is `<base>/a/<id>-<frame>.jpg` |
| `previous/<id>-<frame>.jpg` | The image before the last Replace (at most one)               |
| `records/<id>.json`         | The Artwork's record                                          |

`<id>` is 10 random lowercase letters and digits from `crypto.getRandomValues`.

Record:

```ts
interface ArtworkRecord {
	id: string;
	name: string;
	frame: FrameId;
	width: number; // pixel size of the current image
	height: number;
	bytes: number;
	original:
		| { kind: 'url'; url: string; resolvedUrl?: string }
		| { kind: 'paste' }
		| { kind: 'file'; fileName: string };
	placement: Placement; // from framing.ts
	createdAt: string; // ISO
	updatedAt: string;
}
```

## Tasks

- [ ] `wrangler.jsonc`: an R2 binding `ARTNUVIO` to bucket `artnuvio`, and a var
      `ARTNUVIO_IMAGE_BASE` = `https://img.nuvio-tools.com`. Add both to the `Env` types and
      `wrangler.jsonc.example`. (The bucket itself is created in sprint 12; `astro build`
      must still work before then.)
- [ ] `src/dev/cloudflare-workers.ts`: a file-backed R2 stand-in for `ARTNUVIO` that stores
      objects under `.wrangler/node-dev/r2/ARTNUVIO/` with their `httpMetadata`. Implement
      only what the module uses (`get`, `put`, `delete`, `list` with prefix and cursor, `head`).
      In local dev, `ARTNUVIO_IMAGE_BASE` comes from `.dev.vars`
      (`http://localhost:4321/artnuvio/dev-img`); add it to `.dev.vars.example`.
- [ ] `src/pages/artnuvio/dev-img/[...key].ts`: serves objects from the binding **only in
      dev** (`import.meta.env.DEV`); 404 in production.
- [ ] `src/tools/artnuvio/storage/artworks.ts`, taking the bucket as a parameter:
  - `createArtwork(bucket, { name, frame, jpeg, width, height, original, placement })`:
    refuses if the trimmed Name (ignoring case) already has an Artwork in that Frame, and
    returns that existing Artwork's id so the UI can offer Replace;
  - `replaceImage(bucket, id, {...})`: copies the live image to `previous/`, overwriting any
    older previous image, then writes the new image and updates the record;
  - `renameArtwork(bucket, id, name)`: same uniqueness rule;
  - `deleteArtwork(bucket, id)`: removes the image, the previous image and the record;
  - `listArtworks(bucket)`: every record (follow list cursors), sorted by name then Frame;
  - `getArtwork(bucket, id)`; `artworkUrl(base, record)`.
- [ ] Every image `put` sets `httpMetadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=300' }`.
- [ ] `test/artnuvio/artworks.test.ts` against an in-memory bucket: create, the
      Name + Frame uniqueness rule (same Name in another Frame is allowed), replace keeps
      exactly one previous image, rename, delete removes all three keys, listing order.

## Done when

- The tests pass, and `pnpm check` and `pnpm build` pass.
