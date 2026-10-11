## Agent skills

### CSS nesting style

- Prefer native CSS nesting: keep a component's descendant, state, and pseudo-element rules inside its root selector instead of repeating the root selector in separate rules.
- Use `:where(&) .child` for nested descendant selectors when the child should retain the specificity it had as a standalone class selector. Nest pseudo-classes and pseudo-elements with `&`, such as `&:hover` and `&::before`.
- Nest responsive overrides inside the component when they belong to that component. Keep unrelated selectors and page-level layout media queries at the top level.

```css
.card {
	@apply rounded-lg;

	:where(&) .card-title {
		@apply font-semibold;
	}

	&:hover {
		@apply shadow-lg;
	}
}
```

### `$start-task` context

- Work source: `docs/sprints/{epic}/`; strip the trailing `-{nn}` from the
  branch name to get the epic folder, then use the sprint file whose two-digit
  numeric prefix matches `{nn}` (for example, `restructure-01` maps to
  `docs/sprints/restructure/01_Restructure_Folders_Routes.md`). The sprint file
  is the canonical implementation brief. An epic is a body of work made of
  numbered sprints; each epic numbers its sprints from 01.
- Branch convention: `{epic}-{nn}` (for example, `restructure-01`; the
  ArtNuvio MVP is `artmvp-{nn}`, later ArtNuvio epics `artnv-{feature}-01`).
  `start-sprint` must not create, switch, rename, merge, or delete branches; the
  user manages sprint branches. (`/new-task` is the exception: it owns branch
  creation, merging and deletion between sprints.)
- Implementation agent: `gpt-6.1-sol` at medium reasoning effort.
- Audit agent: `gpt-6-astra` at high reasoning effort, run manually by the
  owner in a fresh context after the implementation commit is complete. Write
  only the declared audit report; do not implement audit findings.
- Sprints are completed one at a time in numeric order within an epic, as
  listed in the epic's `docs/sprints/{epic}/README.md`.
- Audit destination: `docs/sprints/{epic}/audits/{branch}-audit-astra.md`, named by the
  branch (for example, `restructure-02-audit-astra.md`).

### `$audit-commit` context

- Task directory: `docs/sprints/{epic}/`
- Implementation file: the unique sprint Markdown file in
  `docs/sprints/{epic}/` whose two-digit filename prefix matches `{nn}` from
  the branch `{epic}-{nn}`
- Audit report directory: `docs/sprints/{epic}/audits/`
- Audit report filename: `{branch}-audit-astra.md`

### `/audit-commit` context (Claude / Opus)

Used by Claude Code's `/audit-commit`, `/audit-sum`, `/audit-action` and
`/summary`. The `$audit-commit` block above is Astra's (Codex); this one is
Opus's.

- Branch convention: `{epic}-{nn}` (two-digit `{nn}`, e.g. `restructure-01`).
  `{nn}` is the sprint number within the epic.
- Task doc: strip the trailing `-{nn}` from the branch to get the epic folder,
  then use the file in `docs/sprints/{epic}/` whose two-digit prefix matches
  `{nn}` (e.g. `restructure-02` →
  `docs/sprints/restructure/02_Home_Page_And_Renaming.md`). The whole file is
  the task scope; there are no `Task NN` headings to match.
- Audits directory: `docs/sprints/{epic}/audits/`
- Claude audit filename: `{branch}-audit-opus.md`
- `/audit-commit` does not run `/audit-sum`. The owner runs `/audit-sum`
  manually, after the Astra audit exists, if a summary is wanted.

### `$audit-sum` context

- Audits directory: `docs/sprints/{epic}/audits/`
- Claude audit (input): `{branch}-audit-opus.md`. Auditor label: **Opus**.
- Counterpart audit (input, read-only, owned by Astra):
  `{branch}-audit-astra.md`. Auditor label: **Astra** (use this wherever
  the skill says `Sol`/`GPT`).
- Consolidated summary (output): `{branch}-audit-summary.md`
- Summary heading line: `Combined findings of Astra and Opus audits:`
- Completeness rule: every finding in the Astra audit must appear in the
  summary with all its information: severity, `file:line` references,
  reasoning, evidence, and Astra's suggested fix. The same applies to every
  Opus finding. Never drop, merge or shorten away an auditor's details. Put
  Astra's proposed fix in the `Suggested fix:` line, and add an alternative
  only as a clearly labelled extra. Include any Astra notes that aren't
  findings (verification run, coverage notes, positive observations) in a
  short `Auditor notes` section at the end, attributed by auditor.

### `$new-task` context

- Parent branch: `main`
- Push flag: `true`
- Branch convention: `{epic}-{nn}` (two-digit `{nn}`, e.g. `restructure-01`; the
  ArtNuvio MVP epic uses `artmvp-{nn}`, later ArtNuvio epics `artnv-{feature}-01`).
  `{nn}` is the sprint number within the epic. The epic is everything before the
  trailing `-{nn}`, so it may contain hyphens.
- The next branch increments `{nn}` within the same epic, keeping two digits
  (`restructure-01` → `restructure-02`). Starting a new epic is the owner's call.

### Work tracking

No GitHub Issues. Work is tracked as numbered sprint files in `docs/sprints/{epic}/`, worked one at a time in order within an epic. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
