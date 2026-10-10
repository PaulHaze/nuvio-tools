# Sprint 12 — Go live (private)

**Status:** planned

## Goal

ArtNuvio runs on the live site behind the login, its images are served from
`img.nuvio-tools.com`, and the owner's first real folder art is in Nuvio. Above all, prove
that a **Replace reaches Nuvio without pasting a new URL**.

Read first: [epic README](./README.md) and [ADR 0009](../../adr/0009-artwork-served-from-own-subdomain.md).

## Tasks

Owner steps (a step-by-step guide will be provided when this sprint starts):

- [ ] Create the R2 bucket: `pnpm wrangler r2 bucket create artnuvio`.
- [ ] In the Cloudflare dashboard, connect the bucket to the custom domain
      `img.nuvio-tools.com` (R2 → artnuvio → Settings → Custom Domains).
- [ ] `pnpm deploy`.

Checks:

- [ ] `/artnuvio` and `/artnuvio/library` ask for a login on the live site;
      `img.nuvio-tools.com/a/…` does not.
- [ ] Image responses carry `cache-control: public, max-age=300` and an `etag`. If the
      custom domain's cache ignores the object's `cache-control`, add a cache rule for the
      hostname, or have the Replace route purge the URL, and record which in ADR 0009.
- [ ] Real Originals: several Pinterest URLs (check the `/originals/` upgrade), at least two
      AI-image sites, and one site that blocks hotlinking (the paste advice should appear).
      Note anything that needs a header change in the proxy.
- [ ] Make Hero and Poster Artwork for one real folder, paste both URLs into Nuvio TV, and
      check the shapes look right on the TV.
- [ ] **Replace test:** replace that Poster, then check Nuvio TV shows the new image within
      about 15 minutes without touching the URL. Record how long it took. Also check the
      Nuvio phone app if you have it.
- [ ] Update `docs/roadmap.md` and this epic's README statuses, and mark ArtNuvio as built
      in `CONTEXT.md`.

## Done when

- The owner's real folder shows ArtNuvio art in Nuvio, and a Replace showed up there with no
  URL change.
