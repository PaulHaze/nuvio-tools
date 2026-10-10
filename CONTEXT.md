# Nuvio Tools

A personal site of three tools for Nuvio: Listio (lists), ArtNuvio (artwork) and Collectio (collections).

## Language

### Nuvio Tools

**Nuvio Tools**:
The site that hosts all three tools under one domain.
_Avoid_: Listio (when meaning the whole site)

**Tool**:
One of Listio, ArtNuvio or Collectio. Each owns its own path prefix and its own code.
_Avoid_: app, module, product

**Listio**:
The tool for creating lists: it builds Combined Lists and publishes them as Catalogs for Nuvio.
_Avoid_: list combiner

**ArtNuvio**:
The tool for creating artwork: it fits an Original to a Frame and hosts the result as Artwork at a permanent, replaceable URL. Not built yet.
_Avoid_: thumbnail maker

**Collectio**:
The tool for managing Nuvio collections, their folders and folder artwork. Not built yet.
_Avoid_: collection builder

### Listio

**Source**:
A public list of movies/shows on another site (Trakt, MDBList or IMDb), identified by its URL. A Source is read once, when it is added to a Combined List; it is never re-fetched.
_Avoid_: input list, list, feed

**Combined List**:
A named, curated, static set of Titles, built by adding Sources, adding individual Titles found by search, and removing unwanted Titles. It may have no Sources at all (a hand-built list). It does not stay in sync with its Sources.
_Avoid_: project, merged list, collection, manual list, custom list

**Collection**:
A Nuvio collection with one folder per Combined List, downloaded as JSON. Listio stores the lists individually and does not store the collection.

**Title**:
A single movie or show, identified by its IMDb ID.
_Avoid_: item, entry, film

**Removed Title**:
A Title the user has excluded from a Combined List; it is skipped when further Sources are added, until the user restores it. Adding it again by search restores it.
_Avoid_: deleted item, blocked title

**Draft**:
Unsaved changes to a Combined List (added Sources, Titles added by search, removals, restores). Nothing in a Draft reaches Nuvio until it is saved.
_Avoid_: pending changes, working copy

**Catalog**:
How a Combined List appears inside Nuvio. A Catalog holds a single type (movie or series), so a Combined List containing both appears as two Catalogs.
_Avoid_: feed, list

### ArtNuvio

**Artwork**:
A named, permanent piece of art for one Frame, such as the Hero for "Serial Killer movies". It has one URL and one Frame for life. Its image can be Replaced at any time without the URL changing, so Nuvio picks up the new image by itself. A name can have at most one Artwork per Frame, so "Serial Killer movies" may have both a Hero and a Poster. Deleting an Artwork breaks its URL in Nuvio.
_Avoid_: thumbnail, cover, image (when meaning the Artwork)

**Replace**:
To give an existing Artwork a new image, made from a new Original. The Artwork keeps its name, Frame and URL. The Frame can never change: a different shape needs a new Artwork.
_Avoid_: update, re-upload, edit

**Library**:
The list of all saved Artworks, by name, where the user finds one to copy its URL or Replace it.
_Avoid_: history, gallery, recents

**Original**:
The image an Artwork is made from: linked by URL, pasted from the clipboard, or picked from disk. Only the finished Artwork is ever stored; the Original is not kept.
_Avoid_: source, source image, upload

**Frame**:
The Nuvio slot an Artwork is made for: Hero, Landscape, Poster or Square. Each Frame has a fixed shape and output size.
_Avoid_: format, size, template

**Hero**:
The large backdrop image shown behind a folder in Nuvio. Same 16:9 shape as a Landscape, but it is a separate Artwork, often made from a different image, and it is saved at a larger size.
_Avoid_: banner, backdrop

**Landscape**:
The 16:9 cover tile for a folder.
_Avoid_: thumbnail, wide

**Poster**:
The 2:3 cover tile for a folder.
_Avoid_: portrait, cover

**Square**:
The 1:1 cover tile for a folder. Nuvio's default tile shape.
_Avoid_: tile, icon
