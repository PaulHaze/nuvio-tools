# Sprint 01 — Restructure: folders and routes

**Status:** implemented, manual check pending

**Depends on:** nothing. First sprint of the Restructure epic (Nuvio Tools restructure, sprints 01–03).

The old Listio sprints (01–15) are archived in `docs/old/listio/`. Numbering restarts here.

## Goal

Move the Listio app into the target folder layout of **Nuvio Tools** (one site that will host three
tools: Listio, ArtNuvio, Collectio) and put every Listio route under `/listio`. This sprint is the
mechanical move only. The home page, holding pages, renames and domain follow in
[sprint 02](./02_Home_Page_And_Renaming.md) and [sprint 03](./03_Domain_Switch.md).

Nothing changes in how Listio works. The plan behind the layout is in
[`docs/roadmap.md`](../../roadmap.md) and [ADR 0008](../../adr/0008-one-site-tools-under-path-prefixes.md).
Earlier planning notes: [`docs/nuvio-tools-next-steps.md`](../../nuvio-tools-next-steps.md).

**Temporary root page.** Until sprint 02 adds the real home page, `/` can be whatever is simplest: a
redirect or a plain link to `/listio`. Do not build the three-card page here.

## What changes

### 1. Folders

Listio's non-page code moves as-is (no renames, no refactors) into `src/tools/listio/`:

| From                               | To                                    |
| ---------------------------------- | ------------------------------------- |
| `src/domain/`                      | `src/tools/listio/domain/`            |
| `src/sources/`                     | `src/tools/listio/sources/`           |
| `src/storage/`                     | `src/tools/listio/storage/`           |
| `src/addon/`                       | `src/tools/listio/addon/`             |
| `src/tmdb/`                        | `src/tools/listio/tmdb/`              |
| `src/client/`                      | `src/tools/listio/client/`            |
| `src/api/` (validate, http helper) | `src/tools/listio/api/`               |
| `src/components/editor/`           | `src/tools/listio/components/editor/` |
| `src/components/export/`           | `src/tools/listio/components/export/` |
| `src/components/import/`           | `src/tools/listio/components/import/` |
| `src/components/titles/`           | `src/tools/listio/components/titles/` |

Site-wide code goes to `src/lib/ui/` (the landing and holding pages need it too):

| From                                  | To                             |
| ------------------------------------- | ------------------------------ |
| `src/layouts/Layout.astro`            | `src/lib/ui/Layout.astro`      |
| `src/styles/main.css`                 | `src/lib/ui/main.css`          |
| `src/components/ui/ThemeToggle.astro` | `src/lib/ui/ThemeToggle.astro` |
| `src/utils/` (`index.ts`, `clsxm.ts`) | `src/lib/ui/utils/`            |

Fonts are declared in `astro.config.mjs` and used by `Layout.astro`, so they need no move.

Stays where it is: `src/middleware.ts`, `src/env.d.ts`, `src/dev/` (the Node dev stand-in for
`cloudflare:workers`), `src/icons/` (astro-icon's folder), `public/`, `scripts/`.

New empty folders, each with a `.gitkeep`: `src/tools/artnuvio/`, `src/tools/collectio/`,
`src/lib/nuvio/`.

**Boundary rule:** code in `src/tools/<tool>/` imports from `src/lib/` and from itself only, never
from another tool. Pages may import from their own tool and from `src/lib/`.

Notes:

- `src/utils/` (the `cn` class helper) is only used by `ThemeToggle.astro`, so it goes with the site-wide UI code. Update that import.
- `@/` still maps to `src/`, so imports become `@/tools/listio/...` and `@/lib/ui/...`. Fix every
  relative import that crosses the new boundaries.
- `src/styles/main.css` contains `.listio-main` rules. Leave them for now. Splitting site-wide styles
  from Listio styles belongs to the design-system sprint.

### 2. Pages and routes

| Old                        | New                                |
| -------------------------- | ---------------------------------- |
| `/` (Home, lists)          | `/listio`                          |
| `/import`, `/export`       | `/listio/import`, `/listio/export` |
| `/lists/[id]`              | `/listio/lists/[id]`               |
| `/api/*`                   | `/listio/api/*`                    |
| `/addon/<secret>/*`        | `/listio/addon/<secret>/*`         |
| `/robots.txt`, `404.astro` | unchanged, stay at the root        |

Page files move under `src/pages/listio/` (`index.astro`, `import.astro`, `export.astro`,
`lists/[id].astro`, `api/`, `addon/`). No redirects from the old paths: there is one user, and the
addon is reinstalled anyway. The new `/` is the temporary page described in the Goal.

Every hard-coded path must follow. Known places (grep `'/api`, `/lists/`, `/import`, `/export`,
`href="/"` to find the rest):

- Client fetch URLs: `client/matchLines.ts`, `client/titleIdentity.ts`, `client/importList.ts`,
  `components/titles/TitleControls.tsx`, `components/editor/Editor.tsx`, and the inline script in
  the Listio home page.
- Links: `components/import/ImportFromText.tsx` (`/lists/...`), the Listio home page (`/import`,
  `/export`, `/lists/...`), `domain/nuvioCollection.ts` (`collectionExportUrl` returns `/export?...`).
- `Layout.astro`: the logo link `href="/"` and its "Listio home" label. Point the logo at `/listio`
  for now (the site home does not exist until sprint 02, which repoints it to `/` and relabels it).
- The addon install URL shown anywhere in the UI or docs.
- The `.listio-main` class stays on Listio pages.
- `BroadcastChannel('listio-saves')` is a Listio internal name. Leave it.

The `/sources/...` and `/lists/...` strings in `sources/trakt.ts` and `sources/mdblist.ts` are
upstream API paths, not site routes. Leave them alone.

### 3. Auth

The whole site stays behind Basic Auth, except:

- `/listio/addon/*` (Nuvio fetches these with no login; the secret in the URL is the protection)
- `/robots.txt`

Update `PUBLIC_PREFIXES` in `src/middleware.ts`. Leave the realm as it is (sprint 02 changes it to
`Nuvio Tools`). Match on path boundaries, not loose prefixes: `/listio/addon/` must not let through
`/listio/addonx` or `/addon/...` (the old path is now a normal protected route).

### 4. Docs and audits

- Optional housekeeping: move `docs/audits/*` (sprints 02–15 of old Listio) to `docs/old/listio/audits/`. The audits folder
  is then tidy; the old `sprint-NN-*` names do not clash with the new `{epic}-{nn}` names, so skipping this is fine.
- Update links to the moved audits or old paths, if any exist (grep `docs/audits`).

### 5. Tests

`test/` is flat today. Reorganise it to match:

- `test/listio/`: everything that tests Listio code, plus `test/fixtures/` moved to
  `test/listio/fixtures/` (tests load fixtures with `new URL('./fixtures/...', import.meta.url)`, so
  moving the folder with the tests keeps those working).
- `test/site/`: `basic-auth.test.ts`, `robots.test.ts`, `smoke.test.ts`.
- Update the imports (`../src/...` becomes `../../src/tools/listio/...` and so on) and any request
  URLs in tests that use the old route paths.

New middleware tests in `test/site/basic-auth.test.ts`, with Basic Auth credentials configured:

- `/listio` and `/listio/api/lists` need credentials.
- `/listio/addon/<secret>/manifest.json` and a catalog path pass without credentials.
- `/robots.txt` passes without credentials.
- Old paths `/addon/<secret>/manifest.json` and `/api/lists` now need credentials (401).
- Look-alikes need credentials: `/listio/addonx`, `/listio/addon` (no trailing slash), `/robots.txt.bak`.
- Unconfigured `ADMIN_USER`/`ADMIN_PASSWORD` still gives 503 on protected paths.

### Deploy note

If this sprint is deployed before sprint 03, the addon URL is already
`https://<worker>.workers.dev/listio/addon/<secret>/manifest.json`, so the addon must be reinstalled
in Nuvio from that URL. Sprint 03 changes the host again, so the owner may prefer to deploy only
after sprint 03.

## Tasks

- [x] Move Listio code into `src/tools/listio/` and site-wide files into `src/lib/ui/` as tabled
- [x] Add empty `src/tools/artnuvio/`, `src/tools/collectio/`, `src/lib/nuvio/` with `.gitkeep`
- [x] Move pages under `src/pages/listio/` (including `api/` and `addon/`); fix all imports
- [x] Update client fetch URLs, links, `collectionExportUrl`, and the logo link
- [x] Make `/` a temporary redirect or link to `/listio`
- [x] Update `middleware.ts` public paths (boundary-safe) and add the middleware tests
- [x] Reorganise `test/` and fix paths; all existing tests pass
- [ ] (Optional, skipped) Move `docs/audits/*` to `docs/old/listio/audits/`
- [ ] Manual check: every Listio screen works under `/listio` (Home, editor, import, export,
      review grid, addon manifest and catalogs)

## Done when

- Listio works as before under `/listio`, including saving, import, export and the addon
- `/` reaches `/listio` (temporary page)
- Old root paths (`/api/...`, `/addon/...`, `/import`) no longer serve Listio
- Everything except `/listio/addon/*` and `/robots.txt` asks for a login, and look-alike paths do not
  slip through
- No code in `src/tools/<tool>/` imports from another tool
- `pnpm test`, `pnpm build` and `pnpm lint:check` pass

## Out of scope

- The three-card home page and the `/artnuvio` and `/collectio` holding pages (sprint 02)
- Renames: `package.json`, auth realm, `LISTIO_NODE_DEV`, README and doc text (sprint 02)
- Domain, `routes`, `site`, Worker `"name"` and the owner checklist (sprint 03)
- Any styling or design-system work (tokens, shared components, restyled Listio). That is a later
  sprint; see the roadmap in [`README.md`](../README.md)
- Contents of `src/lib/nuvio/` (shared Nuvio types and schema move there only when a second tool
  needs them)
- Redirects from old URLs
- Changing Listio behaviour, the KV data, the `LISTIO` binding name, or `ADDON_ID`
- pnpm workspaces or splitting packages
