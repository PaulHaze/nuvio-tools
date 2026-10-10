# Artwork has a permanent, replaceable URL on its own subdomain

**Status:** accepted.

Each ArtNuvio Artwork is served at `https://img.nuvio-tools.com/a/<id>-<frame>.jpg`, for example `a/k7x2m9qp-hero.jpg`. That is an R2 bucket connected to its own custom domain, so Cloudflare serves the file without the site's Worker running. `<id>` is random and assigned when the Artwork is first saved. It is not derived from the Artwork's name or content, so renaming an Artwork or replacing its image never changes the URL. The Frame (`hero`, `landscape`, `poster` or `square`) is in the URL because an Artwork's Frame is fixed for life, and it lets the owner see at a glance, while pasting many URLs into Nuvio, which slot a URL belongs in.

Replacing an Artwork's image overwrites the object behind the same URL. Objects are served with a short `Cache-Control` max-age (minutes, not a year) and R2's automatic `ETag`. Nuvio TV's image loader (Coil with a stale-while-revalidate strategy, checked against NuvioTV `main` in October 2026) shows a stale cached image straight away, then revalidates it in the background using the `ETag` and swaps in the new image when it has changed. So a replaced Artwork reaches Nuvio within minutes, with no URL to paste again. This is the main reason the tool exists alongside "just host the image anywhere".

Users paste these URLs into Nuvio collections, so they must never change. Keeping them off the site's routes means restructuring the site, or moving ArtNuvio, can't break them. Serving straight from R2 also costs no Worker requests. Locally, the Node dev stand-in (ADR 0004) serves saved files from `localhost`.

The images sit outside the site's login on purpose. Nuvio can't log in, and an unguessable ID is enough protection for artwork.

## Considered Options

- Content-hashed, immutable URLs (the old ArtNuvio handoff): each edit gets a new URL and can be cached forever. Rejected: changing a folder's art would mean pasting a new URL into Nuvio every time, which is exactly the chore the owner wants to remove.
- An ID made from the Artwork's name (e.g. `serial-killer-movies-hero`). Rejected: renaming would either break the URL or leave it misleading, and names can collide.
- A route on the site, `nuvio-tools.com/artnuvio/img/<id>-<frame>.jpg`, left outside Basic Auth like Listio's addon. Rejected: every image view runs the Worker and counts against its request limits, and the permanent URLs would depend on the site's routes never changing.
- The bucket's `r2.dev` public URL. Rejected: Cloudflare rate-limits it and recommends it only for development, and the hostname isn't ours.

## Consequences

- Nuvio clients other than Nuvio TV (phone, web) are unverified. If one ignores cache headers, it may keep showing the old image until its cache clears.
- Cloudflare's edge may serve the old image for up to the max-age after a replace, unless the save route also purges the URL.
