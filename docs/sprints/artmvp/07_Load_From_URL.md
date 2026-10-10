# Sprint 07 — Load from a URL

**Status:** planned

## Goal

The user can paste an image URL and it loads as the Original, through the proxy from sprint 06. Failures explain what to do.

Read first: [epic README](./README.md), sprint 03 (how Originals load) and sprint 06 (error
codes).
Follow "Chosen layout" in [sprint 01](./01_Mockups_Login_And_Page_Shell.md) for where
things go and how they look.

## Tasks

- [ ] "Original" panel: a URL field with a **Load** button (Enter also works). Pasting a URL
      anywhere on the page (not into a text field) fills the field and loads it. Pasted
      _images_ still work as in sprint 03.
- [ ] Load through `/artnuvio/api/fetch-image`, turn the response into an `ImageBitmap`, and
      hand it to the same load path as files and pastes (Cover, current Frame).
- [ ] Show a loading state, and ignore a slow earlier load if a newer one has started.
- [ ] Friendly messages per error code, for example:
  - `not_image_page`: "That's a web page, not an image. Right-click the image and choose
    _Open image in new tab_, then copy that URL.";
  - `upstream_status` / `unreachable`: "That site won't let ArtNuvio fetch the image. Right-click
    it, choose _Copy image_, and paste it here instead.";
  - `too_large`, `svg`, `blocked_url` and the rest: a short plain explanation.
- [ ] Remember where it came from: `{ kind: 'url', url, resolvedUrl }` (the resolved URL comes
      from `x-resolved-url`, so a Pinterest original is recorded).
- [ ] `?url=<image>` in the page address preloads that URL (useful for a bookmarklet later).

## Done when

- By hand: a Pinterest `i.pinimg.com` URL loads (upgraded to the original when possible);
  a page URL and a blocked site show the right advice.
- `pnpm test` and `pnpm check` pass.
