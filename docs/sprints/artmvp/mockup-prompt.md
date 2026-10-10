You are designing the **UI and UX for a small image tool** by building a clickable mockup: one
self-contained HTML file I can open in a browser, click through, and play with. It is a throwaway
exploration, not production code. The colours, fonts and components are **already decided**; what
I want from you is **ideas for layout and interaction**: where things go, what reads clearly, what
feels good to use, and where the awkward spots are.

Attached: **`site-style-reference.html`**. Open it first. It is generated from the real site's CSS
and shows exactly how the site looks today: the header, the home page, and (via the switch,
bottom right) the ArtNuvio page with every element in ArtNuvio's colours. **Your mockup must look
like it belongs on that site.** Copy its CSS custom properties and class styles, and reuse its
elements, rather than inventing a new look. Where you need something the reference doesn't have
(a segmented control, a drop zone, a thumbnail grid), build it from the same tokens so it fits in.

### The site

**Nuvio Tools** is a small site of tools for users of **Nuvio**, a streaming media app. Users are
tech-literate hobbyists who build custom collections in Nuvio and want them to look good. The site
has three tools; this mockup is for one of them.

### The tool: ArtNuvio

Nuvio shows custom art for each **folder** in a collection: a **cover tile** (poster, landscape
or square shaped) and a big **hero** backdrop. Nuvio stretches whatever image you give it to fill
the slot, and even a slightly wrong shape looks terrible. ArtNuvio fixes that: you bring an image,
frame it at exactly the right shape, and ArtNuvio hosts the result at a **permanent URL** you paste
into Nuvio. Later, you can **swap the image behind that URL** and Nuvio picks up the new art by
itself, with no new URL to paste. That swap is the tool's headline feature.

Use these words in the UI:

- **Original**: the image you start from. It comes in three ways: paste an image **URL**,
  **paste** a copied image (⌘V / Ctrl+V), or **choose or drop a file**.
- **Frame**: the Nuvio slot you're making art for. Four Frames, each a fixed shape and size:

  | Frame     | Shape | Saved size                                                 |
  | --------- | ----- | ---------------------------------------------------------- |
  | Hero      | 16:9  | 3840×2160, or 1920×1080 when the Original isn't big enough |
  | Landscape | 16:9  | 2560×1440                                                  |
  | Poster    | 2:3   | 1000×1500                                                  |
  | Square    | 1:1   | 1000×1000                                                  |

- **Artwork**: a saved, named image for one Frame, e.g. the Poster for "Serial Killer movies".
  A name can have one Artwork per Frame, so "Serial Killer movies" can have a Hero _and_ a Poster.
  Each Artwork has one URL for life, e.g. `img.nuvio-tools.com/a/k7x2m9qp-poster.jpg`. Its Frame
  never changes.
- **Replace**: give an existing Artwork a new image. Same URL, so Nuvio updates on its own.
- **Library**: every saved Artwork, by name.

### What it does

**Editor**

- The Original is shown inside the chosen Frame. Any empty space is **solid black**.
- **Fit / Cover** (radio buttons): Fit shows the whole image; Cover fills the whole Frame.
  It starts in Cover whenever an Original loads or the Frame changes.
- A **Scale** slider makes the image bigger or smaller. Moving the slider **clears** the
  Fit/Cover choice; clicking Fit or Cover snaps back to that mode.
- **Drag** inside the Frame to move the image. It can't be dragged so a gap appears on a side
  the image covers, or off the Frame.
- A **"may look soft"** warning when the image is enlarged too much.
- **Hero only:** a size choice, **3840×2160 (1.4 MB)** or **1920×1080 (0.5 MB)**, when the
  Original is big enough; otherwise only 1920×1080, with a short reason.
- **Save:** type a **Name** (the folder it's for), then Save. The result shows the URL, a
  **Copy Poster URL** button (the Frame name is in the label) and an **Open** link. The Original
  stays loaded, so you can switch Frame and save the next Artwork for the same folder straight away.
- **Name already used for this Frame:** "Serial Killer movies already has a Poster. Replace it?"
- **Errors** loading a URL, e.g. "That's a web page, not an image. Right-click the image and
  choose _Open image in new tab_, then copy that URL." or "That site won't let ArtNuvio fetch the
  image. Right-click it, choose _Copy image_, and paste it here instead."

**Library**

- All Artwork grouped by name, A–Z, with a filter box.
- Each Artwork shown as a thumbnail **at its real shape**, with its Frame, pixel size, and
  **Copy Hero URL**, **Open**, **Rename**, **Replace** and **Delete**.
- **Replace** opens the editor in **Replace mode**: the Frame is locked, the name is fixed, the
  button reads **Replace image**, and it asks "This will replace the current image for Serial
  Killer movies (Poster). Nuvio will show the new one within a few minutes. Are you sure?"
- **Delete** asks: "Delete Serial Killer movies (Poster)? Any Nuvio folder using this URL will lose
  its image. This can't be undone."

### The UX problems I most want ideas on

1. **Four very different shapes in one preview.** A tall Poster and a wide Hero both need to use
   the space well, and switching Frame mustn't make the controls jump around.
2. **One obvious starting point** for three ways in (URL, paste, file/drop), in the empty state.
3. **Making a set for one folder:** save a Hero, then a Poster, from the same Original, without
   it feeling repetitive or confusing which one you just saved.
4. **Replace mode must feel different** from making something new, and make it obvious which
   Artwork you're replacing.
5. **The Library with mixed shapes:** a wide Hero, a tall Poster and a Square side by side must
   still line up neatly and scan easily, with many groups.
6. **Copying many URLs into Nuvio** quickly, without pasting the Hero URL into the Poster slot.

### What the mockup should include

- Every screen and state: editor empty, loaded (in each Frame), loading, error, saved, the
  "name already used" prompt, Replace mode, the Library (about eight realistic groups with a
  mix of Frames, some with only one Artwork), and both confirmation dialogs.
- **At least two genuinely different editor layouts** and **two Library layouts** of your own
  design, switchable live. Don't just mirror one layout left/right.
- A small floating, collapsible control panel to switch screen, state, layout variant and
  **width** (768 iPad portrait, 1024 iPad landscape, 1440, 1920). The page resizes to that width.
- The state saved in the URL hash, so I can send a link and say "this one".
- Working Fit/Cover, slider and drag (simple maths or CSS transforms are fine), and a real file
  picker and drop zone so I can try my own images. Fake all saving: there is no server.
- Sample images, if available (paths relative to `docs/sprints/artmvp/html_UI_mocks/`; show a
  placeholder if they don't load): `../../../images/artnuvio_examples/hero_example.jpg`
  (3840×2160), `../../../images/artnuvio_examples/poster_example.jpg` (500×750, small enough to
  trigger "may look soft") and `../../../images/artnuvio_examples/landscape_with_text_example.png`
  (2560×1440).
- Realistic content: folder names like "Serial Killer movies", "Midnight Movies", "A24 Horror",
  "Studio Ghibli", "80s Slashers". No lorem ipsum.

### Constraints

- **One self-contained `.html` file.** Inline `<style>` and `<script>`, vanilla JS, no build
  step, no frameworks. Only Google Fonts loads externally (Outfit, Inter, Geist Mono, as in the
  reference).
- **Desktop and tablet only.** Minimum width 768px. No phone layout. Dragging must also work by
  touch (pointer events, `touch-action: none` on the preview).
- The image preview itself stays neutral (black, no tint or glow on the image) so colours can be
  judged accurately.
- Visible keyboard focus on everything. Respect `prefers-reduced-motion`.
- Readable code; I'll tweak it by hand.

### Out of scope

Text on images, colour overlays, gradients, accounts, real saving, phones.

### Deliverable

The HTML file, saved as `docs/sprints/artmvp/html_UI_mocks/artnuvio-{model}.html` (e.g.
`artnuvio-sonnet.html`, `artnuvio-gpt.html`). Then a short note: your layout variants, which one
you'd pick and why, and the UX gotchas you ran into while building it.
