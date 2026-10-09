# Nuvio Art: handoff (v0.0.1)

A desktop-only web tool. Paste a **direct image URL** (for example from Pinterest, using right-click → _Open image in new tab_), frame it at an exact Nuvio shape, add a title and colour overlay, then click **Create**. You get a permanent URL to paste into a Nuvio collection or folder image field.

**Why it exists:** Nuvio stretches whatever image you give it to fill the tile. If the image is already the exact shape, stretching it changes nothing. Hotlinked Pinterest and AI-site URLs also expire or block hotlinking, so the tool keeps its own copy.

---

## Status

| Area                                                             | State                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Worker: fetch proxy, save, serve                                 | ✅ Built, typechecks, tested locally with `wrangler dev`            |
| Editor: frames, fit/fill, blurred bars, pan/zoom, overlay, title | ✅ Built, tested in headless Chromium                               |
| Create, then copy URL, plus recent history                       | ✅ Works end to end locally (R2 is simulated by Miniflare)          |
| Deployed to Cloudflare                                           | ❌ Not yet. See [Deploy](#deploy)                                   |
| Tested against real Pinterest / AI-site URLs                     | ❌ The build sandbox had no outbound web access. **Do this first.** |
| Tested inside Nuvio                                              | ❌ Check that the frame sizes look right on your devices            |

---

## Quick start (local)

```bash
npm install
cp .dev.vars.example .dev.vars      # then set APP_TOKEN to anything
npm run dev                          # http://localhost:8787
```

Open the site, click ⚙, enter the same `APP_TOKEN`, and paste an image URL.

- R2 is simulated locally under `.wrangler/state`, so nothing touches your Cloudflare account.
- `ALLOW_PRIVATE_HOSTS=true` in `.dev.vars` lets the proxy fetch `localhost` URLs, which is handy for testing with a local image server. **Never set it in production.**
- `npm run typecheck` runs `tsc --noEmit` on the Worker.

## Deploy

```bash
npx wrangler login
npx wrangler r2 bucket create nuvio-art
npx wrangler secret put APP_TOKEN     # pick a long random string
npm run deploy
```

The site will live at `https://nuvio-art.<your-subdomain>.workers.dev`. Optionally, add a custom domain under Workers → Settings → Domains.

**Optional: serve images from their own domain.** Connect the R2 bucket to a custom domain (for example `art.yourdomain.com`), then set `PUBLIC_IMAGE_BASE` in `wrangler.jsonc` to that origin. Saved URLs will point there instead of `/i/…` on the Worker. Existing `/i/…` URLs keep working either way.

---

## How it works

```
 Browser (desktop)                         Cloudflare Worker                      R2
 ─────────────────                         ─────────────────                      ──
 paste URL ───────► GET /api/fetch-image?url=…  (auth)
                    ├─ validate http(s), block private hosts, re-check redirects
                    ├─ Pinterest: try /originals/ first, fall back to pasted size
                    ├─ reject non-images (HTML page → "open image in new tab" hint)
                    └─ stream bytes back same-origin (so canvas isn't tainted)
 canvas render ◄──┘
 (frame, fit/fill, overlay, text — all client-side)
 Create ──────────► POST /api/save  (auth, multipart: image + recipe JSON)
                    ├─ type allowlist + magic-byte check + size cap
                    └─ key = a/<sha256>.jpg  ──────────────────────────────────►  put (immutable)
 URL shown/copied ◄┘
 Nuvio ───────────► GET /i/a/<hash>.jpg  (public, cached, immutable) ◄───────────  get
```

**Key decisions**

- **All image processing happens in the browser (canvas).** The server never decodes images, so there are no Sharp or ImageMagick dependencies and no memory limits to worry about. Re-encoding through canvas also strips EXIF and neutralises malformed files.
- **Only direct image URLs.** There is no HTML scraping. If someone pastes a page URL, they get a clear message telling them how to get the image link instead.
- **Content-hashed keys.** Each edit produces a new URL, so Nuvio and CDN caching never serve stale art, and identical renders are deduplicated.
- **One auth gate:** `authorize()` in `src/auth.ts`. Today it checks a shared secret. For a public launch, swap in Turnstile plus rate limiting inside that function. The routes don't change.
- **Recipe sidecar:** each save also writes `a/<hash>.jpg.recipe.json` (source URL + settings), which a future "edit this again" feature can use.
- **Output format:** JPEG at quality 0.9, the safest choice across Nuvio clients.

## File map

```
wrangler.jsonc          Worker config: static assets, R2 binding, vars
src/index.ts            Router: /i/* public, /api/* behind authorize(), else static assets
src/auth.ts             authorize() — shared-secret bearer token (the public-launch swap point)
src/fetchImage.ts       Proxy: URL checks, private-host block, redirect re-check, Pinterest upgrade, size cap
src/save.ts             Upload: type/magic checks, sha256 key, R2 put + recipe sidecar
src/serve.ts            Public image serving from R2 with edge cache
src/env.ts              Env type + json/error helpers
public/index.html       Editor layout
public/styles.css       Dark desktop UI (min width 960px)
public/js/render.js     PURE renderer: FRAMES, FONTS, defaultSettings(), render(). No DOM access.
public/js/app.js        UI wiring: controls, paste/drop, pan/zoom, API calls, history, shortcuts
```

**To add or change a frame size:** edit `FRAMES` in `public/js/render.js` and add a button to `#frame-seg` in `index.html`. Keyboard shortcuts 1–3 are mapped in `app.js` (`setupGlobalInput`).

**To add a font:** add it to the Google Fonts `<link>` in `index.html` and to `FONTS` in `render.js`. `ensureFont()` waits for it to load before drawing.

## API

All `/api/*` routes except `/api/health` require the header `Authorization: Bearer <APP_TOKEN>`. Errors look like `{ "error": { "code", "message" } }`.

| Route                       | Purpose                                                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /api/health`           | `{ ok, version }`                                                                                                                                                                                                  |
| `GET /api/fetch-image?url=` | Returns image bytes. Headers: `x-resolved-url`, `x-upgraded: 1\|0`. Error codes: `bad_url`, `blocked_url`, `blocked_redirect`, `not_image_page`, `not_image`, `svg`, `too_large`, `upstream_status`, `unreachable` |
| `POST /api/save`            | Multipart `image` (jpeg/png/webp ≤ `MAX_SAVE_BYTES`) plus optional `recipe`. Returns `{ key, url, deduped }` with status 201 when new, 200 when it's a duplicate                                                   |
| `GET /i/a/<32 hex>.<ext>`   | Public image. Immutable, CORS `*`                                                                                                                                                                                  |

## Editor features

- **Frames:** Poster 1000×1500 (2:3), Landscape 1920×1080 (16:9), Square 1080×1080.
- **Fill** (cover + crop) or **Fit** (whole image), with an optional blurred background filling the empty space.
- Drag to reposition, scroll to zoom, double-click to reset. Panning is clamped so Fill mode never shows an empty edge.
- **Overlay:** Tint (with blend modes), Gradient (edge and reach), Duotone (shadow and highlight colours). Includes swatches.
- **Title:** 6 fonts, auto-shrink and wrap (up to 3 lines), top/middle/bottom, left/centre/right, uppercase, shadow, backdrop scrim, letter spacing.
- **Input:** paste a URL anywhere with ⌘/Ctrl+V, drag an image in from another tab, or paste a copied image. `/?url=<image>` preloads, which is the hook for a future bookmarklet.
- **Shortcuts:** `1` `2` `3` switch frames, `F` toggles fit/fill, `⌘/Ctrl+Enter` creates.
- A warning appears when the source is being enlarged more than 1.35× (the result may look soft).
- **Download** saves the JPEG locally without uploading anything.
- **Recent:** the last 24 creations, stored in this browser's localStorage. Click one to copy its URL.

## Known gaps and things to verify

1. **Real-world URLs.** Test several Pinterest `i.pinimg.com` links: confirm the `/originals/` upgrade works and that it falls back cleanly when it doesn't. Test AI sites too (Midjourney CDN, Lexica, Civitai and so on). Some may return 403 to server fetches. If so, try adjusting the `user-agent` or `accept` headers in `fetchImage.ts`, or accept that those images need the "copy image → paste" route, which bypasses the proxy.
2. **Nuvio's real aspect ratios.** Measure the collection hero/backdrop and the folder tiles on TV, phone and desktop. The hero may want a different ratio, such as 21:9 or 3:1. If it does, add it to `FRAMES`.
3. **Browser support.** `ctx.filter` (the blurred bars) and `ctx.letterSpacing` work in Chrome and Edge, and in recent Safari. Firefox supports `filter`, and `letterSpacing` in newer versions. Letter spacing silently no-ops where it's unsupported.
4. **Large proxied images.** Error handling mid-stream: if an upstream image exceeds `MAX_FETCH_BYTES` without a `content-length` header, the stream errors partway through and the browser reports a generic decode failure rather than the friendly message.
5. **No automated tests yet.** v0.0.1 was checked by hand: curl against every route plus a headless-Chromium run of the editor. The pure pieces (`upgradeCandidates`, `isPrivateHost`, the magic-byte sniffing) are easy to unit test. Vitest with `@cloudflare/vitest-pool-workers` is the natural choice.

## Roadmap ideas

**Next (still personal)**

- Unit tests plus a small Playwright smoke test (load → create → URL).
- "Edit again": load a recipe from `…recipe.json`, or from the history grid.
- Saved style presets (overlay + font + position), so a whole set of collection tiles matches.
- A bookmarklet: `javascript:location='https://<site>/?url='+encodeURIComponent(<img src under cursor or location.href>)`.
- More frames once Nuvio's hero ratio has been measured.
- A TMDB backdrop search tab.

**Going public (checklist)**

- [ ] Replace `authorize()` with Turnstile verification for `/api/save`, and add a lightweight limit on the proxy (per-IP rate limiting via the Workers Rate Limiting binding).
- [ ] Remove the token UI, or keep it as an "admin" mode.
- [ ] An R2 lifecycle rule to delete objects that haven't been fetched in N months (or track last access).
- [ ] Terms of use, plus a DMCA/takedown contact and a `DELETE` admin route. Users will paste copyrighted images; see the discussion in the chat.
- [ ] Hash blocklist for removed images, so the same file can't be re-uploaded.
- [ ] Optional: tighten the proxy to a domain allowlist.
