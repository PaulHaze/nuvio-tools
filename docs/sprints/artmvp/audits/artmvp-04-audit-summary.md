# Audit Summary: artmvp-04 — Sprint 04, Editor controls

Combined findings of Astra and Opus audits (commit `03631a3`, "feat(artnuvio): add framing controls and preview dragging").

**Astra's result:** PASS, no findings (0 critical, 0 warnings, 0 suggestions). Astra checked every requirement in `04_Editor_Controls.md` and marked each Satisfied. Three are "satisfied by code, browser/device behaviour unverified": drag capture outside the canvas, touch support, and grab/grabbing cursors. One is "Unable to verify": the by-hand visual and interaction acceptance.
**Astra's validation:** `pnpm test` passed (28 files, 283 tests). `pnpm check` passed (107 files, zero errors, warnings or hints). ESLint on `Editor.tsx` passed. No manual browser or iPad run.
**Opus's result:** all sprint tasks delivered with no scope creep. Opus raised 2 warnings and 6 suggestions, listed below. Opus ran only `pnpm vitest run test/artnuvio/editor.test.tsx` (7/7 pass).

## Issues

### 1. Grab cursor shows on areas that can't be dragged [warning] · raised by Opus

- **What it is:** the grab-hand cursor is set on the whole preview area. The drag handlers are only on the canvas inside it. On Poster or Square Frames the canvas is letterboxed, so the bands beside it show a grab cursor, but dragging there does nothing.
- **Why it matters:** the cursor promises something the control doesn't do. The chosen mock puts the cursor on the Frame itself.
- **Where:** `src/styles/artnuvio/editor.css:61-68` with `src/tools/artnuvio/components/Editor.tsx:311-330`
- **Suggested fix:** move `cursor: grab` and the `[data-panning='1']` grabbing rule onto the `canvas` selector. Keep `touch-action: none` on `.preview`. The alternative is to put the pointer handlers on `.preview` and keep using the canvas rect for the conversion. Opus's preferred option is the first.

**ACTION** Yes the hand should ONLY appear over the image are.

### 2. Fit and Cover marks overlap when the image has the Frame's shape [warning] · raised by Opus

- **What it is:** the slider marks are placed from the Fit and Cover scales. When the image and Frame have the same shape (for example a 16:9 still in Hero), the two scales are equal and both labels draw at the same spot, about 14% along.
- **Why it matters:** the labels overlap and are hard to read or click in a common case. The chosen mock hides the Fit mark in this case (`artnuvio-opus-v2.html:1367`).
- **Where:** `Editor.tsx:528-557`
- **Suggested fix:** set `hidden` on the Fit mark when `fitScale(original, frameSize)` is within a small epsilon (the mock uses 0.001) of `coverScale(...)`.

**ACTION** I think the lables arent actually needed. The buttons cover ther fit/cover case. If the user moves the scale then assume the user wants a custom size. If they want to perfectly fit or cover it then use the button. Lets remove the labels.

### 3. Scale readout shows a raw number, not a percentage of Cover [suggestion] · raised by Opus

- **What it is:** the readout shows `placement.scale.toFixed(2)×`, which is Frame pixels per Original pixel against the full-size Frame. A 1200×800 Original in Hero reads "3.20×" at Cover, although Hero saves at 1920×1080 (an actual 1.6× enlargement). The mock shows "100%" at Cover.
- **Why it matters:** the number is confusing to read. It becomes more visible in Sprint 05 when "may look soft" lands.
- **Where:** `Editor.tsx:492-494`
- **Suggested fix:** show `Math.round((scale / coverScale) * 100)%`.

**ACTION** the numbres are fine, They are just a guide anyway. This is a visual tool and the user will not need to know exact percentages.

### 4. Slider is linear over a wide range [suggestion] · raised by Opus

- **What it is:** the range runs from half of Fit to 4× Cover, a span of at least 8×. Linear steps make the low end cramped and the high end coarse. The mock uses a log mapping (`artnuvio-opus-v2.html:1268-1269`).
- **Why it matters:** fine adjustment is harder than it needs to be. The sprint README doesn't specify a mapping, so this is optional.
- **Where:** `Editor.tsx:96-97, 500-504`
- **Suggested fix:** drive the input over 0–1000 and convert with `min·(max/min)^(v/1000)`, all inside the component, without changing `framing.ts`.

**ACTION** lets see what its like with the new changes. I think its actually _ok_ right now, but let me play around with the new setting and I willd decide whether or not to keep it before the merge

### 5. Hint text is static and the active mark isn't highlighted [suggestion] · raised by Opus

- **What it is:** `fillHint` stays the same whatever mode is selected. The mock switches it per mode (for example "Custom scale. Click Fit or Cover to snap back.") and adds `.mark.on` to the active mark.
- **Why it matters:** it's the clearest visual cue that moving the slider has cleared the Fit/Cover radio. It's a polish gap against the chosen mock.
- **Where:** `Editor.tsx:487, 561`
- **Suggested fix:** make the hint depend on the mode and add the active class to the matching mark. Both are cheap.

**ACTION** Are you suggesting we have three buttons saying: Fit / Cover / Custom and have custom be highlighted whenever the slider is moved? I agree with this

### 6. The same state update is written four times [suggestion] · raised by Opus

- **What it is:** four places each do `setEditor(c => c.original ? {...c, placement: f(c.original, FRAMES[c.frame].sizes[0], …)} : c)`.
- **Why it matters:** repetition, plus a repeated `FRAMES[current.frame].sizes[0]` lookup.
- **Where:** `Editor.tsx:99-111, 121-134, 234-241, 512-524`
- **Suggested fix:** add a small `updatePlacement((original, size, placement) => …)` helper.

**ACTION** anything that helps performance is good

### 7. Plain CSS where the file uses `@apply` [suggestion] · raised by Opus

- **What it is:** the rest of `editor.css` writes utilities through `@apply`, but the new rules use plain CSS.
- **Why it matters:** style inconsistency only.
- **Where:** `src/styles/artnuvio/editor.css:63-64`
- **Related:** #1 — touches the same rules; if #1 is applied, do this tidy at the same time.
- **Suggested fix:** use `@apply touch-none cursor-grab` and `@apply cursor-grabbing`.

**ACTION** Suggested fix

### 8. Test gaps [suggestion] · raised by Opus

- **What it is:** the tests don't cover four things. The cap label switching to "Custom" after a slider move. Clicking the Fit/Cover marks. A non-primary button being ignored on `pointerdown`. `lostpointercapture` ending a drag.
- **Why it matters:** these behaviours could regress unnoticed. Each needs only a line or two.
- **Where:** `test/artnuvio/editor.test.tsx:217-317`
- **Related:** Astra's Auditor notes say the tests mock ResizeObserver, canvas drawing and pointer capture. They can't show real browser capture routing or touch behaviour. This is a separate caveat from the four gaps here.
- **Suggested fix:** add one short test for each of the four cases.

**ACTION** Suggested fix

---

## Astra-only information (no findings, kept for the record)

- **Verdict:** PASS, no findings. No implementation follow-up is required by Astra's audit.
- **Residual risk (open item):** the by-hand done-when check hasn't been done. It covers visual Fit/Cover/black bars, slider and repeated-radio resets, boundary clamping, dragging outside the canvas, and touch on iPad. Astra established no failure in these. Opus says the same: the sprint doc is honest about it, and it must be done before the sprint counts as done.
- **Astra's notes:** state updates use the current Original and Frame, so there is no stale render-state maths. Mode-reset logic is shared by the radios and the slider marks. The original acceptance criteria were not weakened. Saved-size eligibility and the softness warning are explicitly Sprint 05.
- **Opus positives:** the pointer handling is solid (pointer id tracked, second pointers ignored, drag in progress blocks a new `pointerdown`, `stopPointer` is idempotent, rect guard against divide-by-zero). Radios use `onClick` with a controlled `checked`, so re-clicking the selected radio still fires. Tests check exact `placeMode`/`zoomTo`/`panBy` results, including the pixel conversion (10 screen px becomes 64 Frame px).

---

**Tally:** 8 issues total (8 from Opus, 0 from Astra). 2 warnings, 6 suggestions.
**Overlaps to judge:** #1 ↔ #7 (same CSS rules, different concerns). Astra raised no findings, so there are no cross-auditor overlaps.
**Conflicts to resolve:** none on facts. Astra found no defects and Opus found two warnings. Astra checked requirements and automated tests (full suite, type check, lint). Opus compared against the chosen mock, which Astra's audit did not do. That explains the gap. Opus ran only the editor test file.
