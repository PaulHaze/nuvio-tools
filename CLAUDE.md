# CLAUDE.md

This repo's shared agent instructions (issue tracker, triage labels, domain docs) live in [`AGENTS.md`](./AGENTS.md) — read that first, since it's the master file used by both Claude and Codex.

Claude-specific instructions go below.

## Current Working Task

Used by `/audit-commit`, `/audit-sum`, `/audit-action` and `/summary`.

- **Branch convention:** `{epic}-{nn}` (two-digit `{nn}`, e.g. `restructure-01`; the ArtNuvio MVP epic uses `artmvp-{nn}`, later ArtNuvio epics `artnv-{feature}-01`). An **epic** is a body of work made of numbered sprints; each epic numbers its sprints from 01. `{nn}` is the sprint number within the epic.
- **Task doc:** strip the trailing `-{nn}` from the branch to get the epic folder, then use the file in `docs/sprints/{epic}/` whose two-digit prefix matches `{nn}` (e.g. `restructure-02` → `docs/sprints/restructure/02_Home_Page_And_Renaming.md`). Each sprint has its own file, so the whole file is the task scope. There are no `Task NN` headings to match.
- **Cross-cutting context:** [`docs/roadmap.md`](./docs/roadmap.md), [`CONTEXT.md`](./CONTEXT.md) and [`docs/adr/`](./docs/adr/). Read the parts that bear on the changed files. [`list-combiner-spec.md`](./list-combiner-spec.md) is Listio's spec.
- **Audits folder:** `docs/audits/`
- **Claude audit filename:** `{branch}-audit-opus.md` (e.g. `docs/audits/restructure-03-audit-opus.md`)
- **GPT (Astra) audit filename:** `{branch}-audit-astra.md`. Use this in place of the default `{branch}-gpt-audit.md` wherever a skill looks for the GPT/Sol audit.
- **Audit summary filename:** `{branch}-audit-summary.md`
- **Audit summary rules:** see `$audit-sum` context in [`AGENTS.md`](./AGENTS.md). Keep all of Astra's information and present both auditors as **Astra** and **Opus**.
