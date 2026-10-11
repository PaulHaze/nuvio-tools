# Audit Summary: artmvp-03 — Load an Original locally

Combined findings of Astra and Opus audits:

Commit audited: `66ddedc` feat(artnuvio): load Originals locally. Inputs: `artmvp-03-audit-opus.md` and `artmvp-03-audit-astra.md`. Astra raised no findings (verdict PASS), so every entry below comes from Opus.

## Issues

### 1. Drop and paste accept more image types than the file picker [Warning] · raised by Opus

- **What it is:** The file picker only offers JPEG, PNG, WebP and AVIF, but the code only checks that the file type starts with `image/`. Dropping or pasting therefore also lets in GIF, SVG, BMP, ICO, TIFF and HEIC.
- **Why it matters:** The three ways of loading an image follow different rules, and the extra types may decode or fail depending on the browser. The brief only says "an image type", so the letter of the brief is met, but the type list it gives is the four in the picker.
- **Where:** `src/tools/artnuvio/original.ts:17`; `src/tools/artnuvio/components/Editor.tsx:171`, `:200-205`, `:111-113`
- **Suggested fix:** Export one `ORIGINAL_TYPES = ['image/jpeg','image/png','image/webp','image/avif']` from `original.ts`. Check `ORIGINAL_TYPES.includes(blob.type)` there and build the picker's `accept` from `ORIGINAL_TYPES.join(',')` so they cannot drift apart. Keep "That isn't an image", or use "That image type isn't supported" for image types outside the list.

**ACTION** Suggested fix

### 2. Error messages may not be announced to screen readers, and look like status text [Warning] · raised by Opus

- **What it is:** Errors and "Loading Original…" share one `role="status"` span that is hidden with `display: none` while empty. It is also coloured `--accent-ink`, the same as the loading text.
- **Why it matters:** Screen readers often miss a live region that was out of the accessibility tree when its text changed, so users may never hear "That isn't an image", "over 25 MB" or the decode failure message. Sighted users also cannot tell an error from a loading message. Listio already uses `<p className="error" role="alert">` with `text-danger`.
- **Where:** `src/tools/artnuvio/components/Editor.tsx:273-275`; `src/styles/artnuvio/editor.css:90`, `:92-94`; compare `src/tools/listio/components/titles/TitleControls.tsx:82`, `src/styles/listio/feedback.css:7`
- **Suggested fix:** Keep the live-region element always rendered and reserve its space with `min-height` (or leave it empty without `display:none`). Give errors their own `role="alert"` element styled with `text-danger`, and keep loading text in the `role="status"` one.

**ACTION** Suggested fix

### 3. The old Astro editor shell is now orphaned [Warning] · raised by Opus

- **What it is:** `index.astro` now mounts the React `Editor.tsx`, so nothing imports `Editor.astro` or the pieces only it used (`Stage.astro`, `OriginalBar.astro`, `FolderSet.astro`, `FramePicker.astro`, `Adjust.astro`, `SaveBox.astro`, `Glyph.astro`). `Editor.tsx` re-creates all of that markup. CSS is stale too: the `editor.css:20` comment still describes "one paste box as the obvious start" and the `.paste-row` rules match nothing.
- **Why it matters:** Two copies of the shell exist and a later sprint could edit the wrong one. Opus agrees that dropping the URL/paste text box is the right call for this sprint (a text input would swallow pastes, and URLs are sprint 07).
- **Where:** `src/pages/artnuvio/index.astro:5,17`; `src/tools/artnuvio/components/Editor.tsx:166-470`; `src/styles/artnuvio/editor.css:20`, `:45-51`
- **Coverage note:** Astra says it reviewed the "former Astro editor components" but did not report them as orphaned.
- **Suggested fix:** Delete the unused `.astro` components, or note in the sprint doc that they are kept on purpose. Update the `editor.css:20` comment and remove `.paste-row` or mark it for sprint 07.

**ACTION** Remove all oprhaned elements and tidy up the css as well

### 4. Pasting a non-image file gives no message [Suggestion] · raised by Opus

- **What it is:** The paste filter keeps only `image/*` items. Copying a PDF in Finder and pressing Cmd+V does nothing, while dropping the same file shows "That isn't an image".
- **Why it matters:** Inconsistent and silent feedback; the user cannot tell why nothing happened.
- **Where:** `src/tools/artnuvio/components/Editor.tsx:111-113`
- **Related:** #1 — also about drop and paste following different rules; may be a different facet of the same inconsistency, kept separate for the owner to judge.
- **Suggested fix:** If there is no image item but there is a `kind === 'file'` item, call `load(file, { kind: 'paste' })` so `loadOriginal` shows the usual message.

**ACTION** Suggested fix

### 5. Dropping a file just outside the preview leaves the page [Suggestion] · raised by Opus

- **What it is:** Drop is handled only on `.stage`. A file dropped elsewhere uses the browser default and opens the image in the tab.
- **Why it matters:** Today this only loses the loaded Original. From sprint 04 it will also lose the user's edits.
- **Where:** `src/tools/artnuvio/components/Editor.tsx:187-205` (paste listener at `:108-126`)
- **Suggested fix:** Add `dragover` and `drop` listeners on `document` that call `preventDefault()` (without loading), next to the paste listener.

**ACTION** If a user tries to drop anywhere other than the drop element then the page should do nothing. It really annoys me when I try and drag and drop and it misses and it end up opening in the browser. This is not the behaviour I want from my app

### 6. No limit on decoded pixel count [Suggestion] · raised by Opus

- **What it is:** The code limits file bytes (25 MB) but not pixels. A highly compressed 25 MB PNG can decode to a huge bitmap (20k x 20k is about 1.6 GB of RGBA).
- **Why it matters:** `createImageBitmap` may fail slowly or crash the tab instead of throwing a clean error. The brief does not ask for a cap, so this is optional hardening.
- **Where:** `src/tools/artnuvio/original.ts:18`, `:26-35`
- **Suggested fix (optional):** After decoding, reject `width * height` above a set limit (for example 100 MP) with a clear message, in the same block as the zero/non-finite check, closing the bitmap there as that check already does.

**ACTION** Suggested Fix. I dont want this app to get clogged up with processing and handling large image and agree with any measures that restrict such things.

### 7. Make EXIF orientation explicit [Suggestion] · raised by Opus

- **What it is:** `createImageBitmap(blob)` is called with default options. Phone JPEGs often rely on EXIF orientation.
- **Why it matters:** The stored `width`/`height` feed the framing maths, so they must match the displayed orientation or phone photos could be framed wrongly.
- **Where:** `src/tools/artnuvio/original.ts:22`
- **Suggested fix:** Use `createImageBitmap(blob, { imageOrientation: 'from-image' })`.

**ACTION** Suggested Fix

### 8. `drawPlacement` should set smoothing quality itself [Suggestion] · raised by Opus

- **What it is:** The function uses the canvas context's default smoothing (usually `low`).
- **Why it matters:** The preview shrinks large Originals a lot, and sprint 05 will reuse this function for export, so image quality is decided here.
- **Where:** `src/tools/artnuvio/drawPlacement.ts:28-34`
- **Suggested fix:** Inside the `save()`/`restore()` pair, set `ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';`.

**ACTION** Suggested Fix

### 9. The old bitmap is closed before React commits the new state [Suggestion] · raised by Opus

- **What it is:** The previous `ImageBitmap` is closed before `setEditor` has rendered. The `ResizeObserver` callback still holds the old `original`.
- **Why it matters:** If a window resize lands in that short gap while a new image finishes decoding, `drawImage` throws on the closed bitmap and the canvas is cleared. Opus calls this unlikely and self-healing on the next draw.
- **Where:** `src/tools/artnuvio/components/Editor.tsx:89`, `:91`, `:150`
- **Suggested fix:** Close the previous bitmap after the commit, for example in a `useEffect` keyed on `original` that closes the old value in its cleanup. Or check `bitmap.width === 0` before drawing.

**ACTION** Leave for now. I think this will be a non issue

### 10. The preview canvas is reallocated on every draw [Suggestion] · raised by Opus

- **What it is:** `canvas.width` and `canvas.height` are set on every draw, which reallocates and clears the canvas even when the size has not changed. `draw()` also runs twice per change (directly and from the `ResizeObserver` first callback).
- **Why it matters:** Wasted work and a possible flicker; minor performance cost.
- **Where:** `src/tools/artnuvio/components/Editor.tsx:144-145`, `:151-152`
- **Related:** #9 — both involve `draw()` and the `ResizeObserver` callback; kept separate for the owner to judge.
- **Suggested fix:** Only set the canvas size when it differs from the current size, and drop either the direct `draw()` call or the duplicate first callback.

**ACTION** Suggested Fix

### 11. CSS house style and phone layout issues [Suggestion] · raised by Opus

- **What it is:** Four small CSS points. (a) New `.preview`, `&[data-dragging='1']` and `.original-message` blocks use plain properties while the rest of the file uses `@apply`. (b) `.original-message` is a top-level selector though it only appears inside `.orig-bar .orig-meta`, against the AGENTS.md "CSS nesting style". (c) On phones `layout.css:280` adjusts `.drop`'s inset but not `.preview`, so the stage padding jumps when an Original loads. (d) The "Images up to 25 MB" text reuses the `drop-anywhere` class, which `layout.css:294` hides below 600px, so phones never see the limit.
- **Why it matters:** Style inconsistency, plus two real phone-layout defects (the padding jump and the hidden size limit).
- **Where:** `src/styles/artnuvio/editor.css:23`, `:69-80`, `:82-85`, `:88-95`; `src/styles/artnuvio/layout.css:280`, `:294`; `src/tools/artnuvio/components/Editor.tsx:248-250`
- **Coverage note:** Astra judged the layout satisfied by source inspection for desktop and tablet only and did not report phone behaviour.
- **Suggested fix:** (a) Convert to `@apply`, for example `@apply absolute inset-[40px_14px_14px] grid place-items-center overflow-hidden;`, `canvas { @apply block bg-black; }`, and likewise `outline-2 -outline-offset-2 outline-accent` and `text-[0.8rem] empty:hidden`. (b) Move `.original-message` under `.orig-bar { :where(&) .orig-meta { … } }`. (c) Add the same inset override for `.preview` on phones. (d) Give the limit text its own class, or move it into `.drop-lead`.

**ACTION** Suggested Fix

---

## Auditor notes

### Astra (no findings; verdict PASS)

- **Verdict:** PASS. The original Sprint 03 requirements are satisfied and both required checks pass independently. No implementation follow-up required; Sprint 03 can be considered complete within the stated verification limits.
- **Scope:** Independent review of commit `66ddedcde1f46b3778202a5c4dc34c538592c2ca` on `artmvp-03`, diff `7bf8e50..66ddedc`, against `docs/sprints/artmvp/03_Load_Original_Locally.md` (plus epic README, Sprint 01 layout and framing sources). Working tree was clean during review. All ten changed files inspected with surrounding layout, framing, route, authentication and tooling code. Sprint doc changes add completion tracking and implementation notes without weakening the original requirements.
- **Summary:** The commit connects a React editor island to `/artnuvio`, loads Originals via file picker, preview drop zone and page paste listener, and renders Cover placement in every Frame. Validation precedes framing, failures preserve the displayed Original, and source metadata stays attached to the decoded bitmap. The shared drawing function supports both preview and future full output sizes.
- **Findings count:** Critical 0, Warnings 0, Suggestions 0.
- **Task coverage (all Satisfied):**
  - React island owning Original, Frame and Placement: `index.astro:5,17`; `Editor.tsx:13,62`.
  - Original has ImageBitmap, natural size and source: `original.ts:3,36`.
  - Original panel with Choose file, accepted types, drop/paste hint: `Editor.tsx:168,268,280`.
  - File drop on preview, name preserved: `Editor.tsx:187,200`; editor test dispatches a drop on the stage.
  - Paste anywhere excluding text entry: `Editor.tsx:52,108`; test covers normal paste and ignored paste in the Name field.
  - Type and 25 MB checks before decoding with clear errors: `original.ts:17,18`; tests check rejection before decode and acceptance at the exact limit.
  - Decode failure and invalid decoded dimensions give clear messages before framing: `original.ts:22,28`; `Editor.tsx:84,273`; unit tests cover decode failure, zero, negative and non-finite dimensions.
  - Local processing, no server: the load path uses only `createImageBitmap`, with no upload, fetch or persistence.
  - Whole Frame at its aspect in the preview with black background: `Editor.tsx:128`; `editor.css:69`; `drawPlacement.ts:22`.
  - Choose, drop and paste use Cover, and Frame change redraws in Cover: all share `load`, which calls `placeMode(..., 'cover')` at `Editor.tsx:94`; Frame selection recomputes at `:156`; tests exercise all input paths and Frame switching.
  - Small reusable `drawPlacement` with the specified arguments: `drawPlacement.ts:5`; its test checks transform, black fill, clipping and draw coordinates.
  - Follows the established desktop/tablet layout: React markup keeps the stage column, Original bar, Folder set and settings rail structure used by `layout.css`; no breakpoint rules were changed. Assessed by source inspection, not browser screenshots.
  - `pnpm test` and `pnpm check` pass.
- **Validation performed:** `rtk pnpm test` passed (28 files, 279 tests). `rtk pnpm check` passed (115 files; 0 errors, 0 warnings, 0 hints). Read the changed implementation and tests, original and updated sprint brief, and both documentation changes. Reviewed unchanged `frames.ts`, `framing.ts`, the former Astro editor components, editor/layout styles, shared Layout, middleware, package scripts, Astro config and Vitest config. Working tree stayed clean after validation. Production build and browser interaction checks were not run.
- **Residual risks:** The editor tests mock `createImageBitmap`, canvas drawing, layout measurements and ResizeObserver. They establish event routing and state behaviour but do not verify real JPEG/PNG/WebP/AVIF decoding, OS clipboard or file picker behaviour, canvas pixels, or responsive appearance in a real desktop/tablet browser. These are validation limits, not demonstrated defects.

### Opus (positive observations)

- **Checks and messages match the brief.** Type and 25 MB checks run before decoding (`original.ts:17-19`) with the brief's wording ("That isn't an image", "That image is over 25 MB"); decode failure has its own message (`:21-25`).
- **The sprint 02 audit rule is in place.** Zero or non-finite decoded width/height is rejected and the bitmap closed before anything reaches `framing.ts` (`original.ts:26-35`).
- **Bitmaps are handled carefully.** A request counter (`Editor.tsx:74,80,85-88`) closes late results, ignores their errors (`:97`) and keeps the loading flag correct (`:104`). The replaced bitmap is closed (`:89`); unmount closes the bitmap and makes any pending load stale (`:120-125`). No object URLs to leak.
- **An invalid file keeps the current Original;** an error only sets the message (`Editor.tsx:96-102`).
- **Source is recorded exactly as specified:** `{ kind: 'file', fileName }` for choose and drop (`Editor.tsx:177,204`), `{ kind: 'paste' }` for paste (`:117`). The `Original` type carries bitmap, natural size and source (`original.ts:3-8`), ready for sprint 09.
- **Cover placement uses the full-size Frame** as `framing.ts:14-15` requires; load and Frame change both call `placeMode(..., FRAMES[frame].sizes[0], 'cover')`, giving 3840x2160 for Hero (`Editor.tsx:94,160-162`), matching the README "Editor" rule.
- **`drawPlacement` has the signature the brief names.** It works in full-size Frame coordinates through one transform, fills solid black and clips to the Frame (`drawPlacement.ts:12-25`); at export `size === frame` makes the transform the identity, so sprint 05 can reuse it unchanged.
- **The preview is sharp on high-DPI screens and keeps the Frame aspect:** it fits the Frame into the preview area, scales by `devicePixelRatio` and guards against a zero-size area (`Editor.tsx:133-145`).
- **`isTyping` is careful** (`Editor.tsx:52-59`): ignores pastes in text-like inputs, textareas, selects, contenteditable and `role="textbox"`, but not radios, checkboxes, ranges or the file input, so Cmd+V still works after clicking a Frame.
- **The file input is reset after each pick** (`Editor.tsx:176`), so choosing the same file again still fires.
- **File names render as React text** (`Editor.tsx:262-266`), so a hostile file name cannot inject markup.
- **No scope creep.** Fill, Scale, Saved size and Save remain disabled shells for sprints 04, 05 and 09 (`Editor.tsx:351-458`); no server code or URL loading (sprint 07).
- **The island mount is minimal** (`index.astro:5,17`), using `client:load` like the Listio editor page.
- Opus left tests under `test/` out of scope at the owner's request.

---

**Tally:** 11 issues total (11 from Opus, 0 from Astra). 0 critical, 3 warnings, 8 suggestions.
**Overlaps to judge:** #1 <-> #4 (both about drop/paste behaving differently from each other); #9 <-> #10 (both about `draw()` and the ResizeObserver callback). All entries are Opus-only; Astra raised nothing to overlap with.
**Conflicts to resolve:** No direct factual contradiction. Difference in outcome: Astra reports PASS with zero findings, while Opus raised 3 warnings and 8 suggestions. Both agree the brief's requirements are met (Opus notes the brief is met "to the letter" on #1).
**Coverage gaps:** Astra ran `pnpm test` and `pnpm check` and read test files; Opus excluded `test/` and did not report running them. Opus examined accessibility, phone layout, CSS conventions, EXIF, memory and orphaned-file concerns (#2, #3, #7, #9, #11) that Astra did not address; Astra reviewed layout for desktop/tablet only. Neither auditor ran the app in a real browser, so #5, #6, #7 and #9 are unverified at runtime.
