## Audit: last commit 4f8a742 — artmvp-01: Login, Frames table and page shell

_Scope: Sprint 01 — Layout mockups, login and page shell, phase 2 build tasks (from docs/sprints/artmvp/01_Mockups_Login_And_Page_Shell.md)_

Files audited: `src/middleware.ts`, `test/site/basic-auth.test.ts`, `src/tools/artnuvio/frames.ts`, `test/artnuvio/frames.test.ts`, `src/pages/artnuvio/index.astro`, `src/tools/artnuvio/components/{Editor,FramePicker,Stage,OriginalBar,Adjust,SaveCard}.astro`, `src/styles/artnuvio/{index,editor}.css`. The two doc changes (README decision paragraph, ticked task boxes) were checked for accuracy only.

Note: Haiku made this commit in the same session, as part of `/start-sprint`.

### Warning 🟡

- [src/styles/artnuvio/editor.css:141-188] **The desktop layout is not layout A: the rail is split across shared grid rows.** The chosen mock (`artnuvio-opus-v2.html`, `.ed-a`) has two independent columns. The left column (`.ed-col`) holds the stage, Original bar and Folder set. The right column is **one** sticky `aside.rail.panel` with Frame, Fill, Scale, Saved size, Save and the result stacked, separated by dividers. The build puts everything in one grid with areas `'stage pick' / 'orig adjust' / 'set save' / 'set receipt'`. Row 1 is as tall as the stage (`clamp(24rem, 40vw, 40rem)`), so the Frame card sits at the top of a tall row and Fill/Scale only starts below the stage. That leaves a large empty gap in the rail at 1024 and 1440px. The rail is also several separate glass cards instead of one sticky panel. This fails "Done when: the ArtNuvio page shows the chosen empty layout at 1024 and 1440px". Suggested fix: at ≥1024px use two wrapper columns, a left column (stage, orig, set) and a right `aside` rail (pick, adjust, save, receipt) with `position: sticky; top: 1rem`. Keep the stacked DOM order for <1024px. Either render both wrappers and use `display: contents` below 1024px, or add a `.ed-col` / `.ed-rail` wrapper pair that turns into `display: contents` in the stacked view, so the order still reads pick → stage → orig → adjust → save+set → receipt.

- [src/styles/artnuvio/editor.css:25-27, 200-202] **The Frame picker is four columns inside the 21rem rail on desktop.** The mock's rail uses a 2×2 `.fpick` with icon-left/text-right options (`.fpick { grid-template-columns: 1fr 1fr }`, `.fopt` 26px + 1fr). It only switches to `repeat(4, …)` in the stacked view (`.ed-s .fpick`). With four columns in ~19rem of usable width, each tile is about 68px. The size caption (`2560×1440` in `.eyebrow`, uppercase and tracked) will likely wrap or overflow. Suggested fix: in the ≥1024px media query, set `.frame-options { grid-template-columns: 1fr 1fr }` and lay `.frame-option` out as a row (shape | name/size). Keep the 4-up tiles below 1024px.

- [src/pages/artnuvio/index.astro:14 / src/styles/common/hero.css:4] **The page width is capped by `shell-main` (`page-column`), so 1440px is narrower than the mock.** Haiku flagged this itself. The 1fr + 21rem grid fits, but the stage is much smaller than the mock's 1440 view. The sprint says to use "the site's shell classes", so this may be intended. Listio uses its own `listio-main` for a wider work area, though. Owner to confirm: keep `shell-main`, or add an `artnuvio-main` with a wider column the way Listio does.

### Suggestion 🔵

- [src/styles/artnuvio/editor.css:89-103, 120-134, 206-208] **Unprefixed class names in a tool stylesheet.** `.seg`, `.range`, `.scale`, `.hint-optional`, `.set-*` and `.frame-*` sit next to `ed-`-prefixed classes. They only load on ArtNuvio pages, so nothing collides today. Generic names like `.seg` and `.range` could clash with future shared styles, though. Consider prefixing them all with `ed-`, or nesting them under `.ed-editor`.

- [src/tools/artnuvio/components/Adjust.astro:4, 38-48] **"Saved size" is hard-wired to Hero.** This is fine for an inert shell. When the next sprint wires it up, it should come from the selected Frame's `sizes`, and should hide when `sizes.length === 1`. Also, no size is `checked`, while `outputSize` defaults to `'standard'`. Pre-check `standard` so the UI matches the helper's default.

- [src/tools/artnuvio/components/Stage.astro:8] **Inline `onsubmit="return false"`.** It works, but inline handlers will break if a CSP is added later. The input and button are already `disabled`, so the handler has nothing to stop. Drop it, or wire submit in a script when Load gets built (sprint 07).

- [src/tools/artnuvio/frames.ts:54-60] **`outputSize` silently falls back for keys a Frame doesn't offer.** `outputSize('poster', 'full')` returns 1000×1500. This is documented and fine for now. If callers ever pass user-chosen keys, a typed overload (`outputSize('hero', HeroSizeKey)` vs `outputSize(OtherFrame)`) would catch the mistake at compile time.

### Positive observations

- `src/middleware.ts`: `/artnuvio` reuses the same normalised path (decode → collapse slashes → lower-case → reject dot segments) as `/listio`. `/listio/addon/` stays public, and the header comment is updated. The tests cover all six required paths, both challenged and passing, and add `/artnuviox` to the public list to guard against prefix over-matching.
- `frames.ts` matches the brief exactly (four FrameIds, Hero full 3840×2160 / standard 1920×1080, Landscape 2560×1440, Poster 1000×1500, Square 1000×1000). The aspect test uses exact integer cross-multiplication, not float comparison.
- The page stays thin. Components live in `src/tools/artnuvio/components/`, and styles follow Listio's `@reference '../main.css'` + partials pattern using site tokens. The Frame picker and Folder set are both driven from `FRAMES`.
- Haiku was right that the mock's "control panel starts collapsed on phone" refers to the mock's own width/state panel (`.mock-panel`, mock line ~1087), not the product. Leaving it out is correct.
- The stacked DOM order (<1024px) matches the chosen order: Frame row → stage → Original bar → Fill/Scale → Name/Save + Folder set → result. The <600px rules hide the secondary hints and make the Folder set 2×2.
- README's decision paragraph is accurate. One small mismatch: it lists "Saved size" in the right rail, which matches the mock but not the current build (see the first Warning).

---

**Summary:** 0 critical, 3 warnings, 4 suggestions.

Owner checks still open (not doable by the agent): private-window login check for `/artnuvio`, `/listio` and `/`, and a visual check at 390 / 768 / 1024 / 1440px.
