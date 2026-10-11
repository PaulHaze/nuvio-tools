# Audit Summary: artmvp-02 — Sprint 02: Framing maths

Combined findings of Astra and Opus audits:

Sources: `artmvp-02-audit-astra.md` (Astra, verdict PASS) and `artmvp-02-audit-opus.md` (Opus, commit `9220506`).

## Issues

### 1. `heroFullSizeAllowed` allows 4K when the image is zoomed out below the Frame [suggestion] · raised by Opus

- **What it is:** The code allows the 3840×2160 Hero option whenever the image scale is 1 or less. The epic README says 4K should only be offered when the visible part of the Original has at least 3840×2160 real pixels. Those two rules differ when the image is smaller than the Frame.
- **Why it matters:** Example: a 1920×1080 Original at scale 0.5 shows only a 960×540 patch, with black around it, yet 4K would still be offered. The user would be paying for a 4K file that is mostly black and only has about a quarter of the detail.
- **Where:** `src/tools/artnuvio/framing.ts:127`
- **Related:** none
- **Suggested fix:** Your call, as the two documents disagree. Either reword the README to say "no enlarging (scale ≤ 1)", which matches the code and the sprint brief. Or tighten the rule so the image must also cover the Frame (`iw * scale >= fw && ih * scale >= fh`), and add a test for it. I'd lean towards the tighter rule, since it matches what the README promises.
- **Auditor coverage note:** Only Opus compared this against the README's "Hero size" rule. Astra checked it against the sprint brief only.

**ACTION***"no enlarging (scale ≤ 1)" - lets go with this approach. We can revisit when it goes live to see if it needs to be tweaked

### 2. No guard against zero-size or non-finite inputs [suggestion] · raised by Opus

- **What it is:** The functions assume the Original's size and the placement scale are positive, finite numbers, but this is only a comment. A 0×0 Original makes the cover scale `Infinity`. A placement with scale 0 makes the zoom ratio infinite and can leave the centre as `NaN`. Nothing raises an error; the placement just becomes invalid silently.
- **Why it matters:** A broken image (for example a failed decode in sprint 03) would produce a garbage placement that might not show up until export.
- **Where:** `src/tools/artnuvio/framing.ts:16`, `src/tools/artnuvio/framing.ts:87`
- **Related:** none
- **Suggested fix:** Keep `framing.ts` as pure maths and reject zero or non-finite O

**ACTION** Suggested Fix

### 3. Sprint table still shows sprint 01 as `planned` [suggestion] · raised by Opus

- **What it is:** The sprint index in the epic README still lists sprint 01 as `planned`, even though it has been completed and merged. The commit reformatted this table and set sprint 02 to `completed`, so the stale status is now part of the table that was touched.
- **Why it matters:** The index is the place people look to see what's done, so it gives the wrong picture.
- **Where:** `docs/sprints/artmvp/README.md:68`
- **Related:** none
- **Suggested fix:** Change sprint 01's status to `completed`.
- **Auditor coverage note:** Only Opus looked at the README table. Astra's review covers the README only for the Editor/Hero rules and status change.

**ACTION** Suggested fix

---

**Tally:** 3 issues total (0 from Astra, 3 from Opus). 0 critical, 0 warnings, 3 suggestions.
**Overlaps to judge:** none noted.
**Conflicts to resolve:**

- Astra's verdict is PASS with "no concrete defects". Opus raises issues #1 and #2 and #3. Both can be true: Astra checked the sprint brief, Opus also checked the README and the input-validation point. Owner to decide whether #1 and #2 count as in scope for sprint 02.

## Auditor notes

### Astra (verbatim from `artmvp-02-audit-astra.md`, condensed only where noted)

- **Audit target:** Auditor Astra; repository `nuvio-tools`; branch `artmvp-02`; Task Sprint 02 — Framing maths; specification `docs/sprints/artmvp/02_Framing_Maths.md`, supplemented by the epic README's Editor and Hero size rules and `src/tools/artnuvio/frames.ts`; commit `922050684a52fe4114b05c4bc3c754b3f49d67c9` — `feat(artnuvio): implement framing maths` (no commit body); diff basis `35c5042f5ce59f665022b00f7ca718e85d94cf03..922050684a52fe4114b05c4bc3c754b3f49d67c9`, normal single-parent commit; working tree clean before and after validation; this report was the only audit change.
- **Verdict:** PASS
- **Executive summary:** The commit implements all specified framing functions as pure TypeScript and adds 36 unit tests. The formulas, clamping bounds, zoom anchor, mode transitions, saved-size softness threshold and Hero eligibility match the original sprint requirements. All 266 repository tests passed, as did focused strict TypeScript checking and ESLint. The complete four-file diff was reviewed. Changes to the sprint brief only mark completion and record verification; no acceptance criteria were weakened. The epic README only updates the sprint status and table formatting. No concrete defects were identified.
- **Findings:** Critical 0, Warnings 0, Suggestions 0. "No material defects or improvement recommendations were identified relative to the task specification."
- **Task coverage (all 14 requirements, status Satisfied):**
  1. Required `Mode` and `Placement` model; full-size output pixel coordinates — `framing.ts:3–16`; tests `framing.test.ts:45`.
  2. Cover and Fit scales — `framing.ts:17–23`; `framing.test.ts:28–48`.
  3. Slider range from half Fit to four times Cover — `framing.ts:25–33`; `framing.test.ts:49–50`.
  4. Mode placement resets scale and centres the image — `framing.ts:35–46`; `framing.test.ts:51–59`.
  5. Larger drawn axis must cover the Frame; smaller axis must stay inside; equality fixes the centre — `framing.ts:52–76`; `framing.test.ts:93–117`.
  6. Zoom clamps requested scale — `framing.ts:85–87`; `framing.test.ts:160–168`.
  7. Zoom preserves the Original point under the Frame centre, then clamps position — `framing.ts:87–95`; `framing.test.ts:143–158, 170–179`.
  8. Zoom clears mode, including an unchanged scale — `framing.ts:91`; `framing.test.ts:149, 182–183`.
  9. Pan uses Frame pixel deltas, clamps position and preserves mode — `framing.ts:98–109`; `framing.test.ts:119–139`.
  10. Enlargement uses the saved-size factor — `framing.ts:112–118`; `framing.test.ts:188–197`.
  11. Softness is strictly greater than 1.35 — `framing.ts:120–124`; `framing.test.ts:189–197`.
  12. Hero full size allowed at scale ≤ 1 — `framing.ts:127–129`; `framing.test.ts:200–203`.
  13. Pure functions with no DOM, canvas, UI or Astro dependency — only import is `Aspect` type at `framing.ts:1`.
  14. Every framing rule has a test and `pnpm test` passes — 25 files, 266 tests, including the 36 new framing cases.
- **Integration and coverage notes:**
  - Frame table, `outputSize` helper and Frame tests inspected; the shared `Aspect` shape is compatible, and the tests request Hero's full size deliberately.
  - Vitest config, package scripts, TypeScript config, CI config and ArtNuvio page/preview/control components inspected; Vitest discovers the new tests with no framing mocks.
  - No production consumers of the framing helpers yet; wiring into the editor and export belongs to later sprints.
  - The positive, finite dimension/placement-scale precondition is documented at `framing.ts:16`. The sprint does not specify validation or recovery for malformed dimensions, NaN or invalid persisted placements; no such production input path is introduced by this commit.
- **Validation performed:**
  - Reviewed the complete patch and compared the original and committed sprint brief.
  - `pnpm test` — passed: 25 files and 266 tests.
  - `tsc --noEmit --strict` on `frames.ts`, `framing.ts`, `framing.test.ts` — passed (focused check, not a full Astro check).
  - `eslint src/tools/artnuvio/framing.ts` — passed.
  - `git diff --check` — passed.
  - Not run: full Astro check/build and repository-wide formatting check (no build or runtime changes in this commit).
  - No dependencies installed, fixes applied, or commits created.
- **Residual risks:** Browser rendering, editor events and exported images were not exercised, as this sprint adds only the pure maths layer. Later integrations must supply full-size Frame dimensions and the correct saved-size factor. No unresolved defect within Sprint 02's scope.

### Opus (from `artmvp-02-audit-opus.md`)

- **Scope:** Files audited were `framing.ts` and `framing.test.ts`. Docs changes were checked for status only.
- **Scope match:** Every listed function is present with the specified formula; `framing.ts` imports only a type; `pnpm vitest run test/artnuvio/framing.test.ts` passes 36/36.
- **Positive observations:**
  - `clampAxis` (`framing.ts:52–65`) handles both the "bigger" and "smaller" cases with one min/max pair, and degrades to the Frame centre at exact equality. This also absorbs floating-point differences around `drawn == frame`.
  - `zoomTo` clamps the scale before working out the anchor ratio, so the Original point at the Frame centre stays fixed even when the slider is pushed past its limits (test at `framing.test.ts:170–174`).
  - All functions return new objects; tests check inputs are not mutated (`framing.test.ts:107–108, 131, 156`).
  - The softness and Hero-threshold tests check both sides of each boundary; the 0.5-factor cases use exact binary fractions, so `toBe` is safe.
  - The scale table covers all four Frames × three Original shapes at full output size.

## Output and next steps

Want me to fix any of these?
