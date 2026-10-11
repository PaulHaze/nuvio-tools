# ArtNuvio mockup · Opus — build notes

Notes from the Opus agent that built [`artnuvio-opus.html`](./artnuvio-opus.html), from the prompt in [`../llm_mockup-prompt.md`](../llm_mockup-prompt.md). It worked on its own and did not see `artnuvio-astra.html`.

## Checks run

- It is one file with one inline `<style>` and one inline `<script>`, in plain JS. The only outside requests are Google Fonts. `node --check` passes on the script, tags balance and there are no duplicate IDs.
- Headless Chrome screenshots of about 11 states at all four widths.
- A Playwright script ran these flows, and all worked: load a sample, move the slider (it clears Fit/Cover), drag (it stops at the edges), snap back to Fit, the "name already used" prompt and replacing from it, saving and the "Next" buttons, copy, delete, Replace mode, the list filter, and the rename name-clash error.
- Two things were broken and are fixed: a missing stage reference that stopped the page starting, and the mock control panel spilling past its edge.

## What's in it

- Colours, buttons, panels, form fields, dialog and slider are copied from the style reference. The new pieces (Fit/Cover switch, drop zone, thumbnails, Replace banner) are built from the same colour and spacing values. The control panel shows an "Opus" badge and the page title is "ArtNuvio mockup · Opus".
- Every screen and state is there:
  - Editor: empty, loading, both URL errors, loaded in each Frame, saving, saved, name already used.
  - Replace mode: empty, loaded and done.
  - Library: 8 folders with 16 Artworks, and filters with no matches.
  - Dialogs: replace confirmation, delete confirmation, and rename.
- The control panel switches screen, state, Frame, sample image, both layout pairs, dialog, and width (768 / 1024 / 1440 / 1920 / Full, with an option to shrink to fit the window). It has "Copy link to this view" and Reset, and the whole state is in the URL hash.
- Paste works anywhere on the page, a dropped file works anywhere, the file picker is real, drag works by mouse and touch, and the arrow keys move the image.

## Key layout and interaction ideas

- **Same preview size for every Frame:** the preview area never changes size. Each Frame is fitted inside it, so switching Frame doesn't move the controls. The saved-size and warning lines always hold their space, so nothing jumps.
- **One place to start:** a single "Paste here" box takes a pasted image or a URL. "Choose a file" and "drop anywhere" sit underneath, and the controls stay visible but greyed out until an image loads.
- **Fit and Cover marked on the slider:** small Fit and Cover marks sit on the slider track, so the slider and the two buttons read as one control.
- **The Frame is in every label and URL:** button labels like "Save Poster" and "Copy Poster URL", and the `-poster` part of the URL is highlighted. The Name field warns before Save if that folder already has this Frame.
- **Making a set for one folder:** the current folder's four Frames are always visible: the Folder set strip in layout A, the Frame tiles in layout B. After saving, buttons offer the Frames that folder is still missing.
- **Replace mode looks different:** an amber banner shows the image currently in Nuvio and the URL that stays the same. The Frame and Name are locked, the button is amber "Replace image", the preview is tagged "New image", and the confirmation shows Now and New side by side.
- **Copying many URLs:** a Show filter (All, Hero, Landscape, Poster, Square) limits the Library to one Frame. Copied items get a "Copied" tick for the visit, and the toast says which Nuvio slot to paste into.
- **"Show cropped edges":** an optional toggle shows the cut-off parts of the image faintly outside the Frame. The image inside the Frame is never tinted.

## Layout variants

- **Editor A, Stage + rail:** large preview on the left with a strip under it showing the image and the folder's set, with copy buttons. Controls run down a sticky panel on the right: Frame (2×2), Fill, Scale, Saved size, Name and Save, then the result. Below about 980px wide, the panel moves under the preview as a two-column grid.
- **Editor B, Contact sheet:** full-width preview on top. Below it, four Frame tiles, all the same height, each showing the image in that Frame (live for the current one, what's in Nuvio for saved ones). Under those, one horizontal row of controls, with the result underneath.
- **Library A, Shelf:** a grid with fixed columns in the order Hero | Landscape | Poster | Square and one row per folder. All thumbnails are the same height at their real shape, the header row sticks while scrolling, and missing Frames show as dashed "+ Poster" boxes that open the editor ready to make it. Actions are small icon buttons.
- **Library B, Copy list:** one row per Artwork with a small thumbnail at real shape, Frame label, size, URL, a wide Copy button and text buttons for Open, Rename, Replace and Delete. Rows are grouped by folder, with "Add" links for missing Frames, and the Show filter matters most here.

## What I'd pick and why

- **Editor B (Contact sheet).** The four live tiles answer problems 1 and 3 together: you see every shape at once, the tile height stays put, and which Frames you've done is obvious without a separate list. Its row of controls also stays short on a 1024 iPad, where A's tall panel pushes Save below the fold. A is the better fit if people mostly make one Frame at a time with lots of fine-tuning.
- **Library A (Shelf) for browsing, plus B's Show filter.** Fixed Frame columns make mixed shapes line up and make a wrong paste unlikely, because the Hero URL is always in the Hero column. For long paste sessions, I'd add a one-Frame-at-a-time mode based on the list.

## UX gotchas found while building

1. **When is the Original big enough for 4K Hero?** I based it on the Original's size at Cover. Basing it on the current zoom is more accurate, but the choice would flip on and off as you move the slider.
2. **Smallest and largest scale.** The slider is logarithmic, from half of Fit up to 4× Cover, with Fit and Cover marked. A plain percentage was meaningless across four shapes.
3. **"Clicking Fit snaps back" breaks with real radio buttons.** Clicking a radio that's already selected does nothing, so re-centring needs a click handler as well as the change handler.
4. **Resetting to Cover on every Frame switch** is in the spec but loses any fine-tuning if you switch away and back. Remembering the framing for each Frame might be kinder.
5. **The "name already used" prompt would come too late without a warning.** I show it in the Name hint before Save, and "Replace it" in the prompt counts as the confirmation, so there's no second dialog.
6. **Re-drawing the Frame picker loses keyboard focus.** It has to be put back by hand after each re-draw.
7. **The 64rem site column is too narrow for the editor at 1440 and 1920.** I widened the editor and the header to 80rem and 92rem on wide screens. The real site would need to decide this.
8. **The shrink-to-fit width simulation broke the sticky elements.** Wrapping them in `overflow: hidden` stopped them sticking; `overflow: clip` fixed it.
9. **The open mock control panel covers controls in the bottom-right corner,** including layout A's Save button on short windows. You have to collapse it.
10. **Shelf rows are tall** (thumbnail, size, copy button, actions), so 8 folders already need a long scroll. With many folders, the list layout or the filter box matters more than in this mockup.
11. **The mockup fakes some things:** which URLs fail is decided by simple rules on the URL (Pinterest pin pages and other non-image links give the "web page" error; imdb and Amazon image links give "blocked"), while other URLs really load into the preview. Open links go to the sample image file, and the fake image URLs don't resolve.
