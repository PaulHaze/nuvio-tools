## Audit: last commit 5131dc9 — ui-04: Listio visual pass

_Scope: Sprint 04 — Listio visual pass (from docs/sprints/ui/04_Listio_Pass.md)_

Verdict: no code defects found. Ready to ship once the owner completes the manual browser check the sprint's "Done when" list requires. Build, test and lint were not re-run in this audit; the pass results come from the implementing agent's report and the pre-commit hook.

### Critical

None.

### Warning

- **Visual and keyboard acceptance is unverified.** The sprint's "Done when" list asks for visual checks on `/listio`, an editor, `/listio/import` (all three modes), `/listio/export` and the collection dialog, plus a keyboard focus-ring pass. The move-only check ("nothing changed visibly before restyling") was also not possible in one commit. Nothing in the diff shows these were done. Owner action: walk the screens listed in the sprint before marking ui-04 done.
- **The sprint doc is not closed out.** `docs/sprints/ui/04_Listio_Pass.md` still reads `Status: not started` and every task checkbox is unticked. ui-03 ticked its status in its own commit. Tick these after the manual check.

### Suggestion

- **Shell look duplicated instead of reused.** The Listio button block in `src/tools/listio/listio.css:225-259` repeats the `.btn` rules from `src/lib/ui/main.css:381`, and `.media-badge` in `listio.css:466-475` repeats `.badge` from `main.css:437`. The sprint says "the `.btn` look" and "the `.badge` look", so the copies are defensible, but if the shell values change the Listio copies will drift. Consider applying the shell classes, or a shared token-based rule, when the Listio rebuild lands.
- **Sprint says "no new hex", and the commit complies.** The only hex left in `listio.css` is `#f5c518` on `.rating` (`listio.css:347`), which the sprint keeps as IMDb yellow. Other colours are tokens or `rgb()`/`color-mix()`. No action needed; noted for the record.

### Positive

- **Imports and class moves are clean.** All four Listio pages import `@/tools/listio/listio.css` (`src/pages/listio/index.astro:4`, `import.astro:4`, `export.astro:4`, `lists/[id].astro:4`). None of the moved classes are used outside `src/tools/listio/` or the Listio pages. `main.css` keeps only the `[data-page='listio']` and `[data-tool='listio']` token selectors (`main.css:65`, `:76`), which the sprint allows.
- **Every token used is defined.** Each `var(--…)` in `listio.css` resolves to a token in `main.css`, including `--glow-hover`, `--glow-size`, `--glass-blur`, `--card-bg`, `--card-border`, `--on-accent` and `--font-mono`.
- **Dialog placement works with the Listio rules.** `CollectionDialog.tsx:38` renders inside `main.listio-main` on the import page, so the scoped button, input and focus rules apply to it. `.collection-dialog` sets a solid `--surface-1` and `backdrop-filter: none` (`listio.css:47-54`), as the sprint asks.
- **Hero aurora is safe.** `.hero-aurora` (`main.css:364`) adds `position: relative` and `isolation: isolate`, and the `::before` layer sits behind content with `pointer-events: none`. The four `page-heading` headers get the class with no other markup change.
- **Focus rings cover every control type.** `listio.css:262-271` covers links, buttons, summaries, checkboxes, text inputs, selects and textareas, which matches the original coverage plus the new inputs.
- **Docs updated.** `docs/DESIGN_SYSTEM.md` gained both required rules (tool CSS under `src/tools/<tool>/`, and body font for data versus display font for headings).

Want me to fix any of these? The Warnings need the owner's manual check rather than code changes; the Suggestions are optional follow-ups.
