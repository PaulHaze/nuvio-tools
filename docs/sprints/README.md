# Sprints

Work is tracked here, not in GitHub Issues. Work is grouped into **epics**: an epic is a body of
work made of numbered sprints, and each epic numbers its sprints from 01. Sprints are worked one at
a time, in order, each on its own branch. Update a sprint's **Status** and tick its tasks as work
happens.

## Conventions

- **Sprint doc:** `docs/sprints/{epic}/NN_Title.md`, one folder per epic.
- **Branch:** `{epic}-{nn}`, for example `restructure-01`. Later ArtNuvio epics use
  `artnv-{feature}-01` and so on. Parent branch is `main`.
- **Doc lookup:** strip the trailing `-{nn}` from the branch name to get the epic folder, then pick
  the file with prefix `{nn}`. For example `restructure-02` maps to
  `docs/sprints/restructure/02_Home_Page_And_Renaming.md`.
- **Audits:** flat in `docs/audits/`, named by branch: `{branch}-audit-opus.md`,
  `{branch}-audit-astra.md`, `{branch}-audit-summary.md`.

The 15 sprints that built Listio are archived in
[`docs/old/listio/sprints/`](../old/listio/sprints/README.md), with their audits (the older
`sprint-NN-*` files in `docs/audits/` belong to them).

## Epic: Restructure (Nuvio Tools)

Branches `restructure-01` to `restructure-03`.

| #   | Sprint                                                                            | Status                            |
| --- | --------------------------------------------------------------------------------- | --------------------------------- |
| 01  | [Restructure: folders and routes](./restructure/01_Restructure_Folders_Routes.md) | implemented, manual check pending |
| 02  | [Home page and renaming](./restructure/02_Home_Page_And_Renaming.md)              | not started                       |
| 03  | [Domain switch](./restructure/03_Domain_Switch.md)                                | not started                       |

## Roadmap

Future epics, not yet planned in detail, in the agreed order. Each gets its own folder here when
planned. Folder and code-placement rules are in [`docs/roadmap.md`](../roadmap.md).

1. **Listio polish:** tweak functionality and smooth rough edges.
2. **Unified design system** in `src/lib/ui/`: tokens and base components, then restyle Listio and
   the home page.
3. **ArtNuvio** (`artnv-{feature}` epics): fit any image URL to Nuvio's hero, poster and landscape
   sizes. Adds the CORS proxy Worker, the save Worker and an R2 bucket.
4. **Collectio:** visual collection manager. Built last; reuses `src/lib/nuvio/` and ArtNuvio's
   artwork pipeline.
5. **Public list builder, BYOK TMDB:** proposed only, see
   [ADR 0007](../adr/0007-public-list-builder-byok.md).

Design references: [roadmap](../roadmap.md) · [Listio spec](../../list-combiner-spec.md) ·
[glossary](../../CONTEXT.md) · [ADRs](../adr/)
