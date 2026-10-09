# One site, tools under path prefixes

**Status:** accepted. Applied in Sprint 01.

Listio is becoming one of three tools (Listio, ArtNuvio, Collectio) for Nuvio. They share a lot: Nuvio collection types and the JSON schema, image-size specs, UI, styling, auth and Cloudflare setup. They also link to each other: Listio exports into Collectio, and Collectio opens ArtNuvio for folder artwork.

So all three live in this repo as one Astro app, deployed as one Cloudflare Worker on one domain, `nuvio-tools.com`. Each tool owns a path prefix (`/listio`, `/artnuvio`, `/collectio`) and everything it serves sits under it, including its API (`/listio/api/*`) and, for Listio, the Nuvio addon (`/listio/addon/<secret>/*`). Only the home page, `robots.txt` and the 404 page live at the root.

Code follows the same split:

- Tool code lives in `src/tools/<tool>/`.
- Shared code lives in `src/lib/` only: `lib/nuvio/` (Nuvio types, collection schema, image specs) and `lib/ui/` (design system, layout).
- Tools import from `src/lib/` and from themselves, never from each other.
- Code moves from a tool into `lib/` only once a second tool needs it.

A path prefix per tool also lets the middleware protect, or later open up, one tool at a time (see ADR 0006 and ADR 0007). The layout and placement rules are in `docs/roadmap.md`.

## Considered Options

- Separate repos or Workers per tool — rejected: duplicates auth, config, types and UI, makes the cross-tool links harder, and means several deploys and domains for one person to run.
- pnpm workspaces now — rejected as premature: there is one app and one deploy. Plain folders with a boundary rule give the same separation. Extracting `lib/` into a package later is easy if a tool ever needs splitting out.
- Keep Listio's API and addon at the root (`/api`, `/addon`) and add the other tools beside them — rejected: root paths would be shared between tools and would clash as soon as a second tool needs an API. The cost of moving is small now (one user, and the addon is reinstalled anyway) and grows later.
