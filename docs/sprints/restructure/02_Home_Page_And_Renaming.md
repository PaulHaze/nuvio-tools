# Sprint 02 — Home page and renaming

**Status:** not started

**Depends on:** [sprint 01](./01_Restructure_Folders_Routes.md) (folders and `/listio` routes).

## Goal

Give Nuvio Tools its front door and its name. Add the three-card home page at `/`, the `/artnuvio`
and `/collectio` holding pages, and rename the project from Listio to Nuvio Tools in code and docs.
The domain switch is [sprint 03](./03_Domain_Switch.md).

Nothing changes in how Listio works. The plan behind the layout is in
[`docs/roadmap.md`](../../roadmap.md) and [ADR 0008](../../adr/0008-one-site-tools-under-path-prefixes.md).

## What changes

### 1. Home page and holding pages

- `src/pages/index.astro`: three square cards, **Listio**, **ArtNuvio**, **Collectio**, linking to
  `/listio`, `/artnuvio`, `/collectio`. Each card has a title and a one-line description. Cards sit
  in a row at `md` and up and in a column at `sm` and below. This replaces the temporary root page
  from sprint 01.
- `src/pages/artnuvio/index.astro` and `src/pages/collectio/index.astro`: simple "coming soon"
  holding pages using `Layout.astro`, with a link back to the home page.
- `Layout.astro`: the logo link goes to the Nuvio Tools home (`/`) and is relabelled. A link back to
  `/listio` from Listio pages is a nice-to-have, not required.
- Minimal styling using the existing tokens and utilities. No design-system work. The new pages
  don't need the `.listio-main` class.

### 2. Auth realm

Change the Basic Auth realm to `Nuvio Tools` in `src/middleware.ts`. Public paths stay as set in
sprint 01.

### 3. Renaming

Do the code changes in the sprint. The owner does the manual steps (see sprint 03).

| What                      | Change                                                                                                                              | Who   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----- |
| GitHub repo, local folder | `PaulHaze/nuvio-tools` (repo done 2026-10-09; local folder is the owner's call)                                                     | owner |
| `package.json` `name`     | `nuvio-tools`                                                                                                                       | code  |
| Basic Auth realm          | `Nuvio Tools`                                                                                                                       | code  |
| `LISTIO_NODE_DEV`         | `NODE_DEV`: `package.json` scripts (`dev`, `start`), `astro.config.mjs`, ADR 0004 text, `.dev.vars.example` and README if mentioned | code  |
| README, docs              | "Nuvio Tools" as the project name, Listio as one tool; fix clone URL and folder                                                     | code  |

The Worker `"name"` in `wrangler.jsonc` is renamed in sprint 03, together with the dashboard rename.

**Keep as Listio:** the Listio tool's own code and name, the `LISTIO` KV binding (it is Listio's
data), `vars.ADDON_ID` `com.paulhaze.listio`, and the addon's display name in Nuvio. Test-only
`org.listio.*` IDs also stay.

Doc updates (check what exists today before editing):

- `CLAUDE.md` and `AGENTS.md`: `docs/implementation-plan.md` and `docs/old/...` now live under
  `docs/old/listio/`. Point the cross-cutting context at what exists (`list-combiner-spec.md`,
  `CONTEXT.md`, `docs/adr/`, `docs/roadmap.md`). Sprint and audit conventions are `{epic}-{nn}`
  branches, `docs/sprints/{epic}/NN_Title.md` and `docs/audits/{branch}-audit-*.md` (already updated).
- `README.md` links: the implementation plan and sprints README links.
- `docs/agents/issue-tracker.md`: example sprint filename.
- `list-combiner-spec.md` and `listio_overview.md` describe Listio. Leave their content. Add a note
  at the top of the spec that Listio is now one tool of Nuvio Tools, and that its routes live under
  `/listio`.
- `CONTEXT.md`, ADR 0008 and `docs/roadmap.md` are written already.
- Leave `workers.dev` references alone; sprint 03 handles them.

### 4. Tests

New middleware tests in `test/site/basic-auth.test.ts`, with Basic Auth credentials configured:

- `/` without credentials gives 401 with realm `Nuvio Tools`; with valid credentials it passes.
- `/artnuvio` and `/collectio` need credentials.
- Update any existing test that asserts the old realm.

Optionally add a smoke test that `/` renders three links to `/listio`, `/artnuvio`, `/collectio`.

## Tasks

- [ ] Add the home page with three cards; add `/artnuvio` and `/collectio` holding pages
- [ ] Repoint and relabel the `Layout.astro` logo link to the site home
- [ ] Change the Basic Auth realm to `Nuvio Tools`; add and update the middleware tests
- [ ] Rename `package.json` `name`; `LISTIO_NODE_DEV` to `NODE_DEV` everywhere
- [ ] Update `README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/agents/`, spec note, ADR 0004
- [ ] Check `CONTEXT.md` and spec references still read correctly
- [ ] Update `.dev.vars.example` for `NODE_DEV` if mentioned
- [ ] Manual check: `/` shows the cards, each links through; Listio still works under `/listio`

## Done when

- Visiting `/` shows three cards; they link to `/listio`, `/artnuvio`, `/collectio`. The last two
  show a "coming soon" page
- Everything except `/listio/addon/*` and `/robots.txt` asks for a login, with realm `Nuvio Tools`
- No `LISTIO_NODE_DEV` remains outside `docs/old/`
- Docs call the project Nuvio Tools and describe Listio as one tool
- `pnpm test`, `pnpm build` and `pnpm lint:check` pass

## Out of scope

- Folder moves and route changes (sprint 01)
- `routes`, `site`, Worker `"name"`, `workers.dev` cleanup and the owner checklist (sprint 03)
- Any styling or design-system work (tokens, shared components, restyled Listio). That is a later
  sprint; see the roadmap in [`README.md`](../README.md)
- Any ArtNuvio or Collectio feature beyond the holding pages
- Changing Listio behaviour, the KV data, the `LISTIO` binding name, or `ADDON_ID`
- Making any tool public (see [ADR 0007](../../adr/0007-public-list-builder-byok.md))
