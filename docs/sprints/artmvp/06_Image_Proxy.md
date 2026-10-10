# Sprint 06 — Image proxy

**Status:** planned

## Goal

A server route that fetches an image from a URL on the user's behalf and returns its bytes
from our own origin, so the browser can draw it on a canvas and export it (a cross-origin
image would "taint" the canvas and block export). It stores nothing. Server-side only; the
editor uses it in sprint 07.

Read first: [epic README](./README.md), and "How it works" and "API" in the
[old handoff](../../artnuvio/ArtNuvio-HANDOFF.md), whose `fetchImage.ts` design this follows.

## Tasks

- [ ] `GET /artnuvio/api/fetch-image?url=…` (`src/pages/artnuvio/api/fetch-image.ts`, thin;
      logic in `src/tools/artnuvio/proxy/`). Behind the login, like the rest of `/artnuvio`.
- [ ] Guardrails, each with its own error code in `{ "error": { "code", "message" } }`:
  - `bad_url`: not a valid `http:` or `https:` URL;
  - `blocked_url`: localhost, private, link-local or otherwise internal addresses (IPv4 and
    IPv6, including `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`, `::1`,
    `fc00::/7`, `fe80::/10`) or a non-standard port;
  - follow redirects **manually**, at most 5, re-checking every hop (`blocked_redirect`);
  - `not_image_page`: the response is HTML (the user pasted a page, not an image);
  - `not_image`: any other non-`image/*` type; `svg`: SVG is refused;
  - `too_large`: over **25 MB**, by `content-length` or while streaming;
  - `upstream_status`: the site answered with an error (e.g. 403 when it blocks hotlinking);
  - `unreachable`: network error or timeout (about 15 s).
- [ ] **Pinterest upgrade:** for `i.pinimg.com/<size>/…` URLs, try `/originals/…` first; if
      that fails, fall back to the pasted URL. Return headers `x-resolved-url` and
      `x-upgraded: 1|0`.
- [ ] Send a normal browser-like `user-agent` and an `accept: image/*` header.
- [ ] Return the bytes with the upstream `content-type` and `cache-control: no-store`.
- [ ] `test/artnuvio/proxy.test.ts`: every error code, redirect re-checking, the 25 MB cap,
      the Pinterest upgrade and fallback, using a mocked `fetch`. Unit-test the
      private-address check and the Pinterest URL rewrite as pure functions.

## Done when

- All the tests pass, and `pnpm check` passes.
- Locally, `curl` (logged in) against a real public JPEG returns the image, and a page URL
  returns `not_image_page`.
