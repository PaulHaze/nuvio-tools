---
name: start-sprint
description: Use when the user wants to run the current sprint end to end in this repo. Typical trigger: `/start-sprint`. Resolves the sprint doc from the current branch, has Haiku (medium effort) implement the whole sprint as one commit, then runs `/audit-commit` (Opus, high) on that commit. Does not create or switch branches and does not fix audit findings.
---

# Start Sprint

Opus orchestrates, Haiku implements, and Opus audits. One sprint per run.

## Invocation

```
/start-sprint
```

No arguments. Everything is derived from the current branch.

## 1. Resolve the sprint

1. Read `CLAUDE.md` → **Current Working Task** for the branch convention and sprint folder rules.
2. Read the current branch (`git branch --show-current`). It must match `{epic}-{nn}` with a two-digit `{nn}` (e.g. `ui-01`). Stop on a detached HEAD or a branch that does not match.
3. Strip the trailing `-{nn}` to get the epic and look in `docs/sprints/{epic}/` for the file whose two-digit prefix matches `{nn}` (e.g. `ui-01` → `docs/sprints/ui/01_Mood_Board.md`). Exactly one file must match. Stop if there are none or more than one.
4. Read the whole sprint file. Check its heading names this sprint. Note any dependencies on earlier sprints or owner-only steps (dashboards, deploys, attaching images).
5. Record the current `HEAD` SHA as the starting point, and run `git status --short`. Uncommitted changes that already exist belong to the user. Tell Haiku to leave them alone (see below). Do not stash, commit or discard them.

Never create, switch, rename, merge or delete branches. Branch lifecycle belongs to the user (`/new-task`).

## 2. Implement with Haiku

Launch one Agent with `model: "haiku"` and `effort: "medium"` (this overrides the model-router hook). Give it:

- The repo root, branch name and sprint file path, plus the full sprint doc pasted into the prompt as the brief.
- Instructions to read `AGENTS.md`, `CLAUDE.md` and any docs the sprint points to, then implement **every** task and acceptance criterion in the sprint.
- Instructions to run any checks the sprint or repo calls for (build, typecheck, tests, lint) and fix failures before committing.
- **Exactly one commit at the end** covering all its work. Stage only the files it created or changed, by explicit path, and never use `git add -A` or `git add .`. Leave other uncommitted changes in the working tree untouched. Commit message: `{branch}: <short sprint title>`. No `Co-Authored-By` trailer.
- No branch operations, no pushing, no amending earlier commits.
- Any owner-only step it cannot do (external dashboards, credentials, deploys, attaching images) is skipped and listed in its final report instead.
- Final report: the commit SHA, the files changed, checks run with their results, and anything skipped or uncertain.

## 3. Verify the commit

When Haiku finishes:

1. `git log --oneline {start-sha}..HEAD` must show exactly one new commit, and its SHA must match the one Haiku reported.
2. `git show --stat HEAD`: the files should fit the sprint scope, with none of the user's unrelated working-tree changes swept in.
3. Stop and report to the user if Haiku failed, made no commit, made more than one, or left an unclear state. Do not run the audit on a bad commit.

## 4. Audit with Opus

Invoke the `audit-commit` skill (it pins Opus 5.5 at high effort). It audits `HEAD` against the sprint doc and writes `docs/audits/{branch}-audit-opus.md` in the format set out in `AGENTS.md`.

There is no Astra audit at this stage, so `audit-commit` will skip `/audit-sum` with its one-line note. That is expected. Astra runs an adversarial audit and the summary separately at the end of the sprint.

## 5. Report

Keep it short:

- The sprint doc and Haiku's commit (SHA and one-line summary).
- Any owner-only steps Haiku skipped that the user needs to do.
- The audit report path, its verdict and the findings by severity.

Stop there. Do not fix findings. Remediation, Astra's audit, `/audit-sum`, `/audit-action` and `/new-task` are separate steps the user starts.
