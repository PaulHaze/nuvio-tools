# Nuvio Tools: Next Steps

Summary of the planning conversation on 2026-10-08 about bringing Listio, ArtNuvio and Collectio together under one roof.

## The vision

One site, `nuvio-tools.com`, with a landing page showing three cards:

- **Listio**: the existing list combiner.
- **ArtNuvio**: an image/thumbnail generator. It takes any image on the web, at any size or ratio, and fits it into Nuvio's hero, poster or landscape thumbnails without stretching or squishing it.
- **Collectio**: a visual collections manager. It offers drag-and-drop folders between collections, easier artwork adding and folder management.

## Repo and structure

All three tools live in **this repo**. A monorepo suits them because they share a lot:

- **Shared pieces:** Nuvio collection/catalog types, the JSON schema, image-size specs, UI components, styling and Cloudflare setup.
- **One domain, one deploy:** one Cloudflare project and one set of DNS records.
- **Cross-tool links:** Collectio can open ArtNuvio to make artwork for a folder, and Listio can export straight into Collectio.

Keep a single Astro app with a route per tool, plus shared code in `src/lib/`:

```
src/
  pages/
    index.astro          # landing page with 3 cards
    listio/
    artnuvio/
    collectio/
  lib/
    nuvio/               # collection types, schema, validation, image specs
    ui/                  # design system: tokens, shared components, layout, theme
  tools/
    listio/              # tool-specific logic
    artnuvio/
    collectio/
```

- **Plain folders, no pnpm workspaces yet.** Extracting `lib/` into a package later is easy if a tool ever needs splitting out.
- **Boundary rule:** tools import from `lib/`, never from each other.
- **Repo rename:** consider renaming the repo to `nuvio-tools`. It's cheap now and awkward later.
- **Docs:** when restructuring, update `CONTEXT.md` and the spec from "Listio" to "Nuvio Tools".
- **Sprint workflow:** keep sprints sequential and group sprints into epics (`docs/sprints/{epic}/`), each numbered from 01. See `docs/sprints/README.md`.

## Domain: moving off `listio.listio.workers.dev`

1. **Register `nuvio-tools.com` through Cloudflare Registrar.** It sells at cost and puts the domain straight into your Cloudflare account, so there's no DNS step.
2. **Attach the domain to the Worker.** Either:
   - **Dashboard:** go to Workers & Pages → `listio` → Settings → Domains & Routes → Add → Custom Domain, or
   - **Config (preferred, survives redeploys):** add this to `wrangler.jsonc`:
     ```jsonc
     "routes": [
       { "pattern": "nuvio-tools.com", "custom_domain": true }
     ]
     ```
     Then run `wrangler deploy`. Cloudflare creates the DNS record and the SSL certificate automatically.
3. **Optional:** add `www.nuvio-tools.com` as a second custom domain, with a Redirect Rule to the bare domain.
4. **Update hardcoded URLs:** Astro's `site` in `astro.config.*`, any absolute URLs, and any sitemap or OG tags. Grep the repo for `workers.dev`.
5. **Retire the old URL:** set `"workers_dev": false` in `wrangler.jsonc`, or leave it on with a redirect if anyone uses the old link.

You don't need to rename the Worker. Listio can stay at `/` until the landing page exists. Moving it to `/listio` breaks bookmarks, so add a redirect from `/` at that point.

## ArtNuvio

### User flow

1. The user pastes an image URL. There are **no file uploads**.
2. They choose a size: hero, poster or landscape.
3. They optionally add small text.
4. They save and get back a **URL hosted by us**, which they can use in their Nuvio collections and catalogs.

### Why a proxy Worker is needed (CORS)

- **Preview works without it.** A plain `<img src="...">` displays images from other sites with no special headers.
- **Export doesn't.** Drawing a cross-origin image to a canvas and exporting it is blocked, because the canvas becomes "tainted", and most sites don't send CORS headers.
- **The fix:** a small Cloudflare Worker takes `?url=...`, fetches the image server-side, and returns it with `Access-Control-Allow-Origin` set. It stores nothing.

Proxy guardrails:

- **Images only:** accept only responses whose `Content-Type` is `image/*`.
- **Size cap:** for example 10–20 MB.
- **Block internal targets (SSRF):** reject `localhost`, private IP ranges and non-http(s) schemes.
- **Rate limiting:** an open proxy attracts abuse.
- **Redirect limit:** don't follow unbounded redirects.

### Hosting saved artwork: Cloudflare R2

**Why R2:**

- **Free egress:** R2 doesn't charge for bandwidth.
- **Free tier:** 10 GB of storage, 1M writes and 10M reads a month. After that, about $0.015/GB/month.
- **Already in the stack:** the Worker writes through a bucket binding, with no extra auth or SDK.
- **Custom domain:** serve images from `img.nuvio-tools.com`, cached by Cloudflare's CDN.

Rough scale: one exported image is about 50–300 KB, so 10 GB holds roughly 30,000–100,000 images.

**Flow:**

1. The browser fetches the source through the proxy Worker and fits it on a canvas, in the browser.
2. The canvas exports a WebP blob, which the browser POSTs to a save Worker.
3. The save Worker validates the blob and writes it to R2 under a content-hash key, such as `a1b2c3….webp`.
4. The save Worker returns `https://img.nuvio-tools.com/a1b2c3….webp`.

**Cost-saving details:**

- **Content-hash filenames:** identical output is stored once, and files can use `Cache-Control: immutable, max-age=1y`.
- **WebP at fixed dimensions per type:** files stay small and predictable.
- **Upload validation:** reject saves over about 1 MB and anything that isn't webp, jpeg or png. Check the magic bytes, not just the header.

**Risks to plan for:**

- **Abuse:** add per-IP rate limits and Cloudflare Turnstile on save. The fixed-dimension pipeline already limits what can be hosted.
- **Lifetime:** users will paste these URLs into Nuvio, so deleting images breaks their artwork. Decide up front whether images are kept forever (simpler and cheap, but storage grows without bound) or purged after a stated period.
- **Takedowns:** without accounts, users can't delete their own images. Provide a takedown path, such as a contact email and manual deletion.

**Alternatives considered:**

- **Cloudflare Images:** charges per image stored and delivered. Only worth it for server-side resizing.
- **GitHub or Supabase storage:** hits limits and terms-of-service problems quickly.

## Collectio

- **The biggest build:** drag and drop plus artwork and folder management make it a real app.
- **Build it last,** once the shared Nuvio data model in `src/lib/nuvio/` has settled through Listio and ArtNuvio.
- **Reuse:** it picks up the design system, the shared types and ArtNuvio's artwork pipeline.

## Cost summary

| Item                       | Cost                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| Domain (`nuvio-tools.com`) | ~$10–12 / year (the only certain cost)                                     |
| Workers                    | Free up to 100k requests/day. Paid plan $5/month, the likely first upgrade |
| R2                         | Free up to 10 GB, then ~$0.015/GB/month                                    |
| Ongoing                    | Your time on moderation and abuse handling                                 |

Even if all three tools take off, expect around $5 a month.

## Agreed order of work

1. **Polish Listio:** tweak functionality and smooth rough edges.
2. **Build a unified design system** in `src/lib/ui/` (tokens for colours, spacing and type, plus base components), then fix Listio's look with it.
3. **Register `nuvio-tools.com`** and switch the Worker to the custom domain (see above).
4. **Restructure:** add the landing page with three cards, move Listio under `/listio` (with a redirect from `/`), and extract shared code into `src/lib/`.
5. **Build ArtNuvio:** it's small and self-contained, and it introduces the proxy Worker, the save Worker and R2.
6. **Build Collectio,** reusing everything above.
