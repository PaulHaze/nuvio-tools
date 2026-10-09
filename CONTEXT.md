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
The tool for creating artwork: it fits an image to Nuvio's hero, poster or landscape size and hosts the result. Not built yet.
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
