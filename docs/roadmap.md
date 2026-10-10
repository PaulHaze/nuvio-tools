# Nuvio Tools roadmap

Where the project is going, written to guide folder structure and code placement in every sprint.
It restates the agreed plan from [`nuvio-tools-next-steps.md`](./nuvio-tools-next-steps.md). Anything
not yet decided is marked **Open**. Each epic lists its sprints in `sprints/{epic}/README.md` (current: [`sprints/ui/README.md`](./sprints/ui/README.md)).

## The site

One site, `nuvio-tools.com`: one Astro app, one Cloudflare Worker, one domain
([ADR 0008](./adr/0008-one-site-tools-under-path-prefixes.md)). A home page links to three tools.

| Tool          | Path         | What it does                                                                                                                                                    |
| ------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Listio**    | `/listio`    | List creation. Builds curated Combined Lists from Trakt, MDBList, IMDb, pasted text and search, and serves them as a Nuvio addon. Exists today.                 |
| **ArtNuvio**  | `/artnuvio`  | Art creation. Takes an image URL and fits it to Nuvio's hero, poster or landscape size without stretching, then hosts the result.                               |
| **Collectio** | `/collectio` | Collection management. A visual manager for Nuvio collections: drag and drop folders between collections, folder artwork, folder management. The biggest build. |

## Target folder layout

```
src/
  pages/
    index.astro            # home: three cards
    listio/                # Listio pages, plus api/ and addon/ under it
    artnuvio/
    collectio/
    robots.txt.ts, 404.astro
  tools/
    listio/                # domain, sources, storage, addon, tmdb, client, components, ...
    artnuvio/
    collectio/
  lib/
    nuvio/                 # shared Nuvio types, collection JSON schema, image specs
    ui/                    # design system: tokens, layout, theme, shared components
  middleware.ts
  dev/                     # Node dev stand-in for cloudflare:workers
test/
  listio/  site/  (artnuvio/, collectio/ as they arrive)
```

Image specs in `lib/nuvio/` cover the three artwork types: hero, poster and landscape.

## Placement rules

1. **Tool code lives in `src/tools/<tool>/`.** Domain logic, API helpers, client code and
   components that only one tool uses stay there.
2. **Pages are thin.** A page file under `src/pages/<tool>/` wires routes to code in
   `src/tools/<tool>/`.
3. **Tools never import each other.** Code in `src/tools/artnuvio/` must not import from
   `src/tools/listio/`, and so on.
4. **Shared code lives in `src/lib/` only.** `lib/nuvio/` holds the Nuvio data model and specs.
   `lib/ui/` holds the design system and layout.
5. **Promote late.** Code moves from a tool to `lib/` only once a second tool actually needs it.
   Don't guess. Move it as its own small change, then have both tools import it from `lib/`.
6. **Each tool owns its URL space.** Its pages, API and any addon sit under its prefix:
   `/<tool>/api/*`, and for Listio `/listio/addon/<secret>/*`. Nothing tool-specific at the root.
7. **Site-wide things stay at the root:** the home page, `robots.txt`, `404`, middleware.
8. **Tests mirror the layout:** `test/<tool>/` for tool code, `test/site/` for middleware and
   other site-wide behaviour.
9. **Plain folders, no pnpm workspaces.** Extracting `lib/` into a package later is easy if a tool
   ever needs to be split out.

## Known cross-tool links

- **Listio exports into Collectio.** Listio already downloads a Nuvio collection JSON (one folder
  per Combined List). Collectio will take that over as the place to manage collections.
- **Collectio opens ArtNuvio** to make artwork for a folder, and reuses ArtNuvio's artwork pipeline.
- **One Nuvio collection model.** All three tools read and write the same collection shape, defined
  once in `src/lib/nuvio/`. Today that model lives inside Listio (`nuvioCollection.ts`); it moves
  to `lib/nuvio/` when ArtNuvio or Collectio first needs it.

Links between tools go through URLs (for example a query string) or through types in `lib/`, never
through direct imports.

## Planned infrastructure per tool

| Tool          | Infrastructure                                                                                                                                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Listio**    | Workers KV, binding `LISTIO`. The Nuvio addon at `/listio/addon/<secret>/*`. TMDB, Trakt and MDBList keys as Worker secrets.                                                                                                                                           |
| **ArtNuvio**  | A CORS image proxy (takes `?url=`, returns the image with CORS headers, stores nothing). A save endpoint that validates and writes a WebP to Cloudflare R2 under a content-hash key. An R2 bucket served from `img.nuvio-tools.com` with long-lived immutable caching. |
| **Collectio** | Storage is **open**.                                                                                                                                                                                                                                                   |

ArtNuvio details, from the planning notes:

- **Flow:** paste an image URL (no uploads), pick hero, poster or landscape, optionally add small
  text, save, and get back a hosted URL for use in Nuvio. The browser fetches the source through
  the proxy, fits it on a canvas, exports WebP, and POSTs it to the save endpoint.
- **Proxy guardrails:** images only (`Content-Type: image/*`), a size cap (about 10–20 MB), block
  localhost, private IP ranges and non-http(s) schemes, a redirect limit, rate limiting.
- **Save guardrails:** reject uploads over about 1 MB and anything that isn't webp, jpeg or png
  (check magic bytes), per-IP rate limits, and Cloudflare Turnstile.
- **Cost:** R2 has free egress and a free tier of 10 GB. The only certain cost is the domain
  (about $10–12 a year); even if all three tools take off, expect around $5 a month.

## Auth

Today the whole site sits behind Basic Auth (one `ADMIN_USER` and `ADMIN_PASSWORD`), except
`/listio/addon/*` (Nuvio needs it, and the secret in the URL protects it) and `/robots.txt`
([ADR 0006](./adr/0006-basic-auth-instead-of-cloudflare-access.md)).

Some tools may go public later. [ADR 0007](./adr/0007-public-list-builder-byok.md) already proposes
a public Listio list builder with users' own TMDB keys, and ArtNuvio would need an open save
endpoint to be useful to others. Because each tool owns a path prefix, the middleware can open or
close one tool without touching the rest. Which tools go public, and when, is **open**.

## Order of work

1. **Restructure** epic (sprints 01–03, branches `restructure-01` to `restructure-03`): folders and routes, home page and renaming, domain switch.
2. **Listio polish:** tweak functionality and smooth rough edges.
3. **UI** epic (branches `ui-{nn}`): settle the design system (dark only, brand gradient plus one
   accent per tool) and land its tokens in `src/lib/ui/`. Then a **shared components** epic for
   all three tools, then a **Listio rebuild** with new features.
4. **ArtNuvio:** small and self-contained. Introduces the proxy, the save endpoint and R2.
5. **Collectio:** last, once `lib/nuvio/` has settled through Listio and ArtNuvio.

## Open decisions

- **Image lifetime:** keep hosted artwork forever (simple, cheap, storage grows without bound) or
  purge after a stated period. Users paste these URLs into Nuvio, so deleting breaks their art.
- **Takedowns:** without accounts, users can't delete their own images. What is the takedown path
  (for example a contact email and manual deletion)?
- **Collectio storage:** KV, D1, R2, or no storage (files in, files out like Listio's export)?
- **ArtNuvio proxy:** a separate Worker, or a route in the same Worker as the rest of the site?
  The same applies to the save endpoint.
- **Public or private, per tool:** which tools stay behind Basic Auth, and what replaces it for
  public ones (accountless secret links, accounts, or nothing).
- **Subdomains:** whether `www.nuvio-tools.com` is added as a redirect to the bare domain.
