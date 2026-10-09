# Sprint 03 — Domain switch

**Status:** in progress

**Depends on:** [sprint 01](./01_Restructure_Folders_Routes.md) and
[sprint 02](./02_Home_Page_And_Renaming.md). The owner has already bought `nuvio-tools.com` through
Cloudflare Registrar and attached it to the Worker as a Custom Domain in the dashboard.

## Goal

Move the site to `nuvio-tools.com`. Put the domain in the config, rename the Worker, clean up
`workers.dev` references, and walk the owner through the deploy and addon reinstall.

## What changes

### 1. Config

- `wrangler.jsonc`: add `"routes": [{ "pattern": "nuvio-tools.com", "custom_domain": true }]`. Add
  the same block to `wrangler.jsonc.example` with a comment that self-hosters replace it with their
  own domain or delete it. Keep `"workers_dev": true` until the owner's checklist says otherwise.
- `wrangler.jsonc` and `.example`: Worker `"name"` becomes `nuvio-tools`.
- `astro.config.mjs`: set `site: 'https://nuvio-tools.com'` (it feeds the canonical URL in
  `Layout.astro`). Check the canonical link, robots and any absolute URL that was built from the
  request origin still behave.

**Worker rename warning.** Rename the Worker in the Cloudflare dashboard FIRST (Workers & Pages →
the Worker → Settings → General), so its secrets (`ADMIN_USER`, `ADMIN_PASSWORD`, `TMDB_*`, etc.)
carry over. Then change `"name"` in `wrangler.jsonc` to match. If you change only the config, the
next deploy creates a brand new Worker with no secrets and no data link, and the old one stays
behind.

### 2. `workers.dev` references

Grep for `workers.dev` and fix live references: `README.md` (deployment steps, keep the generic
`workers.dev` advice for self-hosters), `list-combiner-spec.md`, ADR 0004. Don't touch `.wrangler/`
or `docs/old/`.

### Owner checklist (in this order)

1. Buy `nuvio-tools.com` in Cloudflare Registrar and attach it to the Worker as a Custom Domain in
   the dashboard (done before the sprint; the `routes` entry makes it part of the config).
2. Rename the Worker in the dashboard (Settings → General) to `nuvio-tools`. This also renames its
   `workers.dev` address, so the old addon URL stops working here, not at step 6. Back up Nuvio
   collections first, and do steps 2–5 in one sitting. After the rename, check the custom domain is
   still attached under Domains & Routes.
3. Merge this sprint and deploy (`pnpm deploy`) with `routes` and the matching `"name"` in place.
4. Check that login works at `https://nuvio-tools.com`, and that `/listio` lists and saves work.
5. Reinstall the addon in Nuvio from `https://nuvio-tools.com/listio/addon/<secret>/manifest.json`
   (the old `workers.dev/addon/...` URL no longer works).
6. Only then set `"workers_dev": false` in `wrangler.jsonc` and redeploy.
7. ~~Move to the `PaulHaze/nuvio-tools` repo~~ (done 2026-10-09). Rename the local folder to `nuvio-tools` if not done yet.

## Tests

No new tests expected. Existing tests must still pass. If a test builds absolute URLs from the site
origin, check it is not tied to a `workers.dev` host.

## Tasks

- [x] `wrangler.jsonc` and `.example`: `name`, `routes`
- [x] `astro.config.mjs`: `site`; check canonical link and request-origin URLs
- [x] Fix live `workers.dev` references in `README.md`, `list-combiner-spec.md`, ADR 0004
- [ ] Owner: complete the checklist above
- [ ] Later in the checklist: set `"workers_dev": false` and redeploy

## Done when

- `https://nuvio-tools.com` serves the site; login works; `/listio` lists and saves work
- The addon works when installed from `https://nuvio-tools.com/listio/addon/<secret>/manifest.json`
- `workers_dev` is `false` and the old `workers.dev` URL no longer serves the site
- The GitHub repo, local folder and git remote are named `nuvio-tools`
- `pnpm test`, `pnpm build` and `pnpm lint:check` pass

## Out of scope

- Folder moves, routes and renames in code (sprints 01 and 02)
- Redirects from old URLs, `www.nuvio-tools.com`, and the future `img.nuvio-tools.com`
- R2 buckets, proxy or save Workers, Turnstile, rate limiting
- Changing Listio behaviour, the KV data, the `LISTIO` binding name, or `ADDON_ID`
